import React, { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, RotateCcw, Copy, Check, Code2 } from 'lucide-react';
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

  // Keyboard shortcut Ctrl+Enter to run tests
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
    <div className="h-full flex flex-col bg-[#0b101b] overflow-hidden">
      {/* Editor Toolbar */}
      <div className="h-10 px-3 border-b border-[#1a2538] bg-[#0d1424] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Solution Code</span>

          {/* Language Selector */}
          <div className="flex items-center bg-[#131b2c] p-0.5 rounded-lg border border-[#1e2a3f] ml-2">
            <button
              onClick={() => onChangeLanguage('javascript')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                language === 'javascript'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              JavaScript
            </button>
            <button
              onClick={() => onChangeLanguage('python')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                language === 'python'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetCode}
            title="Reset code to original starter template"
            className="btn btn-ghost text-xs text-slate-400 hover:text-white py-1 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy solution code"
            className="btn btn-ghost text-xs text-slate-400 hover:text-white py-1 px-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Run Tests Button */}
          <button
            onClick={onRunTests}
            disabled={isRunningTests}
            className="btn btn-success text-xs py-1 px-3 shadow-md"
            title="Execute test cases (Ctrl + Enter)"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>{isRunningTests ? 'Running...' : 'Run Tests'}</span>
            <span className="hidden md:inline text-[10px] opacity-75 font-mono ml-1">Ctrl+↵</span>
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
