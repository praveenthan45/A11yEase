# Enable branded A11yEase contact emails

## Current hosted integration

The original hosted Sites copy is activated at https://accessease-digital-comfort.gen-praveenb.chatgpt.site/contact. Google authorization and the token-protected Web app deployment are complete. Inquiry and thank-you messages were verified in the receiving Gmail inbox, and the published form passed a live submission test. The logo is attached inline in both messages.

The deployed Google script URL (public configuration; not the private shared token) is:

```text
https://script.google.com/macros/s/AKfycbz87A0LCy7JHZpsJXBycXdy4IqxNoM-XcVdxwqj-R8Y54BUVOK4ax9ttyc_PYPDVgE66A/exec
```

The shared token is stored only in Google Script Properties and the Sites runtime secret. This repository contains no token value. Enabling the separate Render copy still requires its server-only environment configuration; its working FormSubmit default is retained until that setup is complete.

## Setup for another deployment

The existing FormSubmit inbox forwarding remains the default until you enable this integration. FormSubmit's AJAX endpoint cannot send autoresponses. This integration replaces that forwarding with **two Google MailApp emails**: a branded inquiry notification to `gen.praveenthan@gmail.com`, and a branded acknowledgment to the visitor. Both contain the supplied A11yEase logo as an inline PNG and a plain-text fallback.

Visitor subject: **Thank you for contacting A11yEase**

Visitor message: “Welcome to A11yEase, and thank you for getting in touch! We have received your inquiry. Our team will review your message and get back to you as soon as possible.”

## 1. Prepare the script

Run `npm run build:email`. It generates `integrations/google-apps-script/Code.gs` from the validated email templates and the existing logo. It also writes local HTML previews in `qa/email/`; no email is sent. Do not edit the generated file independently.

