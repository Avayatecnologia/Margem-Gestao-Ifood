import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import { snapshot,verify } from './data-tools.mjs';

const port=Number(process.env.APP_PORT||3333);
const running=await new Promise(resolve=>{const s=net.connect({host:'127.0.0.1',port});s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));});
if(running)throw Error(`Encerre a aplicação na porta ${port} antes de fazer a cópia completa.`);
const source=path.resolve(process.env.DATA_DIR||'data');
if(!fs.existsSync(path.join(source,'empresas.sqlite'))||!fs.existsSync(path.join(source,'gestao.sqlite')))throw Error('Diretório de dados incompleto');
const stamp=new Date().toISOString().replaceAll(':','-').replaceAll('.','-');
const destination=path.resolve('backups',`antes-docker-${stamp}`);
if(destination.startsWith(source+path.sep))throw Error('Backup não pode estar dentro da origem');
const databases=snapshot(source,true);
fs.mkdirSync(destination,{recursive:true});fs.cpSync(source,path.join(destination,'data'),{recursive:true});
verify(path.join(destination,'data'),databases);
const sourceCopy=path.join(destination,'codigo');fs.mkdirSync(sourceCopy);
for(const entry of fs.readdirSync('.',{withFileTypes:true})){
 if(entry.isDirectory()&&!['server','shared','src','tests','scripts','modelos'].includes(entry.name))continue;
 fs.cpSync(entry.name,path.join(sourceCopy,entry.name),{recursive:entry.isDirectory()});
}
const hashTree=root=>fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>{const p=path.join(root,e.name);return e.isDirectory()?hashTree(p):[{file:path.relative(destination,p).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}];});
const manifest={format:'margem-full-offline',version:1,createdAt:new Date().toISOString(),source,databases,files:hashTree(destination)};
fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({backup:destination,integrity:'ok',databases:databases.length,files:manifest.files.length}));
