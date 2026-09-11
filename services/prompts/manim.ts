import { VideoConfig } from "../../types";

const sanitizeAndExtractRag = (attachedPdf?: { fileName: string; numPages: number; text: string }): string => {
  if (!attachedPdf?.text) return "";
  const rawText = attachedPdf.text.replace(/\r/g, "");
  const cleaned = rawText
    .replace(/(?:Trang\s+\d+\/\d+|SĐT:?\s*\d{8,12}|Hotline:?\s*\d{8,12}|Website:?\s*\S+)/gi, "")
    .trim();

  let chunk = "";
  if (cleaned.length <= 15000) {
    chunk = cleaned;
  } else {
    const head = cleaned.slice(0, 4000);
    const tail = cleaned.slice(-11000);
    chunk = `${head}\n\n[... CẮT LƯỢC PHẦN GIỮA, NỐI PHẦN BÀI TẬP VÀ ĐÁP ÁN TRỌNG TÂM TRANG SAU ...]\n\n${tail}`;
  }

  return `\n[TÀI LIỆU RAG NGUỒN ĐÍNH KÈM / GHIM]:
Tên file: ${attachedPdf.fileName} (${attachedPdf.numPages} trang)
Nội dung trích xuất:
"""
${chunk}
"""
CHỈ THỊ SƯ PHẠM RAG BẮT BUỘC CHO VIDEO:
1. KHÁI NIỆM & LÝ THUYẾT CHUẨN MỰC: Các khái niệm, định nghĩa, định lý, công thức và ví dụ minh họa BẮT BUỘC phải trích xuất chính xác theo tài liệu PDF đính kèm. Tuyệt đối không tự bịa đặt hay viết chung chung làm lệch kiến thức gốc trong tài liệu.
2. TÊN ĐỀ BÀI & CÂU HỎI: Không nhất thiết phải viết hoa toàn bộ (ALL CAPS). Đề bài cần được xuống dòng \n bình thường theo nhịp ngữ nghĩa tự nhiên (mỗi dòng tối đa 7-9 từ) để không bị to tràn box hay vỡ khung hình.
1. BẮT BUỘC trích xuất chính xác bài toán, câu hỏi, định nghĩa, định lý, hiện tượng hoặc dữ liệu từ tài liệu RAG trên.
2. NGUYÊN TẮC MẬT ĐỘ: Chọn ĐÚNG 2 BÀI/CÂU TIÊU BIỂU NHẤT từ tài liệu để đưa vào Phần Thực Chiến (Top Card = Câu 1, Bottom Card = Câu 2). TUYỆT ĐỐI KHÔNG tham lam nhồi nhét 3-4 câu gây vỡ khung hình!
3. Bám sát 100% câu từ, số liệu, giả thiết và kết luận trong tài liệu gốc. TUYỆT ĐỐI KHÔNG tự bịa nội dung khác!
4. Trình bày lời giải sư phạm mạch lạc, đúng và đủ ý chính, phân tích bản chất sâu sắc.\n`;
};

