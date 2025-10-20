import fs from 'fs';
import { POST } from '../src/app/api/generate-image/route.js';

async function test() {
  const req = {
    json: async () => ({ prompt: 'A colorful sunset over a mountain' }),
  };
  const res = await POST(req);
  console.log('status:', res.status);
  const headers = Object.fromEntries(res.headers.entries());
  console.log('headers:', headers);
  const body = await res.arrayBuffer();
  console.log('body length:', body.byteLength);
  // write to file for manual inspection
  const ct = headers['content-type'] || 'image/png';
  const ext = ct.includes('svg') ? 'svg' : 'png';
  fs.writeFileSync(`./out-test.${ext}`, Buffer.from(body));
  console.log('wrote out-test.' + ext);
}

test().catch(e => { console.error(e); process.exit(1); });
