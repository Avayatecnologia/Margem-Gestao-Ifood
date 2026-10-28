import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import Papa from 'papaparse';
import { Store,kinds } from './store.ts';
import { Companies,period } from './companies.ts';
import { schemas,today,type Kind,type Doc } from '../shared/schema.ts';
import { productCost,suggest,calculate,D,sum } from '../shared/finance.ts';
import { ifoodPlans,ifoodReference,needsDeliveryCost,validatePlanOrder } from '../shared/ifood.ts';
export function createApp(dir=process.env.DATA_DIR||'data'){
 const primary=new Store(dir);const companies=new Companies(dir,primary);const app=Fastify({bodyLimit:20*1024*1024});
 const scoped=(req:any,write=false)=>{const h=req.headers['x-company-id'],q=req.query?.company;if(h&&q&&h!==q)throw Error('Empresa conflitante na requisição');const id=h??q??'principal';if(typeof id!=='string')throw Error('Empresa inválida');return companies.selected(id,write);};
 const companyId=(req:any)=>String(req.headers['x-company-id']??req.query?.company??'principal');
 app.addHook('onRequest',async(req,reply)=>{const origin=req.headers.origin;const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)||origin&&!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))return reply.code(403).send({error:'Origem não permitida'});});
 app.setErrorHandler((e:any,_req,reply)=>reply.code(400).send({error:e.issues?e.issues.map((i:any)=>`${i.path.join('.')}: ${i.message}`).join('; '):e.message||'Não foi possível concluir'}));
 app.get('/api/health',()=>{primary.db.prepare('SELECT 1').get();companies.registry.prepare('SELECT 1').get();return {status:'ok',service:'margem'};});
 app.get('/api/state',req=>{const store=scoped(req);const a=store.all();return {...a,orders:a.orders.map(o=>{const c=a.confirmations.filter(c=>c.order===o.id).at(-1);return c?{...o,originalSnapshot:o.snapshot,snapshot:c.snapshot,confirmed:true}:o;}),costs:Object.fromEntries(a.products.map(p=>{try{const c=productCost(p.id,a);return [p.id,{unit:c.unit.toNumber(),order:c.order.toNumber()}];}catch(e){return [p.id,{error:(e as Error).message}];}}))};});
 app.post('/api/save/:kind',(req)=>{const store=scoped(req,true);const k=(req.params as any).kind as Kind;if(!kinds.includes(k))throw Error('Cadastro inválido');return store.transaction(()=>store.save(k,req.body as Doc));});
 app.get('/api/history/:kind/:id',req=>{const store=scoped(req);const {kind,id}=req.params as any;return store.db.prepare('SELECT body,at FROM history WHERE kind=? AND id=? ORDER BY seq DESC').all(kind,id);});
 app.get('/api/pricing',req=>{const store=scoped(req);const a=store.all(),cfg=a.settings[0],q=D(cfg.units).div(cfg.orders).toNumber();return a.products.filter(p=>p.active).flatMap(p=>a.plans.filter(plan=>plan.active&&plan.from<=today()&&(!plan.to||plan.to>=today())).map(plan=>{
 const price=a.prices.filter(r=>r.product===p.id&&r.plan===plan.id).at(-1);const current=price?(price.promo!==undefined&&price.from<=today()&&price.to>=today()?price.promo:price.price):null;
 const row:any={product:p.id,plan:plan.id,current,margin:price?.margin??cfg.margin,quantity:q};
 if(needsDeliveryCost(plan)){try{row.cost=productCost(p.id,a).unit.toNumber();}catch(e){row.warning=(e as Error).message;}row.warning=row.warning||'Informe o custo da entrega no simulador para calcular contribuição e preço';return row;}
 try{const cost=productCost(p.id,a),costs=[{unit:cost.unit.toString(),order:cost.order.toString()}];row.cost=cost.unit.toNumber();row.review=price&&!D(price.costSnapshot).eq(cost.unit);
 const order=schemas.orders.parse({external:'matrix',date:today(),plan:plan.id,payment:plan.payment,delivery:plan.delivery,items:[{product:p.id,quantity:q,price:current??0}]});
 if(current!==null){const r=calculate(order,plan.rules,costs);row.contribution=D(r.contribution).div(q).toNumber();row.actualMargin=r.margin;}
 try{row.suggested=suggest(order,plan.rules,costs,row.margin,0,'cent').price;}catch(e){row.warning=(e as Error).message;}
 }catch(e){row.warning=(e as Error).message;}return row;
 }));});
 app.post('/api/simulate',req=>{const store=scoped(req);
 const b=req.body as any;if(b.margin!==undefined&&(!Number.isFinite(b.margin)||b.margin<0||b.margin>=100)||b.increase!==undefined&&(!Number.isFinite(b.increase)||b.increase<0||b.increase>10000))throw Error('Margem ou aumento de custo inválido');const a=store.all(),o=schemas.orders.parse(b.order),p=a.plans.find(p=>p.id===o.plan);if(!p)throw Error('Selecione um plano');
 if(o.date<p.from||p.to&&o.date>p.to)throw Error('Plano fora da vigência na data da simulação');
 validatePlanOrder(p,b.order);
 const costs=o.items.map(i=>{const c=productCost(i.product,a);return {unit:c.unit.mul(b.increase?D(1).plus(D(b.increase).div(100)):1).toString(),order:c.order.toString()};});
 const settings=a.settings[0];const fixed=sum(a.expenses.filter(e=>e.active&&e.from<=o.date&&(!e.to||e.to>=o.date)).map(e=>e.amount));
 const units=settings.allocation==='units'?D(settings.units):D(settings.orders).mul(b.unitsPerOrder||1);const overhead=b.includeOverhead?fixed.div(units).toNumber():0;
 if(b.suggest)return suggest(o,p.rules,costs,Number(b.margin??settings.margin),overhead,b.rounding||'cent');
 return {result:calculate(o,p.rules,costs),overhead};
 });
 app.get('/api/report',req=>{const store=scoped(req),q=req.query as any;const {from,to}=period(q);return {...store.report(from,to,q.channel,q.category),company:companyId(req),companyName:store.list('settings')[0].name};});
 app.get('/api/backup',(req,reply)=>{scoped(req);return reply.header('Content-Disposition',`attachment; filename="margem-backup-${companyId(req)}.json"`).send(companies.backup(companyId(req)));});
 app.post('/api/restore',req=>{scoped(req,true);const b=req.body as any;if(b.confirm!=='SUBSTITUIR')throw Error('Confirmação necessária');companies.restore(companyId(req),b.backup);return {ok:true};});
 app.get('/api/export/:kind',(req,reply)=>{const store=scoped(req);const kind=(req.params as any).kind;let rows:any[];if(kind==='report'){const q=req.query as any;rows=store.report(q.from||today().slice(0,7)+'-01',q.to||today(),q.channel,q.category).rows;}else if(kinds.includes(kind))rows=store.list(kind);else throw Error('Cadastro inválido');return reply.type('text/csv; charset=utf-8').header('Content-Disposition',`attachment; filename="${kind}.csv"`).send('\uFEFF'+Papa.unparse(rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,typeof v==='object'?JSON.stringify(v):v]))),{delimiter:';',escapeFormulae:true}));});
 const preview=(body:any)=>{const {kind,csv,mapping={}}=body;if(!['ingredients','products','orders'].includes(kind))throw Error('Importação disponível para insumos, produtos e vendas');const parsed=Papa.parse<Doc>(csv,{header:true,delimiter:';',skipEmptyLines:'greedy'});if(parsed.errors.length)throw Error(parsed.errors[0].message);if(parsed.data.length>5000)throw Error('Limite de 5.000 linhas');
 const records=parsed.data.map((raw,n)=>{const doc:Doc={};try{for(const [key,v] of Object.entries(raw)){const dest=mapping[key]||key;let value:any=v;if(['quantity','price','extra','yield','cost','portions','orderCost','storeDiscount','platformDiscount','subsidy','freight','deliveryCost','deliverySubsidy','actualFees'].includes(dest)){value=v===''&&dest==='cost'?null:String(v).includes(',')?String(v).replace(/\./g,'').replace(',','.'):v;}if(['items','components'].includes(dest))value=v?JSON.parse(String(v)):[];if(['active','ownFreight','confirmed'].includes(dest))value=String(v).toLowerCase()==='true';if(v!=='')doc[dest]=value;}
 return {line:n+2,doc:schemas[kind as Kind].parse(doc),error:null};}catch(e:any){return {line:n+2,doc,error:e.message};}});return {kind,fields:parsed.meta.fields,records};};
 app.post('/api/import/preview',req=>{scoped(req);return preview(req.body);});
 app.post('/api/import/commit',req=>{const store=scoped(req,true);const b=req.body as any;if(b.confirm!==true)throw Error('Confirme a importação');const p=preview(b);if(p.records.some(r=>r.error))throw Error('Corrija as linhas inválidas antes de importar');return store.transaction(()=>{const saved=[];for(const r of p.records){const d=r.doc as Doc;const existing=store.list(p.kind).find(x=>p.kind==='orders'?x.external===d.external:p.kind==='products'?x.code===d.code:x.name===d.name);if(existing){if(b.policy==='skip')continue;throw Error(`Duplicidade na linha ${r.line}`);}saved.push(store.save(p.kind,d));}return {count:saved.length};});});

 app.get('/api/companies',()=>companies.list());
 app.post('/api/companies',req=>companies.save(req.body as Doc));
 app.get('/api/companies/report',req=>{const q=req.query as any;const {from,to}=period(q);return companies.summary(from,to,q.archived==='true');});
 app.get('/api/companies/export',(req,reply)=>{const q=req.query as any;const {from,to}=period(q);return reply.type('text/csv; charset=utf-8').header('Content-Disposition','attachment; filename="resultado-por-empresa.csv"').send('\uFEFF'+Papa.unparse(companies.summary(from,to,q.archived==='true').rows,{delimiter:';',escapeFormulae:true}));});
 app.get('/api/references/ifood',()=>ifoodReference);
 app.post('/api/references/ifood',req=>{
  const store=scoped(req,true);if((req.body as any)?.confirm!==true)throw Error('Confirme a inclusão das referências');
  return store.transaction(()=>{let channel=store.list('channels').find(c=>c.name.trim().toLowerCase()==='ifood');if(!channel)channel=store.save('channels',{name:'iFood'});if(!channel.active)throw Error('Reative o canal iFood antes de incluir as referências');
   const created:Doc[]=[],existing:Doc[]=[];for(const draft of ifoodPlans(channel.id)){const old=store.list('plans').find(p=>p.reference?.key===draft.reference.key);if(old)existing.push(old);else created.push(store.save('plans',draft));}
   let expenses=0;for(const [label,amount] of [['Básico',110],['Entrega',150]] as const){const name=`iFood ${label} — mensalidade de referência (conferir antes de ativar)`;if(!store.list('expenses').some(e=>e.name===name)){store.save('expenses',{name,amount,active:false,from:today(),category:'Mensalidade de plataforma',condition:`Referência consultada em ${ifoodReference.checkedOn}: devida acima de R$ 1.800/mês, conforme contrato e possíveis isenções. Ative SOMENTE a mensalidade do plano contratado quando efetivamente devida. Não há teste automático do faturamento. Fonte: ${ifoodReference.source}`});expenses++;}}
   return {created:created.length,existing:existing.length,expenses,plans:[...created,...existing],reference:ifoodReference};});
 });
 const dist=resolve('dist');if(existsSync(dist)){app.register(staticPlugin,{root:dist});app.setNotFoundHandler((req,reply)=>req.url.startsWith('/api/')?reply.code(404).send({error:'Rota inexistente'}):reply.sendFile('index.html'));}
 app.addHook('onClose',()=>companies.close());return {app,store:primary,companies};
}
