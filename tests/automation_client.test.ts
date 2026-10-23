import test from 'node:test';
import assert from 'node:assert/strict';
import { AutomationClient, AntigravityQuotaData } from '../services/automationClient';

test('AutomationClient - Security PIN & Auth Headers', () => {
  // Test 1: Mặc định khi chưa set PIN
  const defaultHeaders = AutomationClient.getAuthHeaders();
  assert.strictEqual(defaultHeaders['Content-Type'], 'application/json');
  assert.strictEqual(defaultHeaders['X-Security-Pin'], undefined);

  // Test 2: Set PIN
  AutomationClient.setSavedPin('123456');
  assert.strictEqual(AutomationClient.getSavedPin(), '123456');

  const authHeaders = AutomationClient.getAuthHeaders();
  assert.strictEqual(authHeaders['Content-Type'], 'application/json');
  assert.strictEqual(authHeaders['X-Security-Pin'], '123456');

  // Test 3: Reset PIN
  AutomationClient.setSavedPin('');
  assert.strictEqual(AutomationClient.getSavedPin(), '');
  const resetHeaders = AutomationClient.getAuthHeaders();
  assert.strictEqual(resetHeaders['X-Security-Pin'], undefined);
});

test('AutomationClient - Antigravity Quota Structure Parsing', () => {
  const mockQuota: AntigravityQuotaData = {
    weekly: 98,
    fiveHour: 95,
    status: '🟢 Khả dụng (Antigravity Active)',
    source: 'live_agent',
    port: 39512,
    weeklyDesc: 'Còn lại 98% (reset sau 5 ngày)',
    fiveHourDesc: 'Còn lại 95% (reset sau 3 giờ)',
    claudeWeekly: 100,
    groups: [
      {
        displayName: 'Gemini Models',
        buckets: [
          {
            bucketId: 'gemini-2.5-pro',
            displayName: 'Gemini 2.5 Pro',
            remainingFraction: 0.98,
            resetTime: '2026-10-28T00:00:00Z',
          },
        ],
      },
    ],
  };

  assert.strictEqual(mockQuota.weekly, 98);
  assert.strictEqual(mockQuota.fiveHour, 95);
  assert.strictEqual(mockQuota.source, 'live_agent');
  assert.strictEqual(mockQuota.port, 39512);
  assert.strictEqual(mockQuota.groups?.[0].buckets[0].remainingFraction, 0.98);
});