export const MANIM_SKILLS_GUIDE = `
★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★XX
(Kế thừa Cấu trúc 5 Phân Cảnh Chuẩn Mực từ c1_HamSo_DonDieu.py, Hệ Thống Khung Thẻ Container Dual-Zone,
 Mô Phỏng Động ValueTracker + Tiếp Tuyến Đổi Màu, Bảng Biến Thiên 3 Tầng & Chống Đè Chữ Tuyệt Đối)

1. CẤU TRÚC 5 PHÂN CẢNH CHUẨN MỰC (5-CHAPTER CINEMATIC FLOW, ~100-120S):
   - Mọi video bài giảng toán học chuẩn studio BẮT BUỘC chia thành đúng 5 chương mạch lạc:
     * CHƯƠNG 1 - MỞ ĐẦU ẤN TƯỢNG (Intro, ~7s):
       Pill Badge tên chuyên đề + Khung bao tiêu đề SurroundingRectangle + Phụ đề + Xem trước các công thức cốt lõi.
       Chuyển cảnh: FadeOut toàn bộ Intro để tránh đè chữ. TUYỆT ĐỐI KHÔNG đưa biểu tượng lên góc UL làm watermark!
     * CHƯƠNG 2 - LÝ THUYẾT CỐT LÕI VỚI 2 THẺ MÀU TƯƠNG PHẢN (Theory Cards, ~14s):
       Header đỉnh + 2 Thẻ màu độc lập xếp dọc (Card 1 Xanh Emerald #064E3B cho tính chất khẳng định/đồng biến;
       Card 2 Đỏ Ruby #7F1D1D cho tính chất phủ định/nghịch biến, height=4.0-4.2 mỗi thẻ, width=8.4). FadeOut toàn bộ.
     * CHƯƠNG 3 - DUAL-ZONE CONTAINER MÔ PHỎNG ĐỘNG TƯƠNG TÁC (Visual Simulation, ~38s):
       - Header Bar cố định (height=1.1-1.3, width=8.4) với Pill Badge ("VÍ DỤ MINH HỌA" hoặc "VÍ DỤ").
       - Top Card (height=6.4, width=8.4): Đồ thị Axes (x_length=7.2, y_length=4.0), đường cong axes.plot, cực trị gióng nét đứt.
         TIẾP TUYẾN CHUYỂN ĐỘNG VỚI ValueTracker + always_redraw: Tiếp tuyến tự động đổi màu theo hệ số góc (GREEN khi dốc lên, RED khi dốc xuống, YELLOW khi đi ngang)
         + THANH TRẠNG THÁI REAL-TIME (status_badge = always_redraw(...)) hiển thị trực tiếp y' > 0 / y' < 0 / y' = 0!
       - Bottom Card (height=6.6, width=8.4): Đạo hàm + BẢNG BIẾN THIÊN 3 TẦNG LATEX CHUẨN SGK (\\begin{array}{|c|ccccccc|})
         + Kết luận khoảng đơn điệu/cực trị đóng khung xanh SurroundingRectangle.
       - Cho ValueTracker trượt mượt mà qua các khoảng để học sinh quan sát đồ thị và BBT đồng thời. FadeOut toàn bộ.
     * CHƯƠNG 4 - CHỮA ĐỀ THI RAG THỰC CHIẾN (Thực Chiến RAG, ~38s):
       - Header Bar với Pill Badge ("THỰC CHIẾN").
       - QUY TẮC MẬT ĐỘ BẮT BUỘC: TỐI ĐA 2 CÂU TIÊU BIỂU (Top Card = Câu 1; Bottom Card = Câu 2). TUYỆT ĐỐI KHÔNG nhồi 3-4 câu!
       - Top Card (Câu 1, height=6.4): Đề bài + BBT LaTeX hoặc đồ thị + 4 đáp án hàng ngang + Hộp xanh SurroundingRectangle quanh đáp án đúng.
       - Bottom Card (Câu 2, height=6.6): Đề bài + Phương pháp giải đại số 3 bước ngắn gọn + Hộp xanh SurroundingRectangle quanh đáp án đúng. FadeOut toàn bộ.
     * CHƯƠNG 5 - TỔNG KẾT & OUTRO THƯƠNG HIỆU (Outro Card, ~8s):
       - Thẻ Outro toàn màn hình (height=13.6, width=8.4) với 3 bí kíp đúc kết bài học.
       - Badge thương hiệu đỏ rực rỡ "Học toán cùng Yuta" + Kêu gọi follow.
       - KẾT THÚC BẰNG self.wait(1.5) ĐỂ GIỮ NGUYÊN MÀN HÌNH OUTRO. TUYỆT ĐỐI KHÔNG FadeOut làm đen màn hình!

2. SỰ SÁNG TẠO & PHÓNG KHOÁNG BỐ CỤC TRONG GIỚI HẠN HÌNH HỌC AN TOÀN:
   - Được quyền sáng tạo phong phú về phối màu: Nền chính tối (#0B1120), Thẻ Slate (#0F172A, #1E293B),
     Thẻ Xanh Emerald (#064E3B), Thẻ Đỏ Ruby (#7F1D1D), Thẻ Hổ Phách (#78350F), Điểm nhấn Vàng (#EAB308).
   - Được quyền sử dụng đa dạng các dạng thẻ: Thẻ đơn toàn màn hình, 2 thẻ xếp dọc (Stacked Cards),
     2 vùng song song (Dual-Zone), Huy hiệu bo tròn (Pill Badges), Hộp chỉ dẫn (Callout Boxes).
   - NGUYÊN TẮC BẢO VỆ BẤT DI BẤT DỊCH: BẮT BUỘC dùng hàm fit_width(group, 7.8) cho mọi khối nội dung bên trong thẻ để chống tràn viền.

3. NGUYÊN TẮC ZERO-OVERLAP & NGÂN SÁCH TỌA ĐỘ 9:16 (1080x1920):
   - Màn hình dọc cao 16.0 đơn vị (Y từ -8.0 đến +8.0), rộng 9.0 đơn vị (X từ -4.5 đến +4.5).
   - Header Bar: to_edge(UP, buff=0.35), height=1.1-1.3, width=8.4-8.5.
   - Top Card: next_to(header_card, DOWN, buff=0.2), height=6.4, width=8.4.
     * Giới hạn Axes: x_length=7.0-7.2, y_length=3.8-4.0. KHÔNG vượt quá 4.0 vì sẽ đè lên tiêu đề thẻ hoặc nhãn cực trị!
   - Bottom Card: next_to(top_card, DOWN, buff=0.2), height=6.6, width=8.4.
   - Khi chuyển giữa các chương: BẮT BUỘC FadeOut toàn bộ các đối tượng cũ trước khi tạo chương mới.

4. QUY CHUẨN TYPOGRAPHY & FONT IN ĐẬM CHUẨN ĐẸP (SANS-SERIF HIỆN ĐẠI):
   - Font chữ Tiếng Việt: BẮT BUỘC dùng "Be Vietnam Pro" (ưu tiên số 1) hoặc "Inter".
   - TUYỆT ĐỐI CẤM dùng font Serif có chân (như "Times New Roman" hay "Liberation Serif") cho Text tiếng Việt trên video, vì khi in đậm weight=BOLD trên Linux/Cairo/Pango nét chữ sẽ bị gai góc, thô ráp, răng cưa và méo mó dấu tiếng Việt.
   - Khi in đậm (Bold Typography): Sử dụng weight=BOLD cho tiêu đề và weight=SEMIBOLD (hoặc BOLD chuẩn) cho các từ khóa then chốt trên nền "Be Vietnam Pro". Các đường nét bo tròn mượt mà, nét chữ đồng đều, dấu thanh chuẩn tỉ lệ vàng, hiển thị sắc nét và sang trọng trên màn hình điện thoại.
   - KÍCH THƯỚC CHỮ (CẤM DÙNG font_size DƯỚI 20):
     * Tiêu đề chính / Intro / Outro: font_size=28 đến 32 (weight=BOLD, màu YELLOW).
     * Tiêu đề Thẻ Card: font_size=22 đến 24 (weight=BOLD, TEAL_A hoặc YELLOW).
     * Công thức MathTex chính: font_size=24 đến 30.
     * Văn bản tiếng Việt diễn giải: font_size=20 đến 24.
     * Bảng biến thiên LaTeX: font_size=22 đến 26.
     * Nhãn trục tọa độ Oxy (x, y): font_size=22.
   - Mọi Text nhiều dòng BẮT BUỘC set line_spacing=1.2.

5. BẢNG BIẾN THIÊN CHUẨN MỰC SGK VIỆT NAM (LATEX ARRAY 3 TẦNG):
   - BẮT BUỘC dùng mảng LaTeX array chuẩn mực:
     MathTex(r"""\\renewcommand{\\arraystretch}{1.35}
     \\begin{array}{|c|ccccccc|}
     \\hline
     x & -\\infty & & -1 & & 1 & & +\\infty \\\\
     \\hline
     y' & & + & 0 & - & 0 & + & \\\\
     \\hline
     & & & 2 & & & & +\\infty \\\\
     y & & \\nearrow & & \\searrow & & \\nearrow & \\\\
     & -\\infty & & & & -2 & & \\\\
     \\hline
     \\end{array}""", font_size=24)

6. 100% CÔNG THỨC LATEX & CHỈ SỐ TRÊN/DƯỚI CHUẨN XÁC (SUPERSCRIPT & SUBSCRIPT):
   - 100% chỉ số trên (số mũ x^2, x^3, e^{2x}) và chỉ số dưới (x_0, x_1, y_0, \\Delta_x) hoặc đạo hàm (y', f''(x)) BẮT BUỘC dùng MathTex(r"...") với raw string r"...".
   - TUYỆT ĐỐI CẤM sử dụng ký tự unicode (như x², x³, x₁, x₀, y') bên trong Text("..."). Pango/Cairo trên Linux/Windows sẽ bị lỗi font, vỡ glyph ô vuông hoặc lệch dòng.
   - Khi kết hợp tiếng Việt và công thức toán: BẮT BUỘC tách thành Text và MathTex rồi ghép bằng VGroup:
     VGroup(Text("Hàm số:", font=MAIN_FONT, font_size=22), MathTex(r"y = x^3 - 3x^2", font_size=24)).arrange(RIGHT, buff=0.15)
   - Đóng khung nổi bật đáp số / kết luận: SurroundingRectangle(conclusion, color=GREEN, buff=0.16, corner_radius=0.12, stroke_width=2.5).

7. QUY TẮC NHỊP ĐỘ DIỄN HOẠT (PACING VỪA PHẢI, MƯỢT MÀ, KHÔNG ĐỂ KHOẢNG CHỜ QUÁ LÂU):
   - Nhịp điệu diễn hoạt phải sinh động, dứt khoát và liên tục (Snappy & Engaging), TUYỆT ĐỐI KHÔNG dừng chết video quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê:
     * Chuyển cảnh / Xuất hiện nội dung thông thường: Dừng nhẹ self.wait(0.5) đến self.wait(0.8).
     * Khi tiếp tuyến chuyển động chạm cực trị (y' = 0 đổi màu vàng / đi ngang): Dừng vừa vặn self.wait(0.8) đến self.wait(1.0) để người xem kịp nhận biết.
     * Khi bảng biến thiên 3 tầng xuất hiện: Dừng self.wait(0.8) đến self.wait(1.0).
     * Khi đóng khung hộp kết luận hoặc đáp án đúng: Dừng self.wait(1.0) đến self.wait(1.2).
   - Diễn hoạt ValueTracker tiếp tuyến: Dùng rate_func=smooth với thời lượng run_time=2.0s đến 2.5s để tiếp tuyến lướt mượt mà, không bị chậm chạp lê thê.

8. BẢN ĐỒ CHIẾN LƯỢC TRỰC QUAN ĐA MÔN (MULTI-SUBJECT VISUAL BLUEPRINT):
   - Toán học: Đồ thị hàm số, tiếp tuyến trượt đổi màu ValueTracker, Bảng biến thiên 3 tầng, Hình học không gian gióng nét đứt.
   - Vật lý: Quỹ đạo chuyển động, dao động điều hòa axes.plot(lambda t: np.sin(t)), sơ đồ mạch điện, vector lực, đường sức từ trường. Khung thẻ dưới hiển thị công thức định luật và các bước thay số.
   - Hóa học: Mô hình nguyên tử/phân tử, phương trình phản ứng hóa học cân bằng có mũi tên trạng thái/nhiệt độ, bảng biến thiên nồng độ/pH theo thời gian.
   - Sinh học: Sơ đồ lai Menđen (bảng Punnett), sơ đồ phân bào nguyên phân/giảm phân, chuỗi xoắn kép ADN/ARN tách mạch, lưới thức ăn sinh thái.
   - Tiếng Anh / Ngoại ngữ: Thẻ từ vựng trực quan (Pill Badge từ loại, phiên âm IPA, câu ví dụ), sơ đồ trục thời gian các thì (Tenses Timeline), cấu trúc ngữ pháp then chốt.
   - Tin học / Thuật toán: Trực quan hóa mảng (Array bars đổi màu), duyệt cây nhị phân (Binary Tree), các bước thuật toán sắp xếp/tìm kiếm, đồ thị độ phức tạp thời gian O(1) đến O(n^2).
   - Lịch sử / Địa lý / GDCD: Trục thời gian tiến trình sự kiện (Chronological Timeline), sơ đồ tư duy nguyên nhân - hệ quả, biểu đồ cột/tròn đối chiếu số liệu.

9. QUY TẮC VĂN PHONG SƯ PHẠM (LOẠI BỎ TỪ NGỮ AI HÓA):
   - Tuyệt đối KHÔNG sử dụng các từ ngữ giật gân, sáo rỗng hay cường điệu phong cách AI. Sử dụng các thuật ngữ sư phạm chuẩn mực, trong sáng: "định lý cốt lõi", "quy tắc trọng tâm", "phương pháp giải", "lưu ý quan trọng", "kết luận ghi nhớ".
   - Mọi khái niệm, lý thuyết, công thức phải được đối chiếu và bám sát chính xác tài liệu PDF đính kèm (RAG).

10. QUY TẮC ĐỒNG BỘ THỜI GIAN ÂM THANH (TTS) & HOẠT HỌA MANIM (TTS-ANIMATION SYNC):
   - Tốc độ đọc tự nhiên của giọng đọc AI: ~2.8 - 3.0 từ/giây (160 - 180 từ/phút).
   - Dung lượng kịch bản VOICEOVER_SCRIPT phải tương ứng: Số từ ≈ Thời lượng (giây) × 2.85.
     * Video 60s: ~170 từ.
     * Video 90s: ~255 từ.
     * Video 110-120s: ~300-330 từ.
   - Khớp nối phân cảnh chuẩn mực (Animation Duration ≈ Voiceover Duration):
     * Cảnh 1 (Intro): 7s -> ~20 từ.
     * Cảnh 2 (Lý thuyết): 14s -> ~40 từ.
     * Cảnh 3 (Mô phỏng động / Dual-Zone): 38s -> ~105 từ.
     * Cảnh 4 (Chữa bài thực chiến): 38s -> ~105 từ.
     * Cảnh 5 (Outro): 8s -> ~25 từ.
   - Trong code Manim, tổng run_time của self.play(...) cộng với self.wait(...) ở mỗi phân cảnh phải khớp với thời gian đọc của phân cảnh đó để video kết thúc cùng lúc với giọng đọc.
`.replace("★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★XX", "★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★★★");

