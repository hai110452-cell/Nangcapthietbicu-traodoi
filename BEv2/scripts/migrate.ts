import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readFile } from 'fs/promises';
import { join } from 'path';
async function main(){
 const url=process.env.DATABASE_URL;if(!url)throw new Error('Thiếu DATABASE_URL trong .env');
 const ds=new DataSource({type:'postgres',url,synchronize:false,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:false}:false,entities:[],migrations:[]});
 await ds.initialize();
 try { const sql=await readFile(join(process.cwd(),'migrations','001_initial_schema.sql'),'utf8'); await ds.query(sql); console.log('Migration 001_initial_schema.sql đã chạy thành công.'); }
 finally {await ds.destroy();}
}
main().catch(e=>{console.error('Migration thất bại:',e.message);process.exit(1);});
