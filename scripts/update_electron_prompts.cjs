const fs = require("fs");
const filePath = "electron/main.cjs";
let content = fs.readFileSync(filePath, "utf-8");

// 1. Update line 1993 (isManimTask directive)
const oldDirective = `              // Bổ sung chỉ thị cho Antigravity Agent nếu là bài giảng Video
              if (isManimTask && !promptToSend.includes('MainScene')) {
                promptToSend += \`\\n\\nYÊU CẦU BẮT BUỘC CHO VIDEO MANIM CE:\\n- Xuất Kịch bản Sư phạm VÀ Khối mã Python Manim CE duy nhất trong \\\`\\\`\\\`python ... \\\`\\\`\\\` có \\\`class MainScene(Scene)\\\` và \\\`def construct(self):\\\` để có thể render ngay.\\n- BỐ CỤC DUAL-ZONE CONTAINER LẤP ĐẦY 93% MÀN HÌNH (height thẻ 6.4 và 6.6), FONT_SIZE LỚN RÕ RÀNG (Tiêu đề 30-34, Thẻ 24, MathTex 28-34, Diễn giải 22-26, CẤM DÙNG FONT_SIZE DƯỚI 22).\\n- TUYỆT ĐỐI KHÔNG SỬ DỤNG BẤT KỲ TOOL NÀO (KHÔNG run_command, KHÔNG write_to_file, KHÔNG view_file). KHÔNG TỰ CHẠY LỆNH RENDER. CHỈ XUẤT TEXT TRỰC TIẾP.\`;
              }`;

const newDirective = `              // Bổ sung chỉ thị cho Antigravity Agent nếu là bài giảng Video
              if (isManimTask && !promptToSend.includes('MainScene')) {
                promptToSend += \`\\n\\nYÊU CẦU BẮT BUỘC CHO VIDEO MANIM CE (CHUẨN c1_HamSo_DonDieu.py):\\n- Kế thừa cấu trúc 5 Phân Cảnh Vàng: 1. Intro (~7s); 2. Lý thuyết 2 thẻ màu tương phản (Xanh Emerald & Đỏ Ruby, ~14s); 3. Dual-Zone Mô phỏng động tiếp tuyến trượt đổi màu theo dấu đạo hàm & BBT 3 tầng (~38s); 4. Chữa đề RAG thực chiến (TỐI ĐA 2 CÂU TIÊU BIỂU: Top Card = Câu 1, Bottom Card = Câu 2; TUYỆT ĐỐI KHÔNG nhồi 3-4 câu); 5. Thẻ Outro thương hiệu "Học toán cùng Yuta" (giữ nguyên self.wait(3.0), KHÔNG FadeOut).\\n- BẮT BUỘC gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ để triệt tiêu lỗi tràn viền.\\n- FONT_SIZE LỚN RÕ RÀNG TRÊN ĐIỆN THOẠI (Tiêu đề 30-34, Thẻ 22-24, MathTex 26-32, Diễn giải 22-24, CẤM DÙNG FONT_SIZE DƯỚI 22).\\n- Xuất khối mã Python Manim CE duy nhất trong \\\`\\\`\\\`python ... \\\`\\\`\\\` có class MainScene(Scene) và def construct(self): để render ngay.\\n- TUYỆT ĐỐI KHÔNG SỬ DỤNG BẤT KỲ TOOL NÀO (KHÔNG run_command, KHÔNG write_to_file, KHÔNG view_file). KHÔNG TỰ CHẠY LỆNH RENDER. CHỈ XUẤT TEXT TRỰC TIẾP.\`;
              }`;

if (content.includes(oldDirective)) {
  content = content.replace(oldDirective, newDirective);
  console.log("✓ Updated directive at line 1993");
} else {
  console.log("⚠️ Old directive not found exactly, trying regex replace...");
  content = content.replace(
    /\/\/ Bổ sung chỉ thị cho Antigravity Agent nếu là bài giảng Video\s+if \(isManimTask && !promptToSend\.includes\('MainScene'\)\) \{[\s\S]*?\}\s*\}/,
    newDirective + "\n            }"
  );
}