const getFontDirective = (fontStyle?: string): string => {
  return 'Be Vietnam Pro';
};

export const extractAttachedImageDirective = (attachedImage?: any): string => {
  if (!attachedImage?.filePath) return "";
  const layoutDesc = attachedImage.layoutMode === 'split_left'
    ? 'Chia đôi màn hình: Nửa trái đặt ảnh ImageMobject, nửa phải đặt công thức MathTex và phân tích.'
    : attachedImage.layoutMode === 'overlay'
    ? 'Vẽ chú thích tương tác: Đặt ảnh ở trung tâm, vẽ các mũi tên Arrow, vòng tròn khoanh vùng và nhãn MathTex trực tiếp lên các điểm quan trọng của ảnh.'
    : 'Bố cục Top Card: Đặt ảnh ImageMobject trọn vẹn trong Top Card, Bottom Card hiển thị lời giải chi tiết và công thức.';

  return `\n[HÌNH ẢNH MINH HỌA ĐÍNH KÈM / SƠ ĐỒ BÀI TOÁN]:
- Tên ảnh: ${attachedImage.fileName}
- Đường dẫn file cục bộ (Dùng nguyên vẹn trong code): r"${attachedImage.filePath}"
- Yêu cầu mô tả của người dùng: "${attachedImage.description || 'Chèn ảnh minh họa vào video và vẽ hoạt họa phân tích'}"
- Kiểu bố cục chỉ định: ${attachedImage.layoutMode || 'top_card'} (${layoutDesc})

QUY TẮC CỐT TỬ KHI SỬ DỤNG ImageMobject TRONG MANIM CE (CHỐNG CRASH 100%):
1. BẮT BUỘC DÙNG Group(...) THAY CHO VGroup(...):
   - ImageMobject kế thừa từ Mobject, KHÔNG PHẢI VMobject. TUYỆT ĐỐI CẤM thêm ImageMobject vào VGroup(...) vì sẽ gây crash TypeError: "Only values of type VMobject can be added as submobjects of VGroup".
   - Do đó, mọi nhóm chứa ảnh PHẢI KHỞI TẠO BẰNG Group(...):
     m_img = ImageMobject(r"${attachedImage.filePath}")
     m_img.scale_to_fit_width(4.5)
     border = SurroundingRectangle(m_img, buff=0.08, color=TEAL_A, stroke_width=2.5, corner_radius=0.15)
     img_group = Group(m_img, border)  # BẮT BUỘC Group, KHÔNG DÙNG VGroup!
2. CO TỶ LỆ VỪA VẶN: Dùng m_img.scale_to_fit_width(4.5) hoặc m_img.scale_to_fit_height(3.8) để ảnh không bao giờ bị to tràn khung hình.
3. HIỆU ỨNG DIỄN HOẠT: self.play(FadeIn(img_group, shift=UP * 0.2), run_time=0.8).
4. TƯƠNG TÁC SƯ PHẠM: Vẽ mũi tên Arrow(start, end, color=YELLOW) hoặc khung nhãn MathTex trỏ vào chi tiết then chốt trên ảnh theo đúng yêu cầu mô tả.\n`;
};

