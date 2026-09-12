import { VideoConfig } from "../../../types";
import {
  sanitizeAndExtractRag,
  getFontDirective,
  extractAttachedImageDirective,
  parseDurationToSeconds,
  getExerciseAndRoundPlan,
} from "./helpers";
import { getSimulationModeDescription } from "./presets";
import { MANIM_SKILLS_GUIDE } from "./guide";

// =========================================================================
// LƯỢT 1: PROMPT XÂY DỰNG KỊCH BẢN PHÂN CẢNH & LỜI THOẠI (STORYBOARD PROMPT)
// =========================================================================
export const generateManimStoryboardPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const approxSeconds = parseDurationToSeconds(config.duration, isVertical ? 110 : 120, config.attachedPdf);
  const targetDurationStr = config.duration || `${approxSeconds} giây`;
  const targetWords = Math.round(approxSeconds * 2.85);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragSection = sanitizeAndExtractRag(config.attachedPdf);
  const imageSection = extractAttachedImageDirective(config.attachedImage);

  const { exerciseCount, roundCount } = getExerciseAndRoundPlan(approxSeconds, config.exerciseCount, config.attachedPdf);

  // Phân bổ thời lượng thích ứng theo target duration
  const introSec = Math.max(7, Math.round(approxSeconds * 0.08));
  const theorySec = Math.max(14, Math.round(approxSeconds * 0.16));
  const simSec = Math.max(30, Math.round(approxSeconds * 0.26));
  const outroSec = Math.max(8, Math.round(approxSeconds * 0.06));
  const practiceSec = approxSeconds - (introSec + theorySec + simSec + outroSec);

  const introWords = Math.round(introSec * 2.85);
  const theoryWords = Math.round(theorySec * 2.85);
  const simWords = Math.round(simSec * 2.85);
  const outroWords = Math.round(outroSec * 2.85);
  const practiceWords = targetWords - (introWords + theoryWords + simWords + outroWords);

  let practiceRoundsOutline = "";
  for (let r = 1; r <= roundCount; r++) {
    const q1 = (r - 1) * 2 + 1;
    const q2 = Math.min(r * 2, exerciseCount);
    const roundLabel = r === 1 ? "Nhận biết & Đọc dữ liệu nhanh" : r === 2 ? "Thông hiểu & Biến đổi đại số" : r === 3 ? "Vận dụng & Phân tích bẫy đề thi" : `Vận dụng cao & Mẹo giải nhanh`;
    const roundSec = Math.round(practiceSec / roundCount);
    const roundWords = Math.round(practiceWords / roundCount);
    practiceRoundsOutline += `
     • DẠNG BÀI ${r} (${roundLabel}, ~${roundSec}s, ~${roundWords} từ):
       - Top Card: Câu ${q1} (Đề bài + 4 đáp án liền khối / hình vẽ + Khoanh đáp án đúng).
       - Bottom Card: Câu ${q2} (Đề bài + Các bước giải then chốt + Khoanh đáp án đúng).
       - Lời thoại Dạng ${r}: Phân tích chi tiết phương pháp tư duy, bẫy trắc nghiệm và chốt nhanh đáp án.
       - Dọn dẹp: self.play(FadeOut(part${r}_group)) dọn sạch 100% màn hình để chuẩn bị cho dạng bài tiếp theo!`;
  }

  return `Đóng vai Chuyên gia Sư phạm & Đạo diễn Diễn hoạt Khoa học Manim CE (chuẩn phong cách Yuta Academy).
Nhiệm vụ của bạn là xây dựng KỊCH BẢN SƯ PHẠM VÀ LỜI THOẠI THUYẾT MINH TRÔI CHẢY, PHONG PHÚ cho video bài giảng về: "${config.topic}" (Môn: ${config.subject}, Khán giả: ${config.audience || 'Học sinh / Người học'}).
Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / Shorts / Reels - Bố cục Khung Thẻ Dual-Zone lấp đầy 93% màn hình)' : 'NGANG 16:9 (YouTube / Bài giảng)'}.
THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr} (~${approxSeconds} giây).
${simDesc}
${ragSection}
${imageSection}

YÊU CẦU LẬP DÀN Ý 5 PHÂN CẢNH CHUẨN MỰC VÀ SOẠN LỜI THOẠI TRÔI CHẢY, TRUYỀN CẢM, CÓ NGẮT NGHỈ MẠCH LẠC PHÙ HỢP VỚI THỜI LƯỢNG ${targetDurationStr} (ĐỘ DÀI KỊCH BẢN KHOẢNG ${targetWords} TỪ - TỐC ĐỘ ĐỌC 2.85 TỪ/GIÂY):

1. PHÂN CẢNH 1 - MỞ ĐẦU ẤN TƯỢNG (INTRO, ~${introSec}S, ~${introWords} TỪ):
   - Khung thẻ Intro với Tên bài học (Sentence case, TUYỆT ĐỐI KHÔNG IN HOA), Pill badge môn học "${config.subject}" và Ký hiệu/khái niệm cốt lõi.
   - Lời thoại Intro: Chào mừng, đặt vấn đề kích thích tò mò và tạo cảm hứng học tập.

2. PHÂN CẢNH 2 - LÝ THUYẾT CỐT LÕI VỚI CẶP THẺ MÀU TƯƠNG PHẢN (~${theorySec}S, ~${theoryWords} TỪ):
   - Các Thẻ màu độc lập đối chiếu (Thẻ Xanh Emerald cho trường hợp thuận / khẳng định; Thẻ Đỏ Ruby cho trường hợp nghịch / phủ định; với video >=180s bổ sung thẻ phân tích trường hợp đặc biệt / bẫy).
   - Lời thoại Lý thuyết: Phân tích trực quan, so sánh bản chất và làm nổi bật điều kiện áp dụng.

3. PHÂN CẢNH 3 - DUAL-ZONE CONTAINER MÔ PHỎNG ĐỘNG TƯƠNG TÁC (~${simSec}S, ~${simWords} TỪ):
   - Top Card (Thẻ Trên - height=6.4, width=8.4): Trực quan hóa hiện tượng/đồ thị/mô hình/hình ảnh minh họa ImageMobject với ValueTracker + Tiếp tuyến đổi màu + Thanh trạng thái real-time.
   - Bottom Card (Thẻ Dưới - height=6.6, width=8.4): Suy luận lý thuyết/biến đổi số/bảng biến thiên 3 tầng/công thức định luật/cấu trúc ngữ pháp.
   - Lời thoại Mô phỏng: Thuyết minh đồng bộ từng chuyển động, làm sáng tỏ mối liên hệ giữa trực quan và công thức.

4. PHÂN CẢNH 4 - BÀI TẬP THỰC CHIẾN THEO TỪNG DẠNG BÀI (~${practiceSec}S, ~${practiceWords} TỪ, GỒM ${roundCount} DẠNG BÀI, TỔNG ${exerciseCount} CÂU HỎI):
${practiceRoundsOutline}

5. PHÂN CẢNH 5 - TỔNG KẾT & OUTRO THƯƠNG HIỆU (~${outroSec}S, ~${outroWords} TỪ):
   - Thẻ Outro: Đúc kết 3 bí kíp bài học + Thông điệp thương hiệu "Học ${config.subject} cùng Yuta" (giữ nguyên khung hình cuối self.wait(1.5), TUYỆT ĐỐI KHÔNG FadeOut). Tiêu đề Sentence case, không viết hoa toàn bộ.
   - Lời thoại Outro: Đúc kết giá trị và kêu gọi follow kênh.

ĐỊNH DẠNG TRẢ VỀ:
- Tóm tắt dàn ý 5 phân cảnh trên.
- Khối biến kịch bản hoàn chỉnh (chèn dấu ba chấm "..." để tạo khoảng ngắt nghỉ nhịp nhàng cho giọng đọc AI, độ dài khoảng ${targetWords} từ phù hợp với ${targetDurationStr}):
VOICEOVER_SCRIPT = """
[Toàn bộ lời thoại thuyết minh mượt mà, phong phú của 5 phân cảnh trên]
"""
(Lưu ý: LƯỢT NÀY CHƯA VIẾT CODE PYTHON, chỉ hoàn thiện kịch bản sư phạm và lời thoại!)`;
};

