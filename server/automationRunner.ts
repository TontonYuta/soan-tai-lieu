import { chromium, firefox, BrowserContext, Page } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface AutomationStepUpdate {
  step: 'INIT' | 'CONNECTING_CHROME' | 'OPENING_GEMINI' | 'SENDING_PROMPT' | 'WAITING_GEMINI' | 'EXTRACTING_LATEX' | 'OPENING_OVERLEAF' | 'PASTING_CODE' | 'RECOMPILING' | 'DOWNLOADING_PDF' | 'COMPLETED' | 'ERROR';
  progress: number; // 0 - 100
  message: string;
  latexCode?: string;
  pdfUrl?: string;
  pdfPath?: string;
  error?: string;
}

export interface AutomationOptions {
  prompt: string;
  browserType?: 'chrome' | 'firefox' | 'edge';
  aiUrl?: string;
  geminiUrl?: string;
  overleafUrl?: string;
  chromeProfilePath?: string;
  headless?: boolean;
  cdpPort?: number;
  outputDir?: string;
  attachedPdfPath?: string;
}



const DEFAULT_STEALTH_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

export class AutomationRunner {
  private context: BrowserContext | null = null;
  private isCancelled: boolean = false;
  private activePage: Page | null = null;

  public static getDefaultChromePath(): string {
    const platform = process.platform;
    if (platform === 'win32') {
      const prefixes = [
        process.env.LOCALAPPDATA,
        process.env.PROGRAMFILES,
        process.env['PROGRAMFILES(X86)'],
      ].filter(Boolean) as string[];

      for (const prefix of prefixes) {
        const p = path.join(prefix, 'Google', 'Chrome', 'Application', 'chrome.exe');
        if (fs.existsSync(p)) return p;
        const pEdge = path.join(prefix, 'Microsoft', 'Edge', 'Application', 'msedge.exe');
        if (fs.existsSync(pEdge)) return pEdge;
      }
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else if (platform === 'darwin') {
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else {
      const candidates = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) return p;
      }
      return 'google-chrome';
    }
  }

  public static getDefaultFirefoxPath(): string {
    const platform = process.platform;
    if (platform === 'win32') {
      const prefixes = [
        process.env.PROGRAMFILES,
        process.env['PROGRAMFILES(X86)'],
        process.env.LOCALAPPDATA,
      ].filter(Boolean) as string[];

      for (const prefix of prefixes) {
        const p = path.join(prefix, 'Mozilla Firefox', 'firefox.exe');
        if (fs.existsSync(p)) return p;
      }
      return 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
    } else if (platform === 'darwin') {
      return '/Applications/Firefox.app/Contents/MacOS/firefox';
    } else {
      const candidates = ['/usr/bin/firefox', '/usr/local/bin/firefox', '/snap/bin/firefox'];
      for (const p of candidates) {
        if (fs.existsSync(p)) return p;
      }
      return 'firefox';
    }
  }

  public static getDefaultFirefoxProfileDir(): string {
    const platform = process.platform;
    const home = os.homedir();
    let baseDir = '';

    if (platform === 'win32') {
      baseDir = path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Mozilla', 'Firefox', 'Profiles');
    } else if (platform === 'darwin') {
      baseDir = path.join(home, 'Library', 'Application Support', 'Firefox', 'Profiles');
    } else {
      baseDir = path.join(home, '.mozilla', 'firefox');
    }

    if (fs.existsSync(baseDir)) {
      try {
        const files = fs.readdirSync(baseDir);
        const defaultProfile = files.find((f) => f.includes('default-release') || f.includes('.default'));
        if (defaultProfile) {
          return path.join(baseDir, defaultProfile);
        }
      } catch {}
      return baseDir;
    }
    return path.join(os.tmpdir(), 'yuta_firefox_profile');
  }

  public static getDefaultUserDataDir(): string {
    const platform = process.platform;
    const home = os.homedir();
    if (platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
      return path.join(localAppData, 'Google', 'Chrome', 'User Data');
    } else if (platform === 'darwin') {
      return path.join(home, 'Library', 'Application Support', 'Google', 'Chrome');
    } else {
      return path.join(home, '.config', 'google-chrome');
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.context) {
      this.context.close().catch(() => {});
      this.context = null;
    }
  }

