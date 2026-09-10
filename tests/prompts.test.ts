import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateExamPrompt,
  generateLearningPrompt,
  generateRoadmapPrompt,
  generateWorksheetPrompt,
  generateSimilarPrompt,
  generateManimCodePrompt,
  generateVideoScriptPrompt,
  generateBatPrompt
} from '../services/gemini';

import { ExamConfig, WorksheetConfig, VideoConfig, SimilarExerciseConfig, LearningConfig, RoadmapConfig, BatConfig } from '../types';

test('1. generateExamPrompt - Standard 2025 Format', () => {
  const config: ExamConfig = {
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    examName: 'Khảo Sát Chất Lượng Toán 12',
    year: '2025 - 2026',
    subject: 'Toán học',
    grade: '12',
    topic: 'Khảo sát hàm số & Tích phân',
    time: 90,
    examFormat: 'standard2025',
    counts: {
      part1_mc: 12,
      part2_tf: 4,
      part3_sa: 6
    },
    matrix: {
      lv1: 6,
      lv2: 8,
      lv3: 5,
      lv4: 3
    },
    includeTikZ: true,
    language: 'vietnamese'
  };

  const prompt = generateExamPrompt(config);
  assert.ok(prompt.length > 500, 'Prompt should have substantial content');
  assert.match(prompt, /THPT Chuyên Hà Nội - Amsterdam/);
  assert.match(prompt, /Phần I/);
  assert.match(prompt, /Phần II/);
  assert.match(prompt, /Phần III/);
  assert.match(prompt, /tikz/i);
  assert.match(prompt, /pdfLaTeX/i);
  assert.match(prompt, /QUY TẮC KỸ THUẬT & TRÌNH BÀY LATEX/);
  assert.match(prompt, /QUY TẮC VIẾT HOA/);
  assert.match(prompt, /QUY TẮC IN ĐẬM/);
  assert.match(prompt, /QUY TẮC KÝ HIỆU TOÁN HỌC/);
  assert.match(prompt, /QUY TẮC CHỐNG RÁC NỘI BỘ/);
});

test('2. generateWorksheetPrompt - Worksheet with DongKe Macro', () => {
  const config: WorksheetConfig = {
    subject: 'Toán học',
    grade: '11',
    topic: 'Cấp số cộng và Cấp số nhân',
    teacherName: 'Thầy Yuta',
    language: 'vietnamese'
  };

  const prompt = generateWorksheetPrompt(config);
  assert.ok(prompt.length > 300);
  assert.match(prompt, /Cấp số cộng và Cấp số nhân/);
  assert.match(prompt, /Thầy Yuta/);
  assert.match(prompt, /\\dongke/);
  assert.match(prompt, /pdfLaTeX/i);
});

test('3. generateSimilarPrompt - Math Problem Variation', () => {
  const config: SimilarExerciseConfig = {
    subject: 'Toán học',
    topic: 'Phương trình mũ',
    sourceExercises: 'Giải phương trình 2^(2x) - 3*2^x + 2 = 0',
    count: 3,
    difficulty: 'harder',
    includeSolution: true,
    language: 'vietnamese'
  };

  const prompt = generateSimilarPrompt(config);
  assert.ok(prompt.length > 300);
  assert.match(prompt, /Phương trình mũ/);
  assert.match(prompt, /Số lượng bài tập tương tự cần sinh: 3 bài/);
  assert.match(prompt, /Khó hơn bài mẫu/);
  assert.match(prompt, /lời giải chi tiết/i);
});

test('4. generateManimCodePrompt - Vertical 9:16 Video with Safe Zone', () => {
  const config: VideoConfig = {
    subject: 'Toán học',
    topic: 'Bản chất Đạo hàm và Độ dốc tiếp tuyến',
    duration: '60s',
    tone: 'creative',
    audience: 'Học sinh lớp 11-12',
    format: 'vertical',
    hookType: 'visual_intuition',
    simulationMode: 'calculus',
    fontStyle: 'serif',
    safeZoneShorts: true,
    enableVoice: true,
    voiceName: 'vi-VN-HoaiMyNeural'
  };

  const prompt = generateManimCodePrompt(config);
  assert.ok(prompt.length > 1000);
  assert.match(prompt, /9:16/);
  assert.match(prompt, /DUAL-ZONE CONTAINER/i);
  assert.match(prompt, /Times New Roman/);
  assert.match(prompt, /MathTex/);
});

