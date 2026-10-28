import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';

const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function files(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>{const p=path.join(root,e.name);if(e.isSymbolicLink())throw Error('Link simbólico não permitido na cópia de dados');return e.isDirectory()?files(p):[p];});}
export function snapshot(root,checkpoint=false){
 root=path.resolve(root);
 return files(root).filter(p=>p.endsWith('.sqlite')).sort().map(file=>{
  const db=new DatabaseSync(file,{readOnly:!checkpoint});
  try{
   if(checkpoint){const check=db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').get();if(check.busy)throw Error('Banco ainda está em uso. Encerre o servidor antes do backup.');}
   if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Banco inconsistente: '+path.basename(file));
   const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(t=>t.name);
   const data={};for(const table of tables){if(!/^[a-zA-Z_]+$/.test(table))throw Error('Nome de tabela inesperado');data[table]=db.prepare(`SELECT * FROM "${table}" ORDER BY rowid`).all();}
   return {file:path.relative(root,file).replaceAll('\\','/'),counts:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length])),recordsHash:hash(JSON.stringify(data))};
  }finally{db.close();}
 });
}
export function verify(root,expected){const actual=snapshot(root);if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('A cópia de dados difere do manifesto de origem');return actual;}
function fileSignatures(root){return files(root).filter(f=>!f.endsWith('-shm')).sort().map(f=>({file:path.relative(root,f).replaceAll('\\','/'),sha256:hash(fs.readFileSync(f))}));}
function copyAndCheck(source,target){
 const expected=fileSignatures(source);fs.cpSync(source,target,{recursive:true});
 if(JSON.stringify(fileSignatures(target))!==JSON.stringify(expected))throw Error('Arquivos copiados diferem da origem');
 // Trabalhar na cópia gravável permite recuperar WAL sem criar arquivos no volume de origem somente leitura.
 return snapshot(target,true);
}
function exportData(source,destination){
 source=path.resolve(source);destination=path.resolve(destination);
 if(destination===source||destination.startsWith(source+path.sep))throw Error('O backup deve ficar fora da origem');
 if(!fs.existsSync(path.join(source,'empresas.sqlite'))||!fs.existsSync(path.join(source,'gestao.sqlite')))throw Error('Origem incompleta');
 fs.mkdirSync(destination,{recursive:true});if(fs.readdirSync(destination).length)throw Error('Destino do backup precisa estar vazio');
 const databases=copyAndCheck(source,path.join(destination,'data'));verify(path.join(destination,'data'),databases);
 const manifest={format:'margem-docker-export',version:1,createdAt:new Date().toISOString(),databases,files:files(path.join(destination,'data')).filter(f=>!f.endsWith('-shm')&&!f.endsWith('-wal')).map(f=>({file:path.relative(destination,f).replaceAll('\\','/'),sha256:hash(fs.readFileSync(f))}))};
 fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({backup:true,databases:databases.length,integrity:'ok'}));
}
function importData(source,target){
 source=path.resolve(source);target=path.resolve(target);
 if(target!==path.resolve(process.env.DATA_DIR||'/app/data')||target===source)throw Error('Destino de importação inválido');
 fs.mkdirSync(target,{recursive:true});if(fs.readdirSync(target).length)throw Error('Volume não está vazio. Importação recusada para preservar os dados existentes.');
 const expected=copyAndCheck(source,target);verify(target,expected);
 if(process.platform!=='win32'){for(const f of files(target))fs.chownSync(f,1000,1000);const own=p=>{fs.chownSync(p,1000,1000);for(const e of fs.readdirSync(p,{withFileTypes:true}))if(e.isDirectory())own(path.join(p,e.name));};own(target);}
 console.log(JSON.stringify({imported:true,databases:expected.length,snapshot:expected}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [cmd,root,arg]=process.argv.slice(2);
 if(cmd==='snapshot')console.log(JSON.stringify(snapshot(root)));
 else if(cmd==='import')importData(root,arg||process.env.DATA_DIR||'/app/data');
 else if(cmd==='export')exportData(root,arg);
 else if(cmd==='verify')console.log(JSON.stringify({verified:true,databases:verify(root,JSON.parse(fs.readFileSync(arg,'utf8')).databases).length}));
 else throw Error('Use snapshot DIRETORIO, import ORIGEM DESTINO, export ORIGEM DESTINO ou verify DIRETORIO MANIFESTO');
}
