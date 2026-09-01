const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');

// Helper to determine mime types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.tex': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

let mainWindow = null;
let server = null;
let activeRunner = null;

function getDownloadsDir() {
  const dir = path.join(app.getPath('userData'), 'downloads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getFirefoxExecutable() {
  const platform = process.platform;
  if (platform === 'linux') {
    for (const p of ['/usr/bin/firefox', '/usr/local/bin/firefox', '/snap/bin/firefox']) {
      if (fs.existsSync(p)) return p;
    }
    return 'firefox';
  } else if (platform === 'win32') {
    const prefixes = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
    for (const prefix of prefixes) {
      const p = path.join(prefix, 'Mozilla Firefox', 'firefox.exe');
      if (fs.existsSync(p)) return p;
    }
    return 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
  } else if (platform === 'darwin') {
    return '/Applications/Firefox.app/Contents/MacOS/firefox';
  }
  return 'firefox';
}

function getDefaultFirefoxProfile() {
  const platform = process.platform;
  const home = os.homedir();
  let baseDir = '';
  if (platform === 'linux') {
    baseDir = path.join(home, '.mozilla', 'firefox');
  } else if (platform === 'win32') {
    baseDir = path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Mozilla', 'Firefox', 'Profiles');
  } else if (platform === 'darwin') {
    baseDir = path.join(home, 'Library', 'Application Support', 'Firefox', 'Profiles');
  }

  if (fs.existsSync(baseDir)) {
    try {
      const files = fs.readdirSync(baseDir);
      const def = files.find(f => f.includes('default-release') || f.includes('.default'));
      if (def) return path.join(baseDir, def);
    } catch {}
  }
  return path.join(app.getPath('userData'), 'FirefoxProfile');
}

function startInternalServer(callback) {
  const distDir = path.join(__dirname, '..', 'dist');
  const downloadsDir = getDownloadsDir();

  const { chromium, firefox } = require('playwright-core');

  server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathname = parsedUrl.pathname;

    // 1. API: Status
    if (pathname === '/api/automate/status' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ready: true,
        platform: process.platform,
        userDataDir: path.join(app.getPath('userData'), 'ChromeProfile'),
        hasChrome: true,
      }));
      return;
    }

    // 2. API: Stop
    if (pathname === '/api/automate/stop' && req.method === 'POST') {
      if (activeRunner) {
        try { activeRunner.cancel(); } catch {}
        activeRunner = null;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 3. API: Open File
    if (pathname === '/api/open-file' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { filePath } = JSON.parse(body || '{}');
          if (filePath && fs.existsSync(filePath)) {
            const { shell } = require('electron');
            await shell.openPath(filePath);
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

    // 4. API: Open Folder
    if (pathname === '/api/open-folder' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { folderPath } = JSON.parse(body || '{}');
          const target = folderPath || downloadsDir || path.join(os.homedir(), 'Downloads');
          const { shell } = require('electron');
          await shell.openPath(target);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          return;
        } catch {}
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false }));
      });
      return;
    }

    // 5. API: Parse PDF (RAG Parser)
    if (pathname === '/api/parse-pdf' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { fileName, fileBase64 } = JSON.parse(body || '{}');
          if (!fileBase64) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Thiếu dữ liệu PDF' }));
            return;
          }

          const buffer = Buffer.from(fileBase64, 'base64');
          const safeName = (fileName || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
          const tempPath = path.join(os.tmpdir(), `yuta_rag_${Date.now()}_${safeName}`);
          fs.writeFileSync(tempPath, buffer);

          const pdfParse = require('pdf-parse');
          const parsed = await pdfParse(buffer);

          const fileSizeStr = buffer.length > 1024 * 1024
            ? (buffer.length / (1024 * 1024)).toFixed(1) + ' MB'
            : Math.round(buffer.length / 1024) + ' KB';

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            fileName: safeName,
            numPages: parsed.numpages || 1,
            text: parsed.text || '',
            tempPath: tempPath,
            fileSize: fileSizeStr,
          }));
          return;
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi đọc file PDF' }));
        }
      });
      return;
    }



    // 3. API: SSE Stream
    if (pathname === '/api/automate/stream' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        let options = {};
        try { options = JSON.parse(body || '{}'); } catch {}

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        const sendSSE = (data) => {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        try {
          const browserType = options.browserType || 'chrome';
          const isHeadless = !!options.headless;
          const browserName = browserType === 'firefox' ? 'Firefox' : browserType === 'edge' ? 'Edge' : 'Chrome';

          sendSSE({
            step: 'CONNECTING_CHROME',
            progress: 10,
            message: isHeadless
              ? `Đang khởi động ${browserName} ở chế độ CHẠY NGẦM (Stealth Mode)...`
              : `Đang kết nối ${browserName} tự động hóa...`,
          });

          const stealthUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
          const viewportSetting = isHeadless ? { width: 1920, height: 1080 } : null;
          const stealthArgs = [
            '--start-maximized',
            '--disable-blink-features=AutomationControlled',
            '--no-default-browser-check',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
          ];

          let browserContext;
          if (browserType === 'firefox') {
            const firefoxExec = getFirefoxExecutable();
            const firefoxProfile = options.chromeProfilePath || getDefaultFirefoxProfile();
            try {
              browserContext = await firefox.launchPersistentContext(firefoxProfile, {
                executablePath: firefoxExec,
                headless: isHeadless,
                viewport: viewportSetting,
                userAgent: stealthUA,
                args: ['-no-remote'],
              });
            } catch (err) {
              console.warn('Firefox Snap không hỗ trợ automation pipe, tự động chuyển sang Chrome:', err.message);
              sendSSE({
                step: 'CONNECTING_CHROME',
                progress: 15,
                message: 'Firefox Snap không hỗ trợ pipe điều khiển, đang tự động chuyển sang Google Chrome...',
              });
              const userDataDir = path.join(os.tmpdir(), 'yuta_chrome_auto_' + Date.now());
              browserContext = await chromium.launchPersistentContext(userDataDir, {
                headless: isHeadless,
                channel: 'chrome',
                viewport: viewportSetting,
                userAgent: stealthUA,
                args: stealthArgs,
                ignoreDefaultArgs: ['--enable-automation'],
              });
            }
          } else {
            const defaultUserDataDir = path.join(app.getPath('userData'), 'AutomationProfile');
            const userDataDir = options.chromeProfilePath || defaultUserDataDir;
            try {
              browserContext = await chromium.launchPersistentContext(userDataDir, {
                headless: isHeadless,
                channel: browserType === 'edge' ? 'msedge' : 'chrome',
                viewport: viewportSetting,
                userAgent: stealthUA,
                args: stealthArgs,
                ignoreDefaultArgs: ['--enable-automation'],
              });
            } catch (e) {
              console.warn('Profile Chrome đang mở hoặc bị khóa, khởi tạo session làm việc mới:', e.message);
              const tempDir = path.join(os.tmpdir(), 'yuta_automation_chrome_' + Date.now());
              browserContext = await chromium.launchPersistentContext(tempDir, {
                headless: isHeadless,
                channel: 'chrome',
                viewport: viewportSetting,
                userAgent: stealthUA,
                args: stealthArgs,
                ignoreDefaultArgs: ['--enable-automation'],
              });
            }
          }

          // Anti-bot stealth init script
          await browserContext.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['vi-VN', 'vi', 'en-US', 'en'] });
            window.chrome = { runtime: {}, app: {} };
          });

          activeRunner = {
            cancel: () => {
              browserContext.close().catch(() => {});
            }
          };

          // Step 2: Open Web AI (Gemini, ChatGPT, Claude, Grok, DeepSeek)
          const targetAiUrl = options.aiUrl || options.geminiUrl || 'https://gemini.google.com/app';
          let aiName = 'AI';
          if (targetAiUrl.includes('chatgpt.com') || targetAiUrl.includes('openai.com')) aiName = 'ChatGPT';
          else if (targetAiUrl.includes('claude.ai')) aiName = 'Claude';
          else if (targetAiUrl.includes('grok.com') || targetAiUrl.includes('x.com')) aiName = 'Grok';
          else if (targetAiUrl.includes('deepseek.com')) aiName = 'DeepSeek';
          else if (targetAiUrl.includes('gemini.google.com')) aiName = 'Gemini';

          sendSSE({
            step: 'OPENING_GEMINI',
            progress: 25,
            message: `Đang truy cập ${aiName} (${targetAiUrl})...`,
          });

          let targetHost = 'gemini.google.com';
          try {
            targetHost = new URL(targetAiUrl).hostname;
          } catch {}

          const pages = browserContext.pages();
          let page = pages.find(p => {
            try { return new URL(p.url()).hostname.includes(targetHost) || p.url().includes(targetHost); } catch { return false; }
          });

          if (!page) {
            page = pages.length > 0 ? pages[0] : await browserContext.newPage();
            await page.goto(targetAiUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
          } else {
            if (!isHeadless) await page.bringToFront();
            if (!page.url().includes(targetHost)) {
              await page.goto(targetAiUrl, { waitUntil: 'domcontentloaded' });
            }
          }

          if (page.url().includes('accounts.google.com') || page.url().includes('/login') || page.url().includes('/auth')) {
            if (isHeadless) {
              throw new Error(`Chưa đăng nhập ${aiName} trong chế độ chạy ngầm! Vui lòng bỏ chọn "Chạy ngầm" để đăng nhập 1 lần trên trình duyệt.`);
            }
            sendSSE({
              step: 'OPENING_GEMINI',
              progress: 28,
              message: `Vui lòng hoàn tất đăng nhập tài khoản ${aiName} trên trình duyệt...`,
            });
            await page.waitForURL(url => !url.href.includes('/login') && !url.href.includes('/auth') && !url.href.includes('accounts.google.com'), { timeout: 120000 });
          }

          // Đính kèm file PDF nếu có (RAG Native Multimodal Attachment)
          if (options.attachedPdfPath && fs.existsSync(options.attachedPdfPath)) {
            try {
              sendSSE({
                step: 'SENDING_PROMPT',
                progress: 32,
                message: `Đang đính kèm file PDF (${path.basename(options.attachedPdfPath)}) vào ${aiName}...`,
              });
              const fileInput = await page.$('input[type="file"]');
              if (fileInput) {
                await fileInput.setInputFiles(options.attachedPdfPath);
                await page.waitForTimeout(2500);
              }
            } catch (uploadErr) {
              console.warn('Không thể tự động đính kèm file qua input[type="file"]:', uploadErr);
            }
          }

          sendSSE({
            step: 'SENDING_PROMPT',
            progress: 35,
            message: `Đang điền Prompt và gửi lệnh giải toán sang ${aiName}...`,
          });

          await page.waitForTimeout(1500);


          const promptSelectors = [
            '#prompt-textarea',
            'rich-textarea div[contenteditable="true"]',
            'div.ql-editor[contenteditable="true"]',
            'div[contenteditable="true"].ProseMirror',
            'textarea#chat-input',
            'textarea[data-id="root"]',
            'div[role="textbox"][contenteditable="true"]',
            'div[contenteditable="true"]',
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="DeepSeek"]',
            'textarea[placeholder*="Message"]',
            'textarea[aria-label*="prompt"]',
            'textarea',
          ];

          let inputFound = false;
          for (const sel of promptSelectors) {
            try {
              const el = await page.waitForSelector(sel, { timeout: 6000, state: 'attached' });
              if (el && (await el.isVisible())) {
                await el.click();
                await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
                await page.keyboard.press('Backspace');

                await page.evaluate(({ selector, text }) => {
                  const target = document.querySelector(selector);
                  if (target) {
                    target.focus();
                    document.execCommand('insertText', false, text);
                    target.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
                    target.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }, { selector: sel, text: options.prompt });

                inputFound = true;
                break;
              }
            } catch {}
          }

          if (!inputFound) {
            await page.keyboard.insertText(options.prompt);
          }

          await page.waitForTimeout(800);

          // Click send
          const sendBtns = [
            'button[data-testid="send-button"]',
            'button[aria-label*="Send message"]',
            'button[aria-label*="Gửi tin nhắn"]',
            'button[aria-label*="Send Message"]',
            'button[aria-label*="Send prompt"]',
            'button[aria-label*="Send"]',
            'button[aria-label*="Gửi"]',
            'div[role="button"][aria-label*="Send"]',
            'button.send-button',
            'button[type="submit"]',
            'mat-icon[fonticon="send"]',
          ];
          let clicked = false;
          for (const sel of sendBtns) {
            try {
              const btn = await page.$(sel);
              if (btn && (await btn.isVisible())) {
                await btn.click();
                clicked = true;
                break;
              }
            } catch {}
          }
          if (!clicked) await page.keyboard.press('Enter');

          // Step 3: Wait AI
          sendSSE({
            step: 'WAITING_GEMINI',
            progress: 50,
            message: `${aiName} đang phân tích và biên soạn mã nguồn LaTeX chuẩn...`,
          });

          let checkCount = 0;
          let lastLength = 0;
          let stable = 0;
          while (checkCount < 120) {
            await page.waitForTimeout(2000);
            checkCount++;
            const isStop = await page.$('button[data-testid="stop-button"], button[aria-label*="Stop"], button[aria-label*="Dừng"]');
            const isStopVisible = isStop ? await isStop.isVisible() : false;

            const curLen = await page.evaluate(() => {
              const blocks = document.querySelectorAll(
                'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
              );
              const last = blocks[blocks.length - 1];
              return last ? (last.textContent || '').length : 0;
            });

            if (curLen > 100 && curLen === lastLength && !isStopVisible) {
              stable++;
              if (stable >= 2) break;
            } else {
              stable = 0;
            }
            lastLength = curLen;

            if (checkCount > 4 && !isStopVisible && curLen > 200) break;
          }

          // Step 4: Extract LaTeX
          sendSSE({
            step: 'EXTRACTING_LATEX',
            progress: 65,
            message: 'Đang trích xuất mã nguồn LaTeX...',
          });

          const extractedLatex = await page.evaluate(() => {
            const codeBlocks = document.querySelectorAll(
              'pre code, .code-block code, div[data-message-author-role="assistant"] pre code, .font-claude-message pre code, .ds-markdown pre code, code'
            );
            for (let i = codeBlocks.length - 1; i >= 0; i--) {
              const txt = codeBlocks[i].textContent || '';
              if (txt.includes('\\documentclass') || txt.includes('\\begin{document}') || txt.includes('\\usepackage')) {
                return txt;
              }
            }
            const allText = document.body.innerText || '';
            const match = allText.match(/\\documentclass[\s\S]*?\\end\{document\}/);
            return match ? match[0] : null;
          });

          let finalLatex = extractedLatex || options.prompt;
          finalLatex = finalLatex.replace(/^```(?:latex|tex)?\s*/i, '').replace(/\s*```$/i, '').trim();

          const texFileName = `de_thi_${Date.now()}.tex`;
          fs.writeFileSync(path.join(downloadsDir, texFileName), finalLatex, 'utf-8');

          sendSSE({
            step: 'EXTRACTING_LATEX',
            progress: 70,
            message: 'Đã trích xuất mã LaTeX thành công!',
            latexCode: finalLatex,
          });


          // Step 5: Overleaf
          sendSSE({
            step: 'OPENING_OVERLEAF',
            progress: 75,
            message: 'Đang mở dự án Overleaf...',
          });

          const overleafUrl = options.overleafUrl || 'https://www.overleaf.com/project';
          let overleafPage = browserContext.pages().find(p => p.url().includes('overleaf.com'));
          if (!overleafPage) {
            overleafPage = await browserContext.newPage();
            await overleafPage.goto(overleafUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
          } else {
            if (!isHeadless) await overleafPage.bringToFront();
            if (options.overleafUrl && !overleafPage.url().includes(options.overleafUrl)) {
              await overleafPage.goto(options.overleafUrl, { waitUntil: 'domcontentloaded' });
            }
          }

          if (overleafPage.url().includes('/login')) {
            if (isHeadless) {
              throw new Error('Overleaf yêu cầu đăng nhập! Vui lòng tắt chế độ chạy ngầm để đăng nhập Overleaf 1 lần.');
            }
          }


          sendSSE({
            step: 'PASTING_CODE',
            progress: 82,
            message: 'Đang dán mã nguồn vào Overleaf...',
          });

          await overleafPage.waitForTimeout(2000);

          const editorSelectors = [
            '.cm-content[contenteditable="true"]',
            '.cm-editor .cm-content',
            '.ace_text-input',
            'div[role="textbox"].cm-content',
          ];

          let editorPasted = false;
          for (const sel of editorSelectors) {
            try {
              const el = await overleafPage.waitForSelector(sel, { timeout: 8000, state: 'visible' });
              if (el) {
                await el.click();
                await overleafPage.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
                await overleafPage.keyboard.press('Backspace');

                const dispatched = await overleafPage.evaluate((code) => {
                  const cm = document.querySelector('.cm-editor');
                  if (cm && cm.cmView && cm.cmView.view) {
                    cm.cmView.view.dispatch({
                      changes: { from: 0, to: cm.cmView.view.state.doc.length, insert: code }
                    });
                    return true;
                  }
                  return false;
                }, finalLatex);

                if (!dispatched) {
                  await overleafPage.keyboard.insertText(finalLatex);
                }
                editorPasted = true;
                break;
              }
            } catch {}
          }

          if (!editorPasted) {
            await overleafPage.keyboard.insertText(finalLatex);
          }

          await overleafPage.waitForTimeout(1000);

          sendSSE({
            step: 'RECOMPILING',
            progress: 90,
            message: 'Đang Recompile PDF...',
          });

          await overleafPage.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');

          try {
            const recompileBtn = await overleafPage.$('.btn-recompile, button[aria-label*="Recompile"], .recompile-button');
            if (recompileBtn) {
              await recompileBtn.click();
            }
          } catch {}

          sendSSE({
            step: 'DOWNLOADING_PDF',
            progress: 95,
            message: 'Đang đợi Overleaf hoàn tất biên dịch và tạo file PDF...',
          });

          let pdfSavedPath = null;
          const pdfFileName = `TaiLieu_Yuta_${Date.now()}.pdf`;
          const pdfPath = path.join(downloadsDir, pdfFileName);
          const userDownloadsPath = path.join(os.homedir(), 'Downloads', pdfFileName);

          const currentUrl = overleafPage.url();
          const projMatch = currentUrl.match(/\/project\/([a-f0-9]+)/i);
          const projectId = projMatch ? projMatch[1] : null;
          const directPdfUrl = projectId ? `https://www.overleaf.com/project/${projectId}/output/output.pdf?compileGroup=standard` : null;

          // Vòng lặp thăm dò kết quả biên dịch (Poll tối đa 35 giây, kiểm tra mỗi 1.5s)
          const startTime = Date.now();
          const maxWaitMs = 35000;

          while (Date.now() - startTime < maxWaitMs) {
            await overleafPage.waitForTimeout(1500);

            // 1. Tải trực tiếp qua endpoint output.pdf của project
            if (directPdfUrl) {
              try {
                const resp = await overleafPage.request.get(directPdfUrl, { timeout: 4000 });
                if (resp.ok()) {
                  const buf = await resp.body();
                  if (buf.length > 500 && buf.slice(0, 4).toString() === '%PDF') {
                    fs.writeFileSync(pdfPath, buf);
                    try { fs.writeFileSync(userDownloadsPath, buf); } catch {}
                    pdfSavedPath = pdfPath;
                    break;
                  }
                }
              } catch {}
            }

            // 2. Kiểm tra xem giao diện Overleaf đã xuất hiện viewer/download button chưa
            const isPdfReady = await overleafPage.evaluate(() => {
              const dl = document.querySelector('a[aria-label*="Download PDF"], a.btn-download-pdf, a[href$="output.pdf"]');
              const err = document.querySelector('.btn-recompile.btn-danger, .compilation-error-label');
              return !!(dl || err);
            }).catch(() => false);

            if (isPdfReady && directPdfUrl && !pdfSavedPath) {
              try {
                const resp = await overleafPage.request.get(directPdfUrl, { timeout: 4000 });
                if (resp.ok()) {
                  const buf = await resp.body();
                  if (buf.length > 500 && buf.slice(0, 4).toString() === '%PDF') {
                    fs.writeFileSync(pdfPath, buf);
                    try { fs.writeFileSync(userDownloadsPath, buf); } catch {}
                    pdfSavedPath = pdfPath;
                    break;
                  }
                }
              } catch {}
            }
          }

          // Fallback: Click nút Download nếu direct fetch chưa có
          if (!pdfSavedPath) {
            const downloadBtnSelectors = [
              'a[aria-label*="Download PDF"]',
              'a.btn-download-pdf',
              'button[aria-label*="Download PDF"]',
              'a[href$="output.pdf"]',
              'a.pdf-download-btn',
            ];

            for (const sel of downloadBtnSelectors) {
              try {
                const btn = await overleafPage.$(sel);
                if (btn) {
                  const [download] = await Promise.all([
                    overleafPage.waitForEvent('download', { timeout: 10000 }),
                    btn.click(),
                  ]);
                  await download.saveAs(pdfPath);
                  try { await download.saveAs(userDownloadsPath); } catch {}
                  pdfSavedPath = pdfPath;
                  break;
                }
              } catch {}
            }
          }


          sendSSE({
            step: 'COMPLETED',
            progress: 100,
            message: pdfSavedPath
              ? `🎉 Hoàn tất 1-Click! File PDF đã được lưu vào ${pdfFileName}`
              : '🎉 Hoàn tất! Mã LaTeX đã được đồng bộ sang Overleaf.',
            latexCode: finalLatex,
            pdfUrl: pdfSavedPath ? `/downloads/${pdfFileName}` : undefined,
            pdfPath: pdfSavedPath || path.join(downloadsDir, texFileName),
          });



        } catch (err) {
          sendSSE({
            step: 'ERROR',
            progress: 0,
            message: `Sự cố: ${err.message}`,
            error: err.message,
          });
        } finally {
          activeRunner = null;
          res.end();
        }
      });
      return;
    }

    // 4. Serve Downloads
    if (pathname.startsWith('/downloads/')) {
      const filename = path.basename(pathname);
      const filePath = path.join(downloadsDir, filename);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        const content = fs.readFileSync(filePath);
        res.end(content);
        return;
      }
    }

    // 5. Serve Dist Frontend Files
    let reqPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    let filePath = path.join(distDir, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/html' });
      const content = fs.readFileSync(filePath);
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    callback(port);
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Yuta!LaTeX Math Studio - Browser Automation',
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, '..', 'icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (server) {
      server.close();
      server = null;
    }
  });
}

app.whenReady().then(() => {
  startInternalServer((port) => {
    createWindow(port);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startInternalServer((port) => {
        createWindow(port);
      });
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
