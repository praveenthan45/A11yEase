import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.QA_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const name of ['visitor','owner']) for (const width of [600,360]) {
    await page.setViewportSize({width,height:900});
    await page.goto(pathToFileURL(resolve(`qa/email/${name}.html`)).href);
    const logo=page.getByAltText('A11yEase logo');
    assert.equal(await logo.evaluate(image=>image.complete && image.naturalWidth>0),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:`qa/email/${name}-${width}.png`,fullPage:true});
  }
  const base=process.env.QA_EMAIL_BASE_URL || 'http://127.0.0.1:5188';
  const requests=[]; let reply={success:true,ownerAccepted:true,confirmationAccepted:true};
  await context.route('**/api/contact',async route=>{
    requests.push(route.request().postDataJSON());
    await route.fulfill({status:202,contentType:'application/json',body:JSON.stringify(reply)});
  });
  await page.setViewportSize({width:360,height:900});
  await page.clock.install();
  await page.goto(`${base}/contact`);
  const fill = async () => {
    await page.getByLabel('Full Name').fill('Jamie Reader');
    await page.getByLabel('Email Address').fill('visitor@example.com');
    await page.getByLabel('Subject',{exact:false}).fill('A product demonstration');
    await page.getByLabel('Message (required)',{exact:true}).fill('Please tell me about A11yEase and its features.');
    await page.getByRole('checkbox').check();
    await page.clock.fastForward(3100);
  };
  await fill();
  await page.getByRole('button',{name:'Send Message'}).click();
  await page.getByRole('status').filter({hasText:'thank-you email were accepted'}).waitFor();
  assert.equal(await page.getByLabel('Full Name').inputValue(),'');
  assert.match(requests[0].requestId,/^[a-f0-9-]{36}$/);
  await fill(); await page.clock.fastForward(31000);
  reply={success:true,ownerAccepted:true,confirmationAccepted:false};
  await page.getByRole('button',{name:'Send Message'}).click();
  await page.getByRole('status').filter({hasText:'You do not need to submit again'}).waitFor();
  assert.notEqual(requests[0].requestId,requests[1].requestId);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'qa/email/contact-partial-360.png',fullPage:true});
  await context.unroute('**/api/contact');
  await context.route('**/api/contact',async route=>{
    requests.push(route.request().postDataJSON());
    await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({success:false,code:'delivery-unknown'})});
  });
  await fill(); await page.clock.fastForward(31000);
  await page.getByRole('button',{name:'Send Message'}).click();
  await page.getByRole('status').filter({hasText:'could not confirm delivery'}).waitFor();
  assert.equal(await page.getByLabel('Full Name').inputValue(),'Jamie Reader');
  await page.clock.fastForward(31000);
  await page.getByRole('button',{name:'Send Message'}).click();
  await page.getByRole('status').filter({hasText:'could not confirm delivery'}).waitFor();
  assert.equal(requests[2].requestId,requests[3].requestId);
  console.log(JSON.stringify({emailPreviews:'passed at 600/360px',embeddedLogo:'passed',visitorConfirmation:'passed',partialAcceptance:'passed',retryReference:'passed',emailsSent:0}));
} finally { await browser.close(); }
