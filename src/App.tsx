import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProblemPanel } from './components/ProblemPanel';
import { InterviewChatPanel } from './components/InterviewChatPanel';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import { TestResultsPanel } from './components/TestResultsPanel';
import { HintLadderModal } from './components/HintLadderModal';
import { RoommateCribSheet } from './components/RoommateCribSheet';
import { WhiteboardPanel } from './components/WhiteboardPanel';
import { ScorecardModal } from './components/ScorecardModal';
import { SettingsModal } from './components/SettingsModal';
import { PROBLEMS } from './data/problems';
import type {
  InterviewMessage,
  InterviewPhase,
  InterviewScorecard,
  LLMConfig,
  Problem,
  ProgrammingLanguage,
  TestCase,
  TestExecutionResult
} from './types/interview';
import { runTests } from './services/codeRunner';
import { localLLMService } from './services/localLLM';
import { speechService } from './services/speechService';
import { calculateScorecard } from './services/evaluator';
import { BookOpen, Headphones, GitBranch, Terminal, Shield } from 'lucide-react';

const INITIAL_CONFIG: LLMConfig = {
  backend: 'heuristic',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  lmStudioUrl: 'http://localhost:1234',
  lmStudioModel: 'local-model',
  webLlmModel: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
  persona: 'supportive_mentor',
  voiceEnabled: true,
  voicePitch: 1.0,
  voiceRate: 1.0
};

