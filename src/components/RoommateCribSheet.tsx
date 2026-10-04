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
  ShieldCheck,
  Send,
  Coffee,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import type { FriendProfile, Problem, ProgrammingLanguage } from '../types/interview';

interface RoommateCribSheetProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  language: ProgrammingLanguage;
  friendProfile: FriendProfile;
  onUpdateFriendProfile: (updated: FriendProfile) => void;
  onSendRoommateMessage: (text: string) => void;
}

export const RoommateCribSheet: React.FC<RoommateCribSheetProps> = ({
  isOpen,
  onClose,
  problem,
  language,
  friendProfile,
  onUpdateFriendProfile,
  onSendRoommateMessage
}) => {
  const [activeTab, setActiveTab] = useState<'co-pilot' | 'solutions' | 'questions' | 'pitfalls' | 'rubric'>(
    'co-pilot'
  );
  const [showSolutionCode, setShowSolutionCode] = useState(false);
  const [ratings, setRatings] = useState(friendProfile.roommateRatings);
  const [roommateNotes, setRoommateNotes] = useState(friendProfile.roommateFeedback || '');
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendPrompt = (text: string, label: string) => {
    onSendRoommateMessage(text);
    setSentFeedback(`Sent "${label}" to chat!`);
    setTimeout(() => setSentFeedback(null), 2500);
  };

  const handleSaveRatings = () => {
    onUpdateFriendProfile({
      ...friendProfile,
      roommateRatings: ratings,
      roommateFeedback: roommateNotes
    });
    setSentFeedback('Saved ratings & notes to final scorecard!');
    setTimeout(() => setSentFeedback(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-xl bg-[#0e0f15] border border-[#20222f] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#1c152b] border border-[#3b2d56] flex items-center justify-center text-purple-300">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-sans">
                  Roommate Co-Pilot HUD — Mocking with {friendProfile.name || 'Friend'}
                </h2>
                <span className="badge bg-[#1e172a] text-purple-300 border border-[#3b2d56] text-[10px] font-mono">
                  Target: {friendProfile.targetCompany || 'Tech'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Interactive peer interviewer console. Drop live hints, ask probing questions, and evaluate.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleSaveRatings();
              onClose();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1a1c27] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Feedback Toast Banner */}
        {sentFeedback && (
          <div className="bg-purple-950/90 border-b border-purple-800 text-purple-200 px-4 py-1.5 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{sentFeedback}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-[#1c1e2a] bg-[#0c0d12] flex items-center gap-1 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('co-pilot')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'co-pilot'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Live Interventions</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'questions'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Probing Questions ({problem.probingQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('solutions')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'solutions'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Optimal Solution & Proof</span>
          </button>

          <button
            onClick={() => setActiveTab('pitfalls')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pitfalls'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            <span>Traps & Pitfalls ({problem.trapsAndPitfalls.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rubric'
                ? 'border-purple-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Grade {friendProfile.name || 'Friend'} Live</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 font-sans">
          {/* TAB 0: LIVE CO-PILOT ACTIONS */}
          {activeTab === 'co-pilot' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-[#141522] border border-[#242738] p-3.5">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span>One-Click Roommate Nudges (Injected to Live Chat)</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-3">
                  Click any action below to immediately drop a real-time prompt into {friendProfile.name || 'your friend'}'s interview session.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
                  <button
                    onClick={() =>
                      handleSendPrompt(
                        `[Roommate Pep Talk]: Hey ${friendProfile.name || 'there'}, take a deep breath! Walk me out loud through what data structure you're considering.`,
                        'Pep Talk'
                      )
                    }
                    className="p-2.5 rounded-md bg-[#1a1b2b] border border-[#2b2e45] text-left hover:bg-[#222438] transition-all flex items-start gap-2.5"
                  >
                    <Coffee className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">☕ Dorm Pep Talk</div>
                      <div className="text-[10.5px] text-slate-400 font-sans">Encourage thinking aloud and lowering anxiety.</div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSendPrompt(
                        `[Roommate Check]: What is the Big-O Time & Space complexity of your current approach? Can we do better than brute force?`,
                        'Big-O Check'
                      )
                    }
                    className="p-2.5 rounded-md bg-[#1a1b2b] border border-[#2b2e45] text-left hover:bg-[#222438] transition-all flex items-start gap-2.5"
                  >
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">⚡ Complexity Probe</div>
                      <div className="text-[10.5px] text-slate-400 font-sans">Challenge them to state Time and Space bounds.</div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSendPrompt(
                        `[Roommate Warning]: Watch out for boundary conditions! What happens if the input has only 0 or 1 elements, or negative numbers?`,
                        'Edge Case Alert'
                      )
                    }
                    className="p-2.5 rounded-md bg-[#1a1b2b] border border-[#2b2e45] text-left hover:bg-[#222438] transition-all flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">🚨 Edge Case Alert</div>
                      <div className="text-[10.5px] text-slate-400 font-sans">Nudge to test null, empty, or boundary inputs.</div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSendPrompt(
                        `[FAANG Follow-Up]: Nice progress. Now imagine the input array does not fit in memory (100GB stream). How would your solution adapt?`,
                        'System Scalability'
                      )
                    }
                    className="p-2.5 rounded-md bg-[#1a1b2b] border border-[#2b2e45] text-left hover:bg-[#222438] transition-all flex items-start gap-2.5"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">🎯 Scale Curveball</div>
                      <div className="text-[10.5px] text-slate-400 font-sans">FAANG question on streaming / memory constraints.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Calibrated Hint Drop */}
              <div className="rounded-lg bg-[#141522] border border-[#242738] p-3.5 space-y-2.5">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Calibrated Hint Ladder for "{problem.title}"</span>
                </h3>
                <div className="space-y-2">
                  {problem.hints.map((hint) => (
                    <div
                      key={hint.level}
                      className="p-2.5 rounded-md bg-[#0f1018] border border-[#1e202e] flex items-center justify-between gap-3 font-mono"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            Level {hint.level}: {hint.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans line-clamp-2">{hint.text}</p>
                      </div>
                      <button
                        onClick={() =>
                          handleSendPrompt(`[Roommate Hint L${hint.level}]: ${hint.text}`, `Hint Level ${hint.level}`)
                        }
                        className="btn btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 shrink-0"
                      >
                        <Send className="w-3 h-3 text-purple-400" />
                        <span>Drop Hint</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SOLUTIONS & PROOF */}
          {activeTab === 'solutions' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-[#141522] border border-[#242738] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      Optimal Bounds Proof
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      Time: {problem.optimalComplexity.time}
                    </span>
                    <span className="text-blue-400 font-bold">
                      Space: {problem.optimalComplexity.space}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#0c0d13] p-2.5 rounded border border-[#1b1d28]">
                  {problem.optimalComplexity.explanation}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    Reference Solution ({language.toUpperCase()}):
                  </span>
                  <button
                    onClick={() => setShowSolutionCode(!showSolutionCode)}
                    className="btn btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-mono"
                  >
                    {showSolutionCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSolutionCode ? 'Hide Code' : 'Reveal Solution'}</span>
                  </button>
                </div>

                {showSolutionCode ? (
                  <pre className="p-3.5 rounded-lg bg-[#08090d] border border-[#222435] text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    {language === 'javascript'
                      ? problem.solutionCode.javascript
                      : problem.solutionCode.python}
                  </pre>
                ) : (
                  <div className="p-6 rounded-lg bg-[#0d0e14] border border-[#1c1e2a] text-center space-y-2">
                    <EyeOff className="w-6 h-6 text-slate-500 mx-auto" />
                    <div className="text-xs text-slate-400 font-sans">
                      Solution code is masked so you can interview your friend without spoilers.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROBING QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Use these calibrated questions to test {friendProfile.name || 'the candidate'}'s thought process. Click <strong>"Ask Candidate"</strong> to instantly send the question to their chat.
              </p>

              <div className="space-y-3">
                {problem.probingQuestions.map((pq, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-[#11121a] border border-[#1e202c] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                          Phase: {pq.phase}
                        </span>
                        <h4 className="text-xs font-semibold text-white font-sans mt-1">
                          "{pq.question}"
                        </h4>
                      </div>
                      <button
                        onClick={() =>
                          handleSendPrompt(`[Interviewer Probing Question]: ${pq.question}`, `Question #${idx + 1}`)
                        }
                        className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 shrink-0 font-mono"
                      >
                        <Send className="w-3 h-3 text-purple-400" />
                        <span>Ask Candidate</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#1a1c27]">
                      <div className="rounded p-2 bg-[#0d1612] border border-[#183124] text-emerald-300">
                        <div className="font-bold flex items-center gap-1 mb-0.5 font-mono">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>What a Good Answer Sounds Like:</span>
                        </div>
                        <p className="font-sans text-slate-300">{pq.goodAnswer}</p>
                      </div>

                      <div className="rounded p-2 bg-[#1b1014] border border-[#3b1922] text-rose-300">
                        <div className="font-bold flex items-center gap-1 mb-0.5 font-mono">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Red Flags / Poor Answers:</span>
                        </div>
                        <p className="font-sans text-slate-300">{pq.redFlag}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRAPS & PITFALLS */}
          {activeTab === 'pitfalls' && (
            <div className="space-y-3 font-sans">
              <p className="text-xs text-slate-400 leading-relaxed">
                Common candidate bugs and flawed assumptions for <strong>{problem.title}</strong>:
              </p>
              <div className="space-y-2">
                {problem.trapsAndPitfalls.map((trap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#11121a] border border-[#1e202c] flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">{trap}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RUBRIC & LIVE GRADING */}
          {activeTab === 'rubric' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Live Roommate Scorecard for {friendProfile.name || 'Candidate'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Rate your friend across core competencies. These ratings directly merge into their final scorecard!
                  </p>
                </div>
                <button
                  onClick={handleSaveRatings}
                  className="btn btn-primary text-xs py-1 px-3 font-mono flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Scores</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'clarification', label: '1. Clarification & Constraints', desc: 'Asked about bounds, empty array, negative numbers' },
                  { key: 'approach', label: '2. Algorithm & Big-O Rigor', desc: 'Analyzed optimal complexity before coding' },
                  { key: 'codeQuality', label: '3. Code Modularity & Naming', desc: 'Clean variable names, defensive syntax, readability' },
                  { key: 'testing', label: '4. Dry Run & Edge Testing', desc: 'Traced through small test cases line by line' },
                  { key: 'communication', label: '5. Thinking Aloud & Poise', desc: 'Articulated hypotheses verbally without going silent' }
                ].map((dim) => (
                  <div
                    key={dim.key}
                    className="p-3 rounded-lg bg-[#11121a] border border-[#1d202c] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white font-sans">{dim.label}</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {(ratings as any)[dim.key]} / 5
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans">{dim.desc}</p>
                    <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => {
                            const updated = {
                              ...ratings,
                              [dim.key]: star
                            };
                            setRatings(updated);
                          }}
                          className={`p-1 rounded transition-colors ${
                            (ratings as any)[dim.key] >= star
                              ? 'text-amber-400'
                              : 'text-slate-700 hover:text-slate-400'
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
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-sans">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Roommate Debrief Note (Will appear on their final certificate):</span>
                </label>
                <textarea
                  value={roommateNotes}
                  onChange={(e) => setRoommateNotes(e.target.value)}
                  placeholder={`Write feedback for ${friendProfile.name || 'your friend'} (e.g. "Great job explaining the map lookup! Just remember not to rush your return statement.").`}
                  rows={3}
                  className="w-full bg-[#11121a] border border-[#1d202c] rounded-md p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Roommate Session Active • Connected with {friendProfile.name || 'Friend'}
          </span>
          <button
            onClick={() => {
              handleSaveRatings();
              onClose();
            }}
            className="btn btn-secondary text-xs py-1.5 px-4 font-mono"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
};
