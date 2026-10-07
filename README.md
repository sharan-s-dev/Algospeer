*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

# AlgosPeer: An Interactive DSA Mock Interview Co-Pilot Built for My Peers

---

## What I Built

I built **AlgosPeer** specifically for my college roommate and peer, who is preparing for intense technical coding phone screens and FAANG early-career software engineering rounds.

### The Real Problem We Faced Together
Preparing for coding rounds in a college dorm is notorious for being high-stress, expensive, and lonely:
1. **The Cost & Rate-Limit Barrier:** Commercial mock interview platforms (Interviewing.io, Exponent) cost $150–$250 per session. Even third-party AI interview tools gate students behind monthly subscriptions and strict rate limits.
2. **The "Awkward Roommate Mock Interview" Dilemma:** When we tried doing peer mock interviews together in our dorm, it was chaotic. As the interviewer, I didn't have the optimal Big-O proofs memorized on the spot, didn't know how to drop subtle hints without accidentally blurting out the answer, and had no structured rubric to give actionable feedback.
3. **The "Thinking Aloud" Deficit:** Grinding LeetCode in silence is completely different from a real live round. Candidates fail if they go silent for 5 minutes. Candidates need to build the muscle memory of articulating hypotheses, clarifying constraints, and defending algorithmic trade-offs aloud.

---

### The Solution: Built for a Friend

**AlgosPeer** is engineered around a **Co-Pilot Dual Architecture** designed for two friends practicing together:

- 👥 **Interactive Roommate Co-Pilot HUD:**
  The roommate opens the **Co-Pilot Console** on a secondary screen or tablet:
  - **Live One-Click Nudges:** The roommate can click **"☕ Dorm Pep Talk"**, **"⚡ Complexity Probe"**, **"🚨 Edge Case Alert"**, or **"🎯 FAANG Scale Curveball"** to inject real-time prompts directly into the candidate's chat.
  - **Calibrated Hint Drop:** A 4-tier progressive hint ladder (Conceptual Nudge ➔ Algorithmic Strategy ➔ Data Structure Choice ➔ Implementation Insight) that lets the roommate drop hints without spoiling the solution.
  - **Cheat Sheet & Proofs:** Complete optimal JavaScript & Python solutions with formal mathematical proofs of Time and Space complexity.
  - **Probing Questions Guide:** Side-by-side rubrics on *What a Good Answer Sounds Like* vs *Red Flags*.
  - **Live Peer Grading:** Star ratings across 5 competencies that **directly blend into the final scorecard** along with the roommate's personal debrief note.

- 🎙️ **Next-Gen AI Interviewer Powered by Google Gemini 3.8 Flash:**
  - Integrated with **Google Gemini 3.8 Flash** via Google AI Studio API for conversational, intelligent mock interviews.
  - **Roommate Co-Pilot Persona:** Friendly peer banter that keeps confidence high and anxiety low, alongside *FAANG Bar Raiser*, *Supportive Senior Mentor*, and *Pragmatic Tech Lead*.
  - Native Web Speech API Text-to-Speech narration and microphone "Think Aloud" speech recognition.
  - **100% Offline Practice Mode:** Zero-network deterministic heuristic engine if no API key is provided.

- ⚡ **In-Browser Code Execution Sandbox:**
  - Real-time CodeMirror 6 code editor with dark IDE theme.
  - Sandboxed execution for JavaScript and Python test assertions with execution times in milliseconds and console output capture.

- 📊 **Blended Roommate & AI Scorecard:**
  - Merges the AI evaluation with the roommate's live ratings and personal feedback.
  - 1-click exportable Markdown debrief report: `AlgosPeer_MockInterview_For_[FriendName].md`.

---

## Demo

- 🌐 **Live Deployed App:** [https://sharan-s-dev.github.io/Algospeer/](https://sharan-s-dev.github.io/Algospeer/)
- **Local Development:** `npm run dev` at [http://localhost:5173/](http://localhost:5173/)
- **Curated Problem Bank:** 8 classic high-frequency interview patterns (Two Sum, Valid Parentheses, Best Time to Buy and Sell Stock, Longest Substring Without Repeating Characters, Merge Intervals, Number of Islands, Coin Change, and Search in Rotated Sorted Array).

---

## Code Structure

🔗 **GitHub Repository:** [https://github.com/sharan-s-dev/Algospeer](https://github.com/sharan-s-dev/Algospeer)

- `src/services/localLLM.ts`: Google Gemini 3.8 Flash API integration + offline expert heuristic engine.
- `src/services/codeRunner.ts`: Sandboxed test assertion runner with console capture.
- `src/services/speechService.ts`: Native Web Speech API speech synthesis (TTS) & voice recognition (STT).
- `src/services/evaluator.ts`: Blended 5-dimension competency rubric calculator and markdown debrief generator.
- `src/components/RoommateCribSheet.tsx`: The interactive peer interviewer HUD with live chat injections and grading.
- `src/components/Header.tsx`, `ProblemPanel.tsx`, `CodeEditorPanel.tsx`, `TestResultsPanel.tsx`, `HintLadderModal.tsx`, `WhiteboardPanel.tsx`, `ScorecardModal.tsx`, `SettingsModal.tsx`.

---

## How to Run Locally

1. Clone repository:
   ```bash
   git clone https://github.com/sharan-s-dev/Algospeer.git
   cd Algospeer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create `.env.local` with your Google AI Studio API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Or enter your key directly in the app's Settings ⚙️ modal, stored securely in browser localStorage)*.
4. Start dev server:
   ```bash
   npm run dev
   ```
