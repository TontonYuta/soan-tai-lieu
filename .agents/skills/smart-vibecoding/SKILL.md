---
name: smart-vibecoding
description: >-
  Core methodology and playbook for autonomous 'smart vibecoding'. Use when tackling large features,
  end-to-end prototyping, converting ideas/PRDs into production code, or managing complex coding
  projects with high autonomy, disciplined architecture, and zero regressions.
---

# Smart Vibecoding: Triết Lý & Quy Trình Lập Trình Tự Chủ Thông Minh

"Vibe Coding" không phải là tạo code ngẫu nhiên hay nhắm mắt chấp nhận output của AI.
**Smart Vibecoding (Vibe Coding Thông Minh)** là sự kết hợp giữa:
- **Người dùng (Architect / Product Owner)**: Định hướng tầm nhìn, yêu cầu nghiệp vụ, trải nghiệm người dùng.
- **Agent (Senior Full-Stack Engineer / Builder)**: Tự chủ giải quyết toàn diện, phân tích sâu kiến trúc, thực thi từng bước nguyên tử, tự chẩn đoán sửa lỗi và kiểm thử liên tục.

---

## 5 Bước Vàng Của Chu Trình Smart Vibecoding

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1. Spec & PRD   │ ──> │ 2. Deep Context  │ ──> │ 3. Atomic Code  │
│ (Chia nhỏ việc) │     │ (Đọc hiểu code)  │     │ (Làm từng bước) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 5. Clean Commit │ <── │ 4. Loop to Green │ <───┘                 │
│ (Lưu mốc sạch)  │     │ (Test & Lint)    │                       │
└─────────────────┘     └──────────────────┘
```

---

### Bước 1: Task Decomposition (Chia Nhỏ Mục Tiêu)
- **Tuyệt đối không đập đi xây lại toàn bộ file** khi chưa phân tích kiến trúc hiện tại.
- Chia yêu cầu lớn thành danh sách các việc nguyên tử (atomic milestones):
  1. *Data Models / Schemas / Types*
  2. *Core Services / Backend APIs*
  3. *State Management / UI Components*
  4. *Integration & End-to-End wiring*
  5. *Testing & Polish*

---

### Bước 2: Deep Context Retrieval (Khảo Sát Trước Khi Viết)
- **Đọc code hiện có**: Sử dụng `grep_search`, `find_by_name`, `view_file` để hiểu rõ các patterns trong project:
  - Dự án dùng thư viện gì? (Tailwind, Lucide icons, Zustand, Redux, v.v.)
  - Cách xử lý error handling, logging, naming convention hiện tại là gì?
- **Tôn trọng mã nguồn hiện hữu**: Giữ nguyên comments, logic không liên quan và kiến trúc chung của người dùng.

---

### Bước 3: Atomic Implementation (Triển Khai Từng Khối)
- Sửa từng phần có liên quan, sử dụng `replace_file_content` cho các đoạn code chính xác thay vì ghi đè cả file lớn.
- Khi tạo file mới, đảm bảo imports và exports tương thích 100% với hệ thống type của dự án.
- Không để lại code giả dạng `// TODO: implement later` trừ khi được người dùng yêu cầu cụ thể.

---

### Bước 4: Loop Until Green (Tự Kiểm Thử Đến Khi Xanh)
- **Bắt buộc kiểm thử sau mỗi thay đổi**:
  - TypeScript/Typecheck: `npm run lint` hoặc `tsc --noEmit`
  - Tests: `npm test` hoặc `pytest` / `go test`
  - Build check: `npm run build`
- **Tự khắc phục lỗi (Self-Healing)**: Nếu gặp lỗi build hoặc test fail:
  1. Đọc kỹ thông báo lỗi và dòng gây lỗi.
  2. Phân tích nguyên nhân gốc rễ (Root cause).
  3. Sửa code và chạy lại test ngay lập tức.
  4. Lặp lại cho đến khi toàn bộ xanh (0 error, 100% test pass).

---

### Bước 5: Checkpoint & Delivery (Báo Cáo Rõ Ràng)
- Trình bày kết quả ngắn gọn, súc tích bằng tiếng Việt.
- Dẫn link file clickable theo chuẩn `file:///path/to/file#Lxx-Lyy`.
- Xác nhận các lệnh test/build đã chạy và passed thành công.
