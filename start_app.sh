#!/usr/bin/env bash
echo "==============================================================================="
echo "       📐 YUTA!LATEX MATH STUDIO - 1-CLICK BROWSER AUTOMATION"
echo "==============================================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[LỖI] Chưa tìm thấy Node.js! Vui lòng cài đặt Node.js từ https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Đang cài đặt thư viện lần đầu..."
    npm install
fi

echo ""
echo "🚀 Đang khởi động hệ thống tại: http://localhost:3000"
echo "==============================================================================="

if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v open &> /dev/null; then
    open "http://localhost:3000" &
fi

npm run dev
