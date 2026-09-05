import { VideoConfig } from "../../types";

export const MANIM_SKILLS_GUIDE = `
★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★★★
(Kế thừa 15 Nguyên Tắc Vàng & Hệ Thống Kỹ Thuật Chống Đè Chữ - Bố Cục Động)

1. 15 NGUYÊN TẮC VÀNG VỀ BỐ CỤC & VISUAL ENGINEERING:
   - NGUYÊN TẮC 1 (DÙNG QUAN HỆ HÌNH HỌC THAY VÌ TỌA ĐỘ TUYỆT ĐỐI):
     * TUYỆT ĐỐI KHÔNG dùng "magic coordinates" ước lượng như obj1.move_to(UP * 2), obj2.move_to(UP * 1.5).
     * BẮT BUỘC dùng quan hệ hình học: formula.next_to(title, DOWN, buff=0.4), note.next_to(formula, DOWN, buff=0.35).
   - NGUYÊN TẮC 2 (GROUP TRƯỚC KHI LAYOUT & ANIMATE):
     * Gom nhóm các đối tượng vào VGroup rồi mới định vị hoặc animate: VGroup(t1, t2, t3).arrange(DOWN, buff=0.35).
   - NGUYÊN TẮC 3 (arrange() LÀ CÔNG CỤ CHỐNG CHỒNG LẤN QUAN TRỌNG NHẤT):
     * Luôn dùng group.arrange(DOWN, buff=...) hoặc arrange(RIGHT, buff=...) để các phần tử tự động dãn cách đều.
   - NGUYÊN TẮC 4 (next_to() CHO CÁC ĐỐI TƯỢNG CÓ QUAN HỆ):
     * Khi một đối tượng phụ thuộc vào đối tượng khác (chú thích, nhãn đồ thị, kết luận), dùng next_to() kèm hướng (DOWN/RIGHT/UP/LEFT) và buff an toàn.
   - NGUYÊN TẮC 5 (LUÔN KIỂM SOÁT WIDTH/HEIGHT CỦA TEXT VÀ FORMULA):
     * Dùng helper fit_width(obj, max_width) hoặc scale_to_fit_width(max_w) để không bao giờ bị tràn biên frame.
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
   - NGUYÊN TẮC 12 (CẤU TRÚC 3 VÙNG LAYOUT CONTAINER):
     * Scene phân chia 3 vùng: HEADER (tiêu đề mép trên to_edge(UP, buff=0.4)), MAIN (nội dung chính dual-zone ở giữa), FOOTER / OUTRO (kết luận mép dưới).
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
     * Tiếng Việt / Chú thích / Nhãn: DÙNG Text("...", font="Be Vietnam Pro").
     * Ký hiệu toán học: DÙNG MathTex(r"...").
     * Ghép nối dòng chữ và công thức: Dùng VGroup(Text("Bước 1:", font="Be Vietnam Pro"), MathTex(r"f(x) = x^2 - 4")).arrange(RIGHT, buff=0.25).
     * TUYỆT ĐỐI KHÔNG gõ chữ tiếng Việt có dấu trực tiếp vào MathTex mà không bọc \\text{} vì sẽ gây lỗi biên dịch LaTeX!
   - ĐÓNG KHUNG NỔI BẬT ĐÁP SỐ / KẾT QUẢ:
     result_box = SurroundingRectangle(result_formula, color=GREEN, buff=0.15, corner_radius=0.1)
     self.play(Create(result_box), Flash(result_formula, color=YELLOW))

3. MÔ PHỎNG THỊ GIÁC TOÁN HỌC TRỰC QUAN (DYNAMIC MATHEMATICAL SIMULATION):
   Mỗi video bài giảng toán học BẮT BUỘC phải có mô phỏng thị giác sinh động ở khu vực Visual Zone:
   - GIẢI TÍCH / HÀM SỐ:
     * Khởi tạo hệ trục Axes(x_range=[...], y_range=[...], x_length=..., y_length=..., axis_config={"include_tip": True, "color": GRAY_C}).
     * Đồ thị hàm số: graph = axes.plot(lambda x: ..., color=BLUE_C, x_range=[...]). Vẽ bằng Create(graph, run_time=1.5).
     * Điểm chuyển động: dot = Dot(color=YELLOW). Di chuyển điểm bằng MoveAlongPath hoặc ValueTracker.
     * Tiếp tuyến hoặc đường gióng: Đường gióng nét đứt DashedLine từ điểm xuống hai trục tọa độ.
     * Diện tích tích phân: area = axes.get_area(graph, x_range=[a, b], color=BLUE_E, opacity=0.4).
   - HÌNH HỌC / VECTOR:
     * Vẽ hình học rõ ràng: Triangle, Circle, Square, Arc biểu diễn góc.
     * Vector chuyển động: Arrow(start, end, buff=0, color=YELLOW) kèm MathTex nhãn vector.
     * Góc vuông: RightAngle(line1, line2, length=0.3, color=RED).
   - ĐẠI SỐ / PHƯƠNG TRÌNH:
     * Trục số NumberLine hoặc tương giao 2 đồ thị, điểm giao nhau nhấp nháy phát sáng Flash(dot).
   - LƯỢNG GIÁC:
     * Đường tròn đơn vị, vector quay góc \\alpha, hình chiếu sin/cos đổi màu sinh động.

4. BỐ CỤC CHUẨN STUDIO CHỐNG ĐÈ CHỮ (ZERO OVERLAP DUAL-ZONE LAYOUT):
   - VIDEO NGANG 16:9 (1920x1080):
     * CỘT TRÁI (VISUAL SIMULATION ZONE - Chiếm 55% màn hình):
       Hệ trục tọa độ Axes, đồ thị, hình học dời hẳn sang trái: .to_edge(LEFT, buff=0.8).
     * CỘT PHẢI (LATEX FORMULA ZONE - Chiếm 45% màn hình):
       Công thức LaTeX, các bước biến đổi tương đương dời hẳn sang phải: .to_edge(RIGHT, buff=0.8).
     * TIÊU ĐỀ BÀI TOÁN: Nằm ở mép trên to_edge(UP, buff=0.35).
     * TUYỆT ĐỐI KHÔNG đặt hệ trục ở giữa (ORIGIN) rồi viết chữ đè lên đồ thị.
   - VIDEO DỌC 9:16 (1080x1920 - Shorts / Reels / TikTok):
     * TẦNG TRÊN: Mô phỏng đồ thị / hình học động (scale 0.65, shift UP * 2.8).
     * TẦNG DƯỚI: Công thức LaTeX giải chi tiết từng bước (shift DOWN * 2.8).

5. RUNTIME HELPERS SẴN CÓ TRONG HỆ THỐNG:
   Hệ thống Manim Studio đã tích hợp sẵn các helper sau trong scene.py, bạn có thể gọi trực tiếp:
   - fit_width(obj, max_width): Tự động co nhỏ obj nếu vượt quá max_width.
   - fit_height(obj, max_height): Tự động co nhỏ obj nếu vượt quá max_height.
   - fit_group(group, max_w, max_h): Co nhóm đối tượng vừa vặn vùng an toàn.
   - vertical_stack(*objects, buff=0.35): Tạo VGroup và arrange(DOWN).
   - horizontal_stack(*objects, buff=0.4): Tạo VGroup và arrange(RIGHT).
   - add_backdrop(mobj): Tự động thêm nền đen mờ chống đè chữ cho nhãn.

6. ĐỒNG BỘ GIỌNG ĐỌC AI & QUY CHUẨN MÀU SẮC:
   - Tốc độ đọc: ~3 từ / 1 giây (140-160 từ cho video ~50-60s).
   - Màu nền Slate-900: self.camera.background_color = "#0F172A".
   - Bảng màu toán học: Đồ thị chính (BLUE_C), Tiếp tuyến/Điểm nhấn (YELLOW), Kết quả (GREEN_C), Trục tọa độ (GRAY_B).
`;

