import { VideoConfig } from "../../types";

export const MANIM_SKILLS_GUIDE = `
★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★★★
(Kế thừa Quy chuẩn Typography Serif, Hệ Thống Khung Thẻ Container Dual-Zone & Chống Đè Chữ Tuyệt Đối)

1. NGUYÊN TẮC BỐ CỤC KHUNG THẺ CONTAINER (DUAL-ZONE CONTAINER CARDS):
   - TUYỆT ĐỐI KHÔNG để các đối tượng toán học trôi nổi cô độc trên nền đen kịt gây cảm giác trống trải, thiếu chuyên nghiệp.
   - VIDEO DỌC 9:16 (TikTok / YouTube Shorts / Reels - 1080x1920):
     * Màn hình có chiều cao 16.0 đơn vị, rộng 9.0 đơn vị. BẮT BUỘC chia thành 3 khu vực cân đối, lấp đầy 93% khung hình:
       1. Top Header Bar (y ~ 7.05, height=1.3, width=8.5): Chứa Badge môn học (pill nhỏ) và Tiêu đề bài giảng. Đặt cố định ở to_edge(UP, buff=0.35).
       2. Top Card - Visual Simulation Container (y ~ 3.15, height=6.4, width=8.5): Khung thẻ nền tối (#0F172A), viền (#334155). Dành riêng cho Mô phỏng Đồ thị, Hệ trục Axes (x_length=7.2, y_length=4.4), Hình học, hoặc Điểm động.
       3. Bottom Card - Mathematical Analysis Container (y ~ -3.75, height=6.6, width=8.5): Khung thẻ nền (#1E293B), viền (#334155). Dành riêng cho Lời giải chi tiết từng bước, Bảng biến thiên, và Hộp kết quả SurroundingRectangle.
     * Bố cục 3 khu vực này lấp đầy trọn vẹn khung hình 16.0 đơn vị (tổng chiều cao 14.8 đơn vị), TUYỆT ĐỐI KHÔNG để khoảng trống đen ở giữa màn hình!
   - VIDEO NGANG 16:9 (YouTube / Màn hình ngang - 1920x1080):
     * Cột Trái (Visual Simulation Card - Chiếm 55%): width=7.2, height=6.2, .to_edge(LEFT, buff=0.6).
     * Cột Phải (LaTeX Analysis Card - Chiếm 45%): width=5.8, height=6.2, .to_edge(RIGHT, buff=0.6).
     * Header Bar hoặc Tiêu đề đặt gọn ở đỉnh màn hình (.to_edge(UP, buff=0.35)).

2. NGUYÊN TẮC ZERO-OVERLAP & CHỐNG ĐÈ CHỮ TUYỆT ĐỐI:
   - TUYỆT ĐỐI KHÔNG di chuyển biểu tượng Intro co nhỏ rồi to_corner(UL) làm watermark trôi nổi! Trong khung hình dọc 9:16 hẹp, biểu tượng ở UL sẽ va chạm trực tiếp vào chữ cái đầu tiên của tiêu đề ở phân cảnh sau! Ký hiệu Intro phải FadeOut cùng phân cảnh mở đầu.
   - Mọi tiêu đề phân cảnh BẮT BUỘC nằm bên dưới Header Bar: next_to(header_card, DOWN, buff=...) hoặc nằm gọn bên trong tiêu đề Thẻ Container.
   - BẮT BUỘC dùng quan hệ hình học: VGroup + arrange(DOWN, buff=...) + next_to() thay cho các tọa độ ước lượng magic coordinates.

3. QUY CHUẨN TYPOGRAPHY & CỠ CHỮ LỚN RÕ RÀNG (NÓI KHÔNG VỚI CHỮ NHỎ & KHOẢNG TRỐNG):
   - 100% sử dụng Font Có Chân (Serif): BẮT BUỘC "Times New Roman" (hoặc "Liberation Serif", "DejaVu Serif"). Mã nguồn và đếm dùng "JetBrains Mono".
   - KÍCH THƯỚC CHỮ LỚN RÕ RÀNG TRÊN VIDEO DỌC (BẮT BUỘC font_size >= 22 CHO MỌI CHỮ):
     * Tiêu đề Video / Intro / Outro: font_size=30 đến 36 (weight=BOLD, màu YELLOW hoặc GOLD).
     * Tiêu đề Thẻ Card Container: font_size=24 (weight=BOLD, màu TEAL_A hoặc YELLOW).
     * Công thức MathTex chính / Phương trình: font_size=28 đến 34 (rõ nét, nổi bật).
     * Văn bản tiếng Việt diễn giải / Chú thích: font_size=22 đến 26 (weight=MEDIUM/BOLD).
     * Bảng biến thiên / Ma trận: font_size=24 đến 28.
     * Nhãn trục tọa độ Oxy (x, y), Tọa độ điểm cực trị: font_size=22 đến 26.
   - Mọi Text nhiều dòng BẮT BUỘC set line_spacing=1.2 để khoảng cách giữa các hàng chữ thoáng đẹp.

4. MÔ PHỎNG ĐỒ THỊ & HÌNH HỌC CHUYÊN NGHIỆP:
   - Tọa độ nét đứt thanh lịch: Cho các điểm cực trị, giao điểm, điểm di chuyển, dùng axes.get_lines_to_point(pt).set_color(...) gióng đường nét đứt về trục toạ độ thay vì gắn nhãn chữ số đè lên đồ thị!
   - Vị trí nhãn đồ thị: Đặt nhãn tên hàm số MathTex(r"y = f(x)") ở góc thoáng (UR hoặc DR) với khoảng cách an toàn buff=0.25. TUYỆT ĐỐI KHÔNG dùng add_backdrop tạo hộp chữ nhật đen thô kệch cắt ngang đường cong và trục toạ độ!
   - Kiểm soát biên độ: Chọn x_range và hệ số hàm số sao cho đồ thị nằm trọn vẹn trong vùng y_range của Axes, không phóng vọt ra ngoài mép thẻ.

5. BẢNG BIẾN THIÊN CHUẨN MỰC SGK VIỆT NAM CHO GIẢI TÍCH & HÀM SỐ:
   - Với các bài toán xét tính đơn điệu, cực trị, khảo sát hàm số, BẮT BUỘC có Bảng Biến Thiên bằng LaTeX array:
     MathTex(r"""\\begin{array}{|c|cccccc|}
\\hline
x & -\\infty & & -1 & & 1 & +\\infty \\\\
\\hline
y' & & + & 0 & - & 0 & + \\\\
\\hline
y & & \\nearrow & 2 & \\searrow & -2 & \\nearrow \\\\
\\hline
\\end{array}""", font_size=24)
   - Giúp học sinh nắm bắt trực giác ngay lập tức chiều mũi tên đi lên/đi xuống.

6. CHUẨN MỰC CÔNG THỨC LATEX HOÀN HẢO (100% PERFECT LATEX):
   - MỌI công thức, biến số, phương trình bắt buộc dùng MathTex(r"...") với raw string r"...".
   - Phân số \\frac{a}{b}, căn thức \\sqrt{x}, tích phân \\int_a^b, đạo hàm f'(x), vector \\vec{u}.
   - Đóng khung nổi bật đáp số / kết luận: SurroundingRectangle(conclusion, color=GREEN, buff=0.18, corner_radius=0.12).
   - Phân tách triệt để chữ tiếng Việt và công thức: Tiếng Việt dùng Text("...", font=MAIN_FONT), ghép nối bằng VGroup(Text(...), MathTex(...)).arrange(RIGHT, buff=0.2).

7. THẺ OUTRO THƯƠNG HIỆU SANG TRỌNG:
   - Thiết kế Outro Card toàn màn hình: Thẻ container lớn (width=8.4, height=13.0 cho 9:16) với viền bo góc, biểu tượng phát sáng, 2-3 gạch đầu dòng đúc kết bí quyết bài học và thương hiệu "Học toán cùng Yuta".
   - Kết thúc video bằng self.wait(3.0) giữ nguyên thẻ Outro thương hiệu, TUYỆT ĐỐI KHÔNG DÙNG FadeOut(*self.mobjects) làm đen màn hình!
`;