// =========================================================================
// LƯỢT 2: PROMPT CHUYỂN THỂ THÀNH MÃ PYTHON MANIM (CODE GENERATION PROMPT)
// =========================================================================
export const generateManimCodePrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-qh' : config.renderQuality === '4k' ? '-qk' : '-ql';
  const approxSeconds = parseDurationToSeconds(config.duration, isVertical ? 110 : 120, config.attachedPdf);
  const targetDurationStr = config.duration || `${approxSeconds} giây`;
  const targetWords = Math.round(approxSeconds * 2.85);
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragSection = sanitizeAndExtractRag(config.attachedPdf);
  const imageSection = extractAttachedImageDirective(config.attachedImage);

  const { exerciseCount, roundCount } = getExerciseAndRoundPlan(approxSeconds, config.exerciseCount, config.attachedPdf);

  const introSec = Math.max(7, Math.round(approxSeconds * 0.08));
  const theorySec = Math.max(14, Math.round(approxSeconds * 0.16));
  const simSec = Math.max(30, Math.round(approxSeconds * 0.26));
  const outroSec = Math.max(8, Math.round(approxSeconds * 0.06));
  const practiceSec = approxSeconds - (introSec + theorySec + simSec + outroSec);

  return `Tuyệt vời! Dựa trên kịch bản sư phạm và khối lời thoại VOICEOVER_SCRIPT vừa thống nhất ở trên, hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.
${simDesc}
${ragSection}
${imageSection}

YÊU CẦU KỸ THUẬT BẮT BUỘC (TUÂN THỦ BỘ NGUYÊN TẮC c1_HamSo_DonDieu.py & DUAL-ZONE CONTAINER CARDS):
1. Kế thừa chính xác biến VOICEOVER_SCRIPT và cấu trúc 5 PHÂN CẢNH CHUẨN MỰC:
   - Phần 1: Mở đầu (Intro, ~${introSec}s) - FadeOut toàn bộ.
   - Phần 2: Lý thuyết các thẻ màu tương phản (Xanh Emerald, Đỏ Ruby..., ~${theorySec}s) - FadeOut toàn bộ.
   - Phần 3: Dual-Zone Container Mô phỏng động tiếp tuyến đổi màu + BBT 3 tầng (~${simSec}s) - FadeOut toàn bộ.
   - Phần 4: Bài tập thực chiến theo từng dạng bài (~${practiceSec}s, gồm ${roundCount} dạng bài với tổng cộng ${exerciseCount} câu hỏi):
     * Mỗi dạng bài chỉ hiển thị ĐÚNG 2 CÂU trên màn hình (Top Card = Câu lẻ, Bottom Card = Câu chẵn).
     * Khi kết thúc mỗi dạng bài: BẮT BUỘC gọi self.play(FadeOut(part_group), run_time=0.7) để giải phóng hoàn toàn màn hình trước khi tạo dạng bài tiếp theo!
     * TUYỆT ĐỐI KHÔNG nhồi nhét nhiều hơn 2 câu trên màn hình cùng một lúc để đảm bảo Zero-Overlap 100% và cỡ chữ lớn rõ nét (font_size >= 22).
   - Phần 5: Thẻ Outro tổng kết thương hiệu "Học ${config.subject} cùng Yuta" (~${outroSec}s) - Giữ nguyên self.wait(1.5), KHÔNG FadeOut.
2. TỔNG THỜI LƯỢNG HOẠT HỌA KHỚP VỚI THỜI LƯỢNG MỤC TIÊU (~${approxSeconds}s, Lời thoại ~${targetWords} từ):
   - Tổng run_time của self.play(...) và self.wait(...) ở mỗi phân cảnh BẮT BUỘC phải khớp với thời gian đọc của phân cảnh đó để video kết thúc chuẩn xác cùng lúc với giọng đọc.
3. Cấu hình ${isVertical ? 'Khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)' : 'Khung hình NGANG 16:9 (1920x1080)'}.
4. BỐ CỤC KHUNG THẺ CONTAINER (DUAL-ZONE) LẤP ĐẦY 93% MÀN HÌNH - TRIỆT TIÊU KHOẢNG TRỐNG ĐEN:
   - ${isVertical ? 'Top Header Bar (y ~ 7.05, height=1.1-1.3, width=8.4); Top Card (y ~ 3.15, height=6.4, width=8.4); Bottom Card (y ~ -3.75, height=6.6, width=8.4); Outro Card (height=13.6, width=8.4). BẮT BUỘC gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ!' : 'Header đỉnh, Cột Trái Mô phỏng (width=7.2, height=6.2), Cột Phải Công thức (width=5.8, height=6.2).'}
5. TIÊU ĐỀ INTRO DÀN ĐỀU & ĐỀ BÀI CHỐNG TRÀN BOX (QUY TẮC ƯU TIÊN 1 DÒNG & TUYỆT ĐỐI KHÔNG IN HOA):
   - QUY TẮC ƯU TIÊN 1 DÒNG (SINGLE-LINE FIRST) & CHỐNG XUỐNG DÒNG VÔ TỘI VẠ:
     * Mọi đề bài, câu hỏi, dữ kiện và kết luận NGẮN (<= 14-16 từ hoặc <= 65 ký tự) BẮT BUỘC viết trên CÙNG 1 DÒNG DUY NHẤT.
     * TUYỆT ĐỐI CẤM ngắt dòng \\n vô tội vạ hoặc chia nhỏ một câu ngắn thành nhiều mobject rồi arrange(DOWN) làm rớt dòng cụt lủn.
     * Nếu kết hợp chữ tiếng Việt và công thức MathTex: Nối ngang trên 1 dòng duy nhất bằng arrange(RIGHT, buff=0.12).
     * Chỉ xuống dòng khi đề bài THỰC SỰ DÀI (> 16 từ), và luôn gọi fit_width(group, 7.8) để tự động co tỷ lệ vừa khít khung thẻ.
   - TUYỆT ĐỐI KHÔNG viết hoa toàn bộ (ALL CAPS) ở bất kỳ đâu: Tiêu đề Intro, tên phân cảnh, pill badges, tiêu đề thẻ, đề bài và kết luận.
   - BẮT BUỘC dùng Sentence case (chỉ viết hoa chữ cái đầu và danh từ riêng như Oxy, THPT, SGK): Ví dụ "Khảo sát sự biến thiên của hàm số", "Ví dụ minh họa", "Thực chiến", "Câu 1: Đọc bảng biến thiên", "Tổng kết bí kíp".
   - Tên chủ đề Intro: Ngắt dòng \\n cân đối nếu quá dài (> 35 ký tự), dùng alignment="CENTER", sau arrange BẮT BUỘC gọi for item in intro_group: item.set_x(0) để căn giữa đối xứng tuyệt đối trục X=0.
   - NGUYÊN TẮC CÔNG THỨC INTRO: Mỗi công thức/định lý cốt lõi nằm trọn vẹn trên ĐÚNG 1 DÒNG ĐƠN duy nhất trong 1 MathTex (ví dụ: MathTex(r"M = \\max_{[a; b]} f(x) \\iff f(x) \\le M \\quad \\text{và} \\quad \\exists x_0 \\in [a; b]: f(x_0) = M", font_size=23, color=GREEN_B)). TUYỆT ĐỐI KHÔNG ngắt dòng bằng "\\\\" bên trong MathTex và TUYỆT ĐỐI KHÔNG tách thành 2 MathTex riêng biệt (không để 'và tồn tại x0' rớt xuống dòng dưới). Luôn gọi fit_width(intro_core_rule, 7.6).
   - Khái niệm, lý thuyết: Trình bày chuẩn xác theo tài liệu PDF đính kèm, không tự ý suy diễn hay viết chung chung.
   - TUYỆT ĐỐI CẤM các từ ngữ kỹ thuật meta như "RAG", "Trích từ tài liệu", "Theo tài liệu đính kèm", "Dữ liệu nguồn", "Theo file PDF" trong mã nguồn (Text, Mobject) cũng như trong VOICEOVER_SCRIPT.
   - Tuyệt đối KHÔNG dùng từ ngữ giật gân, sáo rỗng hay cường điệu phong cách AI.
6. QUY TẮC TỐI GIẢN KHUNG VIỀN & QUY TẮC BOX BỌC TEXT CHỨA VỪA KHÍT - TRIỆT TIÊU TOÀN BỘ BOX KHÔNG CẦN THIẾT (ZERO REDUNDANT BOXES & NO UNNECESSARY LABEL BOXES):
   - TUYỆT ĐỐI KHÔNG CẦN BOX NẾU KHÔNG CẦN THIẾT!
   - CẤM TUYỆT ĐỐI tạo box (RoundedRectangle hoặc SurroundingRectangle) quanh các nhãn phân loại:
     * CẤM tạo box quanh 'Ví dụ minh họa', 'Ví dụ', 'Bài mẫu' (dùng Text trơn trực tiếp).
     * CẤM tạo box quanh 'Dạng 1', 'Dạng 2', 'Dạng 3' (dùng Text trơn trực tiếp hoặc viết gộp vào tiêu đề câu: Text("Câu 1 (Dạng 1): ...")).
     * CẤM tạo box quanh 'Thực chiến', 'Luyện tập' trong Header Bar (dùng Text trơn trực tiếp).
     * Bọc box quanh các nhãn này làm phình to chiều rộng, gây tràn viền Header Bar/Card và lỗi bố cục thẻ!
   - Mỗi vùng chỉ có ĐÚNG 1 khung thẻ nền ngoài (top_card, bottom_card hoặc outro_card).
   - BÊN TRONG CARD: TUYỆT ĐỐI CẤM tạo các hộp bọc lồng nhau (NO NESTED BOXES):
     * CẤM bọc box quanh tiêu đề thẻ (top_title, c1_title chỉ là Text trơn đặt tại .next_to(card.get_top(), DOWN, buff=0.18)).
     * CẤM bọc box quanh câu hỏi / đề bài.
     * CẤM bọc box quanh các bước giải (Bước 1, Bước 2, Bước 3).
     * CẤM bọc box quanh bảng biến thiên.
   - CHỈ DUY NHẤT 2 LOẠI BOX ĐƯỢC PHÉP XUẤT HIỆN BÊN TRONG CARD:
     1) Hộp khoanh đáp án đúng: SurroundingRectangle(opt_correct, color=GREEN, buff=0.12-0.14, corner_radius=0.08, stroke_width=2.5) ôm quanh ĐÚNG phương án đúng (chữ A/B/C/D) trong hàng đáp án.
     2) Ở thẻ mô phỏng lý thuyết: 1 hộp duy nhất SurroundingRectangle(conclusions, color=GREEN, buff=0.14-0.16, corner_radius=0.12, stroke_width=2.5) bọc cụm 2-3 dòng kết luận tóm tắt.
     3) Ở thẻ đồ thị: Thanh trạng thái động status_badge (chiều cao 0.52, bo góc 0.1) ở sát đáy thẻ.
7. QUY TẮC BỐ CỤC 4 ĐÁP ÁN TRẮC NGHIỆM LIỀN KHỐI (CHỐNG LỖI CHỮ A. ĐỨNG RIÊNG 1 DÒNG):
   - MỖI ĐÁP ÁN A, B, C, D BẮT BUỘC PHẢI LÀ MỘT KHỐI NGUYÊN VẸN NẰM TRÊN CÙNG 1 HÀNG.
   - Viết chung nhãn và giá trị: MathTex(r"\\mathbf{A.}\\; ...") hoặc VGroup(Text("A."), Text("...")).arrange(RIGHT, buff=0.12, aligned_edge=DOWN). TUYỆT ĐỐI CẤM arrange(DOWN) giữa nhãn và đáp án, CẤM chèn \\n sau nhãn.
   - Tùy độ dài thực tế của 4 đáp án để bố trí theo 1 trong 3 dạng:
     * DẠNG 4x1: Khi 4 đáp án đều NGẮN (<= 8 ký tự, số hoặc biến): VGroup(optA, optB, optC, optD).arrange(RIGHT, buff=0.35).
     * DẠNG 2x2 (KHÓA 2 CỘT THẲNG TẮP, CHỐNG LỆCH HÀNG ZÍC-ZẮC): Khi 4 đáp án có ĐỘ DÀI TRUNG BÌNH (khoảng nghiệm, tọa độ). BẮT BUỘC:
       col1 = VGroup(optA, optC).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
       col2 = VGroup(optB, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
       VGroup(col1, col2).arrange(RIGHT, buff=0.8, aligned_edge=UP)
     * DẠNG 1x4: Khi đáp án DÀI (chứa câu chữ văn bản, định lý): VGroup(optA, optB, optC, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.14).
   - Hộp khoanh đáp án: SurroundingRectangle(opt_correct, color=GREEN, buff=0.12, corner_radius=0.08, stroke_width=2.5) ôm vừa khít đáp án đúng!
8. QUY CHUẨN PHÂN CẤP TIÊU ĐỀ & CHỐNG THU NHỎ NỘI DUNG (TITLE HIERARCHY & ANTI-SHRINK PROTOCOL):
   - Sử dụng font="${chosenFont}" cho mọi đối tượng Text. ${chosenFont === 'Times New Roman' ? 'Mặc định ưu tiên font có chân (Times New Roman / Liberation Serif) thanh lịch, chuẩn mực tài liệu toán học và giáo khoa.' : 'Sử dụng font không chân (Be Vietnam Pro) hiện đại, sắc nét.'}
   - PHÂN CẤP KÍCH THƯỚC TIÊU ĐỀ BẮT BUỘC:
     * Tiêu đề chính Intro / Outro: font_size=28 đến 32 BOLD, Sentence case (CẤM > 32).
     * Tiêu đề Header Bar: font_size=22 đến 24 BOLD.
     * TIÊU ĐỀ THẺ CARD (top_title, bot_title, c1_title, c2_title): BẮT BUỘC font_size=20 đến 22 BOLD, TEAL_A hoặc YELLOW. CẤM TUYỆT ĐỐI font_size > 22 cho tiêu đề thẻ bên trong card! Đặt trực tiếp tại .next_to(card.get_top(), DOWN, buff=0.18), KHÔNG bọc thêm viền box.
   - KẾT LUẬN BÀI TẬP TINH GỌN (CHỐNG KẾT LUẬN PHÌNH TO):
     * Kết luận bài tập là 1 dòng đơn cô đọng: VGroup(Text("➜ [Khẳng định kết quả]. Chọn", font_size=22, color=GREEN_B, weight=BOLD), MathTex(r"\\mathbf{[ĐÁP ÁN]}", font_size=24, color=GREEN)).arrange(RIGHT, buff=0.15).
     * CẤM font_size > 24 cho kết luận, CẤM tạo thẻ con RoundedRectangle hay bọc box to đùng cho kết luận!
   - CHỐNG THU NHỎ NỘI DUNG BÀI TOÁN (BẢO VỆ ĐỘ SẮC NÉT TRÊN ĐIỆN THOẠI):
     * Công thức toán MathTex: font_size=24 đến 28 (to rõ, sắc nét, nổi bật).
     * Văn bản tiếng Việt diễn giải / đề bài: font_size=22 (CẤM font_size < 22).
     * Bảng biến thiên BBT: font_size=22 đến 24 (arraystretch=1.25 - 1.3).
     * Chống co tỷ lệ của fit_width: Mỗi dòng Text / MathTex KHÔNG ĐƯỢC dài quá 50-55 ký tự. Nếu câu dài, chủ động ngắt thành 2 dòng ngắn rồi arrange(DOWN, aligned_edge=LEFT, buff=0.1). Chiều rộng tự nhiên mỗi dòng luôn <= 6.8 đơn vị, hàm fit_width(group, 7.8) sẽ KHÔNG CO TỶ LỆ, nội dung giữ nguyên 100% kích thước chuẩn!
     * Khoảng cách dọc tối ưu: Dùng buff=0.14-0.18 khi arrange(DOWN) cho các phần tử trong thẻ.
     * CẤM TUYỆT ĐỐI dùng .scale(< 0.85) trên các khối nội dung thẻ (c1_content, c2_content, bot_content).
   - line_spacing=1.2 cho các đoạn Text nhiều dòng.
9. QUY TẮC CHỈ SỐ TRÊN/DƯỚI & TIÊU ĐỀ PILL BADGE:
   - 100% công thức chứa số mũ (x^2, x^3), chỉ số dưới (x_0, x_1), đạo hàm (y') BẮT BUỘC dùng MathTex(r"..."). TUYỆT ĐỐI CẤM dùng ký tự unicode mũ (x², x³, x₁, x₀) trong Text(...).
   - Tiêu đề Pill Badge: Dùng "Ví dụ minh họa" hoặc "Ví dụ", TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
10. MÔ PHỎNG TIẾP TUYẾN ĐỘNG (THEO c1_HamSo_DonDieu.py), BẢNG BIẾN THIÊN 3 TẦNG & PACING VỪA PHẢI:
    - ValueTracker + always_redraw cho tiếp tuyến đổi màu (Xanh/Đỏ/Vàng) và thanh trạng thái status_badge real-time.
    - TIẾP TUYẾN CHUẨN MỰC THEO c1_HamSo_DonDieu.py: dx = 0.38; p1 = axes.c2p(t - dx, y - m * dx); p2 = axes.c2p(t + dx, y + m * dx). Gọn gàng, vừa vặn thẻ, không cần vector phức tạp!
    - PACING & NHỊP ĐỘ DỨT KHOÁT: Dừng nhẹ nhàng vừa đủ tại điểm mấu chốt (self.wait(0.8) đến self.wait(1.0) khi đổi màu tiếp tuyến, xuất hiện BBT, đóng khung đáp án). Tuyệt đối không dừng quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê.
    - Bảng Biến Thiên 3 tầng chuẩn mực SGK Việt Nam: MathTex(r"\\begin{array}{|c|ccccccc|} ... \\end{array}", font_size=24).
11. QUY TẮC SỬ DỤNG HÌNH ẢNH MINH HỌA (ImageMobject - CHỐNG CRASH 100%):
    - Khi có ảnh đính kèm (hoặc khi cần chèn ảnh minh họa): BẮT BUỘC dùng ImageMobject(r"...").
    - TUYỆT ĐỐI CẤM thêm ImageMobject vào VGroup(...) (sẽ crash TypeError!). BẮT BUỘC dùng Group(...) thay cho VGroup(...) khi có chứa ImageMobject.
    - Luôn co tỷ lệ vừa vặn thẻ: img.scale_to_fit_width(4.5) và đóng khung viền bo tròn SurroundingRectangle(img, buff=0.08, color=TEAL_A, corner_radius=0.15).
12. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
    - MỌI công thức dùng MathTex(r"...") với raw string. Đóng khung đáp số: SurroundingRectangle(result, color=GREEN, buff=0.16).
13. Màu nền: "#0B1120".
14. QUY TẮC CỐT TỬ CHỐNG ẢO GIÁC CÚ PHÁP MANIM CE (ZERO-HALLUCINATION SYNTAX GUARD):
    - CẤM dùng thuộc tính không tồn tại trong Manim CE (không font_color trong Text, không background_stroke, không ArcBetweenPoints sai tham số).
    - CẤM dùng Transform(mobA, mobB) trên MathTex khác số lượng phần tử. BẮT BUỘC dùng ReplacementTransform hoặc FadeTransform.
    - CẤM ngắt dòng bằng \\\\ bên trong 1 MathTex duy nhất làm vỡ bố cục 2x2. Dùng \\quad \\text{và} \\quad hoặc tách thành nhiều MathTex độc lập rồi arrange(DOWN).
    - Với ThreeDScene: Khởi tạo self.set_camera_orientation(phi=70*DEGREES, theta=-35*DEGREES, zoom=0.85), ambient rotation self.begin_ambient_camera_rotation(rate=0.12).
15. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết bất kỳ lời chào hay giải thích ngoài mã.
16. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim ${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};

// =========================================================================
// PROMPT TỔNG HỢP TINH GỌN (CHO CẢ 1-CLICK TỰ ĐỘNG & SAO CHÉP THỦ CÔNG)
// =========================================================================
export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-qh' : config.renderQuality === '4k' ? '-qk' : '-ql';
  const approxSeconds = parseDurationToSeconds(config.duration, isVertical ? 110 : 120, config.attachedPdf);
  const targetDurationStr = config.duration || `${approxSeconds} giây`;
  const targetWords = Math.round(approxSeconds * 2.85);
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragPromptChunk = sanitizeAndExtractRag(config.attachedPdf);
  const imagePromptChunk = extractAttachedImageDirective(config.attachedImage);
  const { exerciseCount, roundCount } = getExerciseAndRoundPlan(approxSeconds, config.exerciseCount, config.attachedPdf);

  const brandName = config.subject.toLowerCase().includes('toán') ? 'Học toán cùng Yuta' : `Học ${config.subject} cùng Yuta`;

  let episodeChunk = "";
  if (config.isSeries) {
    const sCount = config.seriesCount || 3;
    const epIdx = config.currentEpisodeIndex !== undefined ? config.currentEpisodeIndex + 1 : 1;
    episodeChunk = `
