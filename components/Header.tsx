import React, { useState, useEffect } from 'react';
import { FileEdit, Sparkles, Smartphone, Pin, Zap } from 'lucide-react';
import MobileAccessModal from './MobileAccessModal';
import { AutomationClient, NetworkInfo, AntigravityQuotaData } from '../services/automationClient';

interface HeaderProps {
  onSwitchToMobile?: () => void;
  globalPinnedPdf?: { fileName: string; numPages?: number } | null;
  isGlobalRagActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSwitchToMobile, globalPinnedPdf, isGlobalRagActive = true }) => {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [quotaData, setQuotaData] = useState<AntigravityQuotaData | null>(null);

  useEffect(() => {
    const fetchInfo = () => {
      AutomationClient.getNetworkInfo()
        .then(data => setNetworkInfo(data))
        .catch(() => {});
    };
    const fetchQuota = () => {
      AutomationClient.getQuota()
        .then(data => setQuotaData(data))
        .catch(() => {});
    };
    fetchInfo();
    fetchQuota();
    const interval = setInterval(fetchInfo, 3000);
    const quotaInterval = setInterval(fetchQuota, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(quotaInterval);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#ffffff] border-b-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="relative group">
                  <div className="relative bg-[#FF5E5B] border-4 border-black p-2.5 rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:-ml-1 group-hover:-mt-1 group-hover:shadow-none transition-all">
                    <FileEdit className="w-6 h-6 text-black stroke-[3]" />
                  </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-black tracking-widest uppercase flex items-center gap-2">
                  <span>Yuta<span className="text-[#00CECB]">!</span>LaTeX Multi-Studio</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-[#FFED66] border-2 border-black text-[9px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    Đa Môn Học
                  </span>
                </h1>
                <p className="text-[10px] text-black font-black tracking-widest uppercase flex items-center gap-1">
                  <span className="w-2 h-2 border-2 border-black rounded-none bg-[#A3E635]"></span>
                  Soạn Thảo Đa Môn & Video Manim (Toán • Lý • Hóa • Sinh • Anh • Tin • Sử • Địa)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
               {globalPinnedPdf && isGlobalRagActive && (
                 <div 
                   className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#A3E635] text-black font-black uppercase text-xs border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                   title={`Đang ghim tài liệu RAG: ${globalPinnedPdf.fileName}`}
                 >
                   <Pin className="w-3.5 h-3.5 stroke-[3] rotate-45 text-black" />
                   <span className="truncate max-w-[160px]">{globalPinnedPdf.fileName}</span>
                 </div>
               )}

               {onSwitchToMobile && (
                 <button 
                   onClick={onSwitchToMobile}
                   className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF90E8] text-black font-black uppercase text-xs border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
                   title="Chuyển sang giao diện điều khiển Remote Mobile"
                 >
                   <Smartphone className="w-4 h-4 stroke-[3]" />
                   <span className="hidden md:inline">Giao Diện Remote Mobile</span>
                 </button>
               )}

               {quotaData && (
                 <div
                   className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFED66] text-black font-black uppercase text-xs border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-default select-none"
                   title={`Hạn ngạch Antigravity Quota Live: Hàng tuần ${quotaData.weekly}%, 5 Tiếng ${quotaData.fiveHour}% (${quotaData.status})`}
                 >
                   <Zap className="w-3.5 h-3.5 text-purple-700 stroke-[3] fill-purple-700" />
                   <span className="text-[11px]">Quota:</span>
                   <span className={`text-[10px] px-1.5 py-0.2 border border-black font-mono font-black ${
                     quotaData.weekly <= 10 ? 'bg-red-600 text-white animate-pulse' : quotaData.weekly <= 25 ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
                   }`}>
                     {quotaData.weekly}% 1w
                   </span>
                   <span className={`text-[10px] px-1.5 py-0.2 border border-black font-mono font-black ${
                     quotaData.fiveHour <= 10 ? 'bg-red-600 text-white animate-pulse' : quotaData.fiveHour <= 25 ? 'bg-amber-400 text-black' : 'bg-emerald-600 text-white'
                   }`}>
                     {quotaData.fiveHour}% 5h
                   </span>
                 </div>
               )}

               <button 
                  onClick={() => setIsMobileModalOpen(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer ${
                    networkInfo?.isMobileConnected 
                      ? 'bg-[#A3E635] text-black' 
                      : 'bg-[#FFED66] text-black'
                  }`}
                  title={networkInfo?.isMobileConnected ? `Đã kết nối với điện thoại (${networkInfo.mobileDeviceName || 'Mobile'})` : 'Chưa kết nối với điện thoại'}
               >
                  <Smartphone className="w-4 h-4 stroke-[3]" />
                  <div className="flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black uppercase">Điện Thoại</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.2 border border-black ${
                        networkInfo?.isMobileConnected ? 'bg-black text-[#A3E635] animate-pulse' : 'bg-[#FF5E5B] text-white'
                      }`}>
                        {networkInfo?.isMobileConnected 
                          ? `🟢 Đã kết nối ${networkInfo.mobileDeviceName ? `(${networkInfo.mobileDeviceName})` : ''}` 
                          : '🔴 Chưa kết nối'}
                      </span>
                    </div>
                  </div>
               </button>

               <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs font-black text-black uppercase tracking-widest">Yuta Education</span>
                  <span className="text-[10px] text-black font-bold uppercase border-b-2 border-black">Toán Học & Manim</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#A3E635] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <Sparkles className="w-4 h-4 text-black stroke-[3]" />
                  <span className="text-sm font-black text-black uppercase">Pro</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      <MobileAccessModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </>
  );
};

export default Header;