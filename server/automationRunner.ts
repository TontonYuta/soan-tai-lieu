import { chromium, firefox, BrowserContext, Page } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, ChildProcess } from 'child_process';

export interface AutomationStepUpdate {
  step: 'INIT' | 'CONNECTING_CHROME' | 'OPENING_GEMINI' | 'SENDING_PROMPT' | 'WAITING_GEMINI' | 'EXTRACTING_LATEX' | 'OPENING_OVERLEAF' | 'PASTING_CODE' | 'RECOMPILING' | 'DOWNLOADING_PDF' | 'RENDERING_VIDEO' | 'COMPLETED' | 'ERROR';
  progress: number; // 0 - 100
  message: string;
  latexCode?: string;
  manimCode?: string;
  scriptContent?: string;
  srtContent?: string;
  contentType?: 'latex' | 'manim' | 'script';
  pdfUrl?: string;
  pdfPath?: string;
  videoUrl?: string;
  videoPath?: string;
  filePath?: string;
  error?: string;
  audioUrl?: string;
  audioPath?: string;
  isSeries?: boolean;
  seriesCount?: number;
  currentEpisode?: number;
  playlistVideos?: {
    episode: number;
    title: string;
    videoUrl: string;
    videoPath: string;
    audioUrl?: string;
    audioPath?: string;
  }[];
}

export interface AutomationOptions {
  prompt: string;
  browserType?: 'chrome' | 'firefox' | 'edge';
  aiProvider?: string;
  provider?: string;
  aiUrl?: string;
  geminiUrl?: string;
  overleafUrl?: string;
  chromeProfilePath?: string;
  headless?: boolean;
  cdpPort?: number;
  outputDir?: string;
  attachedPdfPath?: string;
  isSeries?: boolean;
  seriesCount?: number;
  seriesOutline?: string;
  topic?: string;
  subject?: string;
  model?: string;
  modelName?: string;
  enableVoice?: boolean;
  voiceName?: string;
  voiceSpeed?: string;
}



const DEFAULT_STEALTH_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

export class AutomationRunner {
  private context: BrowserContext | null = null;
  private isCancelled: boolean = false;
  private activePage: Page | null = null;
  private childProc: ChildProcess | null = null;

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

  public static cleanStaleChromiumLocks(profileDir: string, force = false): void {
    if (!profileDir || !fs.existsSync(profileDir)) return;
    const lockFiles = ['SingletonLock', 'SingletonSocket', 'SingletonCookie', 'lockfile'];
    const lockSymlink = path.join(profileDir, 'SingletonLock');

    let isStale = force;
    if (!isStale) {
      try {
        const stat = fs.lstatSync(lockSymlink);
        if (stat.isSymbolicLink()) {
          const target = fs.readlinkSync(lockSymlink);
          const match = target.match(/-(\d+)$/);
          if (match) {
            const pid = parseInt(match[1], 10);
            try {
              process.kill(pid, 0);
            } catch (err) {
              isStale = true;
            }
          } else {
            isStale = true;
          }
        }
      } catch {
        // not a symlink or doesn't exist
      }
    }

    if (isStale) {
      for (const f of lockFiles) {
        const p = path.join(profileDir, f);
        try {
          if (fs.existsSync(p) || fs.lstatSync(p).isSymbolicLink()) {
            fs.unlinkSync(p);
          }
        } catch {}
      }
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.childProc) {
      try {
        this.childProc.kill('SIGTERM');
      } catch {}
      this.childProc = null;
    }
    if (this.context) {
      this.context.close().catch(() => {});
      this.context = null;
    }
  }

