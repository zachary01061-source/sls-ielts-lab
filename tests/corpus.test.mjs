import test from 'node:test';
import assert from 'node:assert/strict';
import {createCorpusProxy} from '../server/corpus.mjs';
import {normalizeCorpusResources} from '../public/corpus-ui.mjs';

const BASE='http://www.1kao.com.cn/qr/3064/srcs/20260920/';
const catalog={title:'Test corpus',resources:[
  {id:'track',title:'Track',type:'audio',url:BASE+'track.mp3',available:true,verificationStatus:'verified'},
  {id:'other',title:'Other',type:'audio',url:BASE+'other.mp3',available:true},
  {id:'document',title:'Document',type:'pdf',url:BASE+'document.pdf',available:true},
  {id:'offline',title:'Offline',type:'audio',url:BASE+'offline.mp3',available:false},
]};
const request=(headers={},method='GET')=>new Request('https://school.example/api/corpus/resources/track',{method,headers});
const audio=(body='abc',headers={},status=200)=>new Response(body,{status,headers:{'Content-Type':'audio/mpeg',...headers}});
const status=expected=>error=>error.status===expected;

test('guest audio and transcript links use the guest resource route',()=>{
  const proxy=createCorpusProxy({catalog});
  const guest=normalizeCorpusResources(proxy.list({guest:true}),{guest:true});
  const regular=normalizeCorpusResources(proxy.list());
  assert.ok(guest.some(row=>row.type==='audio'));
  assert.ok(guest.some(row=>row.type==='pdf'));
  assert.ok(guest.every(row=>row.url===`/api/guest/corpus/resources/${row.id}`));
  assert.ok(regular.every(row=>row.url===`/api/corpus/resources/${row.id}`));
});

test('the imported allowlist contains 168 audio files and seven PDFs without exposing upstream URLs',()=>{
  const result=createCorpusProxy().list();
  assert.equal(result.resources.length,175);
  assert.equal(result.resources.filter(row=>row.type==='audio').length,168);
  assert.equal(result.resources.filter(row=>row.type==='pdf').length,7);
  assert.equal(new Set(result.resources.map(row=>row.id)).size,175);
  assert.ok(result.resources.every(row=>row.url===`/api/corpus/resources/${row.id}`&&row.proxyUrl===row.url));
  assert.ok(!JSON.stringify(result).includes('www.1kao.com.cn'));
});

test('only registered fixed URLs can be fetched; user URL parameters and credentials are never forwarded',async()=>{
  let call;
  const proxy=createCorpusProxy({catalog,fetchImpl:async(url,options)=>{call={url,options};return audio('abc',{'Content-Length':'3'});}});
  const req=new Request('https://school.example/api/corpus/resources/track?url=http://127.0.0.1/secret',{headers:{Cookie:'sls_session=private',Authorization:'Bearer private','X-CSRF-Token':'secret'}});
  const response=await proxy.stream(req,'track');
  assert.equal(await response.text(),'abc');
  assert.equal(call.url,BASE+'track.mp3');
  assert.deepEqual(call.options.headers,{'Accept-Encoding':'identity'});
  assert.equal(call.options.redirect,'manual');
  assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.equal(response.headers.get('content-length'),'3');
  assert.equal(response.headers.get('set-cookie'),null);
  await assert.rejects(()=>proxy.stream(request(),'http://127.0.0.1/secret'),status(404));
  await assert.rejects(()=>proxy.stream(request(),'unknown'),status(404));
  await assert.rejects(()=>proxy.stream(request(),'offline'),status(503));
});

test('range requests retain 206 and Content-Range for browser audio seeking',async()=>{
  let sent;
  const proxy=createCorpusProxy({catalog,fetchImpl:async(url,options)=>{sent=options;return audio('abc',{'Content-Length':'3','Content-Range':'bytes 4-6/10'},206);}});
  const response=await proxy.stream(request({Range:'bytes=4-6'}),'track');
  assert.equal(response.status,206);
  assert.equal(response.headers.get('content-range'),'bytes 4-6/10');
  assert.equal(response.headers.get('accept-ranges'),'bytes');
  assert.equal(sent.headers.Range,'bytes=4-6');
  assert.equal(await response.text(),'abc');
});

test('malformed, multipart and unsafe ranges are rejected before an upstream request',async()=>{
  let calls=0;
  const proxy=createCorpusProxy({catalog,fetchImpl:async()=>{calls++;return audio();}});
  for(const range of ['bytes=0-1,4-5','bytes=-','bytes=8-3','bytes=-0','bytes=9007199254740992-','items=1-2'])await assert.rejects(()=>proxy.stream(request({Range:range}),'track'),status(416));
  assert.equal(calls,0);
});

test('HEAD returns headers without a response body and keeps PDF content type',async()=>{
  let method;
  const proxy=createCorpusProxy({catalog,fetchImpl:async(url,options)=>{method=options.method;return new Response('pdf',{headers:{'Content-Type':'application/octet-stream','Content-Length':'3','Set-Cookie':'private=1'}});}});
  const response=await proxy.stream(request({},'HEAD'),'document');
  assert.equal(method,'HEAD');assert.equal(response.body,null);
  assert.equal(response.headers.get('content-type'),'application/pdf');
  assert.equal(response.headers.get('content-length'),'3');
  assert.equal(response.headers.get('set-cookie'),null);
});

