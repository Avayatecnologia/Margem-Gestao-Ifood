import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createApp} from '../server/app.ts';import {Store} from '../server/store.ts';import {today} from '../shared/schema.ts';

test('migração preserva dados antigos e separa toda a operação de cada cliente',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'margem-empresas-'));const legacy=new Store(dir);
 const original=legacy.save('products',{name:'Produto original',code:'COD-1',mode:'manual',cost:10});legacy.save('settings',{...legacy.list('settings')[0],name:'Empresa original'});legacy.db.close();
 let ctx=createApp(dir);await ctx.app.ready();
 const call=async(path:string,body?:any,company?:string,status=200)=>{const r=await ctx.app.inject({method:body===undefined?'GET':'POST',url:'/api/'+path,payload:body,headers:company?{'x-company-id':company}:{}});assert.equal(r.statusCode,status,r.body);return r.json();};
 try{
  assert.equal((await call('companies'))[0].name,'Empresa original');assert.equal((await call('state')).products[0].id,original.id);
  const a=await call('companies',{name:'Cliente A',document:'11.111.111/0001-11',contact:'Ana'}),b=await call('companies',{name:'Cliente B',document:'22.222.222/0001-22'});
  const [sa,sb]=await Promise.all([call('state',undefined,a.id),call('state',undefined,b.id)]);assert.equal(sa.products.length,0);assert.equal(sb.products.length,0);assert.equal(sa.settings[0].name,'Cliente A');assert.equal(sb.channels.length,3);
  const pa=await call('save/products',{name:'Produto A',code:'COD-1',mode:'manual',cost:40},a.id);const pb=await call('save/products',{name:'Produto B',code:'COD-1',mode:'manual',cost:60},b.id);
  const planA=await call('save/plans',{name:'Contrato',channel:sa.channels[0].id,from:'2020-01-01',rules:[{name:'Taxa',type:'percent',value:20,scope:'order',base:'gross'}]},a.id);
  const planB=await call('save/plans',{name:'Contrato',channel:sb.channels[0].id,from:'2020-01-01',rules:[{name:'Taxa',type:'percent',value:10,scope:'order',base:'gross'}]},b.id);
  const oa=await call('save/orders',{external:'PED-1',date:today(),plan:planA.id,confirmed:true,actualFees:20,items:[{product:pa.id,quantity:1,price:100}]},a.id);
  const ob=await call('save/orders',{external:'PED-1',date:today(),plan:planB.id,items:[{product:pb.id,quantity:1,price:100}]},b.id);
  await call('save/expenses',{name:'Fixo',amount:10,from:'2020-01-01'},a.id);await call('save/expenses',{name:'Fixo',amount:5,from:'2020-01-01'},b.id);
  const suffix='?from='+today().slice(0,7)+'-01&to='+today();const [ra,rb]=await Promise.all([call('report'+suffix,undefined,a.id),call('report'+suffix,undefined,b.id)]);assert.equal(ra.operating,30);assert.equal(rb.operating,25);assert.equal(ra.rows[0].product,'Produto A');assert.equal(rb.rows[0].product,'Produto B');
  const summary=await call('companies/report'+suffix);assert.equal(summary.totals.operating,55);assert.equal(summary.totals.revenue,200);assert.equal(summary.totals.expected,1);assert.equal(summary.rows.find((r:any)=>r.company===a.id).operatingMargin,30);
  // Tentativas de usar produtos, planos, pedidos e históricos de outro estabelecimento.
  await call('save/products',{...pa,name:'Tentativa'},b.id,400);await call('save/prices',{product:pa.id,plan:planB.id,price:100,margin:20},b.id,400);
  await call('save/orders',{external:'INV',date:today(),plan:planA.id,items:[{product:pa.id,quantity:1,price:100}]},b.id,400);
  await call('simulate',{order:{external:'SIM',date:today(),plan:planA.id,items:[{product:pa.id,quantity:1,price:100}]}},b.id,400);
  await call('save/confirmations',{order:oa.id,date:today(),actualFees:1},b.id,400);await call('save/adjustments',{order:oa.id,date:today(),name:'Inválido',kind:'partial',refund:1,feesReturned:0,costRecovered:0},b.id,400);await call('save/reconciliations',{order:oa.id,date:today(),amount:80},b.id,400);
  assert.deepEqual(await call('history/products/'+pa.id,undefined,b.id),[]);const exported=await ctx.app.inject('/api/export/products?company='+b.id);assert.match(exported.body,/Produto B/);assert.doesNotMatch(exported.body,/Produto A/);
  await call('state',undefined,'../../fora',400);await call('state?company='+b.id,undefined,a.id,400);
  const backup=await call('backup',undefined,a.id);assert.equal(backup.company.id,a.id);assert.equal(backup.documents.orders.length,1);await call('restore',{confirm:'SUBSTITUIR',backup},b.id,400);await call('restore',{confirm:'SUBSTITUIR',backup},a.id);assert.equal((await call('state',undefined,b.id)).orders[0].id,ob.id);
  await call('companies',{...a,name:'Cliente A revisado',contact:'Maria'});assert.equal((await call('state',undefined,a.id)).settings[0].name,'Cliente A revisado');assert.equal((await call('state',undefined,b.id)).settings[0].name,'Cliente B');
  await call('companies',{...b,active:false});await call('save/products',{name:'Bloqueado',code:'X',mode:'manual',cost:1},b.id,400);assert.equal((await call('state',undefined,b.id)).orders.length,1);
  assert.equal((await call('companies/report'+suffix)).totals.operating,30);assert.equal((await call('companies/report'+suffix+'&archived=true')).totals.operating,55);
  await call('companies',{...b,active:true});
  const imp={kind:'products',csv:'name;code;mode;cost\nImportado;IMP;manual;2,50',confirm:true};await call('import/commit',imp,a.id);assert.equal((await call('state',undefined,a.id)).products.length,2);assert.equal((await call('state',undefined,b.id)).products.length,1);
  await ctx.app.close();ctx=createApp(dir);await ctx.app.ready();assert.equal((await call('companies')).length,3);assert.equal((await call('state',undefined,a.id)).products.length,2);assert.equal((await call('state',undefined,b.id)).orders[0].external,'PED-1');assert.equal((await call('state')).products[0].id,original.id);
 }finally{await ctx.app.close();rmSync(dir,{recursive:true,force:true});}
});

test('empresa válida, último estabelecimento ativo e documento duplicado',async()=>{const dir=mkdtempSync(join(tmpdir(),'margem-registry-'));const {app}=createApp(dir);try{
 const save=async(b:any,status=200)=>{const r=await app.inject({method:'POST',url:'/api/companies',payload:b});assert.equal(r.statusCode,status,r.body);return r.json();};
 await save({id:'principal',name:'Original',active:false},400);await save({id:'inventado',name:'Não existe'},400);await save({name:''},400);await save({name:'Inválida',email:'texto'},400);
 await save({name:'Documento',document:'123.456'});await save({name:'Duplicada',document:'123456'},400);
 const r=await app.inject('/api/companies/report?from=2026-02-31&to=2026-03-01');assert.equal(r.statusCode,400);
 }finally{await app.close();rmSync(dir,{recursive:true,force:true});}});
