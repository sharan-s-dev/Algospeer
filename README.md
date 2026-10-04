*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

# AlgosPeer: An Offline, Local-Inference DSA Mock Interview Agent Built for My Roommate

---

## What I Built

I built **AlgosPeer** for my roommate and college peer, who is grinding through early-career technical evaluations and coding phone screens for software engineering roles. 

### The Problem
Preparing for technical coding rounds is notorious for being high-stress and isolating. My roommate was encountering three major roadblocks:
1. **The Cost & Cloud Dependency Barrier:** Commercial mock interview platforms (like Interviewing.io or Exponent) charge $150–$250 per session. Even third-party AI interview tools lock students behind monthly recurring subscriptions, rate-limited cloud tokens, and require constant high-speed internet.
2. **The "Awkward Roommate Interview" Dilemma:** When we tried doing peer mock interviews together, it was disorganized. As the interviewer, I either didn't remember the optimal Big-O bounds on the spot, didn't know how to drop subtle hints without accidentally blurting out the solution, or lacked a standardized rubric to give actionable feedback.
3. **The "Thinking Aloud" Deficit:** Solving LeetCode quietly is completely different from a real interview, where interviewers fail candidates who go silent for 5 minutes. Candidates need to build the muscle memory of articulating hypotheses, clarifying constraints, and defending algorithmic trade-offs aloud.

### The Solution
**AlgosPeer** is a 100% offline, local-inference Data Structures & Algorithms mock interview agent engineered with a **Dual-Mode Architecture**:

- 🎙️ **Solo AI Mode:** An automated, voice-driven mock interviewer that guides the candidate through a realistic 5-phase FAANG evaluation pipeline (*Clarification & Constraints ➔ Algorithmic Approach & Big-O ➔ Live Coding ➔ Dry Run & Edge Testing ➔ Post-Interview Debrief & Rubric Scorecard*). Features 3 customizable interviewer personas (*FAANG Bar Raiser*, *Supportive Senior Mentor*, and *Pragmatic Tech Lead*), Web Speech API Text-to-Speech narration, and a microphone "Think Aloud" speech recognition toggle.
- 👥 **Roommate Co-Pilot HUD:** When friends practice together, the roommate opens an **Interviewer HUD & Cheat Sheet** on their laptop or secondary screen. It equips them with:
  - The complete optimal JavaScript & Python solutions with inline annotations.
  - Formal mathematical proofs of Time and Space complexity.
  - Phase-by-phase **Probing Questions** with side-by-side guides on *What a Good Answer Sounds Like* vs *Red Flags*.
  - A **Traps & Candidate Pitfalls** checklist to catch subtle bugs before the candidate runs tests.
  - Live 1-to-5 star rubric sliders and a private interviewer scratchpad.
- 🪜 **Calibrated 4-Tier Hint Ladder:** Progressive hints (Conceptual Nudge ➔ Algorithmic Strategy ➔ Data Structure Choice ➔ Implementation Insight) that prevent giving away answers and deduct score points accordingly.
- ⚡ **In-Browser Code Execution Sandbox:** A CodeMirror 6 code editor with dark IDE theme, automated test assertion engine (pass/fail badges, execution duration in milliseconds, stdout logs capture), and custom edge-case test addition.
- 📊 **Post-Interview Rubric Scorecard:** Instant evaluation across 5 core competencies (Clarification, Algorithmic Rigor, Code Quality, Test Coverage, and Verbal Communication), animated confetti celebration for passing rounds, and a 1-click exportable Markdown debrief report.

---

## Demo

