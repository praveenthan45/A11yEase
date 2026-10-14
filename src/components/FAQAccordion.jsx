import { useId, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
export default function FAQAccordion({ items }) {
  const base = useId(); const [open, setOpen] = useState(null);
  return <div className="faq-list">{items.map(item => {
    const expanded = open === item.id; const id = `${base}-${item.id}`;
    return <div className={`faq-item ${expanded ? 'expanded' : ''}`} key={item.id}>
      <h3><button id={`${id}-button`} aria-expanded={expanded} aria-controls={`${id}-answer`} onClick={() => setOpen(expanded ? null : item.id)}>{item.question}<span>{expanded ? <Minus size={19} aria-hidden="true"/> : <Plus size={19} aria-hidden="true"/>}</span></button></h3>
      <div id={`${id}-answer`} aria-labelledby={`${id}-button`} role="region" className="faq-answer" hidden={!expanded}><p>{item.answer}</p></div>
    </div>;
  })}</div>;
}
