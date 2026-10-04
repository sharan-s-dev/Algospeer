import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  Download,
  Copy,
  Check,
  X,
  Zap,
  RotateCcw
} from 'lucide-react';
import type { InterviewScorecard, Problem, ProgrammingLanguage } from '../types/interview';
import { generateMarkdownReport } from '../services/evaluator';

interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scorecard: InterviewScorecard | null;
  problem: Problem;
  code: string;
  language: ProgrammingLanguage;
  onRestartRound: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  isOpen,
  onClose,
  scorecard,
  problem,
  code,
  language,
  onRestartRound
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && scorecard) {
      if (scorecard.hiringDecision === 'Strong Hire' || scorecard.hiringDecision === 'Hire') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [isOpen, scorecard]);

  if (!isOpen || !scorecard) return null;

  const handleCopyReport = () => {
    const md = generateMarkdownReport(problem, scorecard, code, language);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const md = generateMarkdownReport(problem, scorecard, code, language);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-scorecard-${problem.id}-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'Strong Hire':
        return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'Strong Hire' };
      case 'Hire':
        return { color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', label: 'Hire' };
      case 'Lean Hire':
        return { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'Lean Hire' };
      case 'Lean No Hire':
        return { color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', label: 'Lean No Hire' };
      default:
        return { color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'No Hire' };
    }
  };

  const decisionBadge = getDecisionBadge(scorecard.hiringDecision);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0e1524] border border-[#23324d] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1c2638] bg-[#121c2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Interview Evaluation Scorecard</h2>
                <span className={`badge text-xs px-2.5 py-0.5 border ${decisionBadge.color}`}>
                  {decisionBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evaluation for "{problem.title}" ({problem.difficulty})
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 select-text">
          {/* Top Summary Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-[#131b2d] border border-[#1e2a40] p-3.5 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Overall Score
              </div>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                {scorecard.overallScore}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#131b2d] border border-[#1e2a40] p-3.5 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Test Cases
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {scorecard.testCasesPassed}<span className="text-xs text-slate-500 font-normal">/{scorecard.totalTestCases}</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#131b2d] border border-[#1e2a40] p-3.5 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Duration
              </div>
              <div className="text-2xl font-extrabold text-purple-400 font-mono">
                {formatTime(scorecard.timeElapsedSeconds)}
              </div>
            </div>

            <div className="rounded-xl bg-[#131b2d] border border-[#1e2a40] p-3.5 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Hints Used
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {scorecard.hintsUsed}
              </div>
            </div>
          </div>

          {/* Rubric Breakdown */}
          <div className="rounded-xl bg-[#121929] border border-[#1f2b40] p-4 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Competency Rubric Assessment</span>
            </h3>

            {Object.values(scorecard.dimensions).map((dim, idx) => {
              const pct = (dim.score / dim.maxScore) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{dim.name}</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {dim.score} / {dim.maxScore}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[#0a0f18] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">{dim.feedback}</div>
                </div>
              );
            })}
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {scorecard.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-4 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Areas for Development</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {scorecard.areasToImprove.map((area, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1c2638] bg-[#0c1322] flex items-center justify-between">
          <button
            onClick={onRestartRound}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Interview</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="Copy markdown debrief to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="Download markdown scorecard report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
