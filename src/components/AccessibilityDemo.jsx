import { useId, useState } from 'react';
import { Minus, Plus, Moon, Sun, Contrast, AlignHorizontalSpaceAround, Link2, ScanLine, Rows3, RotateCcw, ChevronDown, Palette, Type, ZoomIn, Eye, ArrowUpRight, Check } from 'lucide-react';
import LogoMark from './LogoMark';
import { defaultSettings as defaults, preferenceKey, legacyPreferenceKey, readPreferences } from '../data/demoSettings';
export default function AccessibilityDemo() {
  const [settings, setSettings] = useState(readPreferences);
  const [more, setMore] = useState(false); const [announcement, setAnnouncement] = useState(''); const id = useId();
  const update = (key, value, label) => { setSettings(s => ({ ...s, [key]: value })); setAnnouncement(`${label}: ${typeof value === 'boolean' ? (value ? 'on' : 'off') : value}.`); };
  const toggle = (key, label) => update(key, !settings[key], label);
  const resetPreferences=()=>{setSettings({...defaults});setAnnouncement('All sample settings reset to defaults.');try{window.localStorage.removeItem(preferenceKey);window.localStorage.removeItem(legacyPreferenceKey);}catch{setAnnouncement('Defaults restored. Browser storage prevented clearing saved preferences.');}};
  const control = (Icon, label, key) => <button className={`demo-control ${settings[key] ? 'selected' : ''}`} aria-pressed={settings[key]} onClick={() => toggle(key, label)} key={key}><Icon size={18} aria-hidden="true"/><span>{label}</span><span className="toggle-switch" aria-hidden="true"><i/></span></button>;
  const previewClass = `demo-preview theme-${settings.theme} ${settings.spacing ? 'spaced' : ''} ${settings.links || settings.colorCues ? 'highlight-links' : ''} ${settings.grayscale ? 'grayscale' : ''} ${settings.font ? 'reading-font' : ''} ${settings.zoom ? 'sample-zoom' : ''} ${settings.paragraphs?'highlight-paragraphs':''}`;
  return <div className="demo-wrapper">
    <div className="demo-frame">
      <div className="demo-browser-bar"><span className="browser-dots" aria-hidden="true"><i/><i/><i/></span><span>your-everyday.example / inspiration</span><span className="demo-live"><span/> Live preview</span></div>
      <div className="demo-body">
        <div className={previewClass} style={{ '--sample-size': `${settings.textSize * (settings.zoom ? 1.15 : 1) / 100}rem`, '--guide-position': `${settings.position}%` }}>
          <div className="sample-scroll" tabIndex={0} role="region" aria-label="Sample website content. Scroll to read the whole article.">
            <div className="sample-nav"><span className="sample-brand"><span aria-hidden="true">✳</span> daybreak.</span><a href={`#${id}-ideas`}>A little inspiration <ArrowUpRight size={14} aria-hidden="true"/></a></div>
            <article className="sample-article" style={{textAlign:settings.alignment}}><div className="sample-category"><span aria-hidden="true"/> {settings.colorCues ? 'Category: Everyday wellbeing' : 'EVERYDAY WELLBEING'}</div><h3>A little space.<br/>A fresh perspective.</h3><p className="sample-intro">{settings.simpleText?'Make room for the things that matter to you.':'There is something powerful about making room for the things that matter to you.'}</p><img src="/images/workspace.webp" alt="A calm, sunlit workspace with plants and comfortable seating" width="1200" height="800" loading="lazy"/><h4 id={`${id}-ideas`}>Small steps, brighter days.</h4><p>{settings.simpleText?'Pause for a moment. Find a comfortable place to read. Try one small change.':'Take a moment to pause. Open a window, explore a new idea, or make your favorite corner a little more comfortable. A small change can help you see your day differently.'}</p><p>{settings.simpleText?'Read at your own pace. Choose what feels comfortable.':'Everyone finds their own rhythm. Give yourself the freedom to discover yours, at your own pace.'}</p><a href={`#${id}-reflection`} className="sample-link">Explore a simple reflection <ArrowUpRight size={15} aria-hidden="true"/></a><div id={`${id}-reflection`} className="sample-reflection"><h4>Your moment to reflect</h4><p>{settings.simpleText?'What small change would you like to keep?':'What is one small adjustment that could make your day more comfortable? Start there.'}</p></div></article>
          </div>
          {settings.mask && <div className="reading-mask-overlay" aria-hidden="true"/>}
          {settings.guide && <div className="reading-guide-overlay" aria-hidden="true"><span/></div>}
        </div>
        <aside className="demo-panel" aria-label="Sample accessibility settings">
          <div className="demo-panel-heading"><span className="panel-logo panel-brand-logo"><LogoMark/></span><div><h3>Make it yours.</h3><p>Small changes. Your comfort.</p></div></div>
          <div className="demo-text-label"><label htmlFor={`${id}-size`}>Text size</label><output htmlFor={`${id}-size`}>{settings.textSize}%</output></div>
          <div className="demo-size-controls"><button aria-label="Decrease text size" disabled={settings.textSize <= 80} onClick={() => update('textSize', settings.textSize - 10, 'Text size')}><Minus size={17} aria-hidden="true"/></button><input id={`${id}-size`} type="range" min="80" max="150" step="10" value={settings.textSize} onChange={e => update('textSize', Number(e.target.value), 'Text size')} aria-valuetext={`${settings.textSize} percent`}/><button aria-label="Increase text size" disabled={settings.textSize >= 150} onClick={() => update('textSize', settings.textSize + 10, 'Text size')}><Plus size={17} aria-hidden="true"/></button></div>
          <p className="control-label">A view that feels right</p>
          <div className="theme-controls">{[[Sun, 'Light', 'light'], [Moon, 'Dark', 'dark'], [Contrast, 'Contrast', 'contrast']].map(([Icon, label, theme]) => <button key={theme} aria-label={`${label} mode`} aria-pressed={settings.theme === theme} onClick={() => update('theme', theme, 'Theme')} className={settings.theme === theme ? 'selected' : ''}><Icon size={20} aria-hidden="true"/><span>{label}</span>{settings.theme === theme && <Check size={11} className="theme-check" aria-hidden="true"/>}</button>)}</div>
          <p className="control-label">A little more clarity</p>
          <div className="demo-controls">{control(AlignHorizontalSpaceAround, 'Text spacing', 'spacing')}{control(Link2, 'Highlight links', 'links')}{control(ScanLine, 'Reading guide', 'guide')}{control(Rows3, 'Reading mask', 'mask')}</div>
          {(settings.guide || settings.mask) && <div className="guide-position"><label htmlFor={`${id}-position`}>Reading position</label><input id={`${id}-position`} type="range" min="10" max="90" value={settings.position} onChange={e => update('position', Number(e.target.value), 'Reading position')} aria-valuetext={`${settings.position} percent down the preview`}/></div>}
          <button className="more-settings" aria-expanded={more} aria-controls={`${id}-more`} onClick={() => setMore(!more)}>More settings <ChevronDown size={16} className={more ? 'rotate' : ''} aria-hidden="true"/></button>
          <div id={`${id}-more`} hidden={!more} className="demo-controls advanced-controls">{control(Palette, 'Grayscale', 'grayscale')}{control(Type, 'Dyslexia-friendly font', 'font')}{control(ZoomIn, 'Magnifier / Zoom', 'zoom')}{control(Eye, 'Color vision cues', 'colorCues')}</div>
          <button className="demo-reset" onClick={resetPreferences}><RotateCcw size={15} aria-hidden="true"/> Reset Settings</button>
          <p className="demo-panel-footer"><LogoMark className="demo-footer-logo"/> Powered by A11yEase</p>
        </aside>
      </div>
    </div>
    <p className="demo-note">An interactive illustration of selected features. Changes affect this sample only; compatibility with every website or device is not guaranteed.</p>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </div>;
}
