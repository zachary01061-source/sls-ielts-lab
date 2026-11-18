import importedCatalog from './corpus-resources.json' with {type:'json'};

const MAX_BYTES=512*1024*1024;
const REDIRECTS=new Set([301,302,303,307,308]);
const safeId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,120}$/.test(value);
const failure=(status,message)=>Object.assign(new Error(message),{status});

function allowedURL(value){
  try{
    const url=new URL(value);
    if(!['http:','https:'].includes(url.protocol)||url.hostname!=='www.1kao.com.cn'||url.username||url.password||url.search||url.hash)return false;
    if(url.port&&url.port!==(url.protocol==='http:'?'80':'443'))return false;
    if(!url.pathname.startsWith('/qr/3064/srcs/')||/%(?:2f|5c|00)/i.test(url.pathname))return false;
    const decoded=decodeURIComponent(url.pathname);
    return !decoded.includes('\\')&&!decoded.split('/').some(part=>part==='.'||part==='..')&&/\.(?:mp3|pdf)$/i.test(decoded);
  }catch{return false;}
}

function checkedRange(value){
  if(value===null||value===undefined||value==='')return null;
  const match=String(value).match(/^bytes=(\d*)-(\d*)$/);
  if(!match||(!match[1]&&!match[2]))throw failure(416,'音频读取范围不正确。');
  const [start,end]=[match[1],match[2]].map(part=>part===''?null:Number(part));
  if([start,end].some(part=>part!==null&&(!Number.isSafeInteger(part)||part<0))||start===null&&end===0||start!==null&&end!==null&&start>end)throw failure(416,'音频读取范围不正确。');
  return value;
}

function responseHeaders(response,resource,maxBytes){
  const contentType=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  const correctType=resource.type==='pdf'?['application/pdf','application/octet-stream'].includes(contentType):contentType.startsWith('audio/')||['application/octet-stream','application/mp3'].includes(contentType);
  if(!correctType)throw failure(502,'返回的资料格式不正确。');
  const rawLength=response.headers.get('content-length');
  const length=rawLength===null?null:/^\d+$/.test(rawLength)?Number(rawLength):NaN;
  if(length!==null&&(!Number.isSafeInteger(length)||length<0||length>maxBytes))throw failure(502,'资料文件超过允许大小。');
  const headers=new Headers({
    'Content-Type':resource.type==='pdf'?'application/pdf':'audio/mpeg',
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',
    'Content-Disposition':'inline','Accept-Ranges':response.headers.get('accept-ranges')==='bytes'?'bytes':'none',
  });
  if(length!==null)headers.set('Content-Length',String(length));
  if(response.status===206){
    const range=response.headers.get('content-range'),match=range?.match(/^bytes (\d+)-(\d+)\/(\d+|\*)$/);
    const start=Number(match?.[1]),end=Number(match?.[2]),total=match?.[3]==='*'?null:Number(match?.[3]);
    if(!match||![start,end].every(Number.isSafeInteger)||start<0||end<start||total!==null&&(!Number.isSafeInteger(total)||total<=end)||length!==null&&length!==end-start+1)throw failure(502,'资料分段响应不正确。');
    headers.set('Content-Range',range);headers.set('Accept-Ranges','bytes');
  }
  return headers;
}

/**
 * Main API applies the corresponding account or guest limit before streaming.
 * This module never forwards credentials upstream.
 * Uses Web streams only: no Node filesystem, Buffer, R2 writes or whole-file copy.
 */
export function createCorpusProxy({fetchImpl=globalThis.fetch,catalog=importedCatalog,maxBytes=MAX_BYTES,headerTimeoutMs=15000,bodyTimeoutMs=600000,maxInflight=64}={}){
  const resources=[],byId=new Map(),knownURLs=new Set();let inflight=0;
  for(const row of Array.isArray(catalog?.resources)?catalog.resources:[]){
    if(!row||!safeId(row.id)||!['audio','pdf'].includes(row.type)||!allowedURL(row.url))continue;
    if(byId.has(row.id))throw failure(500,'听力资料编号重复。');
    const resource={...row,url:new URL(row.url).href};
    resources.push(resource);byId.set(resource.id,resource);knownURLs.add(resource.url);
    const secure=new URL(resource.url);secure.protocol='https:';knownURLs.add(secure.href);
  }
  function list({guest=false}={}){
    const base=guest?'/api/guest/corpus/resources/':'/api/corpus/resources/';
    return {title:catalog?.title||'听力语料库',resources:resources.map(({id,chapter,chapterId,title,type,edition,available,verificationStatus})=>({id,chapter,chapterId,title,type,edition,available,verificationStatus,url:base+id,proxyUrl:base+id}))};
  }
  async function stream(request,id){
    if(!['GET','HEAD'].includes(request.method))throw failure(405,'不支持此操作。');
    const resource=safeId(id)?byId.get(id):null;
    if(!resource)throw failure(404,'找不到这份听力资料。');
    if(resource.available===false)throw failure(503,'这份资料目前暂时无法读取，请稍后再试。');
    const range=checkedRange(request.headers.get('range'));
    if(inflight>=maxInflight)throw failure(503,'资料正在加载，请稍后重试。');
    inflight++;
    const controller=new AbortController();let timer,finished=false,handedOff=false,response;
    const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);request.signal?.removeEventListener('abort',abort);inflight--;controller.abort();};
    const abort=()=>finish();
    const deadline=ms=>{clearTimeout(timer);timer=setTimeout(finish,ms);};
    request.signal?.addEventListener('abort',abort,{once:true});
    deadline(headerTimeoutMs);
    try{
      if(request.signal?.aborted)throw failure(502,'资料连接已取消。');
      let url=resource.url;
      for(let redirects=0;redirects<=3;redirects++){
        response=await fetchImpl(url,{method:request.method,redirect:'manual',signal:controller.signal,headers:{'Accept-Encoding':'identity',...(range?{Range:range}:{})}});
        if(!REDIRECTS.has(response.status))break;
        const location=response.headers.get('location');await response.body?.cancel();
        let next='';try{next=location?new URL(location,url).href:'';}catch{/* rejected below */}
        if(!allowedURL(next)||!knownURLs.has(next)||redirects===3)throw failure(502,'资料地址发生变化，请联系管理员核对。');
        url=next;
      }
      if(![200,206].includes(response.status))throw failure(response.status===416?416:502,'资料暂时无法加载，请稍后重试。');
      const headers=responseHeaders(response,resource,maxBytes);
      if(request.method==='HEAD'){
        await response.body?.cancel();
        return new Response(null,{status:response.status,headers});
      }
      if(!response.body)throw failure(502,'资料暂时无法加载，请稍后重试。');
      deadline(bodyTimeoutMs);
      const reader=response.body.getReader();let received=0;
      const body=new ReadableStream({
        async pull(output){
          try{
            const {value,done}=await reader.read();
            if(done){finish();output.close();return;}
            received+=value.byteLength;
            if(received>maxBytes)throw failure(502,'资料文件超过允许大小。');
            output.enqueue(value);
          }catch(error){finish();await reader.cancel(error).catch(()=>{});output.error(error?.status?error:failure(502,'资料连接超时或暂时不可用。'));}
        },
        async cancel(reason){finish();await reader.cancel(reason).catch(()=>{});},
      });
      handedOff=true;
      return new Response(body,{status:response.status,headers});
    }catch(error){
      await response?.body?.cancel().catch(()=>{});
      throw error?.status?error:failure(502,'资料连接超时或暂时不可用。');
    }finally{if(!handedOff)finish();}
  }
  return {list,stream};
}
