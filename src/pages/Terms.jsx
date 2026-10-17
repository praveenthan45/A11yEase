import LegalPage from '../components/LegalPage';
import { pageHeroImages } from '../data/pageHeroImages';
const sections = [
  ['Operator and Scope', ['[TO BE COMPLETED: legal company name, registered address, jurisdiction and verified contact.] This page is a draft for the marketing website and interactive preview. It is not a substitute for finalized commercial product terms.']],
  ['Website and Demo', ['The site presents accessibility settings and a contained sample preview. Demo preferences affect the sample only. Product availability, wider deployment, pricing and support arrangements require confirmation.', 'Illustrative desktop and mobile mockups show a design concept. They do not establish compatibility with every website or device.']],
  ['Accessibility and Compatibility', ['No setting is guaranteed to be effective for every person. A settings panel does not replace accessible development, assistive technology or user testing, and does not by itself establish legal or WCAG compliance.', '[TO BE COMPLETED: supported environments, testing scope, accessibility support process and any verified service commitments.]']],
  ['Acceptable Use', ['[FOR LEGAL REVIEW: proposed acceptable-use requirements, prohibited activity and response procedures.] The operator should define appropriate rules for the website, contact endpoint and any future commercial service.']],
  ['Intellectual Property', ['[TO BE COMPLETED: ownership, permitted use, product licensing and third-party rights.] Photography, fonts and software dependencies retain their respective rights and licenses. An asset and dependency reference is included in the source repository.']],
  ['Commercial Arrangements', ['[TO BE COMPLETED IF APPLICABLE: subscription terms, payments, cancellation, refunds, availability and support.] This website does not process payments or present an unverified commercial offer.']],
  ['Disclaimers and Liability', ['[QUALIFIED LEGAL REVIEW REQUIRED: any warranties, disclaimers, limitations and mandatory consumer rights.] No enforceable exclusion of liability is invented in this draft.']],
  ['Governing Law, Disputes and Updates', ['[TO BE COMPLETED: applicable law, dispute resolution, notices and effective date.] The operator must finalize these provisions with qualified counsel before commercial launch.']],
];
export default function Terms() { return <LegalPage type="Terms of Service" sections={sections} image={pageHeroImages.terms}/>; }
