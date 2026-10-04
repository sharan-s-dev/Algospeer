import React, { useState } from 'react';
import { CheckCircle2, XCircle, Terminal, Plus, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import type { Problem, TestCase, TestExecutionResult } from '../types/interview';

interface TestResultsPanelProps {
  problem: Problem;
  results: TestExecutionResult[];
  isRunning?: boolean;
  onAddCustomTest: (testCase: TestCase) => void;
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({
  problem,
  results,
  isRunning = false,
  onAddCustomTest
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showConsoleLogs, setShowConsoleLogs] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [customExpectedText, setCustomExpectedText] = useState('');

  const totalTests = results.length > 0 ? results.length : problem.testCases.length;
  const passedTests = results.filter((r) => r.passed).length;
  const allPassed = results.length > 0 && passedTests === totalTests;

  const handleCreateCustomTest = () => {
    try {
      const parsedInput = JSON.parse(customInputText);
      const parsedExpected = JSON.parse(customExpectedText);
      const newTestCase: TestCase = {
        id: `custom-${Date.now()}`,
        input: Array.isArray(parsedInput) ? parsedInput : [parsedInput],
        expected: parsedExpected,
        description: 'Candidate Custom Edge Case'
      };
      onAddCustomTest(newTestCase);
      setIsAddingCustom(false);
      setCustomInputText('');
      setCustomExpectedText('');
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}. Please input valid JSON arrays/values.`);
    }
  };

  const currentResult = results[activeTab];
  const currentCase = problem.testCases[activeTab] || null;

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] border-t border-[#1a2538] overflow-hidden select-text">
      {/* Top Bar: Tabs & Overall Status */}
      <div className="h-10 px-3 border-b border-[#1a2538] bg-[#0e1424] flex items-center justify-between select-none">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-300 mr-1 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Test Cases
          </span>

          {/* Individual Test Case Tabs */}
          {(results.length > 0 ? results : problem.testCases).map((_tc, idx) => {
            const hasResult = results[idx] !== undefined;
            const passed = hasResult ? results[idx].passed : null;

            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  setShowConsoleLogs(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === idx && !showConsoleLogs
                    ? 'bg-[#182338] text-white border border-[#253552]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121929]'
                }`}
              >
                <span>Case {idx + 1}</span>
                {passed !== null && (
                  <span>
                    {passed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400 inline" />
                    )}
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Custom Test Button */}
          <button
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 hover:text-cyan-300 hover:bg-[#151f33] transition-colors"
            title="Add a custom test case"
          >
            <Plus className="w-3 h-3" />
            <span>Custom</span>
          </button>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Evaluating...</span>
            </div>
          ) : results.length > 0 ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                allPassed
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {allPassed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {passedTests}/{totalTests} Passed
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    {passedTests}/{totalTests} Passed
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">Ready to run</span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 text-xs font-mono leading-relaxed space-y-2.5">
        {/* Custom Test Case Form */}
        {isAddingCustom && (
          <div className="rounded-lg bg-[#111929] border border-cyan-500/30 p-3 space-y-2 mb-3">
            <div className="text-xs font-bold text-cyan-300 font-sans">Add Custom Edge Case Test</div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-sans">
                Input arguments as JSON array (e.g. \`[[2, 7, 11, 15], 9]\`):
              </label>
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="[[2, 7, 11, 15], 9]"
                className="w-full bg-[#0a0f18] border border-[#1e2a3f] rounded px-2.5 py-1 text-xs text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-sans">
                Expected output as JSON (e.g. \`[0, 1]\`):
              </label>
              <input
                type="text"
                value={customExpectedText}
                onChange={(e) => setCustomExpectedText(e.target.value)}
                placeholder="[0, 1]"
                className="w-full bg-[#0a0f18] border border-[#1e2a3f] rounded px-2.5 py-1 text-xs text-slate-200"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleCreateCustomTest} className="btn btn-primary text-xs py-1 px-2.5">
                Add Test
              </button>
              <button
                onClick={() => setIsAddingCustom(false)}
                className="btn btn-ghost text-xs text-slate-400 py-1 px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected Test Case Details */}
        {currentResult ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-[#182336] font-sans">
              <span className="font-semibold text-slate-300">
                {currentResult.description || `Test Case ${activeTab + 1}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{currentResult.executionTimeMs} ms</span>
              </span>
            </div>

            {/* Input */}
            <div className="rounded-lg bg-[#0e1422] border border-[#1a2538] p-2.5">
              <div className="text-[11px] font-sans text-slate-400 font-bold mb-1">Input:</div>
              <div className="text-cyan-300">{currentResult.input}</div>
            </div>

            {/* Expected vs Actual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="rounded-lg bg-[#0e1422] border border-[#1a2538] p-2.5">
                <div className="text-[11px] font-sans text-slate-400 font-bold mb-1">Expected Output:</div>
                <div className="text-emerald-400">{currentResult.expected}</div>
              </div>
              <div className="rounded-lg bg-[#0e1422] border border-[#1a2538] p-2.5">
                <div className="text-[11px] font-sans text-slate-400 font-bold mb-1">Actual Output:</div>
                <div className={currentResult.passed ? 'text-emerald-300' : 'text-rose-400 font-bold'}>
                  {currentResult.actual}
                </div>
              </div>
            </div>

            {/* Runtime Error / Stack Trace */}
            {currentResult.error && (
              <div className="rounded-lg bg-rose-950/30 border border-rose-800/50 p-2.5 text-rose-300">
                <div className="text-[11px] font-sans font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Execution Error:</span>
                </div>
                <div className="whitespace-pre-wrap text-[11px]">{currentResult.error}</div>
              </div>
            )}

            {/* Console Logs */}
            {currentResult.logs && currentResult.logs.length > 0 && (
              <div className="rounded-lg bg-[#0d1320] border border-[#1a263a] p-2.5">
                <div className="text-[11px] font-sans font-bold text-slate-400 mb-1">Stdout Logs:</div>
                <div className="space-y-0.5 text-slate-300 text-[11px]">
                  {currentResult.logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : currentCase ? (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 pb-1 border-b border-[#182336] font-sans">
              <span className="font-semibold text-slate-300">
                {currentCase.description || `Test Case ${activeTab + 1}`}
              </span>
            </div>
            <div className="rounded-lg bg-[#0e1422] border border-[#1a2538] p-2.5">
              <div className="text-[11px] font-sans text-slate-400 font-bold mb-1">Input:</div>
              <div className="text-cyan-300">{JSON.stringify(currentCase.input)}</div>
            </div>
            <div className="rounded-lg bg-[#0e1422] border border-[#1a2538] p-2.5">
              <div className="text-[11px] font-sans text-slate-400 font-bold mb-1">Expected Output:</div>
              <div className="text-emerald-400">{JSON.stringify(currentCase.expected)}</div>
            </div>
            <div className="text-[11px] text-slate-500 font-sans italic pt-1">
              Press 'Run Tests' (Ctrl+Enter) to execute your code against this case.
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-6 font-sans">
            No test cases available. Click 'Run Tests' to start.
          </div>
        )}
      </div>
    </div>
  );
};
