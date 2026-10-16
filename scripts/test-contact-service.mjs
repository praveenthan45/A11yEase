import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactPayload, isFormSubmitEndpoint, readContactResponse } from '../src/lib/contactService.js';

const endpoint = 'https://formsubmit.co/ajax/gen.praveenthan@gmail.com';
const values = { fullName:' Jamie Reader ', email:' reader@example.com ', organization:' Example team ', inquiryType:'Product Demo', subject:' Product demo ', message:' Please arrange a guided demonstration. ', consent:true, website:'' };

test('FormSubmit receives all fields and the visitor reply address', () => {
  const payload = createContactPayload(values, 5000, endpoint);
  assert.equal(payload.name, 'Jamie Reader');
  assert.equal(payload.email, 'reader@example.com');
  assert.equal(payload._replyto, payload.email);
  assert.equal(payload._subject, 'A11yEase · Product Demo: Product demo');
  assert.equal(payload._template, 'table');
  assert.equal(payload._honey, '');
  assert.equal(payload.consent, true);
  assert.equal(payload.formDurationMs, 5000);
  assert.equal(values.fullName, ' Jamie Reader ');
});

test('custom API payload retains its existing contract', () => {
  const payload = createContactPayload(values, 5000, 'https://contact.example.test/api');
  assert.equal(payload.fullName, 'Jamie Reader');
  assert.equal(payload.source, 'a11yease-contact');
  assert.equal(payload._subject, undefined);
});

test('provider detection requires the official HTTPS AJAX endpoint', () => {
  assert.equal(isFormSubmitEndpoint(endpoint), true);
  for (const url of ['http://formsubmit.co/ajax/a', 'https://formsubmit.co.evil.example/ajax/a', 'https://example.com/ajax/a', 'invalid']) assert.equal(isFormSubmitEndpoint(url), false);
});

test('HTTP 200 with provider success=false is a failure', async () => {
  await assert.rejects(readContactResponse(Response.json({success:'false',message:'Service unavailable'}), endpoint), /failed/);
});

test('activation is distinct from accepted delivery', async () => {
  assert.equal(await readContactResponse(Response.json({success:'false',message:"This form needs Activation. We've sent you an email containing an Activate Form link."}), endpoint), 'activation-required');
});

test('only explicit provider acceptance succeeds', async () => {
  for (const success of [true, 'true']) assert.equal(await readContactResponse(Response.json({success}), endpoint), 'accepted');
  await assert.rejects(readContactResponse(Response.json({message:'Unknown response'}), endpoint), /failed/);
  await assert.rejects(readContactResponse(new Response('<html>Unexpected response</html>'), endpoint), /failed/);
});

test('rate limiting and HTTP failures do not report success', async () => {
  await assert.rejects(readContactResponse(new Response('', {status:429}), endpoint), /rate-limit/);
  await assert.rejects(readContactResponse(Response.json({success:true}, {status:503}), endpoint), /failed/);
});

test('custom APIs may acknowledge with an empty 2xx response', async () => {
  assert.equal(await readContactResponse(new Response(null, {status:204}), 'https://contact.example.test/api'), 'accepted');
});
