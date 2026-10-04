import React, { useState } from 'react';
import { FileCode2, Copy, Check, Trash2, X } from 'lucide-react';

interface WhiteboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhiteboardPanel: React.FC<WhiteboardPanelProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<string>(`// Scratchpad & ASCII Whiteboard for Dry-Running Logic
// Example: Two Pointers Tracing
// [ 2,   7,  11,  15 ]    target = 9
//   ^    ^
//   L    R
// 2 + 7 = 9 (Match found!)
`);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const insertTemplate = (template: string) => {
    setContent((prev) => prev + '\n' + template);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed bottom-0 right-0 z-40 w-96 h-80 bg-[#0f1726] border-t border-l border-[#223048] shadow-2xl flex flex-col rounded-tl-xl overflow-hidden animate-in slide-in-from-bottom duration-200">
      {/* Top Header */}
      <div className="h-9 px-3 bg-[#131d30] border-b border-[#1c273c] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Candidate Whiteboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            title="Copy whiteboard content"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1b263b] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setContent('')}
            title="Clear whiteboard"
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#1b263b] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1b263b] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Insert Templates */}
      <div className="px-2 py-1 bg-[#0b101c] border-b border-[#182336] flex items-center gap-1.5 overflow-x-auto text-[10px]">
        <button
          onClick={() =>
            insertTemplate(`// Pointers:
// [ A, B, C, D, E ]
//   ^           ^
//  left       right`)
          }
          className="px-1.5 py-0.5 rounded bg-[#131c2d] hover:bg-[#1a273f] text-slate-300 border border-[#1e2a3f] whitespace-nowrap"
        >
          + Two Pointers
        </button>
        <button
          onClick={() =>
            insertTemplate(`// Linked List:
// (Head) -> [1] -> [2] -> [3] -> (Null)`)
          }
          className="px-1.5 py-0.5 rounded bg-[#131c2d] hover:bg-[#1a273f] text-slate-300 border border-[#1e2a3f] whitespace-nowrap"
        >
          + Linked List
        </button>
        <button
          onClick={() =>
            insertTemplate(`// Matrix Grid:
// [1, 1, 0]
// [0, 1, 0]
// [0, 0, 1]`)
          }
          className="px-1.5 py-0.5 rounded bg-[#131c2d] hover:bg-[#1a273f] text-slate-300 border border-[#1e2a3f] whitespace-nowrap"
        >
          + 2D Grid
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 p-2 bg-[#0a0f18]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Sketch pointer diagrams, state tables, or edge case traces here..."
          className="w-full h-full bg-transparent resize-none font-mono text-[11px] text-cyan-300 placeholder-slate-600 focus:outline-none leading-relaxed"
        />
      </div>
    </div>
  );
};