const getFontDirective = (fontStyle?: string): string => {
  return fontStyle === 'sans' ? 'Be Vietnam Pro' : 'Times New Roman';
};

const getSimulationModeDescription = (mode?: string): string => {
  switch (mode) {
    case 'geometry':
      return `[BỘ FORM MÔ PHỎNG HÌNH HỌC & VECTOR]: 
Xây dựng mô hình 2D/3D với Axes, Triangle/Polygon, Circle, Arrow biểu diễn vector, RightAngle đánh dấu góc vuông, và điểm chuyển động Dot. Dùng đường gióng nét đứt và nhãn đỉnh A, B, C đặt ở hướng an toàn.`;
    case 'dialogue':
      return `[BỘ FORM ĐỐI THOẠI 2 NGƯỜI (THẦY - TRÒ Q&A)]: 
Tạo 2 thẻ đại diện: Thẻ "👨‍🏫 Thầy Yuta" bên Trái/Trên và Thẻ "🙋‍♂️ Học sinh" bên Phải/Dưới. 
Học sinh đưa ra câu hỏi thắc mắc trong khung thẻ -> Thầy Yuta xuất hiện giải đáp trực quan từng bước bằng công thức LaTeX và mô hình minh họa.`;
    case 'calculus':
      return `[BỘ FORM GIẢI TÍCH & KHẢO SÁT HÀM SỐ]: 
Tạo hệ trục Axes, đồ thị axes.plot(...), tiếp tuyến di chuyển trượt trên đường cong với ValueTracker, đường gióng nét đứt đến trục toạ độ cho cực trị, và BẢNG BIẾN THIÊN chuẩn mực SGK Việt Nam (x, y', y).`;
    case 'fast_tricks':
      return `[BỘ FORM MẸO & THỦ THUẬT GIẢI NHANH 30S]: 
Bố cục 2 thẻ so sánh: 
- Thẻ 1 (❌ Cách tự luận dài - 3 phút): Hiển thị phép tính dài, dùng gạch đỏ cảnh báo tốn thời gian.
- Thẻ 2 (⚡ Mẹo thần tốc 30s): Hiển thị công thức rút gọn, đóng khung SurroundingRectangle(color=GREEN) kèm hiệu ứng Flash.`;
    case 'stem':
      return `[BỘ FORM MÔ PHỎNG STEM & VẬT LÝ - HÓA HỌC]: 
Diễn hoạt quỹ đạo chuyển động, dao động điều hòa axes.plot(lambda t: np.sin(t)), mô hình liên kết phân tử/hạt electron quay quanh hạt nhân, hoặc sơ đồ mạch điện.`;
    default:
      return `[BỘ FORM BÀI GIẢNG TỔNG HỢP (DUAL-ZONE)]: 
Bố cục Khung Thẻ Chuẩn: Khu vực Diễn hoạt Trực quan (Top Card/Left Card) và Khu vực Công thức LaTeX Giải Chi tiết (Bottom Card/Right Card).`;
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
    pdfTextChunk = `\n[TÀI LIỆU RAG NGUỒN ĐÍNH KÈM / GHIM]:
Tên file: ${config.attachedPdf.fileName} (${config.attachedPdf.numPages} trang)
"""
${config.attachedPdf.text.slice(0, 15000)}
"""
CHỈ THỊ SƯ PHẠM RAG BẮT BUỘC CHO KỊCH BẢN VIDEO:
1. BẮT BUỘC trích xuất chính xác bài toán, câu hỏi, định nghĩa, định lý, hàm số hoặc đồ thị từ tài liệu trên để xây dựng kịch bản. Nếu tài liệu gồm nhiều bài/câu hỏi, chọn bài toán tiêu biểu nhất (ví dụ Dạng 1 / Câu 1) và giải chi tiết từng bước.
2. Bám sát 100% câu từ, số liệu, giả thiết và kết luận trong tài liệu gốc. TUYỆT ĐỐI KHÔNG tự bịa đề bài khác!
3. Trình bày lời giải sư phạm mạch lạc, đúng và đủ ý chính, phân tích bản chất toán học sâu sắc.
\n`;
  }

  return `Đóng vai Chuyên gia Sư phạm & Đạo diễn Diễn hoạt Khoa học Manim CE.
Nhiệm vụ của bạn là xây dựng KỊCH BẢN SƯ PHẠM VÀ LỜI THOẠI THUYẾT MINH TRÔI CHẢY, PHONG PHÚ cho video bài giảng về: "${config.topic}" (Môn: ${config.subject}, Khán giả: ${config.audience || 'Học sinh / Người học'}).
Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / Shorts / Reels - Bố cục Khung Thẻ Dual-Zone lấp đầy 93% màn hình)' : 'NGANG 16:9 (YouTube / Bài giảng)'}.
THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr}.
${simDesc}
${pdfTextChunk}

YÊU CẦU LẬP DÀN Ý PHÂN CẢNH VÀ SOẠN LỜI THOẠI TRÔI CHẢY, TRUYỀN CẢM, CÓ NGẮT NGHỈ MẠCH LẠC PHÙ HỢP VỚI THỜI LƯỢNG MỤC TIÊU ${targetDurationStr} (LƯỢT NÀY CHƯA CẦN VIẾT CODE MANIM):

1. PHÂN CẢNH 1 - MỞ ĐẦU (INTRO):
   - Khung thẻ Intro với Tên bài học và Ký hiệu toán học cốt lõi (chuyển cảnh dọn sạch giao diện êm đềm, KHÔNG đưa watermark lên góc trên trái UL để tránh đè tiêu đề ở phân cảnh sau).
   - Lời thoại Intro: Chào mừng, gợi mở vấn đề và dẫn dắt gây sự chú ý.

2. PHÂN CẢNH 2 - LÝ THUYẾT TRỌNG TÂM & MÔ HÌNH THỊ GIÁC BAN ĐẦU:
   - Thẻ lý thuyết cốt lõi: Định nghĩa / Định lý / Công thức nền tảng (dùng ký hiệu LaTeX chuẩn).
   - Áp dụng đúng cấu trúc của ${simDesc}.
   - Lời thoại Lý thuyết: Diễn giải chi tiết bản chất trực quan với câu từ phong phú.

3. PHÂN CẢNH 3 & CÁC PHÂN CẢNH TIẾP THEO - DUAL-ZONE MÔ PHỎNG & BIẾN ĐỔI CÔNG THỨC LATEX:
   - ${isVertical ? 'Thẻ Tầng Trên (Top Card - height=6.4, width=8.5): Mô phỏng đồ thị, hình học, tiếp tuyến động, đường gióng nét đứt. Thẻ Tầng Dưới (Bottom Card - height=6.6, width=8.5): Biến đổi đại số từng bước, Bảng biến thiên (nếu là hàm số), đóng khung kết quả.' : 'Cột Trái: Mô phỏng trực quan. Cột Phải: Biến đổi công thức LaTeX chi tiết.'}
   - Lời thoại Ví dụ: Thuyết minh theo từng bước trực quan và công thức, giải thích lý do tại sao biến đổi như vậy.

4. PHÂN CẢNH KẾT LUẬN (OUTRO):
   - Thẻ Outro Tổng Kết: Tóm tắt 2-3 ý ghi nhớ cốt lõi + Thương hiệu "Học toán cùng Yuta".
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
  const qualityFlag = config.renderQuality === '1080p' ? '-qh' : config.renderQuality === '4k' ? '-qk' : '-ql';
  const targetDurationStr = config.duration || '3 - 5 phút';
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);

  return `Tuyệt vời! Dựa trên kịch bản sư phạm và khối lời thoại VOICEOVER_SCRIPT vừa thống nhất ở trên, hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.

YÊU CẦU KỸ THUẬT BẮT BUỘC (TUÂN THỦ BỘ NGUYÊN TẮC VISUAL ENGINEERING & DUAL-ZONE CONTAINER CARDS):
1. Kế thừa chính xác biến VOICEOVER_SCRIPT và các phân cảnh đã duyệt (Intro, Lý thuyết, Dual-Zone Mô phỏng & Biến đổi LaTeX, Outro). BẮT BUỘC khớp đúng thời lượng mục tiêu: ${targetDurationStr}.
2. Cấu hình ${isVertical ? 'Khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)' : 'Khung hình NGANG 16:9 (1920x1080, config.frame_width=14.22, config.frame_height=8.0)'}.
3. BỐ CỤC KHUNG THẺ CONTAINER (DUAL-ZONE) LẤP ĐẦY 93% MÀN HÌNH - TRIỆT TIÊU KHOẢNG TRỐNG ĐEN:
   - ${isVertical ? 'Chia làm 3 khối chính: 1. Top Header Bar (y ~ 7.05, height=1.3, width=8.5) chứa Badge môn học (font_size=20) + Tiêu đề (font_size=30-34, BOLD); 2. Top Card (y ~ 3.15, height=6.4, width=8.5) chứa Mô phỏng đồ thị/hình học (tiêu đề font_size=24, axes x_length=7.2, y_length=4.4, nét vẽ stroke_width=4.5); 3. Bottom Card (y ~ -3.75, height=6.6, width=8.5) chứa Lời giải LaTeX (công thức MathTex font_size=28-34, diễn giải font_size=22-26, bảng biến thiên font_size=24-28). Tổng chiều cao 14.8 đơn vị lấp đầy hoàn hảo khung 16.0 đơn vị, TUYỆT ĐỐI KHÔNG ĐỂ KHOẢNG TRỐNG ĐEN THỪA!' : 'Header ở đỉnh màn hình, Cột Trái (width=7.2, height=6.2) là Mô phỏng Đồ thị/Hình học, Cột Phải (width=5.8, height=6.2) là Biến đổi Công thức LaTeX.'}
4. ZERO-OVERLAP & WATERMARK SAFETY:
   - TUYỆT ĐỐI KHÔNG để biểu tượng Intro co nhỏ rồi to_corner(UL) làm watermark trôi nổi (tránh va chạm đè chữ tiêu đề)! Tiêu đề bài giảng luôn nằm gọn trong Top Header Bar.
5. QUY CHUẨN TYPOGRAPHY CỠ CHỮ LỚN RÕ RÀNG:
   - Sử dụng font="${chosenFont}" (weight=BOLD) cho mọi đối tượng Text.
   - BẮT BUỘC font_size lớn dễ đọc trên điện thoại: Tiêu đề 30-34, Tiêu đề Thẻ 24 (BOLD), Công thức MathTex 28-34, Chú thích tiếng Việt 22-26. TUYỆT ĐỐI KHÔNG dùng font_size nhỏ dưới 22!
   - line_spacing=1.2 cho các đoạn Text nhiều dòng.
6. ĐỒ THỊ & BẢNG BIẾN THIÊN TOÁN HỌC SGK VIỆT NAM:
   - Điểm cực trị / tọa độ đặc biệt: Dùng axes.get_lines_to_point(pt).set_color(...) gióng đường nét đứt về trục toạ độ thay vì dán nhãn đè lên đồ thị.
   - TUYỆT ĐỐI KHÔNG dùng add_backdrop tạo khối chữ nhật đen cắt ngang đường cong.
   - Nếu là bài toán Giải tích / Khảo sát hàm số, BẮT BUỘC có Bảng Biến Thiên bằng LaTeX array: MathTex(r"\\begin{array}{|c|cccccc|} ... \\end{array}", font_size=26).
7. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
   - MỌI công thức, phương trình, biến số bắt buộc dùng MathTex(r"...") với raw string r"...".
   - Đóng khung nổi bật đáp số / kết quả cuối cùng: SurroundingRectangle(result, color=GREEN, buff=0.2, corner_radius=0.12).
   - Tuyệt đối KHÔNG viết tiếng Việt có dấu trực tiếp trong MathTex để tránh lỗi LaTeX Unicode; tiếng Việt dùng Text("...", font="${chosenFont}").
8. Màu nền "#0B1120" hoặc "#0F172A".
9. Cảnh Outro: Thẻ Card tổng kết toàn màn hình (height=13.8, width=8.5) với viền bo góc, biểu tượng phát sáng, các gạch đầu dòng đúc kết bài học (font_size=24-28) và thương hiệu "Học toán cùng Yuta" (font_size=28). Giữ nguyên màn hình (self.wait(3.0)), TUYỆT ĐỐI KHÔNG DÙNG FadeOut(*self.mobjects) làm đen màn hình.
10. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết bất kỳ lời chào hay giải thích ngoài mã.
11. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim ${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};

// =========================================================================
// PROMPT TỔNG HỢP TINH GỌN (CHO CẢ 1-CLICK TỰ ĐỘNG & SAO CHÉP THỦ CÔNG)
// =========================================================================
export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-qh' : config.renderQuality === '4k' ? '-qk' : '-ql';
  const targetDurationStr = config.duration || '3 - 5 phút';
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);

  let pdfPromptChunk = "";
  if (config.attachedPdf?.text) {
    pdfPromptChunk = `
[TÀI LIỆU RAG NGUỒN ĐÍNH KÈM / GHIM]:
Tên file: ${config.attachedPdf.fileName} (${config.attachedPdf.numPages} trang)
Nội dung trích xuất:
"""
${config.attachedPdf.text.slice(0, 15000)}
"""
CHỈ THỊ BẮT BUỘC KHI CÓ TÀI LIỆU RAG ĐÍNH KÈM:
1. TRỰC QUAN HÓA BÀI TOÁN GỐC TỪ TÀI LIỆU: BẮT BUỘC trích xuất chính xác bài toán, câu hỏi, định nghĩa, định lý, hàm số hoặc đồ thị từ tài liệu RAG. Nếu là đề trắc nghiệm hoặc bài tập, hãy chọn bài toán tiêu biểu nhất (ví dụ Câu 1 hoặc Dạng 1) và giải chi tiết từng bước.
2. BÁM SÁT BƯỚC GIẢI & CÂU TỪ: Diễn giải từng bước logic ăn khớp 100% với nội dung tài liệu, câu từ chuẩn xác, đúng và đủ ý chính.
3. DÙNG ĐÚNG KÝ HIỆU & SỐ LIỆU: Giữ nguyên các tham số, tọa độ, ẩn số trong tài liệu, TUYỆT ĐỐI KHÔNG tự ý bịa số liệu khác!
`;
  }

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
- THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr}
- Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / YouTube Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}
- Font chữ chỉ định: "${chosenFont}" (Có ngắt dòng line_spacing=1.2 & spacing chuẩn giữa các chữ)
- Mẫu Diễn hoạt: ${simDesc}
- Khán giả: ${config.audience || 'Học sinh / Người học'}
- Yêu cầu chi tiết: ${config.details || "Trực quan, từng bước dẫn dắt từ trực giác đến công thức, bố cục Khung Thẻ Container Dual-Zone chuẩn đẹp"}
${episodeChunk}
${pdfPromptChunk}