// =========================================================================
// LƯỢT 1: PROMPT XÂY DỰNG KỊCH BẢN PHÂN CẢNH & LỜI THOẠI (STORYBOARD PROMPT)
// =========================================================================
export const generateManimStoryboardPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';

  let pdfTextChunk = "";
  if (config.attachedPdf?.text) {
    pdfTextChunk = `\n[TÀI LIỆU PDF ĐÍNH KÈM]:\n"""\n${config.attachedPdf.text.slice(0, 4000)}\n"""\n`;
  }

  return `Đóng vai Chuyên gia Sư phạm & Đạo diễn Diễn hoạt Khoa học Manim CE.
Nhiệm vụ của bạn là xây dựng KỊCH BẢN SƯ PHẠM VÀ LỜI THOẠI THUYẾT MINH cho video bài giảng về: "${config.topic}" (Môn: ${config.subject}, Khán giả: ${config.audience || 'Học sinh / Người học'}).
Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}.
${pdfTextChunk}
YÊU CẦU LẬP DÀN Ý 4 PHÂN CẢNH VÀ SOẠN LỜI THOẠI (LƯỢT NÀY CHƯA CẦN VIẾT CODE MANIM):

1. PHÂN CẢNH 1 - MỞ ĐẦU (INTRO, ~6-7s):
   - Tên bài học và ký hiệu toán học / khoa học cốt lõi (sẽ thu nhỏ làm watermark góc trên trái UL).
   - Lời thoại Intro: Chào mừng và giới thiệu chuyên đề (~18-20 từ).

2. PHÂN CẢNH 2 - LÝ THUYẾT TRỌNG TÂM & MÔ HÌNH THỊ GIÁC BAN ĐẦU (~8-10s):
   - Định nghĩa / Định lý / Công thức nền tảng (dùng ký hiệu LaTeX chuẩn).
   - Ý tưởng mô phỏng trực quan sơ khởi (hệ trục, đồ thị hoặc hình học cơ bản).
   - Lời thoại Lý thuyết: Diễn giải bản chất trực quan (~24-28 từ).

3. PHÂN CẢNH 3 - MÔ PHỎNG CHI TIẾT & BIẾN ĐỔI CÔNG THỨC LATEX (BỐ CỤC DUAL-ZONE, ~11-13s):
   - Phía Mô phỏng (Visual Zone): Mô phỏng hình học / đồ thị động (Axes, đồ thị hàm số, điểm chạy Dot trên đường cong, tiếp tuyến hoặc hình học/vector).
   - Phía Công thức (LaTeX Formula Zone): Các bước suy luận và biến đổi công thức LaTeX hoàn hảo (môi trường aligned căn lề theo dấu bằng, phân số \\frac, căn thức \\sqrt, và đóng khung kết quả).
   - Lời thoại Ví dụ: Thuyết minh theo từng bước trực quan và công thức (~32-36 từ).

4. PHÂN CẢNH 4 - KẾT LUẬN (OUTRO, ~7-8s):
   - Thông điệp đúc kết + Biểu tượng phát sáng + Thương hiệu "Học toán cùng Yuta".
   - Lời thoại Outro: Đúc kết quy tắc và câu chào thương hiệu (~22-25 từ).

ĐỊNH DẠNG TRẢ VỀ:
- Tóm tắt dàn ý 4 phân cảnh trên.
- Khối biến kịch bản hoàn chỉnh (chuẩn tỷ lệ ~3 từ/giây):
VOICEOVER_SCRIPT = """
[Toàn bộ lời thoại liên tục của 4 cảnh trên, tổng khoảng 140-160 từ]
"""
(Lưu ý: LƯỢT NÀY CHƯA VIẾT CODE PYTHON, chỉ hoàn thiện kịch bản sư phạm và lời thoại!)`;
};

