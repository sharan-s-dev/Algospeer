import React, { useState } from 'react';
import {
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  FileCode,
  BookOpen,
  Star,
  X,
  MessageSquare
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0f1726] border border-[#2b3a54] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1c2638] bg-[#121c2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Roommate Interviewer Co-Pilot HUD</h2>
                <span className="badge bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px]">
                  Interviewer Eyes Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                You are conducting the interview! Use this cheat sheet to probe your roommate, catch bugs, and rate their performance.
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

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-[#1c2638] bg-[#0c1322] flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('solutions')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'solutions'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Optimal Solution & Proof</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Probing Questions to Ask ({problem.probingQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pitfalls')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'pitfalls'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Traps & Candidate Pitfalls</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rubric'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Live Score Rubric</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 select-text">
          {/* TAB 1: Optimal Solution & Proof */}
          {activeTab === 'solutions' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#121929] border border-[#1f2b40] p-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Complexity Benchmark</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-cyan-400">Time: {problem.optimalComplexity.time}</span>
                    <span className="text-purple-400">Space: {problem.optimalComplexity.space}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {problem.optimalComplexity.explanation}
                </p>
              </div>

              {/* Solution Code Toggle */}
              <div className="rounded-xl bg-[#101726] border border-[#1e2a3f] overflow-hidden">
                <div className="p-3 bg-[#131d30] border-b border-[#1c273c] flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Official Reference Solution ({language.toUpperCase()})</span>
                  </div>
                  <button
                    onClick={() => setShowSolutionCode(!showSolutionCode)}
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
                  >
                    {showSolutionCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSolutionCode ? 'Hide Code' : 'Reveal Code'}</span>
                  </button>
                </div>

                {showSolutionCode ? (
                  <pre className="p-4 text-xs font-mono bg-[#0b0f19] text-emerald-300 overflow-x-auto leading-relaxed">
                    {language === 'javascript'
                      ? problem.solutionCode.javascript
                      : problem.solutionCode.python}
                  </pre>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    Solution is hidden to prevent candidate glance. Click 'Reveal Code' when ready to verify.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Probing Questions */}
          {activeTab === 'questions' && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-400 mb-2 font-sans">
                Ask your roommate these exact questions during each phase of their interview:
              </p>
              {problem.probingQuestions.map((q, idx) => (
                <div key={idx} className="rounded-xl bg-[#111929] border border-[#1f2b40] p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="badge bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 text-[10px] font-mono">
                      Phase: {q.phase}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">Question #{idx + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-white font-sans">"{q.question}"</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#1a2538] text-[11.5px]">
                    <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/30 p-2.5 text-emerald-300">
                      <div className="font-bold flex items-center gap-1 text-[11px] text-emerald-400 mb-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>What a Good Answer Sounds Like:</span>
                      </div>
                      <p className="leading-relaxed">{q.goodAnswer}</p>
                    </div>

                    <div className="rounded-lg bg-rose-950/20 border border-rose-900/30 p-2.5 text-rose-300">
                      <div className="font-bold flex items-center gap-1 text-[11px] text-rose-400 mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Red Flag / Warning Sign:</span>
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
              <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-4">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Common Candidate Mistakes on "{problem.title}"</span>
                </div>
                <ul className="space-y-2">
                  {problem.trapsAndPitfalls.map((pitfall, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
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
              <div className="rounded-xl bg-[#111929] border border-[#1f2b40] p-4 space-y-3">
                <div className="text-xs font-bold text-slate-200 mb-2">
                  Grade your peer across standard FAANG interview dimensions (1 to 5):
                </div>

                {[
                  { key: 'clarification', label: '1. Problem Clarification & Constraints' },
                  { key: 'approach', label: '2. Algorithmic Strategy & Big-O' },
                  { key: 'codeQuality', label: '3. Code Cleanliness & Bug-free Execution' },
                  { key: 'testing', label: '4. Self-Verification & Edge-case Dry Run' },
                  { key: 'communication', label: '5. Verbal Communication & Think-Aloud' }
                ].map((dim) => (
                  <div key={dim.key} className="flex items-center justify-between py-1.5 border-b border-[#182336]">
                    <span className="text-xs text-slate-300 font-medium">{dim.label}</span>
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
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Private Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interviewer Private Notes:</span>
                </label>
                <textarea
                  value={roommateNotes}
                  onChange={(e) => setRoommateNotes(e.target.value)}
                  placeholder="Record observations, good questions they asked, or areas where they hesitated..."
                  rows={3}
                  className="w-full bg-[#121929] border border-[#1f2b40] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1c2638] bg-[#0c1322] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Keep this HUD open to guide your friend through their session.
          </span>
          <button onClick={onClose} className="btn btn-primary text-xs py-1.5 px-4">
            Close HUD
          </button>
        </div>
      </div>
    </div>
  );
};
