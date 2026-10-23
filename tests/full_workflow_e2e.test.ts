import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { startStandaloneServer } from '../server/serverCore';

// Prompt generators
import { generateExamPrompt } from '../services/prompts/exam';
import { generateWorksheetPrompt } from '../services/prompts/worksheet';
import { generateSimilarPrompt } from '../services/prompts/similar';
import { generateLearningPrompt } from '../services/prompts/learning';
import { generateRoadmapPrompt } from '../services/prompts/roadmap';
import { generateProjectPrompt } from '../services/prompts/project';
import { 
  generateManimStoryboardPrompt, 
  generateManimCodePrompt, 
  generateVideoManimPrompt,
  generateManimRevisionPrompt
} from '../services/prompts/manim';
import { generateLatexRevisionPrompt } from '../services/prompts/latex-rules';
import { VideoConfig } from '../types';

test('Full Studio E2E Workflow - Comprehensive Pipeline Verification', async () => {
  let serverInstance: http.Server | null = null;
  const distDir = path.resolve(process.cwd(), 'dist');

  try {
    const port = await new Promise<number>((resolve) => {
      serverInstance = startStandaloneServer({
        port: 0,
        host: '127.0.0.1',
        distDir,
        onReady: (p) => resolve(p),
      });
    });

    assert.ok(port > 0, `Server successfully bound to ephemeral port: ${port}`);

    const makeRequest = (
      reqPath: string,
      options: http.RequestOptions = {},
      body?: any
    ): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string; json?: any }> => {
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path: reqPath,
            ...options,
            headers: {
              ...(options.headers || {}),
              ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
              let json: any = undefined;
              try {
                json = JSON.parse(data);
              } catch {}
              resolve({
                status: res.statusCode || 500,
                headers: res.headers,
                body: data,
                json,
              });
            });
          }
        );
        req.on('error', reject);
        if (body) {
          req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
      });
    };

    // 1. Static SPA Serving: Request root `/` should serve `index.html`
    const rootRes = await makeRequest('/');
    assert.strictEqual(rootRes.status, 200);
    assert.ok(rootRes.headers['content-type']?.includes('text/html'));
    assert.match(rootRes.body, /<div id="root">/i);

    // 2. Mobile Ping
    const pingRes = await makeRequest('/api/system/mobile-ping');
    assert.strictEqual(pingRes.status, 200);
    assert.strictEqual(pingRes.json?.status, 'ok');

    // 3. Antigravity Quota endpoint
    const quotaRes = await makeRequest('/api/antigravity/quota?refresh=true');
    assert.strictEqual(quotaRes.status, 200);
    assert.ok(typeof quotaRes.json === 'object');
    assert.ok('status' in quotaRes.json || 'remainingFraction' in quotaRes.json || 'source' in quotaRes.json);

    // 4. PIN Security Lifecycle
    const setPinRes = await makeRequest('/api/system/pin/set', { method: 'POST' }, { pin: '1234' });
    assert.strictEqual(setPinRes.status, 200);
    assert.strictEqual(setPinRes.json?.success, true);

    const verifyWrong = await makeRequest('/api/system/pin/verify', { method: 'POST' }, { pin: '9999' });
    assert.strictEqual(verifyWrong.status, 200);
    assert.strictEqual(verifyWrong.json?.valid, false);

    const verifyRight = await makeRequest('/api/system/pin/verify', { method: 'POST' }, { pin: '1234' });
    assert.strictEqual(verifyRight.status, 200);
    assert.strictEqual(verifyRight.json?.valid, true);

    // 5. Protected Endpoint Access with & without PIN
    const unauthorizedStart = await makeRequest('/api/automate/stream', { method: 'POST' }, { prompt: 'Test' });
    assert.strictEqual(unauthorizedStart.status, 401, 'Should block request missing X-Security-Pin');

    const authorizedStop = await makeRequest('/api/system/tunnel/stop', {
      method: 'POST',
      headers: { 'x-security-pin': '1234' }
    });
    assert.strictEqual(authorizedStop.status, 200, 'Should allow request with valid X-Security-Pin');

    // Reset PIN for clean test teardown
    await makeRequest('/api/system/pin/set', { method: 'POST' }, { pin: '' });

    // Verify 404 API guard
    const unknownApiRes = await makeRequest('/api/non-existent-endpoint');
    assert.strictEqual(unknownApiRes.status, 404);
    assert.strictEqual(unknownApiRes.json?.error, 'Route not found');

    // 6. Path Traversal Defense Verification on `/api/view-pdf`
    const evilPdf = await makeRequest('/api/view-pdf?path=/etc/passwd');
    assert.strictEqual(evilPdf.status, 403, 'Should reject accessing /etc/passwd');

    // 7. Verify all 8 Prompt Pipelines Produce Valid Strings
    const examPrompt = generateExamPrompt({
      subject: 'Toán Học',
      topic: 'Hàm số lũy thừa',
      grade: '12',
      school: 'THPT Chuyên Hà Nội - Amsterdam',
      examName: 'Thi thử Tốt nghiệp THPT Quốc gia',
      year: '2025-2026',
      time: 90,
      examFormat: 'standard2025',
      counts: {
        part1_mc: 12,
        part2_tf: 4,
        part3_sa: 6,
      },
      matrix: { lv1: 40, lv2: 30, lv3: 20, lv4: 10 },
    });
    assert.ok(examPrompt.length > 500);
    assert.match(examPrompt, /PHẦN I:/);
    assert.match(examPrompt, /PHẦN II:/);
    assert.match(examPrompt, /PHẦN III:/);

    const worksheetPrompt = generateWorksheetPrompt({
      subject: 'Toán Học',
      topic: 'Tích phân từng phần',
      grade: '12',
      teacherName: 'Tonton Yuta',
    });
    assert.ok(worksheetPrompt.length > 500);
    assert.match(worksheetPrompt, /PHIẾU BÀI TẬP/);

    const similarPrompt = generateSimilarPrompt({
      subject: 'Toán Học',
      topic: 'Cực trị hàm số',
      grade: '12',
      sourceExercises: 'Tìm cực trị của hàm số y = x^3 - 3x + 1',
      count: 3,
      difficulty: 'keep',
      includeSolution: true,
    });
    assert.ok(similarPrompt.length > 500);
    assert.match(similarPrompt, /bài tập tương tự/i);

    const learningPrompt = generateLearningPrompt({
      school: 'THPT Chuyên Hà Nội - Amsterdam',
      year: '2025-2026',
      subject: 'Toán Học',
      topic: 'Đạo hàm và ứng dụng',
      grade: '12',
      goal: 'summary',
      tone: 'academic',
      audience: 'Học sinh lớp 12',
    });
    assert.ok(learningPrompt.length > 500);

    const roadmapPrompt = generateRoadmapPrompt({
      subject: 'Toán Học',
      topic: 'Hình học Không gian Oxyz',
      duration: '4 tuần',
      currentLevel: 'Đã có căn bản',
      target: 'Đạt điểm 8+',
    });
    assert.ok(roadmapPrompt.length > 500);

    const projectPrompt = generateProjectPrompt({
      university: 'Đại học Quốc gia Hà Nội',
      title: 'Hệ thống nhận diện cử chỉ tay',
      major: 'Trí tuệ nhân tạo',
    });
    assert.ok(projectPrompt.length > 500);
    assert.match(projectPrompt, /CHƯƠNG 1/);

    const videoConfig: VideoConfig = {
      subject: 'Toán Học',
      topic: 'Hình học không gian Oxyz',
      audience: 'Học sinh lớp 12',
      duration: '60s',
      format: 'vertical',
      tone: 'creative',
      simulationMode: 'coordinate_oxyz',
    };

    const storyboardPrompt = generateManimStoryboardPrompt(videoConfig);
    assert.ok(storyboardPrompt.length > 500);
    assert.match(storyboardPrompt, /PHÂN CẢNH/i);

    const codePrompt = generateManimCodePrompt(videoConfig);
    assert.ok(codePrompt.length > 500);
    assert.match(codePrompt, /scene\.py/i);
    assert.match(codePrompt, /DUAL-ZONE CONTAINER/i);

    const combinedManimPrompt = generateVideoManimPrompt(videoConfig);
    assert.ok(combinedManimPrompt.length > 500);

    const manimRevPrompt = generateManimRevisionPrompt(videoConfig, 'from manim import *', 'Chỉnh màu sắc sang vàng');
    assert.ok(manimRevPrompt.includes('Chỉnh màu sắc sang vàng'));

    const latexRevPrompt = generateLatexRevisionPrompt(null, '\\documentclass{article}', 'Thêm câu hỏi thực tế');
    assert.ok(latexRevPrompt.includes('Thêm câu hỏi thực tế'));

  } finally {
    if (serverInstance) {
      await new Promise<void>((resolve) => {
        (serverInstance as http.Server).close(() => resolve());
      });
    }
  }
});
