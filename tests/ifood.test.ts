import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createApp} from '../server/app.ts';import {today} from '../shared/schema.ts';

test('referências iFood: importação por empresa, frete grátis, pagamento e despesas sem duplicidade',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'margem-ifood-'));const {app}=createApp(dir);await app.ready();
 const call=async(path:string,body?:any,company='principal',status=200)=>{const r=await app.inject({method:body===undefined?'GET':'POST',url:'/api/'+path,payload:body,headers:{'x-company-id':company}});assert.equal(r.statusCode,status,r.body);return r.json();};
 try{
 const second=await call('companies',{name:'Outro cliente'});const state=await call('state');const custom=await call('save/plans',{name:'Contrato que deve ser preservado',channel:state.channels[0].id,from:'2020-01-01',rules:[]});
 await call('references/ifood',{},'principal',400);const imported=await call('references/ifood',{confirm:true});assert.equal(imported.created,4);assert.equal(imported.expenses,2);assert.equal(imported.reference.checkedOn,'2026-10-28');
 let current=await call('state');assert.equal(current.plans.length,5);assert.deepEqual(current.plans.find((p:any)=>p.id===custom.id).rules,[]);assert.equal(current.expenses.filter((e:any)=>e.active).length,0);assert.deepEqual(current.expenses.map((e:any)=>e.amount),[110,150]);
 const repeat=await call('references/ifood',{confirm:true});assert.equal(repeat.created,0);assert.equal(repeat.existing,4);assert.equal(repeat.expenses,0);assert.equal((await call('state',undefined,second.id)).plans.length,0);
 const product=await call('save/products',{name:'Teste',code:'T',mode:'manual',cost:10});const plans=imported.plans;const basic=plans.find((p:any)=>p.delivery==='Própria'&&p.shippingPolicy==='standard'),free=plans.find((p:any)=>p.delivery==='Própria'&&p.shippingPolicy==='freeCustomer'),partner=plans.find((p:any)=>p.delivery==='Parceiros iFood'&&p.shippingPolicy==='standard'),partnerFree=plans.find((p:any)=>p.delivery==='Parceiros iFood'&&p.shippingPolicy==='freeCustomer');
 const order=(plan:any,extra:any={})=>({external:'TESTE',date:today(),plan:plan.id,payment:'Online',delivery:plan.delivery,items:[{product:product.id,quantity:1,price:20}],freight:0,ownFreight:false,...extra});
 const calc=async(plan:any,extra:any={})=>(await call('simulate',{order:order(plan,extra)})).result;
 assert.equal((await calc(basic,{deliveryCost:5})).contribution,1.96);assert.equal((await calc(free,{deliveryCost:5})).contribution,1.96);assert.equal((await calc(partner)).contribution,4.76);assert.equal((await calc(partnerFree,{deliveryCost:3})).contribution,1.76);
 assert.equal((await calc(basic,{deliveryCost:5,payment:'Na entrega'})).fees,2.4);assert.equal((await calc(basic,{deliveryCost:5,freight:5,ownFreight:true})).fees,3.04);
 await call('simulate',{order:order(free)},'principal',400);await call('simulate',{order:order(free,{deliveryCost:5,freight:1})},'principal',400);await call('save/orders',order(free),'principal',400);
 const suggested=await call('simulate',{order:order(free,{deliveryCost:5}),suggest:true,margin:20});assert.ok(suggested.result.margin>=20);assert.ok(suggested.price>20);
 const saved=await call('save/orders',order(free,{external:'FREE-001',deliveryCost:5}));assert.equal(saved.snapshot.contribution,1.96);assert.equal(saved.snapshot.plan.reference.provider,'ifood');
 const report=await call('report?from='+today()+'&to='+today());assert.equal(report.fixed,0);assert.equal(report.contribution,1.96);
 const backup=await call('backup');await call('restore',{confirm:'SUBSTITUIR',backup});current=await call('state');assert.equal(current.plans.find((p:any)=>p.id===free.id).shippingPolicy,'freeCustomer');
 const matrix=await call('pricing');assert.match(matrix.find((p:any)=>p.plan===free.id).warning,/custo da entrega/);assert.equal(matrix.find((p:any)=>p.plan===free.id).suggested,undefined);
 }finally{await app.close();rmSync(dir,{recursive:true,force:true});}
});
