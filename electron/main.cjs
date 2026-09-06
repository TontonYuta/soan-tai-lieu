const { app, BrowserWindow, shell, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');
const { spawn, exec, execSync } = require('child_process');

// Tự động bổ sung các thư mục venv & bin hệ thống vào process.env.PATH cho mọi child_process
const homeDir = os.homedir();
const extraPaths = [
  path.join(homeDir, '.venv', 'bin'),
  path.join(homeDir, '.local', 'bin'),
  path.join(process.cwd(), '.venv', 'bin'),
  '/usr/local/bin',
  '/usr/bin',
  '/bin',
];
const validExtra = extraPaths.filter(p => fs.existsSync(p));
process.env.PATH = Array.from(new Set([...validExtra, ...(process.env.PATH || '').split(':')])).filter(Boolean).join(':');

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
  '.py': 'text/plain; charset=utf-8',
  '.srt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.md': 'text/markdown; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function findNewestMp4(dir) {
  if (!fs.existsSync(dir)) return null;
  let newestFile = null;

  const scan = (currentDir) => {
    if (path.basename(currentDir) === 'partial_movie_files') return;
    let entries = [];
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

function extractAndSanitizeLatex(text) {
  if (!text) return '';
  let cleaned = text.trim();

  const docClassIdx = cleaned.indexOf('\\documentclass');
  if (docClassIdx !== -1) {
    cleaned = cleaned.slice(docClassIdx);
  } else {
    cleaned = cleaned.replace(/^```(?:latex|tex)?\s*/i, '');
  }

  cleaned = cleaned.replace(/\s*```\s*$/, '');

  const endDocIdx = cleaned.indexOf('\\end{document}');
  if (endDocIdx !== -1) {
    cleaned = cleaned.slice(0, endDocIdx + '\\end{document}'.length);
  } else {
    const openEnvs = [];
    const envRegex = /\\(?:begin|end)\{([a-zA-Z0-9_*]+)\}/g;
    let match;
    while ((match = envRegex.exec(cleaned)) !== null) {
      if (match[0].startsWith('\\begin')) {
        openEnvs.push(match[1]);
      } else if (match[0].startsWith('\\end') && openEnvs.length > 0) {
        const last = openEnvs[openEnvs.length - 1];
        if (last === match[1]) openEnvs.pop();
      }
    }

    let closingCode = '\n';
    while (openEnvs.length > 0) {
      const env = openEnvs.pop();
      closingCode += `\\end{${env}}\n`;
    }
    if (!cleaned.includes('\\end{document}')) {
      closingCode += '\\end{document}\n';
    }
    cleaned += closingCode;
  }

  return cleaned;
}

function cleanStaleChromiumLocks(profileDir, force = false) {
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
        fs.rmSync(p, { force: true, recursive: true });
      } catch {
        try { fs.unlinkSync(p); } catch {}
      }
    }
  }
}

function getVenvPaths() {
  const isWin = process.platform === 'win32';
  const candidates = [
    path.resolve(process.cwd(), '.venv'),
    path.resolve(__dirname, '..', '.venv'),
    path.resolve(__dirname, '..', '..', '.venv'),
    path.resolve('/home/tontonyuta/soan-tai-lieu', '.venv'),
    path.resolve(os.homedir(), '.venv'),
  ];
  if (typeof app !== 'undefined' && app && app.getAppPath) {
    try {
      candidates.push(path.resolve(app.getAppPath(), '.venv'));
      candidates.push(path.resolve(app.getAppPath(), '..', '.venv'));
      candidates.push(path.resolve(app.getAppPath(), '..', '..', '.venv'));
    } catch {}
  }

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

function getAgyExecutable() {
  const possiblePaths = [
    '/home/tontonyuta/.local/bin/agy',
    path.join(os.homedir(), '.local', 'bin', 'agy'),
    '/usr/local/bin/agy',
    '/usr/bin/agy'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'agy';
}

async function runAgyPrompt(promptText, cwdDir, modelName, onProgress, timeoutMs = 300000) {
  if (typeof modelName === 'function') {
    timeoutMs = onProgress || 300000;
    onProgress = modelName;
    modelName = undefined;
  }

  const agyExec = getAgyExecutable();
  const { spawn } = require('child_process');

  const args = [
    '-p', promptText,
    '--output-format', 'stream-json',
    '--dangerously-skip-permissions'
  ];

  if (modelName && typeof modelName === 'string' && modelName !== 'antigravity-local') {
    args.push('--model', modelName);
  }

  const agyProcess = spawn(agyExec, args, {
    cwd: cwdDir || process.cwd(),
    env: { ...process.env, PATH: `${path.join(os.homedir(), '.local', 'bin')}:${process.env.PATH}` }
  });

  if (typeof activeRunner !== 'undefined' && activeRunner) {
    activeRunner.cancel = () => {
      try { agyProcess.kill('SIGTERM'); } catch {}
    };
  }

  let responseText = '';
  return new Promise((resolve, reject) => {
    let lineBuffer = '';
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try { agyProcess.kill('SIGKILL'); } catch {}
        if (responseText.length > 0) {
          resolve(responseText);
        } else {
          reject(new Error('Antigravity CLI bị quá thời gian xử lý (Timeout 5 phút).'));
        }
      }
    }, timeoutMs);

    agyProcess.stdout.on('data', (chunk) => {
      lineBuffer += chunk.toString('utf-8');
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const json = JSON.parse(trimmed);
          if (json.event === 'step_update' && json.step_update && json.step_update.text_delta) {
            const delta = json.step_update.text_delta;
            responseText += delta;
            if (onProgress) onProgress(delta, responseText);
          } else if (json.event === 'result' && json.result && json.result.response) {
            if (!responseText) responseText = json.result.response;
          }
        } catch (e) {
          responseText += trimmed + '\n';
        }
      }
    });

    agyProcess.stderr.on('data', (data) => {
      console.warn('[Antigravity stderr]:', data.toString());
    });

    agyProcess.on('close', (code) => {
      clearTimeout(timer);
      if (isSettled) return;
      isSettled = true;

      if (lineBuffer.trim()) {
        try {
          const json = JSON.parse(lineBuffer.trim());
          if (json.result && json.result.response && !responseText) {
            responseText = json.result.response;
          }
        } catch {}
      }
      if (code === 0 || responseText.length > 0) {
        resolve(responseText);
      } else {
        reject(new Error(`Antigravity CLI thoát với mã lỗi ${code}`));
      }
    });

    agyProcess.on('error', (err) => {
      clearTimeout(timer);
      if (!isSettled) {
        isSettled = true;
        reject(err);
      }
    });
  });
}

function extractPythonManimCode(text) {
  if (!text) return null;
  const pythonBlocks = Array.from(text.matchAll(/```(?:python|py)?\s*([\s\S]*?)```/gi));
  for (const match of pythonBlocks) {
    const code = match[1].trim();
    if (code.includes('from manim') || code.includes('class ') || code.includes('def construct')) {
      return code;
    }
  }
  const startIdx = text.indexOf('from manim import');
  if (startIdx >= 0) {
    const slice = text.slice(startIdx);
    const endIdx = slice.indexOf('```');
    return (endIdx > 0 ? slice.slice(0, endIdx) : slice).trim();
  }
  const classMatch = text.match(/class\s+[A-Za-z0-9_]+\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)[\s\S]+/);
  if (classMatch) {
    const slice = classMatch[0];
    const endIdx = slice.indexOf('```');
    return (endIdx > 0 ? slice.slice(0, endIdx) : slice).trim();
  }
  return null;
}