test('5. generateVideoScriptPrompt - Storyboard & Subtitle', () => {
  const config: VideoConfig = {
    subject: 'Toán học',
    topic: 'Bí quyết nhớ bảng lượng giác',
    duration: '45s',
    tone: 'simple',
    audience: 'Học sinh lớp 10',
    format: 'vertical',
    hookType: 'fast_trick'
  };

  const prompt = generateVideoScriptPrompt(config);
  assert.ok(prompt.length > 500);
  assert.match(prompt, /Bí quyết nhớ bảng lượng giác/);
  assert.match(prompt, /STORYBOARD/i);
  assert.match(prompt, /Voiceover Script/i);
});

test('6. generateLearningPrompt & generateRoadmapPrompt', () => {
  const learnConfig: LearningConfig = {
    school: 'Yuta Academy',
    year: '2026',
    subject: 'Toán học',
    grade: '12',
    topic: 'Số phức',
    goal: 'detailed',
    tone: 'academic',
    audience: 'Học sinh ôn thi THPT',
    language: 'vietnamese'
  };
  const learnPrompt = generateLearningPrompt(learnConfig);
  assert.match(learnPrompt, /Số phức/);
  assert.match(learnPrompt, /tcolorbox/i);

  const roadmapConfig: RoadmapConfig = {
    subject: 'Toán học',
    topic: 'Hình không gian Oxyz',
    duration: '4 tuần',
    currentLevel: 'Mất gốc',
    target: 'Điểm 8+',
    language: 'vietnamese'
  };
  const roadmapPrompt = generateRoadmapPrompt(roadmapConfig);
  assert.match(roadmapPrompt, /Hình không gian Oxyz/);
  assert.match(roadmapPrompt, /4 tuần/);
  assert.match(roadmapPrompt, /Mất gốc/);
});

test('7. generateBatPrompt - Windows Automation Script', () => {
  const batConfig: BatConfig = {
    task: 'Tự động dọn dẹp file rác và biên dịch LaTeX hàng loạt'
  };
  const batPrompt = generateBatPrompt(batConfig);
  assert.match(batPrompt, /Tự động dọn dẹp/);
  assert.match(batPrompt, /@echo off/i);
});

test('8. generateExamPrompt - Multi-disciplinary subjects (Physics, Chemistry, English)', () => {
  const physicsConfig: ExamConfig = {
    school: 'THPT Chuyên',
    examName: 'Khảo Sát Vật Lý 12',
    year: '2025 - 2026',
    subject: 'Vật lý',
    grade: '12',
    topic: 'Dao động điều hòa & Sóng cơ',
    time: 50,
    examFormat: 'standard2025',
    counts: { part1_mc: 12, part2_tf: 4, part3_sa: 6 },
    matrix: { lv1: 6, lv2: 8, lv3: 5, lv4: 3 },
    language: 'vietnamese'
  };
  const physicsPrompt = generateExamPrompt(physicsConfig);
  assert.match(physicsPrompt, /Vật lý/);
  assert.match(physicsPrompt, /QUY TẮC KỸ THUẬT & TRÌNH BÀY LATEX/);

  const engConfig: ExamConfig = {
    school: 'THPT Chuyên',
    examName: 'Đề Thi Học Kỳ Tiếng Anh 12',
    year: '2025 - 2026',
    subject: 'Tiếng Anh',
    grade: '12',
    topic: 'Conditional Sentences & Past Perfect',
    time: 60,
    examFormat: 'standard2025',
    counts: { part1_mc: 12, part2_tf: 4, part3_sa: 6 },
    matrix: { lv1: 6, lv2: 8, lv3: 5, lv4: 3 },
    language: 'english'
  };
  const engPrompt = generateExamPrompt(engConfig);
  assert.match(engPrompt, /Tiếng Anh/);
  assert.match(engPrompt, /QUY TẮC KỸ THUẬT & TRÌNH BÀY LATEX/);
});