II. BỘ KỸ NĂNG BẮT BUỘC TUÂN THỦ:
${MANIM_SKILLS_GUIDE}

III. BỘ KHUNG CODE PYTHON MẪU KIẾN TRÚC SƯ PHẠM (CONTAINER CARDS DUAL-ZONE ĐÃ TEST CHUẨN ĐẸP 100%):
\`\`\`python
from manim import *

# 0. KỊCH BẢN THUYẾT MINH ĐỒNG BỘ (~3 từ / 1 giây, tổng 140-160 từ)
VOICEOVER_SCRIPT = """
Chào mừng các bạn đến với bài học hôm nay về ${config.topic}! Hãy cùng theo dõi những kiến thức cốt lõi và các phương pháp giải trực quan, dễ hiểu nhất ngay sau đây.
Về phần lý thuyết trọng tâm, các bạn hãy quan sát các định nghĩa, tính chất và phân loại cơ bản được hiển thị rõ ràng trên màn hình.
Ở bài toán này, mẹo quan trọng nhất là nhận diện cấu trúc quy luật trước khi áp dụng phép biến đổi để tìm ra đáp số chính xác.
Nhớ vững quy tắc vừa học, chuyên đề này sẽ trở nên vô cùng đơn giản! Hãy bấm theo dõi Học toán cùng Yuta để không bỏ lỡ các bài giảng thú vị tiếp theo nhé!
"""

# 1. HỖ TRỢ TIẾNG VIỆT & KÝ TỰ TOÁN HỌC LATEX
try:
    config.tex_template.add_to_preamble(r"""
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb}
\\usepackage{mathpazo}
\\usepackage{newunicodechar}
\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{•}{\\ensuremath{\\bullet}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{≠}{\\ensuremath{\\neq}}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}
""")
except Exception:
    pass

# 2. CẤU HÌNH KHUNG HÌNH ${isVertical ? 'DỌC 9:16' : 'NGANG 16:9'}
${isVertical ? `config.pixel_width = 1080\nconfig.pixel_height = 1920\nconfig.frame_width = 9.0\nconfig.frame_height = 16.0` : `config.pixel_width = 1920\nconfig.pixel_height = 1080\nconfig.frame_width = 14.22\nconfig.frame_height = 8.0`}

class MainScene(${config.mathType === '3d_geometry' ? 'ThreeDScene' : 'Scene'}):
    def construct(self):
        self.camera.background_color = "#0B1120"
        MAIN_FONT = "${chosenFont}"

        # ==========================================
        # PHẦN 1: MỞ ĐẦU (INTRO, ~6.5s)
        # ==========================================
        session_text = Text("${config.subject} • ${config.audience || 'Bài Giảng Trọng Tâm'}", font_size=${isVertical ? '24' : '28'}, color=LIGHT_GRAY, font=MAIN_FONT)
        title = Text("${config.topic.toUpperCase()}", font_size=${isVertical ? '32' : '38'}, weight=BOLD, color=YELLOW, line_spacing=1.2, font=MAIN_FONT)
        title_box = SurroundingRectangle(title, buff=0.35, color=BLUE_D, corner_radius=0.2)
        title_group = VGroup(title, title_box)
        symbol_main = MathTex(r"f'(x) \gtrless 0", font_size=${isVertical ? '70' : '90'}, color=BLUE_B)

        intro_group = VGroup(session_text, title_group, symbol_main).arrange(DOWN, buff=0.5).move_to(ORIGIN)
        fit_width(intro_group, ${isVertical ? '8.0' : '12.0'})

        self.play(FadeIn(session_text, shift=DOWN * 0.4), run_time=0.8)
        self.play(Write(title), Create(title_box), run_time=1.5)
        self.play(FadeIn(symbol_main, scale=0.6), run_time=1.0)
        self.wait(1.5)

        # Chuyển cảnh êm đềm: FadeOut toàn bộ Intro (KHÔNG đưa symbol lên góc UL để tránh đè tiêu đề!)
        self.play(FadeOut(intro_group), run_time=0.8)
        self.wait(0.3)

        # ==========================================
        # PHẦN 2: LÝ THUYẾT CỐT LÕI (THEORY, ~9.5s)
        # ==========================================
        th_title = Text("ĐỊNH LÝ: DẤU ĐẠO HÀM & ĐƠN ĐIỆU", font_size=${isVertical ? '26' : '30'}, font=MAIN_FONT, weight=BOLD, color=YELLOW).to_edge(UP, buff=0.7)
        th_sub = Text("Mối liên hệ giữa f'(x) và đồ thị hàm số", font_size=${isVertical ? '22' : '24'}, font=MAIN_FONT, color=GRAY_B).next_to(th_title, DOWN, buff=0.18)
        self.play(FadeIn(th_title), FadeIn(th_sub), run_time=0.8)

        t_inc = Text("1. Đồng biến:", font_size=${isVertical ? '24' : '26'}, font=MAIN_FONT, color=GREEN_B, weight=BOLD)
        m_inc = MathTex(r"f'(x) > 0, \;\forall x \in (a; b)", font_size=${isVertical ? '26' : '28'}, color=WHITE)
        note_inc = Text("(Đồ thị đi lên ↗)", font_size=${isVertical ? '22' : '24'}, font=MAIN_FONT, color=GREEN_B)
        row_inc = VGroup(t_inc, m_inc, note_inc).arrange(RIGHT, buff=0.25)

        t_dec = Text("2. Nghịch biến:", font_size=${isVertical ? '24' : '26'}, font=MAIN_FONT, color=RED_B, weight=BOLD)
        m_dec = MathTex(r"f'(x) < 0, \;\forall x \in (a; b)", font_size=${isVertical ? '26' : '28'}, color=WHITE)
        note_dec = Text("(Đồ thị đi xuống ↘)", font_size=${isVertical ? '22' : '24'}, font=MAIN_FONT, color=RED_B)
        row_dec = VGroup(t_dec, m_dec, note_dec).arrange(RIGHT, buff=0.25)

        rule_card = RoundedRectangle(corner_radius=0.18, width=${isVertical ? '8.5' : '12.0'}, height=${isVertical ? '3.2' : '3.2'}, color=BLUE_E, fill_color="#1E293B", fill_opacity=0.7)
        rules_content = VGroup(row_inc, row_dec).arrange(DOWN, buff=0.45).move_to(rule_card.get_center())
        theory_box = VGroup(rule_card, rules_content).move_to(ORIGIN)
        fit_width(theory_box, ${isVertical ? '8.3' : '11.5'})

        self.play(Create(rule_card), LaggedStart(FadeIn(row_inc, shift=UP * 0.2), FadeIn(row_dec, shift=UP * 0.2), lag_ratio=0.3), run_time=1.6)
        self.wait(2.5)
        self.play(FadeOut(theory_box), FadeOut(th_title), FadeOut(th_sub), run_time=0.8)

        # ==========================================
        # PHẦN 3: DUAL-ZONE CONTAINER CARDS MÔ PHỎNG & LỜI GIẢI (~34s)
        # ==========================================
        # 1. TOP HEADER BAR CỐ ĐỊNH (y ~ 7.05, buff=0.35)
        header_card = RoundedRectangle(corner_radius=0.15, width=${isVertical ? '8.5' : '13.0'}, height=${isVertical ? '1.3' : '1.1'}, color=BLUE_D, fill_color="#1E293B", fill_opacity=0.92)
        header_card.to_edge(UP, buff=${isVertical ? '0.35' : '0.35'})

        badge = RoundedRectangle(corner_radius=0.1, width=2.2, height=0.6, color=TEAL, fill_color=TEAL_E, fill_opacity=0.8)
        badge_txt = Text("${config.subject.toUpperCase()}", font=MAIN_FONT, font_size=18, weight=BOLD, color=WHITE).move_to(badge)
        badge_group = VGroup(badge, badge_txt)

        title_txt = Text("${config.topic.toUpperCase()}", font=MAIN_FONT, font_size=${isVertical ? '28' : '30'}, weight=BOLD, color=YELLOW)
        header_content = VGroup(badge_group, title_txt).arrange(RIGHT, buff=0.25).move_to(header_card)
        self.play(FadeIn(header_card), FadeIn(header_content), run_time=0.8)

        # 2. KHU VỰC 1: TOP SIMULATION CONTAINER CARD (y ~ 3.15, height=6.4, lấp đầy không gian)
        sim_card = RoundedRectangle(corner_radius=0.2, width=${isVertical ? '8.5' : '7.2'}, height=${isVertical ? '6.4' : '6.2'}, color="#334155", fill_color="#0F172A", fill_opacity=0.95)
        ${isVertical ? 'sim_card.next_to(header_card, DOWN, buff=0.25)' : 'sim_card.to_edge(LEFT, buff=0.6).shift(DOWN * 0.4)'}

        sim_title = Text("📈 MÔ PHỎNG ĐỒ THỊ & TIẾP TUYẾN", font=MAIN_FONT, font_size=${isVertical ? '24' : '22'}, weight=BOLD, color=TEAL_A)
        sim_title.next_to(sim_card.get_top(), DOWN, buff=0.22)

        axes = Axes(
            x_range=[-2.5, 2.5, 1],
            y_range=[-3.0, 3.0, 1],
            x_length=${isVertical ? '7.2' : '6.0'},
            y_length=${isVertical ? '4.4' : '4.2'},
            axis_config={"include_tip": True, "color": GRAY_B, "stroke_width": 2.5, "tip_width": 0.18, "tip_height": 0.18}
        ).move_to(sim_card.get_center()).shift(DOWN * 0.22)
        axes_labels = axes.get_axis_labels(x_label=MathTex("x", font_size=24), y_label=MathTex("y", font_size=24))

        f_func = lambda x: x**3 - 3*x
        graph = axes.plot(f_func, x_range=[-2.15, 2.15], color=TEAL_C, stroke_width=4.5)
        graph_label = MathTex(r"y = x^3 - 3x", font_size=26, color=TEAL_B).next_to(axes.c2p(1.2, f_func(1.2)), RIGHT, buff=0.2)

        # Điểm cực trị và đường gióng nét đứt chuẩn mực
        pt_A = axes.c2p(-1, 2)
        pt_B = axes.c2p(1, -2)
        lines_A = axes.get_lines_to_point(pt_A).set_color(YELLOW_B)
        lines_B = axes.get_lines_to_point(pt_B).set_color(YELLOW_B)
        dot_A = Dot(pt_A, color=YELLOW, radius=0.09)
        dot_B = Dot(pt_B, color=YELLOW, radius=0.09)
        lbl_A = MathTex(r"A(-1; 2)", font_size=22, color=YELLOW).next_to(dot_A, UP, buff=0.12)
        lbl_B = MathTex(r"B(1; -2)", font_size=22, color=YELLOW).next_to(dot_B, DOWN, buff=0.12)

        # Điểm chuyển động và tiếp tuyến
        t_param = ValueTracker(-2.0)
        moving_dot = always_redraw(lambda: Dot(axes.c2p(t_param.get_value(), f_func(t_param.get_value())), color=YELLOW, radius=0.1))
        
        def get_tangent():
            t = t_param.get_value()
            y = f_func(t)
            m = 3 * (t**2) - 3
            dx = 0.5
            p1 = axes.c2p(t - dx, y - m * dx)
            p2 = axes.c2p(t + dx, y + m * dx)
            col = GREEN if m > 0.1 else (RED if m < -0.1 else YELLOW)
            return Line(p1, p2, color=col, stroke_width=4.0)
        
        tangent_line = always_redraw(get_tangent)

        sim_elements = VGroup(sim_card, sim_title, axes, axes_labels, graph, graph_label)
        self.play(Create(sim_card), FadeIn(sim_title), run_time=0.8)
        self.play(Create(axes), Write(axes_labels), Create(graph), FadeIn(graph_label), run_time=1.5)
        self.play(FadeIn(lines_A), FadeIn(dot_A), FadeIn(lbl_A), FadeIn(lines_B), FadeIn(dot_B), FadeIn(lbl_B), run_time=1.0)
        self.play(FadeIn(moving_dot), Create(tangent_line), run_time=0.8)

        # 3. KHU VỰC 2: BOTTOM LATEX ANALYSIS CONTAINER CARD (y ~ -3.75, height=6.6)
        step_card = RoundedRectangle(corner_radius=0.2, width=${isVertical ? '8.5' : '5.8'}, height=${isVertical ? '6.6' : '6.2'}, color="#334155", fill_color="#1E293B", fill_opacity=0.95)
        ${isVertical ? 'step_card.next_to(sim_card, DOWN, buff=0.25)' : 'step_card.to_edge(RIGHT, buff=0.6).shift(DOWN * 0.4)'}

        step_title = Text("📝 CÁC BƯỚC XÉT BIẾN THIÊN", font=MAIN_FONT, font_size=${isVertical ? '24' : '22'}, weight=BOLD, color=YELLOW)
        step_title.next_to(step_card.get_top(), DOWN, buff=0.22)

        step1 = MathTex(r"1); y' = 3x^2 - 3 = 3(x^2 - 1)", font_size=${isVertical ? '28' : '28'}, color=WHITE)
        step2 = MathTex(r"2); y' = 0 \iff x = -1 \quad \text{hoặc} \quad x = 1", font_size=${isVertical ? '28' : '28'}, color=WHITE)

        res_inc = VGroup(
            MathTex(r"\bullet \; y' > 0 \iff x \in (-\infty; -1) \cup (1; +\infty)", font_size=${isVertical ? '24' : '24'}, color=WHITE),
            Text("→ Đồng biến ↗", font=MAIN_FONT, font_size=${isVertical ? '22' : '22'}, color=GREEN_B, weight=BOLD)
        ).arrange(RIGHT, buff=0.2)

        res_dec = VGroup(
            MathTex(r"\bullet \; y' < 0 \iff x \in (-1; 1)", font_size=${isVertical ? '24' : '24'}, color=WHITE),
            Text("→ Nghịch biến ↘", font=MAIN_FONT, font_size=${isVertical ? '22' : '22'}, color=RED_B, weight=BOLD)
        ).arrange(RIGHT, buff=0.2)

        res_group = VGroup(res_inc, res_dec).arrange(DOWN, aligned_edge=LEFT, buff=0.25)
        res_box = SurroundingRectangle(res_group, color=GREEN, buff=0.22, corner_radius=0.12, stroke_width=3.5)

        calc_content = VGroup(step1, step2, VGroup(res_group, res_box)).arrange(DOWN, aligned_edge=LEFT, buff=0.35)
        calc_content.move_to(step_card.get_center()).shift(DOWN * 0.2)

        self.play(Create(step_card), FadeIn(step_title), run_time=0.8)
        self.play(Write(step1), run_time=1.2)
        self.play(Write(step2), run_time=1.2)

        # Di chuyển tiếp tuyến trượt theo đồ thị minh họa
        self.play(t_param.animate.set_value(2.0), run_time=3.5, rate_func=smooth)
        self.play(Write(res_group), Create(res_box), run_time=1.5)
        self.wait(3.0)

        # Dọn sạch giao diện chuẩn bị cho Outro
        all_scene = VGroup(header_card, header_content, sim_card, sim_title, axes, axes_labels, graph, graph_label, lines_A, lines_B, dot_A, dot_B, lbl_A, lbl_B, moving_dot, tangent_line, step_card, step_title, calc_content)
        self.play(FadeOut(all_scene), run_time=0.8)

        # ==========================================
        # PHẦN 4: KẾT LUẬN & OUTRO THƯƠNG HIỆU (~8.5s)
        # ==========================================
        outro_card = RoundedRectangle(corner_radius=0.25, width=${isVertical ? '8.5' : '12.5'}, height=${isVertical ? '13.8' : '6.6'}, color=GOLD_E, fill_color="#0F172A", fill_opacity=0.95)
        outro_card.move_to(ORIGIN)

        outro_header = Text("TỔNG KẾT BÀI HỌC", font_size=${isVertical ? '34' : '36'}, weight=BOLD, color=YELLOW, font=MAIN_FONT)
        
        point1 = Text("✓ Dấu f'(x) > 0 : Đồ thị đi lên ↗ (Đồng biến)", font_size=${isVertical ? '24' : '26'}, font=MAIN_FONT, color=GREEN_B)
        point2 = Text("✓ Dấu f'(x) < 0 : Đồ thị đi xuống ↘ (Nghịch biến)", font_size=${isVertical ? '24' : '26'}, font=MAIN_FONT, color=RED_B)
        point3 = Text("✓ Luôn lập Bảng biến thiên để không bỏ sót cực trị", font_size=${isVertical ? '24' : '26'}, font=MAIN_FONT, color=WHITE)
        points_group = VGroup(point1, point2, point3).arrange(DOWN, aligned_edge=LEFT, buff=0.4)

        brand_badge = RoundedRectangle(corner_radius=0.15, width=5.2, height=1.0, color=RED, fill_color=RED_E, fill_opacity=0.85)
        brand_txt = Text("Học toán cùng Yuta", font_size=${isVertical ? '26' : '28'}, weight=BOLD, color=WHITE, font=MAIN_FONT).move_to(brand_badge)
        brand_group = VGroup(brand_badge, brand_txt)

        outro_content = VGroup(outro_header, points_group, brand_group).arrange(DOWN, buff=0.6).move_to(outro_card)
        fit_width(outro_content, ${isVertical ? '8.0' : '11.5'})

        self.play(Create(outro_card), run_time=1.0)
        self.play(FadeIn(outro_header, shift=DOWN * 0.3), run_time=0.8)
        self.play(LaggedStart(FadeIn(point1, shift=LEFT * 0.2), FadeIn(point2, shift=LEFT * 0.2), FadeIn(point3, shift=LEFT * 0.2), lag_ratio=0.3), run_time=1.5)
        self.play(FadeIn(brand_group, scale=0.8), run_time=1.0)
        
        # BẮT BUỘC: Giữ nguyên màn hình Outro thương hiệu, KHÔNG FadeOut làm đen màn hình!
        self.wait(3.0)
\`\`\`

IV. HƯỚNG DẪN RENDER VÀ QUY TẮC BẮT BUỘC:
1. CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN PYTHON TRONG \`\`\`python ... \`\`\`.
2. TUYỆT ĐỐI KHÔNG viết lời chào, lời dẫn hay giải thích ngoài mã để không làm tràn token hệ thống.
3. TUYỆT ĐỐI KHÔNG FadeOut toàn bộ màn hình ở cuối video. Giữ nguyên thẻ Outro "Học toán cùng Yuta".
4. TUÂN THỦ NGUYÊN TẮC CHỐNG ĐÈ CHỮ (ZERO OVERLAP): Bố cục Khung Thẻ Container Dual-Zone chuẩn xác, dãn hàng line_spacing=1.2; dùng đường gióng nét đứt to_point thay cho nhãn đè lên đồ thị.
5. Đóng đầy đủ ngoặc và lệnh construct(self). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim ${qualityFlag} scene.py MainScene\`, AI tuyệt đối không tự chạy lệnh render này).
6. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file, không view_file). CHỈ xuất mã nguồn văn bản trực tiếp.`;
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

export const generateManimRevisionPrompt = (
  config: VideoConfig | null | undefined,
  existingCode: string,
  userFeedback: string
): string => {
  const subjectStr = config?.subject ? `Môn học: "${config.subject}"` : 'Môn học: Toán học / Khoa học';
  const topicStr = config?.topic ? `Chủ đề: "${config.topic}"` : '';
  const isVertical = config?.format === 'vertical';
  const qualityFlag = config?.renderQuality === '1080p' ? '-qh' : config?.renderQuality === '4k' ? '-qk' : '-ql';

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
3. Giữ vững quy chuẩn CHỐNG ĐÈ CHỮ (ZERO OVERLAP), áp dụng Khung Thẻ Container Dual-Zone lấp đầy 93% màn hình (height=6.4 và 6.6), dãn dòng \`line_spacing=1.2\`, căn chỉnh khoảng cách chữ chuẩn xác, BẮT BUỘC font_size lớn rõ nét (Tiêu đề 30-34, Thẻ 24, MathTex 28-34, Text tiếng Việt 22-26, TUYỆT ĐỐI KHÔNG DÙNG FONT_SIZE DƯỚI 22).
4. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết lời chào hay giải thích ngoài mã.
5. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim ${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};
