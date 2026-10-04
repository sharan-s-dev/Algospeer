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
  RotateCcw,
  BarChart2
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
          particleCount: 80,
          spread: 60,
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
        return { color: 'bg-[#10231b] text-emerald-300 border-[#1d4d38]', label: 'Strong Hire' };
      case 'Hire':
        return { color: 'bg-[#111e33] text-blue-300 border-[#1e3a63]', label: 'Hire' };
      case 'Lean Hire':
        return { color: 'bg-[#241f12] text-amber-300 border-[#523f1c]', label: 'Lean Hire' };
      case 'Lean No Hire':
        return { color: 'bg-[#281a14] text-orange-300 border-[#5e2b17]', label: 'Lean No Hire' };
      default:
        return { color: 'bg-[#281418] text-rose-300 border-[#5e1927]', label: 'No Hire' };
    }
  };

  const decisionBadge = getDecisionBadge(scorecard.hiringDecision);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-xl bg-[#0e0f15] border border-[#20222f] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#161822] border border-[#272a3b] flex items-center justify-center text-slate-200">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-sans">Technical Evaluation Scorecard</h2>
                <span className={`badge text-xs px-2 py-0.5 border font-mono ${decisionBadge.color}`}>
                  {decisionBadge.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Candidate Evaluation • {problem.title} ({problem.difficulty})
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
          {/* Top Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3 text-center">
              <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Evaluation Score
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {scorecard.overallScore}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
            </div>

            <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3 text-center">
              <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Test Suite
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {scorecard.testCasesPassed}<span className="text-xs text-slate-500 font-normal">/{scorecard.totalTestCases}</span>
              </div>
            </div>

            <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3 text-center">
              <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Time Elapsed
              </div>
              <div className="text-2xl font-bold text-slate-200 font-mono">
                {formatTime(scorecard.timeElapsedSeconds)}
              </div>
            </div>

            <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3 text-center">
              <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Hints Used
              </div>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {scorecard.hintsUsed}
              </div>
            </div>
          </div>

          {/* Competency Rubric Assessment */}
          <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-4 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#181a24]">
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Competency Dimension Assessment</span>
            </div>

            {Object.values(scorecard.dimensions).map((dim, idx) => {
              const pct = (dim.score / dim.maxScore) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 font-sans">{dim.name}</span>
                    <span className="font-mono text-slate-300 font-semibold text-[11px]">
                      {dim.score} / {dim.maxScore}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#161722] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">{dim.feedback}</div>
                </div>
              );
            })}
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Strengths */}
            <div className="rounded-md bg-[#10231b]/50 border border-[#1d4d38] p-3.5 space-y-2">
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Demonstrated Strengths</span>
              </div>
              <ul className="space-y-1 text-[11.5px] text-slate-200 font-sans">
                {scorecard.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="rounded-md bg-[#241f12]/50 border border-[#523f1c] p-3.5 space-y-2">
              <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Areas for Growth</span>
              </div>
              <ul className="space-y-1 text-[11.5px] text-slate-200 font-sans">
                {scorecard.areasToImprove.map((area, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold select-none">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <button
            onClick={onRestartRound}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Retake Interview</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="Copy markdown debrief"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Debrief'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="Download markdown scorecard report"
            >
              <Download className="w-3 h-3" />
              <span>Export Report (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