Sign into **gen.praveenthan@gmail.com** at [Google Apps Script](https://script.google.com/home/start). Create a new project named **A11yEase Contact Emails**. Replace the default `Code.gs` with the generated file from this repository. Enable **Show appsscript.json manifest file in editor** under Project Settings and replace that manifest with the supplied `appsscript.json`.

## 2. Configure a server-only shared token

Generate a random token locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

In Apps Script → Project Settings → Script Properties, add **CONTACT_SCRIPT_TOKEN** with that value. Keep the same value for Render in step 4. Do not paste it into chat, source, the frontend, or any `VITE_` variable.

## 3. Authorize and deploy Google Apps Script

Select **authorizeMail** in the editor and run it. Review Google's permissions and authorize sending email from the intended Gmail account. MailApp requests the `script.send_mail` scope; it does not request access to read your inbox. The authorization function sends no email.

Choose **Deploy → New deployment → Web app**:

- **Execute as:** Me (`gen.praveenthan@gmail.com`). This is the actual sending account.
- **Who has access:** Anyone. The server-only shared token independently protects the POST handler.

Copy the deployment URL ending in **/exec**. Do not use the test `/dev` URL. Never put the token in that URL. When updating script code later, publish a **new version of the same deployment**.

## 4. Configure the existing Render Node Web Service

Use build command `npm ci --include=dev && npm run build` and start command `npm start`. The start command now runs the production static frontend and `/api/contact` on the same Node service. A Render Static Site cannot run this API.

Add these environment variables in Render:

| Key | Value |
| --- | --- |
| `CONTACT_SCRIPT_URL` | The real Apps Script `/exec` deployment URL |
| `CONTACT_SCRIPT_TOKEN` | Same private random token as step 2; keep secret |
| `CONTACT_ALLOWED_ORIGINS` | Your exact Render website origin, plus `https://accessease-digital-comfort.gen-praveenb.chatgpt.site` if using that site; comma separated, no trailing slash |
| `VITE_CONTACT_API_URL` | `/api/contact` |

Rebuild and redeploy after changing the `VITE_` variable. `CONTACT_*` values are runtime server configuration and are never included in the browser bundle. Render's free service blocks common SMTP ports; this integration uses Google's HTTPS endpoint instead.

For local backend testing, use Node's `--env-file=.env.server.local` option with `server/index.mjs`; keep that file ignored. Add your exact local origin to `CONTACT_ALLOWED_ORIGINS`. Vite alone does not run this Node API; test the built frontend with the production server.

## 5. Configure the original hosted Sites copy

The original hosted copy now includes an HTTPS contact API in its Sites Worker. Configure `CONTACT_SCRIPT_URL`, secret `CONTACT_SCRIPT_TOKEN`, and `CONTACT_ALLOWED_ORIGINS=https://accessease-digital-comfort.gen-praveenb.chatgpt.site` using the native Sites environment settings. Build that frontend with `VITE_CONTACT_API_URL=/api/contact` and republish after the Google authorization and script deployment are ready. Run `npm run build:hosted` for that deployment; it runs Vite followed by `scripts/build-hosted-worker.mjs`, which embeds the existing frontend assets in the Worker. Site identity and audience are preserved. The ordinary `npm run build` still creates static `dist/` output for local preview and the Node server; use the hosted build only when packaging for Sites.

The GitHub/Render copy runs the same contact API using Node. A separately hosted static copy can point to the real Render `/api/contact` URL instead, with its exact origin allowed by the API. The working FormSubmit default remains active until one of these configured backends is available.

## 6. Check actual delivery

Submit the contact form with an email address you can access. Confirm the owner notification arrives in `gen.praveenthan@gmail.com`, and the visitor receives the acknowledgment. Check the logo, sender name, reply behavior and Inbox/Spam in both mailboxes. API acceptance cannot guarantee inbox placement. Do not report this feature as live until the script, environment and both deliveries have been verified.

## Behavior and maintenance

The form allows an immediate retry after definite rejection. Only an actual server rate limit or busy-service response starts the visible retry countdown. The API returns safe error codes for invalid details, quota, busy state, missing configuration and origin rejection; the form retains entered details. Unknown delivery keeps the same request ID for unchanged details, while a changed email address or message receives a new ID. There is no recipient allowlist limiting submissions to the owner mailbox.

- Both recipients and templates are constructed by trusted code. Visitors cannot supply custom HTML, headers or a recipient list. Owner notifications go to the fixed support mailbox; the visitor receipt contains no copy of the private inquiry.
- Server validation, a 16 KB request limit, exact allowed origins, a five-attempt/hour per-client process-local throttle, and a script-side three-inquiry/hour per-recipient throttle supplement the form's existing controls. These are basic protections; use an edge rate limit and a bot challenge as traffic grows. Origins and client timing are not authentication.
- The script serializes sends with a lock and retains request IDs and delivery flags in Script Properties for up to 24 hours; it does not persist inquiry text or visitor email there. Expired records are removed on the next valid request. Email messages still exist in the sending and receiving mail systems according to those systems' settings. Cache-based throttles are best effort and may reset if Google evicts entries.
- Retries of the same request ID do not resend an accepted inquiry. If the owner mail succeeds but the receipt fails, the UI confirms the inquiry and explains the receipt issue. An uncertain send is not automatically retried; the same inquiry reference is preserved. There is no durable background retry queue, and Gmail send plus state storage cannot be atomic.
- MailApp has account-specific daily quotas. Each inquiry uses two recipient allocations. The script checks for two available allocations before sending. Review [Google's current quotas](https://developers.google.com/apps-script/guides/services/quotas); use a transactional service if volume exceeds this account's allocation.
- The privacy notice must describe the integration used on the deployed frontend. The form switches its notice to Google Apps Script when its endpoint is `/api/contact`. The legal privacy page remains a review draft.

References: [MailApp HTML and inline images](https://developers.google.com/apps-script/reference/mail/mail-app), [web app deployment](https://developers.google.com/apps-script/guides/web), [FormSubmit autoresponse limitation](https://formsubmit.co/documentation), [Render free service SMTP restrictions](https://render.com/docs/free).
