import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { site } from '../config/site';
import { createContactPayload, isFormSubmitEndpoint, isBrandedContactEndpoint, readContactResponse } from '../lib/contactService';
const types = ['General Enquiry', 'Product Demo', 'Technical Support', 'Accessibility Feedback', 'Partnership', 'Other'];
const empty = { fullName: '', email: '', organization: '', inquiryType: 'General Enquiry', subject: '', message: '', consent: false, website: '' };
function validate(values) {
  const errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Please enter your full name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!types.includes(values.inquiryType)) errors.inquiryType = 'Please choose a listed inquiry type.';
  if (values.subject.trim().length < 3) errors.subject = 'Please enter a subject (at least 3 characters).';
  if (values.message.trim().length < 10) errors.message = 'Please include a little more detail (at least 10 characters).';
  if (!values.consent) errors.consent = 'Please acknowledge how your contact details will be used.';
  return errors;
}
export default function ContactForm() {
  const [values, setValues] = useState(empty); const [errors, setErrors] = useState({}); const [status, setStatus] = useState({ type: '', message: '' });
  const started = useRef(Date.now()); const lastAttempt = useRef(0); const formRef = useRef(null);
  const requestId = useRef(null);
  const change = e => { const { name, value, checked, type } = e.target; setValues(v => ({ ...v, [name]: type === 'checkbox' ? checked : value })); if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined })); };
  const submit = async e => {
    e.preventDefault(); if (status.type === 'loading') return;
    const nextErrors = validate(values); setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setStatus({ type: 'error', message: 'Please check the highlighted fields before sending.' }); requestAnimationFrame(() => formRef.current?.elements[Object.keys(nextErrors)[0]]?.focus()); return; }
    if (!site.contactEndpoint) { setStatus({ type: 'info', message: 'Message not sent: this preview has no contact service connected. A production endpoint must be configured before messages can be delivered.' }); return; }
    if (values.website || Date.now() - started.current < 3000) { setStatus({ type: 'error', message: 'Unable to submit yet. Please wait a moment and try again.' }); return; }
    if (Date.now() - lastAttempt.current < 30000) { setStatus({ type: 'error', message: 'Please wait 30 seconds between submission attempts.' }); return; }
    lastAttempt.current = Date.now(); setStatus({ type: 'loading', message: 'Sending your message…' });
    requestId.current ||= crypto.randomUUID();
    const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 40000);
    try {
      const response = await fetch(site.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(createContactPayload(values, Date.now() - started.current, site.contactEndpoint, requestId.current)), signal: controller.signal });
      const result = await readContactResponse(response, site.contactEndpoint);
      if (result === 'activation-required') {
        setStatus({ type: 'info', message: `Message delivery is awaiting verification of our receiving mailbox. Your details are still here. Please email ${site.supportEmail} directly in the meantime.` });
        return;
      }
      const message = result === 'accepted-with-confirmation'
        ? 'Thank you for contacting A11yEase. Your inquiry and thank-you email were accepted for delivery. Please check your inbox or spam folder. Our team will respond as soon as possible.'
        : result === 'accepted-without-confirmation'
          ? 'Your inquiry was accepted, but we could not confirm the thank-you email. Our team will respond as soon as possible. You do not need to submit again.'
          : 'Your message was accepted for delivery. Thank you for reaching out.';
      setStatus({ type: 'success', message }); setValues(empty); started.current = Date.now(); requestId.current = null;
    } catch (error) { setStatus({ type: 'error', message: error.message === 'rate-limit' ? 'Too many requests. Please try again later.' : error.message === 'delivery-unknown' || (error.name === 'AbortError' && isBrandedContactEndpoint(site.contactEndpoint)) ? `We could not confirm delivery. Please email ${site.supportEmail} if you need help. Your details are still here; retrying this form keeps the same inquiry reference.` : 'Your message could not be sent. Your details are still here; please try again later.' }); }
    finally { window.clearTimeout(timeout); }
  };
  const field = (name, label, props = {}) => <div className="form-field"><label htmlFor={`contact-${name}`}>{label}{props.required ? <span className="required"> (required)</span> : <span> (optional)</span>}</label><input id={`contact-${name}`} name={name} value={values[name]} onChange={change} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `error-${name}` : undefined} {...props}/>{errors[name] && <p className="field-error" id={`error-${name}`}><AlertCircle size={14} aria-hidden="true"/>{errors[name]}</p>}</div>;
  return <form ref={formRef} className="contact-form" noValidate onSubmit={submit}>
    <div className="form-heading"><h2>Let’s start a conversation.</h2><p>Tell us a little about how we can help.</p></div>
    <div className="form-row">{field('fullName', 'Full Name', { required: true, autoComplete: 'name', maxLength: 120, placeholder: 'Your full name' })}{field('email', 'Email Address', { required: true, type: 'email', autoComplete: 'email', maxLength: 254, placeholder: 'you@organization.com' })}</div>
    <div className="form-row">{field('organization', 'Organization', { autoComplete: 'organization', maxLength: 120, placeholder: 'Company or organization' })}<div className="form-field"><label htmlFor="contact-inquiryType">Inquiry Type</label><select id="contact-inquiryType" name="inquiryType" value={values.inquiryType} onChange={change} aria-invalid={!!errors.inquiryType} aria-describedby={errors.inquiryType ? 'error-inquiryType' : undefined}>{types.map(type => <option key={type}>{type}</option>)}</select>{errors.inquiryType && <p className="field-error" id="error-inquiryType">{errors.inquiryType}</p>}</div></div>
    {field('subject', 'Subject', { required: true, maxLength: 180, placeholder: 'What would you like to discuss?' })}
    <div className="form-field"><label htmlFor="contact-message">Message<span className="required"> (required)</span></label><textarea id="contact-message" name="message" value={values.message} onChange={change} required maxLength={5000} rows={6} placeholder="Share your question, feedback or idea…" aria-invalid={!!errors.message} aria-describedby={`message-hint${errors.message ? ' error-message' : ''}`}/><p className="field-hint" id="message-hint">Please avoid including passwords, medical details or other sensitive information.</p>{errors.message && <p className="field-error" id="error-message"><AlertCircle size={14} aria-hidden="true"/>{errors.message}</p>}</div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" value={values.website} onChange={change} tabIndex={-1} autoComplete="off"/></div>
    <div className="consent-field"><label><input type="checkbox" name="consent" checked={values.consent} onChange={change} required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'error-consent' : 'privacy-notice'}/><span>I understand that my contact details and message will be used to respond to this inquiry. <span className="required">(required)</span></span></label>{errors.consent && <p className="field-error" id="error-consent">{errors.consent}</p>}</div>
    <p id="privacy-notice" className="privacy-notice">{isFormSubmitEndpoint(site.contactEndpoint) ? <>Your contact details and message are shared with FormSubmit to forward your inquiry to {site.supportEmail}. </> : isBrandedContactEndpoint(site.contactEndpoint) ? <>Your contact details and message are processed through our Google Apps Script email service to send your inquiry to {site.supportEmail} and send you an automatic acknowledgment. </> : <>Your contact details and message are shared with our configured contact service to respond to your inquiry. </>}Read our <Link to="/privacy">privacy notice</Link>, which is currently a review draft.</p>
    {!site.contactEndpoint && <div className="integration-notice"><AlertCircle size={17} aria-hidden="true"/><p><strong>Preview mode · sending is not connected.</strong> You can explore and validate the form. Messages will not be delivered until the contact service is configured.</p></div>}
    <button className="button button-primary" type="submit" disabled={status.type === 'loading'}>{status.type === 'loading' ? <><LoaderCircle className="spin" size={18} aria-hidden="true"/> Sending…</> : <>Send Message <ArrowUpRight size={18} aria-hidden="true"/></>}</button>
    <div className={`form-status status-${status.type}`} role="status" aria-live="polite" aria-atomic="true">{status.message && <>{status.type === 'success' ? <CheckCircle2 size={19} aria-hidden="true"/> : <AlertCircle size={19} aria-hidden="true"/>}<p>{status.message}</p></>}</div>
  </form>;
}
