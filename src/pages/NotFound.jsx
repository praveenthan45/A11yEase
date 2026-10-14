import { Compass } from 'lucide-react';
import Button from '../components/Button';
export default function NotFound() { return <section className="not-found container"><span className="error-404">404</span><Compass size={48} aria-hidden="true"/><h1>A Little Off the Beaten Path.</h1><p>We couldn’t find that page. Let’s get you back to a familiar place.</p><div className="button-row"><Button to="/">Back to Home</Button><Button to="/contact" variant="outline">Contact Our Team</Button></div></section>; }
