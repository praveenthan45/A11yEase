import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { buildContactEmails } from '../server/email-templates.mjs';
import { validateContact } from '../server/contact-validation.mjs';
import { createContactApi } from '../server/contact-api.mjs';
import { readContactResponse, createContactPayload } from '../src/lib/contactService.js';

const contact = { fullName:'Jamie Reader', email:'visitor@example.com',organization:'Example',inquiryType:'Product Demo',subject:'A product demo',message:'Please tell me more about A11yEase.',consent:true,website:'',source:'a11yease-contact',formDurationMs:10000,requestId:'a11e0000-1234-4567-8123-123456789abc' };
const origin = 'https://a11yease.example';
const token = 'test-only-not-a-production-secret-12345678';
const env = { CONTACT_SCRIPT_URL:'https://script.google.com/macros/s/test-deployment/exec', CONTACT_SCRIPT_TOKEN:token,CONTACT_ALLOWED_ORIGINS:origin };
const request = (data=contact,headers={}) => new Request(`${origin}/api/contact`,{method:'POST',headers:{origin,'Content-Type':'application/json',...headers},body:JSON.stringify(data)});

test('both emails have the real CID logo, brand, correct routing and text fallback', () => {
  const {owner,visitor} = buildContactEmails(validateContact(contact));
  assert.equal(owner.to,'gen.praveenthan@gmail.com'); assert.equal(owner.replyTo,contact.email);
  assert.equal(visitor.to,contact.email); assert.equal(visitor.replyTo,owner.to);
  for (const email of [owner,visitor]) {
    assert.equal(email.name,'A11yEase'); assert.match(email.htmlBody,/src="cid:a11yeaseLogo"/);
    assert.match(email.htmlBody,/alt="A11yEase logo"/); assert.match(email.htmlBody,/lang="en"/);
    assert.match(email.subject,/A11yEase/); assert.ok(email.body.length > 100);
    assert.doesNotMatch(email.htmlBody,/<script|https?:\/\//);
  }
  assert.match(visitor.body,/as soon as possible/);
  assert.doesNotMatch(visitor.body,/Please tell me more/); // No reflected private inquiry in receipt.
});

test('HTML is escaped and submitted fields cannot override sender or owner', () => {
  const emails = buildContactEmails(validateContact({...contact,fullName:'<img src=x onerror=alert(1)>',message:'<script>alert("x")</script> & details',to:'attacker@example.com'}));
  assert.doesNotMatch(emails.owner.htmlBody,/<script>|<img src=x/);
  assert.match(emails.owner.htmlBody,/&lt;script&gt;/);
  assert.match(emails.visitor.htmlBody,/&lt;img/);
  assert.equal(emails.owner.to,'gen.praveenthan@gmail.com');
});

test('server rejects header injection, multiple recipients, spam, missing consent and overlong input', () => {
  for (const change of [{email:'a@example.com,b@example.com'},{email:'a@example.com\r\nBcc:b@example.com'},{subject:'Hi\r\nBcc: bad'},{fullName:'a'.repeat(121)},{message:'x'.repeat(5001)},{consent:false},{website:'bot'},{formDurationMs:1},{inquiryType:'Unknown'},{requestId:'invalid'}]) assert.throws(() => validateContact({...contact,...change}));
  assert.equal(validateContact({...contact,email:'reader+demo@example.co.uk'}).email,'reader+demo@example.co.uk');
});

test('API validates origin, content type, body size and mail config before sending', async () => {
  let calls=0; const api=createContactApi({env,fetchImpl:async()=>{calls++;throw new Error();}});
  assert.equal((await api(request(contact,{origin:'https://evil.example'}),'a')).status,403);
  assert.equal((await api(request(contact,{'Content-Type':'text/plain'}),'a')).status,415);
  assert.equal((await api(request({...contact,message:'x'.repeat(17000)}),'a')).status,413);
  assert.equal((await api(request({...contact,email:'bad'}),'a')).status,400);
  assert.equal((await createContactApi({env:{}})(request(),'a')).status,403);
  assert.equal((await createContactApi({env:{CONTACT_ALLOWED_ORIGINS:origin}})(request(),'a')).status,503);
  assert.equal(calls,0);
});

test('API sends secrets only to Google, rate limits and exposes no secret in responses', async () => {
  let sent;
  const api=createContactApi({env,fetchImpl:async(url,options)=>{sent={url,body:JSON.parse(options.body)};return Response.json({success:true,ownerAccepted:true,confirmationAccepted:true});}});
  const result=await api(request(),'a');
  assert.equal(result.status,202); assert.equal(result.headers.get('Access-Control-Allow-Origin'),origin);
  assert.equal(sent.url,env.CONTACT_SCRIPT_URL); assert.equal(sent.body.token,token);
  assert.equal(sent.body.contact.requestId,contact.requestId); assert.doesNotMatch(await result.text(),new RegExp(token));
  for(let i=0;i<4;i++) await api(request(),'a');
  assert.equal((await api(request(),'a')).status,429);
});

test('API and UI distinguish partial email failure, uncertainty and false success', async () => {
  for (const confirmationAccepted of [true,false]) {
    const api=createContactApi({env,fetchImpl:async()=>Response.json({success:true,ownerAccepted:true,confirmationAccepted})});
    assert.equal(await readContactResponse(await api(request()),'/api/contact'),confirmationAccepted ? 'accepted-with-confirmation':'accepted-without-confirmation');
  }
  const uncertain=createContactApi({env,fetchImpl:async()=>{throw new Error('timeout');}});
  await assert.rejects(readContactResponse(await uncertain(request()),'/api/contact'),/delivery-unknown/);
  for (const data of [{success:false},{success:true},{success:true,ownerAccepted:true}]) await assert.rejects(readContactResponse(Response.json(data),'/api/contact'),/failed/);
  assert.equal(createContactPayload(contact,5000,'/api/contact',contact.requestId).requestId,contact.requestId);
});

const code = await readFile(new URL('../integrations/google-apps-script/Code.gs',import.meta.url),'utf8');
function scriptFixture({ failOn=0,quota=100 }={}) {
  const properties=new Map([['CONTACT_SCRIPT_TOKEN',token]]),cache=new Map(),sent=[];
  const globals={
    PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties.get(key),setProperty:(key,value)=>properties.set(key,value),getProperties:()=>Object.fromEntries(properties),deleteProperty:key=>properties.delete(key)})},
    CacheService:{getScriptCache:()=>({get:key=>cache.get(key),put:(key,value)=>cache.set(key,value)})},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
    Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,text)=>text,base64EncodeWebSafe:value=>Buffer.from(value).toString('base64url'),base64Decode:value=>Buffer.from(value,'base64'),newBlob:(bytes,type,name)=>({bytes,type,name})},
    MailApp:{getRemainingDailyQuota:()=>quota,sendEmail:email=>{if(sent.length+1===failOn)throw new Error('send failed');sent.push(email);}},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this;}})},
  };
  runInNewContext(code,globals);
  const submit=(input=contact,suppliedToken=token)=>JSON.parse(globals.doPost({postData:{contents:JSON.stringify({token:suppliedToken,contact:input})}}).text);
  return {submit,sent,properties};
}

