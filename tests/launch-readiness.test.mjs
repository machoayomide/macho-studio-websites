import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join, resolve} from 'node:path';

const base=resolve(import.meta.dirname,'../main');
const htmlNames=readdirSync(base).filter(name=>name.endsWith('.html'));
const read=name=>readFileSync(join(base,name),'utf8');
const routes=new Set(['/services/apps','/services/web','/services/wix','/services/crm','/services/automation','/shopify','/services/shopify','/practice-shopify']);
function available(local){
 if(local==='/')return true;
 const path=join(base,local);
 return existsSync(path)||existsSync(path+'.html')||existsSync(join(path,'index.html'))||routes.has(local);
}
test('portfolio pages include accessible progressive launch assets',()=>{
 for(const name of htmlNames){
  const html=read(name);
  assert.match(html,/<!doctype html>/i,name+' doctype');
  assert.match(html,/launch-ready\.css/,name+' stylesheet');
  assert.match(html,/launch-ready\.js/,name+' progressive script');
  assert.doesNotMatch(html,/https:\/\/machostudio\.dpdns\.org/i,name+' old main domain');
  if(name!=='practice-shopify.html'&&name!=='404.html'){
   const slug=name==='index.html'?'/':'/'+name.replace(/\.html$/,'');
   assert.ok(html.includes('rel="canonical" href="https://macho.studio'+slug+'"'),name+' canonical');
  }
 }
});
test('internal links and assets point to existing routes or files',()=>{
 for(const name of htmlNames){
  const html=read(name);
  for(const match of html.matchAll(/\b(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
   assert.ok(available(match[1]),name+' missing '+match[1]);
  }
 }
});
test('project pages do not misrepresent a portfolio archive as public source code',()=>{
 for(const name of htmlNames.filter(x=>x.startsWith('case-'))){
  assert.doesNotMatch(read(name),/Original portfolio source ↗/);
  assert.match(read(name),/class="study-main"/);
 }
});
test('sitemap matches canonical indexable pages',()=>{
 const sitemap=readFileSync(join(base,'sitemap.xml'),'utf8');
 const locs=[...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><\/url>/g)].map(x=>x[1]);
 const indexed=htmlNames.filter(x=>!['404.html','practice-shopify.html'].includes(x));
 assert.equal(locs.length,indexed.length);
 assert.equal(new Set(locs).size,locs.length);
 for(const name of indexed){
  const url='https://macho.studio'+(name==='index.html'?'/':'/'+name.replace(/\.html$/,''));
  assert.ok(locs.includes(url),name+' missing from sitemap');
 }
 assert.match(readFileSync(join(base,'robots.txt'),'utf8'),/Sitemap: https:\/\/macho\.studio\/sitemap\.xml/);
});
test('the project and enquiry dialogs plus opt-in activity are installed',()=>{
 const js=readFileSync(join(base,'assets/js/launch-ready.js'),'utf8');
 assert.match(js,/dialog\.showModal\(\)/);
 assert.match(js,/macho-quick-form/);
 assert.match(js,/visitor-activity\.js/);
 const activity=readFileSync(join(base,'assets/js/visitor-activity.js'),'utf8');
 assert.match(activity,/macho_activity_consent_v1/);
 assert.match(activity,/project_view/);
 const css=readFileSync(join(base,'assets/css/launch-ready.css'),'utf8');
 assert.match(css,/macho-footer-redesign/);
 assert.match(css,/macho-skills-grid/);
 assert.ok(existsSync(join(base,'assets/portraits/macho-original-20261026.png')));
});