[CHUỖI PLAYLIST - TẬP ${epIdx}/${sCount}]:
- Sản xuất TẬP ${epIdx}/${sCount} cho chuyên đề "${config.topic}".
- Góc trên phải màn hình hiển thị: Text("Tập ${epIdx}/${sCount}", font_size=22, color=GRAY_B, font="${chosenFont}")
`;
  }

  return `Đóng vai Chuyên gia Lập trình Diễn hoạt Khoa học, Toán học & Giáo dục chuyên nghiệp với Manim CE (Python).
Nhiệm vụ của bạn là viết một file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh, chuẩn sư phạm, trực quan và chạy được 100% không lỗi để minh họa chủ đề "${config.topic}" thuộc môn học "${config.subject}".

I. THÔNG TIN VIDEO & CẤU HÌNH HÌNH THỨC:
- Môn học: ${config.subject}
- Chủ đề: ${config.topic}
- THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr} (~${approxSeconds} giây, Độ dài lời thoại VOICEOVER_SCRIPT ~${targetWords} từ)
- Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / YouTube Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}
- Font chữ chỉ định: "${chosenFont}" (Có ngắt dòng line_spacing=1.2 & spacing chuẩn giữa các chữ)
- Mẫu Diễn hoạt: ${simDesc}
- Khán giả: ${config.audience || 'Học sinh / Người học'}
- Yêu cầu chi tiết: ${config.details || "Trực quan, bố cục 5 phân cảnh chuẩn c1_HamSo_DonDieu.py, mô phỏng sinh động, Bài tập thực chiến theo từng dạng bài"}
- ĐỒNG BỘ THỜI GIAN ÂM THANH (TTS): Kịch bản VOICEOVER_SCRIPT phải có độ dài tương ứng (~${targetWords} từ cho ${approxSeconds}s). Các lệnh self.play(..., run_time=...) và self.wait(...) ở mỗi phân cảnh BẮT BUỘC phải khớp với thời gian đọc phân cảnh đó.
${episodeChunk}
${ragPromptChunk}
${imagePromptChunk}

