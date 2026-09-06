import { VideoConfig } from "../../types";

export const MANIM_SKILLS_GUIDE = `
★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★★★
(Kế thừa 15 Nguyên Tắc Vàng & Hệ Thống Kỹ Thuật Chống Đè Chữ - Bố Cục Động & Spacing Chuẩn)

1. 15 NGUYÊN TẮC VÀNG VỀ BỐ CỤC, SPACING & VISUAL ENGINEERING:
   - NGUYÊN TẮC 1 (DÙNG QUAN HỆ HÌNH HỌC THAY VÌ TỌA ĐỘ TUYỆT ĐỐI):
     * TUYỆT ĐỐI KHÔNG dùng "magic coordinates" ước lượng như obj1.move_to(UP * 2), obj2.move_to(UP * 1.5).
     * BẮT BUỘC dùng quan hệ hình học: formula.next_to(title, DOWN, buff=0.4), note.next_to(formula, DOWN, buff=0.35).
   - NGUYÊN TẮC 2 (GROUP TRƯỚC KHI LAYOUT & ANIMATE):
     * Gom nhóm các đối tượng vào VGroup rồi mới định vị hoặc animate: VGroup(t1, t2, t3).arrange(DOWN, buff=0.35).
   - NGUYÊN TẮC 3 (arrange() LÀ CÔNG CỤ CHỐNG CHỒNG LẤN & CHUẨN SPACING):
     * Luôn dùng group.arrange(DOWN, buff=0.35) hoặc arrange(RIGHT, buff=0.25) để các phần tử tự động dãn cách đều, đẹp mắt.
   - NGUYÊN TẮC 4 (QUY CHUẨN FONT CHỮ & BỐ CỤC CHỮ CHUẨN XÁC):
     * Hỗ trợ cả Font Có Chân (Serif: "Times New Roman", "Liberation Serif") lẫn Font Không Chân (Sans-Serif: "Be Vietnam Pro", "Inter").
     * Mọi Text nhiều dòng BẮT BUỘC set line_spacing=1.2 để khoảng cách hàng chữ không bị dính sát nhau.
     * Khi ghép dòng chữ và công thức: VGroup(Text("...", font=FONT_NAME), MathTex(r"...")).arrange(RIGHT, buff=0.25).
   - NGUYÊN TẮC 5 (LUÔN KIỂM SOÁT WIDTH/HEIGHT CỦA TEXT VÀ FORMULA):
     * Dùng helper fit_width(obj, max_width) hoặc scale_to_fit_width(max_w) để không bao giờ bị tràn biên frame hay chữ bị co méo.
   - NGUYÊN TẮC 6 (CHỪA SAFE MARGINS AN TOÀN QUANH KHUNG HÌNH):
     * Luôn giữ khoảng cách an toàn: SAFE_X = config.frame_width / 2 - 0.45; SAFE_Y = config.frame_height / 2 - 0.35. Không bao giờ đặt text/công thức sát mép màn hình.
   - NGUYÊN TẮC 7 (MỘT VISUAL IDEA TẠI MỘT THỜI ĐIỂM - ONE VISUAL IDEA PER MOMENT):
     * Không đưa cùng lúc công thức + đồ thị + 5 chú thích + bảng lên màn hình gây quá tải nhận thức.
     * Quy trình hiển thị: Tiêu đề -> Ý tưởng/Khái niệm -> Mô phỏng trực quan -> Biến đổi công thức -> Highlight kết quả -> Tạm dừng (Pause).
   - NGUYÊN TẮC 8 (KHÔNG ĐỂ QUÁ NHIỀU OBJECT XUẤT HIỆN CÙNG LÚC):
     * Dùng LaggedStart(*[FadeIn(x) for x in group], lag_ratio=0.15) để tạo nhịp điệu thị giác tự nhiên.
   - NGUYÊN TẮC 9 (HIGHLIGHT THAY VÌ TRANG TRÍ DƯ THỪA):
     * Đóng khung làm nổi bật trọng tâm: SurroundingRectangle(target, buff=0.15, color=GREEN, corner_radius=0.1).
     * Tạo điểm nhấn chuyển động: Flash(dot, color=YELLOW), Indicate(formula), hoặc Circumscribe(key_term).
   - NGUYÊN TẮC 10 (ƯU TIÊN TRANSFORM CHO BIẾN ĐỔI TOÁN HỌC):
     * Khi giải toán biến đổi đại số, dùng TransformMatchingTex(old_tex, new_tex) để các ký hiệu toán học bay mượt mà vào vị trí mới thay vì FadeOut/FadeIn giật cục.
   - NGUYÊN TẮC 11 (DÙNG always_redraw() CHO OBJECT THỰC SỰ ĐỘNG):
     * Khi điểm Dot di chuyển trên đồ thị, dùng always_redraw() cho Dot, đường gióng nét đứt DashedLine, hoặc tiếp tuyến theo ValueTracker.
   - NGUYÊN TẮC 12 (CẤU TRÚC CONTAINER THEO BỘ FORM MÔ PHỎNG):
     * Tuân thủ cấu trúc của Bộ Form đã chọn (Hình học, Đối thoại 2 người Thầy-Trò, Giải tích hàm số, Mẹo giải nhanh 30s, STEM).
   - NGUYÊN TẮC 13 (KHOẢNG NGHỈ CÓ CHỦ ĐÍCH - DELIBERATE PAUSE):
     * Sau mỗi bước tính toán quan trọng hoặc khi xuất hiện công thức mấu chốt, luôn có self.wait(1.5 đến 2.5s) để người học kịp đọc và tiếp thu.
   - NGUYÊN TẮC 14 (TẤM NỀN BACKDROP BẢO VỆ CHỮ KHÔNG BỊ ĐỒ THỊ ĐÈ):
     * Mọi nhãn chữ nằm gần đồ thị/hình vẽ dùng: add_backdrop(label) hoặc label.add_background_rectangle(color="#0F172A", opacity=0.9, buff=0.1).
   - NGUYÊN TẮC 15 (ANIMATION PHỤC VỤ GIẢNG DẠY & GIỮ NGUYÊN OUTRO THƯƠNG HIỆU):
     * Mọi hiệu ứng chuyển động đều có mục đích giải thích trực giác.
     * Cảnh Outro cuối bài: Giữ nguyên thẻ Outro thương hiệu "Học toán cùng Yuta" (self.wait(2.5)), TUYỆT ĐỐI KHÔNG DÙNG FadeOut(*self.mobjects) làm đen kịt màn hình.

2. CHUẨN MỰC CÔNG THỨC TOÁN HỌC LATEX HOÀN HẢO (100% PERFECT LATEX):
   - MỌI CÔNG THỨC TOÁN, PHƯƠNG TRÌNH, KÝ HIỆU, BIẾN SỐ BẮT BUỘC DÙNG MathTex(r"...") VỚI RAW STRING (TIỀN TỐ r):
     * Phân số chuẩn: \\frac{a}{b} (TUYỆT ĐỐI KHÔNG viết a/b).
     * Căn thức chuẩn: \\sqrt{x}, \\sqrt[n]{x} (TUYỆT ĐỐI KHÔNG viết sqrt(x)).
     * Tích phân & Đạo hàm: \\int_a^b f(x)\\,dx, \\frac{df}{dx}, f'(x), \\frac{\\partial f}{\\partial x}.
     * Giới hạn & Chuỗi tổng: \\lim_{x \\to x_0} f(x), \\sum_{k=1}^n a_k.
     * Vector & Hình học: \\vec{u}, \\vec{AB}, \\Delta ABC, \\widehat{AOB}, \\perp, \\parallel.
     * Ký hiệu Logic & Tập hợp: \\Leftrightarrow, \\Rightarrow, \\forall, \\exists, \\mathbb{R}, \\mathbb{N}, \\mathbb{Z}, \\in.
   - BIẾN ĐỔI TOÁN NHIỀU DÒNG CĂN LỀ THEO DẤU BẰNG: Dùng môi trường aligned trong MathTex:
     MathTex(r"\\begin{aligned} f'(x) &= 3x^2 - 6x \\\\ &= 3x(x - 2) \\end{aligned}")
   - PHÂN TÁCH TRIỆT ĐỂ CHỮ VÀ CÔNG THỨC (CHỐNG LỖI UNICODE LATEX):
     * Tiếng Việt / Chú thích / Nhãn: DÙNG Text("...", font=FONT_NAME).
     * Ký hiệu toán học: DÙNG MathTex(r"...").
     * Ghép nối dòng chữ và công thức: Dùng VGroup(Text("Bước 1:", font=FONT_NAME), MathTex(r"f(x) = x^2 - 4")).arrange(RIGHT, buff=0.25).
     * TUYỆT ĐỐI KHÔNG gõ chữ tiếng Việt có dấu trực tiếp vào MathTex mà không bọc \\text{} vì sẽ gây lỗi biên dịch LaTeX!
   - ĐÓNG KHUNG NỔI BẬT ĐÁP SỐ / KẾT QUẢ:
     result_box = SurroundingRectangle(result_formula, color=GREEN, buff=0.15, corner_radius=0.1)
     self.play(Create(result_box), Flash(result_formula, color=YELLOW))

3. BỘ FORM MÔ PHỎNG CHUYÊN MÔN (SPECIALIZED SIMULATION FORMS):
   - FORM HÌNH HỌC & VECTOR (geometry):
     * Dùng Axes, Polygon, Circle, Arrow (vector), RightAngle, Dot. Di chuyển vector hoặc xoay góc bằng ValueTracker & Transform.
   - FORM ĐỐI THOẠI 2 NGƯỜI (dialogue - Thầy & Trò Q&A):
     * Thẻ Thầy Yuta bên Trái/Trên: teacher_card = VGroup(RoundedRectangle(corner_radius=0.15, color=BLUE, fill_opacity=0.2), Text("👨‍🏫 Thầy Yuta", font_size=18, color=BLUE_B))
     * Thẻ Học sinh bên Phải/Dưới: student_card = VGroup(RoundedRectangle(corner_radius=0.15, color=GREEN, fill_opacity=0.2), Text("🙋‍♂️ Học sinh", font_size=18, color=GREEN_B))
     * Bong bóng thắc mắc xuất hiện trước -> Thầy đưa giải đáp trực quan & công thức LaTeX chuẩn.
   - FORM GIẢI TÍCH & HÀM SỐ (calculus):
     * Axes, graph = axes.plot(...), tiếp tuyến move_along_path/ValueTracker, diện tích axes.get_area().
   - FORM MẸO & THỦ THUẬT 30S (fast_tricks):
     * Bố cục 2 cột so sánh: Cột Trái "❌ Cách tự luận dài (3 phút)" (gạch đỏ) VS Cột Phải "⚡ Mẹo thần tốc (30 giây)" (tô xanh + Flash).
   - FORM STEM & KHOA HỌC (stem):
     * Quỹ đạo vật lý, sóng điều hòa axes.plot(lambda t: np.sin(t)), mô hình phân tử/electron quay quanh hạt nhân, hoặc sơ đồ mạch điện.

4. BỐ CỤC CHUẨN STUDIO CHỐNG ĐÈ CHỮ (ZERO OVERLAP DUAL-ZONE LAYOUT):
   - VIDEO NGANG 16:9 (1920x1080):
     * CỘT TRÁI (VISUAL SIMULATION ZONE - Chiếm 55% màn hình): .to_edge(LEFT, buff=0.8).
     * CỘT PHẢI (LATEX FORMULA ZONE - Chiếm 45% màn hình): .to_edge(RIGHT, buff=0.8).
   - VIDEO DỌC 9:16 (1080x1920 - Shorts / Reels / TikTok):
     * TẦNG TRÊN: Mô phỏng đồ thị / hình học / đối thoại (scale 0.65, shift UP * 2.8).
     * TẦNG DƯỚI: Công thức LaTeX giải chi tiết từng bước (shift DOWN * 2.8).

5. RUNTIME HELPERS SẴN CÓ TRONG HỆ THỐNG:
   - fit_width(obj, max_width): Tự động co nhỏ obj nếu vượt quá max_width.
   - fit_height(obj, max_height): Tự động co nhỏ obj nếu vượt quá max_height.
   - fit_group(group, max_w, max_h): Co nhóm đối tượng vừa vặn vùng an toàn.
   - vertical_stack(*objects, buff=0.35): Tạo VGroup và arrange(DOWN).
   - horizontal_stack(*objects, buff=0.4): Tạo VGroup và arrange(RIGHT).
   - add_backdrop(mobj): Tự động thêm nền đen mờ chống đè chữ cho nhãn.

6. ĐỒNG BỘ GIỌNG ĐỌC AI & LỜI THOẠI THUYẾT MINH TRÔI CHẢY TRUYỀN CẢM:
   - QUY CHUẨN LỜI THOẠI: Soạn lời thuyết minh phong phú, truyền cảm, trôi chảy tự nhiên với đầy đủ câu từ, dẫn dắt sư phạm mạch lạc. TUYỆT ĐỐI KHÔNG viết lời thoại vắn tắt hay giật cục!
   - KỸ THUẬT NGẮT NGHỈ: Sử dụng dấu ba chấm "...", dấu gạch ngang "-", dấu chấm phẩy ";" giữa các vế câu và giữa các phân cảnh để AI tự động ngắt nghỉ ~0.8s nhịp nhàng, truyền cảm.
`;

