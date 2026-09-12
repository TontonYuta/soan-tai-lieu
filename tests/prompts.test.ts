import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateExamPrompt,
  generateLearningPrompt,
  generateRoadmapPrompt,
  generateWorksheetPrompt,
  generateSimilarPrompt,
  generateManimStoryboardPrompt,
  generateManimCodePrompt,
  generateVideoManimPrompt,
  generateVideoScriptPrompt,
  generateBatPrompt,
  generateManimRevisionPrompt,
  extractAttachedImageDirective,
  generateProjectPrompt,
  generateLatexRevisionPrompt,
  parseDurationToSeconds,
  detectOptimalDurationFromPdf,
  getExerciseAndRoundPlan,
  getFontDirective,
  inspectManimCode
} from '../services/gemini';

import { ExamConfig, WorksheetConfig, VideoConfig, SimilarExerciseConfig, LearningConfig, RoadmapConfig, BatConfig, ProjectConfig } from '../types';

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
test("11. Adaptive Visual Layouts & Visual Macros (cauhoicohinh, khungnhap, cards)", () => {
  const wsConfig: WorksheetConfig = {
    subject: "Toán học",
    grade: "12",
    topic: "Hình học không gian Oxyz",
    teacherName: "Thầy Yuta",
    language: "vietnamese"
  };
  const wsPrompt = generateWorksheetPrompt(wsConfig);
  assert.match(wsPrompt, /\\cauhoicohinh/);
  assert.match(wsPrompt, /\\khungnhap/);
  assert.match(wsPrompt, /\\hopkienthuc/);
  assert.match(wsPrompt, /\\phuongphap/);
  assert.match(wsPrompt, /\\luuy/);
  assert.match(wsPrompt, /BỐ CỤC THÍCH ỨNG THEO CHỦ ĐỀ/);

  const examConfig: ExamConfig = {
    school: "Chuyên Sư Phạm",
    examName: "Thi Thử THPTQG",
    year: "2026",
    subject: "Toán học",
    grade: "12",
    topic: "Khảo sát hàm số",
    time: 90,
    examFormat: "standard2025",
    counts: { part1_mc: 12, part2_tf: 4, part3_sa: 6 },
    matrix: { lv1: 6, lv2: 8, lv3: 5, lv4: 3 },
    includeTikZ: true,
    language: "vietnamese"
  };
  const examPrompt = generateExamPrompt(examConfig);
  assert.match(examPrompt, /\\cauhoicohinh/);
  assert.match(examPrompt, /BỐ CỤC TRỰC QUAN THÍCH ỨNG/);
});

test("12. Compact Visual Header in Worksheet & Learning (No bulky titlepage)", () => {
  const wsConfig: WorksheetConfig = {
    subject: "Vật lý",
    grade: "11",
    topic: "Mạch điện một chiều",
    teacherName: "Cô Lan",
    language: "vietnamese"
  };
  const wsPrompt = generateWorksheetPrompt(wsConfig);
  assert.match(wsPrompt, /HEADER TINH GỌN/);
  assert.match(wsPrompt, /PHIẾU BÀI TẬP: \[TÊN CHỦ ĐỀ\]/);
  assert.doesNotMatch(wsPrompt, /\\begin\{titlepage\}/);

  const learnConfig: LearningConfig = {
    school: "Yuta Studio",
    year: "2026",
    subject: "Hóa học",
    grade: "10",
    topic: "Liên kết hóa học & Tinh thể",
    goal: "detailed",
    tone: "academic",
    audience: "Học sinh chuyên Hóa",
    language: "vietnamese"
  };
  const learnPrompt = generateLearningPrompt(learnConfig);
  assert.match(learnPrompt, /ADAPTIVE VISUAL HIERARCHY/);
  assert.match(learnPrompt, /\\hopkienthuc/);
  assert.match(learnPrompt, /\\phuongphap/);
  assert.match(learnPrompt, /\\luuy/);
});
test("13. Manim & Script: Balanced Intro, Non-overflowing Problem Titles, RAG Accuracy, No AI Cliches", () => {
  const videoConfig: VideoConfig = {
    subject: "Toán học",
    topic: "Cực trị của hàm số bậc ba chứa tham số m",
    duration: "90s",
    tone: "academic",
    audience: "Học sinh lớp 12",
    format: "vertical",
    attachedPdf: {
      fileName: "Chuyen_De_Cuc_Tri.pdf",
      numPages: 4,
      text: "Định nghĩa: Điểm x0 được gọi là điểm cực đại của hàm số f(x) nếu f(x) <= f(x0)."
    }
  };

  const manimCodePrompt = generateManimCodePrompt(videoConfig);
  // Xác nhận chỉ thị dàn đều tiêu đề intro và chống tràn box cho đề bài
  assert.match(manimCodePrompt, /TIÊU ĐỀ INTRO DÀN ĐỀU & ĐỀ BÀI CHỐNG TRÀN BOX/);
  assert.match(manimCodePrompt, /Trình bày chuẩn xác theo tài liệu PDF đính kèm/);

  const fullVideoPrompt = generateVideoManimPrompt(videoConfig);
  assert.match(fullVideoPrompt, /KHÁI NIỆM & LÝ THUYẾT CHUẨN MỰC/);
  assert.match(fullVideoPrompt, /TÊN ĐỀ BÀI & CÂU HỎI/);
  // Xác nhận tuyệt đối không còn từ ngữ AI sáo rỗng giật gân
  assert.doesNotMatch(fullVideoPrompt, /5 PHÂN CẢNH VÀNG/i);
  assert.doesNotMatch(fullVideoPrompt, /2 quy tắc vàng/i);
  assert.doesNotMatch(fullVideoPrompt, /thần chú/i);
  assert.doesNotMatch(fullVideoPrompt, /sinh tử/i);
  assert.doesNotMatch(fullVideoPrompt, /sống còn/i);

  const scriptPrompt = generateVideoScriptPrompt(videoConfig);
  assert.match(scriptPrompt, /MỞ ĐẦU THU HÚT & TRỰC DIỆN/);
  assert.doesNotMatch(scriptPrompt, /HOOK 3 GIÂY ĐẦU \(SINH TỬ\)/i);
  assert.doesNotMatch(scriptPrompt, /thần chú/i);
  assert.doesNotMatch(scriptPrompt, /sống còn/i);
});

