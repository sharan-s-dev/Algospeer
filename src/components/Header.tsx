import React, { useState } from 'react';
import {
  Code2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings as SettingsIcon,
  Award,
  Users,
  Lightbulb,
  FileCode2,
  ChevronDown,
  CheckCircle2
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
    { id: 'CODING', label: '3. Implement', number: 3 },
    { id: 'TESTING', label: '4. Verify', number: 4 },
    { id: 'DEBRIEF', label: '5. Debrief', number: 5 }
  ];

  const getBackendBadge = () => {
    if (config.backend === 'gemini') {
      const model = (config.geminiModel || 'gemini-3.8-flash').replace('gemini-', '');
      return { label: `Gemini ${model}`, dotColor: 'bg-indigo-400' };
    }
    return { label: 'Local Offline Engine', dotColor: 'bg-emerald-400' };
  };

  const backendInfo = getBackendBadge();

  return (
    <header className="h-12 border-b border-[#1c1e28] bg-[#0c0d12] px-3.5 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Problem Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#1c1e28]">
          <div className="w-7 h-7 rounded-md bg-[#161722] border border-[#262838] flex items-center justify-center text-slate-200">
            <Code2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs tracking-tight text-white font-sans">AlgosPeer</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161722] text-slate-400 border border-[#222434]">
              v1.0
            </span>
          </div>
        </div>

        {/* Problem Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProblemDropdownOpen(!isProblemDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#13141c] hover:bg-[#1a1c27] border border-[#20222f] text-xs font-medium text-slate-200 transition-colors"
          >
            <span className="max-w-[170px] truncate text-xs">{currentProblem.title}</span>
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
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isProblemDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 w-80 max-h-84 overflow-y-auto rounded-lg bg-[#111219] border border-[#242738] shadow-2xl p-1 z-50"
              onClick={() => setIsProblemDropdownOpen(false)}
            >
              <div className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 px-2.5 py-1.5 border-b border-[#1c1e2a] flex items-center justify-between">
                <span>Select Interview Problem</span>
                <span>{PROBLEMS.length} Available</span>
              </div>
              <div className="py-1">
                {PROBLEMS.map((prob) => {
                  const isSelected = prob.id === currentProblem.id;
                  return (
                    <div
                      key={prob.id}
                      onClick={() => onSelectProblem(prob)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#1b1e2a] text-white font-medium border border-[#2c3044]'
                          : 'hover:bg-[#161722] text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                          <span className="truncate">{prob.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{prob.category}</div>
                      </div>
                      <span
                        className={`badge text-[10px] shrink-0 ${
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
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Engine status indicator */}
        <div
          onClick={onOpenSettings}
          title="Configure local inference & voice engine"
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#13141c] hover:bg-[#1a1c27] border border-[#20222f] text-[11px] text-slate-300 cursor-pointer font-mono transition-colors"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${backendInfo.dotColor}`} />
          <span>{backendInfo.label}</span>
        </div>
      </div>

      {/* Center: Phase Stepper (Segmented Control) */}
      <div className="hidden lg:flex items-center bg-[#101118] p-0.5 rounded-md border border-[#1e202c]">
        {phases.map((p) => {
          const isActive = phase === p.id;
          const isPassed = phases.findIndex((x) => x.id === phase) > phases.findIndex((x) => x.id === p.id);
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

      {/* Right: Timer, Interview Mode, Modals */}
      <div className="flex items-center gap-2">
        {/* Stopwatch Timer */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#12131b] border border-[#20222f] text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold tracking-wider">{formatTimer(timerSeconds)}</span>
          <button
            onClick={onToggleTimer}
            title={isTimerRunning ? 'Pause timer' : 'Start timer'}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors ml-0.5"
          >
            {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={onResetTimer}
            title="Reset timer (45:00)"
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Roommate Co-Pilot HUD */}
        <button
          onClick={onToggleRoommateMode}
          className={`btn text-xs flex items-center gap-1.5 shadow-sm transition-all ${
            isRoommateMode
              ? 'bg-purple-950 text-purple-200 border-purple-700 ring-1 ring-purple-500/50'
              : 'bg-[#1e152d] hover:bg-[#281b3c] text-purple-300 border-[#3f295e]'
          }`}
          title="Open Roommate Co-Pilot HUD (Interviewer cheat sheet & live interventions)"
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Roommate Co-Pilot</span>
        </button>

        {/* Progressive Hints */}
        <button
          onClick={onOpenHints}
          className="btn btn-secondary text-xs relative"
          title="Open progressive hints"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Hints</span>
          {hintsUsed > 0 && (
            <span className="ml-0.5 px-1 rounded bg-[#271e11] text-amber-300 border border-[#854d0e] text-[10px] font-mono">
              {hintsUsed}
            </span>
          )}
        </button>

        {/* Scratchpad Whiteboard */}
        <button
          onClick={onToggleWhiteboard}
          className={`btn text-xs ${isWhiteboardOpen ? 'bg-[#1e212c] text-white border-[#2e3243]' : 'btn-secondary'}`}
          title="Toggle scratchpad / ASCII whiteboard"
        >
          <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Whiteboard</span>
        </button>

        {/* Evaluation Scorecard */}
        <button
          onClick={onOpenScorecard}
          className="btn btn-primary text-xs"
          title="Open interview evaluation rubric scorecard"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Scorecard</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="btn btn-ghost p-1.5 text-slate-400 hover:text-white"
          title="Engine & voice settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