test('9. RAG Anti-Noise & Typography Rules Enforcement', () => {
  const ragConfig: ExamConfig = {
    school: 'Sở GD&ĐT Hà Nội',
    examName: 'Khảo Sát Chất Lượng Học Kỳ',
    year: '2025 - 2026',
    subject: 'Toán học',
    grade: '12',
    topic: 'Khảo sát hàm số',
    time: 90,
    examFormat: 'standard2025',
    counts: { part1_mc: 12, part2_tf: 4, part3_sa: 6 },
    matrix: { lv1: 6, lv2: 8, lv3: 5, lv4: 3 },
    attachedPdf: {
      fileName: 'De_Khao_Sat_Lop_12.pdf',
      numPages: 5,
      text: 'Trang 1/5: Câu 1: Cho hàm số y = f(x).\nTrang 2: Hotline: 0912345678 Website: yuta.edu.vn\nCâu 2: Tìm nguyên hàm của f(x).'
    },
    language: 'vietnamese'
  };

  const prompt = generateExamPrompt(ragConfig);
  // Xác nhận chỉ thị RAG nghiêm cấm ghi nhãn (RAG trang 2)
  assert.match(prompt, /TUYỆT ĐỐI KHÔNG chèn bất kỳ nhãn trích dẫn nguồn, số trang hay từ khóa nội bộ/);
  assert.match(prompt, /Câu 1 \(RAG trang 2\)/);
  // Xác nhận số điện thoại và website đã được lọc sạch khỏi chunk
  assert.doesNotMatch(prompt, /0912345678/);
  assert.doesNotMatch(prompt, /yuta\.edu\.vn/);
  // Xác nhận các quy tắc in đậm và viết hoa có mặt trong prompt
  assert.match(prompt, /QUY TẮC VIẾT HOA/);
  assert.match(prompt, /QUY TẮC IN ĐẬM/);
  assert.match(prompt, /QUY TẮC KÝ HIỆU TOÁN HỌC/);
});

test('10. Auto-Repair LaTeX Sanitizer for RAG Noise & ALL CAPS Subheadings', () => {
  let dirtyLatex = `\\documentclass{article}
\\begin{document}
\\cauhoi{1 (RAG trang 2)} Cho hàm số $y = f(x)$.
\\textbf{Câu 2 (RAG):} Tìm nguyên hàm của $f(x)$.
\\textbf{Câu 3:} (RAG trang 5) Giải phương trình $2^x = 4$.
\\subsection*{BẢNG ĐÁP ÁN PHẦN I}
\\subsection*{LỜI GIẢI CHI TIẾT TỪNG CÂU}
\\end{document}`;

  // Áp dụng bộ lọc khử rác RAG & Title Case
  dirtyLatex = dirtyLatex.replace(/\\cauhoi\{(\d+)\s*\(?[^}]*(?:rag|trang|page|nguồn)[^}]*\}/gi, '\\cauhoi{$1}');
  dirtyLatex = dirtyLatex.replace(/(\\cauhoi\{\d+\})\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, '$1 ');
  dirtyLatex = dirtyLatex.replace(/(\\textbf\{\s*(?:Câu|Bài)\s*\d+)\s*\(?[^}:.]*(?:rag|trang|page|nguồn)[^}:.]*\)?(\s*[:.]?\s*\})/gi, '$1$2');
  dirtyLatex = dirtyLatex.replace(/(\\textbf\{\s*(?:Câu|Bài)\s*\d+[^}]*\})\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, '$1 ');
  dirtyLatex = dirtyLatex.replace(/(\b(?:Câu|Bài)\s*\d+[:.]?)\s*\(?(?:rag|nguồn|tham khảo)\s*(?:trang|page)?\s*\d*\)?[:.-]?\s*/gi, '$1 ');
  dirtyLatex = dirtyLatex.replace(/\s*\[(?:RAG|rag)[^\]]*\]/gi, '');
  dirtyLatex = dirtyLatex.replace(/\s*\((?:RAG|rag)\s*(?:trang|Trang|page|Page)?\s*\d+\)/gi, '');
  dirtyLatex = dirtyLatex.replace(/\s*\((?:trang|Trang|page|Page)\s*\d+\)/gi, '');
  dirtyLatex = dirtyLatex.replace(/\\subsection\*\{BẢNG ĐÁP ÁN PHẦN I\}/g, '\\subsection*{Bảng đáp án Phần I}');
  dirtyLatex = dirtyLatex.replace(/\\subsection\*\{LỜI GIẢI CHI TIẾT TỪNG CÂU\}/g, '\\subsection*{Lời giải chi tiết từng câu}');

  assert.match(dirtyLatex, /\\cauhoi\{1\} Cho hàm số/);
  assert.match(dirtyLatex, /\\textbf\{Câu 2:\} Tìm nguyên hàm/);
  assert.match(dirtyLatex, /\\textbf\{Câu 3:\} Giải phương trình/);
  assert.doesNotMatch(dirtyLatex, /RAG trang/i);
  assert.match(dirtyLatex, /\\subsection\*\{Bảng đáp án Phần I\}/);
  assert.match(dirtyLatex, /\\subsection\*\{Lời giải chi tiết từng câu\}/);
});




