import { useEffect, useId, useRef, useState } from 'react';
import { AlignLeft, ArrowUpRight, Bookmark, Brain, Check, Volume2, Highlighter, Lightbulb, Type, RotateCcw } from 'lucide-react';
import LogoMark from './LogoMark';
import { createSelectionSpeech } from '../lib/selectionSpeech';
import '../styles/feature-settings-demo.css';

const defaults = { alignment: 'left', speech: false, paragraphs: false, distractionFree: false, font: false };
const controls = [
  { key: 'speech', label: 'Text-to-Speech', hint: 'Turn on, then select text in the demo story to hear it.', icon: Volume2 },
  { key: 'paragraphs', label: 'Paragraph Highlighting', hint: 'Give each paragraph a clear boundary.', icon: Highlighter },
  { key: 'distractionFree', label: 'Distraction-Free Mode', hint: 'Hide imagery and secondary content.', icon: Brain },
  { key: 'font', label: 'Dyslexia-Friendly Font', hint: 'Compare OpenDyslexic in the sample story.', icon: Type },
];

export default function FeatureSettingsDemo() {
  const [settings, setSettings] = useState({ ...defaults });
  const [saved, setSaved] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechMessage, setSpeechMessage] = useState('');
  const id = useId();
  const scrollArea = useRef(null);
  const story = useRef(null);
  const ideas = useRef(null);
  const article = useRef(null);
  const speech = useRef(null);
  useEffect(() => {
    const reader = createSelectionSpeech(window, message => {
      setSpeechMessage(message);
      setAnnouncement(message);
    });
    speech.current = reader;
    setSpeechSupported(reader.supported);
    let selecting = false;
    const isControl = target => Boolean(target?.closest?.('button, a, input, select, textarea, label'));
    const beginSelection = event => {
      selecting = reader.enabled && event.button === 0 && Boolean(article.current?.contains(event.target)) && !isControl(event.target);
      if (reader.enabled) reader.stop();
    };
    const finishSelection = event => {
      const startedInStory = selecting;
      selecting = false;
      if (!startedInStory || event.button !== 0 || !article.current?.contains(event.target) || isControl(event.target)) return;
      reader.readSelection(window.getSelection(), article.current);
    };
    document.addEventListener('mousedown', beginSelection);
    document.addEventListener('mouseup', finishSelection);
    return () => {
      document.removeEventListener('mousedown', beginSelection);
      document.removeEventListener('mouseup', finishSelection);
      reader.dispose();
      speech.current = null;
    };
  }, []);
  const update = (key, value, label) => {
    setSettings(current => ({ ...current, [key]: value }));
    setAnnouncement(`${label}: ${typeof value === 'boolean' ? (value ? 'on' : 'off') : value}.`);
  };
  const toggleSpeech = () => {
    const enabled = !settings.speech;
    if (!speech.current?.supported) return;
    speech.current.setEnabled(enabled);
    setSpeechMessage(enabled ? 'Select text in the demo story to hear it.' : '');
    update('speech', enabled, 'Text-to-Speech selection mode');
  };
  const moveTo = (target) => {
    const area = scrollArea.current;
    const heading = target.current;
    if (!area || !heading) return;
    area.scrollTo({ top: heading.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop - 24, behavior: 'instant' });
    heading.focus({ preventScroll: true });
  };
  const reset = () => {
    speech.current?.setEnabled(false);
    setSpeechMessage('');
    setSettings({ ...defaults });
    setAnnouncement('All five feature demo settings reset to defaults.');
  };
  const activeCount = Number(settings.alignment !== 'left') + controls.filter(control => settings[control.key]).length;
  const previewClass = ['demo-preview', 'feature-demo-preview', settings.paragraphs && 'has-paragraph-highlighting', settings.distractionFree && 'is-distraction-free', settings.font && 'has-reading-font'].filter(Boolean).join(' ');

  return <div className="demo-wrapper feature-settings-demo">
    <div className="demo-frame">
      <div className="demo-browser-bar"><span className="browser-dots" aria-hidden="true"><i/><i/><i/></span><span>fieldnotes.example / a calmer day</span><span className="demo-live"><span/> Live preview</span></div>
      <div className="demo-body">
        <div className={previewClass}>
          <div className="feature-demo-scroll" ref={scrollArea} tabIndex={0} role="region" aria-label="Feature demo story. Scroll to read more.">
            <nav className="feature-demo-nav" aria-label="Sample story navigation">
              <span className="feature-demo-brand">fieldnotes<span>.</span></span>
              <div className="feature-demo-secondary"><button className="feature-demo-target" type="button" onClick={() => moveTo(story)}>Story</button><button className="feature-demo-target" type="button" onClick={() => moveTo(ideas)}>Ideas <ArrowUpRight size={14} aria-hidden="true"/></button></div>
            </nav>
            <article ref={article} className="feature-demo-article" style={{ textAlign: settings.alignment }}>
              <p className="feature-demo-kicker feature-demo-secondary">SMALL MOMENTS. A LITTLE MORE ROOM.</p>
              <h3 ref={story} tabIndex={-1}>A calmer start<br/>to your day.</h3>
              <p className="feature-demo-intro">A comfortable day can begin with a little breathing room and one small, intentional choice.</p>
              <div className="feature-demo-actions">
                <button className="feature-demo-target" type="button" aria-pressed={saved} onClick={() => { setSaved(!saved); setAnnouncement(saved ? 'Idea removed from this sample’s saved items.' : 'Idea saved in this sample.'); }}>{saved ? <Check size={16} aria-hidden="true"/> : <Bookmark size={16} aria-hidden="true"/>}{saved ? 'Idea saved' : 'Save idea'}</button>
                <button className="feature-demo-target" type="button" aria-expanded={showTip} aria-controls={`${id}-tip`} onClick={() => setShowTip(!showTip)}><Lightbulb size={16} aria-hidden="true"/>Reading tip</button>
              </div>
              <div id={`${id}-tip`} className="feature-demo-tip" hidden={!showTip}><strong>A small place to start</strong><p>Try one setting, read a paragraph, then combine the changes that feel comfortable.</p></div>
              <img className="feature-demo-photo feature-demo-secondary" src="/images/workspace.webp" alt="A sunlit workspace with plants and a comfortable place to read" width="1200" height="800" loading="lazy"/>
              <h4 ref={ideas} tabIndex={-1}>Make space for one thing.</h4>
              <p>Before the day gathers momentum, find a comfortable corner and choose one thing you would like to give your attention to. The rest can wait for a moment.</p>
              <p>Move through a paragraph at your own pace. Pause, look away or return to a sentence whenever you need to. A useful reading rhythm is one that leaves room for you.</p>
              <aside className="feature-demo-related feature-demo-secondary" aria-label="Related idea"><span>A NOTE FOR LATER</span><strong>Small steps can become familiar habits.</strong><p>Keep a little room in your day for the things you enjoy.</p></aside>
              <h4>A moment to reflect.</h4>
              <p>Notice which small change made this moment feel more comfortable. You can return to it tomorrow, or choose a different starting point.</p>
            </article>
          </div>
        </div>
        <aside className="demo-panel" aria-label="Five additional accessibility settings">
          <div className="demo-panel-heading"><span className="panel-logo panel-brand-logo"><LogoMark/></span><div><h3>Try something new.</h3><p>Five more ways to make it yours.</p></div></div>
          <p className="feature-demo-count">{activeCount} of 5 settings active</p>
          <div className="feature-demo-alignment">
            <label htmlFor={`${id}-alignment`}><AlignLeft size={18} aria-hidden="true"/>Text Alignment</label>
            <select id={`${id}-alignment`} value={settings.alignment} onChange={event => update('alignment', event.target.value, 'Text Alignment')}><option value="left">Left aligned</option><option value="center">Center aligned</option><option value="right">Right aligned</option></select>
          </div>
          <div className="demo-controls">{controls.map(({ key, label, hint, icon: Icon }) => <button key={key} className={`demo-control ${settings[key] ? 'selected' : ''}`} type="button" aria-label={label} aria-describedby={`${id}-${key}-hint`} aria-pressed={settings[key]} disabled={key === 'speech' && !speechSupported} onClick={() => key === 'speech' ? toggleSpeech() : update(key, !settings[key], label)}><Icon size={18} aria-hidden="true"/><span className="feature-demo-control-copy"><strong>{label}</strong><small id={`${id}-${key}-hint`}>{key === 'speech' ? (!speechSupported ? 'Text-to-Speech is not available in this browser.' : speechMessage || hint) : hint}</small></span><span className="toggle-switch" aria-hidden="true"><i/></span></button>)}</div>
          <button className="demo-reset" type="button" onClick={reset}><RotateCcw size={15} aria-hidden="true"/>Reset Settings</button>
          <p className="demo-panel-footer"><LogoMark className="demo-footer-logo"/>Powered by A11yEase</p>
        </aside>
      </div>
    </div>
    <p className="demo-note">Explore five additional settings from the catalog. Changes apply only to this sample; use Reset Settings to return to the starting view.</p>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </div>;
}
