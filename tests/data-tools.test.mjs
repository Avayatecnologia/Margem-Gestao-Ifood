import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {snapshot,verify} from '../scripts/data-tools.mjs';

test('backup físico mantém registros, rejeita cópia alterada e importação sobre dados existentes',()=>{
 const root=fs.mkdtempSync(path.join(tmpdir(),'margem-backup-'));const source=path.join(root,'source'),dest=path.join(root,'dest'),out=path.join(root,'export');fs.mkdirSync(source);
 try{
 for(const name of ['gestao.sqlite','empresas.sqlite']){const db=new DatabaseSync(path.join(source,name));db.exec("CREATE TABLE dados(id INTEGER PRIMARY KEY, nome TEXT); INSERT INTO dados VALUES(1,'Conferência de cópia');");db.close();}
 const expected=snapshot(source);fs.cpSync(source,dest,{recursive:true});assert.deepEqual(verify(dest,expected),expected);
 const db=new DatabaseSync(path.join(dest,'gestao.sqlite'));db.exec("UPDATE dados SET nome='Alterado'");db.close();assert.throws(()=>verify(dest,expected),/difere/);
 const tool=path.resolve('scripts/data-tools.mjs');execFileSync(process.execPath,[tool,'export',source,out]);const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));assert.equal(manifest.databases.length,2);assert.deepEqual(verify(path.join(out,'data'),manifest.databases),expected);
 assert.throws(()=>execFileSync(process.execPath,[tool,'import',source,dest],{env:{...process.env,DATA_DIR:dest},stdio:'pipe'}));assert.throws(()=>execFileSync(process.execPath,[tool,'export',source,out],{stdio:'pipe'}));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
