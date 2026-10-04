export type InterviewPhase = 'CLARIFY' | 'APPROACH' | 'CODING' | 'TESTING' | 'DEBRIEF';

export type InterviewerPersona = 'faang_bar_raiser' | 'supportive_mentor' | 'pragmatic_lead';

export type InferenceBackend = 'webllm' | 'ollama' | 'lmstudio' | 'heuristic';

export type ProgrammingLanguage = 'javascript' | 'python';

export interface TestCase {
  id: string;
  input: any[];
  expected: any;
  description: string;
  isHidden?: boolean;
}

export interface Hint {
  level: number; // 1: Conceptual nudge, 2: Algorithmic strategy, 3: Data structure, 4: Implementation detail
  label: string;
  text: string;
}

export interface ProbingQuestion {
  phase: InterviewPhase;
  question: string;
  goodAnswer: string;
  redFlag: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  patterns: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  hints: Hint[];
  starterCode: {
    javascript: string;
    python: string;
  };
  solutionCode: {
    javascript: string;
    python: string;
  };
  optimalComplexity: {
    time: string;
    space: string;
    explanation: string;
  };
  trapsAndPitfalls: string[];
  probingQuestions: ProbingQuestion[];
  testCases: TestCase[];
  runFunctionName: string;
}

export interface InterviewMessage {
  id: string;
  sender: 'candidate' | 'interviewer' | 'system';
  text: string;
  timestamp: number;
  phase?: InterviewPhase;
  quickResponses?: string[];
}

export interface RubricDimension {
  name: string;
  score: number; // 1 - 5
  maxScore: number;
  feedback: string;
}

export interface InterviewScorecard {
  overallScore: number; // 0 - 100
  hiringDecision: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Lean No Hire' | 'No Hire';
  dimensions: {
    clarification: RubricDimension;
    approach: RubricDimension;
    codeQuality: RubricDimension;
    testing: RubricDimension;
    communication: RubricDimension;
  };
  strengths: string[];
  areasToImprove: string[];
  timeElapsedSeconds: number;
  hintsUsed: number;
  testCasesPassed: number;
  totalTestCases: number;
  summary: string;
}

export interface LLMConfig {
  backend: InferenceBackend;
  ollamaUrl: string;
  ollamaModel: string;
  lmStudioUrl: string;
  lmStudioModel: string;
  webLlmModel: string;
  persona: InterviewerPersona;
  voiceEnabled: boolean;
  voicePitch: number;
  voiceRate: number;
}

export interface TestExecutionResult {
  testId: string;
  description: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  executionTimeMs: number;
  error?: string;
  logs?: string[];
}
