---
name: test-driven-vibecoding
description: >-
  Automated test-driven workflow and loop-until-green methodology for autonomous agents. Use when
  writing new features, refactoring existing code, implementing core algorithms, or ensuring 100%
  verification before task completion.
---

# Test-Driven Vibecoding: Quy Trình Kiểm Thử Bắt Buộc & Vòng Lặp Xanh

Smart Vibecoding chỉ thực sự mạnh mẽ khi có lưới an toàn kiểm thử (testing safety net). Không có test, mọi đoạn code do AI tạo ra đều tiềm ẩn nguy cơ lỗi ngầm (silent regressions).

---

## Nguyên Tắc "Loop Until Green" (Lặp Đến Khi Xanh)

```
        ┌────────────────────────────────────────────────┐
        ▼                                                │ (Nếu có lỗi)
┌───────────────┐     ┌───────────────┐     ┌────────────┴──┐     ┌────────────────┐
│  Thực hiện    │ ──> │ Chạy Kiểm Thử │ ──> │ Phân Tích Lỗi │     │ Hoàn Thành     │
│  Thay Đổi     │     │ (Test / Lint) │     │ & Tự Sửa Mã   │     │ (100% Passed)  │
└───────────────┘     └───────┬───────┘     └───────────────┘     └────────┬───────┘
                              │                                            ▲
                              └────────────── (Khi Đạt 100% Passed) ───────┘
```

---

## 1. Tự Động Nhận Diện Bộ Kiểm Thử (Framework Detection)

Trước khi bắt đầu, xác định lệnh kiểm thử của dự án theo thứ tự ưu tiên:

| Môi Trường | Tệp Nhận Diện | Lệnh Chạy Kiểm Thử | Lệnh Kiểm Tra Kiểu (Typecheck) |
| :--- | :--- | :--- | :--- |
| **Node / TS** | `package.json` | `npm test` hoặc `pnpm test` / `yarn test` | `npm run lint` hoặc `npx tsc --noEmit` |
| **Python** | `pytest.ini`, `pyproject.toml` | `pytest` hoặc `python -m unittest discover` | `mypy .` hoặc `ruff check .` |
| **Go** | `go.mod` | `go test ./...` | `go vet ./...` |
| **Rust** | `Cargo.toml` | `cargo test` | `cargo check` / `cargo clippy` |
| **Makefile** | `Makefile` | `make test` hoặc `make check` | `make lint` |

---

## 2. Viết Test Mới Khi Chưa Có (Create Tests If Missing)

Khi thêm một hàm xử lý mới, bộ sinh prompt mới, hoặc chuyển đổi dữ liệu mà dự án chưa có test:
1. Tạo tệp kiểm thử trong thư mục `tests/` hoặc `__tests__/`.
2. Định nghĩa các ca kiểm thử:
   - **Happy Path**: Dữ liệu chuẩn đầu vào cho ra kết quả mong muốn.
   - **Edge Cases**: Chuỗi rỗng, số âm, ký tự đặc biệt, unicode/tiếng Việt.
   - **Error Handling**: Trường hợp lỗi trả về fallback an toàn hoặc ném ngoại lệ đúng.

---

## 3. Quy Trình Vận Hành 3 Pha: Red -> Green -> Refactor

1. **Pha 1 - Red**: Chạy test kiểm tra xem test có thực sự kiểm soát được tính năng chưa.
2. **Pha 2 - Green**: Viết mã nguồn vừa đủ để test pass.
3. **Pha 3 - Refactor**: Dọn dẹp code, tối ưu hiệu năng và giữ nguyên tính đúng đắn.

---

## 4. Báo Cáo Trong Tóm Tắt Cuối (Final Summary)
Luôn trích dẫn kết quả kiểm thử trong câu trả lời cuối cùng cho người dùng:
- Số lượng test đã chạy và kết quả (`x/x passed`).
- Trạng thái biên dịch build / linter (`0 errors`).