- **Local Development / Web Access:** [http://localhost:5173/](http://localhost:5173/)
- **Curated Interview Problem Bank:** 8 classic, high-frequency interview patterns (Two Sum, Valid Parentheses, Best Time to Buy and Sell Stock, Longest Substring Without Repeating Characters, Merge Intervals, Number of Islands, Coin Change, and Search in Rotated Sorted Array).
- **Dual Perspective:** Candidates code in an uncluttered IDE while the interviewer / roommate HUD runs synchronously.

---

## Code

{% github https://github.com/sharan-s-dev/Algospeer %}

🔗 **GitHub Repository:** [https://github.com/sharan-s-dev/Algospeer](https://github.com/sharan-s-dev/Algospeer)

The complete source code is open source and structured as a clean, modular React 19 + TypeScript + Vite project:

- **Repository Structure:**
  - `src/services/localLLM.ts`: Multi-backend offline inference engine (WebGPU WebLLM + Ollama + LM Studio + Offline Heuristic fallback).
  - `src/services/codeRunner.ts`: Sandboxed in-browser JavaScript/Python test assertion runner with timeout and console capture.
  - `src/services/speechService.ts`: Native Web Speech API speech synthesis (TTS) & continuous voice recognition (STT).
  - `src/services/evaluator.ts`: 5-dimension competency rubric calculator and markdown debrief generator.
  - `src/components/RoommateCribSheet.tsx`: The peer interviewer HUD with cheat sheets, probing questions, and live rating controls.
  - `src/components/Header.tsx`, `ProblemPanel.tsx`, `CodeEditorPanel.tsx`, `TestResultsPanel.tsx`, `HintLadderModal.tsx`, `WhiteboardPanel.tsx`, `ScorecardModal.tsx`, `SettingsModal.tsx`.

---

## How I Built It

AlgosPeer is built entirely around **open-source AI and client-side inference**:

### 1. In-Browser Local Inference with WebLLM & WebGPU
We integrated `@mlc-ai/web-llm` to execute open-weight LLMs directly inside the browser using WebGPU acceleration:
- **Supported Models:**
  - `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC` (Fast, lightweight coding model requiring ~1GB VRAM).
  - `Llama-3.2-1B-Instruct-q4f16_1-MLC` (Ultra-compact mobile/laptop-friendly model, ~800MB).
  - `SmolLM2-1.7B-Instruct-q4f16_1-MLC` (High efficiency on commodity laptops).
  - `Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC` (Deep algorithmic reasoning for machines with 6GB+ VRAM).
- **Zero Cloud Footprint:** Model weights are downloaded directly from open-source repositories and cached in browser IndexedDB. Once cached, the entire interview runs 100% offline—even with Wi-Fi turned off.

### 2. Local Model Server Integration (Ollama & LM Studio)
For developers who already run models on their local machine:
- 1-click connection to **Ollama** (`http://localhost:11434`) and **LM Studio / LocalAI** (`http://localhost:1234/v1`).
- Auto-fetches installed models via `/api/tags` so candidates can use their own fine-tuned or quantized models (such as `qwen2.5-coder:7b`, `llama3.2:3b`, or `deepseek-r1:7b`).

### 3. Zero-Setup Offline Heuristic Fallback Engine
To ensure any student with an older laptop or integrated GPU can immediately practice without downloading multi-gigabyte models, we engineered an embedded deterministic state-machine expert evaluator. It analyzes question keywords, verifies Big-O expressions, inspects candidate code structure, and triggers phase-appropriate dialogue instantly.

### 4. Modern Web Architecture
- **Frontend Stack:** React 19, TypeScript, Vite, Tailwind CSS, PostCSS.
- **Code Editor:** CodeMirror 6 (`@uiw/react-codemirror`) customized with One Dark theme, line numbers, bracket auto-closing, and `Ctrl + Enter` test triggers.
- **Audio & Voice:** Browser-native Web Speech API for zero-latency speech synthesis with customizable pitch/speed and real-time microphone transcript streaming.
- **Visuals:** Dark mode IDE aesthetics, glassmorphic panels, glowing status pills, soundwave audio animations, and `canvas-confetti`.

---

## Why Does Open Innovation Matter?

Open innovation is the cornerstone of why this project is possible:

1. **Democratizing High-Stakes Career Preparation:**
   Closed APIs (OpenAI, Anthropic, Google Gemini Cloud) gate intelligent tutoring behind paywalls, subscription tiers, and per-token pricing. For cash-strapped college students or job seekers from underrepresented backgrounds, spending $20/month per tool or $200 for mock interviews is prohibitive. Open-weight models (Qwen 2.5 Coder, Llama 3.2, SmolLM) dismantle this economic barrier, giving every student access to a world-class FAANG bar raiser on their own hardware for free.

2. **Total Privacy & Psychological Safety:**
   Technical interviews are intimidating. Candidates often feel self-conscious when making mistakes or asking elementary questions. Because AlgosPeer runs locally with open-source models, candidate speech transcripts, whiteboard drawings, and buggy early code never leave the local device. There is no telemetry, no cloud logging, and no fear of judgment.

3. **Offline Resilience:**
   Students frequently study in transit, in basements, in libraries with firewalled networks, or in areas with intermittent connectivity. Closed APIs completely fail the moment an internet connection drops. Open local inference guarantees that an interview session never stutters, drops, or times out.

---

## My Agent Session

This project was architected, scaffolded, built, debugged, and verified with **Antigravity IDE** using pair programming:
- Initialized a full-featured React 19 + TypeScript + Vite project.
- Implemented comprehensive TypeScript interfaces, problem datasets with Big-O proofs, sandbox execution runners, Web Speech integrations, and CodeMirror 6 setups.
- Resolved build and bundler constraints (`verbatimModuleSyntax`, unused locals, and Tailwind CSS compilation pipelines).
- Embedded peer-specific interview features like the Roommate Interviewer HUD and Hint Ladder.

---

## Prize Categories

- **Build for a Friend** (Engineered specifically for my roommate and peers preparing for early-career SWE technical evaluations).
- **Most Impactful Open-Source AI Project** (Empowering students with 100% offline, local-inference AI mock interviews using WebGPU, WebLLM, and Ollama).
- **Best Developer Tool / Career Tech** (Bridging the gap between silent LeetCode practice and collaborative, vocal technical interviews).