test('actual generated Apps Script sends two branded emails and deduplicates retries', () => {
  const fixture=scriptFixture(); const result=fixture.submit();
  assert.equal(result.confirmationAccepted,true); assert.equal(fixture.sent.length,2);
  for (const mail of fixture.sent) {
    assert.equal(mail.inlineImages.a11yeaseLogo.type,'image/png');
    assert.equal(Buffer.from(mail.inlineImages.a11yeaseLogo.bytes).subarray(1,4).toString(),'PNG');
  }
  assert.equal(fixture.submit().confirmationAccepted,true); assert.equal(fixture.sent.length,2);
  assert.equal(fixture.submit({...contact,requestId:'b11e0000-1234-4567-8123-123456789abc'},'wrong').code,'unauthorized');
  assert.equal(fixture.sent.length,2);
});

test('actual Apps Script preserves accepted inquiry on visitor failure; retries never duplicate it', () => {
  const fixture=scriptFixture({failOn:2});
  assert.equal(fixture.submit().confirmationAccepted,false); assert.equal(fixture.sent.length,1);
  assert.equal(fixture.submit().ownerAccepted,true); assert.equal(fixture.sent.length,1);
  const uncertain=scriptFixture({failOn:1});
  assert.equal(uncertain.submit().code,'delivery-unknown'); assert.equal(uncertain.submit().code,'delivery-unknown');
  assert.equal(uncertain.sent.length,0);
});

test('actual Apps Script quota, recipient throttle and private state retention', () => {
  const low=scriptFixture({quota:1}); assert.equal(low.submit().code,'quota'); assert.equal(low.sent.length,0);
  const fixture=scriptFixture();
  for(let i=0;i<3;i++) assert.equal(fixture.submit({...contact,requestId:`a11e000${i}-1234-4567-8123-123456789abc`}).success,true);
  assert.equal(fixture.submit({...contact,requestId:'a11e0009-1234-4567-8123-123456789abc'}).code,'rate-limit');
  for (const [key,value] of fixture.properties) if(key.startsWith('inquiry:')) assert.doesNotMatch(value,/visitor@example|Jamie|Please tell/);
});
