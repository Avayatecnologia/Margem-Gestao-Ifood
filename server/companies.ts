import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { Store } from './store.ts';
import { companySchema,today,type Doc } from '../shared/schema.ts';
import { D,sum,money } from '../shared/finance.ts';

export function period(q:Doc){
 const from=q.from||today().slice(0,7)+'-01',to=q.to||today();
 const valid=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 if(!valid(from)||!valid(to)||from>to||D(to.slice(0,4)).minus(from.slice(0,4)).gt(100))throw Error('Período inválido ou superior a 100 anos');
 return {from,to};
}

/** Cadastro central + um banco independente por estabelecimento. O banco anterior não é movido. */
export class Companies{
 registry:DatabaseSync;stores=new Map<string,Store>();dir:string;primary:Store;
 constructor(dir:string,primary:Store){
  this.dir=dir;this.primary=primary;
  this.stores.set('principal',primary);
  this.registry=new DatabaseSync(resolve(dir,'empresas.sqlite'));
  this.registry.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS companies(id TEXT PRIMARY KEY, body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS registry_migrations(version INTEGER PRIMARY KEY); INSERT OR IGNORE INTO registry_migrations VALUES(1);');
  if(!this.raw('principal'))this.registry.prepare('INSERT INTO companies VALUES(?,?)').run('principal',JSON.stringify({id:'principal',name:primary.list('settings')[0].name,legalName:'',document:'',contact:'',email:'',phone:'',notes:'Estabelecimento original — dados anteriores preservados.',active:true,createdAt:new Date().toISOString()}));
 }
 raw(id:string):Doc|undefined{const row=this.registry.prepare('SELECT body FROM companies WHERE id=?').get(id) as {body:string}|undefined;return row?JSON.parse(row.body):undefined;}
 get(id:string):Store{
  if(!this.raw(id))throw Error('Estabelecimento inexistente. Selecione uma empresa cadastrada.');
  let s=this.stores.get(id);if(!s){s=new Store(resolve(this.dir,'companies',id));this.stores.set(id,s);}return s;
 }
 list():Doc[]{return (this.registry.prepare('SELECT id,body FROM companies ORDER BY rowid').all() as {id:string,body:string}[]).map(row=>({...JSON.parse(row.body),name:this.get(row.id).list('settings')[0].name}));}
 save(input:Doc):Doc{
  const parsed=companySchema.parse(input),id=input.id||randomUUID(),old=this.raw(id);
  if(input.id&&!old)throw Error('Empresa inexistente');
  if(!parsed.active&&!this.list().some(c=>c.id!==id&&c.active))throw Error('Mantenha pelo menos um estabelecimento ativo');
  if(parsed.document&&this.list().some(c=>c.id!==id&&c.document.replace(/\D/g,'')===parsed.document.replace(/\D/g,'')&&parsed.document.replace(/\D/g,'')))throw Error('Documento já cadastrado em outra empresa');
  const doc={...parsed,id,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  // Identificadores novos são gerados no servidor; nenhum caminho vem do navegador.
  const s=old?this.get(id):new Store(resolve(this.dir,'companies',id));
  try{s.transaction(()=>s.save('settings',{...s.list('settings')[0],name:parsed.name}));this.registry.prepare('INSERT INTO companies VALUES(?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(id,JSON.stringify(doc));this.stores.set(id,s);return doc;}
  catch(e){if(!old)s.db.close();throw e;}
 }
 selected(id:string,write=false):Store{const c=this.raw(id);if(!c)throw Error('Estabelecimento inexistente');if(write&&!c.active)throw Error('Empresa arquivada: reative em Empresas para alterar seus dados');return this.get(id);}
 summary(from:string,to:string,includeArchived=false){
  const rows=this.list().filter(c=>includeArchived||c.active).map(c=>{
   const r=this.get(c.id).report(from,to);return {company:c.id,name:c.name,document:c.document,active:c.active,orders:r.orders,expected:r.expected,revenue:r.revenue,fees:r.fees,cost:r.cost,contribution:r.contribution,fixed:r.fixed,operating:r.operating,operatingMargin:r.revenue>0?D(r.operating!).div(r.revenue).mul(100).toNumber():null};
  }).sort((a,b)=>D(b.operating!).comparedTo(a.operating!));
  const totals:Doc={};for(const key of ['orders','expected','revenue','fees','cost','contribution','fixed','operating'])totals[key]=money(sum(rows.map(r=>(r as Doc)[key])));
  totals.operatingMargin=totals.revenue>0?D(totals.operating).div(totals.revenue).mul(100).toNumber():null;
  return {from,to,includeArchived,rows,totals};
 }
 backup(id:string){const c=this.list().find(c=>c.id===id);if(!c)throw Error('Empresa inexistente');return {...this.get(id).backup(),company:{id:c.id,name:c.name,profile:c}};}
 restore(id:string,backup:any){
  if(backup?.company?.id&&backup.company.id!==id)throw Error('Backup pertence a outro estabelecimento. Selecione a empresa de origem para restaurar.');
  const profile=backup?.company?.profile?companySchema.parse(backup.company.profile):null;
  this.selected(id,true).restore(backup);
  if(profile){const old=this.raw(id)!;this.registry.prepare('UPDATE companies SET body=? WHERE id=?').run(JSON.stringify({...old,...profile,id,active:old.active,updatedAt:new Date().toISOString()}),id);}
 }
 close(){for(const s of this.stores.values())s.db.close();this.registry.close();}
}
