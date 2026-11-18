import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

/** Executes the generated migration in SQLite, with D1's async results and transactional batch contract. */
export function createD1Fixture() {
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys=ON');
  sqlite.exec(readFileSync(new URL('../../drizzle/0000_heavy_pet_avengers.sql',import.meta.url),'utf8'));
  class Statement {
    constructor(sql,args=[]) { this.sql=sql;this.args=args; }
    bind(...args) { if(args.some(value=>value===undefined))throw Error('D1 does not bind undefined');return new Statement(this.sql,args); }
    async first() { return sqlite.prepare(this.sql).get(...this.args)||null; }
    async all() { return this.execute(); }
    async run() { return this.execute(); }
    execute() {
      const statement=sqlite.prepare(this.sql);
      if(statement.columns().length)return {success:true,results:statement.all(...this.args),meta:{changes:0}};
      const result=statement.run(...this.args);return {success:true,results:[],meta:{changes:Number(result.changes)}};
    }
  }
  const db={sqlite,beforeBatch:null,prepare:sql=>new Statement(sql),async exec(sql){sqlite.exec(sql);return {count:1,duration:0};},async batch(statements) {
    if(db.beforeBatch)await db.beforeBatch(statements);
    sqlite.exec('BEGIN IMMEDIATE');
    try {const results=statements.map(statement=>statement.execute());sqlite.exec('COMMIT');return results;}
    catch(error){sqlite.exec('ROLLBACK');throw error;}
  }};
  return db;
}
export function createMemoryBucket() {
  const objects=new Map();
  const bucket={objects,onPut:null,async put(key,body,metadata={}) {
    objects.set(key,{bytes:Uint8Array.from(body),...metadata});
    if(bucket.onPut)await bucket.onPut(key);
    return {key,size:body.byteLength};
  },async get(key,options={}) {
    const item=objects.get(key);if(!item)return null;
    const data=options.range?item.bytes.slice(options.range.offset,options.range.offset+options.range.length):item.bytes;
    return {body:new Response(data).body,size:data.byteLength,arrayBuffer:async()=>data.slice().buffer};
  },async delete(key){objects.delete(key);},async head(key){const item=objects.get(key);return item?{size:item.bytes.length}:null;}};
  return bucket;
}
