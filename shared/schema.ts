import { z } from 'zod';
const amount=z.preprocess(v=>v===''||v===null?undefined:v,z.coerce.number().finite().min(0).max(1e9));
const positive=amount.refine(v=>v>0,'Informe um valor maior que zero');
const pct=amount.refine(v=>v<=100,'Percentual máximo: 100');
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Data inválida');
const base={id:z.string().optional(),name:z.string().trim().min(1),active:z.boolean().default(true)};
export const companySchema=z.object({...base,legalName:z.string().trim().max(200).default(''),document:z.string().trim().max(30).default(''),contact:z.string().trim().max(120).default(''),email:z.union([z.literal(''),z.email()]).default(''),phone:z.string().trim().max(40).default(''),notes:z.string().max(3000).default('')});
export const schemas={
 settings:z.object({name:z.string().min(1),orders:positive,units:positive,margin:pct.refine(v=>v<100,'Margem deve ser inferior a 100%'),allocation:z.enum(['units','orders']).default('units')}),
 categories:z.object(base),suppliers:z.object(base),channels:z.object(base),
 expenses:z.object({...base,amount,from:date,to:date.optional(),category:z.string().default('Geral'),condition:z.string().default('')}),
 ingredients:z.object({...base,category:z.string().default(''),supplier:z.string().default(''),unit:z.enum(['kg','g','L','ml','un']),quantity:positive,price:amount,extra:amount.default(0),yield:pct.refine(v=>v>0),consume:z.enum(['g','ml','un'])}),
 products:z.object({...base,code:z.string().min(1),category:z.string().default(''),description:z.string().default(''),mode:z.enum(['manual','recipe']),cost:amount.nullable(),portions:positive.default(1),extra:amount.default(0),orderCost:amount.default(0),components:z.array(z.object({kind:z.enum(['ingredients','products']),id:z.string().min(1),quantity:positive})).default([])}),
 plans:z.object({...base,channel:z.string().min(1),from:date,to:date.optional(),delivery:z.string().default('Própria'),payment:z.string().default('Online'),shippingPolicy:z.enum(['standard','freeCustomer']).default('standard'),reference:z.object({provider:z.literal('ifood'),key:z.string(),checkedOn:date,source:z.url(),notes:z.string()}).optional(),monthlyReference:z.object({amount,threshold:amount}).optional(),rules:z.array(z.object({name:z.string().min(1),type:z.enum(['percent','fixed']),value:amount,scope:z.enum(['order','item']),base:z.enum(['gross','afterStore','customer','revenue','receivable','freight']),includeFreight:z.boolean().default(false),min:amount.default(0),max:amount.optional(),payment:z.string().default(''),delivery:z.string().default('')})).superRefine((rules,ctx)=>{rules.forEach((r,i)=>{if(r.type==='percent'&&r.value>100)ctx.addIssue({code:'custom',message:'Percentual máximo: 100',path:[i,'value']});});})}),
 prices:z.object({product:z.string().min(1),plan:z.string().min(1),price:amount,margin:pct.refine(v=>v<100,'Margem deve ser inferior a 100%'),note:z.string().default(''),promo:amount.optional(),from:date.optional(),to:date.optional()}),
 orders:z.object({external:z.string().min(1),date,plan:z.string().min(1),payment:z.string().default('Online'),delivery:z.string().default('Própria'),confirmed:z.boolean().default(false),allocation:z.enum(['revenue','quantity']).default('revenue'),items:z.array(z.object({product:z.string().min(1),quantity:positive,price:amount})).min(1),storeDiscount:amount.default(0),platformDiscount:amount.default(0),subsidy:amount.default(0),freight:amount.default(0),ownFreight:z.boolean().default(false),deliveryCost:amount.default(0),deliverySubsidy:amount.default(0),actualFees:amount.optional()}),
 adjustments:z.object({order:z.string().min(1),name:z.string().min(1),refund:amount,feesReturned:amount,costRecovered:amount,date,kind:z.enum(['partial','cancel'])}),
 reconciliations:z.object({order:z.string().min(1),amount,date,note:z.string().default('')}),
 confirmations:z.object({order:z.string().min(1),actualFees:amount,date,note:z.string().default('')})
};
export type Kind=keyof typeof schemas;
export type Rule=z.infer<typeof schemas.plans>['rules'][number];
export type Order=z.infer<typeof schemas.orders>;
export type Ingredient=z.infer<typeof schemas.ingredients>;
export type Doc=Record<string,any>;
export const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());
