import React, { useState } from 'react';
import { FastForward, User, ShieldAlert, Radio } from 'lucide-react';

export interface DialogueLine {
  speaker: string;
  text: string;
  role: 'HERO' | 'ALLY' | 'VILLAIN' | 'POLICE';
}

interface DialogueOverlayProps {
  dialogue: DialogueLine[];
  onComplete: () => void;
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ dialogue, onComplete }) => {
  const [index, setIndex] = useState(0);

  if (!dialogue || dialogue.length === 0) return null;
  const current = dialogue[index] || dialogue[0];

  const handleNext = () => {
    if (index + 1 < dialogue.length) {
      setIndex(index + 1);
    } else {
      onComplete();
    }
  };

  const getRoleBadge = (role: DialogueLine['role']) => {
    switch (role) {
      case 'HERO':
        return { text: 'VANGUARD WEAVER', color: 'bg-cyan-950 text-cyan-400 border-cyan-800' };
      case 'POLICE':
        return { text: 'NEO-HAVEN P.D. DISPATCH', color: 'bg-blue-950 text-blue-400 border-blue-800' };
      case 'VILLAIN':
        return { text: 'SYNDICATE TRANSMISSION', color: 'bg-purple-950 text-purple-400 border-purple-800' };
      default:
        return { text: 'TACTICAL ALLY', color: 'bg-amber-950 text-amber-400 border-amber-800' };
    }
  };

  const badge = getRoleBadge(current.role);

  return (
    <div className="absolute inset-x-4 bottom-28 sm:bottom-32 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 w-auto sm:w-[650px] pointer-events-auto select-none">
      <div className="bg-slate-950/95 border-2 border-cyan-500/60 rounded-xl p-4 shadow-2xl flex flex-col gap-2">
        {/* Speaker Info */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.color}`}>
              {badge.text}
            </span>
            <span className="text-sm font-bold text-white">{current.speaker}</span>
          </div>

          <button
            onClick={onComplete}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 font-mono cursor-pointer"
          >
            <span>SKIP ALL</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message body */}
        <p className="text-sm text-slate-200 leading-relaxed font-sans mt-1">
          "{current.text}"
        </p>

        {/* Next / Continue button */}
        <div className="flex justify-end mt-2">
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black tracking-wider uppercase shadow-md cursor-pointer active:scale-95 transition-all"
          >
            {index + 1 < dialogue.length ? 'NEXT ▶' : 'CONTINUE ▶'}
          </button>
        </div>
      </div>
    </div>
  );
};
