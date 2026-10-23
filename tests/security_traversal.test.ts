import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import os from 'os';

test('Path Traversal Defense Verification (CWE-22 / CWE-200)', () => {
  const downloadsDir = path.resolve(os.homedir(), 'Downloads');
  const allowedRoots = [
    downloadsDir,
    path.resolve(os.tmpdir()),
    path.resolve(process.cwd())
  ];

  // 1. Kiểm tra endpoint /downloads/<relPath>
  function validateDownloadPath(rawUrlPath: string): boolean {
    const rawRel = decodeURIComponent(rawUrlPath).split('?')[0].replace(/^\/+/, '');
    const resolved = path.resolve(downloadsDir, rawRel);
    return resolved.startsWith(downloadsDir + path.sep) || resolved === downloadsDir;
  }

  // 2. Kiểm tra endpoint /api/view-pdf?path=<filePath> & /api/view-image?path=<filePath>
  function validateQueryParamPath(rawFilePath: string): boolean {
    if (!rawFilePath) return false;
    const resolved = path.resolve(rawFilePath);
    return allowedRoots.some(root => resolved.startsWith(root + path.sep) || resolved === root);
  }

  // Các trường hợp tấn công /downloads/ phải bị chặn
  assert.strictEqual(validateDownloadPath('../../etc/passwd'), false, 'Chặn traversal /etc/passwd');
  assert.strictEqual(validateDownloadPath('../../../.ssh/id_rsa'), false, 'Chặn traversal ~/.ssh');
  assert.strictEqual(validateDownloadPath('..%2f..%2f.bash_history'), false, 'Chặn encoded traversal');

  // Các trường hợp hợp lệ trong downloadsDir
  assert.strictEqual(validateDownloadPath('tailieu.pdf'), true, 'Cho phép tệp trong downloads');
  assert.strictEqual(validateDownloadPath('assets/img_123.png'), true, 'Cho phép thư mục con assets trong downloads');

  // Các trường hợp query param path độc hại
  assert.strictEqual(validateQueryParamPath('/etc/shadow'), false, 'Chặn query param đọc /etc/shadow');
  assert.strictEqual(validateQueryParamPath('/etc/passwd'), false, 'Chặn query param đọc /etc/passwd');
  assert.strictEqual(validateQueryParamPath(path.join(os.homedir(), '.ssh', 'id_rsa')), false, 'Chặn query param đọc ~/.ssh');

  // Các trường hợp query param hợp lệ
  assert.strictEqual(validateQueryParamPath(path.join(downloadsDir, 'test.pdf')), true, 'Cho phép đọc pdf trong downloads');
  assert.strictEqual(validateQueryParamPath(path.join(os.tmpdir(), 'yuta_test.pdf')), true, 'Cho phép đọc pdf trong tmp');
});
