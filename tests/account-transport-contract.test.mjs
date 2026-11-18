import test from 'node:test';
import assert from 'node:assert/strict';
import {createAccountClient} from '../public/account-client.mjs';

const asJSON=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});

test('the copied frontend retains same-origin credentials, CSRF and all account/admin route contracts',async()=>{
  const originalFetch=globalThis.fetch,calls=[];
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options,body:options.body===undefined?undefined:JSON.parse(options.body)});
    if(url==='/api/auth/login'||url==='/api/auth/me')return asJSON({user:{id:'student-one',role:'student',status:'active'},csrfToken:'csrf-for-this-session'});
    if(url==='/api/me/state')return asJSON({version:options.method==='PUT'?6:5,state:{growth:{id:'student-one'}}});
    return asJSON({ok:true});
  };
  try{
    const client=createAccountClient();
    await client.login({username:'student-one',password:'not-a-real-password'});
    const cases=[
      [()=>client.init(),'GET','/api/auth/me'],
      [()=>client.getProfile(),'GET','/api/me/profile'],
      [()=>client.updateProfile({grade:'高一'}),'PATCH','/api/me/profile'],
      [()=>client.getState(),'GET','/api/me/state'],
      [()=>client.saveState({growth:{id:'student-one'}}),'PUT','/api/me/state'],
      [()=>client.getPlan(),'GET','/api/me/plan'],
      [()=>client.getSubmissions(),'GET','/api/me/submissions'],
      [()=>client.listSubmissions(),'GET','/api/me/submissions'],
      [()=>client.getAnnouncements(),'GET','/api/announcements'],
      [()=>client.adminStudents({query:'李 同学',status:'active'}),'GET','/api/admin/students?query=%E6%9D%8E+%E5%90%8C%E5%AD%A6&status=active'],
      [()=>client.adminStudent('student-one'),'GET','/api/admin/students/student-one'],
      [()=>client.adminUpdateStudent('student-one',{status:'active'}),'PATCH','/api/admin/students/student-one'],
      [()=>client.adminResetPassword('student-one','new-test-password'),'POST','/api/admin/students/student-one/reset-password'],
      [()=>client.adminSubmissions({status:'submitted',page:2}),'GET','/api/admin/submissions?status=submitted&page=2'],
      [()=>client.adminReview('work-one',{feedback:'补充具体理由。'}),'PATCH','/api/admin/submissions/work-one'],
      [()=>client.adminSavePlan('student-one',{title:'本周任务'},2),'PUT','/api/admin/students/student-one/plan'],
      [()=>client.adminAddAssessment('student-one',{source:'teacher',overall:6}),'POST','/api/admin/students/student-one/assessments'],
      [()=>client.adminVoidAssessment('student-one','assessment-one'),'PATCH','/api/admin/students/student-one/assessments/assessment-one'],
      [()=>client.adminSummary(),'GET','/api/admin/summary'],
      [()=>client.adminSettings(),'GET','/api/admin/settings'],
      [()=>client.adminUpdateSettings({registrationOpen:true}),'PATCH','/api/admin/settings'],
      [()=>client.adminAnnouncements(),'GET','/api/announcements'],
      [()=>client.adminCreateAnnouncement({title:'通知',body:'正文'}),'POST','/api/admin/announcements'],
      [()=>client.adminUpdateAnnouncement('notice-one',{archived:true}),'PATCH','/api/admin/announcements/notice-one'],
      [()=>client.request('/api/admin/grading/tasks'),'GET','/api/admin/grading/tasks'],
      [()=>client.request('/api/admin/submissions/work-one/regrade',{method:'POST',body:{}}),'POST','/api/admin/submissions/work-one/regrade'],
      [()=>client.request('/api/textbooks/tasks/textbook%3Awriting-topic-001'),'GET','/api/textbooks/tasks/textbook%3Awriting-topic-001'],
      [()=>client.request('/api/corpus/resources'),'GET','/api/corpus/resources'],
    ];
    for(const [call,method,path]of cases){
      await call();const actual=calls.at(-1);
      assert.equal(actual.url,path);assert.equal(actual.options.method,method);
      assert.equal(actual.options.credentials,'include');assert.equal(actual.options.cache,'no-store');
      assert.equal(actual.options.headers.Accept,'application/json');
      assert.equal(actual.options.headers.Authorization,undefined);
      if(method!=='GET')assert.equal(actual.options.headers['X-CSRF-Token'],'csrf-for-this-session');
    }
    assert.deepEqual(calls.find(row=>row.url==='/api/me/state'&&row.options.method==='PUT').body,{version:5,state:{growth:{id:'student-one'}}});
    assert.deepEqual(calls.find(row=>row.url.endsWith('/plan')&&row.options.method==='PUT').body,{plan:{title:'本周任务'},version:2});
    assert.equal(client.audioUrl('audio-one'),'/api/audio/audio-one');
    await client.changePassword({currentPassword:'test-password',newPassword:'new-test-password'});
    assert.equal(calls.at(-1).url,'/api/auth/change-password');
    assert.equal(client.user,null);assert.equal(client.csrfToken,'');
  }finally{globalThis.fetch=originalFetch;}
});

