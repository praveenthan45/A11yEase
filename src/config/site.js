import { features } from '../data/features';
export const site = {
  name: 'A11yEase',
  contactEndpoint: import.meta.env.VITE_CONTACT_API_URL?.trim() || '',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL?.trim() || '',
  url: import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || '',
  socials: [],
};
export const navigation = [
  ['Home', '/'], ['Features', '/features'], ['How It Works', '/how-it-works'], ['About Us', '/about'], ['Contact', '/contact'],
];
export const metadata = {
  '/': ['Your digital world. Your way.', 'Explore practical accessibility adjustments for a more comfortable, personalized digital experience with A11yEase.'],
  '/features': ['Accessibility tools built around you', `Explore ${features.length} accessibility settings across nine categories, with interactive examples and clearly marked integration requirements.`],
  '/how-it-works': ['A little adjustment. A better experience.', 'Discover, try and reset A11yEase accessibility preferences with a working interactive preview.'],
  '/about': ['Building a more inclusive digital world', 'Learn about the A11yEase mission, product philosophy and approach to accessible design.'],
  '/contact': ['Let’s make digital access easier together', 'Ask about A11yEase, share accessibility feedback or discuss a product demonstration.'],
  '/faq': ['A little clarity goes a long way', 'Find answers about getting started, accessibility settings, customization, compatibility and support.'],
  '/privacy': ['Privacy policy — review draft', 'Review the clearly marked draft privacy information for the A11yEase marketing website.'],
  '/terms': ['Terms of service — review draft', 'Review the clearly marked draft terms for the A11yEase marketing website.'],
};