const getFontDirective = (fontStyle?: string): string => {
  return fontStyle === 'sans' ? 'Be Vietnam Pro' : 'Times New Roman';
};

const getSimulationModeDescription = (mode?: string): string => {
  switch (mode) {
    case 'geometry':
      return `[BỘ FORM MÔ PHỎNG HÌNH HỌC & VECTOR]: 
Xây dựng mô hình 2D/3D với Axes, Triangle/Polygon, Circle, Arrow biểu diễn vector, RightAngle đánh dấu góc vuông, và điểm chuyển động Dot. Kết hợp vector với công thức biến đổi hình học.`;
    case 'dialogue':
      return `[BỘ FORM ĐỐI THOẠI 2 NGƯỜI (THẦY - TRÒ Q&A)]: 
Tạo 2 thẻ đại diện: Thẻ "👨‍🏫 Thầy Yuta" bên Trái/Trên và Thẻ "🙋‍♂️ Học sinh" bên Phải/Dưới. 
Học sinh đưa ra câu hỏi thắc mắc trong khung bong bóng -> Thầy Yuta xuất hiện giải đáp trực quan từng bước bằng công thức LaTeX và mô hình minh họa.`;
    case 'calculus':
      return `[BỘ FORM GIẢI TÍCH & KHẢO SÁT HÀM SỐ]: 
Tạo hệ trục Axes, đồ thị axes.plot(...), tiếp tuyến di chuyển trượt trên đường cong với ValueTracker, tô màu diện tích tích phân axes.get_area(), và bảng cực trị/tiệm cận.`;
    case 'fast_tricks':
      return `[BỘ FORM MẸO & THỦ THUẬT GIẢI NHANH 30S]: 
Bố cục 2 cột so sánh song song: 
- Cột Trái (❌ Cách tự luận truyền thống - 3 phút): Hiển thị phép tính dài, dùng gạch đỏ cảnh báo tốn thời gian.
- Cột Phải (⚡ Mẹo thần tốc 30s): Hiển thị công thức rút gọn, đóng khung SurroundingRectangle(color=GREEN) kèm hiệu ứng Flash.`;
    case 'stem':
      return `[BỘ FORM MÔ PHỎNG STEM & VẬT LÝ - HÓA HỌC]: 
Diễn hoạt quỹ đạo chuyển động, dao động điều hòa axes.plot(lambda t: np.sin(t)), mô hình liên kết phân tử/hạt electron quay quanh hạt nhân, hoặc sơ đồ mạch điện.`;
    default:
      return `[BỘ FORM BÀI GIẢNG TỔNG HỢP (DUAL-ZONE)]: 
Bố cục 2 vùng chuẩn: Khu vực Diễn hoạt Trực quan (Left/Top) và Khu vực Công thức LaTeX Giải Chi tiết (Right/Bottom).`;
  }
};

