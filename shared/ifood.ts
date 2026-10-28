import { today,type Doc } from './schema.ts';

export const ifoodReference={
 checkedOn:'2026-10-28',
 source:'https://blog-parceiros.ifood.com.br/taxas-ifood/',
 alternateSource:'https://parceiros.ifood.com.br/restaurante/como-funciona/entregas',
 warning:'Referência pública consultada em 28/10/2026, não confirmação do seu contrato. O blog informa pagamento online de 3,2%; a página de entregas informa 3,5%. Confira o Portal do Parceiro antes de usar como cobrança efetiva.',
 basis:'Hipótese inicial de cálculo: subtotal de produtos antes dos descontos, sem frete na base. Confira no contrato a incidência sobre descontos, subsídios e frete.',
};

export function ifoodPlans(channel:string){return [
 {key:'basic',label:'Básico · entrega pela loja',commission:12,monthly:110,delivery:'Própria'},
 {key:'delivery',label:'Entrega · parceiros iFood',commission:23,monthly:150,delivery:'Parceiros iFood'},
].flatMap(p=>[false,true].map(free=>({
 name:`iFood ${p.label}${free?' · frete grátis ao cliente':''} · referência 28/10/2026`,channel,from:today(),active:true,delivery:p.delivery,payment:'Online',shippingPolicy:free?'freeCustomer':'standard',
 reference:{provider:'ifood',key:`ifood-${p.key}-${free?'free':'standard'}-2026-10-28`,checkedOn:ifoodReference.checkedOn,source:ifoodReference.source,notes:`${ifoodReference.warning} ${ifoodReference.basis} ${free?'Frete grátis ao consumidor mantém as comissões. Informe apenas o custo/participação de entrega efetivamente suportado pela loja; não há subsídio presumido.':'Informe frete e custo real conforme quem recebe e paga a entrega.'}`},
 monthlyReference:{amount:p.monthly,threshold:1800},
 rules:[
 {name:'Comissão iFood — referência pública',type:'percent',value:p.commission,scope:'order',base:'gross',includeFreight:false,min:0,payment:'',delivery:''},
 {name:'Pagamento via iFood — referência 3,2% (conferir contrato)',type:'percent',value:3.2,scope:'order',base:'gross',includeFreight:false,min:0,payment:'Online',delivery:''},
 ],
})));}

export function needsDeliveryCost(plan:Doc){return plan.shippingPolicy==='freeCustomer'||plan.reference?.provider==='ifood'&&plan.delivery==='Própria';}
export function validatePlanOrder(plan:Doc,input:Doc){
 if(plan.shippingPolicy==='freeCustomer'&&(Number(input.freight??0)!==0||input.ownFreight===true))throw Error('Neste plano o frete é grátis ao consumidor: frete cobrado deve ser zero e não pode haver frete recebido do cliente');
 if(needsDeliveryCost(plan)&&(input.deliveryCost===undefined||input.deliveryCost===null||input.deliveryCost===''))throw Error('Informe o custo/participação de entrega da loja. Digite zero somente se a loja realmente não tiver esse custo');
}
