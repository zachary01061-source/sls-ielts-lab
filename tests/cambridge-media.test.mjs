import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createCambridgeMediaHandler,parseCambridgeRange} from '../server/cambridge-media.mjs';

const source='https://media.example.test/approved/test.mp3';
const bytes=new TextEncoder().encode('0123456789');
const asset={key:'audio/1234.mp3',sourceUrl:source,contentType:'audio/mpeg',sizeBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
const request=(headers={},method='GET',key=asset.key,query='')=>new Request('https://school.test/api/guest/cambridge/media/'+key+query,{method,headers});
const upstream=(body=bytes,headers={},status=200)=>new Response(body,{status,headers:{'Content-Type':'audio/mpeg','Content-Length':String(bytes.length),...headers}});
function fixture(){
  const objects=new Map(),calls={head:0,get:0,put:0};
  const metadata=row=>({size:row.bytes.length,customMetadata:row.customMetadata,uploaded:new Date('2026-11-18T00:00:00Z')});
  return {objects,calls,BUCKET:{
    async head(key){calls.head++;const row=objects.get(key);return row?metadata(row):null;},
    async get(key,options){calls.get++;const row=objects.get(key);if(!row)return null;const range=options?.range,body=range?row.bytes.slice(range.offset,range.offset+range.length):row.bytes;return {...metadata(row),body:new Response(body).body};},
    async put(key,stream,options){calls.put++;const body=new Uint8Array(await new Response(stream).arrayBuffer());objects.set(key,{bytes:body,...options});return metadata(objects.get(key));},
  }};
}

test('a verified source is streamed into R2 once, then served from R2 without user credentials',async()=>{
  const env=fixture();let calls=0,options;
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async(url,opts)=>{calls++;options=opts;assert.equal(url,source);return upstream();}});
  const first=await handle(request({Cookie:'private=1',Authorization:'Bearer private'}),env);
  assert.equal(first.status,200);assert.equal(await first.text(),'0123456789');
  assert.equal(first.headers.get('content-type'),'audio/mpeg');
  assert.equal(first.headers.get('accept-ranges'),'bytes');
  assert.equal(first.headers.get('content-length'),'10');
  assert.equal(first.headers.get('set-cookie'),null);
  assert.equal(first.headers.get('x-content-type-options'),'nosniff');
  assert.equal(options.redirect,'manual');assert.deepEqual(options.headers,{'Accept-Encoding':'identity'});
  const second=await handle(request(),env);assert.equal(await second.text(),'0123456789');
  assert.equal(calls,1);assert.equal(env.calls.put,1);assert.ok(env.objects.has('cambridge/'+asset.key));
});

test('fixed, open and suffix ranges produce correct 206 bodies and Content-Range',async()=>{
  const env=fixture();let calls=0;
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{calls++;return upstream();}});
  for(const [range,body,contentRange] of [['bytes=2-4','234','bytes 2-4/10'],['bytes=7-','789','bytes 7-9/10'],['bytes=-3','789','bytes 7-9/10'],['bytes=0-999','0123456789','bytes 0-9/10']]){
    const result=await handle(request({Range:range}),env);assert.equal(result.status,206);assert.equal(await result.text(),body);assert.equal(result.headers.get('content-range'),contentRange);assert.equal(result.headers.get('content-length'),String(body.length));
  }
  assert.equal(calls,1);assert.equal(env.calls.put,1);
});

test('invalid ranges are rejected before a download and include the approved total length',async()=>{
  const env=fixture();let calls=0;
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{calls++;return upstream();}});
  for(const range of ['bytes=10-','bytes=4-2','bytes=0-1,3-4','bytes=-0','bytes=-','items=1-2','bytes=9007199254740992-']){
    const result=await handle(request({Range:range}),env);assert.equal(result.status,416);assert.equal(result.headers.get('content-range'),'bytes */10');
  }
  assert.equal(calls,0);assert.equal(env.calls.put,0);
  assert.deepEqual(parseCambridgeRange('bytes=-100',10),{offset:0,length:10,start:0,end:9});
});