// =========================================================================
// LƯỢT 1: PROMPT XÂY DỰNG KỊCH BẢN PHÂN CẢNH & LỜI THOẠI (STORYBOARD PROMPT)
// =========================================================================
export const generateManimStoryboardPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const targetDurationStr = config.duration || '3 - 5 phút';
  const simDesc = getSimulationModeDescription(config.simulationMode);

  let pdfTextChunk = "";
  if (config.attachedPdf?.text) {
    pdfTextChunk = `\n[TÀI LIỆU PDF ĐÍNH KÈM]:\n"""\n${config.attachedPdf.text.slice(0, 4000)}\n"""\n`;
  }

  return `Đóng vai Chuyên gia Sư phạm & Đạo diễn Diễn hoạt Khoa học Manim CE.
Nhiệm vụ của bạn là xây dựng KỊCH BẢN SƯ PHẠM VÀ LỜI THOẠI THUYẾT MINH TRÔI CHẢY, PHONG PHÚ cho video bài giảng về: "${config.topic}" (Môn: ${config.subject}, Khán giả: ${config.audience || 'Học sinh / Người học'}).
Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}.
THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr}.
${simDesc}
${pdfTextChunk}

YÊU CẦU LẬP DÀN Ý PHÂN CẢNH VÀ SOẠN LỜI THOẠI TRÔI CHẢY, TRUYỀN CẢM, CÓ NGẮT NGHỈ MẠCH LẠC PHÙ HỢP VỚI THỜI LƯỢNG MỤC TIÊU ${targetDurationStr} (LƯỢT NÀY CHƯA CẦN VIẾT CODE MANIM):

1. PHÂN CẢNH 1 - MỞ ĐẦU (INTRO):
   - Tên bài học và ký hiệu toán học / khoa học cốt lõi (sẽ thu nhỏ làm watermark góc trên trái UL).
   - Lời thoại Intro: Chào mừng, gợi mở vấn đề và dẫn dắt gây sự chú ý.

2. PHÂN CẢNH 2 - LÝ THUYẾT TRỌNG TÂM & MÔ HÌNH THỊ GIÁC BAN ĐẦU:
   - Định nghĩa / Định lý / Công thức nền tảng (dùng ký hiệu LaTeX chuẩn).
   - Áp dụng đúng cấu trúc của ${simDesc}.
   - Lời thoại Lý thuyết: Diễn giải chi tiết bản chất trực quan với câu từ phong phú.

3. PHÂN CẢNH 3 & CÁC PHÂN CẢNH TIẾP THEO - MÔ PHỎNG CHI TIẾT & BIẾN ĐỔI CÔNG THỨC LATEX:
   - Thể hiện mô phỏng thị giác sinh động theo form đã chọn.
   - Các bước suy luận và biến đổi công thức LaTeX hoàn hảo (môi trường aligned căn lề theo dấu bằng, phân số \\frac, căn thức \\sqrt, và đóng khung kết quả).
   - Lời thoại Ví dụ: Thuyết minh theo từng bước trực quan và công thức, giải thích lý do tại sao biến đổi như vậy.

4. PHÂN CẢNH KẾT LUẬN (OUTRO):
   - Thông điệp đúc kết + Biểu tượng phát sáng + Thương hiệu "Học toán cùng Yuta".
   - Lời thoại Outro: Tổng kết quy tắc cốt lõi và câu chào thương hiệu.

ĐỊNH DẠNG TRẢ VỀ:
- Tóm tắt dàn ý các phân cảnh trên.
- Khối biến kịch bản hoàn chỉnh (viết trôi chảy, đầy đủ câu từ, chèn dấu ba chấm "..." ở các ý để tạo khoảng ngắt nghỉ nhịp nhàng cho giọng đọc AI, độ dài phù hợp với thời lượng mục tiêu ${targetDurationStr}):
VOICEOVER_SCRIPT = """
[Toàn bộ lời thoại thuyết minh mượt mà, phong phú của các phân cảnh trên]
"""
(Lưu ý: LƯỢT NÀY CHƯA VIẾT CODE PYTHON, chỉ hoàn thiện kịch bản sư phạm và lời thoại!)`;
};