II. BỘ KỸ NĂNG BẮT BUỘC TUÂN THỦ:
${MANIM_SKILLS_GUIDE}

III. BỘ KHUNG CODE PYTHON MẪU KIẾN TRÚC SƯ PHẠM (CẤU TRÚC 5 PHÂN CẢNH CHUẨN MỰC ĐÃ KIỂM ĐỊNH 100%):
\`\`\`python
from manim import *

# 0. KỊCH BẢN THUYẾT MINH ĐỒNG BỘ (~${approxSeconds} GIÂY, ~${targetWords} TỪ)
VOICEOVER_SCRIPT = """
Chào mừng các bạn đến với bài giảng về ${config.topic} môn ${config.subject}! Hôm nay chúng ta sẽ cùng nắm trọn lý thuyết nền tảng và phương pháp giải các dạng bài thực chiến kinh điển nhất.
Về phần lý thuyết cốt lõi, hãy ghi nhớ thật kỹ các nguyên tắc cốt lõi tương ứng với hai khía cạnh then chốt được đóng khung rõ ràng trên màn hình.
Ở phần mô phỏng thực tế, hãy quan sát chuyển động và sự biến thiên trực quan theo thời gian thực, hoàn toàn ăn khớp với các công thức và phân tích logic bên dưới.
Bây giờ chúng ta cùng bước vào phần bài tập thực chiến với ${exerciseCount} câu hỏi trọng tâm chia theo ${roundCount} dạng bài. Ở mỗi dạng bài, ta lần lượt phân tích bản chất từng câu, chỉ ra bẫy đề thi và chốt ngay đáp án chính xác.
Đừng quên lưu lại video và bấm theo dõi kênh ${brandName} để cùng nhau bứt phá điểm số mỗi ngày nhé!
"""

# 1. CẤU HÌNH KHUNG HÌNH ${isVertical ? 'DỌC 9:16 (1080x1920)' : 'NGANG 16:9 (1920x1080)'}
${isVertical ? `config.pixel_width = 1080
config.pixel_height = 1920
config.frame_width = 9.0
config.frame_height = 16.0` : `config.pixel_width = 1920
config.pixel_height = 1080
config.frame_width = 14.22
config.frame_height = 8.0`}

def fit_width(mob: Mobject, max_width: float = 7.8) -> Mobject:
    """Tự động co tỷ lệ nếu chiều rộng vượt quá ngưỡng quy định để chống tràn mép thẻ."""
    if mob.width > max_width:
        mob.scale_to_fit_width(max_width)
    return mob

class MainScene(${config.mathType === '3d_geometry' ? 'ThreeDScene' : 'Scene'}):
    def construct(self):
        self.camera.background_color = "#0B1120"
        MAIN_FONT = "${chosenFont}"

        # ======================================================================
        # PHẦN 1: MỞ ĐẦU ẤN TƯỢNG (INTRO, ~7s)
        # ======================================================================
        badge_text = Text("${config.subject} • Luyện thi THPTQG", font_size=24, font=MAIN_FONT, weight=BOLD, color=TEAL_A)
        badge_intro = RoundedRectangle(
            corner_radius=0.15, width=badge_text.width + 0.5, height=badge_text.height + 0.28,
            color=TEAL, fill_color="#0F172A", fill_opacity=0.92, stroke_width=2.0
        ).move_to(badge_text)
        intro_badge = VGroup(badge_intro, badge_text)

        # Tiêu đề chủ đề: Dàn đều, Sentence case, chủ động ngắt dòng \\n nếu dài (> 4 từ) để không tràn viền
        clean_topic = "${config.topic}"
        intro_title = Text(clean_topic, font_size=28, weight=BOLD, color=YELLOW, line_spacing=1.2, font=MAIN_FONT)
        fit_width(intro_title, 7.2)
        intro_box = SurroundingRectangle(intro_title, buff=0.18, color=BLUE_C, corner_radius=0.15, stroke_width=2.5)

        intro_sub = Text("Lý thuyết trọng tâm • Mô phỏng trực quan • Chữa đề", font_size=22, font=MAIN_FONT, color=GRAY_B)
        fit_width(intro_sub, 7.4)

        intro_core_rule = VGroup(
            MathTex(r"y' > 0 \\;\\Longrightarrow\\; \\text{Đồng biến } (\\nearrow)", font_size=28, color=GREEN_B),
            MathTex(r"y' < 0 \\;\\Longrightarrow\\; \\text{Nghịch biến } (\\searrow)", font_size=28, color=RED_B)
        ).arrange(DOWN, buff=0.22)
        fit_width(intro_core_rule, 7.6)

        intro_group = VGroup(intro_badge, VGroup(intro_title, intro_box), intro_sub, intro_core_rule).arrange(DOWN, buff=0.4).move_to(ORIGIN)
        for item in intro_group:
            item.set_x(0)
        fit_width(intro_group, 8.0)

        self.play(FadeIn(intro_badge, shift=DOWN * 0.3), run_time=0.7)
        self.play(Write(intro_title), Create(intro_box), run_time=1.2)
        self.play(FadeIn(intro_sub), FadeIn(intro_core_rule, shift=UP * 0.2), run_time=1.1)
        self.wait(0.8)
        self.play(FadeOut(intro_group), run_time=0.7)

        # ======================================================================
        # PHẦN 2: LÝ THUYẾT CỐT LÕI - 2 THẺ MÀU ĐỘC LẬP (~14s)
        # ======================================================================
        th_header = Text("Định lý dấu đạo hàm và tính đơn điệu", font_size=26, font=MAIN_FONT, weight=BOLD, color=YELLOW).to_edge(UP, buff=0.6)
        th_sub = Text("Định lý liên hệ dấu y' và dáng điệu hàm số", font_size=22, font=MAIN_FONT, color=GRAY_B).next_to(th_header, DOWN, buff=0.18)

        card_inc = RoundedRectangle(corner_radius=0.2, width=8.4, height=4.2, color=GREEN_D, fill_color="#064E3B", fill_opacity=0.35, stroke_width=2.5)
        t_inc_title = Text("1. Hàm số đồng biến (tăng)", font_size=24, font=MAIN_FONT, weight=BOLD, color=GREEN_B)
        t_inc_math = MathTex(r"y' = f'(x) > 0, \\quad \\forall x \\in K", font_size=30, color=WHITE)
        t_inc_desc1 = Text("➜ Đồ thị đi lên từ trái sang phải (↗)", font_size=22, font=MAIN_FONT, color=GREEN_A)
        t_inc_desc2 = Text("➜ Tiếp tuyến dốc lên: hệ số góc k = y' > 0", font_size=22, font=MAIN_FONT, color=GRAY_A)
        c_inc_group = VGroup(t_inc_title, t_inc_math, t_inc_desc1, t_inc_desc2).arrange(DOWN, aligned_edge=LEFT, buff=0.2).move_to(card_inc)
        fit_width(c_inc_group, 7.8)
        block_inc = VGroup(card_inc, c_inc_group)

        card_dec = RoundedRectangle(corner_radius=0.2, width=8.4, height=4.2, color=RED_D, fill_color="#7F1D1D", fill_opacity=0.35, stroke_width=2.5)
        t_dec_title = Text("2. Hàm số nghịch biến (giảm)", font_size=24, font=MAIN_FONT, weight=BOLD, color=RED_B)
        t_dec_math = MathTex(r"y' = f'(x) < 0, \\quad \\forall x \\in K", font_size=30, color=WHITE)
        t_dec_desc1 = Text("➜ Đồ thị đi xuống từ trái sang phải (↘)", font_size=22, font=MAIN_FONT, color=RED_A)
        t_dec_desc2 = Text("➜ Tiếp tuyến dốc xuống: hệ số góc k = y' < 0", font_size=22, font=MAIN_FONT, color=GRAY_A)
        c_dec_group = VGroup(t_dec_title, t_dec_math, t_dec_desc1, t_dec_desc2).arrange(DOWN, aligned_edge=LEFT, buff=0.2).move_to(card_dec)
        fit_width(c_dec_group, 7.8)
        block_dec = VGroup(card_dec, c_dec_group)

        theory_stack = VGroup(block_inc, block_dec).arrange(DOWN, buff=0.4).next_to(th_sub, DOWN, buff=0.35)

        self.play(FadeIn(th_header), FadeIn(th_sub), run_time=0.6)
        self.play(FadeIn(block_inc, shift=UP * 0.2), run_time=1.0)
        self.play(FadeIn(block_dec, shift=UP * 0.2), run_time=1.0)
        self.wait(1.0)
        self.play(FadeOut(VGroup(th_header, th_sub, theory_stack)), run_time=0.7)

        # ======================================================================
        # PHẦN 3: DUAL-ZONE CONTAINER: ĐỒ THỊ & BẢNG BIẾN THIÊN 3 TẦNG (~38s)
        # ======================================================================
        header_card = RoundedRectangle(corner_radius=0.15, width=8.4, height=1.1, color=BLUE_D, fill_color="#1E293B", fill_opacity=0.95).to_edge(UP, buff=0.35)
        # Tiêu đề Header Bar tinh gọn: Dùng Text trơn trực tiếp, TUYỆT ĐỐI KHÔNG CẦN BOX bọc "Ví dụ minh họa" để chống tràn viền
        ex_lbl = Text("Ví dụ minh họa:", font=MAIN_FONT, font_size=22, weight=BOLD, color=TEAL_A)
        ex_math = MathTex(r"y = x^3 - 3x", font_size=24, color=YELLOW)
        header_content = VGroup(ex_lbl, ex_math).arrange(RIGHT, buff=0.18).move_to(header_card)
        self.play(FadeIn(header_card), FadeIn(header_content), run_time=0.6)

        # 1. TOP CARD: MÔ PHỎNG ĐỒ THỊ & TIẾP TUYẾN CHUYỂN ĐỘNG
        top_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.4, color="#334155", fill_color="#0F172A", fill_opacity=0.95).next_to(header_card, DOWN, buff=0.2)
        top_title = Text("📈 Đồ thị và tiếp tuyến chuyển động", font=MAIN_FONT, font_size=22, weight=BOLD, color=TEAL_A).next_to(top_card.get_top(), DOWN, buff=0.18)

        axes = Axes(
            x_range=[-2.4, 2.4, 1], y_range=[-2.8, 2.8, 1], x_length=7.2, y_length=4.0,
            axis_config={"include_tip": True, "color": GRAY_B, "stroke_width": 2.2, "tip_width": 0.15, "tip_height": 0.15}
        ).move_to(top_card.get_center()).shift(DOWN * 0.25)
        axes_labels = axes.get_axis_labels(x_label=MathTex("x", font_size=22), y_label=MathTex("y", font_size=22))

        f_func = lambda x: x**3 - 3*x
        graph = axes.plot(f_func, x_range=[-2.1, 2.1], color=TEAL_C, stroke_width=4.0)
        graph_lbl = MathTex(r"y = x^3 - 3x", font_size=24, color=TEAL_B).next_to(axes.c2p(1.1, f_func(1.1)), RIGHT, buff=0.15)

        pt_max = axes.c2p(-1, 2)
        pt_min = axes.c2p(1, -2)
        lines_max = axes.get_lines_to_point(pt_max).set_color(YELLOW_B)
        lines_min = axes.get_lines_to_point(pt_min).set_color(YELLOW_B)
        dot_max = Dot(pt_max, color=YELLOW, radius=0.08)
        dot_min = Dot(pt_min, color=YELLOW, radius=0.08)
        lbl_max = MathTex(r"(-1; 2)", font_size=24, color=YELLOW).next_to(dot_max, UP, buff=0.1)
        lbl_min = MathTex(r"(1; -2)", font_size=24, color=YELLOW).next_to(dot_min, DOWN, buff=0.1)

        t_param = ValueTracker(-2.1)
        moving_dot = always_redraw(lambda: Dot(axes.c2p(t_param.get_value(), f_func(t_param.get_value())), color=GOLD, radius=0.09))

        def get_tangent():
            t = t_param.get_value()
            y = f_func(t)
            m = 3 * (t**2) - 3
            dx = 0.38
            p1 = axes.c2p(t - dx, y - m * dx)
            p2 = axes.c2p(t + dx, y + m * dx)
            col = GREEN_C if m > 0.1 else (RED_C if m < -0.1 else YELLOW)
            return Line(p1, p2, color=col, stroke_width=4.0)

        tangent_line = always_redraw(get_tangent)

        def get_status_badge():
            t = t_param.get_value()
            m = 3 * (t**2) - 3
            if abs(t - (-1.0)) < 0.16:
                txt, b_col, bg_col = "x = -1 ➜ Cực đại: y_{CĐ} = 2", GREEN_B, "#064E3B"
            elif abs(t - 1.0) < 0.16:
                txt, b_col, bg_col = "x = 1 ➜ Cực tiểu: y_{CT} = -2", RED_B, "#7F1D1D"
            elif m > 0.1:
                txt, b_col, bg_col = "y' > 0 ➜ Đồng biến (↗)", TEAL_B, "#0F172A"
            else:
                txt, b_col, bg_col = "y' < 0 ➜ Nghịch biến (↘)", ORANGE, "#78350F"
            lbl = Text(txt, font=MAIN_FONT, font_size=22, weight=BOLD, color=WHITE)
            rect = RoundedRectangle(corner_radius=0.1, width=max(4.6, lbl.width + 0.5), height=lbl.height + 0.28, color=b_col, fill_color=bg_col, fill_opacity=0.9, stroke_width=1.8).move_to(lbl)
            return VGroup(rect, lbl).next_to(top_card.get_bottom(), UP, buff=0.16)

        status_badge = always_redraw(get_status_badge)

        self.play(Create(top_card), FadeIn(top_title), run_time=0.5)
        self.play(Create(axes), Write(axes_labels), Create(graph), FadeIn(graph_lbl), run_time=1.2)
        self.play(Create(lines_max), FadeIn(dot_max), FadeIn(lbl_max), Create(lines_min), FadeIn(dot_min), FadeIn(lbl_min), run_time=0.9)
        self.play(FadeIn(moving_dot), Create(tangent_line), FadeIn(status_badge), run_time=0.6)

        # 2. BOTTOM CARD: BẢNG BIẾN THIÊN 3 TẦNG RÕ RÀNG & KẾT LUẬN
        bottom_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.6, color="#334155", fill_color="#1E293B", fill_opacity=0.95).next_to(top_card, DOWN, buff=0.2)
        bot_title = Text("📊 Bảng biến thiên và kết luận", font=MAIN_FONT, font_size=22, weight=BOLD, color=YELLOW).next_to(bottom_card.get_top(), DOWN, buff=0.18)

        calc_deriv = MathTex(r"y' = 3x^2 - 3 = 0 \iff x = \pm 1", font_size=26, color=WHITE)
        bbt = MathTex(
            r"""\renewcommand{\arraystretch}{1.35}
            \begin{array}{|c|ccccccc|}
            \hline
            x & -\infty & & -1 & & 1 & & +\infty \\
            \hline
            y' & & + & 0 & - & 0 & + & \\
            \hline
            & & & 2 & & & & +\infty \\
            y & & \nearrow & & \searrow & & \nearrow & \\
            & -\infty & & & & -2 & & \\
            \hline
            \end{array}""",
            font_size=24, color=WHITE
        )

        t_res_inc = VGroup(
            Text("• y' > 0 ➜ Đồng biến trên:", font_size=22, font=MAIN_FONT, color=GREEN_B, weight=BOLD),
            MathTex(r"(-\infty; -1) \;\\text{và}\; (1; +\infty)", font_size=24, color=WHITE)
        ).arrange(RIGHT, buff=0.15)

        t_res_dec = VGroup(
            Text("• y' < 0 ➜ Nghịch biến trên:", font_size=22, font=MAIN_FONT, color=RED_B, weight=BOLD),
            MathTex(r"(-1; 1)", font_size=24, color=WHITE)
        ).arrange(RIGHT, buff=0.15)

        conclusions = VGroup(t_res_inc, t_res_dec).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        bot_content = VGroup(calc_deriv, bbt, conclusions).arrange(DOWN, buff=0.25).move_to(bottom_card).shift(DOWN * 0.22)
        fit_width(bot_content, 7.8)

        box_conclusion = SurroundingRectangle(conclusions, color=GREEN, buff=0.16, corner_radius=0.12, stroke_width=2.5)

        self.play(Create(bottom_card), FadeIn(bot_title), run_time=0.5)
        self.play(Write(calc_deriv), run_time=0.8)
        self.play(FadeIn(bbt), run_time=1.1)
        self.play(t_param.animate.set_value(-1.0), run_time=1.8, rate_func=smooth)
        self.wait(0.8)
        self.play(t_param.animate.set_value(1.0), run_time=2.0, rate_func=smooth)
        self.wait(0.8)
        self.play(t_param.animate.set_value(2.1), run_time=1.6, rate_func=smooth)
        self.play(FadeIn(conclusions), Create(box_conclusion), run_time=1.1)
        self.wait(1.0)

        sim_all = VGroup(
            header_card, header_content, top_card, top_title, axes, axes_labels, graph, graph_lbl,
            lines_max, lines_min, dot_max, dot_min, lbl_max, lbl_min, moving_dot, tangent_line, status_badge,
            bottom_card, bot_title, bot_content, box_conclusion
        )
        self.play(FadeOut(sim_all), run_time=0.8)

        # ======================================================================
        # PHẦN 4: CHỮA BÀI TẬP THỰC CHIẾN TỪ ĐỀ THI GỐC (~38s)
        # ======================================================================
        # Tiêu đề Header Bar thực chiến: Text trơn, TUYỆT ĐỐI KHÔNG CẦN BOX bọc "Thực chiến" hay "Dạng 1" để chống tràn viền
        qz_header_card = RoundedRectangle(corner_radius=0.15, width=8.4, height=1.1, color=BLUE_D, fill_color="#1E293B", fill_opacity=0.95).to_edge(UP, buff=0.35)
        qz_title_txt = Text("⚡ Thực chiến: Chữa đề thi THPT Quốc gia", font=MAIN_FONT, font_size=22, weight=BOLD, color=YELLOW).move_to(qz_header_card)
        self.play(FadeIn(qz_header_card), FadeIn(qz_title_txt), run_time=0.5)

        # 1. KHUNG TRÊN: CÂU 1 (ĐỌC BẢNG BIẾN THIÊN - MINH HỌA BỐ CỤC 4x1 KHI ĐÁP ÁN NGẮN)
        c1_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.4, color="#334155", fill_color="#0F172A", fill_opacity=0.95).next_to(qz_header_card, DOWN, buff=0.2)
        c1_title = Text("Câu 1: Đọc bảng biến thiên", font=MAIN_FONT, font_size=22, weight=BOLD, color=TEAL_A).next_to(c1_card.get_top(), DOWN, buff=0.18)
        c1_quest = Text("Cho hàm số f(x) có bảng biến thiên như hình dưới:", font=MAIN_FONT, font_size=22, color=WHITE)

        c1_bbt = MathTex(
            r"""\renewcommand{\arraystretch}{1.3}
            \begin{array}{|c|ccccccccc|}
            \hline
            x & -\infty & & -1 & & 0 & & 1 & & +\infty \\
            \hline
            f'(x) & & - & 0 & + & 0 & - & 0 & + & \\
            \hline
            & +\infty & & & & 0 & & & & +\infty \\
            f(x) & & \searrow & & \nearrow & & \searrow & & \nearrow & \\
            & & & -1 & & & & -1 & & \\
            \hline
            \end{array}""",
            font_size=22, color=WHITE
        )

        c1_ask = Text("Hỏi: Hàm số đã cho đồng biến trên khoảng nào?", font=MAIN_FONT, font_size=22, color=YELLOW)
        optA = MathTex(r"\mathbf{A.}\; (-\infty; -1)", font_size=22, color=WHITE)
        optB = MathTex(r"\mathbf{B.}\; (0; 1)", font_size=22, color=WHITE)
        optC = MathTex(r"\mathbf{C.}\; (-1; 1)", font_size=22, color=WHITE)
        optD = MathTex(r"\mathbf{D.}\; (-1; 0)", font_size=22, color=GREEN_B)
        # DẠNG 4x1: 4 đáp án ngắn gọn nằm trên 1 hàng ngang
        opts_row = VGroup(optA, optB, optC, optD).arrange(RIGHT, buff=0.35)

        c1_sol = VGroup(
            Text("➜ f'(x) > 0 và đồ thị đi lên trên (-1; 0). Chọn", font=MAIN_FONT, font_size=22, color=GREEN_B, weight=BOLD),
            MathTex(r"\mathbf{D}", font_size=24, color=GREEN)
        ).arrange(RIGHT, buff=0.15)

        c1_content = VGroup(c1_quest, c1_bbt, c1_ask, opts_row, c1_sol).arrange(DOWN, buff=0.18).move_to(c1_card).shift(DOWN * 0.22)
        fit_width(c1_content, 7.8)
        ans_c1_box = SurroundingRectangle(optD, color=GREEN, buff=0.12, corner_radius=0.08, stroke_width=2.5)

        self.play(Create(c1_card), FadeIn(c1_title), run_time=0.5)
        self.play(FadeIn(c1_quest), FadeIn(c1_bbt), FadeIn(c1_ask), run_time=1.3)
        self.play(FadeIn(opts_row), run_time=0.7)
        self.play(Write(c1_sol), Create(ans_c1_box), run_time=1.0)
        self.wait(1.0)

        # 2. KHUNG DƯỚI: CÂU 2 (XÉT DẤU ĐẠO HÀM - ƯU TIÊN 1 DÒNG CHO ĐỀ BÀI)
        c2_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.6, color="#334155", fill_color="#1E293B", fill_opacity=0.95).next_to(c1_card, DOWN, buff=0.2)
        c2_title = Text("Câu 2: Xét dấu đạo hàm", font=MAIN_FONT, font_size=22, weight=BOLD, color=YELLOW).next_to(c2_card.get_top(), DOWN, buff=0.18)

        # Đề bài ngắn: Trình bày trọn vẹn trên 1 hàng duy nhất (chống xuống dòng vô tội vạ)
        c2_quest = VGroup(
            Text("Cho hàm số", font=MAIN_FONT, font_size=22, color=WHITE),
            MathTex(r"y = x^3 - 3x^2.", font_size=24, color=WHITE),
            Text("Mệnh đề nào dưới đây đúng?", font=MAIN_FONT, font_size=22, color=WHITE)
        ).arrange(RIGHT, buff=0.12)
        fit_width(c2_quest, 7.8)

        # DẠNG 2x2: Bố cục 2 hàng x 2 cột (Khóa 2 cột thẳng tắp, không bao giờ lệch hàng zíc-zắc)
        c2_optA = MathTex(r"\mathbf{A.}\; (0; 2)", font_size=22, color=WHITE)
        c2_optB = MathTex(r"\mathbf{B.}\; (-\infty; 0)", font_size=22, color=WHITE)
        c2_optC = MathTex(r"\mathbf{C.}\; (2; +\infty)", font_size=22, color=WHITE)
        c2_optD = MathTex(r"\mathbf{D.}\; (0; 2) \;\text{và}\; (2; +\infty)", font_size=22, color=GREEN_B)
        col1 = VGroup(c2_optA, c2_optC).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        col2 = VGroup(c2_optB, c2_optD).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        c2_opts = VGroup(col1, col2).arrange(RIGHT, buff=0.85, aligned_edge=UP)

        step1 = MathTex(r"\text{Bước 1: } y' = 3x^2 - 6x = 3x(x - 2)", font_size=24, color=LIGHT_GRAY)
        step2 = MathTex(r"\text{Bước 2: } y' = 0 \iff x = 0 \quad\text{hoặc}\quad x = 2", font_size=24, color=LIGHT_GRAY)
        step3 = VGroup(
            Text("Bước 3 (Trong trái ngoài cùng, a = 3 > 0):", font=MAIN_FONT, font_size=22, color=YELLOW),
            MathTex(r"y' < 0 \iff x \in (0; 2)", font_size=24, color=WHITE)
        ).arrange(RIGHT, buff=0.15)

        c2_concl = VGroup(
            Text("➜ Hàm số nghịch biến trên (0; 2). Chọn", font=MAIN_FONT, font_size=22, color=GREEN_B, weight=BOLD),
            MathTex(r"\mathbf{B}", font_size=24, color=GREEN)
        ).arrange(RIGHT, buff=0.15)

        c2_content = VGroup(c2_quest, c2_opts, step1, step2, step3, c2_concl).arrange(DOWN, aligned_edge=LEFT, buff=0.16).move_to(c2_card).shift(DOWN * 0.22)
        fit_width(c2_content, 7.8)
        ans_c2_box = SurroundingRectangle(c2_optB, color=GREEN, buff=0.12, corner_radius=0.08, stroke_width=2.5)

        self.play(Create(c2_card), FadeIn(c2_title), run_time=0.5)
        self.play(FadeIn(c2_quest), FadeIn(c2_opts), run_time=0.9)
        self.play(Write(step1), Write(step2), run_time=1.1)
        self.play(FadeIn(step3), run_time=0.8)
        self.play(Write(c2_concl), Create(ans_c2_box), run_time=1.0)
        self.wait(1.0)

        qz_all = VGroup(
            qz_header_card, qz_header_content,
            c1_card, c1_title, c1_content, ans_c1_box,
            c2_card, c2_title, c2_content, ans_c2_box
        )
        self.play(FadeOut(qz_all), run_time=0.8)

        # ======================================================================
        # PHẦN 5: TỔNG KẾT & OUTRO THƯƠNG HIỆU (~8s)
        # ======================================================================
        outro_card = RoundedRectangle(corner_radius=0.25, width=8.4, height=13.6, color=GOLD_E, fill_color="#0F172A", fill_opacity=0.96).move_to(ORIGIN)
        outro_header = Text("Tổng kết bí kíp ${config.topic}", font_size=28, weight=BOLD, color=YELLOW, font=MAIN_FONT)

        p1_title = Text("1. Dấu đạo hàm quyết định chiều biến thiên:", font_size=24, font=MAIN_FONT, color=TEAL_A, weight=BOLD)
        p1_desc = Text("• f'(x) > 0 ➜ Đồng biến (Đồ thị đi lên ↗)\n• f'(x) < 0 ➜ Nghịch biến (Đồ thị đi xuống ↘)", font_size=22, font=MAIN_FONT, color=WHITE, line_spacing=1.2)
        b_p1 = VGroup(p1_title, p1_desc).arrange(DOWN, aligned_edge=LEFT, buff=0.15)

        p2_title = Text("2. Đọc Đồ thị & Bảng Biến Thiên:", font_size=24, font=MAIN_FONT, color=TEAL_A, weight=BOLD)
        p2_desc = Text("• Đọc chiều biến thiên theo hướng từ TRÁI sang PHẢI\n• Luôn kết luận khoảng đơn điệu theo trục x", font_size=22, font=MAIN_FONT, color=WHITE, line_spacing=1.2)
        b_p2 = VGroup(p2_title, p2_desc).arrange(DOWN, aligned_edge=LEFT, buff=0.15)

        p3_title = Text("3. Bài toán cho công thức hàm số:", font_size=24, font=MAIN_FONT, color=TEAL_A, weight=BOLD)
        p3_desc = Text("• Tính đạo hàm y', giải y' = 0 và xét dấu theo quy tắc", font_size=22, font=MAIN_FONT, color=WHITE, line_spacing=1.2)
        b_p3 = VGroup(p3_title, p3_desc).arrange(DOWN, aligned_edge=LEFT, buff=0.15)

        points_group = VGroup(b_p1, b_p2, b_p3).arrange(DOWN, aligned_edge=LEFT, buff=0.35)

        brand_badge = RoundedRectangle(corner_radius=0.16, width=5.6, height=1.0, color=RED, fill_color=RED_E, fill_opacity=0.9)
        brand_txt = Text("Học toán cùng Yuta", font_size=26, weight=BOLD, color=WHITE, font=MAIN_FONT).move_to(brand_badge)
        sub_brand = Text("Bấm Follow để nhận bài giảng mới mỗi ngày!", font_size=22, font=MAIN_FONT, color=GRAY_B)
        brand_group = VGroup(VGroup(brand_badge, brand_txt), sub_brand).arrange(DOWN, buff=0.18)

        outro_content = VGroup(outro_header, points_group, brand_group).arrange(DOWN, buff=0.45).move_to(outro_card)
        fit_width(outro_content, 7.8)

        self.play(Create(outro_card), run_time=0.8)
        self.play(FadeIn(outro_header, shift=DOWN * 0.3), run_time=0.6)
        self.play(LaggedStart(FadeIn(b_p1, shift=LEFT * 0.2), FadeIn(b_p2, shift=LEFT * 0.2), FadeIn(b_p3, shift=LEFT * 0.2), lag_ratio=0.3), run_time=2.0)
        self.play(FadeIn(brand_group, scale=0.85), run_time=1.0)
        
        # BẮT BUỘC: Giữ nguyên màn hình Outro thương hiệu, TUYỆT ĐỐI KHÔNG FadeOut làm đen màn hình!
        self.wait(1.5)
\`\`\`

IV. HƯỚNG DẪN RENDER VÀ QUY TẮC BẮT BUỘC:
1. CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN PYTHON TRONG \`\`\`python ... \`\`\`.
2. TUYỆT ĐỐI KHÔNG viết lời chào, lời dẫn hay giải thích ngoài mã để không làm tràn token hệ thống.
3. TUYỆT ĐỐI KHÔNG FadeOut toàn bộ màn hình ở cuối video. Giữ nguyên thẻ Outro "Học toán cùng Yuta".
4. TUÂN THỦ NGUYÊN TẮC CHỐNG ĐÈ CHỮ (ZERO OVERLAP): Bố cục Khung Thẻ Container Dual-Zone chuẩn xác, dãn hàng line_spacing=1.2, gọi fit_width(group, 7.8) cho mọi khối nội dung.
5. QUY TẮC CHỈ SỐ TRÊN/DƯỚI & CÔNG THỨC TOÁN HỌC: BẮT BUỘC 100% các chỉ số trên (số mũ x^2, x^3), chỉ số dưới (x_0, x_1), đạo hàm (y') phải dùng MathTex(r"..."). TUYỆT ĐỐI CẤM dùng ký tự unicode mũ (x², x³, x₁, x₀) trong Text(...) để tránh lỗi font vỡ glyph.
6. TIÊU ĐỀ PILL BADGE: Sử dụng "Ví dụ minh họa" hoặc "Ví dụ" (Sentence case chuẩn tiếng Việt), TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
7. QUY TẮC NHỊP ĐỘ DIỄN HOẠT (PACING VỪA PHẢI, MƯỢT MÀ): Tại các điểm quan sát mấu chốt (tiếp tuyến đạt cực trị y'=0 đổi màu, bảng biến thiên xuất hiện, đóng khung kết luận), dừng vừa vặn self.wait(0.8) đến self.wait(1.0). TUYỆT ĐỐI KHÔNG dừng quá lâu (>1.2s - 1.5s) làm video bị đơ hoặc kéo dài lê thê.
8. Đóng đầy đủ ngoặc và lệnh construct(self). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim ${qualityFlag} scene.py MainScene\`, AI tuyệt đối không tự chạy lệnh render này).
9. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file, không view_file). CHỈ xuất mã nguồn văn bản trực tiếp.`;
};