  public async runPipeline(
    options: AutomationOptions,
    onProgress: (update: AutomationStepUpdate) => void
  ): Promise<{ success: boolean; latexCode?: string; pdfPath?: string; pdfUrl?: string; error?: string }> {
    this.isCancelled = false;
    const outputDirectory = options.outputDir || path.resolve(process.cwd(), 'downloads');
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const browserType = options.browserType || 'chrome';
    const isHeadless = !!options.headless;
    const browserName = browserType === 'firefox' ? 'Firefox' : browserType === 'edge' ? 'Edge' : 'Chrome';

    try {
      // 1. Khởi động kết nối trình duyệt
      onProgress({
        step: 'CONNECTING_CHROME',
        progress: 10,
        message: isHeadless
          ? `Đang khởi động ${browserName} ở chế độ CHẠY NGẦM (Stealth Mode)...`
          : `Đang kết nối ${browserName} với tài khoản của bạn...`,
      });

      let browserContext: BrowserContext;
      const viewportSetting = isHeadless ? { width: 1920, height: 1080 } : null;
      const stealthArgs = [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--no-default-browser-check',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
      ];

      if (browserType === 'firefox') {
        const firefoxExecutable = AutomationRunner.getDefaultFirefoxPath();
        const firefoxProfile = options.chromeProfilePath || AutomationRunner.getDefaultFirefoxProfileDir();

        try {
          browserContext = await firefox.launchPersistentContext(firefoxProfile, {
            executablePath: firefoxExecutable,
            headless: isHeadless,
            viewport: viewportSetting,
            userAgent: DEFAULT_STEALTH_USER_AGENT,
            args: ['-no-remote'],
          });
        } catch (err: any) {
          console.warn('Firefox Snap không hỗ trợ automation, chuyển sang Chrome:', err.message);
          onProgress({
            step: 'CONNECTING_CHROME',
            progress: 15,
            message: 'Đang tự động chuyển sang Google Chrome...',
          });
          const chromeExecutable = AutomationRunner.getDefaultChromePath();
          const userDataDir = options.chromeProfilePath || path.join(os.tmpdir(), 'yuta_chrome_auto_' + Date.now());
          browserContext = await chromium.launchPersistentContext(userDataDir, {
            executablePath: chromeExecutable,
            headless: isHeadless,
            channel: 'chrome',
            viewport: viewportSetting,
            userAgent: DEFAULT_STEALTH_USER_AGENT,
            args: stealthArgs,
            ignoreDefaultArgs: ['--enable-automation'],
          });
        }
      } else {
        const chromeExecutable = AutomationRunner.getDefaultChromePath();
        const defaultProfile = AutomationRunner.getDefaultUserDataDir();
        const userDataDir = options.chromeProfilePath || defaultProfile;

        try {
          if (options.cdpPort) {
            const browser = await chromium.connectOverCDP(`http://localhost:${options.cdpPort}`);
            browserContext = browser.contexts()[0];
          } else {

            browserContext = await chromium.launchPersistentContext(userDataDir, {
              executablePath: chromeExecutable,
              headless: isHeadless,
              channel: browserType === 'edge' ? 'msedge' : 'chrome',
              viewport: viewportSetting,
              userAgent: DEFAULT_STEALTH_USER_AGENT,
              args: stealthArgs,
              ignoreDefaultArgs: ['--enable-automation'],
            });
          }
        } catch (err: any) {
          console.warn('Profile Chrome đang mở hoặc bị khóa, khởi tạo session làm việc mới:', err.message);
          const tempDir = path.join(os.tmpdir(), 'yuta_automation_chrome_' + Date.now());
          browserContext = await chromium.launchPersistentContext(tempDir, {
            executablePath: chromeExecutable,
            headless: isHeadless,
            channel: 'chrome',
            viewport: viewportSetting,
            userAgent: DEFAULT_STEALTH_USER_AGENT,
            args: stealthArgs,
            ignoreDefaultArgs: ['--enable-automation'],
          });
        }
      }

      // Stealth anti-bot injection (ẩn navigator.webdriver)
      await browserContext.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['vi-VN', 'vi', 'en-US', 'en'] });
        // @ts-ignore
        window.chrome = { runtime: {}, app: {} };
      });

      this.context = browserContext;
      if (this.isCancelled) throw new Error('Đã hủy quy trình tự động.');

      // 2. Mở Web AI (Gemini, ChatGPT, Claude, Grok, DeepSeek) & Gửi Prompt
      const targetAiUrl = options.aiUrl || options.geminiUrl || 'https://gemini.google.com/app';
      let aiName = 'AI';
      if (targetAiUrl.includes('chatgpt.com') || targetAiUrl.includes('openai.com')) aiName = 'ChatGPT';
      else if (targetAiUrl.includes('claude.ai')) aiName = 'Claude';
      else if (targetAiUrl.includes('grok.com') || targetAiUrl.includes('x.com')) aiName = 'Grok';
      else if (targetAiUrl.includes('deepseek.com')) aiName = 'DeepSeek';
      else if (targetAiUrl.includes('gemini.google.com')) aiName = 'Gemini';

      onProgress({
        step: 'OPENING_GEMINI',
        progress: 25,
        message: `Đang truy cập ${aiName} (${targetAiUrl})...`,
      });

      let targetHost = 'gemini.google.com';
      try {
        targetHost = new URL(targetAiUrl).hostname;
      } catch {}

      const pages = browserContext.pages();
      let aiPage = pages.find((p) => {
        try { return new URL(p.url()).hostname.includes(targetHost) || p.url().includes(targetHost); } catch { return false; }
      });

      if (!aiPage) {
        aiPage = pages.length > 0 ? pages[0] : await browserContext.newPage();
        await aiPage.goto(targetAiUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      } else {
        if (!isHeadless) await aiPage.bringToFront();
        if (!aiPage.url().includes(targetHost)) {
          await aiPage.goto(targetAiUrl, { waitUntil: 'domcontentloaded' });
        }
      }
      this.activePage = aiPage;

      // Kiểm tra đăng nhập
      if (aiPage.url().includes('accounts.google.com') || aiPage.url().includes('/login') || aiPage.url().includes('/auth')) {
        if (isHeadless) {
          throw new Error(`Chưa đăng nhập ${aiName} trong phiên chạy ngầm! Vui lòng bỏ chọn "Chạy ngầm" để đăng nhập 1 lần trên trình duyệt.`);
        }
        onProgress({
          step: 'OPENING_GEMINI',
          progress: 28,
          message: `Vui lòng hoàn tất đăng nhập tài khoản ${aiName} trên trình duyệt...`,
        });
        await aiPage.waitForURL((url) => !url.href.includes('/login') && !url.href.includes('/auth') && !url.href.includes('accounts.google.com'), { timeout: 120000 });
      }

      // Đính kèm file PDF nếu có (RAG Native Multimodal Attachment)
      if (options.attachedPdfPath && fs.existsSync(options.attachedPdfPath)) {
        try {
          onProgress({
            step: 'SENDING_PROMPT',
            progress: 32,
            message: `Đang đính kèm file PDF (${path.basename(options.attachedPdfPath)}) vào ${aiName}...`,
          });
          const fileInput = await aiPage.$('input[type="file"]');
          if (fileInput) {
            await fileInput.setInputFiles(options.attachedPdfPath);
            await aiPage.waitForTimeout(2500);
          }
        } catch (uploadErr) {
          console.warn('Không thể tự động đính kèm file qua input[type="file"]:', uploadErr);
        }
      }

      // Đợi khung nhập liệu của AI sẵn sàng
      onProgress({
        step: 'SENDING_PROMPT',
        progress: 35,
        message: `Đang điền Prompt và gửi lệnh giải toán sang ${aiName}...`,
      });

      await aiPage.waitForTimeout(2000);


      const promptInputSelectors = [
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
      for (const sel of promptInputSelectors) {
        try {
          const el = await aiPage.waitForSelector(sel, { timeout: 6000, state: 'attached' });
          if (el && (await el.isVisible())) {
            await el.click();
            await aiPage.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
            await aiPage.keyboard.press('Backspace');
            
            await aiPage.evaluate(({ selector, text }) => {
              const target = document.querySelector(selector) as HTMLElement;
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
        await aiPage.keyboard.insertText(options.prompt);
      }

      await aiPage.waitForTimeout(1000);

      // Bấm nút gửi Prompt
      const sendButtonSelectors = [
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

      let sendClicked = false;
      for (const sel of sendButtonSelectors) {
        try {
          const btn = await aiPage.$(sel);
          if (btn && (await btn.isVisible())) {
            await btn.click();
            sendClicked = true;
            break;
          }
        } catch {}
      }

      if (!sendClicked) {
        await aiPage.keyboard.press('Enter');
      }

      // 3. Chờ AI suy luận và xuất kết quả
      onProgress({
        step: 'WAITING_GEMINI',
        progress: 50,
        message: `${aiName} đang phân tích và biên soạn mã nguồn LaTeX chuẩn...`,
      });

      let checkCount = 0;
      let lastTextLength = 0;
      let stableCount = 0;

      while (checkCount < 120) {
        if (this.isCancelled) throw new Error('Đã hủy quy trình.');
        await aiPage.waitForTimeout(2000);
        checkCount++;

        const stopBtn = await aiPage.$('button[data-testid="stop-button"], button[aria-label*="Stop"], button[aria-label*="Dừng"]');
        const isStopVisible = stopBtn ? await stopBtn.isVisible() : false;

        const currentLength = await aiPage.evaluate(() => {
          const blocks = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
          );
          const lastBlock = blocks[blocks.length - 1];
          return lastBlock ? (lastBlock.textContent || '').length : 0;
        });

        if (currentLength > 100 && currentLength === lastTextLength && !isStopVisible) {
          stableCount++;
          if (stableCount >= 2) break;
        } else {
          stableCount = 0;
        }
        lastTextLength = currentLength;

        if (checkCount > 4 && !isStopVisible && currentLength > 200) {
          break;
        }
      }

      // 4. Trích xuất mã LaTeX sạch
      onProgress({
        step: 'EXTRACTING_LATEX',
        progress: 65,
        message: 'Đang bóc tách và làm sạch mã nguồn LaTeX...',
      });

      const extractedLatex = await aiPage.evaluate(() => {
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
        if (match) return match[0];
        return null;
      });

      let finalLatex = extractedLatex || options.prompt;
      finalLatex = finalLatex.replace(/^```(?:latex|tex)?\s*/i, '').replace(/\s*```$/i, '').trim();

      const texFileName = `de_thi_${Date.now()}.tex`;
      const texFilePath = path.join(outputDirectory, texFileName);
      fs.writeFileSync(texFilePath, finalLatex, 'utf-8');


      onProgress({
        step: 'EXTRACTING_LATEX',
        progress: 70,
        message: 'Đã trích xuất mã LaTeX thành công!',
        latexCode: finalLatex,
      });

      // 5. Mở Overleaf & Dán Code
      onProgress({
        step: 'OPENING_OVERLEAF',
        progress: 75,
        message: 'Đang mở dự án Overleaf để biên dịch tài liệu...',
      });

      const overleafTargetUrl = options.overleafUrl || 'https://www.overleaf.com/project';
      let overleafPage = browserContext.pages().find((p) => p.url().includes('overleaf.com'));
      if (!overleafPage) {
        overleafPage = await browserContext.newPage();
        await overleafPage.goto(overleafTargetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      } else {
        if (!isHeadless) await overleafPage.bringToFront();
        if (options.overleafUrl && !overleafPage.url().includes(options.overleafUrl)) {
          await overleafPage.goto(options.overleafUrl, { waitUntil: 'domcontentloaded' });
        }
      }
      this.activePage = overleafPage;

      if (overleafPage.url().includes('/login')) {
        if (isHeadless) {
          throw new Error('Overleaf yêu cầu đăng nhập! Vui lòng tắt chế độ chạy ngầm để đăng nhập Overleaf 1 lần.');
        }
      }

      onProgress({
        step: 'PASTING_CODE',
        progress: 82,
        message: 'Đang dán mã nguồn LaTeX vào trình biên tập Overleaf...',
      });

      await overleafPage.waitForTimeout(2000);

      // Dán mã vào CodeMirror 6 hoặc Ace Editor
      const editorSelectors = [
        '.cm-content[contenteditable="true"]',
        '.cm-editor .cm-content',
        '.ace_text-input',
        'div[role="textbox"].cm-content',
      ];

      let editorPasted = false;
      for (const sel of editorSelectors) {
        try {
          const editor = await overleafPage.waitForSelector(sel, { timeout: 8000, state: 'attached' });
          if (editor) {
            await editor.click();
            await overleafPage.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
            await overleafPage.keyboard.press('Backspace');

            const dispatched = await overleafPage.evaluate((code) => {
              const cm = document.querySelector('.cm-editor') as any;
              if (cm && cm.cmView && cm.cmView.view) {
                const view = cm.cmView.view;
                view.dispatch({
                  changes: { from: 0, to: view.state.doc.length, insert: code }
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

      // 6. Kích hoạt Recompile trên Overleaf
      onProgress({
        step: 'RECOMPILING',
        progress: 90,
        message: 'Đang kích hoạt Recompile (Ctrl + Enter)...',
      });

      await overleafPage.keyboard.press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');

      try {
        const recompileBtn = await overleafPage.$('.btn-recompile, button[aria-label*="Recompile"], .recompile-button');
        if (recompileBtn) {
          await recompileBtn.click();
        }
      } catch {}

      // 7. Chờ PDF biên dịch xong & Tải về
      // 7. Chờ PDF biên dịch xong & Tải về (Intelligent Polling Loop)
      onProgress({
        step: 'DOWNLOADING_PDF',
        progress: 95,
        message: 'Đang đợi Overleaf hoàn tất biên dịch và tạo file PDF...',
      });

      let pdfSavedPath: string | undefined;
      const pdfFileName = `TaiLieu_Yuta_${Date.now()}.pdf`;
      const targetPdfPath = path.join(outputDirectory, pdfFileName);
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

        // Cách 1: Fetch trực tiếp endpoint output.pdf của project
        if (directPdfUrl) {
          try {
            const resp = await overleafPage.request.get(directPdfUrl, { timeout: 4000 });
            if (resp.ok()) {
              const buf = await resp.body();
              if (buf.length > 500 && buf.slice(0, 4).toString() === '%PDF') {
                fs.writeFileSync(targetPdfPath, buf);
                try { fs.writeFileSync(userDownloadsPath, buf); } catch {}
                pdfSavedPath = targetPdfPath;
                break;
              }
            }
          } catch {}
        }

        // Cách 2: Kiểm tra xem giao diện Overleaf đã xuất hiện viewer/download button chưa
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
                fs.writeFileSync(targetPdfPath, buf);
                try { fs.writeFileSync(userDownloadsPath, buf); } catch {}
                pdfSavedPath = targetPdfPath;
                break;
              }
            }
          } catch {}
        }
      }

      // Fallback: Nếu vẫn chưa lấy được qua API, thử click nút download trên UI
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
            const downloadBtn = await overleafPage.$(sel);
            if (downloadBtn) {
              const [download] = await Promise.all([
                overleafPage.waitForEvent('download', { timeout: 10000 }),
                downloadBtn.click(),
              ]);
              await download.saveAs(targetPdfPath);
              try { await download.saveAs(userDownloadsPath); } catch {}
              pdfSavedPath = targetPdfPath;
              break;
            }
          } catch {}
        }
      }


      // 8. Hoàn tất
      onProgress({
        step: 'COMPLETED',
        progress: 100,
        message: pdfSavedPath
          ? `🎉 Hoàn tất 1-Click! File PDF đã được lưu vào ${pdfFileName}`
          : '🎉 Hoàn tất! Mã LaTeX đã được đồng bộ sang Overleaf.',
        latexCode: finalLatex,
        pdfPath: pdfSavedPath || texFilePath,
        pdfUrl: pdfSavedPath ? `/downloads/${pdfFileName}` : undefined,
      });

      return {
        success: true,
        latexCode: finalLatex,
        pdfPath: pdfSavedPath || texFilePath,
        pdfUrl: pdfSavedPath ? `/downloads/${pdfFileName}` : undefined,
      };

    } catch (error: any) {
      const errMsg = error.message || 'Lỗi không xác định trong quá trình tự động hóa.';
      onProgress({
        step: 'ERROR',
        progress: 0,
        message: `Đã xảy ra sự cố: ${errMsg}`,
        error: errMsg,
      });
      return { success: false, error: errMsg };
    }
  }
}
