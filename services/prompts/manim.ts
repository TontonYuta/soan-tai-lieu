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
2. TÊN ĐỀ BÀI & CÂU HỎI (QUY TẮC ƯU TIÊN 1 DÒNG & CHỐNG XUỐNG DÒNG VÔ TỘI VẠ):
   - Mọi câu hỏi, đề bài, dữ kiện và kết luận NGẮN (<= 14-16 từ hoặc <= 65 ký tự) BẮT BUỘC viết trên CÙNG 1 DÒNG DUY NHẤT. Tuyệt đối CẤM xuống dòng \n vô tội vạ hoặc chia nhỏ một câu ngắn thành nhiều mobject rồi arrange(DOWN) làm rớt dòng cụt lủn.
   - Nếu kết hợp chữ tiếng Việt và công thức MathTex: Nối ngang trên 1 dòng duy nhất bằng arrange(RIGHT, buff=0.12).
   - Chỉ xuống dòng khi đề bài THỰC SỰ DÀI (> 16 từ), và luôn gọi fit_width(group, 7.8) để tự động co tỷ lệ vừa khít khung thẻ.
   - Không viết hoa toàn bộ (ALL CAPS), chỉ dùng Sentence case.
3. TRÍCH XUẤT BÀI TOÁN & THỰC CHIẾN THEO TỪNG DẠNG BÀI (PRACTICE SECTION):
   - BẮT BUỘC trích xuất chính xác bài toán, câu hỏi, định nghĩa, định lý từ tài liệu RAG trên. Bám sát 100% câu từ, số liệu, giả thiết và kết luận trong tài liệu gốc. TUYỆT ĐỐI KHÔNG tự bịa nội dung khác!
   - NGUYÊN TẮC BẢO VỆ ZERO-OVERLAP: Để chữa nhiều câu (từ 2 đến 6+ câu tùy thời lượng), BẮT BUỘC phân chia thành các Dạng bài độc lập (mỗi dạng gồm 2 câu tiêu biểu: Top Card = Câu lẻ, Bottom Card = Câu chẵn). Khi chữa xong mỗi dạng bài, BẮT BUỘC gọi self.play(FadeOut(group), run_time=0.7) dọn sạch bảng trước khi chuyển sang dạng tiếp theo. TUYỆT ĐỐI KHÔNG để nhiều hơn 2 câu trên màn hình cùng lúc!
4. Trình bày lời giải sư phạm mạch lạc, đúng và đủ ý chính, phân tích bản chất sâu sắc.\n`;
};

export const MANIM_SKILLS_GUIDE = `
★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★XX
(Kế thừa Cấu trúc 5 Phân Cảnh Chuẩn Mực từ c1_HamSo_DonDieu.py, Hệ Thống Khung Thẻ Container Dual-Zone,
 Mô Phỏng Động ValueTracker + Tiếp Tuyến Đổi Màu, Bảng Biến Thiên 3 Tầng & Chống Đè Chữ Tuyệt Đối)

