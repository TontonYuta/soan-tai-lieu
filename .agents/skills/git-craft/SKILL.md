---
name: git-craft
description: >-
  Standard operating procedures for clean version control, atomic commits, branch safety, and
  rollback checkpoints during AI development sessions. Use when staging files, writing commit
  messages, preparing pull requests, or creating safe checkpoints.
---

# Git Craft: Quản Trị Phiên Bản & Mốc Lưu Trữ An Toàn

Một vibe coder thông minh luôn giữ cho lịch sử Git rõ ràng, có trật tự và an toàn tuyệt đối.

---

## 1. Chuẩn Conventional Commits

Mọi commit message cần tuân theo định dạng:
```
<type>(<scope>): <mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh>
```

| Loại (Type) | Mục Đích Sử Dụng | Ví Dụ |
| :--- | :--- | :--- |
| `feat` | Thêm tính năng hoặc màn hình mới | `feat(auth): thêm cơ chế đăng nhập bằng PIN WAN` |
| `fix` | Khắc phục lỗi phát sinh | `fix(latex): tự động dò tìm binary pdflatex trong ~/.TinyTeX` |
| `refactor` | Tái cấu trúc mã nguồn không đổi hành vi | `refactor(runner): tách module khởi chạy Chrome thành helper` |
| `test` | Thêm mới hoặc cập nhật bộ kiểm thử | `test(prompts): bổ sung test case cho đề thi format 2025` |
| `perf` | Tối ưu hóa hiệu năng, tốc độ render | `perf(render): giảm thời gian biên dịch pdflatex với nonstopmode` |
| `chore` | Cập nhật cấu hình build, dependencies | `chore(build): cấu hình electron-builder tạo AppImage cho Linux` |

---

## 2. Checklist An Toàn Trước Khi Commit

Trước khi thực hiện `git add` và `git commit`:
1. **Kiểm tra trạng thái**:
   ```bash
   git status
   ```
2. **Kiểm tra khác biệt code**:
   ```bash
   git diff
   ```
3. **Tuyệt đối không commit**:
   - Khóa API, mật khẩu, file `.env`, `.env.local`.
   - File log (`*.log`), file rác tạm (`.aux`, `.out`, `*.tmp`).
   - Thư mục build khổng lồ (`dist-electron/`, `node_modules/`).
4. **Đảm bảo `.gitignore` đã chặn đúng** các file nhạy cảm và binary build.

---

## 3. Tạo Checkpoint An Toàn (Safe Checkpoint)

Trước khi thực hiện những thay đổi lớn (refactoring cấu trúc thư mục, nâng cấp major dependencies):
- Tạo nhánh tạm hoặc stash:
  ```bash
  git stash save "checkpoint-truoc-khi-refactor"
  ```
- Hoặc commit checkpoint tạm:
  ```bash
  git commit -m "chore: checkpoint truoc khi nang cap module auth"
  ```
- Nhờ đó, nếu phương án mới thất bại, có thể lập tức rollback về trạng thái hoạt động tốt bằng:
  ```bash
  git checkout .
  ```
