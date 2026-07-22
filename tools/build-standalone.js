#!/usr/bin/env node
/* build-standalone.js — bundle the multi-file game into a single self-contained
   HTML file: no CDNs, no runtime Babel, fonts embedded as data URIs.

   Usage:  cd tools && npm install && node build-standalone.js

   Outputs (in dist/):
     candy-quest-standalone.html — full document; open directly in a browser
     candy-quest-artifact.html   — body-only variant for hosts that wrap the
                                   file in their own <head>/<body> skeleton
                                   (e.g. Claude artifacts)

   How it works:
   - the two <script type="text/babel"> blocks in index.html are precompiled
     with @babel/preset-react, replacing babel-standalone
   - each compiled block is wrapped in an IIFE: babel-standalone evaluated the
     blocks in isolated scopes (they talk through window.*), and as plain
     scripts their top-level const/function declarations would collide
   - production React/ReactDOM UMDs are inlined in place of the unpkg dev builds
   - candy.css + game.css + the head <style> keyframes are inlined
   - the game's Google Fonts (latin subsets, used weights only) come from the
     @fontsource packages and are embedded as woff2 data URIs */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOT = path.join(__dirname, '..');
const NM = path.join(__dirname, 'node_modules');
const OUT = path.join(ROOT, 'dist');
const read = (p) => fs.readFileSync(p, 'utf8');
const b64 = (p) => fs.readFileSync(p).toString('base64');

const html = read(path.join(ROOT, 'index.html'));

/* ---- extract the pieces of index.html ---- */
const blocks = [...html.matchAll(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (blocks.length !== 2) throw new Error(`expected 2 text/babel blocks, found ${blocks.length}`);
const headStyle = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const buildScript = html.match(/<script>\s*(window\.CQ_BUILD[\s\S]*?)<\/script>/)[1];

/* ---- precompile JSX ---- */
const [sprites, engine] = blocks.map((code) => babel.transformSync(code, {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  compact: false, babelrc: false, configFile: false,
}).code);

/* ---- fonts: latin subsets, only the weights the game uses ---- */
const fonts = [
  ['Baloo 2', 'baloo-2/files/baloo-2-latin-600-normal.woff2', 600],
  ['Baloo 2', 'baloo-2/files/baloo-2-latin-700-normal.woff2', 700],
  ['Baloo 2', 'baloo-2/files/baloo-2-latin-800-normal.woff2', 800],
  ['Fredoka', 'fredoka/files/fredoka-latin-400-normal.woff2', 400],
  ['Fredoka', 'fredoka/files/fredoka-latin-500-normal.woff2', 500],
  ['Fredoka', 'fredoka/files/fredoka-latin-600-normal.woff2', 600],
  ['Fredoka', 'fredoka/files/fredoka-latin-700-normal.woff2', 700],
  ['Lilita One', 'lilita-one/files/lilita-one-latin-400-normal.woff2', 400],
  ['Space Mono', 'space-mono/files/space-mono-latin-400-normal.woff2', 400],
  ['Space Mono', 'space-mono/files/space-mono-latin-700-normal.woff2', 700],
];
const fontCss = fonts.map(([fam, file, wght]) =>
  `@font-face{font-family:'${fam}';font-style:normal;font-weight:${wght};font-display:swap;` +
  `src:url(data:font/woff2;base64,${b64(path.join(NM, '@fontsource', file))}) format('woff2')}`
).join('\n');

const react = read(path.join(NM, 'react/umd/react.production.min.js'));
const reactDom = read(path.join(NM, 'react-dom/umd/react-dom.production.min.js'));

/* inline scripts must not contain a closing script tag */
for (const [name, s] of [['react', react], ['react-dom', reactDom], ['sprites', sprites], ['engine', engine], ['head script', buildScript]]) {
  if (/<\/script/i.test(s)) throw new Error(`</script> found in inlined ${name}`);
}

/* ---- assemble ---- */
const body = `<title>Candy Quest</title>
<style>
${fontCss}
${read(path.join(ROOT, 'candy.css'))}
${read(path.join(ROOT, 'game.css'))}
${headStyle}
</style>
<script>
document.body.classList.add('cq');
${buildScript}
</script>
<div id="app"></div>
<div class="rotate-hint">🔄 Rotate your device to landscape to play</div>
<script>${react}</script>
<script>${reactDom}</script>
<script>
(function(){
${sprites}
})();
</script>
<script id="engine-script">
(function(){
${engine}
})();
</script>
`;

const full = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
<meta name="mobile-web-app-capable" content="yes" />
</head>
<body>
${body}</body>
</html>
`;

fs.mkdirSync(OUT, { recursive: true });
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + 'KB';
fs.writeFileSync(path.join(OUT, 'candy-quest-standalone.html'), full);
fs.writeFileSync(path.join(OUT, 'candy-quest-artifact.html'), body);
console.log('dist/candy-quest-standalone.html', kb(full));
console.log('dist/candy-quest-artifact.html  ', kb(body));