export function App() {
  const [currentProblem, setCurrentProblem] = useState<Problem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<ProgrammingLanguage>('javascript');
  const [code, setCode] = useState<string>(PROBLEMS[0].starterCode.javascript);
  const [phase, setPhase] = useState<InterviewPhase>('CLARIFY');

  // Chat conversation
  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'interviewer',
      text: `Hello! Welcome to your technical mock interview session. We will be working on "${PROBLEMS[0].title}". Before you jump into writing code, please read the prompt carefully and ask any clarifying questions about inputs, edge cases, or constraints.`,
      timestamp: Date.now(),
      phase: 'CLARIFY'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Test Runner
  const [testResults, setTestResults] = useState<TestExecutionResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([]);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Hints
  const [unlockedHintLevel, setUnlockedHintLevel] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Modals & Panels
  const [isRoommateMode, setIsRoommateMode] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);

  // Mobile / Split Layout Tabs (for left panel)
  const [leftTab, setLeftTab] = useState<'problem' | 'interview'>('interview');

  // Config
  const [config, setConfig] = useState<LLMConfig>(() => {
    try {
      const saved = localStorage.getItem('algospeer_config');
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  // Countdown Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Initial welcome voice greeting if voice is enabled
  useEffect(() => {
    if (config.voiceEnabled) {
      const timer = setTimeout(() => {
        speechService.speak(messages[0].text, config.persona, config.voiceRate, config.voicePitch);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectProblem = (prob: Problem) => {
    setCurrentProblem(prob);
    setCode(language === 'javascript' ? prob.starterCode.javascript : prob.starterCode.python);
    setPhase('CLARIFY');
    setUnlockedHintLevel(0);
    setHintsUsed(0);
    setTestResults([]);
    setCustomTestCases([]);
    setTimerSeconds(45 * 60);
    setIsTimerRunning(true);

    const welcome: InterviewMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'interviewer',
      text: `We are now starting our interview for "${prob.title}". What initial clarifying questions or constraints come to mind?`,
      timestamp: Date.now(),
      phase: 'CLARIFY'
    };

    setMessages([welcome]);

    if (config.voiceEnabled) {
      speechService.speak(welcome.text, config.persona, config.voiceRate, config.voicePitch);
    }
  };

  const handleChangeLanguage = (newLang: ProgrammingLanguage) => {
    setLanguage(newLang);
    setCode(
      newLang === 'javascript'
        ? currentProblem.starterCode.javascript
        : currentProblem.starterCode.python
    );
  };

  const handleResetCode = () => {
    if (confirm('Reset code editor to initial starter template?')) {
      setCode(
        language === 'javascript'
          ? currentProblem.starterCode.javascript
          : currentProblem.starterCode.python
      );
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMsg: InterviewMessage = {
      id: `cand-${Date.now()}`,
      sender: 'candidate',
      text,
      timestamp: Date.now(),
      phase
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsGenerating(true);

    try {
      const aiReply = await localLLMService.generateResponse(
        nextMessages,
        currentProblem,
        phase,
        code,
        config
      );

      const interviewerMsg: InterviewMessage = {
        id: `ai-${Date.now()}`,
        sender: 'interviewer',
        text: aiReply,
        timestamp: Date.now(),
        phase
      };

      setMessages((prev) => [...prev, interviewerMsg]);
      setIsGenerating(false);

      if (config.voiceEnabled) {
        speechService.speak(aiReply, config.persona, config.voiceRate, config.voicePitch);
      }
    } catch (err: any) {
      setIsGenerating(false);
      const errorMsg: InterviewMessage = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: `Notice: Local inference response error: ${err.message}`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runTests(currentProblem, code, language, customTestCases);
      setTestResults(results);
      setIsRunningTests(false);

      const passed = results.filter((r) => r.passed).length;
      if (passed === results.length && phase === 'CODING') {
        setPhase('TESTING');
        const alertMsg: InterviewMessage = {
          id: `sys-${Date.now()}`,
          sender: 'interviewer',
          text: `Great work! All ${results.length} test assertions passed. Let's do a dry run on boundary conditions, then evaluate our scorecard.`,
          timestamp: Date.now(),
          phase: 'TESTING'
        };
        setMessages((prev) => [...prev, alertMsg]);
        if (config.voiceEnabled) {
          speechService.speak(alertMsg.text, config.persona, config.voiceRate, config.voicePitch);
        }
      }
    } catch (err) {
      setIsRunningTests(false);
    }
  };

  const handleAdvancePhase = () => {
    const sequence: InterviewPhase[] = ['CLARIFY', 'APPROACH', 'CODING', 'TESTING', 'DEBRIEF'];
    const currentIndex = sequence.indexOf(phase);
    if (currentIndex < sequence.length - 1) {
      const nextPhase = sequence[currentIndex + 1];
      setPhase(nextPhase);

      const phasePrompts: Record<InterviewPhase, string> = {
        CLARIFY: 'We are in the Clarification phase.',
        APPROACH: `Great clarification. Now let's explore your algorithmic approach. What is the brute force vs optimal solution, and what Big-O Time & Space complexity do you expect?`,
        CODING: `Approach approved! Please go ahead and write your solution in the code editor. Remember to think aloud as you write your logic.`,
        TESTING: `Code complete! Let's now run the test suite and walk through a dry run on edge cases like empty inputs, negatives, or duplicates.`,
        DEBRIEF: `Interview complete! Let's examine your evaluation scorecard and review your strengths and areas for growth.`
      };

      const announcement: InterviewMessage = {
        id: `phase-${Date.now()}`,
        sender: 'interviewer',
        text: phasePrompts[nextPhase],
        timestamp: Date.now(),
        phase: nextPhase
      };

      setMessages((prev) => [...prev, announcement]);
      if (config.voiceEnabled) {
        speechService.speak(announcement.text, config.persona, config.voiceRate, config.voicePitch);
      }

      if (nextPhase === 'DEBRIEF') {
        handleOpenScorecard();
      }
    }
  };

  const handleOpenScorecard = () => {
    const elapsed = 45 * 60 - timerSeconds;
    const computed = calculateScorecard(
      currentProblem,
      messages,
      testResults,
      hintsUsed,
      Math.max(10, elapsed),
      code
    );
    setScorecard(computed);
    setIsScorecardOpen(true);
  };

  const handleUnlockNextHint = () => {
    if (unlockedHintLevel < currentProblem.hints.length) {
      const nextLevel = unlockedHintLevel + 1;
      setUnlockedHintLevel(nextLevel);
      setHintsUsed((prev) => prev + 1);

      const hintObj = currentProblem.hints[nextLevel - 1];
      const hintMsg: InterviewMessage = {
        id: `hint-${Date.now()}`,
        sender: 'system',
        text: `[Hint Tier ${nextLevel} (${hintObj.label})]: ${hintObj.text}`,
        timestamp: Date.now(),
        phase
      };
      setMessages((prev) => [...prev, hintMsg]);
    }
  };

  const handleSaveConfig = (newConfig: LLMConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('algospeer_config', JSON.stringify(newConfig));
    } catch {}
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090a0f] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Header
        currentProblem={currentProblem}
        onSelectProblem={handleSelectProblem}
        phase={phase}
        onSelectPhase={(p) => setPhase(p)}
        isRoommateMode={isRoommateMode}
        onToggleRoommateMode={() => setIsRoommateMode(!isRoommateMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScorecard={handleOpenScorecard}
        onOpenHints={() => setIsHintsOpen(true)}
        onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        isWhiteboardOpen={isWhiteboardOpen}
        hintsUsed={hintsUsed}
        config={config}
        timerSeconds={timerSeconds}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        onResetTimer={() => setTimerSeconds(45 * 60)}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Problem & Interviewer (40% width) */}
        <div className="w-full lg:w-[40%] flex flex-col border-r border-[#1c1e28] bg-[#0c0d12] h-full overflow-hidden">
          {/* Sub-tabs to toggle between Problem Description and Interviewer Console */}
          <div className="h-9 px-3 border-b border-[#1c1e28] bg-[#0f1017] flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLeftTab('interview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  leftTab === 'interview'
                    ? 'bg-[#181a26] text-white border border-[#26293a]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-slate-400" />
                <span>Interviewer Audio/Log</span>
              </button>

              <button
                onClick={() => setLeftTab('problem')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  leftTab === 'problem'
                    ? 'bg-[#181a26] text-white border border-[#26293a]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Problem Spec</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              STAGE: {phase}
            </span>
          </div>

          {/* Active Left View */}
          <div className="flex-1 overflow-hidden">
            {leftTab === 'interview' ? (
              <InterviewChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                phase={phase}
                onAdvancePhase={handleAdvancePhase}
                config={config}
                onUpdateConfig={(p) => handleSaveConfig({ ...config, ...p })}
                isGenerating={isGenerating}
                problem={currentProblem}
              />
            ) : (
              <ProblemPanel problem={currentProblem} />
            )}
          </div>
        </div>

        {/* Right Column: Code Editor (top 62%) + Test Suite Runner (bottom 38%) */}
        <div className="hidden lg:flex flex-1 flex-col h-full overflow-hidden bg-[#0d0e14]">
          {/* Code Editor */}
          <div className="h-[62%] border-b border-[#1c1e28]">
            <CodeEditorPanel
              code={code}
              onChangeCode={(val) => setCode(val)}
              language={language}
              onChangeLanguage={handleChangeLanguage}
              onRunTests={handleRunTests}
              onResetCode={handleResetCode}
              isRunningTests={isRunningTests}
            />
          </div>

          {/* Test Results & Output Console */}
          <div className="h-[38%] overflow-hidden">
            <TestResultsPanel
              problem={currentProblem}
              results={testResults}
              isRunning={isRunningTests}
              onAddCustomTest={(tc) => setCustomTestCases([...customTestCases, tc])}
            />
          </div>
        </div>
      </div>

      {/* VS Code / CoderPad Bottom IDE Status Bar */}
      <div className="h-6 border-t border-[#1c1e28] bg-[#0c0d12] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 z-20 select-none">
        {/* Left items */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300">
            <GitBranch className="w-3 h-3 text-slate-400" />
            <span>mock-round</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">Spaces: 2</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-slate-300">{language === 'javascript' ? 'JavaScript' : 'Python'}</span>
        </div>

        {/* Center item */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-300">
          <Terminal className="w-3 h-3 text-emerald-400" />
          <span>Evaluation: Stage {phase}</span>
        </div>

        {/* Right items */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400" />
            <span className="text-slate-300">100% Offline</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Engine: {config.backend.toUpperCase()}</span>
        </div>
      </div>

      {/* Floating Whiteboard / Scratchpad */}
      <WhiteboardPanel isOpen={isWhiteboardOpen} onClose={() => setIsWhiteboardOpen(false)} />

      {/* Hint Ladder Modal */}
      <HintLadderModal
        isOpen={isHintsOpen}
        onClose={() => setIsHintsOpen(false)}
        hints={currentProblem.hints}
        unlockedLevel={unlockedHintLevel}
        onUnlockNextHint={handleUnlockNextHint}
      />

      {/* Roommate Co-Pilot HUD Modal */}
      <RoommateCribSheet
        isOpen={isRoommateMode}
        onClose={() => setIsRoommateMode(false)}
        problem={currentProblem}
        language={language}
      />

      {/* Comprehensive Scorecard Modal */}
      <ScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        scorecard={scorecard}
        problem={currentProblem}
        code={code}
        language={language}
        onRestartRound={() => handleSelectProblem(currentProblem)}
      />

      {/* Local Inference & Persona Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}

export default App;
