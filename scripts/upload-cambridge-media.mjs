#!/usr/bin/env node
import {createReadStream} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const route='/api/guest/cambridge/media/';
const defaultManifest=fileURLToPath(new URL('../server/materials/cambridge-media.json',import.meta.url));
const valueFlags=new Set(['--media-root','--origin','--manifest','--workers','--timeout-ms','--report','--key','--limit']);
const args={workers:4,timeout:180000,dryRun:false};
for(let i=2;i<process.argv.length;i++){
  const flag=process.argv[i];
  if(flag==='--dry-run'){args.dryRun=true;continue;}
  if(!valueFlags.has(flag)||!process.argv[i+1]||process.argv[i+1].startsWith('--'))throw Error('Unknown or incomplete option: '+flag);
  const value=process.argv[++i];
  const names={'--media-root':'mediaRoot','--origin':'origin','--manifest':'manifest','--workers':'workers','--timeout-ms':'timeout','--report':'report','--key':'key','--limit':'limit'};
  args[names[flag]]=value;
}
if(!args.mediaRoot||!args.origin)throw Error('Usage: node scripts/upload-cambridge-media.mjs --media-root /absolute/media --origin https://your-site.example [--workers 4] [--report /absolute/report.json] [--key audio/6954.mp3] [--dry-run]');
const originURL=new URL(args.origin);
if(originURL.protocol!=='https:'||originURL.username||originURL.password||originURL.search||originURL.hash||!['','/'].includes(originURL.pathname))throw Error('--origin must be an HTTPS origin without credentials, path, query or fragment.');
const origin=originURL.origin,workers=Number(args.workers),timeoutMs=Number(args.timeout),limit=args.limit===undefined?Infinity:Number(args.limit);
if(!Number.isInteger(workers)||workers<1||workers>12||!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>600000||!(limit===Infinity||Number.isInteger(limit)&&limit>0))throw Error('Invalid worker, timeout or limit option.');
const mediaRoot=await fs.realpath(path.resolve(args.mediaRoot));
const manifestPath=path.resolve(args.manifest||defaultManifest),manifestBytes=await fs.readFile(manifestPath),manifest=JSON.parse(manifestBytes.toString());
const manifestSha256=createHash('sha256').update(manifestBytes).digest('hex');
const reportPath=path.resolve(args.report||path.join(mediaRoot,args.dryRun?'upload-dry-run.json':'upload-report.json'));
const safeKey=key=>typeof key==='string'&&/^(?:audio\/[A-Za-z0-9_-]{1,120}\.mp3|images\/[A-Za-z0-9_-]{16,128}\.(?:png|jpe?g|gif|webp))$/.test(key);
const byKey=new Map();
for(const asset of manifest.assets||[]){
  if(!safeKey(asset.key)||!Number.isSafeInteger(asset.sizeBytes)||asset.sizeBytes<1||!/^[a-f0-9]{64}$/i.test(asset.sha256||'')||typeof asset.contentType!=='string'||byKey.has(asset.key))throw Error('Invalid or repeated approved asset in manifest.');
  byKey.set(asset.key,asset);
}
let assets=[...byKey.values()];
if(args.key){if(!byKey.has(args.key))throw Error('--key is not present in the approved manifest.');assets=[byKey.get(args.key)];}
assets=assets.slice(0,limit);
if(!assets.length)throw Error('No approved assets selected.');
const selectedKeys=new Set(assets.map(asset=>asset.key)),results={};
try{const prior=JSON.parse(await fs.readFile(reportPath,'utf8'));if(prior.origin===origin&&prior.results&&typeof prior.results==='object')Object.assign(results,prior.results);}catch(error){if(error.code!=='ENOENT'&&!(error instanceof SyntaxError))throw error;}
const startedAt=new Date().toISOString(),stopController=new AbortController();
let cursor=0,finished=0,haltReason='',saveQueue=Promise.resolve();
const summary=()=>{
  const rows=Object.entries(results).filter(([key])=>selectedKeys.has(key)).map(([,row])=>row);
  return {total:assets.length,verified:rows.filter(row=>row.status==='verified').length,localVerified:rows.filter(row=>row.status==='local_verified').length,failed:rows.filter(row=>row.status==='failed').length,notCompleted:assets.length-rows.filter(row=>['verified','local_verified','failed'].includes(row.status)).length,verifiedBytes:rows.filter(row=>row.status==='verified').reduce((sum,row)=>sum+row.sizeBytes,0)};
};
function save(){
  const data=JSON.stringify({version:1,origin,manifestPath,manifestSha256,mediaRoot,startedAt,updatedAt:new Date().toISOString(),dryRun:args.dryRun,haltReason:haltReason||null,summary:summary(),results},null,2)+'\n';
  saveQueue=saveQueue.then(async()=>{await fs.mkdir(path.dirname(reportPath),{recursive:true});const temp=reportPath+'.tmp';await fs.writeFile(temp,data);await fs.rename(temp,reportPath);});return saveQueue;
}
async function fileHash(filename){const hash=createHash('sha256');for await(const chunk of createReadStream(filename))hash.update(chunk);return hash.digest('hex');}
async function timedFetch(url,options){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(new Error('Request timeout')),timeoutMs);
  const abort=()=>controller.abort(stopController.signal.reason);stopController.signal.addEventListener('abort',abort,{once:true});
  try{return await fetch(url,{...options,redirect:'manual',signal:controller.signal});}
  finally{clearTimeout(timer);stopController.signal.removeEventListener('abort',abort);}
}
async function expectStatus(response,accepted,stage){
  if(accepted.includes(response.status))return;
  const detail=(await response.text()).slice(0,450),error=Object.assign(new Error(`${stage} HTTP ${response.status}: ${detail}`),{status:response.status});
  if([401,403,429].includes(response.status)||response.status>=300&&response.status<400){haltReason=error.message;stopController.abort(error);}
  throw error;
}
async function upload(asset){
  const filename=await fs.realpath(path.join(mediaRoot,asset.key));
  if(!filename.startsWith(mediaRoot+path.sep))throw Error('Local media path escapes --media-root.');
  const stat=await fs.stat(filename);if(!stat.isFile()||stat.size!==asset.sizeBytes)throw Error('Local media size does not match the approved manifest.');
  if(await fileHash(filename)!==asset.sha256.toLowerCase())throw Error('Local media SHA-256 does not match the approved manifest.');
  if(args.dryRun)return {status:'local_verified',sizeBytes:asset.sizeBytes,sha256:asset.sha256,verifiedAt:new Date().toISOString()};
  const url=origin+route+asset.key;
  const response=await timedFetch(url,{method:'PUT',headers:{'Content-Type':asset.contentType,'Content-Length':String(asset.sizeBytes)},body:createReadStream(filename),duplex:'half'});
  await expectStatus(response,[200,201],'PUT');
  const returned=await response.json();
  if(returned.key!==asset.key||returned.sizeBytes!==asset.sizeBytes||returned.sha256!==asset.sha256||returned.stored!==true)throw Error('PUT confirmation does not match the approved manifest.');
  const head=await timedFetch(url,{method:'HEAD'});await expectStatus(head,[200],'HEAD');
  if(Number(head.headers.get('content-length'))!==asset.sizeBytes||head.headers.get('etag')!==`"sha256-${asset.sha256}"`||(head.headers.get('content-type')||'').split(';')[0].trim()!==asset.contentType)throw Error('HEAD verification does not match the stored media.');
  return {status:'verified',sizeBytes:asset.sizeBytes,sha256:asset.sha256,created:returned.created,verifiedAt:new Date().toISOString()};
}
async function worker(){
  while(!haltReason&&cursor<assets.length){
    const asset=assets[cursor++],prior=results[asset.key],begin=Date.now();
    if(!args.dryRun&&prior?.status==='verified'&&prior.sha256===asset.sha256&&prior.sizeBytes===asset.sizeBytes){finished++;console.log(JSON.stringify({finished,total:assets.length,key:asset.key,status:'verified_resume'}));continue;}
    try{results[asset.key]=await upload(asset);}
    catch(error){results[asset.key]={status:'failed',sizeBytes:asset.sizeBytes,sha256:asset.sha256,httpStatus:error.status||null,error:error.message,failedAt:new Date().toISOString()};}
    finished++;await save();console.log(JSON.stringify({finished,total:assets.length,key:asset.key,status:results[asset.key].status,httpStatus:results[asset.key].httpStatus||null,elapsedMs:Date.now()-begin}));
  }
}
await Promise.all(Array.from({length:Math.min(workers,assets.length)},worker));await save();
const final=summary();console.log(JSON.stringify({complete:!haltReason&&(args.dryRun?final.localVerified===assets.length:final.verified===assets.length),haltReason:haltReason||null,reportPath,...final}));
if(haltReason||final.failed||final.notCompleted)process.exitCode=1;
