#Requires AutoHotkey v2.0
#SingleInstance Force

; ===== CẤU HÌNH =====
global Delay := 120   ; ms giữa các thao tác
global MaxQuestions := 80

global TextAnswer :=
"Nhìn chung trải nghiệm là tích cực và phù hợp với kỳ vọng. " .
"Các hoạt động được tổ chức tương đối hợp lý và có thể cải thiện thêm trong tương lai."

; ===== PHÍM CHẠY =====
F9::
{
    Loop MaxQuestions
    {
        ; --- thử dán cho câu hỏi mở ---
        A_Clipboard := TextAnswer
        Sleep 30
        Send "^v"
        Sleep Delay

        ; --- xử lý trắc nghiệm dot ---
        ; mặc định: chọn đáp án giữa (3 hoặc 4)
        if Mod(A_Index, 2) = 0
        {
            Send "{Right 3}"  ; lệch phải 3 lần
        }
        else
        {
            Send "{Right 2}"  ; lệch phải 2 lần
        }

        Sleep 50
        Send "{Space}"       ; chọn dot
        Sleep Delay

        ; --- sang câu tiếp ---
        Send "{Tab}"
        Sleep Delay
    }
}

; ===== DỪNG KHẨN =====
Esc::ExitApp
