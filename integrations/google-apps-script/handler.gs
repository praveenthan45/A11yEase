// Built into Code.gs by npm run build:email. Never put the secret in this file.
function authorizeMail() {
  // Run once in the Apps Script editor while signed in as gen.praveenthan@gmail.com.
  return MailApp.getRemainingDailyQuota();
}

function doPost(event) {
  var output = function (data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); };
  var properties = PropertiesService.getScriptProperties();
  var token = properties.getProperty('CONTACT_SCRIPT_TOKEN');
  var input;
  try {
    if (!event || !event.postData || event.postData.contents.length > 25000) throw new Error('invalid');
    input = JSON.parse(event.postData.contents);
    if (!token || token.length < 32 || input.token !== token) return output({ success:false, code:'unauthorized' });
  } catch (_) { return output({ success:false, code:'invalid' }); }
  var contact;
  try { contact = validateContact(input.contact); } catch (_) { return output({ success:false, code:'invalid' }); }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return output({ success:false, code:'busy' });
  try {
    var key = 'inquiry:' + contact.requestId;
    var state = properties.getProperty(key);
    if (state) {
      var previous = JSON.parse(state);
      if (previous.ownerAccepted) return output({ success:true, ownerAccepted:true, confirmationAccepted:previous.confirmationAccepted === true });
      // A previous invocation may have stopped after handing the email to Gmail.
      // Never resend it automatically: Gmail cannot provide an atomic send-and-save.
      return output({ success:false, code:'delivery-unknown' });
    }
    var now = Date.now();
    var all = properties.getProperties();
    Object.keys(all).filter(function (name) { return name.indexOf('inquiry:') === 0; }).forEach(function (name) {
      try { if (now - JSON.parse(all[name]).at > 86400000) properties.deleteProperty(name); } catch (_) { properties.deleteProperty(name); }
    });
    var cache = CacheService.getScriptCache();
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, contact.email.toLowerCase());
    var recipientKey = 'recipient:' + Utilities.base64EncodeWebSafe(digest);
    var attempts = Number(cache.get(recipientKey) || 0);
    if (attempts >= 3) return output({ success:false, code:'rate-limit' });
    if (MailApp.getRemainingDailyQuota() < 2) return output({ success:false, code:'quota' });
    cache.put(recipientKey, String(attempts + 1), 3600);
    var messages = buildContactEmails(contact);
    var inlineImages = { a11yeaseLogo: Utilities.newBlob(Utilities.base64Decode(A11YEASE_LOGO_BASE64), 'image/png', 'a11yease-logo.png') };
    properties.setProperty(key, JSON.stringify({ at:now, ownerAccepted:false, confirmationAccepted:false }));
    try {
      MailApp.sendEmail(Object.assign({}, messages.owner, { inlineImages:inlineImages }));
    } catch (_) { return output({ success:false, code:'delivery-unknown' }); }
    properties.setProperty(key, JSON.stringify({ at:now, ownerAccepted:true, confirmationAccepted:false }));
    try {
      MailApp.sendEmail(Object.assign({}, messages.visitor, { inlineImages:inlineImages }));
      properties.setProperty(key, JSON.stringify({ at:now, ownerAccepted:true, confirmationAccepted:true }));
      return output({ success:true, ownerAccepted:true, confirmationAccepted:true });
    } catch (_) {
      // The inquiry is already accepted. Do not ask the visitor to submit it again.
      return output({ success:true, ownerAccepted:true, confirmationAccepted:false });
    }
  } catch (_) { return output({ success:false, code:'delivery-unknown' }); }
  finally { lock.releaseLock(); }
}
