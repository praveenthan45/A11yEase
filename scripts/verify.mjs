import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = []; const results = []; const violations = []; const overflow = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !(process.env.QA_CONFIGURED_CONTACT && m.location().url === 'https://contact.example.test/api' && m.text().includes('503'))) errors.push(m.text()); });
await mkdir('qa', { recursive: true });
try {
  await page.goto(baseURL); await page.evaluate(() => document.fonts.ready); await page.screenshot({path:'qa/home-desktop.png'});
  await page.setViewportSize({width:360,height:900}); await page.screenshot({path:'qa/home-mobile.png'});
  const routes = ['/', '/features', '/how-it-works', '/about', '/contact', '/faq', '/privacy', '/terms', '/not-a-page'];
  for (const width of [1440, 1024, 768, 480, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(`${baseURL}${route}`); await page.locator('main h1').waitFor(); await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('main h1').count(), 1, `${route} must have one h1`);
      const extra = await page.evaluate(() => ({ page: document.documentElement.scrollWidth - innerWidth, elements: [...document.querySelectorAll('main *')].filter(e => { const r=e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 2 || r.left < -2) && !e.closest('[aria-hidden=true]') && !e.classList.contains('honeypot'); }).map(e => `${e.tagName}.${e.className}`).slice(0, 8) }));
      if (extra.page > 1) overflow.push({ width, route, ...extra });
      if (width === 1440 || width === 360) {
        const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        if (audit.violations.length) violations.push({ width, route, issues: audit.violations.map(v => ({ id:v.id, impact:v.impact, description:v.description, nodes:v.nodes.map(n => ({ target:n.target, summary:n.failureSummary })).slice(0, 8) })) });
      }
      results.push({ width, route, title:await page.title(), overflow:extra.page });
    }
    console.log(`Checked all routes at ${width}px.`);
  }
  await page.setViewportSize({ width:1440, height:1000 }); await page.goto(baseURL); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path:'qa/home-desktop.png', fullPage:false });
  await page.locator('#demo').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name:'Dark mode', exact:true }).click(); assert(await page.locator('.demo-preview').evaluate(e=>e.classList.contains('theme-dark')));
  assert(!(await page.locator('body').evaluate(e=>e.classList.contains('theme-dark'))));
  await page.getByRole('button', { name:'Contrast mode', exact:true }).click(); assert(await page.locator('.demo-preview').evaluate(e=>e.classList.contains('theme-contrast')));
  await page.getByRole('button', { name:'Increase text size', exact:true }).click(); assert.equal(await page.locator('.demo-text-label output').textContent(),'110%');
  for (const name of ['Text spacing','Highlight links','Reading guide','Reading mask']) { await page.getByRole('button',{name,exact:true}).click(); assert.equal(await page.getByRole('button',{name,exact:true}).getAttribute('aria-pressed'),'true'); }
  await page.getByRole('slider',{name:'Reading position',exact:true}).fill('72'); assert.equal(await page.locator('.demo-preview').evaluate(e=>e.style.getPropertyValue('--guide-position')),'72%');
  await page.getByRole('button',{name:'More settings'}).click();
  for (const name of ['Grayscale','Dyslexia-friendly font','Magnifier / Zoom','Color vision cues']) { await page.getByRole('button',{name,exact:true}).click(); assert.equal(await page.getByRole('button',{name,exact:true}).getAttribute('aria-pressed'),'true'); }
  await page.getByRole('button',{name:'Reset Settings',exact:true}).click(); assert.equal(await page.locator('.demo-text-label output').textContent(),'100%'); assert.equal(await page.getByRole('button',{name:'Light mode',exact:true}).getAttribute('aria-pressed'),'true'); assert.equal(await page.locator('.demo-control[aria-pressed=true]').count(),0);
  await page.getByRole('button',{name:'More settings'}).click(); await page.locator('#demo').screenshot({path:'qa/demo-desktop.png'});
  await page.goto(`${baseURL}/features`); await page.getByRole('link',{name:'About Us',exact:true}).first().click(); await expect(page.locator('#main-content')).toBeFocused();
  await page.goto(baseURL); await page.getByRole('button',{name:'More info about Increase Text Size'}).click(); assert.equal(await page.getByRole('button',{name:'Less info about Increase Text Size'}).getAttribute('aria-expanded'),'true');
  const question=page.getByRole('button',{name:'What is A11yEase?',exact:true}); await question.click(); assert.equal(await question.getAttribute('aria-expanded'),'true'); await question.click(); assert.equal(await question.getAttribute('aria-expanded'),'false');
  await page.goto(`${baseURL}/faq`); await page.getByRole('searchbox').fill('keyboard'); assert.equal(await page.locator('.search-count').textContent(),'2 matching questions'); await page.getByRole('searchbox').fill('no-matching-question-xyz'); assert.equal(await page.locator('.search-count').textContent(),'0 matching questions'); await page.getByRole('button',{name:'Clear Search'}).click();
  await page.goto(`${baseURL}/contact`); await page.getByRole('button',{name:'Send Message'}).click(); assert.equal(await page.locator('[aria-invalid=true]').count(),5); assert.equal(await page.locator('#contact-fullName').evaluate(e=>e===document.activeElement),true);
  await page.getByLabel('Full Name',{exact:false}).fill('Jamie Reader'); await page.getByLabel('Email Address',{exact:false}).fill('jamie@example.com'); await page.getByLabel('Subject',{exact:false}).fill('Product demonstration'); await page.getByRole('textbox',{name:'Message (required)',exact:true}).fill('I would like to explore the reading controls in a product demonstration.'); await page.locator('input[name=consent]').check();
  if (!process.env.QA_CONFIGURED_CONTACT) { await page.getByRole('button',{name:'Send Message'}).click(); assert((await page.locator('.form-status').textContent()).includes('Message not sent')); }
  else {
    await page.route('https://contact.example.test/api', async route=>{await new Promise(resolve=>setTimeout(resolve,300));await route.fulfill({status:503,headers:{'Access-Control-Allow-Origin':'*'},body:'Unavailable'});});
    await page.waitForTimeout(3100); await page.getByRole('button',{name:'Send Message'}).click(); await page.getByRole('button',{name:'Sending…'}).waitFor(); await page.locator('.status-error').waitFor(); assert((await page.locator('.form-status').textContent()).includes('could not be sent')); assert.equal(await page.locator('#contact-fullName').inputValue(),'Jamie Reader');
    await page.reload(); await page.unroute('https://contact.example.test/api');
    await page.route('https://contact.example.test/api', async route=>{const body=route.request().postDataJSON(); assert.equal(body.fullName,'Jamie Reader'); assert.equal(body.consent,true); await route.fulfill({status:200,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:'{"accepted":true}'});});
    await page.getByLabel('Full Name',{exact:false}).fill('Jamie Reader'); await page.getByLabel('Email Address',{exact:false}).fill('jamie@example.com'); await page.getByLabel('Subject',{exact:false}).fill('Product demonstration'); await page.getByRole('textbox',{name:'Message (required)',exact:true}).fill('I would like to explore the reading controls in a product demonstration.'); await page.locator('input[name=consent]').check(); await page.waitForTimeout(3100); await page.getByRole('button',{name:'Send Message'}).click(); await page.locator('.status-success').waitFor(); assert.equal(await page.locator('#contact-fullName').inputValue(),'');
  }
  await page.setViewportSize({width:360,height:900}); await page.goto(baseURL); await page.getByRole('button',{name:'Open navigation'}).click(); assert.equal(await page.locator('#primary-navigation').isVisible(),true); await page.keyboard.press('Escape'); assert.equal(await page.locator('#primary-navigation').isVisible(),false); assert.equal(await page.getByRole('button',{name:'Open navigation'}).evaluate(e=>e===document.activeElement),true);
  await page.getByRole('button',{name:'Open navigation'}).click(); await page.getByRole('link',{name:'Features',exact:true}).first().click(); await page.waitForURL('**/features'); await expect(page.locator('#primary-navigation')).toBeHidden();
  await page.goto(baseURL); await page.locator('main h1').waitFor(); await page.keyboard.press('Tab'); assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),true); await page.keyboard.press('Enter'); await expect(page.locator('#main-content')).toBeFocused();
  await page.screenshot({path:'qa/home-mobile.png',fullPage:false}); await page.locator('#demo').scrollIntoViewIfNeeded(); await page.locator('#demo').screenshot({path:'qa/demo-mobile.png'});
  await page.getByRole('slider',{name:'Text size',exact:true}).fill('150'); await page.getByRole('button',{name:'More settings'}).click(); for(const name of ['Dyslexia-friendly font','Magnifier / Zoom','Text spacing']) await page.getByRole('button',{name,exact:true}).click(); await page.evaluate(()=>document.fonts.ready); assert.equal(await page.locator('.sample-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'Combined demo preferences must reflow'); await page.getByRole('button',{name:'Reset Settings',exact:true}).click();
  await page.setViewportSize({width:720,height:900}); await page.goto(baseURL); await page.locator('main h1').waitFor(); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.emulateMedia({reducedMotion:'reduce'}); assert.equal(await page.locator('.hero-panel-wrap').evaluate(e=>getComputedStyle(e).animationName),'none');
  const report={results,overflow,violations,errors,interactionChecks:'passed',configuredContact:!!process.env.QA_CONFIGURED_CONTACT}; await writeFile(process.env.QA_CONFIGURED_CONTACT ? 'qa/report-configured.json' : 'qa/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({routeViewportChecks:results.length,overflow,violations,errors,interactionChecks:'passed'},null,2));
  assert.equal(overflow.length,0,'Horizontal overflow found'); assert.equal(violations.length,0,'Automated accessibility issues found'); assert.equal(errors.length,0,'Browser errors found');
} catch (error) { await writeFile(process.env.QA_CONFIGURED_CONTACT ? 'qa/report-configured.json' : 'qa/report.json',JSON.stringify({results,overflow,violations,errors,interactionError:error.message},null,2)); console.log(JSON.stringify({overflow,issues:violations.map(v=>({route:v.route,width:v.width,issues:v.issues.map(i=>({id:i.id,nodes:i.nodes}))})),errors},null,2)); throw error; } finally {await browser.close();}
