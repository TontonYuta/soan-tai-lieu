import { BatConfig } from "../../types";

export const generateBatPrompt = (config: BatConfig): string => {
  return `Đóng vai Kỹ sư Tự động hóa hệ thống (Windows Batch / Shell Script Specialist).
Nhiệm vụ của bạn: Viết một file kịch bản tự động hóa Windows Batch (.bat) hoàn chỉnh, an toàn và tối ưu cho tác vụ sau:

I. TÁC VỤ YÊU CẦU:
- Nhiệm vụ chính: ${config.task}
- Yêu cầu bổ sung: ${config.details || "Không có"}

II. QUY TẮC KỸ THUẬT WINDOWS BATCH (.BAT):
1. Đảm bảo hỗ trợ tiếng Việt UTF-8 bằng lệnh \`chcp 65001 >nul\` ở đầu file.
2. Thiết lập \`@echo off\` và tiêu đề console \`title ...\`.
3. Kiểm tra sự tồn tại của thư mục/file trước khi xóa hoặc thao tác, tránh crash lệnh.
4. Thêm màu sắc giao diện console chuyên nghiệp (vd: \`color 0A\` hoặc thông báo trạng thái rõ ràng [INFO], [SUCCESS], [ERROR]).
5. Dọn dẹp an toàn các file rác LaTeX như: *.aux, *.log, *.out, *.toc, *.nav, *.snm, *.synctex.gz, *.fls, *.fdb_latexmk, *.bbl, *.blg... KHÔNG xóa nhầm file .tex hoặc .pdf.
6. Thêm lệnh \`pause\` ở cuối để người dùng xem được log kết quả trước khi cửa sổ tự đóng.

Trả về TOÀN BỘ mã nguồn file .bat nguyên bản được bọc trong markdown codeblock (\`\`\`bat ... \`\`\`).`;
};