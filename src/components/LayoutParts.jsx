import { ArrowUpRight, CircleCheck, MousePointer2, SlidersHorizontal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Button from './Button';
import ConversionVisual from './ConversionVisual';
export function Eyebrow({ children, light = false }) { return <p className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span aria-hidden="true" />{children}</p>; }
export function SectionHead({ eyebrow, title, description, center = false, children }) { return <div className={`section-head ${center ? 'centered' : ''}`}><div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{children}</div>; }
export function PageHero({ eyebrow, title, accent, description, children, image, wideChildren = false }) {
  const copy = <><Eyebrow>{eyebrow}</Eyebrow><h1>{title}{accent && <><br/><span>{accent}</span></>}</h1><p>{description}</p>{(!image || !wideChildren) && children}</>;
  if (!image) return <section className="page-hero"><div className="container">{copy}</div><div className="page-orbit" aria-hidden="true"/></section>;
  return <section className="page-hero page-hero-with-image"><div className="container"><div className="page-hero-image-grid"><div className="page-hero-copy">{copy}</div><figure className="page-hero-photo"><img src={image.src} srcSet={`${image.small} 600w, ${image.src} 1200w`} sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 959px) 580px, (max-width: 1199px) 40vw, 510px" alt={image.alt} width={image.width} height={image.height} fetchPriority="high" decoding="async" style={{objectPosition:image.position}}/><figcaption><span className="page-hero-photo-icon"><image.icon size={22} aria-hidden="true"/></span><span><span className="page-hero-photo-label">{image.label}</span><strong>{image.caption}</strong></span></figcaption></figure></div>{wideChildren && <div className="page-hero-wide-content">{children}</div>}</div></section>;
}
export function ConversionCTA({ title = 'A More Accessible Digital Experience Starts Here.', description = 'Discover accessibility controls designed around your preferences.', contact = false }) {
  const { pathname } = useLocation();
  const variant = ({ '/features':'compare', '/how-it-works':'workflow', '/about':'mission', '/faq':'support' })[pathname] || 'reading';
  return <section className={`conversion conversion--${variant}`}><div className="container conversion-inner"><div><Eyebrow light>YOUR DIGITAL WORLD. YOUR WAY.</Eyebrow><h2>{title}</h2><p>{description}</p><div className="button-row"><Button to={contact ? '/contact' : '/#demo'} variant="white">{contact ? 'Contact Our Team' : 'Get Started'}</Button>{!contact && <Button to="/contact" variant="dark-outline">Contact Our Team</Button>}</div></div><ConversionVisual variant={variant}/></div></section>;
}
export function Steps({ detailed = false }) {
  const steps = [
    { icon: MousePointer2, title: 'Discover A11yEase', description: 'Explore practical tools for the way you browse, read and interact.', detail: 'Start with the interactive sample. There is no account or installation needed to try this website’s demo.' },
    { icon: SlidersHorizontal, title: 'Choose Your Preferences', description: 'Make small adjustments. Find a combination that feels like you.', detail: 'Choose a theme, adjust text and spacing, or try a reading guide. Controls have descriptive labels and work with a keyboard.' },
    { icon: CircleCheck, title: 'Enjoy a More Comfortable Experience', description: 'Keep the choices that suit you. Adjust again whenever you need.', detail: 'Compare the sample, adjust again when needed and reset with one button. Preferences affect the preview only. You may explicitly save them in this browser from the Personalization sample.' },
  ];
  return <div className={`steps-grid ${detailed ? 'steps-detailed' : ''}`}>{steps.map((s, i) => <article key={s.title} className="step motion-card reveal" style={{ '--card-delay':`${i * 70}ms` }}><div className="step-top"><span className="step-icon"><s.icon size={30} aria-hidden="true"/></span><span className="step-number">0{i + 1}</span>{i < 2 && <ArrowUpRight className="step-arrow" size={20} aria-hidden="true"/>}</div><h3>{s.title}</h3><p>{s.description}</p>{detailed && <p className="step-detail">{s.detail}</p>}</article>)}</div>;
}
