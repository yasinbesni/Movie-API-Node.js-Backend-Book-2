import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"BOLUM_ESLESME.json"),"utf8"));
const errors=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name === "node_modules" ? [] : entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)]);
const files=walk(root);
if(manifest.chapters.length!==70 || manifest.chapters.some((c,i)=>c.number!==i+1)) errors.push("01–70 bölüm sırası bozuk");
for(const c of manifest.chapters){
 if(!fs.existsSync(path.join(root,c.chapter,"README.md")))errors.push(`Bölüm README eksik: ${c.number}`);
 for(const file of c.complete_examples??[])if(!fs.existsSync(path.join(root,c.chapter,"code",file)))errors.push(`Dosya eksik: ${c.number}/${file}`);
}
for(const file of files.filter(f=>/\.(js|mjs)$/.test(f))){
 const result=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
 if(result.status!==0)errors.push(`${path.relative(root,file)}: ${result.stderr}`);
}
for(const pkg of files.filter(f=>path.basename(f)==="package.json")){
 const project=path.dirname(pkg);
 // Kısmi bölüm kodu yerine yalnız src/server.js içeren tam uygulamalardaki bağlantılar.
 if(!fs.existsSync(path.join(project,"src/server.js")) || !fs.existsSync(path.join(project,"src/db/models/movie.js")))continue;
 const sourceFiles=walk(project).filter(f=>f.endsWith(".js"));
 const example=path.join(project,"example.env");
 if(!fs.existsSync(example)){errors.push(`example.env eksik: ${project}`);continue;}
 const text=fs.readFileSync(example,"utf8");
 if(fs.existsSync(path.join(project,".env.example")) && text!==fs.readFileSync(path.join(project,".env.example"),"utf8"))errors.push(`Örnek env kopyaları farklı: ${project}`);
 for(const file of sourceFiles){
  const src=fs.readFileSync(file,"utf8");
  for(const match of src.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g))if(!fs.existsSync(path.resolve(path.dirname(file),match[1])))errors.push(`Import eksik: ${path.relative(root,file)} -> ${match[1]}`);
  if(file.includes(`${path.sep}test${path.sep}`))continue;
  for(const m of src.matchAll(/process\.env\.([A-Z][A-Z0-9_]+)|(?:getRequiredString|required|secret|positive|url)\(\s*["']([A-Z][A-Z0-9_]+)["']/g)){
   const key=m[1]||m[2];if(!new RegExp(`^${key}=`,'m').test(text))errors.push(`Ortam örneğinde ${key} eksik: ${project}`);
  }
 }
}
console.log(`${manifest.chapters.length} bölüm, ${files.filter(f=>/\.(js|mjs)$/.test(f)).length} JavaScript, ${files.filter(f=>path.basename(f)==="example.env").length} example.env`);
if(errors.length){console.error(errors.join("\n"));process.exitCode=1;}else console.log("PASS: bölüm/dosya, sözdizimi, tam proje importları ve env kapsamı.");
console.log("Bu statik kontrol HTTP ve MongoDB testlerinin yerine geçmez. Tam projede npm test çalıştırın.");
