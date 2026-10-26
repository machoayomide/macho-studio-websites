import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';

const main=resolve(import.meta.dirname,'../main');
const source=readFileSync(join(main,'_worker.js'),'utf8');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
const origin='https://macho.studio';
const fields={
 name:'Example Client',email:'client@example.org',service:'CRM & Integrations',
 timeline:'Within a month',budget:'Not decided',message:'Need help integrating our CRM with a storefront.',
 website:''
};
const mockEnv=send=>({
 CONTACT_TO_EMAIL:'owner@example.com',
 EMAIL:{send},
 ASSETS:{fetch:async()=>new Response('static',{status:200})}
});
async function submit(data=fields,env=mockEnv(async()=>({messageId:'test-accepted'})),originHeader=origin) {
 const req=new Request(origin+'/api/enquiry',{
  method:'POST',headers:{Origin:originHeader,'Content-Type':'application/json'},
  body:JSON.stringify(data)
 });
 const res=await worker.fetch(req,env,{waitUntil:()=>{}});
 return {status:res.status,body:await res.json()};
}
test('MACHO accepts a valid enquiry and sends a real provider request',async()=>{
 let sent=null;
 const r=await submit(fields,mockEnv(async data=>{sent=data;return {messageId:'accepted-123'}}));
 assert.equal(r.status,202);
 assert.equal(r.body.ok,true);
 assert.equal(sent.to,'owner@example.com');
 assert.equal(sent.replyTo,fields.email);
 assert.match(sent.text,/CRM & Integrations/);
 assert.match(sent.text,/integrating our CRM/);
});
test('Email draft is never marked sent when provider is missing',async()=>{
 const r=await submit(fields,{CONTACT_TO_EMAIL:'owner@example.com',ASSETS:{fetch:async()=>null}});
 assert.equal(r.status,503);
 assert.notEqual(r.body.ok,true);
});
test('Do not claim success when mail provider rejects',async()=>{
 const r=await submit(fields,mockEnv(async()=>{throw Error('provider unavailable')}));
 assert.equal(r.status,502);assert.notEqual(r.body.ok,true);
});
test('Reject cross-origin and malformed enquiries before email delivery',async()=>{
 let sent=0;
 const env=mockEnv(async()=>{sent++;return {messageId:'x'}});
 const wrongOrigin=await submit(fields,env,'https://malicious.example');
 const bad=await submit({...fields,message:'short'},env);
 const bot=await submit({...fields,website:'www.fake.example'},env);
 const badEmail=await submit({...fields,email:'bad\r\nbcc@example.org'},env);
 assert.equal(wrongOrigin.status,403);
 assert.equal(bad.status,400);
 assert.equal(bot.status,400);
 assert.equal(badEmail.status,400);
 assert.equal(sent,0);
});
test('Does not write enquiry contents to activity storage',async()=>{
 const entries=[];
 const env={...mockEnv(async()=>({messageId:'confirmed'})),
  ACTIVITY_LOG:{get:async()=>null,put:async(...args)=>entries.push(args)}};
 const r=await submit(fields,env);
 assert.equal(r.status,202);
 assert.equal(entries.length,0); // No CF-Connecting-IP in synthetic request
});
test('Unrelated assets still pass through the advanced-mode Pages worker',async()=>{
 const env=mockEnv(async()=>({messageId:'x'}));
 const res=await worker.fetch(new Request(origin+'/about'),env,{waitUntil:()=>{}});
 assert.equal(await res.text(),'static');
});
