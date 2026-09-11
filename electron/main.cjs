const { app, BrowserWindow, shell, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');
const { spawn, exec, execSync } = require('child_process');

// Tự động bổ sung các thư mục venv & bin hệ thống vào process.env.PATH cho mọi child_process
const homeDir = os.homedir();
const extraPaths = [
  path.join('/home/tontonyuta/soan-tai-lieu', '.venv', 'bin'),
  path.join(homeDir, '.TinyTeX', 'bin', 'x86_64-linux'),
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
};

let localtunnel;
try {
  localtunnel = require('localtunnel');
} catch (e) {
  console.warn('localtunnel package not found');
}

let activeWanTunnel = null;
let currentWanUrl = '';
let desktopSecurityPin = '';

async function startWanTunnel(port) {
  if (activeWanTunnel && currentWanUrl) return currentWanUrl;
  if (!localtunnel) throw new Error('Thư viện localtunnel chưa được cài đặt.');
  try {
    const tunnel = await localtunnel({ port: port || 3000 });
    activeWanTunnel = tunnel;
    currentWanUrl = tunnel.url;
    tunnel.on('close', () => {
      activeWanTunnel = null;
      currentWanUrl = '';
    });
    return currentWanUrl;
  } catch (err) {
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

function generatePdfPreviewImage(pdfPath, downloadsDir) {
  if (!pdfPath || !fs.existsSync(pdfPath)) return undefined;
  try {
    const baseName = path.basename(pdfPath, path.extname(pdfPath));
    const outputPrefix = path.join(downloadsDir, `preview_${baseName}`);
    execSync(`pdftoppm -png -r 150 -f 1 -l 1 "${pdfPath}" "${outputPrefix}"`, { stdio: 'ignore' });
    const files = fs.readdirSync(downloadsDir);
    const imgFile = files.find(f => f.startsWith(`preview_${baseName}`) && f.endsWith('.png'));
    if (imgFile) {
      return `/downloads/${imgFile}`;
    }
  } catch (err) {
    console.error('Lỗi khi tạo ảnh preview PDF với pdftoppm:', err.message);
  }
  return undefined;
}

let activeServerPort = 0;

let lastMobileActivity = {
  timestamp: 0,
  deviceName: '',
  ip: ''
};

function detectMobileDevice(req) {
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
      ip: clientIp
    };
  }
}

let currentAutomationState = {
  isRunning: false,
  progress: {
    step: 'INIT',
    progress: 0,
    message: '',
  },
  logs: [],
  startTime: null,
};

function updateAutomationProgress(updateData) {
  if (!updateData) return;
  if (!currentAutomationState.startTime) {
    currentAutomationState.startTime = Date.now();
  }
  
  currentAutomationState.isRunning = !(updateData.step === 'COMPLETED' || updateData.step === 'ERROR');
  currentAutomationState.progress = {
    ...currentAutomationState.progress,
    ...updateData
  };

  if (updateData.message) {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    const elapsedSec = Math.floor((Date.now() - currentAutomationState.startTime) / 1000);
    const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    const logLine = `[${mins}:${secs}] [${timeStr}] ${updateData.message}`;
    
    if (!currentAutomationState.logs.includes(logLine)) {
      currentAutomationState.logs.push(logLine);
    }
  }
}

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

  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:latex|tex)?\s*/i, '').replace(/\s*```\s*$/, '');

  const docClassIdx = cleaned.indexOf('\\documentclass');
  if (docClassIdx !== -1) {
    cleaned = cleaned.slice(docClassIdx);
  } else {
    // Tự động bọc snippet bài tập trong preamble LaTeX hoàn chỉnh
    cleaned = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{tcolorbox}
\\usepackage{geometry}
\\geometry{a4paper, margin=2cm}
\\begin{document}

${cleaned}

\\end{document}`;
  }

  const endDocIdx = cleaned.indexOf('\\end{document}');
  if (endDocIdx !== -1) {
    cleaned = cleaned.slice(0, endDocIdx + '\\end{document}'.length);
  }

  // Tự động sửa lỗi \\addto\\captionsvietnamese khi dùng package vietnam thay vì babel
  cleaned = cleaned.replace(/\\addto\s*\\captionsvietnamese\s*\{/g, '{');

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

function getPdflatexPath() {
  const home = os.homedir();
  const candidates = process.platform === 'win32'
    ? [
        'C:\\miktex\\miktex\\bin\\x64\\pdflatex.exe',
        'C:\\texlive\\2024\\bin\\windows\\pdflatex.exe',
        'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe'
      ]
    : [
        path.join(home, '.TinyTeX', 'bin', 'x86_64-linux', 'pdflatex'),
        path.join(home, '.local', 'bin', 'pdflatex'),
        '/usr/bin/pdflatex',
        '/usr/local/bin/pdflatex',
        '/Library/TeX/texbin/pdflatex'
      ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  try {
    const whichCmd = process.platform === 'win32' ? 'where pdflatex' : 'which pdflatex';
    const stdout = execSync(whichCmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const firstPath = stdout.trim().split(/\r?\n/)[0]?.trim();
    if (firstPath && fs.existsSync(firstPath)) {
      return firstPath;
    }
  } catch (e) {}

  return 'pdflatex';
}

function autoRepairLatexCode(latexCode, logContent = '') {
  let repaired = latexCode;

  // 1. Chống cắt cụt: Đảm bảo có \end{document}
  if (!repaired.includes('\\end{document}')) {
    const openEnvs = ['enumerate', 'itemize', 'center', 'tabular', 'tabularx', 'longtable', 'multicols', 'tcolorbox'];
    for (const env of openEnvs) {
      const openCount = (repaired.match(new RegExp(`\\\\begin\\{${env}\\}`, 'g')) || []).length;
      const closeCount = (repaired.match(new RegExp(`\\\\end\\{${env}\\}`, 'g')) || []).length;
      if (openCount > closeCount) {
        repaired += `\n\\end{${env}}`.repeat(openCount - closeCount);
      }
    }
    repaired += '\n\\end{document}\n';
  }

  // 2. Tự động tiêm newunicodechar và map ký tự Unicode nếu thiếu
  if (!repaired.includes('newunicodechar')) {
    const unicodePreamble = `
\\usepackage{newunicodechar}
\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{•}{\\textbullet}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{≠}{\\ensuremath{\\ne}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}
\\newunicodechar{°}{\\ensuremath{^\\circ}}
\\newunicodechar{℃}{\\ensuremath{^\\circ\\text{C}}}
`;
    if (repaired.includes('\\usepackage[utf8]{inputenc}')) {
      repaired = repaired.replace('\\usepackage[utf8]{inputenc}', '\\usepackage[utf8]{inputenc}' + unicodePreamble);
    } else if (repaired.includes('\\documentclass')) {
      repaired = repaired.replace(/(\\documentclass[^\n]*\n)/, `$1\\usepackage[utf8]{inputenc}${unicodePreamble}\n`);
    }
  }

  // 3. Tự động bổ sung các macro hỗ trợ đa môn nếu mã gọi mà preamble thiếu
  const missingMacros = [];
  if (repaired.includes('\\dapanHaiCot') && !repaired.includes('\\newcommand{\\dapanHaiCot}')) {
    missingMacros.push(`\\newcommand{\\dapanHaiCot}[4]{
  \\begin{tabularx}{\\linewidth}{XX}
    \\textbf{A.} #1 & \\textbf{B.} #2 \\\\
    \\textbf{C.} #3 & \\textbf{D.} #4
  \\end{tabularx}
}`);
  }
  if (repaired.includes('\\dapanMotCot') && !repaired.includes('\\newcommand{\\dapanMotCot}')) {
    missingMacros.push(`\\newcommand{\\dapanMotCot}[4]{
  \\begin{tabularx}{\\linewidth}{X}
    \\textbf{A.} #1 \\\\
    \\textbf{B.} #2 \\\\
    \\textbf{C.} #3 \\\\
    \\textbf{D.} #4
  \\end{tabularx}
}`);
  }
  if (repaired.includes('\\doanvan') && !repaired.includes('\\newcommand{\\doanvan}')) {
    missingMacros.push(`\\newcommand{\\doanvan}[2]{
  \\begin{tcolorbox}[colback=gray!5!white,colframe=gray!50!black,title={\\textbf{#1}},arc=2mm]
    \\small\\textit{#2}
  \\end{tcolorbox}
}`);
  }
  if (missingMacros.length > 0 && repaired.includes('\\begin{document}')) {
    repaired = repaired.replace('\\begin{document}', missingMacros.join('\n\n') + '\n\n\\begin{document}');
  }

  // 4. Sửa các ký tự đặc biệt hay gây crash trong văn bản thường
  repaired = repaired.replace(/GD&ĐT/g, 'GD\\&ĐT');
  repaired = repaired.replace(/(\d+)\s*%/g, '$1\\%');

  // 5. Loại bỏ triệt để các nhãn rác RAG / trích dẫn số trang nội bộ trong câu hỏi & đề bài
  repaired = repaired.replace(/\\cauhoi\{(\d+)\s*\(?[^}]*(?:rag|trang|page|nguồn)[^}]*\}/gi, '\\cauhoi{$1}');
  repaired = repaired.replace(/(\\cauhoi\{\d+\})\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, '$1 ');
  repaired = repaired.replace(/(\\textbf\{\s*(?:Câu|Bài)\s*\d+)\s*\(?[^}:.]*(?:rag|trang|page|nguồn)[^}:.]*\)?(\s*[:.]?\s*\})/gi, '$1$2');
  repaired = repaired.replace(/(\\textbf\{\s*(?:Câu|Bài)\s*\d+[^}]*\})\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, '$1 ');
  repaired = repaired.replace(/(\b(?:Câu|Bài)\s*\d+[:.]?)\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, '$1 ');
  repaired = repaired.replace(/\s*\[(?:RAG|rag)[^\]]*\]/gi, '');
  repaired = repaired.replace(/\s*\((?:RAG|rag)\s*(?:trang|Trang|page|Page)?\s*\d+\)/gi, '');
  repaired = repaired.replace(/\s*\((?:trang|Trang|page|Page)\s*\d+\)/gi, '');

  // 6. Chuẩn hóa tiêu đề mục phụ chống viết HOA TOÀN BỘ (ALL CAPS)
  repaired = repaired.replace(/\\subsection\*\{BẢNG ĐÁP ÁN PHẦN I\}/g, '\\subsection*{Bảng đáp án Phần I}');
  repaired = repaired.replace(/\\subsection\*\{BẢNG ĐÁP ÁN PHẦN II\}/g, '\\subsection*{Bảng đáp án Phần II}');
  repaired = repaired.replace(/\\subsection\*\{BẢNG ĐÁP ÁN PHẦN III\}/g, '\\subsection*{Bảng đáp án Phần III}');
  repaired = repaired.replace(/\\subsection\*\{LỜI GIẢI CHI TIẾT TỪNG CÂU\}/g, '\\subsection*{Lời giải chi tiết từng câu}');
  repaired = repaired.replace(/\\section\*\{I\. PHẦN TRẮC NGHIỆM\}/g, '\\section*{Phần I. Trắc nghiệm}');
  repaired = repaired.replace(/\\section\*\{II\. PHẦN TỰ LUẬN\}/g, '\\section*{Phần II. Tự luận}');
  repaired = repaired.replace(/\\section\*\{I\. TÓM TẮT LÝ THUYẾT TRỌNG TÂM\}/g, '\\section*{Phần I. Tóm tắt lý thuyết trọng tâm}');
  repaired = repaired.replace(/\\section\*\{II\. CÁC DẠNG BÀI TẬP VÀ PHƯƠNG PHÁP GIẢI\}/g, '\\section*{Phần II. Các dạng bài tập và phương pháp giải}');
  repaired = repaired.replace(/\\section\*\{III\. BÀI TẬP TỰ LUYỆN\}/g, '\\section*{Phần III. Bài tập tự luyện}');

  return repaired;
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
function findRecentlyGeneratedPython(searchDir, maxAgeMs = 600000) {
  const dirsToInspect = [
    searchDir,
    path.join(searchDir || '', 'scratch'),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), '.gemini', 'antigravity-cli', 'scratch')
  ].filter(Boolean);

  const now = Date.now();
  for (const d of dirsToInspect) {
    if (!fs.existsSync(d)) continue;
    try {
      const files = fs.readdirSync(d);
      for (const f of files) {
        if (!f.endsWith('.py') || f === 'test_monotone.py') continue;
        const p = path.join(d, f);
        const stat = fs.statSync(p);
        if (now - stat.mtimeMs < maxAgeMs) {
          const content = fs.readFileSync(p, 'utf-8');
          if ((content.includes('class ') || content.includes('from manim')) && content.includes('def construct')) {
            return content;
          }
        }
      }
    } catch {}
  }
  return null;
}