// 2. Update codeFollowupPrompt (lines 2039-2051)
const oldTurn2Header = `YÊU CẦU BẮT BUỘC KHÔNG ĐƯỢC BỎ QUA (TUÂN THỦ DUAL-ZONE CONTAINER CARDS & CHỐNG TRỐNG MÀN HÌNH):
1. BẮT BUỘC bắt đầu bằng khối mã \`\`\`python ... \`\`\`
2. BẮT BUỘC có dòng đầu: from manim import *
3. BẮT BUỘC có class MainScene(Scene) hoặc class MainScene(ThreeDScene) chứa def construct(self):
4. \${isVertical ? 'Cấu hình khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0).' : 'Cấu hình khung hình NGANG 16:9 (1920x1080).'}
5. BỐ CỤC DUAL-ZONE LẤP ĐẦY 93% MÀN HÌNH (TRIỆT TIÊU KHOẢNG TRỐNG ĐEN):
   - \${isVertical ? 'Header Bar (y ~ 7.05, height=1.3, width=8.5, tiêu đề font_size=30-34 BOLD); Top Card (y ~ 3.15, height=6.4, width=8.5, tiêu đề font_size=24, axes x_length=7.2, y_length=4.4, nét vẽ stroke_width=4.5); Bottom Card (y ~ -3.75, height=6.6, width=8.5, tiêu đề font_size=24, công thức MathTex font_size=28-34, diễn giải font_size=22-26, bảng biến thiên font_size=24-28). TUYỆT ĐỐI KHÔNG để khoảng trống đen thừa!' : 'Header đỉnh màn hình, Cột Trái Mô phỏng Đồ thị (width=7.2, height=6.2), Cột Phải Lời giải LaTeX (width=5.8, height=6.2).'}
6. BẮT BUỘC FONT_SIZE LỚN DỄ ĐỌC TRÊN ĐIỆN THOẠI: TUYỆT ĐỐI KHÔNG dùng font_size nhỏ dưới 22! Mọi chữ tiếng Việt font_size=22-26, công thức MathTex font_size=28-34, tiêu đề 30-34.
7. BẮT BUỘC khớp đúng thời lượng mục tiêu: \${targetDuration} (điều chỉnh số phân cảnh, khối kịch bản lời thoại VOICEOVER_SCRIPT và các khoảng self.wait(2.0-4.0) giữa các bước).
8. 100% công thức MathTex(r"...") dùng raw string r"...".
9. TUYỆT ĐỐI CHỈ XUẤT MÃ PYTHON TRONG KHỐI \`\`\`python ... \`\`\`, KHÔNG VIẾT LỜI CHÀO HAY GIẢI THÍCH NGOÀI MÃ!
10. TUYỆT ĐỐI KHÔNG GỌI BẤT KỲ TOOL NÀO (KHÔNG run_command, KHÔNG write_to_file, KHÔNG view_file). KHÔNG TỰ CHẠY LỆNH RENDER. Hệ thống sẽ tự biên dịch mã bằng lệnh: \`manim \${qualityFlag} scene.py MainScene\`.`;

const newTurn2Header = `YÊU CẦU BẮT BUỘC KHÔNG ĐƯỢC BỎ QUA (TUÂN THỦ KIẾN TRÚC 5 PHÂN CẢNH VÀNG & c1_HamSo_DonDieu.py):
1. BẮT BUỘC bắt đầu bằng khối mã \`\`\`python ... \`\`\` và kết thúc bằng \`\`\`.
2. BẮT BUỘC có dòng đầu: from manim import *
3. BẮT BUỘC có class MainScene(Scene) hoặc class MainScene(ThreeDScene) chứa def construct(self):
4. \${isVertical ? 'Cấu hình khung hình DỌC 9:16 (config.pixel_width=1080, config.pixel_height=1920, config.frame_width=9.0, config.frame_height=16.0).' : 'Cấu hình khung hình NGANG 16:9 (1920x1080).'}
5. BỐ CỤC 5 PHÂN CẢNH VÀNG CHUẨN MỰC:
   - Phần 1: Mở đầu ấn tượng (Intro, ~7s) - FadeOut toàn bộ.
   - Phần 2: Lý thuyết 2 thẻ màu tương phản (Card Xanh Emerald #064E3B & Card Đỏ Ruby #7F1D1D, height=4.0-4.2 mỗi thẻ, width=8.4) - FadeOut toàn bộ.
   - Phần 3: Dual-Zone Container Mô phỏng động tiếp tuyến trượt đổi màu theo hệ số góc + thanh trạng thái real-time always_redraw + Bảng biến thiên 3 tầng LaTeX chuẩn SGK (\\\\begin{array}{|c|ccccccc|}) (~38s) - FadeOut toàn bộ.
   - Phần 4: Chữa đề thi RAG thực chiến (TỐI ĐA 2 CÂU TIÊU BIỂU: Top Card = Câu 1, Bottom Card = Câu 2; TUYỆT ĐỐI KHÔNG nhồi 3-4 câu) (~38s) - FadeOut toàn bộ.
   - Phần 5: Thẻ Outro tổng kết thương hiệu "Học toán cùng Yuta" (height=13.6, width=8.4) - BẮT BUỘC kết thúc bằng self.wait(3.0) giữ nguyên màn hình, TUYỆT ĐỐI KHÔNG FadeOut làm đen màn hình!
6. BẮT BUỘC HÀM fit_width(group, 7.8) trên mọi khối nội dung mobject trong thẻ để triệt tiêu lỗi tràn viền.
7. BẮT BUỘC FONT_SIZE LỚN DỄ ĐỌC TRÊN ĐIỆN THOẠI: TUYỆT ĐỐI KHÔNG dùng font_size nhỏ dưới 22! Mọi chữ tiếng Việt font_size=22-24, công thức MathTex font_size=26-32, tiêu đề 30-34.
8. 100% công thức MathTex(r"...") dùng raw string r"...".
9. TUYỆT ĐỐI CHỈ XUẤT MÃ PYTHON TRONG KHỐI \`\`\`python ... \`\`\`, KHÔNG VIẾT LỜI CHÀO HAY GIẢI THÍCH NGOÀI MÃ!
10. TUYỆT ĐỐI KHÔNG GỌI BẤT KỲ TOOL NÀO (KHÔNG run_command, KHÔNG write_to_file, KHÔNG view_file). KHÔNG TỰ CHẠY LỆNH RENDER. Hệ thống sẽ tự biên dịch mã bằng lệnh: \`manim \${qualityFlag} scene.py MainScene\`.`;

