import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  ArrowRight,
  Headphones,
  HelpCircle,
  Loader2
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
  const [showPrompts, setShowPrompts] = useState(false);
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
          'What is the maximum size / upper bound of N?',
          'Are duplicate elements allowed in the input?',
          'How should we handle an empty or single-element input?'
        ];
      case 'APPROACH':
        return [
          'A brute-force solution would be O(N^2), but we can optimize it.',
          `I propose an optimal ${problem.optimalComplexity.time} approach using ${problem.patterns[0] || 'a hash map'}.`,
          'Let me analyze the Time and Space complexity trade-offs first.',
          'I am confident in this approach. Ready to begin coding!'
        ];
      case 'CODING':
        return [
          'I will initialize my primary tracking pointers and state variables.',
          'Now writing the core loop while handling boundaries.',
          'Adding a defensive check for the edge cases we identified.',
          'I have completed the implementation. Ready for dry run.'
        ];
      case 'TESTING':
        return [
          'Let me trace through Example 1 line-by-line with a dry run.',
          'Checking boundary cases: empty input and single elements.',
          'All test cases have passed successfully!',
          'Let us move to the final interview debrief.'
        ];
      default:
        return [
          'How was my communication and problem decomposition?',
          'What could be improved in my algorithmic rigor?'
        ];
    }
  };

  const quickPrompts = getPhaseQuickPrompts();

  const getPersonaDetails = () => {
    switch (config.persona) {
      case 'faang_bar_raiser':
        return { name: 'Alex Vance', role: 'Staff Engineer (Bar Raiser)', tagColor: 'text-rose-400 bg-[#281418] border-[#5e1927]' };
      case 'supportive_mentor':
        return { name: 'Sarah Lin', role: 'Senior Peer Mentor', tagColor: 'text-emerald-400 bg-[#10231b] border-[#1d4d38]' };
      default:
        return { name: 'Marcus Brody', role: 'Engineering Lead', tagColor: 'text-blue-400 bg-[#111e33] border-[#1e3a63]' };
    }
  };

  const persona = getPersonaDetails();

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toTimeString().split(' ')[0];
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0d12] border-r border-[#1c1e28] overflow-hidden">
      {/* Interviewer Call & Session Header */}
      <div className="px-3.5 py-2.5 border-b border-[#1c1e28] bg-[#0f1017] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#161822] border border-[#262838] flex items-center justify-center text-slate-300 relative">
            <Headphones className="w-4 h-4 text-slate-300" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
                isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-tight">{persona.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${persona.tagColor}`}>
                {persona.role}
              </span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Stage:</span>
              <span className="text-slate-200 font-semibold">{phase}</span>
              {isSpeaking && (
                <span className="text-[10px] text-emerald-400 font-mono ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Speaking...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audio & Phase Advance Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleVoice}
            title={config.voiceEnabled ? 'Mute interviewer voice' : 'Enable interviewer voice (TTS)'}
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              config.voiceEnabled
                ? 'bg-[#181d28] border-[#293548] text-slate-200'
                : 'bg-[#13141c] border-[#1e202c] text-slate-500 hover:text-slate-300'
            }`}
          >
            {config.voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {phase !== 'DEBRIEF' && (
            <button
              onClick={onAdvancePhase}
              className="btn btn-secondary text-[11px] py-1 px-2.5 text-slate-300 hover:text-white"
              title="Advance to next interview evaluation stage"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Transcript Log Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 select-text font-sans">
        {messages.map((msg) => {
          const isUser = msg.sender === 'candidate';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="text-[11px] font-mono text-slate-400 bg-[#12131b] border border-[#1e202c] py-1 px-3 rounded-md mx-auto w-fit flex items-center gap-1.5 my-1"
              >
                <span className="text-slate-500 font-mono">system:</span>
                <span>{msg.text}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`rounded-lg p-3 text-xs leading-relaxed border transition-all ${
                isUser
                  ? 'bg-[#13151f] border-[#242738] ml-4'
                  : 'bg-[#0f1017] border-[#1b1c26] mr-4'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#181924] text-[10.5px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={isUser ? 'text-slate-200 font-semibold' : 'text-slate-300 font-semibold'}>
                    {isUser ? 'CANDIDATE (You)' : `INTERVIEWER (${persona.name.split(' ')[0]})`}
                  </span>
                  {msg.phase && (
                    <span className="text-[9px] uppercase px-1 rounded bg-[#171822] text-slate-400 border border-[#222432]">
                      {msg.phase}
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-[10px]">{formatTime(msg.timestamp)}</span>
              </div>

              <div className="whitespace-pre-wrap text-slate-200 font-sans text-[12.5px] leading-relaxed">
                {msg.text}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="rounded-lg p-2.5 bg-[#0f1017] border border-[#1b1c26] text-xs text-slate-400 flex items-center gap-2 mr-4 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            <span>Interviewer evaluating response...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Invariants / Discussion Points Drawer */}
      <div className="border-t border-[#1c1e28] bg-[#0e0f15]">
        <div className="px-3 py-1.5 flex items-center justify-between border-b border-[#181922]">
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center gap-1 text-[10.5px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>Discussion Checkpoints ({quickPrompts.length})</span>
            <span className="text-[9px] text-slate-500">[{showPrompts ? 'Hide' : 'Show'}]</span>
          </button>
          <span className="text-[10px] font-mono text-slate-500">Stage: {phase}</span>
        </div>

        {showPrompts && (
          <div className="p-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-[#0b0c11]">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(prompt)}
                className="text-[11px] text-left px-2 py-1 rounded bg-[#13141d] hover:bg-[#1a1c27] text-slate-300 border border-[#1e202c] hover:border-[#2f3346] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input / Dictation Terminal */}
      <div className="p-2.5 border-t border-[#1c1e28] bg-[#0d0e14] flex items-center gap-2">
        <button
          onClick={toggleMic}
          title={isListening ? 'Stop recording microphone' : 'Think aloud (Voice-to-text input)'}
          className={`p-2 rounded-md border text-xs font-mono transition-all flex items-center gap-1.5 ${
            isListening
              ? 'bg-[#291216] border-[#7f1d1d] text-rose-400'
              : 'bg-[#14151e] border-[#222432] text-slate-400 hover:text-white'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold">REC</span>
            </>
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type reasoning aloud or speak through microphone..."
            className="w-full bg-[#12131b] border border-[#20222f] rounded-md px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#383d52]"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isGenerating}
          className="btn btn-secondary px-2.5 py-1.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1"
          title="Send response (Enter)"
        >
          <span>Send</span>
          <kbd className="text-[9px]">↵</kbd>
        </button>
      </div>
    </div>
  );
};