1. CẤU TRÚC PHÂN CẢNH CHUẨN MỰC (ADAPTIVE CINEMATIC FLOW, TỪ 60S ĐẾN 300S):
   - Mọi video bài giảng toán học chuẩn studio BẮT BUỘC chia thành 5 chương mạch lạc, co giãn linh hoạt theo thời lượng mục tiêu:
     * CHƯƠNG 1 - MỞ ĐẦU ẤN TƯỢNG (Intro, 7s - 20s):
       Pill Badge tên chuyên đề + Khung bao tiêu đề SurroundingRectangle + Phụ đề + Xem trước các công thức cốt lõi.
       Chuyển cảnh: FadeOut toàn bộ Intro để tránh đè chữ. TUYỆT ĐỐI KHÔNG đưa biểu tượng lên góc UL làm watermark!
     * CHƯƠNG 2 - LÝ THUYẾT CỐT LÕI VỚI CẶP THẺ MÀU TƯƠNG PHẢN (Theory Cards, 14s - 50s):
       Header đỉnh + Các Thẻ màu độc lập xếp dọc (Card 1 Xanh Emerald #064E3B cho tính chất khẳng định/đồng biến;
       Card 2 Đỏ Ruby #7F1D1D cho tính chất phủ định/nghịch biến, height=4.0-4.2 mỗi thẻ, width=8.4).
       Với video dài (>=180s - 300s), bổ sung thêm thẻ Vàng/Tím làm rõ các trường hợp đặc biệt và lưu ý bẫy đề thi. FadeOut toàn bộ.
     * CHƯƠNG 3 - DUAL-ZONE CONTAINER MÔ PHỎNG ĐỘNG TƯƠNG TÁC (Visual Simulation, 35s - 75s):
       - Header Bar cố định (height=1.1-1.3, width=8.4) với Pill Badge ("Ví dụ minh họa" hoặc "Ví dụ").
       - Top Card (height=6.4, width=8.4): Đồ thị Axes (x_length=7.2, y_length=4.0), đường cong axes.plot, cực trị gióng nét đứt.
         TIẾP TUYẾN CHUYỂN ĐỘNG CHUẨN HÓA ĐỘ DÀI VỚI ValueTracker + always_redraw: Tiếp tuyến tự động đổi màu theo hệ số góc (GREEN khi dốc lên, RED khi dốc xuống, YELLOW khi đi ngang), độ dài cố định trên màn hình L=0.85 (tổng chiều dài 1.7 unit), TUYỆT ĐỐI KHÔNG cắt ra ngoài viền thẻ!
         + THANH TRẠNG THÁI REAL-TIME (status_badge = always_redraw(...)) hiển thị trực tiếp y' > 0 / y' < 0 / y' = 0!
       - Bottom Card (height=6.6, width=8.4): Đạo hàm + BẢNG BIẾN THIÊN 3 TẦNG LATEX CHUẨN SGK (\\begin{array}{|c|ccccccc|})
         + Kết luận khoảng đơn điệu/cực trị đóng khung xanh SurroundingRectangle.
       - Cho ValueTracker trượt mượt mà qua các khoảng để học sinh quan sát đồ thị và BBT đồng thời. FadeOut toàn bộ.
     * CHƯƠNG 4 - BÀI TẬP VẬN DỤNG & CHỮA ĐỀ THỰC CHIẾN (Practice Section, 38s - 160s+):
       - Header Bar với Pill Badge ("Thực chiến").
       - QUY TẮC BẢO VỆ ZERO-OVERLAP TUYỆT ĐỐI (HỖ TRỢ TỪ 2 ĐẾN 6+ CÂU HỎI):
         + Video ngắn (<= 90s): 1 Dạng bài (2 câu tiêu biểu: Top Card = Câu 1, Bottom Card = Câu 2).
         + Video chuẩn (100s - 180s): 2 Dạng bài (3 - 4 câu tiêu biểu):
           • Dạng 1: Top Card = Câu 1, Bottom Card = Câu 2 -> self.play(FadeOut(part1_group)) dọn sạch màn hình!
           • Dạng 2: Top Card = Câu 3, Bottom Card = Câu 4 -> self.play(FadeOut(part2_group)) dọn sạch màn hình!
         + Video dài chuyên sâu (200s - 300s+): 3 Dạng bài (5 - 6 câu tiêu biểu):
           • Dạng 1 (Nhận biết & Thông hiểu): Câu 1 & Câu 2 -> FadeOut dọn sạch màn hình!
           • Dạng 2 (Vận dụng & Phân tích bẫy đề thi): Câu 3 & Câu 4 -> FadeOut dọn sạch màn hình!
           • Dạng 3 (Vận dụng cao & Phương pháp giải nhanh): Câu 5 & Câu 6 -> FadeOut dọn sạch màn hình!
       - NGUYÊN TẮC BẤT DI BẤT DỊCH: Mỗi màn hình chỉ hiển thị ĐÚNG 2 CÂU trên 2 thẻ (Top Card = Câu lẻ, Bottom Card = Câu chẵn). Khi giải xong mỗi dạng, BẮT BUỘC FadeOut toàn bộ để giải phóng 100% không gian trước khi chuyển sang dạng tiếp theo. Tuyệt đối không bao giờ để nhiều hơn 2 câu trên màn hình cùng một lúc!
     * CHƯƠNG 5 - TỔNG KẾT & OUTRO THƯƠNG HIỆU (Outro Card, 8s - 22s):
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

4. QUY CHUẨN TYPOGRAPHY & FONT CHỮ CÓ CHÂN (SERIF) LÀM MẶC ĐỊNH:
   - Font chữ Tiếng Việt: MẶC ĐỊNH sử dụng font chữ có chân (Serif) trang trọng, chuẩn mực sách giáo khoa và các tạp chí toán học: "Times New Roman" (hoặc "Liberation Serif").
   - Nếu người dùng chỉ định font không chân (Sans-Serif): Sử dụng "Be Vietnam Pro" (hoặc "Inter").
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

10. QUY TẮC ĐỒNG BỘ THỜI GIAN ÂM THANH (TTS) & HOẠT HỌA MANIM (TTS-ANIMATION SYNC, TỪ 60S ĐẾN 300S):
   - Tốc độ đọc tự nhiên của giọng đọc AI: ~2.8 - 3.0 từ/giây (160 - 180 từ/phút).
   - Dung lượng kịch bản VOICEOVER_SCRIPT phải tương ứng: Số từ ≈ Thời lượng (giây) × 2.85.
     * Video 60s: ~170 từ.
     * Video 90s: ~255 từ.
     * Video 120s: ~340 từ.
     * Video 180s: ~510 từ.
     * Video 300s (5 Phút Chuyên Sâu): ~855 từ (Đầy đủ mở bài, phân tích lý thuyết, mô phỏng chuyên sâu và các dạng bài thực chiến giải 6+ bài tập).
   - Khớp nối phân cảnh chuẩn mực (Animation Duration ≈ Voiceover Duration):
     * Cảnh 1 (Intro): ~7s - 15s.
     * Cảnh 2 (Lý thuyết): ~14s - 45s.
     * Cảnh 3 (Mô phỏng động / Dual-Zone): ~35s - 75s.
     * Cảnh 4 (Bài tập thực chiến theo từng dạng bài): ~38s - 150s+ (Mỗi dạng 2 câu chiếm ~40s - 50s).
     * Cảnh 5 (Outro): ~8s - 20s.
   - Trong code Manim, tổng run_time của self.play(...) cộng với self.wait(...) ở mỗi phân cảnh phải khớp với thời gian đọc của phân cảnh đó để video kết thúc cùng lúc với giọng đọc.

11. QUY TẮC TUYỆT ĐỐI KHÔNG IN HOA (NO ALL CAPS - CHUẨN CHÍNH TẢ TIẾNG VIỆT):
    - TUYỆT ĐỐI KHÔNG viết hoa toàn bộ (ALL CAPS) ở tiêu đề chính, tên bài học, tên phân cảnh, pill badges, tiêu đề thẻ hay đề bài câu hỏi.
    - BẮT BUỘC dùng chữ thường chuẩn ngữ pháp Tiếng Việt (Sentence case: chỉ viết hoa chữ cái đầu câu và danh từ riêng/tên viết tắt như Oxy, THPT, SGK).
    - Ví dụ chuẩn đẹp:
      * Đúng: "Khảo sát sự biến thiên của hàm số", "Ví dụ minh họa", "Thực chiến", "Câu 1: Đọc bảng biến thiên", "Bảng biến thiên & kết luận", "Tổng kết bí kíp".
      * Sai (CẤM): "KHẢO SÁT SỰ BIẾN THIÊN", "VÍ DỤ MINH HỌA", "THỰC CHIẾN", "CÂU 1: ĐỌC BẢNG BIẾN THIÊN", "BẢNG BIẾN THIÊN & KẾT LUẬN".

12. QUY TẮC BOX BỌC TEXT CHỨA VỪA KHÍT NỘI DUNG (SNUG & RESPONSIVE BOXES):
    - Mọi khung viền bao quanh (SurroundingRectangle, RoundedRectangle, Pill Badges, Callout Boxes, Answer Boxes) BẮT BUỘC phải đủ rộng để chứa vừa khít text bên trong:
      * Không để text tràn ra ngoài viền, không để chữ chạm sát mép viền, cũng không để box quá rộng trống trải lãng phí diện tích.
      * Với khung viền bao quanh: BẮT BUỘC dùng SurroundingRectangle(target_mob, buff=0.15, corner_radius=0.12, stroke_width=2.5). Thuộc tính buff=0.15 tự động co giãn ôm vừa khít mọi kích thước của text/công thức!
      * Với huy hiệu Pill Badge: Tính chiều rộng động theo text:
        rect = RoundedRectangle(corner_radius=0.12, width=max(2.4, text.width + 0.5), height=text.height + 0.28, ...)
      * Luôn gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ trước khi đóng khung viền.

13. QUY TẮC BỐ CỤC 4 ĐÁP ÁN TRẮC NGHIỆM LIỀN KHỐI (CHỐNG LỖI CHỮ A. ĐỨNG RIÊNG 1 DÒNG):
    - QUY TẮC LIỀN KHỐI BẮT BUỘC (ATOMIC OPTION ITEM):
      * MỖI ĐÁP ÁN A, B, C, D BẮT BUỘC PHẢI LÀ MỘT KHỐI NGUYÊN VẸN NẰM TRÊN CÙNG 1 HÀNG.
      * Dạng công thức/khoảng nghiệm/số: BẮT BUỘC viết chung nhãn và giá trị trong 1 MathTex duy nhất:
        optA = MathTex(r"\mathbf{A.}\; (-1; 0)", font_size=22)
        optB = MathTex(r"\mathbf{B.}\; (0; 1)", font_size=22)
        optC = MathTex(r"\mathbf{C.}\; (1; 2)", font_size=22)
        optD = MathTex(r"\mathbf{D.}\; (-1; 1)", font_size=22)
      * Dạng câu chữ tiếng Việt: BẮT BUỘC ghép nhãn và câu bằng arrange(RIGHT, buff=0.12, aligned_edge=DOWN):
        optA = VGroup(Text("A.", font=MAIN_FONT, font_size=22, weight=BOLD), Text("Đồng biến trên (0; 2)", font=MAIN_FONT, font_size=22)).arrange(RIGHT, buff=0.12, aligned_edge=DOWN)
      * TUYỆT ĐỐI CẤM:
        - CẤM arrange(DOWN) giữa chữ cái nhãn A/B/C/D và nội dung đáp án!
        - CẤM chèn dấu xuống dòng \n sau chữ cái nhãn (như Text("A.\n...")) làm chữ cái đứng cô độc 1 dòng rồi nội dung mới rớt xuống dòng dưới!
    - BỐ CỤC 4 ĐÁP ÁN THÍCH ỨNG THEO ĐỘ RỘNG:
      * DẠNG 4x1 (1 hàng ngang gồm 4 đáp án): Áp dụng khi 4 đáp án đều NGẮN (<= 8 ký tự, ví dụ: A. 1; B. 2; C. 3; D. 4):
        opts_group = VGroup(optA, optB, optC, optD).arrange(RIGHT, buff=0.4)
      * DẠNG 2x2 (2 hàng x 2 cột - KHÓA 2 CỘT THẲNG TẮP, TUYỆT ĐỐI KHÔNG LỆCH CỘT): Áp dụng khi đáp án có độ dài trung bình (khoảng nghiệm, tọa độ điểm).
        BẮT BUỘC nhóm theo 2 cột dọc để A thẳng hàng trên C, B thẳng hàng trên D:
        col1 = VGroup(optA, optC).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        col2 = VGroup(optB, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        opts_group = VGroup(col1, col2).arrange(RIGHT, buff=0.8, aligned_edge=UP)
      * DẠNG 1x4 (4 hàng dọc): Áp dụng khi các đáp án DÀI (chứa câu chữ định lý nhiều từ):
        opts_group = VGroup(optA, optB, optC, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.14)
    - Hộp khoanh đáp án đúng: ans_box = SurroundingRectangle(opt_correct, color=GREEN, buff=0.12, corner_radius=0.08, stroke_width=2.5) ôm vừa khít đáp án đúng! Khoảng cách giữa các đáp án luôn >= 0.35 để viền xanh không bao giờ chạm vào chữ của đáp án bên cạnh.

14. QUY TẮC TIẾP TUYẾN ĐỒ THỊ CHUẨN MỰC (THEO c1_HamSo_DonDieu.py):
    - Khi vẽ tiếp tuyến trượt trên đồ thị (ValueTracker + always_redraw), sử dụng công thức tiếp tuyến đơn giản, trực quan và chạy ổn định 100% từ c1_HamSo_DonDieu.py:
      def get_tangent():
          t = t_param.get_value()
          y = f_func(t)
          m = 3 * (t**2) - 3  # Đạo hàm f'(t)
          dx = 0.38
          p1 = axes.c2p(t - dx, y - m * dx)
          p2 = axes.c2p(t + dx, y + m * dx)
          col = GREEN_C if m > 0.1 else (RED_C if m < -0.1 else YELLOW)
          return Line(p1, p2, color=col, stroke_width=4.0)
    - Chọn dx = 0.35 đến 0.40 gọn gàng để độ dài tiếp tuyến vừa vặn, hiển thị đẹp và tự nhiên mà không cần các phép toán vector phức tạp.

15. QUY TẮC ƯU TIÊN 1 DÒNG (SINGLE-LINE FIRST) & CHỐNG XUỐNG DÒNG VÔ TỘI VẠ:
    - MỌI NỘI DUNG NGẮN (<= 14-16 từ hoặc <= 65 ký tự) BẮT BUỘC TRÌNH BÀY TRÊN CÙNG 1 DÒNG DUY NHẤT (kế thừa chuẩn mực từ c1_HamSo_DonDieu.py):
      * Đề bài câu hỏi ngắn:
        c2_quest = Text("Cho hàm số y = x³ - 3x². Mệnh đề nào dưới đây đúng?", font=MAIN_FONT, font_size=22, color=WHITE)
        (Nếu kết hợp MathTex: VGroup(Text("Cho hàm số"), MathTex(r"y = x^3 - 3x^2."), Text("Mệnh đề nào dưới đây đúng?")).arrange(RIGHT, buff=0.12))
      * Câu hỏi đọc hình/bảng:
        c1_ask = Text("Hỏi: Hàm số đã cho đồng biến trên khoảng nào?", font=MAIN_FONT, font_size=22, color=YELLOW)
      * Từng bước giải đại số / xét dấu:
        step1 = MathTex(r"\text{Bước 1: } y' = 3x^2 - 6x = 3x(x - 2)", font_size=24, color=LIGHT_GRAY)
        step2 = MathTex(r"\text{Bước 2: } y' = 0 \iff x = 0 \quad\text{hoặc}\quad x = 2", font_size=24, color=LIGHT_GRAY)
      * Bước giải có nhãn tiếng Việt + MathTex: Nối ngang arrange(RIGHT, buff=0.15) trên 1 dòng:
        step3 = VGroup(Text("Bước 3 (Trong trái ngoài cùng, a = 3 > 0):", font_size=22), MathTex(r"y' < 0 \iff x \in (0; 2)", font_size=24)).arrange(RIGHT, buff=0.15)
      * Kết luận và khoanh đáp án:
        c2_concl = VGroup(Text("➜ Hàm số nghịch biến trên (0; 2). Chọn", font_size=22), MathTex(r"\mathbf{B}", font_size=24)).arrange(RIGHT, buff=0.15)
      * Từng dòng lý thuyết thẻ màu:
        Text("➜ Đồ thị đi LÊN từ trái sang phải (↗)", font_size=22)
    - TUYỆT ĐỐI CẤM (ANTI-PATTERNS):
      * CẤM ngắt dòng \n sau các cụm từ ngắn (như "Cho hàm số\n", "Hỏi:\n", "Tính đạo hàm\n", "Mệnh đề nào\ndưới đây đúng?").
      * CẤM dùng arrange(DOWN) để chia nhỏ một câu ngắn thành nhiều dòng xếp chồng lên nhau làm lãng phí chiều cao thẻ.
      * CẤM tách riêng nhãn và nội dung kết luận (như để "Đồng biến trên:" ở dòng 1, rồi khoảng nghiệm rớt xuống dòng 2).
    - NGUYÊN TẮC BẢO VỆ: Chỉ ngắt xuống dòng khi câu thực sự dài (> 16 từ), và luôn gọi fit_width(group, 7.8) để tự động co tỷ lệ vừa khít khung thẻ!
`;

export const getFontDirective = (fontStyle?: string): string => {
  if (fontStyle === 'sans') return 'Be Vietnam Pro';
  return 'Times New Roman'; // Mặc định: Font chữ có chân (Serif)
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
Bố cục Khung Thẻ Chuẩn: Intro -> Lý thuyết (2 thẻ màu độc lập) -> Dual-Zone Mô phỏng động tương tác & Bảng phân tích -> Bài tập thực chiến theo từng dạng bài -> Thẻ Outro Thương Hiệu.`;
  }
};

