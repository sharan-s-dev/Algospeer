# AlgosPeer — Offline Local-Inference DSA Mock Interview Agent

> **Engineered for peers and roommates preparing for early-career software engineering technical evaluations (FAANG, Big Tech, and high-growth tech startups).**

**100% Offline & Private:** Zero cloud API keys required. Operates completely offline using client-side WebGPU (WebLLM), local Ollama/LM Studio endpoints, or an instant-execution offline heuristic expert engine.

---

## Key Features

### 1. Dual-Mode Interview Experience
- **Solo AI Mode:**
  - Automated FAANG-style mock interviewer with customizable personas (*FAANG Bar Raiser*, *Supportive Senior Mentor*, or *Pragmatic Tech Lead*).
  - Speech synthesis (TTS) reads interviewer responses aloud.
  - Speech-to-text mic integration for practicing the vital "Thinking Aloud" interview discipline.
- **Roommate / Peer Co-Pilot Mode:**
  - Designed for two roommates or classmates practicing together.
  - While one friend codes on the candidate screen, the other friend opens the **Roommate Interviewer HUD & Cheat Sheet**:
    - Complete optimal solution code in JavaScript & Python with inline annotations.
    - Mathematical proofs for Time and Space complexity.
    - Curated **Probing Questions** for each phase with clear guides on *What a Good Answer Sounds Like* vs *Red Flags*.
    - **Traps & Candidate Pitfalls** checklist to catch subtle bugs before the candidate runs tests.
    - Live 1-to-5 star rubric sliders and private interviewer notepad.

### 2. Structured 5-Phase Interview Lifecycle
1. **Clarification & Constraints:** Probe input scales, negative numbers, empty arrays, duplicate handling, and edge cases.
2. **Algorithmic Strategy & Big-O:** Formulate brute-force vs optimal trade-offs and explicitly lock in Big-O Time & Space bounds *before* coding.
3. **Live Coding & Think-Aloud:** Clean CodeMirror 6 editor with syntax highlighting, automatic indentation, bracket matching, and quick resets.
4. **Self-Verification & Test Execution:** In-browser test runner with assertion diffs, execution timing (ms), stdout capturing, and custom edge-case test addition.
5. **Post-Interview Debrief & Rubric Scorecard:** Comprehensive evaluation across 5 core competencies, confetti celebration, actionable strengths/weaknesses, and 1-click markdown report download.

### 3. Progressive 4-Level Hint Ladder
- **Level 1:** Conceptual Socratic Nudge
- **Level 2:** Algorithmic Strategy
- **Level 3:** Data Structure Choice
- **Level 4:** Single-Pass Implementation Insight
- Calibrated to track how many hints were unlocked to factor into the final hiring evaluation.

### 4. Interactive Candidate Whiteboard & Scratchpad
- Dedicated ASCII sketchpad with 1-click templates for **Two Pointers**, **Linked Lists**, **Binary Search Trees**, and **2D Matrix Grids** for dry-running state before coding.

### 5. Multi-Engine Local Inference
- **In-Browser WebGPU (WebLLM):** Runs models directly inside Chrome/Edge using WebGPU, cached in IndexedDB:
  - `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC`
  - `Llama-3.2-1B-Instruct-q4f16_1-MLC`
  - `SmolLM2-1.7B-Instruct-q4f16_1-MLC`
  - `Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC`
- **Ollama Connector:** Connects to `http://localhost:11434` with auto-detected local models (`llama3.2`, `qwen2.5-coder:7b`, `deepseek-r1:7b`, `codellama`, etc.).
- **LM Studio / LocalAI Connector:** Connects to `http://localhost:1234/v1`.
- **Instant Offline Heuristic Engine:** Zero-setup, zero-download fallback that responds to questions, evaluates code structure, and guides stages without requiring a GPU.

---

## Quickstart

### 1. Install & Start Dev Server
\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
\`\`\`bash
npm run build
npm run preview
\`\`\`

---

## Curated Question Bank
- **Two Sum** (Arrays, Hash Map, Two Pointers)
- **Valid Parentheses** (Stacks, String Parsing)
- **Best Time to Buy and Sell Stock** (Sliding Window, Greedy, Dynamic Programming)
- **Longest Substring Without Repeating Characters** (Sliding Window, Map Index Jump)
- **Merge Intervals** (Sorting, Interval Boundaries)
- **Number of Islands** (Graphs, Matrix BFS/DFS, Connected Components)
- **Coin Change** (Dynamic Programming, Unbounded Knapsack)
- **Search in Rotated Sorted Array** (Modified Binary Search)
- **Kth Largest Element in an Array** (Min-Heap vs QuickSelect)
- **Trapping Rain Water** (Two Pointers, Basin Calculation)

---

## Project Structure
\`\`\`
src/
├── types/
│   └── interview.ts        # TypeScript interfaces (Phases, Problems, Rubrics, Scorecard)
├── data/
│   └── problems.ts         # Curated problem repository with test cases, proofs & pitfalls
├── services/
│   ├── codeRunner.ts       # Sandboxed in-browser JS/Python execution & test assertions
│   ├── localLLM.ts         # WebLLM, Ollama, LM Studio & heuristic AI engine
│   ├── speechService.ts    # Web Speech API TTS & microphone speech recognition
│   └── evaluator.ts        # Rubric evaluation engine & markdown report generator
└── components/
    ├── Header.tsx           # Brand, timer, problem picker, phase tracker, mode toggles
    ├── ProblemPanel.tsx     # Problem prompt, constraints, examples, Big-O targets
    ├── InterviewChatPanel.tsx # Conversational AI, voice TTS, mic input, talking chips
    ├── CodeEditorPanel.tsx  # CodeMirror 6 dark editor with shortcut triggers
    ├── TestResultsPanel.tsx # Test suite tabs, pass/fail badges, stdout, custom test runner
    ├── HintLadderModal.tsx  # Progressive 4-level hint ladder
    ├── RoommateCribSheet.tsx# Peer interviewer HUD with cheat sheet & live rubric
    ├── WhiteboardPanel.tsx  # Floating ASCII scratchpad with diagram templates
    ├── ScorecardModal.tsx   # Comprehensive post-interview evaluation report & confetti
    └── SettingsModal.tsx    # Local model selector, WebLLM downloader & voice tuning
\`\`\`
