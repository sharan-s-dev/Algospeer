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
  BarChart2,
  Sparkles,
  RefreshCw,
  Loader2,
  FileText
} from 'lucide-react';
import type {
  InterviewScorecard,
  Problem,
  ProgrammingLanguage,
  LLMConfig,
  InterviewMessage,
  TestExecutionResult
} from '../types/interview';
import { generateMarkdownReport } from '../services/evaluator';
import { localLLMService } from '../services/localLLM';

interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scorecard: InterviewScorecard | null;
  problem: Problem;
  code: string;
  language: ProgrammingLanguage;
  onRestartRound: () => void;
  config?: LLMConfig;
  messages?: InterviewMessage[];
  testResults?: TestExecutionResult[];
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  isOpen,
  onClose,
  scorecard,
  problem,
  code,
  language,
  onRestartRound,
  config,
  messages = [],
  testResults = []
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'rubric' | 'ai-critique'>('rubric');
  const [aiCritique, setAiCritique] = useState<string>('');
  const [isLoadingCritique, setIsLoadingCritique] = useState<boolean>(false);

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

  // Automatically trigger AI critique when modal opens
  useEffect(() => {
    if (isOpen && problem && !aiCritique && config) {
      handleGenerateCritique();
    }
  }, [isOpen, problem, config]);

  const handleGenerateCritique = () => {
    if (!config) return;
    setIsLoadingCritique(true);
    localLLMService
      .generateScorecardCritique(problem, code, messages, testResults, config)
      .then((critique) => {
        setAiCritique(critique);
        setIsLoadingCritique(false);
      })
      .catch((err) => {
        console.error('Failed to generate critique:', err);
        setIsLoadingCritique(false);
      });
  };

  if (!isOpen || !scorecard) return null;

  const handleCopyReport = () => {
    const md = generateMarkdownReport(problem, scorecard, code, language, aiCritique);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const md = generateMarkdownReport(problem, scorecard, code, language, aiCritique);
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

        {/* Tab Bar: Rubric Assessment vs AI Bar-Raiser Analysis */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-[#181a24] bg-[#0c0d12]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rubric')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'rubric'
                  ? 'bg-[#1b1e2c] text-white border border-[#2e334a]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Rubric & Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-critique')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'ai-critique'
                  ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-purple-200 border border-purple-600/50 shadow-sm'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Bar-Raiser Analysis</span>
              {config?.backend === 'gemini' && (
                <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-700/50">
                  Gemini 3.8
                </span>
              )}
            </button>
          </div>

          {activeTab === 'ai-critique' && (
            <button
              onClick={handleGenerateCritique}
              disabled={isLoadingCritique}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161824] hover:bg-[#1f2233] border border-[#252839] text-xs font-mono text-slate-300 transition-colors"
              title="Regenerate Bar-Raiser analysis"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingCritique ? 'animate-spin text-purple-400' : 'text-slate-400'}`} />
              <span className="text-[11px]">{isLoadingCritique ? 'Analyzing...' : 'Regenerate'}</span>
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
          {activeTab === 'ai-critique' ? (
            /* AI Bar-Raiser Deep Dive Tab */
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-purple-950/40 via-[#13111f] to-indigo-950/40 border border-purple-900/40 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-sans">
                      Principal Engineer & Bar-Raiser Code Review
                    </h3>
                    <p className="text-[11px] text-purple-300/80 font-mono">
                      Deep structural critique of your code, algorithmic Big-O bounds, and interview strategy
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400">Model:</span>
                  <div className="text-xs font-bold text-purple-300 font-mono">
                    {config?.backend === 'gemini' ? 'Google Gemini 3.8 Flash' : 'Offline Heuristics'}
                  </div>
                </div>
              </div>

              {isLoadingCritique ? (
                <div className="rounded-lg bg-[#11121a] border border-[#1e202d] p-8 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
                  <div className="text-xs text-slate-300 font-medium">
                    Performing deep technical evaluation on your submitted code...
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Inspecting Big-O complexity, variable scopes, boundary safeguards, and conversation history
                  </div>
                </div>
              ) : aiCritique ? (
                <div className="rounded-lg bg-[#11121a] border border-[#1e202d] p-4 text-xs text-slate-200 leading-relaxed font-sans space-y-3 whitespace-pre-wrap">
                  {aiCritique}
                </div>
              ) : (
                <div className="rounded-lg bg-[#11121a] border border-[#1e202d] p-8 text-center space-y-2">
                  <FileText className="w-6 h-6 text-slate-500 mx-auto" />
                  <div className="text-xs text-slate-300">No critique generated yet.</div>
                  <button
                    onClick={handleGenerateCritique}
                    className="btn btn-primary text-xs py-1 px-3 mt-2"
                  >
                    Run Bar-Raiser Code Evaluation
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Standard Rubric & Metrics Tab */
            <>
              {/* Roommate Co-Pilot Banner */}
              {scorecard.friendProfile && (
                <div className="rounded-lg bg-[#181326] border border-[#3b2d56] p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 font-mono">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>Roommate Verdict for {scorecard.friendProfile.name}</span>
                    </span>
                    <span className="text-[11px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                      Target: {scorecard.friendProfile.targetCompany}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic pt-0.5">
                    "{scorecard.friendProfile.roommateFeedback || `Great hustle, ${scorecard.friendProfile.name}! Keep grinding and practicing thinking aloud.`}"
                  </p>
                </div>
              )}

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
            </>
          )}
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
