import test from 'node:test';
import assert from 'node:assert/strict';
import { createSelectionSpeech, getSelectedSampleText } from '../src/lib/selectionSpeech.js';

function selectedText(text = 'Only the selected sentence.', { outsideStart = false, outsideEnd = false, collapsed = false, rangeCount = 1 } = {}) {
  const start = {};
  const end = {};
  const container = { contains: node => node === start || node === end, textContent: 'The entire story should never be used instead.' };
  const selection = {
    isCollapsed: collapsed,
    rangeCount,
    getRangeAt: () => ({ startContainer: outsideStart ? {} : start, endContainer: outsideEnd ? {} : end }),
    toString: () => text,
  };
  return { selection, container };
}

function setup({ paused = false, throwOnSpeak = false } = {}) {
  const messages = [];
  const requests = [];
  let cancellations = 0;
  let resumes = 0;
  const synth = {
    paused,
    speak(utterance) { if (throwOnSpeak) throw new Error('Speech failed'); requests.push(utterance); },
    cancel() { cancellations++; },
    resume() { resumes++; },
  };
  class Utterance { constructor(text) { this.text = text; } }
  const reader = createSelectionSpeech({ speechSynthesis: synth, SpeechSynthesisUtterance: Utterance }, message => messages.push(message));
  return { reader, messages, requests, get cancellations() { return cancellations; }, get resumes() { return resumes; } };
}

const read = (reader, fixture = selectedText()) => reader.readSelection(fixture.selection, fixture.container);

test('only the selected text inside the sample is extracted', () => {
  const { selection, container } = selectedText('  A selected\n sentence.  ');
  assert.equal(getSelectedSampleText(selection, container), 'A selected sentence.');
  for (const options of [{ outsideStart: true }, { outsideEnd: true }, { collapsed: true }, { rangeCount: 0 }, { rangeCount: 2 }]) {
    const fixture = selectedText('A sentence.', options);
    assert.equal(getSelectedSampleText(fixture.selection, fixture.container), '');
  }
});

test('missing, whitespace-only and stale selections do not produce speech text', () => {
  const { selection, container } = selectedText('  \n ');
  assert.equal(getSelectedSampleText(selection, container), '');
  assert.equal(getSelectedSampleText(null, container), '');
  assert.equal(getSelectedSampleText(selection, null), '');
  selection.getRangeAt = () => { throw new Error('Selection changed'); };
  assert.equal(getSelectedSampleText(selection, container), '');
});

test('enabling and re-enabling never start automatic playback', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  assert.equal(sample.reader.enabled, true);
  assert.equal(sample.requests.length, 0);
  assert.equal(sample.cancellations, 0);
  sample.reader.setEnabled(false);
  sample.reader.setEnabled(true);
  assert.equal(sample.requests.length, 0);
});

test('a selection reads nothing while the mode is off', () => {
  const sample = setup();
  assert.equal(read(sample.reader), false);
  assert.equal(sample.requests.length, 0);
});

test('a valid selection reads exactly that text after enabling', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  assert.equal(read(sample.reader), true);
  assert.equal(sample.requests[0].text, 'Only the selected sentence.');
  assert.equal(sample.requests[0].lang, 'en-US');
  assert.equal(sample.requests.length, 1);
});

test('selections outside the demo cannot start narration', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  assert.equal(read(sample.reader, selectedText('Outside text.', { outsideStart: true })), false);
  assert.equal(read(sample.reader, selectedText('Outside text.', { outsideEnd: true })), false);
  assert.equal(sample.requests.length, 0);
});

test('a new selection replaces speech and ignores the old reading’s delayed events', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  read(sample.reader, selectedText('First selection.'));
  const oldEnd = sample.requests[0].onend;
  const oldError = sample.requests[0].onerror;
  read(sample.reader, selectedText('Second selection.'));
  const count = sample.messages.length;
  oldEnd();
  oldError({ error: 'interrupted' });
  assert.equal(sample.requests[1].text, 'Second selection.');
  assert.equal(sample.requests[0].onend, null);
  assert.equal(sample.messages.length, count);
});

test('finishing a reading keeps selection mode ready without replaying automatically', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  read(sample.reader);
  sample.requests[0].onend();
  assert.equal(sample.reader.enabled, true);
  assert.equal(sample.requests.length, 1);
  assert.match(sample.messages.at(-1), /Finished reading/);
  read(sample.reader, selectedText('Another selection.'));
  assert.equal(sample.requests.length, 2);
});

test('switching off or resetting cancels speech and prevents further selection playback', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  read(sample.reader);
  const before = sample.cancellations;
  sample.reader.setEnabled(false);
  assert.equal(sample.reader.enabled, false);
  assert.equal(sample.cancellations, before + 1);
  assert.equal(read(sample.reader), false);
  assert.equal(sample.requests.length, 1);
});

test('unsupported speech stays disabled without throwing', () => {
  const reader = createSelectionSpeech({});
  reader.setEnabled(true);
  assert.equal(reader.supported, false);
  assert.equal(reader.enabled, false);
  assert.equal(read(reader), false);
  assert.doesNotThrow(() => reader.dispose());
});

test('speech errors provide retry feedback without reading anything else', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  read(sample.reader);
  sample.requests[0].onerror({ error: 'voice-unavailable' });
  assert.match(sample.messages.at(-1), /Unable to read aloud/);
  assert.equal(sample.requests.length, 1);
  assert.equal(sample.reader.enabled, true);
  read(sample.reader, selectedText('Retry this text.'));
  assert.equal(sample.requests.length, 2);
  const failing = setup({ throwOnSpeak: true });
  failing.reader.setEnabled(true);
  assert.equal(read(failing.reader), false);
  assert.match(failing.messages.at(-1), /Unable to read aloud/);
});

test('leaving the page cancels only an owned reading and suppresses late callbacks', () => {
  const sample = setup();
  sample.reader.setEnabled(true);
  read(sample.reader);
  const lateEnd = sample.requests[0].onend;
  const before = sample.messages.length;
  sample.reader.dispose();
  lateEnd();
  sample.reader.setEnabled(true);
  assert.equal(sample.reader.enabled, false);
  assert.equal(read(sample.reader), false);
  assert.equal(sample.messages.length, before);
  const idle = setup();
  idle.reader.dispose();
  assert.equal(idle.cancellations, 0);
});

test('a paused engine resumes only when selected text is explicitly read', () => {
  const sample = setup({ paused: true });
  sample.reader.setEnabled(true);
  assert.equal(sample.resumes, 0);
  read(sample.reader);
  assert.equal(sample.resumes, 1);
});
