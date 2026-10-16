import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const validation = await readFile(new URL('server/contact-validation.mjs',root),'utf8');
const templates = await readFile(new URL('server/email-templates.mjs',root),'utf8');
const handler = await readFile(new URL('integrations/google-apps-script/handler.gs',root),'utf8');
const logo = await readFile(new URL('integrations/google-apps-script/a11yease-logo.png',root));
const script = [
  '// A11yEase contact emails. Generated: npm run build:email. No secrets are included.',
  `const A11YEASE_LOGO_BASE64 = '${logo.toString('base64')}';`,
  validation.replace(/^export /gm,''),
  templates.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,''),
  handler,
].join('\n\n');
await writeFile(new URL('integrations/google-apps-script/Code.gs',root),script);
await writeFile(new URL('integrations/google-apps-script/appsscript.json',root),JSON.stringify({
  timeZone:'Asia/Kolkata', exceptionLogging:'STACKDRIVER', runtimeVersion:'V8',
  oauthScopes:['https://www.googleapis.com/auth/script.send_mail'],
},null,2)+'\n');
// Local-only visual previews use the same templates and the real embedded logo.
const { buildContactEmails } = await import('../server/email-templates.mjs');
const example = { fullName:'Jamie Reader',email:'visitor@example.com',organization:'Example organization',inquiryType:'Product Demo',subject:'Exploring A11yEase',message:'Please tell me more about the accessibility settings.',requestId:'a11e0000-1234-4567-8123-123456789abc' };
await mkdir(new URL('qa/email',root),{recursive:true});
for (const [name,email] of Object.entries(buildContactEmails(example))) {
  await writeFile(new URL(`qa/email/${name}.html`,root), email.htmlBody.replace('cid:a11yeaseLogo',`data:image/png;base64,${logo.toString('base64')}`));
}
console.log('Built Google Apps Script with the A11yEase logo and two email templates. No email was sent.');
