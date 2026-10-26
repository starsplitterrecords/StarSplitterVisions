#!/usr/bin/env node
'use strict';
// Read-only audit of collected releases and their locally published binaries.
// Source is StarSplitterVisions, never RexPrompt approved-unpublished drafts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {buildReaderPath,buildSeriesPath,parseReaderPath} from '../src/utils/routes.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pub=path.join(root,'public'),content=path.join(root,'src/content/series');
const args=process.argv.slice(2),live=args.includes('--live'),liveStrict=args.includes('--live-strict'),json=args.includes('--json'),strict=args.includes('--strict');
if(args.some(x=>!['--live','--live-strict','--json','--strict'].includes(x)))throw Error('Unknown argument; use --live, --live-strict, --json, or --strict');
if(liveStrict&&!live)throw Error('--live-strict requires --live');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'scripts/known-release-defects.json'),'utf8'));
const waivers=baseline.defects||{};
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
 if(!expected.includes(kind)){
  const record=waivers[p],gitSha=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
  if(!strict&&record?.gitBlobSha===gitSha&&record?.observedSignature===kind){
    warnings.push(what+': known damaged legacy binary, tracked for replacement: '+p);return false;
  }
  errs.push(what+': invalid file signature '+kind+' at '+p);return false;
}
 if(b.length<100)errs.push(what+': improbably small published binary '+p);
 return true;
}
const metadata=fs.readdirSync(content).filter(x=>x.endsWith('.json')).sort();
const currentPages=new Map(),readerAssetSamples=new Set();
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
 if(pages.length){readerAssetSamples.add(pages[0].image);readerAssetSamples.add(pages[pages.length-1].image)}
 if(pages.length){const path=buildReaderPath(slug,1),route=parseReaderPath(path);if(route?.seriesSlug!==slug||route.pageNumber!==1)errs.push(slug+': reader route contract broken')}
 if(buildSeriesPath(slug)!=='/series/'+slug)errs.push(slug+': series route contract broken');
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
 const base=(process.env.VISIONS_PUBLIC_SITE_URL||'https://star-splitter-visions.vercel.app').replace(/\/$/,'');
 const results=[];
 const routes=new Set(['/','/series']);
 for(const x of records){
   routes.add(buildSeriesPath(x.series));
   if(currentPages.get(x.series)>0)routes.add(buildReaderPath(x.series,1));
 }
 const assets=new Set([...records.flatMap(x=>[x.cover,x.pdf]),...readerAssetSamples].filter(Boolean));
 const targets=[...routes].map(p=>({p,kind:'html'})).concat([...assets].map(p=>({p,kind:'binary'})));
 for(const {p,kind} of targets){
   const url=base+p;
   try{
     const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(7000),headers:kind==='binary'?{'Range':'bytes=0-63'}:{}});
     const type=r.headers.get('content-type')||'',reachable=(r.status===200||r.status===206);
     const acceptable=kind==='html'?type.includes('text/html'):!type.includes('text/html')&&!type.includes('text/plain');
     let hasAppShell=true;
     if(kind==='html'&&reachable&&acceptable){
       const body=await r.text();
       hasAppShell=body.includes('id="root"')||body.includes("id='root'");
     }else await r.body?.cancel();
     const ok=reachable&&acceptable&&hasAppShell;
     if(!ok)warnings.push('Live deployment invalid route/asset: '+url+' (HTTP '+r.status+', '+type+', shell='+hasAppShell+')');
     results.push({url,kind,status:r.status,contentType:type,ok});
   }catch(e){warnings.push('Live deployment unreachable '+url+': '+e.message);results.push({url,kind,ok:false,error:e.message})}
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
if(errs.length||(liveStrict&&liveResults?.some(x=>!x.ok)))process.exitCode=1;