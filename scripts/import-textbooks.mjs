// Run locally after deployment with an authenticated school administrator session.
// Credentials come from a mode-0600 JSON file or environment, never CLI arguments.
import {readFileSync,statSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

function value(flag){const index=process.argv.indexOf(flag);return index<0?null:process.argv[index+1];}
const origin=value('--origin'),directory=value('--directory'),sessionFile=value('--session-file');
if(!origin||!directory)throw Error('Usage: node scripts/import-textbooks.mjs --origin https://school.example --directory /private/source/textbooks [--session-file /private/admin-session.json]');
const url=new URL(origin);
if(url.origin!==origin||!['https:','http:'].includes(url.protocol)||url.protocol==='http:'&&!['127.0.0.1','localhost'].includes(url.hostname))throw Error('Use an HTTPS origin without a path or trailing slash.');
let session={cookie:process.env.SLS_IMPORT_COOKIE,csrfToken:process.env.SLS_IMPORT_CSRF};
if(sessionFile){const stat=statSync(sessionFile);if(!stat.isFile()||(stat.mode&0o077)!==0)throw Error('Session file must be a regular file readable only by its owner (mode 0600).');session=JSON.parse(readFileSync(sessionFile,'utf8'));}
if(!session.cookie||!session.csrfToken)throw Error('Provide the active administrator cookie and csrfToken through a protected session file or environment.');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(readFileSync(resolve(root,'server/materials/textbooks/manifest.json'),'utf8'));
const files=[];
// Verify every source before sending anything, so an incorrect directory causes no writes.
for(const book of manifest.books)for(const kind of ['json','pdf']){
  const file=resolve(directory,`${book.id}.${kind}`),bytes=readFileSync(file),asset=book.assets[kind];
  if(bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error(`Source checksum mismatch: ${book.id}.${kind}`);
  files.push({book,kind,file,asset});
}
const headers={Cookie:session.cookie,Origin:origin,'X-CSRF-Token':session.csrfToken};
const before=await fetch(origin+'/api/admin/textbooks/import',{headers,redirect:'error'});
if(!before.ok)throw Error(`Administrator verification failed (${before.status}).`);
for(const {book,kind,file,asset} of files){
  const response=await fetch(`${origin}/api/admin/textbooks/import/${book.id}/${kind}`,{method:'PUT',headers:{...headers,'Content-Type':asset.contentType},body:readFileSync(file),redirect:'error'});
  const result=await response.json();
  if(!response.ok||result.sha256!==asset.sha256)throw Error(`Import failed: ${book.id}.${kind} (${response.status}) ${result.error||''}`);
  console.log(`${book.id}.${kind}: ${result.alreadyImported?'verified existing file':'imported'} (${asset.bytes} bytes)`);
}
const response=await fetch(origin+'/api/admin/textbooks/import',{headers,redirect:'error'}),result=await response.json();
if(!response.ok||result.books?.length!==4||result.books.some(book=>!book.ready)||result.pageCount!==629||result.taskCount!==500)throw Error('Final import verification did not pass.');
console.log('Verified: 4 textbooks, 629 source pages, 500 textbook tasks; 526 registered grading tasks in total.');
