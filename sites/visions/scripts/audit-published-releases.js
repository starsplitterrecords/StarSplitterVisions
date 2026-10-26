#!/usr/bin/env node
'use strict';
// Read-only audit of collected releases and their locally published binaries.
// Source is StarSplitterVisions, never RexPrompt approved-unpublished drafts.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pub=path.join(root,'public'),content=path.join(root,'src/content/series');
const args=process.argv.slice(2),live=args.includes('--live'),json=args.includes('--json');
if(args.some(x=>!['--live','--json'].includes(x)))throw Error('Unknown argument; use --live and/or --json');
const errs=[],warnings=[],records=[],catalogIds=new Set();
const kindOf=b=>b.length>=8&&b.toString('ascii',0,4)==='%PDF'?'pdf':
 (b.length>=4&&b[0]===255&&b[1]===216&&b[b.length-2]===255&&b[b.length-1]===217?'jpeg':
 (b.length>=8&&b.toString('hex',0,8)==='89504e470d0a1a0a'?'png':
 (b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'?'webp':'unknown')));
function resolve(runtime){
 if(typeof runtime!=='string'||!runtime.startsWith('/')||runtime.startsWith('//')||runtime.includes('?')||runtime.includes('#')||runtime.includes('\\')||runtime.split('/').includes('..'))return null;
 const filename=path.resolve(pub,'.'+runtime);return filename.startsWith(pub+path.sep)?filename:null;
}
function inspect(p,what,expected){
 const file=resolve(p);
 if(!file){errs.push(what+': unsafe public path '+String(p));return false}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){errs.push(what+': missing public file '+p);return false}
 const b=fs.readFileSync(file),kind=kindOf(b);
 if(!expected.includes(kind)){errs.push(what+': invalid file signature '+kind+' at '+p);return false}
 if(b.length<100)errs.push(what+': improbably small published binary '+p);
 return true;
}
const metadata=fs.readdirSync(content).filter(x=>x.endsWith('.json')).sort();
const currentPages=new Map();
for(const filename of metadata){
 const s=JSON.parse(fs.readFileSync(path.join(content,filename),'utf8')),slug=s.slug;
 if(slug!==filename.replace(/\.json$/,''))errs.push('Filename slug mismatch '+filename);
 const editions=(s.releases||[]).filter(r=>r.publicationType==='E');
 const pages=s.dailyPages||[];
 let seen=new Set(),prior=0;
 for(const page of pages){
   const num=page.pageNumber;
   if(!Number.isInteger(num)||num<1||seen.has(num)||num<=prior)errs.push(slug+': page numbering duplicates or out of order at '+num);
   prior=num;seen.add(num);
   if(!page.image?.startsWith('/images/pages/'+slug+'/'))errs.push(slug+': page belongs to another series or invalid reader image: '+page.image);
   inspect(page.image,slug+' reader page '+num,['jpeg','png','webp']);
 }
 currentPages.set(slug,pages.length);
 for(const release of editions){
   const name=slug+' '+release.title;
   if(catalogIds.has(release.catalogId))errs.push('Duplicate release catalog ID '+release.catalogId);
   catalogIds.add(release.catalogId);
   if(!Number.isInteger(release.issueNumber))errs.push(name+': missing issueNumber');
   if(!release.cover?.startsWith('/images/covers/'))errs.push(name+': invalid cover path');
   inspect(release.cover,name+' cover',['jpeg','png','webp']);
   const pdf=release.externalLink;
   if(!pdf||!pdf.startsWith('/issues/'+slug+'/'))errs.push(name+': collected PDF must live under /issues/'+slug+'/');
   else inspect(pdf,name+' PDF',['pdf']);
   records.push({series:slug,issueNumber:release.issueNumber,catalogId:release.catalogId,cover:release.cover,pdf,publishedReaderPages:pages.length,releaseDate:release.releaseDate});
 }
 if(editions.length===0&&pages.length)warnings.push(slug+': reader images exist without a collected-edition release record');
 if(editions.length>1)warnings.push(slug+': '+editions.length+' collected editions share one dailyPages array; issue-specific page scope is not derivable without explicit release pagination');
 if(editions.length&&pages.length===0)warnings.push(slug+': collected edition exists but no reader pages are listed');
}
async function inspectLive(){
 const base=process.env.VISIONS_PUBLIC_SITE_URL||'https://star-splitter-visions.vercel.app';
 const results=[];
 for(const x of records){
   for(const resource of [x.cover,x.pdf]){
     const url=base+resource;
     try{
       const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(15000),headers:{'Range':'bytes=0-63'}});
       const type=r.headers.get('content-type')||'';
       const ok=r.status===200||r.status===206;
       if(!ok)warnings.push('Live deployment '+r.status+' for '+url);
       else if(type.includes('text/html'))warnings.push('Live deployment returned HTML for binary asset '+url);
       results.push({url,status:r.status,contentType:type,ok:ok&&!type.includes('text/html')});
       await r.arrayBuffer();
     }catch(e){warnings.push('Live deployment unreachable '+url+': '+e.message);results.push({url,ok:false,error:e.message})}
   }
 }
 return results;
}
const liveResults=live?await inspectLive():null;
const out={scannedSeries:metadata.length,collectedEditions:records.length,records,errors:errs,warnings,liveResults,semantics:'Repository file checks are not publication approval or visual mastering. A live probe checks deployed asset response only.'};
if(json)console.log(JSON.stringify(out,null,2));
else{
 console.log('StarSplitterVisions: '+out.scannedSeries+' series, '+out.collectedEditions+' collected editions');
 records.forEach(r=>console.log('EDITION '+r.catalogId+' '+r.series+' '+r.issueNumber+' reader entries '+r.publishedReaderPages));
 errs.forEach(x=>console.error('RELEASE ERROR '+x));
 warnings.forEach(x=>console.warn('RELEASE WARNING '+x));
 console.log('Audit: '+errs.length+' integrity errors; '+warnings.length+' advisories');
}
if(errs.length)process.exitCode=1;