const getSimulationModeDescription = (mode?: string): string => {
  switch (mode) {
    case 'geometry_3d':
      return `[BỘ FORM MÔ PHỎNG HÌNH HỌC KHÔNG GIAN 3D (ThreeDScene)]:
Xây dựng mô hình 3D với ThreeDScene: Vẽ hình chóp (S.ABCD, S.ABC), khối lăng trụ, khối lập phương hoặc mặt cầu.
- Phân biệt rõ ràng các cạnh nét đứt (DashedLine) cho đường khuất bên trong và Line3D / Line nét liền cho các cạnh thấy.
- Sử dụng self.move_camera(phi=70*DEGREES, theta=30*DEGREES, run_time=2.0) tạo góc nhìn 3D có chiều sâu cuốn hút.
- Thẻ dưới hiển thị phương pháp xác định góc giữa đường thẳng và mặt phẳng, góc nhị diện, khoảng cách hoặc công thức thể tích.`;
    case 'trigonometry':
      return `[BỘ FORM LƯỢNG GIÁC & VÒNG TRÒN ĐƠN VỊ]:
Vẽ đường tròn lượng giác đơn vị tâm O bán kính 1 với hệ trục Oxy. Vector bán kính quay góc alpha qua ValueTracker.
- Trục Cos ngang (màu Cyan), trục Sin đứng (màu Yellow), trục Tan tiếp tuyến (màu Red) tự động gióng nét đứt và cập nhật giá trị theo góc quay real-time.
- Thẻ dưới hiển thị đồ thị hàm số y = sin(x) hoặc y = cos(x) chạy đồng bộ với điểm quay trên đường tròn.`;
    case 'complex_numbers':
      return `[BỘ FORM SỐ PHỨC & MẶT PHẲNG PHỨC ARGAND]:
Hệ trục tọa độ phức Oxy: Trục hoành Re(z) và trục tung Im(z). Điểm biểu diễn M(a, b) và vector v = (a, b) cho số phức z = a + bi.
- Diễn hoạt module |z| bằng độ dài vector và argument phi bằng cung góc quay.
- Biểu diễn trực quan tập hợp điểm quỹ tích đường tròn |z - z0| = R hoặc đường trung trực elip. Thẻ dưới phân tích biến đổi đại số tương ứng.`;
    case 'coordinate_oxyz':
      return `[BỘ FORM HỆ TỌA ĐỘ KHÔNG GIAN OXYZ]:
Vẽ 3 trục Ox, Oy, Oz với ThreeDAxes có nhãn vector đơn vị i, j, k.
- Biểu diễn mặt phẳng (P): Ax + By + Cz + D = 0 dưới dạng hình bình hành tô màu trong suốt, vector pháp tuyến n = (A, B, C) dựng vuông góc với mặt phẳng.
- Vẽ đường thẳng (d) với vector chỉ phương u và hình chiếu vuông góc của điểm H lên mặt phẳng.`;
    case 'image_showcase':
      return `[BỘ FORM PHÂN TÍCH HÌNH ẢNH & SƠ ĐỒ THỰC TẾ (ImageMobject)]:
Tích hợp trực tiếp hình ảnh thực tế / đề bài / sơ đồ SGK qua ImageMobject.
- BẮT BUỘC dùng Group(...) thay vì VGroup(...) để chứa ImageMobject nhằm chống lỗi crash TypeError.
- Co tỷ lệ vừa vặn thẻ, đóng khung viền bo tròn thẩm mỹ SurroundingRectangle(color=TEAL_A, corner_radius=0.15).
- Vẽ các vector, vòng tròn khoanh vùng, mũi tên Arrow và công thức MathTex tương tác trỏ trực tiếp vào các điểm mấu chốt trên ảnh để phân tích bài toán.`;
    case 'geometry':
      return `[BỘ FORM MÔ PHỎNG HÌNH HỌC PHẲNG & VECTOR]: 
Xây dựng mô hình 2D với Axes, Polygon, Circle, Arrow biểu diễn vector, RightAngle đánh dấu góc vuông, và điểm chuyển động Dot. Dùng đường gióng nét đứt và nhãn đỉnh đặt ở hướng an toàn.`;
    case 'dialogue':
      return `[BỘ FORM ĐỐI THOẠI 2 NGƯỜI (THẦY - TRÒ Q&A)]: 
Tạo 2 thẻ đại diện: Thẻ "👨‍🏫 Thầy Yuta" bên Trái/Trên và Thẻ "🙋‍♂️ Học sinh" bên Phải/Dưới. 
Học sinh đưa ra câu hỏi thắc mắc trong khung thẻ -> Thầy Yuta xuất hiện giải đáp trực quan từng bước bằng công thức LaTeX và mô hình minh họa.`;
    case 'calculus':
      return `[BỘ FORM GIẢI TÍCH & KHẢO SÁT HÀM SỐ (CHUẨN c1_HamSo_DonDieu.py)]: 
Tạo hệ trục Axes, đồ thị axes.plot(...), tiếp tuyến di chuyển trượt trên đường cong với ValueTracker, tự động đổi màu theo độ dốc f'(x), thanh trạng thái real-time always_redraw, đường gióng nét đứt đến cực trị, và BẢNG BIẾN THIÊN 3 tầng chuẩn mực SGK Việt Nam (x, y', y).`;
    case 'fast_tricks':
      return `[BỘ FORM MẸO & THỦ THUẬT GIẢI NHANH 30S]: 
Bố cục 2 thẻ so sánh: 
- Thẻ 1 (❌ Cách tự luận dài - 3 phút): Hiển thị phép tính dài, dùng gạch đỏ cảnh báo tốn thời gian.
- Thẻ 2 (⚡ Mẹo thần tốc 30s): Hiển thị công thức rút gọn, đóng khung SurroundingRectangle(color=GREEN) kèm hiệu ứng Flash.`;
    case 'stem':
    case 'physics':
    case 'physics_stem':
      return `[BỘ FORM MÔ PHỎNG VẬT LÝ & KHOA HỌC STEM]: 
Diễn hoạt quỹ đạo chuyển động con lắc/vật ném, dao động điều hòa axes.plot(lambda t: np.sin(t)), sơ đồ mạch điện (nguồn, điện trở, ampe kế), vector lực kéo/ma sát, hoặc đường sức từ trường. Khung thẻ dưới hiển thị công thức định luật và tính toán số liệu cụ thể.`;
    case 'chemistry':
      return `[BỘ FORM HÓA HỌC & PHẢN ỨNG]: 
Diễn hoạt sơ đồ liên kết phân tử, các hạt nguyên tử chuyển động va chạm phản ứng, phương trình phản ứng hóa học cân bằng có điều kiện nhiệt độ/xúc tác, và bảng biến thiên nồng độ/pH theo thời gian.`;
    case 'biology':
      return `[BỘ FORM SINH HỌC & DI TRUYỀN HỌC]: 
Mô phỏng bảng lai Punnett di truyền Menđen, sơ đồ phân bào nguyên phân/giảm phân, mô hình chuỗi xoắn kép ADN/ARN tách mạch nhân đôi, hoặc sơ đồ lưới thức ăn sinh thái.`;
    case 'english_language':
    case 'languages':
      return `[BỘ FORM TIẾNG ANH & NGOẠI NGỮ]: 
Thẻ trên hiển thị thẻ học từ vựng trực quan (Pill Badge từ loại, phiên âm IPA, câu ví dụ thực tế), thẻ dưới minh họa sơ đồ trục thời gian các thì (Tenses Timeline) hoặc cấu trúc ngữ pháp then chốt.`;
    case 'computer_science':
    case 'algorithms':
      return `[BỘ FORM TIN HỌC & THUẬT TOÁN]: 
Mô phỏng trực quan các thanh mảng chuyển động tráo đổi vị trí trong thuật toán sắp xếp (Bubble/Quick Sort), duyệt cây nhị phân (Binary Tree), hoặc đồ thị trực quan so sánh độ phức tạp O(1) đến O(n^2).`;
    case 'social_sciences':
    case 'history_geography':
      return `[BỘ FORM KHOA HỌC XÃ HỘI (LỊCH SỬ - ĐỊA LÝ)]: 
Trục thời gian tiến trình lịch sử (Chronological Timeline) trượt qua các mốc năm quan trọng, sơ đồ tư duy nguyên nhân - diễn biến - ý nghĩa lịch sử, hoặc biểu đồ trực quan số liệu địa lý/dân số.`;
    default:
      return `[BỘ FORM BÀI GIẢNG ĐA MÔN CHUẨN STUDIO (5 CHƯƠNG KẾ THỪA c1_HamSo_DonDieu.py)]: 
Bố cục Khung Thẻ Chuẩn: Intro -> Lý thuyết (2 thẻ màu độc lập) -> Dual-Zone Mô phỏng động tương tác & Bảng phân tích -> Chữa Đề RAG thực chiến (Tối đa 2 câu) -> Thẻ Outro Thương Hiệu.`;
  }
};

