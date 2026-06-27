import { BatConfig } from "../../types";

export const generateBatPrompt = (config: BatConfig): string => {
  return `Đóng vai một chuyên gia hệ thống Windows và Scripting (Batch / PowerShell).
Viết cho tôi một kịch bản (.bat) để tự động hóa tác vụ sau trên Windows.

### I. YÊU CẦU TÁC VỤ
- Mục tiêu chính: ${config.task}
- Yêu cầu bổ sung: ${config.details || "Không có"}

### II. QUY TẮC VIẾT SCRIPT (.BAT) (BẮT BUỘC):
1. **Tiêu chuẩn mã nguồn:** Luôn bắt đầu bằng \`@echo off\` để làm sạch console. Bật \`setlocal enabledelayedexpansion\` nếu cần xử lý biến trong vòng lặp.
2. **Hiển thị thông báo (Logging):** Thông báo trạng thái rõ ràng (đang làm gì, thành công hay thất bại). Nếu có lỗi, phải in ra thông báo lỗi và không đóng cửa sổ ngay (sử dụng \`pause\` khi có lỗi hoặc kết thúc để người dùng kịp đọc).
3. **Màu sắc & UI:** Có thể sử dụng lệnh \`color\` hoặc các mã màu để console dễ nhìn hơn (ví dụ: xanh lá khi thành công, đỏ khi lỗi - nếu có thể).
4. **Bảo mật & An toàn:** 
   - Kiểm tra xem file/thư mục có tồn tại trước khi thao tác (xóa, di chuyển, copy).
   - Nếu tác vụ nguy hiểm, yêu cầu người dùng xác nhận (Y/N) trước khi chạy.
5. **Chú thích (Comments):** Phải có chú thích (dùng \`REM\` hoặc \`::\`) giải thích ngắn gọn từng bước hoặc từng hàm để người mới cũng có thể hiểu và chỉnh sửa.

### III. KẾT QUẢ ĐẦU RA:
[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối \`<self_check> ... </self_check>\`:
- Logic script đã chuẩn chưa? Có bị lỗi vòng lặp vô hạn hay sai cú pháp batch không?
- Các lệnh có tương thích với Windows (CMD) không? (Ví dụ: Dùng copy, xcopy, robocopy, del... chuẩn).
- Kiểm tra tính an toàn của kịch bản, các biến môi trường có được handle an toàn không?
Sau khi tự review xong, mới được phép xuất ra đoạn mã code hoàn chỉnh.

TRẢ VỀ MÃ NGUỒN SCRIPT .BAT HOÀN CHỈNH ĐƯỢC BỌC TRONG MARKDOWN CODEBLOCK (\`\`\`bat). Không giải thích thêm dài dòng.`;
};