// =========================================================================
// LƯỢT 2: PROMPT CHUYỂN THỂ THÀNH MÃ PYTHON MANIM (CODE GENERATION PROMPT)
// =========================================================================
export const generateManimCodePrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-pqh' : config.renderQuality === '4k' ? '-pqk' : '-pql';
  const targetDurationStr = config.duration || '3 - 5 phút';
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);

  return `Tuyệt vời! Dựa trên kịch bản sư phạm và khối lời thoại VOICEOVER_SCRIPT vừa thống nhất ở trên, hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.

YÊU CẦU KỸ THUẬT BẮT BUỘC (TUÂN THỦ 15 NGUYÊN TẮC VÀNG VISUAL ENGINEERING):
1. Kế thừa chính xác biến VOICEOVER_SCRIPT và các phân cảnh đã duyệt (Intro, Lý thuyết, Mô phỏng & Biến đổi LaTeX, Outro). BẮT BUỘC khớp đúng thời lượng mục tiêu: ${targetDurationStr}.
2. Cấu hình ${isVertical ? 'Khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)' : 'Khung hình NGANG 16:9 (1920x1080, config.frame_width=14.22, config.frame_height=8.0)'}.
3. YÊU CẦU FONT CHỮ & QUY CHUẨN SPACING BỐ CỤC:
   - Sử dụng font="${chosenFont}" cho mọi đối tượng Text.
   - Set line_spacing=1.2 cho các đoạn Text nhiều dòng để chữ dãn khoảng cách hoàn hảo.
   - Gom nhóm các dòng chữ bằng VGroup(...).arrange(DOWN, buff=0.35) hoặc arrange(RIGHT, buff=0.25) để khoảng cách giữa các chữ luôn đều và đẹp.
4. ÁP DỤNG ĐÚNG BỘ FORM MÔ PHỎNG CHUYÊN MÔN:
   ${simDesc}
5. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
   - MỌI công thức, phương trình, biến số bắt buộc dùng MathTex(r"...") với raw string r"...".
   - Phân số \\frac{a}{b}, căn thức \\sqrt{x}, tích phân \\int, đạo hàm \\frac{df}{dx}, vector \\vec{u}.
   - Biến đổi toán học nhiều dòng dùng môi trường aligned: MathTex(r"\\begin{aligned} ... &= ... \\\\ &= ... \\end{aligned}").
   - Đóng khung nổi bật đáp số / kết quả cuối cùng: SurroundingRectangle(result, color=GREEN, buff=0.15, corner_radius=0.1).
   - Tuyệt đối KHÔNG viết tiếng Việt có dấu trực tiếp trong MathTex để tránh lỗi LaTeX Unicode; tiếng Việt dùng Text("...", font="${chosenFont}").
6. BỐ CỤC ZERO-OVERLAP & QUAN HỆ HÌNH HỌC:
   - BẮT BUỘC dùng quan hệ hình học: VGroup + arrange() + next_to() thay cho các tọa độ ước lượng move_to(UP*2).
   - Kiểm soát kích thước: Dùng fit_width(obj, max_width) hoặc scale_to_fit_width(...) để không bao giờ tràn khung.
   - Nhãn chữ gần đồ thị: Dùng add_backdrop(label) hoặc label.add_background_rectangle(color="#0F172A", opacity=0.9, buff=0.1).
7. NHỊP ĐIỆU THỊ GIÁC & CHUYỂN CẢNH MƯỢT MÀ:
   - Dùng TransformMatchingTex khi biến đổi công thức đại số.
   - Dùng LaggedStart khi xuất hiện danh sách hoặc các phần tử nối tiếp.
   - Có khoảng dừng self.wait(2.0 đến 4.0s) sau các công thức trọng tâm để người xem kịp quan sát và đảm bảo thời lượng ${targetDurationStr}.
8. Màu nền "#0F172A".
9. Cảnh Outro: Hiệu ứng hào quang, giữ nguyên màn hình (self.wait(3.0)), TUYỆT ĐỐI KHÔNG DÙNG FadeOut(*self.mobjects) làm đen màn hình.
10. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết bất kỳ lời chào hay giải thích ngoài mã.
Lệnh render cuối file: \`manim ${qualityFlag} scene.py MainScene\`.`;
};