async function installPythonPackage(pkgName, onLog) {
  const { pipBin } = getVenvPaths();
  const isWin = process.platform === 'win32';
  const targetPip = fs.existsSync(pipBin) ? pipBin : (isWin ? 'pip' : 'pip3');
  const { spawn } = require('child_process');
  return new Promise((resolve) => {
    const proc = spawn(targetPip, ['install', pkgName]);
    proc.stdout?.on('data', d => { if (onLog) onLog(d.toString()); });
    proc.stderr?.on('data', d => { if (onLog) onLog(d.toString()); });
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}

async function ensureManimEnvironment(onLog) {
  const { venvDir, pythonBin, pipBin, manimBin } = getVenvPaths();
  if (fs.existsSync(manimBin)) return manimBin;

  try {
    const whichCmd = process.platform === 'win32' ? 'where manim' : 'which manim';
    const out = require('child_process').execSync(whichCmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
    const trimmed = out.trim().split(/\r?\n/)[0].trim();
    if (trimmed && fs.existsSync(trimmed)) return trimmed;
  } catch {}

  if (onLog) onLog('Đang tự động khởi tạo môi trường Python và cài đặt Manim CE...');
  const { spawn } = require('child_process');

  if (!fs.existsSync(pythonBin)) {
    const isWin = process.platform === 'win32';
    const sysPython = isWin ? 'python' : 'python3';
    try {
      await new Promise((resolve, reject) => {
        const proc = spawn(sysPython, ['-m', 'venv', venvDir]);
        proc.on('close', code => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
        proc.on('error', err => reject(err));
      });
    } catch (e) {
      if (onLog) onLog(`Lỗi khởi tạo venv: ${e.message}`);
      return null;
    }
  }

  if (fs.existsSync(pipBin)) {
    if (onLog) onLog('Đang tải và cài đặt Manim CE + SymPy qua pip (vui lòng đợi 1-2 phút)...');
    try {
      await new Promise((resolve, reject) => {
        const proc = spawn(pipBin, ['install', 'manim', 'sympy']);
        proc.on('close', code => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
        proc.on('error', err => reject(err));
      });
    } catch (e) {
      if (onLog) onLog(`Lỗi cài đặt Manim: ${e.message}`);
      return null;
    }
  }

  if (fs.existsSync(manimBin)) return manimBin;
  return null;
}

async function autoInstallMissingDependencies(code, onLog) {
  const { pythonBin } = getVenvPaths();
  if (!fs.existsSync(pythonBin)) return;

  const importRegex = /(?:^|\n)\s*(?:import|from)\s+([a-zA-Z0-9_]+)/g;
  const standardModules = new Set([
    'sys', 'os', 'math', 'random', 'time', 're', 'json', 'datetime',
    'collections', 'itertools', 'functools', 'typing', 'abc', 'copy',
    'io', 'pathlib', 'fractions', 'cmath', 'decimal', 'manim', 'numpy',
    'scipy', 'PIL', 'pillow', 'pydub', 'screeninfo', 'srt', 'subprocess'
  ]);

  const matches = Array.from(code.matchAll(importRegex));
  const checked = new Set();
  const { spawn } = require('child_process');

  for (const m of matches) {
    const pkg = m[1];
    if (standardModules.has(pkg) || checked.has(pkg)) continue;
    checked.add(pkg);

    const canImport = await new Promise((resolve) => {
      const proc = spawn(pythonBin, ['-c', `import ${pkg}`]);
      proc.on('close', code => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });

    if (!canImport) {
      if (onLog) onLog(`Phát hiện code cần thư viện "${pkg}", đang tự động cài đặt...`);
      await installPythonPackage(pkg, onLog);
    }
  }
}

function prepareManimPythonCode(code) {
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

  // Đảm bảo hàm construct(self) kết thúc bằng self.wait(3) để hiển thị đầy đủ màn hình cuối cùng
  if (processed.includes('def construct') && !/self\.wait\(\s*\d+\s*\)\s*$/s.test(processed.trim())) {
    processed += '\n        self.wait(3)\n';
  }

  const polyfillSnippet = `
# ==========================================
# YUTA MANIM ENGINE - COMPATIBILITY POLYFILLS
# ==========================================
try:
    # 0. Color polyfills cho các tên màu thông dụng trong Manim
    if 'CYAN' not in globals():
        CYAN = TEAL
    if 'ORANGE' not in globals():
        ORANGE = "#FF7F00"
    if 'MAGENTA' not in globals():
        MAGENTA = "#FF00FF"
    if 'LIME' not in globals():
        LIME = "#00FF00"
    if 'PURPLE_A' not in globals():
        PURPLE_A = PURPLE
    if 'DARK_BLUE' not in globals():
        DARK_BLUE = BLUE_E
    if 'LIGHT_BLUE' not in globals():
        LIGHT_BLUE = BLUE_A
except Exception:
    pass

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
    # 1.2 Tự động chuẩn hóa font Times New Roman / Liberation Serif / Be Vietnam Pro / Inter đẹp mắt cho toàn bộ Text
    _orig_text_init = Text.__init__
    def _smart_text_init(self, text, *args, **kwargs):
        if 'line_spacing' not in kwargs:
            kwargs['line_spacing'] = 1.2
        f = kwargs.get('font', None)
        if not f or f in ('sans-serif', 'sans', 'default', ''):
            font_candidates = ['Times New Roman', 'Liberation Serif', 'Be Vietnam Pro', 'Inter', 'DejaVu Serif', 'JetBrains Mono', 'Roboto', 'FreeSerif']
            success = False
            for font_name in font_candidates:
                try:
                    kwargs['font'] = font_name
                    if 'weight' not in kwargs:
                        kwargs['weight'] = 'BOLD'
                    _orig_text_init(self, text, *args, **kwargs)
                    success = True
                    break
                except Exception:
                    continue
            if not success:
                kwargs['font'] = 'serif'
                _orig_text_init(self, text, *args, **kwargs)
        else:
            try:
                _orig_text_init(self, text, *args, **kwargs)
            except Exception:
                fallbacks = ['Times New Roman', 'Liberation Serif', 'Be Vietnam Pro', 'Inter', 'sans-serif', 'serif']
                for fb in fallbacks:
                    try:
                        kwargs['font'] = fb
                        _orig_text_init(self, text, *args, **kwargs)
                        break
                    except Exception:
                        continue
    Text.__init__ = _smart_text_init

    # Font Helpers tiện lợi cho Manim Python
    def SerifText(text, *args, **kwargs):
        kwargs.setdefault('font', 'Times New Roman')
        try:
            return Text(text, *args, **kwargs)
        except Exception:
            kwargs['font'] = 'Liberation Serif'
            return Text(text, *args, **kwargs)

    def MonoText(text, *args, **kwargs):
        kwargs.setdefault('font', 'JetBrains Mono')
        try:
            return Text(text, *args, **kwargs)
        except Exception:
            kwargs['font'] = 'DejaVu Sans Mono'
            return Text(text, *args, **kwargs)

    def CodeText(text, *args, **kwargs):
        return MonoText(text, *args, **kwargs)
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

function parseManimError(stderr = '', stdout = '', workingDir = '') {
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
  let sceneLine = null;
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

function sanitizeLatexVietnamese(pythonCode) {
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

function extractNarrationText(pythonCode, fallbackTopic = '') {
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

  // Chuẩn hóa và làm sạch văn bản cho giọng đọc tự nhiên (Tạo khoảng ngắt nghỉ giữa các phân cảnh)
  narration = narration
    .replace(/[\r\n]+/g, ' ... ')
    .replace(/\s*[-•]\s*/g, ' ... ')
    .replace(/\\n/g, ' ... ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[\$\{\}\[\]\(\)]/g, ' ')
    .replace(/\s*;\s*/g, ' ... ')
    .replace(/\s*\.\.\.\s*/g, ' ... ')
    .replace(/\s+/g, ' ')
    .trim();

  return narration;
}

async function generateVoiceoverAndMux({
  mp4Path,
  pythonCode,
  workingDir,
  voiceName = 'vi-VN-HoaiMyNeural',
  voiceSpeed = '+0%',
  fallbackTopic = '',
  onStatus,
}) {
  if (!mp4Path || !fs.existsSync(mp4Path)) {
    return { success: false, mp4Path, audioPath: null };
  }

  const narration = extractNarrationText(pythonCode, fallbackTopic);
  if (!narration) {
    return { success: false, mp4Path, audioPath: null };
  }

  const { venvDir, pythonBin, edgeTtsBin } = getVenvPaths();
  const isWin = process.platform === 'win32';

  // 1. Tìm hoặc tự cài edge-tts nếu thiếu
  let resolvedTtsBin = fs.existsSync(edgeTtsBin) ? edgeTtsBin : null;
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
    const installed = await installPythonPackage('edge-tts', onStatus);
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
  const ttsSuccess = await new Promise((resolve) => {
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
    } catch (e) {
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

function getMediaDuration(filePath) {
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

  if (onStatus) onStatus('🎬 Đang lồng tiếng và đồng bộ âm thanh vào video MP4 (FFmpeg remux)...');

  const muxedMp4FileName = `video_voice_${Date.now()}.mp4`;
  const muxedMp4Path = path.join(workingDir, muxedMp4FileName);

  const videoDur = getMediaDuration(mp4Path);
  const audioDur = getMediaDuration(mp3Path);

  let ffmpegArgs = ['-y'];

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
    } else if (videoDur > audioDur + 0.5) {
      // Video dài hơn audio: Giữ nguyên toàn bộ thời lượng video gốc, pad âm thanh bằng khoảng lặng cho khớp thời lượng
      const padSec = (videoDur - audioDur).toFixed(2);
      ffmpegArgs.push(
        '-i', mp4Path,
        '-i', mp3Path,
        '-filter_complex', `[1:a]apad=pad_dur=${padSec}[a]`,
        '-map', '0:v:0',
        '-map', '[a]',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
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

  const muxSuccess = await new Promise((resolve) => {
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

    // 1.5. API: Antigravity Quota Status
    if (pathname === '/api/antigravity/quota' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      let conversationCount = 0;
      try {
        const brainDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
        if (fs.existsSync(brainDir)) {
          conversationCount = fs.readdirSync(brainDir).length;
        }
      } catch {}

      const fiveHour = Math.max(35, Math.min(100, 100 - (conversationCount % 6) * 5));
      const weekly = Math.max(45, Math.min(100, 100 - Math.floor(conversationCount / 3) * 2));

      res.end(JSON.stringify({
        weekly: weekly,
        fiveHour: fiveHour,
        status: '🟢 Khả dụng (Antigravity Agent Active)',
        engine: 'Google Antigravity CLI',
        limitDesc: '5h / 1w'
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

    // 5b. API: View PDF Stream (hỗ trợ hiển thị PDF Live Review / RAG PDF Viewer)
    if (pathname.startsWith('/api/view-pdf')) {
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
        const filePath = parsedUrl.searchParams.get('path');
        if (filePath && fs.existsSync(filePath) && filePath.toLowerCase().endsWith('.pdf')) {
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': stat.size,
            'Content-Disposition': 'inline; filename="preview.pdf"',
            'Accept-Ranges': 'bytes'
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('File PDF không tồn tại.');
          return;
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Lỗi đọc file PDF: ${err.message}`);
        return;
      }
    }

    // Đảm bảo mở phiên chat mới tinh sạch sẽ (100% không dính context chat cũ)
    async function ensureFreshChatSession(page, targetAiUrl, aiName, sendSSE) {
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
          if (sendSSE) {
            sendSSE({
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
      } catch (freshErr) {
        console.warn('ensureFreshChatSession warning:', freshErr.message);
      }
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
          const rawProvider = (options.aiProvider || options.provider || (options.model && options.model.startsWith('chatgpt') ? 'chatgpt' : 'antigravity')).toLowerCase();
          const providerKey = (rawProvider === 'gemini' || rawProvider === 'antigravity') ? 'antigravity' : rawProvider;

          if (providerKey === 'antigravity') {
            activeRunner = {
              cancel: () => {}
            };

            sendSSE({
              step: 'CONNECTING_CHROME',
              progress: 10,
              message: '🚀 Khởi động Antigravity Local Agent Engine (Không cần API Key)...',
            });

            const downloadsDir = path.join(os.homedir(), 'Downloads');
            if (!fs.existsSync(downloadsDir)) {
              fs.mkdirSync(downloadsDir, { recursive: true });
            }

            sendSSE({
              step: 'SENDING_PROMPT',
              progress: 25,
              message: 'Đang gửi Prompt tới Antigravity CLI...',
            });

            try {
              let promptToSend = options.prompt;
              const selectedModel = options.model || options.selectedModel || 'gemini-3.8-flash-high';
              const isManimTask = promptToSend.includes('Manim') || 
                                  promptToSend.includes('Scene') || 
                                  promptToSend.includes('scene.py') ||
                                  promptToSend.includes('VOICEOVER_SCRIPT') ||
                                  promptToSend.includes('KỊCH BẢN SƯ PHẠM');

              // Bổ sung chỉ thị cho Antigravity Agent nếu là bài giảng Video
              if (isManimTask && !promptToSend.includes('MainScene')) {
                promptToSend += `\n\nYÊU CẦU BẮT BUỘC CHO VIDEO MANIM CE:\n- Xuất Kịch bản Sư phạm VÀ Khối mã Python Manim CE duy nhất trong \`\`\`python ... \`\`\` có \`class MainScene(Scene)\` và \`def construct(self):\` để có thể render ngay.`;
              }

              let lastProgressReport = Date.now();
              const responseText = await runAgyPrompt(promptToSend, downloadsDir, selectedModel, (delta, fullText) => {
                if (Date.now() - lastProgressReport > 400) {
                  lastProgressReport = Date.now();
                  sendSSE({
                    step: 'WAITING_GEMINI',
                    progress: Math.min(55, 25 + Math.floor(fullText.length / 40)),
                    message: `Antigravity Agent đang sinh phản hồi... (${fullText.length} ký tự)`,
                  });
                }
              });

              if (isManimTask) {
                sendSSE({
                  step: 'EXTRACTING_LATEX',
                  progress: 60,
                  message: 'Đang bóc tách mã nguồn Python Manim CE & Kịch bản...',
                });

                // Bóc tách code Python từ Lượt 1
                let extractedPython = extractPythonManimCode(responseText);

                // NẾU LƯỢT 1 LÀ KỊCH BẢN / CHƯA CÓ CODE PYTHON -> TỰ ĐỘNG GỬI LƯỢT 2 CHO ANTIGRAVITY!
                if (!extractedPython || (!extractedPython.includes('class ') && !extractedPython.includes('def construct'))) {
                  sendSSE({
                    step: 'SENDING_PROMPT',
                    progress: 64,
                    message: '✓ [Lượt 1/2] Antigravity đã tạo Kịch bản Sư phạm! Đang tự động gửi [Lượt 2/2] để xuất mã Python Manim CE (scene.py)...',
                  });

                  const isVertical = options.prompt.includes('9:16') || options.prompt.includes('DỌC');
                  const targetDuration = options.duration || '3 - 5 phút';
                  const qualityFlag = options.renderQuality === '4k' ? '-pqk' : options.renderQuality === '480p' ? '-pql' : '-pqh';
                  const codeFollowupPrompt = `Dựa trên kịch bản sư phạm và nội dung bài học toán sau:
Topic: ${options.topic || options.subject || 'Toán học'}
Thời lượng mục tiêu: ${targetDuration}
Nội dung kịch bản:
${responseText.slice(0, 2000)}

Hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.

YÊU CẦU BẮT BUỘC KHÔNG ĐƯỢC BỎ QUA:
1. BẮT BUỘC bắt đầu bằng khối mã \`\`\`python ... \`\`\`
2. BẮT BUỘC có dòng đầu: from manim import *
3. BẮT BUỘC có class MainScene(Scene) hoặc class MainScene(ThreeDScene) chứa def construct(self):
4. ${isVertical ? 'Cấu hình khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0).' : 'Cấu hình khung hình NGANG 16:9 (1920x1080).'}
5. BẮT BUỘC khớp đúng thời lượng mục tiêu: ${targetDuration} (điều chỉnh số phân cảnh, khối kịch bản lời thoại VOICEOVER_SCRIPT và các khoảng self.wait(2.0-4.0) giữa các bước).
6. 100% công thức MathTex(r"...") dùng raw string r"...".
7. TUYỆT ĐỐI CHỈ XUẤT MÃ PYTHON TRONG KHỐI \`\`\`python ... \`\`\`, KHÔNG VIẾT LỜI CHÀO HAY GIẢI THÍCH NGOÀI MÃ!
Lệnh render: \`manim ${qualityFlag} scene.py MainScene\`.`;

                  let turn2Report = Date.now();
                  const turn2Text = await runAgyPrompt(codeFollowupPrompt, downloadsDir, selectedModel, (delta, fullText) => {
                    if (Date.now() - turn2Report > 400) {
                      turn2Report = Date.now();
                      sendSSE({
                        step: 'WAITING_GEMINI',
                        progress: Math.min(73, 64 + Math.floor(fullText.length / 40)),
                        message: `[Lượt 2/2] Antigravity đang xuất mã Python Manim... (${fullText.length} ký tự)`,
                      });
                    }
                  });

                  extractedPython = extractPythonManimCode(turn2Text);
                }

                // FALLBACK TRỰC TIẾP NẾU CẢ 2 LƯỢT CHƯA NẠP ĐƯỢC CODE PYTHON
                if (!extractedPython || (!extractedPython.includes('class ') && !extractedPython.includes('def construct'))) {
                  sendSSE({
                    step: 'SENDING_PROMPT',
                    progress: 74,
                    message: '⚡ Antigravity đang khởi tạo lại mã Python Manim CE trực tiếp...',
                  });

                  const directPrompt = `Viết duy nhất 1 khối mã Python Manim CE (\`scene.py\`) hoàn chỉnh 100% để tạo video minh họa cho bài toán toán học chủ đề: "${options.topic || options.subject || 'Toán học'}". BẮT BUỘC bắt đầu bằng \`\`\`python from manim import * ... \`\`\` với class MainScene(Scene) và def construct(self):. KHÔNG VIẾT LỜI CHÀO!`;
                  const directText = await runAgyPrompt(directPrompt, downloadsDir, selectedModel);
                  extractedPython = extractPythonManimCode(directText);
                }

                if (!extractedPython || (!extractedPython.includes('class ') && !extractedPython.includes('def construct'))) {
                  sendSSE({
                    step: 'ERROR',
                    progress: 0,
                    message: '⚠️ Không nhận được mã Python Manim CE hợp lệ từ Antigravity Agent.',
                    error: 'No valid Manim code returned',
                  });
                  return;
                }

                let finalPython = prepareManimPythonCode(extractedPython);
                const sceneFilePath = path.join(downloadsDir, 'scene.py');
                fs.writeFileSync(sceneFilePath, finalPython, 'utf-8');

                // Script runner files
                const renderSh = `#!/bin/bash\nmanim -pqh scene.py MainScene\nxdg-open media/videos/scene/1080p60/MainScene.mp4 2>/dev/null || open media/videos/scene/1080p60/MainScene.mp4 2>/dev/null\n`;
                const renderBat = `@echo off\nchcp 65001 >nul\nmanim -pqh scene.py MainScene\nstart media\\videos\\scene\\1080p60\\MainScene.mp4\n`;
                fs.writeFileSync(path.join(downloadsDir, 'render_manim.sh'), renderSh, 'utf-8');
                fs.writeFileSync(path.join(downloadsDir, 'render_manim.bat'), renderBat, 'utf-8');

                // Subtitles & TTS
                const srtMatch = responseText.match(/```(?:srt)?\s*(1\r?\n00:00:[\s\S]*?)```/i);
                let srtContent = srtMatch ? srtMatch[1] : undefined;
                if (srtContent) {
                  fs.writeFileSync(path.join(downloadsDir, 'phude.srt'), srtContent, 'utf-8');
                }

                const manimBin = await ensureManimEnvironment((msg) => {
                  sendSSE({ step: 'RENDERING_VIDEO', progress: 74, message: msg });
                });

                if (!manimBin) {
                  sendSSE({
                    step: 'COMPLETED',
                    progress: 100,
                    message: '🎉 Antigravity Agent đã sinh mã scene.py thành công (Chưa cài đặt Manim CE)!',
                    manimCode: finalPython,
                    scriptContent: responseText,
                    srtContent: srtContent,
                    filePath: sceneFilePath,
                    contentType: 'manim'
                  });
                  return;
                }

                // BIÊN DỊCH & VÒNG LẶP AUTO-HEALING LỖI DÙNG ANTIGRAVITY AGENT
                let currentPython = finalPython;
                let renderSuccess = false;
                let finalMp4Path = null;
                let lastErrorMsg = '';

                for (let attempt = 1; attempt <= 5; attempt++) {
                  currentPython = prepareManimPythonCode(currentPython);
                  fs.writeFileSync(sceneFilePath, currentPython, 'utf-8');

                  let sceneClass = 'MainScene';
                  const sceneMatch = currentPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
                  if (sceneMatch && sceneMatch[1]) sceneClass = sceneMatch[1];

                  sendSSE({
                    step: 'RENDERING_VIDEO',
                    progress: Math.min(95, 75 + (attempt - 1) * 4),
                    message: attempt === 1
                      ? `Đang biên dịch Manim CE (${sceneClass})...`
                      : `⚠️ Đang biên dịch lại sau khi Antigravity sửa mã (Lần ${attempt}/5)...`,
                    manimCode: currentPython,
                    filePath: sceneFilePath,
                    contentType: 'manim',
                  });

                  const qualityFlag = options.renderQuality === '4k' ? '-pqk' : options.renderQuality === '480p' ? '-pql' : '-pqh';
                  const mediaDir = path.join(downloadsDir, 'media');

                  const renderResult = await new Promise((resRender) => {
                    const proc = spawn(manimBin, [qualityFlag, '--media_dir', mediaDir, sceneFilePath, sceneClass], { cwd: downloadsDir });
                    let stderr = '';
                    let stdout = '';
                    proc.stdout.on('data', d => { stdout += d.toString(); });
                    proc.stderr.on('data', d => { stderr += d.toString(); });
                    proc.on('close', code => {
                      if (code === 0) {
                        const newest = findNewestMp4(mediaDir);
                        if (newest) return resRender({ success: true, mp4Path: newest });
                      }
                      const parsed = parseManimError(stderr, stdout, downloadsDir);
                      resRender({ success: false, error: parsed.summary, detailsForAI: parsed.detailsForAI });
                    });
                    proc.on('error', err => resRender({ success: false, error: err.message, detailsForAI: err.message }));
                  });

                  if (renderResult.success && renderResult.mp4Path) {
                    renderSuccess = true;
                    finalMp4Path = renderResult.mp4Path;
                    break;
                  }

                  lastErrorMsg = renderResult.error || 'Lỗi render không xác định';

                  // TỰ ĐỘNG CÀI ĐẶT MODULE THIẾU
                  const missingMatch = (renderResult.detailsForAI + ' ' + lastErrorMsg).match(/ModuleNotFoundError:\s*No module named\s*['"]([a-zA-Z0-9_-]+)['"]/i);
                  if (missingMatch && missingMatch[1] && attempt < 5) {
                    const missingLib = missingMatch[1];
                    sendSSE({
                      step: 'RENDERING_VIDEO',
                      progress: 76,
                      message: `Phát hiện thiếu thư viện "${missingLib}", đang tự động cài đặt qua pip...`,
                    });
                    await installPythonPackage(missingLib);
                    continue;
                  }

                  // GỬI LOG LỖI CHO ANTIGRAVITY TỰ FIX CODE!
                  if (attempt < 5) {
                    sendSSE({
                      step: 'RENDERING_VIDEO',
                      progress: 78,
                      message: `⚠️ Lỗi render Manim: ${lastErrorMsg.slice(0, 80)}... Đang gửi log lỗi để Antigravity Agent tự sửa mã (Lần ${attempt + 1}/5)...`,
                      manimCode: currentPython,
                      contentType: 'manim',
                    });

                    const healPrompt = `Mã nguồn Manim scene.py bạn vừa tạo khi biên dịch bằng Manim CE gặp lỗi sau:
--------------------------------------------------
${renderResult.detailsForAI || lastErrorMsg}
--------------------------------------------------

YÊU CẦU BẮT BUỘC ĐỂ SỬA LỖI:
1. Đọc kỹ vị trí dòng lỗi và chỉ dẫn sửa lỗi ở trên để khắc phục triệt để.
2. Viết lại TOÀN BỘ file scene.py hoàn chỉnh, ngắn gọn súc tích (dưới 140 dòng lệnh).
3. Đảm bảo đóng đầy đủ mọi dấu ngoặc, kết thúc hàm construct(self) bằng self.wait(2).
4. Giữ nguyên class MainScene(Scene) hoặc tên Scene tương ứng, cấu hình Dual-Zone và MathTex(r"...").
5. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, KHÔNG viết lời chào hay giải thích ngoài mã.`;

                    const healedText = await runAgyPrompt(healPrompt, downloadsDir, selectedModel);
                    const healedMatch = healedText.match(/```(?:python|py)?\s*([\s\S]*?)```/i);
                    if (healedMatch && healedMatch[1].length > 50) {
                      currentPython = healedMatch[1];
                    }
                  }
                }

                // TỔNG HỢP THUYẾT MINH GIỌNG ĐỌC AI
                let audioPath = null;
                let finalVideoWithAudio = finalMp4Path;
                if (renderSuccess && finalMp4Path && options.enableVoice !== false) {
                  try {
                    const ttsRes = await generateVoiceoverAndMux({
                      pythonCode: currentPython,
                      mp4Path: finalMp4Path,
                      workingDir: downloadsDir,
                      voiceName: options.voiceName || 'vi-VN-HoaiMyNeural',
                      voiceSpeed: options.voiceSpeed || '+0%',
                      fallbackTopic: options.topic || options.subject || 'Toán học',
                      onStatus: (msg) => {
                        sendSSE({ step: 'RENDERING_VIDEO', progress: 96, message: msg });
                      }
                    });
                    if (ttsRes && ttsRes.audioPath) {
                      audioPath = ttsRes.audioPath;
                    }
                    if (ttsRes && ttsRes.mp4Path) {
                      finalVideoWithAudio = ttsRes.mp4Path;
                    }
                  } catch (e) {
                    console.warn('Voiceover synthesis warning:', e.message);
                  }
                }

                const relMp4 = finalVideoWithAudio ? path.relative(downloadsDir, finalVideoWithAudio) : undefined;
                const relAudio = audioPath ? path.relative(downloadsDir, audioPath) : undefined;

                sendSSE({
                  step: 'COMPLETED',
                  progress: 100,
                  message: renderSuccess
                    ? `🎉 Antigravity Agent đã hoàn tất render video Manim MP4${audioPath ? ' kèm thuyết minh giọng đọc AI' : ''}!`
                    : `⚠️ Đã sinh mã scene.py nhưng render video chưa hoàn thành: ${lastErrorMsg}`,
                  manimCode: currentPython,
                  scriptContent: responseText,
                  srtContent: srtContent,
                  videoPath: finalVideoWithAudio || finalMp4Path || undefined,
                  videoUrl: relMp4 ? `/downloads/${relMp4}` : undefined,
                  audioPath: audioPath || undefined,
                  audioUrl: relAudio ? `/downloads/${relAudio}` : undefined,
                  filePath: sceneFilePath,
                  contentType: 'manim'
                });
                return;
              }

              let finalLatex = extractAndSanitizeLatex(responseText);
              const timestamp = Date.now();
              const texFileName = `tailieu_${timestamp}.tex`;
              const pdfFileName = `tailieu_${timestamp}.pdf`;
              const texPath = path.join(downloadsDir, texFileName);
              const pdfPath = path.join(downloadsDir, pdfFileName);
              fs.writeFileSync(texPath, finalLatex, 'utf-8');

              // Tạo các file script hỗ trợ compile thủ công nếu cần
              const compileSh = `#!/bin/bash\npdflatex -interaction=nonstopmode "${texFileName}"\npdflatex -interaction=nonstopmode "${texFileName}"\nrm -f *.aux *.log *.out *.toc\n`;
              const compileBat = `@echo off\nchcp 65001 >nul\npdflatex -interaction=nonstopmode "${texFileName}"\npdflatex -interaction=nonstopmode "${texFileName}"\ndel *.aux *.log *.out *.toc 2>nul\n`;
              fs.writeFileSync(path.join(downloadsDir, 'compile_latex.sh'), compileSh, 'utf-8');
              fs.writeFileSync(path.join(downloadsDir, 'compile_latex.bat'), compileBat, 'utf-8');

              // Thử tự động biên dịch pdflatex
              sendSSE({
                step: 'RECOMPILING',
                progress: 90,
                message: '⚙️ Antigravity đang tiến hành biên dịch LaTeX ra PDF bằng pdflatex...',
              });

              const pdflatexBin = await new Promise((res) => {
                const whichCmd = process.platform === 'win32' ? 'where pdflatex' : 'which pdflatex';
                const { exec } = require('child_process');
                exec(whichCmd, (err, stdout) => {
                  if (!err && stdout.trim()) {
                    res(stdout.trim().split('\n')[0].trim());
                  } else {
                    res(null);
                  }
                });
              });

              let compiledPdfPath = null;
              if (pdflatexBin) {
                for (let pass = 1; pass <= 2; pass++) {
                  await new Promise((resPass) => {
                    const proc = spawn(pdflatexBin, [
                      '-interaction=nonstopmode',
                      `-output-directory=${downloadsDir}`,
                      texPath
                    ], { cwd: downloadsDir });
                    proc.on('close', () => resPass());
                    proc.on('error', () => resPass());
                  });
                }

                if (fs.existsSync(pdfPath)) {
                  compiledPdfPath = pdfPath;

                  // Tự động dọn dẹp các file rác trung gian của pdflatex (.aux, .log, .out, .toc)
                  const auxExtensions = ['.aux', '.log', '.out', '.toc', '.nav', '.snm'];
                  for (const ext of auxExtensions) {
                    const auxFile = path.join(downloadsDir, `tailieu_${timestamp}${ext}`);
                    if (fs.existsSync(auxFile)) {
                      try { fs.unlinkSync(auxFile); } catch {}
                    }
                  }
                }
              }

              sendSSE({
                step: 'COMPLETED',
                progress: 100,
                message: compiledPdfPath
                  ? '🎉 Antigravity Agent đã hoàn tất biên soạn & biên dịch PDF thành công!'
                  : '🎉 Antigravity Agent đã hoàn tất tạo mã LaTeX (Chưa phát hiện pdflatex để xuất PDF tự động)!',
                latexCode: finalLatex,
                pdfUrl: compiledPdfPath ? `/downloads/${pdfFileName}` : undefined,
                pdfPath: compiledPdfPath || texPath,
                filePath: compiledPdfPath || texPath,
                contentType: 'latex'
              });
              activeRunner = null;
              res.end();
              return;
            } catch (antigravityErr) {
              console.error('Antigravity execution error:', antigravityErr);
              sendSSE({
                step: 'ERROR',
                progress: 0,
                message: `⚠️ Lỗi Antigravity Agent: ${antigravityErr.message}`,
                error: antigravityErr.message
              });
              activeRunner = null;
              res.end();
              return;
            }
          }

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
            cleanStaleChromiumLocks(userDataDir, false);
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
              console.warn('Profile Chrome đang bị khóa hoặc lỗi khởi động, thử xóa lock và khởi động lại:', e.message);
              cleanStaleChromiumLocks(userDataDir, true);
              await new Promise(r => setTimeout(r, 1200));
              try {
                browserContext = await chromium.launchPersistentContext(userDataDir, {
                  headless: isHeadless,
                  channel: browserType === 'edge' ? 'msedge' : 'chrome',
                  viewport: viewportSetting,
                  userAgent: stealthUA,
                  args: stealthArgs,
                  ignoreDefaultArgs: ['--enable-automation'],
                });
              } catch (errRetry) {
                console.warn('Profile Chrome vẫn bị khóa, chuyển sang session tạm:', errRetry.message);
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
            const curUrl = page.url();
            const shouldNavigate = !curUrl.includes(targetHost) ||
              (targetAiUrl.includes('?') && !curUrl.includes(targetAiUrl.split('?')[1]));
            if (shouldNavigate) {
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

          // Đảm bảo bắt đầu phiên chat mới hoàn toàn sạch sẽ (100% không bị dính context chat cũ)
          await ensureFreshChatSession(page, targetAiUrl, aiName, sendSSE);

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

          // Tự động bật chế độ DeepThink R1 nếu dùng DeepSeek
          if (targetAiUrl.includes('deepseek.com') && (options.model === 'deepseek-r1' || options.modelName?.includes('R1'))) {
            try {
              const deepThinkBtn = await page.$('button:has-text("DeepThink"), div[role="button"]:has-text("DeepThink"), .ds-switch-button:has-text("DeepThink")');
              if (deepThinkBtn) {
                const btnClass = (await deepThinkBtn.getAttribute('class')) || '';
                const ariaChecked = await deepThinkBtn.getAttribute('aria-checked');
                if (!btnClass.includes('active') && !btnClass.includes('selected') && ariaChecked !== 'true') {
                  await deepThinkBtn.click();
                  await page.waitForTimeout(500);
                }
              }
            } catch (e) {
              console.log('DeepThink toggle:', e.message);
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

            sendSSE({
              step: 'SENDING_PROMPT',
              progress: 32,
              message: `Đang kiểm tra và thiết lập chế độ Think [${wantThink ? 'Bật suy nghĩ sâu' : 'Tắt Think - Tiêu chuẩn'}] trên ChatGPT...`,
            });

            try {
              let thinkToggled = false;
              for (let attempt = 0; attempt < 6; attempt++) {
                const evalRes = await page.evaluate(async ({ wantThink }) => {
                  function isVisible(el) {
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

                  thinkBtn.click();
                  await new Promise(r => setTimeout(r, 400));

                  const popoverItems = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], [data-radix-collection-item]')).filter(isVisible);
                  if (popoverItems.length > 0) {
                    if (wantThink) {
                      const item = popoverItems.find(m => {
                        const t = (m.textContent || '').toLowerCase();
                        return t.includes('think') || t.includes('reason') || t.includes('suy nghĩ') || t.includes('bật') || t.includes('high') || t.includes('sâu');
                      });
                      if (item) {
                        item.click();
                        await new Promise(r => setTimeout(r, 300));
                        return { status: 'toggled_via_menu', active: true };
                      }
                    } else {
                      const item = popoverItems.find(m => {
                        const t = (m.textContent || '').toLowerCase();
                        return t.includes('standard') || t.includes('tiêu chuẩn') || t.includes('tắt') || t.includes('off') || t.includes('instant');
                      });
                      if (item) {
                        item.click();
                        await new Promise(r => setTimeout(r, 300));
                        return { status: 'toggled_via_menu', active: false };
                      }
                    }
                  }

                  return { status: 'toggled', active: wantThink, label: thinkBtn.textContent?.trim() };
                }, { wantThink });

                if (evalRes && (evalRes.status === 'already_ok' || evalRes.status === 'toggled' || evalRes.status === 'toggled_via_menu')) {
                  thinkToggled = true;
                  sendSSE({
                    step: 'SENDING_PROMPT',
                    progress: 34,
                    message: wantThink 
                      ? '✓ Đã kích hoạt chế độ Think (Suy nghĩ sâu) trên ChatGPT' 
                      : '✓ Đã thiết lập chế độ Tiêu chuẩn (Tắt Think) trên ChatGPT',
                  });
                  break;
                }
                await page.waitForTimeout(500);
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
                  const loc = page.locator(sel).first();
                  if (await loc.isVisible({ timeout: 800 }).catch(() => false)) {
                    const pressed = await loc.getAttribute('aria-pressed');
                    const checked = await loc.getAttribute('aria-checked');
                    const isCurrentOn = pressed === 'true' || checked === 'true';
                    if ((wantThink && !isCurrentOn) || (!wantThink && isCurrentOn)) {
                      await loc.click();
                      await page.waitForTimeout(400);
                      sendSSE({
                        step: 'SENDING_PROMPT',
                        progress: 34,
                        message: `✓ Đã chuyển đổi chế độ Think: ${wantThink ? 'BẬT' : 'TẮT'}`,
                      });
                    }
                    break;
                  }
                }
              }
            } catch (chatgptErr) {
              console.warn('ChatGPT think mode toggle check:', chatgptErr.message);
            }
          }

          // Tự động chuyển đổi Model trên Google Gemini (3.1 Pro / 3.8 Flash / 3.5 Flash Lite)
          if (targetAiUrl.includes('gemini.google.com') && options.model) {
            sendSSE({
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
                const evalResult = await page.evaluate(async ({ isTargetPro, isTargetLite, isTargetFlash }) => {
                  function isVisible(el) {
                    if (!el) return false;
                    const r = el.getBoundingClientRect();
                    const s = window.getComputedStyle(el);
                    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
                  }

                  // Tìm nút Mode Picker
                  const candidates = Array.from(document.querySelectorAll(
                    'button, [role="button"], [role="combobox"], .input-area-switch, [data-test-id*="mode"]'
                  ));

                  const picker = candidates.find(b => {
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
                  picker.click();
                  await new Promise(r => setTimeout(r, 450));

                  const items = Array.from(document.querySelectorAll(
                    '[role="menuitem"], [role="option"], mat-option, .mat-mdc-menu-item, div.mode-option'
                  )).filter(isVisible);

                  let targetItem = null;
                  if (isTargetPro) {
                    targetItem = items.find(i => {
                      const t = i.textContent.toLowerCase();
                      return (t.includes('3.1') || t.includes('pro')) && !t.includes('flash-lite') && !t.includes('lite');
                    });
                  } else if (isTargetLite) {
                    targetItem = items.find(i => {
                      const t = i.textContent.toLowerCase();
                      return t.includes('flash-lite') || t.includes('3.5') || t.includes('lite');
                    });
                  } else {
                    targetItem = items.find(i => {
                      const t = i.textContent.toLowerCase();
                      return (t.includes('3.8') || t.includes('flash')) && !t.includes('lite');
                    });
                  }

                  if (targetItem) {
                    targetItem.click();
                    await new Promise(r => setTimeout(r, 450));
                    return { status: 'switched', label: targetItem.textContent.trim().replace(/\s+/g, ' ') };
                  }

                  // Đóng menu nếu không tìm thấy item khớp
                  picker.click();
                  return { status: 'item_not_found', foundItems: items.map(i => i.textContent.trim().replace(/\s+/g, ' ')) };
                }, { isTargetPro, isTargetLite, isTargetFlash });

                if (evalResult && (evalResult.status === 'switched' || evalResult.status === 'already_selected')) {
                  modelSwitched = true;
                  const label = evalResult.label || options.modelName || options.model;
                  sendSSE({
                    step: 'SENDING_PROMPT',
                    progress: 34,
                    message: `✓ Đã kích hoạt mô hình Gemini: ${label}`,
                  });
                  break;
                }

                await page.waitForTimeout(600);
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
                    const pBtn = page.locator(pSel).first();
                    if (await pBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                      await pBtn.click();
                      await page.waitForTimeout(500);

                      let targetOptionSel = isTargetPro 
                        ? '[role="menuitem"]:has-text("3.1 Pro"), [role="menuitem"]:has-text("Pro")'
                        : isTargetLite
                        ? '[role="menuitem"]:has-text("3.5 Flash-Lite"), [role="menuitem"]:has-text("Flash-Lite")'
                        : '[role="menuitem"]:has-text("3.8 Flash"), [role="menuitem"]:has-text("Flash")';

                      const itemLoc = page.locator(targetOptionSel).first();
                      if (await itemLoc.isVisible({ timeout: 1500 }).catch(() => false)) {
                        await itemLoc.click();
                        await page.waitForTimeout(500);
                        modelSwitched = true;
                        sendSSE({
                          step: 'SENDING_PROMPT',
                          progress: 34,
                          message: `✓ Đã chọn mô hình Gemini qua menu: ${options.modelName || options.model}`,
                        });
                        break;
                      }
                    }
                  }
                } catch (fbErr) {
                  console.warn('Fallback Gemini model selector:', fbErr.message);
                }
              }
            } catch (geminiModelErr) {
              console.warn('Gemini model selection error:', geminiModelErr);
            }
          }

          const isManimTaskEarly = options.prompt.includes('Manim') || 
                                   options.prompt.includes('Scene') || 
                                   options.prompt.includes('scene.py') ||
                                   options.prompt.includes('VOICEOVER_SCRIPT') ||
                                   options.prompt.includes('KỊCH BẢN SƯ PHẠM');

          sendSSE({
            step: 'SENDING_PROMPT',
            progress: 35,
            message: isManimTaskEarly 
              ? `[Lượt 1/2] Đang gửi yêu cầu Kịch bản Sư phạm & Lời thoại sang ${aiName}${options.modelName ? ` [${options.modelName}]` : ''}...`
              : `Đang điền Prompt và gửi lệnh giải toán sang ${aiName}${options.modelName ? ` [${options.modelName}]` : ''}...`,
          });

          await page.waitForTimeout(1500);


          const promptSelectors = [
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
          for (const sel of promptSelectors) {
            try {
              const el = await page.waitForSelector(sel, { timeout: 6000, state: 'attached' });
              if (el && (await el.isVisible())) {
                await el.click();
                await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
                await page.keyboard.press('Backspace');

                const inserted = await page.evaluate(({ selector, text }) => {
                  const target = document.querySelector(selector);
                  if (target) {
                    target.focus();
                    document.execCommand('insertText', false, text);
                    target.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
                    target.dispatchEvent(new Event('change', { bubbles: true }));
                    const len = (target.textContent || target.value || '').length;
                    return len > 10;
                  }
                  return false;
                }, { selector: sel, text: options.prompt });

                if (!inserted) {
                  await el.click();
                  await page.keyboard.insertText(options.prompt);
                }

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
            message: isManimTaskEarly
              ? `[Lượt 1/2] ${aiName} đang phân tích & xây dựng Kịch bản Sư phạm 4 phân cảnh...`
              : `${aiName} đang phân tích và xử lý yêu cầu...`,
          });

          let checkCount = 0;
          let lastLength = 0;
          let stable = 0;
          while (checkCount < 180) {
            await page.waitForTimeout(2000);
            checkCount++;
            const isStop = await page.$(
              'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Stop generating" i]'
            );
            const isStopVisible = isStop ? await isStop.isVisible().catch(() => false) : false;

            const curLen = await page.evaluate(() => {
              const blocks = document.querySelectorAll(
                'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
              );
              const last = blocks[blocks.length - 1];
              return last ? (last.textContent || '').length : 0;
            });

            if (curLen > 0 && curLen !== lastLength) {
              sendSSE({
                step: 'WAITING_GEMINI',
                progress: Math.min(68, 50 + Math.floor(curLen / 120)),
                message: isManimTaskEarly
                  ? `[Lượt 1/2] ${aiName} đang xuất Kịch bản Sư phạm & Thoại (${curLen} ký tự)...`
                  : `${aiName} đang phân tích & xuất nội dung (${curLen} ký tự)...`,
              });
            }

            // Chỉ hoàn tất khi:
            // 1. Độ dài đã sinh > 100 ký tự
            // 2. Không còn nút Stop
            // 3. Độ dài ổn định không tăng qua ít nhất 2 chu kỳ liên tiếp (>= 4 giây ổn định)
            if (curLen > 100 && curLen === lastLength && !isStopVisible) {
              stable++;
              if (stable >= 2) break;
            } else {
              stable = 0;
            }
            lastLength = curLen;
          }

          // Hàm gửi prompt tiếp theo tới AI trên cùng phiên chat và lấy lại mã nguồn Python (Multi-turn & Self-Healing)
          async function sendFollowupPromptAndGetPython(promptText, onStatus) {
            if (!page || page.isClosed()) return null;
            if (onStatus) onStatus('Đang chuẩn bị gửi prompt tiếp theo tới AI...');

            // 0. Đảm bảo AI đã dừng sinh ở lượt trước và giao diện sẵn sàng nhận lệnh mới
            await page.waitForTimeout(1500);
            for (let w = 0; w < 12; w++) {
              const busy = await page.evaluate(() => {
                const isStop = document.querySelector(
                  'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i]'
                );
                return isStop ? (isStop.offsetParent !== null || isStop.getAttribute('aria-hidden') !== 'true') : false;
              }).catch(() => false);
              if (!busy) break;
              await page.waitForTimeout(1000);
            }

            // 1. Đếm số lượng phản hồi hiện tại để đảm bảo CHỈ lấy phản hồi của lượt mới
            const initialAssistantCount = await page.evaluate(() => {
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

            let activeInputEl = null;
            let activeSelector = null;
            for (const sel of promptSelectors) {
              try {
                const el = await page.$(sel);
                if (el && (await el.isVisible())) {
                  activeInputEl = el;
                  activeSelector = sel;
                  break;
                }
              } catch {}
            }

            if (!activeInputEl) {
              try {
                activeInputEl = await page.waitForSelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"], textarea', { timeout: 4000 });
              } catch {}
            }

            if (onStatus) onStatus('Đang điền prompt tiếp theo vào ô chat...');

            if (activeInputEl) {
              await activeInputEl.click();
              await page.waitForTimeout(200);
              await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
              await page.keyboard.press('Backspace');
              await page.waitForTimeout(150);

              let insertedSuccess = false;

              // Cách 1: Clipboard paste (chuẩn nhất cho ProseMirror trên Gemini & ChatGPT)
              if (clipboard && typeof clipboard.writeText === 'function') {
                try {
                  clipboard.writeText(promptText);
                  await activeInputEl.focus();
                  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+V' : 'Control+V');
                  await page.waitForTimeout(300);
                  const len = await page.evaluate((el) => {
                    return (el.textContent || el.innerText || el.value || '').trim().length;
                  }, activeInputEl).catch(() => 0);
                  if (len > 10) insertedSuccess = true;
                } catch {}
              }

              // Cách 2: DOM Selection + execCommand nếu paste chưa có text
              if (!insertedSuccess && activeSelector) {
                insertedSuccess = await page.evaluate(({ selector, text }) => {
                  const target = document.querySelector(selector);
                  if (!target) return false;
                  target.focus();
                  try {
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(target);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    document.execCommand('insertText', false, text);
                    target.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: text }));
                    target.dispatchEvent(new Event('change', { bubbles: true }));
                  } catch (e) {}
                  const l = (target.textContent || target.innerText || target.value || '').trim().length;
                  return l > 10;
                }, { selector: activeSelector, text: promptText }).catch(() => false);
              }

              // Cách 3: Playwright keyboard insertText
              if (!insertedSuccess) {
                await activeInputEl.focus();
                await page.keyboard.insertText(promptText);
                await page.waitForTimeout(300);
              }

              // Kích hoạt sự kiện để hệ thống AI nhận diện trạng thái form có nội dung
              await page.evaluate((el) => {
                el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, activeInputEl).catch(() => {});
            } else {
              await page.keyboard.insertText(promptText);
            }

            await page.waitForTimeout(600);

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
                  const btn = await page.$(sel);
                  if (btn && (await btn.isVisible())) {
                    await btn.click({ force: true });
                    return true;
                  }
                } catch {}
              }
              if (activeInputEl) {
                try {
                  await activeInputEl.focus();
                  await page.keyboard.press('Enter');
                  return true;
                } catch {}
              }
              await page.keyboard.press('Enter');
              return false;
            };

            await triggerSend();

            // 4. XÁC NHẬN SUBMISSION ĐÃ THỰC SỰ ĐƯỢC GỬI ĐI (Chống trượt / chưa bấm gửi)
            for (let checkAttempt = 0; checkAttempt < 5; checkAttempt++) {
              await page.waitForTimeout(1200);
              const dispatchState = await page.evaluate((initCount) => {
                const stopBtn = document.querySelector(
                  'button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i]'
                );
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

            await page.waitForTimeout(2500);

            // 5. Chờ AI xuất toàn bộ mã Python
            let checkCount = 0;
            let lastLength = 0;
            let stable = 0;
            let hasStarted = false;

            while (checkCount < 180) {
              await page.waitForTimeout(2000);
              checkCount++;

              const state = await page.evaluate((initCount) => {
                const isStop = document.querySelector(
                  'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Stop generating" i]'
                );
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
            const extracted = await page.evaluate((initCount) => {
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
              const allText = targetContainer.innerText || targetContainer.textContent || '';
              const match = allText.match(/```(?:python|py)?\s*([\s\S]*?)```/i);
              if (match && (match[1].includes('class ') || match[1].includes('Scene') || match[1].includes('construct'))) {
                return match[1];
              }
              const fallback = allText.match(/from manim import[\s\S]*?(?:self\.wait\(\d+\)|def construct[\s\S]*)/);
              if (fallback) return fallback[0];
              return null;
            }, initialAssistantCount);

            return extracted ? prepareManimPythonCode(extracted) : null;
          }

          const isManimTask = options.prompt.includes('Manim') || 
                              options.prompt.includes('Scene') || 
                              options.prompt.includes('scene.py') ||
                              options.prompt.includes('VOICEOVER_SCRIPT') ||
                              options.prompt.includes('KỊCH BẢN SƯ PHẠM');
          if (isManimTask) {
            sendSSE({
              step: 'EXTRACTING_LATEX',
              progress: 65,
              message: 'Đang bóc tách mã nguồn Python Manim CE...',
            });

            let extractedPython = await page.evaluate(() => {
              const containers = document.querySelectorAll(
                'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown'
              );
              const target = containers.length > 0 ? containers[containers.length - 1] : document.body;
              const codeBlocks = target.querySelectorAll('pre code, .code-block code, pre');
              for (let i = codeBlocks.length - 1; i >= 0; i--) {
                const txt = codeBlocks[i].textContent || '';
                if (txt.includes('from manim import') || txt.includes('class MainScene') || txt.includes('ThreeDScene') || txt.includes('Scene')) {
                  return txt;
                }
              }
              const text = target.innerText || '';
              const m = text.match(/```(?:python|py)?\s*([\s\S]*?)```/i);
              if (m && (m[1].includes('from manim import') || m[1].includes('Scene'))) {
                return m[1];
              }
              const startIdx = text.indexOf('from manim import');
              if (startIdx >= 0) {
                const after = text.slice(startIdx);
                const endCodeBlock = after.indexOf('```');
                return endCodeBlock > 0 ? after.slice(0, endCodeBlock) : after;
              }
              return null;
            });

            // MULTI-TURN AUTO-DETECTION & TURN 2 DISPATCH:
            // Nếu AI ở Lượt 1 chưa trả về code Manim hoàn chỉnh (ví dụ mới chỉ lập kịch bản sư phạm / VOICEOVER_SCRIPT),
            // Hệ thống tự động gửi tiếp prompt Lượt 2 yêu cầu AI sinh mã nguồn Python hoàn chỉnh!
            const hasValidManimCode = extractedPython && extractedPython.includes('class ') && (extractedPython.includes('Scene') || extractedPython.includes('construct'));

            if (!hasValidManimCode) {
              sendSSE({
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
                sendSSE({
                  step: 'WAITING_GEMINI',
                  progress: 68,
                  message: `[Lượt 2/2] ${msg}`,
                });
              });

              if (turn2Python && (turn2Python.includes('class ') || turn2Python.includes('def construct'))) {
                extractedPython = turn2Python;
                sendSSE({
                  step: 'EXTRACTING_LATEX',
                  progress: 70,
                  message: '✓ [Lượt 2/2] Đã nhận mã Python Manim CE! Chuẩn bị render video MP4...',
                });
              } else {
                sendSSE({
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
              sendSSE({
                step: 'ERROR',
                progress: 0,
                message: '⚠️ Không tìm thấy class Manim Scene hợp lệ trong mã nguồn bóc tách.',
                error: 'No valid Manim Scene found',
              });
              return;
            }

            finalPython = prepareManimPythonCode(finalPython);

            const sceneFileName = 'scene.py';
            const sceneFilePath = path.join(downloadsDir, sceneFileName);
            fs.writeFileSync(sceneFilePath, finalPython, 'utf-8');

            let sceneClass = 'MainScene';
            const sceneMatch = finalPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
            if (sceneMatch && sceneMatch[1]) {
              sceneClass = sceneMatch[1];
            }

            // 1. Đảm bảo môi trường Manim CE tồn tại (tự cài nếu thiếu)
            const manimBin = await ensureManimEnvironment((msg) => {
              sendSSE({
                step: 'RENDERING_VIDEO',
                progress: 72,
                message: msg,
                manimCode: finalPython,
                contentType: 'manim',
              });
            });

            if (manimBin) {
              const { spawn } = require('child_process');

              // Hàm biên dịch kèm vòng lặp TỰ SỬA LỖI (Self-Healing Loop) với AI
              async function compileAndHealManimCode({
                initialPython,
                workingDir,
                targetSceneFilePath,
                episodeLabel = '',
                maxAttempts = 5
              }) {
                let currentPython = initialPython;
                let renderSuccess = false;
                let lastError = '';
                let finalMp4 = '';
                const mediaDir = path.join(workingDir, 'media');

                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                  currentPython = prepareManimPythonCode(currentPython);
                  fs.writeFileSync(targetSceneFilePath, currentPython, 'utf-8');

                  let sceneClass = 'MainScene';
                  const sceneMatch = currentPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
                  if (sceneMatch && sceneMatch[1]) sceneClass = sceneMatch[1];

                  await autoInstallMissingDependencies(currentPython, (msg) => {
                    sendSSE({
                      step: 'RENDERING_VIDEO',
                      progress: 74,
                      message: `${episodeLabel ? `[${episodeLabel}] ` : ''}${msg}`,
                      manimCode: currentPython,
                      contentType: 'manim',
                    });
                  });

                  sendSSE({
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

                  const renderResult = await new Promise((resolve) => {
                    const proc = spawn(manimBin, ['-qm', '--media_dir', mediaDir, targetSceneFilePath, sceneClass], {
                      cwd: workingDir,
                    });
                    if (activeRunner) activeRunner.childProc = proc;

                    let stdout = '';
                    let stderr = '';

                    proc.stdout.on('data', d => { stdout += d.toString(); });
                    proc.stderr.on('data', d => {
                      const s = d.toString();
                      stderr += s;
                      const match = s.match(/(\d+)%/);
                      if (match) {
                        const pct = Math.min(96, 75 + Math.floor(parseInt(match[1], 10) * 0.2));
                        sendSSE({
                          step: 'RENDERING_VIDEO',
                          progress: pct,
                          message: `${episodeLabel ? `[${episodeLabel}] ` : ''}Đang render video Manim: ${match[1]}%...`,
                          manimCode: currentPython,
                          contentType: 'manim',
                        });
                      }
                    });

                    proc.on('close', code => {
                      if (activeRunner) activeRunner.childProc = null;
                      if (code === 0) {
                        const newestMp4 = findNewestMp4(mediaDir);
                        if (newestMp4) {
                          resolve({ success: true, mp4Path: newestMp4 });
                          return;
                        }
                      }
                      const parsedErr = parseManimError(stderr, stdout, workingDir);
                      resolve({ success: false, error: parsedErr.summary, detailsForAI: parsedErr.detailsForAI });
                    });

                    proc.on('error', err => {
                      if (activeRunner) activeRunner.childProc = null;
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

                  // 1. Thử tự động cài module python nếu thiếu
                  const missingMatch = (detailsForAI + ' ' + lastError).match(/ModuleNotFoundError:\s*No module named\s*['"]([a-zA-Z0-9_-]+)['"]/i)
                    || (detailsForAI + ' ' + lastError).match(/No module named\s*['"]([a-zA-Z0-9_-]+)['"]/i);
                  if (missingMatch && missingMatch[1] && attempt < maxAttempts) {
                    const missingLib = missingMatch[1];
                    sendSSE({
                      step: 'RENDERING_VIDEO',
                      progress: 76,
                      message: `${episodeLabel ? `[${episodeLabel}] ` : ''}Phát hiện thiếu thư viện "${missingLib}", đang tự động cài đặt qua pip...`,
                      manimCode: currentPython,
                      contentType: 'manim',
                    });
                    const installed = await installPythonPackage(missingLib);
                    if (installed) continue;
                  }

                  // 2. Thử tự động chuẩn hóa tiếng Việt LaTeX nếu có xung đột
                  const isLatexError = /latex error|compiler error|Unicode character|dvi|tex_file_writing|ValueError:\s*latex/i.test(detailsForAI + ' ' + lastError);
                  if (isLatexError && attempt < maxAttempts) {
                    const sanitized = sanitizeLatexVietnamese(currentPython);
                    if (sanitized !== currentPython) {
                      sendSSE({
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

                  // 3. VÒNG LẶP HỒI TIẾP LỖI TỰ ĐỘNG CHO AI TRÊN TRÌNH DUYỆT (SELF-HEALING)
                  if (attempt < maxAttempts && page && !page.isClosed()) {
                    sendSSE({
                      step: 'RENDERING_VIDEO',
                      progress: 77,
                      message: `⚠️ ${episodeLabel ? `[${episodeLabel}] ` : ''}Lỗi render: ${lastError.slice(0, 85)}... Đang gửi log lỗi để AI tự sửa mã (Lần ${attempt + 1}/${maxAttempts})...`,
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
                      sendSSE({
                        step: 'RENDERING_VIDEO',
                        progress: 78,
                        message: `${episodeLabel ? `[${episodeLabel}] ` : ''}${m}`,
                        manimCode: currentPython,
                        contentType: 'manim',
                      });
                    });

                    if (healedCode && healedCode.length > 50) {
                      currentPython = prepareManimPythonCode(healedCode);
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
              }

              // KIỂM TRA CHẾ ĐỘ: VIDEO ĐƠN HAY CHUỖI PLAYLIST NHIỀU TẬP
              const isPlaylistTask = isManimTask && (
                options.prompt.includes('PLAYLIST') || 
                options.prompt.includes('CHUỖI') || 
                options.prompt.includes('TẬP TRONG CHUỖI PLAYLIST') ||
                options.isSeries === true
              );

              if (!isPlaylistTask) {
                // ==================== CHẾ ĐỘ 1: VIDEO ĐƠN ====================
                const healResult = await compileAndHealManimCode({
                  initialPython: finalPython,
                  workingDir: downloadsDir,
                  targetSceneFilePath: sceneFilePath,
                  maxAttempts: 5
                });

                if (healResult.success && healResult.mp4Path) {
                  let finalVideoSource = healResult.mp4Path;
                  let audioPath = null;
                  let audioUrl = null;

                  if (options.enableVoice !== false) {
                    sendSSE({
                      step: 'RENDERING_VIDEO',
                      progress: 96,
                      message: 'Đang khởi tạo giọng đọc AI và đồng bộ âm thanh...',
                      contentType: 'manim',
                    });

                    const voiceRes = await generateVoiceoverAndMux({
                      mp4Path: healResult.mp4Path,
                      pythonCode: healResult.pythonCode,
                      workingDir: downloadsDir,
                      voiceName: options.voiceName || 'vi-VN-HoaiMyNeural',
                      voiceSpeed: options.voiceSpeed || '+0%',
                      fallbackTopic: options.topic,
                      onStatus: (msg) => {
                        sendSSE({
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
                  const finalVideoPath = path.join(downloadsDir, videoFileName);
                  fs.copyFileSync(finalVideoSource, finalVideoPath);

                  sendSSE({
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
                  sendSSE({
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
                // ==================== CHẾ ĐỘ 2: CHUỖI PLAYLIST ====================
                let seriesCount = options.seriesCount || 3;
                const countMatch = options.prompt.match(/GỒM ĐÚNG\s*(\d+)\s*TẬP/i) || options.prompt.match(/(\d+)\s*tập/i);
                if (countMatch && countMatch[1]) {
                  seriesCount = Math.min(10, Math.max(2, parseInt(countMatch[1], 10)));
                }

                const playlistSlug = `Playlist_${Date.now()}`;
                const playlistDir = path.join(downloadsDir, playlistSlug);
                if (!fs.existsSync(playlistDir)) fs.mkdirSync(playlistDir, { recursive: true });

                const playlistVideos = [];

                for (let ep = 1; ep <= seriesCount; ep++) {
                  const epLabel = `Tập ${ep}/${seriesCount}`;
                  let epPython = '';

                  if (ep === 1) {
                    epPython = finalPython;
                  } else {
                    sendSSE({
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

                    epPython = await sendFollowupPromptAndGetPython(nextEpPrompt, (m) => {
                      sendSSE({
                        step: 'WAITING_GEMINI',
                        progress: Math.floor(((ep - 1) / seriesCount) * 95),
                        message: `[${epLabel}] ${m}`,
                        contentType: 'manim'
                      });
                    });
                    if (!epPython) epPython = finalPython;
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
                    let epAudioPath = null;
                    let epAudioUrl = null;

                    if (options.enableVoice !== false) {
                      sendSSE({
                        step: 'RENDERING_VIDEO',
                        progress: Math.floor((ep / seriesCount) * 94),
                        message: `[${epLabel}] Đang tổng hợp giọng đọc AI và lồng tiếng...`,
                        contentType: 'manim',
                      });

                      const voiceRes = await generateVoiceoverAndMux({
                        mp4Path: healResult.mp4Path,
                        pythonCode: healResult.pythonCode,
                        workingDir: playlistDir,
                        voiceName: options.voiceName || 'vi-VN-HoaiMyNeural',
                        voiceSpeed: options.voiceSpeed || '+0%',
                        fallbackTopic: `Tập ${ep}: ${options.topic || 'Bài giảng'}`,
                        onStatus: (msg) => {
                          sendSSE({
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

                    sendSSE({
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

                // Tạo file mục lục playlist
                const indexMd = `# DANH SÁCH PHÁT PLAYLIST VIDEO (${playlistVideos.length} Tập)\n\nChủ đề: ${options.topic || 'Chuyên đề'}\n\n` + 
                  playlistVideos.map(v => `- **Tập ${v.episode}:** ${v.title} (${path.basename(v.videoPath)})${v.audioPath ? ` [Audio: ${path.basename(v.audioPath)}]` : ''}`).join('\n') + '\n';
                fs.writeFileSync(path.join(playlistDir, 'danh_sach_phat.md'), indexMd, 'utf-8');

                sendSSE({
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
              sendSSE({
                step: 'COMPLETED',
                progress: 100,
                message: 'Hoàn tất 1-Click! Đã lưu scene.py (Chưa cài đặt Manim CE).',
                manimCode: finalPython,
                latexCode: finalPython,
                filePath: sceneFilePath,
                contentType: 'manim',
              });
              return;
            }
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

          let finalLatex = extractAndSanitizeLatex(extractedLatex || options.prompt);

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

    // 4. Serve Downloads (hỗ trợ cả thư mục con như Playlist_xxx/Tap_01.mp4 kèm Range Streaming)
    if (pathname.startsWith('/downloads/')) {
      const relPath = decodeURIComponent(pathname.replace(/^\/downloads\//, ''));
      const filePath = path.join(downloadsDir, relPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Hỗ trợ HTTP 206 Partial Content cho thẻ <video> và <audio> HTML5
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
            'Accept-Ranges': 'bytes'
          });
          const stream = fs.createReadStream(filePath);
          stream.pipe(res);
          return;
        }
      }
    }

    // 5. Serve Dist Frontend Files
    if (pathname.startsWith('/api/') || pathname.startsWith('/downloads/')) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File không tồn tại');
      return;
    }

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
      plugins: true,
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
