@echo off
chcp 65001 >nul
title YUTA STUDIO - 1-CLICK BROWSER AUTOMATION
color 0B
cls

echo ===============================================================================
echo        📐 YUTA!LATEX MATH STUDIO - 1-CLICK BROWSER AUTOMATION
echo ===============================================================================
echo.
echo [1/3] Đang kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [LỖI] Chưa tìm thấy Node.js! Vui lòng cài đặt Node.js từ https://nodejs.org
    echo.
    pause
    exit /b
)

echo [2/3] Đang kiểm tra thư viện dự án...
if not exist "node_modules\" (
    echo Đang cài đặt thư viện lần đầu (vui lòng chờ trong giây lát)...
    call npm install
)

echo.
echo [3/3] Đang khởi động hệ thống Tự Động Hóa 1-Click...
echo.
echo ===============================================================================
echo   🚀 HỆ THỐNG ĐÃ SẴN SÀNG TẠI: http://localhost:3000
echo   ✨ Không cần API Key - Tự động hóa Gemini ➔ Overleaf ➔ Xuất PDF
echo ===============================================================================
echo.

start "" "http://localhost:3000"
npm run dev

pause
