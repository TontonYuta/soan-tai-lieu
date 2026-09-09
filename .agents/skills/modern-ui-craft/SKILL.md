---
name: modern-ui-craft
description: >-
  Design system rules, aesthetic standards, and UI/UX best practices for crafting modern web
  applications. Use when creating or refining user interfaces, React/Vue components, Tailwind CSS
  styling, responsive layouts, or rich interactive experiences.
---

# Modern UI Craft: Tiêu Chuẩn Giao Diện & Trải Nghiệm Người Dùng Đỉnh Cao

Trong phong cách "Vibe Coding", giao diện không chỉ cần chạy đúng tính năng mà phải mang lại **cảm giác mượt mà, chỉn chu, có chất riêng (High-Aesthetic Vibe)**.

---

## 1. Phong Cách Thiết Kế Đặc Trưng

### A. Neo-Brutalism (Phong Cách Hiện Đại, Năng Động)
- **Đường viền dày dặn**: `border-2 border-black` hoặc `border-3 border-black`, `border-4 border-black`.
- **Đổ bóng cứng (Hard Drop Shadows)**:
  - Button nhỏ: `shadow-[2px_2px_0_0_rgba(0,0,0,1)]`
  - Card / Panel: `shadow-[4px_4px_0_0_rgba(0,0,0,1)]` hoặc `shadow-[8px_8px_0_0_rgba(0,0,0,1)]`
- **Tương tác nút bấm chân thực (Tactile Feedback)**:
  - `active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`
- **Bảng màu tương phản cao**:
  - Vàng chanh: `#FFED66`
  - Đỏ san hô: `#FF5E5B`
  - Xanh lam Cyan: `#00CECB`
  - Xanh lá Neon: `#A3E635`
  - Hồng Magenta: `#FF90E8`

### B. Sleek Dark / Minimal Modern (Phong Cách Chuyên Nghiệp)
- Tông xám đen trung tính: Slate/Zinc (`bg-zinc-900`, `border-zinc-800`, `text-zinc-100`).
- Hiệu ứng kính mờ (Glassmorphism): `backdrop-blur-md bg-white/10` hoặc `bg-zinc-900/80`.
- Điểm nhấn tinh tế (Accent highlights): Indigo/Violet hoặc Emerald.

---

## 2. Tiêu Chuẩn Responsive 100% (Mobile & Desktop)

- **Mobile First**: Luôn đảm bảo layout hiển thị hoàn hảo trên màn hình hẹp (360px - 480px).
- **Navigation & Header**:
  - Header cố định `sticky top-0 z-40` với độ cao vừa phải.
  - Menu hoặc Tabs có khả năng cuộn ngang: `overflow-x-auto whitespace-nowrap scrollbar-none`.
- **Grid linh hoạt**:
  - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3` thay vì cố định số cột.

---

## 3. Chống Trôi Layout (Zero Layout Shift - CLS)

- **Hình ảnh & Video**: Luôn đặt `aspect-ratio` hoặc chiều cao tối thiểu (`min-h-[200px]`, `aspect-video`).
- **Trạng thái tải (Loading States)**: Dùng Skeleton loaders thay vì để trang trắng rồi giật layout khi nạp xong.
- **Truncate văn bản dài**: Sử dụng `truncate` hoặc `line-clamp-2` cho tiêu đề và đường link dài.

---

## 4. Hỗ Trợ Tiếng Việt Chuẩn Xác
- Dùng bộ font hỗ trợ đầy đủ dấu tiếng Việt: Inter, Roboto, Be Vietnam Pro, JetBrains Mono (cho code).
- Tránh vỡ chữ hoặc dấu hỏi chấm: Đảm bảo encoding `UTF-8` cho toàn bộ template và file text.