export const generatePlaylistSeriesOutlinePrompt = (config: VideoConfig): string => {
  const count = config.seriesCount || 3;
  return `Đóng vai Giám đốc Sản xuất Nội dung Giáo dục & Khóa học Video Khoa học.
Chủ đề lớn: "${config.topic}" (Môn học: "${config.subject}").
Đối tượng: ${config.audience}.
Yêu cầu chi tiết: ${config.details || "Thiết kế lộ trình học mạch lạc, từ nhập môn trực quan đến vận dụng nâng cao"}.

Hãy lập dàn ý chi tiết cho CHUỖI PLAYLIST GỒM ĐÚNG ${count} TẬP VIDEO DIỄN HOẠT TRỰC QUAN (MANIM CE).
Với mỗi tập (từ Tập 1 đến Tập ${count}), hãy cung cấp:
1. Tên tập ngắn gọn, thu hút (dưới 12 từ).
2. Trọng tâm kiến thức / Ý tưởng diễn hoạt thị giác chính.
3. Thông điệp cốt lõi người xem nhận được sau tập này.

Định dạng trả về JSON dạng:
\`\`\`json
[
  {
    "episode": 1,
    "title": "Tên tập 1",
    "focus": "Trọng tâm bài học",
    "visual_concept": "Mô phỏng hình học / đồ thị chính"
  }
]
\`\`\`
`;
};

