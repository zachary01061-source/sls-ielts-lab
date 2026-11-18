// Populate the deployed Cambridge R2 cache through its checksum-verified route.
// This sends no account cookies or credentials. Run only against the chosen Site.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const option=(flag,fallback=null)=>{const index=process.argv.indexOf(flag);return index<0?fallback:process.argv[index+1];};
const originText=option('--origin');
if(!originText)throw Error('Usage: node scripts/prewarm-cambridge-media.mjs --origin https://your-site.example [--workers 4] [--report /absolute/report.json]');
const origin=new URL(originText);
if(origin.origin!==originText||origin.username||origin.password||!(origin.protocol==='https:'||(origin.protocol==='http:'&&['localhost','127.0.0.1'].includes(origin.hostname))))throw Error('Use an HTTPS origin without a path, query or trailing slash.');
const workerCount=Number(option('--workers','4'));
if(!Number.isInteger(workerCount)||workerCount<1||workerCount>6)throw Error('workers must be between 1 and 6');
const manifest=JSON.parse(await fs.readFile(path.join(root,'server/materials/cambridge-media.json'),'utf8'));
const assets=manifest.assets||[];
if(!assets.length)throw Error('Cambridge media manifest is empty');
if(assets.some(asset=>! /^(?:audio|images)\/[A-Za-z0-9_-]+\.(?:mp3|png|jpg|jpeg|gif|webp)$/.test(asset.key)||!Number.isSafeInteger(asset.sizeBytes)||asset.sizeBytes<1||!/^[a-f0-9]{64}$/i.test(asset.sha256||'')))throw Error('Invalid Cambridge media manifest');
const results=[];let nextIndex=0;
async function worker(){
  while(nextIndex<assets.length){
    const asset=assets[nextIndex++],url=new URL('/api/guest/cambridge/media/'+asset.key,origin);
    let result;
    for(let attempt=1;attempt<=2;attempt++){
      try{
        const response=await fetch(url,{method:'HEAD',redirect:'error',signal:AbortSignal.timeout(180_000)});
        const size=Number(response.headers.get('content-length'));
        const tag=response.headers.get('etag');
        if(!response.ok)throw Object.assign(Error('HTTP '+response.status),{httpStatus:response.status});
        if(size!==asset.sizeBytes||tag!==`"sha256-${asset.sha256}"`)throw Error('Cached size or SHA-256 ETag does not match the verified manifest');
        result={key:asset.key,status:'ready',sizeBytes:size,sha256:asset.sha256,attempts:attempt};
        break;
      }catch(error){
        result={key:asset.key,status:'error',error:error.message,attempts:attempt};
        const retryable=!error.httpStatus||[502,503,504].includes(error.httpStatus);
        if(attempt===1&&retryable)await new Promise(resolve=>setTimeout(resolve,2000));
        else break;
      }
    }
    results.push(result);
    console.log(JSON.stringify({key:result.key,status:result.status,completed:results.length,total:assets.length,error:result.error}));
  }
}
await Promise.all(Array.from({length:Math.min(workerCount,assets.length)},()=>worker()));
results.sort((a,b)=>a.key.localeCompare(b.key));
const report={origin:origin.origin,total:assets.length,ready:results.filter(result=>result.status==='ready').length,failed:results.filter(result=>result.status!=='ready').length,results};
const reportPath=option('--report');
if(reportPath){if(!path.isAbsolute(reportPath))throw Error('report path must be absolute');await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({total:report.total,ready:report.ready,failed:report.failed}));
if(report.failed)process.exitCode=1;
