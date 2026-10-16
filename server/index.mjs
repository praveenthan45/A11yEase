import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import handler from 'serve-handler';
import { createContactApi } from './contact-api.mjs';

const contactApi = createContactApi({ env:process.env });
const server = createServer(async (request,response) => {
  try {
    const url = new URL(request.url,'http://localhost');
    if (url.pathname === '/api/contact') {
      const input = new Request('http://localhost/api/contact',{
        method:request.method,headers:request.headers,
        ...(request.method === 'POST' ? { body:Readable.toWeb(request),duplex:'half' } : {}),
      });
      // Render adds its proxy address at the end. Never trust a caller-supplied first XFF value.
      const clientId = process.env.RENDER === 'true'
        ? String(request.headers['x-forwarded-for'] || request.socket.remoteAddress).split(',').at(-1).trim()
        : request.socket.remoteAddress;
      const result = await contactApi(input,clientId);
      response.writeHead(result.status,Object.fromEntries(result.headers));
      response.end(await result.text()); return;
    }
    if (url.pathname.startsWith('/api/')) { response.writeHead(404); response.end(); return; }
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    await handler(request,response,{
      public:fileURLToPath(new URL('../dist',import.meta.url)),
      rewrites:[{source:'**',destination:'/index.html'}],directoryListing:false,symlinks:false,
    });
  } catch { if (!response.headersSent) response.writeHead(500); response.end(); }
});
server.requestTimeout = 40000;
server.headersTimeout = 15000;
server.listen(Number(process.env.PORT || 3000),'0.0.0.0',() => console.log(`A11yEase server listening on port ${process.env.PORT || 3000}`));
