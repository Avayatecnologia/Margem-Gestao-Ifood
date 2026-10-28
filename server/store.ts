import { DatabaseSync } from 'node:sqlite';
import { mkdirSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { schemas,today,type Kind,type Doc } from '../shared/schema.ts';
import { calculate,productCost,ingredientCost,D,sum,allocate } from '../shared/finance.ts';
import { validatePlanOrder } from '../shared/ifood.ts';
export const kinds=Object.keys(schemas) as Kind[];
export class Store{
 db:DatabaseSync;dir:string;
 constructor(dir:string){this.dir=resolve(dir);mkdirSync(this.dir,{recursive:true});this.db=new DatabaseSync(resolve(this.dir,'gestao.sqlite'));this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY); INSERT OR IGNORE INTO migrations VALUES(1); CREATE TABLE IF NOT EXISTS documents(kind TEXT NOT NULL,id TEXT NOT NULL,body TEXT NOT NULL,PRIMARY KEY(kind,id)); CREATE TABLE IF NOT EXISTS history(seq INTEGER PRIMARY KEY AUTOINCREMENT,kind TEXT,id TEXT,body TEXT,at TEXT);`);
 if(!this.list('settings').length)this.save('settings',{name:'Meu estabelecimento',orders:300,units:600,margin:20,allocation:'units'});
 if(!this.list('channels').length)for(const name of ['iFood','99','Venda direta'])this.save('channels',{name});}
 list(kind:Kind):Doc[]{return (this.db.prepare('SELECT body FROM documents WHERE kind=? ORDER BY rowid').all(kind) as {body:string}[]).map(r=>JSON.parse(r.body));}
 all(){return Object.fromEntries(kinds.map(k=>[k,this.list(k)])) as Record<Kind,Doc[]>;}
 transaction<T>(fn:()=>T):T{this.db.exec('BEGIN IMMEDIATE');try{const r=fn();this.db.exec('COMMIT');return r;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 save(kind:Kind,input:Doc):Doc{
 const parsed=schemas[kind].parse(input) as Doc;const id=kind==='settings'?'company':input.id||randomUUID();const old=this.list(kind).find(d=>d.id===id);const all=this.all();
 if(input.id&&!old)throw Error('Registro não pertence a este estabelecimento ou não existe');
 if(['orders','adjustments','reconciliations','prices','confirmations'].includes(kind)&&old)throw Error('Registro histórico imutável. Crie uma nova versão ou ajuste.');
 const doc={...parsed,id,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()} as Doc;
 const ref=(k:Kind,v:string)=>{const d=all[k].find(x=>x.id===v);if(!d)throw Error(`Referência inexistente: ${k}`);return d;};
 if(kind==='ingredients')ingredientCost(doc as any);
 if(kind==='expenses'&&doc.to&&doc.to<doc.from)throw Error('Vigência final anterior à inicial');
 if(kind==='products'){
 if(all.products.some(p=>p.code===doc.code&&p.id!==id))throw Error('Código de produto já cadastrado');
 if(doc.mode==='manual'&&doc.components.length)throw Error('Custo manual não pode conter componentes');
 const next={...all,products:[...all.products.filter(p=>p.id!==id),doc]};if(doc.mode==='recipe')productCost(id,next);
 }
 if(kind==='plans'){
 ref('channels',doc.channel);if(doc.to&&doc.to<doc.from)throw Error('Vigência final anterior à inicial');
 if(old&&JSON.stringify(old)!==JSON.stringify(doc))throw Error('Crie uma nova versão do plano com nova vigência.');
 if(all.plans.some(p=>p.channel===doc.channel&&p.name===doc.name&&p.id!==id&&p.from<=(doc.to||'9999-12-31')&&doc.from<=(p.to||'9999-12-31')))throw Error('Vigências sobrepostas para o mesmo plano');
 }
 if(kind==='prices'){ref('products',doc.product);ref('plans',doc.plan);if(doc.promo!==undefined&&(!doc.from||!doc.to||doc.to<doc.from))throw Error('Promoção exige início e fim válidos');doc.costSnapshot=productCost(doc.product,all).unit.toString();}
 if(kind==='orders'){
 if(new Set(doc.items.map((i:Doc)=>i.product)).size!==doc.items.length)throw Error('Consolide as quantidades do mesmo produto em uma única linha');
 if(all.orders.some(o=>o.external===doc.external))throw Error('Identificador externo já importado');const plan=ref('plans',doc.plan);
 validatePlanOrder(plan,input);
 if(doc.date<plan.from||plan.to&&doc.date>plan.to)throw Error('Plano fora da vigência na data do pedido');
 const costs=doc.items.map((i:Doc)=>{const p=ref('products',i.product);if(!p.active)throw Error('Produto arquivado');const c=productCost(i.product,all);return {unit:c.unit.toString(),order:c.order.toString()};});
 if(doc.confirmed&&doc.actualFees===undefined)throw Error('Informe as taxas efetivas para confirmar o resultado realizado');
 doc.snapshot={...calculate(doc as any,plan.rules,costs),costs,plan:structuredClone(plan),names:doc.items.map((i:Doc)=>ref('products',i.product).name),categories:doc.items.map((i:Doc)=>ref('products',i.product).category)};
 }
 if(kind==='confirmations'){const o=ref('orders',doc.order);if(doc.date<o.date||sum(all.adjustments.filter(a=>a.order===o.id).map(a=>a.feesReturned)).gt(doc.actualFees))throw Error('Conferência anterior à venda ou taxas inferiores às já devolvidas');doc.snapshot={...o.snapshot,...calculate({...o,actualFees:doc.actualFees} as any,o.snapshot.plan.rules,o.snapshot.costs)};}
 if(kind==='adjustments'){
 const raw=ref('orders',doc.order);const latest=all.confirmations.filter(c=>c.order===doc.order).at(-1);const o=latest?{...raw,snapshot:latest.snapshot}:raw;const a=all.adjustments.filter(a=>a.order===doc.order);
 if(sum(a.map(a=>a.refund)).plus(doc.refund).gt(o.snapshot.revenue)||sum(a.map(a=>a.feesReturned)).plus(doc.feesReturned).gt(o.snapshot.fees)||sum(a.map(a=>a.costRecovered)).plus(doc.costRecovered).gt(o.snapshot.cost))throw Error('Ajustes acumulados excedem receita, taxas ou custos originais');
 }
 if(kind==='reconciliations')ref('orders',doc.order);
 const put=()=>{this.db.prepare('INSERT INTO history(kind,id,body,at) VALUES(?,?,?,?)').run(kind,id,JSON.stringify(doc),doc.updatedAt);this.db.prepare('INSERT INTO documents(kind,id,body) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET body=excluded.body').run(kind,id,JSON.stringify(doc));};put();return doc;
 }
 backup(){return {format:'margem-backup',version:1,at:new Date().toISOString(),documents:this.all(),history:this.db.prepare('SELECT * FROM history').all()};}
 restore(b:any){if(b?.format!=='margem-backup'||b.version!==1||!b.documents||!Array.isArray(b.history))throw Error('Backup inválido ou incompatível');
 for(const k of kinds){if(!Array.isArray(b.documents[k]))throw Error(`Coleção ausente: ${k}`);const ids=new Set();for(const d of b.documents[k]){schemas[k].parse(d);if(typeof d.id!=='string'||ids.has(d.id))throw Error('Identificador inválido ou duplicado');ids.add(d.id);if(k==='orders'&&(!d.snapshot||d.snapshot.engine!=='1.0'))throw Error('Snapshot inválido');}}
 const docs=b.documents as Record<Kind,Doc[]>;const has=(k:Kind,id:string)=>{if(!docs[k].some(d=>d.id===id))throw Error('Backup com referência órfã');};
 for(const p of docs.products)if(p.mode==='recipe')productCost(p.id,docs);
 for(const i of docs.ingredients)ingredientCost(i as any);
 for(const p of docs.plans)has('channels',p.channel);
 for(const p of docs.prices){has('products',p.product);has('plans',p.plan);}
 const validateSnapshot=(o:Doc,s:Doc)=>{if(!s||!Array.isArray(s.costs)||s.costs.length!==o.items.length)throw Error('Custos históricos inválidos');for(const c of s.costs)if(!D(c.unit).isFinite()||D(c.unit).lt(0)||!D(c.order).isFinite()||D(c.order).lt(0))throw Error('Custo histórico inválido');const plan=schemas.plans.parse(s.plan);const expected=calculate(o as any,plan.rules,s.costs);for(const k of ['gross','customer','revenue','fees','cost','contribution','receivable'] as const)if(!D(s[k]).eq(expected[k]))throw Error('Totais históricos inconsistentes no backup');};
 for(const o of docs.orders){has('plans',o.plan);for(const i of o.items)has('products',i.product);validateSnapshot(o,o.snapshot);}
 for(const k of ['adjustments','reconciliations','confirmations'] as Kind[])for(const x of docs[k])has('orders',x.order);
 for(const c of docs.confirmations){const o=docs.orders.find(o=>o.id===c.order)!;validateSnapshot({...o,actualFees:c.actualFees},c.snapshot);}
 mkdirSync(resolve(this.dir,'backups'),{recursive:true});writeFileSync(resolve(this.dir,'backups',`antes-restauracao-${Date.now()}.json`),JSON.stringify(this.backup()));
 this.transaction(()=>{this.db.exec('DELETE FROM documents; DELETE FROM history;');const put=this.db.prepare('INSERT INTO documents VALUES(?,?,?)');for(const k of kinds)for(const d of b.documents[k])put.run(k,d.id,JSON.stringify(d));const h=this.db.prepare('INSERT INTO history(kind,id,body,at) VALUES(?,?,?,?)');for(const r of b.history){if(!kinds.includes(r.kind)||typeof r.body!=='string'||typeof r.at!=='string')throw Error('Histórico inválido');JSON.parse(r.body);h.run(r.kind,r.id,r.body,r.at);}});
 }
 report(from:string,to:string,channel='',category=''){
 const all=this.all();const orders=all.orders.filter(o=>o.date>=from&&o.date<=to&&(!channel||o.snapshot.plan.channel===channel)).map(o=>{const c=all.confirmations.filter(c=>c.order===o.id&&c.date<=to).at(-1);return c?{...o,snapshot:c.snapshot,confirmed:true}:o;});
 let revenue=D(0),fees=D(0),cost=D(0),contribution=D(0);const rows:Doc[]=[];
 for(const o of orders){const adjustments=all.adjustments.filter(a=>a.order===o.id&&a.date<=to);const refund=sum(adjustments.map(a=>a.refund)),returned=sum(adjustments.map(a=>a.feesReturned)),recovered=sum(adjustments.map(a=>a.costRecovered));
 // Ajustes são atribuídos ao pedido de origem; a interface informa essa política.
 const items=o.snapshot.items;const weights=items.map((i:Doc)=>o.allocation==='quantity'?i.quantity:i.revenue);const refunds=allocate(refund,weights),returns=allocate(returned,weights),recoveries=allocate(recovered,weights);
 items.forEach((i:Doc,n:number)=>{const p=all.products.find(p=>p.id===i.product);if(category&&(o.snapshot.categories?.[n]??p?.category)!==category)return;const r=D(i.revenue).minus(refunds[n]),f=D(i.fees).minus(returns[n]),c=D(i.cost).minus(recoveries[n]),mc=r.minus(f).minus(c);revenue=revenue.plus(r);fees=fees.plus(f);cost=cost.plus(c);contribution=contribution.plus(mc);rows.push({productId:i.product,channelId:o.snapshot.plan.channel,product:o.snapshot.names[n],channel:all.channels.find(c=>c.id===o.snapshot.plan.channel)?.name,quantity:i.quantity,revenue:r.toNumber(),fees:f.toNumber(),cost:c.toNumber(),contribution:mc.toNumber(),confirmed:o.confirmed});});}
 const months=new Set<string>();let cur=new Date(from+'T12:00:00Z');while(cur.toISOString().slice(0,10)<=to&&months.size<1200){months.add(cur.toISOString().slice(0,7));cur.setUTCMonth(cur.getUTCMonth()+1,1);}
 let fixed=D(0);for(const month of months){const start=month+'-01',end=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).toISOString().slice(0,10);fixed=fixed.plus(sum(all.expenses.filter(e=>e.active&&e.from<=end&&(!e.to||e.to>=start)).map(e=>e.amount)));}
 const margin=revenue.gt(0)?contribution.div(revenue):null;
 const units=sum(rows.map(r=>r.quantity));
 return {orders:orders.length,expected:orders.filter(o=>!o.confirmed).length,revenue:revenue.toNumber(),fees:fees.toNumber(),cost:cost.toNumber(),contribution:contribution.toNumber(),fixed:fixed.toNumber(),operating:channel||category?null:contribution.minus(fixed).toNumber(),breakEven:margin?.gt(0)?fixed.div(margin).toNumber():null,breakEvenUnits:contribution.gt(0)?fixed.mul(units).div(contribution).ceil().toNumber():null,rows};
 }
}
