import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('PWA - Manifest and Service Worker Verification', () => {
  const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json should exist in public/');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.strictEqual(manifest.name, 'Yuta LaTeX & Math Video Studio');
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.start_url, '/');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);

  const swPath = path.resolve(process.cwd(), 'public', 'sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js should exist in public/');
  const swContent = fs.readFileSync(swPath, 'utf-8');
  assert.match(swContent, /yuta-studio-v1/);
  assert.match(swContent, /caches\.open/);
  assert.match(swContent, /\/api\//); // Bypasses api
});

test('Command Palette & UX - Navigation Mappings & Shortcuts', () => {
  const commandPalettePath = path.resolve(process.cwd(), 'components', 'CommandPalette.tsx');
  assert.ok(fs.existsSync(commandPalettePath), 'CommandPalette.tsx should exist');

  const content = fs.readFileSync(commandPalettePath, 'utf-8');
  // Check tab shortcuts
  assert.match(content, /tab-worksheet/);
  assert.match(content, /tab-exam/);
  assert.match(content, /tab-video/);
  assert.match(content, /tab-learning/);
  assert.match(content, /tab-roadmap/);
  assert.match(content, /tab-similar/);
  assert.match(content, /tab-project/);

  // Check actions
  assert.match(content, /action-auto/);
  assert.match(content, /action-rerender/);
  assert.match(content, /action-gemini/);
  assert.match(content, /action-mobile/);
});

test('Toast Notifications - Non-blocking Dialogs & Zero alert() calls in components', () => {
  const toastContextPath = path.resolve(process.cwd(), 'context', 'ToastContext.tsx');
  assert.ok(fs.existsSync(toastContextPath), 'ToastContext.tsx should exist');

  // Verify OutputDisplay.tsx no longer contains raw alert()
  const outputDisplayContent = fs.readFileSync(path.resolve(process.cwd(), 'components', 'OutputDisplay.tsx'), 'utf-8');
  assert.ok(!outputDisplayContent.includes('alert('), 'OutputDisplay should not call window.alert');

  // Verify AutomationModal.tsx no longer contains raw alert()
  const automationModalContent = fs.readFileSync(path.resolve(process.cwd(), 'components', 'AutomationModal.tsx'), 'utf-8');
  assert.ok(!automationModalContent.includes('alert('), 'AutomationModal should not call window.alert');

  // Verify MobileRemoteHub.tsx no longer contains raw alert()
  const mobileRemoteContent = fs.readFileSync(path.resolve(process.cwd(), 'components', 'MobileRemoteHub.tsx'), 'utf-8');
  assert.ok(!mobileRemoteContent.includes('alert('), 'MobileRemoteHub should not call window.alert');
});
