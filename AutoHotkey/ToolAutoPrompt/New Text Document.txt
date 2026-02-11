#Requires AutoHotkey v2.0
#SingleInstance Force

F8:: {
    total := 80          ; số lần gửi
    delay := 45000       ; delay 15 giây (tùy Gemini nhanh/chậm)

    Loop total {
        SendText "buổi tiếp theo"
        Sleep 100
        Send "{Enter}"

        ToolTip "Đã gửi: " A_Index "/" total
        Sleep delay
    }

    ToolTip
}
