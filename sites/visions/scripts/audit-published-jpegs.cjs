#!/usr/bin/env node
'use strict';
// Read-only audit of original published JPEG image bytes; no artwork changes.
const fs=require('node:fs'), path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),imgRoot=path.join(root,'public','images');
const opts=new Set(process.argv.slice(2)),strict=opts.has('--strict');
const results=[],errors=[];
function visit(dir){
 if(!fs.existsSync(dir))return;
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,item.name);
  if(item.isDirectory())visit(p);
  else if(item.isFile()&&/\.jpe?g$/i.test(item.name))check(p);
 }
}
function jpegDimensions(b){
 let i=2;
 while(i+8<b.length){
  if(b[i++]!==255)continue;
  while(b[i]===255)i++;
  const marker=b[i++];
  if(marker===217||marker===218)break;
  if(marker===1||marker>=208&&marker<=215)continue;
  const n=b.readUInt16BE(i);
  if(n<2||i+n>b.length)break;
  if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){
   return [b.readUInt16BE(i+5),b.readUInt16BE(i+3)];
  }
  i+=n;
 }
 return [null,null];
}
function check(p){
 const data=fs.readFileSync(p),rel=path.relative(root,p).split(path.sep).join('/');
 const signature=data.length>=4&&data[0]===255&&data[1]===216&&data[2]===255;
 const ending=data.length>=4&&data[data.length-2]===255&&data[data.length-1]===217;
 const [width,height]=signature?jpegDimensions(data):[null,null];
 const md5=crypto.createHash('sha256').update(data).digest('hex');
 const detail={path:rel,bytes:data.length,width,height,estimatedPpiAt6_625In:width?Math.round(width/6.625):null,sha256:md5,hasJpegSOI:signature,hasJpegEOI:ending};
 results.push(detail);
 if(!signature||!ending||!width||!height){
  const f=[];if(!signature)f.push('missing SOI');if(!ending)f.push('missing EOI');if(!width||!height)f.push('missing dimensions');
  errors.push({...detail,reason:f.join('; ')});
 }
}
visit(path.join(imgRoot,'pages'));
visit(path.join(imgRoot,'covers'));
const sizes={};for(const r of results){const key=r.width+'x'+r.height;(sizes[key]??=[]).push(r.path)}
const summary={pathsChecked:results.length,invalidFiles:errors.length,filesBelow200PpiAt6_625In:results.filter(x=>x.estimatedPpiAt6_625In!==null&&x.estimatedPpiAt6_625In<200).length,sizeSummary:Object.entries(sizes).map(([resolution,a])=>({resolution,count:a.length})).sort((a,b)=>b.count-a.count)};
console.log('PUBLISHED JPEG BYTE INTEGRITY '+JSON.stringify(summary));
for(const e of errors)console.error('JPEG CORRUPT '+JSON.stringify({path:e.path,bytes:e.bytes,dimensions:[e.width,e.height],reason:e.reason}));
console.log('NOTE: PPI at 6.625-inch trim is an illustrative calculation, not a selected publication standard. Missing EOI is a binary corruption finding, not a request to regenerate.');
if(opts.has('--json')){
 const loc=path.join(root,'published-jpeg-audit.json');
 fs.writeFileSync(loc,JSON.stringify({summary,errors,files:results},null,2)+'\n');
}
if(strict&&errors.length)process.exitCode=1;
