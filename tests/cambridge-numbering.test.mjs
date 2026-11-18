import test from 'node:test';
import assert from 'node:assert/strict';
import {questionsOf} from '../public/core.js';
import {questionsOf as moduleQuestionsOf} from '../public/core.mjs';

const passage=(id,part,start,count,cambridge=true)=>({id,part,subject:'reading',...(cambridge?{cambridge:{volume:5,test:1}}:{}),groups:[{type:'text',questions:Array.from({length:count},(_,i)=>({id:i+1,sourceSlot:start+i,answers:['answer']}))}]});

for(const [name,questions] of [['browser',questionsOf],['module',moduleQuestionsOf]]){
  test(name+' Cambridge single passage retains original question numbers',()=>{
    const result=questions([passage('p2',2,14,13)]);
    assert.deepEqual(result.map(item=>item.displayNumber),Array.from({length:13},(_,i)=>14+i));
    assert.deepEqual(result.map(item=>item.number),Array.from({length:13},(_,i)=>1+i));
  });
  test(name+' ordinary single passage keeps its existing sequential numbering',()=>{
    const result=questions([passage('ordinary',2,14,13,false)]);
    assert.deepEqual(result.map(item=>item.displayNumber),Array.from({length:13},(_,i)=>1+i));
  });
  test(name+' complete Cambridge reading test retains questions 1–40',()=>{
    const result=questions([passage('p1',1,1,13),passage('p2',2,14,13),passage('p3',3,27,14)]);
    assert.deepEqual(result.map(item=>item.displayNumber),Array.from({length:40},(_,i)=>1+i));
  });
  test(name+' invalid Cambridge source numbers fall back to sequential numbering',()=>{
    const p=passage('invalid',1,1,3);p.groups[0].questions.forEach((q,i)=>q.sourceSlot=[0,201,'3'][i]);
    assert.deepEqual(questions([p]).map(item=>item.displayNumber),[1,2,3]);
  });
}
