import { VideoConfig } from "../../types";

export const generateVideoScriptPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';

  let hookGuide = "";
  if (config.hookType === 'trap') {
    hookGuide = `
- **CHIẾN LƯỢC HOOK BẪY ĐỀ THI & CẢNH BÁO SAI LẦM:**
  * Bắt đầu bằng lỗi sai kinh điển mà 90% học sinh thường mắc phải trong phòng thi (ví dụ: quên điều kiện xác định, nhầm dấu khi đổi biến, ngộ nhận tính đồng biến).
  * Câu thoại mở đầu: Cảnh báo giật mình ("Dừng lại ngay! Nếu bạn giải bài này thế này thì mất trắng 0.2 điểm!").`;
  } else if (config.hookType === 'fast_trick') {
    hookGuide = `
- **CHIẾN LƯỢC HOOK BÍ QUYẾT GIẢI NHANH 30S:**
  * Bắt đầu bằng bài toán dài ngoằng khiến học sinh nản chí, rồi lật mở mẹo giải siêu tốc trong 30 giây (kỹ thuật bấm máy Casio, loại trừ đáp án, dùng hình học hóa).
  * Câu thoại mở đầu: Đầy tự tin và kích thích tò mò ("Câu 48 đề chuyên nhưng xử lý chỉ trong 30 giây mà không cần đặt bút tính!").`;
  } else if (config.hookType === 'real_world') {
    hookGuide = `
- **CHIẾN LƯỢC HOOK TOÁN HỌC KỲ DIỆU & THỰC TẾ:**
  * Mở đầu bằng một hiện tượng thực tế, kiến trúc hoặc bí mật tự nhiên được vận hành bởi toán học.
  * Câu thoại mở đầu: Truyền cảm hứng ("Bạn có biết vì sao cây cầu này không sập? Bí mật nằm ở đồ thị parabol này!").`;
  } else {
    hookGuide = `
- **CHIẾN LƯỢC HOOK TRỰC QUAN HÓA BẢN CHẤT TỪ SỐ 0:**
  * Mở đầu bằng nghịch lý trực giác hoặc câu hỏi đánh thức tư duy ("Tại sao đạo hàm lại là hệ số góc tiếp tuyến? Hãy nhìn chuyển động này!").
  * Dẫn dắt người xem từ con số 0 đến giác ngộ bản chất.`;
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
YÊU CẦU ĐẶC BIỆT: Hãy bám sát chính xác câu hỏi toán học hoặc nội dung trong file PDF trên để xây dựng kịch bản video phân cảnh và lời thoại giải thích.
`;
  }

  return `Đóng vai Nhà sáng tạo Nội dung Giáo dục Toán học triệu view trên nền tảng ${isVertical ? 'TikTok / Shorts / Reels (Video Dọc)' : 'YouTube / Bài giảng (Video Ngang)'}.

Nhiệm vụ: Viết Kịch bản Lời thoại & Bảng Phân cảnh (Storyboard Script) chi tiết từng giây cho chủ đề toán học dưới đây, ăn khớp hoàn hảo với diễn hoạt Manim.

[THÔNG TIN VIDEO]
- Môn học / Chủ đề: ${config.subject} - ${config.topic}
- Loại hình: ${config.mathType || 'Toán học tổng hợp'}
- Định dạng Khung hình: ${isVertical ? 'DỌC (9:16 - TikTok/Shorts)' : 'NGANG (16:9 - YouTube)'}
- Thời lượng video: ${config.duration}
- Phong cách diễn đạt: ${config.tone}
- Khán giả mục tiêu: ${config.audience}
- Ghi chú: ${config.details || "Đi thẳng vào vấn đề, thực chiến toán học"}
${pdfPromptChunk}

[CÁC NGUYÊN TẮC GIỮ CHÂN NGƯỜI XEM (RETENTION RULES)]
1. **HOOK 3 GIÂY ĐẦU (SINH TỬ):**
   - Không chào hỏi lan man ("Xin chào các bạn...").
   - Vào thẳng câu hỏi hóc búa, nghịch lý toán học hoặc bẫy sai lầm 99% học sinh dính.
${hookGuide}
2. **KẾT HỢP VISUAL & AUDIO:**
   - Mỗi câu thoại đều phải có hình ảnh hoặc hiệu ứng Manim tương ứng (đồ thị chuyển động, biến đổi công thức, phóng to điểm cực trị).
3. **LOGIC TĂNG DẦN ĐỘ KHÓ & TÍNH ỨNG DỤNG:**
   - Từ trực quan hình ảnh -> Công thức giải nhanh -> 1 ví dụ thực chiến -> Đúc kết bí quyết.
4. **VĂN PHONG SÚC TÍCH:**
   - Ngắn gọn, nhịp điệu nhanh, dễ tiếp thu, có điểm nhấn cảm xúc.

[CẤU TRÚC KỊCH BẢN - BẢNG PHÂN CẢNH CHI TIẾT]

# KỊCH BẢN VIDEO: ${config.topic.toUpperCase()}
**Định dạng:** ${isVertical ? 'Video Dọc 9:16 (Shorts/TikTok)' : 'Video Ngang 16:9 (YouTube)'} | **Thời lượng:** ${config.duration}

---

| Thời gian | Hình ảnh diễn hoạt (Manim Visual) | Lời thoại thuyết minh (Audio / Voiceover) | Chữ & Công thức trên màn hình |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:05** *(Hook)* | [Mô tả hình ảnh đồ thị / câu hỏi giật gân] | "[Câu thoại mở đầu trực diện]" | [Tiêu đề / Công thức giật gân] |
| **00:05 - 00:20** *(Bản chất)* | [Mô tả diễn hoạt trực quan hóa khái niệm] | "[Giải thích trực quan, dễ hiểu]" | [Khái niệm / Định lý chính] |
| **00:20 - 00:50** *(Ví dụ)* | [Mô tả từng bước biến đổi Manim] | "[Hướng dẫn mẹo giải và lưu ý bẫy đề thi]" | [Từng bước tính toán] |
| **00:50 - Cuối** *(Call to action)*| [Logo Yuta!LaTeX & Mũi tên đăng ký] | "[Tóm tắt 1 câu thần chú & kêu gọi follow]"| [Thần chú ghi nhớ] |

---

### Danh sách Lời thoại Thuyết minh Liền mạch (Full Voiceover Script):
*(Đoạn văn này được tối ưu sẵn để copy vào các công cụ TTS hoặc đọc thu âm trực tiếp)*
"[Toàn bộ lời thoại đọc liền mạch từ 00:00 đến kết thúc, có chấm phẩy ngắt nhịp tự nhiên...]"

---

### Gợi ý Tone giọng đọc TTS:
- Tốc độ đọc: 1.1x (cho video ngắn) hoặc 1.0x (cho video bài giảng).
- Cảm xúc: Tự tin, dứt khoát, truyền cảm hứng.`;
};