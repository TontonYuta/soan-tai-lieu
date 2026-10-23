import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startStandaloneServer } from '../server/serverCore';

test('serverCore - startStandaloneServer Lifecycle & Core APIs', async () => {
  let serverInstance: http.Server | null = null;

  try {
    const port = await new Promise<number>((resolve) => {
      serverInstance = startStandaloneServer({
        port: 0,
        host: '127.0.0.1',
        onReady: (p) => resolve(p),
      });
    });

    assert.ok(port > 0, `Expected server to bind to a positive port, got ${port}`);

    // Helper for simple GET/POST
    const requestJson = (path: string, options: http.RequestOptions = {}, bodyData?: any): Promise<{ status: number; data: any }> => {
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path,
            ...options,
            headers: {
              ...(options.headers || {}),
              ...(bodyData ? { 'Content-Type': 'application/json' } : {}),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode || 500, data: JSON.parse(data) });
              } catch {
                resolve({ status: res.statusCode || 500, data });
              }
            });
          }
        );
        req.on('error', reject);
        if (bodyData) {
          req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
        }
        req.end();
      });
    };

    // 1. Mobile Ping
    const pingRes = await requestJson('/api/system/mobile-ping');
    assert.strictEqual(pingRes.status, 200);
    assert.strictEqual(pingRes.data.status, 'ok');
    assert.strictEqual(pingRes.data.isConnected, true);

    // 2. PIN Setup & Verify
    const pinSetRes = await requestJson('/api/system/pin/set', { method: 'POST' }, { pin: '8888' });
    assert.strictEqual(pinSetRes.status, 200);
    assert.strictEqual(pinSetRes.data.success, true);

    const pinVerifyFail = await requestJson('/api/system/pin/verify', { method: 'POST' }, { pin: '0000' });
    assert.strictEqual(pinVerifyFail.status, 200);
    assert.strictEqual(pinVerifyFail.data.valid, false);

    const pinVerifyOk = await requestJson('/api/system/pin/verify', { method: 'POST' }, { pin: '8888' });
    assert.strictEqual(pinVerifyOk.status, 200);
    assert.strictEqual(pinVerifyOk.data.valid, true);

    // 3. Antigravity Quota
    const quotaRes = await requestJson('/api/antigravity/quota');
    assert.strictEqual(quotaRes.status, 200);
    assert.ok(typeof quotaRes.data === 'object');
  } finally {
    if (serverInstance) {
      await new Promise<void>((resolve) => {
        (serverInstance as http.Server).close(() => resolve());
      });
    }
  }
});
