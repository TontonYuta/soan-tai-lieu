import React from 'react';
import { ListVideo, Play } from 'lucide-react';

export interface PlaylistVideoItem {
  episode: number;
  title: string;
  videoUrl: string;
  videoPath: string;
  audioUrl?: string;
  audioPath?: string;
}

interface PlaylistBarProps {
  playlistVideos?: PlaylistVideoItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const PlaylistBar: React.FC<PlaylistBarProps> = ({
  playlistVideos = [],
  selectedIndex,
  onSelectIndex,
}) => {
  if (playlistVideos.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FFED66] border-4 border-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase text-black flex items-center gap-2">
          <ListVideo className="w-4 h-4 stroke-[3]" />
          Danh Sách Phát Playlist ({playlistVideos.length} Tập Đã Sản Xuất)
        </span>
        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black font-mono">
          Đang phát: Tập {selectedIndex + 1}/{playlistVideos.length}
        </span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {playlistVideos.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectIndex(idx)}
            className={`px-3 py-2 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedIndex === idx
                ? 'bg-black text-[#FFED66] shadow-none translate-x-[2px] translate-y-[2px]'
                : 'bg-white text-black hover:bg-[#FF90E8] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 stroke-[3] ${selectedIndex === idx ? 'fill-[#FFED66]' : ''}`} />
            <span>Tập {item.episode || (idx + 1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
