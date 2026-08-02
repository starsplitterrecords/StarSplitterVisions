# Records asset upload

The Records content references exactly 72 artwork files and one motion file. These binary files were never committed to the repository and must be uploaded once.

## Artwork

Upload the existing `artists`, `releases`, and `worlds` folders into:

`sites/records/public/images/records`

Keep every filename and subfolder unchanged. The expected totals are 23 artist images, 30 release images, and 19 world images.

## Motion

Upload `star-splitter-rex-motion.mp4` into:

`sites/records/public/media/records`

## Verification

After GitHub finishes committing the upload, the **Validate both sites / Star Splitter Records content** check will run the strict production build automatically when all 72 artwork files are present. The strict build also verifies every filename referenced by the CMS content, including the motion file.
