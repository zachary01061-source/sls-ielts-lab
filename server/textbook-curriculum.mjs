// Textbook API for Workers. Only structured practice content is available to guests.
import manifest from './materials/textbooks/manifest.json' with {type:'json'};
import {getGradingTask,getSectionGradingTasks} from './grading-task-catalog.mjs';

export const TEXTBOOK_IDS=Object.freeze(manifest.books.map(book=>book.id));
export const TEXTBOOK_IMPORT_MANIFEST=manifest;
const byId=new Map(manifest.books.map(book=>[book.id,book]));
const guestBookFields=['id','title','pageCount','sectionCount','taskCount','entryCount','imported'];
const guestSectionFields=[
  'id','title','displayTitle','category','pageStart','pageEnd','printedPageStart',
  'studentContext','studentGuidance','adaptationNote','learningObjectives','entryCount',
  'taskId','taskIds','practice','prompt','analysis','stanceCn','stanceEn','points',
  'logicChains','keyPoints','readingNote','sourceExpressions','paragraphGuide',
  'languageSupport','collocations','entries','modelParagraph','modelAnswer','modelTranslation'
];
const pickFields=(row,fields)=>Object.fromEntries(fields.filter(key=>Object.hasOwn(row,key)).map(key=>[key,row[key]]));
const guestBook=row=>pickFields(row,guestBookFields);
const guestSection=row=>pickFields(row,guestSectionFields);
async function guestPracticeSection(library,entry,id){
  const indexed=entry.sections.find(section=>section.id===id);
  if(!indexed)return null;
  // The checked-in exercise index and task prompts also work without an R2 import.
  const detailed=await library.section(entry.id,id).catch(()=>null);
  return guestSection(detailed||indexed);
}
const safeId=value=>typeof value==='string'&&/^[a-z0-9][a-z0-9-]{0,159}$/.test(value);
const privateHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(status,data,extra={})=>new Response(JSON.stringify(data),{status,headers:{...privateHeaders,'Content-Type':'application/json; charset=utf-8',...extra}});
const fail=(status,message,code)=>Object.assign(new Error(message),{status,code});
const bucketFor=env=>env?.BUCKET||env?.TEXTBOOKS;
const hash=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
function requiredBucket(env){const bucket=bucketFor(env);if(!bucket)throw fail(503,'教材存储尚未连接。','TEXTBOOK_STORAGE_NOT_CONFIGURED');return bucket;}
function metadata(book){
  const entry=byId.get(book?.id);if(!entry)return null;
  const {sections,assets,...meta}=entry;return {...meta,imported:true};
}
function objectMatches(object,asset){return !!object&&object.size===asset.bytes&&object.customMetadata?.sha256===asset.sha256;}

export function textbookPractices(section){return [
  ...(section.practice?[{...section.practice,id:section.id}]:[]),
  ...(Array.isArray(section.practiceVariants)?section.practiceVariants:[]),
  ...(section.extensionPractice?[{...section.extensionPractice,id:section.id+'-discussion',title:section.extensionPractice.title||section.title+' · 延伸讨论'}]:[])
].filter(practice=>['writing','speaking'].includes(practice?.skill)&&typeof practice.prompt==='string'&&practice.prompt.trim()&&safeId(practice.id));}

