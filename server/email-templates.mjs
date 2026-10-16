import { SUPPORT_EMAIL } from './contact-validation.mjs';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
}

function emailShell(heading, preview, content, reference) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(heading)} | A11yEase</title></head>
<body style="margin:0;padding:0;background:#F7F9FC;color:#14243C;font-family:Arial,Helvetica,sans-serif;line-height:1.7">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px">
<tr><td style="padding:28px 32px;border-bottom:1px solid #E2E8F0"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding-right:12px"><img src="cid:a11yeaseLogo" alt="A11yEase logo" width="52" height="48" style="display:block;border:0"></td><td style="font-size:27px;font-weight:700;color:#102447">A11y<span style="color:#2457C5">Ease</span></td></tr></table></td></tr>
<tr><td style="padding:32px"><p style="margin:0 0 12px;color:#2457C5;font-size:12px;letter-spacing:1.5px;font-weight:700">DIGITAL ACCESSIBILITY, SIMPLIFIED</p><h1 style="margin:0 0 24px;font-size:28px;line-height:1.3;color:#102447">${escapeHtml(heading)}</h1>${content}
<p style="margin:28px 0 0">Warm regards,<br><strong>The A11yEase Team</strong></p></td></tr>
<tr><td style="padding:24px 32px;background:#EFF5FF;border-radius:0 0 16px 16px;font-size:13px;color:#526176"><p style="margin:0 0 8px">A11yEase · Accessibility built around you.</p><p style="margin:0"><a href="mailto:${SUPPORT_EMAIL}" style="color:#2457C5;text-decoration:underline">${SUPPORT_EMAIL}</a></p><p style="margin:12px 0 0;overflow-wrap:anywhere">Reference: ${escapeHtml(reference)}</p></td></tr>
</table></td></tr></table></body></html>`;
}

export function buildContactEmails(contact) {
  const visitorBody = `Hi ${contact.fullName},\n\nWelcome to A11yEase, and thank you for contacting us!\n\nWe have received your inquiry. Our team will review your message and get back to you as soon as possible.\n\nYou can reply to this email if you would like to add anything.\n\nWarm regards,\nThe A11yEase Team\n${SUPPORT_EMAIL}\nReference: ${contact.requestId}`;
  const visitorHtml = emailShell('Thank you for contacting us.', 'Your inquiry has reached A11yEase. Our team will be in touch as soon as possible.', `<p style="margin:0 0 20px">Hi ${escapeHtml(contact.fullName)},</p><p style="margin:0 0 20px">Welcome to <strong>A11yEase</strong>, and thank you for getting in touch!</p><div style="padding:20px;background:#EFF5FF;border-left:4px solid #2457C5;border-radius:8px"><p style="margin:0">We have received your inquiry. Our team will review your message and <strong>get back to you as soon as possible.</strong></p></div><p style="margin:20px 0 0">You can reply to this email if you would like to add anything. We look forward to speaking with you.</p><p style="margin:20px 0 0;font-size:13px;color:#526176">This is an automatic acknowledgment of a contact form submission. If you did not contact us, you can disregard this email.</p>`, contact.requestId);
  const rows = [['Name',contact.fullName],['Email',contact.email],['Organization',contact.organization || 'Not supplied'],['Inquiry type',contact.inquiryType],['Subject',contact.subject],['Message',contact.message]];
  const ownerHtml = emailShell('A new conversation starts here.', 'A visitor sent an inquiry through the A11yEase contact form.', `<p style="margin:0 0 24px">A visitor submitted the A11yEase contact form. Reply to this email to respond to the visitor.</p><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;text-align:left">${rows.map(([label,value]) => `<tr><th scope="row" style="padding:12px 8px 12px 0;border-bottom:1px solid #E2E8F0;vertical-align:top;font-size:14px;width:110px">${label}</th><td style="padding:12px 0;border-bottom:1px solid #E2E8F0;overflow-wrap:anywhere;white-space:pre-wrap;font-size:14px">${escapeHtml(value)}</td></tr>`).join('')}</table>`, contact.requestId);
  return {
    owner: { to: SUPPORT_EMAIL, replyTo: contact.email, name: 'A11yEase', subject: `A11yEase · ${contact.inquiryType}: ${contact.subject}`, body: `New A11yEase inquiry\n\n${rows.map(([label,value]) => `${label}: ${value}`).join('\n\n')}\n\nReference: ${contact.requestId}`, htmlBody: ownerHtml },
    visitor: { to: contact.email, replyTo: SUPPORT_EMAIL, name: 'A11yEase', subject: 'Thank you for contacting A11yEase', body: visitorBody, htmlBody: visitorHtml },
  };
}
