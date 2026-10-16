import { validateContact } from './contact-validation.mjs';

export function createContactApi({ env = {}, fetchImpl = fetch, now = Date.now } = {}) {
  const clients = new Map();
  const json = (status, data, origin) => new Response(JSON.stringify(data), {
    status, headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(origin ? {'Access-Control-Allow-Origin':origin,'Vary':'Origin'} : {})},
  });
  return async function contactApi(request, clientId = 'unknown') {
    const origin = request.headers.get('origin');
    const allowed = new Set((env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean));
    if (!origin || !allowed.has(origin)) return json(403,{ success:false },null);
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
    if (request.method !== 'POST') return json(405,{success:false},origin);
    const stamp = now();
    for (const [key,record] of clients) if (stamp - record.at >= 3600000) clients.delete(key);
    const record = clients.get(clientId) || { at:stamp, count:0 };
    if (record.count >= 5 || (!clients.has(clientId) && clients.size >= 10000)) return json(429,{success:false},origin);
    record.count++; clients.set(clientId,record);
    let scriptUrl;
    try {
      scriptUrl = new URL(env.CONTACT_SCRIPT_URL);
      if (scriptUrl.protocol !== 'https:' || scriptUrl.hostname !== 'script.google.com' || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(scriptUrl.pathname) || scriptUrl.search || scriptUrl.username || scriptUrl.password) throw new Error();
      if (!env.CONTACT_SCRIPT_TOKEN || env.CONTACT_SCRIPT_TOKEN.length < 32) throw new Error();
    } catch { return json(503,{success:false,code:'not-configured'},origin); }
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return json(415,{success:false},origin);
    let input;
    try {
      const reader = request.body?.getReader();
      if (!reader) throw new Error();
      const chunks = []; let length = 0;
      while (true) {
        const {done,value} = await reader.read(); if (done) break;
        length += value.byteLength;
        if (length > 16000) { await reader.cancel(); return json(413,{success:false},origin); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.length; }
      input = JSON.parse(new TextDecoder().decode(bytes));
      validateContact(input);
    } catch { return json(400,{success:false},origin); }
    try {
      const response = await fetchImpl(scriptUrl.href,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ token:env.CONTACT_SCRIPT_TOKEN,contact:input }),
        signal:AbortSignal.timeout(30000),redirect:'follow',
      });
      const result = await response.json();
      if (!response.ok) throw new Error();
      if (result.success === true && result.ownerAccepted === true && typeof result.confirmationAccepted === 'boolean') {
        return json(202,{success:true,ownerAccepted:true,confirmationAccepted:result.confirmationAccepted},origin);
      }
      if (result.code === 'rate-limit') return json(429,{success:false},origin);
      if (result.code === 'delivery-unknown') return json(409,{success:false,code:'delivery-unknown'},origin);
      return json(503,{success:false},origin);
    } catch {
      // A timeout may happen after Google accepted the inquiry. Retrying must reuse requestId.
      return json(409,{success:false,code:'delivery-unknown'},origin);
    }
  };
}
