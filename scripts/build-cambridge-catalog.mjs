import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const directory=path.join(root,'public/data/cambridge');
const source=JSON.parse(await fs.readFile(path.join(directory,'source-catalog.json'),'utf8'));
let previous={passages:[]};
try{previous=JSON.parse(await fs.readFile(path.join(directory,'index.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const previousById=new Map((previous.passages||[]).map(item=>[item.id,item]));
const passages=[];
const volumes=source.volumes.filter(volume=>volume.volume>=5&&volume.volume<=20).map(volume=>({
  volume:volume.volume,title:`剑桥雅思 ${volume.volume}`,sourceId:volume.sourceId,
  tests:volume.tests.map(test=>{
    const result={testNumber:test.testNumber,title:test.name,sourceId:test.sourceId,reading:[],listening:[]};
    for(const subject of test.subjects){
      if(!['reading','listening'].includes(subject.subject))continue;
      for(const section of subject.parts){
        const id=`cambridge-${volume.volume}-test-${test.testNumber}-${subject.subject}-${section.part}`;
        const old=previousById.get(id);
        const item={id,title:`剑${volume.volume} ${test.name} ${subject.subject==='listening'?'Listening':'Reading'} Part ${section.part}`,
          subject:subject.subject,part:section.part,questionCount:0,types:[],status:'pending',file:null,
          source:'剑桥雅思',sourceQuestionId:section.sourceQuestionId,sourceUrl:section.sourcePreviewUrl,
          cambridge:{volume:volume.volume,test:test.testNumber}};
        if(subject.subject==='listening'){item.audioStatus='pending';item.audio={src:'',status:'pending'};}
        // Preserve only previously imported files that still exist locally.
        if(old?.file&&old.status==='ready'&&String(old.sourceQuestionId)===String(section.sourceQuestionId)){
          const filename=path.resolve(root,'public',old.file);
          const allowed=path.join(root,'public/data/cambridge/passages')+path.sep;
          if(!filename.startsWith(allowed))throw Error('Invalid Cambridge passage path: '+old.file);
          if(!existsSync(filename))throw Error('Missing imported Cambridge passage: '+old.file);
          Object.assign(item,old,{sourceQuestionId:section.sourceQuestionId,sourceUrl:section.sourcePreviewUrl,cambridge:item.cambridge});
        }
        result[subject.subject].push(item);passages.push(item);
      }
    }
    return result;
  })
}));
for(let volume=5;volume<=20;volume++)if(!volumes.some(item=>item.volume===volume))volumes.push({volume,title:`剑桥雅思 ${volume}`,status:'source_unavailable',note:'来源暂未列出本册，材料待补齐。',tests:[]});
volumes.sort((a,b)=>a.volume-b.volume);
const index={version:1,updatedAt:source.retrievedAt,sourceUrl:source.sourceUrl,
  migrationStatus:'awaiting_source_login',variantLabel:source.variantLabel,
  note:'已核对来源目录；题目、答案与音频尚未完成导入。',
  summary:{requestedVolumes:16,sourceVolumes:source.availableVolumes.length,testCount:volumes.reduce((count,volume)=>count+volume.tests.length,0),
    readingParts:passages.filter(item=>item.subject==='reading').length,listeningParts:passages.filter(item=>item.subject==='listening').length,
    importedParts:passages.filter(item=>item.status==='ready').length},volumes,passages};
await fs.writeFile(path.join(directory,'index.json'),JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify(index.summary));