// =========================================================================
// LƯỢT 1: PROMPT XÂY DỰNG KỊCH BẢN PHÂN CẢNH & LỜI THOẠI (STORYBOARD PROMPT)
// =========================================================================
export const generateManimStoryboardPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const targetDurationStr = config.duration || '100 - 120 giây';
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragSection = sanitizeAndExtractRag(config.attachedPdf);
  const imageSection = extractAttachedImageDirective(config.attachedImage);

  const approxSeconds = isVertical ? 110 : 120;
  const targetWords = Math.round(approxSeconds * 2.85);

  return `Đóng vai Chuyên gia Sư phạm & Đạo diễn Diễn hoạt Khoa học Manim CE (chuẩn phong cách Yuta Academy).
Nhiệm vụ của bạn là xây dựng KỊCH BẢN SƯ PHẠM VÀ LỜI THOẠI THUYẾT MINH TRÔI CHẢY, PHONG PHÚ cho video bài giảng về: "${config.topic}" (Môn: ${config.subject}, Khán giả: ${config.audience || 'Học sinh / Người học'}).
Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / Shorts / Reels - Bố cục Khung Thẻ Dual-Zone lấp đầy 93% màn hình)' : 'NGANG 16:9 (YouTube / Bài giảng)'}.
THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr}.
${simDesc}
${ragSection}
${imageSection}

YÊU CẦU LẬP DÀN Ý 5 PHÂN CẢNH CHUẨN MỰC VÀ SOẠN LỜI THOẠI TRÔI CHẢY, TRUYỀN CẢM, CÓ NGẮT NGHỈ MẠCH LẠC PHÙ HỢP VỚI THỜI LƯỢNG ${targetDurationStr} (ĐỘ DÀI KỊCH BẢN KHOẢNG ${targetWords} TỪ - TỐC ĐỘ ĐỌC 2.85 TỪ/GIÂY):

1. PHÂN CẢNH 1 - MỞ ĐẦU ẤN TƯỢNG (INTRO, ~7S, ~20 TỪ):
   - Khung thẻ Intro với Tên bài học, Pill badge môn học "${config.subject.toUpperCase()}" và Ký hiệu/khái niệm cốt lõi.
   - Lời thoại Intro: Chào mừng, đặt vấn đề kích thích tò mò và tạo cảm hứng học tập.

2. PHÂN CẢNH 2 - LÝ THUYẾT CỐT LÕI VỚI 2 THẺ MÀU TƯƠNG PHẢN (~14S, ~40 TỪ):
   - 2 Thẻ màu độc lập đối chiếu (Thẻ Xanh Emerald cho trường hợp 1 / thuận / khẳng định; Thẻ Đỏ Ruby cho trường hợp 2 / nghịch / phủ định).
   - Lời thoại Lý thuyết: Phân tích trực quan, so sánh bản chất và làm nổi bật điều kiện áp dụng.

3. PHÂN CẢNH 3 - DUAL-ZONE CONTAINER MÔ PHỎNG ĐỘNG TƯƠNG TÁC (~38S, ~105 TỪ):
   - Top Card (Thẻ Trên - height=6.4, width=8.4): Trực quan hóa hiện tượng/đồ thị/mô hình/hình ảnh minh họa ImageMobject.
   - Bottom Card (Thẻ Dưới - height=6.6, width=8.4): Suy luận lý thuyết/biến đổi số/bảng biến thiên/công thức định luật/cấu trúc ngữ pháp.
   - Lời thoại Mô phỏng: Thuyết minh đồng bộ từng chuyển động, làm sáng tỏ mối liên hệ giữa trực quan và công thức.

4. PHÂN CẢNH 4 - THỰC CHIẾN / BÀI TẬP VẬN DỤNG RAG (TỐI ĐA 2 CÂU TIÊU BIỂU, ~38S, ~105 TỪ):
   - Top Card: Câu 1 (Đọc đồ thị/hình ảnh/nhận biết nhanh) + 4 đáp án + Hộp xanh khoanh đáp án đúng.
   - Bottom Card: Câu 2 (Vận dụng/tính toán/biện luận logic) + 3 bước giải then chốt + Hộp xanh khoanh đáp án đúng.
   - Lời thoại Chữa đề: Chỉ ra mẹo giải nhanh, phân tích bẫy đề thi và chốt phương pháp xử lý dứt khoát.

5. PHÂN CẢNH 5 - TỔNG KẾT & OUTRO THƯƠNG HIỆU (~8S, ~25 TỪ):
   - Thẻ Outro: Đúc kết 3 bí kíp bài học + Thông điệp thương hiệu "Học ${config.subject} cùng Yuta" (giữ nguyên khung hình cuối 1.5s).
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
  const targetDurationStr = config.duration || '100 - 120 giây';
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragSection = sanitizeAndExtractRag(config.attachedPdf);
  const imageSection = extractAttachedImageDirective(config.attachedImage);

  return `Tuyệt vời! Dựa trên kịch bản sư phạm và khối lời thoại VOICEOVER_SCRIPT vừa thống nhất ở trên, hãy viết TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh 100% để render video bài giảng này.
${simDesc}
${ragSection}
${imageSection}

YÊU CẦU KỸ THUẬT BẮT BUỘC (TUÂN THỦ BỘ NGUYÊN TẮC c1_HamSo_DonDieu.py & DUAL-ZONE CONTAINER CARDS):
1. Kế thừa chính xác biến VOICEOVER_SCRIPT và cấu trúc 5 PHÂN CẢNH CHUẨN MỰC:
   - Phần 1: Mở đầu (Intro, ~7s) - FadeOut toàn bộ.
   - Phần 2: Lý thuyết 2 thẻ màu tương phản (Xanh & Đỏ, ~14s) - FadeOut toàn bộ.
   - Phần 3: Dual-Zone Container Mô phỏng động tiếp tuyến đổi màu + BBT 3 tầng (~38s) - FadeOut toàn bộ.
   - Phần 4: Chữa đề thi RAG thực chiến (TỐI ĐA 2 CÂU: Top Card = Câu 1, Bottom Card = Câu 2, ~38s) - FadeOut toàn bộ.
   - Phần 5: Thẻ Outro tổng kết thương hiệu "Học toán cùng Yuta" (~8s) - Giữ nguyên self.wait(1.5), KHÔNG FadeOut.
2. Cấu hình ${isVertical ? 'Khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0)' : 'Khung hình NGANG 16:9 (1920x1080)'}.
3. BỐ CỤC KHUNG THẺ CONTAINER (DUAL-ZONE) LẤP ĐẦY 93% MÀN HÌNH - TRIỆT TIÊU KHOẢNG TRỐNG ĐEN:
   - ${isVertical ? 'Top Header Bar (y ~ 7.05, height=1.1-1.3, width=8.4); Top Card (y ~ 3.15, height=6.4, width=8.4); Bottom Card (y ~ -3.75, height=6.6, width=8.4); Outro Card (height=13.6, width=8.4). BẮT BUỘC gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ!' : 'Header đỉnh, Cột Trái Mô phỏng (width=7.2, height=6.2), Cột Phải Công thức (width=5.8, height=6.2).'}
4. TIÊU ĐỀ INTRO DÀN ĐỀU & ĐỀ BÀI CHỐNG TRÀN BOX:
   - Tên chủ đề Intro: Không bắt buộc viết hoa toàn bộ, ngắt dòng \n cân đối nếu dài, dùng alignment="CENTER", sau arrange BẮT BUỘC gọi for item in intro_group: item.set_x(0) để căn giữa đối xứng tuyệt đối trục X=0.
   - Khái niệm, lý thuyết: Trình bày chuẩn xác theo tài liệu PDF đính kèm (RAG), không tự ý suy diễn hay viết chung chung.
   - Tên đề bài và câu hỏi: Không viết hoa toàn bộ, xuống dòng \n tự nhiên (7-9 từ/dòng), font_size=20-22 để không bao giờ bị to tràn box.
   - Tuyệt đối KHÔNG dùng từ ngữ giật gân, sáo rỗng hay cường điệu phong cách AI.
5. ZERO-OVERLAP & WATERMARK SAFETY:
   - TUYỆT ĐỐI KHÔNG để biểu tượng Intro co nhỏ rồi to_corner(UL) làm watermark trôi nổi (tránh va chạm đè chữ tiêu đề)! Dọn sạch từng cảnh trước khi qua cảnh sau.
6. QUY CHUẨN TYPOGRAPHY & FONT IN ĐẬM CHUẨN ĐẸP TRÊN ĐIỆN THOẠI:
   - Sử dụng font="${chosenFont}" (Be Vietnam Pro) cho mọi đối tượng Text. TUYỆT ĐỐI KHÔNG dùng font Serif (Times New Roman) vì khi in đậm weight=BOLD sẽ bị răng cưa méo mó.
   - Sử dụng weight=BOLD cho tiêu đề và weight=SEMIBOLD (hoặc BOLD chuẩn) cho các từ khóa nhấn mạnh. Nét chữ bo tròn, đường nét đồng đều, dấu thanh chuẩn tỉ lệ vàng.
   - Tiêu đề 28-32 BOLD, Tiêu đề Thẻ 22-24 BOLD, Công thức MathTex 24-30, Chú thích tiếng Việt 20-22. CẤM font_size < 20!
   - line_spacing=1.2 cho các đoạn Text nhiều dòng.
