export function isFormSubmitEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' && url.hostname === 'formsubmit.co' && url.pathname.startsWith('/ajax/');
  } catch { return false; }
}

export function createContactPayload(values, durationMs, endpoint) {
  const payload = {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    organization: values.organization.trim(),
    inquiryType: values.inquiryType,
    subject: values.subject.trim(),
    message: values.message.trim(),
    consent: values.consent,
    website: values.website,
    source: 'a11yease-contact',
    formDurationMs: durationMs,
  };
  if (!isFormSubmitEndpoint(endpoint)) return payload;
  return {
    ...payload,
    name: payload.fullName,
    _subject: `A11yEase · ${payload.inquiryType}: ${payload.subject}`.replace(/[\r\n]/g, ' '),
    _replyto: payload.email,
    _template: 'table',
    _honey: payload.website,
  };
}

export async function readContactResponse(response, endpoint) {
  if (response.status === 429) throw new Error('rate-limit');
  if (!isFormSubmitEndpoint(endpoint)) {
    if (!response.ok) throw new Error('failed');
    return 'accepted';
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('failed'); }
  if (typeof data?.message === 'string' && /activat|verif(?:y|ication)|confirm.{0,30}(?:email|address)/i.test(data.message)) {
    return 'activation-required';
  }
  if (!response.ok || ![true, 'true'].includes(data?.success)) throw new Error('failed');
  return 'accepted';
}
