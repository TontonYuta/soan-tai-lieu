---
name: deep-debugging
description: >-
  Autonomous deep diagnostic and root-cause troubleshooting methodology. Use when encountering
  tricky bugs, cryptic error messages, runtime crashes, silent failures, environment/dependency
  issues, or when a previous fix failed.
---

# Deep Debugging: Phương Pháp Chẩn Đoán & Khắc Phục Tận Gốc

Khi gặp lỗi, sai lầm phổ biến nhất là **"chữa cháy triệu chứng"** (patching symptoms) thay vì giải quyết **"nguyên nhân gốc rễ"** (root cause). 
Kỹ năng này hướng dẫn quy trình điều tra khoa học để tìm ra và xử lý triệt để bất kỳ sự cố kỹ thuật nào.

---

## Nguyên Tắc Cốt Lõi: Symptom vs. Root Cause

| Triệu Chứng (Symptom) | Vá Bề Mặt (Bad Patch) | Khắc Phục Gốc Rễ (Root Cause Fix) |
| :--- | :--- | :--- |
| File không được tạo | Bỏ qua bước tạo file / thông báo ảo | Tìm xem tool nào không chạy được (thiếu binary, path sai) và cài đặt/sửa path |
| Lỗi missing dependency / binary | Báo người dùng tự gõ lệnh cài | Tự động dò tìm thư mục cục bộ (`~/.local`, cache), symlink hoặc tải portable binary |
| GUI app lỗi do PATH | Hardcode đường dẫn tạm bợ | Mở rộng `process.env.PATH` trên toàn bộ lifecycle khởi động của app |

---

## 4 Giai Đoạn Chẩn Đoán Sâu

```
1. ISOLATE & REPRODUCE      2. TRACE & INSPECT        3. HYPOTHESIZE & TEST       4. SURGICAL FIX
┌──────────────────────┐    ┌────────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│ Tái hiện lỗi tối giản│ ──>│ Đọc log, inspect   │ ──>│ Đặt giả thuyết       │ ──>│ Sửa chính xác & │
│ (one-liner / script) │    │ tiến trình & file  │    │ Xác thực bằng chứng  │    │ Thêm test chặn  │
└──────────────────────┘    └────────────────────┘    └──────────────────────┘    └─────────────────┘
```

---

### Giai Đoạn 1: Isolate & Reproduce (Cô Lập & Tái Hiện)
- Viết 1 script nhỏ (node script, bash one-liner, hoặc test runner) để tái hiện lỗi độc lập với toàn bộ hệ thống lớn.
- Ví dụ: Thay vì chạy cả ứng dụng desktop để xem Playwright có bật được Chrome không, hãy chạy:
  ```bash
  node -e "const { chromium } = require('playwright-core'); ..."
  ```
- Nếu không thể tái hiện độc lập, kiểm tra các điều kiện ngữ cảnh: CWD, environment variables, quyền ghi file.

---

### Giai Đoạn 2: Trace & Inspect (Truy Vết Thực Tế)
- **Kiểm tra tiến trình đang chạy**:
  ```bash
  ps aux | grep <app-name>
  ```
  *Chú ý:* Kiểm tra xem tiến trình cũ có đang chiếm port hoặc khóa database/profile không.
- **Kiểm tra file thực tế**:
  ```bash
  ls -la <output-path>
  tail -n 50 <log-path>
  ```
- **Kiểm tra biến môi trường và quyền**:
  ```bash
  echo $PATH
  which <binary-name>
  ```

---

### Giai Đoạn 3: Hypothesize & Verify (Đặt Giả Thuyết & Đối Soát)
- Đưa ra giả thuyết cụ thể: *"Lỗi xảy ra vì biến X rỗng"* hoặc *"Thư viện Y yêu cầu binary ở /opt nhưng hệ thống chỉ có ở ~/.local"*.
- Thu thập bằng chứng khẳng định hoặc bác bỏ giả thuyết trước khi sửa code.
- Tuyệt đối không thay đổi mã nguồn ngẫu nhiên với hy vọng "may mắn sẽ chạy".

---

### Giai Đoạn 4: Surgical Fix & Regression Guard
- **Sửa đúng điểm phát sinh**: Chỉ sửa đúng dòng code chịu trách nhiệm cho lỗi.
- **Bổ sung Fallback thông minh**: Nếu binary không có ở vị trí chuẩn, tự động quét các vị trí phụ trước khi báo lỗi.
- **Chạy toàn bộ test suite**: Đảm bảo việc sửa lỗi không gây tác dụng phụ (side-effects) làm hỏng tính năng khác.
