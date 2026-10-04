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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#0f1726] border border-[#223048] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1c2638] bg-[#121c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Progressive Hint Ladder</h2>
              <p className="text-[11px] text-slate-400">
                Unlock gentle nudges one level at a time without spoiling the complete solution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a263c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hints List */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {hints.map((hint) => {
            const isUnlocked = hint.level <= unlockedLevel;
            return (
              <div
                key={hint.level}
                className={`rounded-xl border p-4 transition-all ${
                  isUnlocked
                    ? 'bg-[#121b2d] border-amber-500/30 shadow-md shadow-amber-950/20'
                    : 'bg-[#0d1422] border-[#1a2538] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <Unlock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-xs font-bold text-white">
                      Level {hint.level}: {hint.label}
                    </span>
                  </div>
                  <span
                    className={`badge text-[10px] ${
                      isUnlocked
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                {isUnlocked ? (
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{hint.text}</p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Hint is hidden. Unlock to view this algorithmic guidance.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with Unlock Action */}
        <div className="p-4 border-t border-[#1c2638] bg-[#0c1322] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Hints unlocked: {unlockedLevel} / {hints.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {unlockedLevel < hints.length && (
              <button
                onClick={onUnlockNextHint}
                className="btn bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs py-1.5 px-3 shadow-lg"
              >
                <span>Unlock Level {unlockedLevel + 1} Hint</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={onClose} className="btn btn-secondary text-xs py-1.5 px-3">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
