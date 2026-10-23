import React, { useRef, useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface LogConsoleProps {
  logs: string[];
  isRunning: boolean;
  onClearLogs: () => void;
}

export const LogConsole: React.FC<LogConsoleProps> = ({
  logs,
  isRunning,
  onClearLogs,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Terminal Window Header Bar */}
      <div className="flex items-center justify-between bg-black text-[#A3E635] px-3 py-1.5 border-4 border-b-0 border-black font-mono text-xs font-black uppercase">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#A3E635] stroke-[3]" />
          <span>🖥️ Real-Time System Log ({logs.length} dòng)</span>
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping ml-1" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLogs}
            className="px-2 py-0.5 bg-[#FFED66] text-black border border-black text-[10px] font-sans font-black uppercase hover:bg-yellow-300 transition-all cursor-pointer"
          >
            {copied ? '✓ Đã Copy Log' : 'Copy All Logs'}
          </button>
          <button
            type="button"
            onClick={onClearLogs}
            className="px-2 py-0.5 bg-[#FF5E5B] text-white border border-black text-[10px] font-sans font-black uppercase hover:bg-red-600 transition-all cursor-pointer"
          >
            Xóa Log
          </button>
        </div>
      </div>

      {/* Terminal Window Content */}
      <div 
        ref={terminalRef} 
        className="bg-[#18181b] border-4 border-black p-3 font-mono text-xs text-[#A3E635] h-48 overflow-y-auto space-y-1.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] select-text"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 italic py-4 text-center">
            [Hệ thống sẵn sàng. Nhấn "BẮT ĐẦU CHẠY 1-CLICK" để xem log giám sát thời gian thực...]
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed border-b border-gray-800/60 pb-1 whitespace-pre-wrap font-mono">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
