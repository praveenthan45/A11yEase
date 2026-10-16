export const SUPPORT_EMAIL = 'gen.praveenthan@gmail.com';
export const INQUIRY_TYPES = ['General Enquiry', 'Product Demo', 'Technical Support', 'Accessibility Feedback', 'Partnership', 'Other'];

export function validateContact(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid');
  const limits = { fullName: [2,120], email: [3,254], organization: [0,120], subject: [3,180], message: [10,5000] };
  const value = {};
  for (const [field, [min,max]] of Object.entries(limits)) {
    if (typeof input[field] !== 'string') throw new Error('invalid');
    value[field] = input[field].trim();
    if (value[field].length < min || value[field].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value[field])) throw new Error('invalid');
    if (field !== 'message' && /[\r\n]/.test(value[field])) throw new Error('invalid');
  }
  // A single mailbox only. Commas, header delimiters and address lists are rejected.
  if (!/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(value.email) || /[\s,;<>]/.test(value.email)) throw new Error('invalid');
  if (!INQUIRY_TYPES.includes(input.inquiryType) || input.consent !== true || input.website !== '' || input.source !== 'a11yease-contact') throw new Error('invalid');
  if (!Number.isFinite(input.formDurationMs) || input.formDurationMs < 3000) throw new Error('invalid');
  if (typeof input.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId)) throw new Error('invalid');
  return { ...value, inquiryType: input.inquiryType, requestId: input.requestId };
}
