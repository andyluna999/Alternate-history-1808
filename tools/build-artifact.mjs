// Bundles the site into a single HTML page (CSS and JS inlined, libraries from
// CDNs) for hosting where only one page plus data files can be published.
//   node tools/build-artifact.mjs <out-dir>
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2] || 'dist';
fs.mkdirSync(path.join(out, 'data'), { recursive: true });
let html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
html = html.replace('<link rel="stylesheet" href="css/style.css">', `<style>\n${css}</style>`);
html = html.replace('<script src="vendor/d3.min.js"></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>');
html = html.replace('<script src="vendor/topojson-client.min.js"></script>', '<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>');
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, f) => `<script>\n${fs.readFileSync(f, 'utf8')}</script>`);
// The host supplies the document skeleton; keep only head content and body.
html = html.replace(/^<!doctype html>\s*<html[^>]*>\s*<head>\s*/i, '').replace(/<meta charset[^>]*>\s*<meta name="viewport"[^>]*>\s*/, '')
  .replace(/<\/head>\s*<body>\s*/, '').replace(/<\/body>\s*<\/html>\s*$/, '');
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.copyFileSync('data/world.topo.json', path.join(out, 'data/world.topo.json'));
console.log('wrote', path.join(out, 'index.html'), (fs.statSync(path.join(out, 'index.html')).size / 1e3).toFixed(0) + ' kB');
