import type { InterviewMessage, InterviewScorecard, Problem, TestExecutionResult } from '../types/interview';

export function calculateScorecard(
  problem: Problem,
  messages: InterviewMessage[],
  testResults: TestExecutionResult[],
  hintsUsed: number,
  timeElapsedSeconds: number,
  code: string
): InterviewScorecard {
  const candidateMessages = messages.filter(m => m.sender === 'candidate');
  const candidateWordCount = candidateMessages.reduce(
    (acc, m) => acc + m.text.trim().split(/\s+/).length,
    0
  );

  const testsPassed = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length > 0 ? testResults.length : problem.testCases.length;
  const testPassRate = totalTests > 0 ? testsPassed / totalTests : 0;

  // 1. Clarification & Constraints Score (1 - 5)
  // Evaluates whether candidate asked about edge cases, nulls, negative numbers, input size
  const hasAskedClarification = candidateMessages.some(m => {
    const t = m.text.toLowerCase();
    return (
      t.includes('negative') ||
      t.includes('zero') ||
      t.includes('empty') ||
      t.includes('duplicate') ||
      t.includes('constraint') ||
      t.includes('bound') ||
      t.includes('sorted')
    );
  });
  let clarifyScore = hasAskedClarification ? 5 : candidateMessages.length > 2 ? 3.5 : 2.5;

  // 2. Approach & Complexity Score (1 - 5)
  const hasMentionedBigO = candidateMessages.some(m => {
    const t = m.text.toLowerCase();
    return t.includes('o(') || t.includes('complexity') || t.includes('space') || t.includes('time') || t.includes('linear');
  });
  let approachScore = hasMentionedBigO ? 4.5 : 3.0;
  if (hintsUsed === 0) approachScore = Math.min(5, approachScore + 0.5);
  else if (hintsUsed > 2) approachScore = Math.max(1, approachScore - (hintsUsed - 2) * 0.5);

  // 3. Code Quality & Modularity (1 - 5)
  let codeQualityScore = 3.5;
  if (code.includes('const') || code.includes('let') || code.includes('def ')) codeQualityScore += 0.5;
  if (code.length > 80 && !code.includes('var')) codeQualityScore += 0.5;
  if (testPassRate === 1.0) codeQualityScore = Math.min(5, codeQualityScore + 0.5);

  // 4. Testing & Edge Cases (1 - 5)
  let testingScore = Math.max(1, Math.round(testPassRate * 5 * 10) / 10);

  // 5. Communication & Think Aloud (1 - 5)
  let communicationScore = 3.0;
  if (candidateMessages.length >= 5 || candidateWordCount > 150) communicationScore = 5.0;
  else if (candidateMessages.length >= 3 || candidateWordCount > 70) communicationScore = 4.0;
  else if (candidateMessages.length >= 1) communicationScore = 3.0;
  else communicationScore = 2.0;

  // Overall Score Calculation (weighted)
  // Clarify: 15%, Approach: 25%, Code: 25%, Testing: 20%, Communication: 15%
  const weightedTotal =
    (clarifyScore / 5) * 15 +
    (approachScore / 5) * 25 +
    (codeQualityScore / 5) * 25 +
    (testingScore / 5) * 20 +
    (communicationScore / 5) * 15;

  const overallScore = Math.min(100, Math.max(10, Math.round(weightedTotal)));

  // Hiring Decision
  let hiringDecision: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Lean No Hire' | 'No Hire' = 'Lean Hire';
  if (overallScore >= 85 && testPassRate >= 0.8) {
    hiringDecision = 'Strong Hire';
  } else if (overallScore >= 70 && testPassRate >= 0.6) {
    hiringDecision = 'Hire';
  } else if (overallScore >= 55) {
    hiringDecision = 'Lean Hire';
  } else if (overallScore >= 40) {
    hiringDecision = 'Lean No Hire';
  } else {
    hiringDecision = 'No Hire';
  }

  // Strengths & Areas to Improve
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (testPassRate === 1.0) {
    strengths.push('Passed 100% of test cases including tricky edge cases.');
  } else if (testPassRate >= 0.6) {
    strengths.push('Resolved core algorithmic test cases effectively.');
  } else {
    areasToImprove.push('Improve edge-case debugging to ensure all unit test assertions pass.');
  }

  if (hasMentionedBigO) {
    strengths.push(`Stated and analyzed Big-O complexity trade-offs before diving into code.`);
  } else {
    areasToImprove.push(`Always state Time and Space complexity explicitly before writing code.`);
  }

  if (hasAskedClarification) {
    strengths.push('Asked insightful clarifying questions regarding input constraints and edge cases.');
  } else {
    areasToImprove.push('Proactively inquire about boundary conditions, negative values, and memory constraints.');
  }

  if (hintsUsed === 0) {
    strengths.push('Demonstrated strong autonomy and independence with 0 hints requested.');
  } else if (hintsUsed <= 2) {
    strengths.push('Effectively leveraged minimal Socratic hints to make algorithmic breakthroughs.');
  } else {
    areasToImprove.push(`Relied on ${hintsUsed} hints; practice pattern recognition for ${problem.patterns.join(', ')}.`);
  }

  if (candidateMessages.length >= 4) {
    strengths.push('Exemplary "thinking aloud" discipline; clearly shared hypothesis and logic step-by-step.');
  } else {
    areasToImprove.push('Increase verbal communication while coding; avoid prolonged periods of silence.');
  }

  const mins = Math.floor(timeElapsedSeconds / 60);
  const secs = timeElapsedSeconds % 60;
  const timeFormatted = `${mins}m ${secs}s`;

  const summary = `Candidate completed mock interview for "${problem.title}" in ${timeFormatted}. Achieved an overall score of ${overallScore}/100 with ${testsPassed}/${totalTests} tests passed. Evaluated recommendation: ${hiringDecision}.`;

  return {
    overallScore,
    hiringDecision,
    dimensions: {
      clarification: {
        name: 'Problem Clarification & Constraints',
        score: clarifyScore,
        maxScore: 5,
        feedback: hasAskedClarification
          ? 'Great job uncovering edge cases and validating assumptions early.'
          : 'Did not actively ask clarifying questions before proposing a solution.'
      },
      approach: {
        name: 'Algorithmic Strategy & Big-O',
        score: approachScore,
        maxScore: 5,
        feedback: hasMentionedBigO
          ? `Good breakdown of computational trade-offs matching target ${problem.optimalComplexity.time}.`
          : 'Be explicit when stating Time and Space complexity bounds.'
      },
      codeQuality: {
        name: 'Code Cleanliness & Structure',
        score: codeQualityScore,
        maxScore: 5,
        feedback:
          testPassRate === 1.0
            ? 'Clean, idiomatic solution adhering to engineering best practices.'
            : 'Code structure is reasonable; check boundary conditions and variable updates.'
      },
      testing: {
        name: 'Self-Verification & Test Coverage',
        score: testingScore,
        maxScore: 5,
        feedback: `Passed ${testsPassed} out of ${totalTests} test cases.`
      },
      communication: {
        name: 'Communication & Think Aloud',
        score: communicationScore,
        maxScore: 5,
        feedback:
          candidateMessages.length >= 4
            ? 'Candidate maintained continuous, transparent dialogue throughout the round.'
            : 'Candidate had brief replies; practice verbalizing decisions in real-time.'
      }
    },
    strengths,
    areasToImprove,
    timeElapsedSeconds,
    hintsUsed,
    testCasesPassed: testsPassed,
    totalTestCases: totalTests,
    summary
  };
}

