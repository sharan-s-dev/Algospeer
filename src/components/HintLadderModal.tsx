import React from 'react';
import { Lightbulb, Lock, Unlock, X, ChevronRight, AlertCircle } from 'lucide-react';
import type { Hint } from '../types/interview';

interface HintLadderModalProps {
  isOpen: boolean;
  onClose: () => void;
  hints: Hint[];
  unlockedLevel: number;
  onUnlockNextHint: () => void;
}

export const HintLadderModal: React.FC<HintLadderModalProps> = ({
  isOpen,
  onClose,
  hints,
  unlockedLevel,
  onUnlockNextHint
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-[#0e0f15] border border-[#20222f] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#161822] border border-[#272a3b] flex items-center justify-center text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">Progressive Hint Ladder</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Calibrated tiered nudges to maintain problem solving flow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1a1c27] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hints List */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {hints.map((hint) => {
            const isUnlocked = hint.level <= unlockedLevel;
            return (
              <div
                key={hint.level}
                className={`rounded-md border p-3.5 transition-all ${
                  isUnlocked
                    ? 'bg-[#11121a] border-[#2c3044]'
                    : 'bg-[#0b0c11] border-[#181924] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span className="text-xs font-semibold text-white font-mono">
                      Level {hint.level}: {hint.label}
                    </span>
                  </div>
                  <span
                    className={`badge text-[10px] font-mono ${
                      isUnlocked
                        ? 'bg-[#241f12] text-amber-300 border-[#523f1c]'
                        : 'bg-[#151620] text-slate-500 border-[#20222f]'
                    }`}
                  >
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                {isUnlocked ? (
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{hint.text}</p>
                ) : (
                  <p className="text-xs text-slate-500 italic font-sans">
                    Tier is locked. Unlock sequentially to reveal this guidance.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with Unlock Action */}
        <div className="p-3.5 border-t border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Unlocked: {unlockedLevel} / {hints.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {unlockedLevel < hints.length && (
              <button
                onClick={onUnlockNextHint}
                className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-mono"
              >
                <span>Unlock Level {unlockedLevel + 1}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={onClose} className="btn btn-secondary text-xs py-1.5 px-3 font-mono">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
