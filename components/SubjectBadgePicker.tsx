import React from "react";
import { COMMON_SUBJECTS } from "../types";

interface SubjectBadgePickerProps {
  selectedSubject: string;
  onSelectSubject: (subjectName: string, defaultTopic?: string) => void;
  className?: string;
}

const SubjectBadgePicker: React.FC<SubjectBadgePickerProps> = ({
  selectedSubject,
  onSelectSubject,
  className = ""
}) => {
  return (
    <div className={"space-y-1.5 " + className}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-black">
          ⚡ Chọn nhanh môn học:
        </span>
        <span className="text-[10px] font-bold text-gray-500 italic">
          (Chuẩn hóa bộ quy tắc đa môn)
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COMMON_SUBJECTS.map((sub) => {
          const isSelected = selectedSubject?.trim().toLowerCase() === sub.id.toLowerCase();
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelectSubject(sub.id, sub.defaultTopic)}
              className={"px-2.5 py-1 text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1 uppercase tracking-tight " + (
                isSelected
                  ? "bg-[#FFED66] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]"
                  : "bg-white text-black hover:bg-slate-100 shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
              )}
            >
              <span>{sub.icon}</span>
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectBadgePicker;
