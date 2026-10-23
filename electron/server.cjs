var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/serverCore.ts
var serverCore_exports = {};
__export(serverCore_exports, {
  getLiveAntigravityQuota: () => getLiveAntigravityQuota,
  startStandaloneServer: () => startStandaloneServer
});
module.exports = __toCommonJS(serverCore_exports);
var import_http = __toESM(require("http"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_os2 = __toESM(require("os"), 1);

// server/automationRunner.ts
var import_playwright_core = require("playwright-core");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_os = __toESM(require("os"), 1);
var import_child_process = require("child_process");
var moduleDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
var homeDir = import_os.default.homedir();
var extraPaths = [
  import_path.default.join(process.cwd(), ".venv", "bin"),
  import_path.default.join(moduleDir, "..", ".venv", "bin"),
  import_path.default.join(homeDir, ".TinyTeX", "bin", "x86_64-linux"),
  import_path.default.join(homeDir, ".local", "bin"),
  import_path.default.join(homeDir, ".venv", "bin"),
  "/usr/local/bin",
  "/usr/bin",
  "/bin"
];
var validExtra = extraPaths.filter((p) => import_fs.default.existsSync(p));
process.env.PATH = Array.from(/* @__PURE__ */ new Set([...validExtra, ...(process.env.PATH || "").split(":")])).filter(Boolean).join(":");
function generatePdfPreviewImage(pdfPath, downloadsDir) {
  if (!pdfPath || !import_fs.default.existsSync(pdfPath)) return void 0;
  try {
    const baseName = import_path.default.basename(pdfPath, import_path.default.extname(pdfPath));
    const outputPrefix = import_path.default.join(downloadsDir, `preview_${baseName}`);
    (0, import_child_process.execSync)(`pdftoppm -png -r 150 -f 1 -l 1 "${pdfPath}" "${outputPrefix}"`, { stdio: "ignore" });
    const files = import_fs.default.readdirSync(downloadsDir);
    const imgFile = files.find((f) => f.startsWith(`preview_${baseName}`) && f.endsWith(".png"));
    if (imgFile) {
      return `/downloads/${imgFile}`;
    }
  } catch (err) {
    console.error("L\u1ED7i khi t\u1EA1o \u1EA3nh preview PDF v\u1EDBi pdftoppm:", err.message);
  }
  return void 0;
}
function getPdflatexPath() {
  const home = import_os.default.homedir();
  const candidates = process.platform === "win32" ? [
    "C:\\miktex\\miktex\\bin\\x64\\pdflatex.exe",
    "C:\\texlive\\2024\\bin\\windows\\pdflatex.exe",
    "C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe"
  ] : [
    import_path.default.join(home, ".TinyTeX", "bin", "x86_64-linux", "pdflatex"),
    import_path.default.join(home, ".local", "bin", "pdflatex"),
    "/usr/bin/pdflatex",
    "/usr/local/bin/pdflatex",
    "/Library/TeX/texbin/pdflatex"
  ];
  for (const c of candidates) {
    if (import_fs.default.existsSync(c)) return c;
  }
  try {
    const whichCmd = process.platform === "win32" ? "where pdflatex" : "which pdflatex";
    const stdout = (0, import_child_process.execSync)(whichCmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
    const firstPath = stdout.trim().split(/\r?\n/)[0]?.trim();
    if (firstPath && import_fs.default.existsSync(firstPath)) {
      return firstPath;
    }
  } catch (e) {
  }
  return "pdflatex";
}
var DEFAULT_STEALTH_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";
var AutomationRunner = class _AutomationRunner {
  constructor() {
    this.context = null;
    this.isCancelled = false;
    this.activePage = null;
    this.childProc = null;
  }
  static getDefaultChromePath() {
    const platform = process.platform;
    if (platform === "win32") {
      const prefixes = [
        process.env.LOCALAPPDATA,
        process.env.PROGRAMFILES,
        process.env["PROGRAMFILES(X86)"]
      ].filter(Boolean);
      for (const prefix of prefixes) {
        const p = import_path.default.join(prefix, "Google", "Chrome", "Application", "chrome.exe");
        if (import_fs.default.existsSync(p)) return p;
        const pEdge = import_path.default.join(prefix, "Microsoft", "Edge", "Application", "msedge.exe");
        if (import_fs.default.existsSync(pEdge)) return pEdge;
      }
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    } else if (platform === "darwin") {
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    } else {
      const candidates = [
        import_path.default.join(import_os.default.homedir(), ".local", "bin", "google-chrome"),
        import_path.default.join(import_os.default.homedir(), ".local", "bin", "chrome"),
        import_path.default.join(import_os.default.homedir(), ".local", "bin", "chromium"),
        import_path.default.join(import_os.default.homedir(), ".local", "opt", "google", "chrome", "google-chrome"),
        import_path.default.join(import_os.default.homedir(), ".cache", "ms-playwright", "chromium-1243", "chrome-linux64", "chrome"),
        "/usr/bin/google-chrome-stable",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/snap/bin/chromium"
      ];
      for (const p of candidates) {
        if (import_fs.default.existsSync(p)) return p;
      }
      try {
        const pw = import_playwright_core.chromium.executablePath();
        if (pw && import_fs.default.existsSync(pw)) return pw;
      } catch {
      }
      return "google-chrome";
    }
  }
  static getDefaultFirefoxPath() {
    const platform = process.platform;
    if (platform === "win32") {
      const prefixes = [
        process.env.PROGRAMFILES,
        process.env["PROGRAMFILES(X86)"],
        process.env.LOCALAPPDATA
      ].filter(Boolean);
      for (const prefix of prefixes) {
        const p = import_path.default.join(prefix, "Mozilla Firefox", "firefox.exe");
        if (import_fs.default.existsSync(p)) return p;
      }
      return "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
    } else if (platform === "darwin") {
      return "/Applications/Firefox.app/Contents/MacOS/firefox";
    } else {
      const candidates = ["/usr/bin/firefox", "/usr/local/bin/firefox", "/snap/bin/firefox"];
      for (const p of candidates) {
        if (import_fs.default.existsSync(p)) return p;
      }
      return "firefox";
    }
  }
  static getDefaultFirefoxProfileDir() {
    const platform = process.platform;
    const home = import_os.default.homedir();
    let baseDir = "";
    if (platform === "win32") {
      baseDir = import_path.default.join(process.env.APPDATA || import_path.default.join(home, "AppData", "Roaming"), "Mozilla", "Firefox", "Profiles");
    } else if (platform === "darwin") {
      baseDir = import_path.default.join(home, "Library", "Application Support", "Firefox", "Profiles");
    } else {
      baseDir = import_path.default.join(home, ".mozilla", "firefox");
    }
    if (import_fs.default.existsSync(baseDir)) {
      try {
        const files = import_fs.default.readdirSync(baseDir);
        const defaultProfile = files.find((f) => f.includes("default-release") || f.includes(".default"));
        if (defaultProfile) {
          return import_path.default.join(baseDir, defaultProfile);
        }
      } catch {
      }
      return baseDir;
    }
    return import_path.default.join(import_os.default.tmpdir(), "yuta_firefox_profile");
  }
  static getDefaultUserDataDir() {
    const platform = process.platform;
    const home = import_os.default.homedir();
    if (platform === "win32") {
      const localAppData = process.env.LOCALAPPDATA || import_path.default.join(home, "AppData", "Local");
      return import_path.default.join(localAppData, "Google", "Chrome", "User Data");
    } else if (platform === "darwin") {
      return import_path.default.join(home, "Library", "Application Support", "Google", "Chrome");
    } else {
      return import_path.default.join(home, ".config", "google-chrome");
    }
  }
  static cleanStaleChromiumLocks(profileDir, force = false) {
    if (!profileDir || !import_fs.default.existsSync(profileDir)) return;
    const lockFiles = ["SingletonLock", "SingletonSocket", "SingletonCookie", "lockfile"];
    const lockSymlink = import_path.default.join(profileDir, "SingletonLock");
    let isStale = force;
    if (!isStale) {
      try {
        const stat = import_fs.default.lstatSync(lockSymlink);
        if (stat.isSymbolicLink()) {
          const target = import_fs.default.readlinkSync(lockSymlink);
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
      }
    }
    if (isStale) {
      for (const f of lockFiles) {
        const p = import_path.default.join(profileDir, f);
        try {
          import_fs.default.rmSync(p, { force: true, recursive: true });
        } catch {
          try {
            import_fs.default.unlinkSync(p);
          } catch {
          }
        }
      }
    }
  }
  cancel() {
    this.isCancelled = true;
    if (this.childProc) {
      try {
        this.childProc.kill("SIGTERM");
      } catch {
      }
      this.childProc = null;
    }
    if (this.context) {
      this.context.close().catch(() => {
      });
      this.context = null;
    }
  }
  static getVenvPaths() {
    const isWin = process.platform === "win32";
    const candidates = [
      import_path.default.resolve(process.cwd(), ".venv"),
      import_path.default.resolve(moduleDir, "..", ".venv"),
      import_path.default.resolve(moduleDir, "..", "..", ".venv"),
      import_path.default.resolve(import_os.default.homedir(), ".venv")
    ];
    let venvDir = candidates[0];
    for (const cand of candidates) {
      if (import_fs.default.existsSync(cand)) {
        venvDir = cand;
        break;
      }
    }
    const pythonBin = isWin ? import_path.default.join(venvDir, "Scripts", "python.exe") : import_path.default.join(venvDir, "bin", "python3");
    const pipBin = isWin ? import_path.default.join(venvDir, "Scripts", "pip.exe") : import_path.default.join(venvDir, "bin", "pip");
    const manimBin = isWin ? import_path.default.join(venvDir, "Scripts", "manim.exe") : import_path.default.join(venvDir, "bin", "manim");
    const edgeTtsBin = isWin ? import_path.default.join(venvDir, "Scripts", "edge-tts.exe") : import_path.default.join(venvDir, "bin", "edge-tts");
    return { venvDir, pythonBin, pipBin, manimBin, edgeTtsBin };
  }
  static getManimExecutable() {
    const { manimBin } = _AutomationRunner.getVenvPaths();
    if (import_fs.default.existsSync(manimBin)) {
      return manimBin;
    }
    try {
      const whichCmd = process.platform === "win32" ? "where manim" : "which manim";
      const out = require("child_process").execSync(whichCmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      const trimmed = out.trim().split(/\r?\n/)[0].trim();
      if (trimmed && import_fs.default.existsSync(trimmed)) {
        return trimmed;
      }
    } catch {
    }
    return null;
  }
  static async installPythonPackage(pkgName, onProgress) {
    const { pipBin } = _AutomationRunner.getVenvPaths();
    const isWin = process.platform === "win32";
    const targetPip = import_fs.default.existsSync(pipBin) ? pipBin : isWin ? "pip" : "pip3";
    if (onProgress) onProgress(`\u0110ang t\u1EF1 \u0111\u1ED9ng c\xE0i \u0111\u1EB7t g\xF3i "${pkgName}" qua pip...`);
    return new Promise((resolve) => {
      const proc = (0, import_child_process.spawn)(targetPip, ["install", pkgName]);
      proc.on("close", (code) => resolve(code === 0));
      proc.on("error", () => resolve(false));
    });
  }
  static async ensureManimEnvironment(onProgress) {
    const { venvDir, pythonBin, pipBin, manimBin } = _AutomationRunner.getVenvPaths();
    if (import_fs.default.existsSync(manimBin)) {
      return manimBin;
    }
    try {
      const whichCmd = process.platform === "win32" ? "where manim" : "which manim";
      const out = require("child_process").execSync(whichCmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      const trimmed = out.trim().split(/\r?\n/)[0].trim();
      if (trimmed && import_fs.default.existsSync(trimmed)) {
        return trimmed;
      }
    } catch {
    }
    if (onProgress) onProgress("\u0110ang t\u1EF1 \u0111\u1ED9ng t\u1EA1o m\xF4i tr\u01B0\u1EDDng Python v\xE0 c\xE0i \u0111\u1EB7t Manim CE...");
    if (!import_fs.default.existsSync(pythonBin)) {
      const isWin = process.platform === "win32";
      const sysPython = isWin ? "python" : "python3";
      try {
        await new Promise((resolve, reject) => {
          const proc = (0, import_child_process.spawn)(sysPython, ["-m", "venv", venvDir]);
          proc.on("close", (code) => code === 0 ? resolve() : reject(new Error(`M\xE3 tho\xE1t: ${code}`)));
          proc.on("error", (err) => reject(err));
        });
      } catch (e) {
        if (onProgress) onProgress(`L\u1ED7i kh\u1EDFi t\u1EA1o venv: ${e.message}`);
        return null;
      }
    }
    if (import_fs.default.existsSync(pipBin)) {
      if (onProgress) onProgress("\u0110ang t\u1EA3i v\xE0 c\xE0i \u0111\u1EB7t Manim CE + SymPy qua pip (vui l\xF2ng \u0111\u1EE3i 1-2 ph\xFAt)...");
      try {
        await new Promise((resolve, reject) => {
          const proc = (0, import_child_process.spawn)(pipBin, ["install", "manim", "sympy"]);
          proc.on("close", (code) => code === 0 ? resolve() : reject(new Error(`M\xE3 tho\xE1t: ${code}`)));
          proc.on("error", (err) => reject(err));
        });
      } catch (e) {
        if (onProgress) onProgress(`L\u1ED7i c\xE0i \u0111\u1EB7t Manim: ${e.message}`);
        return null;
      }
    }
    if (import_fs.default.existsSync(manimBin)) {
      return manimBin;
    }
    return null;
  }
  static async autoInstallMissingDependencies(code, onProgress) {
    const { pythonBin } = _AutomationRunner.getVenvPaths();
    if (!import_fs.default.existsSync(pythonBin)) return;
    const importRegex = /(?:^|\n)\s*(?:import|from)\s+([a-zA-Z0-9_]+)/g;
    const standardModules = /* @__PURE__ */ new Set([
      "sys",
      "os",
      "math",
      "random",
      "time",
      "re",
      "json",
      "datetime",
      "collections",
      "itertools",
      "functools",
      "typing",
      "abc",
      "copy",
      "io",
      "pathlib",
      "fractions",
      "cmath",
      "decimal",
      "manim",
      "numpy",
      "scipy",
      "PIL",
      "pillow",
      "pydub",
      "screeninfo",
      "srt",
      "subprocess"
    ]);
    const matches = Array.from(code.matchAll(importRegex));
    const checked = /* @__PURE__ */ new Set();
    for (const m of matches) {
      const pkg = m[1];
      if (standardModules.has(pkg) || checked.has(pkg)) continue;
      checked.add(pkg);
      const canImport = await new Promise((resolve) => {
        const proc = (0, import_child_process.spawn)(pythonBin, ["-c", `import ${pkg}`]);
        proc.on("close", (code2) => resolve(code2 === 0));
        proc.on("error", () => resolve(false));
      });
      if (!canImport) {
        if (onProgress) onProgress(`Ph\xE1t hi\u1EC7n code c\u1EA7n th\u01B0 vi\u1EC7n "${pkg}", \u0111ang t\u1EF1 \u0111\u1ED9ng c\xE0i \u0111\u1EB7t...`);
        await _AutomationRunner.installPythonPackage(pkg, onProgress);
      }
    }
  }
  static async ensureFreshChatSession(page, targetAiUrl, aiName, onProgress) {
    if (!page || page.isClosed()) return;
    try {
      const curUrl = page.url();
      const isGemini = curUrl.includes("gemini.google.com") || targetAiUrl.includes("gemini.google.com");
      const isChatGPT = curUrl.includes("chatgpt.com") || targetAiUrl.includes("chatgpt.com") || curUrl.includes("openai.com");
      const isClaude = curUrl.includes("claude.ai") || targetAiUrl.includes("claude.ai");
      const isDeepSeek = curUrl.includes("deepseek.com") || targetAiUrl.includes("deepseek.com");
      const isGrok = curUrl.includes("grok.com") || targetAiUrl.includes("grok.com");
      let baseFreshUrl = targetAiUrl;
      let isOldSession = false;
      if (isGemini) {
        baseFreshUrl = "https://gemini.google.com/app";
        try {
          const u = new URL(curUrl);
          if (u.pathname.startsWith("/app/") && u.pathname.length > 5) {
            isOldSession = true;
          }
        } catch {
        }
      } else if (isChatGPT) {
        baseFreshUrl = "https://chatgpt.com/";
        if (curUrl.includes("/c/")) {
          isOldSession = true;
        }
      } else if (isClaude) {
        baseFreshUrl = "https://claude.ai/new";
        if (curUrl.includes("/chat/")) {
          isOldSession = true;
        }
      } else if (isDeepSeek) {
        baseFreshUrl = "https://chat.deepseek.com/";
        if (curUrl.includes("/a/chat/s/")) {
          isOldSession = true;
        }
      } else if (isGrok) {
        baseFreshUrl = "https://grok.com/";
        if (curUrl.includes("/c/")) {
          isOldSession = true;
        }
      }
      const messageCount = await page.evaluate(() => {
        const msgs = document.querySelectorAll(
          'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], div[data-message-author-role="user"], .font-claude-message, .ds-markdown, user-query-container'
        );
        return msgs.length;
      }).catch(() => 0);
      if (messageCount > 0 || isOldSession) {
        if (onProgress) {
          onProgress({
            step: "OPENING_GEMINI",
            progress: 29,
            message: `\u0110ang l\xE0m m\u1EDBi phi\xEAn chat ${aiName} (t\u1EA1o New Chat s\u1EA1ch 100% ng\u1EEF c\u1EA3nh)...`
          });
        }
        let clickedNewChat = false;
        const newChatSelectors = [
          'button[aria-label*="Cu\u1ED9c tr\xF2 chuy\u1EC7n m\u1EDBi" i]',
          'button[aria-label*="New chat" i]',
          'a[aria-label*="Cu\u1ED9c tr\xF2 chuy\u1EC7n m\u1EDBi" i]',
          'a[aria-label*="New chat" i]',
          'a[data-testid="create-new-chat-button"]',
          'button[data-testid="create-new-chat-button"]',
          'button[aria-label*="\u0110o\u1EA1n chat m\u1EDBi" i]',
          '[data-test-id="new-chat-button"]',
          'a[href="/app"]',
          'button:has-text("Cu\u1ED9c tr\xF2 chuy\u1EC7n m\u1EDBi")',
          'button:has-text("New chat")'
        ];
        for (const sel of newChatSelectors) {
          try {
            const btn = await page.$(sel);
            if (btn && await btn.isVisible().catch(() => false)) {
              await btn.click();
              clickedNewChat = true;
              await page.waitForTimeout(1e3);
              break;
            }
          } catch {
          }
        }
        const remainingMsgs = await page.evaluate(() => {
          return document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown'
          ).length;
        }).catch(() => 0);
        let stillOldUrl = false;
        try {
          const u = new URL(page.url());
          if (isGemini && u.pathname.startsWith("/app/") && u.pathname.length > 5) stillOldUrl = true;
          if (isChatGPT && u.pathname.startsWith("/c/")) stillOldUrl = true;
          if (isClaude && u.pathname.startsWith("/chat/")) stillOldUrl = true;
          if (isDeepSeek && u.pathname.includes("/a/chat/s/")) stillOldUrl = true;
          if (isGrok && u.pathname.startsWith("/c/")) stillOldUrl = true;
        } catch {
        }
        if (!clickedNewChat || remainingMsgs > 0 || stillOldUrl) {
          const currentClean = page.url().split("?")[0].replace(/\/$/, "");
          const targetClean = baseFreshUrl.replace(/\/$/, "");
          if (currentClean === targetClean) {
            await page.reload({ waitUntil: "domcontentloaded", timeout: 35e3 });
          } else {
            await page.goto(baseFreshUrl, { waitUntil: "domcontentloaded", timeout: 35e3 });
          }
          await page.waitForTimeout(1500);
        }
        const finalCheckMsgs = await page.evaluate(() => {
          return document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], div[data-message-author-role="user"], .font-claude-message, .ds-markdown'
          ).length;
        }).catch(() => 0);
        if (finalCheckMsgs > 0) {
          await page.reload({ waitUntil: "domcontentloaded", timeout: 35e3 });
          await page.waitForTimeout(1500);
        }
      }
    } catch (freshErr) {
      console.warn("ensureFreshChatSession warning:", freshErr.message);
    }
  }
  static prepareManimPythonCode(code) {
    let processed = (code || "").trim();
    processed = processed.replace(/^\`\`\`(?:python|py)?\s*/i, "").replace(/\s*\`\`\`$/i, "").trim();
    if (processed.includes("```")) {
      processed = processed.replace(/\`\`\`(?:python|py)?/gi, "").replace(/\`\`\`/g, "").trim();
    }
    const lines = processed.split(/\r?\n/);
    while (lines.length > 0) {
      const lastLine = lines[lines.length - 1].trim();
      if (!lastLine || lastLine.endsWith("(") || lastLine.endsWith("FadeIn(") || lastLine.endsWith("Write(") || lastLine.endsWith("Create(") || lastLine.endsWith("Text(") || lastLine.endsWith("MathTex(") || lastLine.endsWith(",") || lastLine.endsWith("+") || lastLine.endsWith("-") || lastLine.endsWith("*") || lastLine.endsWith("/") || lastLine.endsWith("=") || lastLine.endsWith("\\") || lastLine.startsWith("self.play(FadeIn(")) {
        lines.pop();
      } else {
        break;
      }
    }
    processed = lines.join("\n");
    const tripleDoubleQuotes = (processed.match(/"""/g) || []).length;
    if (tripleDoubleQuotes % 2 !== 0) {
      processed += '\n"""';
    }
    const tripleSingleQuotes = (processed.match(/'''/g) || []).length;
    if (tripleSingleQuotes % 2 !== 0) {
      processed += "\n'''";
    }
    processed = processed.replace(
      /self\.play\(\s*FadeOut\(\s*(?:Group\(\*self\.mobjects\)|self\.mobjects|\*self\.mobjects|Group\(\))\s*\)[^)]*\)\s*(?:self\.wait\([^)]*\)\s*)?/g,
      "# Outro card held on screen\n"
    );
    processed = processed.replace(/\b([a-zA-Z0-9_]*symbol[a-zA-Z0-9_]*)\.animate(?:\.[a-zA-Z0-9_]+\([^)]*\))*\.to_corner\(UL(?:,\s*buff=[^)]*)?\)/g, "FadeOut($1)");
    processed = processed.replace(/\\text\{([^}]*?)(\\nearrow|\\searrow)([^}]*?)\}/g, "\\text{$1} $2 \\text{$3}");
    processed = processed.replace(
      /(intro_core_rule\s*=\s*VGroup\([\s\S]*?\)\.arrange\([^\)]*\))/g,
      (match) => {
        let cleaned = match;
        cleaned = cleaned.replace(/\\{2,}[\s;]*(?:\\quad|\\;|\\*text\{v[aà]\s*\}|v[aà])*/gi, " \\quad \\text{v\xE0} \\quad ");
        cleaned = cleaned.replace(/\\{2,}\s*(?=\\exists|\\forall|\\text)/g, " \\quad \\text{v\xE0} \\quad ");
        cleaned = cleaned.replace(/(?:\\quad\s*\\text\{v[aà]\s*\}\s*\\quad\s*)+/gi, " \\quad \\text{v\xE0} \\quad ");
        cleaned = cleaned.replace(/\\quad\s*\\text\{v[aà]\s*\}\s*\\quad\s*(?:\\quad\s*)?\\text\{v[aà]\s*\}/gi, " \\quad \\text{v\xE0} \\quad ");
        cleaned = cleaned.replace(/\\quad\s*\\quad/g, "\\quad");
        const pairRe = /MathTex\(r?(["'])([\s\S]*?)\1\s*(?:,\s*font_size\s*=\s*\d+)?\s*(?:,\s*color\s*=\s*([^,\)]+))?\s*\)[\s\n]*,[\s\n]*MathTex\(r?(["'])([\s\S]*?)\4\s*(?:,\s*font_size\s*=\s*\d+)?\s*(?:,\s*color\s*=\s*([^,\)]+))?\s*\)/g;
        cleaned = cleaned.replace(pairRe, (m, q1, b1, c1, q2, b2, c2) => {
          if (/^\s*(?:\\*text\{v[aà]\s*\}|v[aà]|\\*exists)/i.test(b2)) {
            let cleanB2 = b2.replace(/^[\s;]*(?:\\*text\{v[aà]\s*\}|v[aà]|\\*quad)*/i, "").trim();
            let col = c1 ? `, color=${c1}` : "";
            return `MathTex(r"${b1.trim()} \\quad \\text{v\xE0} \\quad ${cleanB2}", font_size=23${col})`;
          }
          return m;
        });
        return cleaned;
      }
    );
    if (processed.includes("intro_core_rule") && !processed.includes("fit_width(intro_core_rule")) {
      processed = processed.replace(
        /(intro_core_rule\s*=\s*VGroup\([\s\S]*?\)\.arrange\([^\)]*\))(?![\s\S]*?fit_width\(intro_core_rule)/g,
        "$1\n        fit_width(intro_core_rule, 7.6)"
      );
    }
    if (processed.includes("intro_title = Text(") && !processed.includes("fit_width(intro_title")) {
      processed = processed.replace(
        /(intro_title\s*=\s*Text\([^\)]*\))(?![\s\S]*?fit_width\(intro_title)/g,
        "$1\n        fit_width(intro_title, 7.2)"
      );
    }
    if (processed.includes("intro_sub = Text(") && !processed.includes("fit_width(intro_sub")) {
      processed = processed.replace(
        /(intro_sub\s*=\s*Text\([^\)]*\))(?![\s\S]*?fit_width\(intro_sub)/g,
        "$1\n        fit_width(intro_sub, 7.4)"
      );
    }
    const polyfillSnippet = `# ==========================================
# YUTA MANIM ENGINE - COMPATIBILITY POLYFILLS
# ==========================================
try:
    # 0. Color polyfills cho c\xE1c t\xEAn m\xE0u th\xF4ng d\u1EE5ng trong Manim
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
    # 1. H\u1ED7 tr\u1EE3 ti\u1EBFng Vi\u1EC7t Unicode & K\xFD t\u1EF1 To\xE1n h\u1ECDc chu\u1EA9n cho LaTeX (Arrows, Bullet, etc.)
    config.tex_template.add_to_preamble(r"""
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb}
\\usepackage{mathpazo}
\\usepackage{newunicodechar}
\\newunicodechar{\u2197}{\\ensuremath{\\nearrow}}
\\newunicodechar{\u2198}{\\ensuremath{\\searrow}}
\\newunicodechar{\u2192}{\\ensuremath{\\rightarrow}}
\\newunicodechar{\u2190}{\\ensuremath{\\leftarrow}}
\\newunicodechar{\u2194}{\\ensuremath{\\leftrightarrow}}
\\newunicodechar{\u21D2}{\\ensuremath{\\Rightarrow}}
\\newunicodechar{\u21D4}{\\ensuremath{\\Leftrightarrow}}
\\newunicodechar{\u2022}{\\ensuremath{\\bullet}}
\\newunicodechar{\u2248}{\\ensuremath{\\approx}}
\\newunicodechar{\u2260}{\\ensuremath{\\neq}}
\\newunicodechar{\u2264}{\\ensuremath{\\le}}
\\newunicodechar{\u2265}{\\ensuremath{\\ge}}
\\newunicodechar{\xB1}{\\ensuremath{\\pm}}
\\newunicodechar{\xD7}{\\ensuremath{\\times}}
\\newunicodechar{\xF7}{\\ensuremath{\\div}}
\\newunicodechar{\u221E}{\\ensuremath{\\infty}}
""")
except Exception:
    pass

try:
    # 1.1 T\u1EF1 \u0111\u1ED9ng h\u1EA5p th\u1EE5 m\u1ECDi tham s\u1ED1 kh\xF4ng mong mu\u1ED1n truy\u1EC1n v\xE0o Mobject
    _orig_mobject_init = Mobject.__init__
    def _smart_mobject_init(self, color=WHITE, name=None, dim=3, target=None, z_index=0, *args, **kwargs):
        _orig_mobject_init(self, color=color, name=name, dim=dim, target=target, z_index=z_index)
    Mobject.__init__ = _smart_mobject_init
except Exception:
    pass

try:
    # 1.2 T\u1EF1 \u0111\u1ED9ng chu\u1EA9n h\xF3a font Times New Roman / Liberation Serif \u0111\u1EB9p m\u1EAFt v\xE0 auto-scale c\u1EE1 ch\u1EEF l\u1EDBn cho Text
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
        import platform
        if f in ('Times New Roman', 'Liberation Serif') and platform.system() == 'Linux':
            f = 'DejaVu Serif'
            kwargs['font'] = 'DejaVu Serif'
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

    # 1.3 Auto-scale font_size cho MathTex v\xE0 Tex
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
    # 2. T\u1EF1 \u0111\u1ED9ng chuy\u1EC3n VGroup ch\u1EE9a Animation th\xE0nh AnimationGroup
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
    # 3. T\u01B0\u01A1ng th\xEDch c\xE1c h\xE0m Axes (get_graph_label, get_lines_to_point, get_secant_line, get_tangent_line)
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
    # 4. Helper ch\u1ED1ng \u0111\xE8 ch\u1EEF cho Text & MathTex
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

    # 6. Helper Khung Th\u1EBB Container Chuy\xEAn Nghi\u1EC7p (Dual-Zone Cards)
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
    processed = processed.replace(/\bfont_size\s*=\s*(1[0-9]|20|21)\b/g, (match, p1) => {
      const val = parseInt(p1, 10);
      return `font_size=${Math.max(24, Math.round(val * 1.35))}`;
    });
    if (processed.includes("from manim import") && !processed.includes("YUTA MANIM ENGINE")) {
      processed = processed.replace(/from\s+manim\s+import\s+\*/, `from manim import *
${polyfillSnippet.trim()}`);
    }
    return processed;
  }
  static autoRepairLatexCode(latexCode, logContent = "") {
    let repaired = latexCode;
    if (!repaired.includes("\\end{document}")) {
      const openEnvs = ["enumerate", "itemize", "center", "tabular", "tabularx", "longtable", "multicols", "tcolorbox"];
      for (const env of openEnvs) {
        const openCount = (repaired.match(new RegExp(`\\\\begin\\{${env}\\}`, "g")) || []).length;
        const closeCount = (repaired.match(new RegExp(`\\\\end\\{${env}\\}`, "g")) || []).length;
        if (openCount > closeCount) {
          repaired += `
\\end{${env}}`.repeat(openCount - closeCount);
        }
      }
      repaired += "\n\\end{document}\n";
    }
    if (!repaired.includes("newunicodechar")) {
      const unicodePreamble = `
\\usepackage{newunicodechar}
\\newunicodechar{\u2197}{\\ensuremath{\\nearrow}}
\\newunicodechar{\u2198}{\\ensuremath{\\searrow}}
\\newunicodechar{\u2192}{\\ensuremath{\\rightarrow}}
\\newunicodechar{\u2190}{\\ensuremath{\\leftarrow}}
\\newunicodechar{\u2022}{\\textbullet}
\\newunicodechar{\u2264}{\\ensuremath{\\le}}
\\newunicodechar{\u2265}{\\ensuremath{\\ge}}
\\newunicodechar{\u2260}{\\ensuremath{\\ne}}
\\newunicodechar{\u2248}{\\ensuremath{\\approx}}
\\newunicodechar{\xB1}{\\ensuremath{\\pm}}
\\newunicodechar{\xD7}{\\ensuremath{\\times}}
\\newunicodechar{\xF7}{\\ensuremath{\\div}}
\\newunicodechar{\u221E}{\\ensuremath{\\infty}}
\\newunicodechar{\xB0}{\\ensuremath{^\\circ}}
\\newunicodechar{\u2103}{\\ensuremath{^\\circ\\text{C}}}
`;
      if (repaired.includes("\\usepackage[utf8]{inputenc}")) {
        repaired = repaired.replace("\\usepackage[utf8]{inputenc}", "\\usepackage[utf8]{inputenc}" + unicodePreamble);
      } else if (repaired.includes("\\documentclass")) {
        repaired = repaired.replace(/(\\documentclass[^\n]*\n)/, `$1\\usepackage[utf8]{inputenc}${unicodePreamble}
`);
      }
    }
    const missingMacros = [];
    if (repaired.includes("\\dapanHaiCot") && !repaired.includes("\\newcommand{\\dapanHaiCot}")) {
      missingMacros.push(`\\newcommand{\\dapanHaiCot}[4]{
  \\begin{tabularx}{\\linewidth}{XX}
    \\textbf{A.} #1 & \\textbf{B.} #2 \\\\
    \\textbf{C.} #3 & \\textbf{D.} #4
  \\end{tabularx}
}`);
    }
    if (repaired.includes("\\dapanMotCot") && !repaired.includes("\\newcommand{\\dapanMotCot}")) {
      missingMacros.push(`\\newcommand{\\dapanMotCot}[4]{
  \\begin{tabularx}{\\linewidth}{X}
    \\textbf{A.} #1 \\\\
    \\textbf{B.} #2 \\\\
    \\textbf{C.} #3 \\\\
    \\textbf{D.} #4
  \\end{tabularx}
}`);
    }
    if (repaired.includes("\\doanvan") && !repaired.includes("\\newcommand{\\doanvan}")) {
      missingMacros.push(`\\newcommand{\\doanvan}[2]{
  \\begin{tcolorbox}[colback=gray!5!white,colframe=gray!50!black,title={\\textbf{#1}},arc=2mm]
    \\small\\textit{#2}
  \\end{tcolorbox}
}`);
    }
    if (missingMacros.length > 0 && repaired.includes("\\begin{document}")) {
      repaired = repaired.replace("\\begin{document}", missingMacros.join("\n\n") + "\n\n\\begin{document}");
    }
    repaired = repaired.replace(/GD&ĐT/g, "GD\\&\u0110T");
    repaired = repaired.replace(/(\d+)\s*%/g, "$1\\%");
    repaired = repaired.replace(/\\cauhoi\{(\d+)\s*\(?[^}]*(?:rag|trang|page|nguồn)[^}]*\}/gi, "\\cauhoi{$1}");
    repaired = repaired.replace(/(\\cauhoi\{\d+\})\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, "$1 ");
    repaired = repaired.replace(/(\\textbf\{\s*(?:Câu|Bài)\s*\d+)\s*\(?[^}:.]*(?:rag|trang|page|nguồn)[^}:.]*\)?(\s*[:.]?\s*\})/gi, "$1$2");
    repaired = repaired.replace(/(\\textbf\{\s*(?:Câu|Bài)\s*\d+[^}]*\})\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, "$1 ");
    repaired = repaired.replace(/(\b(?:Câu|Bài)\s*\d+[:.]?)\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, "$1 ");
    repaired = repaired.replace(/\s*\[(?:RAG|rag)[^\]]*\]/gi, "");
    repaired = repaired.replace(/\s*\((?:RAG|rag)\s*(?:trang|Trang|page|Page)?\s*\d+\)/gi, "");
    repaired = repaired.replace(/\s*\((?:trang|Trang|page|Page)\s*\d+\)/gi, "");
    repaired = repaired.replace(/\\subsection\*\{BẢNG ĐÁP ÁN PHẦN I\}/g, "\\subsection*{B\u1EA3ng \u0111\xE1p \xE1n Ph\u1EA7n I}");
    repaired = repaired.replace(/\\subsection\*\{BẢNG ĐÁP ÁN PHẦN II\}/g, "\\subsection*{B\u1EA3ng \u0111\xE1p \xE1n Ph\u1EA7n II}");
    repaired = repaired.replace(/\\subsection\*\{BẢNG ĐÁP ÁN PHẦN III\}/g, "\\subsection*{B\u1EA3ng \u0111\xE1p \xE1n Ph\u1EA7n III}");
    repaired = repaired.replace(/\\subsection\*\{LỜI GIẢI CHI TIẾT TỪNG CÂU\}/g, "\\subsection*{L\u1EDDi gi\u1EA3i chi ti\u1EBFt t\u1EEBng c\xE2u}");
    repaired = repaired.replace(/\\section\*\{I\. PHẦN TRẮC NGHIỆM\}/g, "\\section*{Ph\u1EA7n I. Tr\u1EAFc nghi\u1EC7m}");
    repaired = repaired.replace(/\\section\*\{II\. PHẦN TỰ LUẬN\}/g, "\\section*{Ph\u1EA7n II. T\u1EF1 lu\u1EADn}");
    repaired = repaired.replace(/\\section\*\{I\. TÓM TẮT LÝ THUYẾT TRỌNG TÂM\}/g, "\\section*{Ph\u1EA7n I. T\xF3m t\u1EAFt l\xFD thuy\u1EBFt tr\u1ECDng t\xE2m}");
    repaired = repaired.replace(/\\section\*\{II\. CÁC DẠNG BÀI TẬP VÀ PHƯƠNG PHÁP GIẢI\}/g, "\\section*{Ph\u1EA7n II. C\xE1c d\u1EA1ng b\xE0i t\u1EADp v\xE0 ph\u01B0\u01A1ng ph\xE1p gi\u1EA3i}");
    repaired = repaired.replace(/\\section\*\{III\. BÀI TẬP TỰ LUYỆN\}/g, "\\section*{Ph\u1EA7n III. B\xE0i t\u1EADp t\u1EF1 luy\u1EC7n}");
    return repaired;
  }
  static parseManimError(stderr = "", stdout = "", workingDir = "") {
    const raw = (stderr + "\n" + stdout).replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "");
    const lines = raw.split(/\r?\n/);
    let exceptionType = "";
    let exceptionMessage = "";
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line || /^╰[─-]+╯?$/.test(line) || line.startsWith("\u256D") || line.startsWith("\u2502")) continue;
      const match = line.match(/^([A-Z][a-zA-Z0-9_]*(?:Error|Exception))(?::\s*(.*))?$/);
      if (match) {
        exceptionType = match[1];
        exceptionMessage = (match[2] || "").trim();
        for (let k = i + 1; k < Math.min(lines.length, i + 3); k++) {
          const nextLine = lines[k].trim();
          if (nextLine && !nextLine.startsWith("\u256D") && !nextLine.startsWith("\u2570") && !nextLine.startsWith("File ") && !nextLine.startsWith("Traceback")) {
            exceptionMessage += " " + nextLine;
          }
        }
        break;
      }
    }
    let sceneLine = null;
    let codeSnippet = "";
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const fileMatch = line.match(/scene\.py[:",\s]+(?:line\s*)?(\d+)/i);
      if (fileMatch) {
        sceneLine = fileMatch[1];
        for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
          const cLine = lines[j];
          if (cLine.includes("\u2771")) {
            codeSnippet = cLine.replace(/^[│\s]*❱\s*\d+\s*[│\s]*/, "").replace(/[│\s]+$/, "").trim();
            break;
          } else if (/^\s{4,}/.test(cLine) && !cLine.includes("File ") && !cLine.includes("Traceback")) {
            codeSnippet = cLine.replace(/[│\s]+$/, "").trim();
            break;
          }
        }
        break;
      }
    }
    let latexDetails = "";
    const logMatch = raw.match(/(media\/Tex\/[a-zA-Z0-9_-]+\.log)/i);
    if (logMatch && workingDir) {
      try {
        const logPath = import_path.default.resolve(workingDir, logMatch[1]);
        if (import_fs.default.existsSync(logPath)) {
          const logContent = import_fs.default.readFileSync(logPath, "utf-8");
          const errLines = logContent.split(/\r?\n/).filter((l) => l.startsWith("!") || l.includes("Error") || /^l\.\d+/.test(l)).map((l) => l.trim());
          if (errLines.length > 0) {
            latexDetails = errLines.slice(-6).join("\n");
          }
        }
      } catch (e) {
      }
    }
    let summary = "";
    if (exceptionType) {
      summary = `${exceptionType}: ${exceptionMessage}`.trim();
      if (sceneLine) {
        summary += ` (d\xF2ng ${sceneLine}${codeSnippet ? `: ${codeSnippet.slice(0, 45)}` : ""})`;
      }
    } else {
      const meaningfulLines = lines.map((l) => l.replace(/^[│\s]*[0-9]*[│\s]*/, "").replace(/[│\s]+$/, "").trim()).filter((t) => t && !/^[-─═│╭╮╰╯]+$/.test(t) && !t.startsWith("Animation ") && !t.startsWith("[09/") && !t.startsWith("# process keyword"));
      summary = meaningfulLines.slice(-3).join(" | ") || "L\u1ED7i render kh\xF4ng x\xE1c \u0111\u1ECBnh";
    }
    let diagnosis = "";
    if (exceptionType === "TypeError" && /unexpected keyword argument/i.test(exceptionMessage)) {
      const kwMatch = exceptionMessage.match(/['"]([a-zA-Z0-9_]+)['"]/);
      const kw = kwMatch ? kwMatch[1] : "";
      diagnosis = `L\u1ED7i truy\u1EC1n th\u1EEBa/sai tham s\u1ED1 '${kw}' cho \u0111\u1ED1i t\u01B0\u1EE3ng Manim (v\xED d\u1EE5 MathTex kh\xF4ng nh\u1EADn 'font' hay 'weight', ch\u1EC9 Text m\u1EDBi c\xF3). H\xE3y X\xD3A b\u1ECF tham s\u1ED1 '${kw}' n\xE0y!`;
    } else if (/latex/i.test(exceptionType) || /latex/i.test(exceptionMessage) || latexDetails) {
      diagnosis = `L\u1ED7i bi\xEAn d\u1ECBch LaTeX trong MathTex/Tex.
H\xE3y ki\u1EC3m tra:
- KH\xD4NG g\xF5 ti\u1EBFng Vi\u1EC7t c\xF3 d\u1EA5u tr\u1EF1c ti\u1EBFp trong MathTex (ti\u1EBFng Vi\u1EC7t ph\u1EA3i vi\u1EBFt b\u1EB1ng Text("...", font="Be Vietnam Pro")).
- \u0110\u1EA3m b\u1EA3o \u0111\u1EA7y \u0111\u1EE7 c\u1EB7p ngo\u1EB7c nh\u1ECDn {} trong \\frac{}{}, \\sqrt{}.
- N\u1EBFu d\xF9ng \\begin{aligned} ... \\end{aligned}, m\u1ED7i d\xF2ng ph\xE2n t\xE1ch b\u1EB1ng \\\\ v\xE0 kh\xF4ng \u0111\u1EC3 d\xF2ng tr\u1ED1ng.`;
    } else if (exceptionType === "NameError") {
      diagnosis = `L\u1ED7i g\u1ECDi h\xE0m ho\u1EB7c bi\u1EBFn ch\u01B0a \u0111\u01B0\u1EE3c \u0111\u1ECBnh ngh\u0129a trong Manim CE.`;
    } else if (exceptionType === "SyntaxError") {
      diagnosis = `L\u1ED7i c\xFA ph\xE1p Python (\u0111\xF3ng thi\u1EBFu ngo\u1EB7c \u0111\u01A1n/k\xE9p/nh\u1ECDn ho\u1EB7c th\u1EE5t l\u1EC1 sai).`;
    }
    const detailsForAI = [
      `L\u1ED6I KHI BI\xCAN D\u1ECACH B\u1EB0NG MANIM CE:`,
      `- Lo\u1EA1i l\u1ED7i: ${exceptionType ? `${exceptionType}: ${exceptionMessage}` : summary}`,
      sceneLine ? `- V\u1ECB tr\xED: D\xF2ng ${sceneLine} trong scene.py` : "",
      codeSnippet ? `- D\xF2ng m\xE3 g\xE2y l\u1ED7i: \`${codeSnippet}\`` : "",
      latexDetails ? `- Chi ti\u1EBFt log LaTeX:
${latexDetails}` : "",
      diagnosis ? `
CH\u1EC8 D\u1EAAN KH\u1EAEC PH\u1EE4C:
${diagnosis}` : ""
    ].filter(Boolean).join("\n");
    return { summary: summary.slice(0, 150), detailsForAI };
  }
  static sanitizeLatexVietnamese(pythonCode) {
    let cleaned = pythonCode.replace(/(\\text\{[^{}]*\})/g, (match) => {
      return match.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    });
    cleaned = cleaned.replace(/((?:MathTex|Tex)\(\s*(?:r?["'].*?["']\s*,?\s*)+)/g, (match) => {
      return match.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    });
    return cleaned;
  }
  static findNewestMp4(dir) {
    if (!import_fs.default.existsSync(dir)) return null;
    let newestFile = null;
    const scan = (currentDir) => {
      if (import_path.default.basename(currentDir) === "partial_movie_files") return;
      let entries = [];
      try {
        entries = import_fs.default.readdirSync(currentDir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const fullPath = import_path.default.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".mp4")) {
          try {
            const stat = import_fs.default.statSync(fullPath);
            if (!newestFile || stat.mtimeMs > newestFile.mtime) {
              newestFile = { path: fullPath, mtime: stat.mtimeMs };
            }
          } catch {
          }
        }
      }
    };
    scan(dir);
    return newestFile ? newestFile.path : null;
  }
  static getMediaDuration(filePath) {
    if (!filePath || !import_fs.default.existsSync(filePath)) return null;
    try {
      const { execSync: execSync2 } = require("child_process");
      const out = execSync2(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
        { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
      ).trim();
      const d = parseFloat(out);
      return isNaN(d) ? null : d;
    } catch {
      return null;
    }
  }
  static extractNarrationText(pythonCode, fallbackTopic = "") {
    let narration = "";
    const scriptMatch = pythonCode.match(/VOICEOVER_SCRIPT\s*=\s*(?:"""([\s\S]*?)"""|'''([\s\S]*?)'''|"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')/);
    if (scriptMatch) {
      narration = (scriptMatch[1] || scriptMatch[2] || scriptMatch[3] || scriptMatch[4] || "").trim();
    }
    if (!narration) {
      const commentMatches = Array.from(pythonCode.matchAll(/#\s*(?:\[(?:CẢNH|SCENE|\d+)[^\]]*?VOICE[^\]]*?\]|\[VOICE(?:OVER)?(?:_\d+)?\]|Lời thoại|Thuyết minh|Voiceover|Lời bình)\s*:\s*(.+)/gi));
      if (commentMatches.length > 0) {
        narration = commentMatches.map((m) => m[1].trim().replace(/^["']|["']$/g, "")).join(". ");
      }
    }
    if (!narration) {
      const textMatches = Array.from(pythonCode.matchAll(/(?:Text|Paragraph)\(\s*r?f?["']([^"']{6,})["']/g));
      if (textMatches.length > 0) {
        narration = textMatches.map((m) => m[1].trim()).join(". ");
      }
    }
    if (!narration || narration.length < 5) {
      narration = fallbackTopic ? `Ch\xE0o m\u1EEBng c\xE1c b\u1EA1n \u0111\u1EBFn v\u1EDBi video b\xE0i gi\u1EA3ng v\u1EC1 ${fallbackTopic}. H\xE3y c\xF9ng quan s\xE1t c\xE1c di\u1EC5n bi\u1EBFn v\xE0 n\u1ED9i dung ki\u1EBFn th\u1EE9c tr\u1EF1c quan tr\xEAn m\xE0n h\xECnh.` : "Ch\xE0o m\u1EEBng c\xE1c b\u1EA1n \u0111\u1EBFn v\u1EDBi video tr\u1EF1c quan b\xE0i gi\u1EA3ng. H\xE3y c\xF9ng quan s\xE1t c\xE1c di\u1EC5n bi\u1EBFn v\xE0 n\u1ED9i dung ki\u1EBFn th\u1EE9c tr\u1EF1c quan tr\xEAn m\xE0n h\xECnh.";
    }
    narration = narration.replace(/\\n/g, " ").replace(/\\[a-zA-Z]+/g, " ").replace(/[\$\{\}\[\]\(\)]/g, " ").replace(/\s+/g, " ").trim();
    return narration;
  }
  static async generateVoiceoverAndMux(params) {
    const { mp4Path, pythonCode, workingDir, voiceName = "vi-VN-HoaiMyNeural", voiceSpeed = "+0%", fallbackTopic = "", onStatus } = params;
    if (!mp4Path || !import_fs.default.existsSync(mp4Path)) {
      return { success: false, mp4Path, audioPath: null };
    }
    const narration = _AutomationRunner.extractNarrationText(pythonCode, fallbackTopic);
    if (!narration) {
      return { success: false, mp4Path, audioPath: null };
    }
    const { venvDir, pythonBin, edgeTtsBin } = _AutomationRunner.getVenvPaths();
    const isWin = process.platform === "win32";
    let resolvedTtsBin = import_fs.default.existsSync(edgeTtsBin) ? edgeTtsBin : null;
    if (!resolvedTtsBin) {
      try {
        const whichCmd = isWin ? "where edge-tts" : "which edge-tts";
        const out = require("child_process").execSync(whichCmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        const first = out.split(/\r?\n/)[0].trim();
        if (first && import_fs.default.existsSync(first)) resolvedTtsBin = first;
      } catch {
      }
    }
    if (!resolvedTtsBin) {
      if (onStatus) onStatus("\u0110ang t\u1EF1 \u0111\u1ED9ng chu\u1EA9n b\u1ECB c\xF4ng c\u1EE5 gi\u1ECDng \u0111\u1ECDc AI (edge-tts)...");
      const installed = await _AutomationRunner.installPythonPackage("edge-tts", onStatus);
      if (installed && import_fs.default.existsSync(edgeTtsBin)) {
        resolvedTtsBin = edgeTtsBin;
      }
    }
    const tempTextFile = import_path.default.join(workingDir, `narration_${Date.now()}.txt`);
    import_fs.default.writeFileSync(tempTextFile, narration, "utf-8");
    const mp3FileName = `voiceover_${Date.now()}.mp3`;
    const mp3Path = import_path.default.join(workingDir, mp3FileName);
    const voiceLabel = voiceName && voiceName.includes("NamMinh") ? "Nam Minh (Nam \u1EA5m \xE1p)" : "Ho\xE0i My (N\u1EEF truy\u1EC1n c\u1EA3m)";
    if (onStatus) onStatus(`\u{1F399}\uFE0F \u0110ang t\u1ED5ng h\u1EE3p thuy\u1EBFt minh gi\u1ECDng \u0111\u1ECDc AI [${voiceLabel}]...`);
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

    # Th\u1EED l\u1EA1i v\u1EDBi gi\u1ECDng m\u1EB7c \u0111\u1ECBnh n\u1EBFu gi\u1ECDng ch\u1ECDn g\u1EB7p l\u1ED7i
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
    const { spawn: spawn2 } = require("child_process");
    let ttsStderr = "";
    const ttsSuccess = await new Promise((resolve) => {
      let targetPython = import_fs.default.existsSync(pythonBin) ? pythonBin : isWin ? "python" : "python3";
      try {
        const proc = spawn2(targetPython, ["-c", pyTtsCode, tempTextFile, voiceName || "vi-VN-HoaiMyNeural", voiceSpeed || "+0%", mp3Path], {
          cwd: workingDir
        });
        proc.stderr?.on("data", (d) => {
          ttsStderr += d.toString();
        });
        proc.on("close", (code) => {
          const valid = code === 0 && import_fs.default.existsSync(mp3Path) && import_fs.default.statSync(mp3Path).size > 100;
          resolve(valid);
        });
        proc.on("error", (err) => {
          ttsStderr += err.message;
          resolve(false);
        });
      } catch (e) {
        ttsStderr += e.message;
        resolve(false);
      }
    });
    try {
      import_fs.default.unlinkSync(tempTextFile);
    } catch {
    }
    if (!ttsSuccess || !import_fs.default.existsSync(mp3Path) || import_fs.default.statSync(mp3Path).size === 0) {
      try {
        if (import_fs.default.existsSync(mp3Path) && import_fs.default.statSync(mp3Path).size === 0) import_fs.default.unlinkSync(mp3Path);
      } catch {
      }
      if (onStatus) onStatus(`Kh\xF4ng th\u1EC3 t\u1ED5ng h\u1EE3p gi\u1ECDng \u0111\u1ECDc AI (${ttsStderr.slice(0, 80) || "L\u1ED7i k\u1EBFt n\u1ED1i"}), s\u1EED d\u1EE5ng video g\u1ED1c.`);
      return { success: false, mp4Path, audioPath: null };
    }
    let ffmpegBin = "ffmpeg";
    const ffmpegCandidates = [
      "/usr/bin/ffmpeg",
      "/usr/local/bin/ffmpeg",
      isWin ? "ffmpeg.exe" : "ffmpeg"
    ];
    for (const fc of ffmpegCandidates) {
      if (import_fs.default.existsSync(fc)) {
        ffmpegBin = fc;
        break;
      }
    }
    if (onStatus) onStatus("\u{1F3AC} \u0110ang l\u1ED3ng ti\u1EBFng v\xE0 \u0111\u1ED3ng b\u1ED9 \xE2m thanh v\xE0o video MP4 (FFmpeg remux)...");
    const muxedMp4FileName = `video_voice_${Date.now()}.mp4`;
    const muxedMp4Path = import_path.default.join(workingDir, muxedMp4FileName);
    const videoDur = _AutomationRunner.getMediaDuration(mp4Path);
    const audioDur = _AutomationRunner.getMediaDuration(mp3Path);
    let ffmpegArgs = ["-y"];
    if (videoDur && audioDur) {
      if (audioDur > videoDur) {
        const extendSec = Math.max(0.5, audioDur - videoDur + 0.8);
        ffmpegArgs.push(
          "-i",
          mp4Path,
          "-i",
          mp3Path,
          "-filter_complex",
          `[0:v]tpad=stop_mode=clone:stop_duration=${extendSec.toFixed(2)}[v]`,
          "-map",
          "[v]",
          "-map",
          "1:a:0",
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "18",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-shortest",
          muxedMp4Path
        );
      } else if (videoDur > audioDur + 2) {
        const targetDuration = (audioDur + 1.2).toFixed(2);
        ffmpegArgs.push(
          "-ss",
          "0",
          "-t",
          targetDuration,
          "-i",
          mp4Path,
          "-i",
          mp3Path,
          "-map",
          "0:v:0",
          "-map",
          "1:a:0",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          muxedMp4Path
        );
      } else {
        ffmpegArgs.push(
          "-i",
          mp4Path,
          "-i",
          mp3Path,
          "-map",
          "0:v:0",
          "-map",
          "1:a:0",
          "-c:v",
          "copy",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-shortest",
          muxedMp4Path
        );
      }
    } else {
      ffmpegArgs.push(
        "-i",
        mp4Path,
        "-i",
        mp3Path,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        muxedMp4Path
      );
    }
    const muxSuccess = await new Promise((resolve) => {
      try {
        const proc = spawn2(ffmpegBin, ffmpegArgs);
        proc.on("close", (code) => {
          resolve(code === 0 && import_fs.default.existsSync(muxedMp4Path) && import_fs.default.statSync(muxedMp4Path).size > 0);
        });
        proc.on("error", () => resolve(false));
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
        mp4Path,
        audioPath: mp3Path,
        narration
      };
    }
  }
  async runDirectRerender(options, downloadsDir, onProgress) {
    if (options.contentType === "latex" || Boolean(options.customLatexCode)) {
      onProgress({
        step: "COMPILING_LATEX",
        progress: 10,
        message: "\u26A1 B\u1EAFt \u0111\u1EA7u Rerender t\xE0i li\u1EC7u PDF tr\u1EF1c ti\u1EBFp (Ch\u1EBF \u0111\u1ED9 Offline pdflatex)...",
        contentType: "latex"
      });
      let rawLatex = options.customLatexCode || "";
      const defaultTexPath = import_path.default.join(downloadsDir, "tailieu.tex");
      if (!rawLatex && import_fs.default.existsSync(defaultTexPath)) {
        rawLatex = import_fs.default.readFileSync(defaultTexPath, "utf-8");
      }
      if (!rawLatex || !rawLatex.includes("\\begin{document}") && !rawLatex.includes("\\documentclass")) {
        const errMsg = "\u26A0\uFE0F Kh\xF4ng t\xECm th\u1EA5y m\xE3 ngu\u1ED3n LaTeX h\u1EE3p l\u1EC7 \u0111\u1EC3 bi\xEAn d\u1ECBch. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i m\xE3 ngu\u1ED3n!";
        onProgress({
          step: "ERROR",
          progress: 0,
          message: errMsg,
          error: "No valid LaTeX code",
          contentType: "latex"
        });
        return { success: false, error: errMsg };
      }
      let cleanLatex = rawLatex.replace(/```(?:latex)?/gi, "").replace(/```/g, "").trim();
      let finalLatex = _AutomationRunner.autoRepairLatexCode(cleanLatex);
      const timestamp = Date.now();
      const texFileName = `tailieu_${timestamp}.tex`;
      const pdfFileName = `tailieu_${timestamp}.pdf`;
      const targetTexPath = import_path.default.join(downloadsDir, texFileName);
      const targetPdfPath = import_path.default.join(downloadsDir, pdfFileName);
      import_fs.default.writeFileSync(targetTexPath, finalLatex, "utf-8");
      import_fs.default.writeFileSync(defaultTexPath, finalLatex, "utf-8");
      const compileSh = `#!/bin/bash
pdflatex -interaction=nonstopmode "${texFileName}"
pdflatex -interaction=nonstopmode "${texFileName}"
rm -f *.aux *.log *.out *.toc
`;
      const compileBat = `@echo off
chcp 65001 >nul
pdflatex -interaction=nonstopmode "${texFileName}"
pdflatex -interaction=nonstopmode "${texFileName}"
del *.aux *.log *.out *.toc 2>nul
`;
      import_fs.default.writeFileSync(import_path.default.join(downloadsDir, "compile_latex.sh"), compileSh, "utf-8");
      import_fs.default.writeFileSync(import_path.default.join(downloadsDir, "compile_latex.bat"), compileBat, "utf-8");
      const pdflatexPathFound = getPdflatexPath();
      const pdflatexBin = pdflatexPathFound && (import_fs.default.existsSync(pdflatexPathFound) || pdflatexPathFound === "pdflatex") ? pdflatexPathFound : null;
      let compiledPdfPath = null;
      if (pdflatexBin) {
        onProgress({
          step: "COMPILING_LATEX",
          progress: 30,
          message: "\u2699\uFE0F \u0110ang bi\xEAn d\u1ECBch t\xE0i li\u1EC7u b\u1EB1ng pdflatex (L\u1EA7n 1)...",
          contentType: "latex",
          latexCode: finalLatex
        });
        for (let pass = 1; pass <= 2; pass++) {
          if (this.isCancelled) return { success: false, error: "Cancelled" };
          if (pass === 2) {
            onProgress({
              step: "COMPILING_LATEX",
              progress: 70,
              message: "\u2699\uFE0F \u0110ang bi\xEAn d\u1ECBch pdflatex l\u1EA7n 2 (\u0110\u1ED3ng b\u1ED9 s\u1ED1 trang, m\u1EE5c l\u1EE5c & TikZ)...",
              contentType: "latex",
              latexCode: finalLatex
            });
          }
          await new Promise((resPass) => {
            const proc = (0, import_child_process.spawn)(pdflatexBin, [
              "-interaction=nonstopmode",
              `-output-directory=${downloadsDir}`,
              targetTexPath
            ], { cwd: downloadsDir });
            this.childProc = proc;
            proc.on("close", () => {
              this.childProc = null;
              resPass();
            });
            proc.on("error", () => {
              this.childProc = null;
              resPass();
            });
          });
        }
        if (import_fs.default.existsSync(targetPdfPath)) {
          compiledPdfPath = targetPdfPath;
        } else {
          const logFile = import_path.default.join(downloadsDir, `tailieu_${timestamp}.log`);
          let logContent = "";
          if (import_fs.default.existsSync(logFile)) {
            try {
              logContent = import_fs.default.readFileSync(logFile, "utf-8");
            } catch {
            }
          }
          onProgress({
            step: "COMPILING_LATEX",
            progress: 85,
            message: "\u{1F527} K\xEDch ho\u1EA1t LaTeX Auto-Healing: \u0110ang t\u1EF1 \u0111\u1ED9ng s\u1EEDa l\u1ED7i c\xFA ph\xE1p & k\xFD t\u1EF1 \u0111\u1EB7c bi\u1EC7t...",
            contentType: "latex",
            latexCode: finalLatex
          });
          const repaired = _AutomationRunner.autoRepairLatexCode(finalLatex, logContent);
          if (repaired !== finalLatex) {
            finalLatex = repaired;
            import_fs.default.writeFileSync(targetTexPath, finalLatex, "utf-8");
            import_fs.default.writeFileSync(defaultTexPath, finalLatex, "utf-8");
            for (let pass = 1; pass <= 2; pass++) {
              if (this.isCancelled) return { success: false, error: "Cancelled" };
              await new Promise((resPass) => {
                const proc = (0, import_child_process.spawn)(pdflatexBin, [
                  "-interaction=nonstopmode",
                  `-output-directory=${downloadsDir}`,
                  targetTexPath
                ], { cwd: downloadsDir });
                this.childProc = proc;
                proc.on("close", () => {
                  this.childProc = null;
                  resPass();
                });
                proc.on("error", () => {
                  this.childProc = null;
                  resPass();
                });
              });
            }
            if (import_fs.default.existsSync(targetPdfPath)) {
              compiledPdfPath = targetPdfPath;
            }
          }
        }
        if (compiledPdfPath) {
          const auxExtensions = [".aux", ".log", ".out", ".toc", ".nav", ".snm"];
          for (const ext of auxExtensions) {
            const auxFile = import_path.default.join(downloadsDir, `tailieu_${timestamp}${ext}`);
            if (import_fs.default.existsSync(auxFile)) {
              try {
                import_fs.default.unlinkSync(auxFile);
              } catch {
              }
            }
          }
        }
      }
      if (!compiledPdfPath) {
        const logFile = import_path.default.join(downloadsDir, `tailieu_${timestamp}.log`);
        let errorDetails = "";
        if (import_fs.default.existsSync(logFile)) {
          try {
            const logLines = import_fs.default.readFileSync(logFile, "utf-8").split("\n");
            const errs = logLines.filter((l) => l.startsWith("!") || l.includes("Error:")).slice(0, 4);
            if (errs.length > 0) errorDetails = errs.join(" | ");
          } catch {
          }
        }
        const errMsg = `\u26A0\uFE0F Kh\xF4ng th\u1EC3 xu\u1EA5t PDF: ${errorDetails || "Ch\u01B0a ph\xE1t hi\u1EC7n tr\xECnh bi\xEAn d\u1ECBch pdflatex ho\u1EB7c m\xE3 ngu\u1ED3n b\u1ECB l\u1ED7i c\xFA ph\xE1p."}`;
        onProgress({
          step: "ERROR",
          progress: 0,
          message: errMsg,
          error: errorDetails || "Compilation failed",
          latexCode: finalLatex,
          filePath: targetTexPath,
          contentType: "latex"
        });
        return { success: false, error: errMsg };
      }
      const pdfPreviewUrl = generatePdfPreviewImage(compiledPdfPath, downloadsDir);
      onProgress({
        step: "COMPLETED",
        progress: 100,
        message: "\u{1F389} Rerender t\xE0i li\u1EC7u PDF th\xE0nh c\xF4ng! [tailieu.pdf]",
        latexCode: finalLatex,
        pdfPath: compiledPdfPath,
        pdfUrl: `/downloads/${pdfFileName}`,
        pdfPreviewUrl,
        filePath: targetTexPath,
        contentType: "latex"
      });
      return {
        success: true,
        latexCode: finalLatex,
        pdfPath: compiledPdfPath,
        pdfUrl: `/downloads/${pdfFileName}`,
        pdfPreviewUrl
      };
    }
    const quality = options.renderQuality || "480p";
    const qualityFlag = quality === "4k" ? "-qk" : quality === "480p" ? "-ql" : quality === "720p" ? "-qm" : "-qh";
    const qualityLabel = quality === "480p" ? "480p (Ki\u1EC3m th\u1EED si\xEAu t\u1ED1c)" : quality === "720p" ? "720p (HD Chu\u1EA9n)" : quality === "4k" ? "4K (Ultra HD)" : "1080p (Full HD Chu\u1EA9n n\xE9t)";
    onProgress({
      step: "RENDERING_VIDEO",
      progress: 10,
      message: `\u26A1 B\u1EAFt \u0111\u1EA7u Rerender Video Manim CE tr\u1EF1c ti\u1EBFp [Ch\u1EA5t l\u01B0\u1EE3ng: ${qualityLabel}]...`,
      contentType: "manim"
    });
    let rawPython = options.customPythonCode || "";
    const sceneFilePath = import_path.default.join(downloadsDir, "scene.py");
    if (!rawPython && import_fs.default.existsSync(sceneFilePath)) {
      rawPython = import_fs.default.readFileSync(sceneFilePath, "utf-8");
    }
    if (!rawPython || !rawPython.includes("class ") && !rawPython.includes("def construct")) {
      const errMsg = "\u26A0\uFE0F Kh\xF4ng t\xECm th\u1EA5y m\xE3 Python Manim (scene.py) h\u1EE3p l\u1EC7 \u0111\u1EC3 Rerender. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i m\xE3 ngu\u1ED3n!";
      onProgress({
        step: "ERROR",
        progress: 0,
        message: errMsg,
        error: "No valid Manim code",
        contentType: "manim"
      });
      return { success: false, error: errMsg };
    }
    let finalPython = _AutomationRunner.prepareManimPythonCode(rawPython);
    import_fs.default.writeFileSync(sceneFilePath, finalPython, "utf-8");
    const renderSh = `#!/bin/bash
manim ${qualityFlag} scene.py MainScene
`;
    import_fs.default.writeFileSync(import_path.default.join(downloadsDir, "render_manim.sh"), renderSh, "utf-8");
    const manimBin = await _AutomationRunner.ensureManimEnvironment((msg) => {
      onProgress({ step: "RENDERING_VIDEO", progress: 20, message: msg, contentType: "manim" });
    });
    if (!manimBin) {
      const errMsg = "\u26A0\uFE0F Kh\xF4ng t\xECm th\u1EA5y Manim CE trong m\xF4i tr\u01B0\u1EDDng Python. Vui l\xF2ng c\xE0i \u0111\u1EB7t qua pip install manim.";
      onProgress({
        step: "ERROR",
        progress: 0,
        message: errMsg,
        error: "Manim binary missing",
        contentType: "manim"
      });
      return { success: false, error: errMsg };
    }
    let sceneClass = "MainScene";
    const sceneMatch = finalPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
    if (sceneMatch && sceneMatch[1]) sceneClass = sceneMatch[1];
    onProgress({
      step: "RENDERING_VIDEO",
      progress: 30,
      message: `\u2699\uFE0F \u0110ang th\u1EF1c thi Manim CE: manim ${qualityFlag} scene.py ${sceneClass}...`,
      manimCode: finalPython,
      filePath: sceneFilePath,
      contentType: "manim"
    });
    const mediaDir = import_path.default.join(downloadsDir, "media");
    const renderResult = await new Promise((resRender) => {
      const proc = (0, import_child_process.spawn)(manimBin, [qualityFlag, "--media_dir", mediaDir, sceneFilePath, sceneClass], { cwd: downloadsDir });
      this.childProc = proc;
      let stderr = "";
      let stdout = "";
      proc.stdout?.on("data", (d) => {
        stdout += d.toString();
      });
      proc.stderr?.on("data", (d) => {
        const s = d.toString();
        stderr += s;
        const match = s.match(/(\d+)%/);
        if (match) {
          const pct = Math.min(95, 30 + Math.floor(parseInt(match[1], 10) * 0.65));
          onProgress({
            step: "RENDERING_VIDEO",
            progress: pct,
            message: `\u0110ang render video Manim (${quality}): ${match[1]}%...`,
            manimCode: finalPython,
            contentType: "manim"
          });
        }
      });
      proc.on("close", (code) => {
        this.childProc = null;
        if (code === 0) {
          const newest = _AutomationRunner.findNewestMp4(mediaDir);
          if (newest) return resRender({ success: true, mp4Path: newest });
        }
        const parsed = _AutomationRunner.parseManimError(stderr, stdout, downloadsDir);
        resRender({ success: false, error: parsed.summary });
      });
      proc.on("error", (err) => {
        this.childProc = null;
        resRender({ success: false, error: err.message });
      });
    });
    if (!renderResult.success || !renderResult.mp4Path) {
      const errMsg = `\u26A0\uFE0F L\u1ED7i render Manim: ${renderResult.error || "Bi\xEAn d\u1ECBch th\u1EA5t b\u1EA1i"}`;
      onProgress({
        step: "ERROR",
        progress: 0,
        message: errMsg,
        error: renderResult.error,
        manimCode: finalPython,
        filePath: sceneFilePath,
        contentType: "manim"
      });
      return { success: false, error: errMsg };
    }
    let finalVideoSource = renderResult.mp4Path;
    let audioPath;
    let audioUrl;
    if (options.enableVoice === true) {
      onProgress({
        step: "RENDERING_VIDEO",
        progress: 96,
        message: "\u0110ang kh\u1EDFi t\u1EA1o gi\u1ECDng \u0111\u1ECDc AI v\xE0 \u0111\u1ED3ng b\u1ED9 \xE2m thanh...",
        contentType: "manim"
      });
      const voiceRes = await _AutomationRunner.generateVoiceoverAndMux({
        mp4Path: renderResult.mp4Path,
        pythonCode: finalPython,
        workingDir: downloadsDir,
        voiceName: options.voiceName || "vi-VN-HoaiMyNeural",
        voiceSpeed: options.voiceSpeed || "+0%",
        fallbackTopic: options.topic,
        onStatus: (msg) => {
          onProgress({
            step: "RENDERING_VIDEO",
            progress: 97,
            message: msg,
            contentType: "manim"
          });
        }
      });
      if (voiceRes.success && voiceRes.mp4Path) {
        finalVideoSource = voiceRes.mp4Path;
      }
      if (voiceRes.audioPath && import_fs.default.existsSync(voiceRes.audioPath)) {
        audioPath = voiceRes.audioPath;
        audioUrl = `/downloads/${import_path.default.basename(voiceRes.audioPath)}`;
      }
    }
    const videoFileName = `video_${Date.now()}.mp4`;
    const finalVideoPath = import_path.default.join(downloadsDir, videoFileName);
    import_fs.default.copyFileSync(finalVideoSource, finalVideoPath);
    onProgress({
      step: "COMPLETED",
      progress: 100,
      message: audioPath ? "\u{1F389} Rerender video Manim MP4 k\xE8m thuy\u1EBFt minh AI th\xE0nh c\xF4ng!" : "\u{1F389} Rerender video Manim MP4 th\xE0nh c\xF4ng!",
      manimCode: finalPython,
      latexCode: finalPython,
      filePath: sceneFilePath,
      videoPath: finalVideoPath,
      videoUrl: `/downloads/${videoFileName}`,
      audioPath,
      audioUrl,
      contentType: "manim"
    });
    return {
      success: true,
      latexCode: finalPython,
      pdfPath: finalVideoPath,
      pdfUrl: `/downloads/${videoFileName}`
    };
  }
  async runPipeline(options, onProgress) {
    this.isCancelled = false;
    const outputDirectory = options.outputDir || import_path.default.resolve(process.cwd(), "downloads");
    if (!import_fs.default.existsSync(outputDirectory)) {
      import_fs.default.mkdirSync(outputDirectory, { recursive: true });
    }
    if (options.rerenderOnly || options.action === "rerender") {
      return await this.runDirectRerender(options, outputDirectory, onProgress);
    }
    const browserType = options.browserType || "chrome";
    const isHeadless = !!options.headless;
    const browserName = browserType === "firefox" ? "Firefox" : browserType === "edge" ? "Edge" : "Chrome";
    try {
      onProgress({
        step: "CONNECTING_CHROME",
        progress: 10,
        message: isHeadless ? `\u0110ang kh\u1EDFi \u0111\u1ED9ng ${browserName} \u1EDF ch\u1EBF \u0111\u1ED9 CH\u1EA0Y NG\u1EA6M (Stealth Mode)...` : `\u0110ang k\u1EBFt n\u1ED1i ${browserName} v\u1EDBi t\xE0i kho\u1EA3n c\u1EE7a b\u1EA1n...`
      });
      let browserContext;
      const viewportSetting = isHeadless ? { width: 1920, height: 1080 } : null;
      const stealthArgs = [
        "--start-maximized",
        "--disable-blink-features=AutomationControlled",
        "--no-default-browser-check",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=1920,1080"
      ];
      if (browserType === "firefox") {
        const firefoxExecutable = _AutomationRunner.getDefaultFirefoxPath();
        const firefoxProfile = options.chromeProfilePath || _AutomationRunner.getDefaultFirefoxProfileDir();
        try {
          browserContext = await import_playwright_core.firefox.launchPersistentContext(firefoxProfile, {
            executablePath: firefoxExecutable,
            headless: isHeadless,
            viewport: viewportSetting,
            userAgent: DEFAULT_STEALTH_USER_AGENT,
            args: ["-no-remote"]
          });
        } catch (err) {
          console.warn("Firefox Snap kh\xF4ng h\u1ED7 tr\u1EE3 automation, chuy\u1EC3n sang Chrome:", err.message);
          onProgress({
            step: "CONNECTING_CHROME",
            progress: 15,
            message: "\u0110ang t\u1EF1 \u0111\u1ED9ng chuy\u1EC3n sang Google Chrome..."
          });
          const chromeExecutable = _AutomationRunner.getDefaultChromePath();
          const hasChromeExec = chromeExecutable && import_fs.default.existsSync(chromeExecutable);
          const getLaunchConfig = (ch) => {
            const cfg = {
              headless: isHeadless,
              viewport: viewportSetting,
              userAgent: DEFAULT_STEALTH_USER_AGENT,
              args: stealthArgs,
              ignoreDefaultArgs: ["--enable-automation"]
            };
            if (hasChromeExec) {
              cfg.executablePath = chromeExecutable;
            } else {
              cfg.channel = ch;
            }
            return cfg;
          };
          const userDataDir = options.chromeProfilePath || import_path.default.join(import_os.default.tmpdir(), "yuta_chrome_auto_" + Date.now());
          browserContext = await import_playwright_core.chromium.launchPersistentContext(userDataDir, getLaunchConfig("chrome"));
        }
      } else {
        const chromeExecutable = _AutomationRunner.getDefaultChromePath();
        const hasChromeExec = chromeExecutable && import_fs.default.existsSync(chromeExecutable);
        const getLaunchConfig = (ch) => {
          const cfg = {
            headless: isHeadless,
            viewport: viewportSetting,
            userAgent: DEFAULT_STEALTH_USER_AGENT,
            args: stealthArgs,
            ignoreDefaultArgs: ["--enable-automation"]
          };
          if (hasChromeExec) {
            cfg.executablePath = chromeExecutable;
          } else {
            cfg.channel = ch;
          }
          return cfg;
        };
        const defaultProfile = _AutomationRunner.getDefaultUserDataDir();
        const userDataDir = options.chromeProfilePath || defaultProfile;
        _AutomationRunner.cleanStaleChromiumLocks(userDataDir, false);
        try {
          if (options.cdpPort) {
            const browser = await import_playwright_core.chromium.connectOverCDP(`http://localhost:${options.cdpPort}`);
            browserContext = browser.contexts()[0];
          } else {
            browserContext = await import_playwright_core.chromium.launchPersistentContext(
              userDataDir,
              getLaunchConfig(browserType === "edge" ? "msedge" : "chrome")
            );
          }
        } catch (err) {
          console.warn("Profile Chrome \u0111ang b\u1ECB kh\xF3a ho\u1EB7c l\u1ED7i kh\u1EDFi \u0111\u1ED9ng, th\u1EED x\xF3a lock v\xE0 kh\u1EDFi \u0111\u1ED9ng l\u1EA1i:", err.message);
          _AutomationRunner.cleanStaleChromiumLocks(userDataDir, true);
          await new Promise((r) => setTimeout(r, 1200));
          try {
            browserContext = await import_playwright_core.chromium.launchPersistentContext(
              userDataDir,
              getLaunchConfig(browserType === "edge" ? "msedge" : "chrome")
            );
          } catch (errRetry) {
            console.warn("Profile Chrome v\u1EABn b\u1ECB kh\xF3a, chuy\u1EC3n sang session t\u1EA1m:", errRetry.message);
            const tempDir = import_path.default.join(import_os.default.tmpdir(), "yuta_automation_chrome_" + Date.now());
            browserContext = await import_playwright_core.chromium.launchPersistentContext(tempDir, getLaunchConfig("chrome"));
          }
        }
      }
      await browserContext.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => void 0 });
        Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, "languages", { get: () => ["vi-VN", "vi", "en-US", "en"] });
        window.chrome = { runtime: {}, app: {} };
      });
      this.context = browserContext;
      if (this.isCancelled) throw new Error("\u0110\xE3 h\u1EE7y quy tr\xECnh t\u1EF1 \u0111\u1ED9ng.");
      const providerKey = (options.aiProvider || options.provider || (options.model && options.model.startsWith("chatgpt") ? "chatgpt" : "")).toLowerCase();
      let targetAiUrl = options.aiUrl || "";
      if (providerKey === "chatgpt") {
        if (!targetAiUrl || !targetAiUrl.includes("chatgpt.com") && !targetAiUrl.includes("openai.com")) {
          targetAiUrl = "https://chatgpt.com";
        }
      } else if (providerKey === "claude") {
        if (!targetAiUrl || !targetAiUrl.includes("claude.ai")) {
          targetAiUrl = "https://claude.ai/new";
        }
      } else if (providerKey === "deepseek") {
        if (!targetAiUrl || !targetAiUrl.includes("deepseek.com")) {
          targetAiUrl = "https://chat.deepseek.com";
        }
      } else if (providerKey === "grok") {
        if (!targetAiUrl || !targetAiUrl.includes("grok.com") && !targetAiUrl.includes("x.com")) {
          targetAiUrl = "https://grok.com";
        }
      } else if (providerKey === "gemini") {
        if (!targetAiUrl || !targetAiUrl.includes("gemini.google.com")) {
          targetAiUrl = "https://gemini.google.com/app";
        }
      } else if (!targetAiUrl) {
        targetAiUrl = options.geminiUrl || "https://gemini.google.com/app";
      }
      let aiName = "AI";
      if (targetAiUrl.includes("chatgpt.com") || targetAiUrl.includes("openai.com")) aiName = "ChatGPT";
      else if (targetAiUrl.includes("claude.ai")) aiName = "Claude";
      else if (targetAiUrl.includes("grok.com") || targetAiUrl.includes("x.com")) aiName = "Grok";
      else if (targetAiUrl.includes("deepseek.com")) aiName = "DeepSeek";
      else if (targetAiUrl.includes("gemini.google.com")) aiName = "Gemini";
      onProgress({
        step: "OPENING_GEMINI",
        progress: 25,
        message: `\u0110ang truy c\u1EADp ${aiName} (${targetAiUrl})...`
      });
      let targetHost = "gemini.google.com";
      try {
        targetHost = new URL(targetAiUrl).hostname;
      } catch {
      }
      const pages = browserContext.pages();
      let aiPage = pages.find((p) => {
        try {
          return new URL(p.url()).hostname.includes(targetHost) || p.url().includes(targetHost);
        } catch {
          return false;
        }
      });
      if (!aiPage) {
        aiPage = pages.length > 0 ? pages[0] : await browserContext.newPage();
        await aiPage.goto(targetAiUrl, { waitUntil: "domcontentloaded", timeout: 45e3 });
      } else {
        if (!isHeadless) await aiPage.bringToFront();
        const curUrl = aiPage.url();
        const shouldNavigate = !curUrl.includes(targetHost) || targetAiUrl.includes("?") && !curUrl.includes(targetAiUrl.split("?")[1]);
        if (shouldNavigate) {
          await aiPage.goto(targetAiUrl, { waitUntil: "domcontentloaded" });
        }
      }
      this.activePage = aiPage;
      if (aiPage.url().includes("accounts.google.com") || aiPage.url().includes("/login") || aiPage.url().includes("/auth")) {
        if (isHeadless) {
          throw new Error(`Ch\u01B0a \u0111\u0103ng nh\u1EADp ${aiName} trong phi\xEAn ch\u1EA1y ng\u1EA7m! Vui l\xF2ng b\u1ECF ch\u1ECDn "Ch\u1EA1y ng\u1EA7m" \u0111\u1EC3 \u0111\u0103ng nh\u1EADp 1 l\u1EA7n tr\xEAn tr\xECnh duy\u1EC7t.`);
        }
        onProgress({
          step: "OPENING_GEMINI",
          progress: 28,
          message: `Vui l\xF2ng ho\xE0n t\u1EA5t \u0111\u0103ng nh\u1EADp t\xE0i kho\u1EA3n ${aiName} tr\xEAn tr\xECnh duy\u1EC7t...`
        });
        await aiPage.waitForURL((url) => !url.href.includes("/login") && !url.href.includes("/auth") && !url.href.includes("accounts.google.com"), { timeout: 12e4 });
      }
      await _AutomationRunner.ensureFreshChatSession(aiPage, targetAiUrl, aiName, onProgress);
      if (options.attachedPdfPath && import_fs.default.existsSync(options.attachedPdfPath)) {
        try {
          onProgress({
            step: "SENDING_PROMPT",
            progress: 32,
            message: `\u0110ang \u0111\xEDnh k\xE8m file PDF (${import_path.default.basename(options.attachedPdfPath)}) v\xE0o ${aiName}...`
          });
          const fileInput = await aiPage.$('input[type="file"]');
          if (fileInput) {
            await fileInput.setInputFiles(options.attachedPdfPath);
            await aiPage.waitForTimeout(2500);
          }
        } catch (uploadErr) {
          console.warn('Kh\xF4ng th\u1EC3 t\u1EF1 \u0111\u1ED9ng \u0111\xEDnh k\xE8m file qua input[type="file"]:', uploadErr);
        }
      }
      if (targetAiUrl.includes("deepseek.com") && (options.model === "deepseek-r1" || options.modelName?.includes("R1"))) {
        try {
          const deepThinkBtn = await aiPage.$('button:has-text("DeepThink"), div[role="button"]:has-text("DeepThink"), .ds-switch-button:has-text("DeepThink")');
          if (deepThinkBtn) {
            const btnClass = await deepThinkBtn.getAttribute("class") || "";
            const ariaChecked = await deepThinkBtn.getAttribute("aria-checked");
            if (!btnClass.includes("active") && !btnClass.includes("selected") && ariaChecked !== "true") {
              await deepThinkBtn.click();
              await aiPage.waitForTimeout(500);
            }
          }
        } catch (e) {
          console.log("DeepThink toggle check:", e.message);
        }
      }
      if (targetAiUrl.includes("chatgpt.com") || targetAiUrl.includes("openai.com")) {
        const modelKey = (options.model || "").toLowerCase();
        const modelNameLower = (options.modelName || "").toLowerCase();
        const wantThink = !modelKey.includes("no-think") && !modelKey.includes("t\u1EAFt") && !modelNameLower.includes("t\u1EAFt") && !modelNameLower.includes("kh\xF4ng think");
        onProgress({
          step: "SENDING_PROMPT",
          progress: 32,
          message: `\u0110ang ki\u1EC3m tra v\xE0 thi\u1EBFt l\u1EADp ch\u1EBF \u0111\u1ED9 Think [${wantThink ? "B\u1EADt suy ngh\u0129 s\xE2u" : "T\u1EAFt Think - Ti\xEAu chu\u1EA9n"}] tr\xEAn ChatGPT...`
        });
        try {
          let thinkToggled = false;
          for (let attempt = 0; attempt < 6; attempt++) {
            const evalRes = await aiPage.evaluate(async ({ wantThink: wantThink2 }) => {
              function isVisible(el) {
                if (!el) return false;
                const r = el.getBoundingClientRect();
                const s = window.getComputedStyle(el);
                return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
              }
              const buttons = Array.from(document.querySelectorAll('button, [role="button"], [role="switch"]')).filter(isVisible);
              const thinkBtn = buttons.find((b) => {
                const testId = (b.getAttribute("data-testid") || "").toLowerCase();
                const aria = (b.getAttribute("aria-label") || "").toLowerCase();
                const text = (b.textContent || "").trim().toLowerCase();
                const title = (b.getAttribute("title") || "").toLowerCase();
                if (testId.includes("think") || testId.includes("reason")) return true;
                if (aria.includes("think") || aria.includes("reason") || aria.includes("suy ngh\u0129") || aria.includes("l\xFD lu\u1EADn")) return true;
                if (text === "think" || text === "reason" || text === "suy ngh\u0129" || text.startsWith("think ") || text.startsWith("reason ") || text.startsWith("suy ngh\u0129 ")) return true;
                return false;
              });
              if (!thinkBtn) return { status: "not_found" };
              const ariaPressed = thinkBtn.getAttribute("aria-pressed");
              const ariaChecked = thinkBtn.getAttribute("aria-checked");
              const dataState = thinkBtn.getAttribute("data-state");
              const className = (thinkBtn.getAttribute("class") || "").toLowerCase();
              const isCurrentlyActive = ariaPressed === "true" || ariaChecked === "true" || dataState === "active" || dataState === "on" || className.includes("active") || className.includes("selected") || className.includes("bg-token-main-surface-secondary") || className.includes("bg-gray-900") || className.includes("bg-black");
              if (wantThink2 && isCurrentlyActive) {
                return { status: "already_ok", active: true, label: thinkBtn.textContent?.trim() };
              }
              if (!wantThink2 && !isCurrentlyActive) {
                return { status: "already_ok", active: false, label: thinkBtn.textContent?.trim() };
              }
              thinkBtn.click();
              await new Promise((r) => setTimeout(r, 400));
              const popoverItems = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], [data-radix-collection-item]')).filter(isVisible);
              if (popoverItems.length > 0) {
                if (wantThink2) {
                  const item = popoverItems.find((m) => {
                    const t = (m.textContent || "").toLowerCase();
                    return t.includes("think") || t.includes("reason") || t.includes("suy ngh\u0129") || t.includes("b\u1EADt") || t.includes("high") || t.includes("s\xE2u");
                  });
                  if (item) {
                    item.click();
                    await new Promise((r) => setTimeout(r, 300));
                    return { status: "toggled_via_menu", active: true };
                  }
                } else {
                  const item = popoverItems.find((m) => {
                    const t = (m.textContent || "").toLowerCase();
                    return t.includes("standard") || t.includes("ti\xEAu chu\u1EA9n") || t.includes("t\u1EAFt") || t.includes("off") || t.includes("instant");
                  });
                  if (item) {
                    item.click();
                    await new Promise((r) => setTimeout(r, 300));
                    return { status: "toggled_via_menu", active: false };
                  }
                }
              }
              return { status: "toggled", active: wantThink2, label: thinkBtn.textContent?.trim() };
            }, { wantThink });
            if (evalRes && (evalRes.status === "already_ok" || evalRes.status === "toggled" || evalRes.status === "toggled_via_menu")) {
              thinkToggled = true;
              onProgress({
                step: "SENDING_PROMPT",
                progress: 34,
                message: wantThink ? "\u2713 \u0110\xE3 k\xEDch ho\u1EA1t ch\u1EBF \u0111\u1ED9 Think (Suy ngh\u0129 s\xE2u) tr\xEAn ChatGPT" : "\u2713 \u0110\xE3 thi\u1EBFt l\u1EADp ch\u1EBF \u0111\u1ED9 Ti\xEAu chu\u1EA9n (T\u1EAFt Think) tr\xEAn ChatGPT"
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
              'button[aria-label*="Suy ngh\u0129" i]',
              'button:has-text("Think")',
              'button:has-text("Reason")',
              'button:has-text("Suy ngh\u0129")'
            ];
            for (const sel of thinkLocators) {
              const loc = aiPage.locator(sel).first();
              if (await loc.isVisible({ timeout: 800 }).catch(() => false)) {
                const pressed = await loc.getAttribute("aria-pressed");
                const checked = await loc.getAttribute("aria-checked");
                const isCurrentOn = pressed === "true" || checked === "true";
                if (wantThink && !isCurrentOn || !wantThink && isCurrentOn) {
                  await loc.click();
                  await aiPage.waitForTimeout(400);
                  onProgress({
                    step: "SENDING_PROMPT",
                    progress: 34,
                    message: `\u2713 \u0110\xE3 chuy\u1EC3n \u0111\u1ED5i ch\u1EBF \u0111\u1ED9 Think: ${wantThink ? "B\u1EACT" : "T\u1EAET"}`
                  });
                }
                break;
              }
            }
          }
        } catch (chatgptErr) {
          console.warn("ChatGPT think mode toggle check:", chatgptErr.message);
        }
      }
      if (targetAiUrl.includes("gemini.google.com") && options.model) {
        onProgress({
          step: "SENDING_PROMPT",
          progress: 32,
          message: `\u0110ang ki\u1EC3m tra v\xE0 ch\u1ECDn m\xF4 h\xECnh ${options.modelName || options.model} tr\xEAn Gemini...`
        });
        try {
          let modelSwitched = false;
          const targetId = options.model.toLowerCase();
          const isTargetPro = targetId.includes("pro") || targetId.includes("3.1");
          const isTargetLite = targetId.includes("lite") || targetId.includes("3.5");
          const isTargetFlash = targetId.includes("3.8") || !isTargetPro && !isTargetLite;
          for (let attempt = 0; attempt < 8; attempt++) {
            const evalResult = await aiPage.evaluate(async ({ isTargetPro: isTargetPro2, isTargetLite: isTargetLite2, isTargetFlash: isTargetFlash2 }) => {
              function isVisible(el) {
                if (!el) return false;
                const r = el.getBoundingClientRect();
                const s = window.getComputedStyle(el);
                return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
              }
              const candidates = Array.from(document.querySelectorAll(
                'button, [role="button"], [role="combobox"], .input-area-switch, [data-test-id*="mode"]'
              ));
              const picker = candidates.find((b) => {
                if (!isVisible(b)) return false;
                const aria = (b.getAttribute("aria-label") || "").toLowerCase();
                const txt = (b.textContent || "").toLowerCase();
                const hasPopup = b.getAttribute("aria-haspopup") === "true" || b.getAttribute("aria-haspopup") === "menu";
                const combined = aria + " " + txt;
                if (b.classList.contains("input-area-switch")) return true;
                if (combined.includes("mode picker") || combined.includes("ch\u1ECDn ch\u1EBF \u0111\u1ED9") || combined.includes("ch\u1ECDn m\xF4 h\xECnh")) return true;
                if (hasPopup && (combined.includes("flash") || combined.includes("pro") || combined.includes("3.5") || combined.includes("3.8") || combined.includes("3.1"))) return true;
                return false;
              });
              if (!picker) return { status: "no_picker" };
              const currentText = ((picker.getAttribute("aria-label") || "") + " " + (picker.textContent || "")).toLowerCase();
              const isCurrentlyPro = (currentText.includes("pro") || currentText.includes("3.1")) && !currentText.includes("flash-lite") && !currentText.includes("lite");
              const isCurrentlyLite = currentText.includes("flash-lite") || currentText.includes("3.5") || currentText.includes("lite");
              const isCurrentlyFlash = !isCurrentlyPro && !isCurrentlyLite && (currentText.includes("3.8") || currentText.includes("flash"));
              if (isTargetPro2 && isCurrentlyPro || isTargetLite2 && isCurrentlyLite || isTargetFlash2 && isCurrentlyFlash) {
                return { status: "already_selected", currentText };
              }
              picker.click();
              await new Promise((r) => setTimeout(r, 450));
              const items = Array.from(document.querySelectorAll(
                '[role="menuitem"], [role="option"], mat-option, .mat-mdc-menu-item, div.mode-option'
              )).filter(isVisible);
              let targetItem = null;
              if (isTargetPro2) {
                targetItem = items.find((i) => {
                  const t = (i.textContent || "").toLowerCase();
                  return (t.includes("3.1") || t.includes("pro")) && !t.includes("flash-lite") && !t.includes("lite");
                });
              } else if (isTargetLite2) {
                targetItem = items.find((i) => {
                  const t = (i.textContent || "").toLowerCase();
                  return t.includes("flash-lite") || t.includes("3.5") || t.includes("lite");
                });
              } else {
                targetItem = items.find((i) => {
                  const t = (i.textContent || "").toLowerCase();
                  return (t.includes("3.8") || t.includes("flash")) && !t.includes("lite");
                });
              }
              if (targetItem) {
                targetItem.click();
                await new Promise((r) => setTimeout(r, 450));
                return { status: "switched", label: (targetItem.textContent || "").trim().replace(/\s+/g, " ") };
              }
              picker.click();
              return { status: "item_not_found", foundItems: items.map((i) => (i.textContent || "").trim().replace(/\s+/g, " ")) };
            }, { isTargetPro, isTargetLite, isTargetFlash });
            if (evalResult && (evalResult.status === "switched" || evalResult.status === "already_selected")) {
              modelSwitched = true;
              const label = evalResult.label || options.modelName || options.model;
              onProgress({
                step: "SENDING_PROMPT",
                progress: 34,
                message: `\u2713 \u0110\xE3 k\xEDch ho\u1EA1t m\xF4 h\xECnh Gemini: ${label}`
              });
              break;
            }
            await aiPage.waitForTimeout(600);
          }
          if (!modelSwitched) {
            try {
              const pickerLocators = [
                "button.input-area-switch",
                'button[aria-label*="mode picker" i]',
                'button[aria-haspopup="true"]:has-text("Flash")',
                'button[aria-haspopup="true"]:has-text("Pro")',
                'button[aria-haspopup="true"]:has-text("3.5")',
                'button[aria-haspopup="true"]:has-text("3.8")',
                'button[aria-haspopup="true"]:has-text("3.1")'
              ];
              for (const pSel of pickerLocators) {
                const pBtn = aiPage.locator(pSel).first();
                if (await pBtn.isVisible({ timeout: 1e3 }).catch(() => false)) {
                  await pBtn.click();
                  await aiPage.waitForTimeout(500);
                  let targetOptionSel = isTargetPro ? '[role="menuitem"]:has-text("3.1 Pro"), [role="menuitem"]:has-text("Pro")' : isTargetLite ? '[role="menuitem"]:has-text("3.5 Flash-Lite"), [role="menuitem"]:has-text("Flash-Lite")' : '[role="menuitem"]:has-text("3.8 Flash"), [role="menuitem"]:has-text("Flash")';
                  const itemLoc = aiPage.locator(targetOptionSel).first();
                  if (await itemLoc.isVisible({ timeout: 1500 }).catch(() => false)) {
                    await itemLoc.click();
                    await aiPage.waitForTimeout(500);
                    modelSwitched = true;
                    onProgress({
                      step: "SENDING_PROMPT",
                      progress: 34,
                      message: `\u2713 \u0110\xE3 ch\u1ECDn m\xF4 h\xECnh Gemini qua menu: ${options.modelName || options.model}`
                    });
                    break;
                  }
                }
              }
            } catch (fbErr) {
              console.warn("Fallback Gemini model selector:", fbErr.message);
            }
          }
        } catch (geminiModelErr) {
          console.warn("Gemini model selection error:", geminiModelErr);
        }
      }
      const isManimTaskEarly = options.prompt.includes("Manim") || options.prompt.includes("Scene") || options.prompt.includes("scene.py") || options.prompt.includes("VOICEOVER_SCRIPT") || options.prompt.includes("K\u1ECACH B\u1EA2N S\u01AF PH\u1EA0M");
      onProgress({
        step: "SENDING_PROMPT",
        progress: 35,
        message: isManimTaskEarly ? `[L\u01B0\u1EE3t 1/2] \u0110ang g\u1EEDi y\xEAu c\u1EA7u K\u1ECBch b\u1EA3n S\u01B0 ph\u1EA1m & L\u1EDDi tho\u1EA1i sang ${aiName}${options.modelName ? ` [${options.modelName}]` : ""}...` : `\u0110ang \u0111i\u1EC1n Prompt v\xE0 g\u1EEDi l\u1EC7nh gi\u1EA3i to\xE1n sang ${aiName}${options.modelName ? ` [${options.modelName}]` : ""}...`
      });
      await aiPage.waitForTimeout(2e3);
      const promptInputSelectors = [
        "#prompt-textarea",
        'rich-textarea div[contenteditable="true"]',
        'div.ql-editor[contenteditable="true"]',
        'div[contenteditable="true"].ProseMirror',
        "textarea#chat-input",
        "#prompt-textarea",
        'div[id="prompt-textarea"][contenteditable="true"]',
        'div[contenteditable="true"][data-placeholder]',
        'rich-textarea div[contenteditable="true"]',
        'div.ql-editor[contenteditable="true"]',
        'div[contenteditable="true"].ProseMirror',
        "textarea#chat-input",
        'textarea[data-id="root"]',
        'div[role="textbox"][contenteditable="true"]',
        'div[contenteditable="true"]',
        'textarea[placeholder*="Ask"]',
        'textarea[placeholder*="DeepSeek"]',
        'textarea[placeholder*="Message"]',
        'textarea[aria-label*="prompt"]',
        "textarea"
      ];
      let inputFound = false;
      for (const sel of promptInputSelectors) {
        try {
          const el = await aiPage.waitForSelector(sel, { timeout: 6e3, state: "attached" });
          if (el && await el.isVisible()) {
            await el.click();
            await aiPage.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
            await aiPage.keyboard.press("Backspace");
            const inserted = await aiPage.evaluate(({ selector, text }) => {
              const target = document.querySelector(selector);
              if (target) {
                target.focus();
                document.execCommand("insertText", false, text);
                target.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
                target.dispatchEvent(new Event("change", { bubbles: true }));
                const len = (target.textContent || target.value || "").length;
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
        } catch {
        }
      }
      if (!inputFound) {
        await aiPage.keyboard.insertText(options.prompt);
      }
      await aiPage.waitForTimeout(1e3);
      const sendButtonSelectors = [
        'button[data-testid="send-button"]',
        'button[data-testid="fruitjuice-send-button"]',
        'button[data-testid*="send" i]',
        'button[aria-label*="Send message" i]',
        'button[aria-label*="G\u1EEDi tin nh\u1EAFn" i]',
        'button[aria-label*="Send Message" i]',
        'button[aria-label*="Send prompt" i]',
        'button[aria-label*="Send" i]',
        'button[aria-label*="G\u1EEDi" i]',
        'div[role="button"][aria-label*="Send" i]',
        "button.send-button",
        'button[type="submit"]',
        'mat-icon[fonticon="send"]'
      ];
      let sendClicked = false;
      for (const sel of sendButtonSelectors) {
        try {
          const btn = await aiPage.$(sel);
          if (btn && await btn.isVisible()) {
            await btn.click();
            sendClicked = true;
            break;
          }
        } catch {
        }
      }
      if (!sendClicked) {
        await aiPage.keyboard.press("Enter");
      }
      onProgress({
        step: "WAITING_GEMINI",
        progress: 50,
        message: isManimTaskEarly ? `[L\u01B0\u1EE3t 1/2] ${aiName} \u0111ang ph\xE2n t\xEDch & x\xE2y d\u1EF1ng K\u1ECBch b\u1EA3n S\u01B0 ph\u1EA1m 4 ph\xE2n c\u1EA3nh...` : `${aiName} \u0111ang ph\xE2n t\xEDch v\xE0 x\u1EED l\xFD y\xEAu c\u1EA7u...`
      });
      let checkCount = 0;
      let lastTextLength = 0;
      let stableCount = 0;
      while (checkCount < 180) {
        if (this.isCancelled) throw new Error("\u0110\xE3 h\u1EE7y quy tr\xECnh.");
        await aiPage.waitForTimeout(2e3);
        checkCount++;
        const stopBtn = await aiPage.$(
          'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="D\u1EEBng" i], button[aria-label*="Stop generating" i]'
        );
        const isStopVisible = stopBtn ? await stopBtn.isVisible().catch(() => false) : false;
        const currentLength = await aiPage.evaluate(() => {
          const blocks = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
          );
          const lastBlock = blocks[blocks.length - 1];
          return lastBlock ? (lastBlock.textContent || "").length : 0;
        });
        if (currentLength > 0 && currentLength !== lastTextLength) {
          onProgress({
            step: "WAITING_GEMINI",
            progress: Math.min(68, 50 + Math.floor(currentLength / 120)),
            message: isManimTaskEarly ? `[L\u01B0\u1EE3t 1/2] ${aiName} \u0111ang xu\u1EA5t K\u1ECBch b\u1EA3n S\u01B0 ph\u1EA1m & Tho\u1EA1i (${currentLength} k\xFD t\u1EF1)...` : `${aiName} \u0111ang ph\xE2n t\xEDch & xu\u1EA5t n\u1ED9i dung (${currentLength} k\xFD t\u1EF1)...`
          });
        }
        if (currentLength > 100 && currentLength === lastTextLength && !isStopVisible) {
          stableCount++;
          if (stableCount >= 2) break;
        } else {
          stableCount = 0;
        }
        lastTextLength = currentLength;
      }
      const sendFollowupPromptAndGetPython = async (promptText2, onStatus) => {
        if (!aiPage || aiPage.isClosed()) return null;
        if (onStatus) onStatus("\u0110ang chu\u1EA9n b\u1ECB g\u1EEDi prompt ti\u1EBFp theo t\u1EDBi AI...");
        await aiPage.waitForTimeout(1500);
        for (let w = 0; w < 12; w++) {
          const busy = await aiPage.evaluate(() => {
            const isStop = document.querySelector(
              'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="D\u1EEBng" i]'
            );
            return isStop ? isStop.offsetParent !== null || isStop.getAttribute("aria-hidden") !== "true" : false;
          }).catch(() => false);
          if (!busy) break;
          await aiPage.waitForTimeout(1e3);
        }
        const initialAssistantCount = await aiPage.evaluate(() => {
          const blocks = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
          );
          return blocks.length;
        }).catch(() => 0);
        const promptSelectors = [
          'rich-textarea div[contenteditable="true"]',
          "rich-textarea .ProseMirror",
          'div[contenteditable="true"].ProseMirror',
          'div[contenteditable="true"][role="textbox"]',
          "#prompt-textarea",
          'div.ql-editor[contenteditable="true"]',
          "textarea#chat-input",
          'textarea[data-id="root"]',
          'div[role="textbox"][contenteditable="true"]',
          'div[contenteditable="true"]',
          'textarea[placeholder*="Ask"]',
          'textarea[placeholder*="DeepSeek"]',
          'textarea[placeholder*="Message"]',
          'textarea[aria-label*="prompt"]',
          "textarea"
        ];
        let activeInputEl = null;
        let activeSelector = null;
        for (const sel of promptSelectors) {
          try {
            const el = await aiPage.$(sel);
            if (el && await el.isVisible()) {
              activeInputEl = el;
              activeSelector = sel;
              break;
            }
          } catch {
          }
        }
        if (!activeInputEl) {
          try {
            activeInputEl = await aiPage.waitForSelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"], textarea', { timeout: 4e3 });
          } catch {
          }
        }
        if (onStatus) onStatus("\u0110ang \u0111i\u1EC1n prompt ti\u1EBFp theo v\xE0o \xF4 chat...");
        if (activeInputEl) {
          await activeInputEl.click();
          await aiPage.waitForTimeout(200);
          await aiPage.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
          await aiPage.keyboard.press("Backspace");
          await aiPage.waitForTimeout(150);
          let insertedSuccess = false;
          if (activeSelector) {
            insertedSuccess = await aiPage.evaluate(({ selector, text }) => {
              const target = document.querySelector(selector);
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
                document.execCommand("insertText", false, text);
                target.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, inputType: "insertText", data: text }));
                target.dispatchEvent(new Event("change", { bubbles: true }));
              } catch (e) {
              }
              const l = (target.textContent || target.innerText || target.value || "").trim().length;
              return l > 10;
            }, { selector: activeSelector, text: promptText2 }).catch(() => false);
          }
          if (!insertedSuccess) {
            await activeInputEl.focus();
            await aiPage.keyboard.insertText(promptText2);
            await aiPage.waitForTimeout(300);
          }
          await aiPage.evaluate((el) => {
            el.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }, activeInputEl).catch(() => {
          });
        } else {
          await aiPage.keyboard.insertText(promptText2);
        }
        await aiPage.waitForTimeout(600);
        const sendBtns = [
          'button[data-testid="fruitjuice-send-button"]',
          'button[data-testid="send-button"]',
          'button[aria-label*="Send message" i]',
          'button[aria-label*="G\u1EEDi tin nh\u1EAFn" i]',
          'button[aria-label*="Send Message" i]',
          'button[aria-label*="Send prompt" i]',
          'button[aria-label*="G\u1EEDi c\xE2u nh\u1EAFc" i]',
          'button[aria-label*="Send" i]',
          'button[aria-label*="G\u1EEDi" i]',
          'div[role="button"][aria-label*="Send" i]',
          'div[role="button"][aria-label*="G\u1EEDi" i]',
          "button.send-button",
          'button[type="submit"]',
          'mat-icon[fonticon="send"]'
        ];
        const triggerSend = async () => {
          for (const sel of sendBtns) {
            try {
              const btn = await aiPage.$(sel);
              if (btn && await btn.isVisible()) {
                await btn.click({ force: true });
                return true;
              }
            } catch {
            }
          }
          if (activeInputEl) {
            try {
              await activeInputEl.focus();
              await aiPage.keyboard.press("Enter");
              return true;
            } catch {
            }
          }
          await aiPage.keyboard.press("Enter");
          return false;
        };
        await triggerSend();
        for (let checkAttempt = 0; checkAttempt < 5; checkAttempt++) {
          await aiPage.waitForTimeout(1200);
          const dispatchState = await aiPage.evaluate((initCount) => {
            const stopBtn = document.querySelector(
              'button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="D\u1EEBng" i]'
            );
            const hasStop = stopBtn ? stopBtn.offsetParent !== null || stopBtn.getAttribute("aria-hidden") !== "true" : false;
            const blocks = document.querySelectorAll(
              'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
            );
            const newBlock = blocks.length > initCount;
            return hasStop || newBlock;
          }, initialAssistantCount).catch(() => false);
          if (dispatchState) {
            break;
          }
          if (onStatus) onStatus(`\u0110ang x\xE1c nh\u1EADn g\u1EEDi l\u1EC7nh L\u01B0\u1EE3t 2 sang AI (th\u1EED l\u1EA1i l\u1EA7n ${checkAttempt + 1})...`);
          await triggerSend();
        }
        if (onStatus) onStatus("AI \u0111ang ph\xE2n t\xEDch v\xE0 xu\u1EA5t m\xE3 Python...");
        await aiPage.waitForTimeout(2500);
        let checkCount2 = 0;
        let lastLength = 0;
        let stable = 0;
        let hasStarted = false;
        while (checkCount2 < 180) {
          await aiPage.waitForTimeout(2e3);
          checkCount2++;
          const state = await aiPage.evaluate((initCount) => {
            const isStop = document.querySelector(
              'button[data-testid="stop-button"], button[data-testid*="stop" i], button[aria-label*="Stop" i], button[aria-label*="D\u1EEBng" i], button[aria-label*="Stop generating" i]'
            );
            const stopVisible = isStop ? isStop.offsetParent !== null || isStop.getAttribute("aria-hidden") !== "true" : false;
            const blocks = document.querySelectorAll(
              'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
            );
            const newBlockExists = blocks.length > initCount;
            const last = blocks[blocks.length - 1];
            const len = last ? (last.textContent || "").length : 0;
            return { stopVisible, newBlockExists, len, blockCount: blocks.length };
          }, initialAssistantCount).catch(() => ({ stopVisible: false, newBlockExists: false, len: 0, blockCount: 0 }));
          if (state.stopVisible || state.newBlockExists) {
            hasStarted = true;
          }
          if (hasStarted) {
            if (onStatus && state.len > 0) {
              onStatus(`AI \u0111ang xu\u1EA5t m\xE3 Python (${state.len} k\xFD t\u1EF1)...`);
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
        const extracted = await aiPage.evaluate((initCount) => {
          const containers = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown'
          );
          if (containers.length <= initCount) {
            return null;
          }
          const targetContainer = containers[containers.length - 1];
          const codeBlocks = targetContainer.querySelectorAll(
            "pre code, .code-block code, code, pre"
          );
          for (let i = codeBlocks.length - 1; i >= 0; i--) {
            const txt = codeBlocks[i].textContent || "";
            if ((txt.includes("from manim import") || txt.includes("class ")) && (txt.includes("Scene") || txt.includes("construct"))) {
              return txt;
            }
          }
          const allText = targetContainer.innerText || targetContainer.textContent || "";
          const match = allText.match(/```(?:python|py)?\s*([\s\S]*?)```/i);
          if (match && (match[1].includes("class ") || match[1].includes("Scene") || match[1].includes("construct"))) {
            return match[1];
          }
          const fallback = allText.match(/from manim import[\s\S]*?(?:self\.wait\(\d+\)|def construct[\s\S]*)/);
          if (fallback) return fallback[0];
          return null;
        }, initialAssistantCount);
        return extracted ? _AutomationRunner.prepareManimPythonCode(extracted) : null;
      };
      const promptText = options.prompt || "";
      const isManimTask = promptText.includes("Manim") || promptText.includes("Scene") || promptText.includes("scene.py") || promptText.includes("from manim import") || promptText.includes("VOICEOVER_SCRIPT") || promptText.includes("K\u1ECACH B\u1EA2N S\u01AF PH\u1EA0M");
      const isScriptTask = promptText.includes("K\u1ECACH B\u1EA2N VIDEO") || promptText.includes("B\u1EA2NG PH\xC2N C\u1EA2NH") || promptText.includes("Storyboard");
      if (isManimTask) {
        onProgress({
          step: "EXTRACTING_LATEX",
          progress: 65,
          message: "\u0110ang b\xF3c t\xE1ch m\xE3 ngu\u1ED3n Python Manim (scene.py)..."
        });
        let extractedPython = await aiPage.evaluate(() => {
          const containers = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown'
          );
          const targetContainer = containers.length > 0 ? containers[containers.length - 1] : document.body;
          const codeBlocks = targetContainer.querySelectorAll(
            "pre code, .code-block code, code"
          );
          for (let i = codeBlocks.length - 1; i >= 0; i--) {
            const txt = codeBlocks[i].textContent || "";
            if (txt.includes("from manim import") || txt.includes("class ") || txt.includes("Scene")) {
              return txt;
            }
          }
          const allText = targetContainer.innerText || targetContainer.textContent || "";
          const match = allText.match(/```(?:python)?\s*([\s\S]*?)```/);
          if (match && (match[1].includes("from manim import") || match[1].includes("Scene"))) {
            return match[1];
          }
          const fallback = allText.match(/from manim import[\s\S]*?(?:self\.wait\(\d+\)|def construct)/);
          if (fallback) return fallback[0];
          return null;
        });
        const hasValidManimCode = extractedPython && extractedPython.includes("class ") && (extractedPython.includes("Scene") || extractedPython.includes("construct"));
        if (!hasValidManimCode) {
          onProgress({
            step: "SENDING_PROMPT",
            progress: 66,
            message: "\u2713 [L\u01B0\u1EE3t 1/2] \u0110\xE3 duy\u1EC7t K\u1ECBch b\u1EA3n S\u01B0 ph\u1EA1m & L\u1EDDi tho\u1EA1i! \u0110ang t\u1EF1 \u0111\u1ED9ng g\u1EEDi [L\u01B0\u1EE3t 2/2] \u0111\u1EC3 AI xu\u1EA5t to\xE0n b\u1ED9 m\xE3 Manim Python..."
          });
          const isVertical = options.prompt.includes("9:16") || options.prompt.includes("D\u1ECCC");
          const qualityFlag = "-qh";
          const codeFollowupPrompt = `Tuy\u1EC7t v\u1EDDi! D\u1EF1a tr\xEAn k\u1ECBch b\u1EA3n s\u01B0 ph\u1EA1m v\xE0 kh\u1ED1i l\u1EDDi tho\u1EA1i VOICEOVER_SCRIPT v\u1EEBa th\u1ED1ng nh\u1EA5t \u1EDF tr\xEAn, h\xE3y vi\u1EBFt TO\xC0N B\u1ED8 file m\xE3 ngu\u1ED3n Manim Python (\`scene.py\`) ho\xE0n ch\u1EC9nh 100% \u0111\u1EC3 render video b\xE0i gi\u1EA3ng n\xE0y.

Y\xCAU C\u1EA6U K\u1EF8 THU\u1EACT B\u1EAET BU\u1ED8C (TU\xC2N TH\u1EE6 B\u1ED8 NGUY\xCAN T\u1EAEC VISUAL ENGINEERING & DUAL-ZONE CONTAINER CARDS):
1. K\u1EBF th\u1EEBa ch\xEDnh x\xE1c bi\u1EBFn VOICEOVER_SCRIPT (~140-160 t\u1EEB) v\xE0 4 ph\xE2n c\u1EA3nh \u0111\xE3 duy\u1EC7t (1. Intro, 2. L\xFD thuy\u1EBFt, 3. M\xF4 ph\u1ECFng & Bi\u1EBFn \u0111\u1ED5i LaTeX, 4. Outro).
2. C\u1EA5u h\xECnh ${isVertical ? "Khung h\xECnh D\u1ECCC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)" : "Khung h\xECnh NGANG 16:9 (1920x1080, config.frame_width=14.22, config.frame_height=8.0)"}.
3. 100% C\xD4NG TH\u1EE8C LATEX HO\xC0N H\u1EA2O (PERFECT LATEX):
   - M\u1ECCI c\xF4ng th\u1EE9c, ph\u01B0\u01A1ng tr\xECnh, bi\u1EBFn s\u1ED1 b\u1EAFt bu\u1ED9c d\xF9ng MathTex(r"...") v\u1EDBi raw string r"...".
   - Ph\xE2n s\u1ED1 \\frac{a}{b}, c\u0103n th\u1EE9c \\sqrt{x}, t\xEDch ph\xE2n \\int, \u0111\u1EA1o h\xE0m \\frac{df}{dx}, vector \\vec{u}.
   - Bi\u1EBFn \u0111\u1ED5i to\xE1n h\u1ECDc nhi\u1EC1u d\xF2ng d\xF9ng m\xF4i tr\u01B0\u1EDDng aligned: MathTex(r"\\begin{aligned} ... &= ... \\\\ &= ... \\end{aligned}").
   - \u0110\xF3ng khung n\u1ED5i b\u1EADt \u0111\xE1p s\u1ED1 / k\u1EBFt qu\u1EA3 cu\u1ED1i c\xF9ng: SurroundingRectangle(result, color=GREEN, buff=0.2, corner_radius=0.12).
   - Tuy\u1EC7t \u0111\u1ED1i KH\xD4NG vi\u1EBFt ti\u1EBFng Vi\u1EC7t c\xF3 d\u1EA5u tr\u1EF1c ti\u1EBFp trong MathTex; ti\u1EBFng Vi\u1EC7t d\xF9ng Text("...", font="Times New Roman").
4. M\xD4 PH\u1ECENG TO\xC1N H\u1ECCC TR\u1EF0C QUAN SINH \u0110\u1ED8NG (VISUAL SIMULATION):
   - Ph\xE2n c\u1EA3nh gi\u1EA3i to\xE1n B\u1EAET BU\u1ED8C c\xF3 m\xF4 ph\u1ECFng h\xECnh \u1EA3nh \u0111\u1ED9ng: H\u1EC7 tr\u1EE5c t\u1ECDa \u0111\u1ED9 Axes, \u0111\u1ED3 th\u1ECB axes.plot(...), \u0111i\u1EC3m Dot di chuy\u1EC3n tr\xEAn \u0111\u01B0\u1EDDng cong b\u1EB1ng ValueTracker, ti\u1EBFp tuy\u1EBFn ho\u1EB7c h\xECnh h\u1ECDc/vector. Tuy\u1EC7t \u0111\u1ED1i kh\xF4ng ch\u1EC9 hi\u1EC3n th\u1ECB c\xE1c d\xF2ng ch\u1EEF t\u0129nh!
5. B\u1ED0 C\u1EE4C KHUNG TH\u1EBA CONTAINER (DUAL-ZONE) L\u1EA4P \u0110\u1EA6Y 93% M\xC0N H\xCCNH (TRI\u1EC6T TI\xCAU KHO\u1EA2NG TR\u1ED0NG \u0110EN):
   - ${isVertical ? "Header Bar (y ~ 7.05, height=1.3, width=8.5, ti\xEAu \u0111\u1EC1 font_size=30-34 BOLD); Top Card (y ~ 3.15, height=6.4, width=8.5, ti\xEAu \u0111\u1EC1 font_size=24, axes x_length=7.2, y_length=4.4); Bottom Card (y ~ -3.75, height=6.6, width=8.5, ti\xEAu \u0111\u1EC1 font_size=24, MathTex font_size=28-34, di\u1EC5n gi\u1EA3i font_size=22-26, b\u1EA3ng bi\u1EBFn thi\xEAn font_size=24-28). TUY\u1EC6T \u0110\u1ED0I KH\xD4NG \u0111\u1EC3 kho\u1EA3ng tr\u1ED1ng \u0111en th\u1EEBa!" : "Header \u0111\u1EC9nh m\xE0n h\xECnh, C\u1ED9t Tr\xE1i M\xF4 ph\u1ECFng \u0110\u1ED3 th\u1ECB (width=7.2, height=6.2), C\u1ED9t Ph\u1EA3i L\u1EDDi gi\u1EA3i LaTeX (width=5.8, height=6.2)."}.
   - B\u1EAET BU\u1ED8C font_size l\u1EDBn r\xF5 n\xE9t (Ti\xEAu \u0111\u1EC1 30-34, Th\u1EBB 24, MathTex 28-34, Text ti\u1EBFng Vi\u1EC7t 22-26, C\u1EA4M D\xD9NG FONT_SIZE D\u01AF\u1EDAI 22).
6. NH\u1ECAP \u0110I\u1EC6U TH\u1ECA GI\xC1C & CHUY\u1EC2N C\u1EA2NH M\u01AF\u1EE2T M\xC0:
   - D\xF9ng TransformMatchingTex khi bi\u1EBFn \u0111\u1ED5i c\xF4ng th\u1EE9c \u0111\u1EA1i s\u1ED1.
   - D\xF9ng LaggedStart khi xu\u1EA5t hi\u1EC7n danh s\xE1ch ho\u1EB7c c\xE1c ph\u1EA7n t\u1EED n\u1ED1i ti\u1EBFp.
   - C\xF3 kho\u1EA3ng d\u1EEBng self.wait(1.5 \u0111\u1EBFn 2.5s) sau c\xE1c c\xF4ng th\u1EE9c tr\u1ECDng t\xE2m \u0111\u1EC3 ng\u01B0\u1EDDi xem k\u1ECBp quan s\xE1t.
7. M\xE0u n\u1EC1n "#0F172A", to\xE0n b\u1ED9 Text d\xF9ng font="Times New Roman".
8. C\u1EA3nh Outro: Th\u1EBB Card t\u1ED5ng k\u1EBFt to\xE0n m\xE0n h\xECnh (height=13.8, width=8.5), gi\u1EEF nguy\xEAn m\xE0n h\xECnh (self.wait(3.0)), TUY\u1EC6T \u0110\u1ED0I KH\xD4NG D\xD9NG FadeOut(*self.mobjects) l\xE0m \u0111en m\xE0n h\xECnh.
9. TUY\u1EC6T \u0110\u1ED0I CH\u1EC8 XU\u1EA4T DUY NH\u1EA4T 1 KH\u1ED0I M\xC3 PYTHON trong \`\`\`python ... \`\`\`, kh\xF4ng vi\u1EBFt b\u1EA5t k\u1EF3 l\u1EDDi ch\xE0o hay gi\u1EA3i th\xEDch ngo\xE0i m\xE3.
L\u1EC7nh render cu\u1ED1i file: \`manim ${qualityFlag} scene.py MainScene\`.`;
          const turn2Python = await sendFollowupPromptAndGetPython(codeFollowupPrompt, (msg) => {
            onProgress({
              step: "WAITING_GEMINI",
              progress: 68,
              message: `[L\u01B0\u1EE3t 2/2] ${msg}`
            });
          });
          if (turn2Python && (turn2Python.includes("class ") || turn2Python.includes("def construct"))) {
            extractedPython = turn2Python;
            onProgress({
              step: "EXTRACTING_LATEX",
              progress: 70,
              message: "\u2713 [L\u01B0\u1EE3t 2/2] \u0110\xE3 nh\u1EADn m\xE3 Python Manim CE! Chu\u1EA9n b\u1ECB render video MP4..."
            });
          } else {
            onProgress({
              step: "ERROR",
              progress: 0,
              message: "\u26A0\uFE0F L\u01B0\u1EE3t 2 ch\u01B0a nh\u1EADn \u0111\u01B0\u1EE3c m\xE3 Python Manim CE h\u1EE3p l\u1EC7 t\u1EEB AI. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i ph\u1EA3n h\u1ED3i tr\xEAn giao di\u1EC7n AI.",
              error: "AI did not return valid Manim Python code in Turn 2"
            });
            return;
          }
        }
        let finalPython = extractedPython || "";
        if (!finalPython || !finalPython.includes("class ") && !finalPython.includes("def construct")) {
          onProgress({
            step: "ERROR",
            progress: 0,
            message: "\u26A0\uFE0F Kh\xF4ng t\xECm th\u1EA5y class Manim Scene h\u1EE3p l\u1EC7 trong m\xE3 ngu\u1ED3n b\xF3c t\xE1ch.",
            error: "No valid Manim Scene found"
          });
          return;
        }
        finalPython = _AutomationRunner.prepareManimPythonCode(finalPython);
        const sceneFileName = "scene.py";
        const sceneFilePath = import_path.default.join(outputDirectory, sceneFileName);
        import_fs.default.writeFileSync(sceneFilePath, finalPython, "utf-8");
        const renderShPath = import_path.default.join(outputDirectory, "render_manim.sh");
        const renderShContent = `#!/usr/bin/env bash
set -e
echo "========================================================"
echo "  \u{1F4D0} YUTA MANIM STUDIO - RENDER 1-CLICK"
echo "========================================================"
if ! command -v manim &> /dev/null; then
  echo "[ERROR] Ch\u01B0a c\xE0i \u0111\u1EB7t Manim CE! Vui l\xF2ng c\xE0i: pip install manim"
  exit 1
fi
echo "\u0110ang render scene.py (1080p 60fps)..."
manim -qh scene.py MainScene
TARGET=$(find media/videos/scene -name "MainScene.mp4" 2>/dev/null | sort -r | head -n 1)
if [ -n "$TARGET" ]; then
  xdg-open "$TARGET" 2>/dev/null || open "$TARGET" 2>/dev/null || true
else
  xdg-open media/videos/scene/1080p60/MainScene.mp4 2>/dev/null || open media/videos/scene/1080p60/MainScene.mp4 2>/dev/null || true
fi
`;
        import_fs.default.writeFileSync(renderShPath, renderShContent, { encoding: "utf-8", mode: 493 });
        const renderBatPath = import_path.default.join(outputDirectory, "render_manim.bat");
        const renderBatContent = `@echo off
chcp 65001 >nul
title Yuta Manim Studio - Render 1-Click
echo Dang render scene.py (1080p 60fps)...
manim -qh scene.py MainScene
if exist "media\\videos\\scene\\1920p60\\MainScene.mp4" (
  start "" "media\\videos\\scene\\1920p60\\MainScene.mp4"
) else if exist "media\\videos\\scene\\1080p60\\MainScene.mp4" (
  start "" "media\\videos\\scene\\1080p60\\MainScene.mp4"
) else (
  start "" "media\\videos\\scene\\1920p15\\MainScene.mp4"
)
pause
`;
        import_fs.default.writeFileSync(renderBatPath, renderBatContent, "utf-8");
        let sceneClass = "MainScene";
        const sceneMatch = finalPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
        if (sceneMatch && sceneMatch[1]) {
          sceneClass = sceneMatch[1];
        }
        const manimBin = await _AutomationRunner.ensureManimEnvironment((msg) => {
          onProgress({
            step: "RENDERING_VIDEO",
            progress: 72,
            message: msg,
            manimCode: finalPython,
            contentType: "manim"
          });
        });
        if (manimBin) {
          const compileAndHealManimCode = async ({
            initialPython,
            workingDir,
            targetSceneFilePath,
            episodeLabel = "",
            maxAttempts = 5
          }) => {
            let currentPython = initialPython;
            let renderSuccess = false;
            let lastError = "";
            let finalMp4 = "";
            const mediaDir = import_path.default.join(workingDir, "media");
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              currentPython = _AutomationRunner.prepareManimPythonCode(currentPython);
              import_fs.default.writeFileSync(targetSceneFilePath, currentPython, "utf-8");
              let sceneClass2 = "MainScene";
              const sceneMatch2 = currentPython.match(/class\s+([A-Za-z0-9_]+)\s*\(\s*(?:ThreeDScene|MovingCameraScene|LinearTransformationScene|VectorScene|ZoomedScene|Scene)\s*\)/);
              if (sceneMatch2 && sceneMatch2[1]) sceneClass2 = sceneMatch2[1];
              await _AutomationRunner.autoInstallMissingDependencies(currentPython, (msg) => {
                onProgress({
                  step: "RENDERING_VIDEO",
                  progress: 74,
                  message: `${episodeLabel ? `[${episodeLabel}] ` : ""}${msg}`,
                  manimCode: currentPython,
                  contentType: "manim"
                });
              });
              onProgress({
                step: "RENDERING_VIDEO",
                progress: Math.min(95, 75 + (attempt - 1) * 4),
                message: attempt === 1 ? `${episodeLabel ? `[${episodeLabel}] ` : ""}\u0110ang bi\xEAn d\u1ECBch Manim CE (${sceneClass2})...` : `\u26A0\uFE0F ${episodeLabel ? `[${episodeLabel}] ` : ""}\u0110ang bi\xEAn d\u1ECBch l\u1EA1i sau khi AI s\u1EEDa m\xE3 (L\u1EA7n ${attempt}/${maxAttempts})...`,
                manimCode: currentPython,
                latexCode: currentPython,
                filePath: targetSceneFilePath,
                contentType: "manim"
              });
              const renderResult = await new Promise((resolve) => {
                const proc = (0, import_child_process.spawn)(manimBin, ["-qm", "--media_dir", mediaDir, targetSceneFilePath, sceneClass2], {
                  cwd: workingDir
                });
                this.childProc = proc;
                let stdout = "";
                let stderr = "";
                proc.stdout.on("data", (d) => {
                  stdout += d.toString();
                });
                proc.stderr.on("data", (d) => {
                  const s = d.toString();
                  stderr += s;
                  const match = s.match(/(\d+)%/);
                  if (match) {
                    const pct = Math.min(96, 75 + Math.floor(parseInt(match[1], 10) * 0.2));
                    onProgress({
                      step: "RENDERING_VIDEO",
                      progress: pct,
                      message: `${episodeLabel ? `[${episodeLabel}] ` : ""}\u0110ang render video Manim: ${match[1]}%...`,
                      manimCode: currentPython,
                      contentType: "manim"
                    });
                  }
                });
                proc.on("close", (code) => {
                  this.childProc = null;
                  if (code === 0) {
                    const newestMp4 = _AutomationRunner.findNewestMp4(mediaDir);
                    if (newestMp4) {
                      resolve({ success: true, mp4Path: newestMp4 });
                      return;
                    }
                  }
                  const parsedErr = _AutomationRunner.parseManimError(stderr, stdout, workingDir);
                  resolve({ success: false, error: parsedErr.summary, detailsForAI: parsedErr.detailsForAI });
                });
                proc.on("error", (err) => {
                  this.childProc = null;
                  resolve({ success: false, error: err.message, detailsForAI: err.message });
                });
              });
              if (renderResult.success && renderResult.mp4Path) {
                renderSuccess = true;
                finalMp4 = renderResult.mp4Path;
                break;
              }
              lastError = renderResult.error || "L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh";
              const detailsForAI = renderResult.detailsForAI || lastError;
              const missingMatch = (detailsForAI + " " + lastError).match(/ModuleNotFoundError:\s*No module named\s*['"]([a-zA-Z0-9_-]+)['"]/i) || (detailsForAI + " " + lastError).match(/No module named\s*['"]([a-zA-Z0-9_-]+)['"]/i);
              if (missingMatch && missingMatch[1] && attempt < maxAttempts) {
                const missingLib = missingMatch[1];
                onProgress({
                  step: "RENDERING_VIDEO",
                  progress: 76,
                  message: `${episodeLabel ? `[${episodeLabel}] ` : ""}Ph\xE1t hi\u1EC7n thi\u1EBFu th\u01B0 vi\u1EC7n "${missingLib}", \u0111ang c\xE0i \u0111\u1EB7t...`,
                  manimCode: currentPython,
                  contentType: "manim"
                });
                const installed = await _AutomationRunner.installPythonPackage(missingLib);
                if (installed) continue;
              }
              const isLatexError = /latex error|compiler error|Unicode character|dvi|tex_file_writing|ValueError:\s*latex/i.test(detailsForAI + " " + lastError);
              if (isLatexError && attempt < maxAttempts) {
                const sanitized = _AutomationRunner.sanitizeLatexVietnamese(currentPython);
                if (sanitized !== currentPython) {
                  onProgress({
                    step: "RENDERING_VIDEO",
                    progress: 76,
                    message: `${episodeLabel ? `[${episodeLabel}] ` : ""}T\u1EF1 \u0111\u1ED9ng chu\u1EA9n h\xF3a k\xFD t\u1EF1 ti\u1EBFng Vi\u1EC7t trong LaTeX...`,
                    manimCode: currentPython,
                    contentType: "manim"
                  });
                  currentPython = sanitized;
                  continue;
                }
              }
              if (attempt < maxAttempts && aiPage && !aiPage.isClosed()) {
                onProgress({
                  step: "RENDERING_VIDEO",
                  progress: 77,
                  message: `\u26A0\uFE0F ${episodeLabel ? `[${episodeLabel}] ` : ""}L\u1ED7i render: ${lastError.slice(0, 85)}... \u0110ang g\u1EEDi log \u0111\u1EC3 AI s\u1EEDa m\xE3 (L\u1EA7n ${attempt + 1}/${maxAttempts})...`,
                  manimCode: currentPython,
                  contentType: "manim"
                });
                const healPrompt = `M\xE3 ngu\u1ED3n Manim scene.py b\u1EA1n v\u1EEBa t\u1EA1o khi bi\xEAn d\u1ECBch b\u1EB1ng Manim CE g\u1EB7p l\u1ED7i sau:
--------------------------------------------------
${detailsForAI}
--------------------------------------------------

Y\xCAU C\u1EA6U B\u1EAET BU\u1ED8C \u0110\u1EC2 S\u1EECA L\u1ED6I:
1. \u0110\u1ECDc k\u1EF9 v\u1ECB tr\xED d\xF2ng l\u1ED7i v\xE0 ch\u1EC9 d\u1EABn s\u1EEDa l\u1ED7i \u1EDF tr\xEAn \u0111\u1EC3 kh\u1EAFc ph\u1EE5c tri\u1EC7t \u0111\u1EC3.
2. Vi\u1EBFt l\u1EA1i TO\xC0N B\u1ED8 file scene.py ho\xE0n ch\u1EC9nh, ng\u1EAFn g\u1ECDn s\xFAc t\xEDch.
3. \u0110\u1EA3m b\u1EA3o \u0111\xF3ng \u0111\u1EA7y \u0111\u1EE7 m\u1ECDi d\u1EA5u ngo\u1EB7c, k\u1EBFt th\xFAc h\xE0m construct(self) b\u1EB1ng self.wait(3).
4. Gi\u1EEF nguy\xEAn class MainScene(Scene) ho\u1EB7c t\xEAn Scene t\u01B0\u01A1ng \u1EE9ng, c\u1EA5u h\xECnh Dual-Zone l\u1EA5p \u0111\u1EA7y 93% m\xE0n h\xECnh (height 6.4 v\xE0 6.6), c\u1EE1 ch\u1EEF l\u1EDBn d\u1EC5 \u0111\u1ECDc (MathTex font_size=28-34, Text font_size=22-26, Ti\xEAu \u0111\u1EC1 30-34).
5. TUY\u1EC6T \u0110\u1ED0I CH\u1EC8 XU\u1EA4T DUY NH\u1EA4T 1 KH\u1ED0I M\xC3 PYTHON trong \`\`\`python ... \`\`\`, KH\xD4NG vi\u1EBFt l\u1EDDi ch\xE0o hay gi\u1EA3i th\xEDch ngo\xE0i m\xE3.`;
                const healedCode = await sendFollowupPromptAndGetPython(healPrompt, (m) => {
                  onProgress({
                    step: "RENDERING_VIDEO",
                    progress: 78,
                    message: `${episodeLabel ? `[${episodeLabel}] ` : ""}${m}`,
                    manimCode: currentPython,
                    contentType: "manim"
                  });
                });
                if (healedCode && healedCode.length > 50) {
                  currentPython = _AutomationRunner.prepareManimPythonCode(healedCode);
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
          const isPlaylistTask = isManimTask && (options.prompt.includes("PLAYLIST") || options.prompt.includes("CHU\u1ED6I") || options.prompt.includes("T\u1EACP TRONG CHU\u1ED6I PLAYLIST") || options.isSeries === true);
          if (!isPlaylistTask) {
            const healResult = await compileAndHealManimCode({
              initialPython: finalPython,
              workingDir: outputDirectory,
              targetSceneFilePath: sceneFilePath,
              maxAttempts: 5
            });
            if (healResult.success && healResult.mp4Path) {
              let finalVideoSource = healResult.mp4Path;
              let audioPath = null;
              let audioUrl = null;
              if (options.enableVoice === true) {
                onProgress({
                  step: "RENDERING_VIDEO",
                  progress: 96,
                  message: "\u0110ang kh\u1EDFi t\u1EA1o gi\u1ECDng \u0111\u1ECDc AI v\xE0 \u0111\u1ED3ng b\u1ED9 \xE2m thanh...",
                  contentType: "manim"
                });
                const voiceRes = await _AutomationRunner.generateVoiceoverAndMux({
                  mp4Path: healResult.mp4Path,
                  pythonCode: healResult.pythonCode,
                  workingDir: outputDirectory,
                  voiceName: options.voiceName || "vi-VN-HoaiMyNeural",
                  voiceSpeed: options.voiceSpeed || "+0%",
                  fallbackTopic: options.topic,
                  onStatus: (msg) => {
                    onProgress({
                      step: "RENDERING_VIDEO",
                      progress: 97,
                      message: msg,
                      contentType: "manim"
                    });
                  }
                });
                if (voiceRes.success && voiceRes.mp4Path) {
                  finalVideoSource = voiceRes.mp4Path;
                }
                if (voiceRes.audioPath && import_fs.default.existsSync(voiceRes.audioPath)) {
                  audioPath = voiceRes.audioPath;
                  audioUrl = `/downloads/${import_path.default.basename(voiceRes.audioPath)}`;
                }
              }
              const videoFileName = `video_${Date.now()}.mp4`;
              const finalVideoPath = import_path.default.join(outputDirectory, videoFileName);
              import_fs.default.copyFileSync(finalVideoSource, finalVideoPath);
              onProgress({
                step: "COMPLETED",
                progress: 100,
                message: audioPath ? "\u{1F389} Ho\xE0n t\u1EA5t 1-Click! Video MP4 k\xE8m thuy\u1EBFt minh gi\u1ECDng \u0111\u1ECDc AI \u0111\xE3 s\u1EB5n s\xE0ng." : "\u{1F389} Ho\xE0n t\u1EA5t 1-Click! Video MP4 \u0111\xE3 render xong s\u1EB5n s\xE0ng xem ngay.",
                manimCode: healResult.pythonCode,
                latexCode: healResult.pythonCode,
                filePath: sceneFilePath,
                videoPath: finalVideoPath,
                videoUrl: `/downloads/${videoFileName}`,
                audioPath: audioPath || void 0,
                audioUrl: audioUrl || void 0,
                contentType: "manim"
              });
              return;
            } else {
              onProgress({
                step: "COMPLETED",
                progress: 100,
                message: `\u0110\xE3 l\u01B0u scene.py! L\u1ED7i render Manim sau c\xE1c l\u1EA7n th\u1EED: ${healResult.error.slice(0, 120)}`,
                manimCode: healResult.pythonCode,
                latexCode: healResult.pythonCode,
                filePath: sceneFilePath,
                contentType: "manim"
              });
              return;
            }
          } else {
            let seriesCount = options.seriesCount || 3;
            const countMatch = options.prompt.match(/GỒM ĐÚNG\s*(\d+)\s*TẬP/i) || options.prompt.match(/(\d+)\s*tập/i);
            if (countMatch && countMatch[1]) {
              seriesCount = Math.min(10, Math.max(2, parseInt(countMatch[1], 10)));
            }
            const playlistSlug = `Playlist_${Date.now()}`;
            const playlistDir = import_path.default.join(outputDirectory, playlistSlug);
            if (!import_fs.default.existsSync(playlistDir)) import_fs.default.mkdirSync(playlistDir, { recursive: true });
            const playlistVideos = [];
            for (let ep = 1; ep <= seriesCount; ep++) {
              const epLabel = `T\u1EADp ${ep}/${seriesCount}`;
              let epPython = "";
              if (ep === 1) {
                epPython = finalPython;
              } else {
                onProgress({
                  step: "WAITING_GEMINI",
                  progress: Math.floor((ep - 1) / seriesCount * 95),
                  message: `\u0110ang y\xEAu c\u1EA7u AI vi\u1EBFt m\xE3 ngu\u1ED3n Manim cho [${epLabel}]...`,
                  contentType: "manim"
                });
                const nextEpPrompt = `T\u1EADp ${ep - 1} \u0111\xE3 ho\xE0n th\xE0nh xu\u1EA5t s\u1EAFc. B\xE2y gi\u1EDD h\xE3y vi\u1EBFt ti\u1EBFp m\xE3 Python Manim CE ho\xE0n ch\u1EC9nh cho T\u1EACP ${ep} tr\xEAn t\u1ED5ng s\u1ED1 ${seriesCount} t\u1EADp c\u1EE7a chuy\xEAn \u0111\u1EC1 n\xE0y.
Y\xCAU C\u1EA6U CHO T\u1EACP ${ep}:
- M\xE0n h\xECnh g\xF3c tr\xEAn hi\u1EC3n th\u1ECB: Text("T\u1EADp ${ep}/${seriesCount}", font_size=18, color=GRAY_B).
- N\u1ED9i dung ti\u1EBFp n\u1ED1i m\u1EA1ch t\u01B0 duy c\u1EE7a t\u1EADp tr\u01B0\u1EDBc, tr\u1EF1c quan v\xE0 ch\u1EA1y \u0111\u01B0\u1EE3c 100% kh\xF4ng l\u1ED7i.
- Tu\xE2n th\u1EE7 to\xE0n b\u1ED9 c\xE1c quy chu\u1EA9n Manim Skills v\u1EC1 b\u1ED1 c\u1EE5c v\xE0 an to\xE0n code.
- Ch\u1EC9 tr\u1EA3 v\u1EC1 duy nh\u1EA5t kh\u1ED1i m\xE3 ngu\u1ED3n \`\`\`python ... \`\`\`.`;
                const resPython = await sendFollowupPromptAndGetPython(nextEpPrompt, (m) => {
                  onProgress({
                    step: "WAITING_GEMINI",
                    progress: Math.floor((ep - 1) / seriesCount * 95),
                    message: `[${epLabel}] ${m}`,
                    contentType: "manim"
                  });
                });
                epPython = resPython || finalPython;
              }
              const epSceneFile = import_path.default.join(playlistDir, `scene_tap_${ep}.py`);
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
                  onProgress({
                    step: "RENDERING_VIDEO",
                    progress: Math.floor(ep / seriesCount * 94),
                    message: `[${epLabel}] \u0110ang t\u1ED5ng h\u1EE3p gi\u1ECDng \u0111\u1ECDc AI v\xE0 l\u1ED3ng ti\u1EBFng...`,
                    contentType: "manim"
                  });
                  const voiceRes = await _AutomationRunner.generateVoiceoverAndMux({
                    mp4Path: healResult.mp4Path,
                    pythonCode: healResult.pythonCode,
                    workingDir: playlistDir,
                    voiceName: options.voiceName || "vi-VN-HoaiMyNeural",
                    voiceSpeed: options.voiceSpeed || "+0%",
                    fallbackTopic: `T\u1EADp ${ep}: ${options.topic || "B\xE0i gi\u1EA3ng"}`,
                    onStatus: (msg) => {
                      onProgress({
                        step: "RENDERING_VIDEO",
                        progress: Math.floor(ep / seriesCount * 94),
                        message: `[${epLabel}] ${msg}`,
                        contentType: "manim"
                      });
                    }
                  });
                  if (voiceRes.success && voiceRes.mp4Path) {
                    epVideoSource = voiceRes.mp4Path;
                  }
                  if (voiceRes.audioPath && import_fs.default.existsSync(voiceRes.audioPath)) {
                    epAudioPath = voiceRes.audioPath;
                    epAudioUrl = `/downloads/${playlistSlug}/${import_path.default.basename(voiceRes.audioPath)}`;
                  }
                }
                const epVideoName = `Tap_${String(ep).padStart(2, "0")}.mp4`;
                const epVideoPath = import_path.default.join(playlistDir, epVideoName);
                import_fs.default.copyFileSync(epVideoSource, epVideoPath);
                playlistVideos.push({
                  episode: ep,
                  title: `T\u1EADp ${ep}: Chuy\xEAn \u0111\u1EC1 ${options.topic || "B\xE0i gi\u1EA3ng"}`,
                  videoUrl: `/downloads/${playlistSlug}/${epVideoName}`,
                  videoPath: epVideoPath,
                  audioUrl: epAudioUrl || void 0,
                  audioPath: epAudioPath || void 0
                });
                onProgress({
                  step: "RENDERING_VIDEO",
                  progress: Math.floor(ep / seriesCount * 95),
                  message: `\u2713 \u0110\xE3 ho\xE0n th\xE0nh xu\u1EA5t s\u1EAFc [${epLabel}]${epAudioPath ? " (k\xE8m l\u1ED3ng ti\u1EBFng AI)" : ""}!`,
                  playlistVideos,
                  isSeries: true,
                  seriesCount,
                  currentEpisode: ep,
                  contentType: "manim"
                });
              }
            }
            const indexMd = `# DANH S\xC1CH PH\xC1T PLAYLIST VIDEO (${playlistVideos.length} T\u1EADp)

Ch\u1EE7 \u0111\u1EC1: ${options.topic || "Chuy\xEAn \u0111\u1EC1"}

` + playlistVideos.map((v) => `- **T\u1EADp ${v.episode}:** ${v.title} (${import_path.default.basename(v.videoPath)})${v.audioPath ? ` [Audio: ${import_path.default.basename(v.audioPath)}]` : ""}`).join("\n") + "\n";
            import_fs.default.writeFileSync(import_path.default.join(playlistDir, "danh_sach_phat.md"), indexMd, "utf-8");
            onProgress({
              step: "COMPLETED",
              progress: 100,
              message: `\u{1F389} Ho\xE0n t\u1EA5t 1-Click! \u0110\xE3 s\u1EA3n xu\u1EA5t tr\u1ECDn b\u1ED9 playlist ${playlistVideos.length} t\u1EADp video MP4${options.enableVoice === true ? " k\xE8m thuy\u1EBFt minh gi\u1ECDng \u0111\u1ECDc AI" : ""}!`,
              videoUrl: playlistVideos[0] ? playlistVideos[0].videoUrl : void 0,
              videoPath: playlistVideos[0] ? playlistVideos[0].videoPath : void 0,
              audioUrl: playlistVideos[0] ? playlistVideos[0].audioUrl : void 0,
              audioPath: playlistVideos[0] ? playlistVideos[0].audioPath : void 0,
              filePath: import_path.default.join(playlistDir, "danh_sach_phat.md"),
              isSeries: true,
              seriesCount,
              playlistVideos,
              contentType: "manim"
            });
            return;
          }
        } else {
          onProgress({
            step: "COMPLETED",
            progress: 100,
            message: "Ho\xE0n t\u1EA5t 1-Click! \u0110\xE3 l\u01B0u scene.py, render_manim.sh v\xE0 render_manim.bat.",
            manimCode: finalPython,
            latexCode: finalPython,
            filePath: sceneFilePath,
            contentType: "manim"
          });
          return;
        }
      }
      if (isScriptTask) {
        onProgress({
          step: "EXTRACTING_LATEX",
          progress: 70,
          message: "\u0110ang b\xF3c t\xE1ch k\u1ECBch b\u1EA3n ph\xE2n c\u1EA3nh v\xE0 xu\u1EA5t file ph\u1EE5 \u0111\u1EC1..."
        });
        const extractedScript = await aiPage.evaluate(() => {
          const blocks = document.querySelectorAll(
            'message-content, .model-response-text, .response-container, div[data-message-author-role="assistant"], .font-claude-message, .ds-markdown, .markdown'
          );
          const lastBlock = blocks[blocks.length - 1];
          return lastBlock ? lastBlock.textContent || lastBlock.innerText || "" : "";
        });
        const scriptContent = extractedScript || options.prompt;
        const scriptFilePath = import_path.default.join(outputDirectory, "kich_ban_video.md");
        import_fs.default.writeFileSync(scriptFilePath, scriptContent, "utf-8");
        const lines = scriptContent.split("\n");
        const srtEntries = [];
        const timeRegex = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2}|Cuối)/i;
        const toSrtTime = (t) => {
          const parts = t.split(":").map((p) => parseInt(p, 10));
          let m = 0, s = 0;
          if (parts.length === 2) {
            m = parts[0];
            s = parts[1];
          } else if (parts.length === 3) {
            return `${String(parts[0]).padStart(2, "0")}:${String(parts[1]).padStart(2, "0")}:${String(parts[2]).padStart(2, "0")},000`;
          }
          return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},000`;
        };
        for (const line of lines) {
          if (!line.includes("|")) continue;
          const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
          if (cells.length >= 3) {
            const timeCell = cells[0];
            const match = timeCell.match(timeRegex);
            if (match) {
              const startTime2 = match[1];
              let endTime = match[2].toLowerCase() === "cu\u1ED1i" ? "01:00" : match[2];
              let voiceText = (cells[2] || cells[1]).replace(/^[“"\[]+|[”"\]]+$/g, "").trim();
              if (voiceText && !voiceText.includes("L\u1EDDi tho\u1EA1i")) {
                srtEntries.push({ start: toSrtTime(startTime2), end: toSrtTime(endTime), text: voiceText });
              }
            }
          }
        }
        const srtContent = srtEntries.length > 0 ? srtEntries.map((e, idx) => `${idx + 1}
${e.start} --> ${e.end}
${e.text}
`).join("\n") : `1
00:00:00,000 --> 00:00:10,000
K\u1ECBch b\u1EA3n Video Yuta!LaTeX
`;
        const srtFilePath = import_path.default.join(outputDirectory, "phude.srt");
        import_fs.default.writeFileSync(srtFilePath, srtContent, "utf-8");
        onProgress({
          step: "COMPLETED",
          progress: 100,
          message: "Ho\xE0n t\u1EA5t 1-Click! \u0110\xE3 l\u01B0u kich_ban_video.md v\xE0 phude.srt.",
          scriptContent,
          srtContent,
          latexCode: scriptContent,
          filePath: scriptFilePath,
          contentType: "script"
        });
        return;
      }
      onProgress({
        step: "EXTRACTING_LATEX",
        progress: 65,
        message: "\u0110ang b\xF3c t\xE1ch v\xE0 l\xE0m s\u1EA1ch m\xE3 ngu\u1ED3n LaTeX..."
      });
      const extractedLatex = await aiPage.evaluate(() => {
        const codeBlocks = document.querySelectorAll(
          'pre code, .code-block code, div[data-message-author-role="assistant"] pre code, .font-claude-message pre code, .ds-markdown pre code, code'
        );
        for (let i = codeBlocks.length - 1; i >= 0; i--) {
          const txt = codeBlocks[i].textContent || "";
          if (txt.includes("\\documentclass") || txt.includes("\\begin{document}") || txt.includes("\\usepackage")) {
            return txt;
          }
        }
        const allText = document.body.innerText || "";
        const match = allText.match(/\\documentclass[\s\S]*?\\end\{document\}/);
        if (match) return match[0];
        return null;
      });
      let finalLatex = extractedLatex || options.prompt;
      finalLatex = finalLatex.replace(/^```(?:latex|tex)?\s*/i, "").replace(/\s*```$/i, "").trim();
      finalLatex = _AutomationRunner.autoRepairLatexCode(finalLatex);
      const timestamp = Date.now();
      const texFileName = `tailieu_${timestamp}.tex`;
      const localPdfFileName = `tailieu_${timestamp}.pdf`;
      const texFilePath = import_path.default.join(outputDirectory, texFileName);
      const localPdfPath = import_path.default.join(outputDirectory, localPdfFileName);
      import_fs.default.writeFileSync(texFilePath, finalLatex, "utf-8");
      onProgress({
        step: "EXTRACTING_LATEX",
        progress: 70,
        message: "\u0110\xE3 tr\xEDch xu\u1EA5t m\xE3 LaTeX th\xE0nh c\xF4ng!",
        latexCode: finalLatex
      });
      const renderMode = options.renderMode || "local";
      if (renderMode === "local") {
        onProgress({
          step: "RECOMPILING",
          progress: 85,
          message: "\u26A1 \u0110ang bi\xEAn d\u1ECBch PDF c\u1EE5c b\u1ED9 b\u1EB1ng pdflatex (Ch\u1EBF \u0111\u1ED9 Local Fast Render)..."
        });
        let compiledPdfPath;
        try {
          const pdflatexBin = getPdflatexPath();
          for (let pass = 1; pass <= 2; pass++) {
            try {
              (0, import_child_process.execSync)(`"${pdflatexBin}" -interaction=nonstopmode -output-directory="${outputDirectory}" "${texFilePath}"`, { cwd: outputDirectory, stdio: "ignore" });
            } catch (cErr) {
              console.warn(`Pdflatex local compilation pass ${pass} notice:`, cErr.message);
            }
          }
          if (import_fs.default.existsSync(localPdfPath)) {
            compiledPdfPath = localPdfPath;
            const auxExtensions = [".aux", ".log", ".out", ".toc", ".nav", ".snm"];
            for (const ext of auxExtensions) {
              const auxFile = import_path.default.join(outputDirectory, `tailieu_${timestamp}${ext}`);
              if (import_fs.default.existsSync(auxFile)) {
                try {
                  import_fs.default.unlinkSync(auxFile);
                } catch {
                }
              }
            }
          }
        } catch (cErr) {
          console.warn("Pdflatex local compilation warning:", cErr.message);
        }
        const pdfPreviewUrl2 = compiledPdfPath ? generatePdfPreviewImage(compiledPdfPath, outputDirectory) : void 0;
        onProgress({
          step: "COMPLETED",
          progress: 100,
          message: compiledPdfPath ? `\u{1F389} Local Render ho\xE0n t\u1EA5t! File PDF \u0111\xE3 \u0111\u01B0\u1EE3c bi\xEAn d\u1ECBch th\xE0nh c\xF4ng.` : `\u{1F389} Local Render ho\xE0n t\u1EA5t! \u0110\xE3 tr\xEDch xu\u1EA5t m\xE3 LaTeX th\xE0nh c\xF4ng.`,
          latexCode: finalLatex,
          pdfPath: compiledPdfPath || texFilePath,
          pdfUrl: compiledPdfPath ? `/downloads/${localPdfFileName}` : void 0,
          pdfPreviewUrl: pdfPreviewUrl2
        });
        return {
          success: true,
          latexCode: finalLatex,
          pdfPath: compiledPdfPath || texFilePath,
          pdfUrl: compiledPdfPath ? `/downloads/${localPdfFileName}` : void 0,
          pdfPreviewUrl: pdfPreviewUrl2
        };
      }
      onProgress({
        step: "OPENING_OVERLEAF",
        progress: 75,
        message: "\u0110ang m\u1EDF d\u1EF1 \xE1n Overleaf \u0111\u1EC3 bi\xEAn d\u1ECBch t\xE0i li\u1EC7u..."
      });
      const overleafTargetUrl = options.overleafUrl || "https://www.overleaf.com/project";
      let overleafPage = browserContext.pages().find((p) => p.url().includes("overleaf.com"));
      if (!overleafPage) {
        overleafPage = await browserContext.newPage();
        await overleafPage.goto(overleafTargetUrl, { waitUntil: "domcontentloaded", timeout: 45e3 });
      } else {
        if (!isHeadless) await overleafPage.bringToFront();
        if (options.overleafUrl && !overleafPage.url().includes(options.overleafUrl)) {
          await overleafPage.goto(options.overleafUrl, { waitUntil: "domcontentloaded" });
        }
      }
      this.activePage = overleafPage;
      if (overleafPage.url().includes("/login")) {
        if (isHeadless) {
          throw new Error("Overleaf y\xEAu c\u1EA7u \u0111\u0103ng nh\u1EADp! Vui l\xF2ng t\u1EAFt ch\u1EBF \u0111\u1ED9 ch\u1EA1y ng\u1EA7m \u0111\u1EC3 \u0111\u0103ng nh\u1EADp Overleaf 1 l\u1EA7n.");
        }
      }
      onProgress({
        step: "PASTING_CODE",
        progress: 82,
        message: "\u0110ang d\xE1n m\xE3 ngu\u1ED3n LaTeX v\xE0o tr\xECnh bi\xEAn t\u1EADp Overleaf..."
      });
      await overleafPage.waitForTimeout(2e3);
      const editorSelectors = [
        '.cm-content[contenteditable="true"]',
        ".cm-editor .cm-content",
        ".ace_text-input",
        'div[role="textbox"].cm-content'
      ];
      let editorPasted = false;
      for (const sel of editorSelectors) {
        try {
          const editor = await overleafPage.waitForSelector(sel, { timeout: 8e3, state: "attached" });
          if (editor) {
            await editor.click();
            await overleafPage.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
            await overleafPage.keyboard.press("Backspace");
            const dispatched = await overleafPage.evaluate((code) => {
              const cm = document.querySelector(".cm-editor");
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
        } catch {
        }
      }
      if (!editorPasted) {
        await overleafPage.keyboard.insertText(finalLatex);
      }
      await overleafPage.waitForTimeout(1e3);
      onProgress({
        step: "RECOMPILING",
        progress: 90,
        message: "\u0110ang k\xEDch ho\u1EA1t Recompile (Ctrl + Enter)..."
      });
      await overleafPage.keyboard.press(process.platform === "darwin" ? "Meta+Enter" : "Control+Enter");
      try {
        const recompileBtn = await overleafPage.$('.btn-recompile, button[aria-label*="Recompile"], .recompile-button');
        if (recompileBtn) {
          await recompileBtn.click();
        }
      } catch {
      }
      onProgress({
        step: "DOWNLOADING_PDF",
        progress: 95,
        message: "\u0110ang \u0111\u1EE3i Overleaf ho\xE0n t\u1EA5t bi\xEAn d\u1ECBch v\xE0 t\u1EA1o file PDF..."
      });
      let pdfSavedPath;
      const pdfFileName = `TaiLieu_Yuta_${Date.now()}.pdf`;
      const targetPdfPath = import_path.default.join(outputDirectory, pdfFileName);
      const userDownloadsPath = import_path.default.join(import_os.default.homedir(), "Downloads", pdfFileName);
      const currentUrl = overleafPage.url();
      const projMatch = currentUrl.match(/\/project\/([a-f0-9]+)/i);
      const projectId = projMatch ? projMatch[1] : null;
      const directPdfUrl = projectId ? `https://www.overleaf.com/project/${projectId}/output/output.pdf?compileGroup=standard` : null;
      const startTime = Date.now();
      const maxWaitMs = 35e3;
      while (Date.now() - startTime < maxWaitMs) {
        await overleafPage.waitForTimeout(1500);
        if (directPdfUrl) {
          try {
            const resp = await overleafPage.request.get(directPdfUrl, { timeout: 4e3 });
            if (resp.ok()) {
              const buf = await resp.body();
              if (buf.length > 500 && buf.slice(0, 4).toString() === "%PDF") {
                import_fs.default.writeFileSync(targetPdfPath, buf);
                try {
                  import_fs.default.writeFileSync(userDownloadsPath, buf);
                } catch {
                }
                pdfSavedPath = targetPdfPath;
                break;
              }
            }
          } catch {
          }
        }
        const isPdfReady = await overleafPage.evaluate(() => {
          const dl = document.querySelector('a[aria-label*="Download PDF"], a.btn-download-pdf, a[href$="output.pdf"]');
          const err = document.querySelector(".btn-recompile.btn-danger, .compilation-error-label");
          return !!(dl || err);
        }).catch(() => false);
        if (isPdfReady && directPdfUrl && !pdfSavedPath) {
          try {
            const resp = await overleafPage.request.get(directPdfUrl, { timeout: 4e3 });
            if (resp.ok()) {
              const buf = await resp.body();
              if (buf.length > 500 && buf.slice(0, 4).toString() === "%PDF") {
                import_fs.default.writeFileSync(targetPdfPath, buf);
                try {
                  import_fs.default.writeFileSync(userDownloadsPath, buf);
                } catch {
                }
                pdfSavedPath = targetPdfPath;
                break;
              }
            }
          } catch {
          }
        }
      }
      if (!pdfSavedPath) {
        const downloadBtnSelectors = [
          'a[aria-label*="Download PDF"]',
          "a.btn-download-pdf",
          'button[aria-label*="Download PDF"]',
          'a[href$="output.pdf"]',
          "a.pdf-download-btn"
        ];
        for (const sel of downloadBtnSelectors) {
          try {
            const downloadBtn = await overleafPage.$(sel);
            if (downloadBtn) {
              const [download] = await Promise.all([
                overleafPage.waitForEvent("download", { timeout: 1e4 }),
                downloadBtn.click()
              ]);
              await download.saveAs(targetPdfPath);
              try {
                await download.saveAs(userDownloadsPath);
              } catch {
              }
              pdfSavedPath = targetPdfPath;
              break;
            }
          } catch {
          }
        }
      }
      if (!pdfSavedPath && import_fs.default.existsSync(texFilePath)) {
        try {
          (0, import_child_process.execSync)(`pdftoppm -v`, { stdio: "ignore" });
          const pdflatexBin = getPdflatexPath();
          const pdflatexCmd = `"${pdflatexBin}" -interaction=nonstopmode -output-directory="${outputDirectory}" "${texFilePath}"`;
          (0, import_child_process.execSync)(pdflatexCmd, { cwd: outputDirectory, stdio: "ignore" });
          if (import_fs.default.existsSync(targetPdfPath)) {
            pdfSavedPath = targetPdfPath;
          }
        } catch (cErr) {
        }
      }
      const pdfPreviewUrl = pdfSavedPath ? generatePdfPreviewImage(pdfSavedPath, outputDirectory) : void 0;
      onProgress({
        step: "COMPLETED",
        progress: 100,
        message: pdfSavedPath ? `\u{1F389} Ho\xE0n t\u1EA5t 1-Click! File PDF \u0111\xE3 \u0111\u01B0\u1EE3c l\u01B0u v\xE0o ${pdfFileName}` : "\u{1F389} Ho\xE0n t\u1EA5t! M\xE3 LaTeX \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\u1ED3ng b\u1ED9 sang Overleaf.",
        latexCode: finalLatex,
        pdfPath: pdfSavedPath || texFilePath,
        pdfUrl: pdfSavedPath ? `/downloads/${pdfFileName}` : void 0,
        pdfPreviewUrl
      });
      return {
        success: true,
        latexCode: finalLatex,
        pdfPath: pdfSavedPath || texFilePath,
        pdfUrl: pdfSavedPath ? `/downloads/${pdfFileName}` : void 0,
        pdfPreviewUrl
      };
    } catch (error) {
      const errMsg = error.message || "L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh trong qu\xE1 tr\xECnh t\u1EF1 \u0111\u1ED9ng h\xF3a.";
      onProgress({
        step: "ERROR",
        progress: 0,
        message: `\u0110\xE3 x\u1EA3y ra s\u1EF1 c\u1ED1: ${errMsg}`,
        error: errMsg
      });
      return { success: false, error: errMsg };
    }
  }
};

// server/serverCore.ts
var import_localtunnel = __toESM(require("localtunnel"), 1);
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".tex": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
  ".srt": "text/plain; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".md": "text/markdown; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};
var activeWanTunnel = null;
var currentWanUrl = "";
var desktopSecurityPin = "";
async function startWanTunnel(port) {
  if (activeWanTunnel && currentWanUrl) return currentWanUrl;
  try {
    const tunnel = await (0, import_localtunnel.default)({ port: port || 3e3 });
    activeWanTunnel = tunnel;
    currentWanUrl = tunnel.url;
    tunnel.on("close", () => {
      activeWanTunnel = null;
      currentWanUrl = "";
    });
    return currentWanUrl;
  } catch (err) {
    console.error("L\u1ED7i khi m\u1EDF LocalTunnel WAN:", err);
    throw err;
  }
}
async function stopWanTunnel() {
  if (activeWanTunnel) {
    try {
      activeWanTunnel.close();
    } catch {
    }
    activeWanTunnel = null;
    currentWanUrl = "";
  }
}
var cachedAntigravityQuota = null;
var lastQuotaFetchTimestamp = 0;
async function getLiveAntigravityQuota(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedAntigravityQuota && now - lastQuotaFetchTimestamp < 5e3) {
    return cachedAntigravityQuota;
  }
  const { execSync: execSync2 } = await import("child_process");
  try {
    let ssOutput = "";
    try {
      ssOutput = execSync2("ss -tlnp 2>/dev/null | grep -E 'agy|language_server'", { encoding: "utf-8", timeout: 1500 });
    } catch {
    }
    const portMatches = [...ssOutput.matchAll(/127\.0\.0\.1:(\d+)/g)].map((m) => parseInt(m[1], 10));
    const candidatePorts = [...new Set(portMatches)];
    let csrfToken = "";
    try {
      const psOutput = execSync2("ps -eo cmd 2>/dev/null | grep language_server_linux_x64 | grep -v grep", {
        encoding: "utf-8",
        timeout: 1500
      });
      const csrfMatch = psOutput.match(/--csrf_token\s+([a-zA-Z0-9\-]+)/);
      if (csrfMatch) csrfToken = csrfMatch[1];
    } catch {
    }
    for (const port of candidatePorts) {
      try {
        const result = await new Promise((resolve, reject) => {
          const headers = { "Content-Type": "application/json" };
          if (csrfToken) headers["x-codeium-csrf-token"] = csrfToken;
          const req = import_http.default.request(
            {
              hostname: "127.0.0.1",
              port,
              path: "/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary",
              method: "POST",
              headers,
              timeout: 1200
            },
            (res) => {
              let data = "";
              res.on("data", (chunk) => data += chunk);
              res.on("end", () => {
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
          req.on("error", reject);
          req.on("timeout", () => {
            req.destroy();
            reject(new Error("timeout"));
          });
          req.write("{}");
          req.end();
        });
        if (result && result.response && Array.isArray(result.response.groups)) {
          const geminiGroup = result.response.groups.find((g) => g.displayName && g.displayName.includes("Gemini")) || result.response.groups[0];
          const claudeGroup = result.response.groups.find(
            (g) => g.displayName && (g.displayName.includes("Claude") || g.displayName.includes("GPT"))
          );
          const weeklyBucket = geminiGroup?.buckets?.find(
            (b) => b.window === "weekly" || b.bucketId && b.bucketId.includes("weekly")
          );
          const fiveHourBucket = geminiGroup?.buckets?.find(
            (b) => b.window === "5h" || b.bucketId && b.bucketId.includes("5h")
          );
          const claudeWeekly = claudeGroup?.buckets?.find(
            (b) => b.window === "weekly" || b.bucketId && b.bucketId.includes("weekly")
          );
          const claude5h = claudeGroup?.buckets?.find(
            (b) => b.window === "5h" || b.bucketId && b.bucketId.includes("5h")
          );
          const weeklyPct = weeklyBucket ? Math.round(weeklyBucket.remainingFraction * 100) : 100;
          const fiveHourPct = fiveHourBucket ? Math.round(fiveHourBucket.remainingFraction * 100) : 100;
          let statusText = "\u{1F7E2} Kh\u1EA3 d\u1EE5ng (Live Antigravity Quota)";
          if (fiveHourPct <= 10 || weeklyPct <= 10) {
            statusText = "\u{1F534} Quota s\u1EAFp h\u1EBFt (< 10%)";
          } else if (fiveHourPct <= 25 || weeklyPct <= 25) {
            statusText = "\u{1F7E1} Quota \u1EDF m\u1EE9c th\u1EA5p (< 25%)";
          }
          cachedAntigravityQuota = {
            source: "live_agent",
            port,
            weekly: weeklyPct,
            fiveHour: fiveHourPct,
            weeklyDesc: weeklyBucket?.description || "",
            fiveHourDesc: fiveHourBucket?.description || "",
            weeklyResetTime: weeklyBucket?.resetTime || "",
            fiveHourResetTime: fiveHourBucket?.resetTime || "",
            claudeWeekly: claudeWeekly ? Math.round(claudeWeekly.remainingFraction * 100) : 100,
            claude5h: claude5h ? Math.round(claude5h.remainingFraction * 100) : 100,
            status: statusText,
            engine: "Google Antigravity Live Engine",
            limitDesc: "5h / 1w",
            groups: result.response.groups,
            generalDesc: result.response.description || "",
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          };
          lastQuotaFetchTimestamp = Date.now();
          return cachedAntigravityQuota;
        }
      } catch {
      }
    }
  } catch {
  }
  let conversationCount = 0;
  try {
    const brainDir = import_path2.default.join(import_os2.default.homedir(), ".gemini", "antigravity-cli", "brain");
    if (import_fs2.default.existsSync(brainDir)) {
      conversationCount = import_fs2.default.readdirSync(brainDir).length;
    }
  } catch {
  }
  const fiveHour = Math.max(35, Math.min(100, 100 - conversationCount % 6 * 5));
  const weekly = Math.max(45, Math.min(100, 100 - Math.floor(conversationCount / 3) * 2));
  cachedAntigravityQuota = {
    source: "fallback_estimate",
    weekly,
    fiveHour,
    claudeWeekly: 100,
    claude5h: 100,
    status: "\u{1F7E2} Kh\u1EA3 d\u1EE5ng (Antigravity Agent Active)",
    engine: "Google Antigravity CLI",
    limitDesc: "5h / 1w",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  lastQuotaFetchTimestamp = Date.now();
  return cachedAntigravityQuota;
}
function startStandaloneServer(options = {}) {
  const downloadsDir = options.downloadsDir || import_path2.default.join(import_os2.default.homedir(), "Downloads");
  if (!import_fs2.default.existsSync(downloadsDir)) {
    import_fs2.default.mkdirSync(downloadsDir, { recursive: true });
  }
  const distDir = options.distDir || import_path2.default.resolve(process.cwd(), "dist");
  let runner = null;
  let currentAutomationState = {
    isRunning: false,
    progress: {
      step: "INIT",
      progress: 0,
      message: ""
    },
    logs: [],
    startTime: null
  };
  let lastMobileActivity = {
    timestamp: 0,
    deviceName: "",
    ip: ""
  };
  const detectMobileDevice = (req) => {
    if (!req) return;
    const ua = req.headers && req.headers["user-agent"] || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    if (isMobile) {
      let devName = "\u0110i\u1EC7n Tho\u1EA1i";
      if (/iPhone/i.test(ua)) devName = "iPhone";
      else if (/iPad/i.test(ua)) devName = "iPad";
      else if (/Android/i.test(ua)) devName = "Android";
      const clientIp = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress.replace(/^.*:/, "") : "";
      lastMobileActivity = {
        timestamp: Date.now(),
        deviceName: devName,
        ip: clientIp
      };
    }
  };
  function updateAutomationProgress(updateData) {
    if (!updateData) return;
    if (!currentAutomationState.startTime) {
      currentAutomationState.startTime = Date.now();
    }
    currentAutomationState.isRunning = !(updateData.step === "COMPLETED" || updateData.step === "ERROR");
    currentAutomationState.progress = {
      ...currentAutomationState.progress,
      ...updateData
    };
    if (updateData.message) {
      const timeStr = (/* @__PURE__ */ new Date()).toLocaleTimeString("vi-VN", { hour12: false });
      const elapsedSec = Math.floor((Date.now() - (currentAutomationState.startTime || Date.now())) / 1e3);
      const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
      const secs = String(elapsedSec % 60).padStart(2, "0");
      const logLine = `[${mins}:${secs}] [${timeStr}] ${updateData.message}`;
      if (!currentAutomationState.logs.includes(logLine)) {
        currentAutomationState.logs.push(logLine);
      }
    }
  }
  const server = import_http.default.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Security-Pin");
    detectMobileDevice(req);
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }
    const host = req.headers.host || "127.0.0.1";
    const parsedUrl = new URL(req.url || "/", `http://${host}`);
    const pathname = parsedUrl.pathname;
    if (pathname.startsWith("/downloads")) {
      const rawRelPath = pathname.replace(/^\/downloads\/?/, "").split("?")[0];
      const relPath = decodeURIComponent(rawRelPath);
      const resolvedDownloadsDir = import_path2.default.resolve(downloadsDir);
      const filePath = import_path2.default.resolve(resolvedDownloadsDir, relPath);
      if (!filePath.startsWith(resolvedDownloadsDir + import_path2.default.sep) && filePath !== resolvedDownloadsDir) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Access Denied: Path Traversal Detected (CWE-22)");
        return;
      }
      if (import_fs2.default.existsSync(filePath) && import_fs2.default.statSync(filePath).isFile()) {
        const ext = import_path2.default.extname(filePath).toLowerCase();
        const stat = import_fs2.default.statSync(filePath);
        const fileSize = stat.size;
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const range = req.headers.range;
        if (range && (ext === ".mp4" || ext === ".webm" || ext === ".mp3" || ext === ".wav")) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = end - start + 1;
          const stream = import_fs2.default.createReadStream(filePath, { start, end });
          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": contentType
          });
          stream.pipe(res);
          return;
        } else {
          res.writeHead(200, {
            "Content-Type": contentType,
            "Content-Length": fileSize,
            "Accept-Ranges": "bytes"
          });
          import_fs2.default.createReadStream(filePath).pipe(res);
          return;
        }
      }
    }
    if (pathname === "/api/automate/stream" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        let options2 = {};
        try {
          options2 = JSON.parse(body || "{}");
        } catch {
        }
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*"
        });
        currentAutomationState = {
          isRunning: true,
          progress: { step: "INIT", progress: 0, message: "\u{1F680} Kh\u1EDFi \u0111\u1ED9ng quy tr\xECnh t\u1EF1 \u0111\u1ED9ng h\xF3a..." },
          logs: [],
          startTime: Date.now()
        };
        const sendSSE = (data) => {
          updateAutomationProgress(data);
          try {
            res.write(`data: ${JSON.stringify(data)}

`);
          } catch {
          }
        };
        runner = new AutomationRunner();
        try {
          await runner.runPipeline(
            {
              ...options2,
              outputDir: downloadsDir
            },
            (update) => {
              sendSSE(update);
            }
          );
        } catch (err) {
          sendSSE({
            step: "ERROR",
            progress: 0,
            message: err.message || "L\u1ED7i kh\xF4ng mong mu\u1ED1n.",
            error: err.message
          });
        } finally {
          res.end();
        }
      });
      return;
    }
    if (pathname === "/api/automate/current-state" && req.method === "GET") {
      const isConnected = Date.now() - lastMobileActivity.timestamp < 12e3;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ...currentAutomationState,
          isMobileConnected: isConnected,
          mobileDeviceName: isConnected ? lastMobileActivity.deviceName : "",
          mobileIp: isConnected ? lastMobileActivity.ip : ""
        })
      );
      return;
    }
    if (pathname === "/api/automate/stop" && req.method === "POST") {
      if (runner) {
        runner.cancel();
        runner = null;
      }
      updateAutomationProgress({
        step: "ERROR",
        progress: 0,
        message: "\u26A0\uFE0F Ng\u01B0\u1EDDi d\xF9ng \u0111\xE3 d\u1EEBng quy tr\xECnh t\u1EF1 \u0111\u1ED9ng h\xF3a."
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "\u0110\xE3 g\u1EEDi l\u1EC7nh d\u1EEBng quy tr\xECnh." }));
      return;
    }
    if (pathname === "/api/open-file" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { filePath } = JSON.parse(body || "{}");
          if (filePath && import_fs2.default.existsSync(filePath)) {
            try {
              const electron = require("electron");
              if (electron && electron.shell) {
                await electron.shell.openPath(filePath);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
                return;
              }
            } catch {
            }
            const cmd = process.platform === "win32" ? `start "" "${filePath}"` : process.platform === "darwin" ? `open "${filePath}"` : `xdg-open "${filePath}"`;
            require("child_process").exec(cmd);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
            return;
          }
        } catch {
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false }));
      });
      return;
    }
    if (pathname === "/api/open-folder" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { folderPath } = JSON.parse(body || "{}");
          const target = folderPath || downloadsDir;
          try {
            const electron = require("electron");
            if (electron && electron.shell) {
              await electron.shell.openPath(target);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: true }));
              return;
            }
          } catch {
          }
          const cmd = process.platform === "win32" ? `explorer "${target}"` : process.platform === "darwin" ? `open "${target}"` : `xdg-open "${target}"`;
          require("child_process").exec(cmd);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
          return;
        } catch {
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false }));
      });
      return;
    }
    if (pathname === "/api/parse-pdf" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { fileName, fileBase64 } = JSON.parse(body || "{}");
          if (!fileBase64) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Thi\u1EBFu d\u1EEF li\u1EC7u file PDF" }));
            return;
          }
          const buffer = Buffer.from(fileBase64, "base64");
          const safeName = (fileName || "document.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
          const tempPath = import_path2.default.join(import_os2.default.tmpdir(), `yuta_rag_${Date.now()}_${safeName}`);
          import_fs2.default.writeFileSync(tempPath, buffer);
          const pdfParseModule = await import("pdf-parse");
          const pdfParser = pdfParseModule.default || pdfParseModule;
          const parsed = await pdfParser(buffer);
          const fileSizeStr = buffer.length > 1024 * 1024 ? (buffer.length / (1024 * 1024)).toFixed(1) + " MB" : Math.round(buffer.length / 1024) + " KB";
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              fileName: safeName,
              numPages: parsed.numpages || 1,
              text: parsed.text || "",
              tempPath,
              fileSize: fileSizeStr
            })
          );
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message || "L\u1ED7i khi \u0111\u1ECDc file PDF" }));
        }
      });
      return;
    }
    if (pathname.startsWith("/api/view-pdf")) {
      try {
        const rawFilePath = parsedUrl.searchParams.get("path");
        if (!rawFilePath) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Thi\u1EBFu tham s\u1ED1 path");
          return;
        }
        const resolvedPath = import_path2.default.resolve(rawFilePath);
        const allowedRoots = [
          import_path2.default.resolve(downloadsDir),
          import_path2.default.resolve(import_os2.default.homedir(), "Downloads"),
          import_path2.default.resolve(import_os2.default.tmpdir()),
          import_path2.default.resolve(process.cwd())
        ];
        const isPathSafe = allowedRoots.some((root) => resolvedPath.startsWith(root + import_path2.default.sep) || resolvedPath === root);
        if (!isPathSafe) {
          res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Access Denied: Path Traversal Detected (CWE-22)");
          return;
        }
        if (import_fs2.default.existsSync(resolvedPath) && resolvedPath.toLowerCase().endsWith(".pdf")) {
          const stat = import_fs2.default.statSync(resolvedPath);
          res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Length": stat.size,
            "Content-Disposition": 'inline; filename="preview.pdf"',
            "Accept-Ranges": "bytes"
          });
          import_fs2.default.createReadStream(resolvedPath).pipe(res);
          return;
        } else {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("File PDF kh\xF4ng t\u1ED3n t\u1EA1i.");
          return;
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`L\u1ED7i \u0111\u1ECDc file PDF: ${err.message}`);
        return;
      }
    }
    if (pathname === "/api/upload-image" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { fileName, fileBase64, description, layoutMode } = JSON.parse(body || "{}");
          if (!fileBase64) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Thi\u1EBFu d\u1EEF li\u1EC7u h\xECnh \u1EA3nh" }));
            return;
          }
          const assetsDir = import_path2.default.join(downloadsDir, "assets");
          if (!import_fs2.default.existsSync(assetsDir)) {
            import_fs2.default.mkdirSync(assetsDir, { recursive: true });
          }
          const ext = import_path2.default.extname(fileName || ".png") || ".png";
          const safeBase = import_path2.default.basename(fileName || "image", ext).replace(/[^a-zA-Z0-9_-]/g, "_");
          const safeName = `img_${Date.now()}_${safeBase}${ext}`;
          const filePath = import_path2.default.join(assetsDir, safeName);
          const buffer = Buffer.from(fileBase64, "base64");
          import_fs2.default.writeFileSync(filePath, buffer);
          const fileSizeStr = buffer.length > 1024 * 1024 ? (buffer.length / (1024 * 1024)).toFixed(1) + " MB" : Math.round(buffer.length / 1024) + " KB";
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            fileName: fileName || safeName,
            filePath,
            previewUrl: `/downloads/assets/${safeName}`,
            fileSize: fileSizeStr,
            description: description || "",
            layoutMode: layoutMode || "top_card"
          }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message || "L\u1ED7i l\u01B0u h\xECnh \u1EA3nh" }));
        }
      });
      return;
    }
    if (pathname.startsWith("/api/view-image")) {
      try {
        const rawFilePath = parsedUrl.searchParams.get("path");
        if (!rawFilePath) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Thi\u1EBFu tham s\u1ED1 path");
          return;
        }
        const resolvedPath = import_path2.default.resolve(rawFilePath);
        const allowedRoots = [
          import_path2.default.resolve(downloadsDir),
          import_path2.default.resolve(import_os2.default.homedir(), "Downloads"),
          import_path2.default.resolve(import_os2.default.tmpdir()),
          import_path2.default.resolve(process.cwd())
        ];
        const isPathSafe = allowedRoots.some((root) => resolvedPath.startsWith(root + import_path2.default.sep) || resolvedPath === root);
        if (!isPathSafe) {
          res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Access Denied: Path Traversal Detected (CWE-22)");
          return;
        }
        if (import_fs2.default.existsSync(resolvedPath)) {
          const ext = import_path2.default.extname(resolvedPath).toLowerCase();
          const stat = import_fs2.default.statSync(resolvedPath);
          res.writeHead(200, {
            "Content-Type": MIME_TYPES[ext] || "image/png",
            "Content-Length": stat.size
          });
          import_fs2.default.createReadStream(resolvedPath).pipe(res);
          return;
        } else {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("H\xECnh \u1EA3nh kh\xF4ng t\u1ED3n t\u1EA1i.");
          return;
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`L\u1ED7i \u0111\u1ECDc file h\xECnh \u1EA3nh: ${err.message}`);
        return;
      }
    }
    if (pathname === "/api/automate/status" && req.method === "GET") {
      const chromePath = AutomationRunner.getDefaultChromePath();
      const userDataDir = AutomationRunner.getDefaultUserDataDir();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ready: true,
          chromePath,
          hasChrome: import_fs2.default.existsSync(chromePath),
          userDataDir,
          platform: process.platform
        })
      );
      return;
    }
    if (pathname === "/api/system/network-info" && req.method === "GET") {
      const interfaces = import_os2.default.networkInterfaces();
      let lanIp = "127.0.0.1";
      for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (!iface) continue;
        for (const alias of iface) {
          if (alias.family === "IPv4" && !alias.internal) {
            lanIp = alias.address;
            break;
          }
        }
        if (lanIp !== "127.0.0.1") break;
      }
      const addr = server.address();
      const currentPort = typeof addr === "object" && addr ? addr.port : options.port || 3e3;
      const isConnected = Date.now() - lastMobileActivity.timestamp < 12e3;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          lanIp,
          port: currentPort,
          mobileUrl: `http://${lanIp}:${currentPort}`,
          wanUrl: currentWanUrl,
          isWanActive: Boolean(currentWanUrl),
          hasPin: Boolean(desktopSecurityPin),
          isMobileConnected: isConnected,
          mobileDeviceName: isConnected ? lastMobileActivity.deviceName : "",
          mobileIp: isConnected ? lastMobileActivity.ip : ""
        })
      );
      return;
    }
    if (pathname === "/api/system/tunnel/start" && req.method === "POST") {
      try {
        const addr = server.address();
        const currentPort = typeof addr === "object" && addr ? addr.port : options.port || 3e3;
        const wanUrl = await startWanTunnel(currentPort);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, wanUrl }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }
    if (pathname === "/api/system/tunnel/stop" && req.method === "POST") {
      await stopWanTunnel();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
      return;
    }
    if (pathname === "/api/system/pin/set" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const { pin } = JSON.parse(body || "{}");
          desktopSecurityPin = String(pin || "").trim();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false }));
        }
      });
      return;
    }
    if (pathname === "/api/system/pin/verify" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const { pin } = JSON.parse(body || "{}");
          const isValid = !desktopSecurityPin || desktopSecurityPin === String(pin || "").trim();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: isValid, valid: isValid }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false }));
        }
      });
      return;
    }
    if (pathname === "/api/system/mobile-ping" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", isConnected: true }));
      return;
    }
    if (pathname === "/api/antigravity/quota" && req.method === "GET") {
      const force = parsedUrl.searchParams.get("refresh") === "true";
      const quota = await getLiveAntigravityQuota(force);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quota));
      return;
    }
    if (distDir && import_fs2.default.existsSync(distDir)) {
      let reqPath = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
      let filePath = import_path2.default.join(distDir, reqPath);
      if (!import_fs2.default.existsSync(filePath) || import_fs2.default.statSync(filePath).isDirectory()) {
        filePath = import_path2.default.join(distDir, "index.html");
      }
      if (import_fs2.default.existsSync(filePath)) {
        const ext = import_path2.default.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "text/html" });
        import_fs2.default.createReadStream(filePath).pipe(res);
        return;
      }
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });
  const targetPort = options.port !== void 0 ? options.port : 0;
  server.listen(targetPort, options.host || "0.0.0.0", () => {
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : targetPort;
    if (options.onReady) {
      options.onReady(actualPort);
    }
  });
  return server;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLiveAntigravityQuota,
  startStandaloneServer
});
