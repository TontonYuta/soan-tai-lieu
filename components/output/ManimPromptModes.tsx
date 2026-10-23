import React, { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { VideoConfig } from '../../types';
import { 
  generateManimStoryboardPrompt, 
  generateManimCodePrompt, 
  generateVideoManimPrompt 
} from '../../services/prompts/manim';

interface ManimPromptModesProps {
  videoConfig: VideoConfig;
  onSelectPrompt?: (prompt: string) => void;
}

const ManimPromptModes: React.FC<ManimPromptModesProps> = ({ videoConfig, onSelectPrompt }) => {
  const [manimTab, setManimTab] = useState<'turn1' | 'turn2' | 'combined'>('turn1');

  const turn1Prompt = useMemo(() => generateManimStoryboardPrompt(videoConfig), [videoConfig]);
  const turn2Prompt = useMemo(() => generateManimCodePrompt(videoConfig), [videoConfig]);
  const combinedPrompt = useMemo(() => generateVideoManimPrompt(videoConfig), [videoConfig]);

  return (
    <div className="bg-[#f1f5f9] border-b-2 border-black px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-black stroke-[3]" />
        <span className="text-xs font-black uppercase text-black tracking-wider">Chế độ Prompt Video:</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setManimTab('turn1');
            if (onSelectPrompt && turn1Prompt) onSelectPrompt(turn1Prompt);
          }}
          className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
            manimTab === 'turn1' ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-[#FFED66]'
          }`}
        >
          🎬 [Lượt 1] Kịch Bản & Lời Thoại
        </button>
        <button
          type="button"
          onClick={() => {
            setManimTab('turn2');
            if (onSelectPrompt && turn2Prompt) onSelectPrompt(turn2Prompt);
          }}
          className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
            manimTab === 'turn2' ? 'bg-[#00CECB] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-[#FFED66]'
          }`}
        >
          💻 [Lượt 2] Lệnh Sinh Code
        </button>
        <button
          type="button"
          onClick={() => {
            setManimTab('combined');
            if (onSelectPrompt && combinedPrompt) onSelectPrompt(combinedPrompt);
          }}
          className={`px-3 py-1 text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
            manimTab === 'combined' ? 'bg-[#FFED66] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-[#FFED66]'
          }`}
        >
          ⚡ [Prompt Gộp] 1-Shot
        </button>
      </div>
    </div>
  );
};

export default ManimPromptModes;
