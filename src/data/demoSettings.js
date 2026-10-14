export const preferenceKey='a11yease-demo-preferences-v1';
export const legacyPreferenceKey='accessease-demo-preferences-v1';
export const defaultSettings={textSize:100,theme:'light',spacing:false,links:false,guide:false,mask:false,grayscale:false,font:false,zoom:false,colorCues:false,position:55,alignment:'left',simpleText:false,paragraphs:false};
export function readPreferences(){
  try{
    const raw=JSON.parse(window.localStorage.getItem(preferenceKey)||window.localStorage.getItem(legacyPreferenceKey));if(!raw||typeof raw!=='object')return {...defaultSettings};
    const settings={...defaultSettings};
    for(const key of Object.keys(settings)){if(typeof settings[key]==='boolean'&&typeof raw[key]==='boolean')settings[key]=raw[key];}
    if(Number.isFinite(raw.textSize)&&raw.textSize>=80&&raw.textSize<=150&&raw.textSize%10===0)settings.textSize=raw.textSize;
    if(['light','dark','contrast'].includes(raw.theme))settings.theme=raw.theme;
    if(Number.isFinite(raw.position)&&raw.position>=10&&raw.position<=90)settings.position=raw.position;
    if(['left','center'].includes(raw.alignment))settings.alignment=raw.alignment;
    return settings;
  }catch{return {...defaultSettings};}
}
