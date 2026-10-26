import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(join(root,path),'utf8');
function files(dir){return readdirSync(join(root,dir),{withFileTypes:true}).flatMap(x=>{
 const path=join(dir,x.name);return x.isDirectory()?files(path):/\.(html|js|xml|txt)$/.test(x.name)?[path]:[];
});}
test('All published site references use the new domains',()=>{
 const items=[...files('main'),...files('shopify')];
 for(const path of items){
  const content=read(path);
  if(path==='shopify/_worker.js')continue; // intentionally detects old host for 301 redirect
  assert.doesNotMatch(content,/machostudio\.dpdns\.org/i,path+' contains obsolete hostname');
 }
});
test('Main site links and redirects use shopify.macho.studio',()=>{
 const homepage=read('main/index.html');
 assert.match(homepage,/href="https:\/\/shopify\.macho\.studio\//);
 const worker=read('main/_worker.js');
 assert.match(worker,/"\/practice-shopify":"https:\/\/shopify\.macho\.studio\//);
 const redirects=read('main/_redirects');
 assert.match(redirects,/\/shopify https:\/\/shopify\.macho\.studio\/ 301/);
});
test('Shopify canonical, social URLs, structured data, sitemap and robots point at the new hostname',()=>{
 const homepage=read('shopify/index.html');
 assert.match(homepage,/rel="canonical" href="https:\/\/shopify\.macho\.studio\//);
 assert.match(homepage,/property="og:url" content="https:\/\/shopify\.macho\.studio\//);
 assert.match(homepage,/"url":"https:\/\/shopify\.macho\.studio\//);
 assert.match(homepage,/"url":"https:\/\/macho\.studio\//);
 const sitemap=read('shopify/sitemap.xml'),robots=read('shopify/robots.txt');
 assert.match(robots,/Sitemap: https:\/\/shopify\.macho\.studio\/sitemap\.xml/);
 const loc=[...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><\/url>/g)].map(x=>x[1]);
 assert.ok(loc.length>=10,'Shopify sitemap entries missing');
 assert.equal(new Set(loc).size,loc.length);
 assert.ok(loc.every(x=>x.startsWith('https://shopify.macho.studio/')));
});
test('Old Shopify host safely redirects website GET paths and preserves the query string',async()=>{
 const source=read('shopify/_worker.js');
 const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
 const env={ASSETS:{fetch:async()=>new Response('static')}};
 const ctx={waitUntil:()=>{}};
 const legacy='https://shopify.machostudio.dpdns.org/work/?ref=old';
 const r=await worker.fetch(new Request(legacy),env,ctx);
 assert.equal(r.status,301);
 assert.equal(r.headers.get('location'),'https://shopify.macho.studio/work/?ref=old');
 const modern=await worker.fetch(new Request('https://shopify.macho.studio/work/'),env,ctx);
 assert.equal(modern.status,200);
 assert.equal(await modern.text(),'static');
});