test('student audio submissions preserve the JSON/base64 and idempotency contract',async()=>{
  const originalFetch=globalThis.fetch;let sent;
  globalThis.fetch=async(url,options)=>{sent={url,options,body:JSON.parse(options.body)};return asJSON({submission:{id:'work-one',machineStatus:'not_configured'}},201);};
  try{
    const client=createAccountClient(),bytes=new Uint8Array([0,1,2,250,251,252]);
    await client.submitWork({skill:'speaking',taskId:'textbook:speaking-topic-001',materialId:'textbook:speaking-topic-001',clientSubmissionId:'stable_key_for_retry_001',audioBlob:new Blob([bytes],{type:'audio/webm;codecs=opus'}),text:'My school project.'});
    assert.equal(sent.url,'/api/me/submissions');assert.equal(sent.options.method,'POST');
    assert.equal(sent.body.audioBase64,'AAEC+vv8');assert.equal(sent.body.mimeType,'audio/webm');
    assert.equal(sent.body.clientSubmissionId,'stable_key_for_retry_001');
    assert.equal(sent.body.taskId,'textbook:speaking-topic-001');
    assert.equal(sent.body.audioBlob,undefined);assert.equal(sent.body.blob,undefined);
  }finally{globalThis.fetch=originalFetch;}
});

test('state conflicts retain the server version and state for recovery rather than becoming generic failures',async()=>{
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async(url,options)=>options.method==='GET'?asJSON({version:3,state:{growth:{id:'student-one'}}}):asJSON({error:'另一台设备更新了记录，请先同步。',code:'STATE_CONFLICT',version:4,state:{growth:{id:'student-one',evidence:[{id:'latest'}]}}},409);
  try{
    const client=createAccountClient();await client.getState();
    await assert.rejects(()=>client.saveState({growth:{}}),error=>error.status===409&&error.code==='STATE_CONFLICT'&&error.details.version===4&&error.details.state.growth.evidence[0].id==='latest');
  }finally{globalThis.fetch=originalFetch;}
});

test('missing API routing cannot masquerade as a successful HTML page',async()=>{
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>new Response('<html>frontend shell</html>',{headers:{'Content-Type':'text/html'}});
  try{await assert.rejects(()=>createAccountClient().getProfile(),error=>error.code==='SERVICE_UNAVAILABLE');}
  finally{globalThis.fetch=originalFetch;}
});

test('an expired session clears the previous account and CSRF token',async()=>{
  const originalFetch=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>calls++===0?asJSON({user:{id:'student-one'},csrfToken:'old-csrf'}):asJSON({error:'登录已失效，请重新登录。'},401);
  try{
    const client=createAccountClient();await client.login({username:'student-one',password:'test-password'});
    await assert.rejects(()=>client.getProfile(),error=>error.status===401);
    assert.equal(client.user,null);assert.equal(client.csrfToken,'');
  }finally{globalThis.fetch=originalFetch;}
});
