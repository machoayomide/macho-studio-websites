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
test('MACHO contact and popup submit securely while public direct email links remain',()=>{
 assert.match(read('main/index.html'),/mailto:hello@macho\.studio/);
 assert.match(read('shopify/index.html'),/mailto:hello@macho\.studio/);
 assert.match(read('main/contact.html'),/id="macho-static-contact"/);
 assert.match(read('main/contact.html'),/Send enquiry/);
 assert.doesNotMatch(read('main/contact.html'),/id="macho-email-link"/);
 const handoff=read('main/assets/js/contact-handoff.js');
 const popup=read('main/assets/js/launch-ready.js');
 const api=read('main/assets/js/enquiry-api.js');
 const worker=read('main/_worker.js');
 assert.match(handoff,/sendEnquiry\(values\)/);
 assert.match(popup,/sendEnquiry\(values\)/);
 assert.doesNotMatch(handoff,/mailto:/);
 assert.doesNotMatch(popup,/mailto:contact@macho\.studio/);
 assert.match(api,/fetch\('\/api\/enquiry'/);
 assert.match(worker,/if\(path==="\/api\/enquiry"\)return sendEnquiry\(request,env\)/);
 assert.match(worker,/env\.EMAIL\.send/);
 assert.match(worker,/env\.RESEND_API_KEY/);
 assert.match(read('shopify/contact/index.html'),/id="send-email"[^>]*href="mailto:contact@macho\.studio"/);
 for(const path of ['shopify/assets/site.js','shopify/assets/store-check.js']){
  assert.match(read(path),/mailto:contact@macho\.studio/,path);
 }
});
