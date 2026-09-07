import React, { useState, useEffect } from 'react';
import { Smartphone, Copy, Check, X, Wifi, Globe, ShieldCheck, Lock, RefreshCw, KeyRound } from 'lucide-react';
import { AutomationClient, NetworkInfo } from '../services/automationClient';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileAccessModal: React.FC<MobileAccessModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lan' | 'wan'>('lan');
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [isStartingTunnel, setIsStartingTunnel] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinSaved, setPinSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchInfo = () => {
        AutomationClient.getNetworkInfo()
          .then(data => {
            setNetworkInfo(data);
            if (data.hasPin && !pinInput) {
              setPinInput(AutomationClient.getSavedPin());
            }
          })
          .catch(() => {
            setNetworkInfo({
              lanIp: '192.168.1.X',
              port: 3000,
              mobileUrl: 'http://localhost:3000',
              isMobileConnected: false,
            });
          });
      };
      fetchInfo();
      const interval = setInterval(fetchInfo, 2500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = activeTab === 'lan' 
    ? (networkInfo?.mobileUrl || '') 
    : (networkInfo?.wanUrl || '');

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleTunnel = async () => {
    setIsStartingTunnel(true);
    try {
      if (networkInfo?.isWanActive) {
        await AutomationClient.stopTunnel();
      } else {
        await AutomationClient.startTunnel();
      }
      const updated = await AutomationClient.getNetworkInfo();
      setNetworkInfo(updated);
    } catch (err) {
      console.error('Tunnel toggle error:', err);
    } finally {
      setIsStartingTunnel(false);
    }
  };

  const handleSavePin = async () => {
    const res = await AutomationClient.setSecurityPin(pinInput.trim());
    if (res.success) {
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-4 border-black p-6 shadow-[10px_10px_0_0_rgba(0,0,0,1)] max-w-md w-full space-y-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-[#FF5E5B] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FF3333] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          <X className="w-5 h-5 text-white stroke-[3]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FFED66] border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <Smartphone className="w-6 h-6 text-black stroke-[3]" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase text-black tracking-wider">
              📱 Điều Khiển Từ Xa Trên Điện Thoại
            </h3>
            <p className="text-[11px] font-bold text-gray-700 uppercase">
              Chạy ngầm toàn bộ AI & LaTeX qua Wi-Fi hoặc 4G/5G Internet
            </p>
          </div>
        </div>

        {/* Tab Navigation: LAN vs WAN */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
          <button
            onClick={() => setActiveTab('lan')}
            className={`py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'lan'
                ? 'bg-[#FFED66] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'text-white hover:text-[#FFED66]'
            }`}
          >
            <Wifi className="w-4 h-4 stroke-[3]" />
            <span>📶 Nội Bộ (Wi-Fi LAN)</span>
          </button>

          <button
            onClick={() => setActiveTab('wan')}
            className={`py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'wan'
                ? 'bg-[#00CECB] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'text-white hover:text-[#00CECB]'
            }`}
          >
            <Globe className="w-4 h-4 stroke-[3]" />
            <span>🌐 Internet (WAN 4G/5G)</span>
          </button>
        </div>

        {/* Connection Status Box */}
        <div className={`p-3 border-3 border-black font-black text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-colors ${
          networkInfo?.isMobileConnected ? 'bg-[#A3E635] text-black' : 'bg-[#FF5E5B]/20 text-black'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{networkInfo?.isMobileConnected ? '🟢' : '🔴'}</span>
              <div>
                <div className="uppercase">
                  {networkInfo?.isMobileConnected ? 'Đã Kết Nối Với Điện Thoại' : 'Chưa Kết Nối Điện Thoại'}
                </div>
                {networkInfo?.isMobileConnected && networkInfo.mobileDeviceName && (
                  <div className="text-[10px] font-mono text-gray-800">
                    Thiết bị: {networkInfo.mobileDeviceName} ({networkInfo.mobileIp || 'LAN'})
                  </div>
                )}
              </div>
            </div>
            {networkInfo?.isMobileConnected ? (
              <span className="px-2 py-0.5 bg-black text-[#A3E635] text-[10px] uppercase font-mono animate-pulse">
                Live Active
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-black text-white text-[10px] uppercase font-mono">
                Đang chờ...
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: LAN (Wi-Fi) View */}
        {activeTab === 'lan' && (
          <div className="bg-[#00CECB]/15 border-3 border-black p-4 space-y-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between text-xs font-black uppercase text-black">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-700 stroke-[3]" />
                Địa Chỉ Kết Nối Mạng Nội Bộ Wi-Fi:
              </span>
              <span className="bg-black text-[#FFED66] px-2 py-0.5 text-[10px] font-mono">
                IP: {networkInfo?.lanIp || '192.168.1.X'}
              </span>
            </div>

            {/* QR Code Container */}
            {networkInfo?.mobileUrl && (
              <div className="flex flex-col items-center justify-center p-3 bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-none my-1">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(networkInfo.mobileUrl)}`}
                  alt="QR Code Kết Nối Wi-Fi"
                  className="w-36 h-36 border-2 border-black p-1 bg-white"
                />
                <span className="text-[10px] font-black uppercase text-black mt-2 bg-[#FFED66] px-2 py-0.5 border border-black">
                  Bắt cùng Wi-Fi & quét QR để mở
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={networkInfo?.mobileUrl || 'Đang tải kết nối...'}
                className="w-full p-2.5 bg-white border-2 border-black text-xs font-mono font-black text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none"
              />
              <button
                onClick={() => handleCopy(networkInfo?.mobileUrl || '')}
                disabled={!networkInfo}
                className={`p-2.5 border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#A3E635] text-black'
                    : 'bg-[#FFED66] hover:bg-[#FDE047] text-black'
                }`}
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
                <span>{copied ? 'Đã chép' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WAN (Internet 4G/5G) View */}
        {activeTab === 'wan' && (
          <div className="bg-[#FF90E8]/15 border-3 border-black p-4 space-y-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-700 stroke-[3]" />
                Đường Hầm WAN (Kết Nối Từ Xa Internet):
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                networkInfo?.isWanActive ? 'bg-[#A3E635] text-black' : 'bg-gray-200 text-gray-700'
              }`}>
                {networkInfo?.isWanActive ? '🟢 ĐANG BẬT WAN' : '⚪ ĐÃ TẮT WAN'}
              </span>
            </div>

            {/* Wan Start/Stop Action Card */}
            <div className="flex items-center justify-between bg-white border-2 border-black p-2.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <span className="text-xs font-bold text-gray-800">
                {networkInfo?.isWanActive ? 'Đường hầm HTTPS trực tuyến đã sẵn sàng' : 'Tạo link kết nối 4G/5G toàn cầu'}
              </span>
              <button
                onClick={handleToggleTunnel}
                disabled={isStartingTunnel}
                className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                  networkInfo?.isWanActive 
                    ? 'bg-[#FF5E5B] text-white hover:bg-[#FF3333]' 
                    : 'bg-[#A3E635] text-black hover:bg-[#86EFAC]'
                }`}
              >
                {isStartingTunnel ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[3]" />
                    <span>Đang tạo...</span>
                  </>
                ) : networkInfo?.isWanActive ? (
                  <span>⏹️ Đóng Đường Hầm WAN</span>
                ) : (
                  <span>⚡ Bật Kết Nối WAN</span>
                )}
              </button>
            </div>

            {/* WAN QR Code Container */}
            {networkInfo?.isWanActive && networkInfo?.wanUrl && (
              <div className="flex flex-col items-center justify-center p-3 bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-none my-1">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(networkInfo.wanUrl)}`}
                  alt="QR Code Kết Nối WAN"
                  className="w-36 h-36 border-2 border-black p-1 bg-white"
                />
                <span className="text-[10px] font-black uppercase text-black mt-2 bg-[#A3E635] px-2 py-0.5 border border-black">
                  🌐 Quét bằng 4G / 5G / Wi-Fi ở bất cứ đâu!
                </span>
              </div>
            )}

            {networkInfo?.isWanActive && networkInfo?.wanUrl && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={networkInfo.wanUrl}
                  className="w-full p-2.5 bg-white border-2 border-black text-xs font-mono font-black text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(networkInfo.wanUrl || '')}
                  className={`p-2.5 border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
                    copied
                      ? 'bg-[#A3E635] text-black'
                      : 'bg-[#FFED66] hover:bg-[#FDE047] text-black'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
                  <span>{copied ? 'Đã chép' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Security PIN Setup Box */}
            <div className="p-3 bg-white border-2 border-black space-y-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-black flex items-center gap-1">
                  <KeyRound className="w-4 h-4 text-amber-600 stroke-[3]" />
                  Mã PIN Bảo Mật Điện Thoại (4 Số):
                </span>
                {networkInfo?.hasPin && (
                  <span className="text-[10px] font-black uppercase bg-[#A3E635] px-1.5 py-0.5 border border-black">
                    🔒 Đã Bật Bảo Vệ PIN
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-600">
                Đặt mã PIN để tránh người lạ có link WAN gửi lệnh điều khiển máy tính của bạn.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Ví dụ: 1234 (để trống nếu không muốn dùng PIN)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full p-2 bg-gray-50 border-2 border-black text-xs font-mono font-black text-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] focus:outline-none"
                />
                <button
                  onClick={handleSavePin}
                  className={`px-3 py-2 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
                    pinSaved ? 'bg-[#A3E635] text-black' : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {pinSaved ? 'Đã Lưu PIN' : 'Lưu PIN'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2 text-xs font-medium text-black">
          <p className="font-black uppercase flex items-center gap-1 text-gray-800">
            <ShieldCheck className="w-4 h-4 text-blue-700 stroke-[3]" />
            Hướng dẫn sử dụng điều khiển từ xa:
          </p>
          <ol className="list-decimal list-inside space-y-1 font-bold text-gray-700 text-[11px]">
            {activeTab === 'lan' ? (
              <>
                <li>Bắt chung **Wi-Fi** với máy tính này.</li>
                <li>Mở **Camera** quét mã QR trên hoặc truy cập IP nội bộ.</li>
              </>
            ) : (
              <>
                <li>Bấm **⚡ Bật Kết Nối WAN** để lấy đường dẫn HTTPS toàn cầu.</li>
                <li>Dùng điện thoại kết nối **4G/5G hoặc Wi-Fi bất kỳ ở ngoài** để điều khiển máy tính nhà.</li>
              </>
            )}
            <li>Máy tính ở nhà sẽ tự động thực thi workflow ngầm (Gemini / Playwright / Manim) và trả kết quả về điện thoại.</li>
          </ol>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t-2 border-black text-[11px] font-bold text-gray-600 flex justify-between items-center">
          <span>⚡ Trình điều khiển đa mạng Yuta! Studio</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white text-xs font-black uppercase border-2 border-black hover:bg-gray-800 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAccessModal;
