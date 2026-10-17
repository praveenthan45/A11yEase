import { Keyboard, SlidersHorizontal, MessageCircle, CircleHelp, ShieldCheck, FileText } from 'lucide-react';

export const pageHeroImages = {
  features: {
    src:'/images/features-braille.webp', small:'/images/features-braille-small.webp',
    width:1200, height:900, alt:'Hands using a refreshable Braille display beside a computer keyboard',
    label:'ACCESS, IN DIFFERENT WAYS', caption:'Tools for individual preferences.', icon:Keyboard,
    position:'50% 55%',
  },
  howItWorks: {
    src:'/images/how-reading.webp', small:'/images/how-reading-small.webp',
    width:1200, height:800, alt:'An older adult wearing glasses and using a laptop from a comfortable armchair',
    label:'A VIEW AT YOUR OWN PACE', caption:'Small steps. Personal choices.', icon:SlidersHorizontal,
    position:'50% 45%',
  },
  contact: {
    src:'/images/contact-signing.webp', small:'/images/contact-signing-small.webp',
    width:1200, height:800, alt:'A woman communicating in sign language during a laptop video conversation',
    label:'MORE WAYS TO CONNECT', caption:'Every conversation matters.', icon:MessageCircle,
    position:'52% 45%',
  },
  faq: {
    src:'/images/faq-accessibility-support.webp', small:'/images/faq-accessibility-support-small.webp',
    width:1200, height:900, alt:'A woman wearing a hearing aid and a colleague exploring a tablet together',
    label:'HELP, IN YOUR OWN WAY', caption:'Clear answers. Comfortable choices.', icon:CircleHelp,
    position:'50% 45%',
  },
  privacy: {
    src:'/images/privacy-adaptive-workspace.webp', small:'/images/privacy-adaptive-workspace-small.webp',
    width:1200, height:900, alt:'A person with a limb difference using a trackball at an adapted computer workstation',
    label:'PERSONAL CHOICES. CLEAR INFORMATION.', caption:'Accessibility with clarity.', icon:ShieldCheck,
    position:'50% 45%',
  },
  terms: {
    src:'/images/terms-accessible-reading.webp', small:'/images/terms-accessible-reading-small.webp',
    width:1200, height:900, alt:'An older man using a handheld electronic magnifier to read a printed document',
    label:'CLEAR WORDS. INFORMED CHOICES.', caption:'An easier way to understand.', icon:FileText,
    position:'50% 45%',
  },
};