if (content.includes(oldTurn2Header)) {
  content = content.replace(oldTurn2Header, newTurn2Header);
  console.log("✓ Updated codeFollowupPrompt at line 2039");
}

// 3. Update directPrompt (line 2076)
const oldDirect = `                  const isVertical = options.prompt.includes('9:16') || options.prompt.includes('DỌC');
                  const directPrompt = \`Viết duy nhất 1 khối mã Python Manim CE (\\\`scene.py\\\`) hoàn chỉnh 100% để tạo video minh họa cho bài toán toán học chủ đề: "\${options.topic || options.subject || 'Toán học'}".\${ragDirectiveBlock ? \`\\n\${ragDirectiveBlock}\\n\` : ''}
BẮT BUỘC bắt đầu bằng \\\`\\\`\\\`python from manim import * ... \\\`\\\`\\\` với class MainScene(Scene) và def construct(self):. Cấu hình \${isVertical ? 'Dọc 9:16 Dual-Zone, lấp đầy 93% màn hình (height 6.4 và 6.6), cỡ chữ lớn >= 22 (MathTex >= 28, Tiêu đề >= 30)' : 'Ngang 16:9'}. TUYỆT ĐỐI KHÔNG SỬ DỤNG TOOL/COMMAND (KHÔNG run_command, KHÔNG write_to_file). CHỈ XUẤT DUY NHẤT KHỐI MÃ PYTHON RA TEXT OUTPUT! KHÔNG VIẾT LỜI CHÀO!\`;`;

const newDirect = `                  const isVertical = options.prompt.includes('9:16') || options.prompt.includes('DỌC');
                  const directPrompt = \`Viết duy nhất 1 khối mã Python Manim CE (\\\`scene.py\\\`) hoàn chỉnh 100% để tạo video minh họa cho bài toán toán học chủ đề: "\${options.topic || options.subject || 'Toán học'}".\${ragDirectiveBlock ? \`\\n\${ragDirectiveBlock}\\n\` : ''}
BẮT BUỘC bắt đầu bằng \\\`\\\`\\\`python from manim import * ... \\\`\\\`\\\` với class MainScene(Scene) và def construct(self):. Cấu hình \${isVertical ? 'Dọc 9:16 Dual-Zone theo chuẩn 5 phân cảnh c1_HamSo_DonDieu.py, lấp đầy 93% màn hình, gọi fit_width(group, 7.8), RAG tối đa 2 câu tiêu biểu, cỡ chữ lớn >= 22 (MathTex 26-32, Tiêu đề 30-34), kết thúc bằng self.wait(3.0) giữ Outro card' : 'Ngang 16:9'}. TUYỆT ĐỐI KHÔNG SỬ DỤNG TOOL/COMMAND (KHÔNG run_command, KHÔNG write_to_file). CHỈ XUẤT DUY NHẤT KHỐI MÃ PYTHON RA TEXT OUTPUT! KHÔNG VIẾT LỜI CHÀO!\`;`;

if (content.includes(oldDirect)) {
  content = content.replace(oldDirect, newDirect);
  console.log("✓ Updated directPrompt at line 2076");
}

fs.writeFileSync(filePath, content, "utf-8");
console.log("✓ All electron/main.cjs updates saved!");