test('unsafe catalogue URLs are discarded rather than creating an open proxy',()=>{
  const unsafe=[
    'http://127.0.0.1/qr/3064/srcs/a.mp3',
    'https://www.1kao.com.cn.evil.test/qr/3064/srcs/a.mp3',
    'http://user:password@www.1kao.com.cn/qr/3064/srcs/a.mp3',
    'http://www.1kao.com.cn:8080/qr/3064/srcs/a.mp3',
    'http://www.1kao.com.cn/qr/3064/srcs/../private.mp3',
    'http://www.1kao.com.cn/qr/3064/srcs/%2e%2e%2fprivate.mp3',
    BASE+'track.mp3?secret=1',BASE+'track.mp3#fragment',BASE+'menu.asp',
  ];
  const proxy=createCorpusProxy({catalog:{resources:unsafe.map((url,index)=>({id:`unsafe-${index}`,url,type:'audio'}))}});
  assert.deepEqual(proxy.list().resources,[]);
});

test('redirects permit registered URLs and HTTPS upgrades but reject other hosts or unregistered paths',async()=>{
  for(const destination of [BASE+'other.mp3',(BASE+'track.mp3').replace('http:','https:')]){
    const calls=[];
    const proxy=createCorpusProxy({catalog,fetchImpl:async url=>{calls.push(url);return calls.length===1?new Response(null,{status:302,headers:{Location:destination}}):audio();}});
    assert.equal(await (await proxy.stream(request(),'track')).text(),'abc');
    assert.deepEqual(calls,[BASE+'track.mp3',destination]);
  }
  for(const destination of ['http://127.0.0.1/secret',BASE+'unregistered.mp3','http://www.1kao.com.cn/private.mp3']){
    let calls=0;
    const proxy=createCorpusProxy({catalog,fetchImpl:async()=>{calls++;return new Response(null,{status:302,headers:{Location:destination}});}});
    await assert.rejects(()=>proxy.stream(request(),'track'),status(502));assert.equal(calls,1);
  }
});

test('redirect loops stop after the fixed limit',async()=>{
  let calls=0;
  const proxy=createCorpusProxy({catalog,fetchImpl:async()=>{calls++;return new Response(null,{status:302,headers:{Location:BASE+'track.mp3'}});}});
  await assert.rejects(()=>proxy.stream(request(),'track'),status(502));assert.equal(calls,4);
});

test('upstream errors, HTML sign-in walls and broken partial responses do not become playable files',async()=>{
  const cases=[
    [()=>new Response('sign in',{headers:{'Content-Type':'text/html'}}),502],
    [()=>new Response('missing',{status:404}),502],
    [()=>new Response(null,{status:416}),416],
    [()=>audio('abc',{},206),502],
    [()=>audio('abc',{'Content-Length':'3','Content-Range':'bytes 8-3/10'},206),502],
    [()=>audio('abc',{'Content-Length':'3','Content-Range':'bytes 0-5/10'},206),502],
  ];
  for(const [fetchImpl,expected]of cases){const proxy=createCorpusProxy({catalog,fetchImpl});await assert.rejects(()=>proxy.stream(request(),'track'),status(expected));}
});

test('declared and streamed byte limits are enforced without buffering whole audio',async()=>{
  const declared=createCorpusProxy({catalog,maxBytes:4,fetchImpl:async()=>audio('large',{'Content-Length':'5'})});
  await assert.rejects(()=>declared.stream(request(),'track'),status(502));
  const streamed=createCorpusProxy({catalog,maxBytes:4,fetchImpl:async()=>audio('large')});
  const response=await streamed.stream(request(),'track');
  await assert.rejects(()=>response.arrayBuffer(),status(502));
});

test('header timeouts abort the upstream request and release the concurrency slot',async()=>{
  let calls=0;
  const proxy=createCorpusProxy({catalog,headerTimeoutMs:5,maxInflight:1,fetchImpl:async(url,{signal})=>{
    if(calls++>0)return audio();
    return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
  }});
  await assert.rejects(()=>proxy.stream(request(),'track'),status(502));
  assert.equal(await (await proxy.stream(request(),'track')).text(),'abc');
});

test('cancelling a client response aborts upstream streaming and allows the next request',async()=>{
  let upstreamSignal;
  const proxy=createCorpusProxy({catalog,maxInflight:1,fetchImpl:async(url,{signal})=>{
    upstreamSignal=signal;
    return new Response(new ReadableStream({pull(output){output.enqueue(new Uint8Array([1]));}}),{headers:{'Content-Type':'audio/mpeg'}});
  }});
  const response=await proxy.stream(request(),'track');
  await assert.rejects(()=>proxy.stream(request(),'track'),status(503));
  await response.body.cancel();assert.equal(upstreamSignal.aborted,true);
  const next=await proxy.stream(request(),'track');await next.body.cancel();
});

test('unsupported methods fail without contacting the publisher',async()=>{
  let calls=0;
  const proxy=createCorpusProxy({catalog,fetchImpl:async()=>{calls++;return audio();}});
  await assert.rejects(()=>proxy.stream(request({},'POST'),'track'),status(405));assert.equal(calls,0);
});
