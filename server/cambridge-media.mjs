import {createHash} from 'node:crypto';
import importedCatalog from './materials/cambridge-media.json' with {type:'json'};

const ROUTE='/api/guest/cambridge/media/';
const MiB=1024*1024;
const contentTypes={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp'};
const safeKey=key=>typeof key==='string'&&/^(?:audio\/[A-Za-z0-9_-]{1,120}\.mp3|images\/[A-Za-z0-9_-]{16,128}\.(?:png|jpe?g|gif|webp))$/.test(key);

function approvedAsset(row){
  if(!row||!safeKey(row.key)||!Number.isSafeInteger(row.sizeBytes)||row.sizeBytes<1||!/^[a-f0-9]{64}$/i.test(row.sha256||''))return null;
  const audio=row.key.startsWith('audio/'),maxBytes=(audio?80:20)*MiB;
  if(row.sizeBytes>maxBytes)return null;
  let source;
  try{source=new URL(row.sourceUrl);}catch{return null;}
  if(source.protocol!=='https:'||source.username||source.password||source.port||source.hash||source.search)return null;
  const type=audio?'audio/mpeg':contentTypes[row.key.split('.').at(-1).toLowerCase()];
  if(!type)return null;
  return {...row,sourceUrl:source.href,contentType:type,sha256:row.sha256.toLowerCase(),maxBytes};
}

export function parseCambridgeRange(value,size){
  if(value===null||value===undefined||value==='')return null;
  const match=String(value).match(/^bytes=(\d*)-(\d*)$/);
  if(!match||(!match[1]&&!match[2]))return false;
  const a=match[1]===''?null:Number(match[1]),b=match[2]===''?null:Number(match[2]);
  if([a,b].some(n=>n!==null&&(!Number.isSafeInteger(n)||n<0))||a!==null&&b!==null&&a>b||a===null&&b===0)return false;
  const start=a===null?Math.max(0,size-b):a,end=a===null||b===null?size-1:Math.min(size-1,b);
  return start>=size||end<start?false:{offset:start,length:end-start+1,start,end};
}

function errorResponse(request,status,message,extra={}){
  return new Response(request.method==='HEAD'?null:JSON.stringify({error:message}),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
}

function cachedMatch(object,asset){return !!object&&Number(object.size)===asset.sizeBytes&&object.customMetadata?.sha256===asset.sha256;}

function servedHeaders(asset,object,range){
  const headers=new Headers({'Content-Type':asset.contentType,'Content-Length':String(range?.length??asset.sizeBytes),'Accept-Ranges':'bytes','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff','Content-Disposition':'inline','ETag':`"sha256-${asset.sha256}"`});
  if(object.uploaded instanceof Date)headers.set('Last-Modified',object.uploaded.toUTCString());
  if(range)headers.set('Content-Range',`bytes ${range.start}-${range.end}/${asset.sizeBytes}`);
  return headers;
}

/** Only manifest-pinned, checksum-verified media can enter the existing R2 bucket. */
export function createCambridgeMediaHandler({catalog=importedCatalog,fetchImpl=globalThis.fetch,sourceTimeoutMs=120000}={}){
  const assets=new Map();
  for(const candidate of Array.isArray(catalog?.assets)?catalog.assets:[]){
    const asset=approvedAsset(candidate);if(!asset)continue;
    if(assets.has(asset.key))throw Error('剑桥媒体目录存在重复编号。');
    assets.set(asset.key,asset);
  }

  async function importAsset(bucket,asset){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),sourceTimeoutMs);
    let response;
    try{
      response=await fetchImpl(asset.sourceUrl,{method:'GET',redirect:'manual',headers:{'Accept-Encoding':'identity'},signal:controller.signal});
      if(response.status!==200||!response.body)throw Error('来源媒体暂时无法读取。');
      const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
      const accepted=asset.key.startsWith('audio/')?['audio/mpeg','audio/mp3','application/mp3','application/octet-stream'].includes(type):[asset.contentType,'application/octet-stream'].includes(type);
      if(!accepted)throw Error('来源媒体格式与目录不符。');
      const encoding=(response.headers.get('content-encoding')||'identity').toLowerCase();
      if(encoding!=='identity')throw Error('来源媒体编码暂不支持。');
      const rawLength=response.headers.get('content-length');
      if(rawLength!==null&&(!/^\d+$/.test(rawLength)||Number(rawLength)!==asset.sizeBytes))throw Error('来源媒体大小已变化，请重新核对。');
      const hash=createHash('sha256');let received=0;
      const verifying=new TransformStream({
        transform(chunk,stream){
          const bytes=chunk instanceof Uint8Array?chunk:new Uint8Array(chunk);
          received+=bytes.byteLength;
          if(received>asset.sizeBytes||received>asset.maxBytes)throw Error('来源媒体超过目录大小。');
          hash.update(bytes);stream.enqueue(bytes);
        },
        flush(){if(received!==asset.sizeBytes||hash.digest('hex')!==asset.sha256)throw Error('来源媒体校验未通过，请重新核对。');},
      });
      // Workers' FixedLengthStream preserves the known length required by R2.put.
      // The ordinary TransformStream fallback is used by the Node test fixture.
      const fixed=typeof globalThis.FixedLengthStream==='function'?new globalThis.FixedLengthStream(asset.sizeBytes):new TransformStream();
      const transfer=response.body.pipeThrough(verifying).pipeTo(fixed.writable,{signal:controller.signal});
      const upload=bucket.put('cambridge/'+asset.key,fixed.readable,{httpMetadata:{contentType:asset.contentType,cacheControl:'public, max-age=86400'},customMetadata:{sha256:asset.sha256}});
      try{await Promise.all([transfer,upload]);}
      catch(error){controller.abort();await Promise.allSettled([transfer,upload]);throw error;}
      const object=await bucket.head('cambridge/'+asset.key);
      if(!cachedMatch(object,asset))throw Error('媒体保存校验失败，请稍后重试。');
      return object;
    }finally{clearTimeout(timer);controller.abort();}
  }

  async function ensureCached(bucket,asset){
    const object=await bucket.head('cambridge/'+asset.key);
    if(cachedMatch(object,asset))return object;
    // R2 is the shared cache. Request-owned promises must never be reused by
    // another Workers request; concurrent verified writes are safely identical.
    return importAsset(bucket,asset);
  }

  async function uploadApprovedAsset(bucket,asset,request){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),sourceTimeoutMs);
    const abort=()=>controller.abort();request.signal?.addEventListener('abort',abort,{once:true});
    const invalid=(status,message)=>Object.assign(new Error(message),{status});
    try{
      const current=await bucket.head('cambridge/'+asset.key),alreadyStored=cachedMatch(current,asset);
      const hash=createHash('sha256');let received=0;
      const verifying=new TransformStream({
        transform(chunk,stream){
          const bytes=chunk instanceof Uint8Array?chunk:new Uint8Array(chunk);received+=bytes.byteLength;
          if(received>asset.sizeBytes||received>asset.maxBytes)throw invalid(413,'上传媒体超过目录大小。');
          hash.update(bytes);stream.enqueue(bytes);
        },
        flush(){if(received!==asset.sizeBytes||hash.digest('hex')!==asset.sha256)throw invalid(422,'上传媒体校验未通过。');},
      });
      if(alreadyStored){
        await request.body.pipeThrough(verifying).pipeTo(new WritableStream({write(){}}),{signal:controller.signal});
        return {created:false,object:current};
      }
      const fixed=typeof globalThis.FixedLengthStream==='function'?new globalThis.FixedLengthStream(asset.sizeBytes):new TransformStream();
      const transfer=request.body.pipeThrough(verifying).pipeTo(fixed.writable,{signal:controller.signal});
      const upload=bucket.put('cambridge/'+asset.key,fixed.readable,{httpMetadata:{contentType:asset.contentType,cacheControl:'public, max-age=86400'},customMetadata:{sha256:asset.sha256}});
      try{await Promise.all([transfer,upload]);}
      catch(error){controller.abort();await Promise.allSettled([transfer,upload]);throw error;}
      const object=await bucket.head('cambridge/'+asset.key);
      if(!cachedMatch(object,asset))throw Error('上传媒体保存校验失败。');
      return {created:true,object};
    }finally{clearTimeout(timer);controller.abort();request.signal?.removeEventListener('abort',abort);}
  }

  return async function handle(request,env){
    if(!['GET','HEAD','PUT'].includes(request.method))return errorResponse(request,405,'不支持此操作。',{Allow:'GET, HEAD, PUT'});
    const url=new URL(request.url),key=url.pathname.startsWith(ROUTE)?url.pathname.slice(ROUTE.length):'';
    const asset=!url.search&&safeKey(key)?assets.get(key):null;
    if(!asset)return errorResponse(request,404,'未找到这份剑桥媒体资料。');
    if(request.method==='PUT'){
      const type=(request.headers.get('Content-Type')||'').split(';')[0].trim().toLowerCase(),length=request.headers.get('Content-Length');
      if(type!==asset.contentType)return errorResponse(request,415,'上传媒体格式与目录不符。');
      if(length===null)return errorResponse(request,411,'上传媒体必须提供准确大小。');
      if(!/^\d+$/.test(length)||Number(length)!==asset.sizeBytes)return errorResponse(request,422,'上传媒体大小与目录不符。');
      if(!request.body||request.headers.has('Range')||request.headers.has('Content-Range')||!['identity',''].includes((request.headers.get('Content-Encoding')||'').toLowerCase()))return errorResponse(request,400,'请上传目录中的完整媒体文件。');
      const bucket=env?.BUCKET;
      if(!bucket?.head||!bucket?.get||!bucket?.put)return errorResponse(request,503,'媒体存储暂时不可用，请稍后重试。');
      try{
        const result=await uploadApprovedAsset(bucket,asset,request);
        return new Response(JSON.stringify({key:asset.key,sizeBytes:asset.sizeBytes,sha256:asset.sha256,stored:true,created:result.created}),{status:result.created?201:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','ETag':`"sha256-${asset.sha256}"`}});
      }catch(error){return errorResponse(request,error?.status||503,error?.message||'媒体上传暂时未完成，请稍后重试。');}
    }
    const range=parseCambridgeRange(request.headers.get('Range'),asset.sizeBytes);
    if(range===false)return errorResponse(request,416,'媒体读取范围不正确。',{'Content-Range':`bytes */${asset.sizeBytes}`,'Accept-Ranges':'bytes'});
    const bucket=env?.BUCKET;
    if(!bucket?.head||!bucket?.get||!bucket?.put)return errorResponse(request,503,'媒体存储暂时不可用，请稍后重试。');
    try{
      const cached=await ensureCached(bucket,asset);
      if(request.method==='HEAD')return new Response(null,{status:range?206:200,headers:servedHeaders(asset,cached,range)});
      const object=await bucket.get('cambridge/'+asset.key,range?{range:{offset:range.offset,length:range.length}}:undefined);
      if(!cachedMatch(object,asset)||!object.body)throw Error('媒体文件暂时无法读取，请稍后重试。');
      return new Response(object.body,{status:range?206:200,headers:servedHeaders(asset,object,range)});
    }catch(error){return errorResponse(request,503,error?.message||'媒体迁移暂未完成，请稍后重试。');}
  };
}

export const handleCambridgeMedia=createCambridgeMediaHandler();
