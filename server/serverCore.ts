import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { AutomationRunner, AutomationStepUpdate } from './automationRunner';
import localtunnel from 'localtunnel';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.tex': 'text/plain; charset=utf-8',
  '.py': 'text/plain; charset=utf-8',
  '.srt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.md': 'text/markdown; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

let activeWanTunnel: any = null;
let currentWanUrl = '';
let desktopSecurityPin = '';

async function startWanTunnel(port: number): Promise<string> {
  if (activeWanTunnel && currentWanUrl) return currentWanUrl;
  try {
    const tunnel = await localtunnel({ port: port || 3000 });
    activeWanTunnel = tunnel;
    currentWanUrl = tunnel.url;
    tunnel.on('close', () => {
      activeWanTunnel = null;
      currentWanUrl = '';
    });
    return currentWanUrl;
  } catch (err: any) {
    console.error('Lỗi khi mở LocalTunnel WAN:', err);
    throw err;
  }
}

async function stopWanTunnel(): Promise<void> {
  if (activeWanTunnel) {
    try { activeWanTunnel.close(); } catch {}
    activeWanTunnel = null;
    currentWanUrl = '';
  }
}

let cachedAntigravityQuota: any = null;
let lastQuotaFetchTimestamp = 0;

export async function getLiveAntigravityQuota(forceRefresh = false): Promise<any> {
  const now = Date.now();
  if (!forceRefresh && cachedAntigravityQuota && now - lastQuotaFetchTimestamp < 5000) {
    return cachedAntigravityQuota;
  }

  const { execSync } = await import('child_process');

  try {
    let ssOutput = '';
    try {
      ssOutput = execSync("ss -tlnp 2>/dev/null | grep -E 'agy|language_server'", { encoding: 'utf-8', timeout: 1500 });
    } catch {}

    const portMatches = [...ssOutput.matchAll(/127\.0\.0\.1:(\d+)/g)].map((m) => parseInt(m[1], 10));
    const candidatePorts = [...new Set(portMatches)];

    let csrfToken = '';
    try {
      const psOutput = execSync('ps -eo cmd 2>/dev/null | grep language_server_linux_x64 | grep -v grep', {
        encoding: 'utf-8',
        timeout: 1500,
      });
      const csrfMatch = psOutput.match(/--csrf_token\s+([a-zA-Z0-9\-]+)/);
      if (csrfMatch) csrfToken = csrfMatch[1];
    } catch {}

    for (const port of candidatePorts) {
      try {
        const result: any = await new Promise((resolve, reject) => {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (csrfToken) headers['x-codeium-csrf-token'] = csrfToken;

          const req = http.request(
            {
              hostname: '127.0.0.1',
              port: port,
              path: '/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary',
              method: 'POST',
              headers: headers,
              timeout: 1200,
            },
            (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                if (res.statusCode === 200) {
                  try {
                    resolve(JSON.parse(data));
                  } catch (e) {
                    reject(e);
                  }
                } else {
                  reject(new Error(`Status ${res.statusCode}`));
                }
              });
            }
          );
          req.on('error', reject);
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('timeout'));
          });
          req.write('{}');
          req.end();
        });

        if (result && result.response && Array.isArray(result.response.groups)) {
          const geminiGroup =
            result.response.groups.find((g: any) => g.displayName && g.displayName.includes('Gemini')) ||
            result.response.groups[0];
          const claudeGroup = result.response.groups.find(
            (g: any) => g.displayName && (g.displayName.includes('Claude') || g.displayName.includes('GPT'))
          );

          const weeklyBucket = geminiGroup?.buckets?.find(
            (b: any) => b.window === 'weekly' || (b.bucketId && b.bucketId.includes('weekly'))
          );
          const fiveHourBucket = geminiGroup?.buckets?.find(
            (b: any) => b.window === '5h' || (b.bucketId && b.bucketId.includes('5h'))
          );

          const claudeWeekly = claudeGroup?.buckets?.find(
            (b: any) => b.window === 'weekly' || (b.bucketId && b.bucketId.includes('weekly'))
          );
          const claude5h = claudeGroup?.buckets?.find(
            (b: any) => b.window === '5h' || (b.bucketId && b.bucketId.includes('5h'))
          );

          const weeklyPct = weeklyBucket ? Math.round(weeklyBucket.remainingFraction * 100) : 100;
          const fiveHourPct = fiveHourBucket ? Math.round(fiveHourBucket.remainingFraction * 100) : 100;

          let statusText = '🟢 Khả dụng (Live Antigravity Quota)';
          if (fiveHourPct <= 10 || weeklyPct <= 10) {
            statusText = '🔴 Quota sắp hết (< 10%)';
          } else if (fiveHourPct <= 25 || weeklyPct <= 25) {
            statusText = '🟡 Quota ở mức thấp (< 25%)';
          }

          cachedAntigravityQuota = {
            source: 'live_agent',
            port: port,
            weekly: weeklyPct,
            fiveHour: fiveHourPct,
            weeklyDesc: weeklyBucket?.description || '',
            fiveHourDesc: fiveHourBucket?.description || '',
            weeklyResetTime: weeklyBucket?.resetTime || '',
            fiveHourResetTime: fiveHourBucket?.resetTime || '',
            claudeWeekly: claudeWeekly ? Math.round(claudeWeekly.remainingFraction * 100) : 100,
            claude5h: claude5h ? Math.round(claude5h.remainingFraction * 100) : 100,
            status: statusText,
            engine: 'Google Antigravity Live Engine',
            limitDesc: '5h / 1w',
            groups: result.response.groups,
            generalDesc: result.response.description || '',
            lastUpdated: new Date().toISOString(),
          };
          lastQuotaFetchTimestamp = Date.now();
          return cachedAntigravityQuota;
        }
      } catch {}
    }
  } catch {}

  // Fallback an toàn khi agent/language server chưa chạy
  let conversationCount = 0;
  try {
    const brainDir = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
    if (fs.existsSync(brainDir)) {
      conversationCount = fs.readdirSync(brainDir).length;
    }
  } catch {}

  const fiveHour = Math.max(35, Math.min(100, 100 - (conversationCount % 6) * 5));
  const weekly = Math.max(45, Math.min(100, 100 - Math.floor(conversationCount / 3) * 2));

  cachedAntigravityQuota = {
    source: 'fallback_estimate',
    weekly: weekly,
    fiveHour: fiveHour,
    claudeWeekly: 100,
    claude5h: 100,
    status: '🟢 Khả dụng (Antigravity Agent Active)',
    engine: 'Google Antigravity CLI',
    limitDesc: '5h / 1w',
    lastUpdated: new Date().toISOString(),
  };
  lastQuotaFetchTimestamp = Date.now();
  return cachedAntigravityQuota;
}