/** Each library lives for one request: no unbounded cache of full books. */
export function createTextbookLibrary(env={}){
  const loaded=new Map(),checked=new Map();
  async function state(id){
    if(!byId.has(id))return null;
    if(checked.has(id))return checked.get(id);
    const promise=(async()=>{
      const book=byId.get(id),bucket=requiredBucket(env),assets={};
      for(const kind of ['json','pdf']){const expected=book.assets[kind],object=await bucket.head(expected.key);assets[kind]={present:objectMatches(object,expected),bytes:expected.bytes,sha256:expected.sha256};}
      return {id,ready:assets.json.present&&assets.pdf.present,assets};
    })();checked.set(id,promise);return promise;
  }
  async function load(id){
    if(!byId.has(id))return null;
    if(loaded.has(id))return loaded.get(id);
    const promise=(async()=>{
      const current=await state(id);if(!current.ready)return null;
      const expected=byId.get(id),asset=expected.assets.json;
      const object=await requiredBucket(env).get(asset.key);if(!object||!objectMatches(object,asset))return null;
      const bytes=await object.arrayBuffer();
      if(bytes.byteLength!==asset.bytes||await hash(bytes)!==asset.sha256)throw fail(503,'教材文件校验未通过，请联系管理员重新导入。','TEXTBOOK_CHECKSUM_FAILED');
      const book=JSON.parse(new TextDecoder().decode(bytes));
      if(book.id!==id||book.pageCount!==expected.pageCount||book.pages?.length!==expected.pageCount||book.sections?.length!==expected.sectionCount)throw fail(503,'教材目录与页码不一致。','TEXTBOOK_INDEX_INVALID');
      return {...book,imported:true};
    })();loaded.set(id,promise);return promise;
  }
  return {
    load,metadata,state,
    sections(book){return byId.get(book?.id)?.sections||[];},
    async snapshot(){return (await Promise.all(TEXTBOOK_IDS.map(load))).filter(Boolean);},
    async catalog(){
      const books=[],missing=[],unavailable=[];
      for(const id of TEXTBOOK_IDS){try{const current=await state(id);if(current.ready)books.push(metadata(byId.get(id)));else missing.push(id);}catch{unavailable.push({id,reason:'教材存储暂时未连接，请稍后再试。'});}}
      return {schemaVersion:1,books,missing,unavailable};
    },
    async section(bookId,sectionId){if(!safeId(sectionId))return null;return (await load(bookId))?.sections.find(section=>section.id===sectionId)||null;},
    async pdf(bookId,range){
      const book=byId.get(bookId);if(!book||!(await state(bookId)).ready)return null;
      const asset=book.assets.pdf;
      const object=await requiredBucket(env).get(asset.key,range?{range}:undefined);
      if(!object||!objectMatches(object,asset))return null;
      return {body:object.body,size:asset.bytes,sha256:asset.sha256};
    }
  };
}

async function boundedBody(request,maximum){
  const claimed=request.headers.get('Content-Length');if(claimed!==null&&Number(claimed)!==maximum)throw fail(400,'文件大小与导入清单不一致。','TEXTBOOK_SIZE_MISMATCH');
  if(!request.body)throw fail(400,'请选择教材文件。','TEXTBOOK_BODY_REQUIRED');
  const reader=request.body.getReader(),chunks=[];let length=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>maximum){await reader.cancel();throw fail(413,'文件大小超出导入清单。','TEXTBOOK_TOO_LARGE');}chunks.push(value);}}finally{reader.releaseLock();}
  if(length!==maximum)throw fail(400,'文件大小与导入清单不一致。','TEXTBOOK_SIZE_MISMATCH');
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return bytes;
}
function parseRange(header,size){
  if(!header)return null;
  const match=header.match(/^bytes=(\d*)-(\d*)$/);if(!match||!match[1]&&!match[2])throw fail(416,'不支持这个文件范围。');
  let start,end;
  if(match[1]){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;}
  else{const suffix=Number(match[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)throw fail(416,'不支持这个文件范围。');start=Math.max(0,size-suffix);end=size-1;}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size)throw fail(416,'文件范围超出长度。');
  return {offset:start,length:end-start+1};
}

