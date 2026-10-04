import type { InterviewMessage, InterviewPhase, LLMConfig, Problem } from '../types/interview';

class LocalLLMService {
  public async checkGeminiConnection(apiKey: string): Promise<{ ok: boolean; models: string[]; error?: string }> {
    if (!apiKey?.trim()) {
      return { ok: false, models: [], error: 'API key is required' };
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (response.ok) {
        const data = await response.json();
        const models = (data.models || [])
          .map((m: any) => m.name?.replace('models/', ''))
          .filter((name: string) => name && name.includes('gemini'));
        return { ok: true, models };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          ok: false,
          models: [],
          error: errData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (e: any) {
      return { ok: false, models: [], error: e.message || 'Connection failed' };
    }
  }

  public buildSystemPrompt(
    problem: Problem,
    phase: InterviewPhase,
    persona: string,
    currentCode: string,
    friendName?: string,
    targetCompany?: string
  ): string {
    const friendContext = friendName ? `Candidate Name: ${friendName}. ` : '';
    const targetContext = targetCompany ? `Target Company/Role: ${targetCompany}. ` : '';

    const personaStyle =
      persona === 'roommate_peer'
        ? `You are ${friendName || "the candidate's"} supportive college roommate and peer mock interviewer. You are practicing together in the dorm to help them land their dream job${targetCompany ? ' at ' + targetCompany : ''}. Your tone is warm, collaborative, sharp, and encouraging with realistic college peer banter. You gently nudge them to think aloud, call out edge cases, and keep interview anxiety low.`
        : persona === 'faang_bar_raiser'
        ? 'You are a rigorous FAANG Bar Raiser interviewer. You are formal, direct, push hard on optimal Big-O bounds, mathematical invariants, and zero tolerance for sloppy edge-case assumptions.'
        : persona === 'supportive_mentor'
        ? 'You are an encouraging, thoughtful senior mentor. You ask collaborative Socratic questions, gently nudge the candidate when they are stuck, and celebrate good observations.'
        : 'You are a pragmatic Tech Lead at a high-growth tech company. You care about readable, modular code, realistic trade-offs, defensive programming, and clear verbal communication.';

    const phaseInstructions = {
      CLARIFY: 'Current Phase: CLARIFICATION. Ask the candidate about constraints, edge cases, input size, expected behavior on empty/invalid inputs. DO NOT let them write code yet. Ensure they clearly restate the problem and ask at least 1-2 clarifying questions.',
      APPROACH: 'Current Phase: ALGORITHM & APPROACH. Ask the candidate to explain their high-level strategy (brute force vs optimal) and explicitly state Time & Space complexity BEFORE writing code.',
      CODING: 'Current Phase: LIVE CODING. The candidate is writing code. Encourage them to "think aloud" and explain lines as they write. If you see a major bug or syntax mistake, ask a guided question rather than giving the solution.',
      TESTING: 'Current Phase: DRY RUN & TESTING. Ask the candidate to walk through their code line-by-line with a concrete test case and state the values of key variables at each step. Verify boundary conditions.',
      DEBRIEF: 'Current Phase: DEBRIEF & RUBRIC. Deliver a crisp, structured review of their performance across Communication, Problem Solving, Code Quality, and Testing. Provide a clear hiring recommendation.'
    }[phase];

    return `
${personaStyle}
${friendContext}${targetContext}

You are conducting a technical Data Structures & Algorithms mock interview for an early-career software engineer.
Problem: "${problem.title}" (${problem.difficulty})
Category: ${problem.category}
Problem Description:
${problem.description}

Optimal Complexity: Time ${problem.optimalComplexity.time}, Space ${problem.optimalComplexity.space}
Optimal Solution Reference:
\`\`\`javascript
${problem.solutionCode.javascript}
\`\`\`

Current Candidate Code:
\`\`\`
${currentCode || '(candidate has not written code yet)'}
\`\`\`

${phaseInstructions}

CRITICAL INTERVIEWER RULES:
1. Keep your replies concise (2-4 sentences max per turn). Real interviewers in live rounds do NOT give long lectures.
2. Ask one clear question or give one specific nudge at a time.
3. NEVER write the full solution code for them unless in the final DEBRIEF phase.
4. If the candidate asks a good clarifying question, answer affirmatively based on the problem specification.
5. If the candidate is silent or confused, offer a level-1 Socratic hint.
`.trim();
  }

  public async generateResponse(
    messages: InterviewMessage[],
    problem: Problem,
    phase: InterviewPhase,
    currentCode: string,
    config: LLMConfig,
    onToken?: (token: string) => void
  ): Promise<string> {
    // 0. Try Google Gemini (AI Studio)
    if (config.backend === 'gemini') {
      const apiKey = config.geminiApiKey?.trim();
      if (!apiKey) {
        return '⚠️ Gemini API key is missing. Please click the Settings gear icon (⚙️) in the top header, select Google Gemini, and paste your Google AI Studio API key.';
      }
      try {
        const sysPrompt = this.buildSystemPrompt(
          problem,
          phase,
          config.persona,
          currentCode,
          config.friendProfile?.name,
          config.friendProfile?.targetCompany
        );

        // Auto-upgrade legacy deprecated models to gemini-3.8-flash
        let model = config.geminiModel || 'gemini-3.8-flash';
        if (model.includes('2.5') || model.includes('gemini-pro')) {
          model = 'gemini-3.8-flash';
        }

        const validMsgs = messages
          .filter(m => m.sender === 'candidate' || m.sender === 'interviewer' || m.sender === 'roommate')
          .slice(-12);

        const chatContents = validMsgs.map(m => {
          let text = m.text;
          if (m.sender === 'roommate') {
            text = `[Roommate Note / Live Co-Pilot Hint]: ${m.text}`;
          }
          return {
            role: m.sender === 'interviewer' ? 'model' : 'user',
            parts: [{ text }]
          };
        });

        if (chatContents.length > 0 && chatContents[0].role === 'model') {
          chatContents.unshift({
            role: 'user',
            parts: [{ text: `I am ready for the technical mock interview on "${problem.title}".` }]
          });
        }

        if (chatContents.length === 0) {
          chatContents.push({
            role: 'user',
            parts: [{ text: `Hello, let's start the interview on "${problem.title}".` }]
          });
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: sysPrompt }]
              },
              contents: chatContents,
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 400
              }
            })
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          throw new Error(errMsg);
        }

        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (candidateText) {
          if (onToken) onToken(candidateText);
          return candidateText;
        }
      } catch (err: any) {
        console.error('Gemini generation failed:', err);
        return `⚠️ Google Gemini inference error: ${err.message}. Please verify your API key and connection in Settings (⚙️).`;
      }
    }

    // 1. Built-in Offline Expert Heuristic Engine
    return this.generateHeuristicResponse(
      messages,
      problem,
      phase,
      currentCode,
      config.persona,
      config.friendProfile?.name
    );
  }

  /**
   * Deterministic, zero-network, zero-download expert DSA interviewer engine.
   * Responds accurately to candidate queries, checks code structure,
   * probes time/space complexity, and manages interview phases.
   */
  private generateHeuristicResponse(
    messages: InterviewMessage[],
    problem: Problem,
    phase: InterviewPhase,
    currentCode: string,
    persona: string,
    friendName?: string
  ): string {
    const lastUserMsg = messages
      .filter(m => m.sender === 'candidate' || m.sender === 'roommate')
      .slice(-1)[0]?.text.toLowerCase() || '';

    const name = friendName || 'there';

    const tonePrefix =
      persona === 'roommate_peer'
        ? `Hey ${name}! `
        : persona === 'faang_bar_raiser'
        ? ''
        : persona === 'supportive_mentor'
        ? 'Great start! '
        : 'Good question. ';

    // 1. CLARIFICATION PHASE
    if (phase === 'CLARIFY') {
      if (lastUserMsg.includes('empty') || lastUserMsg.includes('null') || lastUserMsg.includes('length')) {
        return `${tonePrefix}Regarding size: check the constraints. The input length can range up to ${problem.constraints[0] || '10^5'}. How will your approach handle the minimum boundary condition?`;
      }
      if (lastUserMsg.includes('negative') || lastUserMsg.includes('zero')) {
        return `${tonePrefix}Yes, negative numbers and zero are completely valid inputs here. Does that impact your choice of data structure or arithmetic bounds?`;
      }
      if (lastUserMsg.includes('duplicate') || lastUserMsg.includes('sorted')) {
        return `${tonePrefix}Keep in mind: elements might appear multiple times and the array is ${problem.patterns.includes('Sorting') || problem.patterns.includes('Binary Search') ? 'sorted or partially sorted' : 'not sorted'}. What are the Big-O trade-offs if you were to sort it first?`;
      }
      if (lastUserMsg.includes('ready') || lastUserMsg.includes('approach') || lastUserMsg.includes('think')) {
        return `Excellent. Let's transition to discussing the algorithm. What is the naive brute-force approach, and what is its time and space complexity?`;
      }
      return `${tonePrefix}Thanks for reviewing the prompt. Before writing any code, what clarifying questions or constraints do you have about the input scale, possible negative values, or return format?`;
    }

    // 2. APPROACH PHASE
    if (phase === 'APPROACH') {
      if (lastUserMsg.includes('o(n^2)') || lastUserMsg.includes('brute force')) {
        return `Spot on. An O(N^2) brute force check is straightforward, but with input size up to 10^5 it will result in Time Limit Exceeded. Can we optimize this to ${problem.optimalComplexity.time}? What data structure or pattern comes to mind?`;
      }
      if (lastUserMsg.includes('hash map') || lastUserMsg.includes('map') || lastUserMsg.includes('set') || lastUserMsg.includes('pointer')) {
        return `${tonePrefix}That sounds very promising! If you utilize that strategy, what would be the exact Time and Space complexity, and how do you handle duplicate values?`;
      }
      if (lastUserMsg.includes('o(n)') || lastUserMsg.includes('o(log n)') || lastUserMsg.includes('linear')) {
        return `That complexity target (${problem.optimalComplexity.time}) aligns with the optimal solution! Walk me through the high-level steps, and whenever you're ready, feel free to start writing the code in the editor.`;
      }
      return `${tonePrefix}Walk me through your proposed algorithmic strategy. Are there any trade-offs between memory overhead and execution speed?`;
    }

    // 3. CODING PHASE
    if (phase === 'CODING') {
      const codeLen = currentCode.trim().length;
      if (codeLen < 50) {
        return `Take your time to structure the logic. Remember to think aloud as you write your initial loop or variable declarations so I can follow your thought process.`;
      }

      // Check for common problem pitfalls
      if (problem.id === 'two-sum' && !currentCode.includes('target -')) {
        return `Notice you are iterating through \`nums\`. How are you computing the complement needed to reach \`target\` in O(1) time?`;
      }
      if (problem.id === 'valid-parentheses' && !currentCode.includes('pop') && !currentCode.includes('length')) {
        return `As you process closing brackets, make sure you defensively check whether the stack has remaining items before popping.`;
      }
      if (problem.id === 'best-time-to-buy-and-sell-stock' && currentCode.includes('for') && currentCode.split('for').length > 2) {
        return `I notice nested loops in your implementation. Remember our discussion on achieving O(N) single-pass. Can you track the running minimum price instead?`;
      }

      return `Your structure looks clean. Keep talking through the logic as you finalize the return statement. Once complete, we'll walk through a dry-run test case together.`;
    }

    // 4. TESTING PHASE
    if (phase === 'TESTING') {
      if (lastUserMsg.includes('run') || lastUserMsg.includes('pass') || lastUserMsg.includes('test')) {
        return `Great! Look at the test runner panel below. Did all test cases pass? Now trace through an edge case: what happens if the input has only 1 element or has negative numbers?`;
      }
      return `Let's dry run your implementation. Choose a small example from the problem description and trace the exact values of your key pointers or map at each iteration.`;
    }

    // 5. DEBRIEF PHASE
    return `Great work completing this interview round! Let's examine your overall performance scorecard. Your communication, choice of algorithm, and code modularity were tested against standard early-career benchmarks. Click 'View Complete Scorecard' to inspect your rubric breakdown and feedback.`;
  }

  public async generateScorecardCritique(
    problem: Problem,
    currentCode: string,
    messages: InterviewMessage[],
    testResults: any[],
    config: LLMConfig
  ): Promise<string> {
    if (config.backend === 'gemini' && config.geminiApiKey?.trim()) {
      const apiKey = config.geminiApiKey.trim();
      const model = config.geminiModel || 'gemini-3.8-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const prompt = `
You are a Principal Software Engineer & Bar Raiser conducting an in-depth, authentic technical interview debrief.

PROBLEM:
Title: "${problem.title}" (${problem.difficulty})
Category: ${problem.category}
Target Optimal Complexity: Time ${problem.optimalComplexity.time}, Space ${problem.optimalComplexity.space}
Problem Summary: ${problem.description.slice(0, 300)}...

CANDIDATE SUBMITTED CODE:
\`\`\`
${currentCode || '(no code submitted)'}
\`\`\`

TEST SUITE RESULTS:
${testResults.map((t: any, i: number) => `Test ${i + 1} (${t.passed ? 'PASSED' : 'FAILED'}): input=${t.input} expected=${t.expected} actual=${t.actual}`).join('\n')}

CONVERSATION TRANSCRIPT:
${messages.filter(m => m.sender !== 'system').slice(-10).map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n')}

CANDIDATE INFO:
Name: ${config.friendProfile?.name || 'Candidate'}
Target Role/Company: ${config.friendProfile?.targetCompany || 'Top Tech Roles'}

CONDUCT A THOROUGH EVALUATION:
Write a candid, highly specific engineering debrief in Markdown:
### 1. Executive Verdict & Hiring Recommendation
Provide your official recommendation: **Strong Hire**, **Hire**, **Lean Hire**, **Lean No Hire**, or **No Hire** with a direct 2-3 sentence justification based on their code and problem-solving.

### 2. Deep-Dive Code & Complexity Analysis
- Analyze the candidate's actual written implementation. Cite their variable names and data structure choices.
- Determine the actual Time and Space Big-O complexity achieved vs optimal (${problem.optimalComplexity.time} / ${problem.optimalComplexity.space}).
- Note any edge-case oversights, clean idioms, or redundant allocations.

### 3. Interview Communication & Problem Solving
- How well did the candidate think aloud and clarify assumptions before writing code?

### 4. Actionable Next Steps
- 2-3 precise algorithmic patterns or LeetCode questions they should practice next.
`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1200 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (e) {
        console.error('Gemini debrief error:', e);
      }
    }

    // Heuristic deep dive review if Gemini key is missing or offline
    const passed = testResults.filter((t: any) => t.passed).length;
    const total = testResults.length || problem.testCases.length;
    const rate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const candidateName = config.friendProfile?.name || 'Candidate';
    const targetComp = config.friendProfile?.targetCompany || 'Top Tech Roles';

    return `### 1. Executive Verdict & Recommendation
**Recommendation:** ${rate >= 80 ? '**Hire**' : rate >= 50 ? '**Lean Hire**' : '**Lean No Hire**'}  
${candidateName} tackled "${problem.title}" for ${targetComp}. With a test pass rate of **${rate}%** (${passed}/${total} assertions), the candidate demonstrated ${rate >= 80 ? 'a solid grasp of algorithmic invariants and clean control flow.' : 'promising problem solving but needs to drill edge-case verification and complexity optimization.'}

### 2. Code & Algorithmic Analysis
- **Submitted Implementation:** The code uses ${currentCode.includes('Map') || currentCode.includes('dict') || currentCode.includes('{}') ? 'hash-based indexing for sub-linear lookups' : 'standard array iterations'}.
- **Complexity Assessment:** Target is **Time ${problem.optimalComplexity.time}, Space ${problem.optimalComplexity.space}**. ${currentCode.split('for').length > 2 || currentCode.split('while').length > 2 ? '⚠️ Detected multiple loops; verify if nested iterations increase complexity to O(N²).' : 'Single-pass or logarithmic strategy observed.'}
- **Code Cleanliness:** ${currentCode.length > 100 ? 'Good functional modularity with distinct pointer/variable separation.' : 'Concise script; ensure edge cases like empty inputs, single elements, and duplicates are explicitly guarded.'}

### 3. Communication & Thinking Aloud
- Candidate exchanged ${messages.filter(m => m.sender === 'candidate').length} messages during the round. Proactive clarification on boundary constraints is essential to standing out in FAANG-level loops.

### 4. Actionable Next Steps
- Practice related **${problem.category}** patterns: *${problem.patterns.join(', ')}*.
- Trace boundary test cases manually on a whiteboard before running automated test assertions.`;
  }
}

export const localLLMService = new LocalLLMService();
