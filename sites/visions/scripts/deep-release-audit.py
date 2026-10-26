#!/usr/bin/env python3
"""Non-destructive reader, PDF, metadata, and optional deployed-url forensic audit."""
import argparse, concurrent.futures, hashlib, io, json, os, pathlib, sys, urllib.request
from collections import Counter
import fitz
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = False
ROOT=pathlib.Path(__file__).resolve().parents[1]
PUB=ROOT/"public"
parser=argparse.ArgumentParser()
parser.add_argument("--report")
parser.add_argument("--candidates")
parser.add_argument("--live",action="store_true")
parser.add_argument("--strict",action="store_true")
parser.add_argument("--expect-known",action="store_true")
a=parser.parse_args()
known=json.loads((ROOT/"scripts/known-release-defects.json").read_text())["defects"]
out={"series":[],"editions":[],"corrupt":[],"otherErrors":[],"warnings":[],"pdfCandidates":[],"live":[]}
seen=set()
targets={"/","/series"}
def locate(url):
    if not isinstance(url,str) or not url.startswith("/") or "//" in url or ".." in url or "?" in url or "\\" in url:raise ValueError("unsafe path "+repr(url))
    p=(PUB/url.lstrip("/")).resolve()
    if not p.is_relative_to(PUB.resolve()):raise ValueError("escaping public root")
    return p
def digest(b):return hashlib.sha256(b).hexdigest()
def d_hash(im):
    pix=list(im.convert("L").resize((17,16),Image.Resampling.LANCZOS).getdata())
    v=0
    for y in range(16):
        for x in range(16):v=(v<<1)|int(pix[y*17+x]>pix[y*17+x+1])
    return v
def distance(h,k):return (h^k).bit_count()/256
def check_image(url,kind):
    targets.add(url)
    r={"url":url,"valid":False}
    try:
        b=locate(url).read_bytes()
        r["bytes"]=len(b);r["sha256"]=digest(b)
        with Image.open(io.BytesIO(b)) as im:
            r.update({"dimensions":[im.width,im.height],"format":im.format,"icc":bool(im.info.get("icc_profile"))})
            im.verify()
        with Image.open(io.BytesIO(b)) as im:
            im.load()
            if im.width<100 or im.height<100:raise ValueError("implausible native image dimensions")
            r["fingerprint"]=d_hash(im)
            r["valid"]=True
    except Exception as e:
        r["error"]=str(e)
        out["corrupt"].append({"path":url,"kind":kind,"error":str(e),"known":url in known})
        if url not in known:out["otherErrors"].append("unexpected broken "+kind+" "+url+": "+str(e))
    return r
