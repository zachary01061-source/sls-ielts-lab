/** Same-origin account transport. Cookies remain HttpOnly; no credentials are persisted here. */
export class AccountError extends Error {
  constructor(message, {status=0, code='NETWORK_ERROR', details=null}={}) {
    super(message); this.name='AccountError'; this.status=status; this.code=code; this.details=details;
  }
}

export function createAccountClient({baseUrl=''}={}) {
  const base=String(baseUrl).replace(/\/$/,'');
  let user=null, csrfToken='', available=false, stateVersion=null;
  const listeners=new Set();
  function changed(){ for(const fn of listeners)fn({user,available}); }
  async function request(path, {method='GET', body, signal}={}) {
    const headers={'Accept':'application/json'};
    if(body!==undefined)headers['Content-Type']='application/json';
    if(method!=='GET'&&csrfToken)headers['X-CSRF-Token']=csrfToken;
    let res;
    try { res=await fetch(base+path,{method,headers,credentials:'include',cache:'no-store',body:body===undefined?undefined:JSON.stringify(body),signal}); }
    catch(error){
      if(error.name==='AbortError')throw error;
      available=false;changed();
      throw new AccountError('暂时无法连接账号服务。请检查网络后重试，填写的内容会保留。');
    }
    let data;
    const type=res.headers.get('content-type')||'';
    if(!type.includes('application/json')){
      available=false;changed();
      throw new AccountError('账号服务暂未就绪，请联系管理员。',{status:res.status,code:'SERVICE_UNAVAILABLE'});
    }
    try{data=await res.json();}catch{throw new AccountError('账号服务返回异常，请稍后重试。',{status:res.status,code:'INVALID_RESPONSE'});}
    available=true;
    if(!res.ok){
      if(res.status===401){user=null;csrfToken='';stateVersion=null;changed();}
      const standard={401:'登录已失效，请重新登录。',403:'当前账号暂时不能执行此操作。',409:'记录已在其他页面更新，请重新加载后再保存。',429:'操作太频繁，请稍后再试。'};
      throw new AccountError(typeof data.error==='string'?data.error:data.error?.message||data.message||standard[res.status]||'操作未完成，请重试。',{status:res.status,code:data.code||data.error?.code||'REQUEST_FAILED',details:data});
    }
    return data;
  }
  function setSession(data){user=data.user||null;csrfToken=data.csrfToken||'';stateVersion=null;changed();return{user,csrfToken};}
  const id=value=>encodeURIComponent(String(value));
  return {
    get user(){return user;}, get available(){return available;},get csrfToken(){return csrfToken;},
    subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
    async init(){try{return setSession(await request('/api/auth/me'));}catch(e){if(e.status===401)return{user:null,csrfToken:''};throw e;}},
    async login(values){return setSession(await request('/api/auth/login',{method:'POST',body:values}));},
    register(values){return request('/api/auth/register',{method:'POST',body:values});},
    async logout(){await request('/api/auth/logout',{method:'POST',body:{}});return setSession({});},
    async getState(){const data=await request('/api/me/state');stateVersion=data.version;return data;},
    async saveState(state,version=stateVersion){
      if(state&&Object.hasOwn(state,'version')&&Object.hasOwn(state,'state')){version=state.version;state=state.state;}
      if(version===null)throw new AccountError('请先载入云端记录再保存。',{code:'STATE_NOT_LOADED'});
      const data=await request('/api/me/state',{method:'PUT',body:{version,state}});stateVersion=data.version;return data;
    },
    getProfile(){return request('/api/me/profile');},
    async updateProfile(values){const data=await request('/api/me/profile',{method:'PATCH',body:values});if(data.user)user=data.user;else if(data.profile)user={...user,...data.profile};else user={...user,...values};changed();return data;},
    async changePassword(values){const data=await request('/api/auth/change-password',{method:'POST',body:values});setSession({});return data;},
    getSubmissions(){return request('/api/me/submissions');},
    listSubmissions(){return request('/api/me/submissions');},
    async submitWork(values){
      const body={...values},blob=body.audioBlob||body.blob;
      delete body.audioBlob;delete body.blob;
      if(blob instanceof Blob){
        if(blob.size>5*1024*1024)throw new AccountError('录音超过 5 MB，请缩短录音后再提交。',{code:'AUDIO_TOO_LARGE'});
        const bytes=new Uint8Array(await blob.arrayBuffer());let raw='';
        for(let i=0;i<bytes.length;i+=16384)raw+=String.fromCharCode(...bytes.subarray(i,i+16384));
        body.audioBase64=btoa(raw);body.mimeType=blob.type.split(';')[0]||'audio/webm';
      }
      return request('/api/me/submissions',{method:'POST',body});
    },
    audioUrl(audioId){return base+'/api/audio/'+id(audioId);},
    getAnnouncements(){return request('/api/announcements');},
    adminStudents(filters={}){const query=new URLSearchParams(Object.entries(filters).filter(([,v])=>v!==''&&v!=null));return request('/api/admin/students?'+query);},
    adminStudent(studentId){return request('/api/admin/students/'+id(studentId));},
    adminUpdateStudent(studentId,values){return request('/api/admin/students/'+id(studentId),{method:'PATCH',body:values});},
    adminResetPassword(studentId,password){return request('/api/admin/students/'+id(studentId)+'/reset-password',{method:'POST',body:{password}});},
    adminSubmissions(filters={}){const query=new URLSearchParams(Object.entries(filters).filter(([,v])=>v!==''&&v!=null));return request('/api/admin/submissions?'+query);},
    adminReview(submissionId,values){return request('/api/admin/submissions/'+id(submissionId),{method:'PATCH',body:values});},
    getPlan(){return request('/api/me/plan');},
    adminSavePlan(studentId,plan,version){return request('/api/admin/students/'+id(studentId)+'/plan',{method:'PUT',body:{plan,...(version===undefined?{}:{version})}});},
    adminAddAssessment(studentId,assessment){return request('/api/admin/students/'+id(studentId)+'/assessments',{method:'POST',body:assessment});},
    adminVoidAssessment(studentId,assessmentId){return request('/api/admin/students/'+id(studentId)+'/assessments/'+id(assessmentId),{method:'PATCH',body:{voided:true}});},
    adminSummary(){return request('/api/admin/summary');},
    adminSettings(){return request('/api/admin/settings');},
    adminUpdateSettings(values){return request('/api/admin/settings',{method:'PATCH',body:values});},
    adminAnnouncements(){return request('/api/announcements');},
    adminCreateAnnouncement(values){return request('/api/admin/announcements',{method:'POST',body:values});},
    adminUpdateAnnouncement(announcementId,values){return request('/api/admin/announcements/'+id(announcementId),{method:'PATCH',body:values});},
    request
  };
}
