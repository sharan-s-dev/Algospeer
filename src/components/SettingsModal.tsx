import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Volume2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Users,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import type { InferenceBackend, InterviewerPersona, LLMConfig } from '../types/interview';
import { localLLMService } from '../services/localLLM';
import { speechService } from '../services/speechService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSaveConfig: (newConfig: LLMConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [localConfig, setLocalConfig] = useState<LLMConfig>(() => {
    // Ensure deprecated models or old backends are safely migrated
    let model = config.geminiModel || 'gemini-3.8-flash';
    if (model.includes('2.5') || model.includes('gemini-pro')) {
      model = 'gemini-3.8-flash';
    }
    const backend: InferenceBackend = config.backend === 'gemini' ? 'gemini' : 'heuristic';
    return {
      ...config,
      backend,
      geminiModel: model,
      friendProfile: config.friendProfile || {
        name: 'Alex',
        targetRole: 'Software Engineer',
        targetCompany: 'Google',
        prepNotes: 'Focus on verbal communication and identifying boundary conditions.',
        roommateRatings: {
          clarification: 4,
          approach: 4,
          codeQuality: 4,
          testing: 4,
          communication: 4
        },
        roommateFeedback: 'Great momentum! Remember to think aloud as you write your loops.'
      }
    };
  });

  const [geminiStatus, setGeminiStatus] = useState<{ testing: boolean; success?: boolean; message?: string }>({
    testing: false
  });
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  if (!isOpen) return null;

  const handleTestGemini = async () => {
    if (!localConfig.geminiApiKey?.trim()) {
      setGeminiStatus({ testing: false, success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }
    setGeminiStatus({ testing: true });
    const res = await localLLMService.checkGeminiConnection(localConfig.geminiApiKey);
    if (res.ok) {
      setGeminiStatus({
        testing: false,
        success: true,
        message: 'Valid API Key! Successfully verified with Google AI Studio.'
      });
    } else {
      setGeminiStatus({
        testing: false,
        success: false,
        message: res.error || 'Connection failed. Please check your key.'
      });
    }
  };

  const handleTestVoice = () => {
    speechService.speak(
      `Hey ${localConfig.friendProfile?.name || 'there'}! I'm ready to run your mock interview. Let's practice!`,
      localConfig.persona,
      localConfig.voiceRate,
      localConfig.voicePitch
    );
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl bg-[#0e0f15] border border-[#20222f] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1c1e2a] bg-[#111219] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#161822] border border-[#272a3b] flex items-center justify-center text-slate-200">
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">Interview Engine & Friend Setup</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Configure your AI interviewer, friend's target role, and interview style.
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section 1: Built for a Friend Customization */}
          <div className="rounded-lg bg-[#12141f] border border-[#232738] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                <span>Friend Co-Pilot Profile (Build for a Friend)</span>
              </label>
              <span className="text-[10px] bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50 font-mono">
                Peer Mode
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 mb-1 block font-mono">Friend / Candidate Name:</label>
                <input
                  type="text"
                  value={localConfig.friendProfile?.name || ''}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      friendProfile: {
                        ...localConfig.friendProfile,
                        name: e.target.value
                      }
                    })
                  }
                  placeholder="e.g. Alex"
                  className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 mb-1 block font-mono">Target Company & Role:</label>
                <input
                  type="text"
                  value={localConfig.friendProfile?.targetCompany || ''}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      friendProfile: {
                        ...localConfig.friendProfile,
                        targetCompany: e.target.value
                      }
                    })
                  }
                  placeholder="e.g. Google SDE Intern"
                  className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 mb-1 block font-mono">Session Focus / Encouragement Note:</label>
              <input
                type="text"
                value={localConfig.friendProfile?.prepNotes || ''}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    friendProfile: {
                      ...localConfig.friendProfile,
                      prepNotes: e.target.value
                    }
                  })
                }
                placeholder="e.g. Remember to breathe, clarify constraints first, and test edge cases."
                className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Section 2: Inference Engine Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <span>Inference Engine</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'gemini',
                  title: 'Google Gemini 3.8 Flash (Recommended)',
                  desc: 'Real live neural AI interviewer via Google AI Studio API. Fast, responsive, intelligent dialogue.',
                  badge: 'Live AI'
                },
                {
                  id: 'heuristic',
                  title: 'Offline Local Engine',
                  desc: 'Zero-network deterministic evaluator with instant rule checks. 100% offline practice mode.',
                  badge: 'Offline'
                }
              ].map((opt) => {
                const isSelected = localConfig.backend === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setLocalConfig({ ...localConfig, backend: opt.id as InferenceBackend })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-[#181a28] border-indigo-500/80 text-white shadow-md ring-1 ring-indigo-500/40'
                        : 'bg-[#11121a] border-[#1d202c] text-slate-300 hover:bg-[#161722]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                        {opt.id === 'gemini' && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                        <span>{opt.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans leading-relaxed">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Sub-config for Gemini */}
            {localConfig.backend === 'gemini' && (
              <div className="rounded-lg bg-[#11121a] border border-[#202232] p-3.5 space-y-3 mt-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Google AI Studio API Key:</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Get Free Gemini Key ↗
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={localConfig.geminiApiKey || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, geminiApiKey: e.target.value })}
                    placeholder="Paste your Gemini API key (AIzaSy...)"
                    className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-2 pr-16 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-[#1a1c27] border border-[#272a3b]"
                  >
                    {showGeminiKey ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[10.5px] text-slate-400 mb-1 block">Gemini Model:</label>
                    <select
                      value={localConfig.geminiModel || 'gemini-3.8-flash'}
                      onChange={(e) => setLocalConfig({ ...localConfig, geminiModel: e.target.value })}
                      className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-1.5 text-xs text-slate-200 font-mono"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Latest, Recommended)</option>
                      <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleTestGemini}
                      disabled={geminiStatus.testing}
                      className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 w-full justify-center font-mono"
                    >
                      <RefreshCw className={`w-3 h-3 ${geminiStatus.testing ? 'animate-spin' : ''}`} />
                      <span>{geminiStatus.testing ? 'Checking Key...' : 'Verify API Key'}</span>
                    </button>
                  </div>
                </div>

                {geminiStatus.message && (
                  <div
                    className={`text-[11px] flex items-center gap-1.5 pt-1 ${
                      geminiStatus.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {geminiStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{geminiStatus.message}</span>
                  </div>
                )}

                <p className="text-[10.5px] text-slate-400 leading-relaxed pt-1">
                  🔒 Your API key stays private in your browser’s localStorage. It is never logged or transmitted anywhere except direct to Google’s Gemini API.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Interviewer Persona */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Interviewer Evaluation Persona</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {
                  id: 'roommate_peer',
                  title: 'Roommate Co-Pilot (Dorm Practice)',
                  desc: 'Warm, encouraging peer banter. Gently nudges you when stuck, lowers stress, keeps confidence high.'
                },
                {
                  id: 'supportive_mentor',
                  title: 'Supportive Senior Mentor',
                  desc: 'Thoughtful Socratic hints, patient guidance, and collaborative feedback on algorithmic structure.'
                },
                {
                  id: 'pragmatic_lead',
                  title: 'Pragmatic Tech Lead',
                  desc: 'Focuses on production cleanliness, maintainability, and realistic engineering trade-offs.'
                },
                {
                  id: 'faang_bar_raiser',
                  title: 'FAANG Bar Raiser',
                  desc: 'Rigorous proofs, challenges complexity bounds, strict boundary tests with zero tolerance for sloppy assumptions.'
                }
              ].map((p) => {
                const isSelected = localConfig.persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      setLocalConfig({ ...localConfig, persona: p.id as InterviewerPersona })
                    }
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-[#181a26] border-purple-500/80 text-white shadow-sm ring-1 ring-purple-500/40'
                        : 'bg-[#11121a] border-[#1d202c] text-slate-300 hover:bg-[#161722]'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1 font-sans">{p.title}</div>
                    <div className="text-[11px] text-slate-400 font-sans leading-relaxed">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Audio & Speech Synthesis (TTS) */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Voice Channel & Text-to-Speech (TTS)</span>
            </label>

            <div className="rounded-lg bg-[#11121a] border border-[#1d202c] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200 font-sans">
                    Voice Narration for Interviewer Responses
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Uses native Web Speech API synthesis for verbal interaction
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.voiceEnabled}
                  onChange={(e) => setLocalConfig({ ...localConfig, voiceEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {localConfig.voiceEnabled && (
                <div className="pt-2 border-t border-[#181924] flex items-center justify-between font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300">Speech Rate:</span>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={localConfig.voiceRate}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, voiceRate: parseFloat(e.target.value) })
                      }
                      className="accent-emerald-500 w-32 cursor-pointer"
                    />
                    <span className="text-xs text-slate-200">{localConfig.voiceRate}x</span>
                  </div>

                  <button
                    onClick={handleTestVoice}
                    className="btn btn-secondary text-xs py-1 px-2.5"
                  >
                    Test Voice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1c1e2a] bg-[#111219] flex items-center justify-between font-mono">
          <span className="text-[10.5px] text-slate-400">
            Stored locally in your browser
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-ghost text-xs text-slate-400 py-1 px-3">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary text-xs py-1 px-4">
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