// =========================================================================
// PROMPT TỔNG HỢP TINH GỌN (CHO CẢ 1-CLICK TỰ ĐỘNG & SAO CHÉP THỦ CÔNG)
// =========================================================================
export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-pqh' : config.renderQuality === '4k' ? '-pqk' : '-pql';
  const targetDurationStr = config.duration || '3 - 5 phút';
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);

  let pdfPromptChunk = "";
  if (config.attachedPdf?.text) {
    pdfPromptChunk = `
[TÀI LIỆU PDF ĐÍNH KÈM]:
Tên file: ${config.attachedPdf.fileName}
Nội dung trích xuất:
"""
${config.attachedPdf.text.slice(0, 4000)}
"""
`;
  }

  let episodeChunk = "";
  if (config.isSeries) {
    const sCount = config.seriesCount || 3;
    const epIdx = config.currentEpisodeIndex !== undefined ? config.currentEpisodeIndex + 1 : 1;
    episodeChunk = `
[CHUỖI PLAYLIST - TẬP ${epIdx}/${sCount}]:
- Sản xuất TẬP ${epIdx}/${sCount} cho chuyên đề "${config.topic}".
- Góc trên phải màn hình hiển thị: Text("Tập ${epIdx}/${sCount}", font_size=18, color=GRAY_B, font="${chosenFont}")
`;
  }

  return `Đóng vai Chuyên gia Lập trình Diễn hoạt Khoa học, Toán học & Giáo dục chuyên nghiệp với Manim CE (Python).
Nhiệm vụ của bạn là viết một file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh, chuẩn sư phạm, trực quan và chạy được 100% không lỗi để minh họa chủ đề "${config.topic}" thuộc môn học "${config.subject}".

I. THÔNG TIN VIDEO & CẤU HÌNH HÌNH THỨC:
- Môn học: ${config.subject}
- Chủ đề: ${config.topic}
- THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr}
- Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / YouTube Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}
- Font chữ chỉ định: "${chosenFont}" (Có ngắt dòng line_spacing=1.2 & spacing chuẩn giữa các chữ)
- Mẫu Diễn hoạt: ${simDesc}
- Khán giả: ${config.audience || 'Học sinh / Người học'}
- Yêu cầu chi tiết: ${config.details || "Trực quan, từng bước dẫn dắt từ trực giác đến công thức"}
${episodeChunk}
${pdfPromptChunk}

II. BỘ KỸ NĂNG BẮT BUỘC TUÂN THỦ:
${MANIM_SKILLS_GUIDE}

III. BỘ KHUNG CODE PYTHON MẪU KIẾN TRÚC SƯ PHẠM (MÔ PHỎNG & LATEX DUAL-ZONE):
\`\`\`python
from manim import *

# 0. KỊCH BẢN THUYẾT MINH ĐỒNG BỘ (~3 từ / 1 giây, tổng 140-160 từ)
VOICEOVER_SCRIPT = """
Chào mừng các bạn đến với bài học hôm nay về ${config.topic}! Hãy cùng theo dõi những kiến thức cốt lõi và các phương pháp giải trực quan, dễ hiểu nhất ngay sau đây.
Về phần lý thuyết trọng tâm, các bạn hãy quan sát các định nghĩa, tính chất và phân loại cơ bản được hiển thị rõ ràng trên màn hình.
Ở bài toán này, mẹo quan trọng nhất là nhận diện cấu trúc quy luật trước khi áp dụng phép biến đổi để tìm ra đáp số chính xác.
Nhớ vững quy tắc vừa học, chuyên đề này sẽ trở nên vô cùng đơn giản! Hãy bấm theo dõi Học toán cùng Yuta để không bỏ lỡ các bài giảng thú vị tiếp theo nhé!
"""

# 1. HỖ TRỢ TIẾNG VIỆT LATEX
try:
    config.tex_template.add_to_preamble(r"""
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb}
\\usepackage{mathpazo}
""")
except Exception:
    pass

# 2. CẤU HÌNH KHUNG HÌNH ${isVertical ? 'DỌC 9:16' : 'NGANG 16:9'}
${isVertical ? `config.pixel_width = 1080\nconfig.pixel_height = 1920\nconfig.frame_width = 9.0\nconfig.frame_height = 16.0` : `config.pixel_width = 1920\nconfig.pixel_height = 1080\nconfig.frame_width = 14.22\nconfig.frame_height = 8.0`}

class MainScene(${config.mathType === '3d_geometry' ? 'ThreeDScene' : 'Scene'}):
    def construct(self):
        self.camera.background_color = "#0F172A"

        # [CẤU HÌNH BÀI HỌC]
        BUOI_HOC = "${config.subject} - ${config.audience || 'Bài Giảng Trọng Tâm'}"
        TEN_BAI = "${config.topic.toUpperCase()}"
        KY_HIEU = r"\\mathbb{R}"  # Ký hiệu cốt lõi của bài học
        MAIN_FONT = "${chosenFont}"

        # 1. MỞ ĐẦU (INTRO, ~6.5s)
        session_text = Text(BUOI_HOC, font_size=${isVertical ? '24' : '32'}, color=LIGHT_GRAY, font=MAIN_FONT)
        title = Text(TEN_BAI, font_size=${isVertical ? '28' : '40'}, weight=BOLD, color=YELLOW, line_spacing=1.2, font=MAIN_FONT)
        symbol_main = MathTex(KY_HIEU, font_size=${isVertical ? '80' : '120'}, color=BLUE)

        title_box = SurroundingRectangle(title, buff=0.35, color=BLUE_D, corner_radius=0.2)
        title_group = VGroup(title, title_box)
        intro_group = VGroup(session_text, title_group, symbol_main).arrange(DOWN, buff=0.5)

        self.play(FadeIn(session_text, shift=DOWN))
        self.play(Write(title), Create(title_box), run_time=1.5)
        self.play(FadeIn(symbol_main, scale=0.3), run_time=1)
        self.wait(1.5)

        # Chuyển cảnh: symbol_main thu nhỏ bay lên góc trên trái UL làm watermark
        self.play(FadeOut(session_text, shift=UP), FadeOut(title_group, scale=0.8), symbol_main.animate.scale(0.3).to_corner(UL))
        self.wait(0.5)

        # 2. LÝ THUYẾT / KHÁI NIỆM TRỌNG TÂM (~8.5s)
        th_title = Text("Lý thuyết: Khái niệm Cốt lõi", font_size=${isVertical ? '24' : '32'}, color=BLUE_B, font=MAIN_FONT, weight=BOLD).to_edge(UP, buff=0.4)
        th_sub = Text("Định hướng & Bản chất kiến thức", font_size=${isVertical ? '18' : '24'}, color=GRAY_B, font=MAIN_FONT).next_to(th_title, DOWN, buff=0.2)
        self.play(FadeIn(th_title), FadeIn(th_sub))

        t_th_1 = Text("Định nghĩa:", font_size=${isVertical ? '20' : '26'}, font=MAIN_FONT)
        m_th_1 = MathTex(r"f(x) = ax^2 + bx + c \quad (a \neq 0)", font_size=${isVertical ? '24' : '34'}, color=YELLOW)
        g_th_1 = VGroup(t_th_1, m_th_1).arrange(RIGHT, buff=0.4)

        t_th_2 = Text("Tính chất:", font_size=${isVertical ? '20' : '26'}, font=MAIN_FONT)
        m_th_2 = MathTex(r"\Delta = b^2 - 4ac", font_size=${isVertical ? '24' : '34'}, color=GREEN)
        g_th_2 = VGroup(t_th_2, m_th_2).arrange(RIGHT, buff=0.4)

        th_group = VGroup(g_th_1, g_th_2).arrange(DOWN, buff=0.6).move_to(ORIGIN)
        fit_width(th_group, ${isVertical ? '7.5' : '11.0'})
        self.play(LaggedStart(FadeIn(g_th_1, shift=UP), FadeIn(g_th_2, shift=UP), lag_ratio=0.3))
        self.wait(2.0)
        self.play(FadeOut(th_group), FadeOut(th_title), FadeOut(th_sub))

        # 3. MÔ PHỎNG THỊ GIÁC & BIẾN ĐỔI LATEX (THEO MẪU ${config.simulationMode || 'general'})
        scene_title = Text("Mô phỏng Trực quan & Lời giải Chi tiết", font_size=${isVertical ? '24' : '30'}, color=BLUE_B, font=MAIN_FONT, weight=BOLD).to_edge(UP, buff=0.4)
        self.play(FadeIn(scene_title))

        # KHU VỰC 1: MÔ PHỎNG TOÁN HỌC TRỰC QUAN (Hệ trục / Đồ thị / Điểm chuyển động)
        axes = Axes(
            x_range=[-1, 5, 1],
            y_range=[-2, 6, 2],
            x_length=${isVertical ? '5.2' : '6.0'},
            y_length=${isVertical ? '3.6' : '4.2'},
            axis_config={"include_tip": True, "color": GRAY_C}
        )${isVertical ? '.scale(0.8).move_to(UP * 2.7)' : '.to_edge(LEFT, buff=0.8).shift(DOWN * 0.3)'}
        axes_labels = axes.get_axis_labels(x_label="x", y_label="y")

        # Đồ thị hàm số
        graph = axes.plot(lambda x: 0.5 * (x - 2)**2 - 1, x_range=[0, 4.5], color=BLUE_C)
        graph_label = axes.get_graph_label(graph, label=MathTex(r"f(x)"), x_val=4.2, direction=UR)
        add_backdrop(graph_label)

        # Điểm chuyển động theo tham số
        t_param = ValueTracker(0.5)
        dot = always_redraw(lambda: Dot(axes.c2p(t_param.get_value(), 0.5 * (t_param.get_value() - 2)**2 - 1), color=YELLOW, radius=0.08))

        sim_group = VGroup(axes, axes_labels, graph, graph_label, dot)
        self.play(Create(axes), Write(axes_labels), run_time=1.2)
        self.play(Create(graph), FadeIn(graph_label), FadeIn(dot), run_time=1.2)
        self.play(t_param.animate.set_value(3.5), run_time=2, rate_func=smooth)

        # KHU VỰC 2: BIẾN ĐỔI CÔNG THỨC LATEX CHUẨN MỰC (aligned, phân số, căn thức)
        step_title = Text("Lời giải chi tiết:", font_size=${isVertical ? '20' : '24'}, color=YELLOW, font=MAIN_FONT)
        formula_aligned = MathTex(
            r"\begin{aligned}"
            r"f'(x) &= x - 2 \\"
            r"f'(x) = 0 &\Leftrightarrow x = 2 \\"
            r"f(2) &= -1 \quad (\text{Giá trị cực tiểu})"
            r"\end{aligned}",
            font_size=${isVertical ? '24' : '30'}, color=WHITE
        )
        box_result = SurroundingRectangle(formula_aligned, color=GREEN, buff=0.15, corner_radius=0.1)
        formula_panel = VGroup(step_title, formula_aligned).arrange(DOWN, aligned_edge=LEFT, buff=0.35)${isVertical ? '.move_to(DOWN * 3.0)' : '.to_edge(RIGHT, buff=0.8).shift(DOWN * 0.3)'}
        fit_width(formula_panel, ${isVertical ? '7.5' : '5.5'})

        self.play(FadeIn(step_title, shift=${isVertical ? 'UP' : 'LEFT'}))
        self.play(Write(formula_aligned), run_time=2.5)
        self.play(Create(box_result), Flash(dot, color=YELLOW))
        self.wait(2.5)

        self.play(FadeOut(sim_group), FadeOut(formula_panel), FadeOut(box_result), FadeOut(scene_title), FadeOut(symbol_main))

        # 4. KẾT LUẬN (OUTRO, ~8s)
        outro_msg = Text("Nhớ vững quy tắc - Học cực dễ!", font_size=${isVertical ? '24' : '32'}, color=WHITE, font=MAIN_FONT)
        outro_symbol = MathTex(KY_HIEU, font_size=${isVertical ? '80' : '120'}, color=BLUE)

        glow_circle = Circle(radius=${isVertical ? '1.2' : '1.5'}, color=BLUE_C, fill_opacity=0.2).set_stroke(width=0)
        q_group = VGroup(glow_circle, outro_symbol)
        channel_brand = Text("Học toán cùng Yuta", font_size=${isVertical ? '30' : '40'}, weight=BOLD, color=RED, font=MAIN_FONT)

        outro_group = VGroup(outro_msg, q_group, channel_brand).arrange(DOWN, buff=0.6)
        self.play(Write(outro_msg))
        self.wait(0.5)
        self.play(GrowFromCenter(glow_circle), Write(outro_symbol))
        self.play(glow_circle.animate.set_opacity(0.4).scale(1.2), rate_func=there_and_back, run_time=1.5)
        self.wait(0.5)
        self.play(FadeIn(channel_brand, shift=UP))
        self.wait(2.5)
        # Kết thúc video giữ nguyên thẻ Outro thương hiệu, KHÔNG FadeOut làm đen màn hình!
\`\`\`

IV. HƯỚNG DẪN RENDER VÀ QUY TẮC BẮT BUỘC:
1. CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN PYTHON TRONG \`\`\`python ... \`\`\`.
2. TUYỆT ĐỐI KHÔNG viết lời chào, lời dẫn hay giải thích ngoài mã để không làm tràn token hệ thống.
3. TUYỆT ĐỐI KHÔNG FadeOut toàn bộ màn hình ở cuối video. Giữ nguyên thẻ Outro "Học toán cùng Yuta".
4. TUÂN THỦ NGUYÊN TẮC CHỐNG ĐÈ CHỮ (ZERO OVERLAP): Bố cục khoảng cách giữa các chữ chuẩn xác, dãn hàng line_spacing=1.2; nhãn chữ gần hình vẽ dùng add_background_rectangle.
5. Đóng đầy đủ ngoặc và lệnh construct(self). Lệnh render cuối: \`manim ${qualityFlag} scene.py MainScene\`.`;
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
\`\`\``;
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