async function runAgyPrompt(promptText, cwdDir, modelName, onProgress, timeoutMs = 300000) {
  if (typeof modelName === 'function') {
    timeoutMs = onProgress || 300000;
    onProgress = modelName;
    modelName = undefined;
  }

  const agyExec = getAgyExecutable();
  const { spawn } = require('child_process');

  // Bắt buộc loại bỏ null bytes (\0) để tránh lỗi ERR_INVALID_ARG_VALUE trong child_process.spawn
  const cleanPromptText = String(promptText || '').replace(/\0/g, '');

  // Bắt buộc chỉ thị cấm tool để Antigravity Agent không chạy bash ngầm hay tự render video gây timeout
  const strictPrompt = `${cleanPromptText}\n\n[CHỈ THỊ KỸ THUẬT BẮT BUỘC]:\n- TUYỆT ĐỐI KHÔNG GỌI BẤT KỲ TOOL NÀO (KHÔNG run_command, KHÔNG write_to_file, KHÔNG view_file, KHÔNG schedule).\n- TUYỆT ĐỐI KHÔNG tự chạy lệnh render manim/pdflatex.\n- CHỈ xuất duy nhất nội dung văn bản/khối mã trực tiếp ra output.`.replace(/\0/g, '');

  const args = [
    '-p', strictPrompt,
    '--output-format', 'stream-json',
    '--disable-slash-commands',
    '--dangerously-skip-permissions'
  ];

  if (modelName && typeof modelName === 'string' && modelName !== 'antigravity-local') {
    let cleanModel = modelName.trim();
    if (cleanModel.includes('(')) {
      cleanModel = cleanModel.split('(')[0].trim();
    }
    const lower = cleanModel.toLowerCase();
    if (lower.includes('3.8') || lower.includes('3.8-flash')) cleanModel = 'gemini-3.8-flash-high';
    else if (lower.includes('3.1') || lower.includes('3.1-pro')) cleanModel = 'gemini-3.1-pro-high';
    else if (lower.includes('sonnet') || lower.includes('claude')) cleanModel = 'claude-sonnet-4-6';
    else if (lower.includes('120b') || lower.includes('gpt')) cleanModel = 'gpt-oss-120b-medium';
    else if (lower.includes('3.7') || lower.includes('3.7-flash')) cleanModel = 'gemini-3.7-flash-high';

    args.push('--model', cleanModel);
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
        const cleanedText = responseText.replace(/An asynchronous task finished![\s\S]*?(?=\n\n|$)/g, '').trim();
        if (cleanedText.length > 50) {
          resolve(cleanedText);
        } else {
          const fallbackPython = findRecentlyGeneratedPython(cwdDir);
          if (fallbackPython) {
            resolve('```python\n' + fallbackPython + '\n```');
          } else {
            reject(new Error('Antigravity CLI bị quá thời gian xử lý (Timeout 5 phút).'));
          }
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
          if (json.event === 'step_update' && json.step_update) {
            const stepType = json.step_update.step_type;
            if (stepType === 'agent_response' && json.step_update.text_delta) {
              const delta = json.step_update.text_delta;
              responseText += delta;
              if (onProgress) onProgress(delta, responseText);
            }
          } else if (json.event === 'result' && json.result && json.result.response) {
            const finalRes = json.result.response.trim();
            if (finalRes) {
              responseText = finalRes;
              if (onProgress) onProgress('', responseText);
            }
          }
        } catch (e) {
          if (!trimmed.startsWith('{') && !trimmed.startsWith('An asynchronous task')) {
            responseText += trimmed + '\n';
          }
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
          if (json.result && json.result.response) {
            responseText = json.result.response.trim();
          }
        } catch {}
      }
      const cleaned = responseText.replace(/An asynchronous task finished![\s\S]*?(?=\n\n|$)/g, '').trim();
      if (code === 0 || cleaned.length > 0) {
        resolve(cleaned.length > 0 ? cleaned : responseText);
      } else {
        const fallbackPython = findRecentlyGeneratedPython(cwdDir);
        if (fallbackPython) {
          resolve('```python\n' + fallbackPython + '\n```');
        } else {
          reject(new Error(`Antigravity CLI thoát với mã lỗi ${code}`));
        }
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

async function extractPdfTextSafe(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return { text: '', numPages: 0 };
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfModule = require('pdf-parse');
    let extractedText = '';
    let pageCount = 1;
    if (typeof pdfModule === 'function') {
      const parsed = await pdfModule(buffer);
      extractedText = parsed.text || '';
      pageCount = parsed.numpages || 1;
    } else if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const resText = await parser.getText();
      extractedText = resText.text || '';
      pageCount = resText.total || (resText.pages && resText.pages.length) || 1;
      if (parser.destroy) {
        await parser.destroy().catch(() => {});
      }
    } else if (pdfModule && pdfModule.default) {
      const parser = new pdfModule.default.PDFParse({ data: buffer });
      const resText = await parser.getText();
      extractedText = resText.text || '';
    }
    extractedText = (extractedText || '').replace(/\0/g, '');
    return { text: extractedText.trim(), numPages: pageCount };
  } catch (err) {
    console.warn('extractPdfTextSafe error:', err.message);
    return { text: '', numPages: 0 };
  }
}

