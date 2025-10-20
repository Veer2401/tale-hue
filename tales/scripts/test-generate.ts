/* eslint-disable */
import fs from 'fs';
import { POST } from '../src/app/api/generate-image/route';

type MockReq = { json: () => Promise<{ prompt: string }> };

async function test() {
  const req: MockReq = {
    json: async () => ({ prompt: 'A colorful sunset over a mountain' }),
  };
  // POST expects a NextRequest-like with json()
  const res = await POST(req as unknown as any);
  console.log('status:', res.status);
  const headers: Record<string, string> = {};
  res.headers.forEach((v: string, k: string) => (headers[k] = v));
  console.log('headers:', headers);
  const arr = await res.arrayBuffer();
  console.log('body length:', arr.byteLength);
  const ct = headers['content-type'] || 'image/png';
  const ext = ct.includes('svg') ? 'svg' : 'png';
  fs.writeFileSync(`./out-test.${ext}`, Buffer.from(arr));
  console.log('wrote out-test.' + ext);
}

test().catch(e => { console.error(e); process.exit(1); });
