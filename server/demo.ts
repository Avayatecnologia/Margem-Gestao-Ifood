import { Store } from './store.ts';import { today } from '../shared/schema.ts';
const store=new Store('data/demo');
try{if(store.list('products').length)throw Error('Demonstração já criada; dados foram preservados.');
store.transaction(()=>{
const category=store.save('categories',{name:'Lanches'});store.save('suppliers',{name:'Fornecedor fictício'});
const i=store.save('ingredients',{name:'Carne — EXEMPLO',quantity:1,unit:'kg',price:20,yield:80,consume:'g'});
const bread=store.save('ingredients',{name:'Pão — EXEMPLO',quantity:10,unit:'un',price:10,yield:100,consume:'un'});
const burger=store.save('products',{name:'Hambúrguer',code:'H1',category:category.name,mode:'recipe',cost:null,portions:1,components:[{kind:'ingredients',id:i.id,quantity:150},{kind:'ingredients',id:bread.id,quantity:1}],orderCost:1});
const fries=store.save('products',{name:'Batata frita',code:'B1',category:category.name,mode:'manual',cost:4});
const drink=store.save('products',{name:'Refrigerante',code:'R1',category:'Bebidas',mode:'manual',cost:3});
store.save('products',{name:'Hambúrguer duplo',code:'H2',category:category.name,mode:'recipe',cost:null,portions:1,components:[{kind:'products',id:burger.id,quantity:2}]});
const combo=store.save('products',{name:'Combo da casa',code:'C1',category:category.name,mode:'recipe',cost:null,portions:1,components:[{kind:'products',id:burger.id,quantity:1},{kind:'products',id:fries.id,quantity:1},{kind:'products',id:drink.id,quantity:1}]});
store.save('expenses',{name:'Aluguel — EXEMPLO',amount:1000,from:'2020-01-01'});
store.list('channels').slice(0,2).forEach((c,n)=>{const p=store.save('plans',{name:'DEMONSTRAÇÃO — taxas fictícias',channel:c.id,from:'2020-01-01',rules:[{name:'Comissão FICTÍCIA',type:'percent',value:n?18:22,scope:'order',base:'afterStore'},{name:'Taxa FICTÍCIA por pedido',type:'fixed',value:1,scope:'order',base:'gross'}]});
for(const product of [burger,fries,drink,combo])store.save('prices',{product:product.id,plan:p.id,price:product.id===combo.id?39.9:19.9,margin:20});
for(let k=0;k<4;k++)store.save('orders',{external:`DEMO-${n}-${k}`,date:today(),plan:p.id,items:[{product:combo.id,quantity:1,price:39.9}]});});
store.save('settings',{name:'Restaurante demonstração — dados fictícios',orders:300,units:600,margin:20,allocation:'units'});
});console.log('Demonstração criada isoladamente em data/demo. Execute: $env:DATA_DIR="data/demo"; npm start');}finally{store.db.close();}