export const parseDurationToSeconds = (durationStr?: string, defaultSec: number = 110): number => {
  if (!durationStr) return defaultSec;
  const str = durationStr.toLowerCase().trim();

  // Pattern like "100 - 120 giây", "3 - 5 phút", "100-120s"
  const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:-|đến|to)\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      const avg = (min + max) / 2;
      if (str.includes('phút') || str.includes('phut') || str.includes('min') || str.includes('m')) {
        return Math.round(avg * 60);
      }
      return Math.round(avg);
    }
  }

  // Pattern like "300s", "300 giây", "300 giay", "300 sec"
  const secMatch = str.match(/(\d+)\s*(?:giây|giay|sec|s\b)/);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    if (!isNaN(secs) && secs > 0) return secs;
  }

  // Pattern like "5 phút", "5 phut", "5 mins", "5m"
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:phút|phut|min|m\b)/);
  if (minMatch) {
    const mins = parseFloat(minMatch[1]);
    if (!isNaN(mins) && mins > 0) return Math.round(mins * 60);
  }

  // Just number like "300"
  const numOnlyMatch = str.match(/^(\d+)$/);
  if (numOnlyMatch) {
    const n = parseInt(numOnlyMatch[1], 10);
    if (!isNaN(n) && n > 0) return n;
  }

  return defaultSec;
};

