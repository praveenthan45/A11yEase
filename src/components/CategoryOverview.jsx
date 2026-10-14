import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SectionHead } from './LayoutParts';
import { featureCategories } from '../data/featureCategories';
import { features } from '../data/features';
export default function CategoryOverview() {
  return <section className="section category-overview"><div className="container"><SectionHead eyebrow="A BROADER VIEW OF ACCESSIBILITY" title="Different Needs. Nine Thoughtful Categories." description="Explore the complete settings collection, from visual preferences to clearer forms and personalized controls."><Link to="/features" className="text-link">Explore {features.length} settings <ArrowUpRight size={17} aria-hidden="true"/></Link></SectionHead><div className="category-overview-grid">{featureCategories.map((category,index)=><Link className="category-overview-item motion-card reveal" style={{'--card-delay':`${index % 3 * 70}ms`}} key={category.id} to={`/features#category-${category.id}`}><span className="category-overview-icon"><category.icon size={23} aria-hidden="true"/></span><div><h3>{category.title}</h3><p>{features.filter(f=>f.category===category.title).length} settings to explore</p></div><ArrowUpRight size={17} aria-hidden="true"/></Link>)}</div><p className="catalog-scope-note">Includes interactive samples and clearly marked settings that require an integration or compatibility review.</p></div></section>;
}
