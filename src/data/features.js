import { additionalFeatures } from './additionalFeatures';
import { featureCategories } from './featureCategories';
import catalog from './accessibility-settings.json';
import { featureExamples } from './featureExamples';
import { AArrowUp, AArrowDown, Contrast, Moon, Sun, Palette, Eye, AlignHorizontalSpaceAround, ZoomIn, Link2, Type, ScanLine, Rows3 } from 'lucide-react';
const originalFeatures = [
  { id: 'increase-text', title: 'Increase Text Size', icon: AArrowUp, category: 'Visual Customization', description: 'Enlarge the sample text in clear, gradual steps.', detail: 'Increase the sample’s text in small increments. Larger text can make reading more comfortable; your browser’s own zoom remains useful for the whole page.', tag: 'A clearer view' },
  { id: 'decrease-text', title: 'Decrease Text Size', icon: AArrowDown, category: 'Visual Customization', description: 'Bring enlarged text back toward your preferred size.', detail: 'Reduce text from an enlarged setting or choose a smaller view within the demo’s supported range. Start with a readable size and adjust gradually.' },
  { id: 'high-contrast', title: 'High Contrast Mode', icon: Contrast, category: 'Visual Customization', description: 'Compare a distinct black-and-white reading surface.', detail: 'Try a high contrast black-and-white treatment in the preview. This is an individual preference and does not repair the accessibility of an underlying website.' },
  { id: 'dark-mode', title: 'Dark Mode', icon: Moon, category: 'Visual Customization', description: 'Read the sample on a navy canvas with light text.', detail: 'Switch the sample to a navy background with light text. Dark backgrounds feel comfortable for some people and less comfortable for others.' },
  { id: 'light-mode', title: 'Light Mode', icon: Sun, category: 'Visual Customization', description: 'Restore dark text on a familiar light background.', detail: 'Use the default light background with dark text. Switching to light mode turns off the sample’s dark and high contrast themes.' },
  { id: 'grayscale', title: 'Grayscale Mode', icon: Palette, category: 'Visual Customization', description: 'Compare the sample with its color removed.', detail: 'Remove color from the sample preview while preserving labels and shapes. Grayscale may reduce visual distraction, but it can also make some content harder to distinguish.' },
  { id: 'color-support', title: 'Color Blindness Support', icon: Eye, category: 'Comfort and Navigation', description: 'Use explicit labels and underlines alongside color cues.', detail: 'The example adds explicit text labels to category cues and underlines links. It illustrates redundant visual cues; it is not a universal color-vision correction or website repair.' },
  { id: 'text-spacing', title: 'Text Spacing Adjustment', icon: AlignHorizontalSpaceAround, category: 'Reading Assistance', description: 'Add room between letters and lines in the article.', detail: 'Increase letter spacing and line height in the sample article. Try different combinations with text size to find your preferred rhythm.' },
  { id: 'zoom', title: 'Magnifier / Zoom', icon: ZoomIn, category: 'Visual Customization', description: 'Enlarge the sample article and its imagery together.', detail: 'Enlarge the sample article’s text and imagery together. This contained zoom example does not magnify the operating system or every element on another website.' },
  { id: 'highlight-links', title: 'Highlight Links', icon: Link2, category: 'Comfort and Navigation', description: 'Give sample links an underline and a visible boundary.', detail: 'Add a visible underline, outline and background to links in the sample. A consistent label still describes where every link goes.' },
  { id: 'reading-font', title: 'Dyslexia-Friendly Font', icon: Type, category: 'Reading Assistance', description: 'Compare distinctive letter shapes with the default font.', detail: 'Try OpenDyslexic, an alternative typeface with distinctive letter shapes. Reading preferences vary, and no font is guaranteed to improve reading for every person.' },
  { id: 'reading-guide', title: 'Reading Guide', icon: ScanLine, category: 'Reading Assistance', description: 'Mark your place with a movable horizontal guide.', detail: 'Use a horizontal guide over the sample. A labeled position slider moves the guide with the keyboard, touch or a pointer.' },
  { id: 'reading-mask', title: 'Reading Mask', icon: Rows3, category: 'Reading Assistance', description: 'Dim nearby content around a movable reading window.', detail: 'Dim the sample outside a horizontal reading window. Move the window using the position slider. This is a visual effect and does not hide text from assistive technology.' },
];

export const features = catalog.map(setting => {
  const original = originalFeatures.find(feature => feature.title === setting.title);
  const content = original || additionalFeatures[setting.title];
  if (!content) throw new Error(`Missing feature content: ${setting.title}`);
  if (!featureExamples[content.id]) throw new Error(`Missing feature example: ${setting.title}`);
  return { ...content, ...setting, example: featureExamples[content.id], status: content.status || 'sample' };
});
export const categories = featureCategories.map(category => category.title);
export const featuredFeatures = features.filter(feature => feature.number <= 13);
