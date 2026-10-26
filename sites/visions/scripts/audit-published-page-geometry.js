#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {Buffer} from 'node:buffer'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const root=path.join(site,'public','images','pages')
const registry=path.join(site,'src','content','series')
const failures=[],warnings=[],images=[],bySha=new Map()
const reports=[]
function walk(dir){
 if(!fs.existsSync(dir))return []
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])
}
function sizeOfJpeg(b,file){
 if(b.length<64||b[0]!==255||b[1]!==216){failures.push(file+': invalid JPEG SOI header');return null}
 const missingEOI=b.at(-2)!==255||b.at(-1)!==217
 if(missingEOI)warnings.push(file+': absent JPEG EOI marker (possible truncation; original source must be inspected, no automatic image edits)')
 let at=2,profile=false,dimensions=null
 while(at<b.length-4){
  if(b[at]!==255){at++;continue}
  let marker=b[at+1];while(marker===255&&at<b.length-1){at++;marker=b[at+1]}
  at+=2
  if(marker===217||marker===218)break
  if(marker===0||marker===1||(marker>=208&&marker<=215))continue
  if(at+2>b.length)break
  const n=b.readUInt16BE(at)
  if(n<2||at+n>b.length){failures.push(file+': invalid JPEG marker length');return null}
  const start=at+2
  if(marker===226&&b.toString('ascii',start,start+11)==='ICC_PROFILE')profile=true
  if([192,193,194,195,198,199,201,202,203,205,206,207].includes(marker)){
   const h=b.readUInt16BE(start+1),w=b.readUInt16BE(start+3)
   dimensions={width:w,height:h,components:b[start+5],progressive:marker===194}
  }
  at+=n
 }
 if(!dimensions||dimensions.width<1||dimensions.height<1)failures.push(file+': JPEG has no valid SOF dimensions')
 return dimensions?{...dimensions,hasIccProfile:profile}:null
}
const files=walk(root).filter(x=>/\.(jpg|jpeg)$/i.test(x))
for(const file of files){
 const rel=path.relative(root,file).replaceAll(path.sep,'/')
 const [seriesId,issueId,filename]=rel.split('/')
 if(!seriesId||!issueId||!/^page-\d{3}\.jpe?g$/i.test(filename||'')){
  warnings.push('Unrecognized published page path: '+rel);continue
 }
 const bytes=fs.readFileSync(file)
 const dims=sizeOfJpeg(bytes,rel)
 const sha=crypto.createHash('sha256').update(bytes).digest('hex')
 const row={seriesId,issueId,filename,relativePath:rel,bytes:bytes.length,sha256:sha,...dims,originalPixelsReviewed:false}
 images.push(row)
 const prior=bySha.get(sha)||[];prior.push(row);bySha.set(sha,prior)
}
const groups=new Map()
for(const x of images){
 const key=x.seriesId+'/'+x.issueId
 if(!groups.has(key))groups.set(key,[])
 groups.get(key).push(x)
}
for(const [key,group] of groups){
 group.sort((a,b)=>a.filename.localeCompare(b.filename))
 const nums=group.map(x=>Number(x.filename.match(/\d+/)[0]))
 const range=[...Array(group.length)].map((_,i)=>i+1)
 if(nums.some((n,i)=>n!==range[i]))failures.push(key+': published image sequence has gaps, repeats or non-one-based page numbering')
 const dimensions={}
 for(const p of group){if(!p.width)continue;const sz=p.width+'x'+p.height;dimensions[sz]=(dimensions[sz]||0)+1}
 reports.push({key,count:group.length,dimensionHistogram:dimensions,minWidth:Math.min(...group.map(x=>x.width||Infinity)),minHeight:Math.min(...group.map(x=>x.height||Infinity)),iccCount:group.filter(x=>x.hasIccProfile).length,bitwiseDuplicatePageCount:0})
 if(Object.keys(dimensions).length>1)warnings.push(key+': multiple pixel geometries; mastering must inspect intended role/trim (not an automatic failure)')
}
const crossIssueDuplicates=[]
for(const v of bySha.values()){
 const issues=new Set(v.map(x=>x.seriesId+'/'+x.issueId))
 if(issues.size>1)crossIssueDuplicates.push(v.map(x=>x.relativePath))
}
if(crossIssueDuplicates.length) {
 const combined=walk(registry).filter(p=>p.endsWith('.json')).some(p=>JSON.stringify(JSON.parse(fs.readFileSync(p,'utf8')).releases||[]).includes('Combined Edition'))
 warnings.push(crossIssueDuplicates.length+' cross-issue identical page binaries. Combined-edition republication '+(combined?'exists; manually verified intended for Backyard Rockets Issues 1–2.':'not established; review needed.'))
}
const publishedPaths=new Set(images.map(x=>'/images/pages/'+x.relativePath))
let referenced=0,unmatched=0
for(const file of walk(registry).filter(p=>p.endsWith('.json'))){
 const s=JSON.parse(fs.readFileSync(file,'utf8'))
 for(const p of s.dailyPages||[]){
  if(!p.image?.startsWith('/images/pages/'))continue
  referenced++
  if(!publishedPaths.has(p.image)){failures.push(path.basename(file)+': missing published daily-page image '+p.image);unmatched++}
 }
 for(const release of s.releases||[]){
  if(!release.externalLink?.startsWith('/issues/'))continue
  const disk=path.join(site,'public',release.externalLink.slice(1))
  if(!fs.existsSync(disk))failures.push(path.basename(file)+': missing collected edition PDF '+release.externalLink)
  else{
   const fd=fs.openSync(disk,'r'),first=Buffer.alloc(5);fs.readSync(fd,first,0,5,0);fs.closeSync(fd)
   if(first.toString('ascii')!=='%PDF-')failures.push(path.basename(file)+': edition PDF has invalid header '+release.externalLink)
  }
 }
}
const outArg=process.argv.indexOf('--out')
const output=outArg>=0?path.resolve(process.argv[outArg+1]):null
const report={kind:'released-binary-geometry-and-index-not-artistic-approval',date:new Date().toISOString(),
 counts:{pageImages:images.length,distinctBinaries:bySha.size,issues:groups.size,referencedPagePaths:referenced,notFoundDailyPages:unmatched,crossIssueDuplicateGroups:crossIssueDuplicates.length},
 issues:reports,images,crossIssueDuplicates,failures,warnings,
 limits:'JPEG marker dimensions, byte signatures, sequence, hashes and linked PDF header are checked. Native print resolution, readable lettering, palette, character identity and recipe fidelity require visual review.'}
if(output){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n')}
console.log('VISIONS PUBLISHED IMAGE AUDIT '+JSON.stringify(report.counts))
for(const x of reports)console.log('ISSUE '+JSON.stringify(x))
for(const f of failures)console.error('ERROR '+f)
for(const w of warnings)console.warn('REVIEW '+w)
console.log(report.limits)
if(failures.length)process.exitCode=1
