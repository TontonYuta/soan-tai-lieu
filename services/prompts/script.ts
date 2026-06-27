import { VideoConfig } from "../../types";

export const generateVideoScriptPrompt = (config: VideoConfig): string => {
  return `Đóng vai một thầy giáo / chuyên gia giáo dục siêu teen và hài hước trên nền tảng ${config.format.toUpperCase()} (Tiktok/Youtube).

Bạn đang viết kịch bản dạng bảng phân cảnh (Storyboard Script) mang phong cách "${config.tone}". 

[THÔNG TIN VIDEO]
- Môn học / Chủ đề: ${config.subject} - ${config.topic}
- Khối lớp: ${(config as any).grade}
- Định dạng Khung hình & Cấu trúc: ${config.format} (Nếu vertical/Tiktok thì phải dồn dập, giật gân ở 3 giây đầu).
- Thời lượng: ${config.duration} phút.
- Ngôn ngữ: ${(config as any).language === 'vietnamese' ? '100% TIẾNG VIỆT' : (config as any).language === 'english' ? '100% TIẾNG ANH' : 'SONG NGỮ (Chèn từ khóa quan trọng bằng tiếng Anh kế bên tiếng Việt)'}
- Yêu cầu thêm: ${config.details || 'Đi thẳng vào thực chiến nhé'}

[NGUYÊN TẮC VÀ VĂN PHONG BẮT BUỘC]
- NỘI DUNG DỰA TRÊN THỰC HÀNH: Hạn chế tối đa lý thuyết, chuyển 15% lý thuyết vô phần intro, 85% còn lại là VÍ DỤ SỐNG, mẹo giải nhanh, thủ thuật làm bài tập ầm ầm.
- VĂN PHONG ĐỜI THƯỜNG / NEWBIE FRIENDLY: Ngôn ngữ mộc mạc, gần gũi, như người anh truyền kíp cho đệ. CẤM BẢN CHẤT DÙNG CÁC TỪ SÁO RỖNG, HOA MỸ sinh ra từ AI như "Hành trình tri thức", "Hãy cùng khám phá", "Bất ngờ thú vị".
- LOGIC TĂNG DẦN ĐỘ KHÓ: Lật vấn đề từ câu nhận biết dễ ẹc -> tăng dần đến vận dụng (Easy -> Medium -> Hard logic) để người xem có cảm giác thành tựu.

[CẤU TRÚC KỊCH BẢN - MARKDOWN]
Bắt buộc in đậm các đoạn này theo Markdown:

# [Tên Video Cực Giật Gân / Nỗi Đau Học Tập Của Học Sinh]
**Thời lượng:** ${config.duration} phút | **Format:** ${config.format}

## 1. MỞ ĐẦU HOOK (10-15s) - [Nêu đúng nỗi đau bài tập/thuyết]
- **Visual:** [Ghi cái gì hiển thị trên màn hình - thật sự thu hút]
- **Audio:** [Câu mở đầu không dài dòng, đi thẳng vấn đề]

## 2. CHẶNG CƠ BẢN (EASY PLAY) - [Bài tập mẫu dễ nhất trần đời]
- **Visual:** [...]
- **Audio:** [Công thức / cách làm siêu cấp tốc, vào việc luôn một câu thực hành ví dụ.]

## 3. CHẶNG NÂNG TẦM (STRETCH GOAL) - [Đảo não / Trick lật kèo]
- **Visual:** [...]
- **Audio:** [Cách biến bài dễ thành bài vừa phải, một bài tập khó hơn, lưu ý sai chết người học sinh hay gặp.]

## 4. CHỐT DEAL & CALL TO ACTION
- **Visual:** [...]
- **Audio:** [Chốt lại đúng 1 câu punchline, giao 1 bài tập nhẩm nhanh và hẹn comment đáp án.]

Trả về nguyên văn đoạn text áp dụng triệt để những kiểu mộc mạc trên!



[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối \`<self_check> ... </self_check>\`:
- Logic đã chuẩn chưa? Cấu trúc có phân chia nhỏ hợp lý từ dễ đến khó không?
- Lỗi hiển thị: Định dạng (mã LaTeX hoặc Markdown) có dính lỗi cú pháp không (thiếu ngoặc, quên macro, thiếu end, sai tên biến, không escape ký tự đặc biệt như %, &, _, $)? Khắc phục ngay.
- Kiểm tra tính hoàn thiện: Đã bọc mã bằng markdown codeblock chưa? Bắt buộc phải đặt toàn bộ code trong block \`\`\` (vd: \`\`\`latex ... \`\`\`).
Sau khi tự review xong, mới được phép xuất ra đoạn mã/nội dung kết quả chuẩn nhất.`;
};
