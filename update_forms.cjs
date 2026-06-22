const fs = require('fs');

function addDetailsToForm(filePath, inputHtml, insertAfterMarker) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(insertAfterMarker)) {
        console.error("Marker not found in", filePath);
        return;
    }
    if (!content.includes("details")) {
       content = content.replace(insertAfterMarker, insertAfterMarker + "\n" + inputHtml);
       fs.writeFileSync(filePath, content);
       console.log("Updated", filePath);
    }
}

// 1. ExamForm
const examHtml = `
            <div className="group relative mt-4">
                <label className={labelClass}>Yêu cầu thêm (Tùy chọn)</label>
                <div className="relative">
                    <textarea 
                        className={inputClass + " min-h-[80px]"} 
                        placeholder="Vd: Bám sát đề minh họa 2025, cho ví dụ thực tế..." 
                        value={config.details || ''} 
                        onChange={e => setConfig({...config, details: e.target.value})} 
                    />
                </div>
            </div>
`;
addDetailsToForm('components/ExamForm.tsx', examHtml, '<div className="group relative">\n                <label className={labelClass}>Chủ đề bài thi</label>\n                <div className="relative">\n                    <LayoutDashboard className={iconClass} />\n                    <input type="text" className={inputClass} placeholder="Vd: Ứng dụng đạo hàm" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} required />\n                </div>\n            </div>');

// 2. LearningForm
const learningHtml = `
                <div className="group relative mt-4">
                    <label className={labelClass}>Yêu cầu cập nhật thêm (Tùy chọn)</label>
                    <div className="relative">
                        <textarea
                            className={inputClass + " min-h-[80px]"}
                            placeholder="Vd: Cập nhật format mới của Bộ, mẹo học nhanh..."
                            value={config.details || ''}
                            onChange={e => handleChange('details', e.target.value)}
                        />
                    </div>
                </div>
`;
addDetailsToForm('components/LearningForm.tsx', learningHtml, '<div className="group relative">\n                     <label className={labelClass}>Đối tượng học sinh</label>\n                     <div className="relative">\n                        <Users className={iconClass} />\n                        <input\n                            type="text"\n                            className={inputClass}\n                            placeholder="Vd: Mất gốc, Đội tuyển..."\n                            value={config.audience}\n                            onChange={e => handleChange(\'audience\', e.target.value)}\n                        />\n                    </div>\n                </div>');

// 3. RoadmapForm
const roadmapHtml = `
            <div className="group relative mt-4">
                <label className={labelClass}>Yêu cầu cá nhân hóa thêm (Tùy chọn)</label>
                <div className="relative">
                    <textarea
                        className={inputClass + " min-h-[80px] pt-3"}
                        placeholder="Vd: Muốn ưu tiên tự học qua Youtube, kết hợp flashcard..."
                        value={config.details || ''}
                        onChange={e => handleChange('details', e.target.value)}
                    />
                </div>
            </div>
`;
addDetailsToForm('components/RoadmapForm.tsx', roadmapHtml, '<div className="relative">\n                    <GraduationCap className={iconClass} />\n                    <textarea\n                        className={`${inputClass} pl-10 min-h-[80px] pt-3`}\n                        placeholder="Vd: Đạt điểm A, Làm được các bài tập phức tạp..."\n                        value={config.target}\n                        onChange={e => handleChange(\'target\', e.target.value)}\n                    />\n                </div>\n            </div>');


// 4. WorksheetForm
const worksheetHtml = `
                <div className="group relative mt-4">
                    <label className={labelClass}>Yêu cầu nâng cao (Tùy chọn)</label>
                    <div className="relative">
                        <textarea
                            className={inputClass + " min-h-[80px] pt-3 pl-4"}
                            placeholder="Vd: Chỉ ra 5 bài toán thực tế kết hợp vận động..."
                            value={config.details || ''}
                            onChange={e => handleChange('details', e.target.value)}
                        />
                    </div>
                </div>
`;
addDetailsToForm('components/WorksheetForm.tsx', worksheetHtml, '<div className="group relative">\n                    <label className={labelClass}>Người biên soạn (Giáo viên)</label>\n                    <div className="relative">\n                        <User className={iconClass} />\n                        <input\n                            type="text"\n                            className={inputClass}\n                            placeholder="Vd: Thầy Trần Huy Hoàng"\n                            value={config.teacherName}\n                            onChange={e => handleChange(\'teacherName\', e.target.value)}\n                            required\n                        />\n                    </div>\n                </div>');

