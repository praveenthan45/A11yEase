import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5186';
const endpoint = 'https://formsubmit.co/ajax/gen.praveenthan@gmail.com';
const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless:true });
const context = await browser.newContext({ viewport:{width:1440,height:1000}, reducedMotion:'reduce' });
const page = await context.newPage();
const errors=[];const payloads=[];const audits=[];
let mode='activation';
page.on('pageerror', error=>errors.push(error.message));
await page.clock.install();
// Every email request is intercepted. These browser checks send no mail.
await page.route(endpoint, async route=>{
  payloads.push(route.request().postDataJSON());
  await new Promise(resolve=>setTimeout(resolve,100));
  if(mode==='rate-limit') return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({success:false})});
  if(mode==='malformed') return route.fulfill({status:200,contentType:'text/html',body:'Unexpected provider page'});
  const data = mode==='activation' ? {success:'false',message:'This form needs Activation. Check your email.'} : mode==='failure' ? {success:'false',message:'Service unavailable'} : {success:'true',message:'The form was submitted successfully.'};
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
});

try {
  await mkdir('qa',{recursive:true});
  for(const route of ['/','/features','/how-it-works','/about','/contact','/faq','/privacy','/terms']){
    await page.goto(`${base}${route}`);
    const links=await page.getByRole('link',{name:'Get Started',exact:true}).all();
    assert(links.length>0,`Missing Get Started link on ${route}`);
    for(const link of links) await expect(link).toHaveAttribute('href','/contact');
  }
  await page.goto(base);
  await page.getByRole('link',{name:'Get Started',exact:true}).first().click();
  await expect(page).toHaveURL(`${base}/contact`);
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page.getByRole('link',{name:'gen.praveenthan@gmail.com',exact:true})).toHaveAttribute('href','mailto:gen.praveenthan@gmail.com');
  await expect(page.getByText('Preview mode · sending is not connected.',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.locator('[aria-invalid=true]')).toHaveCount(5);
  await expect(page.getByLabel('Full Name',{exact:false})).toBeFocused();
  await page.getByLabel('Full Name',{exact:false}).fill('Contact integration check');
  await page.getByLabel('Email Address',{exact:false}).fill('reader@example.test');
  await page.getByLabel('Organization',{exact:false}).fill('Test fixture');
  await page.getByLabel('Inquiry Type',{exact:true}).selectOption('Product Demo');
  await page.getByLabel('Subject',{exact:false}).fill('Guided product demonstration');
  await page.getByRole('textbox',{name:'Message (required)',exact:true}).fill('Please arrange a product demonstration. This is an intercepted test.');
  await page.locator('input[name=consent]').check();
  await page.clock.fastForward(3100);
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.getByRole('button',{name:'Sending…',exact:true})).toBeDisabled();
  await expect(page.locator('.form-status')).toContainText('awaiting verification');
  await expect(page.getByLabel('Full Name',{exact:false})).toHaveValue('Contact integration check');
  assert.equal(payloads[0]._replyto,'reader@example.test');
  assert.equal(payloads[0]._template,'table');
  assert.equal(payloads[0]._subject,'A11yEase · Product Demo: Guided product demonstration');
  assert.equal(payloads[0].consent,true);
  assert.equal(payloads[0]._honey,'');
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.locator('.form-status')).toContainText('30 seconds');
  assert.equal(payloads.length,1,'Cooldown must prevent duplicate requests');
  for(const [nextMode,expected] of [['failure','could not be sent'],['rate-limit','Too many requests'],['malformed','could not be sent']]){
    mode=nextMode;await page.clock.fastForward(30001);
    await page.getByRole('button',{name:'Send Message',exact:true}).click();
    await expect(page.locator('.form-status')).toContainText(expected);
    await expect(page.getByLabel('Email Address',{exact:false})).toHaveValue('reader@example.test');
  }
  mode='success';await page.clock.fastForward(30001);
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.locator('.form-status')).toContainText('accepted for delivery');
  await expect(page.getByLabel('Full Name',{exact:false})).toHaveValue('');
  for(const width of [1440,1024,768,480,360]){
    await page.setViewportSize({width,height:1000});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Contact overflow at ${width}px`);
    if(width===1440||width===360){
      const report=await new AxeBuilder({page}).include('.contact-section').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      audits.push({width,violations:report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
      await page.locator('.contact-section').screenshot({path:`qa/contact-delivery-${width}.png`});
    }
  }
  await page.goto(base);
  await page.getByRole('button',{name:'Open navigation',exact:true}).click();
  await page.getByRole('link',{name:'Get Started',exact:true}).first().click();
  await expect(page).toHaveURL(`${base}/contact`);
  await expect(page.locator('#primary-navigation')).toBeHidden();
  assert(audits.every(a=>!a.violations.length),JSON.stringify(audits));
  assert.equal(errors.length,0,errors.join('\n'));
  const report={getStartedRoutes:8,widths:[1440,1024,768,480,360],requests:payloads.length,activation:'passed',providerFailures:'passed',acceptedSubmission:'passed',mobileNavigation:'passed',audits,errors,emailsSent:0};
  await writeFile('qa/contact-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally { await browser.close(); }
