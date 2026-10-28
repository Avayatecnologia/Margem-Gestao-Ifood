import { Decimal } from 'decimal.js';
import type {Rule,Ingredient,Doc,Order} from './schema.ts';
export const D=(v:Decimal.Value)=>new Decimal(v);
export const sum=(a:Decimal.Value[])=>a.reduce<Decimal>((s,v)=>s.plus(v),D(0));
export const money=(v:Decimal.Value)=>D(v).toDecimalPlaces(2,Decimal.ROUND_HALF_UP).toNumber();
export function ingredientCost(i:Ingredient){
 const target:Record<string,string>={kg:'g',g:'g',L:'ml',ml:'ml',un:'un'};
 if(target[i.unit]!==i.consume||i.yield<=0||i.quantity<=0)throw Error('Unidade de consumo incompatível ou rendimento inválido');
 return D(i.price).plus(i.extra).div(D(i.quantity).mul(['kg','L'].includes(i.unit)?1000:1).mul(D(i.yield).div(100)));
}
export function productCost(id:string,docs:Record<string,Doc[]>,trail:string[]=[]):{unit:Decimal,order:Decimal}{
 if(trail.includes(id))throw Error('Ciclo na composição de produtos');
 const p=docs.products.find(x=>x.id===id);if(!p)throw Error('Produto inexistente');
 if(p.mode==='manual'){if(p.cost===null)throw Error(`Custo pendente: ${p.name}`);return {unit:D(p.cost),order:D(p.orderCost)};}
 if(!p.components.length)throw Error(`Ficha técnica vazia: ${p.name}`);
 let total=D(p.extra),order=D(p.orderCost);
 for(const c of p.components){if(c.kind==='ingredients'){const i=docs.ingredients.find(x=>x.id===c.id);if(!i)throw Error('Insumo inexistente');total=total.plus(ingredientCost(i as Ingredient).mul(c.quantity));}else{const child=productCost(c.id,docs,[...trail,id]);total=total.plus(child.unit.mul(c.quantity));order=order.plus(child.order.mul(c.quantity));}}
 return {unit:total.div(p.portions),order};
}
export function allocate(total:Decimal.Value,weights:Decimal.Value[]):number[]{
 if(!weights.length)return [];let ws=weights.map(D);if(sum(ws).isZero())ws=ws.map(()=>D(1));
 const cents=D(total).mul(100).round();const shares=ws.map(w=>cents.mul(w).div(sum(ws)));const floors=shares.map(s=>s.floor());let left=cents.minus(sum(floors)).toNumber();
 const rank=shares.map((s,i)=>({i,r:s.minus(floors[i])})).sort((a,b)=>b.r.comparedTo(a.r)||a.i-b.i);
 for(let i=0;i<left;i++)floors[rank[i%rank.length].i]=floors[rank[i%rank.length].i].plus(1);
 return floors.map(v=>v.div(100).toNumber());
}
export function calculate(o:Order,rules:Rule[],costs:{unit:Decimal.Value,order:Decimal.Value}[]){
 const gross=sum(o.items.map(i=>D(i.price).mul(i.quantity)));const dl=D(o.storeDiscount),dp=D(o.platformDiscount),sub=D(o.subsidy);
 if(dl.plus(dp).gt(gross)||sub.gt(dp))throw Error('Descontos excedem subtotal ou subsídio excede desconto da plataforma');
 const customer=gross.minus(dl).minus(dp),afterStore=gross.minus(dl),revenue=customer.plus(sub).plus(o.ownFreight?o.freight:0).plus(o.deliverySubsidy);
 const freight=D(o.ownFreight?o.freight:0).plus(o.deliverySubsidy);
 let fees=D(0);const lines:{name:string,base:number,value:number}[]=[];
 for(const r of rules){if(r.payment&&r.payment!==o.payment||r.delivery&&r.delivery!==o.delivery)continue;
 let b=({gross,afterStore,customer,revenue:customer.plus(sub),receivable:Decimal.max(0,revenue.minus(fees)),freight})[r.base];
 if(r.includeFreight&&!['freight','receivable'].includes(r.base))b=b.plus(freight);
 if(b.lt(r.min)||r.max!==undefined&&b.gt(r.max))continue;
 const value=D(money(r.type==='percent'?b.mul(r.value).div(100):D(r.value).mul(r.scope==='item'?sum(o.items.map(i=>i.quantity)):1)));
 fees=fees.plus(value);lines.push({name:r.name,base:money(b),value:value.toNumber()});}
 if(o.actualFees!==undefined){lines.push({name:'Ajuste para taxas efetivas',base:money(revenue),value:money(D(o.actualFees).minus(fees))});fees=D(o.actualFees);}
 const variable=sum(costs.map((c,i)=>D(c.unit).mul(o.items[i].quantity).plus(c.order))).plus(o.deliveryCost);
 const contribution=D(money(revenue)).minus(money(fees)).minus(money(variable)),receivable=D(money(revenue)).minus(money(fees));
 const weights=o.items.map(i=>o.allocation==='quantity'?D(i.quantity):D(i.price).mul(i.quantity));
 const revenues=allocate(money(revenue),weights),feeShares=allocate(money(fees),weights);
 const costsRaw=costs.map((c,i)=>D(c.unit).mul(o.items[i].quantity).plus(c.order));
 const costShares=allocate(money(variable),costsRaw);
 const items=o.items.map((i,n)=>({...i,revenue:revenues[n],fees:feeShares[n],cost:costShares[n],contribution:money(D(revenues[n]).minus(feeShares[n]).minus(costShares[n]))}));
 return {gross:money(gross),customer:money(customer),revenue:money(revenue),fees:money(fees),cost:money(variable),receivable:money(receivable),contribution:money(contribution),margin:revenue.isZero()?null:contribution.div(revenue).mul(100).toNumber(),lines,items,engine:'1.0'};
}
export function simplePrice(c:number,f:number,q:number,t:number,m:number,r=0){if(q<=0||1-t-m<=0)throw Error('Meta inviável: taxas e margem consomem toda a receita');return D(c).plus(D(f).div(q)).plus(r).div(D(1).minus(t).minus(m));}
export function roundPrice(p:Decimal.Value,mode:string){let v=D(p);if(mode==='half')return v.mul(2).ceil().div(2);if(mode==='90'||mode==='99'){let n=v.floor().plus(mode==='90'?'.90':'.99');return n.lt(v)?n.plus(1):n;}return v.mul(100).ceil().div(100);}
export function suggest(o:Order,rules:Rule[],costs:{unit:Decimal.Value,order:Decimal.Value}[],margin:number,overhead:number,rounding:string){
 if(o.items.length!==1)throw Error('Precificação exige um produto por simulação');
 if(rules.some(r=>r.min>0||r.max!==undefined))throw Error('Plano com degraus: use o simulador manual e avalie as fronteiras; sugestão automática indisponível');
 const q=o.items[0].quantity;if(q<=0||margin>=100)throw Error('Quantidade ou margem inválida');
 const evalAt=(p:number)=>calculate({...o,items:[{...o.items[0],price:p}]},rules,costs);
 const meets=(p:number)=>{try{const a=evalAt(p);return a.revenue>0&&D(a.contribution).minus(D(overhead).mul(q)).gte(D(a.revenue).mul(margin).div(100));}catch{return false;}};
 let high=1;while(high<1000000&&!meets(high))high*=2;if(!meets(high))throw Error('Não há preço viável até R$ 1 milhão; reveja custos, descontos e meta');
 let low=0;for(let i=0;i<60;i++){const mid=(low+high)/2;if(meets(mid))high=mid;else low=mid;}
 let p=roundPrice(high,rounding);for(let i=0;i<200&&!meets(p.toNumber());i++)p=roundPrice(p.plus('.01'),rounding);
 if(!meets(p.toNumber()))throw Error('Arredondamento não atingiu a meta');return {price:p.toNumber(),result:evalAt(p.toNumber()),overhead,margin};
}