// =========================================================================
// LƯỢT 2: PROMPT CHUYỂN THỂ THÀNH MÃ PYTHON MANIM (CODE GENERATION PROMPT)
// =========================================================================
export const generateManimCodePrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-pqh' : config.renderQuality === '4k' ? '-pqk' : '-pql';

  return `Tuyệt vời! Dựa trên kịch bản sư phạm và khối lời thoại VOICEOVER_SCRIPT vừa thống nhất ở trên, hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.

YÊU CẦU KỸ THUẬT BẮT BUỘC (TUÂN THỦ 15 NGUYÊN TẮC VÀNG VISUAL ENGINEERING):
1. Kế thừa chính xác biến VOICEOVER_SCRIPT (~140-160 từ) và 4 phân cảnh đã duyệt (1. Intro, 2. Lý thuyết, 3. Mô phỏng & Biến đổi LaTeX, 4. Outro).
2. Cấu hình ${isVertical ? 'Khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)' : 'Khung hình NGANG 16:9 (1920x1080, config.frame_width=14.22, config.frame_height=8.0)'}.
3. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
   - MỌI công thức, phương trình, biến số bắt buộc dùng MathTex(r"...") với raw string r"...".
   - Phân số \\frac{a}{b}, căn thức \\sqrt{x}, tích phân \\int, đạo hàm \\frac{df}{dx}, vector \\vec{u}.
   - Biến đổi toán học nhiều dòng dùng môi trường aligned: MathTex(r"\\begin{aligned} ... &= ... \\\\ &= ... \\end{aligned}").
   - Đóng khung nổi bật đáp số / kết quả cuối cùng: SurroundingRectangle(result, color=GREEN, buff=0.15, corner_radius=0.1).
   - Tuyệt đối KHÔNG viết tiếng Việt có dấu trực tiếp trong MathTex để tránh lỗi LaTeX Unicode; tiếng Việt dùng Text("...", font="Be Vietnam Pro").
4. MÔ PHỎNG TOÁN HỌC TRỰC QUAN SINH ĐỘNG (VISUAL SIMULATION):
   - Phân cảnh giải toán BẮT BUỘC có mô phỏng hình ảnh động: Hệ trục tọa độ Axes, đồ thị axes.plot(...), điểm Dot di chuyển trên đường cong bằng ValueTracker, tiếp tuyến hoặc hình học/vector. Tuyệt đối không chỉ hiển thị các dòng chữ tĩnh!
5. BỐ CỤC ZERO-OVERLAP DUAL-ZONE & QUAN HỆ HÌNH HỌC (KHÔNG DÙNG MAGIC COORDINATES):
   - BẮT BUỘC dùng quan hệ hình học: VGroup + arrange() + next_to() thay cho các tọa độ ước lượng move_to(UP*2).
   - ${isVertical ? 'Xếp 2 tầng: Tầng trên (scale 0.7, shift UP*2.6) dành riêng cho Mô phỏng Đồ thị/Hình học; Tầng dưới (shift DOWN*2.8) dành riêng cho Công thức LaTeX giải chi tiết' : 'Bố cục 2 Cột: Cột Trái 55% là Mô phỏng Đồ thị/Hình học (.to_edge(LEFT, buff=0.8)), Cột Phải 45% là Biến đổi Công thức LaTeX (.to_edge(RIGHT, buff=0.8))'}.
   - Kiểm soát kích thước: Dùng fit_width(obj, max_width) hoặc scale_to_fit_width(...) để không bao giờ tràn khung.
   - Nhãn chữ gần đồ thị: Dùng add_backdrop(label) hoặc label.add_background_rectangle(color="#0F172A", opacity=0.9, buff=0.1).
6. NHỊP ĐIỆU THỊ GIÁC & CHUYỂN CẢNH MƯỢT MÀ:
   - Dùng TransformMatchingTex khi biến đổi công thức đại số.
   - Dùng LaggedStart khi xuất hiện danh sách hoặc các phần tử nối tiếp.
   - Có khoảng dừng self.wait(1.5 đến 2.5s) sau các công thức trọng tâm để người xem kịp quan sát.
7. Màu nền "#0F172A", toàn bộ Text dùng font="Be Vietnam Pro".
8. Cảnh Outro: Hiệu ứng hào quang, giữ nguyên màn hình (self.wait(2.5)), TUYỆT ĐỐI KHÔNG DÙNG FadeOut(*self.mobjects) làm đen màn hình.
9. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết bất kỳ lời chào hay giải thích ngoài mã.
Lệnh render cuối file: \`manim ${qualityFlag} scene.py MainScene\`.`;
};

