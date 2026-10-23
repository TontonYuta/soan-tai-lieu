import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { AntigravityQuotaData } from '../../services/automationClient';

interface AntigravityQuotaPanelProps {
  selectedAi: string;
  quotaData: AntigravityQuotaData | null;
  quotaWeekly: number;
  quota5h: number;
  quotaStatus: string;
  isSyncingQuota: boolean;
  onSyncQuota: (force?: boolean) => void;
}

export const AntigravityQuotaPanel: React.FC<AntigravityQuotaPanelProps> = ({
  selectedAi,
  quotaData,
  quotaWeekly,
  quota5h,
  quotaStatus,
  isSyncingQuota,
  onSyncQuota,
}) => {
  if (selectedAi !== 'antigravity' && selectedAi !== 'gemini') {
    return null;
  }

  return (
    <div className="p-3 bg-[#FFED66]/30 border-2 border-black space-y-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-black uppercase text-black">
          <Zap className="w-4 h-4 text-purple-700 stroke-[3] fill-purple-700" />
          <span>⚡ Hạn Ngạch Quota Antigravity Real-Time:</span>
          {quotaData?.source === 'live_agent' && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 border border-emerald-600">
              Live RPC (Port {quotaData.port})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap font-mono">
          {/* Hàng tuần */}
          <div 
            className={`flex items-center gap-1.5 font-black px-3 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
              quotaWeekly <= 10 ? 'bg-red-600 text-white animate-pulse' : quotaWeekly <= 25 ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
            }`} 
            title={quotaData?.weeklyDesc || 'Hạn ngạch tuần 1w còn lại'}
          >
            <span className="text-[10px] font-sans font-bold opacity-90">Hàng tuần (1w):</span>
            <span className="text-sm">{quotaWeekly}%</span>
          </div>

          {/* 5 Tiếng */}
          <div 
            className={`flex items-center gap-1.5 font-black px-3 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
              quota5h <= 10 ? 'bg-red-600 text-white animate-pulse' : quota5h <= 25 ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
            }`} 
            title={quotaData?.fiveHourDesc || 'Hạn ngạch 5 tiếng 5h còn lại'}
          >
            <span className="text-[10px] font-sans font-bold opacity-90">5 Tiếng (5h):</span>
            <span className="text-sm">{quota5h}%</span>
          </div>

          {/* Claude / GPT (nếu có thông tin) */}
          {quotaData?.claudeWeekly !== undefined && (
            <div 
              className="hidden sm:flex items-center gap-1.5 bg-indigo-600 text-white font-black px-3 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              title="Hạn ngạch nhóm mô hình Claude 3.7/Sonnet & GPT-OSS"
            >
              <span className="text-[10px] text-indigo-100 font-sans font-bold">Claude/GPT:</span>
              <span className="text-sm">{quotaData.claudeWeekly}%</span>
            </div>
          )}

          {/* Trạng thái */}
          <div className="flex items-center gap-1.5 bg-white text-black font-bold px-2.5 py-1 border border-black text-xs">
            <span className="text-emerald-700 font-black">{quotaStatus}</span>
          </div>

          {/* Nút Sync làm mới Quota */}
          <button
            type="button"
            onClick={() => onSyncQuota(true)}
            disabled={isSyncingQuota}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-xs font-black uppercase shadow-[1px_1px_0_0_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50"
            title="Bấm để đồng bộ dữ liệu Quota mới nhất trực tiếp từ Antigravity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingQuota ? 'animate-spin text-purple-700' : ''}`} />
            <span>{isSyncingQuota ? 'Đang sync...' : 'Sync Quota'}</span>
          </button>
        </div>
      </div>

      {/* Thông tin mô tả chi tiết thời gian hồi phục */}
      {(quotaData?.fiveHourDesc || quotaData?.weeklyDesc) && (
        <div className="text-[11px] font-semibold text-gray-700 flex flex-wrap items-center gap-x-4 gap-y-1 bg-white/70 p-1.5 border border-black/20">
          {quotaData.fiveHourDesc && (
            <span className="flex items-center gap-1 text-slate-800">
              <span>⏱️ <strong>5 Tiếng:</strong> {quotaData.fiveHourDesc}</span>
            </span>
          )}
          {quotaData.weeklyDesc && (
            <span className="flex items-center gap-1 text-slate-800">
              <span>📅 <strong>Hàng tuần:</strong> {quotaData.weeklyDesc}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
