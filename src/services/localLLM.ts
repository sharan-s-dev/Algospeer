import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import type { InterviewMessage, InterviewPhase, LLMConfig, Problem } from '../types/interview';

export interface ProgressReport {
  text: string;
  progress: number;
}

class LocalLLMService {
  private engine: MLCEngine | null = null;
  private currentWebLlmModel: string | null = null;
  private isInitializing = false;

  public async initWebLLM(
    modelId: string,
    onProgress?: (report: ProgressReport) => void
  ): Promise<boolean> {
    if (this.engine && this.currentWebLlmModel === modelId) {
      return true;
    }

    this.isInitializing = true;
    try {
      this.engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          onProgress?.({
            text: report.text,
            progress: report.progress
          });
        }
      });
      this.currentWebLlmModel = modelId;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.error('Failed to initialize WebLLM engine:', err);
      this.isInitializing = false;
      throw err;
    }
  }

  public getWebLLMStatus(): { initialized: boolean; model: string | null; initializing: boolean } {
    return {
      initialized: !!this.engine,
      model: this.currentWebLlmModel,
      initializing: this.isInitializing
    };
  }

  public async checkOllamaConnection(url: string): Promise<{ ok: boolean; models: string[] }> {
    try {
      const trimmedUrl = url.replace(/\/$/, '');
      const response = await fetch(`${trimmedUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const models = (data.models || []).map((m: any) => m.name);
        return { ok: true, models };
      }
      return { ok: false, models: [] };
    } catch (e) {
      return { ok: false, models: [] };
    }
  }

  public async checkLMStudioConnection(url: string): Promise<{ ok: boolean; models: string[] }> {
    try {
      const trimmedUrl = url.replace(/\/$/, '');
      const response = await fetch(`${trimmedUrl}/v1/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const models = (data.data || []).map((m: any) => m.id);
        return { ok: true, models };
      }
      return { ok: false, models: [] };
    } catch (e) {
      return { ok: false, models: [] };
    }
  }

  public buildSystemPrompt(
    problem: Problem,
    phase: InterviewPhase,
    persona: string,
    currentCode: string
  ): string {
    const personaStyle =
      persona === 'faang_bar_raiser'
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
    // 1. Try WebLLM if configured
    if (config.backend === 'webllm' && this.engine) {
      try {
        const sysPrompt = this.buildSystemPrompt(problem, phase, config.persona, currentCode);
        const chatHistory = [
          { role: 'system', content: sysPrompt },
          ...messages.slice(-8).map(m => ({
            role: m.sender === 'interviewer' ? 'assistant' : 'user',
            content: m.text
          }))
        ];

        const response = await this.engine.chat.completions.create({
          messages: chatHistory as any,
          temperature: 0.6,
          max_tokens: 300,
          stream: !!onToken
        });

        if (onToken && (response as any)[Symbol.asyncIterator]) {
          let fullText = '';
          for await (const chunk of response as any) {
            const delta = chunk.choices[0]?.delta?.content || '';
            fullText += delta;
            onToken(delta);
          }
          return fullText;
        } else {
          return (response as any).choices[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('WebLLM generation error, falling back to heuristic:', err);
      }
    }

    // 2. Try Ollama local endpoint
    if (config.backend === 'ollama') {
      try {
        const sysPrompt = this.buildSystemPrompt(problem, phase, config.persona, currentCode);
        const chatHistory = [
          { role: 'system', content: sysPrompt },
          ...messages.slice(-8).map(m => ({
            role: m.sender === 'interviewer' ? 'assistant' : 'user',
            content: m.text
          }))
        ];

        const res = await fetch(`${config.ollamaUrl.replace(/\/$/, '')}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.ollamaModel || 'llama3.2',
            messages: chatHistory,
            stream: false,
            options: { temperature: 0.6 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          return data.message?.content || '';
        }
      } catch (err) {
        console.warn('Ollama connection failed, falling back to heuristic:', err);
      }
    }

    // 3. Try LM Studio
    if (config.backend === 'lmstudio') {
      try {
        const sysPrompt = this.buildSystemPrompt(problem, phase, config.persona, currentCode);
        const chatHistory = [
          { role: 'system', content: sysPrompt },
          ...messages.slice(-8).map(m => ({
            role: m.sender === 'interviewer' ? 'assistant' : 'user',
            content: m.text
          }))
        ];

        const res = await fetch(`${config.lmStudioUrl.replace(/\/$/, '')}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.lmStudioModel || 'local-model',
            messages: chatHistory,
            temperature: 0.6,
            max_tokens: 300
          })
        });

        if (res.ok) {
          const data = await res.json();
          return data.choices[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('LM Studio connection failed, falling back to heuristic:', err);
      }
    }

    // 4. Built-in Offline Expert Heuristic Engine
    return this.generateHeuristicResponse(messages, problem, phase, currentCode, config.persona);
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
    persona: string
  ): string {
    const lastUserMsg = messages
      .filter(m => m.sender === 'candidate')
      .slice(-1)[0]?.text.toLowerCase() || '';

    const tonePrefix =
      persona === 'faang_bar_raiser'
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
}

export const localLLMService = new LocalLLMService();