7. QUY TẮC CHỈ SỐ TRÊN/DƯỚI & TIÊU ĐỀ PILL BADGE:
   - 100% công thức chứa số mũ (x^2, x^3), chỉ số dưới (x_0, x_1), đạo hàm (y') BẮT BUỘC dùng MathTex(r"..."). TUYỆT ĐỐI CẤM dùng ký tự unicode mũ (x², x³, x₁, x₀) trong Text(...).
   - Tiêu đề Pill Badge: Dùng "VÍ DỤ MINH HỌA" hoặc "VÍ DỤ", TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
8. MÔ PHỎNG TIẾP TUYẾN ĐỘNG, BẢNG BIẾN THIÊN 3 TẦNG & PACING VỪA PHẢI:
   - ValueTracker + always_redraw cho tiếp tuyến đổi màu (Xanh/Đỏ/Vàng) và thanh trạng thái status_badge real-time. Tiếp tuyến lướt mượt với run_time=2.0s đến 2.5s.
   - PACING & NHỊP ĐỘ DỨT KHOÁT: Dừng nhẹ nhàng vừa đủ tại điểm mấu chốt (self.wait(0.8) đến self.wait(1.0) khi đổi màu tiếp tuyến, xuất hiện BBT, đóng khung đáp án). Tuyệt đối không dừng quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê.
   - Bảng Biến Thiên 3 tầng chuẩn mực SGK Việt Nam: MathTex(r"\\begin{array}{|c|ccccccc|} ... \\end{array}", font_size=24).
9. QUY TẮC SỬ DỤNG HÌNH ẢNH MINH HỌA (ImageMobject - CHỐNG CRASH 100%):
   - Khi có ảnh đính kèm (hoặc khi cần chèn ảnh minh họa): BẮT BUỘC dùng ImageMobject(r"...").
   - TUYỆT ĐỐI CẤM thêm ImageMobject vào VGroup(...) (sẽ crash TypeError!). BẮT BUỘC dùng Group(...) thay cho VGroup(...) khi có chứa ImageMobject.
   - Luôn co tỷ lệ vừa vặn thẻ: img.scale_to_fit_width(4.5) và đóng khung viền bo tròn SurroundingRectangle(img, buff=0.08, color=TEAL_A, corner_radius=0.15).
10. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
   - MỌI công thức dùng MathTex(r"...") với raw string. Đóng khung đáp số: SurroundingRectangle(result, color=GREEN, buff=0.16).
11. Màu nền: "#0B1120".
12. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết bất kỳ lời chào hay giải thích ngoài mã.
13. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim \${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};

// =========================================================================
// PROMPT TỔNG HỢP TINH GỌN (CHO CẢ 1-CLICK TỰ ĐỘNG & SAO CHÉP THỦ CÔNG)
// =========================================================================
export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-qh' : config.renderQuality === '4k' ? '-qk' : '-ql';
  const targetDurationStr = config.duration || '100 - 120 giây';
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragPromptChunk = sanitizeAndExtractRag(config.attachedPdf);
  const imagePromptChunk = extractAttachedImageDirective(config.attachedImage);

  const approxSeconds = isVertical ? 110 : 120;
  const targetWords = Math.round(approxSeconds * 2.85);
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
- THỜI LƯỢNG MỤC TIÊU: ${targetDurationStr} (Độ dài lời thoại VOICEOVER_SCRIPT ~${targetWords} từ)
- Định dạng: ${isVertical ? 'DỌC 9:16 (TikTok / YouTube Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}
- Font chữ chỉ định: "${chosenFont}" (Có ngắt dòng line_spacing=1.2 & spacing chuẩn giữa các chữ)
- Mẫu Diễn hoạt: ${simDesc}
- Khán giả: ${config.audience || 'Học sinh / Người học'}
- Yêu cầu chi tiết: ${config.details || "Trực quan, bố cục 5 phân cảnh chuẩn c1_HamSo_DonDieu.py, mô phỏng sinh động, chữa đề RAG thực chiến"}
- ĐỒNG BỘ THỜI GIAN ÂM THANH (TTS): Kịch bản VOICEOVER_SCRIPT phải có độ dài tương ứng (~${targetWords} từ). Các lệnh self.play(..., run_time=...) và self.wait(...) ở mỗi phân cảnh BẮT BUỘC phải khớp với thời gian đọc phân cảnh đó.
${episodeChunk}
${ragPromptChunk}
${imagePromptChunk}

II. BỘ KỸ NĂNG BẮT BUỘC TUÂN THỦ:
${MANIM_SKILLS_GUIDE}

III. BỘ KHUNG CODE PYTHON MẪU KIẾN TRÚC SƯ PHẠM (CẤU TRÚC 5 PHÂN CẢNH CHUẨN MỰC ĐÃ KIỂM ĐỊNH 100%):
\`\`\`python
from manim import *

# 0. KỊCH BẢN THUYẾT MINH ĐỒNG BỘ CHUẨN SHORTS (~100-120 GIÂY, ~${targetWords} TỪ)
VOICEOVER_SCRIPT = """
Chào mừng các bạn đến với bài giảng về ${config.topic} môn ${config.subject}! Hôm nay chúng ta sẽ cùng nắm trọn lý thuyết nền tảng và phương pháp giải các dạng bài thực chiến kinh điển nhất.
Về phần lý thuyết cốt lõi, hãy ghi nhớ thật kỹ các nguyên tắc cốt lõi tương ứng với hai khía cạnh then chốt được đóng khung rõ ràng trên màn hình.
Ở phần mô phỏng thực tế, hãy quan sát chuyển động và sự biến thiên trực quan theo thời gian thực, hoàn toàn ăn khớp với các công thức và phân tích logic bên dưới.
Bây giờ chúng ta cùng bước vào phần thực chiến chữa bài tập điển hình. Ở Câu 1 dạng nhận biết và đọc dữ liệu, ta dễ dàng chốt ngay đáp án chính xác. Ở Câu 2 dạng vận dụng và suy luận, chỉ cần tuân thủ đúng các bước giải ngắn gọn.
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
        badge_text = Text("${config.subject.toUpperCase()} • LUYỆN THI THPTQG", font_size=24, font=MAIN_FONT, weight=BOLD, color=TEAL_A)
        badge_intro = RoundedRectangle(
            corner_radius=0.15, width=badge_text.width + 0.65, height=badge_text.height + 0.35,
            color=TEAL, fill_color="#0F172A", fill_opacity=0.92, stroke_width=2.0
        ).move_to(badge_text)
        intro_badge = VGroup(badge_intro, badge_text)

        # Tiêu đề chủ đề: Dàn đều, ngắt dòng nếu dài, căn giữa trục tọa độ X=0
        clean_topic = "${config.topic}"
        intro_title = Text(clean_topic, font_size=28, weight=BOLD, color=YELLOW, line_spacing=1.2, font=MAIN_FONT, alignment="CENTER")
        intro_box = SurroundingRectangle(intro_title, buff=0.25, color=BLUE_C, corner_radius=0.15, stroke_width=2.5)

        intro_sub = Text("Lý thuyết trọng tâm • Mô phỏng trực quan • Chữa đề thực chiến", font_size=22, font=MAIN_FONT, color=GRAY_B)

        intro_core_rule = VGroup(
            MathTex(r"y' > 0 \\;\\Longrightarrow\\; \\text{Đồng biến } (\\nearrow)", font_size=28, color=GREEN_B),
            MathTex(r"y' < 0 \\;\\Longrightarrow\\; \\text{Nghịch biến } (\\searrow)", font_size=28, color=RED_B)
        ).arrange(DOWN, buff=0.22)

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
        th_header = Text("ĐỊNH LÝ DẤU ĐẠO HÀM & ĐƠN ĐIỆU", font_size=26, font=MAIN_FONT, weight=BOLD, color=YELLOW).to_edge(UP, buff=0.6)
        th_sub = Text("Định lý liên hệ dấu y' và dáng điệu hàm số", font_size=22, font=MAIN_FONT, color=GRAY_B).next_to(th_header, DOWN, buff=0.18)

        card_inc = RoundedRectangle(corner_radius=0.2, width=8.4, height=4.2, color=GREEN_D, fill_color="#064E3B", fill_opacity=0.35, stroke_width=2.5)
        t_inc_title = Text("1. HÀM SỐ ĐỒNG BIẾN (TĂNG)", font_size=24, font=MAIN_FONT, weight=BOLD, color=GREEN_B)
        t_inc_math = MathTex(r"y' = f'(x) > 0, \\quad \\forall x \\in K", font_size=30, color=WHITE)
        t_inc_desc1 = Text("➜ Đồ thị đi LÊN từ trái sang phải (↗)", font_size=22, font=MAIN_FONT, color=GREEN_A)
        t_inc_desc2 = Text("➜ Tiếp tuyến dốc lên: hệ số góc k = y' > 0", font_size=22, font=MAIN_FONT, color=GRAY_A)
        c_inc_group = VGroup(t_inc_title, t_inc_math, t_inc_desc1, t_inc_desc2).arrange(DOWN, aligned_edge=LEFT, buff=0.2).move_to(card_inc)
        fit_width(c_inc_group, 7.8)
        block_inc = VGroup(card_inc, c_inc_group)

        card_dec = RoundedRectangle(corner_radius=0.2, width=8.4, height=4.2, color=RED_D, fill_color="#7F1D1D", fill_opacity=0.35, stroke_width=2.5)
        t_dec_title = Text("2. HÀM SỐ NGHỊCH BIẾN (GIẢM)", font_size=24, font=MAIN_FONT, weight=BOLD, color=RED_B)
        t_dec_math = MathTex(r"y' = f'(x) < 0, \\quad \\forall x \\in K", font_size=30, color=WHITE)
        t_dec_desc1 = Text("➜ Đồ thị đi XUỐNG từ trái sang phải (↘)", font_size=22, font=MAIN_FONT, color=RED_A)
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
        pill = RoundedRectangle(corner_radius=0.1, width=2.4, height=0.55, color=TEAL, fill_color=TEAL_E, fill_opacity=0.85)
        pill_txt = Text("VÍ DỤ MINH HỌA", font=MAIN_FONT, font_size=20, weight=BOLD, color=WHITE).move_to(pill)
        pill_group = VGroup(pill, pill_txt)
        title_lbl = Text("HÀM BẬC BA:", font=MAIN_FONT, font_size=22, weight=BOLD, color=YELLOW)
        title_math = MathTex(r"y = x^3 - 3x", font_size=24, color=YELLOW)
        title_txt = VGroup(title_lbl, title_math).arrange(RIGHT, buff=0.15)
        header_content = VGroup(pill_group, title_txt).arrange(RIGHT, buff=0.22).move_to(header_card)
        self.play(FadeIn(header_card), FadeIn(header_content), run_time=0.6)

        # 1. TOP CARD: MÔ PHỎNG ĐỒ THỊ & TIẾP TUYẾN CHUYỂN ĐỘNG
        top_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.4, color="#334155", fill_color="#0F172A", fill_opacity=0.95).next_to(header_card, DOWN, buff=0.2)
        top_title = Text("📈 ĐỒ THỊ & TIẾP TUYẾN CHUYỂN ĐỘNG", font=MAIN_FONT, font_size=22, weight=BOLD, color=TEAL_A).next_to(top_card.get_top(), DOWN, buff=0.18)

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
            dx = 0.42
            p1 = axes.c2p(t - dx, y - m * dx)
            p2 = axes.c2p(t + dx, y + m * dx)
            col = GREEN_C if m > 0.1 else (RED_C if m < -0.1 else YELLOW)
            return Line(p1, p2, color=col, stroke_width=4.0)

        tangent_line = always_redraw(get_tangent)

        def get_status_badge():
            t = t_param.get_value()
            m = 3 * (t**2) - 3
            if m > 0.1:
                txt, b_col, bg_col = "y' > 0 ➜ ĐỒNG BIẾN (↗)", GREEN_B, "#064E3B"
            elif m < -0.1:
                txt, b_col, bg_col = "y' < 0 ➜ NGHỊCH BIẾN (↘)", RED_B, "#7F1D1D"
            else:
                txt, b_col, bg_col = "y' = 0 ➜ TIẾP TUYẾN NGANG", YELLOW, "#78350F"
            lbl = Text(txt, font=MAIN_FONT, font_size=22, weight=BOLD, color=WHITE)
            rect = RoundedRectangle(corner_radius=0.1, width=max(5.2, lbl.width + 0.5), height=0.52, color=b_col, fill_color=bg_col, fill_opacity=0.9, stroke_width=1.8).move_to(lbl)
            return VGroup(rect, lbl).next_to(top_card.get_bottom(), UP, buff=0.16)

        status_badge = always_redraw(get_status_badge)

        self.play(Create(top_card), FadeIn(top_title), run_time=0.5)
        self.play(Create(axes), Write(axes_labels), Create(graph), FadeIn(graph_lbl), run_time=1.2)
        self.play(Create(lines_max), FadeIn(dot_max), FadeIn(lbl_max), Create(lines_min), FadeIn(dot_min), FadeIn(lbl_min), run_time=0.9)
        self.play(FadeIn(moving_dot), Create(tangent_line), FadeIn(status_badge), run_time=0.6)

        # 2. BOTTOM CARD: BẢNG BIẾN THIÊN 3 TẦNG RÕ RÀNG & KẾT LUẬN
        bottom_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.6, color="#334155", fill_color="#1E293B", fill_opacity=0.95).next_to(top_card, DOWN, buff=0.2)
        bot_title = Text("📊 BẢNG BIẾN THIÊN & KẾT LUẬN", font=MAIN_FONT, font_size=22, weight=BOLD, color=YELLOW).next_to(bottom_card.get_top(), DOWN, buff=0.18)

        calc_deriv = MathTex(r"y' = 3x^2 - 3 = 0 \\iff x = \\pm 1", font_size=26, color=WHITE)
        bbt = MathTex(
            r"""\\renewcommand{\\arraystretch}{1.35}
            \\begin{array}{|c|ccccccc|}
            \\hline
            x & -\\infty & & -1 & & 1 & & +\\infty \\\\
            \\hline
            y' & & + & 0 & - & 0 & + & \\\\
            \\hline
            & & & 2 & & & & +\\infty \\\\
            y & & \\nearrow & & \\searrow & & \\nearrow & \\\\
            & -\\infty & & & & -2 & & \\\\
            \\hline
            \\end{array}""",
            font_size=24, color=WHITE
        )

        t_res_inc = VGroup(
            Text("• y' > 0 ➜ Đồng biến trên:", font_size=22, font=MAIN_FONT, color=GREEN_B, weight=BOLD),
            MathTex(r"(-\\infty; -1) \\;\\text{và}\\; (1; +\\infty)", font_size=24, color=WHITE)
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
        # Nhịp điệu trực quan vừa phải: Dừng tại cực đại x=-1 và cực tiểu x=1 để học sinh quan sát đổi màu tiếp tuyến và dấu y'
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
        # PHẦN 4: CHỮA 2 CÂU ĐIỂN HÌNH TỪ TÀI LIỆU RAG NGUỒN (~38s)
        # ======================================================================
        qz_header_card = RoundedRectangle(corner_radius=0.15, width=8.4, height=1.1, color=BLUE_D, fill_color="#1E293B", fill_opacity=0.95).to_edge(UP, buff=0.35)
        qz_pill = RoundedRectangle(corner_radius=0.1, width=2.6, height=0.55, color=GOLD_E, fill_color=GOLD, fill_opacity=0.9)
        qz_pill_txt = Text("THỰC CHIẾN", font=MAIN_FONT, font_size=22, weight=BOLD, color=BLACK).move_to(qz_pill)
        qz_pill_group = VGroup(qz_pill, qz_pill_txt)
        qz_title_txt = Text("CHỮA ĐỀ THI THPTQG CHUẨN", font=MAIN_FONT, font_size=24, weight=BOLD, color=YELLOW)
        qz_header_content = VGroup(qz_pill_group, qz_title_txt).arrange(RIGHT, buff=0.25).move_to(qz_header_card)
        self.play(FadeIn(qz_header_card), FadeIn(qz_header_content), run_time=0.5)

        # 1. KHUNG TRÊN: CÂU 1 (ĐỌC BẢNG BIẾN THIÊN)
        c1_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.4, color="#334155", fill_color="#0F172A", fill_opacity=0.95).next_to(qz_header_card, DOWN, buff=0.2)
        c1_title = Text("CÂU 1: ĐỌC BẢNG BIẾN THIÊN", font=MAIN_FONT, font_size=22, weight=BOLD, color=TEAL_A).next_to(c1_card.get_top(), DOWN, buff=0.18)
        c1_quest = Text("Cho hàm số f(x) có bảng biến thiên như hình dưới:", font=MAIN_FONT, font_size=22, color=WHITE)

        c1_bbt = MathTex(
            r"""\\renewcommand{\\arraystretch}{1.3}
            \\begin{array}{|c|ccccccccc|}
            \\hline
            x & -\\infty & & -1 & & 0 & & 1 & & +\\infty \\\\
            \\hline
            f'(x) & & - & 0 & + & 0 & - & 0 & + & \\\\
            \\hline
            & +\\infty & & & & 0 & & & & +\\infty \\\\
            f(x) & & \\searrow & & \\nearrow & & \\searrow & & \\nearrow & \\\\
            & & & -1 & & & & -1 & & \\\\
            \\hline
            \\end{array}""",
            font_size=22, color=WHITE
        )

        c1_ask = Text("Hỏi: Hàm số đã cho đồng biến trên khoảng nào?", font=MAIN_FONT, font_size=22, color=YELLOW)
        optA = MathTex(r"A.\\; (-\\infty; -1)", font_size=22, color=WHITE)
        optB = MathTex(r"B.\\; (0; 1)", font_size=22, color=WHITE)
        optC = MathTex(r"C.\\; (-1; 1)", font_size=22, color=WHITE)
        optD = MathTex(r"D.\\; (-1; 0)", font_size=22, color=GREEN_B)
        opts_row = VGroup(optA, optB, optC, optD).arrange(RIGHT, buff=0.35)

        c1_sol = VGroup(
            Text("➜ f'(x) > 0 và đồ thị đi lên trên (-1; 0). Chọn", font=MAIN_FONT, font_size=22, color=GREEN_B, weight=BOLD),
            MathTex(r"\\mathbf{D}", font_size=24, color=GREEN)
        ).arrange(RIGHT, buff=0.15)

        c1_content = VGroup(c1_quest, c1_bbt, c1_ask, opts_row, c1_sol).arrange(DOWN, buff=0.18).move_to(c1_card).shift(DOWN * 0.22)
        fit_width(c1_content, 7.8)
        ans_c1_box = SurroundingRectangle(optD, color=GREEN, buff=0.14, corner_radius=0.1, stroke_width=2.5)

        self.play(Create(c1_card), FadeIn(c1_title), run_time=0.5)
        self.play(FadeIn(c1_quest), FadeIn(c1_bbt), FadeIn(c1_ask), run_time=1.3)
        self.play(FadeIn(opts_row), run_time=0.7)
        self.play(Write(c1_sol), Create(ans_c1_box), run_time=1.0)
        self.wait(1.0)

        # 2. KHUNG DƯỚI: CÂU 2 (XÉT DẤU ĐẠO HÀM)
        c2_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.6, color="#334155", fill_color="#1E293B", fill_opacity=0.95).next_to(c1_card, DOWN, buff=0.2)
        c2_title = Text("CÂU 2: XÉT DẤU ĐẠO HÀM", font=MAIN_FONT, font_size=22, weight=BOLD, color=YELLOW).next_to(c2_card.get_top(), DOWN, buff=0.18)
        c2_q1 = Text("Cho hàm số", font=MAIN_FONT, font_size=22, color=WHITE)
        c2_qm = MathTex(r"y = x^3 - 3x^2.", font_size=24, color=WHITE)
        c2_q2 = Text("Mệnh đề nào dưới đây đúng?", font=MAIN_FONT, font_size=22, color=WHITE)
        c2_quest = VGroup(VGroup(c2_q1, c2_qm).arrange(RIGHT, buff=0.15), c2_q2).arrange(DOWN, aligned_edge=LEFT, buff=0.1)

        c2_optA = MathTex(r"A.\\; \\text{Đồng biến trên } (0; 2)", font_size=22, color=WHITE)
        c2_optB = MathTex(r"B.\\; \\text{Nghịch biến trên } (0; 2)", font_size=22, color=GREEN_B)
        c2_optC = MathTex(r"C.\\; \\text{Nghịch biến trên } (-\\infty; 0)", font_size=22, color=WHITE)
        c2_opts = VGroup(c2_optA, c2_optB, c2_optC).arrange(DOWN, aligned_edge=LEFT, buff=0.12)

        step1 = MathTex(r"\\text{Bước 1: } y' = 3x^2 - 6x = 3x(x - 2)", font_size=24, color=LIGHT_GRAY)
        step2 = MathTex(r"\\text{Bước 2: } y' = 0 \\iff x = 0 \\quad\\text{hoặc}\\quad x = 2", font_size=24, color=LIGHT_GRAY)
        step3 = VGroup(
            Text("Bước 3 (Trong trái ngoài cùng, a = 3 > 0):", font=MAIN_FONT, font_size=22, color=YELLOW),
            MathTex(r"y' < 0 \\iff x \\in (0; 2)", font_size=24, color=WHITE)
        ).arrange(RIGHT, buff=0.15)

        c2_concl = VGroup(
            Text("➜ Hàm số nghịch biến trên (0; 2). Chọn", font=MAIN_FONT, font_size=22, color=GREEN_B, weight=BOLD),
            MathTex(r"\\mathbf{B}", font_size=24, color=GREEN)
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
        outro_header = Text("TỔNG KẾT BÍ KÍP ${config.topic.toUpperCase()}", font_size=30, weight=BOLD, color=YELLOW, font=MAIN_FONT)

        p1_title = Text("1. Dấu đạo hàm quyết định chiều biến thiên:", font_size=24, font=MAIN_FONT, color=TEAL_A, weight=BOLD)
        p1_desc = Text("• f'(x) > 0 ➜ Đồng biến (Đồ thị đi lên ↗)\\n• f'(x) < 0 ➜ Nghịch biến (Đồ thị đi xuống ↘)", font_size=22, font=MAIN_FONT, color=WHITE, line_spacing=1.2)
        b_p1 = VGroup(p1_title, p1_desc).arrange(DOWN, aligned_edge=LEFT, buff=0.15)

        p2_title = Text("2. Đọc Đồ thị & Bảng Biến Thiên:", font_size=24, font=MAIN_FONT, color=TEAL_A, weight=BOLD)
        p2_desc = Text("• Đọc chiều biến thiên theo hướng từ TRÁI sang PHẢI\\n• Luôn kết luận khoảng đơn điệu theo trục x", font_size=22, font=MAIN_FONT, color=WHITE, line_spacing=1.2)
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
6. TIÊU ĐỀ PILL BADGE: Sử dụng "VÍ DỤ MINH HỌA" hoặc "VÍ DỤ", TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
7. QUY TẮC NHỊP ĐỘ DIỄN HOẠT (PACING VỪA PHẢI, MƯỢT MÀ): Tại các điểm quan sát mấu chốt (tiếp tuyến đạt cực trị y'=0 đổi màu, bảng biến thiên xuất hiện, đóng khung kết luận), dừng vừa vặn self.wait(0.8) đến self.wait(1.0). TUYỆT ĐỐI KHÔNG dừng quá lâu (>1.2s - 1.5s) làm video bị đơ hoặc kéo dài lê thê.
8. Đóng đầy đủ ngoặc và lệnh construct(self). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim \${qualityFlag} scene.py MainScene\`, AI tuyệt đối không tự chạy lệnh render này).
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

  return `Đóng vai Chuyên gia Diễn hoạt Manim CE & Lập trình Python Sư phạm (chuẩn c1_HamSo_DonDieu.py).
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
2. Viết lại TOÀN BỘ file mã nguồn Manim Python (\`scene.py\`) từ đầu, kế thừa cấu trúc 5 PHÂN CẢNH CHUẨN MỰC:
   - Intro -> Lý thuyết 2 thẻ màu -> Dual-Zone Mô phỏng động tiếp tuyến đổi màu & BBT 3 tầng -> Chữa đề RAG (TỐI ĐA 2 CÂU) -> Thẻ Outro thương hiệu (giữ nguyên self.wait(1.5)).
3. Giữ vững quy chuẩn CHỐNG ĐÈ CHỮ (ZERO OVERLAP), áp dụng Khung Thẻ Container Dual-Zone lấp đầy 93% màn hình, dãn dòng \`line_spacing=1.2\`, gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ, font_size lớn rõ nét (Tiêu đề 28-32 BOLD, Thẻ 22-24, MathTex 24-30, Text tiếng Việt 20-22). BẮT BUỘC dùng font Sans-serif "Be Vietnam Pro" (hoặc "Inter"), TUYỆT ĐỐI KHÔNG dùng font Serif (Times New Roman) để chữ in đậm không bị răng cưa hay méo dấu tiếng Việt.
4. QUY TẮC CHỈ SỐ TRÊN/DƯỚI & PILL BADGE: 100% chỉ số trên/dưới dùng MathTex(r"..."), CẤM dùng unicode trong Text. Dùng "VÍ DỤ MINH HỌA" thay cho "VÍ DỤ GỐC".
5. NHỊP ĐỘ DIỄN HOẠT (PACING VỪA PHẢI, MƯỢT MÀ): Dừng vừa vặn self.wait(0.8) - self.wait(1.0) tại điểm mấu chốt, đổi màu tiếp tuyến và BBT, giữ Outro self.wait(1.5). TUYỆT ĐỐI KHÔNG dừng quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê.
6. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết lời chào hay giải thích ngoài mã.
7. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim \${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};
