import { ArrowRight, Check, CircleCheck, FileText, LifeBuoy, RotateCcw, SlidersHorizontal } from 'lucide-react';
import LogoMark from './LogoMark';

// Non-interactive illustrations accompany the real CTA links beside them.
export default function ConversionVisual({ variant }) {
  return <div className={`conversion-visual conversion-visual--${variant}`} aria-hidden="true">
    {variant === 'reading' && <div className="cta-reading-card">
      <div className="cta-visual-header"><LogoMark/><span>YOUR READING VIEW</span><SlidersHorizontal size={18}/></div>
      <div className="cta-reading-type">A little more<br/><em>room to read.</em></div>
      <div className="cta-reading-lines"><i/><i/><i/></div>
      <div className="cta-setting-row"><span>Text size</span><strong>110%</strong></div>
      <div className="cta-mini-range"><i/></div>
      <div className="cta-setting-row"><span>Reading guide</span><strong><Check size={14}/> On</strong></div>
      <span className="cta-visual-caption">Illustrative preference view</span>
    </div>}
    {variant === 'compare' && <div className="cta-comparison">
      <div className="cta-visual-header"><SlidersHorizontal size={18}/><span>SMALL ADJUSTMENTS, SIDE BY SIDE</span></div>
      <div className="cta-compare-grid"><div><small>Default view</small><span className="cta-compare-type">Aa</span><p>Read at your<br/>own pace.</p><span className="cta-preview-link">Explore the story</span></div><div><small>Personal view</small><span className="cta-compare-type">Aa</span><p>Read at your<br/>own pace.</p><span className="cta-preview-link">Explore the story <ArrowRight size={12}/></span></div></div>
      <div className="cta-compare-footer"><span>Larger text</span><span>Clearer links</span></div>
      <span className="cta-visual-caption">Illustrative text and link comparison</span>
    </div>}
    {variant === 'workflow' && <div className="cta-workflow-card">
      <div className="cta-visual-header"><LogoMark/><span>A CLEAR PATH TO YOUR PREFERENCES</span></div>
      {[['01', 'Explore the sample', 'Start with a familiar reading view.'], ['02', 'Adjust one setting', 'Compare, then combine your choices.'], ['03', 'Keep the control', 'Change again or restore the defaults.']].map(([number,title,copy]) => <div className="cta-workflow-step" key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></div>)}
      <div className="cta-workflow-reset"><RotateCcw size={14}/> A fresh start is always within reach.</div>
    </div>}
    {variant === 'mission' && <div className="cta-mission-card">
      <div className="cta-visual-header"><LogoMark/><span>OUR PRODUCT PHILOSOPHY</span></div>
      <span className="cta-mission-word">People.<br/>Preferences.<br/><em>Possibilities.</em></span>
      <div className="cta-mission-bottom"><CircleCheck size={22}/><p>Thoughtful controls begin<br/>with individual needs.</p></div>
    </div>}
    {variant === 'support' && <div className="cta-support-card">
      <div className="cta-visual-header"><LifeBuoy size={20}/><span>A USEFUL PLACE TO START</span></div>
      <strong className="cta-support-title">A little clarity<br/>goes a long way.</strong>
      {[['Product samples', SlidersHorizontal], ['Browser compatibility', FileText], ['Your preferences', CircleCheck]].map(([title,Icon])=><div className="cta-support-topic" key={title}><Icon size={17}/><span>{title}</span><ArrowRight size={15}/></div>)}
      <span className="cta-visual-caption">Explore the FAQs or contact the team</span>
    </div>}
  </div>;
}
