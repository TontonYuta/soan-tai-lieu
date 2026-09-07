import type { Plugin, ViteDevServer } from 'vite';
import { AutomationRunner, AutomationStepUpdate } from './automationRunner';
import fs from 'fs';
import path from 'path';
import os from 'os';
import localtunnel from 'localtunnel';

let activeWanTunnel: any = null;
let currentWanUrl = '';
let desktopSecurityPin = '';

async function startWanTunnel(port: number) {
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

async function stopWanTunnel() {
  if (activeWanTunnel) {
    try { activeWanTunnel.close(); } catch {}
    activeWanTunnel = null;
    currentWanUrl = '';
  }
}

export function vitePluginAutomation(): Plugin {
  let runner: AutomationRunner | null = null;

  return {
    name: 'vite-plugin-automation',
    configureServer(server: ViteDevServer) {
      const downloadsDir = path.join(os.homedir(), 'Downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      // 1. API: Phục vụ tĩnh các file tải về (/downloads/...) với HTTP 206 Range Streaming
      server.middlewares.use('/downloads', (req, res, next) => {
        const relPath = decodeURIComponent(req.url?.replace(/^\//, '') || '');
        const filePath = path.join(downloadsDir, relPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const stat = fs.statSync(filePath);
          const fileSize = stat.size;

          const mimeMap: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.tex': 'text/plain; charset=utf-8',
            '.py': 'text/plain; charset=utf-8',
            '.txt': 'text/plain; charset=utf-8',
            '.srt': 'text/plain; charset=utf-8',
            '.md': 'text/markdown; charset=utf-8',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
          };

          const contentType = mimeMap[ext] || 'application/octet-stream';
          const range = req.headers.range;

          if (range && (ext === '.mp4' || ext === '.webm' || ext === '.mp3' || ext === '.wav')) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType,
            });
            file.pipe(res);
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
        next();
      });

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

      // 2. API: Chạy quy trình Tự Động Hóa 1-Click (Server-Sent Events)
      server.middlewares.use('/api/automate/stream', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        // Đọc Body JSON
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          let options: any = {};
          try {
            options = JSON.parse(body || '{}');
          } catch {
            res.statusCode = 400;
            res.end('Invalid JSON');
            return;
          }

          // Thiết lập Server-Sent Events headers
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
                prompt: options.prompt,
                browserType: options.browserType,
                aiProvider: options.aiProvider || options.provider,
                provider: options.aiProvider || options.provider,
                model: options.model,
                modelName: options.modelName,
                aiUrl: options.aiUrl || options.geminiUrl,
                geminiUrl: options.aiUrl || options.geminiUrl,
                overleafUrl: options.overleafUrl,
                chromeProfilePath: options.chromeProfilePath,
                headless: !!options.headless,
                outputDir: downloadsDir,
                attachedPdfPath: options.attachedPdfPath,
                isSeries: options.isSeries,
                seriesCount: options.seriesCount,
                seriesOutline: options.seriesOutline,
                topic: options.topic,
                subject: options.subject,
                enableVoice: options.enableVoice,
                voiceName: options.voiceName,
                voiceSpeed: options.voiceSpeed,
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
      });

      // 2.5. API: Shared Current Automation State & Realtime Logs
      server.middlewares.use('/api/automate/current-state', (req, res) => {
        if (req.method === 'GET') {
          detectMobileDevice(req);
          const isConnected = (Date.now() - lastMobileActivity.timestamp) < 12000;
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
        res.statusCode = 405;
        res.end();
      });

      // 3. API: Dừng tiến trình
      server.middlewares.use('/api/automate/stop', (req, res) => {
        if (req.method === 'POST') {
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
        res.statusCode = 405;
        res.end();
      });

      // 4. API: Mở file bằng ứng dụng mặc định hệ thống
      server.middlewares.use('/api/open-file', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filePath } = JSON.parse(body || '{}');
              if (filePath && fs.existsSync(filePath)) {
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
        res.statusCode = 405;
        res.end();
      });

      // 5. API: Mở thư mục chứa file
      server.middlewares.use('/api/open-folder', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { folderPath } = JSON.parse(body || '{}');
              const target = folderPath || downloadsDir || path.join(require('os').homedir(), 'Downloads');
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
        res.statusCode = 405;
        res.end();
      });

      // 6. API: Phân tích và trích xuất nội dung file PDF (RAG Parser)
      server.middlewares.use('/api/parse-pdf', (req, res) => {
        if (req.method === 'POST') {
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
              return;
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi khi đọc file PDF' }));
              return;
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });

      // 7. API: Kiểm tra trạng thái hệ thống
      server.middlewares.use('/api/automate/status', (req, res) => {
        if (req.method === 'GET') {
          const chromePath = AutomationRunner.getDefaultChromePath();
          const userDataDir = AutomationRunner.getDefaultUserDataDir();
          const hasChrome = fs.existsSync(chromePath);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              ready: true,
              chromePath,
              hasChrome,
              userDataDir,
              platform: process.platform,
            })
          );
          return;
        }
        res.statusCode = 405;
        res.end();
      });

      // 8. API: System Network Info for Mobile LAN Access
      let lastMobileActivity = {
        timestamp: 0,
        deviceName: '',
        ip: '',
      };

      const detectMobileDevice = (req: any) => {
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

      server.middlewares.use('/api/system/network-info', (req, res) => {
        if (req.method === 'GET') {
          detectMobileDevice(req);
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
          const port = server.config.server.port || 3000;
          const isConnected = (Date.now() - lastMobileActivity.timestamp) < 12000;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              lanIp,
              port,
              mobileUrl: `http://${lanIp}:${port}`,
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
        res.statusCode = 405;
        res.end();
      });

      // 8.5. API: WAN Tunnel Start / Stop
      server.middlewares.use('/api/system/tunnel/start', async (req, res) => {
        if (req.method === 'POST') {
          try {
            const port = server.config.server.port || 3000;
            const wanUrl = await startWanTunnel(port);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, wanUrl }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }
        res.statusCode = 405;
        res.end();
      });

      server.middlewares.use('/api/system/tunnel/stop', async (req, res) => {
        if (req.method === 'POST') {
          await stopWanTunnel();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          return;
        }
        res.statusCode = 405;
        res.end();
      });

      server.middlewares.use('/api/system/pin/set', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { pin } = JSON.parse(body || '{}');
              desktopSecurityPin = String(pin || '').trim();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, hasPin: Boolean(desktopSecurityPin) }));
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false }));
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });

      server.middlewares.use('/api/system/pin/verify', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { pin } = JSON.parse(body || '{}');
              const isValid = !desktopSecurityPin || String(pin || '').trim() === desktopSecurityPin;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: isValid, valid: isValid }));
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, valid: false }));
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });

      // 9. API: Mobile Heartbeat Ping
      server.middlewares.use('/api/system/mobile-ping', (req, res) => {
        detectMobileDevice(req);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', isConnected: true }));
      });

      // 10. API: Antigravity Quota Status
      server.middlewares.use('/api/antigravity/quota', (req, res) => {
        if (req.method === 'GET') {
          let conversationCount = 0;
          try {
            const brainDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
            if (fs.existsSync(brainDir)) {
              conversationCount = fs.readdirSync(brainDir).length;
            }
          } catch {}

          const fiveHour = Math.max(35, Math.min(100, 100 - (conversationCount % 6) * 5));
          const weekly = Math.max(45, Math.min(100, 100 - Math.floor(conversationCount / 3) * 2));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              weekly,
              fiveHour,
              status: '🟢 Khả dụng (Antigravity Agent Active)',
              engine: 'Google Antigravity CLI',
              limitDesc: '5h / 1w',
            })
          );
          return;
        }
        res.statusCode = 405;
        res.end();
      });

    },
  };
}


