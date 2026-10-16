import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve,join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = resolve(process.env.QA_HOSTED_ROOT || '../accessease');
const {default:worker} = await import(pathToFileURL(join(root,'dist/server/index.js')));
const expected = JSON.parse(await readFile(join(root,'qa/hosted-asset-hashes.json'),'utf8'));
const hash = bytes=>createHash('sha256').update(Buffer.from(bytes)).digest('hex');
const get = (path,init={})=>worker.fetch(new Request(`https://a11yease.example${path}`,init),{});
test('hosted Worker preserves React routes, HEAD, assets and missing API semantics',async()=>{
  for(const path of ['/','/features','/how-it-works','/about','/contact','/faq','/privacy','/terms','/not-found']){
    const response=await get(path,{headers:{accept:'text/html'}});
    assert.equal(response.status,200); assert.equal(hash(await response.arrayBuffer()),expected['/index.html']);
  }
  const head=await get('/contact',{method:'HEAD',headers:{accept:'text/html'}});assert.equal(await head.text(),'');
  assert.equal((await get('/api/missing',{headers:{accept:'text/html'}})).status,404);
  assert.equal((await get('/images/missing.png')).status,404);
  assert.equal((await get('/contact',{method:'POST'})).status,405);
});
test('embedded frontend assets are byte-identical to the Vite output',async()=>{
  for(const [path,digest] of Object.entries(expected)){
      const response=await get(path);
      assert.equal(response.status,200); assert.equal(hash(await response.arrayBuffer()),digest);
      assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
  }
});
test('hosted contact API denies requests before configuration rather than returning the SPA',async()=>{
  const response=await get('/api/contact',{method:'POST',headers:{origin:'https://a11yease.example','Content-Type':'application/json'},body:'{}'});
  assert.equal(response.status,403);assert.equal((await response.json()).success,false);
});
