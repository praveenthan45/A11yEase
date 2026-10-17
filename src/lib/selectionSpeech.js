export function getSelectedSampleText(selection, container) {
  if (!selection || !container || selection.isCollapsed || selection.rangeCount !== 1) return '';
  try {
    const range = selection.getRangeAt(0);
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return '';
    return selection.toString().replace(/\s+/g, ' ').trim();
  } catch { return ''; }
}

export function createSelectionSpeech(environment = {}, onStatus = () => {}) {
  const synth = environment.speechSynthesis;
  const Utterance = environment.SpeechSynthesisUtterance;
  const supported = typeof synth?.speak === 'function' && typeof synth?.cancel === 'function' && typeof Utterance === 'function';
  let enabled = false;
  let current = null;
  let disposed = false;
  const notify = message => { if (!disposed) onStatus(message); };
  const detach = utterance => { utterance.onstart = null; utterance.onend = null; utterance.onerror = null; };
  const stop = () => {
    if (!current) return;
    const previous = current;
    current = null;
    detach(previous);
    try { synth.cancel(); } catch { /* Still allow the reading state to clear. */ }
    notify('Reading stopped. Select text in the demo to read it.');
  };
  return {
    supported,
    get enabled() { return enabled; },
    setEnabled(value) {
      enabled = !disposed && supported && Boolean(value);
      if (!enabled) stop();
      // Enabling this mode never queues speech, including an existing selection.
    },
    readSelection(selection, container) {
      if (disposed || !enabled) return false;
      const text = getSelectedSampleText(selection, container);
      if (!text) return false;
      stop();
      try {
        const utterance = new Utterance(text);
        current = utterance;
        utterance.lang = 'en-US';
        utterance.rate = 1;
        const finish = message => {
          if (disposed || current !== utterance) return;
          current = null;
          detach(utterance);
          notify(message);
        };
        utterance.onstart = () => {
          if (current === utterance) notify('Reading selected text. Select different text to change it.');
        };
        utterance.onend = () => finish('Finished reading. Select more text in the demo to continue.');
        utterance.onerror = event => finish(['canceled', 'interrupted'].includes(event?.error)
          ? 'Reading stopped. Select text in the demo to read it.'
          : 'Unable to read aloud. Check your browser’s speech voices and select text to try again.');
        synth.cancel();
        if (synth.paused && typeof synth.resume === 'function') synth.resume();
        notify('Reading selected text. Select different text to change it.');
        synth.speak(utterance);
        return true;
      } catch {
        if (current) detach(current);
        current = null;
        notify('Unable to read aloud. Check your browser’s speech voices and select text to try again.');
        return false;
      }
    },
    stop,
    dispose() { disposed = true; enabled = false; stop(); },
  };
}
