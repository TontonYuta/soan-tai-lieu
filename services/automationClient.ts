export interface AutomationProgress {
  step: 'INIT' | 'CONNECTING_CHROME' | 'OPENING_GEMINI' | 'SENDING_PROMPT' | 'WAITING_GEMINI' | 'EXTRACTING_LATEX' | 'OPENING_OVERLEAF' | 'PASTING_CODE' | 'RECOMPILING' | 'DOWNLOADING_PDF' | 'COMPLETED' | 'ERROR';
  progress: number;
  message: string;
  latexCode?: string;
  pdfUrl?: string;
  pdfPath?: string;
  error?: string;
}

export interface AutomationRunParams {
  prompt: string;
  browserType?: 'chrome' | 'firefox' | 'edge';
  aiUrl?: string;
  geminiUrl?: string;
  overleafUrl?: string;
  chromeProfilePath?: string;
  headless?: boolean;
  attachedPdfPath?: string;
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