// =========================================================================
// PROMPT TỔNG HỢP TINH GỌN (CHO CẢ 1-CLICK TỰ ĐỘNG & SAO CHÉP THỦ CÔNG)
// =========================================================================
export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-pqh' : config.renderQuality === '4k' ? '-pqk' : '-pql';

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
- Góc trên phải màn hình hiển thị: Text("Tập ${epIdx}/${sCount}", font_size=18, color=GRAY_B)
`;
  }

  return `Đóng vai Chuyên gia Lập trình Diễn hoạt Khoa học, Toán học & Giáo dục chuyên nghiệp với Manim CE (Python).
Nhiệm vụ của bạn là viết một file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh, chuẩn sư phạm, trực quan và chạy được 100% không lỗi để minh họa chủ đề "${config.topic}" thuộc môn học "${config.subject}".

I. THÔNG TIN VIDEO:
- Môn học: ${config.subject}
- Chủ đề: ${config.topic}
- Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / YouTube Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}
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

        # 1. MỞ ĐẦU (INTRO, ~6.5s)
        session_text = Text(BUOI_HOC, font_size=${isVertical ? '24' : '32'}, color=LIGHT_GRAY, font="Be Vietnam Pro")
        title = Text(TEN_BAI, font_size=${isVertical ? '28' : '40'}, weight=BOLD, color=YELLOW, line_spacing=1.2, font="Be Vietnam Pro")
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
        th_title = Text("Lý thuyết: Khái niệm Cốt lõi", font_size=${isVertical ? '24' : '32'}, color=BLUE_B, font="Be Vietnam Pro", weight=BOLD).to_edge(UP, buff=0.4)
        th_sub = Text("Định hướng & Bản chất kiến thức", font_size=${isVertical ? '18' : '24'}, color=GRAY_B, font="Be Vietnam Pro").next_to(th_title, DOWN, buff=0.2)
        self.play(FadeIn(th_title), FadeIn(th_sub))

        t_th_1 = Text("Định nghĩa:", font_size=${isVertical ? '20' : '26'}, font="Be Vietnam Pro")
        m_th_1 = MathTex(r"f(x) = ax^2 + bx + c \quad (a \neq 0)", font_size=${isVertical ? '24' : '34'}, color=YELLOW)
        g_th_1 = VGroup(t_th_1, m_th_1).arrange(RIGHT, buff=0.4)

        t_th_2 = Text("Tính chất:", font_size=${isVertical ? '20' : '26'}, font="Be Vietnam Pro")
        m_th_2 = MathTex(r"\Delta = b^2 - 4ac", font_size=${isVertical ? '24' : '34'}, color=GREEN)
        g_th_2 = VGroup(t_th_2, m_th_2).arrange(RIGHT, buff=0.4)

        th_group = VGroup(g_th_1, g_th_2).arrange(DOWN, buff=0.6).move_to(ORIGIN)
        fit_width(th_group, ${isVertical ? '7.5' : '11.0'})
        self.play(LaggedStart(FadeIn(g_th_1, shift=UP), FadeIn(g_th_2, shift=UP), lag_ratio=0.3))
        self.wait(2.0)
        self.play(FadeOut(th_group), FadeOut(th_title), FadeOut(th_sub))

        # 3. MÔ PHỎNG THỊ GIÁC & BIẾN ĐỔI LATEX (DUAL-ZONE LAYOUT, ~14s)
        scene_title = Text("Mô phỏng Trực quan & Lời giải Chi tiết", font_size=${isVertical ? '24' : '30'}, color=BLUE_B, font="Be Vietnam Pro", weight=BOLD).to_edge(UP, buff=0.4)
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
        step_title = Text("Lời giải chi tiết:", font_size=${isVertical ? '20' : '24'}, color=YELLOW, font="Be Vietnam Pro")
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
        outro_msg = Text("Nhớ vững quy tắc - Học cực dễ!", font_size=${isVertical ? '24' : '32'}, color=WHITE, font="Be Vietnam Pro")
        outro_symbol = MathTex(KY_HIEU, font_size=${isVertical ? '80' : '120'}, color=BLUE)

        glow_circle = Circle(radius=${isVertical ? '1.2' : '1.5'}, color=BLUE_C, fill_opacity=0.2).set_stroke(width=0)
        q_group = VGroup(glow_circle, outro_symbol)
        channel_brand = Text("Học toán cùng Yuta", font_size=${isVertical ? '30' : '40'}, weight=BOLD, color=RED, font="Be Vietnam Pro")

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
4. TUÂN THỦ NGUYÊN TẮC CHỐNG ĐÈ CHỮ (ZERO OVERLAP): Cột Trái là Đồ thị/Hình học, Cột Phải là Công thức; nhãn chữ gần hình vẽ dùng add_background_rectangle.
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