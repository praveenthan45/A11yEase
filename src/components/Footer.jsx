import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart } from 'lucide-react';
import Brand from './Brand';
import { site } from '../config/site';
export default function Footer() {
  const groups = [['Product', [['Features', '/features'], ['Interactive Demo', '/#demo'], ['How It Works', '/how-it-works']]], ['Company', [['About Us', '/about'], ['Contact Us', '/contact']]], ['Resources', [['FAQs', '/faq'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']]]];
  return <footer className="site-footer"><div className="container"><div className="footer-grid"><div className="footer-brand"><Link to="/" aria-label="A11yEase home"><Brand /></Link><p>Your digital world. Your way.<br />Practical accessibility for a more<br className="desktop-break" /> comfortable everyday experience.</p><span className="footer-made"><Heart size={14} aria-hidden="true" /> Built around people.</span>{site.socials.map(s => <a key={s.url} href={s.url} rel="noopener noreferrer" target="_blank">{s.name}<ArrowUpRight size={14}/></a>)}</div>{groups.map(([title, links]) => <div key={title}><h2>{title}</h2><ul>{links.map(([label, url]) => <li key={url}><Link to={url}>{label}</Link></li>)}</ul></div>)}</div><div className="footer-bottom"><p>© {new Date().getFullYear()} A11yEase. All rights reserved.</p><p>Small adjustments. Meaningful possibilities.</p></div></div></footer>;
}