def check_pdf(url,slug,num,pages,align):
    targets.add(url)
    r={"url":url,"valid":False}
    try:
        b=locate(url).read_bytes()
        r.update({"bytes":len(b),"sha256":digest(b)})
        if not b.startswith(b"%PDF"):raise ValueError("missing PDF magic")
        with fitz.open(stream=b,filetype="pdf") as doc:
            if doc.needs_pass:raise ValueError("locked PDF")
            if not len(doc):raise ValueError("empty PDF")
            r.update({"valid":True,"pageCount":len(doc),"repairNeeded":bool(doc.is_repaired)})
            fingerprints=[]
            for page in doc:
                pix=page.get_pixmap(matrix=fitz.Matrix(.5,.5),alpha=False)
                fingerprints.append(d_hash(Image.open(io.BytesIO(pix.tobytes("png")))))
            if pages:
                nearest=[]
                for i,x in enumerate(pages):
                    if not x["valid"]:continue
                    ds=sorted((distance(x["fingerprint"],h),j) for j,h in enumerate(fingerprints))
                    nearest.append((i,ds[0][1],round(ds[0][0],3)))
                counts=Counter(j-i for i,j,d in nearest if d<=.31)
                offset=(counts.most_common(1)[0][0] if counts else None)
                aligned=sum(1 for i,j,d in nearest if offset is not None and j-i==offset and d<=.31)
                confidence=round(aligned/max(len(nearest),1),3)
                pdf_coverage=round(aligned/max(1,len(doc)-1),3)
                r["alignment"]={"offset":offset,"confidence":confidence,"matched":aligned,"validPages":len(nearest),"pdfInteriorCoverage":pdf_coverage,
                                "outliers":[[i+1,j+1,d] for i,j,d in nearest if offset is None or j-i!=offset or d>.31][:20]}
                if max(confidence,pdf_coverage)<.75:out["warnings"].append("PDF/reader mapping not established: "+url+" reader confidence "+str(confidence)+" pdf coverage "+str(pdf_coverage))
                if a.candidates and offset is not None and max(confidence,pdf_coverage)>=.75:
                    for i,x in enumerate(pages):
                        j=i+offset
                        if j<0 or j>=len(doc):continue
                        different_valid_reader=bool(x["valid"] and distance(x["fingerprint"],fingerprints[j])>.31)
                        damaged=bool(not x["valid"] and x["url"] in known)
                        if not (damaged or different_valid_reader):continue
                        original=locate(x["url"]).read_bytes()
                        options=[]
                        for image in doc[j].get_images(full=True):
                            obj=doc.extract_image(image[0]);data=obj.get("image",b"")
                            try:
                                with Image.open(io.BytesIO(data)) as im:
                                    im.load()
                                    dimensions=[im.width,im.height];h=d_hash(im)
                            except Exception:continue
                            if min(dimensions)<500:continue
                            options.append((distance(h,fingerprints[j]),image[0],data,obj.get("ext",""),dimensions))
                        if not options:continue
                        delta,xref,data,ext,dim=min(options,key=lambda z:z[0])
                        if delta>.26 or ext not in ("jpg","jpeg","png","webp"):continue
                        if ext=="jpeg":ext="jpg"
                        dest=pathlib.Path(a.candidates)/slug/("issue-%02d"%num)
                        dest.mkdir(parents=True,exist_ok=True)
                        target=dest/("page-%03d."%(i+1)+ext)
                        target.write_bytes(data)
                        out["pdfCandidates"].append({"reader":x["url"],"candidate":str(target),"reviewReason":"reader-versus-PDF content difference" if different_valid_reader else "truncated published reader JPEG","sourcePdf":url,
                            "pdfPage":j+1,"xref":xref,"dimensions":dim,"sha256":digest(data),
                            "visualDistanceToPDF":round(delta,3),"isBrokenJPEGExactPrefix":data.startswith(original),
                            "requiresCreativeApproval":True})
            else:r["alignment"]="no single-edition reader mapping"
    except Exception as e:
        r["error"]=str(e);out["otherErrors"].append("invalid collected PDF "+url+": "+str(e))
    return r
files=sorted((ROOT/"src/content/series").glob("*.json"))
for p in files:
    s=json.loads(p.read_text());slug=s["slug"]
    pages=s.get("dailyPages",[])
    if [x.get("pageNumber") for x in pages]!=list(range(1,len(pages)+1)):
        out["otherErrors"].append("nonsequential reader order "+slug)
    targets.add("/series/"+slug)
    verified=[]
    for x in pages:
        targets.add("/read/"+slug+"/"+str(x["pageNumber"]))
        verified.append(check_image(x["image"],"reader"))
    collected=[x for x in s.get("releases",[]) if x.get("publicationType")=="E"]
    covers={}
    for release in s.get("releases",[]):
        cover=release.get("cover")
        if cover and cover not in covers:covers[cover]=check_image(cover,"cover")
    sizes=Counter(tuple(x["dimensions"]) for x in verified if x.get("valid") and x.get("dimensions"))
    native_widths=[x["dimensions"][0] for x in verified if x.get("valid") and x.get("dimensions")]
    native_heights=[x["dimensions"][1] for x in verified if x.get("valid") and x.get("dimensions")]
    out["series"].append({"slug":slug,"status":s.get("status"),"readerPages":len(pages),
       "collectedEditions":len(collected),"previewCount":len(s.get("releases",[]))-len(collected),
       "nativeReaderDimensions":{"distribution":[{"width":w,"height":h,"count":n} for (w,h),n in sizes.most_common()],
                                 "minimum":[min(native_widths),min(native_heights)] if native_widths else None,
                                 "maximum":[max(native_widths),max(native_heights)] if native_widths else None,
                                 "embeddedIccCount":sum(bool(x.get("icc")) for x in verified if x.get("valid"))},
       "currentReleaseMetadataMatches":s.get("currentRelease") in [r.get("title") for r in s.get("releases",[])] if collected else None})
    for release in collected:
        if release["catalogId"] in seen:out["otherErrors"].append("duplicate collected catalog ID "+release["catalogId"])
        seen.add(release["catalogId"])
        num=release.get("issueNumber")
        if not isinstance(num,int):out["otherErrors"].append("missing issue number "+release["catalogId"]);continue
        pdf=check_pdf(release["externalLink"],slug,num,verified,len(collected)==1)
        cover=covers.get(release["cover"],{})
        damaged=[x["url"] for x in verified if not x["valid"]]
        out["editions"].append({"catalogId":release["catalogId"],"series":slug,"title":release["title"],
            "issueNumber":num,"releaseDate":release.get("releaseDate"),"historicalPublished":True,
            "readerPages":len(verified),"damagedReaderPages":damaged,"cover":{k:v for k,v in cover.items() if k!="fingerprint"},
            "pdf":pdf,"technicalHealthy":bool(pdf["valid"] and cover.get("valid") and not damaged),
            "masteringCertified":False})
