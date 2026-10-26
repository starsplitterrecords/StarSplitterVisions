#!/usr/bin/env python3
"""Generate a REVIEW-ONLY branch from exact approved collected-PDF embedded image bytes."""
import hashlib, io, json, pathlib, sys
import fitz
from PIL import Image,ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES=False
ROOT=pathlib.Path(__file__).resolve().parents[1]
PUBLIC=ROOT/"public"
SHA=lambda b:hashlib.sha256(b).hexdigest()
SOURCE={
 "rex-fleet":{"pdf":"issues/rex-fleet/issue-01/rex-fleet-issue-01-green-corridor.pdf",
              "sha":"93bf8060a244194f1d12e545d79a4871b51fcdb6880e1d93439fde6f3d8c6154"},
 "stardust-station":{"pdf":"issues/stardust-station/issue-01/stardust-station-issue-01-mandatory-proximity.pdf",
              "sha":"efb75508b207ff0e8dd60b3c47c973798bcee942b66178ba9192187cee73977d"}
}
PAGES={
 "rex-fleet":[(2,3,7,"ceed0f62b79a47ed86e1764534701d286d0547a8f1acdcab3913d010de46aabe", (864,1296)),
              (4,5,11,"de73a0dc140f8aef7a5b3aaa68ef2c30cd27537e7c8d6f8efd1c99d7ec628c6a",(864,1296)),
              (9,10,21,"0758ff3e36ef8b2497a30d81eb16e65614c908b5624b873a5e8a460a8b826578",(864,1296)),
              (11,12,25,"b965ce56d702f6c0b287bfd92787df29644768def665d0d8e6888ac74c66aa28",(864,1296)),
              (15,16,33,"2e2d4ccb940518f938e24fe22ff1d753bc359f9e8996c7dee60fc53ffa4ba211",(864,1296))],
 "stardust-station":[(20,21,70,"928484c3b59ea79df888685d39d75d81a84150eefea8aca23629f075c52b9792",(1600,2400))]
}
baseline=json.loads((ROOT/"scripts/known-release-defects.json").read_text())["defects"]
recovered=[]
for slug,cfg in SOURCE.items():
    pdf_bytes=(PUBLIC/cfg["pdf"]).read_bytes()
    assert SHA(pdf_bytes)==cfg["sha"],"Published PDF changed; re-audit before candidate creation"
    with fitz.open(stream=pdf_bytes,filetype="pdf") as pdf:
        for reader_num,pdf_num,xref,source_sha,native in PAGES[slug]:
            reader_path=f"/images/pages/{slug}/issue-01/page-{reader_num:03d}.jpg"
            assert reader_path in baseline,"No longer an approved known-defect candidate"
            path=PUBLIC/reader_path.lstrip("/")
            published=path.read_bytes()
            blobsha=hashlib.sha1(b"blob "+str(len(published)).encode()+b"\0"+published).hexdigest()
            assert blobsha==baseline[reader_path]["gitBlobSha"],"Released bytes changed; refuse to overwrite"
            page=pdf[pdf_num-1]
            assert any(x[0]==xref for x in page.get_images(full=True)),"Expected embedded image xref missing"
            extract=pdf.extract_image(xref)
            data=extract["image"]
            assert extract["ext"] in ("jpg","jpeg"),"Source not native JPEG"
            assert SHA(data)==source_sha,"Original embedded art differs from audited evidence"
            with Image.open(io.BytesIO(data)) as im:
                im.verify()
            with Image.open(io.BytesIO(data)) as im:
                im.load()
                assert im.size==native and im.format=="JPEG","Native geometry or encoding mismatch"
                assert im.width==native[0] and im.height==native[1]
            assert data[-2:]==b"\xff\xd9","Recovered image still truncated"
            path.write_bytes(data)
            recovered.append({"path":reader_path,"publishedBrokenBlobSha":blobsha,
                              "sourcePdf":"/"+cfg["pdf"],"sourcePdfSha256":cfg["sha"],"embeddedPdfPage":pdf_num,
                              "sourceImageXref":xref,"sourceImageSha256":source_sha,"originalDimensions":native})
assert len(recovered)==6,"Expected six exact approved-source replacement candidates"
print(json.dumps(recovered,indent=2))
