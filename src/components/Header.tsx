import React, { useState } from 'react';
import {
  Brain,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings as SettingsIcon,
  Award,
  Users,
  User,
  Lightbulb,
  FileCode2,
  ChevronDown
} from 'lucide-react';
import type { InterviewPhase, LLMConfig, Problem } from '../types/interview';
import { PROBLEMS } from '../data/problems';

interface HeaderProps {
  currentProblem: Problem;
  onSelectProblem: (problem: Problem) => void;
  phase: InterviewPhase;
  onSelectPhase: (phase: InterviewPhase) => void;
  isRoommateMode: boolean;
  onToggleRoommateMode: () => void;
  onOpenSettings: () => void;
  onOpenScorecard: () => void;
  onOpenHints: () => void;
  onToggleWhiteboard: () => void;
  isWhiteboardOpen: boolean;
  hintsUsed: number;
  config: LLMConfig;
  webLlmProgress?: { text: string; progress: number } | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProblem,
  onSelectProblem,
  phase,
  onSelectPhase,
  isRoommateMode,
  onToggleRoommateMode,
  onOpenSettings,
  onOpenScorecard,
  onOpenHints,
  onToggleWhiteboard,
  isWhiteboardOpen,
  hintsUsed,
  config,
  timerSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer
}) => {
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const phases: { id: InterviewPhase; label: string; number: number }[] = [
    { id: 'CLARIFY', label: '1. Clarify', number: 1 },
    { id: 'APPROACH', label: '2. Approach', number: 2 },
    { id: 'CODING', label: '3. Coding', number: 3 },
    { id: 'TESTING', label: '4. Testing', number: 4 },
    { id: 'DEBRIEF', label: '5. Debrief', number: 5 }
  ];

  const getBackendBadge = () => {
    switch (config.backend) {
      case 'webllm':
        return { label: 'WebLLM (WebGPU)', color: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40' };
      case 'ollama':
        return { label: `Ollama (${config.ollamaModel || 'local'})`, color: 'text-violet-400 border-violet-800/60 bg-violet-950/40' };
      case 'lmstudio':
        return { label: 'LM Studio', color: 'text-amber-400 border-amber-800/60 bg-amber-950/40' };
      default:
        return { label: 'Local Heuristic AI', color: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40' };
    }
  };

  const backendInfo = getBackendBadge();

  return (
    <header className="h-14 border-b border-[#1c2638] bg-[#0d131f]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Problem Picker */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#1c2638]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">AlgosPeer</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Local
              </span>
            </div>
          </div>
        </div>

        {/* Problem Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProblemDropdownOpen(!isProblemDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141d2e] hover:bg-[#1a253a] border border-[#1f2b40] text-xs font-medium text-slate-200 transition-colors"
          >
            <span className="max-w-[160px] truncate">{currentProblem.title}</span>
            <span
              className={`badge text-[10px] ${
                currentProblem.difficulty === 'Easy'
                  ? 'badge-easy'
                  : currentProblem.difficulty === 'Medium'
                  ? 'badge-medium'
                  : 'badge-hard'
              }`}
            >
              {currentProblem.difficulty}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProblemDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 w-72 max-h-80 overflow-y-auto rounded-xl bg-[#0f1726] border border-[#223048] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsProblemDropdownOpen(false)}
            >
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select Interview Problem
              </div>
              {PROBLEMS.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem(prob)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    prob.id === currentProblem.id
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                      : 'hover:bg-[#172338] text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2 text-xs">
                    <div>{prob.title}</div>
                    <div className="text-[10px] text-slate-500">{prob.category}</div>
                  </div>
                  <span
                    className={`badge text-[10px] ${
                      prob.difficulty === 'Easy'
                        ? 'badge-easy'
                        : prob.difficulty === 'Medium'
                        ? 'badge-medium'
                        : 'badge-hard'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Backend status pill */}
        <div
          onClick={onOpenSettings}
          title="Click to configure local inference"
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium cursor-pointer transition-all hover:scale-105 ${backendInfo.color}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulsing-indicator" />
          <span>{backendInfo.label}</span>
        </div>
      </div>

      {/* Center: Phase Pipeline Stepper */}
      <div className="hidden lg:flex items-center gap-1 bg-[#0b101c] p-1 rounded-xl border border-[#1b2538]">
        {phases.map((p) => {
          const isActive = phase === p.id;
          const isPassed = phases.findIndex(x => x.id === phase) > phases.findIndex(x => x.id === p.id);
          return (
            <button
              key={p.id}
              onClick={() => onSelectPhase(p.id)}
              className={`phase-step ${isActive ? 'active' : isPassed ? 'completed' : 'pending'}`}
            >
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Timer, Mode Switch, Actions */}
      <div className="flex items-center gap-2">
        {/* Countdown Timer */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111929] border border-[#1d293d] text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{formatTimer(timerSeconds)}</span>
          <button
            onClick={onToggleTimer}
            title={isTimerRunning ? 'Pause timer' : 'Start timer'}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={onResetTimer}
            title="Reset timer (45m)"
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Solo vs Roommate Mode Toggle */}
        <button
          onClick={onToggleRoommateMode}
          className={`btn ${
            isRoommateMode
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-900/30'
              : 'btn-secondary text-xs'
          }`}
          title="Toggle Roommate / Peer Co-Pilot Mode"
        >
          {isRoommateMode ? (
            <>
              <Users className="w-3.5 h-3.5" />
              <span>Roommate HUD</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Solo AI</span>
            </>
          )}
        </button>

        {/* Hints Ladder Button */}
        <button
          onClick={onOpenHints}
          className="btn btn-secondary text-xs relative"
          title="Open progressive hints"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Hints</span>
          {hintsUsed > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] flex items-center justify-center font-bold">
              {hintsUsed}
            </span>
          )}
        </button>

        {/* Whiteboard / Scratchpad Toggle */}
        <button
          onClick={onToggleWhiteboard}
          className={`btn text-xs ${isWhiteboardOpen ? 'btn-primary' : 'btn-secondary'}`}
          title="Toggle scratchpad / ASCII whiteboard"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Whiteboard</span>
        </button>

        {/* End Interview & Scorecard Button */}
        <button
          onClick={onOpenScorecard}
          className="btn btn-accent text-xs"
          title="Complete round & evaluate rubric scorecard"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Scorecard</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="btn btn-ghost p-1.5 text-slate-400 hover:text-white"
          title="Configure local inference & voice"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
