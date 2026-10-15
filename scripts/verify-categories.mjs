import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const source=JSON.parse(await readFile('src/data/accessibility-settings.json','utf8'));
const groups=[...new Set(source.map(setting=>setting.category))];
const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
const browser=await chromium.launch({executablePath:process.env.QA_BROWSER_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage();const errors=[];const audits=[];const widths=[];
page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
await mkdir('qa',{recursive:true});
const checkOverflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'The updated page must reflow without horizontal overflow');
try{
  assert.equal(source.length,52);assert.equal(groups.length,9);assert(!source.some(setting=>setting.number===30));
  await page.goto(`${baseURL}/features`);await expect(page.locator('.detailed-features article')).toHaveCount(source.length);await expect(page.locator('.catalog-category')).toHaveCount(groups.length);await expect(page.locator('#category-samples')).toHaveCount(0);await expect(page.locator('#feature-demo .demo-frame')).toHaveCount(1);
  const rendered=await page.locator('.catalog-feature-heading h3').allTextContents();assert.deepEqual(rendered,source.map(setting=>setting.title));
  await expect(page.getByRole('searchbox',{name:'Search accessibility settings'})).toHaveCount(0);
  await expect(page.getByLabel('Accessibility category',{exact:true})).toHaveCount(0);
  for(const width of [1440,1024,768,480,360]){await page.setViewportSize({width,height:1000});await checkOverflow();await page.locator('main h1').scrollIntoViewIfNeeded();widths.push(width);if(width===1440||width===360){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`qa/catalog-${width}.png`});}}
  await page.goto(baseURL);
  await expect(page.getByRole('heading',{name:'A Sample for Every Perspective.',exact:true})).toHaveCount(0);
  await expect(page.locator('#category-samples')).toHaveCount(0);
  await expect(page.locator('#demo .demo-frame')).toHaveCount(1);
  for(const width of [1440,1024,768,480,360]){
    await page.setViewportSize({width,height:1000});await checkOverflow();
    if(width===1440||width===360){
      const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      if(report.violations.length)audits.push({width,route:'/',violations:report.violations.map(issue=>({id:issue.id,nodes:issue.nodes.map(node=>({target:node.target,summary:node.failureSummary})).slice(0,10)}))});
      await page.locator('#demo').screenshot({path:`qa/home-demo-${width}.png`});
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('button',{name:'Dark mode',exact:true}).click();
  await expect(page.locator('.demo-preview')).toHaveClass(/theme-dark/);
  await page.getByRole('button',{name:'Increase text size',exact:true}).click();
  await expect(page.locator('.demo-text-label output')).toHaveText('110%');
  await page.getByRole('button',{name:'Reset Settings',exact:true}).click();
  await expect(page.locator('.demo-text-label output')).toHaveText('100%');
  await expect(page.getByRole('button',{name:'Light mode',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.goto(baseURL);await expect(page.locator('.category-overview-item')).toHaveCount(9);await page.getByRole('link',{name:'Hearing Accessibility 4 settings to explore',exact:true}).click();await expect(page.locator('#category-hearing')).toBeFocused();
  await expect(page.locator('#category-samples')).toHaveCount(0);await page.getByRole('link',{name:'Try the visual demo',exact:true}).click();await expect(page.locator('#feature-demo')).toBeFocused();await expect(page.locator('#feature-demo .demo-frame')).toBeVisible();
  const report={settings:source.length,categories:groups.length,widths,pageAudits:2,audits,errors,interactions:'passed'};await writeFile('qa/categories-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.equal(audits.length,0,'Accessibility violations found on the home page');assert.equal(errors.length,0,'Browser errors found');
}catch(error){await writeFile('qa/categories-report.json',JSON.stringify({settings:source.length,categories:groups.length,widths,audits,errors,error:error.message},null,2));console.log(JSON.stringify({audits,errors,error:error.message},null,2));throw error;}finally{await browser.close();}
