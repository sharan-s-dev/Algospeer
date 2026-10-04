import React, { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, RotateCcw, Copy, Check, FileCode } from 'lucide-react';
import type { ProgrammingLanguage } from '../types/interview';

interface CodeEditorPanelProps {
  code: string;
  onChangeCode: (val: string) => void;
  language: ProgrammingLanguage;
  onChangeLanguage: (lang: ProgrammingLanguage) => void;
  onRunTests: () => void;
  onResetCode: () => void;
  isRunningTests: boolean;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  code,
  onChangeCode,
  language,
  onChangeLanguage,
  onRunTests,
  onResetCode,
  isRunningTests
}) => {
  const [copied, setCopied] = React.useState(false);

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to run tests
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRunTests();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRunTests]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getLanguageExtension = () => {
    return language === 'javascript' ? [javascript({ jsx: false, typescript: false })] : [python()];
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0e14] overflow-hidden">
      {/* Editor Top Toolbar / Tab Bar */}
      <div className="h-9 px-3 border-b border-[#1c1e28] bg-[#0c0d12] flex items-center justify-between select-none">
        {/* Left: Active File Tab & Runtime Tag */}
        <div className="flex items-center gap-2">
          {/* Active File Tab */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-t-md bg-[#0d0e14] border-t border-x border-[#1c1e28] text-xs font-mono text-slate-200">
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'javascript' ? 'solution.js' : 'solution.py'}</span>
          </div>

          {/* Compiler Version Info */}
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#12131b] border border-[#1b1d28] hidden sm:inline">
            {language === 'javascript' ? 'v8 / Node 20.x' : 'Pyodide 3.12'}
          </span>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#101118] p-0.5 rounded-md border border-[#1e202c] ml-1">
            <button
              onClick={() => onChangeLanguage('javascript')}
              className={`px-2 py-0.5 rounded text-[10.5px] font-mono transition-colors ${
                language === 'javascript'
                  ? 'bg-[#1e212c] text-white font-medium border border-[#2b2e3e]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JavaScript
            </button>
            <button
              onClick={() => onChangeLanguage('python')}
              className={`px-2 py-0.5 rounded text-[10.5px] font-mono transition-colors ${
                language === 'python'
                  ? 'bg-[#1e212c] text-white font-medium border border-[#2b2e3e]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        {/* Right: Actions & Run Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetCode}
            title="Reset code template"
            className="btn btn-ghost text-xs text-slate-400 hover:text-white py-1 px-2 font-mono"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline text-[11px]">Reset</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy solution code"
            className="btn btn-ghost text-xs text-slate-400 hover:text-white py-1 px-2 font-mono"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Run Tests (Tactile Emerald Execution Button) */}
          <button
            onClick={onRunTests}
            disabled={isRunningTests}
            className="btn btn-action-run text-xs py-1 px-3"
            title="Execute test suite (Ctrl + Enter)"
          >
            <Play className={`w-3 h-3 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>{isRunningTests ? 'Running...' : 'Run Code'}</span>
            <kbd className="ml-1 bg-black/20 text-[#042f1a] border-emerald-700/40 text-[9px]">⌃↵</kbd>
          </button>
        </div>
      </div>

      {/* CodeMirror Surface */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={getLanguageExtension()}
          onChange={onChangeCode}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true
          }}
        />
      </div>
    </div>
  );
};
