import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navigation } from '../config/site';
import Brand from './Brand';
import Button from './Button';
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef(null);
  const header = useRef(null);
  const location = useLocation();
  const visibleNavigation = navigation.filter(([, url]) => url !== '/' || location.pathname !== '/');
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    const outside = (e) => { if (!header.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', close); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', outside); };
  }, [open]);
  return <header ref={header} className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="container nav-shell">
      <Link to="/" className="brand-link" aria-label="A11yEase home"><Brand /></Link>
      <button ref={toggle} className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X /> : <Menu />}</button>
      <nav id="primary-navigation" aria-label="Main navigation" className={open ? 'nav-open' : ''}>
        <div className="nav-links">{visibleNavigation.map(([label, url]) => <NavLink key={url} to={url} end={url === '/'}>{label}</NavLink>)}</div>
        <Button to="/contact" className="nav-cta">Get Started</Button>
      </nav>
    </div>
  </header>;
}