test("14. Manim: Standard Superscript/Subscript, VÍ DỤ MINH HỌA badge & Visual Slow-down Pacing", () => {
  const videoConfig: VideoConfig = {
    subject: "Toán học",
    topic: "Đơn điệu và cực trị hàm bậc ba",
    duration: "60s",
    tone: "academic",
    audience: "Học sinh lớp 12",
    format: "vertical",
    renderQuality: "480p"
  };

  const manimCodePrompt = generateManimCodePrompt(videoConfig);
  // 1. Kiểm tra không còn Pill Badge "VÍ DỤ GỐC", mà đã đổi thành "Ví dụ minh họa" (Sentence case)
  assert.match(manimCodePrompt, /Ví dụ minh họa/i);
  assert.doesNotMatch(manimCodePrompt, /pill_txt = Text\("VÍ DỤ GỐC"/);

  // 2. Kiểm tra quy chuẩn chỉ số trên / chỉ số dưới và cấm unicode trong Text
  assert.match(manimCodePrompt, /CHỈ SỐ TRÊN\/DƯỚI/);
  assert.match(manimCodePrompt, /TUYỆT ĐỐI CẤM dùng ký tự unicode mũ/);
  // Xác nhận code mẫu không dùng unicode mũ trong Text
  assert.doesNotMatch(manimCodePrompt, /Text\(".*x³.*"\)/);
  assert.doesNotMatch(manimCodePrompt, /Text\(".*x².*"\)/);

  // 3. Kiểm tra quy chuẩn Typography: Mặc định font có chân (Times New Roman), hỗ trợ Be Vietnam Pro khi chọn sans
  assert.match(manimCodePrompt, /Times New Roman/);
  const manimCodePromptSans = generateManimCodePrompt({ ...videoConfig, fontStyle: 'sans' });
  assert.match(manimCodePromptSans, /Be Vietnam Pro/);

  // 4. Kiểm tra quy chuẩn nhịp độ (Pacing) vừa phải & không để khoảng chờ quá lâu
  assert.match(manimCodePrompt, /PACING & NHỊP ĐỘ DỨT KHOÁT/);
  assert.match(manimCodePrompt, /self\.wait\(0\.8\)/);
  assert.match(manimCodePrompt, /self\.wait\(1\.5\)/);

  // 5. Kiểm tra trong prompt tinh chỉnh sửa lỗi (Revision Prompt)
  const revisionPrompt = generateManimRevisionPrompt(
    videoConfig,
    'class MainScene(Scene): pass',
    'Sửa font chữ in đậm và giảm thời gian chờ'
  );
  assert.match(revisionPrompt, /Ví dụ minh họa/i);
  assert.match(revisionPrompt, /CHỈ SỐ TRÊN\/DƯỚI/);
  assert.match(revisionPrompt, /Times New Roman/);
  const revisionPromptSans = generateManimRevisionPrompt(
    { ...videoConfig, fontStyle: 'sans' },
    'class MainScene(Scene): pass',
    'Sửa font'
  );
  assert.match(revisionPromptSans, /Be Vietnam Pro/);
  assert.match(revisionPrompt, /PACING VỪA PHẢI/);
});

test("15. AutomationClient: Rerender Method & Direct Parameters Support", async () => {
  const { AutomationClient } = await import("../services/automationClient");
  assert.strictEqual(typeof AutomationClient.rerenderManim, "function");
  assert.strictEqual(typeof AutomationClient.rerenderLatex, "function");
});

test("16. Manim Typography & Snappy Pacing Rules Verification", () => {
  const videoConfig: VideoConfig = {
    subject: "Toán",
    topic: "Khảo sát hàm số",
    mathType: "calculus",
    simulationMode: "tangent_slope",
    duration: "90s",
    tone: "academic",
    audience: "Học sinh lớp 12",
    format: "vertical",
    renderQuality: "720p"
  };

  const codePrompt = generateManimCodePrompt(videoConfig);
  // Không được để các khoảng wait quá lâu như 3.0s hay 3.2s trong code mẫu
  assert.doesNotMatch(codePrompt, /self\.wait\(3\.2\)/);
  assert.doesNotMatch(codePrompt, /self\.wait\(3\.0\)/);
  assert.doesNotMatch(codePrompt, /self\.wait\(2\.5\)/);
  // Kiểm tra font mặc định là font có chân (Times New Roman)
  assert.match(codePrompt, /font="Times New Roman"/);
  // Kiểm tra khi chọn fontStyle: 'sans' thì trả về Be Vietnam Pro
  const sansPrompt = generateManimCodePrompt({ ...videoConfig, fontStyle: 'sans' });
  assert.match(sansPrompt, /font="Be Vietnam Pro"/);
  // Kiểm tra quy tắc không để khoảng chờ quá lâu
  assert.match(codePrompt, /Tuyệt đối không dừng quá lâu/i);
});

test("17. Manim Image Support & Extended Animation Presets Verification", () => {
  // 1. Kiểm tra trích xuất chỉ thị ảnh đính kèm (extractAttachedImageDirective)
  assert.strictEqual(extractAttachedImageDirective(undefined), "");
  assert.strictEqual(extractAttachedImageDirective(null), "");

  const attachedImg = {
    fileName: "hinh_hop_chu_nhat.png",
    filePath: "/home/tontonyuta/Downloads/assets/img_123_hinh_hop.png",
    previewUrl: "http://localhost:3000/api/view-image?path=/home/tontonyuta/Downloads/assets/img_123_hinh_hop.png",
    fileSize: 102400,
    description: "Hình hộp chữ nhật ABCD.A'B'C'D' có các cạnh a, b, c",
    layoutMode: "split_left" as const
  };

  const directive = extractAttachedImageDirective(attachedImg);
  assert.match(directive, /HÌNH ẢNH MINH HỌA ĐÍNH KÈM/);
  assert.match(directive, /hinh_hop_chu_nhat\.png/);
  assert.match(directive, /img_123_hinh_hop\.png/);
  assert.match(directive, /Chia đôi màn hình/);
  assert.match(directive, /Hình hộp chữ nhật ABCD/);
  // Quy tắc sống còn: CẤM VGroup(ImageMobject), BẮT BUỘC Group(...)
  assert.match(directive, /TUYỆT ĐỐI CẤM thêm ImageMobject vào VGroup/);
  assert.match(directive, /BẮT BUỘC DÙNG Group\(/i);

  // Kiểm tra các layout mode khác
  const directiveTopCard = extractAttachedImageDirective({ ...attachedImg, layoutMode: "top_card" });
  assert.match(directiveTopCard, /Bố cục Top Card/);

  const directiveOverlay = extractAttachedImageDirective({ ...attachedImg, layoutMode: "overlay" });
  assert.match(directiveOverlay, /Vẽ chú thích tương tác/);

  // 2. Kiểm tra VideoConfig tích hợp attachedImage vào generateManimCodePrompt và generateVideoManimPrompt
  const imgVideoConfig: VideoConfig = {
    subject: "Toán học",
    topic: "Thể tích khối hộp chữ nhật",
    mathType: "3d_geometry",
    simulationMode: "image_showcase",
    duration: "100s",
    tone: "academic",
    audience: "Học sinh 12",
    format: "vertical",
    renderQuality: "1080p",
    attachedImage: attachedImg
  };

  const manimCodeWithImg = generateManimCodePrompt(imgVideoConfig);
  assert.match(manimCodeWithImg, /HÌNH ẢNH MINH HỌA ĐÍNH KÈM/);
  assert.match(manimCodeWithImg, /img_123_hinh_hop\.png/);
  assert.match(manimCodeWithImg, /ImageMobject/);
  assert.match(manimCodeWithImg, /QUY TẮC SỬ DỤNG HÌNH ẢNH MINH HỌA/);

  const manimFullWithImg = generateVideoManimPrompt(imgVideoConfig);
  assert.match(manimFullWithImg, /HÌNH ẢNH MINH HỌA ĐÍNH KÈM/);
  assert.match(manimFullWithImg, /img_123_hinh_hop\.png/);

  // 3. Kiểm tra 5 Animation Presets chuyên sâu mới
  const presetsToTest: Array<{ mode: VideoConfig['simulationMode'], pattern: RegExp }> = [
    { mode: 'geometry_3d', pattern: /ThreeDScene|Khối đa diện 3D|set_camera_orientation/i },
    { mode: 'trigonometry', pattern: /lượng giác|Vector.*quay|đường tròn đơn vị/i },
    { mode: 'complex_numbers', pattern: /Argand|số phức|mặt phẳng phức/i },
    { mode: 'coordinate_oxyz', pattern: /Oxyz|trục tọa độ không gian/i },
    { mode: 'image_showcase', pattern: /ImageMobject|hình ảnh|sơ đồ/i }
  ];

  for (const preset of presetsToTest) {
    const pConfig: VideoConfig = {
      subject: "Toán",
      topic: "Mô phỏng chuyên sâu",
      mathType: "calculus",
      simulationMode: preset.mode,
      duration: "90s",
      tone: "academic",
      audience: "Học sinh 12",
      format: "vertical",
      renderQuality: "720p"
    };
    const pPrompt = generateManimCodePrompt(pConfig);
    assert.match(pPrompt, preset.pattern, `Preset ${preset.mode} must match pattern`);
  }
});

test("18. University Project & Thesis Generator Verification (1-Click & Clarity)", () => {
  // 1. Kiểm tra cấu hình 1-Click cơ bản (Chỉ cần Tên đề tài)
  const basicConfig: ProjectConfig = {
    title: "Xây dựng hệ thống RAG Hỏi đáp thông minh cho sinh viên Bách Khoa"
  };

  const basicPrompt = generateProjectPrompt(basicConfig);
  // Kiểm tra tên đề tài xuất hiện
  assert.match(basicPrompt, /Xây dựng hệ thống RAG/);
  // Kiểm tra giải tỏa mơ hồ: "BẮT ĐẦU TỪ ĐÂU"
  assert.match(basicPrompt, /BẮT ĐẦU TỪ ĐÂU/);
  assert.match(basicPrompt, /Giai đoạn 1/);
  assert.match(basicPrompt, /Giai đoạn 5/);
  // Kiểm tra cấu trúc 5 chương luận văn chuẩn mực
  assert.match(basicPrompt, /CHƯƠNG 1: GIỚI THIỆU/);
  assert.match(basicPrompt, /CHƯƠNG 2: CƠ SỞ LÝ THUYẾT/);
  assert.match(basicPrompt, /CHƯƠNG 3: THIẾT KẾ HỆ THỐNG/);
  assert.match(basicPrompt, /CHƯƠNG 4: HIỆN THỰC HÓA/);
  assert.match(basicPrompt, /CHƯƠNG 5: KẾT LUẬN/);
  // Kiểm tra bộ câu hỏi vấn đáp phản biện của Hội đồng
  assert.match(basicPrompt, /BỘ CÂU HỎI VẤN ĐÁP HỘI ĐỒNG BẢO VỆ/);

  // 2. Kiểm tra có RAG PDF từ giảng viên
  const ragConfig: ProjectConfig = {
    university: "Trường Đại học Công nghệ - ĐHQGHN",
    faculty: "Khoa Công nghệ Thông tin",
    major: "Trí tuệ Nhân tạo",
    title: "Phát hiện buồn ngủ của tài xế bằng Computer Vision",
    studentName: "Trần Văn C (MSSV: 20020100)",
    supervisor: "PGS.TS. Lê Văn D",
    projectType: "capstone_thesis",
    description: "Sử dụng camera hồng ngoại và mô hình MediaPipe Face Mesh kết hợp CNN-LSTM",
    outputScope: "full_report",
    standardFormat: "academic_vnu",
    language: "vietnamese",
    attachedPdf: {
      fileName: "De_Cuong_Do_An_Tot_Nghiep.pdf",
      numPages: 4,
      text: "Đề cương yêu cầu: Chương 3 phải so sánh EAR (Eye Aspect Ratio) và MAR (Mouth Aspect Ratio). Tối thiểu 30 FPS."
    }
  };

  const ragPrompt = generateProjectPrompt(ragConfig);
  assert.match(ragPrompt, /Trường Đại học Công nghệ/);
  assert.match(ragPrompt, /Phát hiện buồn ngủ của tài xế/);
  assert.match(ragPrompt, /MediaPipe Face Mesh/);
  assert.match(ragPrompt, /TÀI LIỆU ĐỀ CƯƠNG \/ HƯỚNG DẪN ĐÍNH KÈM TỪ GIẢNG VIÊN/);
  assert.match(ragPrompt, /Eye Aspect Ratio/);
  assert.match(ragPrompt, /TUYỆT ĐỐI KHÔNG chèn các nhãn rác/);

  // 3. Kiểm tra các ngôn ngữ và phạm vi đầu ra
  const engConfig: ProjectConfig = {
    title: "Autonomous Drone Path Planning using Reinforcement Learning",
    language: "english",
    outputScope: "proposal_roadmap"
  };
  const engPrompt = generateProjectPrompt(engConfig);
  assert.match(engPrompt, /100% TIẾNG ANH học thuật/);
  assert.match(engPrompt, /Đề cương nghiên cứu chi tiết & Lộ trình/);

  const defenseConfig: ProjectConfig = {
    title: "IoT Smart Agriculture Platform",
    outputScope: "defense_prep",
    language: "bilingual"
  };
  const defensePrompt = generateProjectPrompt(defenseConfig);
  assert.match(defensePrompt, /SONG NGỮ/);
  assert.match(defensePrompt, /Kịch bản thuyết trình, Slide outline/);
});

test("19. LaTeX On-Demand Rerender & AI Revision Prompt Verification", () => {
  // 1. Kiểm tra với config đầy đủ
  const fullConfig = {
    subject: "Toán học",
    topic: "Khảo sát sự biến thiên của hàm số bậc ba",
    grade: "12",
    documentType: "Phiếu bài tập nâng cao"
  };
  const existingLatex = "\\documentclass{article}\n\\begin{document}\n\\section{BÀI TẬP}\n\\end{document}";
  const feedback = "1. Bổ sung thêm 3 câu hỏi trắc nghiệm dạng bảng biến thiên\n2. Sửa đáp án câu 2 thành C\n3. Thêm hình vẽ TikZ minh họa tiếp tuyến";

  const promptWithConfig = generateLatexRevisionPrompt(fullConfig, existingLatex, feedback);

  assert.match(promptWithConfig, /Môn học: "Toán học"/);
  assert.match(promptWithConfig, /Chủ đề: "Khảo sát sự biến thiên của hàm số bậc ba"/);
  assert.match(promptWithConfig, /Khối lớp\/Trình độ: "12"/);
  assert.match(promptWithConfig, /Loại tài liệu: "Phiếu bài tập nâng cao"/);
  assert.match(promptWithConfig, /DANH SÁCH LỖI VÀ YÊU CẦU ĐIỀU CHỈNH TỪ NGƯỜI DÙNG/);
  assert.match(promptWithConfig, /Bổ sung thêm 3 câu hỏi trắc nghiệm/);
  assert.match(promptWithConfig, /MÃ NGUỒN LATEX HIỆN TẠI/);
  assert.match(promptWithConfig, /\\documentclass\{article\}/);
  assert.match(promptWithConfig, /Compact Visual Header/);
  assert.match(promptWithConfig, /pdflatex/);
  assert.match(promptWithConfig, /QUY TẮC CHỐNG RÁC RAG/);
  assert.match(promptWithConfig, /TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ LATEX/);

  // 2. Kiểm tra fallback khi config null/undefined
  const promptWithoutConfig = generateLatexRevisionPrompt(null, existingLatex, "Đổi font sang Be Vietnam Pro");
  assert.match(promptWithoutConfig, /Môn học: Toán học \/ Khoa học/);
  assert.match(promptWithoutConfig, /Đổi font sang Be Vietnam Pro/);
});

test("20. Manim 300s Long-Form Video & Scaled Pedagogical Practice Practice Scaling", () => {
  // 1. Kiểm tra parseDurationToSeconds
  assert.equal(parseDurationToSeconds('300s'), 300);
  assert.equal(parseDurationToSeconds('300 giây'), 300);
  assert.equal(parseDurationToSeconds('5 phút'), 300);
  assert.equal(parseDurationToSeconds('3 - 5 phút'), 240);
  assert.equal(parseDurationToSeconds('100 - 120 giây'), 110);
  assert.equal(parseDurationToSeconds('180s'), 180);
  assert.equal(parseDurationToSeconds('60 giây (Shorts)'), 60);
  assert.equal(parseDurationToSeconds(undefined, 110), 110);

  // 2. Kiểm tra getExerciseAndRoundPlan
  const plan300 = getExerciseAndRoundPlan(300);
  assert.equal(plan300.exerciseCount, 6);
  assert.equal(plan300.roundCount, 3);

  const planExplicit8 = getExerciseAndRoundPlan(300, 8);
  assert.equal(planExplicit8.exerciseCount, 8);
  assert.equal(planExplicit8.roundCount, 4);

  const plan60 = getExerciseAndRoundPlan(60);
  assert.equal(plan60.exerciseCount, 2);
  assert.equal(plan60.roundCount, 1);

  const plan120 = getExerciseAndRoundPlan(120);
  assert.equal(plan120.exerciseCount, 4);
  assert.equal(plan120.roundCount, 2);

  // 3. Kiểm tra generateManimStoryboardPrompt cho video 300s
  const config300: VideoConfig = {
    subject: "Toán học",
    topic: "Chuyên đề Khảo sát Hàm số & Cực trị Chuyên sâu",
    duration: "300s",
    tone: "academic",
    audience: "Học sinh 12 luyện thi ĐGNL & THPTQG",
    format: "vertical",
    simulationMode: "calculus"
  };

  const storyboardPrompt = generateManimStoryboardPrompt(config300);
  assert.match(storyboardPrompt, /300 giây/);
  assert.match(storyboardPrompt, /855 TỪ/i);
  assert.match(storyboardPrompt, /BÀI TẬP THỰC CHIẾN THEO TỪNG DẠNG BÀI/i);
  assert.match(storyboardPrompt, /DẠNG BÀI 1/);
  assert.match(storyboardPrompt, /DẠNG BÀI 2/);
  assert.match(storyboardPrompt, /DẠNG BÀI 3/);
  assert.match(storyboardPrompt, /FadeOut/);

  // 4. Kiểm tra generateManimCodePrompt cho video 300s
  const codePrompt = generateManimCodePrompt(config300);
  assert.match(codePrompt, /300s/);
  assert.match(codePrompt, /855 từ/);
  assert.match(codePrompt, /Bài tập thực chiến theo từng dạng bài/);
  assert.match(codePrompt, /3 dạng bài/);
  assert.match(codePrompt, /6 câu hỏi/);
  assert.match(codePrompt, /FadeOut\(part_group\)/);

  // 5. Kiểm tra generateVideoManimPrompt cho video 300s
  const fullPrompt = generateVideoManimPrompt(config300);
  assert.match(fullPrompt, /300 giây/);
  assert.match(fullPrompt, /855 từ/);
  assert.match(fullPrompt, /6 câu hỏi trọng tâm chia theo 3 dạng bài/);
  assert.match(fullPrompt, /Bài tập thực chiến theo từng dạng bài/);
});

test("21. Manim Serif Font Default, Sentence Case, Snug Fit Boxes, Atomic Options & Normalized Tangent Verification", () => {
  // 1. Kiểm tra getFontDirective: Mặc định là Serif (Times New Roman), Sans trả về Be Vietnam Pro
  assert.strictEqual(getFontDirective(undefined), 'Times New Roman');
  assert.strictEqual(getFontDirective('serif'), 'Times New Roman');
  assert.strictEqual(getFontDirective('sans'), 'Be Vietnam Pro');

  // 2. Cấu hình bài toán chuẩn
  const config: VideoConfig = {
    subject: "Toán học",
    topic: "Khảo sát sự biến thiên của hàm số",
    duration: "120s",
    tone: "academic",
    audience: "Học sinh lớp 12",
    format: "vertical",
    simulationMode: "calculus"
  };

  // 3. Kiểm tra generateVideoManimPrompt
  const videoPrompt = generateVideoManimPrompt(config);

  // 3.1. Font chữ có chân mặc định
  assert.match(videoPrompt, /Times New Roman/);

  // 3.2. Sentence Case chuẩn tiếng Việt (TUYỆT ĐỐI KHÔNG IN HOA)
  assert.match(videoPrompt, /QUY TẮC TUYỆT ĐỐI KHÔNG IN HOA/);
  assert.match(videoPrompt, /Sentence case/i);
  assert.doesNotMatch(videoPrompt, /Text\("KHẢO SÁT/);
  assert.doesNotMatch(videoPrompt, /Text\("VÍ DỤ/);
  assert.doesNotMatch(videoPrompt, /Text\("CÂU 1/);
  assert.doesNotMatch(videoPrompt, /Text\("CÂU 2/);
  assert.doesNotMatch(videoPrompt, /Text\("TỔNG KẾT/);
  assert.match(videoPrompt, /Ví dụ minh họa/);
  assert.match(videoPrompt, /Thực chiến/);
  assert.match(videoPrompt, /Câu 1: Đọc bảng biến thiên/);
  assert.match(videoPrompt, /Câu 2: Xét dấu đạo hàm/);
  assert.match(videoPrompt, /Tổng kết bí kíp/);

  // 3.3. Box bọc text chứa vừa khít nội dung (buff=0.12-0.15, text.width + 0.5)
  assert.match(videoPrompt, /QUY TẮC BOX BỌC TEXT CHỨA VỪA KHÍT NỘI DUNG/);
  assert.match(videoPrompt, /SurroundingRectangle\(.*buff=0\.1[2-5]/);
  assert.match(videoPrompt, /RoundedRectangle\(.*text\.width \+ 0\.5/);

  // 3.4. Bố cục 4 đáp án liền khối và dạng 4x1, 2x2 khóa 2 cột, 1x4
  assert.match(videoPrompt, /QUY TẮC BỐ CỤC 4 ĐÁP ÁN TRẮC NGHIỆM LIỀN KHỐI/);
  assert.match(videoPrompt, /ATOMIC OPTION ITEM/);
  assert.match(videoPrompt, /DẠNG 4x1/);
  assert.match(videoPrompt, /DẠNG 2x2/);
  assert.match(videoPrompt, /DẠNG 1x4/);
  assert.match(videoPrompt, /col1 = VGroup\(optA, optC\)/);
  assert.match(videoPrompt, /col2 = VGroup\(optB, optD\)/);

  // 3.5. Tiếp tuyến chuẩn mực theo c1_HamSo_DonDieu.py
  assert.match(videoPrompt, /QUY TẮC TIẾP TUYẾN ĐỒ THỊ CHUẨN MỰC/);
  assert.match(videoPrompt, /p1 = axes\.c2p\(t - dx, y - m \* dx\)/);
  assert.match(videoPrompt, /p2 = axes\.c2p\(t \+ dx, y \+ m \* dx\)/);

  // 3.6. Quy tắc Ưu tiên 1 dòng & Chống xuống dòng vô tội vạ
  assert.match(videoPrompt, /QUY TẮC ƯU TIÊN 1 DÒNG/);
  assert.match(videoPrompt, /CHỐNG XUỐNG DÒNG VÔ TỘI VẠ/);

  // 4. Kiểm tra generateManimCodePrompt
  const codePrompt = generateManimCodePrompt(config);
  assert.match(codePrompt, /font="Times New Roman"/);
  assert.match(codePrompt, /TUYỆT ĐỐI KHÔNG IN HOA/);
  assert.match(codePrompt, /QUY TẮC BOX BỌC TEXT CHỨA VỪA KHÍT/);
  assert.match(codePrompt, /QUY TẮC BỐ CỤC 4 ĐÁP ÁN TRẮC NGHIỆM LIỀN KHỐI/);
  assert.match(codePrompt, /TIẾP TUYẾN CHUẨN MỰC THEO c1_HamSo_DonDieu\.py/);
  assert.match(codePrompt, /QUY TẮC ƯU TIÊN 1 DÒNG/);

  // 5. Kiểm tra generateManimRevisionPrompt
  const revPrompt = generateManimRevisionPrompt(config, "class MainScene(Scene): pass", "Sửa bố cục 4 đáp án sang 2x2");
  assert.match(revPrompt, /Font chữ chỉ định: "Times New Roman"/);
  assert.match(revPrompt, /Sentence case chuẩn tiếng Việt/);
  assert.match(revPrompt, /QUY TẮC ƯU TIÊN 1 DÒNG, BOX VỪA KHÍT, TIẾP TUYẾN/);
  assert.match(revPrompt, /TIẾP TUYẾN CHUẨN MỰC/);
  assert.match(revPrompt, /BỐ CỤC 4 ĐÁP ÁN LIỀN KHỐI/);
});

test('22. Manim Intro Single-Line Rules & Anti-2x2 MathTex Sanitizer Verification', async () => {
  const config: VideoConfig = {
    subject: "Toán học",
    topic: "Giá trị lớn nhất và giá trị nhỏ nhất của hàm số",
    duration: "60 giây (Shorts)",
    format: "vertical",
    tone: "academic",
    audience: "Học sinh 12",
  };

  const codePrompt22 = generateManimCodePrompt(config);
  assert.match(codePrompt22, /NGUYÊN TẮC CÔNG THỨC INTRO/);
  assert.match(codePrompt22, /ĐÚNG 1 DÒNG ĐƠN duy nhất/);
  assert.match(codePrompt22, /TUYỆT ĐỐI KHÔNG ngắt dòng bằng/);
  assert.match(codePrompt22, /fit_width\(intro_core_rule, 7\.6\)/);

  const videoPrompt22 = generateVideoManimPrompt(config);
  assert.match(videoPrompt22, /NGUYÊN TẮC CÔNG THỨC INTRO/);
  assert.match(videoPrompt22, /fit_width\(intro_core_rule, 7\.6\)/);

  const { AutomationRunner } = await import('../server/automationRunner');
  const brokenCode = `
class MainScene(Scene):
    def construct(self):
        intro_core_rule = VGroup(
            MathTex(r"M = \\max_{[a; b]} f(x) \\iff f(x) \\le M \\\\\\;\\text{và}\\; \\exists x_0: f(x_0) = M", font_size=25, color=GREEN_B),
            MathTex(r"m = \\min_{[a; b]} f(x) \\iff f(x) \\ge m \\\\\\;\\text{và}\\; \\exists x_0: f(x_0) = m", font_size=25, color=RED_B)
        ).arrange(DOWN, buff=0.22)
`;
  const sanitized = AutomationRunner.prepareManimPythonCode(brokenCode);
  assert.ok(sanitized.includes('\\quad \\text{và} \\quad'), 'Phải thay thế \\\\\\;\\text{và}\\; thành \\quad \\text{và} \\quad');
  assert.ok(sanitized.includes('fit_width(intro_core_rule, 7.6)'), 'Phải tự động chèn fit_width(intro_core_rule, 7.6)');

  const split4Code = `
class MainScene(Scene):
    def construct(self):
        intro_core_rule = VGroup(
            MathTex(r"M = \\max_{[a; b]} f(x) \\iff f(x) \\le M", font_size=25, color=GREEN_B),
            MathTex(r"\\text{và } \\exists x_0 \\in [a; b]: f(x_0) = M", font_size=25, color=GREEN_B),
            MathTex(r"m = \\min_{[a; b]} f(x) \\iff f(x) \\ge m", font_size=25, color=RED_B),
            MathTex(r"\\text{và } \\exists x_0 \\in [a; b]: f(x_0) = m", font_size=25, color=RED_B)
        ).arrange(DOWN, buff=0.22)
`;
  const sanitized4 = AutomationRunner.prepareManimPythonCode(split4Code);
  assert.ok(sanitized4.includes('f(x) \\le M \\quad \\text{và} \\quad \\exists x_0'), 'Phải tự động gộp 2 MathTex Max bị tách thành 1 MathTex duy nhất');
  assert.ok(sanitized4.includes('f(x) \\ge m \\quad \\text{và} \\quad \\exists x_0'), 'Phải tự động gộp 2 MathTex Min bị tách thành 1 MathTex duy nhất');
});

test('23. Modular Manim Prompts & Zero-Hallucination Syntax Guard Verification', async () => {
  const {
    MANIM_SKILLS_GUIDE,
    generateManimCodePrompt,
    generateVideoManimPrompt,
    generateManimStoryboardPrompt,
    generateManimRevisionPrompt,
    getSimulationModeDescription,
  } = await import('../services/prompts/manim');

  // Verify exports exist and are valid functions/strings
  assert.strictEqual(typeof MANIM_SKILLS_GUIDE, 'string');
  assert.strictEqual(typeof generateManimCodePrompt, 'function');
  assert.strictEqual(typeof generateVideoManimPrompt, 'function');
  assert.strictEqual(typeof generateManimStoryboardPrompt, 'function');
  assert.strictEqual(typeof generateManimRevisionPrompt, 'function');
  assert.strictEqual(typeof getSimulationModeDescription, 'function');

  // Verify Rule 16 in MANIM_SKILLS_GUIDE
  assert.match(MANIM_SKILLS_GUIDE, /16\.\s+QUY TẮC CỐT TỬ CHỐNG ẢO GIÁC CÚ PHÁP MANIM CE/);
  assert.match(MANIM_SKILLS_GUIDE, /ZERO-HALLUCINATION SYNTAX GUARD/);
  assert.match(MANIM_SKILLS_GUIDE, /ReplacementTransform/);
  assert.match(MANIM_SKILLS_GUIDE, /ThreeDScene/);

  // Verify simulation mode description presets
  assert.match(getSimulationModeDescription('3d_geometry'), /ThreeDScene/);
  assert.match(getSimulationModeDescription('complex_numbers'), /ARGAND/i);
  assert.match(getSimulationModeDescription('stem_modeling'), /STEM/);

  // Verify generated prompts include Rule 16 guard
  const config: VideoConfig = {
    subject: "Hình học không gian",
    topic: "Góc giữa đường thẳng và mặt phẳng",
    duration: "60 giây (Shorts)",
    format: "vertical",
    tone: "academic",
    audience: "Học sinh 12",
  };
  const codePrompt = generateManimCodePrompt(config);
  assert.match(codePrompt, /ZERO-HALLUCINATION SYNTAX GUARD/);
  assert.match(codePrompt, /CỐT TỬ CHỐNG ẢO GIÁC CÚ PHÁP/);
});

test('24. CucTri & DonDieu Gold Standard Verification (Smart Snap Badge, Even Multiplicity Trap & LaggedStart Outro)', async () => {
  const {
    MANIM_SKILLS_GUIDE,
    generateVideoManimPrompt,
    getSimulationModeDescription,
  } = await import('../services/prompts/manim');

  // 1. Verify Rule 17 exists and covers the 3 critical concepts & even multiplicity trap
  assert.match(MANIM_SKILLS_GUIDE, /17\.\s+QUY TẮC PHÂN BIỆT THUẬT NGỮ TOÁN HỌC & BẪY NGHIỆM BỘI CHẴN/);
  assert.match(MANIM_SKILLS_GUIDE, /Điểm cực trị của hàm số/);
  assert.match(MANIM_SKILLS_GUIDE, /Giá trị cực trị/);
  assert.match(MANIM_SKILLS_GUIDE, /Điểm cực trị của đồ thị hàm số/);
  assert.match(MANIM_SKILLS_GUIDE, /BẪY NGHIỆM BỘI CHẴN/);
  assert.match(MANIM_SKILLS_GUIDE, /MINI BBT CARD/);

  // 2. Verify Smart Snap Status Badge in Guide and Video Prompt
  assert.match(MANIM_SKILLS_GUIDE, /SNAP-TO-CRITICAL STATUS BADGE/);
  assert.match(MANIM_SKILLS_GUIDE, /abs\(t - \(-1\.0\)\) < 0\.16/);

  const config: VideoConfig = {
    subject: "Toán học 12",
    topic: "Cực trị của hàm số",
    duration: "110 giây",
    format: "vertical",
    tone: "academic",
    audience: "Học sinh 12",
    simulationMode: "calculus",
  };
  const videoPrompt = generateVideoManimPrompt(config);
  assert.match(videoPrompt, /LaggedStart/);
  assert.match(videoPrompt, /lag_ratio=0\.3/);
  assert.match(videoPrompt, /scale=0\.85/);
  assert.match(videoPrompt, /abs\(t - \(-1\.0\)\) < 0\.16/);

  // 3. Verify calculus simulation description references both benchmark files
  const calcDesc = getSimulationModeDescription('calculus');
  assert.match(calcDesc, /c1_HamSo_DonDieu\.py & c1_HamSo_CucTri\.py/);
  assert.match(calcDesc, /bắt điểm cực trị/);
  assert.match(calcDesc, /nghiệm bội chẵn/);
});

test('25. AI Double-Check Engine (Heuristic Linter & AI Critic Prompt)', async () => {
  const {
    inspectManimCode,
    generateManimDoubleCheckPrompt,
  } = await import('../services/prompts/manim');

  // 1. Inspect clean gold-standard sample code
  const cleanCode = `
VOICEOVER_SCRIPT = """
Chào các em học sinh, hôm nay chúng ta cùng tìm hiểu về cực trị của hàm số qua mô phỏng trực quan.
Đầu tiên, hãy nhớ lại định nghĩa: một điểm được gọi là điểm cực đại nếu giá trị của hàm số tại đó lớn hơn hoặc bằng các điểm lân cận.
Quan sát trên đồ thị, khi tiếp tuyến đi qua điểm cực đại, hệ số góc sẽ chuyển từ dương sang âm, và tiếp tuyến nằm ngang song song trục hoành.
Bây giờ chúng ta cùng theo dõi chuyển động thực tế nhé.
"""
from manim import *
class CucTri(Scene):
    def construct(self):
        def fit_width(mob, max_width=7.8):
            if mob.width > max_width: mob.scale(max_width / mob.width)
            return mob
        axes = Axes(x_range=[-3, 3, 1], y_range=[-2, 4, 1], x_length=6.8, y_length=3.8)
        intro_core_rule = VGroup(
            MathTex(r"M = \\max f(x) \\iff f(x) \\le M \\quad \\text{và} \\quad \\exists x_0: f(x_0) = M", font_size=24)
        ).arrange(DOWN, buff=0.25)
        fit_width(intro_core_rule, 7.6)
        snug_rect = SurroundingRectangle(intro_core_rule, buff=0.15, corner_radius=0.12)
        t_tracker = ValueTracker(-2.5)
        status_badge = always_redraw(lambda: VGroup(
            RoundedRectangle(width=3.6, height=0.7, corner_radius=0.15),
            Text("x = -1: CỰC ĐẠI" if abs(t_tracker.get_value() - (-1.0)) < 0.16 else "Đang quét", font="Be Vietnam Pro", font_size=22)
        ))
        self.play(FadeIn(axes), FadeIn(intro_core_rule), FadeIn(snug_rect))
        self.wait(2.0)
        self.play(FadeOut(axes), FadeOut(intro_core_rule), FadeOut(snug_rect))
        outro = VGroup(
            Text("Kênh Toán Thầy Yuta", font="Be Vietnam Pro", font_size=28)
        )
        self.play(LaggedStart(FadeIn(outro), lag_ratio=0.3))
        self.wait(3.0)
`;

  const cleanReport = inspectManimCode(cleanCode, { format: 'vertical', duration: '30 giây' });
  assert.equal(cleanReport.passed, true);
  assert.ok(cleanReport.overallScore >= 80, `Expected score >= 80, got ${cleanReport.overallScore}`);
  assert.equal(cleanReport.metrics.hasFitWidth, true);
  assert.equal(cleanReport.metrics.hasSingleLineIntro, true);
  assert.equal(cleanReport.metrics.hasSnugBoxes, true);
  assert.equal(cleanReport.metrics.hasSmartStatusBadge, true);
  assert.equal(cleanReport.metrics.hasZeroOverlapFadeOut, true);
  assert.equal(cleanReport.metrics.outroSafe, true);

  // 2. Inspect code with typical layout, typography, and pedagogy violations
  const violatingCode = `
from manim import *
class CucTriViolating(Scene):
    def construct(self):
        title = Text("TÌM CỰC TRỊ CỦA HÀM SỐ BẬC BA", font="Arial", font_size=36)
        axes = Axes(x_range=[-3, 3, 1], y_range=[-2, 4, 1], x_length=7.5, y_length=5.2)
        intro_core_rule = VGroup(
            MathTex(r"M = \\max f(x) \\iff f(x) \\le M \\\\ \\text{và } \\exists x_0 \\in [a;b]", font_size=28)
        ).arrange(DOWN, buff=0.35)
        self.play(Write(title), Create(axes), Write(intro_core_rule))
        # Missing FadeOut before outro
        outro = Text("KẾT THÚC", font="Be Vietnam Pro")
        self.play(Write(outro))
        self.play(FadeOut(outro))
        self.wait(1)
`;

  const violatingReport = inspectManimCode(violatingCode, { format: 'vertical', duration: '110 giây' });
  assert.equal(violatingReport.passed, false);
  assert.ok(violatingReport.issues.length >= 4);

  // Verify specific issues were caught
  const issueIds = violatingReport.issues.map(i => i.id);
  assert.ok(issueIds.includes('missing_fit_width'), 'Should catch missing fit_width');
  assert.ok(issueIds.includes('intro_formula_line_break'), 'Should catch \\\\ in intro formula');
  assert.ok(issueIds.includes('axes_y_length_too_large'), 'Should catch y_length > 4.2');
  assert.ok(issueIds.includes('all_caps_title_violation'), 'Should catch ALL CAPS title');
  assert.ok(issueIds.includes('missing_voiceover_script'), 'Should catch missing voiceover script');
  assert.ok(issueIds.includes('outro_blackout_hazard'), 'Should catch outro FadeOut blackout');

  // 3. Verify generateManimDoubleCheckPrompt
  const checkPrompt = generateManimDoubleCheckPrompt(violatingCode, {
    subject: "Toán học 12",
    topic: "Cực trị hàm số",
    format: "vertical",
    duration: "110 giây",
    tone: "academic",
    audience: "Học sinh 12"
  }, violatingReport);

  assert.match(checkPrompt, /THẨM ĐỊNH KÉP \(DOUBLE-CHECK\)/);
  assert.match(checkPrompt, /BÁO CÁO THẨM ĐỊNH TỰ ĐỘNG BAN ĐẦU/);
  assert.match(checkPrompt, /missing_fit_width/);
  assert.match(checkPrompt, /intro_formula_line_break/);
  assert.match(checkPrompt, /axes_y_length_too_large/);
  assert.match(checkPrompt, /all_caps_title_violation/);
  assert.match(checkPrompt, /missing_voiceover_script/);
  assert.match(checkPrompt, /outro_blackout_hazard/);
  assert.match(checkPrompt, /17 QUY TẮC VÀNG STUDIO/);
  assert.match(checkPrompt, /Xuất toàn bộ file mã nguồn Manim Python/);
});

test('26. Antigravity Live Quota Synchronization & Metric Structure', async () => {
  const { AutomationClient } = await import('../services/automationClient');

  // 1. Verify getQuota method returns valid default structure
  const quota = await AutomationClient.getQuota();
  assert.ok(typeof quota.weekly === 'number');
  assert.ok(typeof quota.fiveHour === 'number');
  assert.ok(typeof quota.status === 'string');
  assert.ok(quota.weekly >= 0 && quota.weekly <= 100);
  assert.ok(quota.fiveHour >= 0 && quota.fiveHour <= 100);

  // 2. Verify quota threshold status logic
  const mockGroups = [
    {
      displayName: "Gemini Models",
      buckets: [
        { bucketId: "gemini-weekly", window: "weekly", remainingFraction: 0.8863 },
        { bucketId: "gemini-5h", window: "5h", remainingFraction: 0.7670 }
      ]
    },
    {
      displayName: "Claude and GPT models",
      buckets: [
        { bucketId: "3p-weekly", window: "weekly", remainingFraction: 1.0 },
        { bucketId: "3p-5h", window: "5h", remainingFraction: 0.95 }
      ]
    }
  ];

  const geminiWeekly = Math.round(mockGroups[0].buckets[0].remainingFraction * 100);
  const gemini5h = Math.round(mockGroups[0].buckets[1].remainingFraction * 100);
  const claudeWeekly = Math.round(mockGroups[1].buckets[0].remainingFraction * 100);

  assert.equal(geminiWeekly, 89);
  assert.equal(gemini5h, 77);
  assert.equal(claudeWeekly, 100);
});

test('27. Manim Card Title Hierarchy, Zero Redundant Boxes, Lean Conclusion & Anti-Shrink Legibility Verification', async () => {
  const { inspectManimCode } = await import('../services/prompts/manim');

  // 1. Kiểm tra linter phát hiện tiêu đề thẻ quá cỡ và bị bọc box
  const codeOversizedTitle = `
from manim import *
class TestOversizedTitle(Scene):
    def construct(self):
        c1_card = RoundedRectangle(width=8.4, height=6.4)
        c1_title = Text("CÂU 1: BÀI TẬP VẬN DỤNG", font_size=30)
        c1_title_box = SurroundingRectangle(c1_title, buff=0.2)
        fit_width(c1_title, 7.8)
        self.play(FadeOut(c1_card))
`;
  const reportTitle = inspectManimCode(codeOversizedTitle);
  assert.ok(reportTitle.issues.some(i => i.id === 'oversized_card_title'), 'Should detect oversized or boxed card title');
  assert.strictEqual(reportTitle.metrics.hasCleanTitleSizes, false);

  // 2. Kiểm tra linter phát hiện nhiều box không cần thiết (redundant boxes)
  const codeRedundantBoxes = `
from manim import *
class TestRedundantBoxes(Scene):
    def construct(self):
        c1_card = RoundedRectangle(width=8.4, height=6.4)
        c1_quest = Text("Cho hàm số f(x)...", font_size=22)
        quest_box = SurroundingRectangle(c1_quest, color=BLUE)
        step1 = Text("Bước 1: Tính đạo hàm...", font_size=22)
        step1_box = SurroundingRectangle(step1, color=YELLOW)
        fit_width(c1_quest, 7.8)
        self.play(FadeOut(c1_card))
`;
  const reportBoxes = inspectManimCode(codeRedundantBoxes);
  assert.ok(reportBoxes.issues.some(i => i.id === 'redundant_boxes_hazard'), 'Should detect redundant box inception wrapping question/steps');
  assert.strictEqual(reportBoxes.metrics.hasMinimalBoxes, false);

  // 3. Kiểm tra linter phát hiện kết luận quá khổ (oversized conclusion)
  const codeOversizedConcl = `
from manim import *
class TestOversizedConcl(Scene):
    def construct(self):
        c1_card = RoundedRectangle(width=8.4, height=6.4)
        c1_sol = VGroup(
            Text("Kết luận bài toán: Đáp án đúng là D", font_size=32)
        )
        c1_concl_box = RoundedRectangle(width=7.5, height=2.0)
        fit_width(c1_sol, 7.8)
        self.play(FadeOut(c1_card))
`;
  const reportConcl = inspectManimCode(codeOversizedConcl);
  assert.ok(reportConcl.issues.some(i => i.id === 'oversized_conclusion'), 'Should detect oversized conclusion');
  assert.strictEqual(reportConcl.metrics.hasLeanConclusions, false);

  // 4. Kiểm tra linter phát hiện nội dung bị co nhỏ (shrunk content)
  const codeShrunk = `
from manim import *
class TestShrunk(Scene):
    def construct(self):
        c1_card = RoundedRectangle(width=8.4, height=6.4)
        c1_content = VGroup(Text("Nội dung bài học", font_size=22))
        c1_content.scale(0.65)
        fit_width(c1_content, 7.8)
        self.play(FadeOut(c1_card))
`;
  const reportShrunk = inspectManimCode(codeShrunk);
  assert.ok(reportShrunk.issues.some(i => i.id === 'shrunk_content_hazard'), 'Should detect extreme scale(<0.85) shrinking content');

  // 5. Kiểm tra mã nguồn chuẩn mực (như mẫu trong prompt) đạt 100% tiêu chí sạch
  const codeGoldStandard = `
from manim import *
VOICEOVER_SCRIPT = """Bài giảng hôm nay gồm các phần chuẩn mực..."""
class CleanScene(Scene):
    def construct(self):
        top_card = RoundedRectangle(width=8.4, height=6.4)
        top_title = Text("📈 Đồ thị và tiếp tuyến", font_size=22, weight=BOLD).next_to(top_card.get_top(), DOWN, buff=0.18)
        c1_quest = Text("Cho hàm số f(x) có đồ thị như hình vẽ:", font_size=22)
        optA = MathTex(r"\\mathbf{A.}\\; (-1; 0)", font_size=22)
        optB = MathTex(r"\\mathbf{B.}\\; (0; 1)", font_size=22)
        opts_row = VGroup(optA, optB).arrange(RIGHT, buff=0.35)
        c1_sol = VGroup(
            Text("➜ Hàm số đồng biến trên (-1; 0). Chọn", font_size=22, color=GREEN_B, weight=BOLD),
            MathTex(r"\\mathbf{A}", font_size=24, color=GREEN)
        ).arrange(RIGHT, buff=0.15)
        ans_c1_box = SurroundingRectangle(optA, color=GREEN, buff=0.12, corner_radius=0.08, stroke_width=2.5)
        c1_content = VGroup(c1_quest, opts_row, c1_sol).arrange(DOWN, buff=0.18)
        fit_width(c1_content, 7.8)
        self.play(FadeOut(top_card))
        outro = Text("Tổng kết bí kíp", font_size=28)
        self.wait(3.0)
`;
  const reportClean = inspectManimCode(codeGoldStandard, { duration: '10s' });
  assert.strictEqual(reportClean.metrics.hasCleanTitleSizes, true);
  assert.strictEqual(reportClean.metrics.hasMinimalBoxes, true);
  assert.strictEqual(reportClean.metrics.hasLeanConclusions, true);
  assert.strictEqual(reportClean.issues.filter(i => i.severity === 'error').length, 0);

  // 6. Kiểm tra prompt yêu cầu Title Hierarchy, Zero Redundant Boxes & Anti-Shrink
  const prompt = generateManimCodePrompt({
    subject: "Toán học",
    topic: "Cực trị của hàm số",
    format: "vertical",
    duration: "110 giây",
    tone: "academic",
    audience: "Học sinh 12"
  });
  assert.match(prompt, /TIÊU ĐỀ THẺ CARD/);
  assert.match(prompt, /font_size=20 đến 22/);
  assert.match(prompt, /QUY TẮC TỐI GIẢN KHUNG VIỀN/);
  assert.match(prompt, /KẾT LUẬN BÀI TẬP TINH GỌN/);
  assert.match(prompt, /CHỐNG THU NHỎ NỘI DUNG/);
});

test("28. Document-Driven Adaptive Video Duration & Zero Meta Jargon (No 'RAG', No 'Trích từ tài liệu')", () => {
  // 1. Kiểm tra thuật toán detectOptimalDurationFromPdf
  // 1.1. Tài liệu ngắn (1 trang, 2 câu hỏi) -> 75s (Shorts)
  const shortPdf = {
    fileName: "c1_HamSo_CucTri.pdf",
    numPages: 1,
    text: "Câu 1: Cho hàm số y = f(x)... Câu 2: Tìm m để..."
  };
  const shortPlan = detectOptimalDurationFromPdf(shortPdf);
  assert.strictEqual(shortPlan.durationSec, 75);
  assert.strictEqual(shortPlan.exerciseCount, 2);
  assert.strictEqual(shortPlan.roundCount, 1);
  assert.strictEqual(shortPlan.detectedQuestionCount, 2);
  assert.match(shortPlan.durationLabel, /75 giây/);
  assert.match(shortPlan.inferredTopic, /HamSo CucTri/i);

  // 1.2. Tài liệu trung bình (3 trang, 4 câu hỏi) -> 120s (2 phút)
  const mediumPdf = {
    fileName: "Chuyen_De_Tich_Phan.pdf",
    numPages: 3,
    text: "Chuyên đề: Ứng dụng tích phân tính diện tích hình phẳng\n" +
      "Câu 1: Tính diện tích...\n" +
      "Câu 2: Cho đường cong...\n" +
      "Câu 3: Thể tích khối tròn xoay...\n" +
      "Câu 4: Vận dụng thực tế...\n" +
      "A. 1 B. 2 C. 3 D. 4\n".repeat(40)
  };
  const mediumPlan = detectOptimalDurationFromPdf(mediumPdf);
  assert.strictEqual(mediumPlan.durationSec, 120);
  assert.strictEqual(mediumPlan.exerciseCount, 4);
  assert.strictEqual(mediumPlan.roundCount, 2);
  assert.strictEqual(mediumPlan.detectedQuestionCount, 4);
  assert.match(mediumPlan.durationLabel, /120 giây/);
  assert.match(mediumPlan.inferredTopic, /Ứng dụng tích phân/i);

  // 1.3. Tài liệu dài (5 trang, 6 câu hỏi, > 5000 chars) -> 180s (3 phút)
  const longPdf = {
    fileName: "Oxyz_Tong_Hop.pdf",
    numPages: 5,
    text: "Chủ đề: Hình học không gian Oxyz tổng hợp\n" +
      "Câu 1: Mặt phẳng...\nCâu 2: Đường thẳng...\nCâu 3: Mặt cầu...\n" +
      "Câu 4: Khoảng cách...\nCâu 5: Góc giữa 2 mặt phẳng...\nCâu 6: Cực trị hình học...\n" +
      "Phần giải chi tiết các câu hỏi trên... ".repeat(150)
  };
  const longPlan = detectOptimalDurationFromPdf(longPdf);
  assert.strictEqual(longPlan.durationSec, 180);
  assert.strictEqual(longPlan.exerciseCount, 6);
  assert.strictEqual(longPlan.roundCount, 3);
  assert.strictEqual(longPlan.detectedQuestionCount, 6);

  // 1.4. Tài liệu rất dài (8 trang, > 10000 chars) -> 240s (4 phút)
  const megaPdf = {
    fileName: "Toan12_OnTap_Chuong1.pdf",
    numPages: 8,
    text: "Đề cương ôn tập toàn bộ chương 1 hàm số\n" +
      Array.from({ length: 10 }, (_, i) => `Câu ${i + 1}: Bài toán thứ ${i + 1}...\n`).join('') +
      "Nội dung lý thuyết chi tiết và hướng dẫn giải các bài tập ôn tập trọng tâm... ".repeat(250)
  };
  const megaPlan = detectOptimalDurationFromPdf(megaPdf);
  assert.strictEqual(megaPlan.durationSec, 240);
  assert.strictEqual(megaPlan.exerciseCount, 6);
  assert.strictEqual(megaPlan.roundCount, 3);

  // 2. Kiểm tra parseDurationToSeconds thích ứng với "Tự động theo tài liệu"
  assert.strictEqual(parseDurationToSeconds("Tự động theo tài liệu (Auto)", 110, shortPdf), 75);
  assert.strictEqual(parseDurationToSeconds("auto", 110, mediumPdf), 120);
  assert.strictEqual(parseDurationToSeconds("", 110, longPdf), 180);
  assert.strictEqual(parseDurationToSeconds(undefined, 110, megaPdf), 240);
  // Nếu người dùng chỉ định thời lượng cứng, ưu tiên thời lượng cứng
  assert.strictEqual(parseDurationToSeconds("60s", 110, megaPdf), 60);

  // 3. Kiểm tra getExerciseAndRoundPlan tự động thích ứng với PDF
  const autoExPlan = getExerciseAndRoundPlan(75, undefined, shortPdf);
  assert.strictEqual(autoExPlan.exerciseCount, 2);
  assert.strictEqual(autoExPlan.roundCount, 1);

  // 4. Kiểm tra Prompt Manim loại bỏ hoàn toàn các từ meta "RAG", "Trích từ tài liệu"
  const videoConfig: VideoConfig = {
    subject: "Toán học",
    topic: "Khảo sát và vẽ đồ thị hàm số",
    duration: "Tự động theo tài liệu (Auto)",
    tone: "academic",
    audience: "Học sinh 12",
    format: "vertical",
    attachedPdf: mediumPdf
  };
  const promptVideo = generateVideoManimPrompt(videoConfig);
  // Không còn heading rác [TÀI LIỆU RAG NGUỒN]
  assert.doesNotMatch(promptVideo, /\[TÀI LIỆU RAG NGUỒN/);
  assert.match(promptVideo, /\[TÀI LIỆU BÀI HỌC & ĐỀ THI GỐC ĐÍNH KÈM\]/);
  // Có chỉ thị cấm tiệt từ ngữ kỹ thuật meta
  assert.match(promptVideo, /TRIỆT TIÊU TOÀN BỘ TỪ NGỮ KỸ THUẬT META/);
  assert.match(promptVideo, /TUYỆT ĐỐI CẤM xuất hiện các từ ngữ mang tính kỹ thuật meta/);

  // 5. Kiểm tra Linter inspectManimCode phát hiện lỗi meta jargon
  // 5.1. Trường hợp vi phạm: Text trên màn hình có chữ "Trích từ tài liệu" hoặc "RAG"
  const dirtyCodeOnScreen = `
from manim import *
VOICEOVER_SCRIPT = """Chào các bạn, hôm nay ta cùng chữa bài tập cực trị."""
class BadScene(Scene):
    def construct(self):
        fit_width(self, 7.8)
        self.play(FadeOut(VGroup()))
        c1_title = Text("Câu 1 (Trích từ tài liệu)", font_size=22)
        self.wait(3.0)
`;
  const reportDirtyScreen = inspectManimCode(dirtyCodeOnScreen);
  assert.ok(reportDirtyScreen.issues.some(i => i.id === 'meta_jargon_in_video'), 'Should flag meta jargon in on-screen Text');
  assert.strictEqual(reportDirtyScreen.metrics.noMetaJargon, false);

  // 5.2. Trường hợp vi phạm: VOICEOVER_SCRIPT có chữ "Theo tài liệu RAG"
  const dirtyCodeScript = `
from manim import *
VOICEOVER_SCRIPT = """Theo tài liệu RAG đính kèm, chúng ta xét câu hỏi thứ nhất sau đây..."""
class BadScriptScene(Scene):
    def construct(self):
        fit_width(self, 7.8)
        self.play(FadeOut(VGroup()))
        c1_title = Text("Câu 1: Đọc bảng biến thiên", font_size=22)
        self.wait(3.0)
`;
  const reportDirtyScript = inspectManimCode(dirtyCodeScript);
  assert.ok(reportDirtyScript.issues.some(i => i.id === 'meta_jargon_in_video'), 'Should flag meta jargon in VOICEOVER_SCRIPT');
  assert.strictEqual(reportDirtyScript.metrics.noMetaJargon, false);

  // 5.3. Trường hợp chuẩn mực: Dùng ngôn ngữ sư phạm tự nhiên
  const cleanPedagogyCode = `
from manim import *
VOICEOVER_SCRIPT = """Chào các bạn, hôm nay chúng ta cùng chữa câu hỏi trắc nghiệm sau đây..."""
class CleanScene(Scene):
    def construct(self):
        fit_width(self, 7.8)
        self.play(FadeOut(VGroup()))
        c1_title = Text("Câu 1: Đọc bảng biến thiên", font_size=22)
        self.wait(3.0)
`;
  const reportCleanPedagogy = inspectManimCode(cleanPedagogyCode);
  assert.ok(!reportCleanPedagogy.issues.some(i => i.id === 'meta_jargon_in_video'), 'Clean code should have no meta jargon issues');
  assert.strictEqual(reportCleanPedagogy.metrics.noMetaJargon, true);
});

test("29. Manim: Anti-Label-Box Rule & Elimination of Unnecessary Boxes", () => {
  const videoConfig: VideoConfig = {
    subject: "Toán học",
    topic: "Cực trị của hàm số bậc ba",
    duration: "60s",
    tone: "academic",
    audience: "Học sinh lớp 12",
    format: "vertical",
    renderQuality: "480p"
  };

  // 1. Kiểm tra prompt cấm bọc box quanh 'Ví dụ minh họa', 'Dạng 1', 'Dạng 2', 'Thực chiến'
  const manimCodePrompt = generateManimCodePrompt(videoConfig);
  assert.match(manimCodePrompt, /TRIỆT TIÊU TOÀN BỘ BOX KHÔNG CẦN THIẾT/i);
  assert.match(manimCodePrompt, /CẤM tạo box quanh 'Ví dụ minh họa'/i);
  assert.match(manimCodePrompt, /Dạng 1.*Dạng 2/i);
  // Đảm bảo code mẫu không còn khởi tạo pill = RoundedRectangle(...) hay qz_pill = RoundedRectangle(...)
  assert.doesNotMatch(manimCodePrompt, /pill\s*=\s*RoundedRectangle/);
  assert.doesNotMatch(manimCodePrompt, /qz_pill\s*=\s*RoundedRectangle/);

  // 2. Kiểm tra inspectManimCode phát hiện vi phạm tạo box nhãn phân loại
  // 2.1. Vi phạm dùng pill / vd_box / dang_box = RoundedRectangle
  const badCodeWithLabelPill = `
from manim import *
VOICEOVER_SCRIPT = """Chào các bạn, hôm nay chúng ta xét ví dụ minh họa."""
class BadLabelScene(Scene):
    def construct(self):
        fit_width(self, 7.8)
        self.play(FadeOut(VGroup()))
        vd_txt = Text("Ví dụ minh họa", font_size=20)
        vd_box = RoundedRectangle(width=3.0, height=0.5, color=TEAL)
        self.wait(3.0)
`;
  const reportBadLabelPill = inspectManimCode(badCodeWithLabelPill);
  assert.ok(
    reportBadLabelPill.issues.some(i => i.id === 'unnecessary_label_box'),
    'Should catch unnecessary label box from RoundedRectangle'
  );
  assert.strictEqual(reportBadLabelPill.metrics.hasNoUnnecessaryLabelBoxes, false);

  // 2.2. Vi phạm dùng SurroundingRectangle quanh dang1_txt
  const badCodeWithDangBox = `
from manim import *
VOICEOVER_SCRIPT = """Chào các bạn, chúng ta cùng giải dạng toán này."""
class BadDangScene(Scene):
    def construct(self):
        fit_width(self, 7.8)
        self.play(FadeOut(VGroup()))
        dang1_txt = Text("Dạng 1: Tìm cực trị", font_size=20)
        box = SurroundingRectangle(dang1_txt, color=YELLOW)
        self.wait(3.0)
`;
  const reportBadDang = inspectManimCode(badCodeWithDangBox);
  assert.ok(
    reportBadDang.issues.some(i => i.id === 'unnecessary_label_box'),
    'Should catch unnecessary label box around dang1_txt'
  );
  assert.strictEqual(reportBadDang.metrics.hasNoUnnecessaryLabelBoxes, false);

  // 2.3. Mã nguồn chuẩn: Dùng Text trơn không bọc box, chỉ giữ 1 hộp xanh khoanh opt_correct
  const cleanLabelCode = `
from manim import *
VOICEOVER_SCRIPT = """Chào các bạn, hôm nay chúng ta cùng xét ví dụ minh họa bài toán cực trị sau đây."""
class CleanLabelScene(Scene):
    def construct(self):
        fit_width(self, 7.8)
        self.play(FadeOut(VGroup()))
        ex_lbl = Text("Ví dụ minh họa:", font_size=22, weight=BOLD, color=TEAL_A)
        ex_title = Text("Cực trị hàm số bậc ba", font_size=22, weight=BOLD, color=YELLOW)
        header = VGroup(ex_lbl, ex_title).arrange(RIGHT, buff=0.15)
        opt_correct = Text("A. x = 1", font_size=22)
        ans_box = SurroundingRectangle(opt_correct, color=GREEN, buff=0.12)
        self.wait(3.0)
`;
  const reportCleanLabel = inspectManimCode(cleanLabelCode);
  assert.ok(
    !reportCleanLabel.issues.some(i => i.id === 'unnecessary_label_box'),
    'Clean label code should pass with no unnecessary_label_box issue'
  );
  assert.strictEqual(reportCleanLabel.metrics.hasNoUnnecessaryLabelBoxes, true);
});






