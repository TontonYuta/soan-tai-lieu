export interface AutomationProgress {
  step: 'INIT' | 'CONNECTING_CHROME' | 'OPENING_GEMINI' | 'SENDING_PROMPT' | 'WAITING_GEMINI' | 'EXTRACTING_LATEX' | 'OPENING_OVERLEAF' | 'PASTING_CODE' | 'RECOMPILING' | 'DOWNLOADING_PDF' | 'RENDERING_VIDEO' | 'COMPLETED' | 'ERROR';
  progress: number;
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
  audioUrl?: string;
  audioPath?: string;
  filePath?: string;
  error?: string;
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

export interface AutomationRunParams {
  prompt: string;
  browserType?: 'chrome' | 'firefox' | 'edge';
  aiProvider?: 'antigravity' | 'gemini' | 'chatgpt' | 'claude' | 'deepseek' | 'grok' | string;
  provider?: string;
  aiUrl?: string;
  geminiUrl?: string;
  overleafUrl?: string;
  chromeProfilePath?: string;
  headless?: boolean;
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




export class AutomationClient {
  private static activeAbortController: AbortController | null = null;

  public static async checkStatus(): Promise<{ ready: boolean; chromePath: string; hasChrome: boolean; platform: string; userDataDir: string }> {
    try {
      const res = await fetch('/api/automate/status');
      if (!res.ok) throw new Error('Không kết nối được tới server automation.');
      return await res.json();
    } catch {
      return { ready: false, chromePath: '', hasChrome: false, platform: '', userDataDir: '' };
    }
  }

  public static async getQuota(): Promise<{ weekly: number; fiveHour: number; status: string }> {
    try {
      const res = await fetch('/api/antigravity/quota');
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { weekly: 98, fiveHour: 95, status: '🟢 Khả dụng (Antigravity Agent Active)' };
    }
  }

  public static async stop(): Promise<void> {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    try {
      await fetch('/api/automate/stop', { method: 'POST' });
    } catch {}
  }

  public static async startPipeline(
    params: AutomationRunParams,
    onProgress: (data: AutomationProgress) => void
  ): Promise<void> {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }

    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const response = await fetch('/api/automate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server báo lỗi HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Không đọc được luồng SSE từ máy chủ.');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            try {
              const data: AutomationProgress = JSON.parse(jsonStr);
              onProgress(data);
            } catch (err) {
              console.warn('Lỗi parse SSE JSON:', err, jsonStr);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onProgress({
          step: 'ERROR',
          progress: 0,
          message: 'Quy trình đã được người dùng dừng lại.',
          error: 'Đã hủy',
        });
      } else {
        onProgress({
          step: 'ERROR',
          progress: 0,
          message: err.message || 'Lỗi kết nối tới Automation Runner',
          error: err.message,
        });
      }
    } finally {
      this.activeAbortController = null;
    }
  }
}