export const getExerciseAndRoundPlan = (durationSec: number, requestedExerciseCount?: number) => {
  let exerciseCount = requestedExerciseCount && requestedExerciseCount > 0 ? requestedExerciseCount : 0;
  if (!exerciseCount) {
    if (durationSec <= 90) {
      exerciseCount = 2;
    } else if (durationSec <= 170) {
      exerciseCount = 4;
    } else if (durationSec <= 260) {
      exerciseCount = 6;
    } else {
      exerciseCount = 6;
    }
  }
  const roundCount = Math.max(1, Math.ceil(exerciseCount / 2));
  return { exerciseCount, roundCount };
};

// =========================================================================
// LƯỢT 1: PROMPT XÂY DỰNG KỊCH BẢN PHÂN CẢNH & LỜI THOẠI (STORYBOARD PROMPT)
// =========================================================================
export const generateManimStoryboardPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const approxSeconds = parseDurationToSeconds(config.duration, isVertical ? 110 : 120);
  const targetDurationStr = config.duration || `${approxSeconds} giây`;
  const targetWords = Math.round(approxSeconds * 2.85);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragSection = sanitizeAndExtractRag(config.attachedPdf);
  const imageSection = extractAttachedImageDirective(config.attachedImage);

  const { exerciseCount, roundCount } = getExerciseAndRoundPlan(approxSeconds, config.exerciseCount);

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
  const approxSeconds = parseDurationToSeconds(config.duration, isVertical ? 110 : 120);
  const targetDurationStr = config.duration || `${approxSeconds} giây`;
  const targetWords = Math.round(approxSeconds * 2.85);
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragSection = sanitizeAndExtractRag(config.attachedPdf);
  const imageSection = extractAttachedImageDirective(config.attachedImage);

  const { exerciseCount, roundCount } = getExerciseAndRoundPlan(approxSeconds, config.exerciseCount);

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
     * TUYỆT ĐỐI CẤM ngắt dòng \n vô tội vạ hoặc chia nhỏ một câu ngắn thành nhiều mobject rồi arrange(DOWN) làm rớt dòng cụt lủn.
     * Nếu kết hợp chữ tiếng Việt và công thức MathTex: Nối ngang trên 1 dòng duy nhất bằng arrange(RIGHT, buff=0.12).
     * Chỉ xuống dòng khi đề bài THỰC SỰ DÀI (> 16 từ), và luôn gọi fit_width(group, 7.8) để tự động co tỷ lệ vừa khít khung thẻ.
   - TUYỆT ĐỐI KHÔNG viết hoa toàn bộ (ALL CAPS) ở bất kỳ đâu: Tiêu đề Intro, tên phân cảnh, pill badges, tiêu đề thẻ, đề bài và kết luận.
   - BẮT BUỘC dùng Sentence case (chỉ viết hoa chữ cái đầu và danh từ riêng như Oxy, THPT, SGK): Ví dụ "Khảo sát sự biến thiên của hàm số", "Ví dụ minh họa", "Thực chiến", "Câu 1: Đọc bảng biến thiên", "Tổng kết bí kíp".
   - Tên chủ đề Intro: Ngắt dòng \n cân đối nếu quá dài (> 35 ký tự), dùng alignment="CENTER", sau arrange BẮT BUỘC gọi for item in intro_group: item.set_x(0) để căn giữa đối xứng tuyệt đối trục X=0.
   - Khái niệm, lý thuyết: Trình bày chuẩn xác theo tài liệu PDF đính kèm (RAG), không tự ý suy diễn hay viết chung chung.
   - Tuyệt đối KHÔNG dùng từ ngữ giật gân, sáo rỗng hay cường điệu phong cách AI.
