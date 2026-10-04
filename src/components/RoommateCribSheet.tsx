import React, { useState } from 'react';
import {
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Star,
  X,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import type { Problem, ProgrammingLanguage } from '../types/interview';

interface RoommateCribSheetProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  language: ProgrammingLanguage;
}

export const RoommateCribSheet: React.FC<RoommateCribSheetProps> = ({
  isOpen,
  onClose,
  problem,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'solutions' | 'questions' | 'pitfalls' | 'rubric'>(
    'solutions'
  );
  const [showSolutionCode, setShowSolutionCode] = useState(false);
  const [ratings, setRatings] = useState({
    clarification: 4,
    approach: 4,
    codeQuality: 4,
    testing: 4,
    communication: 4
  });
  const [roommateNotes, setRoommateNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-xl bg-[#0e0f15] border border-[#20222f] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#161822] border border-[#272a3b] flex items-center justify-center text-slate-200">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-sans">Peer Interviewer Co-Pilot HUD</h2>
                <span className="badge bg-[#1e172a] text-purple-300 border border-[#3b2d56] text-[10px] font-mono">
                  Interviewer Eyes Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Guide your peer through problem decomposition, probe invariants, and grade live.
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

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-[#1c1e2a] bg-[#0c0d12] flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab('solutions')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'solutions'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Optimal Solution & Proof</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Probing Questions ({problem.probingQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pitfalls')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'pitfalls'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            <span>Traps & Pitfalls</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rubric'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-slate-400" />
            <span>Live Rubric</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 select-text">
          {/* TAB 1: Optimal Solution & Proof */}
          {activeTab === 'solutions' && (
            <div className="space-y-3.5">
              <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3.5">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Complexity Benchmark</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-emerald-400">Time: {problem.optimalComplexity.time}</span>
                    <span className="text-purple-400">Space: {problem.optimalComplexity.space}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {problem.optimalComplexity.explanation}
                </p>
              </div>

              {/* Solution Code Toggle */}
              <div className="rounded-md bg-[#101118] border border-[#1d202c] overflow-hidden">
                <div className="p-2.5 bg-[#12131b] border-b border-[#1c1e2a] flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reference Solution ({language.toUpperCase()})</span>
                  </div>
                  <button
                    onClick={() => setShowSolutionCode(!showSolutionCode)}
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 font-mono"
                  >
                    {showSolutionCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSolutionCode ? 'Hide Code' : 'Reveal Code'}</span>
                  </button>
                </div>

                {showSolutionCode ? (
                  <pre className="p-4 text-xs font-mono bg-[#0c0d12] text-slate-200 overflow-x-auto leading-relaxed border-t border-[#161722]">
                    {language === 'javascript'
                      ? problem.solutionCode.javascript
                      : problem.solutionCode.python}
                  </pre>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs italic font-sans">
                    Hidden to protect candidate field of view. Click 'Reveal Code' when ready to verify syntax or invariants.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Probing Questions */}
          {activeTab === 'questions' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-sans">
                Interviewer Prompts — Ask these sequentially during the interview stages:
              </p>
              {problem.probingQuestions.map((q, idx) => (
                <div key={idx} className="rounded-md bg-[#11121a] border border-[#1d202c] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-[#151620] text-slate-300 border border-[#222432] text-[10px] font-mono">
                      Stage: {q.phase}
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-mono">Question #{idx + 1}</span>
                  </div>
                  <div className="text-xs font-semibold text-white font-sans">"{q.question}"</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#181924] text-[11.5px] font-sans">
                    <div className="rounded bg-[#10231b]/60 border border-[#1d4d38] p-2.5 text-slate-200">
                      <div className="font-semibold flex items-center gap-1 text-[11px] text-emerald-400 mb-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Good Answer Signal:</span>
                      </div>
                      <p className="leading-relaxed">{q.goodAnswer}</p>
                    </div>

                    <div className="rounded bg-[#281418]/60 border border-[#5e1927] p-2.5 text-slate-200">
                      <div className="font-semibold flex items-center gap-1 text-[11px] text-rose-400 mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Red Flag / Fallacy:</span>
                      </div>
                      <p className="leading-relaxed">{q.redFlag}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Traps & Candidate Pitfalls */}
          {activeTab === 'pitfalls' && (
            <div className="space-y-3">
              <div className="rounded-md bg-[#241f12]/50 border border-[#523f1c] p-4">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-2 mb-2 font-sans">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Common Candidate Pitfalls on "{problem.title}"</span>
                </div>
                <ul className="space-y-2">
                  {problem.trapsAndPitfalls.map((pitfall, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Live Score Rubric */}
          {activeTab === 'rubric' && (
            <div className="space-y-4">
              <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-200 mb-2 font-sans">
                  Live Candidate Scoring (1 to 5 Stars):
                </div>

                {[
                  { key: 'clarification', label: '1. Problem Clarification & Constraints' },
                  { key: 'approach', label: '2. Algorithmic Strategy & Big-O' },
                  { key: 'codeQuality', label: '3. Code Cleanliness & Bug-free Execution' },
                  { key: 'testing', label: '4. Self-Verification & Edge-case Dry Run' },
                  { key: 'communication', label: '5. Verbal Communication & Think-Aloud' }
                ].map((dim) => (
                  <div key={dim.key} className="flex items-center justify-between py-1.5 border-b border-[#181924]">
                    <span className="text-xs text-slate-300 font-medium font-sans">{dim.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setRatings({
                              ...ratings,
                              [dim.key]: star
                            })
                          }
                          className={`p-1 rounded transition-colors ${
                            (ratings as any)[dim.key] >= star
                              ? 'text-amber-400'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Private Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-sans">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Interviewer Private Notes:</span>
                </label>
                <textarea
                  value={roommateNotes}
                  onChange={(e) => setRoommateNotes(e.target.value)}
                  placeholder="Record observations, questions asked, or areas where the candidate hesitated..."
                  rows={3}
                  className="w-full bg-[#11121a] border border-[#1d202c] rounded-md p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#383d52] font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Interviewer Co-Pilot Session Active
          </span>
          <button onClick={onClose} className="btn btn-secondary text-xs py-1.5 px-4 font-mono">
            Close HUD
          </button>
        </div>
      </div>
    </div>
  );
};
