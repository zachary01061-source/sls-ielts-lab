import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('../',import.meta.url)),publicRoot=path.join(root,'public');
const snapshot=JSON.parse(await fs.readFile(path.join(root,'frontend-source-snapshot.json'),'utf8')).files;
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
async function walk(directory){const entries=await fs.readdir(directory,{withFileTypes:true});return (await Promise.all(entries.map(async entry=>{if(entry.isSymbolicLink())throw Error('Public assets must not be symlinks.');const filename=path.join(directory,entry.name);return entry.isDirectory()?walk(filename):[filename];}))).flat();}
const filenames=(await walk(publicRoot)).sort(),files=[],extensions={},dependencies=[];
for(const filename of filenames){
  const relative=path.relative(publicRoot,filename).replaceAll(path.sep,'/'),suffix=path.extname(filename).toLowerCase();
  if(/(?:^|\/)(?:qa-[^/]*|server|tests|docs|node_modules|\.env[^/]*)(?:\/|$)/.test(relative)||/\.(?:pdf|mp3|wav|ogg|mp4|sqlite|db|pem|key)$/.test(relative))throw Error('Private or binary audio asset in public: '+relative);
  const bytes=await fs.readFile(filename),sha256=digest(bytes);extensions[suffix]=(extensions[suffix]||0)+1;
  if(suffix==='.json')JSON.parse(bytes.toString());
  if(['.js','.mjs'].includes(suffix)){
    const source=bytes.toString();
    if(/fixtureTextbooks|fullSections|server\/materials\/textbooks|25-17/.test(source))throw Error('Private textbook or old course title in public module: '+relative);
    for(const match of source.matchAll(/(?:from\s*|import\s*\(|import\s*)['"](\.[^'"]+)['"]/g))dependencies.push(path.resolve(path.dirname(filename),match[1].split(/[?#]/,1)[0]));
  }
  files.push({path:relative,bytes:bytes.length,sha256,sourceSha256:snapshot[relative]||null,modifiedForFreeDeployment:!!snapshot[relative]&&snapshot[relative]!==sha256});
}
for(const dependency of dependencies){const relative=path.relative(publicRoot,dependency);if(relative.startsWith('..')||!(await fs.stat(dependency)).isFile())throw Error('Missing public module dependency.');}
const bankFiles=files.filter(file=>/^data\/(?:listening\/)?(?:index\.json|passages\/[^/]+\.json)$/.test(file.path));
if(bankFiles.length!==969||bankFiles.some(file=>file.sha256!==file.sourceSha256))throw Error('The 969 original bank files must remain byte-identical.');
const reading=JSON.parse(await fs.readFile(path.join(publicRoot,'data/index.json'),'utf8'));
const listening=JSON.parse(await fs.readFile(path.join(publicRoot,'data/listening/index.json'),'utf8'));
const readingAdditions=JSON.parse(await fs.readFile(path.join(publicRoot,'data/reading-additions/index.json'),'utf8'));
for(const item of [...reading.passages,...readingAdditions.passages,...listening.passages])if(!(await fs.stat(path.join(publicRoot,item.file))).isFile())throw Error('Missing indexed passage: '+item.file);
const summary={fileCount:files.length,totalBytes:files.reduce((sum,file)=>sum+file.bytes,0),extensions,bankJsonFiles:bankFiles.length,bankJsonBytesUnchanged:true,originalReadingPassages:reading.passages.length,supplementaryReadingPassages:readingAdditions.passages.length,readingPassages:reading.passages.length+readingAdditions.passages.length,listeningSections:listening.passages.length,readyListeningAudio:listening.passages.filter(item=>item.audioStatus==='ready'||item.audio?.status==='ready').length,moduleImportsResolved:true,privateTextbooksPublic:false,audioBinaryFilesCopied:0,legacyAudioOrigin:'https://sls-reading-zac.b-cdn.net',changedFromSource:files.filter(file=>file.modifiedForFreeDeployment).map(file=>file.path),addedAssets:files.filter(file=>!file.sourceSha256).map(file=>file.path)};
await fs.writeFile(path.join(root,'public-assets-manifest.json'),JSON.stringify({schemaVersion:1,source:'stable-sls-ielts frontend',publicDirectory:'public',summary,files},null,2)+'\n');
console.log(JSON.stringify(summary));
