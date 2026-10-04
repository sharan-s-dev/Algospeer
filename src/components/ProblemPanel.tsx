import React from 'react';
import type { Problem } from '../types/interview';
import { BookOpen, AlertCircle, Zap, Tag } from 'lucide-react';

interface ProblemPanelProps {
  problem: Problem;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({ problem }) => {
  return (
    <div className="h-full flex flex-col bg-[#0b0f19] border-r border-[#1a2538] overflow-hidden select-text">
      {/* Header Info */}
      <div className="p-4 border-b border-[#1a2538] bg-[#0e1422]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">{problem.title}</h2>
            <span
              className={`badge ${
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
          <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-[#162033] border border-[#223049]">
            {problem.category}
          </span>
        </div>

        {/* Patterns */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {problem.patterns.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md"
            >
              <Tag className="w-2.5 h-2.5" />
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable Description Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed text-slate-300">
        {/* Description Text */}
        <div className="whitespace-pre-line font-sans text-[13px] text-slate-200">
          {problem.description}
        </div>

        {/* Examples Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Examples
          </h3>
          {problem.examples.map((ex, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-[#111827] border border-[#1e2a3f] p-3 font-mono text-[12px] space-y-1.5"
            >
              <div className="text-slate-400 font-semibold text-[11px]">Example {idx + 1}:</div>
              <div className="flex items-start gap-1">
                <span className="text-cyan-400 font-bold select-none">Input:</span>
                <span className="text-slate-200">{ex.input}</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-emerald-400 font-bold select-none">Output:</span>
                <span className="text-emerald-300">{ex.output}</span>
              </div>
              {ex.explanation && (
                <div className="text-slate-400 font-sans text-[11px] pt-1 border-t border-[#1a2538]">
                  <span className="text-slate-500 font-bold">Explanation: </span>
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Constraints & Boundary Bounds
          </h3>
          <ul className="space-y-1.5 pl-1">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-300 font-mono text-[11.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 select-none" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optimal Target Complexity */}
        <div className="rounded-lg bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-800/40 p-3 mt-4">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Complexity Benchmark</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-200 mt-1">
            <div>
              <span className="text-slate-400">Time: </span>
              <span className="text-cyan-300 font-semibold">{problem.optimalComplexity.time}</span>
            </div>
            <div>
              <span className="text-slate-400">Space: </span>
              <span className="text-cyan-300 font-semibold">{problem.optimalComplexity.space}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
