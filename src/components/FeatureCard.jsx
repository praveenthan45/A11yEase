import { useId, useState } from 'react';
import { ArrowUpRight, Minus } from 'lucide-react';
export default function FeatureCard({ feature, index }) {
  const [open, setOpen] = useState(false); const id = useId(); const Icon = feature.icon;
  return <article className={`feature-card feature-${index} motion-card reveal ${open ? 'feature-expanded' : ''}`} style={{ '--card-delay':`${index % 4 * 70}ms` }}>
    <span className="feature-icon"><Icon size={25} aria-hidden="true" /></span>
    {index === 0 && <div className="text-visual" aria-hidden="true"><span>Aa</span><span>Aa</span><span>Aa</span></div>}
    {index === 2 && <div className="contrast-visual" aria-hidden="true"><span>Aa</span><span>Aa</span></div>}
    {index === 11 && <div className="guide-visual" aria-hidden="true"><i/><i/><i/><i/></div>}
    {index === 7 && <div className="spacing-visual" aria-hidden="true"><span>Room to read.</span><i/><i/></div>}
    {index === 12 && <div className="mask-visual" aria-hidden="true"><i/><i/><span>One thought at a time.</span><i/><i/></div>}
    <h3>{feature.title}</h3><p>{feature.description}</p>
    <button className="text-link" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} aria-label={`${open ? 'Less' : 'More'} info about ${feature.title}`}>{open ? 'Less Info' : 'More Info'}{open ? <Minus size={15} aria-hidden="true"/> : <ArrowUpRight size={15} aria-hidden="true"/>}</button>
    <div id={id} hidden={!open} className="feature-detail"><p>{feature.detail}</p><div className="feature-example"><strong>Put it in context</strong><p>{feature.example}</p></div></div>
  </article>;
}
