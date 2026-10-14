import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
export default function Button({ children, to, variant = 'primary', arrow = true, className = '', ...props }) {
  const classes = `button button-${variant} ${className}`;
  return to ? <Link to={to} className={classes} {...props}>{children}{arrow && <ArrowUpRight size={18} aria-hidden="true" />}</Link> : <button className={classes} {...props}>{children}{arrow && <ArrowUpRight size={18} aria-hidden="true" />}</button>;
}