/** Authenticated routes require authorization in the main API. Guest routes are read-only. */
export async function handleTextbookRequest(request,env,user){
  const url=new URL(request.url),method=request.method;
  const guest=url.pathname==='/api/guest/textbooks'||url.pathname.startsWith('/api/guest/textbooks/');
  const path=guest?url.pathname.replace('/api/guest/','/api/'):url.pathname;
  const isImport=path==='/api/admin/textbooks/import'||path.startsWith('/api/admin/textbooks/import/');
  if(path!=='/api/textbooks'&&!path.startsWith('/api/textbooks/')&&!isImport)return null;
  if(guest&&method!=='GET')return json(405,{error:'此入口仅供查看练习。'},{Allow:'GET'});
  if(!guest&&!user)return json(401,{error:'请先登录。'});
  if(!guest&&user.status!=='active')return json(403,{error:'账号经学校管理员批准后即可使用教材。'});
  try{
    const library=createTextbookLibrary(env);
    if(isImport){
      if(user.role!=='admin')return json(403,{error:'只有学校管理员可以导入教材。'});
      if(method==='GET'&&path==='/api/admin/textbooks/import'){
        const books=[];for(const id of TEXTBOOK_IDS)books.push({...metadata(byId.get(id)),...await library.state(id)});
        return json(200,{schemaVersion:1,pageCount:manifest.pageCount,taskCount:manifest.taskCount,totalTaskCount:manifest.totalTaskCount,books});
      }
      const match=path.match(/^\/api\/admin\/textbooks\/import\/([a-z0-9-]+)\/(json|pdf)$/);
      if(method!=='PUT'||!match||!byId.has(match[1]))return json(404,{error:'找不到这个教材导入项目。'});
      if(request.headers.get('Origin')!==url.origin)return json(403,{error:'请从本站管理页面导入教材。',code:'ORIGIN_MISMATCH'});
      const [,id,kind]=match,asset=byId.get(id).assets[kind],bytes=await boundedBody(request,asset.bytes);
      if(await hash(bytes)!==asset.sha256)throw fail(400,'文件与已核对的教材不一致，请使用原始导入文件。','TEXTBOOK_CHECKSUM_MISMATCH');
      if(kind==='pdf'&&new TextDecoder().decode(bytes.subarray(0,5))!=='%PDF-')throw fail(400,'这不是 PDF 文件。');
      const bucket=requiredBucket(env),existing=await bucket.head(asset.key);
      if(!objectMatches(existing,asset))await bucket.put(asset.key,bytes,{httpMetadata:{contentType:asset.contentType,cacheControl:'private, no-store'},customMetadata:{sha256:asset.sha256,bookId:id,kind,verified:'true'}});
      return json(200,{ok:true,id,kind,bytes:asset.bytes,sha256:asset.sha256,alreadyImported:objectMatches(existing,asset)});
    }
    if(!['GET','HEAD'].includes(method))return json(405,{error:'此操作不适用于教材页面。'},{Allow:'GET, HEAD'});
    if(path==='/api/textbooks'&&method==='GET'){
      return json(200,guest?{schemaVersion:1,books:manifest.books.map(entry=>guestBook(metadata(entry))),missing:[],unavailable:[]}:await library.catalog());
    }
    const taskMatch=path.match(/^\/api\/textbooks\/tasks\/([^/]+)$/);
    if(taskMatch&&method==='GET'){
      let id;try{id=decodeURIComponent(taskMatch[1]);}catch{throw fail(400,'任务编号不正确。');}
      const task=getGradingTask(id);if(!task||task.source.type!=='book')throw fail(404,'找不到这项教材任务。');
      const book=guest?byId.get(task.source.bookId):await library.load(task.source.bookId);
      const section=book&&(guest?await guestPracticeSection(library,book,task.source.sectionId):book.sections.find(item=>item.id===task.source.sectionId));
      if(!book||!section)throw fail(404,'这份教材还未完成导入。','TEXTBOOK_NOT_IMPORTED');
      const meta=metadata(book);
      return json(200,{task,book:guest?guestBook(meta):meta,section});
    }
    const route=path.match(/^\/api\/textbooks\/([a-z0-9-]+)(?:\/(pdf|sections|pages)(?:\/([a-zA-Z0-9-]+))?)?$/);
    if(!route||!byId.has(route[1]))throw fail(404,'找不到这份教材。');
    const [,id,kind,key]=route,entry=byId.get(id);
    if(guest&&kind&&kind!=='sections')throw fail(404,'找不到这项练习资料。');
    if(!guest&&!(await library.state(id)).ready)throw fail(404,'这份教材还未完成导入。','TEXTBOOK_NOT_IMPORTED');
    const meta=guest?guestBook(metadata(entry)):metadata(entry);
    if(!kind&&method==='GET'){
      const sections=guest?entry.sections.map(guestSection):entry.sections;
      return json(200,{book:{...meta,sections},sections});
    }
    if(kind==='pdf'&&!key){
      const size=entry.assets.pdf.bytes;let range;
      try{range=parseRange(request.headers.get('Range'),size);}catch(error){return json(416,{error:error.message},{'Content-Range':`bytes */${size}`});}
      const headers={...privateHeaders,'Content-Type':'application/pdf','Accept-Ranges':'bytes','Content-Disposition':`inline; filename="${id}.pdf"`,'Content-Length':String(range?.length||size)};
      if(range)headers['Content-Range']=`bytes ${range.offset}-${range.offset+range.length-1}/${size}`;
      if(method==='HEAD')return new Response(null,{status:range?206:200,headers});
      const file=await library.pdf(id,range);if(!file)throw fail(404,'找不到教材原文件。');
      return new Response(file.body,{status:range?206:200,headers});
    }
    if(kind==='sections'&&key&&method==='GET'){
      const section=guest?await guestPracticeSection(library,entry,key):await library.section(id,key);
      if(!section)throw fail(404,'找不到这个章节。');
      return json(200,{book:meta,section,task:getGradingTask('textbook:'+section.id),tasks:getSectionGradingTasks(section.id)});
    }
    if(kind==='pages'&&key&&method==='GET'){
      const book=await library.load(id),page=book?.pages.find(page=>String(page.page)===key);if(!page)throw fail(404,'找不到这一页。');return json(200,{book:meta,page});
    }
    throw fail(404,'找不到教材内容。');
  }catch(error){return json(error.status||503,{error:error.status?error.message:'教材暂时无法读取，请稍后再试。',...(error.code?{code:error.code}:{})});}
}
