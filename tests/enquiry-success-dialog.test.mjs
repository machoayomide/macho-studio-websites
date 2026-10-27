import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../main');
const read=path=>readFileSync(join(root,path),'utf8');

test('enquiry success appears as a modal, not a new page redirect',()=>{
 const module=read('assets/js/enquiry-success.js');
 const css=read('assets/css/enquiry-success.css');
 assert.match(module,/document\.createElement\('dialog'\)/);
 assert.match(module,/showModal\(\)/);
 assert.match(module,/macho-success-close/);
 assert.match(module,/macho-success-steps/);
 assert.match(module,/Thanks!/);
 assert.match(module,/email service/);
 assert.match(css,/max-width:1120px/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/max-height:100dvh/);
 assert.ok(!existsSync(join(root,'thank-you.html')),'thank-you must not redirect to another page');
 assert.doesNotMatch(module,/location\.(assign|replace|href)\s*=/);
});

test('both forms show the dialog only after enquiry accepted by provider',()=>{
 for(const path of ['assets/js/contact-handoff.js','assets/js/launch-ready.js']){
  const content=read(path);
  const accepted=content.indexOf('await sendEnquiry(values)');
  const popup=content.indexOf('showEnquirySuccess()',accepted);
  assert.ok(accepted>=0,path+' missing email acceptance wait');
  assert.ok(popup>accepted,path+' must display popup after accepted email');
  assert.match(content,/let accepted=false/);
  assert.match(content,/if\(accepted\)/);
  assert.doesNotMatch(content,/location\.(assign|replace|href)\s*=/);
 }
});

test('all static portfolio pages load current popup script and Contact page loads current form',()=>{
 for(const file of readdirSync(root).filter(f=>f.endsWith('.html'))){
  const html=read(file);
  assert.match(html,/launch-ready\.js\?v=20261027-success1/,file);
 }
 assert.match(read('contact.html'),/contact-handoff\.js\?v=20261027-success1/);
});
