import { createApp } from './app.ts';
const {app}=createApp();
let closing=false;
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,async()=>{if(closing)return;closing=true;try{await app.close();process.exitCode=0;}catch(e){console.error(e);process.exitCode=1;}});
app.listen({host:process.env.HOST||'127.0.0.1',port:Number(process.env.PORT||3333)}).then(url=>console.log(`Margem disponível em ${url}`)).catch(e=>{console.error(e);process.exit(1);});
