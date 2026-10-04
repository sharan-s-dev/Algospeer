import React from 'react';
import type { Problem } from '../types/interview';
import { BookOpen, AlertCircle, Cpu, Tag } from 'lucide-react';

interface ProblemPanelProps {
  problem: Problem;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({ problem }) => {
  return (
    <div className="h-full flex flex-col bg-[#0c0d12] border-r border-[#1c1e28] overflow-hidden select-text">
      {/* Header Info */}
      <div className="p-3.5 border-b border-[#1c1e28] bg-[#0f1017]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight font-sans">{problem.title}</h2>
            <span
              className={`badge text-[10.5px] ${
                problem.difficulty === 'Easy'
                  ? 'badge-easy'
                  : problem.difficulty === 'Medium'
                  ? 'badge-medium'
                  : 'badge-hard'
              }`}
            >
              {problem.difficulty}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-[#151620] border border-[#222432]">
            {problem.category}
          </span>
        </div>

        {/* Algorithmic Patterns */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {problem.patterns.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1 text-[10.5px] font-mono text-slate-300 bg-[#14151e] border border-[#222533] px-2 py-0.5 rounded"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Problem Description Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed text-slate-300 font-sans">
        {/* Description Text */}
        <div className="whitespace-pre-line text-[13px] text-slate-200 leading-relaxed font-sans">
          {problem.description}
        </div>

        {/* Examples Section */}
        <div className="space-y-2.5 pt-1">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Test Cases & Examples</span>
          </div>
          {problem.examples.map((ex, idx) => (
            <div
              key={idx}
              className="rounded-md bg-[#101118] border border-[#1d202c] p-3 font-mono text-[11.5px] space-y-1.5"
            >
              <div className="text-slate-400 font-semibold text-[10.5px] flex items-center justify-between">
                <span>Example {idx + 1}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 select-none">Input:</span>
                <span className="text-slate-200">{ex.input}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-semibold select-none">Output:</span>
                <span className="text-emerald-300">{ex.output}</span>
              </div>
              {ex.explanation && (
                <div className="text-slate-400 font-sans text-[11px] pt-1.5 mt-1 border-t border-[#181924]">
                  <span className="text-slate-500 font-medium">Explanation: </span>
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Constraints & Edge Boundaries</span>
          </div>
          <ul className="space-y-1 pl-1">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                <span className="w-1 h-1 rounded-full bg-slate-500 select-none" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optimal Complexity Benchmark */}
        <div className="rounded-md bg-[#11121a] border border-[#20222f] p-3 mt-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Expected Complexity Benchmark</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono mt-2 pt-2 border-t border-[#191b26]">
            <div>
              <span className="text-slate-500 text-[10.5px] block">Time Complexity:</span>
              <span className="text-slate-200 font-semibold">{problem.optimalComplexity.time}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10.5px] block">Space Complexity:</span>
              <span className="text-slate-200 font-semibold">{problem.optimalComplexity.space}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