def probe(url):
    base=os.environ.get("VISIONS_PUBLIC_SITE_URL","https://star-splitter-visions.vercel.app").rstrip("/")
    route=url in ("/","/series") or url.startswith("/series/") or url.startswith("/read/")
    try:
        req=urllib.request.Request(base+url,headers={"Range":"bytes=0-511","User-Agent":"StarSplitterReleaseAudit/1"})
        with urllib.request.urlopen(req,timeout=14) as resp:
            body=resp.read(2048);ctype=resp.headers.get("Content-Type","")
            ok=resp.status in (200,206)
            if route:ok=ok and "text/html" in ctype and (b'id="root"' in body or b"id='root'" in body)
            else:ok=ok and (body.startswith(b"%PDF") or body.startswith(b"\xff\xd8") or body.startswith(b"\x89PNG") or body.startswith(b"RIFF"))
            return {"path":url,"status":resp.status,"type":ctype,"ok":bool(ok)}
    except Exception as e:return {"path":url,"ok":False,"error":str(e)}
if a.live:
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:out["live"]=sorted(pool.map(probe,sorted(targets)),key=lambda x:x["path"])
    for x in out["live"]:
        if not x["ok"]:out["otherErrors"].append("deployment route/asset invalid "+x["path"]+": "+str(x.get("error",x.get("status"))))
failed={x["path"] for x in out["corrupt"]}
out["knownDamaged"]=sorted(failed.intersection(known))
out["unexpectedDamaged"]=sorted(failed.difference(known))
out["healthy"]=not failed and not out["otherErrors"]
out["totals"]={"series":len(files),"collectedEditions":len(out["editions"]),"registeredReaderPages":sum(x["readerPages"] for x in out["series"])}
if a.strict and failed:out["otherErrors"].append("STRICT FAILURE: damaged published images "+str(len(failed)))
if a.expect_known and failed!=set(known):out["otherErrors"].append("Known-damage baseline changed: expected exactly six current defects")
if a.report:
    dst=pathlib.Path(a.report);dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(json.dumps(out,indent=2))
print("RELEASE_REGISTER "+json.dumps({"totals":out["totals"],"damaged":out["knownDamaged"],
   "unexpected":out["unexpectedDamaged"],"errors":out["otherErrors"],
   "pdfCandidates":out["pdfCandidates"],
   "editions":[{"catalogId":e["catalogId"],"healthy":e["technicalHealthy"],"pdfPages":e["pdf"].get("pageCount"),
     "alignment":e["pdf"].get("alignment"),"damaged":e["damagedReaderPages"]} for e in out["editions"]]}))
sys.exit(1 if out["otherErrors"] else 0)
