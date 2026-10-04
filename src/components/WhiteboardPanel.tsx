import React, { useState } from 'react';
import { FileCode2, Copy, Check, Trash2, X } from 'lucide-react';

interface WhiteboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhiteboardPanel: React.FC<WhiteboardPanelProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<string>(`// Scratchpad & ASCII Trace Pad for Dry-Running Invariants
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
    <div className="fixed bottom-6 right-6 z-40 w-96 h-84 bg-[#0e0f15] border border-[#222534] shadow-2xl flex flex-col rounded-lg overflow-hidden animate-in slide-in-from-bottom duration-150">
      {/* Top Header */}
      <div className="h-8 px-3 bg-[#111219] border-b border-[#1c1e2a] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-200 font-mono">Scratchpad Whiteboard</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Copy scratchpad content"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1a1c27] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setContent('')}
            title="Clear scratchpad"
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-[#1a1c27] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1a1c27] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Insert Templates */}
      <div className="px-2 py-1 bg-[#0b0c11] border-b border-[#181924] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
        <button
          onClick={() =>
            insertTemplate(`// Pointers:
// [ A, B, C, D, E ]
//   ^           ^
//  left       right`)
          }
          className="px-1.5 py-0.5 rounded bg-[#13141d] hover:bg-[#1a1c27] text-slate-300 border border-[#1e202c] whitespace-nowrap"
        >
          + Two Pointers
        </button>
        <button
          onClick={() =>
            insertTemplate(`// Linked List:
// (Head) -> [1] -> [2] -> [3] -> (Null)`)
          }
          className="px-1.5 py-0.5 rounded bg-[#13141d] hover:bg-[#1a1c27] text-slate-300 border border-[#1e202c] whitespace-nowrap"
        >
          + Linked List
        </button>
        <button
          onClick={() =>
            insertTemplate(`// Matrix 2D:
// [1, 1, 0]
// [0, 1, 0]
// [0, 0, 1]`)
          }
          className="px-1.5 py-0.5 rounded bg-[#13141d] hover:bg-[#1a1c27] text-slate-300 border border-[#1e202c] whitespace-nowrap"
        >
          + 2D Grid
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 p-2 bg-[#090a0f]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Sketch pointer diagrams, state tables, or dry run traces here..."
          className="w-full h-full bg-transparent resize-none font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none leading-relaxed"
        />
      </div>
    </div>
  );
};
