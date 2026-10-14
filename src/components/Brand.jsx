import LogoMark from './LogoMark';
export default function Brand({ light = false }) {
  return <span className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-symbol"><LogoMark /></span><span>A11y<span className="brand-ease">Ease</span></span></span>;
}