function extractPythonManimCode(text, cwdDir) {
  if (text) {
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
  }

  // Fallback: Kiểm tra xem Antigravity có lưu file .py trên đĩa không
  if (cwdDir) {
    const fromDisk = findRecentlyGeneratedPython(cwdDir);
    if (fromDisk) return fromDisk;
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

  // TỰ ĐỘNG KHẮC PHỤC LỖI KÝ TỰ ESCAPE & CHUỖI BỊ ĐỨT ĐOẠN DO PROMPT
  // 1. Phục hồi các ký tự điều khiển (control characters) vô tình bị unescape
  processed = processed.replace(/\x0corall/g, '\\forall');
  processed = processed.replace(/\x0c/g, '\\f');
  processed = processed.replace(/\x08egin/g, '\\begin');
  processed = processed.replace(/\x08/g, '\\b');
  processed = processed.replace(/\r?\nenewcommand/g, '\\renewcommand');
  processed = processed.replace(/[\t\x09]\s*ext\{/g, '\\text{');

  // 2. Nối chuỗi bị xuống dòng bất hợp lệ giữa chừng (\nearrow bị thành \n earrow)
  processed = processed.replace(/MathTex\(\s*r"([^"]*)\r?\n\s*earrow\)"/g, 'MathTex(r"$1\\\\nearrow)"');
  processed = processed.replace(/\(\s*\r?\n\s*earrow\)/g, '(\\\\nearrow)');
  processed = processed.replace(/&\s*\r?\n\s*earrow/g, '& \\\\nearrow');
  processed = processed.replace(/searrow\s*&\s*&\s*\r?\n\s*earrow/g, '\\\\searrow & & \\\\nearrow');

  // 3. Khôi phục các lệnh và môi trường LaTeX bị thiếu dấu gạch chéo ngược
  processed = processed.replace(/(?<!\\)begin\{array\}/g, '\\begin{array}');
  processed = processed.replace(/(?<!\\)end\{array\}/g, '\\end{array}');
  processed = processed.replace(/(?<!\\)hline/g, '\\hline');
  processed = processed.replace(/(?<!\\)renewcommand\{/g, '\\renewcommand{');
  processed = processed.replace(/(?<!\\)arraystretch/g, '\\arraystretch');
  processed = processed.replace(/;Longrightarrow;/g, '\\;\\Longrightarrow\\;');
  processed = processed.replace(/;\s*\\text\{/g, '\\;\\text{');
  processed = processed.replace(/(?<!\\)searrow/g, '\\searrow');
  processed = processed.replace(/(?<!\\)nearrow/g, '\\nearrow');
  processed = processed.replace(/(?<!\\)mathbf\{/g, '\\mathbf{');
  processed = processed.replace(/(?<!\\)infty/g, '\\infty');
  processed = processed.replace(/(?<!\\)iff/g, '\\iff');
  processed = processed.replace(/(?<!\\)quad/g, '\\quad');
  processed = processed.replace(/(?<!\\)forall/g, '\\forall');
  processed = processed.replace(/(?<=\s)pm(?=\s|\d)/g, '\\pm');

  // 4. Sửa ngắt dòng hàng trong bảng array: dòng kết thúc bằng 1 dấu \ thành 2 dấu \\
  processed = processed.replace(/(\\begin\{array\}[\s\S]*?\\end\{array\})/g, (m) => {
    return m.replace(/(?<!\\)\\\s*$/gm, '\\\\');
  });

  // 5. Khắc phục lỗi SyntaxError: unterminated string literal khi chuỗi Text("...") bị xuống dòng bất hợp lệ
  const rawSplitLines = processed.split(/\r?\n/);
  const sanitizedLines = [];
  let inTripleDQuote = false;
  let inTripleSQuote = false;
  let lIdx = 0;
  while (lIdx < rawSplitLines.length) {
    let curLine = rawSplitLines[lIdx];
    let inDQuote = false;
    let inSQuote = false;
    let charIdx = 0;
    while (charIdx < curLine.length) {
      if (!inDQuote && !inSQuote) {
        if (curLine.slice(charIdx, charIdx + 3) === '"""') {
          inTripleDQuote = !inTripleDQuote;
          charIdx += 3;
          continue;
        } else if (curLine.slice(charIdx, charIdx + 3) === "'''") {
          inTripleSQuote = !inTripleSQuote;
          charIdx += 3;
          continue;
        }
      }
      if (inTripleDQuote || inTripleSQuote) {
        charIdx++;
        continue;
      }
      const c = curLine[charIdx];
      if (c === '\\') {
        charIdx += 2;
        continue;
      }
      if (c === '"' && !inSQuote) {
        inDQuote = !inDQuote;
      } else if (c === "'" && !inDQuote) {
        inSQuote = !inSQuote;
      }
      charIdx++;
    }

    if (inDQuote && !inTripleDQuote && lIdx + 1 < rawSplitLines.length) {
      const nextLine = rawSplitLines[lIdx + 1];
      if (/^\s*earrow/.test(nextLine)) {
        curLine = curLine + '\\nearrow' + nextLine.replace(/^\s*earrow/, '');
      } else {
        curLine = curLine + '\\n' + nextLine.trimStart();
      }
      rawSplitLines[lIdx + 1] = curLine;
      lIdx++;
      continue;
    } else if (inSQuote && !inTripleSQuote && lIdx + 1 < rawSplitLines.length && !curLine.trim().startsWith('#')) {
      const nextLine = rawSplitLines[lIdx + 1];
      curLine = curLine + '\\n' + nextLine.trimStart();
      rawSplitLines[lIdx + 1] = curLine;
      lIdx++;
      continue;
    }

    sanitizedLines.push(curLine);
    lIdx++;
  }
  processed = sanitizedLines.join('\n');

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
    # 1. Hỗ trợ tiếng Việt Unicode & Ký tự Toán học chuẩn cho LaTeX (Arrows, Bullet, etc.)
    config.tex_template.add_to_preamble(r"""
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb}
\\usepackage{mathpazo}
\\usepackage{newunicodechar}
\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{↔}{\\ensuremath{\\leftrightarrow}}
\\newunicodechar{⇒}{\\ensuremath{\\Rightarrow}}
\\newunicodechar{⇔}{\\ensuremath{\\Leftrightarrow}}
\\newunicodechar{•}{\\ensuremath{\\bullet}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{≠}{\\ensuremath{\\neq}}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}
""")
except Exception:
    pass

try:
    # 1.1 Tự động hấp thụ mọi tham số không mong muốn truyền vào Mobject
    _orig_mobject_init = Mobject.__init__
    def _smart_mobject_init(self, color=WHITE, name=None, dim=3, target=None, z_index=0, *args, **kwargs):
        _orig_mobject_init(self, color=color, name=name, dim=dim, target=target, z_index=z_index)
    Mobject.__init__ = _smart_mobject_init
except Exception:
    pass

try:
    # 1.2 Tự động chuẩn hóa font Times New Roman / Liberation Serif đẹp mắt và auto-scale cỡ chữ lớn cho Text
    _orig_text_init = Text.__init__
    def _smart_text_init(self, text, *args, **kwargs):
        if 'line_spacing' not in kwargs:
            kwargs['line_spacing'] = 1.2
        fs = kwargs.get('font_size', None)
        if fs is not None and fs < 22:
            kwargs['font_size'] = max(22, int(fs * 1.35))
        elif fs is None:
            kwargs['font_size'] = 24
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

    # 1.3 Auto-scale font_size cho MathTex và Tex
    _orig_mathtex_init = MathTex.__init__
    def _smart_mathtex_init(self, *tex_strings, **kwargs):
        fs = kwargs.get('font_size', None)
        if fs is not None and fs < 24:
            kwargs['font_size'] = max(24, int(fs * 1.3))
        elif fs is None:
            kwargs['font_size'] = 28
        return _orig_mathtex_init(self, *tex_strings, **kwargs)
    MathTex.__init__ = _smart_mathtex_init

    if 'Tex' in globals():
        _orig_tex_init = Tex.__init__
        def _smart_tex_init(self, *tex_strings, **kwargs):
            fs = kwargs.get('font_size', None)
            if fs is not None and fs < 24:
                kwargs['font_size'] = max(24, int(fs * 1.3))
            elif fs is None:
                kwargs['font_size'] = 28
            return _orig_tex_init(self, *tex_strings, **kwargs)
        Tex.__init__ = _smart_tex_init

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
    # 3. Tương thích các hàm Axes (get_graph_label, get_lines_to_point, get_secant_line, get_tangent_line)
    if not hasattr(Axes, 'get_riemann_rects'):
        Axes.get_riemann_rects = Axes.get_riemann_rectangles

    if hasattr(Axes, 'get_lines_to_point'):
        _orig_get_lines = Axes.get_lines_to_point
        def _smart_get_lines_to_point(self, point, *args, **kwargs):
            col = kwargs.pop('color', None)
            lines = _orig_get_lines(self, point, *args, **kwargs)
            if col is not None:
                lines.set_color(col)
            return lines
        Axes.get_lines_to_point = _smart_get_lines_to_point
        Axes.get_lines_to_coords = _smart_get_lines_to_point

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

    # 6. Helper Khung Thẻ Container Chuyên Nghiệp (Dual-Zone Cards)
    def create_card(width, height, title=None, color="#334155", fill_color="#0F172A", fill_opacity=0.95, font="Times New Roman", title_color=YELLOW):
        card = RoundedRectangle(corner_radius=0.18, width=width, height=height, color=color, fill_color=fill_color, fill_opacity=fill_opacity)
        if title:
            t = Text(title, font=font, font_size=24, weight=BOLD, color=title_color)
            t.next_to(card.get_top(), DOWN, buff=0.25)
            return VGroup(card, t)
        return card
except Exception:
    pass
# ==========================================
`;

  // Tự động nâng cấp các font_size nhỏ dưới 22 trong code
  processed = processed.replace(/\bfont_size\s*=\s*(1[0-9]|20|21)\b/g, (match, p1) => {
    const val = parseInt(p1, 10);
    return `font_size=${Math.max(24, Math.round(val * 1.35))}`;
  });

  // Tự động triệt tiêu lỗi watermark UL va chạm tiêu đề
  processed = processed.replace(/\b([a-zA-Z0-9_]*symbol[a-zA-Z0-9_]*)\.animate(?:\.[a-zA-Z0-9_]+\([^)]*\))*\.to_corner\(UL(?:,\s*buff=[^)]*)?\)/g, 'FadeOut($1)');
  // Sửa lỗi LaTeX \\nearrow / \\searrow nằm trong \text{...}
  processed = processed.replace(/\\text\{([^}]*?)(\\nearrow|\\searrow)([^}]*?)\}/g, '\\text{$1} $2 \\text{$3}');

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
  const userDownloads = path.join(os.homedir(), 'Downloads');
  if (fs.existsSync(userDownloads)) {
    return userDownloads;
  }
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

function getChromeExecutable() {
  const platform = process.platform;
  const home = os.homedir();
  if (platform === 'win32') {
    const prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']].filter(Boolean);
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
      path.join(home, '.local', 'bin', 'google-chrome'),
      path.join(home, '.local', 'bin', 'chrome'),
      path.join(home, '.local', 'bin', 'chromium'),
      path.join(home, '.local', 'opt', 'google', 'chrome', 'google-chrome'),
      path.join(home, '.cache', 'ms-playwright', 'chromium-1243', 'chrome-linux64', 'chrome'),
      '/opt/google/chrome/chrome',
      '/opt/google/chrome/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    try {
      const pw = chromium.executablePath();
      if (pw && fs.existsSync(pw)) return pw;
    } catch {}
    return 'google-chrome';
  }
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

    detectMobileDevice(req);

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
      updateAutomationProgress({
        step: 'ERROR',
        progress: 0,
        message: '⚠️ Người dùng đã gửi lệnh dừng quy trình tự động hóa.'
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 2.2. API: Mobile Heartbeat Ping
    if (pathname === '/api/system/mobile-ping' && req.method === 'GET') {
      detectMobileDevice(req);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', isConnected: true }));
      return;
    }

    // 2.5. API: Shared Current Automation State & Realtime Logs
    if (pathname === '/api/automate/current-state' && req.method === 'GET') {
      detectMobileDevice(req);
      const isConnected = (Date.now() - lastMobileActivity.timestamp) < 10000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ...currentAutomationState,
        isMobileConnected: isConnected,
        mobileDeviceName: isConnected ? lastMobileActivity.deviceName : '',
        mobileIp: isConnected ? lastMobileActivity.ip : ''
      }));
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

          let extractedText = '';
          let pageCount = 1;

          try {
            const pdfModule = require('pdf-parse');
            if (typeof pdfModule === 'function') {
              const parsed = await pdfModule(buffer);
              extractedText = parsed.text || '';
              pageCount = parsed.numpages || 1;
            } else if (pdfModule && pdfModule.PDFParse) {
              const parser = new pdfModule.PDFParse({ data: buffer });
              const resText = await parser.getText();
              extractedText = resText.text || '';
              pageCount = resText.total || (resText.pages && resText.pages.length) || 1;
              if (parser.destroy) {
                await parser.destroy().catch(() => {});
              }
            } else if (pdfModule && pdfModule.default) {
              const parser = new pdfModule.default.PDFParse({ data: buffer });
              const resText = await parser.getText();
              extractedText = resText.text || '';
              pageCount = resText.total || (resText.pages && resText.pages.length) || 1;
            }
          } catch (parseErr) {
            console.warn('Lỗi thư viện pdf-parse:', parseErr.message);
          }

          const fileSizeStr = buffer.length > 1024 * 1024
            ? (buffer.length / (1024 * 1024)).toFixed(1) + ' MB'
            : Math.round(buffer.length / 1024) + ' KB';

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            fileName: safeName,
            numPages: pageCount,
            text: (extractedText || '').replace(/\0/g, ''),
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

    // 5c. API: Upload Image (Hỗ trợ ImageMobject cho Manim Studio)
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
            layoutMode: layoutMode || 'top_card'
          }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi lưu hình ảnh' }));
        }
      });
      return;
    }

    // 5d. API: View Image Stream
    if (pathname.startsWith('/api/view-image')) {
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
        const filePath = parsedUrl.searchParams.get('path');
        if (filePath && fs.existsSync(filePath)) {
          const ext = path.extname(filePath).toLowerCase();
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': MIME_TYPES[ext] || 'image/png',
            'Content-Length': stat.size,
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Hình ảnh không tồn tại.');
          return;
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Lỗi đọc ảnh: ${err.message}`);
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

        currentAutomationState = {
          isRunning: true,
          progress: { step: 'INIT', progress: 0, message: '🚀 Khởi động quy trình tự động hóa...' },
          logs: [],
          startTime: Date.now()
        };

        const sendSSE = (data) => {
          updateAutomationProgress(data);
          try {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } catch {}
          if (data.step === 'COMPLETED' || data.step === 'ERROR') {
            activeRunner = null;
            setTimeout(() => {
              try { res.end(); } catch {}
            }, 600);
          }
        };

        try {
          // XỬ LÝ NHANH: CHẾ ĐỘ RERENDER TRỰC TIẾP (KHÔNG CẦN GỌI AI / PROMPT ENGINE)
          if (options.rerenderOnly || options.action === 'rerender') {
            activeRunner = {
              cancel: () => {
                if (activeRunner && activeRunner.childProc) {
                  try { activeRunner.childProc.kill('SIGTERM'); } catch {}
                }
              },
              childProc: null,
            };

            const downloadsDir = path.join(os.homedir(), 'Downloads');
            if (!fs.existsSync(downloadsDir)) {
              fs.mkdirSync(downloadsDir, { recursive: true });
            }

            // --- PHÂN NHÁNH 1: RERENDER TÀI LIỆU PDF LATEX TRỰC TIẾP ---
            if (options.contentType === 'latex' || Boolean(options.customLatexCode)) {
              sendSSE({
                step: 'COMPILING_LATEX',
                progress: 10,
                message: '⚡ Bắt đầu Rerender tài liệu PDF trực tiếp (Chế độ Offline pdflatex)...',
                contentType: 'latex'
              });

              let rawLatex = options.customLatexCode || '';
              const defaultTexPath = path.join(downloadsDir, 'tailieu.tex');
              if (!rawLatex && fs.existsSync(defaultTexPath)) {
                rawLatex = fs.readFileSync(defaultTexPath, 'utf-8');
              }

              if (!rawLatex || (!rawLatex.includes('\\begin{document}') && !rawLatex.includes('\\documentclass'))) {
                sendSSE({
                  step: 'ERROR',
                  progress: 0,
                  message: '⚠️ Không tìm thấy mã nguồn LaTeX hợp lệ để biên dịch. Vui lòng kiểm tra lại mã nguồn!',
                  error: 'No valid LaTeX code',
                  contentType: 'latex'
                });
                return;
              }

              let cleanLatex = rawLatex.replace(/```(?:latex)?/gi, '').replace(/```/g, '').trim();
              let finalLatex = cleanLatex;
              const timestamp = Date.now();
              const texFileName = `tailieu_${timestamp}.tex`;
              const pdfFileName = `tailieu_${timestamp}.pdf`;
              const targetTexPath = path.join(downloadsDir, texFileName);
              const targetPdfPath = path.join(downloadsDir, pdfFileName);

              fs.writeFileSync(targetTexPath, finalLatex, 'utf-8');
              fs.writeFileSync(defaultTexPath, finalLatex, 'utf-8');

              const compileSh = `#!/bin/bash\npdflatex -interaction=nonstopmode "${texFileName}"\npdflatex -interaction=nonstopmode "${texFileName}"\nrm -f *.aux *.log *.out *.toc\n`;
              const compileBat = `@echo off\nchcp 65001 >nul\npdflatex -interaction=nonstopmode "${texFileName}"\npdflatex -interaction=nonstopmode "${texFileName}"\ndel *.aux *.log *.out *.toc 2>nul\n`;
              fs.writeFileSync(path.join(downloadsDir, 'compile_latex.sh'), compileSh, 'utf-8');
              fs.writeFileSync(path.join(downloadsDir, 'compile_latex.bat'), compileBat, 'utf-8');

              const pdflatexPathFound = getPdflatexPath();
              const pdflatexBin = (pdflatexPathFound && (fs.existsSync(pdflatexPathFound) || pdflatexPathFound === 'pdflatex')) ? pdflatexPathFound : null;

              let compiledPdfPath = null;
              if (pdflatexBin) {
                sendSSE({
                  step: 'COMPILING_LATEX',
                  progress: 30,
                  message: '⚙️ Đang biên dịch tài liệu bằng pdflatex (Lần 1)...',
                  contentType: 'latex',
                  latexCode: finalLatex
                });

                for (let pass = 1; pass <= 2; pass++) {
                  if (pass === 2) {
                    sendSSE({
                      step: 'COMPILING_LATEX',
                      progress: 70,
                      message: '⚙️ Đang biên dịch pdflatex lần 2 (Đồng bộ số trang, mục lục & TikZ)...',
                      contentType: 'latex',
                      latexCode: finalLatex
                    });
                  }
                  await new Promise((resPass) => {
                    const proc = spawn(pdflatexBin, [
                      '-interaction=nonstopmode',
                      `-output-directory=${downloadsDir}`,
                      targetTexPath
                    ], { cwd: downloadsDir });
                    if (activeRunner) activeRunner.childProc = proc;
                    proc.on('close', () => {
                      if (activeRunner) activeRunner.childProc = null;
                      resPass();
                    });
                    proc.on('error', () => {
                      if (activeRunner) activeRunner.childProc = null;
                      resPass();
                    });
                  });
                }

                if (fs.existsSync(targetPdfPath)) {
                  compiledPdfPath = targetPdfPath;
                } else {
                  // Thử Auto-Healing nếu biên dịch lần đầu thất bại
                  const logFile = path.join(downloadsDir, `tailieu_${timestamp}.log`);
                  let logContent = '';
                  if (fs.existsSync(logFile)) {
                    try { logContent = fs.readFileSync(logFile, 'utf-8'); } catch {}
                  }
                  sendSSE({
                    step: 'COMPILING_LATEX',
                    progress: 85,
                    message: '🔧 Kích hoạt LaTeX Auto-Healing: Đang tự động sửa lỗi cú pháp & ký tự đặc biệt...',
                    contentType: 'latex',
                    latexCode: finalLatex
                  });
                  const repaired = autoRepairLatexCode(finalLatex, logContent);
                  if (repaired !== finalLatex) {
                    finalLatex = repaired;
                    fs.writeFileSync(targetTexPath, finalLatex, 'utf-8');
                    fs.writeFileSync(defaultTexPath, finalLatex, 'utf-8');
                    for (let pass = 1; pass <= 2; pass++) {
                      await new Promise((resPass) => {
                        const proc = spawn(pdflatexBin, [
                          '-interaction=nonstopmode',
                          `-output-directory=${downloadsDir}`,
                          targetTexPath
                        ], { cwd: downloadsDir });
                        proc.on('close', () => resPass());
                        proc.on('error', () => resPass());
                      });
                    }
                    if (fs.existsSync(targetPdfPath)) {
                      compiledPdfPath = targetPdfPath;
                    }
                  }
                }

                if (compiledPdfPath) {
                  const auxExtensions = ['.aux', '.log', '.out', '.toc', '.nav', '.snm'];
                  for (const ext of auxExtensions) {
                    const auxFile = path.join(downloadsDir, `tailieu_${timestamp}${ext}`);
                    if (fs.existsSync(auxFile)) {
                      try { fs.unlinkSync(auxFile); } catch {}
                    }
                  }
                }
              }

              if (!compiledPdfPath) {
                const logFile = path.join(downloadsDir, `tailieu_${timestamp}.log`);
                let errorDetails = '';
                if (fs.existsSync(logFile)) {
                  try {
                    const logLines = fs.readFileSync(logFile, 'utf-8').split('\n');
                    const errs = logLines.filter(l => l.startsWith('!') || l.includes('Error:')).slice(0, 4);
                    if (errs.length > 0) errorDetails = errs.join(' | ');
                  } catch {}
                }

                sendSSE({
                  step: 'ERROR',
                  progress: 0,
                  message: `⚠️ Không thể xuất PDF: ${errorDetails || 'Chưa phát hiện trình biên dịch pdflatex hoặc mã nguồn bị lỗi cú pháp.'}`,
                  error: errorDetails || 'Compilation failed',
                  latexCode: finalLatex,
                  filePath: targetTexPath,
                  contentType: 'latex'
                });
                return;
              }

              const pdfPreviewUrl = generatePdfPreviewImage(compiledPdfPath, downloadsDir);

              sendSSE({
                step: 'COMPLETED',
                progress: 100,
                message: '🎉 Rerender tài liệu PDF thành công! [tailieu.pdf]',
                latexCode: finalLatex,
                pdfPath: compiledPdfPath,
                pdfUrl: `/downloads/${pdfFileName}`,
                previewImageUrl: pdfPreviewUrl,
                filePath: targetTexPath,
                contentType: 'latex'
              });
              return;
            }

            // --- PHÂN NHÁNH 2: RERENDER VIDEO MANIM TRỰC TIẾP ---
            const quality = options.renderQuality || '480p';
            const qualityFlag = quality === '4k' ? '-qk' : quality === '480p' ? '-ql' : quality === '720p' ? '-qm' : '-qh';
            const qualityLabel = quality === '480p' ? '480p (Kiểm thử siêu tốc)' : quality === '720p' ? '720p (HD Chuẩn)' : quality === '4k' ? '4K (Ultra HD)' : '1080p (Full HD Chuẩn nét)';

            sendSSE({
              step: 'RENDERING_VIDEO',
              progress: 10,
              message: `⚡ Bắt đầu Rerender Video Manim CE trực tiếp [Chất lượng: ${qualityLabel}]...`,
              contentType: 'manim'
            });

            let rawPython = options.customPythonCode || '';
            const sceneFilePath = path.join(downloadsDir, 'scene.py');
            if (!rawPython && fs.existsSync(sceneFilePath)) {
              rawPython = fs.readFileSync(sceneFilePath, 'utf-8');
            }

            if (!rawPython || (!rawPython.includes('class ') && !rawPython.includes('def construct'))) {
              sendSSE({
                step: 'ERROR',
                progress: 0,
                message: '⚠️ Không tìm thấy mã Python Manim (scene.py) hợp lệ để Rerender. Vui lòng kiểm tra lại mã nguồn!',
                error: 'No valid Manim code',
                contentType: 'manim'
              });
              return;
            }

            let finalPython = prepareManimPythonCode(rawPython);
            fs.writeFileSync(sceneFilePath, finalPython, 'utf-8');

            const renderSh = `#!/bin/bash\nmanim ${qualityFlag} scene.py MainScene\n`;
            fs.writeFileSync(path.join(downloadsDir, 'render_manim.sh'), renderSh, 'utf-8');

            const manimBin = await ensureManimEnvironment((msg) => {
              sendSSE({ step: 'RENDERING_VIDEO', progress: 20, message: msg, contentType: 'manim' });
            });

            if (!manimBin) {
              sendSSE({
                step: 'ERROR',
                progress: 0,
                message: '⚠️ Không tìm thấy Manim CE trong môi trường Python. Vui lòng cài đặt qua pip install manim.',
                error: 'Manim binary missing',
                contentType: 'manim'
              });
              return;
            }

            let sceneClass = 'MainScene';
            const sceneMatch = finalPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
            if (sceneMatch && sceneMatch[1]) sceneClass = sceneMatch[1];

            sendSSE({
              step: 'RENDERING_VIDEO',
              progress: 30,
              message: `⚙️ Đang thực thi Manim CE: manim ${qualityFlag} scene.py ${sceneClass}...`,
              manimCode: finalPython,
              filePath: sceneFilePath,
              contentType: 'manim'
            });

            const mediaDir = path.join(downloadsDir, 'media');
            const renderResult = await new Promise((resRender) => {
              const proc = spawn(manimBin, [qualityFlag, '--media_dir', mediaDir, sceneFilePath, sceneClass], { cwd: downloadsDir });
              if (activeRunner) activeRunner.childProc = proc;
              let stderr = '';
              let stdout = '';
              proc.stdout.on('data', d => { stdout += d.toString(); });
              proc.stderr.on('data', d => {
                const s = d.toString();
                stderr += s;
                const match = s.match(/(\d+)%/);
                if (match) {
                  const pct = Math.min(95, 30 + Math.floor(parseInt(match[1], 10) * 0.65));
                  sendSSE({
                    step: 'RENDERING_VIDEO',
                    progress: pct,
                    message: `Đang render video Manim (${quality}): ${match[1]}%...`,
                    manimCode: finalPython,
                    contentType: 'manim'
                  });
                }
              });
              proc.on('close', code => {
                if (activeRunner) activeRunner.childProc = null;
                if (code === 0) {
                  const newest = findNewestMp4(mediaDir);
                  if (newest) return resRender({ success: true, mp4Path: newest });
                }
                const parsed = parseManimError(stderr, stdout, downloadsDir);
                resRender({ success: false, error: parsed.summary, detailsForAI: parsed.detailsForAI });
              });
              proc.on('error', err => {
                if (activeRunner) activeRunner.childProc = null;
                resRender({ success: false, error: err.message, detailsForAI: err.message });
              });
            });

            if (!renderResult.success || !renderResult.mp4Path) {
              sendSSE({
                step: 'ERROR',
                progress: 0,
                message: `⚠️ Lỗi render Manim: ${renderResult.error || 'Biên dịch thất bại'}`,
                error: renderResult.error,
                manimCode: finalPython,
                filePath: sceneFilePath,
                contentType: 'manim'
              });
              return;
            }

            let finalMp4Path = renderResult.mp4Path;
            let audioPath = null;
            let finalVideoWithAudio = finalMp4Path;

            if (options.enableVoice === true) {
              try {
                sendSSE({ step: 'RENDERING_VIDEO', progress: 96, message: 'Đang tổng hợp thuyết minh giọng đọc AI (TTS)...', contentType: 'manim' });
                const ttsRes = await generateVoiceoverAndMux({
                  pythonCode: finalPython,
                  mp4Path: finalMp4Path,
                  workingDir: downloadsDir,
                  voiceName: options.voiceName || 'vi-VN-HoaiMyNeural',
                  voiceSpeed: options.voiceSpeed || '+0%',
                  fallbackTopic: options.topic || options.subject || 'Toán học',
                  onStatus: (msg) => {
                    sendSSE({ step: 'RENDERING_VIDEO', progress: 98, message: msg, contentType: 'manim' });
                  }
                });
                if (ttsRes && ttsRes.audioPath) audioPath = ttsRes.audioPath;
                if (ttsRes && ttsRes.mp4Path) finalVideoWithAudio = ttsRes.mp4Path;
              } catch (e) {
                console.warn('Voiceover synthesis warning:', e.message);
              }
            }

            const relMp4 = finalVideoWithAudio ? path.relative(downloadsDir, finalVideoWithAudio) : undefined;
            const relAudio = audioPath ? path.relative(downloadsDir, audioPath) : undefined;

            sendSSE({
              step: 'COMPLETED',
              progress: 100,
              message: `🎉 Rerender video Manim (${quality}) thành công!${audioPath ? ' Đã ghép thuyết minh AI.' : ''}`,
              manimCode: finalPython,
              videoPath: finalVideoWithAudio || finalMp4Path,
              videoUrl: relMp4 ? `/downloads/${relMp4}` : undefined,
              audioPath: audioPath || undefined,
              audioUrl: relAudio ? `/downloads/${relAudio}` : undefined,
              filePath: sceneFilePath,
              contentType: 'manim'
            });
            return;
          }

          const rawProvider = (options.aiProvider || options.provider || (options.model && options.model.startsWith('chatgpt') ? 'chatgpt' : 'gemini')).toLowerCase();
          const providerKey = rawProvider;

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

              // Bổ sung thông tin tài liệu RAG nếu có
              let ragText = '';
              let ragFileName = '';
              let ragDirectiveBlock = '';

              if (options.attachedPdfPath && fs.existsSync(options.attachedPdfPath)) {
                ragFileName = path.basename(options.attachedPdfPath);
                sendSSE({
                  step: 'SENDING_PROMPT',
                  progress: 26,
                  message: `Đang bóc tách nội dung tài liệu RAG (${ragFileName})...`,
                });
                const pdfRes = await extractPdfTextSafe(options.attachedPdfPath);
                ragText = (pdfRes && pdfRes.text) ? pdfRes.text.trim() : '';
                if (ragText) {
                  sendSSE({
                    step: 'SENDING_PROMPT',
                    progress: 29,
                    message: `✓ Đã kết nối tài liệu RAG: ${ragFileName} (${pdfRes.numPages} trang, ${ragText.length} ký tự).`,
                  });
                  const cleanedRag = ragText
                    .replace(/\r/g, "")
                    .replace(/(?:-?\s*Trang\s*:?\s*\d+(?:\/\d+)?\s*-?|-?\s*Page\s*:?\s*\d+(?:\/\d+)?\s*-?|SĐT:?\s*\d{8,12}|Hotline:?\s*\d{8,12}|Website:?\s*\S+)/gi, "")
                    .replace(/^(?:Trang|Page)\s+\d+.*$/gim, "")
                    .trim();
                  let trimmedRag = "";
                  if (cleanedRag.length <= 15000) {
                    trimmedRag = cleanedRag;
                  } else {
                    const head = cleanedRag.slice(0, 4000);
                    const tail = cleanedRag.slice(-11000);
                    trimmedRag = `${head}\n\n[... CẮT LƯỢC PHẦN GIỮA, NỐI PHẦN BÀI TẬP VÀ ĐÁP ÁN TRỌNG TÂM TRANG SAU ...]\n\n${tail}`;
                  }
                  ragDirectiveBlock = `\n\n[TÀI LIỆU RAG NGUỒN BẮT BUỘC BÁM SÁT (${ragFileName})]:\n"""\n${trimmedRag}\n"""\n\nCHỈ THỊ SƯ PHẠM RAG BẮT BUỘC KHÔNG ĐƯỢC BỎ QUA:\n1. BẮT BUỘC TRÍCH XUẤT CHÍNH XÁC BÀI TOÁN / CÂU HỎI / ĐỊNH LÝ / DỮ KIỆN TỪ TÀI LIỆU TRÊN để dựng video bài giảng hoặc tài liệu. Nếu là đề ôn tập gồm nhiều câu, chọn bài tiêu biểu nhất (ví dụ Dạng 1 / Câu 1) và giải chi tiết từng bước.\n2. BÁM SÁT 100% CÂU TỪ, DỮ KIỆN, HÀM SỐ, HÌNH VẼ, PHƯƠNG TRÌNH, BƯỚC GIẢI TRONG TÀI LIỆU. TUYỆT ĐỐI KHÔNG BỊA BÀI KHÁC!\n3. DIỄN ĐẠT ĐÚNG VÀ ĐỦ Ý CHÍNH: Lời giải, biến đổi đại số, sơ đồ và bảng biến thiên/đồ thị phải phản ánh trung thực bài toán trong tài liệu.\n4. TUYỆT ĐỐI KHÔNG ghi chú nhãn RAG hay số trang vào câu hỏi hoặc đề bài (VÍ DỤ CẤM: 'Câu 1 (RAG trang 2)', 'Câu 1 (RAG)', '[RAG]'). Toàn bộ câu hỏi phải được hiển thị tự nhiên như đề thi chính thức.\n5. QUY TẮC VIẾT HOA: CHỈ VIẾT HOA TIÊU ĐỀ CHÍNH ĐẦU TRANG. Tuyệt đối không viết HOA TOÀN BỘ (ALL CAPS) ở tiêu đề con, tên bài toán hoặc nội dung câu hỏi.\n6. QUY TẮC IN ĐẬM: Chỉ in đậm số hiệu câu và từ khóa quan trọng tránh bẫy. Tuyệt đối không in đậm toàn bộ câu hỏi.`;
                  if (!promptToSend.includes('[TÀI LIỆU RAG NGUỒN ĐÍNH KÈM / GHIM]')) {
                    promptToSend = ragDirectiveBlock + '\n\n' + promptToSend;
                  }
                } else {
                  if (!promptToSend.includes('[TÀI LIỆU RAG NGUỒN ĐÍNH KÈM / GHIM]')) {
                    promptToSend = `[TÀI LIỆU RAG NGUỒN]: File "${ragFileName}" tại "${options.attachedPdfPath}". Bám sát toàn bộ dữ kiện trong tài liệu này.\n\n` + promptToSend;
                  }
                }
              }

              // Bổ sung chỉ thị cho Antigravity Agent nếu là bài giảng Video
              if (isManimTask && !promptToSend.includes('MainScene')) {
                promptToSend += `\n\nYÊU CẦU BẮT BUỘC CHO VIDEO MANIM CE (CHUẨN c1_HamSo_DonDieu.py):\n- Kế thừa cấu trúc 5 Phân Cảnh Vàng: 1. Intro (~7s, ~20 từ); 2. Lý thuyết 2 thẻ màu tương phản (Xanh Emerald & Đỏ Ruby, ~14s, ~40 từ); 3. Dual-Zone Mô phỏng động tương tác & Bảng/Sơ đồ phân tích (~38s, ~105 từ); 4. Chữa đề/bài tập RAG thực chiến (TỐI ĐA 2 CÂU TIÊU BIỂU: Top Card = Câu 1, Bottom Card = Câu 2; TUYỆT ĐỐI KHÔNG nhồi 3-4 câu); 5. Thẻ Outro thương hiệu "Học ${options.subject || 'tập'} cùng Yuta" (giữ nguyên self.wait(3.0), KHÔNG FadeOut).\n- BẮT BUỘC gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ để triệt tiêu lỗi tràn viền.\n- FONT_SIZE LỚN RÕ RÀNG TRÊN ĐIỆN THOẠI (Tiêu đề 30-34, Thẻ 22-24, MathTex 26-32, Diễn giải 22-24, CẤM DÙNG FONT_SIZE DƯỚI 22).\n- ĐỒNG BỘ ÂM THANH (TTS): Kịch bản VOICEOVER_SCRIPT có số từ phù hợp thời lượng (~2.85 từ/giây). Các lệnh self.play và self.wait khớp nối với lời thoại từng cảnh.\n- Xuất khối mã Python Manim CE duy nhất trong \`\`\`python ... \`\`\` có class MainScene(Scene) và def construct(self): để render ngay.\n- TUYỆT ĐỐI KHÔNG SỬ DỤNG BẤT KỲ TOOL NÀO (KHÔNG run_command, KHÔNG write_to_file, KHÔNG view_file). KHÔNG TỰ CHẠY LỆNH RENDER. CHỈ XUẤT TEXT TRỰC TIẾP.`;
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
                let extractedPython = extractPythonManimCode(responseText, downloadsDir);

                // NẾU LƯỢT 1 LÀ KỊCH BẢN / CHƯA CÓ CODE PYTHON -> TỰ ĐỘNG GỬI LƯỢT 2 CHO ANTIGRAVITY!
                if (!extractedPython || (!extractedPython.includes('class ') && !extractedPython.includes('def construct'))) {
                  sendSSE({
                    step: 'SENDING_PROMPT',
                    progress: 64,
                    message: '✓ [Lượt 1/2] Antigravity đã tạo Kịch bản Sư phạm! Đang tự động gửi [Lượt 2/2] để xuất mã Python Manim CE (scene.py)...',
                  });

                  const isVertical = options.prompt.includes('9:16') || options.prompt.includes('DỌC');
                  const targetDuration = options.duration || '3 - 5 phút';
                  const qualityFlag = options.renderQuality === '4k' ? '-qk' : options.renderQuality === '480p' ? '-ql' : '-qh';
                  const codeFollowupPrompt = `Dựa trên kịch bản sư phạm và nội dung bài học toán sau:
Topic: ${options.topic || options.subject || 'Toán học'}
Thời lượng mục tiêu: ${targetDuration}
Nội dung kịch bản đã thống nhất:
${responseText.slice(0, 4500)}
${ragDirectiveBlock ? `\n${ragDirectiveBlock}\n` : ''}

Hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.

YÊU CẦU BẮT BUỘC KHÔNG ĐƯỢC BỎ QUA (TUÂN THỦ KIẾN TRÚC 5 PHÂN CẢNH VÀNG & c1_HamSo_DonDieu.py):
1. BẮT BUỘC bắt đầu bằng khối mã \`\`\`python ... \`\`\` và kết thúc bằng \`\`\`.
2. BẮT BUỘC có dòng đầu: from manim import *
3. BẮT BUỘC có class MainScene(Scene) hoặc class MainScene(ThreeDScene) chứa def construct(self):
4. ${isVertical ? 'Cấu hình khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0).' : 'Cấu hình khung hình NGANG 16:9 (1920x1080).'}
5. BỐ CỤC 5 PHÂN CẢNH VÀNG CHUẨN MỰC:
   - Phần 1: Mở đầu ấn tượng (Intro, ~7s) - FadeOut toàn bộ.
   - Phần 2: Lý thuyết 2 thẻ màu tương phản (Card Xanh Emerald #064E3B & Card Đỏ Ruby #7F1D1D, height=4.0-4.2 mỗi thẻ, width=8.4) - FadeOut toàn bộ.
   - Phần 3: Dual-Zone Container Mô phỏng động tiếp tuyến trượt đổi màu theo hệ số góc + thanh trạng thái real-time always_redraw + Bảng biến thiên 3 tầng LaTeX chuẩn SGK (\\begin{array}{|c|ccccccc|}) (~38s) - FadeOut toàn bộ.
   - Phần 4: Chữa đề thi RAG thực chiến (TỐI ĐA 2 CÂU TIÊU BIỂU: Top Card = Câu 1, Bottom Card = Câu 2; TUYỆT ĐỐI KHÔNG nhồi 3-4 câu) (~38s) - FadeOut toàn bộ.
   - Phần 5: Thẻ Outro tổng kết thương hiệu "Học toán cùng Yuta" (height=13.6, width=8.4) - BẮT BUỘC kết thúc bằng self.wait(3.0) giữ nguyên màn hình, TUYỆT ĐỐI KHÔNG FadeOut làm đen màn hình!
6. BẮT BUỘC HÀM fit_width(group, 7.8) trên mọi khối nội dung mobject trong thẻ để triệt tiêu lỗi tràn viền.
7. BẮT BUỘC FONT_SIZE LỚN DỄ ĐỌC TRÊN ĐIỆN THOẠI: TUYỆT ĐỐI KHÔNG dùng font_size nhỏ dưới 22! Mọi chữ tiếng Việt font_size=22-24, công thức MathTex font_size=26-32, tiêu đề 30-34.
8. 100% công thức MathTex(r"...") dùng raw string r"...".
9. TUYỆT ĐỐI CHỈ XUẤT MÃ PYTHON TRONG KHỐI \`\`\`python ... \`\`\`, KHÔNG VIẾT LỜI CHÀO HAY GIẢI THÍCH NGOÀI MÃ!
10. TUYỆT ĐỐI KHÔNG GỌI BẤT KỲ TOOL NÀO (KHÔNG run_command, KHÔNG write_to_file, KHÔNG view_file). KHÔNG TỰ CHẠY LỆNH RENDER. Hệ thống sẽ tự biên dịch mã bằng lệnh: \`manim ${qualityFlag} scene.py MainScene\`.`;

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

                  extractedPython = extractPythonManimCode(turn2Text, downloadsDir);
                }

                // FALLBACK TRỰC TIẾP NẾU CẢ 2 LƯỢT CHƯA NẠP ĐƯỢC CODE PYTHON
                if (!extractedPython || (!extractedPython.includes('class ') && !extractedPython.includes('def construct'))) {
                  sendSSE({
                    step: 'SENDING_PROMPT',
                    progress: 74,
                    message: '⚡ Antigravity đang khởi tạo lại mã Python Manim CE trực tiếp...',
                  });

                  const isVertical = options.prompt.includes('9:16') || options.prompt.includes('DỌC');
                  const directPrompt = `Viết duy nhất 1 khối mã Python Manim CE (\`scene.py\`) hoàn chỉnh 100% để tạo video minh họa cho bài toán toán học chủ đề: "${options.topic || options.subject || 'Toán học'}".${ragDirectiveBlock ? `\n${ragDirectiveBlock}\n` : ''}
BẮT BUỘC bắt đầu bằng \`\`\`python from manim import * ... \`\`\` với class MainScene(Scene) và def construct(self):. Cấu hình ${isVertical ? 'Dọc 9:16 Dual-Zone theo chuẩn 5 phân cảnh c1_HamSo_DonDieu.py, lấp đầy 93% màn hình, gọi fit_width(group, 7.8), RAG tối đa 2 câu tiêu biểu, cỡ chữ lớn >= 22 (MathTex 26-32, Tiêu đề 30-34), kết thúc bằng self.wait(3.0) giữ Outro card' : 'Ngang 16:9'}. TUYỆT ĐỐI KHÔNG SỬ DỤNG TOOL/COMMAND (KHÔNG run_command, KHÔNG write_to_file). CHỈ XUẤT DUY NHẤT KHỐI MÃ PYTHON RA TEXT OUTPUT! KHÔNG VIẾT LỜI CHÀO!`;
                  const directText = await runAgyPrompt(directPrompt, downloadsDir, selectedModel);
                  extractedPython = extractPythonManimCode(directText, downloadsDir);
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
                const renderSh = `#!/bin/bash
manim -qh scene.py MainScene
TARGET=$(find media/videos/scene -name "MainScene.mp4" 2>/dev/null | sort -r | head -n 1)
if [ -n "$TARGET" ]; then
  xdg-open "$TARGET" 2>/dev/null || open "$TARGET" 2>/dev/null || true
else
  xdg-open media/videos/scene/1080p60/MainScene.mp4 2>/dev/null || open media/videos/scene/1080p60/MainScene.mp4 2>/dev/null || true
fi
`;
                const renderBat = `@echo off
chcp 65001 >nul
manim -qh scene.py MainScene
if exist "media\\videos\\scene\\1920p60\\MainScene.mp4" (
  start "" "media\\videos\\scene\\1920p60\\MainScene.mp4"
) else if exist "media\\videos\\scene\\1080p60\\MainScene.mp4" (
  start "" "media\\videos\\scene\\1080p60\\MainScene.mp4"
) else (
  start "" "media\\videos\\scene\\1920p15\\MainScene.mp4"
)
`;
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

                  const qualityFlag = options.renderQuality === '4k' ? '-qk' : options.renderQuality === '480p' ? '-ql' : '-qh';
                  const mediaDir = path.join(downloadsDir, 'media');

                  const renderResult = await new Promise((resRender) => {
                    const proc = spawn(manimBin, [qualityFlag, '--media_dir', mediaDir, sceneFilePath, sceneClass], { cwd: downloadsDir });
                    if (activeRunner) activeRunner.childProc = proc;
                    let stderr = '';
                    let stdout = '';
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
                          message: `Đang render video Manim: ${match[1]}%...`,
                          manimCode: currentPython,
                          contentType: 'manim',
                        });
                      }
                    });
                    proc.on('close', code => {
                      if (activeRunner) activeRunner.childProc = null;
                      if (code === 0) {
                        const newest = findNewestMp4(mediaDir);
                        if (newest) return resRender({ success: true, mp4Path: newest });
                      }
                      const parsed = parseManimError(stderr, stdout, downloadsDir);
                      resRender({ success: false, error: parsed.summary, detailsForAI: parsed.detailsForAI });
                    });
                    proc.on('error', err => {
                      if (activeRunner) activeRunner.childProc = null;
                      resRender({ success: false, error: err.message, detailsForAI: err.message });
                    });
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
${ragFileName ? `[LƯU Ý]: Giữ nguyên bài toán và dữ liệu gốc từ tài liệu RAG "${ragFileName}".` : ''}

YÊU CẦU BẮT BUỘC ĐỂ SỬA LỖI:
1. Đọc kỹ vị trí dòng lỗi và chỉ dẫn sửa lỗi ở trên để khắc phục triệt để.
2. Viết lại TOÀN BỘ file scene.py hoàn chỉnh, ngắn gọn súc tích theo cấu trúc 5 phân cảnh chuẩn c1_HamSo_DonDieu.py.
3. Đảm bảo đóng đầy đủ mọi dấu ngoặc, kết thúc hàm construct(self) bằng self.wait(3.0) giữ Outro card.
4. Cấu hình Dual-Zone lấp đầy 93% màn hình, BẮT BUỘC gọi fit_width(group, 7.8) cho mọi khối trong thẻ, RAG tối đa 2 câu tiêu biểu, cỡ chữ lớn dễ đọc (MathTex font_size=26-32, Text font_size=22-24, Tiêu đề 30-34).
5. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, KHÔNG viết lời chào hay giải thích ngoài mã.
6. TUYỆT ĐỐI KHÔNG SỬ DỤNG TOOL/COMMAND (KHÔNG run_command, KHÔNG write_to_file). CHỈ XUẤT DUY NHẤT MÃ PYTHON RA OUTPUT.`;

                    const healedText = await runAgyPrompt(healPrompt, downloadsDir, selectedModel);
                    const healedCode = extractPythonManimCode(healedText, downloadsDir);
                    if (healedCode && healedCode.length > 50) {
                      currentPython = healedCode;
                    }
                  }
                }

                // TỔNG HỢP THUYẾT MINH GIỌNG ĐỌC AI
                let audioPath = null;
                let finalVideoWithAudio = finalMp4Path;
                if (renderSuccess && finalMp4Path && options.enableVoice === true) {
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

              const pdflatexPathFound = getPdflatexPath();
              const pdflatexBin = (pdflatexPathFound && (fs.existsSync(pdflatexPathFound) || pdflatexPathFound === 'pdflatex')) ? pdflatexPathFound : null;

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
                } else {
                  // Tự động kích hoạt LaTeX Auto-Healing nếu biên dịch lần 1 thất bại
                  const logFile = path.join(downloadsDir, `tailieu_${timestamp}.log`);
                  let logContent = '';
                  if (fs.existsSync(logFile)) {
                    try { logContent = fs.readFileSync(logFile, 'utf-8'); } catch {}
                  }
                  sendSSE({
                    step: 'RECOMPILING',
                    progress: 94,
                    message: '🔧 Kích hoạt LaTeX Auto-Healing: Đang tự động sửa lỗi cú pháp & ký tự đặc biệt...',
                  });
                  const repairedLatex = autoRepairLatexCode(finalLatex, logContent);
                  if (repairedLatex !== finalLatex) {
                    finalLatex = repairedLatex;
                    fs.writeFileSync(texPath, finalLatex, 'utf-8');
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
                    }
                  }
                }

                if (compiledPdfPath) {
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

              const pdfPreviewUrl = compiledPdfPath ? generatePdfPreviewImage(compiledPdfPath, downloadsDir) : undefined;

              sendSSE({
                step: 'COMPLETED',
                progress: 100,
                message: compiledPdfPath
                  ? '🎉 Antigravity Agent đã hoàn tất biên soạn & biên dịch PDF thành công!'
                  : '🎉 Antigravity Agent đã hoàn tất tạo mã LaTeX (Chưa phát hiện pdflatex để xuất PDF tự động)!',
                latexCode: finalLatex,
                pdfUrl: compiledPdfPath ? `/downloads/${pdfFileName}` : undefined,
                pdfPreviewUrl,
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
              const chromeExec = getChromeExecutable();
              const hasChromeExec = chromeExec && fs.existsSync(chromeExec);
              const getLaunchConfig = (ch) => {
                const cfg = {
                  headless: isHeadless,
                  viewport: viewportSetting,
                  userAgent: stealthUA,
                  args: stealthArgs,
                  ignoreDefaultArgs: ['--enable-automation'],
                };
                if (hasChromeExec) {
                  cfg.executablePath = chromeExec;
                } else {
                  cfg.channel = ch;
                }
                return cfg;
              };
              const userDataDir = path.join(os.tmpdir(), 'yuta_chrome_auto_' + Date.now());
              browserContext = await chromium.launchPersistentContext(userDataDir, getLaunchConfig('chrome'));
            }
          } else {
            const chromeExec = getChromeExecutable();
            const hasChromeExec = chromeExec && fs.existsSync(chromeExec);
            const getLaunchConfig = (ch) => {
              const cfg = {
                headless: isHeadless,
                viewport: viewportSetting,
                userAgent: stealthUA,
                args: stealthArgs,
                ignoreDefaultArgs: ['--enable-automation'],
              };
              if (hasChromeExec) {
                cfg.executablePath = chromeExec;
              } else {
                cfg.channel = ch;
              }
              return cfg;
            };
            const defaultUserDataDir = path.join(app.getPath('userData'), 'AutomationProfile');
            const userDataDir = options.chromeProfilePath || defaultUserDataDir;
            cleanStaleChromiumLocks(userDataDir, false);
            try {
              browserContext = await chromium.launchPersistentContext(
                userDataDir,
                getLaunchConfig(browserType === 'edge' ? 'msedge' : 'chrome')
              );
            } catch (e) {
              console.warn('Profile Chrome đang bị khóa hoặc lỗi khởi động, thử xóa lock và khởi động lại:', e.message);
              cleanStaleChromiumLocks(userDataDir, true);
              await new Promise(r => setTimeout(r, 1200));
              try {
                browserContext = await chromium.launchPersistentContext(
                  userDataDir,
                  getLaunchConfig(browserType === 'edge' ? 'msedge' : 'chrome')
                );
              } catch (errRetry) {
                console.warn('Profile Chrome vẫn bị khóa, chuyển sang session tạm:', errRetry.message);
                const tempDir = path.join(os.tmpdir(), 'yuta_automation_chrome_' + Date.now());
                browserContext = await chromium.launchPersistentContext(tempDir, getLaunchConfig('chrome'));
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
              const qualityFlag = '-qh';
              const codeFollowupPrompt = `Tuyệt vời! Dựa trên kịch bản sư phạm và khối lời thoại VOICEOVER_SCRIPT vừa thống nhất ở trên, hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.

YÊU CẦU KỸ THUẬT BẮT BUỘC (TUÂN THỦ KIẾN TRÚC 5 PHÂN CẢNH VÀNG & c1_HamSo_DonDieu.py):
1. Kế thừa chính xác biến VOICEOVER_SCRIPT và 5 phân cảnh vàng: (1. Intro, 2. Lý thuyết 2 thẻ màu, 3. Dual-Zone Mô phỏng động tiếp tuyến đổi màu & BBT 3 tầng, 4. Chữa đề RAG thực chiến tối đa 2 câu, 5. Outro thương hiệu "Học toán cùng Yuta").
2. Cấu hình ${isVertical ? 'Khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)' : 'Khung hình NGANG 16:9 (1920x1080, config.frame_width=14.22, config.frame_height=8.0)'}.
3. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
   - MỌI công thức, phương trình, biến số bắt buộc dùng MathTex(r"...") với raw string r"...".
   - Phân số \\frac{a}{b}, căn thức \\sqrt{x}, tích phân \\int, đạo hàm \\frac{df}{dx}, vector \\vec{u}.
   - Biến đổi toán học nhiều dòng dùng môi trường aligned: MathTex(r"\\begin{aligned} ... &= ... \\\\ &= ... \\end{aligned}").
   - Đóng khung nổi bật đáp số / kết quả cuối cùng: SurroundingRectangle(result, color=GREEN, buff=0.16, corner_radius=0.12).
   - Tuyệt đối KHÔNG viết tiếng Việt có dấu trực tiếp trong MathTex; tiếng Việt dùng Text("...", font="Times New Roman").
4. MÔ PHỎNG TOÁN HỌC TRỰC QUAN SINH ĐỘNG (VISUAL SIMULATION):
   - Phân cảnh giải toán BẮT BUỘC có mô phỏng hình ảnh động: Hệ trục tọa độ Axes (x_length=7.2, y_length=4.0), đồ thị axes.plot(...), điểm Dot di chuyển trên đường cong bằng ValueTracker, tiếp tuyến trượt đổi màu theo hệ số góc f'(x) và thanh trạng thái real-time always_redraw.
5. BỐ CỤC KHUNG THẺ CONTAINER (DUAL-ZONE) LẤP ĐẦY 93% MÀN HÌNH (TRIỆT TIÊU KHOẢNG TRỐNG ĐEN):
   - ${isVertical ? 'Header Bar (y ~ 7.05, height=1.1-1.3, width=8.4, tiêu đề font_size=30-34 BOLD); Top Card (y ~ 3.15, height=6.4, width=8.4, tiêu đề font_size=22-24, axes x_length=7.2, y_length=4.0); Bottom Card (y ~ -3.75, height=6.6, width=8.4, tiêu đề font_size=22-24, MathTex font_size=26-32, diễn giải font_size=22-24, bảng biến thiên font_size=22-24). BẮT BUỘC gọi fit_width(group, 7.8) cho mọi khối trong thẻ!' : 'Header đỉnh màn hình, Cột Trái Mô phỏng Đồ thị (width=7.2, height=6.2), Cột Phải Lời giải LaTeX (width=5.8, height=6.2).'}.
   - BẮT BUỘC font_size lớn rõ nét (Tiêu đề 30-34, Thẻ 22-24, MathTex 26-32, Text tiếng Việt 22-24, CẤM DÙNG FONT_SIZE DƯỚI 22).
6. NHỊP ĐIỆU THỊ GIÁC & CHUYỂN CẢNH MƯỢT MÀ:
   - Dùng TransformMatchingTex khi biến đổi công thức đại số.
   - Dùng LaggedStart khi xuất hiện danh sách hoặc các phần tử nối tiếp.
   - Có khoảng dừng self.wait(1.5 đến 2.5s) sau các công thức trọng tâm để người xem kịp quan sát.
7. Màu nền "#0B1120", toàn bộ Text dùng font="Times New Roman".
8. Cảnh Outro: Thẻ Card tổng kết toàn màn hình (height=13.6, width=8.4), giữ nguyên màn hình (self.wait(3.0)), TUYỆT ĐỐI KHÔNG DÙNG FadeOut(*self.mobjects) làm đen màn hình.
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
2. Viết lại TOÀN BỘ file scene.py hoàn chỉnh, ngắn gọn súc tích.
3. Đảm bảo đóng đầy đủ mọi dấu ngoặc, kết thúc hàm construct(self) bằng self.wait(3).
4. Giữ nguyên class MainScene(Scene) hoặc tên Scene tương ứng, cấu hình Dual-Zone lấp đầy 93% màn hình (height 6.4 và 6.6), cỡ chữ lớn dễ đọc (MathTex font_size=28-34, Text font_size=22-26, Tiêu đề 30-34).
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

                  if (options.enableVoice === true) {
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

                    if (options.enableVoice === true) {
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
                  } else {
                    const epErr = healResult.error ? healResult.error.slice(0, 100) : 'Lỗi không xác định';
                    sendSSE({
                      step: 'RENDERING_VIDEO',
                      progress: Math.floor((ep / seriesCount) * 94),
                      message: `⚠️ [${epLabel}] Render chưa hoàn tất: ${epErr}... Bỏ qua tập này.`,
                      contentType: 'manim',
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
                  message: `🎉 Hoàn tất 1-Click! Đã sản xuất trọn bộ playlist ${playlistVideos.length} tập video MP4${options.enableVoice === true ? ' kèm thuyết minh giọng đọc AI' : ''}!`,
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

          const timestamp = Date.now();
          const texFileName = `tailieu_${timestamp}.tex`;
          const localPdfFileName = `tailieu_${timestamp}.pdf`;
          const texPath = path.join(downloadsDir, texFileName);
          const localPdfPath = path.join(downloadsDir, localPdfFileName);
          fs.writeFileSync(texPath, finalLatex, 'utf-8');

          sendSSE({
            step: 'EXTRACTING_LATEX',
            progress: 70,
            message: 'Đã trích xuất mã LaTeX thành công!',
            latexCode: finalLatex,
          });


          // Check renderMode: 'local' vs 'overleaf'
          const renderMode = options.renderMode || 'local';

          if (renderMode === 'local') {
            sendSSE({
              step: 'RECOMPILING',
              progress: 85,
              message: '⚡ Đang biên dịch PDF cục bộ bằng pdflatex (Chế độ Local Fast Render)...',
            });

            let compiledPdfPath = null;

            const pdflatexBin = getPdflatexPath();
            if (pdflatexBin) {
              for (let pass = 1; pass <= 2; pass++) {
                try {
                  execSync(`"${pdflatexBin}" -interaction=nonstopmode -output-directory="${downloadsDir}" "${texPath}"`, { cwd: downloadsDir, stdio: 'ignore' });
                } catch (cErr) {
                  console.warn(`Pdflatex local compilation pass ${pass} notice:`, cErr.message);
                }
              }
              if (fs.existsSync(localPdfPath)) {
                compiledPdfPath = localPdfPath;
              } else {
                // Tự động kích hoạt LaTeX Auto-Healing nếu local render lần 1 thất bại
                const logFile = path.join(downloadsDir, `tailieu_${timestamp}.log`);
                let logContent = '';
                if (fs.existsSync(logFile)) {
                  try { logContent = fs.readFileSync(logFile, 'utf-8'); } catch {}
                }
                const repairedLatex = autoRepairLatexCode(finalLatex, logContent);
                if (repairedLatex !== finalLatex) {
                  finalLatex = repairedLatex;
                  fs.writeFileSync(texPath, finalLatex, 'utf-8');
                  for (let pass = 1; pass <= 2; pass++) {
                    try {
                      execSync(`"${pdflatexBin}" -interaction=nonstopmode -output-directory="${downloadsDir}" "${texPath}"`, { cwd: downloadsDir, stdio: 'ignore' });
                    } catch {}
                  }
                  if (fs.existsSync(localPdfPath)) {
                    compiledPdfPath = localPdfPath;
                  }
                }
              }

              if (compiledPdfPath) {
                const auxExtensions = ['.aux', '.log', '.out', '.toc', '.nav', '.snm'];
                for (const ext of auxExtensions) {
                  const auxFile = path.join(downloadsDir, `tailieu_${timestamp}${ext}`);
                  if (fs.existsSync(auxFile)) {
                    try { fs.unlinkSync(auxFile); } catch {}
                  }
                }
              }
            }

            const pdfPreviewUrl = compiledPdfPath ? generatePdfPreviewImage(compiledPdfPath, downloadsDir) : undefined;

            sendSSE({
              step: 'COMPLETED',
              progress: 100,
              message: compiledPdfPath
                ? '🎉 Local Render hoàn tất! File PDF đã được biên dịch thành công siêu tốc.'
                : '🎉 Local Render hoàn tất! Đã trích xuất mã LaTeX thành công.',
              latexCode: finalLatex,
              pdfUrl: compiledPdfPath ? `/downloads/${localPdfFileName}` : undefined,
              pdfPreviewUrl,
              pdfPath: compiledPdfPath || texPath,
              filePath: compiledPdfPath || texPath,
              contentType: 'latex'
            });
            activeRunner = null;
            res.end();
            return;
          }

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

          if (!pdfSavedPath && fs.existsSync(path.join(downloadsDir, texFileName))) {
            const texPath = path.join(downloadsDir, texFileName);
            const pdflatexBin = getPdflatexPath();
            if (pdflatexBin) {
              try {
                execSync(`"${pdflatexBin}" -interaction=nonstopmode -output-directory="${downloadsDir}" "${texPath}"`, { cwd: downloadsDir, stdio: 'ignore' });
                if (fs.existsSync(pdfPath)) {
                  pdfSavedPath = pdfPath;
                }
              } catch (cErr) {
                console.warn('Pdflatex fallback compilation warning:', cErr.message);
              }
            }
          }

          const pdfPreviewUrl = pdfSavedPath ? generatePdfPreviewImage(pdfSavedPath, downloadsDir) : undefined;

          sendSSE({
            step: 'COMPLETED',
            progress: 100,
            message: pdfSavedPath
              ? `🎉 Hoàn tất 1-Click! File PDF đã được lưu vào ${pdfFileName}`
              : '🎉 Hoàn tất! Mã LaTeX đã được đồng bộ sang Overleaf.',
            latexCode: finalLatex,
            pdfUrl: pdfSavedPath ? `/downloads/${pdfFileName}` : undefined,
            pdfPreviewUrl,
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
      let filePath = path.join(downloadsDir, relPath);
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        const userDownloads = path.join(os.homedir(), 'Downloads', relPath);
        if (fs.existsSync(userDownloads) && fs.statSync(userDownloads).isFile()) {
          filePath = userDownloads;
        } else {
          const appDownloads = path.join(app.getPath('userData'), 'downloads', relPath);
          if (fs.existsSync(appDownloads) && fs.statSync(appDownloads).isFile()) {
            filePath = appDownloads;
          }
        }
      }
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

    // 4.4. WAN Tunnel Start/Stop APIs
    if (pathname === '/api/system/tunnel/start' && req.method === 'POST') {
      try {
        const wanUrl = await startWanTunnel(activeServerPort || 3000);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, wanUrl }));
      } catch (err) {
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

    if (pathname === '/api/system/pin/set' && req.method === 'POST') {
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

    if (pathname === '/api/system/pin/verify' && req.method === 'POST') {
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

    // 4.5. System Network Info for Mobile LAN Access & WAN Tunnel
    if (pathname === '/api/system/network-info' && req.method === 'GET') {
      detectMobileDevice(req);
      const interfaces = os.networkInterfaces();
      let lanIp = '127.0.0.1';
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            lanIp = iface.address;
            break;
          }
        }
      }
      const isConnected = (Date.now() - lastMobileActivity.timestamp) < 10000;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        lanIp,
        port: activeServerPort,
        mobileUrl: `http://${lanIp}:${activeServerPort}`,
        wanUrl: currentWanUrl,
        isWanActive: Boolean(currentWanUrl),
        hasPin: Boolean(desktopSecurityPin),
        isMobileConnected: isConnected,
        mobileDeviceName: isConnected ? lastMobileActivity.deviceName : '',
        mobileIp: isConnected ? lastMobileActivity.ip : ''
      }));
      return;
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

  server.listen(0, '0.0.0.0', () => {
    const port = server.address().port;
    activeServerPort = port;
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
