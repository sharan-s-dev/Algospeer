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
  DownloadCloud
} from 'lucide-react';
import type { InferenceBackend, InterviewerPersona, LLMConfig } from '../types/interview';
import { localLLMService, type ProgressReport } from '../services/localLLM';
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
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config);
  const [ollamaStatus, setOllamaStatus] = useState<{ testing: boolean; success?: boolean; message?: string }>({
    testing: false
  });
  const [availableOllamaModels, setAvailableOllamaModels] = useState<string[]>([]);
  const [webLlmProgress, setWebLlmProgress] = useState<ProgressReport | null>(null);
  const [isInitializingWebLlm, setIsInitializingWebLlm] = useState(false);

  if (!isOpen) return null;

  const handleTestOllama = async () => {
    setOllamaStatus({ testing: true });
    const res = await localLLMService.checkOllamaConnection(localConfig.ollamaUrl);
    if (res.ok) {
      setOllamaStatus({
        testing: false,
        success: true,
        message: `Connected! Detected ${res.models.length} local models.`
      });
      setAvailableOllamaModels(res.models);
      if (res.models.length > 0 && !res.models.includes(localConfig.ollamaModel)) {
        setLocalConfig({ ...localConfig, ollamaModel: res.models[0] });
      }
    } else {
      setOllamaStatus({
        testing: false,
        success: false,
        message: 'Could not connect to Ollama daemon. Verify `ollama serve` is running.'
      });
    }
  };

  const handleInitWebLLM = async () => {
    setIsInitializingWebLlm(true);
    setWebLlmProgress({ text: 'Compiling WebGPU shader pipelines...', progress: 0.05 });
    try {
      await localLLMService.initWebLLM(localConfig.webLlmModel, (p) => {
        setWebLlmProgress(p);
      });
      setIsInitializingWebLlm(false);
    } catch (e: any) {
      setIsInitializingWebLlm(false);
      alert(`WebLLM Error: ${e.message}. Note: In-browser WebLLM requires WebGPU support (Chrome, Edge 113+).`);
    }
  };

  const handleTestVoice = () => {
    speechService.speak(
      `Hello! I will be conducting your technical interview session today. Are you ready to begin?`,
      localConfig.persona,
      localConfig.voiceRate,
      localConfig.voicePitch
    );
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const webLlmModels = [
    { id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 Coder 1.5B (Fast, ~1GB VRAM)' },
    { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 1B Instruct (Lightweight, ~800MB)' },
    { id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', label: 'SmolLM2 1.7B Instruct (~1.1GB)' },
    { id: 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 Coder 7B (Deep reasoning, ~5GB VRAM)' }
  ];

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
              <h2 className="text-sm font-bold text-white font-sans">Session Engine & Audio Configuration</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                100% offline & local execution. Select inference backend and voice synthesis parameters.
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
          {/* Section 1: Local Inference Engine */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <span>Inference Engine</span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'heuristic', title: 'Offline Heuristic', desc: 'Zero download, instant evaluation' },
                { id: 'webllm', title: 'WebLLM (WebGPU)', desc: 'Client GPU in-browser' },
                { id: 'ollama', title: 'Ollama Daemon', desc: 'http://localhost:11434' },
                { id: 'lmstudio', title: 'LM Studio / LocalAI', desc: 'http://localhost:1234' }
              ].map((opt) => {
                const isSelected = localConfig.backend === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setLocalConfig({ ...localConfig, backend: opt.id as InferenceBackend })}
                    className={`p-2.5 rounded-md border text-left transition-all font-mono ${
                      isSelected
                        ? 'bg-[#181a26] border-[#383d54] text-white shadow-sm'
                        : 'bg-[#11121a] border-[#1d202c] text-slate-300 hover:bg-[#161722]'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-0.5">{opt.title}</div>
                    <div className="text-[10px] text-slate-400 font-sans leading-tight">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Sub-config for WebLLM */}
            {localConfig.backend === 'webllm' && (
              <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3 space-y-2.5 mt-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">In-Browser Model weights:</span>
                  <span className="text-[10.5px] text-slate-400">WebGPU accelerated</span>
                </div>
                <select
                  value={localConfig.webLlmModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, webLlmModel: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-1.5 text-xs text-slate-200 font-mono"
                >
                  {webLlmModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>

                {webLlmProgress && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10.5px] text-slate-400">
                      <span className="truncate max-w-[80%]">{webLlmProgress.text}</span>
                      <span>{Math.round(webLlmProgress.progress * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#161722] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(webLlmProgress.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleInitWebLLM}
                  disabled={isInitializingWebLlm}
                  className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>{isInitializingWebLlm ? 'Downloading & Compiling...' : 'Download & Cache Model'}</span>
                </button>
              </div>
            )}

            {/* Sub-config for Ollama */}
            {localConfig.backend === 'ollama' && (
              <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3 space-y-2.5 mt-2 font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10.5px] text-slate-400 mb-1 block">
                      Ollama API Endpoint:
                    </label>
                    <input
                      type="text"
                      value={localConfig.ollamaUrl}
                      onChange={(e) => setLocalConfig({ ...localConfig, ollamaUrl: e.target.value })}
                      placeholder="http://localhost:11434"
                      className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-slate-400 mb-1 block">
                      Model Identifier:
                    </label>
                    {availableOllamaModels.length > 0 ? (
                      <select
                        value={localConfig.ollamaModel}
                        onChange={(e) => setLocalConfig({ ...localConfig, ollamaModel: e.target.value })}
                        className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-1.5 text-xs text-slate-200"
                      >
                        {availableOllamaModels.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={localConfig.ollamaModel}
                        onChange={(e) => setLocalConfig({ ...localConfig, ollamaModel: e.target.value })}
                        placeholder="llama3.2 or qwen2.5-coder:7b"
                        className="w-full bg-[#0c0d12] border border-[#20222f] rounded-md p-1.5 text-xs text-slate-200"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleTestOllama}
                    disabled={ollamaStatus.testing}
                    className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 font-mono"
                  >
                    <RefreshCw className={`w-3 h-3 ${ollamaStatus.testing ? 'animate-spin' : ''}`} />
                    <span>Ping Endpoint</span>
                  </button>
                  {ollamaStatus.message && (
                    <span
                      className={`text-[11px] flex items-center gap-1 font-mono ${
                        ollamaStatus.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ollamaStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{ollamaStatus.message}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Interviewer Persona */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Interviewer Evaluation Persona</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                {
                  id: 'faang_bar_raiser',
                  title: 'FAANG Bar Raiser',
                  desc: 'Rigorous proofs, challenges complexity bounds, strict boundary tests.'
                },
                {
                  id: 'supportive_mentor',
                  title: 'Supportive Senior Mentor',
                  desc: 'Constructive Socratic hints, patient guidance, collaborative tone.'
                },
                {
                  id: 'pragmatic_lead',
                  title: 'Pragmatic Tech Lead',
                  desc: 'Focuses on production cleanliness, maintainability, and realistic trade-offs.'
                }
              ].map((p) => {
                const isSelected = localConfig.persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      setLocalConfig({ ...localConfig, persona: p.id as InterviewerPersona })
                    }
                    className={`p-3 rounded-md border text-left transition-all ${
                      isSelected
                        ? 'bg-[#181a26] border-[#383d54] text-white shadow-sm'
                        : 'bg-[#11121a] border-[#1d202c] text-slate-300 hover:bg-[#161722]'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 font-sans">{p.title}</div>
                    <div className="text-[11px] text-slate-400 font-sans leading-relaxed">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Audio & Speech Synthesis (TTS) */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Voice Channel & Text-to-Speech (TTS)</span>
            </label>

            <div className="rounded-md bg-[#11121a] border border-[#1d202c] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200 font-sans">
                    Voice Narration for Interviewer Responses
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Uses native Web Speech API synthesis for realistic verbal questions
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
            Stored in localStorage
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-ghost text-xs text-slate-400 py-1 px-3">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary text-xs py-1 px-3.5">
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