6. QUY TẮC BOX BỌC TEXT CHỨA VỪA KHÍT NỘI DUNG (SNUG & RESPONSIVE BOXES):
   - Khung viền bao quanh (SurroundingRectangle): BẮT BUỘC dùng buff=0.12-0.15, corner_radius=0.12 để viền ôm sát vừa khít văn bản/công thức, không tràn viền, không chạm sát chữ, không quá rộng lãng phí.
   - Thẻ huy hiệu Pill Badge: Tính chiều rộng động rect = RoundedRectangle(corner_radius=0.12, width=max(2.2, text.width + 0.5), height=text.height + 0.28).
   - Luôn gọi fit_width(group, 7.8) trước khi đóng khung viền.
7. QUY TẮC BỐ CỤC 4 ĐÁP ÁN TRẮC NGHIỆM LIỀN KHỐI (CHỐNG LỖI CHỮ A. ĐỨNG RIÊNG 1 DÒNG):
   - MỖI ĐÁP ÁN A, B, C, D BẮT BUỘC PHẢI LÀ MỘT KHỐI NGUYÊN VẸN NẰM TRÊN CÙNG 1 HÀNG.
   - Viết chung nhãn và giá trị: MathTex(r"\mathbf{A.}\; ...") hoặc VGroup(Text("A."), Text("...")).arrange(RIGHT, buff=0.12, aligned_edge=DOWN). TUYỆT ĐỐI CẤM arrange(DOWN) giữa nhãn và đáp án, CẤM chèn \n sau nhãn.
   - Tùy độ dài thực tế của 4 đáp án để bố trí theo 1 trong 3 dạng:
     * DẠNG 4x1: Khi 4 đáp án đều NGẮN (<= 8 ký tự, số hoặc biến): VGroup(optA, optB, optC, optD).arrange(RIGHT, buff=0.35).
     * DẠNG 2x2 (KHÓA 2 CỘT THẲNG TẮP, CHỐNG LỆCH HÀNG ZÍC-ZẮC): Khi 4 đáp án có ĐỘ DÀI TRUNG BÌNH (khoảng nghiệm, tọa độ). BẮT BUỘC:
       col1 = VGroup(optA, optC).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
       col2 = VGroup(optB, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
       VGroup(col1, col2).arrange(RIGHT, buff=0.8, aligned_edge=UP)
     * DẠNG 1x4: Khi đáp án DÀI (chứa câu chữ văn bản, định lý): VGroup(optA, optB, optC, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.14).
   - Hộp khoanh đáp án: SurroundingRectangle(opt_correct, color=GREEN, buff=0.12, corner_radius=0.08, stroke_width=2.5) ôm vừa khít đáp án đúng!
8. QUY CHUẨN TYPOGRAPHY & FONT CHỮ CHUẨN MỰC:
   - Sử dụng font="${chosenFont}" cho mọi đối tượng Text. ${chosenFont === 'Times New Roman' ? 'Mặc định ưu tiên font có chân (Times New Roman / Liberation Serif) thanh lịch, chuẩn mực tài liệu toán học và giáo khoa.' : 'Sử dụng font không chân (Be Vietnam Pro) hiện đại, sắc nét.'}
   - Tiêu đề 28-32 BOLD, Tiêu đề Thẻ 22-24 BOLD, Công thức MathTex 24-30, Chú thích tiếng Việt 20-22. CẤM font_size < 20!
   - line_spacing=1.2 cho các đoạn Text nhiều dòng.
9. QUY TẮC CHỈ SỐ TRÊN/DƯỚI & TIÊU ĐỀ PILL BADGE:
   - 100% công thức chứa số mũ (x^2, x^3), chỉ số dưới (x_0, x_1), đạo hàm (y') BẮT BUỘC dùng MathTex(r"..."). TUYỆT ĐỐI CẤM dùng ký tự unicode mũ (x², x³, x₁, x₀) trong Text(...).
   - Tiêu đề Pill Badge: Dùng "Ví dụ minh họa" hoặc "Ví dụ", TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
10. MÔ PHỎNG TIẾP TUYẾN ĐỘNG (THEO c1_HamSo_DonDieu.py), BẢNG BIẾN THIÊN 3 TẦNG & PACING VỪA PHẢI:
    - ValueTracker + always_redraw cho tiếp tuyến đổi màu (Xanh/Đỏ/Vàng) và thanh trạng thái status_badge real-time.
    - TIẾP TUYẾN CHUẨN MỰC THEO c1_HamSo_DonDieu.py: dx = 0.38; p1 = axes.c2p(t - dx, y - m * dx); p2 = axes.c2p(t + dx, y + m * dx). Gọn gàng, vừa vặn thẻ, không cần vector phức tạp!
    - PACING & NHỊP ĐỘ DỨT KHOÁT: Dừng nhẹ nhàng vừa đủ tại điểm mấu chốt (self.wait(0.8) đến self.wait(1.0) khi đổi màu tiếp tuyến, xuất hiện BBT, đóng khung đáp án). Tuyệt đối không dừng quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê.
    - Bảng Biến Thiên 3 tầng chuẩn mực SGK Việt Nam: MathTex(r"\begin{array}{|c|ccccccc|} ... \end{array}", font_size=24).
11. QUY TẮC SỬ DỤNG HÌNH ẢNH MINH HỌA (ImageMobject - CHỐNG CRASH 100%):
    - Khi có ảnh đính kèm (hoặc khi cần chèn ảnh minh họa): BẮT BUỘC dùng ImageMobject(r"...").
    - TUYỆT ĐỐI CẤM thêm ImageMobject vào VGroup(...) (sẽ crash TypeError!). BẮT BUỘC dùng Group(...) thay cho VGroup(...) khi có chứa ImageMobject.
    - Luôn co tỷ lệ vừa vặn thẻ: img.scale_to_fit_width(4.5) và đóng khung viền bo tròn SurroundingRectangle(img, buff=0.08, color=TEAL_A, corner_radius=0.15).
12. 100% CÔNG THỨC LATEX HOÀN HẢO (PERFECT LATEX):
    - MỌI công thức dùng MathTex(r"...") với raw string. Đóng khung đáp số: SurroundingRectangle(result, color=GREEN, buff=0.16).
13. Màu nền: "#0B1120".
14. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết bất kỳ lời chào hay giải thích ngoài mã.
15. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim \${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};

// =========================================================================
// PROMPT TỔNG HỢP TINH GỌN (CHO CẢ 1-CLICK TỰ ĐỘNG & SAO CHÉP THỦ CÔNG)
// =========================================================================
export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-qh' : config.renderQuality === '4k' ? '-qk' : '-ql';
  const approxSeconds = parseDurationToSeconds(config.duration, isVertical ? 110 : 120);
  const targetDurationStr = config.duration || `${approxSeconds} giây`;
  const targetWords = Math.round(approxSeconds * 2.85);
  const chosenFont = getFontDirective(config.fontStyle);
  const simDesc = getSimulationModeDescription(config.simulationMode);
  const ragPromptChunk = sanitizeAndExtractRag(config.attachedPdf);
  const imagePromptChunk = extractAttachedImageDirective(config.attachedImage);
  const { exerciseCount, roundCount } = getExerciseAndRoundPlan(approxSeconds, config.exerciseCount);

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

        # Tiêu đề chủ đề: Dàn đều, Sentence case (không in hoa toàn bộ), căn giữa trục tọa độ X=0
        clean_topic = "${config.topic}"
        intro_title = Text(clean_topic, font_size=28, weight=BOLD, color=YELLOW, line_spacing=1.2, font=MAIN_FONT, alignment="CENTER")
        intro_box = SurroundingRectangle(intro_title, buff=0.15, color=BLUE_C, corner_radius=0.12, stroke_width=2.5)

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
        pill_txt = Text("Ví dụ minh họa", font=MAIN_FONT, font_size=20, weight=BOLD, color=WHITE)
        pill = RoundedRectangle(corner_radius=0.12, width=max(2.2, pill_txt.width + 0.5), height=pill_txt.height + 0.28, color=TEAL, fill_color=TEAL_E, fill_opacity=0.85).move_to(pill_txt)
        pill_group = VGroup(pill, pill_txt)
        title_lbl = Text("Hàm bậc ba:", font=MAIN_FONT, font_size=22, weight=BOLD, color=YELLOW)
        title_math = MathTex(r"y = x^3 - 3x", font_size=24, color=YELLOW)
        title_txt = VGroup(title_lbl, title_math).arrange(RIGHT, buff=0.15)
        header_content = VGroup(pill_group, title_txt).arrange(RIGHT, buff=0.22).move_to(header_card)
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
            if m > 0.1:
                txt, b_col, bg_col = "y' > 0 ➜ Đồng biến (↗)", GREEN_B, "#064E3B"
            elif m < -0.1:
                txt, b_col, bg_col = "y' < 0 ➜ Nghịch biến (↘)", RED_B, "#7F1D1D"
            else:
                txt, b_col, bg_col = "y' = 0 ➜ Tiếp tuyến nằm ngang", YELLOW, "#78350F"
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
        qz_pill_txt = Text("Thực chiến", font=MAIN_FONT, font_size=22, weight=BOLD, color=BLACK)
        qz_pill = RoundedRectangle(corner_radius=0.12, width=max(2.2, qz_pill_txt.width + 0.5), height=qz_pill_txt.height + 0.28, color=GOLD_E, fill_color=GOLD, fill_opacity=0.9).move_to(qz_pill_txt)
        qz_pill_group = VGroup(qz_pill, qz_pill_txt)
        qz_title_txt = Text("Chữa đề thi THPT Quốc gia", font=MAIN_FONT, font_size=24, weight=BOLD, color=YELLOW)
        qz_header_content = VGroup(qz_pill_group, qz_title_txt).arrange(RIGHT, buff=0.25).move_to(qz_header_card)
        self.play(FadeIn(qz_header_card), FadeIn(qz_header_content), run_time=0.5)

        # 1. KHUNG TRÊN: CÂU 1 (ĐỌC BẢNG BIẾN THIÊN - MINH HỌA BỐ CỤC 4x1 KHI ĐÁP ÁN NGẮN)
        c1_card = RoundedRectangle(corner_radius=0.2, width=8.4, height=6.4, color="#334155", fill_color="#0F172A", fill_opacity=0.95).next_to(qz_header_card, DOWN, buff=0.2)
        c1_title = Text("Câu 1: Đọc bảng biến thiên", font=MAIN_FONT, font_size=22, weight=BOLD, color=TEAL_A).next_to(c1_card.get_top(), DOWN, buff=0.18)
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
        outro_header = Text("Tổng kết bí kíp ${config.topic}", font_size=28, weight=BOLD, color=YELLOW, font=MAIN_FONT)

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
6. TIÊU ĐỀ PILL BADGE: Sử dụng "Ví dụ minh họa" hoặc "Ví dụ" (Sentence case chuẩn tiếng Việt), TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
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
   - QUY TẮC ƯU TIÊN 1 DÒNG (SINGLE-LINE FIRST) & CHỐNG XUỐNG DÒNG VÔ TỘI VẠ: Mọi đề bài, câu hỏi, dữ kiện và kết luận NGẮN (<= 14-16 từ) BẮT BUỘC viết trên CÙNG 1 DÒNG DUY NHẤT, CẤM ngắt dòng \n vô tội vạ hoặc chia nhỏ một câu ngắn với arrange(DOWN). Nối ngang bằng arrange(RIGHT, buff=0.12).
   - Khung viền SurroundingRectangle(buff=0.12-0.15) ôm vừa khít nội dung, không tràn và không quá thừa.
   - TIẾP TUYẾN CHUẨN MỰC (c1_HamSo_DonDieu.py): dx = 0.38; p1 = axes.c2p(t - dx, y - m * dx); p2 = axes.c2p(t + dx, y + m * dx). Gọn gàng, vừa vặn thẻ, không cần vector phức tạp.
   - BỐ CỤC 4 ĐÁP ÁN LIỀN KHỐI: Mọi đáp án A, B, C, D là khối nguyên vẹn trên 1 hàng (MathTex(r"\mathbf{A.}\; ..."), CẤM chữ A. đứng riêng 1 dòng). Bố trí dạng 4x1 (ngắn <= 8 ký tự), dạng 2x2 KHÓA 2 CỘT THẲNG TẮP (trung bình), hoặc dạng 1x4 (dài). ans_box = SurroundingRectangle(opt, buff=0.12) vừa khít đáp án đúng.
5. QUY TẮC CHỈ SỐ TRÊN/DƯỚI & PILL BADGE: 100% chỉ số trên/dưới dùng MathTex(r"..."), CẤM dùng unicode trong Text. Dùng "Ví dụ minh họa" hoặc "Ví dụ", TUYỆT ĐỐI KHÔNG dùng "VÍ DỤ GỐC".
6. NHỊP ĐỘ DIỄN HOẠT (PACING VỪA PHẢI, MƯỢT MÀ): Dừng vừa vặn self.wait(0.8) - self.wait(1.0) tại điểm mấu chốt, đổi màu tiếp tuyến và BBT, giữ Outro self.wait(1.5). TUYỆT ĐỐI KHÔNG dừng quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê.
7. TUYỆT ĐỐI CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ PYTHON trong \`\`\`python ... \`\`\`, không viết lời chào hay giải thích ngoài mã.
8. TUYỆT ĐỐI KHÔNG sử dụng bất kỳ công cụ hay tool lệnh nào (không run_command, không write_to_file). (Hệ thống máy chủ sẽ tự biên dịch mã bằng lệnh: \`manim \${qualityFlag} scene.py MainScene\`, AI không được tự chạy lệnh này).`;
};
