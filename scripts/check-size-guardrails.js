#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const FAIL_MODE = process.argv.includes('--fail');
const ROOT_DIR = process.cwd();

const LIMITS = {
  jsLines: 250,
  cssLines: 350,
  functionLines: 120,
  fileBytes: 20 * 1024,
};

const SCAN_EXTENSIONS = new Set(['.js', '.jsx', '.css']);
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  path.join('public', 'content'),
  path.join('public', 'images'),
]);

const oversizedFiles = [];
const oversizedFunctions = [];

function shouldIgnoreDir(relativeDir) {
  if (!relativeDir || relativeDir === '.') return false;

  const normalized = relativeDir.split(path.sep).join('/');
  if (IGNORE_DIRS.has(normalized)) return true;

  return normalized.split('/').some((segment) => IGNORE_DIRS.has(segment));
}

function countLines(text) {
  if (!text) return 0;
  return text.split(/\r?\n/).length;
}

function detectFunctionBlocks(content) {
  const detections = [];
  const patterns = [
    /(?:export\s+default\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g,
    /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{/g,
    /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?[A-Za-z_$][\w$]*\s*=>\s*\{/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      const braceIndex = content.indexOf('{', match.index);
      if (braceIndex === -1) continue;

      let depth = 0;
      let endIndex = -1;
      for (let i = braceIndex; i < content.length; i += 1) {
        const char = content[i];
        if (char === '{') depth += 1;
        if (char === '}') {
          depth -= 1;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex === -1) continue;

      const before = content.slice(0, match.index);
      const block = content.slice(match.index, endIndex + 1);
      const startLine = countLines(before);
      const lineCount = countLines(block);

      detections.push({ name, startLine, lineCount });
    }
  }

  return detections;
}

function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      if (shouldIgnoreDir(relativePath)) continue;
      scanDirectory(fullPath);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!SCAN_EXTENSIONS.has(ext)) continue;

    const inSrc = relativePath.startsWith(`src${path.sep}`);
    const inScripts = relativePath.startsWith(`scripts${path.sep}`);
    if (!inSrc && !inScripts) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const stat = fs.statSync(fullPath);
    const lineCount = countLines(content);

    const maxLines = ext === '.css' ? LIMITS.cssLines : LIMITS.jsLines;
    if (lineCount > maxLines) {
      oversizedFiles.push({
        relativePath: relativePath.split(path.sep).join('/'),
        reason: `${lineCount} lines`,
      });
    }

    if (stat.size > LIMITS.fileBytes) {
      oversizedFiles.push({
        relativePath: relativePath.split(path.sep).join('/'),
        reason: `${stat.size} bytes`,
      });
    }

    if (ext === '.js' || ext === '.jsx') {
      const functions = detectFunctionBlocks(content);
      for (const fn of functions) {
        if (fn.lineCount > LIMITS.functionLines) {
          oversizedFunctions.push({
            relativePath: relativePath.split(path.sep).join('/'),
            name: fn.name,
            lineCount: fn.lineCount,
          });
        }
      }
    }
  }
}

for (const baseDir of ['src', 'scripts']) {
  const target = path.join(ROOT_DIR, baseDir);
  if (fs.existsSync(target)) {
    scanDirectory(target);
  }
}

console.log('Size Guardrails Report\n');

if (oversizedFiles.length === 0 && oversizedFunctions.length === 0) {
  console.log('No oversized files or functions found.');
  process.exit(0);
}

if (oversizedFiles.length > 0) {
  console.log('Oversized files:');
  for (const file of oversizedFiles) {
    console.log(`- ${file.relativePath} — ${file.reason}`);
  }
  console.log('');
}

if (oversizedFunctions.length > 0) {
  console.log('Oversized functions/components:');
  for (const fn of oversizedFunctions) {
    console.log(`- ${fn.relativePath} ${fn.name} — ${fn.lineCount} lines`);
  }
  console.log('');
}

console.log('Suggested action:');
console.log('Split oversized files/functions before adding new behavior.');

if (FAIL_MODE) {
  process.exit(1);
}
