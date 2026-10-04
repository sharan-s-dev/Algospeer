import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Volume2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Sparkles,
  Bot
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
        message: `Connected! Found ${res.models.length} local models.`
      });
      setAvailableOllamaModels(res.models);
      if (res.models.length > 0 && !res.models.includes(localConfig.ollamaModel)) {
        setLocalConfig({ ...localConfig, ollamaModel: res.models[0] });
      }
    } else {
      setOllamaStatus({
        testing: false,
        success: false,
        message: 'Could not connect to Ollama. Make sure Ollama is running (`ollama serve`).'
      });
    }
  };

  const handleInitWebLLM = async () => {
    setIsInitializingWebLlm(true);
    setWebLlmProgress({ text: 'Initializing WebGPU shader pipelines...', progress: 0.05 });
    try {
      await localLLMService.initWebLLM(localConfig.webLlmModel, (p) => {
        setWebLlmProgress(p);
      });
      setIsInitializingWebLlm(false);
    } catch (e: any) {
      setIsInitializingWebLlm(false);
      alert(`WebLLM Error: ${e.message}. Note: In-browser WebLLM requires a browser with WebGPU support (Chrome, Edge 113+). You can also use Ollama or the built-in Offline Heuristic AI!`);
    }
  };

  const handleTestVoice = () => {
    speechService.speak(
      `Hello! I will be conducting your technical interview today. Are you ready to begin?`,
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
    { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 1B Instruct (Ultra lightweight, ~800MB)' },
    { id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', label: 'SmolLM2 1.7B Instruct (~1.1GB)' },
    { id: 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 Coder 7B (Deep reasoning, ~5GB VRAM)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f1726] border border-[#223048] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1c2638] bg-[#121c2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Local Inference & Interview Settings</h2>
              <p className="text-[11px] text-slate-400">
                100% private and offline. Choose your local AI engine and interviewer persona.
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Local Inference Engine */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inference Engine</span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                { id: 'heuristic', title: 'Offline Heuristic', desc: '0 download, instant execution' },
                { id: 'webllm', title: 'WebLLM (WebGPU)', desc: 'Client-side in browser' },
                { id: 'ollama', title: 'Ollama Server', desc: 'http://localhost:11434' },
                { id: 'lmstudio', title: 'LM Studio / LocalAI', desc: 'http://localhost:1234' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLocalConfig({ ...localConfig, backend: opt.id as InferenceBackend })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    localConfig.backend === opt.id
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40'
                      : 'bg-[#121929] border-[#1d273a] text-slate-300 hover:bg-[#182338]'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">{opt.title}</div>
                  <div className="text-[10px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* Sub-config for WebLLM */}
            {localConfig.backend === 'webllm' && (
              <div className="rounded-xl bg-[#111929] border border-[#1e2a3f] p-4 space-y-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">WebLLM In-Browser Model:</span>
                  <span className="text-[10px] text-cyan-400 font-medium">Runs on user GPU via WebGPU</span>
                </div>
                <select
                  value={localConfig.webLlmModel}
                  onChange={(e) => setLocalConfig({ ...localConfig, webLlmModel: e.target.value })}
                  className="w-full bg-[#0d1320] border border-[#1e2a3f] rounded-lg p-2 text-xs text-slate-200"
                >
                  {webLlmModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>

                {webLlmProgress && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[80%]">{webLlmProgress.text}</span>
                      <span>{Math.round(webLlmProgress.progress * 100)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0a0e17] overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(webLlmProgress.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleInitWebLLM}
                  disabled={isInitializingWebLlm}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isInitializingWebLlm ? 'Downloading & Compiling...' : 'Download & Cache Model'}</span>
                </button>
              </div>
            )}

            {/* Sub-config for Ollama */}
            {localConfig.backend === 'ollama' && (
              <div className="rounded-xl bg-[#111929] border border-[#1e2a3f] p-4 space-y-3 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Ollama API URL:
                    </label>
                    <input
                      type="text"
                      value={localConfig.ollamaUrl}
                      onChange={(e) => setLocalConfig({ ...localConfig, ollamaUrl: e.target.value })}
                      placeholder="http://localhost:11434"
                      className="w-full bg-[#0d1320] border border-[#1e2a3f] rounded-lg p-2 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Model Identifier:
                    </label>
                    {availableOllamaModels.length > 0 ? (
                      <select
                        value={localConfig.ollamaModel}
                        onChange={(e) => setLocalConfig({ ...localConfig, ollamaModel: e.target.value })}
                        className="w-full bg-[#0d1320] border border-[#1e2a3f] rounded-lg p-2 text-xs text-slate-200"
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
                        className="w-full bg-[#0d1320] border border-[#1e2a3f] rounded-lg p-2 text-xs text-slate-200"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleTestOllama}
                    disabled={ollamaStatus.testing}
                    className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${ollamaStatus.testing ? 'animate-spin' : ''}`} />
                    <span>Test Connection & Fetch Models</span>
                  </button>
                  {ollamaStatus.message && (
                    <span
                      className={`text-[11px] flex items-center gap-1 ${
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
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interviewer Persona & Evaluation Rigor</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'faang_bar_raiser',
                  title: 'FAANG Bar Raiser',
                  desc: 'Firm, rigorous proofs, checks edge cases strictly, challenges Big-O.'
                },
                {
                  id: 'supportive_mentor',
                  title: 'Supportive Senior Mentor',
                  desc: 'Encouraging, Socratic nudges, patient, constructive feedback.'
                },
                {
                  id: 'pragmatic_lead',
                  title: 'Pragmatic Tech Lead',
                  desc: 'Values clean code, realistic trade-offs, defensive programming.'
                }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    setLocalConfig({ ...localConfig, persona: p.id as InterviewerPersona })
                  }
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    localConfig.persona === p.id
                      ? 'bg-purple-500/15 border-purple-500 text-purple-300 shadow-md shadow-purple-950/40'
                      : 'bg-[#121929] border-[#1d273a] text-slate-300 hover:bg-[#182338]'
                  }`}
                >
                  <div className="text-xs font-bold mb-1">{p.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Speech Synthesis & TTS */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio & Speech Synthesis (TTS)</span>
            </label>

            <div className="rounded-xl bg-[#121929] border border-[#1f2b40] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Voice Narration for Interviewer Responses
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Reads aloud interviewer questions and hints via Web Speech API
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.voiceEnabled}
                  onChange={(e) => setLocalConfig({ ...localConfig, voiceEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {localConfig.voiceEnabled && (
                <div className="pt-2 border-t border-[#1a2538] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 font-medium">Speech Rate:</span>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={localConfig.voiceRate}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, voiceRate: parseFloat(e.target.value) })
                      }
                      className="accent-cyan-400 w-32 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-cyan-300">{localConfig.voiceRate}x</span>
                  </div>

                  <button
                    onClick={handleTestVoice}
                    className="btn btn-secondary text-xs py-1 px-2.5"
                  >
                    Test Voice Sample
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1c2638] bg-[#0c1322] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Settings persist locally across mock sessions.
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-ghost text-xs text-slate-400 py-1.5 px-3">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary text-xs py-1.5 px-4">
              Apply & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