export function generateMarkdownReport(
  problem: Problem,
  scorecard: InterviewScorecard,
  code: string,
  language: string
): string {
  const mins = Math.floor(scorecard.timeElapsedSeconds / 60);
  const secs = scorecard.timeElapsedSeconds % 60;

  return `# Technical Interview Evaluation Report
**Problem:** ${problem.title} (${problem.difficulty})
**Category:** ${problem.category}
**Duration:** ${mins}m ${secs}s
**Hiring Decision:** ${scorecard.hiringDecision} (Overall Score: ${scorecard.overallScore}/100)

---

## Performance Rubric Breakdown
| Dimension | Score | Assessment |
| :--- | :---: | :--- |
| **Problem Clarification** | ${scorecard.dimensions.clarification.score}/5 | ${scorecard.dimensions.clarification.feedback} |
| **Algorithmic Strategy & Big-O** | ${scorecard.dimensions.approach.score}/5 | ${scorecard.dimensions.approach.feedback} |
| **Code Quality & Idiomatic Style** | ${scorecard.dimensions.codeQuality.score}/5 | ${scorecard.dimensions.codeQuality.feedback} |
| **Test Coverage & Verification** | ${scorecard.dimensions.testing.score}/5 | ${scorecard.dimensions.testing.feedback} |
| **Communication & Think Aloud** | ${scorecard.dimensions.communication.score}/5 | ${scorecard.dimensions.communication.feedback} |

---

## Key Candidate Strengths
${scorecard.strengths.map(s => `- ${s}`).join('\n')}

## Recommended Areas for Growth
${scorecard.areasToImprove.map(a => `- ${a}`).join('\n')}

---

## Test Execution Summary
- **Passed:** ${scorecard.testCasesPassed} / ${scorecard.totalTestCases}
- **Hints Requested:** ${scorecard.hintsUsed}
- **Optimal Complexity Target:** Time ${problem.optimalComplexity.time}, Space ${problem.optimalComplexity.space}

---

## Submitted Solution Code (${language.toUpperCase()})
\`\`\`${language}
${code}
\`\`\`

*Generated by AlgosPeer Local-Inference DSA Mock Interview Agent*
`;
}
