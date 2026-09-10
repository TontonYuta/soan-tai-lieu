import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateExamPrompt,
  generateLearningPrompt,
  generateRoadmapPrompt,
  generateWorksheetPrompt,
  generateSimilarPrompt,
  generateManimCodePrompt,
  generateVideoManimPrompt,
  generateVideoScriptPrompt,
  generateBatPrompt,
  generateManimRevisionPrompt,
  extractAttachedImageDirective,
  generateProjectPrompt,
  generateLatexRevisionPrompt
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
  // 1. Kiểm tra không còn Pill Badge "VÍ DỤ GỐC", mà đã đổi thành "VÍ DỤ MINH HỌA"
  assert.match(manimCodePrompt, /VÍ DỤ MINH HỌA/);
  assert.doesNotMatch(manimCodePrompt, /pill_txt = Text\("VÍ DỤ GỐC"/);

  // 2. Kiểm tra quy chuẩn chỉ số trên / chỉ số dưới và cấm unicode trong Text
  assert.match(manimCodePrompt, /CHỈ SỐ TRÊN\/DƯỚI/);
  assert.match(manimCodePrompt, /TUYỆT ĐỐI CẤM dùng ký tự unicode mũ/);
  // Xác nhận code mẫu không dùng unicode mũ trong Text
  assert.doesNotMatch(manimCodePrompt, /Text\(".*x³.*"\)/);
  assert.doesNotMatch(manimCodePrompt, /Text\(".*x².*"\)/);

  // 3. Kiểm tra quy chuẩn Typography: Ưu tiên Be Vietnam Pro, cấm Serif khi in đậm
  assert.match(manimCodePrompt, /Be Vietnam Pro/);
  assert.match(manimCodePrompt, /TUYỆT ĐỐI KHÔNG dùng font Serif/);

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
  assert.match(revisionPrompt, /VÍ DỤ MINH HỌA/);
  assert.match(revisionPrompt, /CHỈ SỐ TRÊN\/DƯỚI/);
  assert.match(revisionPrompt, /Be Vietnam Pro/);
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
  // Kiểm tra font chỉ định là Be Vietnam Pro
  assert.match(codePrompt, /font="Be Vietnam Pro"/);
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





