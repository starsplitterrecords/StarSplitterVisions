#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildSeriesPath,buildReaderPath,parseReaderPath} from '../src/utils/routes.js';
const settings=JSON.parse(fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
assert.equal(settings.version,2,'Expected Vercel config schema');
assert(Array.isArray(settings.rewrites),'Missing Vercel SPA rewrite definitions');
const rules=new Map(settings.rewrites.map(x=>[x.source,x.destination]));
const expected=['/series','/series/:slug','/read/:slug/:page','/about','/contact','/press'];
assert.equal(rules.size,expected.length,'Review any new/deleted route rule');
for(const route of expected)assert.equal(rules.get(route),'/index.html','SPA route missing rewrite '+route);
for(const forbidden of ['/images/:path*','/issues/:path*','/:path*','/(.*)']){
 assert(!rules.has(forbidden),'Do not rewrite binary/public assets or unrecognized routes to HTML');
}
const slug='rex-fleet',page=3;
assert.equal(buildSeriesPath(slug),'/series/rex-fleet');
assert.equal(buildReaderPath(slug,page),'/read/rex-fleet/3');
assert.deepEqual(parseReaderPath('/read/rex-fleet/3'),{seriesSlug:'rex-fleet',pageNumber:3});
console.log('PASS explicit Vercel SPA deep links; public image and issue paths excluded from rewrites');