test('HEAD seeds a missing object but returns only verified headers, including ranged HEAD',async()=>{
  const env=fixture();let calls=0;
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{calls++;return upstream();}});
  const head=await handle(request({},'HEAD'),env);assert.equal(head.status,200);assert.equal(head.body,null);assert.equal(head.headers.get('content-length'),'10');
  const ranged=await handle(request({Range:'bytes=3-6'},'HEAD'),env);assert.equal(ranged.status,206);assert.equal(ranged.body,null);assert.equal(ranged.headers.get('content-range'),'bytes 3-6/10');
  assert.equal(calls,1);assert.equal(env.calls.get,0);
});

test('unregistered keys, URL query parameters and non-read methods never fetch',async()=>{
  const env=fixture();let calls=0;
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{calls++;return upstream();}});
  for(const req of [request({},'GET','audio/unknown.mp3'),request({},'GET',asset.key,'?url=http://127.0.0.1/private'),request({},'GET','images/%2e%2e%2fprivate.png')])assert.equal((await handle(req,env)).status,404);
  const method=await handle(request({},'POST'),env);assert.equal(method.status,405);assert.equal(method.headers.get('allow'),'GET, HEAD, PUT');assert.equal(calls,0);
  assert.equal((await handle(request(),{})).status,503);
});

test('unsafe manifest URLs and keys are excluded instead of creating an open proxy',async()=>{
  for(const row of [{...asset,sourceUrl:'http://127.0.0.1/secret'},{...asset,sourceUrl:source+'?token=secret'},{...asset,sourceUrl:'https://user:secret@media.example.test/a.mp3'},{...asset,key:'audio/../secret.mp3'},{...asset,sha256:'prefix'+asset.sha256}]){
    let calls=0;const handle=createCambridgeMediaHandler({catalog:{assets:[row]},fetchImpl:async()=>{calls++;return upstream();}});
    assert.equal((await handle(request(),fixture())).status,404);assert.equal(calls,0);
  }
});

test('changed MIME, size, checksum and redirects fail closed without caching an invalid object',async()=>{
  const invalid=[()=>upstream(bytes,{'Content-Type':'text/html'}),()=>upstream(bytes,{'Content-Length':'12'}),()=>upstream('xxxxxxxxxx'),()=>new Response(null,{status:302,headers:{Location:'https://other.example.test/unknown.mp3'}})];
  for(const response of invalid){
    const env=fixture(),handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>response()});
    const result=await handle(request(),env);assert.equal(result.status,503);assert.equal(env.objects.has('cambridge/'+asset.key),false);
  }
});

test('a missing upstream Content-Length is still checked by streamed byte count and checksum',async()=>{
  const env=fixture();const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>new Response(bytes,{headers:{'Content-Type':'audio/mpeg'}})});
  assert.equal((await handle(request(),env)).status,200);
  const short=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>new Response('short',{headers:{'Content-Type':'audio/mpeg'}})});
  const clean=fixture();assert.equal((await short(request(),clean)).status,503);assert.equal(clean.objects.size,0);
});

test('concurrent uncached requests import independently and leave the same verified object',async()=>{
  const env=fixture();let calls=0;
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,5));return upstream();}});
  const [a,b]=await Promise.all([handle(request(),env),handle(request({Range:'bytes=0-1'}),env)]);
  assert.equal(await a.text(),'0123456789');assert.equal(await b.text(),'01');assert.equal(calls,2);assert.equal(env.calls.put,2);assert.equal(env.objects.get('cambridge/'+asset.key).customMetadata.sha256,asset.sha256);
});

