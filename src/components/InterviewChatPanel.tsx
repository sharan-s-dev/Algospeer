import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import type { InterviewMessage, InterviewPhase, LLMConfig, Problem } from '../types/interview';
import { speechService } from '../services/speechService';

interface InterviewChatPanelProps {
  messages: InterviewMessage[];
  onSendMessage: (text: string) => void;
  phase: InterviewPhase;
  onAdvancePhase: () => void;
  config: LLMConfig;
  onUpdateConfig: (partial: Partial<LLMConfig>) => void;
  isGenerating: boolean;
  problem: Problem;
}

export const InterviewChatPanel: React.FC<InterviewChatPanelProps> = ({
  messages,
  onSendMessage,
  phase,
  onAdvancePhase,
  config,
  onUpdateConfig,
  isGenerating,
  problem
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Check speech synthesis speaking state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(speechService.getIsSpeaking());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal && transcript.trim()) {
            setIsListening(false);
          }
        },
        (err) => {
          console.warn('Speech recognition notice:', err);
          setIsListening(false);
        }
      );
    }
  };

  const toggleVoice = () => {
    const nextVal = !config.voiceEnabled;
    onUpdateConfig({ voiceEnabled: nextVal });
    if (!nextVal) {
      speechService.stopSpeaking();
    }
  };

  const getPhaseQuickPrompts = () => {
    switch (phase) {
      case 'CLARIFY':
        return [
          'Can the input contain negative values or zeros?',
          'What is the maximum size of the input?',
          'Are duplicate elements possible?',
          'How should we handle an empty or single-element input?'
        ];
      case 'APPROACH':
        return [
          'A brute-force solution would be O(N^2), but we can optimize it.',
          `I propose an optimal ${problem.optimalComplexity.time} approach using ${problem.patterns[0] || 'a hash table'}.`,
          'Let me analyze the Time and Space complexity trade-offs first.',
          'I am confident in this approach. Ready to begin coding!'
        ];
      case 'CODING':
        return [
          'I will initialize my primary tracking pointers and state variables.',
          'Now writing the core loop while handling bounds.',
          'Adding a defensive check for the edge cases we identified.',
          'I have completed the implementation. Ready for dry run.'
        ];
      case 'TESTING':
        return [
          'Let me trace through Example 1 line-by-line.',
          'Running an edge case with boundary input.',
          'All test cases have passed successfully!',
          'Let us move to the final interview debrief.'
        ];
      default:
        return [
          'How was my communication and problem breakdown?',
          'What could be improved in my algorithmic rigor?'
        ];
    }
  };

  const quickPrompts = getPhaseQuickPrompts();

  const getPersonaDetails = () => {
    switch (config.persona) {
      case 'faang_bar_raiser':
        return { name: 'Alex (Bar Raiser)', role: 'Senior Staff / Bar Raiser', tagColor: 'text-rose-400 bg-rose-950/40 border-rose-800/40' };
      case 'supportive_mentor':
        return { name: 'Sarah (Mentor)', role: 'Senior Peer Mentor', tagColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' };
      default:
        return { name: 'Marcus (Tech Lead)', role: 'Engineering Lead', tagColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' };
    }
  };

  const persona = getPersonaDetails();

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] border-r border-[#1a2538] overflow-hidden">
      {/* Interviewer Header Card */}
      <div className="p-3 border-b border-[#1a2538] bg-[#0e1422] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex gap-0.5 items-end h-3 bg-cyan-950 px-1 py-0.5 rounded border border-cyan-500/50">
                <span className="sound-bar" />
                <span className="sound-bar" />
                <span className="sound-bar" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{persona.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${persona.tagColor}`}>
                {persona.role}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Phase: <span className="text-cyan-400 font-semibold">{phase}</span>
            </div>
          </div>
        </div>

        {/* Voice and Phase Advance Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleVoice}
            title={config.voiceEnabled ? 'Mute interviewer voice' : 'Enable interviewer voice (TTS)'}
            className={`p-1.5 rounded-lg border transition-colors ${
              config.voiceEnabled
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-[#141b2a] border-[#1e2a3f] text-slate-400 hover:text-white'
            }`}
          >
            {config.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {phase !== 'DEBRIEF' && (
            <button
              onClick={onAdvancePhase}
              className="btn btn-secondary text-[11px] py-1 px-2 text-slate-300 hover:text-cyan-300"
              title="Advance to next interview phase"
            >
              <span>Next Phase</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
        {messages.map((msg) => {
          const isUser = msg.sender === 'candidate';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="text-center my-2 text-[11px] text-slate-400 bg-[#121929] border border-[#1d273a] py-1 px-3 rounded-full mx-auto w-fit font-mono"
              >
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-cyan-900/60 border border-cyan-700/50 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-950/40'
                    : 'bg-[#121929] border border-[#1f2b40] text-slate-200'
                }`}
              >
                <div className="text-[10px] font-semibold opacity-60 mb-1 flex items-center justify-between gap-3">
                  <span>{isUser ? 'You (Candidate)' : persona.name}</span>
                  {msg.phase && (
                    <span className="font-mono text-[9px] uppercase px-1 rounded bg-black/20">
                      {msg.phase}
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-md bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex gap-2.5 justify-start items-center text-xs text-slate-400 animate-pulse">
            <div className="w-6 h-6 rounded-md bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>Interviewer is evaluating your response...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="p-2 border-t border-[#1a2538] bg-[#0c121e]">
        <div className="text-[10px] font-bold text-slate-400 mb-1.5 px-1 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-cyan-400" />
          Suggested candidate talking points:
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              className="text-[11px] text-left px-2 py-1 rounded bg-[#131c2d] hover:bg-[#1a273f] text-slate-300 border border-[#1e2b42] hover:border-cyan-500/40 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input & Mic */}
      <div className="p-3 border-t border-[#1a2538] bg-[#0d131f] flex items-center gap-2">
        <button
          onClick={toggleMic}
          title={isListening ? 'Stop microphone' : 'Think aloud (Speech to text)'}
          className={`p-2 rounded-lg border transition-all ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-900/50'
              : 'bg-[#141b2a] border-[#1e2a3f] text-slate-400 hover:text-white'
          }`}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Speak or type your thoughts out loud..."
          className="flex-1 bg-[#121929] border border-[#1e2a3f] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isGenerating}
          className="btn btn-primary p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
