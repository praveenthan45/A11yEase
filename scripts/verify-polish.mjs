import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ executablePath:process.env.QA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless:true });
const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const page = await context.newPage();
const errors = []; const audits = [];
page.on('pageerror', error=>errors.push(error.message));
await mkdir('qa',{recursive:true});
try {
  await page.goto(base);
  const card = page.locator('.feature-card').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/reveal-ready/);
  assert.equal(await card.evaluate(e=>getComputedStyle(e).animationName),'card-enter');
  await page.waitForTimeout(850);
  await card.hover(); await page.waitForTimeout(300);
  assert(await card.evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m42 < 0),'Pointer hover must lift the card');
  await page.mouse.move(0,0); await page.waitForTimeout(300);
  const offscreen = page.getByRole('button',{name:'More info about Reading Mask',exact:true});
  await offscreen.focus(); await expect(offscreen).toBeFocused();
  assert.equal(await offscreen.evaluate(e=>getComputedStyle(e.closest('.feature-card')).opacity),'1','Focused cards must be immediately visible');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:'Less info about Reading Mask',exact:true})).toHaveAttribute('aria-expanded','true');

  for (const width of [1440,360]) {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width,height:1000}); await page.goto(base);
    const spotlight = page.locator('.feature-spotlight');
    await spotlight.scrollIntoViewIfNeeded();
    for (const [name,id] of [['Settle into a longer read','reading'],['Find your next step','navigation'],['Start from a familiar view','preferences']]) {
      const option = spotlight.getByRole('button',{name:new RegExp(`^${name}`)});
      await option.focus(); await page.keyboard.press('Enter');
      await expect(option).toHaveAttribute('aria-pressed','true');
      await expect(spotlight.locator('.moment-preview')).toHaveClass(new RegExp(`moment-preview--${id}`));
      await spotlight.getByRole('button',{name:'Show default view',exact:true}).click();
      assert(!(await spotlight.locator('.moment-preview').getAttribute('class')).includes('moment-preview--'));
      await spotlight.getByRole('button',{name:'Show adjusted view',exact:true}).click();
      const audit = await new AxeBuilder({page}).include('.feature-spotlight').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      audits.push({width,id,violations:audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1),true);
    await spotlight.screenshot({path:`qa/spotlight-${width}.png`});
    if (width === 1440) await page.locator('.feature-bento').screenshot({path:'qa/cards-desktop.png'});
  }
  await page.goto(`${base}/features`);
  assert.equal(await page.locator('.catalog-feature .feature-example').count(),52);
  assert.equal(await page.locator('.catalog-feature .feature-example p').evaluateAll(es=>es.every(e=>e.textContent.trim().length>50)),true);
  await page.emulateMedia({reducedMotion:'no-preference'});
  const inserted = page.locator('.catalog-feature').first();
  await inserted.scrollIntoViewIfNeeded(); await expect(inserted).toHaveClass(/reveal-ready/);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await inserted.evaluate(e=>getComputedStyle(e).animationName),'none');
  assert.equal(await page.locator('.reveal-pending').count(),0,'Changing motion preference must reveal pending content');
  await inserted.hover(); assert.equal(await inserted.evaluate(e=>getComputedStyle(e).transform),'none');

  const compositions = new Set();
  for (const [route,variant] of [['/','reading'],['/features','compare'],['/how-it-works','workflow'],['/about','mission'],['/faq','support']]) {
    await page.setViewportSize({width:1440,height:1000}); await page.goto(`${base}${route}`);
    await expect(page.locator(`.conversion-visual--${variant}`)).toHaveCount(1);
    assert.equal(await page.locator('.cta-mark').count(),0);
    compositions.add(await page.locator('.conversion-visual').innerHTML());
    await page.locator('.conversion').screenshot({path:`qa/cta-${variant}.png`});
    await page.setViewportSize({width:360,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1),true);
    await page.locator('.conversion').screenshot({path:`qa/cta-${variant}-mobile.png`});
  }
  assert.equal(compositions.size,5);
  assert(audits.every(a=>a.violations.length===0),JSON.stringify(audits));
  assert.equal(errors.length,0,JSON.stringify(errors));
  await writeFile('qa/polish-report.json',JSON.stringify({audits,errors,animationChecks:'passed',examples:52,uniqueCtaCompositions:5},null,2));
  console.log('Feature comparison, keyboard interactions, motion preferences, dynamic card reveals, 52 examples and five unique CTA previews passed.');
} finally { await browser.close(); }
