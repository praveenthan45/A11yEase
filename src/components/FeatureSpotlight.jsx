import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Link2, RotateCcw, Check } from 'lucide-react';
import { Eyebrow } from './LayoutParts';

const moments = [
  { id:'reading', icon:BookOpen, title:'Settle into a longer read', summary:'Text size, spacing and a reading guide', heading:'Give a paragraph room to breathe.', copy:'A crowded paragraph can take extra effort to follow. Try a larger reading size, open up the line spacing and use a guide to mark your place. Change one setting at a time to find a combination you prefer.', settings:['Larger text', 'More line spacing', 'Reading guide'], link:'/features#reading-guide', linkLabel:'Explore reading assistance' },
  { id:'navigation', icon:Link2, title:'Find your next step', summary:'Clearer links and visible keyboard focus', heading:'Make the path through content clearer.', copy:'A link should be easy to recognize before you select it. Compare an underlined link with a visible boundary, then use Tab to follow the focus ring on the working links in this preview.', settings:['Underlined links', 'Defined link boundaries', 'Visible focus'], link:'/features#highlight-links', linkLabel:'Explore navigation controls' },
  { id:'preferences', icon:RotateCcw, title:'Start from a familiar view', summary:'Editable profiles, browser storage and reset', heading:'A starting point you can make your own.', copy:'In the main demo, a profile applies a useful combination of settings. Adjust it, explicitly save it in this browser if you wish, or reset to the defaults. The example here simply compares a profile with the original view.', settings:['Example profile', 'Individual adjustments', 'Reset in the main demo'], link:'/features#save-preferences', linkLabel:'Explore personalization' },
];

export default function FeatureSpotlight() {
  const [selected,setSelected] = useState('reading');
  const [adjusted,setAdjusted] = useState(true);
  const moment = moments.find(item=>item.id === selected);
  const choose = id => { setSelected(id); setAdjusted(true); };
  return <section className="section feature-spotlight"><div className="container spotlight-layout">
    <div className="spotlight-copy reveal"><Eyebrow>USEFUL IN THE MOMENTS THAT MATTER</Eyebrow><h2>Small Adjustments.<br/>Everyday Possibilities.</h2><p className="section-description">See how a few related controls can fit into an ordinary reading or browsing moment.</p>
      <div className="moment-options" role="group" aria-label="Choose an everyday feature example">{moments.map(item=><button type="button" key={item.id} onClick={()=>choose(item.id)} aria-pressed={selected === item.id}><span className="moment-icon"><item.icon size={21} aria-hidden="true"/></span><span><strong>{item.title}</strong><small>{item.summary}</small></span><ArrowUpRight size={18} aria-hidden="true"/></button>)}</div>
    </div>
    <div className="spotlight-stage reveal">
      <div className="spotlight-browser"><div className="spotlight-chrome"><span><i/><i/><i/></span><small>A11yEase · a contained example</small></div>
        <div className={`moment-preview ${adjusted ? `moment-preview--${moment.id}` : ''}`}>
          <div className="moment-preview-top"><span>EVERYDAY NOTES</span><span>{adjusted ? 'Personal view' : 'Default view'}</span></div>
          <h3>Make room for<br/>what matters.</h3><p>A comfortable reading space starts with your preferences. Take a moment to compare the words, the space between lines and the links that guide you through a story.</p>
          <div className="moment-guide" aria-hidden="true"/>
          <Link to="/features#highlight-links">Explore the next idea <ArrowUpRight size={15} aria-hidden="true"/></Link>
          <Link to="/features#accessibility-profiles">Find a starting profile <ArrowUpRight size={15} aria-hidden="true"/></Link>
          {selected === 'preferences' && <div className="moment-profile"><Check size={16} aria-hidden="true"/><span>{adjusted ? 'Reading focus · profile example' : 'Original view · default settings'}</span></div>}
        </div>
        <div className="moment-compare-bar"><span role="status" aria-live="polite">{moment.title}: {adjusted ? 'adjusted example' : 'default example'}</span><button type="button" aria-pressed={!adjusted} onClick={()=>setAdjusted(!adjusted)}>{adjusted ? 'Show default view' : 'Show adjusted view'}</button></div>
      </div>
      <div className="moment-explanation"><h3>{moment.heading}</h3><p>{moment.copy}</p><ul>{moment.settings.map(setting=><li key={setting}><Check size={13} aria-hidden="true"/>{setting}</li>)}</ul><Link to={moment.link} className="text-link">{moment.linkLabel} <ArrowUpRight size={16} aria-hidden="true"/></Link></div>
    </div>
  </div></section>;
}
