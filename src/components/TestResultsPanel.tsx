import React, { useState } from 'react';
import { CheckCircle2, XCircle, Terminal, Plus, Clock, AlertCircle, Loader2, Code } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'tests' | 'stdout'>('tests');
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
        description: 'Candidate Custom Test'
      };
      onAddCustomTest(newTestCase);
      setIsAddingCustom(false);
      setCustomInputText('');
      setCustomExpectedText('');
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}. Please input valid JSON.`);
    }
  };

  const currentResult = results[activeTab];
  const currentCase = problem.testCases[activeTab] || null;

  // Aggregate all logs
  const allStdout = results.flatMap((r) => r.logs || []);

  return (
    <div className="h-full flex flex-col bg-[#0b0c11] border-t border-[#1c1e28] overflow-hidden select-text font-mono">
      {/* Top Bar: Terminal Mode Tabs & Execution Status */}
      <div className="h-9 px-3 border-b border-[#1c1e28] bg-[#0d0e14] flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* View mode toggle */}
          <button
            onClick={() => setViewMode('tests')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              viewMode === 'tests'
                ? 'bg-[#1a1c27] text-white border border-[#272a3b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3 text-slate-400" />
            <span>Test Suite</span>
          </button>

          <button
            onClick={() => setViewMode('stdout')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              viewMode === 'stdout'
                ? 'bg-[#1a1c27] text-white border border-[#272a3b]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3 h-3 text-slate-400" />
            <span>Console stdout</span>
            {allStdout.length > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#1e212f] text-slate-300 text-[9px] flex items-center justify-center">
                {allStdout.length}
              </span>
            )}
          </button>

          <div className="h-3.5 w-[1px] bg-[#1e202c] mx-1" />

          {/* Test Case Selectors */}
          {viewMode === 'tests' && (
            <div className="flex items-center gap-1">
              {(results.length > 0 ? results : problem.testCases).map((_tc, idx) => {
                const hasResult = results[idx] !== undefined;
                const passed = hasResult ? results[idx].passed : null;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] transition-colors ${
                      activeTab === idx
                        ? 'bg-[#1f2231] text-white border border-[#2e334a]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#14151f]'
                    }`}
                  >
                    <span>Case {idx + 1}</span>
                    {passed !== null && (
                      <span>
                        {passed ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-[#161722] transition-colors"
                title="Add a custom test case"
              >
                <Plus className="w-3 h-3" />
                <span>Custom</span>
              </button>
            </div>
          )}
        </div>

        {/* Execution Summary Status */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161722] border border-[#242637] text-[11px] text-slate-300">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
              <span>Executing sandbox...</span>
            </div>
          ) : results.length > 0 ? (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border font-mono ${
                allPassed
                  ? 'bg-[#10231b] text-emerald-300 border-[#1d4d38]'
                  : 'bg-[#281418] text-rose-300 border-[#5e1927]'
              }`}
            >
              {allPassed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>
                    {passedTests}/{totalTests} Passed
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>
                    {passedTests}/{totalTests} Passed
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-[10.5px] text-slate-400 font-mono">Terminal ready</span>
          )}
        </div>
      </div>

      {/* Terminal View Body */}
      <div className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed space-y-2">
        {/* Custom Test Case Form */}
        {isAddingCustom && (
          <div className="rounded-md bg-[#11121a] border border-[#262838] p-3 space-y-2 mb-2 font-sans">
            <div className="text-xs font-semibold text-white">Add Custom Test Case</div>
            <div className="space-y-1">
              <label className="text-[10.5px] text-slate-400 font-mono">
                Input arguments as JSON array (e.g. `[[2, 7, 11, 15], 9]`):
              </label>
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="[[2, 7, 11, 15], 9]"
                className="w-full bg-[#0c0d12] border border-[#20222f] rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] text-slate-400 font-mono">
                Expected output as JSON (e.g. `[0, 1]`):
              </label>
              <input
                type="text"
                value={customExpectedText}
                onChange={(e) => setCustomExpectedText(e.target.value)}
                placeholder="[0, 1]"
                className="w-full bg-[#0c0d12] border border-[#20222f] rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleCreateCustomTest} className="btn btn-primary text-xs py-1 px-2.5">
                Save Test
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

        {viewMode === 'stdout' ? (
          /* Stdout Tab */
          <div className="rounded-md bg-[#0e0f15] border border-[#1b1d28] p-3 space-y-1 text-[11.5px] text-slate-300">
            <div className="text-[10px] text-slate-400 font-mono pb-1 border-b border-[#181924] mb-2 flex items-center justify-between">
              <span>Standard Output Stream (stdout)</span>
              <span>{allStdout.length} lines</span>
            </div>
            {allStdout.length > 0 ? (
              allStdout.map((line, idx) => (
                <div key={idx} className="font-mono text-slate-300">
                  <span className="text-slate-400 mr-2 select-none">&gt;</span>
                  {line}
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic py-4 text-center font-sans">
                No console output emitted yet. Use <code className="text-slate-300">console.log()</code> or <code className="text-slate-300">print()</code> in your code.
              </div>
            )}
          </div>
        ) : currentResult ? (
          /* Test Case Details with Execution Metrics */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-[#181a24] font-mono">
              <span className="font-semibold text-slate-200">
                {currentResult.description || `Test Assertion ${activeTab + 1}`}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{currentResult.executionTimeMs} ms</span>
              </span>
            </div>

            {/* Input Arguments */}
            <div className="rounded-md bg-[#0e0f15] border border-[#1b1c26] p-2.5">
              <div className="text-[10px] text-slate-400 font-semibold mb-1">ARGUMENTS:</div>
              <div className="text-slate-200 text-[11.5px]">{currentResult.input}</div>
            </div>

            {/* Expected vs Actual Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="rounded-md bg-[#0e0f15] border border-[#1b1c26] p-2.5">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">EXPECTED:</div>
                <div className="text-emerald-400 text-[11.5px] font-semibold">{currentResult.expected}</div>
              </div>
              <div className="rounded-md bg-[#0e0f15] border border-[#1b1c26] p-2.5">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">ACTUAL RECEIVED:</div>
                <div
                  className={`text-[11.5px] font-semibold ${
                    currentResult.passed ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentResult.actual || 'undefined'}
                </div>
              </div>
            </div>

            {/* Execution Runtime Error / Exception */}
            {currentResult.error && (
              <div className="rounded-md bg-[#241115] border border-[#521c25] p-2.5 text-rose-300">
                <div className="text-[10px] font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                  <XCircle className="w-3 h-3 text-rose-400" />
                  <span>RUNTIME ERROR / EXCEPTION:</span>
                </div>
                <div className="whitespace-pre-wrap text-[11px] font-mono">{currentResult.error}</div>
              </div>
            )}

            {/* Per-test logs */}
            {currentResult.logs && currentResult.logs.length > 0 && (
              <div className="rounded-md bg-[#0d0e14] border border-[#181924] p-2">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">LOGS:</div>
                <div className="space-y-0.5 text-slate-300 text-[11px]">
                  {currentResult.logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : currentCase ? (
          /* Pre-run test case preview */
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 pb-1 border-b border-[#181a24] font-mono">
              <span className="font-semibold text-slate-300">
                {currentCase.description || `Test Assertion ${activeTab + 1}`}
              </span>
            </div>
            <div className="rounded-md bg-[#0e0f15] border border-[#1b1c26] p-2.5">
              <div className="text-[10px] text-slate-400 font-semibold mb-1">ARGUMENTS:</div>
              <div className="text-slate-200 text-[11.5px]">{JSON.stringify(currentCase.input)}</div>
            </div>
            <div className="rounded-md bg-[#0e0f15] border border-[#1b1c26] p-2.5">
              <div className="text-[10px] text-slate-400 font-semibold mb-1">EXPECTED:</div>
              <div className="text-emerald-400 text-[11.5px] font-semibold">{JSON.stringify(currentCase.expected)}</div>
            </div>
            <div className="text-[11px] text-slate-500 italic pt-1 font-sans">
              Press 'Run Code' (<kbd>⌃↵</kbd>) to execute your implementation.
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-6 font-sans">
            Ready to execute. Press 'Run Code' to run test assertions.
          </div>
        )}
      </div>
    </div>
  );
};
