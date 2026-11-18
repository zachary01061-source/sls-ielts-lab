import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';
import {resolveAudioSource,LEGACY_LISTENING_ORIGIN} from '../public/audio-source.mjs';
import {renderMachineReview} from '../public/account-ui.mjs';
import {createGrowthUI} from '../public/growth-ui.mjs';
import {createGrowthProfile} from '../public/growth-engine.mjs';
import {resolveEntryRoute,resolvePracticeRoute} from '../public/entry-flow.mjs';

const publicRoot=fileURLToPath(new URL('../public/',import.meta.url));
async function filesIn(directory){const entries=await readdir(directory,{withFileTypes:true});return (await Promise.all(entries.map(entry=>entry.isDirectory()?filesIn(join(directory,entry.name)):[join(directory,entry.name)]))).flat();}

test('existing listening bank audio keeps the school audio origin across deployment hosts',()=>{
  assert.equal(LEGACY_LISTENING_ORIGIN,'https://sls-reading-zac.b-cdn.net');
  for(const host of ['https://school.example/index.html','https://preview.example/index.html']){
    assert.equal(resolveAudioSource('/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3',host),'https://sls-reading-zac.b-cdn.net/media/listening/45b5ab5f-cdc7-45a6-9461-0e8bf048fb01.mp3');
    assert.equal(resolveAudioSource('https://sls-reading-zac.b-cdn.net/media/listening/example.mp3',host),'https://sls-reading-zac.b-cdn.net/media/listening/example.mp3');
    assert.equal(resolveAudioSource('javascript:alert(1)',host),'');
    assert.equal(resolveAudioSource('https://name:password@example.com/audio.mp3',host),'');
  }
});

test('unconfigured grading shows teacher feedback without a score or non-working retry button',()=>{
  const submitted={id:'saved-work',skill:'speaking',machineStatus:'not_configured',machineReview:{estimatedBand:9,referenceScore:{available:true,taskBand:9}}};
  const student=renderMachineReview(submitted),admin=renderMachineReview(submitted,{admin:true});
  assert.match(student,/教师反馈/);assert.match(student,/自动批改暂未开通/);assert.match(student,/作品已提交给老师/);
  assert.match(admin,/查看作品或录音并填写教师反馈/);
  for(const html of [student,admin])assert.doesNotMatch(html,/本题参考分|已完成自动批改|data-account-action="submission-regrade"/);
});

test('productive task entry explains teacher submission and keeps assessment/admin routing',async()=>{
  const previous=globalThis.document,html=[];
  globalThis.document={getElementById:()=>({addEventListener(){},querySelector:selector=>selector==='h1'?{focus(){}}:selector==='#g-submissions'?{innerHTML:''}:null,querySelectorAll:()=>[]}),activeElement:null};
  try{
    let profile=createGrowthProfile({id:'student-a'});
    const ui=createGrowthUI({shell:markup=>html.push(markup),getAccount:()=>({id:'student-a'}),getProfile:()=>profile,setProfile:async next=>{profile=next;},getSubmissions:async()=>[]});
    await ui.render('writing/w3');assert.match(html.at(-1),/提交给老师/);assert.match(html.at(-1),/自动批改暂未开通/);ui.reset();
  }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
  assert.equal(resolveEntryRoute({id:'s',role:'student',status:'active'},{},'growth'),'diagnostic');
  assert.equal(resolveEntryRoute({id:'a',role:'admin',status:'active'},{},''),'admin');
});

test('practice entry opens all five learning areas and redirects obsolete sign-in and assessment links',()=>{
  for(const route of ['', 'login', 'register', 'account', 'admin', 'diagnostic', 'diagnostic/check/old', 'growth', 'plan']){
    assert.equal(resolvePracticeRoute(route),'overview');
  }
  for(const route of ['listening','speaking','library','writing','corpus','writing/ideas/topic-id','result/attempt-id']){
    assert.equal(resolvePracticeRoute('#'+route),route);
  }
});

test('open speaking and writing practice use local drafts with no teacher submission',async()=>{
  const previous=globalThis.document,html=[];
  globalThis.document={getElementById:()=>({addEventListener(){},querySelector:selector=>selector==='h1'?{focus(){}}:null,querySelectorAll:()=>[]}),activeElement:null};
  try{
    const profile=createGrowthProfile({id:'local-guest'});
    const ui=createGrowthUI({guest:true,shell:markup=>html.push(markup),getProfile:()=>profile});
    await ui.render('writing/w3');
    assert.match(html.at(-1),/保存练习.*当前浏览器/);
    assert.doesNotMatch(html.at(-1),/提交给老师|查看学习计划|我的作品与反馈/);
    await ui.render('speaking');
    assert.match(html.at(-1),/开始录音/);
    assert.match(html.at(-1),/下载录音/);
    assert.doesNotMatch(html.at(-1),/提交给老师|查看学习计划|我的作品与反馈/);
    ui.reset();
  }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});

test('public assets exclude private textbooks, source files, credentials, local tests and copied audio binaries',async()=>{
  const files=await filesIn(publicRoot);
  for(const filename of files){
    const path=relative(publicRoot,filename).replaceAll('\\','/');
    assert.doesNotMatch(path,/(?:^|\/)(?:qa-[^/]*|server|tests|docs|node_modules|\.env[^/]*)(?:\/|$)/);
    assert.doesNotMatch(path,/\.(?:pdf|mp3|wav|ogg|mp4|sqlite|db|pem|key)$/);
  }
  const modules=files.filter(filename=>/\.(?:js|mjs)$/.test(filename));
  for(const filename of modules){const source=await readFile(filename,'utf8');assert.doesNotMatch(source,/fixtureTextbooks|fullSections|server\/materials\/textbooks|25-17/);}
  const manifest=JSON.parse(await readFile(new URL('../public-assets-manifest.json',import.meta.url),'utf8'));
  assert.equal(manifest.summary.bankJsonFiles,969);assert.equal(manifest.summary.bankJsonBytesUnchanged,true);
  assert.ok(manifest.files.every(file=>!file.path.startsWith('/')&&!file.path.includes('..')));
  assert.doesNotMatch(JSON.stringify(manifest),/\/workspace\/|25-17|originalFilename/);
});
