import { VideoConfig } from "../../types";

export const generateVideoScriptPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';

  let hookGuide = "";
  if (config.hookType === 'trap') {
    hookGuide = `
- **CHIẾN LƯỢC ĐẶT VẤN ĐỀ VỀ SAI LẦM THƯỜNG GẶP:**
  * Bắt đầu bằng lỗi sai phổ biến mà nhiều học sinh hay mắc phải trong bài thi (ví dụ: quên điều kiện xác định, nhầm dấu khi đổi biến, ngộ nhận tính đơn điệu).
  * Câu thoại mở đầu: Cảnh báo trực diện, đi thẳng vào trọng tâm ("Chú ý lỗi sai này! Rất nhiều bạn mất điểm đáng tiếc ở bước xét điều kiện sau đây!").`;
  } else if (config.hookType === 'fast_trick') {
    hookGuide = `
- **CHIẾN LƯỢC MỞ ĐẦU BẰNG PHƯƠNG PHÁP GIẢI NHANH 30S:**
  * Bắt đầu bằng bài toán có vẻ phức tạp khiến học sinh nản lòng, rồi mở ra hướng tư duy ngắn gọn trong 30 giây (kỹ thuật bấm máy tính, loại trừ đáp án, phương pháp hình học hóa).
  * Câu thoại mở đầu: Tự tin và khơi gợi tư duy ("Bài toán này trông dài nhưng nếu nhìn theo bản chất hình học, ta xử lý được ngay chỉ trong 30 giây!").`;
  } else if (config.hookType === 'real_world') {
    hookGuide = `
- **CHIẾN LƯỢC MỞ ĐẦU BẰNG ỨNG DỤNG THỰC TẾ & HIỆN TƯỢNG:**
  * Mở đầu bằng một hiện tượng đời sống, công trình kiến trúc hoặc quy luật tự nhiên gắn liền với bài học.
  * Câu thoại mở đầu: Truyền cảm hứng và gắn với thực tiễn ("Tại sao nhịp cầu treo lại có dạng đường cong parabol? Bản chất toán học nằm ngay ở đây!").`;
  } else {
    hookGuide = `
- **CHIẾN LƯỢC MỞ ĐẦU TRỰC QUAN HÓA BẢN CHẤT TỪ ĐẦU:**
  * Mở đầu bằng hình ảnh trực quan hoặc câu hỏi kích thích tư duy ("Ý nghĩa hình học thực sự của đạo hàm là gì? Hãy quan sát tiếp tuyến chuyển động trên đồ thị này!").
  * Dẫn dắt người học từ trực quan sinh động đến nhận thức lý thuyết vững vàng.`;
  }

  let pdfPromptChunk = "";
  if (config.attachedPdf?.text) {
    pdfPromptChunk = `
[TÀI LIỆU PDF ĐÍNH KÈM (RAG CONTENT)]:
File đính kèm: ${config.attachedPdf.fileName} (${config.attachedPdf.numPages} trang)
Nội dung bài toán / đề bài trong file PDF:
"""
${config.attachedPdf.text.slice(0, 8000)}
"""
YÊU CẦU ĐẶC BIỆT THEO TÀI LIỆU GỐC:
- BẮT BUỘC bám sát chính xác câu hỏi, giả thiết, số liệu và định nghĩa trong file PDF trên để xây dựng kịch bản và lời thoại giải thích.
- Trình bày khái niệm, lý thuyết chuẩn mực đúng theo nội dung tài liệu PDF, không tự bịa đặt.
- TUYỆT ĐỐI KHÔNG ghi chú nhãn RAG hay số trang (ví dụ CẤM: "Câu 1 (RAG trang 2)").
`;
  }

  return `Đóng vai Nhà sáng tạo Nội dung Giáo dục chuyên nghiệp trên nền tảng ${isVertical ? 'TikTok / Shorts / Reels (Video Dọc)' : 'YouTube / Bài giảng (Video Ngang)'}.

Nhiệm vụ: Viết Kịch bản Lời thoại & Bảng Phân cảnh (Storyboard Script) chi tiết từng giây cho chủ đề dưới đây, ăn khớp hoàn hảo với diễn hoạt Manim.

[THÔNG TIN VIDEO]
- Môn học / Chủ đề: ${config.subject} - ${config.topic}
- Loại hình: ${config.mathType || 'Toán học tổng hợp'}
- Định dạng Khung hình: ${isVertical ? 'DỌC (9:16 - TikTok/Shorts)' : 'NGANG (16:9 - YouTube)'}
- Thời lượng video: ${config.duration}
- Phong cách diễn đạt: ${config.tone}
- Khán giả mục tiêu: ${config.audience}
- Ghi chú: ${config.details || "Đi thẳng vào vấn đề, thực chiến toán học"}
${pdfPromptChunk}

[CÁC NGUYÊN TẮC BIÊN SOẠN SƯ PHẠM & GIỮ CHÂN NGƯỜI XEM]
1. **MỞ ĐẦU THU HÚT & TRỰC DIỆN (3 - 5 GIÂY ĐẦU):**
   - Không chào hỏi rườm rà dài dòng.
   - Đi thẳng vào bài toán trọng tâm, câu hỏi cốt lõi hoặc tình huống thường gặp.
${hookGuide}
2. **KẾT HỢP VISUAL & AUDIO:**
   - Mỗi câu thoại đều phải có hình ảnh hoặc hiệu ứng Manim tương ứng (đồ thị chuyển động, biến đổi công thức, làm nổi bật điểm cực trị).
3. **LOGIC TĂNG DẦN ĐỘ KHÓ & TÍNH ỨNG DỤNG:**
   - Từ trực quan hình ảnh -> Công thức nền tảng -> 1 ví dụ thực chiến -> Đúc kết phương pháp.
4. **VĂN PHONG SƯ PHẠM CHUẨN MỰC, KHÔNG DÙNG TỪ NGỮ AI HÓA:**
   - Ngắn gọn, nhịp điệu vừa phải, dễ tiếp thu, truyền cảm hứng.
   - TUYỆT ĐỐI KHÔNG sử dụng các từ ngữ giật gân, sáo rỗng hay cường điệu phong cách AI. Thay vào đó, sử dụng các thuật ngữ sư phạm chuẩn mực: "định lý cốt lõi", "quy tắc trọng tâm", "phương pháp giải", "lưu ý quan trọng".
   - Tên đề bài và bài tập trình bày vừa vặn, không viết hoa toàn bộ, xuống dòng tự nhiên theo nhịp câu.

[CẤU TRÚC KỊCH BẢN - BẢNG PHÂN CẢNH CHI TIẾT]

# Kịch bản video: ${config.topic}
**Định dạng:** ${isVertical ? 'Video Dọc 9:16 (Shorts/TikTok)' : 'Video Ngang 16:9 (YouTube)'} | **Thời lượng:** ${config.duration}

---

| Thời gian | Hình ảnh diễn hoạt (Manim Visual) | Lời thoại thuyết minh (Audio / Voiceover) | Chữ & Công thức trên màn hình |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:05** *(Mở đầu)* | [Mô tả hình ảnh đồ thị / tình huống bài toán] | "[Câu thoại mở đầu trực diện, đi vào trọng tâm]" | [Tiêu đề chủ đề dàn đều, cân đối] |
| **00:05 - 00:20** *(Lý thuyết cốt lõi)* | [Mô tả diễn hoạt trực quan hóa khái niệm theo tài liệu] | "[Giải thích khái niệm rõ ràng, mạch lạc]" | [Định nghĩa / Định lý theo tài liệu PDF] |
| **00:20 - 00:50** *(Bài tập thực chiến)* | [Mô tả từng bước biến đổi Manim, đề bài xuống dòng vừa vặn] | "[Hướng dẫn phương pháp giải và phân tích lưu ý]" | [Đề bài ngắn gọn + Các bước tính toán] |
| **00:50 - Cuối** *(Tổng kết & Kêu gọi)*| [Logo thương hiệu & Mũi tên đăng ký] | "[Tóm tắt 1 câu cốt lõi của bài học & kêu gọi theo dõi]"| [Ghi nhớ phương pháp] |

---

### Danh sách Lời thoại Thuyết minh Liền mạch (Full Voiceover Script):
*(Đoạn văn này được tối ưu sẵn để copy vào các công cụ TTS hoặc đọc thu âm trực tiếp)*
"[Toàn bộ lời thoại đọc liền mạch từ 00:00 đến kết thúc, có chấm phẩy ngắt nhịp tự nhiên, giọng điệu tự tin, đúng thuật ngữ sư phạm...]"

---

### Gợi ý Tone giọng đọc TTS:
- Tốc độ đọc: 1.1x (cho video ngắn) hoặc 1.0x (cho video bài giảng).
- Cảm xúc: Tự tin, dứt khoát, truyền cảm hứng.`;
};