export const generateVideoScriptPrompt = (config: VideoConfig): string => {
  return `Đóng vai Biên kịch & Đạo diễn Sản xuất Video Giáo dục Chuyên nghiệp.
Nhiệm vụ: Viết kịch bản chi tiết và bảng phân cảnh (Storyboard) cho video diễn hoạt chủ đề: "${config.topic}" (Môn học: "${config.subject}").
- Định dạng: ${config.format === 'vertical' ? 'Video Dọc 9:16 (Shorts/TikTok)' : 'Video Ngang 16:9 (YouTube)'}
- Thời lượng: ${config.duration}
- Giọng văn: ${config.tone}
- Khán giả: ${config.audience}
- Chi tiết bổ sung: ${config.details || "Trực quan, dễ hiểu"}

Hãy xuất bản:
1. BẢNG PHÂN CẢNH (STORYBOARD TABLE) gồm: Thời gian | Lời thoại thuyết minh (Voiceover) | Hình ảnh diễn hoạt Manim tương ứng | Hiệu ứng âm thanh.
2. NỘI DUNG PHỤ ĐỀ CHUẨN .SRT.`;
};

export const generateManimRevisionPrompt = (
  config: VideoConfig | null | undefined,
  existingCode: string,
  userFeedback: string
): string => {
  const subjectStr = config?.subject ? `Môn học: "${config.subject}"` : 'Môn học: Toán học / Khoa học';
  const topicStr = config?.topic ? `Chủ đề: "${config.topic}"` : '';
  const isVertical = config?.format === 'vertical';
  const qualityFlag = config?.renderQuality === '1080p' ? '-qh' : config?.renderQuality === '4k' ? '-qk' : '-ql';
  const chosenFont = getFontDirective(config?.fontStyle);

  return `Đóng vai Chuyên gia Diễn hoạt Manim CE & Lập trình Python Sư phạm (chuẩn c1_HamSo_DonDieu.py).
Nhiệm vụ của bạn là đọc mã nguồn Python Manim (\`scene.py\`) đã được tạo trước đó cùng danh sách CÁC LỖI VÀ YÊU CẦU ĐIỀU CHỈNH từ người dùng, sau đó VIẾT LẠI MÃ PYTHON HOÀN CHỈNH TỪ ĐẦU để sửa triệt để các lỗi và render lại video.

I. THÔNG TIN BÀI HỌC:
- ${subjectStr}
- ${topicStr}
- Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / Shorts)' : 'NGANG 16:9 (YouTube)'}
- Font chữ chỉ định: "${chosenFont}"

II. DANH SÁCH LỖI VÀ YÊU CẦU ĐIỀU CHỈNH TỪ NGƯỜI DÙNG:
"""
${userFeedback.trim()}
"""

III. MÃ NGUỒN MANIM PYTHON HIỆN TẠI (CẦN KHẮC PHỤC):
\`\`\`python
${existingCode.trim()}
\`\`\`

IV. YÊU CẦU THỰC THI BẮT BUỘC:
1. Đọc kỹ từng góp ý, câu từ cần sửa, hoặc lỗi bố cục được ghi trong mục II.
2. Viết lại TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) từ đầu, kế thừa cấu trúc 5 PHÂN CẢNH CHUẨN MỰC:
   - Intro -> Lý thuyết các thẻ màu -> Dual-Zone Mô phỏng động tiếp tuyến đổi màu & BBT 3 tầng -> Bài tập thực chiến theo từng dạng bài (mỗi dạng 2 câu trên Top/Bottom Card, FadeOut dọn sạch màn hình giữa các dạng bài để chữa từ 2 đến 6+ câu mà vẫn đảm bảo Zero-Overlap 100% và cỡ chữ lớn >= 22) -> Thẻ Outro thương hiệu (giữ nguyên self.wait(1.5)). Khớp nối tổng thời lượng video với thời lượng yêu cầu.
3. Giữ vững quy chuẩn CHỐNG ĐÈ CHỮ (ZERO OVERLAP), áp dụng Khung Thẻ Container Dual-Zone lấp đầy 93% màn hình, dãn dòng \`line_spacing=1.2\`, gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ, font_size lớn rõ nét (Tiêu đề 28-32 BOLD, Thẻ 22-24, MathTex 24-30, Text tiếng Việt 20-22). Dùng font "${chosenFont}". TUYỆT ĐỐI KHÔNG IN HOA (Sentence case chuẩn tiếng Việt cho mọi tiêu đề, thẻ, badges, câu hỏi và đề bài).
4. QUY TẮC ƯU TIÊN 1 DÒNG, BOX VỪA KHÍT, TIẾP TUYẾN & BỐ CỤC 4 ĐÁP ÁN:
   - QUY TẮC ƯU TIÊN 1 DÒNG (SINGLE-LINE FIRST) & CHỐNG XUỐNG DÒNG VÔ TỘI VẠ: Mọi đề bài, câu hỏi, dữ kiện và kết luận NGẮN (<= 14-16 từ) BẮT BUỘC viết trên CÙNG 1 DÒNG DUY NHẤT, CẤM ngắt dòng \\n vô tội vạ hoặc chia nhỏ một câu ngắn với arrange(DOWN). Nối ngang bằng arrange(RIGHT, buff=0.12).
   - Khung viền SurroundingRectangle(buff=0.12-0.15) ôm vừa khít nội dung, không tràn và không quá thừa.
   - TIẾP TUYẾN CHUẨN MỰC (c1_HamSo_DonDieu.py): dx = 0.38; p1 = axes.c2p(t - dx, y - m * dx); p2 = axes.c2p(t + dx, y + m * dx). Gọn gàng, vừa vặn thẻ, không cần vector phức tạp.
   - BỐ CỤC 4 ĐÁP ÁN LIỀN KHỐI: Mọi đáp án A, B, C, D là khối nguyên vẹn trên 1 hàng (MathTex(r"\\mathbf{A.}\\; ..."), CẤM chữ A. đứng riêng 1 dòng). Bố trí dạng 4x1 (ngắn <= 8 ký tự), dạng 2x2 KHÓA 2 CỘT THẲNG TẮP (trung bình), hoặc dạng 1x4 (dài). ans_box = SurroundingRectangle(opt, buff=0.12) vừa khít đáp án đúng.
5. QUY TẮC CHỈ SỐ TRÊN/DƯỚI & PILL BADGE: 100% chỉ số trên/dưới dùng MathTex(r"..."), CẤM dùng unicode trong Text. Dùng "Ví dụ minh họa" hoặc "Ví dụ", TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
6. NHỊP ĐỘ DIỄN HOẠT (PACING VỪA PHẢI, MƯỢT MÀ): Dừng vừa vặn self.wait(0.8) - self.wait(1.0) tại điểm mấu chốt, đổi màu tiếp tuyến và BBT, giữ Outro self.wait(1.5). TUYỆT ĐỐI KHÔNG dừng quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê.
7. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết lời chào hay giải thích ngoài mã.
8. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim ${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};
