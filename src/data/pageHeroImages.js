import { Keyboard, SlidersHorizontal, MessageCircle } from 'lucide-react';

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
};
