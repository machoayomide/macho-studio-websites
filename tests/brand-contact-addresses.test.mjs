import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(join(root,path),'utf8');
function sourceFiles(dir){
 return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const path=join(dir,entry.name);
  return entry.isDirectory()?sourceFiles(path):/\.(html|js)$/.test(entry.name)?[path]:[];
 });
}
test('All site content uses the MACHO brand emails, not the former Gmail contact',()=>{
 for(const site of ['main','shopify']){
  for(const path of sourceFiles(join(root,site))) {
   const text=readFileSync(path,'utf8');
   assert.ok(!text.includes('machomanexpert@gmail.com'),path+' still shows the legacy email');
  }
 }
});
test('Public contact addresses and form recipients stay deliberately distinct',()=>{
 assert.match(read('main/index.html'),/mailto:hello@macho\.studio/);
 assert.match(read('shopify/index.html'),/mailto:hello@macho\.studio/);
 assert.match(read('main/contact.html'),/href="mailto:contact@macho\.studio" id="macho-email-link"/);
 assert.match(read('shopify/contact/index.html'),/id="send-email"[^>]*href="mailto:contact@macho\.studio"/);
 for(const path of ['main/assets/js/contact-handoff.js','main/assets/js/launch-ready.js','shopify/assets/site.js','shopify/assets/store-check.js']){
  assert.match(read(path),/mailto:contact@macho\.studio/,path);
 }
});
