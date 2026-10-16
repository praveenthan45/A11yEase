// Optional packaging for the existing Sites host. Render uses server/index.mjs.
import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const manifest = JSON.parse(await readFile(join(root,'.openai/hosting.json'),'utf8'));
if (manifest.static) throw new Error('Remove static from the source hosting manifest before building the email Worker.');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.ico':'image/x-icon','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
const assets = {};
async function collect(directory,path='') {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    if (entry.name.startsWith('.') || entry.name === 'server') continue;
    const relative = path + '/' + entry.name;
    if (entry.isDirectory()) await collect(join(directory,entry.name),relative);
    else assets[relative] = {type:mime[extname(entry.name)] || 'application/octet-stream',bytes:(await readFile(join(directory,entry.name))).toString('base64')};
  }
}
await collect(join(root,'dist'));
if (!assets['/index.html']) throw new Error('Build the React frontend first.');
const validation = (await readFile(join(root,'server/contact-validation.mjs'),'utf8')).replace(/^export /gm,'');
const api = (await readFile(join(root,'server/contact-api.mjs'),'utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
const worker = `${validation}\n${api}\nconst assets=${JSON.stringify(assets)};
let contactApi;
export default { async fetch(request,env) {
  const url=new URL(request.url);
  if(url.pathname==='/api/contact') {
    contactApi ||= createContactApi({env});
    return contactApi(request,request.headers.get('cf-connecting-ip') || request.headers.get('oai-authenticated-user-id') || 'unknown');
  }
  if(url.pathname.startsWith('/api/')) return new Response(null,{status:404});
  if(!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405});
  let path;
  try { path=decodeURIComponent(url.pathname); } catch { return new Response(null,{status:400}); }
  if(path==='/') path='/index.html';
  let asset=assets[path];
  if(!asset && request.headers.get('accept')?.includes('text/html')) { asset=assets['/index.html']; path='/index.html'; }
  if(!asset) return new Response(null,{status:404});
  const bytes=request.method==='HEAD' ? null : Uint8Array.from(atob(asset.bytes),character=>character.charCodeAt(0));
  return new Response(bytes,{headers:{'Content-Type':asset.type,'Cache-Control':path==='/index.html' ? 'no-cache' : path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
}};
`;
await mkdir(join(root,'dist/server'),{recursive:true});
await mkdir(join(root,'dist/.openai'),{recursive:true});
await writeFile(join(root,'dist/server/index.js'),worker);
await writeFile(join(root,'dist/.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');
await mkdir(join(root,'qa'),{recursive:true});
await writeFile(join(root,'qa/hosted-asset-hashes.json'),JSON.stringify(Object.fromEntries(Object.entries(assets).map(([path,asset])=>[path,createHash('sha256').update(Buffer.from(asset.bytes,'base64')).digest('hex')]))));
// The Worker artifact contains its entrypoint and manifest only; assets are embedded above.
const outputRoot=resolve(root,'dist');
for(const entry of await readdir(outputRoot)) {
  if(['server','.openai'].includes(entry)) continue;
  const target=resolve(outputRoot,entry);
  if(!target.startsWith(outputRoot+sep)) throw new Error('Refusing to remove an output outside dist.');
  await rm(target,{recursive:true,force:true});
}
console.log(`Built Sites email Worker with ${Object.keys(assets).length} embedded frontend assets (${Math.round(Buffer.byteLength(worker)/1024)} KB).`);