test('an unfinished earlier request cannot lend its promise to a later request',async()=>{
  const env=fixture();let calls=0,rejectEarlier,entered;
  const firstEntered=new Promise(resolve=>entered=resolve);
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{
    calls++;
    if(calls===1)return new Promise((resolve,reject)=>{rejectEarlier=reject;entered();});
    return upstream();
  }});
  const earlier=handle(request(),env);await firstEntered;
  const later=handle(request(),env);let timer,result;
  try{result=await Promise.race([later,new Promise(resolve=>timer=setTimeout(()=>resolve(null),100))]);}
  finally{clearTimeout(timer);rejectEarlier(Error('The earlier request has ended.'));await earlier;}
  assert.ok(result,'the later request must complete independently of the unfinished request');
  assert.equal(result.status,200);assert.equal(await result.text(),'0123456789');assert.equal(calls,2);
});

test('an outdated checksum in R2 is replaced atomically by the current approved asset',async()=>{
  const env=fixture();env.objects.set('cambridge/'+asset.key,{bytes,customMetadata:{sha256:'old'}});
  let calls=0;const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{calls++;return upstream();}});
  const result=await handle(request(),env);assert.equal(result.status,200);assert.equal(calls,1);assert.equal(env.objects.get('cambridge/'+asset.key).customMetadata.sha256,asset.sha256);
});

const put=(body=bytes,headers={},key=asset.key,query='')=>new Request('https://school.test/api/guest/cambridge/media/'+key+query,{method:'PUT',headers:{'Content-Type':asset.contentType,'Content-Length':String(asset.sizeBytes),...headers},body});

test('PUT accepts only the pinned payload, is idempotent and serves subsequent ranges without an upstream fetch',async()=>{
  const env=fixture();let fetches=0;
  const handle=createCambridgeMediaHandler({catalog:{assets:[asset]},fetchImpl:async()=>{fetches++;throw Error('upstream unavailable');}});
  const first=await handle(put(),env);assert.equal(first.status,201);assert.equal((await first.json()).sha256,asset.sha256);assert.equal(env.calls.put,1);
  const second=await handle(put(),env);assert.equal(second.status,200);assert.equal((await second.json()).created,false);assert.equal(env.calls.put,1);
  const ranged=await handle(request({Range:'bytes=4-6'}),env);assert.equal(ranged.status,206);assert.equal(await ranged.text(),'456');
  const head=await handle(request({},'HEAD'),env);assert.equal(head.status,200);assert.equal(head.headers.get('content-length'),'10');assert.equal(head.headers.get('etag'),`"sha256-${asset.sha256}"`);assert.equal(fetches,0);
});

test('PUT rejects unregistered keys, arbitrary URL parameters, wrong MIME, declared size and partial uploads',async()=>{
  const env=fixture(),handle=createCambridgeMediaHandler({catalog:{assets:[asset]}});
  const invalid=[[put(bytes,{},'audio/unknown.mp3'),404],[put(bytes,{},asset.key,'?url=https://example.test/file'),404],[put(bytes,{'Content-Type':'text/plain'}),415],[put(bytes,{'Content-Length':'11'}),422],[put(bytes,{'Range':'bytes=0-9'}),400],[put(bytes,{'Content-Encoding':'gzip'}),400]];
  for(const [req,status] of invalid)assert.equal((await handle(req,env)).status,status);
  assert.equal(env.calls.put,0);assert.equal(env.objects.size,0);
});

test('PUT byte-count and SHA failures never install an object, including a payload without an accurate body length',async()=>{
  for(const body of ['xxxxxxxxxx','short','01234567890']){
    const env=fixture(),handle=createCambridgeMediaHandler({catalog:{assets:[asset]}});
    const response=await handle(put(body),env);assert.ok([413,422].includes(response.status));assert.equal(env.objects.size,0);
  }
});

test('PUT still verifies a repeated payload and never replaces the correct object with different bytes',async()=>{
  const env=fixture(),handle=createCambridgeMediaHandler({catalog:{assets:[asset]}});
  assert.equal((await handle(put(),env)).status,201);
  assert.equal((await handle(put('xxxxxxxxxx'),env)).status,422);assert.equal(env.calls.put,1);
  assert.equal(new TextDecoder().decode(env.objects.get('cambridge/'+asset.key).bytes),'0123456789');
});