// =========================================================================
// PROMPT CHỈNH SỬA & SỬA LỖI VIDEO (MANIM CODE REFINEMENT PROMPT)
// =========================================================================
export const generateManimRevisionPrompt = (
  config: VideoConfig | null | undefined,
  existingCode: string,
  userFeedback: string
): string => {
  const subjectStr = config?.subject ? `Môn học: "${config.subject}"` : 'Môn học: Toán học / Khoa học';
  const topicStr = config?.topic ? `Chủ đề: "${config.topic}"` : '';
  const isVertical = config?.format === 'vertical';
  const qualityFlag = config?.renderQuality === '1080p' ? '-pqh' : config?.renderQuality === '4k' ? '-pqk' : '-pql';

  return `Đóng vai Chuyên gia Diễn hoạt Manim CE & Lập trình Python Sư phạm.
Nhiệm vụ của bạn là đọc mã nguồn Python Manim (\`scene.py\`) đã được tạo trước đó cùng danh sách CÁC LỖI VÀ YÊU CẦU ĐIỀU CHỈNH từ người dùng, sau đó VIẾT LẠI MÃ PYTHON HOÀN CHỈNH TỪ ĐẦU để sửa triệt để các lỗi và render lại video.

I. THÔNG TIN BÀI HỌC:
- ${subjectStr}
- ${topicStr}
- Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / Shorts)' : 'NGANG 16:9 (YouTube)'}

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
2. Viết lại TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) từ đầu, khắc phục 100% các vấn đề người dùng đã nêu.
3. Giữ vững quy chuẩn CHỐNG ĐÈ CHỮ (ZERO OVERLAP), dãn dòng \`line_spacing=1.2\`, căn chỉnh khoảng cách chữ chuẩn xác.
4. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết lời chào hay giải thích ngoài mã.
Lệnh render cuối file: \`manim ${qualityFlag} scene.py MainScene\`.`;
};