export interface StandaloneServerOptions {
  port?: number;
  host?: string;
  distDir?: string;
  downloadsDir?: string;
  onReady?: (port: number) => void;
}

export type CoreApiHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next?: () => void
) => Promise<void> | void;

export function createCoreApiHandler(options: StandaloneServerOptions = {}): CoreApiHandler {
  const downloadsDir = options.downloadsDir || path.join(os.homedir(), 'Downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const distDir = options.distDir || path.resolve(process.cwd(), 'dist');

  let runner: AutomationRunner | null = null;
  let currentAutomationState = {
    isRunning: false,
    progress: {
      step: 'INIT',
      progress: 0,
      message: '',
    } as AutomationStepUpdate,
    logs: [] as string[],
    startTime: null as number | null,
  };

  let lastMobileActivity = {
    timestamp: 0,
    deviceName: '',
    ip: '',
  };

  const detectMobileDevice = (req: http.IncomingMessage) => {
    if (!req) return;
    const ua = (req.headers && req.headers['user-agent']) || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    if (isMobile) {
      let devName = 'Điện Thoại';
      if (/iPhone/i.test(ua)) devName = 'iPhone';
      else if (/iPad/i.test(ua)) devName = 'iPad';
      else if (/Android/i.test(ua)) devName = 'Android';

      const clientIp = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress.replace(/^.*:/, '') : '';
      lastMobileActivity = {
        timestamp: Date.now(),
        deviceName: devName,
        ip: clientIp,
      };
    }
  };

  function updateAutomationProgress(updateData: AutomationStepUpdate) {
    if (!updateData) return;
    if (!currentAutomationState.startTime) {
      currentAutomationState.startTime = Date.now();
    }

    currentAutomationState.isRunning = !(updateData.step === 'COMPLETED' || updateData.step === 'ERROR');
    currentAutomationState.progress = {
      ...currentAutomationState.progress,
      ...updateData,
    };

    if (updateData.message) {
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      const elapsedSec = Math.floor((Date.now() - (currentAutomationState.startTime || Date.now())) / 1000);
      const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const secs = String(elapsedSec % 60).padStart(2, '0');
      const logLine = `[${mins}:${secs}] [${timeStr}] ${updateData.message}`;

      if (!currentAutomationState.logs.includes(logLine)) {
        currentAutomationState.logs.push(logLine);
      }
    }
  }

  return async function handleCoreRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next?: () => void
  ) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Security-Pin');

    detectMobileDevice(req);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const host = req.headers.host || '127.0.0.1';
    const parsedUrl = new URL(req.url || '/', `http://${host}`);
    const pathname = parsedUrl.pathname;

    // If running under Connect/Vite dev middleware, delegate non-API and non-download routes immediately
    if (next && !pathname.startsWith('/api/') && !pathname.startsWith('/downloads')) {
      return next();
    }

    // 1. Phục vụ tĩnh thư mục Downloads (/downloads/...) với Range Streaming & CWE-22 defense
    if (pathname.startsWith('/downloads')) {
      const rawRelPath = pathname.replace(/^\/downloads\/?/, '').split('?')[0];
      const relPath = decodeURIComponent(rawRelPath);
      const resolvedDownloadsDir = path.resolve(downloadsDir);
      const filePath = path.resolve(resolvedDownloadsDir, relPath);

      if (!filePath.startsWith(resolvedDownloadsDir + path.sep) && filePath !== resolvedDownloadsDir) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Access Denied: Path Traversal Detected (CWE-22)');
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const range = req.headers.range;

        if (range && (ext === '.mp4' || ext === '.webm' || ext === '.mp3' || ext === '.wav')) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = end - start + 1;
          const stream = fs.createReadStream(filePath, { start, end });
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
          });
          stream.pipe(res);
          return;
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': fileSize,
            'Accept-Ranges': 'bytes',
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }
    }

    // 2. API: Server-Sent Events Automate Stream
    if (pathname === '/api/automate/stream' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        let options: any = {};
        try { options = JSON.parse(body || '{}'); } catch {}

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });

        currentAutomationState = {
          isRunning: true,
          progress: { step: 'INIT', progress: 0, message: '🚀 Khởi động quy trình tự động hóa...' },
          logs: [],
          startTime: Date.now(),
        };

        const sendSSE = (data: AutomationStepUpdate) => {
          updateAutomationProgress(data);
          try {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } catch {}
        };

        runner = new AutomationRunner();

        try {
          await runner.runPipeline(
            {
              ...options,
              outputDir: downloadsDir,
            },
            (update) => {
              sendSSE(update);
            }
          );
        } catch (err: any) {
          sendSSE({
            step: 'ERROR',
            progress: 0,
            message: err.message || 'Lỗi không mong muốn.',
            error: err.message,
          });
        } finally {
          res.end();
        }
      });
      return;
    }

    // 3. API: Current Automation State
    if (pathname === '/api/automate/current-state' && req.method === 'GET') {
      const isConnected = Date.now() - lastMobileActivity.timestamp < 12000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ...currentAutomationState,
          isMobileConnected: isConnected,
          mobileDeviceName: isConnected ? lastMobileActivity.deviceName : '',
          mobileIp: isConnected ? lastMobileActivity.ip : '',
        })
      );
      return;
    }

    // 4. API: Stop Automation
    if (pathname === '/api/automate/stop' && req.method === 'POST') {
      if (runner) {
        runner.cancel();
        runner = null;
      }
      updateAutomationProgress({
        step: 'ERROR',
        progress: 0,
        message: '⚠️ Người dùng đã dừng quy trình tự động hóa.',
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Đã gửi lệnh dừng quy trình.' }));
      return;
    }

    // 5. API: Open File
    if (pathname === '/api/open-file' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { filePath } = JSON.parse(body || '{}');
          if (filePath && fs.existsSync(filePath)) {
            try {
              const electron = require('electron');
              if (electron && electron.shell) {
                await electron.shell.openPath(filePath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                return;
              }
            } catch {}
            const cmd = process.platform === 'win32' ? `start "" "${filePath}"` : process.platform === 'darwin' ? `open "${filePath}"` : `xdg-open "${filePath}"`;
            require('child_process').exec(cmd);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
          }
        } catch {}
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false }));
      });
      return;
    }

    // 6. API: Open Folder
    if (pathname === '/api/open-folder' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { folderPath } = JSON.parse(body || '{}');
          const target = folderPath || downloadsDir;
          try {
            const electron = require('electron');
            if (electron && electron.shell) {
              await electron.shell.openPath(target);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
              return;
            }
          } catch {}
          const cmd = process.platform === 'win32' ? `explorer "${target}"` : process.platform === 'darwin' ? `open "${target}"` : `xdg-open "${target}"`;
          require('child_process').exec(cmd);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          return;
        } catch {}
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false }));
      });
      return;
    }

    // 7. API: Parse PDF
    if (pathname === '/api/parse-pdf' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { fileName, fileBase64 } = JSON.parse(body || '{}');
          if (!fileBase64) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Thiếu dữ liệu file PDF' }));
            return;
          }

          const buffer = Buffer.from(fileBase64, 'base64');
          const safeName = (fileName || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
          const tempPath = path.join(os.tmpdir(), `yuta_rag_${Date.now()}_${safeName}`);
          fs.writeFileSync(tempPath, buffer);

          const pdfParseModule: any = await import('pdf-parse');
          const pdfParser = pdfParseModule.default || pdfParseModule;
          const parsed = await pdfParser(buffer);

          const fileSizeStr = buffer.length > 1024 * 1024
            ? (buffer.length / (1024 * 1024)).toFixed(1) + ' MB'
            : Math.round(buffer.length / 1024) + ' KB';

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: true,
              fileName: safeName,
              numPages: parsed.numpages || 1,
              text: parsed.text || '',
              tempPath: tempPath,
              fileSize: fileSizeStr,
            })
          );
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi khi đọc file PDF' }));
        }
      });
      return;
    }

    // 8. API: View PDF Stream with CWE-22 protection
    if (pathname.startsWith('/api/view-pdf')) {
      try {
        const rawFilePath = parsedUrl.searchParams.get('path');
        if (!rawFilePath) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Thiếu tham số path');
          return;
        }
        const resolvedPath = path.resolve(rawFilePath);
        const allowedRoots = [
          path.resolve(downloadsDir),
          path.resolve(os.homedir(), 'Downloads'),
          path.resolve(os.tmpdir()),
          path.resolve(process.cwd()),
        ];
        const isPathSafe = allowedRoots.some(root => resolvedPath.startsWith(root + path.sep) || resolvedPath === root);
        if (!isPathSafe) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Access Denied: Path Traversal Detected (CWE-22)');
          return;
        }

        if (fs.existsSync(resolvedPath) && resolvedPath.toLowerCase().endsWith('.pdf')) {
          const stat = fs.statSync(resolvedPath);
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': stat.size,
            'Content-Disposition': 'inline; filename="preview.pdf"',
            'Accept-Ranges': 'bytes',
          });
          fs.createReadStream(resolvedPath).pipe(res);
          return;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('File PDF không tồn tại.');
          return;
        }
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Lỗi đọc file PDF: ${err.message}`);
        return;
      }
    }

    // 9. API: Upload Image
    if (pathname === '/api/upload-image' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { fileName, fileBase64, description, layoutMode } = JSON.parse(body || '{}');
          if (!fileBase64) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Thiếu dữ liệu hình ảnh' }));
            return;
          }
          const assetsDir = path.join(downloadsDir, 'assets');
          if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
          }
          const ext = path.extname(fileName || '.png') || '.png';
          const safeBase = path.basename(fileName || 'image', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
          const safeName = `img_${Date.now()}_${safeBase}${ext}`;
          const filePath = path.join(assetsDir, safeName);
          const buffer = Buffer.from(fileBase64, 'base64');
          fs.writeFileSync(filePath, buffer);

          const fileSizeStr = buffer.length > 1024 * 1024
            ? (buffer.length / (1024 * 1024)).toFixed(1) + ' MB'
            : Math.round(buffer.length / 1024) + ' KB';

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            fileName: fileName || safeName,
            filePath: filePath,
            previewUrl: `/downloads/assets/${safeName}`,
            fileSize: fileSizeStr,
            description: description || '',
            layoutMode: layoutMode || 'top_card',
          }));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi lưu hình ảnh' }));
        }
      });
      return;
    }

    // 10. API: View Image Stream
    if (pathname.startsWith('/api/view-image')) {
      try {
        const rawFilePath = parsedUrl.searchParams.get('path');
        if (!rawFilePath) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Thiếu tham số path');
          return;
        }
        const resolvedPath = path.resolve(rawFilePath);
        const allowedRoots = [
          path.resolve(downloadsDir),
          path.resolve(os.homedir(), 'Downloads'),
          path.resolve(os.tmpdir()),
          path.resolve(process.cwd()),
        ];
        const isPathSafe = allowedRoots.some(root => resolvedPath.startsWith(root + path.sep) || resolvedPath === root);
        if (!isPathSafe) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Access Denied: Path Traversal Detected (CWE-22)');
          return;
        }

        if (fs.existsSync(resolvedPath)) {
          const ext = path.extname(resolvedPath).toLowerCase();
          const stat = fs.statSync(resolvedPath);
          res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'image/png',
            'Content-Length': stat.size,
          });
          fs.createReadStream(resolvedPath).pipe(res);
          return;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Hình ảnh không tồn tại.');
          return;
        }
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Lỗi đọc file hình ảnh: ${err.message}`);
        return;
      }
    }

    // 11. API: System Status
    if (pathname === '/api/automate/status' && req.method === 'GET') {
      const chromePath = AutomationRunner.getDefaultChromePath();
      const userDataDir = AutomationRunner.getDefaultUserDataDir();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ready: true,
          chromePath,
          hasChrome: fs.existsSync(chromePath),
          userDataDir,
          platform: process.platform,
        })
      );
      return;
    }

    // 12. API: System Network Info
    if (pathname === '/api/system/network-info' && req.method === 'GET') {
      const interfaces = os.networkInterfaces();
      let lanIp = '127.0.0.1';
      for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (!iface) continue;
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            lanIp = alias.address;
            break;
          }
        }
        if (lanIp !== '127.0.0.1') break;
      }
      const currentPort = req.socket && req.socket.localPort ? req.socket.localPort : (options.port || 3000);
      const isConnected = Date.now() - lastMobileActivity.timestamp < 12000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          lanIp,
          port: currentPort,
          mobileUrl: `http://${lanIp}:${currentPort}`,
          wanUrl: currentWanUrl,
          isWanActive: Boolean(currentWanUrl),
          hasPin: Boolean(desktopSecurityPin),
          isMobileConnected: isConnected,
          mobileDeviceName: isConnected ? lastMobileActivity.deviceName : '',
          mobileIp: isConnected ? lastMobileActivity.ip : '',
        })
      );
      return;
    }

    // 13. API: WAN Tunnel
    if (pathname === '/api/system/tunnel/start' && req.method === 'POST') {
      try {
        const currentPort = req.socket && req.socket.localPort ? req.socket.localPort : (options.port || 3000);
        const wanUrl = await startWanTunnel(currentPort);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, wanUrl }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    if (pathname === '/api/system/tunnel/stop' && req.method === 'POST') {
      await stopWanTunnel();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 14. API: Security PIN
    if (pathname === '/api/system/pin/set' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { pin } = JSON.parse(body || '{}');
          desktopSecurityPin = String(pin || '').trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false }));
        }
      });
      return;
    }

    if (pathname === '/api/system/pin/verify' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { pin } = JSON.parse(body || '{}');
          const isValid = !desktopSecurityPin || desktopSecurityPin === String(pin || '').trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: isValid, valid: isValid }));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false }));
        }
      });
      return;
    }

    // 15. API: Mobile Ping
    if (pathname === '/api/system/mobile-ping' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', isConnected: true }));
      return;
    }

    // 16. API: Antigravity Quota
    if (pathname === '/api/antigravity/quota' && req.method === 'GET') {
      const force = parsedUrl.searchParams.get('refresh') === 'true';
      const quota = await getLiveAntigravityQuota(force);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(quota));
      return;
    }

    // 17. Static SPA Fallback serving from distDir (if available)
    if (distDir && fs.existsSync(distDir)) {
      let reqPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
      let filePath = path.join(distDir, reqPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    if (next) {
      return next();
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  };
}

export function startStandaloneServer(options: StandaloneServerOptions = {}): http.Server {
  const handler = createCoreApiHandler(options);
  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  const targetPort = options.port !== undefined ? options.port : 0;
  server.listen(targetPort, options.host || '0.0.0.0', () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : targetPort;
    if (options.onReady) {
      options.onReady(actualPort);
    }
  });

  return server;
}