  public static getVenvPaths(): { venvDir: string; pythonBin: string; pipBin: string; manimBin: string; edgeTtsBin: string } {
    const isWin = process.platform === 'win32';
    const candidates = [
      path.resolve(process.cwd(), '.venv'),
      path.resolve(__dirname, '..', '.venv'),
      path.resolve(__dirname, '..', '..', '.venv'),
      path.resolve('/home/tontonyuta/soan-tai-lieu', '.venv'),
    ];

    let venvDir = candidates[0];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        venvDir = cand;
        break;
      }
    }

    const pythonBin = isWin ? path.join(venvDir, 'Scripts', 'python.exe') : path.join(venvDir, 'bin', 'python3');
    const pipBin = isWin ? path.join(venvDir, 'Scripts', 'pip.exe') : path.join(venvDir, 'bin', 'pip');
    const manimBin = isWin ? path.join(venvDir, 'Scripts', 'manim.exe') : path.join(venvDir, 'bin', 'manim');
    const edgeTtsBin = isWin ? path.join(venvDir, 'Scripts', 'edge-tts.exe') : path.join(venvDir, 'bin', 'edge-tts');
    return { venvDir, pythonBin, pipBin, manimBin, edgeTtsBin };
  }

  public static getManimExecutable(): string | null {
    const { manimBin } = AutomationRunner.getVenvPaths();
    if (fs.existsSync(manimBin)) {
      return manimBin;
    }
    try {
      const whichCmd = process.platform === 'win32' ? 'where manim' : 'which manim';
      const out = require('child_process').execSync(whichCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      const trimmed = out.trim().split(/\r?\n/)[0].trim();
      if (trimmed && fs.existsSync(trimmed)) {
        return trimmed;
      }
    } catch {}
    return null;
  }

  public static async installPythonPackage(
    pkgName: string,
    onProgress?: (msg: string) => void
  ): Promise<boolean> {
    const { pipBin } = AutomationRunner.getVenvPaths();
    const isWin = process.platform === 'win32';
    const targetPip = fs.existsSync(pipBin) ? pipBin : (isWin ? 'pip' : 'pip3');
    if (onProgress) onProgress(`Đang tự động cài đặt gói "${pkgName}" qua pip...`);
    return new Promise((resolve) => {
      const proc = spawn(targetPip, ['install', pkgName]);
      proc.on('close', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });
  }

  public static async ensureManimEnvironment(
    onProgress?: (msg: string) => void
  ): Promise<string | null> {
    const { venvDir, pythonBin, pipBin, manimBin } = AutomationRunner.getVenvPaths();
    if (fs.existsSync(manimBin)) {
      return manimBin;
    }

    try {
      const whichCmd = process.platform === 'win32' ? 'where manim' : 'which manim';
      const out = require('child_process').execSync(whichCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      const trimmed = out.trim().split(/\r?\n/)[0].trim();
      if (trimmed && fs.existsSync(trimmed)) {
        return trimmed;
      }
    } catch {}

    // Chưa có Manim: tự động tạo venv và cài đặt
    if (onProgress) onProgress('Đang tự động tạo môi trường Python và cài đặt Manim CE...');

    if (!fs.existsSync(pythonBin)) {
      const isWin = process.platform === 'win32';
      const sysPython = isWin ? 'python' : 'python3';
      try {
        await new Promise<void>((resolve, reject) => {
          const proc = spawn(sysPython, ['-m', 'venv', venvDir]);
          proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Mã thoát: ${code}`))));
          proc.on('error', (err) => reject(err));
        });
      } catch (e: any) {
        if (onProgress) onProgress(`Lỗi khởi tạo venv: ${e.message}`);
        return null;
      }
    }

    if (fs.existsSync(pipBin)) {
      if (onProgress) onProgress('Đang tải và cài đặt Manim CE + SymPy qua pip (vui lòng đợi 1-2 phút)...');
      try {
        await new Promise<void>((resolve, reject) => {
          const proc = spawn(pipBin, ['install', 'manim', 'sympy']);
          proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Mã thoát: ${code}`))));
          proc.on('error', (err) => reject(err));
        });
      } catch (e: any) {
        if (onProgress) onProgress(`Lỗi cài đặt Manim: ${e.message}`);
        return null;
      }
    }

    if (fs.existsSync(manimBin)) {
      return manimBin;
    }
    return null;
  }

  public static async autoInstallMissingDependencies(
    code: string,
    onProgress?: (msg: string) => void
  ): Promise<void> {
    const { pythonBin } = AutomationRunner.getVenvPaths();
    if (!fs.existsSync(pythonBin)) return;

    const importRegex = /(?:^|\n)\s*(?:import|from)\s+([a-zA-Z0-9_]+)/g;
    const standardModules = new Set([
      'sys', 'os', 'math', 'random', 'time', 're', 'json', 'datetime',
      'collections', 'itertools', 'functools', 'typing', 'abc', 'copy',
      'io', 'pathlib', 'fractions', 'cmath', 'decimal', 'manim', 'numpy',
      'scipy', 'PIL', 'pillow', 'pydub', 'screeninfo', 'srt', 'subprocess'
    ]);

    const matches = Array.from(code.matchAll(importRegex));
    const checked = new Set<string>();

    for (const m of matches) {
      const pkg = m[1];
      if (standardModules.has(pkg) || checked.has(pkg)) continue;
      checked.add(pkg);

      const canImport = await new Promise<boolean>((resolve) => {
        const proc = spawn(pythonBin, ['-c', `import ${pkg}`]);
        proc.on('close', (code) => resolve(code === 0));
        proc.on('error', () => resolve(false));
      });

      if (!canImport) {
        if (onProgress) onProgress(`Phát hiện code cần thư viện "${pkg}", đang tự động cài đặt...`);
        await AutomationRunner.installPythonPackage(pkg, onProgress);
      }
    }
  }

  public static async ensureFreshChatSession(
    page: Page,
    targetAiUrl: string,
    aiName: string,
    onProgress?: (update: AutomationStepUpdate) => void
  ): Promise<void> {
    if (!page || page.isClosed()) return;
    try {
      const curUrl = page.url();
      const isGemini = curUrl.includes('gemini.google.com') || targetAiUrl.includes('gemini.google.com');
      const isChatGPT = curUrl.includes('chatgpt.com') || targetAiUrl.includes('chatgpt.com') || curUrl.includes('openai.com');
      const isClaude = curUrl.includes('claude.ai') || targetAiUrl.includes('claude.ai');
      const isDeepSeek = curUrl.includes('deepseek.com') || targetAiUrl.includes('deepseek.com');
      const isGrok = curUrl.includes('grok.com') || targetAiUrl.includes('grok.com');

      let baseFreshUrl = targetAiUrl;
      let isOldSession = false;

      if (isGemini) {
        baseFreshUrl = 'https://gemini.google.com/app';
        try {
          const u = new URL(curUrl);
          if (u.pathname.startsWith('/app/') && u.pathname.length > 5) {
            isOldSession = true;
          }
        } catch {}
      } else if (isChatGPT) {
        baseFreshUrl = 'https://chatgpt.com/';
        if (curUrl.includes('/c/')) {
          isOldSession = true;
        }
      } else if (isClaude) {
        baseFreshUrl = 'https://claude.ai/new';
        if (curUrl.includes('/chat/')) {
          isOldSession = true;
        }
      } else if (isDeepSeek) {
        baseFreshUrl = 'https://chat.deepseek.com/';
        if (curUrl.includes('/a/chat/s/')) {
          isOldSession = true;
        }
      } else if (isGrok) {
        baseFreshUrl = 'https://grok.com/';
        if (curUrl.includes('/c/')) {
          isOldSession = true;
        }
      }

      // Kiểm tra xem trên trang hiện tại đã có tin nhắn nào chưa
      const messageCount = await page.evaluate(() => {
        const msgs = document.querySelectorAll(
          'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], div[data-message-author-role="user"], .font-claude-message, .ds-markdown, user-query-container'
        );
        return msgs.length;
      }).catch(() => 0);

      if (messageCount > 0 || isOldSession) {
        if (onProgress) {
          onProgress({
            step: 'OPENING_GEMINI',
            progress: 29,
            message: `Đang làm mới phiên chat ${aiName} (tạo New Chat sạch 100% ngữ cảnh)...`,
          });
        }

        // 1. Thử click nút New Chat trên giao diện
        let clickedNewChat = false;
        const newChatSelectors = [
          'button[aria-label*="Cuộc trò chuyện mới" i]',
          'button[aria-label*="New chat" i]',
          'a[aria-label*="Cuộc trò chuyện mới" i]',
          'a[aria-label*="New chat" i]',
          'a[data-testid="create-new-chat-button"]',
          'button[data-testid="create-new-chat-button"]',
          'button[aria-label*="Đoạn chat mới" i]',
          '[data-test-id="new-chat-button"]',
          'a[href="/app"]',
          'button:has-text("Cuộc trò chuyện mới")',
          'button:has-text("New chat")',
        ];

        for (const sel of newChatSelectors) {
          try {
            const btn = await page.$(sel);
            if (btn && (await btn.isVisible().catch(() => false))) {
              await btn.click();
              clickedNewChat = true;
              await page.waitForTimeout(1000);
              break;
            }
          } catch {}
        }

        // 2. Nếu nút click chưa làm sạch hoặc URL vẫn là chat cũ, navigate trực tiếp về baseFreshUrl
        const remainingMsgs = await page.evaluate(() => {
          return document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown'
          ).length;
        }).catch(() => 0);

        let stillOldUrl = false;
        try {
          const u = new URL(page.url());
          if (isGemini && u.pathname.startsWith('/app/') && u.pathname.length > 5) stillOldUrl = true;
          if (isChatGPT && u.pathname.startsWith('/c/')) stillOldUrl = true;
          if (isClaude && u.pathname.startsWith('/chat/')) stillOldUrl = true;
          if (isDeepSeek && u.pathname.includes('/a/chat/s/')) stillOldUrl = true;
          if (isGrok && u.pathname.startsWith('/c/')) stillOldUrl = true;
        } catch {}

        if (!clickedNewChat || remainingMsgs > 0 || stillOldUrl) {
          const currentClean = page.url().split('?')[0].replace(/\/$/, '');
          const targetClean = baseFreshUrl.replace(/\/$/, '');
          if (currentClean === targetClean) {
            await page.reload({ waitUntil: 'domcontentloaded', timeout: 35000 });
          } else {
            await page.goto(baseFreshUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
          }
          await page.waitForTimeout(1500);
        }

        const finalCheckMsgs = await page.evaluate(() => {
          return document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], div[data-message-author-role="user"], .font-claude-message, .ds-markdown'
          ).length;
        }).catch(() => 0);

        if (finalCheckMsgs > 0) {
          await page.reload({ waitUntil: 'domcontentloaded', timeout: 35000 });
          await page.waitForTimeout(1500);
        }
      }
    } catch (freshErr: any) {
      console.warn('ensureFreshChatSession warning:', freshErr.message);
    }
  }

  public static prepareManimPythonCode(code: string): string {
    let processed = (code || '').trim();
    processed = processed.replace(/^```(?:python|py)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Loại bỏ các thẻ code block thừa bị chèn bên trong
    if (processed.includes('```')) {
      processed = processed.replace(/```(?:python|py)?/gi, '').replace(/```/g, '').trim();
    }

    // Loại bỏ các dòng dang dở do bị cắt cụt token ở cuối file
    const lines = processed.split(/\r?\n/);
    while (lines.length > 0) {
      const lastLine = lines[lines.length - 1].trim();
      if (
        !lastLine ||
        lastLine.endsWith('(') ||
        lastLine.endsWith('FadeIn(') ||
        lastLine.endsWith('Write(') ||
        lastLine.endsWith('Create(') ||
        lastLine.endsWith('Text(') ||
        lastLine.endsWith('MathTex(') ||
        lastLine.endsWith(',') ||
        lastLine.endsWith('+') ||
        lastLine.endsWith('-') ||
        lastLine.endsWith('*') ||
        lastLine.endsWith('/') ||
        lastLine.endsWith('=') ||
        lastLine.endsWith('\\') ||
        lastLine.startsWith('self.play(FadeIn(')
      ) {
        lines.pop();
      } else {
        break;
      }
    }
    processed = lines.join('\n');

    // Đóng triple-quote nếu bị mở dở dang
    const tripleDoubleQuotes = (processed.match(/"""/g) || []).length;
    if (tripleDoubleQuotes % 2 !== 0) {
      processed += '\n"""';
    }
    const tripleSingleQuotes = (processed.match(/'''/g) || []).length;
    if (tripleSingleQuotes % 2 !== 0) {
      processed += "\n'''";
    }

    // Loại bỏ các lệnh FadeOut toàn bộ màn hình ở cuối video gây màn hình đen trống rỗng
    processed = processed.replace(
      /self\.play\(\s*FadeOut\(\s*(?:Group\(\*self\.mobjects\)|self\.mobjects|\*self\.mobjects|Group\(\))\s*\)[^)]*\)\s*(?:self\.wait\([^)]*\)\s*)?/g,
      '# Outro card held on screen\n'
    );

    const polyfillSnippet = `
# ==========================================
# YUTA MANIM ENGINE - COMPATIBILITY POLYFILLS
# ==========================================
try:
    # 1. Hỗ trợ tiếng Việt Unicode & Font Toán học Palatino chuẩn cho LaTeX
    config.tex_template.add_to_preamble(r"""
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb}
\\usepackage{mathpazo}
""")
except Exception:
    pass

try:
    # 1.1 Tự động hấp thụ mọi tham số không mong muốn truyền vào Mobject (MathTex, Tex, Dot, Line, v.v.)
    _orig_mobject_init = Mobject.__init__
    def _smart_mobject_init(self, color=WHITE, name=None, dim=3, target=None, z_index=0, *args, **kwargs):
        _orig_mobject_init(self, color=color, name=name, dim=dim, target=target, z_index=z_index)
    Mobject.__init__ = _smart_mobject_init
except Exception:
    pass

try:
    # 1.2 Tự động chuẩn hóa font Be Vietnam Pro / Inter đẹp mắt cho toàn bộ Text
    _orig_text_init = Text.__init__
    def _smart_text_init(self, text, *args, **kwargs):
        f = kwargs.get('font', None)
        if not f or f in ('sans-serif', 'sans', 'default', ''):
            kwargs['font'] = 'Be Vietnam Pro'
        if 'weight' not in kwargs:
            kwargs['weight'] = 'BOLD'
        try:
            _orig_text_init(self, text, *args, **kwargs)
        except Exception:
            kwargs['font'] = 'Inter'
            try:
                _orig_text_init(self, text, *args, **kwargs)
            except Exception:
                kwargs['font'] = 'sans-serif'
                _orig_text_init(self, text, *args, **kwargs)
    Text.__init__ = _smart_text_init
except Exception:
    pass

try:
    # 2. Tự động chuyển VGroup chứa Animation thành AnimationGroup
    from manim.animation.animation import Animation
    from manim.animation.composition import AnimationGroup
    def _vgroup_smart_new(cls, *vmobjects, **kwargs):
        if vmobjects and any(isinstance(x, Animation) for x in vmobjects):
            return AnimationGroup(*vmobjects, **kwargs)
        return super(VGroup, cls).__new__(cls)
    VGroup.__new__ = _vgroup_smart_new
except Exception:
    pass

try:
    # 3. Tương thích các hàm Axes (get_graph_label, get_riemann_rects, get_secant_line, get_tangent_line)
    if not hasattr(Axes, 'get_riemann_rects'):
        Axes.get_riemann_rects = Axes.get_riemann_rectangles

    _orig_get_graph_label = Axes.get_graph_label
    def _smart_get_graph_label(self, graph, label='f(x)', x_val=None, direction=RIGHT, buff=0.25, color=None, dot=False, dot_config=None, *args, **kwargs):
        if isinstance(direction, str):
            dir_map = {'UP': UP, 'DOWN': DOWN, 'LEFT': LEFT, 'RIGHT': RIGHT, 'UR': UR, 'UL': UL, 'DR': DR, 'DL': DL}
            direction = dir_map.get(direction.upper(), RIGHT)
        return _orig_get_graph_label(self, graph, label=label, x_val=x_val, direction=direction, buff=buff, color=color, dot=dot, dot_config=dot_config)
    Axes.get_graph_label = _smart_get_graph_label

    if not hasattr(Axes, 'get_secant_line'):
        def _get_secant_line(self, x, *args, **kwargs):
            gr = None
            for a in args:
                if hasattr(a, 'underlying_function') or hasattr(a, 'plot'):
                    gr = a
                    break
            if gr is None and 'graph' in kwargs:
                gr = kwargs['graph']
            x0 = float(x)
            slope = self.slope_of_tangent(x0, gr) if gr else 1.0
            y0 = gr.underlying_function(x0) if gr else x0
            span = kwargs.get('length', 4) / 2
            p1 = self.c2p(x0 - span, y0 - slope * span)
            p2 = self.c2p(x0 + span, y0 + slope * span)
            color = kwargs.get('color', RED_B)
            stroke_width = kwargs.get('stroke_width', 4)
            return Line(p1, p2, color=color, stroke_width=stroke_width)
        Axes.get_secant_line = _get_secant_line
        Axes.get_tangent_line = _get_secant_line
except Exception:
    pass

try:
    # 4. Helper chống đè chữ cho Text & MathTex
    def add_backdrop(mobj, color="#0F172A", opacity=0.9, buff=0.1):
        try:
            mobj.add_background_rectangle(color=color, opacity=opacity, buff=buff)
        except Exception:
            pass
        return mobj

    # 5. Visual Engineering Helpers (Auto-fit, Responsive Stacks)
    def fit_width(obj, max_width):
        if hasattr(obj, 'width') and obj.width > max_width:
            obj.scale_to_fit_width(max_width)
        return obj

    def fit_height(obj, max_height):
        if hasattr(obj, 'height') and obj.height > max_height:
            obj.scale_to_fit_height(max_height)
        return obj

    def fit_group(obj, max_width=11.5, max_height=6.0):
        fit_width(obj, max_width)
        fit_height(obj, max_height)
        return obj

    def vertical_stack(*objects, buff=0.35, aligned_edge=ORIGIN):
        group = VGroup(*objects)
        group.arrange(DOWN, buff=buff, aligned_edge=aligned_edge)
        return group

    def horizontal_stack(*objects, buff=0.4):
        group = VGroup(*objects)
        group.arrange(RIGHT, buff=buff)
        return group
except Exception:
    pass
# ==========================================
`;

    if (processed.includes('from manim import') && !processed.includes('YUTA MANIM ENGINE')) {
      processed = processed.replace(/from\s+manim\s+import\s+\*/, `from manim import *\n${polyfillSnippet.trim()}`);
    }
    return processed;
  }

  public static parseManimError(stderr = '', stdout = '', workingDir = ''): { summary: string; detailsForAI: string } {
    const raw = (stderr + '\n' + stdout).replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '');
    const lines = raw.split(/\r?\n/);

    // 1. Tìm thông tin Exception ở phần cuối
    let exceptionType = '';
    let exceptionMessage = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line || /^╰[─-]+╯?$/.test(line) || line.startsWith('╭') || line.startsWith('│')) continue;
      const match = line.match(/^([A-Z][a-zA-Z0-9_]*(?:Error|Exception))(?::\s*(.*))?$/);
      if (match) {
        exceptionType = match[1];
        exceptionMessage = (match[2] || '').trim();
        for (let k = i + 1; k < Math.min(lines.length, i + 3); k++) {
          const nextLine = lines[k].trim();
          if (nextLine && !nextLine.startsWith('╭') && !nextLine.startsWith('╰') && !nextLine.startsWith('File ') && !nextLine.startsWith('Traceback')) {
            exceptionMessage += ' ' + nextLine;
          }
        }
        break;
      }
    }

    // 2. Tìm dòng lỗi trong file scene.py của người dùng
    let sceneLine: string | null = null;
    let codeSnippet = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const fileMatch = line.match(/scene\.py[:",\s]+(?:line\s*)?(\d+)/i);
      if (fileMatch) {
        sceneLine = fileMatch[1];
        for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
          const cLine = lines[j];
          if (cLine.includes('❱')) {
            codeSnippet = cLine.replace(/^[│\s]*❱\s*\d+\s*[│\s]*/, '').replace(/[│\s]+$/, '').trim();
            break;
          } else if (/^\s{4,}/.test(cLine) && !cLine.includes('File ') && !cLine.includes('Traceback')) {
            codeSnippet = cLine.replace(/[│\s]+$/, '').trim();
            break;
          }
        }
        break;
      }
    }

    // 3. Kiểm tra chi tiết log LaTeX nếu có
    let latexDetails = '';
    const logMatch = raw.match(/(media\/Tex\/[a-zA-Z0-9_-]+\.log)/i);
    if (logMatch && workingDir) {
      try {
        const logPath = path.resolve(workingDir, logMatch[1]);
        if (fs.existsSync(logPath)) {
          const logContent = fs.readFileSync(logPath, 'utf-8');
          const errLines = logContent.split(/\r?\n/)
            .filter(l => l.startsWith('!') || l.includes('Error') || /^l\.\d+/.test(l))
            .map(l => l.trim());
          if (errLines.length > 0) {
            latexDetails = errLines.slice(-6).join('\n');
          }
        }
      } catch (e) {}
    }

    // 4. Tạo tóm tắt ngắn cho UI người dùng
    let summary = '';
    if (exceptionType) {
      summary = `${exceptionType}: ${exceptionMessage}`.trim();
      if (sceneLine) {
        summary += ` (dòng ${sceneLine}${codeSnippet ? `: ${codeSnippet.slice(0, 45)}` : ''})`;
      }
    } else {
      const meaningfulLines = lines
        .map(l => l.replace(/^[│\s]*[0-9]*[│\s]*/, '').replace(/[│\s]+$/, '').trim())
        .filter(t => t && !/^[-─═│╭╮╰╯]+$/.test(t) && !t.startsWith('Animation ') && !t.startsWith('[09/') && !t.startsWith('# process keyword'));
      summary = meaningfulLines.slice(-3).join(' | ') || 'Lỗi render không xác định';
    }

    // 5. Tạo hướng dẫn chẩn đoán lỗi cho AI
    let diagnosis = '';
    if (exceptionType === 'TypeError' && /unexpected keyword argument/i.test(exceptionMessage)) {
      const kwMatch = exceptionMessage.match(/['"]([a-zA-Z0-9_]+)['"]/);
      const kw = kwMatch ? kwMatch[1] : '';
      diagnosis = `Lỗi truyền thừa/sai tham số '${kw}' cho đối tượng Manim (ví dụ MathTex không nhận 'font' hay 'weight', chỉ Text mới có). Hãy XÓA bỏ tham số '${kw}' này!`;
    } else if (/latex/i.test(exceptionType) || /latex/i.test(exceptionMessage) || latexDetails) {
      diagnosis = `Lỗi biên dịch LaTeX trong MathTex/Tex.
Hãy kiểm tra:
- KHÔNG gõ tiếng Việt có dấu trực tiếp trong MathTex (tiếng Việt phải viết bằng Text("...", font="Be Vietnam Pro")).
- Đảm bảo đầy đủ cặp ngoặc nhọn {} trong \\frac{}{}, \\sqrt{}.
- Nếu dùng \\begin{aligned} ... \\end{aligned}, mỗi dòng phân tách bằng \\\\ và không để dòng trống.`;
    } else if (exceptionType === 'NameError') {
      diagnosis = `Lỗi gọi hàm hoặc biến chưa được định nghĩa trong Manim CE.`;
    } else if (exceptionType === 'SyntaxError') {
      diagnosis = `Lỗi cú pháp Python (đóng thiếu ngoặc đơn/kép/nhọn hoặc thụt lề sai).`;
    }

    const detailsForAI = [
      `LỖI KHI BIÊN DỊCH BẰNG MANIM CE:`,
      `- Loại lỗi: ${exceptionType ? `${exceptionType}: ${exceptionMessage}` : summary}`,
      sceneLine ? `- Vị trí: Dòng ${sceneLine} trong scene.py` : '',
      codeSnippet ? `- Dòng mã gây lỗi: \`${codeSnippet}\`` : '',
      latexDetails ? `- Chi tiết log LaTeX:\n${latexDetails}` : '',
      diagnosis ? `\nCHỈ DẪN KHẮC PHỤC:\n${diagnosis}` : '',
    ].filter(Boolean).join('\n');

    return { summary: summary.slice(0, 150), detailsForAI };
  }

  public static sanitizeLatexVietnamese(pythonCode: string): string {
    let cleaned = pythonCode.replace(/(\\text\{[^{}]*\})/g, (match) => {
      return match.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    });
    cleaned = cleaned.replace(/((?:MathTex|Tex)\(\s*(?:r?["'].*?["']\s*,?\s*)+)/g, (match) => {
      return match.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    });
    return cleaned;
  }

  public static findNewestMp4(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;
    let newestFile: { path: string; mtime: number } | null = null;

    const scan = (currentDir: string) => {
      if (path.basename(currentDir) === 'partial_movie_files') return;
      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.mp4')) {
          try {
            const stat = fs.statSync(fullPath);
            if (!newestFile || stat.mtimeMs > newestFile.mtime) {
              newestFile = { path: fullPath, mtime: stat.mtimeMs };
            }
          } catch {}
        }
      }
    };

    scan(dir);
    return newestFile ? newestFile.path : null;
  }

  public static getMediaDuration(filePath: string): number | null {
    if (!filePath || !fs.existsSync(filePath)) return null;
    try {
      const { execSync } = require('child_process');
      const out = execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();
      const d = parseFloat(out);
      return isNaN(d) ? null : d;
    } catch {
      return null;
    }
  }

  public static extractNarrationText(pythonCode: string, fallbackTopic = ''): string {
    let narration = '';

    // 1. Kiểm tra biến VOICEOVER_SCRIPT
    const scriptMatch = pythonCode.match(/VOICEOVER_SCRIPT\s*=\s*(?:"""([\s\S]*?)"""|'''([\s\S]*?)'''|"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')/);
    if (scriptMatch) {
      narration = (scriptMatch[1] || scriptMatch[2] || scriptMatch[3] || scriptMatch[4] || '').trim();
    }

    // 2. Kiểm tra comment có từ khóa [VOICE], [CẢNH ... VOICE], Lời thoại, Lời bình, Thuyết minh
    if (!narration) {
      const commentMatches = Array.from(pythonCode.matchAll(/#\s*(?:\[(?:CẢNH|SCENE|\d+)[^\]]*?VOICE[^\]]*?\]|\[VOICE(?:OVER)?(?:_\d+)?\]|Lời thoại|Thuyết minh|Voiceover|Lời bình)\s*:\s*(.+)/gi));
      if (commentMatches.length > 0) {
        narration = commentMatches.map(m => m[1].trim().replace(/^["']|["']$/g, '')).join('. ');
      }
    }

    // 3. Bóc tách chuỗi chữ trong Text() hoặc Paragraph()
    if (!narration) {
      const textMatches = Array.from(pythonCode.matchAll(/(?:Text|Paragraph)\(\s*r?f?["']([^"']{6,})["']/g));
      if (textMatches.length > 0) {
        narration = textMatches.map(m => m[1].trim()).join('. ');
      }
    }

    // 4. Fallback mặc định nếu chưa có
    if (!narration || narration.length < 5) {
      narration = fallbackTopic 
        ? `Chào mừng các bạn đến với video bài giảng về ${fallbackTopic}. Hãy cùng quan sát các diễn biến và nội dung kiến thức trực quan trên màn hình.`
        : 'Chào mừng các bạn đến với video trực quan bài giảng. Hãy cùng quan sát các diễn biến và nội dung kiến thức trực quan trên màn hình.';
    }

    // Chuẩn hóa và làm sạch văn bản cho giọng đọc tự nhiên
    narration = narration
      .replace(/\\n/g, ' ')
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/[\$\{\}\[\]\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return narration;
  }

  public static async generateVoiceoverAndMux(params: {
    mp4Path: string;
    pythonCode: string;
    workingDir: string;
    voiceName?: string;
    voiceSpeed?: string;
    fallbackTopic?: string;
    onStatus?: (msg: string) => void;
  }): Promise<{ success: boolean; mp4Path: string; audioPath: string | null; narration?: string }> {
    const { mp4Path, pythonCode, workingDir, voiceName = 'vi-VN-HoaiMyNeural', voiceSpeed = '+0%', fallbackTopic = '', onStatus } = params;
    if (!mp4Path || !fs.existsSync(mp4Path)) {
      return { success: false, mp4Path, audioPath: null };
    }

    const narration = AutomationRunner.extractNarrationText(pythonCode, fallbackTopic);
    if (!narration) {
      return { success: false, mp4Path, audioPath: null };
    }

    const { venvDir, pythonBin, edgeTtsBin } = AutomationRunner.getVenvPaths();
    const isWin = process.platform === 'win32';

    // 1. Tìm hoặc tự cài edge-tts nếu thiếu
    let resolvedTtsBin: string | null = fs.existsSync(edgeTtsBin) ? edgeTtsBin : null;
    if (!resolvedTtsBin) {
      try {
        const whichCmd = isWin ? 'where edge-tts' : 'which edge-tts';
        const out = require('child_process').execSync(whichCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        const first = out.split(/\r?\n/)[0].trim();
        if (first && fs.existsSync(first)) resolvedTtsBin = first;
      } catch {}
    }

    if (!resolvedTtsBin) {
      if (onStatus) onStatus('Đang tự động chuẩn bị công cụ giọng đọc AI (edge-tts)...');
      const installed = await AutomationRunner.installPythonPackage('edge-tts', onStatus);
      if (installed && fs.existsSync(edgeTtsBin)) {
        resolvedTtsBin = edgeTtsBin;
      }
    }

    // 2. Tạo file âm thanh .mp3 từ văn bản với cơ chế thử lại (Retry Loop)
    const tempTextFile = path.join(workingDir, `narration_${Date.now()}.txt`);
    fs.writeFileSync(tempTextFile, narration, 'utf-8');

    const mp3FileName = `voiceover_${Date.now()}.mp3`;
    const mp3Path = path.join(workingDir, mp3FileName);

    const voiceLabel = (voiceName && voiceName.includes('NamMinh')) ? 'Nam Minh (Nam ấm áp)' : 'Hoài My (Nữ truyền cảm)';
    if (onStatus) onStatus(`🎙️ Đang tổng hợp thuyết minh giọng đọc AI [${voiceLabel}]...`);

    // Python TTS worker với Retry 3 lần và Fallback an toàn
    const pyTtsCode = `
import asyncio, sys, os
import edge_tts

text_file = sys.argv[1]
voice = sys.argv[2]
rate = sys.argv[3]
out_file = sys.argv[4]

with open(text_file, 'r', encoding='utf-8') as f:
    text = f.read().strip()

async def synthesize():
    last_err = None
    kwargs = {}
    if rate and rate != '+0%' and rate != '0%':
        kwargs['rate'] = rate

    for attempt in range(1, 4):
        try:
            comm = edge_tts.Communicate(text, voice, **kwargs)
            await comm.save(out_file)
            if os.path.exists(out_file) and os.path.getsize(out_file) > 100:
                sys.exit(0)
        except Exception as e:
            last_err = e
            await asyncio.sleep(1.0)

    # Thử lại với giọng mặc định nếu giọng chọn gặp lỗi
    if voice != 'vi-VN-HoaiMyNeural':
        try:
            comm = edge_tts.Communicate(text, 'vi-VN-HoaiMyNeural')
            await comm.save(out_file)
            if os.path.exists(out_file) and os.path.getsize(out_file) > 100:
                sys.exit(0)
        except Exception as e:
            last_err = e

    if last_err:
        print(f"TTS Error: {last_err}", file=sys.stderr)
        if os.path.exists(out_file) and os.path.getsize(out_file) == 0:
            try: os.unlink(out_file)
            except: pass
        sys.exit(1)

asyncio.run(synthesize())
`;

    const { spawn } = require('child_process');
    let ttsStderr = '';
    const ttsSuccess = await new Promise<boolean>((resolve) => {
      let targetPython = fs.existsSync(pythonBin) ? pythonBin : (isWin ? 'python' : 'python3');
      try {
        const proc = spawn(targetPython, ['-c', pyTtsCode, tempTextFile, voiceName || 'vi-VN-HoaiMyNeural', voiceSpeed || '+0%', mp3Path], {
          cwd: workingDir
        });
        proc.stderr?.on('data', d => { ttsStderr += d.toString(); });
        proc.on('close', (code) => {
          const valid = code === 0 && fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 100;
          resolve(valid);
        });
        proc.on('error', (err) => {
          ttsStderr += err.message;
          resolve(false);
        });
      } catch (e: any) {
        ttsStderr += e.message;
        resolve(false);
      }
    });

    try { fs.unlinkSync(tempTextFile); } catch {}

    if (!ttsSuccess || !fs.existsSync(mp3Path) || fs.statSync(mp3Path).size === 0) {
      try {
        if (fs.existsSync(mp3Path) && fs.statSync(mp3Path).size === 0) fs.unlinkSync(mp3Path);
      } catch {}
      if (onStatus) onStatus(`Không thể tổng hợp giọng đọc AI (${ttsStderr.slice(0, 80) || 'Lỗi kết nối'}), sử dụng video gốc.`);
      return { success: false, mp4Path, audioPath: null };
    }

    // 3. Tìm ffmpeg để ghép video và audio
    let ffmpegBin = 'ffmpeg';
    const ffmpegCandidates = [
      '/usr/bin/ffmpeg',
      '/usr/local/bin/ffmpeg',
      isWin ? 'ffmpeg.exe' : 'ffmpeg'
    ];
    for (const fc of ffmpegCandidates) {
      if (fs.existsSync(fc)) {
        ffmpegBin = fc;
        break;
      }
    }

    if (onStatus) onStatus('🎬 Đang lồng tiếng và đồng bộ âm thanh vào video MP4 (FFmpeg remux)...');

    const muxedMp4FileName = `video_voice_${Date.now()}.mp4`;
    const muxedMp4Path = path.join(workingDir, muxedMp4FileName);

    const videoDur = AutomationRunner.getMediaDuration(mp4Path);
    const audioDur = AutomationRunner.getMediaDuration(mp3Path);

    let ffmpegArgs: string[] = ['-y'];

    if (videoDur && audioDur) {
      if (audioDur > videoDur) {
        // Audio dài hơn video: Kéo dài khung hình cuối cùng (thẻ Outro) bằng tpad để không bị khoảng đen trống
        const extendSec = Math.max(0.5, (audioDur - videoDur) + 0.8);
        ffmpegArgs.push(
          '-i', mp4Path,
          '-i', mp3Path,
          '-filter_complex', `[0:v]tpad=stop_mode=clone:stop_duration=${extendSec.toFixed(2)}[v]`,
          '-map', '[v]',
          '-map', '1:a:0',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '18',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-shortest',
          muxedMp4Path
        );
      } else if (videoDur > audioDur + 2.0) {
        // Video dài hơn audio nhiều: Cắt video kết thúc đẹp đẽ sau khi lời đọc kết thúc ~1.2 giây
        const targetDuration = (audioDur + 1.2).toFixed(2);
        ffmpegArgs.push(
          '-ss', '0',
          '-t', targetDuration,
          '-i', mp4Path,
          '-i', mp3Path,
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          muxedMp4Path
        );
      } else {
        ffmpegArgs.push(
          '-i', mp4Path,
          '-i', mp3Path,
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-shortest',
          muxedMp4Path
        );
      }
    } else {
      ffmpegArgs.push(
        '-i', mp4Path,
        '-i', mp3Path,
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        muxedMp4Path
      );
    }

    const muxSuccess = await new Promise<boolean>((resolve) => {
      try {
        const proc = spawn(ffmpegBin, ffmpegArgs);
        proc.on('close', (code) => {
          resolve(code === 0 && fs.existsSync(muxedMp4Path) && fs.statSync(muxedMp4Path).size > 0);
        });
        proc.on('error', () => resolve(false));
      } catch {
        resolve(false);
      }
    });

    if (muxSuccess) {
      return {
        success: true,
        mp4Path: muxedMp4Path,
        audioPath: mp3Path,
        narration
      };
    } else {
      return {
        success: false,
        mp4Path: mp4Path,
        audioPath: mp3Path,
        narration
      };
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
        AutomationRunner.cleanStaleChromiumLocks(userDataDir, false);

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
          console.warn('Profile Chrome đang bị khóa hoặc lỗi khởi động, thử xóa lock và khởi động lại:', err.message);
          AutomationRunner.cleanStaleChromiumLocks(userDataDir, true);
          try {
            browserContext = await chromium.launchPersistentContext(userDataDir, {
              executablePath: chromeExecutable,
              headless: isHeadless,
              channel: browserType === 'edge' ? 'msedge' : 'chrome',
              viewport: viewportSetting,
              userAgent: DEFAULT_STEALTH_USER_AGENT,
              args: stealthArgs,
              ignoreDefaultArgs: ['--enable-automation'],
            });
          } catch (errRetry: any) {
            console.warn('Profile Chrome vẫn bị khóa, chuyển sang session tạm:', errRetry.message);
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
      const providerKey = (options.aiProvider || options.provider || (options.model && options.model.startsWith('chatgpt') ? 'chatgpt' : '')).toLowerCase();
      let targetAiUrl = options.aiUrl || '';

      if (providerKey === 'chatgpt') {
        if (!targetAiUrl || (!targetAiUrl.includes('chatgpt.com') && !targetAiUrl.includes('openai.com'))) {
          targetAiUrl = 'https://chatgpt.com';
        }
      } else if (providerKey === 'claude') {
        if (!targetAiUrl || !targetAiUrl.includes('claude.ai')) {
          targetAiUrl = 'https://claude.ai/new';
        }
      } else if (providerKey === 'deepseek') {
        if (!targetAiUrl || !targetAiUrl.includes('deepseek.com')) {
          targetAiUrl = 'https://chat.deepseek.com';
        }
      } else if (providerKey === 'grok') {
        if (!targetAiUrl || (!targetAiUrl.includes('grok.com') && !targetAiUrl.includes('x.com'))) {
          targetAiUrl = 'https://grok.com';
        }
      } else if (providerKey === 'gemini') {
        if (!targetAiUrl || !targetAiUrl.includes('gemini.google.com')) {
          targetAiUrl = 'https://gemini.google.com/app';
        }
      } else if (!targetAiUrl) {
        targetAiUrl = options.geminiUrl || 'https://gemini.google.com/app';
      }

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
        const curUrl = aiPage.url();
        const shouldNavigate = !curUrl.includes(targetHost) ||
          (targetAiUrl.includes('?') && !curUrl.includes(targetAiUrl.split('?')[1]));
        if (shouldNavigate) {
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

      // Đảm bảo bắt đầu phiên chat mới hoàn toàn sạch sẽ (100% không bị dính context chat cũ)
      await AutomationRunner.ensureFreshChatSession(aiPage, targetAiUrl, aiName, onProgress);

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

      // Tự động bật chế độ DeepThink R1 nếu dùng DeepSeek
      if (targetAiUrl.includes('deepseek.com') && (options.model === 'deepseek-r1' || options.modelName?.includes('R1'))) {
        try {
          const deepThinkBtn = await aiPage.$('button:has-text("DeepThink"), div[role="button"]:has-text("DeepThink"), .ds-switch-button:has-text("DeepThink")');
          if (deepThinkBtn) {
            const btnClass = (await deepThinkBtn.getAttribute('class')) || '';
            const ariaChecked = await deepThinkBtn.getAttribute('aria-checked');
            if (!btnClass.includes('active') && !btnClass.includes('selected') && ariaChecked !== 'true') {
              await deepThinkBtn.click();
              await aiPage.waitForTimeout(500);
            }
          }
        } catch (e: any) {
          console.log('DeepThink toggle check:', e.message);
        }
      }

      // Tự động kiểm tra và chuyển đổi chế độ Think / Reason trên ChatGPT (OpenAI)
      if (targetAiUrl.includes('chatgpt.com') || targetAiUrl.includes('openai.com')) {
        const modelKey = (options.model || '').toLowerCase();
        const modelNameLower = (options.modelName || '').toLowerCase();
        const wantThink = !modelKey.includes('no-think') && 
                          !modelKey.includes('tắt') && 
                          !modelNameLower.includes('tắt') && 
                          !modelNameLower.includes('không think');

        onProgress({
          step: 'SENDING_PROMPT',
          progress: 32,
          message: `Đang kiểm tra và thiết lập chế độ Think [${wantThink ? 'Bật suy nghĩ sâu' : 'Tắt Think - Tiêu chuẩn'}] trên ChatGPT...`,
        });

        try {
          let thinkToggled = false;
          for (let attempt = 0; attempt < 6; attempt++) {
            const evalRes = await aiPage.evaluate(async ({ wantThink }) => {
              function isVisible(el: Element) {
                if (!el) return false;
                const r = el.getBoundingClientRect();
                const s = window.getComputedStyle(el);
                return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
              }

              const buttons = Array.from(document.querySelectorAll('button, [role="button"], [role="switch"]')).filter(isVisible);

              const thinkBtn = buttons.find(b => {
                const testId = (b.getAttribute('data-testid') || '').toLowerCase();
                const aria = (b.getAttribute('aria-label') || '').toLowerCase();
                const text = (b.textContent || '').trim().toLowerCase();
                const title = (b.getAttribute('title') || '').toLowerCase();

                if (testId.includes('think') || testId.includes('reason')) return true;
                if (aria.includes('think') || aria.includes('reason') || aria.includes('suy nghĩ') || aria.includes('lý luận')) return true;
                if (text === 'think' || text === 'reason' || text === 'suy nghĩ' || text.startsWith('think ') || text.startsWith('reason ') || text.startsWith('suy nghĩ ')) return true;
                return false;
              });

              if (!thinkBtn) return { status: 'not_found' };

              const ariaPressed = thinkBtn.getAttribute('aria-pressed');
              const ariaChecked = thinkBtn.getAttribute('aria-checked');
              const dataState = thinkBtn.getAttribute('data-state');
              const className = (thinkBtn.getAttribute('class') || '').toLowerCase();

              const isCurrentlyActive = ariaPressed === 'true' || 
                ariaChecked === 'true' || 
                dataState === 'active' || 
                dataState === 'on' || 
                className.includes('active') || 
                className.includes('selected') ||
                className.includes('bg-token-main-surface-secondary') ||
                className.includes('bg-gray-900') ||
                className.includes('bg-black');

              if (wantThink && isCurrentlyActive) {
                return { status: 'already_ok', active: true, label: thinkBtn.textContent?.trim() };
              }
              if (!wantThink && !isCurrentlyActive) {
                return { status: 'already_ok', active: false, label: thinkBtn.textContent?.trim() };
              }

              (thinkBtn as HTMLElement).click();
              await new Promise(r => setTimeout(r, 400));

              const popoverItems = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], [data-radix-collection-item]')).filter(isVisible);
              if (popoverItems.length > 0) {
                if (wantThink) {
                  const item = popoverItems.find(m => {
                    const t = (m.textContent || '').toLowerCase();
                    return t.includes('think') || t.includes('reason') || t.includes('suy nghĩ') || t.includes('bật') || t.includes('high') || t.includes('sâu');
                  });
                  if (item) {
                    (item as HTMLElement).click();
                    await new Promise(r => setTimeout(r, 300));
                    return { status: 'toggled_via_menu', active: true };
                  }
                } else {
                  const item = popoverItems.find(m => {
                    const t = (m.textContent || '').toLowerCase();
                    return t.includes('standard') || t.includes('tiêu chuẩn') || t.includes('tắt') || t.includes('off') || t.includes('instant');
                  });
                  if (item) {
                    (item as HTMLElement).click();
                    await new Promise(r => setTimeout(r, 300));
                    return { status: 'toggled_via_menu', active: false };
                  }
                }
              }

              return { status: 'toggled', active: wantThink, label: thinkBtn.textContent?.trim() };
            }, { wantThink });

            if (evalRes && (evalRes.status === 'already_ok' || evalRes.status === 'toggled' || evalRes.status === 'toggled_via_menu')) {
              thinkToggled = true;
              onProgress({
                step: 'SENDING_PROMPT',
                progress: 34,
                message: wantThink 
                  ? '✓ Đã kích hoạt chế độ Think (Suy nghĩ sâu) trên ChatGPT' 
                  : '✓ Đã thiết lập chế độ Tiêu chuẩn (Tắt Think) trên ChatGPT',
              });
              break;
            }
            await aiPage.waitForTimeout(500);
          }

          if (!thinkToggled) {
            const thinkLocators = [
              'button[data-testid*="reason" i]',
              'button[data-testid*="think" i]',
              'button[aria-label*="Think" i]',
              'button[aria-label*="Reason" i]',
              'button[aria-label*="Suy nghĩ" i]',
              'button:has-text("Think")',
              'button:has-text("Reason")',
              'button:has-text("Suy nghĩ")',
            ];
            for (const sel of thinkLocators) {
              const loc = aiPage.locator(sel).first();
              if (await loc.isVisible({ timeout: 800 }).catch(() => false)) {
                const pressed = await loc.getAttribute('aria-pressed');
                const checked = await loc.getAttribute('aria-checked');
                const isCurrentOn = pressed === 'true' || checked === 'true';
                if ((wantThink && !isCurrentOn) || (!wantThink && isCurrentOn)) {
                  await loc.click();
                  await aiPage.waitForTimeout(400);
                  onProgress({
                    step: 'SENDING_PROMPT',
                    progress: 34,
                    message: `✓ Đã chuyển đổi chế độ Think: ${wantThink ? 'BẬT' : 'TẮT'}`,
                  });
                }
                break;
              }
            }
          }
        } catch (chatgptErr: any) {
          console.warn('ChatGPT think mode toggle check:', chatgptErr.message);
        }
      }

      // Tự động chuyển đổi Model trên Google Gemini (3.1 Pro / 3.8 Flash / 3.5 Flash Lite)
      if (targetAiUrl.includes('gemini.google.com') && options.model) {
        onProgress({
          step: 'SENDING_PROMPT',
          progress: 32,
          message: `Đang kiểm tra và chọn mô hình ${options.modelName || options.model} trên Gemini...`,
        });

        try {
          let modelSwitched = false;
          const targetId = options.model.toLowerCase();
          const isTargetPro = targetId.includes('pro') || targetId.includes('3.1');
          const isTargetLite = targetId.includes('lite') || targetId.includes('3.5');
          const isTargetFlash = targetId.includes('3.8') || (!isTargetPro && !isTargetLite);

          // 1. Thử qua DOM evaluate (nhanh và chính xác nhất)
          for (let attempt = 0; attempt < 8; attempt++) {
            const evalResult: any = await aiPage.evaluate(async ({ isTargetPro, isTargetLite, isTargetFlash }: any) => {
              function isVisible(el: any) {
                if (!el) return false;
                const r = el.getBoundingClientRect();
                const s = window.getComputedStyle(el);
                return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
              }

              // Tìm nút Mode Picker
              const candidates = Array.from(document.querySelectorAll(
                'button, [role="button"], [role="combobox"], .input-area-switch, [data-test-id*="mode"]'
              ));

              const picker = candidates.find((b: any) => {
                if (!isVisible(b)) return false;
                const aria = (b.getAttribute('aria-label') || '').toLowerCase();
                const txt = (b.textContent || '').toLowerCase();
                const hasPopup = b.getAttribute('aria-haspopup') === 'true' || b.getAttribute('aria-haspopup') === 'menu';
                const combined = aria + ' ' + txt;

                if (b.classList.contains('input-area-switch')) return true;
                if (combined.includes('mode picker') || combined.includes('chọn chế độ') || combined.includes('chọn mô hình')) return true;
                if (hasPopup && (combined.includes('flash') || combined.includes('pro') || combined.includes('3.5') || combined.includes('3.8') || combined.includes('3.1'))) return true;
                return false;
              });

              if (!picker) return { status: 'no_picker' };

              const currentText = ((picker.getAttribute('aria-label') || '') + ' ' + (picker.textContent || '')).toLowerCase();
              const isCurrentlyPro = (currentText.includes('pro') || currentText.includes('3.1')) && !currentText.includes('flash-lite') && !currentText.includes('lite');
              const isCurrentlyLite = currentText.includes('flash-lite') || currentText.includes('3.5') || currentText.includes('lite');
              const isCurrentlyFlash = !isCurrentlyPro && !isCurrentlyLite && (currentText.includes('3.8') || currentText.includes('flash'));

              if ((isTargetPro && isCurrentlyPro) || (isTargetLite && isCurrentlyLite) || (isTargetFlash && isCurrentlyFlash)) {
                return { status: 'already_selected', currentText };
              }

              // Mở menu
              (picker as HTMLElement).click();
              await new Promise(r => setTimeout(r, 450));

              const items = Array.from(document.querySelectorAll(
                '[role="menuitem"], [role="option"], mat-option, .mat-mdc-menu-item, div.mode-option'
              )).filter(isVisible);

              let targetItem: any = null;
              if (isTargetPro) {
                targetItem = items.find((i: any) => {
                  const t = (i.textContent || '').toLowerCase();
                  return (t.includes('3.1') || t.includes('pro')) && !t.includes('flash-lite') && !t.includes('lite');
                });
              } else if (isTargetLite) {
                targetItem = items.find((i: any) => {
                  const t = (i.textContent || '').toLowerCase();
                  return t.includes('flash-lite') || t.includes('3.5') || t.includes('lite');
                });
              } else {
                targetItem = items.find((i: any) => {
                  const t = (i.textContent || '').toLowerCase();
                  return (t.includes('3.8') || t.includes('flash')) && !t.includes('lite');
                });
              }

              if (targetItem) {
                targetItem.click();
                await new Promise(r => setTimeout(r, 450));
                return { status: 'switched', label: (targetItem.textContent || '').trim().replace(/\s+/g, ' ') };
              }

              // Đóng menu nếu không tìm thấy item khớp
              (picker as HTMLElement).click();
              return { status: 'item_not_found', foundItems: items.map((i: any) => (i.textContent || '').trim().replace(/\s+/g, ' ')) };
            }, { isTargetPro, isTargetLite, isTargetFlash });

            if (evalResult && (evalResult.status === 'switched' || evalResult.status === 'already_selected')) {
              modelSwitched = true;
              const label = evalResult.label || options.modelName || options.model;
              onProgress({
                step: 'SENDING_PROMPT',
                progress: 34,
                message: `✓ Đã kích hoạt mô hình Gemini: ${label}`,
              });
              break;
            }

            await aiPage.waitForTimeout(600);
          }

          // 2. Fallback Playwright locators nếu DOM evaluate chưa bấm được
          if (!modelSwitched) {
            try {
              const pickerLocators = [
                'button.input-area-switch',
                'button[aria-label*="mode picker" i]',
                'button[aria-haspopup="true"]:has-text("Flash")',
                'button[aria-haspopup="true"]:has-text("Pro")',
                'button[aria-haspopup="true"]:has-text("3.5")',
                'button[aria-haspopup="true"]:has-text("3.8")',
                'button[aria-haspopup="true"]:has-text("3.1")',
              ];

              for (const pSel of pickerLocators) {
                const pBtn = aiPage.locator(pSel).first();
                if (await pBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                  await pBtn.click();
                  await aiPage.waitForTimeout(500);

                  let targetOptionSel = isTargetPro 
                    ? '[role="menuitem"]:has-text("3.1 Pro"), [role="menuitem"]:has-text("Pro")'
                    : isTargetLite
                    ? '[role="menuitem"]:has-text("3.5 Flash-Lite"), [role="menuitem"]:has-text("Flash-Lite")'
                    : '[role="menuitem"]:has-text("3.8 Flash"), [role="menuitem"]:has-text("Flash")';

                  const itemLoc = aiPage.locator(targetOptionSel).first();
                  if (await itemLoc.isVisible({ timeout: 1500 }).catch(() => false)) {
                    await itemLoc.click();
                    await aiPage.waitForTimeout(500);
                    modelSwitched = true;
                    onProgress({
                      step: 'SENDING_PROMPT',
                      progress: 34,
                      message: `✓ Đã chọn mô hình Gemini qua menu: ${options.modelName || options.model}`,
                    });
                    break;
                  }
                }
              }
            } catch (fbErr: any) {
              console.warn('Fallback Gemini model selector:', fbErr.message);
            }
          }
        } catch (geminiModelErr: any) {
          console.warn('Gemini model selection error:', geminiModelErr);
        }
      }

      const isManimTaskEarly = options.prompt.includes('Manim') || 
                               options.prompt.includes('Scene') || 
                               options.prompt.includes('scene.py') ||
                               options.prompt.includes('VOICEOVER_SCRIPT') ||
                               options.prompt.includes('KỊCH BẢN SƯ PHẠM');

      // Đợi khung nhập liệu của AI sẵn sàng
      onProgress({
        step: 'SENDING_PROMPT',
        progress: 35,
        message: isManimTaskEarly 
          ? `[Lượt 1/2] Đang gửi yêu cầu Kịch bản Sư phạm & Lời thoại sang ${aiName}${options.modelName ? ` [${options.modelName}]` : ''}...`
          : `Đang điền Prompt và gửi lệnh giải toán sang ${aiName}${options.modelName ? ` [${options.modelName}]` : ''}...`,
      });

      await aiPage.waitForTimeout(2000);


      const promptInputSelectors = [
        '#prompt-textarea',
        'rich-textarea div[contenteditable="true"]',
        'div.ql-editor[contenteditable="true"]',
        'div[contenteditable="true"].ProseMirror',
        'textarea#chat-input',
        '#prompt-textarea',
        'div[id="prompt-textarea"][contenteditable="true"]',
        'div[contenteditable="true"][data-placeholder]',
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
            
            const inserted = await aiPage.evaluate(({ selector, text }: { selector: string; text: string }) => {
              const target = document.querySelector(selector) as HTMLElement;
              if (target) {
                target.focus();
                document.execCommand('insertText', false, text);
                target.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
                const len = (target.textContent || (target as any).value || '').length;
                return len > 10;
              }
              return false;
            }, { selector: sel, text: options.prompt });

            if (!inserted) {
              await el.click();
              await aiPage.keyboard.insertText(options.prompt);
            }

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
        'button[data-testid="fruitjuice-send-button"]',
        'button[data-testid*="send" i]',
        'button[aria-label*="Send message" i]',
        'button[aria-label*="Gửi tin nhắn" i]',
        'button[aria-label*="Send Message" i]',
        'button[aria-label*="Send prompt" i]',
        'button[aria-label*="Send" i]',
        'button[aria-label*="Gửi" i]',
        'div[role="button"][aria-label*="Send" i]',
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
        message: isManimTaskEarly
          ? `[Lượt 1/2] ${aiName} đang phân tích & xây dựng Kịch bản Sư phạm 4 phân cảnh...`
          : `${aiName} đang phân tích và xử lý yêu cầu...`,
      });

      let checkCount = 0;
      let lastTextLength = 0;
      let stableCount = 0;

      while (checkCount < 180) {
        if (this.isCancelled) throw new Error('Đã hủy quy trình.');
        await aiPage.waitForTimeout(2000);
        checkCount++;

        const stopBtn = await aiPage.$(
          'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Stop generating" i]'
        );
        const isStopVisible = stopBtn ? await stopBtn.isVisible().catch(() => false) : false;

        const currentLength = await aiPage.evaluate(() => {
          const blocks = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
          );
          const lastBlock = blocks[blocks.length - 1];
          return lastBlock ? (lastBlock.textContent || '').length : 0;
        });

        if (currentLength > 0 && currentLength !== lastTextLength) {
          onProgress({
            step: 'WAITING_GEMINI',
            progress: Math.min(68, 50 + Math.floor(currentLength / 120)),
            message: isManimTaskEarly
              ? `[Lượt 1/2] ${aiName} đang xuất Kịch bản Sư phạm & Thoại (${currentLength} ký tự)...`
              : `${aiName} đang phân tích & xuất nội dung (${currentLength} ký tự)...`,
          });
        }

        // Chỉ hoàn tất khi:
        // 1. Độ dài đã sinh > 100 ký tự
        // 2. Không còn nút Stop
        // 3. Độ dài không tăng thêm qua ít nhất 2 chu kỳ liên tiếp (>= 4 giây ổn định)
        if (currentLength > 100 && currentLength === lastTextLength && !isStopVisible) {
          stableCount++;
          if (stableCount >= 2) break;
        } else {
          stableCount = 0;
        }
        lastTextLength = currentLength;
      }

      // Hàm gửi prompt tiếp theo tới AI trên cùng phiên chat và lấy lại mã nguồn Python (Multi-turn & Self-Healing)
      const sendFollowupPromptAndGetPython = async (promptText: string, onStatus?: (msg: string) => void): Promise<string | null> => {
        if (!aiPage || aiPage.isClosed()) return null;
        if (onStatus) onStatus('Đang chuẩn bị gửi prompt tiếp theo tới AI...');

        // 0. Đảm bảo AI đã dừng sinh ở lượt trước và giao diện sẵn sàng nhận lệnh mới
        await aiPage.waitForTimeout(1500);
        for (let w = 0; w < 12; w++) {
          const busy = await aiPage.evaluate(() => {
            const isStop = document.querySelector(
              'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i]'
            );
            return isStop ? ((isStop as HTMLElement).offsetParent !== null || isStop.getAttribute('aria-hidden') !== 'true') : false;
          }).catch(() => false);
          if (!busy) break;
          await aiPage.waitForTimeout(1000);
        }

        // 1. Đếm số lượng phản hồi hiện tại để đảm bảo CHỈ lấy phản hồi của lượt mới
        const initialAssistantCount = await aiPage.evaluate(() => {
          const blocks = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
          );
          return blocks.length;
        }).catch(() => 0);

        // 2. Tìm ô nhập liệu (ưu tiên các selector của Gemini ProseMirror / rich-textarea)
        const promptSelectors = [
          'rich-textarea div[contenteditable="true"]',
          'rich-textarea .ProseMirror',
          'div[contenteditable="true"].ProseMirror',
          'div[contenteditable="true"][role="textbox"]',
          '#prompt-textarea',
          'div.ql-editor[contenteditable="true"]',
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

        let activeInputEl: any = null;
        let activeSelector: string | null = null;
        for (const sel of promptSelectors) {
          try {
            const el = await aiPage.$(sel);
            if (el && (await el.isVisible())) {
              activeInputEl = el;
              activeSelector = sel;
              break;
            }
          } catch {}
        }

        if (!activeInputEl) {
          try {
            activeInputEl = await aiPage.waitForSelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"], textarea', { timeout: 4000 });
          } catch {}
        }

        if (onStatus) onStatus('Đang điền prompt tiếp theo vào ô chat...');

        if (activeInputEl) {
          await activeInputEl.click();
          await aiPage.waitForTimeout(200);
          await aiPage.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
          await aiPage.keyboard.press('Backspace');
          await aiPage.waitForTimeout(150);

          let insertedSuccess = false;

          // Cách 1: DOM Selection + execCommand
          if (activeSelector) {
            insertedSuccess = await aiPage.evaluate(({ selector, text }: { selector: string; text: string }) => {
              const target = document.querySelector(selector) as any;
              if (!target) return false;
              target.focus();
              try {
                const sel = window.getSelection();
                if (sel) {
                  const range = document.createRange();
                  range.selectNodeContents(target);
                  range.collapse(false);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
                document.execCommand('insertText', false, text);
                target.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: text }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
              } catch (e) {}
              const l = (target.textContent || target.innerText || target.value || '').trim().length;
              return l > 10;
            }, { selector: activeSelector, text: promptText }).catch(() => false);
          }

          // Cách 2: Playwright keyboard insertText nếu DOM chưa có text
          if (!insertedSuccess) {
            await activeInputEl.focus();
            await aiPage.keyboard.insertText(promptText);
            await aiPage.waitForTimeout(300);
          }

          // Kích hoạt sự kiện để cập nhật state của framework
          await aiPage.evaluate((el: any) => {
            el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, activeInputEl).catch(() => {});
        } else {
          await aiPage.keyboard.insertText(promptText);
        }

        await aiPage.waitForTimeout(600);

        // 3. Gửi lệnh đi (Click nút Gửi hoặc nhấn Enter)
        const sendBtns = [
          'button[data-testid="fruitjuice-send-button"]',
          'button[data-testid="send-button"]',
          'button[aria-label*="Send message" i]',
          'button[aria-label*="Gửi tin nhắn" i]',
          'button[aria-label*="Send Message" i]',
          'button[aria-label*="Send prompt" i]',
          'button[aria-label*="Gửi câu nhắc" i]',
          'button[aria-label*="Send" i]',
          'button[aria-label*="Gửi" i]',
          'div[role="button"][aria-label*="Send" i]',
          'div[role="button"][aria-label*="Gửi" i]',
          'button.send-button',
          'button[type="submit"]',
          'mat-icon[fonticon="send"]',
        ];

        const triggerSend = async () => {
          for (const sel of sendBtns) {
            try {
              const btn = await aiPage.$(sel);
              if (btn && (await btn.isVisible())) {
                await btn.click({ force: true });
                return true;
              }
            } catch {}
          }
          if (activeInputEl) {
            try {
              await activeInputEl.focus();
              await aiPage.keyboard.press('Enter');
              return true;
            } catch {}
          }
          await aiPage.keyboard.press('Enter');
          return false;
        };

        await triggerSend();

        // 4. XÁC NHẬN SUBMISSION ĐÃ THỰC SỰ ĐƯỢC GỬI ĐI (Chống trượt / chưa bấm gửi)
        for (let checkAttempt = 0; checkAttempt < 5; checkAttempt++) {
          await aiPage.waitForTimeout(1200);
          const dispatchState = await aiPage.evaluate((initCount: number) => {
            const stopBtn = document.querySelector(
              'button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i]'
            ) as HTMLElement | null;
            const hasStop = stopBtn ? (stopBtn.offsetParent !== null || stopBtn.getAttribute('aria-hidden') !== 'true') : false;
            const blocks = document.querySelectorAll(
              'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
            );
            const newBlock = blocks.length > initCount;
            return hasStop || newBlock;
          }, initialAssistantCount).catch(() => false);

          if (dispatchState) {
            break;
          }

          if (onStatus) onStatus(`Đang xác nhận gửi lệnh Lượt 2 sang AI (thử lại lần ${checkAttempt + 1})...`);
          await triggerSend();
        }

        if (onStatus) onStatus('AI đang phân tích và xuất mã Python...');

        await aiPage.waitForTimeout(2500);

        // 5. Chờ AI xuất toàn bộ mã Python
        let checkCount = 0;
        let lastLength = 0;
        let stable = 0;
        let hasStarted = false;

        while (checkCount < 180) {
          await aiPage.waitForTimeout(2000);
          checkCount++;

          const state = await aiPage.evaluate((initCount: number) => {
            const isStop = document.querySelector(
              'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Stop generating" i]'
            ) as HTMLElement | null;
            const stopVisible = isStop ? (isStop.offsetParent !== null || isStop.getAttribute('aria-hidden') !== 'true') : false;

            const blocks = document.querySelectorAll(
              'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
            );
            const newBlockExists = blocks.length > initCount;
            const last = blocks[blocks.length - 1];
            const len = last ? (last.textContent || '').length : 0;
            return { stopVisible, newBlockExists, len, blockCount: blocks.length };
          }, initialAssistantCount).catch(() => ({ stopVisible: false, newBlockExists: false, len: 0, blockCount: 0 }));

          if (state.stopVisible || state.newBlockExists) {
            hasStarted = true;
          }

          if (hasStarted) {
            if (onStatus && state.len > 0) {
              onStatus(`AI đang xuất mã Python (${state.len} ký tự)...`);
            }
            if (state.len > 150 && state.len === lastLength && !state.stopVisible) {
              stable++;
              if (stable >= 3) break;
            } else {
              stable = 0;
            }
          }
          lastLength = state.len;
        }

        // 6. BÓC TÁCH MÃ NGUỒN CHỈ TỪ PHẢN HỒI MỚI (TUYỆT ĐỐI KHÔNG DÙNG LẠI LƯỢT CŨ)
        const extracted = await aiPage.evaluate((initCount: number) => {
          const containers = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown'
          );
          if (containers.length <= initCount) {
            return null;
          }
          const targetContainer = containers[containers.length - 1];

          const codeBlocks = targetContainer.querySelectorAll(
            'pre code, .code-block code, code, pre'
          );
          for (let i = codeBlocks.length - 1; i >= 0; i--) {
            const txt = codeBlocks[i].textContent || '';
            if ((txt.includes('from manim import') || txt.includes('class ')) && (txt.includes('Scene') || txt.includes('construct'))) {
              return txt;
            }
          }
          const allText = (targetContainer as HTMLElement).innerText || targetContainer.textContent || '';
          const match = allText.match(/```(?:python|py)?\s*([\s\S]*?)```/i);
          if (match && (match[1].includes('class ') || match[1].includes('Scene') || match[1].includes('construct'))) {
            return match[1];
          }
          const fallback = allText.match(/from manim import[\s\S]*?(?:self\.wait\(\d+\)|def construct[\s\S]*)/);
          if (fallback) return fallback[0];
          return null;
        }, initialAssistantCount);

        return extracted ? AutomationRunner.prepareManimPythonCode(extracted) : null;
      };

      // 4. Xác định loại tác vụ (Manim Python, Kịch bản Video hay LaTeX)
      const promptText = options.prompt || '';
      const isManimTask = promptText.includes('Manim') || 
                          promptText.includes('Scene') || 
                          promptText.includes('scene.py') || 
                          promptText.includes('from manim import') ||
                          promptText.includes('VOICEOVER_SCRIPT') ||
                          promptText.includes('KỊCH BẢN SƯ PHẠM');
      const isScriptTask = promptText.includes('KỊCH BẢN VIDEO') || promptText.includes('BẢNG PHÂN CẢNH') || promptText.includes('Storyboard');

      if (isManimTask) {
        onProgress({
          step: 'EXTRACTING_LATEX',
          progress: 65,
          message: 'Đang bóc tách mã nguồn Python Manim (scene.py)...',
        });

        let extractedPython = await aiPage.evaluate(() => {
          const containers = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown'
          );
          const targetContainer = containers.length > 0 ? containers[containers.length - 1] : document.body;

          const codeBlocks = targetContainer.querySelectorAll(
            'pre code, .code-block code, code'
          );
          for (let i = codeBlocks.length - 1; i >= 0; i--) {
            const txt = codeBlocks[i].textContent || '';
            if (txt.includes('from manim import') || txt.includes('class ') || txt.includes('Scene')) {
              return txt;
            }
          }
          const allText = (targetContainer as HTMLElement).innerText || targetContainer.textContent || '';
          const match = allText.match(/```(?:python)?\s*([\s\S]*?)```/);
          if (match && (match[1].includes('from manim import') || match[1].includes('Scene'))) {
            return match[1];
          }
          const fallback = allText.match(/from manim import[\s\S]*?(?:self\.wait\(\d+\)|def construct)/);
          if (fallback) return fallback[0];
          return null;
        });

        // MULTI-TURN AUTO-DETECTION & TURN 2 DISPATCH:
        const hasValidManimCode = extractedPython && extractedPython.includes('class ') && (extractedPython.includes('Scene') || extractedPython.includes('construct'));

        if (!hasValidManimCode) {
          onProgress({
            step: 'SENDING_PROMPT',
            progress: 66,
            message: '✓ [Lượt 1/2] Đã duyệt Kịch bản Sư phạm & Lời thoại! Đang tự động gửi [Lượt 2/2] để AI xuất toàn bộ mã Manim Python...',
          });

          const isVertical = options.prompt.includes('9:16') || options.prompt.includes('DỌC');
          const qualityFlag = '-pqh';
          const codeFollowupPrompt = `Tuyệt vời! Dựa trên kịch bản sư phạm và khối lời thoại VOICEOVER_SCRIPT vừa thống nhất ở trên, hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.

YÊU CẦU KỸ THUẬT BẮT BUỘC (TUÂN THỦ 15 NGUYÊN TẮC VÀNG VISUAL ENGINEERING):
1. Kế thừa chính xác biến VOICEOVER_SCRIPT (~140-160 từ) và 4 phân cảnh đã duyệt (1. Intro, 2. Lý thuyết, 3. Mô phỏng & Biến đổi LaTeX, 4. Outro).
2. Cấu hình ${isVertical ? 'Khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)' : 'Khung hình NGANG 16:9 (1920x1080, config.frame_width=14.22, config.frame_height=8.0)'}.
3. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
   - MỌI công thức, phương trình, biến số bắt buộc dùng MathTex(r"...") với raw string r"...".
   - Phân số \\frac{a}{b}, căn thức \\sqrt{x}, tích phân \\int, đạo hàm \\frac{df}{dx}, vector \\vec{u}.
   - Biến đổi toán học nhiều dòng dùng môi trường aligned: MathTex(r"\\begin{aligned} ... &= ... \\\\ &= ... \\end{aligned}").
   - Đóng khung nổi bật đáp số / kết quả cuối cùng: SurroundingRectangle(result, color=GREEN, buff=0.15, corner_radius=0.1).
   - Tuyệt đối KHÔNG viết tiếng Việt có dấu trực tiếp trong MathTex để tránh lỗi LaTeX Unicode; tiếng Việt dùng Text("...", font="Be Vietnam Pro").
4. MÔ PHỎNG TOÁN HỌC TRỰC QUAN SINH ĐỘNG (VISUAL SIMULATION):
   - Phân cảnh giải toán BẮT BUỘC có mô phỏng hình ảnh động: Hệ trục tọa độ Axes, đồ thị axes.plot(...), điểm Dot di chuyển trên đường cong bằng ValueTracker, tiếp tuyến hoặc hình học/vector. Tuyệt đối không chỉ hiển thị các dòng chữ tĩnh!
5. BỐ CỤC ZERO-OVERLAP DUAL-ZONE & QUAN HỆ HÌNH HỌC (KHÔNG DÙNG MAGIC COORDINATES):
   - BẮT BUỘC dùng quan hệ hình học: VGroup + arrange() + next_to() thay cho các tọa độ ước lượng move_to(UP*2).
   - ${isVertical ? 'Xếp 2 tầng: Tầng trên (scale 0.7, shift UP*2.6) dành riêng cho Mô phỏng Đồ thị/Hình học; Tầng dưới (shift DOWN*2.8) dành riêng cho Công thức LaTeX giải chi tiết' : 'Bố cục 2 Cột: Cột Trái 55% là Mô phỏng Đồ thị/Hình học (.to_edge(LEFT, buff=0.8)), Cột Phải 45% là Biến đổi Công thức LaTeX (.to_edge(RIGHT, buff=0.8))'}.
   - Kiểm soát kích thước: Dùng fit_width(obj, max_width) hoặc scale_to_fit_width(...) để không bao giờ tràn khung.
   - Nhãn chữ gần đồ thị: Dùng add_backdrop(label) hoặc label.add_background_rectangle(color="#0F172A", opacity=0.9, buff=0.1).
6. NHỊP ĐIỆU THỊ GIÁC & CHUYỂN CẢNH MƯỢT MÀ:
   - Dùng TransformMatchingTex khi biến đổi công thức đại số.
   - Dùng LaggedStart khi xuất hiện danh sách hoặc các phần tử nối tiếp.
   - Có khoảng dừng self.wait(1.5 đến 2.5s) sau các công thức trọng tâm để người xem kịp quan sát.
7. Màu nền "#0F172A", toàn bộ Text dùng font="Be Vietnam Pro".
8. Cảnh Outro: Hiệu ứng hào quang, giữ nguyên màn hình (self.wait(2.5)), TUYỆT ĐỐI KHÔNG DÙNG FadeOut(*self.mobjects) làm đen màn hình.
9. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết bất kỳ lời chào hay giải thích ngoài mã.
Lệnh render cuối file: \`manim ${qualityFlag} scene.py MainScene\`.`;

          const turn2Python = await sendFollowupPromptAndGetPython(codeFollowupPrompt, (msg) => {
            onProgress({
              step: 'WAITING_GEMINI',
              progress: 68,
              message: `[Lượt 2/2] ${msg}`,
            });
          });

          if (turn2Python && (turn2Python.includes('class ') || turn2Python.includes('def construct'))) {
            extractedPython = turn2Python;
            onProgress({
              step: 'EXTRACTING_LATEX',
              progress: 70,
              message: '✓ [Lượt 2/2] Đã nhận mã Python Manim CE! Chuẩn bị render video MP4...',
            });
          } else {
            onProgress({
              step: 'ERROR',
              progress: 0,
              message: '⚠️ Lượt 2 chưa nhận được mã Python Manim CE hợp lệ từ AI. Vui lòng kiểm tra lại phản hồi trên giao diện AI.',
              error: 'AI did not return valid Manim Python code in Turn 2',
            });
            return;
          }
        }

        let finalPython = extractedPython || '';
        if (!finalPython || (!finalPython.includes('class ') && !finalPython.includes('def construct'))) {
          onProgress({
            step: 'ERROR',
            progress: 0,
            message: '⚠️ Không tìm thấy class Manim Scene hợp lệ trong mã nguồn bóc tách.',
            error: 'No valid Manim Scene found',
          });
          return;
        }

        finalPython = AutomationRunner.prepareManimPythonCode(finalPython);

        // Lưu file scene.py
        const sceneFileName = 'scene.py';
        const sceneFilePath = path.join(outputDirectory, sceneFileName);
        fs.writeFileSync(sceneFilePath, finalPython, 'utf-8');

        // Tạo sẵn script render cho Linux (.sh) và Windows (.bat)
        const renderShPath = path.join(outputDirectory, 'render_manim.sh');
        const renderShContent = `#!/usr/bin/env bash\nset -e\necho "========================================================"\necho "  📐 YUTA MANIM STUDIO - RENDER 1-CLICK"\necho "========================================================"\nif ! command -v manim &> /dev/null; then\n  echo "[ERROR] Chưa cài đặt Manim CE! Vui lòng cài: pip install manim"\n  exit 1\nfi\necho "Đang render scene.py (1080p 60fps)..."\nmanim -pqh scene.py MainScene\nVIDEO="media/videos/scene/1080p60/MainScene.mp4"\nif [ -f "$VIDEO" ]; then\n  xdg-open "$VIDEO" 2>/dev/null || open "$VIDEO" 2>/dev/null || true\nfi\n`;
        fs.writeFileSync(renderShPath, renderShContent, { encoding: 'utf-8', mode: 0o755 });

        const renderBatPath = path.join(outputDirectory, 'render_manim.bat');
        const renderBatContent = `@echo off\nchcp 65001 >nul\ntitle Yuta Manim Studio - Render 1-Click\necho Dang render scene.py (1080p 60fps)...\nmanim -pqh scene.py MainScene\npause\n`;
        fs.writeFileSync(renderBatPath, renderBatContent, 'utf-8');

        // Trích xuất tên Scene class từ mã nguồn
        let sceneClass = 'MainScene';
        const sceneMatch = finalPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
        if (sceneMatch && sceneMatch[1]) {
          sceneClass = sceneMatch[1];
        }

        // 1. Đảm bảo môi trường Manim CE tồn tại (tự cài nếu thiếu)
        const manimBin = await AutomationRunner.ensureManimEnvironment((msg) => {
          onProgress({
            step: 'RENDERING_VIDEO',
            progress: 72,
            message: msg,
            manimCode: finalPython,
            contentType: 'manim',
          });
        });

        if (manimBin) {

          const compileAndHealManimCode = async ({
            initialPython,
            workingDir,
            targetSceneFilePath,
            episodeLabel = '',
            maxAttempts = 5
          }: {
            initialPython: string;
            workingDir: string;
            targetSceneFilePath: string;
            episodeLabel?: string;
            maxAttempts?: number;
          }) => {
            let currentPython = initialPython;
            let renderSuccess = false;
            let lastError = '';
            let finalMp4 = '';
            const mediaDir = path.join(workingDir, 'media');

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              currentPython = AutomationRunner.prepareManimPythonCode(currentPython);
              fs.writeFileSync(targetSceneFilePath, currentPython, 'utf-8');

              let sceneClass = 'MainScene';
              const sceneMatch = currentPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
              if (sceneMatch && sceneMatch[1]) sceneClass = sceneMatch[1];

              await AutomationRunner.autoInstallMissingDependencies(currentPython, (msg) => {
                onProgress({
                  step: 'RENDERING_VIDEO',
                  progress: 74,
                  message: `${episodeLabel ? `[${episodeLabel}] ` : ''}${msg}`,
                  manimCode: currentPython,
                  contentType: 'manim',
                });
              });

              onProgress({
                step: 'RENDERING_VIDEO',
                progress: Math.min(95, 75 + (attempt - 1) * 4),
                message: attempt === 1
                  ? `${episodeLabel ? `[${episodeLabel}] ` : ''}Đang biên dịch Manim CE (${sceneClass})...`
                  : `⚠️ ${episodeLabel ? `[${episodeLabel}] ` : ''}Đang biên dịch lại sau khi AI sửa mã (Lần ${attempt}/${maxAttempts})...`,
                manimCode: currentPython,
                latexCode: currentPython,
                filePath: targetSceneFilePath,
                contentType: 'manim',
              });

              const renderResult = await new Promise<{ success: boolean; mp4Path?: string; error?: string; detailsForAI?: string }>((resolve) => {
                const proc = spawn(manimBin, ['-qm', '--media_dir', mediaDir, targetSceneFilePath, sceneClass], {
                  cwd: workingDir,
                });
                this.childProc = proc;

                let stdout = '';
                let stderr = '';

                proc.stdout.on('data', (d) => { stdout += d.toString(); });
                proc.stderr.on('data', (d) => {
                  const s = d.toString();
                  stderr += s;
                  const match = s.match(/(\d+)%/);
                  if (match) {
                    const pct = Math.min(96, 75 + Math.floor(parseInt(match[1], 10) * 0.2));
                    onProgress({
                      step: 'RENDERING_VIDEO',
                      progress: pct,
                      message: `${episodeLabel ? `[${episodeLabel}] ` : ''}Đang render video Manim: ${match[1]}%...`,
                      manimCode: currentPython,
                      contentType: 'manim',
                    });
                  }
                });

                proc.on('close', (code) => {
                  this.childProc = null;
                  if (code === 0) {
                    const newestMp4 = AutomationRunner.findNewestMp4(mediaDir);
                    if (newestMp4) {
                      resolve({ success: true, mp4Path: newestMp4 });
                      return;
                    }
                  }
                  const parsedErr = AutomationRunner.parseManimError(stderr, stdout, workingDir);
                  resolve({ success: false, error: parsedErr.summary, detailsForAI: parsedErr.detailsForAI });
                });

                proc.on('error', (err) => {
                  this.childProc = null;
                  resolve({ success: false, error: err.message, detailsForAI: err.message });
                });
              });

              if (renderResult.success && renderResult.mp4Path) {
                renderSuccess = true;
                finalMp4 = renderResult.mp4Path;
                break;
              }

              lastError = renderResult.error || 'Lỗi không xác định';
              const detailsForAI = renderResult.detailsForAI || lastError;

              // 1. Thử pip install
              const missingMatch = (detailsForAI + ' ' + lastError).match(/ModuleNotFoundError:\s*No module named\s*['"]([a-zA-Z0-9_-]+)['"]/i)
                || (detailsForAI + ' ' + lastError).match(/No module named\s*['"]([a-zA-Z0-9_-]+)['"]/i);
              if (missingMatch && missingMatch[1] && attempt < maxAttempts) {
                const missingLib = missingMatch[1];
                onProgress({
                  step: 'RENDERING_VIDEO',
                  progress: 76,
                  message: `${episodeLabel ? `[${episodeLabel}] ` : ''}Phát hiện thiếu thư viện "${missingLib}", đang cài đặt...`,
                  manimCode: currentPython,
                  contentType: 'manim',
                });
                const installed = await AutomationRunner.installPythonPackage(missingLib);
                if (installed) continue;
              }

              // 2. Thử sanitize LaTeX tiếng Việt
              const isLatexError = /latex error|compiler error|Unicode character|dvi|tex_file_writing|ValueError:\s*latex/i.test(detailsForAI + ' ' + lastError);
              if (isLatexError && attempt < maxAttempts) {
                const sanitized = AutomationRunner.sanitizeLatexVietnamese(currentPython);
                if (sanitized !== currentPython) {
                  onProgress({
                    step: 'RENDERING_VIDEO',
                    progress: 76,
                    message: `${episodeLabel ? `[${episodeLabel}] ` : ''}Tự động chuẩn hóa ký tự tiếng Việt trong LaTeX...`,
                    manimCode: currentPython,
                    contentType: 'manim',
                  });
                  currentPython = sanitized;
                  continue;
                }
              }

              // 3. TỰ ĐỘNG GỬI LOG LỖI VỀ CHO AI SỬA (SELF-HEALING LOOP)!
              if (attempt < maxAttempts && aiPage && !aiPage.isClosed()) {
                onProgress({
                  step: 'RENDERING_VIDEO',
                  progress: 77,
                  message: `⚠️ ${episodeLabel ? `[${episodeLabel}] ` : ''}Lỗi render: ${lastError.slice(0, 85)}... Đang gửi log để AI sửa mã (Lần ${attempt + 1}/${maxAttempts})...`,
                  manimCode: currentPython,
                  contentType: 'manim',
                });

                const healPrompt = `Mã nguồn Manim scene.py bạn vừa tạo khi biên dịch bằng Manim CE gặp lỗi sau:
--------------------------------------------------
${detailsForAI}
--------------------------------------------------

YÊU CẦU BẮT BUỘC ĐỂ SỬA LỖI:
1. Đọc kỹ vị trí dòng lỗi và chỉ dẫn sửa lỗi ở trên để khắc phục triệt để.
2. Viết lại TOÀN BỘ file scene.py hoàn chỉnh, ngắn gọn súc tích (dưới 140 dòng lệnh).
3. Đảm bảo đóng đầy đủ mọi dấu ngoặc, kết thúc hàm construct(self) bằng self.wait(2).
4. Giữ nguyên class MainScene(Scene) hoặc tên Scene tương ứng, cấu hình Dual-Zone và LaTeX MathTex(r"...").
5. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, KHÔNG viết lời chào hay giải thích ngoài mã.`;

                const healedCode = await sendFollowupPromptAndGetPython(healPrompt, (m) => {
                  onProgress({
                    step: 'RENDERING_VIDEO',
                    progress: 78,
                    message: `${episodeLabel ? `[${episodeLabel}] ` : ''}${m}`,
                    manimCode: currentPython,
                    contentType: 'manim',
                  });
                });

                if (healedCode && healedCode.length > 50) {
                  currentPython = AutomationRunner.prepareManimPythonCode(healedCode);
                  continue;
                }
              }

              break;
            }

            return {
              success: renderSuccess,
              mp4Path: finalMp4,
              pythonCode: currentPython,
              error: lastError
            };
          };

          const isPlaylistTask = isManimTask && (
            options.prompt.includes('PLAYLIST') || 
            options.prompt.includes('CHUỖI') || 
            options.prompt.includes('TẬP TRONG CHUỖI PLAYLIST') ||
            options.isSeries === true
          );

          if (!isPlaylistTask) {
            // VIDEO ĐƠN
            const healResult = await compileAndHealManimCode({
              initialPython: finalPython,
              workingDir: outputDirectory,
              targetSceneFilePath: sceneFilePath,
              maxAttempts: 5
            });

            if (healResult.success && healResult.mp4Path) {
              let finalVideoSource = healResult.mp4Path;
              let audioPath: string | null = null;
              let audioUrl: string | null = null;

              if (options.enableVoice !== false) {
                onProgress({
                  step: 'RENDERING_VIDEO',
                  progress: 96,
                  message: 'Đang khởi tạo giọng đọc AI và đồng bộ âm thanh...',
                  contentType: 'manim',
                });

                const voiceRes = await AutomationRunner.generateVoiceoverAndMux({
                  mp4Path: healResult.mp4Path,
                  pythonCode: healResult.pythonCode,
                  workingDir: outputDirectory,
                  voiceName: options.voiceName || 'vi-VN-HoaiMyNeural',
                  voiceSpeed: options.voiceSpeed || '+0%',
                  fallbackTopic: options.topic,
                  onStatus: (msg) => {
                    onProgress({
                      step: 'RENDERING_VIDEO',
                      progress: 97,
                      message: msg,
                      contentType: 'manim',
                    });
                  },
                });

                if (voiceRes.success && voiceRes.mp4Path) {
                  finalVideoSource = voiceRes.mp4Path;
                }
                if (voiceRes.audioPath && fs.existsSync(voiceRes.audioPath)) {
                  audioPath = voiceRes.audioPath;
                  audioUrl = `/downloads/${path.basename(voiceRes.audioPath)}`;
                }
              }

              const videoFileName = `video_${Date.now()}.mp4`;
              const finalVideoPath = path.join(outputDirectory, videoFileName);
              fs.copyFileSync(finalVideoSource, finalVideoPath);

              onProgress({
                step: 'COMPLETED',
                progress: 100,
                message: audioPath
                  ? '🎉 Hoàn tất 1-Click! Video MP4 kèm thuyết minh giọng đọc AI đã sẵn sàng.'
                  : '🎉 Hoàn tất 1-Click! Video MP4 đã render xong sẵn sàng xem ngay.',
                manimCode: healResult.pythonCode,
                latexCode: healResult.pythonCode,
                filePath: sceneFilePath,
                videoPath: finalVideoPath,
                videoUrl: `/downloads/${videoFileName}`,
                audioPath: audioPath || undefined,
                audioUrl: audioUrl || undefined,
                contentType: 'manim',
              });
              return;
            } else {
              onProgress({
                step: 'COMPLETED',
                progress: 100,
                message: `Đã lưu scene.py! Lỗi render Manim sau các lần thử: ${healResult.error.slice(0, 120)}`,
                manimCode: healResult.pythonCode,
                latexCode: healResult.pythonCode,
                filePath: sceneFilePath,
                contentType: 'manim',
              });
              return;
            }
          } else {
            // CHUỖI PLAYLIST NHIỀU TẬP
            let seriesCount = options.seriesCount || 3;
            const countMatch = options.prompt.match(/GỒM ĐÚNG\s*(\d+)\s*TẬP/i) || options.prompt.match(/(\d+)\s*tập/i);
            if (countMatch && countMatch[1]) {
              seriesCount = Math.min(10, Math.max(2, parseInt(countMatch[1], 10)));
            }

            const playlistSlug = `Playlist_${Date.now()}`;
            const playlistDir = path.join(outputDirectory, playlistSlug);
            if (!fs.existsSync(playlistDir)) fs.mkdirSync(playlistDir, { recursive: true });

            const playlistVideos: { episode: number; title: string; videoUrl: string; videoPath: string; audioUrl?: string; audioPath?: string }[] = [];

            for (let ep = 1; ep <= seriesCount; ep++) {
              const epLabel = `Tập ${ep}/${seriesCount}`;
              let epPython = '';

              if (ep === 1) {
                epPython = finalPython;
              } else {
                onProgress({
                  step: 'WAITING_GEMINI',
                  progress: Math.floor(((ep - 1) / seriesCount) * 95),
                  message: `Đang yêu cầu AI viết mã nguồn Manim cho [${epLabel}]...`,
                  contentType: 'manim'
                });

                const nextEpPrompt = `Tập ${ep - 1} đã hoàn thành xuất sắc. Bây giờ hãy viết tiếp mã Python Manim CE hoàn chỉnh cho TẬP ${ep} trên tổng số ${seriesCount} tập của chuyên đề này.
YÊU CẦU CHO TẬP ${ep}:
- Màn hình góc trên hiển thị: Text("Tập ${ep}/${seriesCount}", font_size=18, color=GRAY_B).
- Nội dung tiếp nối mạch tư duy của tập trước, trực quan và chạy được 100% không lỗi.
- Tuân thủ toàn bộ các quy chuẩn Manim Skills về bố cục và an toàn code.
- Chỉ trả về duy nhất khối mã nguồn \`\`\`python ... \`\`\`.`;

                const resPython = await sendFollowupPromptAndGetPython(nextEpPrompt, (m) => {
                  onProgress({
                    step: 'WAITING_GEMINI',
                    progress: Math.floor(((ep - 1) / seriesCount) * 95),
                    message: `[${epLabel}] ${m}`,
                    contentType: 'manim'
                  });
                });
                epPython = resPython || finalPython;
              }

              const epSceneFile = path.join(playlistDir, `scene_tap_${ep}.py`);
              const healResult = await compileAndHealManimCode({
                initialPython: epPython,
                workingDir: playlistDir,
                targetSceneFilePath: epSceneFile,
                episodeLabel: epLabel,
                maxAttempts: 4
              });

              if (healResult.success && healResult.mp4Path) {
                let epVideoSource = healResult.mp4Path;
                let epAudioPath: string | null = null;
                let epAudioUrl: string | null = null;

                if (options.enableVoice !== false) {
                  onProgress({
                    step: 'RENDERING_VIDEO',
                    progress: Math.floor((ep / seriesCount) * 94),
                    message: `[${epLabel}] Đang tổng hợp giọng đọc AI và lồng tiếng...`,
                    contentType: 'manim',
                  });

                  const voiceRes = await AutomationRunner.generateVoiceoverAndMux({
                    mp4Path: healResult.mp4Path,
                    pythonCode: healResult.pythonCode,
                    workingDir: playlistDir,
                    voiceName: options.voiceName || 'vi-VN-HoaiMyNeural',
                    voiceSpeed: options.voiceSpeed || '+0%',
                    fallbackTopic: `Tập ${ep}: ${options.topic || 'Bài giảng'}`,
                    onStatus: (msg) => {
                      onProgress({
                        step: 'RENDERING_VIDEO',
                        progress: Math.floor((ep / seriesCount) * 94),
                        message: `[${epLabel}] ${msg}`,
                        contentType: 'manim',
                      });
                    },
                  });

                  if (voiceRes.success && voiceRes.mp4Path) {
                    epVideoSource = voiceRes.mp4Path;
                  }
                  if (voiceRes.audioPath && fs.existsSync(voiceRes.audioPath)) {
                    epAudioPath = voiceRes.audioPath;
                    epAudioUrl = `/downloads/${playlistSlug}/${path.basename(voiceRes.audioPath)}`;
                  }
                }

                const epVideoName = `Tap_${String(ep).padStart(2, '0')}.mp4`;
                const epVideoPath = path.join(playlistDir, epVideoName);
                fs.copyFileSync(epVideoSource, epVideoPath);

                playlistVideos.push({
                  episode: ep,
                  title: `Tập ${ep}: Chuyên đề ${options.topic || 'Bài giảng'}`,
                  videoUrl: `/downloads/${playlistSlug}/${epVideoName}`,
                  videoPath: epVideoPath,
                  audioUrl: epAudioUrl || undefined,
                  audioPath: epAudioPath || undefined,
                });

                onProgress({
                  step: 'RENDERING_VIDEO',
                  progress: Math.floor((ep / seriesCount) * 95),
                  message: `✓ Đã hoàn thành xuất sắc [${epLabel}]${epAudioPath ? ' (kèm lồng tiếng AI)' : ''}!`,
                  playlistVideos: playlistVideos,
                  isSeries: true,
                  seriesCount: seriesCount,
                  currentEpisode: ep,
                  contentType: 'manim'
                });
              }
            }

            const indexMd = `# DANH SÁCH PHÁT PLAYLIST VIDEO (${playlistVideos.length} Tập)\n\nChủ đề: ${options.topic || 'Chuyên đề'}\n\n` + 
              playlistVideos.map(v => `- **Tập ${v.episode}:** ${v.title} (${path.basename(v.videoPath)})${v.audioPath ? ` [Audio: ${path.basename(v.audioPath)}]` : ''}`).join('\n') + '\n';
            fs.writeFileSync(path.join(playlistDir, 'danh_sach_phat.md'), indexMd, 'utf-8');

            onProgress({
              step: 'COMPLETED',
              progress: 100,
              message: `🎉 Hoàn tất 1-Click! Đã sản xuất trọn bộ playlist ${playlistVideos.length} tập video MP4${options.enableVoice !== false ? ' kèm thuyết minh giọng đọc AI' : ''}!`,
              videoUrl: playlistVideos[0] ? playlistVideos[0].videoUrl : undefined,
              videoPath: playlistVideos[0] ? playlistVideos[0].videoPath : undefined,
              audioUrl: playlistVideos[0] ? playlistVideos[0].audioUrl : undefined,
              audioPath: playlistVideos[0] ? playlistVideos[0].audioPath : undefined,
              filePath: path.join(playlistDir, 'danh_sach_phat.md'),
              isSeries: true,
              seriesCount: seriesCount,
              playlistVideos: playlistVideos,
              contentType: 'manim'
            });
            return;
          }
        } else {
          onProgress({
            step: 'COMPLETED',
            progress: 100,
            message: 'Hoàn tất 1-Click! Đã lưu scene.py, render_manim.sh và render_manim.bat.',
            manimCode: finalPython,
            latexCode: finalPython,
            filePath: sceneFilePath,
            contentType: 'manim',
          });
          return;
        }
      }

      if (isScriptTask) {
        onProgress({
          step: 'EXTRACTING_LATEX',
          progress: 70,
          message: 'Đang bóc tách kịch bản phân cảnh và xuất file phụ đề...',
        });

        const extractedScript = await aiPage.evaluate(() => {
          const blocks = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
          );
          const lastBlock = blocks[blocks.length - 1];
          return lastBlock ? (lastBlock.textContent || (lastBlock as HTMLElement).innerText || '') : '';
        });

        const scriptContent = extractedScript || options.prompt;
        const scriptFilePath = path.join(outputDirectory, 'kich_ban_video.md');
        fs.writeFileSync(scriptFilePath, scriptContent, 'utf-8');

        // Phân tích timestamp và xuất phụ đề .SRT
        const lines = scriptContent.split('\n');
        const srtEntries: { start: string; end: string; text: string }[] = [];
        const timeRegex = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2}|Cuối)/i;
        const toSrtTime = (t: string) => {
          const parts = t.split(':').map(p => parseInt(p, 10));
          let m = 0, s = 0;
          if (parts.length === 2) { m = parts[0]; s = parts[1]; }
          else if (parts.length === 3) { return `${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}:${String(parts[2]).padStart(2, '0')},000`; }
          return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},000`;
        };

        for (const line of lines) {
          if (!line.includes('|')) continue;
          const cells = line.split('|').map(c => c.trim()).filter(Boolean);
          if (cells.length >= 3) {
            const timeCell = cells[0];
            const match = timeCell.match(timeRegex);
            if (match) {
              const startTime = match[1];
              let endTime = match[2].toLowerCase() === 'cuối' ? '01:00' : match[2];
              let voiceText = (cells[2] || cells[1]).replace(/^[“"\[]+|[”"\]]+$/g, '').trim();
              if (voiceText && !voiceText.includes('Lời thoại')) {
                srtEntries.push({ start: toSrtTime(startTime), end: toSrtTime(endTime), text: voiceText });
              }
            }
          }
        }

        const srtContent = srtEntries.length > 0 
          ? srtEntries.map((e, idx) => `${idx + 1}\n${e.start} --> ${e.end}\n${e.text}\n`).join('\n')
          : `1\n00:00:00,000 --> 00:00:10,000\nKịch bản Video Yuta!LaTeX\n`;

        const srtFilePath = path.join(outputDirectory, 'phude.srt');
        fs.writeFileSync(srtFilePath, srtContent, 'utf-8');

        onProgress({
          step: 'COMPLETED',
          progress: 100,
          message: 'Hoàn tất 1-Click! Đã lưu kich_ban_video.md và phude.srt.',
          scriptContent: scriptContent,
          srtContent: srtContent,
          latexCode: scriptContent,
          filePath: scriptFilePath,
          contentType: 'script',
        });
        return;
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
