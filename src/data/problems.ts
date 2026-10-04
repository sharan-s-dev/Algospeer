import type { Problem } from '../types/interview';

export const PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    patterns: ['Hash Map', 'Two Pointers'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] == 2 + 4 == 6, return [1, 2].'
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
        explanation: 'Both elements are identical values but at distinct indices.'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'Can you write a brute force solution first? What is its time complexity, and what makes it redundant?'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'For any number x, what exact value do you need to find to sum to target? Can you check for that complement in constant time?'
      },
      {
        level: 3,
        label: 'Data Structure Choice',
        text: 'A Hash Map (dictionary) allows average O(1) lookups. What should you store as keys, and what should be the values?'
      },
      {
        level: 4,
        label: 'Single-Pass Optimization',
        text: 'You don\'t need two separate passes. While iterating through nums, check if (target - num) exists in your map. If not, insert num with its index.'
      }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}
`,
      python: `def two_sum(nums, target):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    optimalComplexity: {
      time: 'O(N)',
      space: 'O(N)',
      explanation: 'We iterate through the array of length N once. Each lookup and insertion into the hash table is amortized O(1). Space complexity is O(N) in the worst case where no pair is found until the end.'
    },
    trapsAndPitfalls: [
      'Using the exact same element twice (e.g. returning [0, 0] when target is 6 and nums[0] is 3).',
      'Two-pass hash map where identical duplicate numbers overwrite indices before the check.',
      'Assuming the input array is sorted (it is not; sorting takes O(N log N) and complicates preserving original indices).'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Could the array contain negative numbers or zeros? Can there be duplicate numbers in nums?',
        goodAnswer: 'Yes, negative numbers and zeros are allowed within the constraints, and duplicates can exist. We must ensure we return two distinct indices.',
        redFlag: 'Assumes all numbers are positive integers or ignores the possibility of duplicate numbers like [3, 3].'
      },
      {
        phase: 'APPROACH',
        question: 'If you use a Hash Map, do you need to insert all elements first before searching for complements?',
        goodAnswer: 'No, a single pass works. We can check if the complement already exists in the map; if not, we record the current element and continue.',
        redFlag: 'Insists on pre-filling the map without handling duplicate numbers overwriting indices.'
      },
      {
        phase: 'CODING',
        question: 'What is the type of key you are storing in your map, and what edge cases should you guard against?',
        goodAnswer: 'Key is the number value, value is its index. In JS, using Map avoids prototype key collisions; in Python, dict handles integer keys cleanly.',
        redFlag: 'Storing indices as keys and values as numbers, making lookup O(N).'
      },
      {
        phase: 'TESTING',
        question: 'Walk me through how your code handles nums = [3, 3] with target = 6.',
        goodAnswer: 'At index 0 (val 3), complement 3 is not yet in map, so seen[3] = 0. At index 1 (val 3), complement 3 is in map, returning [0, 1].',
        redFlag: 'Cannot trace the state or assumes index 0 matches with index 0.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        description: 'Standard example with positive integers'
      },
      {
        id: 'tc-2',
        input: [[3, 2, 4], 6],
        expected: [1, 2],
        description: 'Target made from non-adjacent elements'
      },
      {
        id: 'tc-3',
        input: [[3, 3], 6],
        expected: [0, 1],
        description: 'Duplicate values summing to target'
      },
      {
        id: 'tc-4',
        input: [[-1, -2, -3, -4, -5], -8],
        expected: [2, 4],
        description: 'Negative numbers'
      },
      {
        id: 'tc-5',
        input: [[0, 4, 3, 0], 0],
        expected: [0, 3],
        description: 'Zeros summing to zero'
      }
    ],
    runFunctionName: 'twoSum'
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks',
    patterns: ['Stack', 'String Parsing'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      },
      {
        input: 's = "([])"',
        output: 'true'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'Notice that the most recently opened bracket must be the first one to be closed. What data structure has Last-In, First-Out (LIFO) behavior?'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'When encountering an opening bracket, push it onto a stack. When encountering a closing bracket, what should you inspect?'
      },
      {
        level: 3,
        label: 'Data Structure Mapping',
        text: 'Use a hash map or lookup table to map each closing bracket to its corresponding opening bracket for clean O(1) matching.'
      },
      {
        level: 4,
        label: 'Edge Cases',
        text: 'Remember to check if the stack is empty when encountering a closing bracket, and check if the stack is completely empty at the very end.'
      }
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your solution here
  
}
`,
      python: `def is_valid(s):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function isValid(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  for (const char of s) {
    if (map[char]) {
      if (stack.length === 0 || stack[stack.length - 1] !== map[char]) {
        return false;
      }
      stack.pop();
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s):
    if len(s) % 2 != 0:
        return False
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in pairs:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    return len(stack) == 0`
    },
    optimalComplexity: {
      time: 'O(N)',
      space: 'O(N)',
      explanation: 'We iterate through the string of length N once. Each push/pop from the stack takes O(1) time. The stack requires at most O(N) space when the string consists entirely of opening brackets.'
    },
    trapsAndPitfalls: [
      'Forgetting to check if stack is empty when a closing bracket arrives (causes runtime error or undefined comparison).',
      'Forgetting to check `stack.length === 0` at the end (e.g. input "(((" would wrongly return true if you only check for mismatch).',
      'Missing the quick parity check: an odd-length string can never be valid.'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Can the string be empty, and does it only contain bracket characters?',
        goodAnswer: 'The constraints say length >= 1 and only includes ()[]{}. If empty string were allowed, it is typically considered valid.',
        redFlag: 'Fails to consider strings with only opening brackets or only closing brackets.'
      },
      {
        phase: 'APPROACH',
        question: 'Why does a simple counter (e.g. count++ for open, count-- for close) fail for multiple bracket types?',
        goodAnswer: 'Counters do not preserve ordering or nesting hierarchy; for example, "[(])" would have matched counts but is invalid.',
        redFlag: 'Suggests using three separate counters instead of a stack.'
      },
      {
        phase: 'CODING',
        question: 'How do you represent your bracket pairs to avoid multiple nested if/else statements?',
        goodAnswer: 'Using a dictionary or object map matching closing brackets to opening brackets.',
        redFlag: 'Writing 6 deeply nested if-else statements with repetitive string checks.'
      },
      {
        phase: 'TESTING',
        question: 'What are the most important edge cases to test for this problem?',
        goodAnswer: 'Odd-length strings, string starting with closing bracket like "]", string with only opening brackets like "(((", and interleaving brackets like "[(])".',
        redFlag: 'Only tests "()" and "()[]{}" without negative test cases.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: ['()'],
        expected: true,
        description: 'Single pair of parentheses'
      },
      {
        id: 'tc-2',
        input: ['()[]{}'],
        expected: true,
        description: 'Consecutive valid pairs'
      },
      {
        id: 'tc-3',
        input: ['(]'],
        expected: false,
        description: 'Mismatched closing bracket'
      },
      {
        id: 'tc-4',
        input: ['([)]'],
        expected: false,
        description: 'Improperly nested brackets'
      },
      {
        id: 'tc-5',
        input: ['{[]}'],
        expected: true,
        description: 'Properly nested brackets'
      },
      {
        id: 'tc-6',
        input: [']'],
        expected: false,
        description: 'Single closing bracket with empty stack'
      },
      {
        id: 'tc-7',
        input: ['((('],
        expected: false,
        description: 'Unclosed opening brackets'
      }
    ],
    runFunctionName: 'isValid'
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Arrays & Dynamic Programming',
    patterns: ['Sliding Window', 'Greedy'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5. Note that buying on day 2 and selling on day 1 is not allowed.'
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'If you were to sell on day i, what day in the past would you have wanted to buy?'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'You want to buy at the lowest historical price seen so far before day i. Can you track that minimum in a single pass?'
      },
      {
        level: 3,
        label: 'State Tracking',
        text: 'Maintain two variables: `minPrice` initialized to infinity, and `maxProfit` initialized to 0. Update them as you scan.'
      },
      {
        level: 4,
        label: 'Sliding Window Analogy',
        text: 'Consider left pointer = buy day, right pointer = sell day. If prices[right] < prices[left], move left to right.'
      }
    ],
    starterCode: {
      javascript: `function maxProfit(prices) {
  // Write your solution here
  
}
`,
      python: `def max_profit(prices):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < minPrice) {
      minPrice = prices[i];
    } else {
      maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    }
  }
  return maxProfit;
}`,
      python: `def max_profit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        else:
            max_profit = max(max_profit, price - min_price)
    return max_profit`
    },
    optimalComplexity: {
      time: 'O(N)',
      space: 'O(1)',
      explanation: 'We iterate through prices once. We only maintain two scalar variables (`minPrice` and `maxProfit`), requiring strictly O(1) auxiliary space.'
    },
    trapsAndPitfalls: [
      'O(N^2) nested loops timing out on arrays with 100,000 elements.',
      'Selling before buying (e.g. calculating max(prices) - min(prices) without checking index order).',
      'Returning negative profit when prices strictly decrease instead of 0.'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Can we buy and sell on the same day, or make multiple transactions?',
        goodAnswer: 'The problem states we buy on a single day and sell on a distinct day in the future. Only one transaction is allowed. Same day profit would be 0 anyway.',
        redFlag: 'Confuses this problem with Best Time to Buy and Sell Stock II (multiple transactions).'
      },
      {
        phase: 'APPROACH',
        question: 'What is the time complexity of the brute force solution, and why can we reduce it to linear time?',
        goodAnswer: 'Brute force checks every (i, j) pair where j > i, which is O(N^2). We can do O(N) by realizing for any selling day j, the optimal buy day is simply the minimum price encountered from index 0 to j-1.',
        redFlag: 'Fails to recognize that tracking running minimum eliminates the inner loop.'
      },
      {
        phase: 'CODING',
        question: 'What initial values do you use for minPrice and maxProfit?',
        goodAnswer: 'minPrice is initialized to Infinity (or prices[0]), maxProfit to 0 so that strictly downward trends return 0.',
        redFlag: 'Initializes minPrice to 0, which prevents lower prices from being selected.'
      },
      {
        phase: 'TESTING',
        question: 'What happens with input [5, 4, 3, 2, 1] or [3]?',
        goodAnswer: 'For strictly decreasing, maxProfit stays 0. For a single day array [3], loop finishes and returns 0.',
        redFlag: 'Does not verify strictly decreasing input.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[7, 1, 5, 3, 6, 4]],
        expected: 5,
        description: 'Standard fluctuating price trend'
      },
      {
        id: 'tc-2',
        input: [[7, 6, 4, 3, 1]],
        expected: 0,
        description: 'Strictly decreasing prices (no profit possible)'
      },
      {
        id: 'tc-3',
        input: [[2, 4, 1]],
        expected: 2,
        description: 'Minimum occurs at end but cannot be sold in past'
      },
      {
        id: 'tc-4',
        input: [[1]],
        expected: 0,
        description: 'Single element array'
      },
      {
        id: 'tc-5',
        input: [[1, 2, 3, 4, 5]],
        expected: 4,
        description: 'Monotonically increasing prices'
      }
    ],
    runFunctionName: 'maxProfit'
  },
  {
    id: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Strings & Sliding Window',
    patterns: ['Sliding Window', 'Hash Map', 'Two Pointers'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that "pwke" is a subsequence and not a substring.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'A substring is contiguous. Can you expand a window [left, right] until you see a duplicate character?'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'When a duplicate character appears at index right, where should your left pointer move?'
      },
      {
        level: 3,
        label: 'Hash Map Index Jump',
        text: 'Instead of moving the left pointer step-by-step, store the last seen index of each character. You can directly jump left to `max(left, lastSeenIndex + 1)`.'
      },
      {
        level: 4,
        label: 'Critical Edge Check',
        text: 'Be careful! If a character was seen earlier than the current left pointer, its last seen index must not pull the left pointer backwards!'
      }
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  // Write your solution here
  
}
`,
      python: `def length_of_longest_substring(s):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let maxLen = 0;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (lastSeen.has(char)) {
      left = Math.max(left, lastSeen.get(char) + 1);
    }
    lastSeen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      python: `def length_of_longest_substring(s):
    last_seen = {}
    max_len = 0
    left = 0
    for right, char in enumerate(s):
        if char in last_seen:
            left = max(left, last_seen[char] + 1)
        last_seen[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`
    },
    optimalComplexity: {
      time: 'O(N)',
      space: 'O(min(N, M))',
      explanation: 'Time is O(N) since the right pointer scans the string once. Space is bounded by the size of the character set M (e.g. 128 for ASCII or 256 for extended ASCII) or string length N.'
    },
    trapsAndPitfalls: [
      'Moving the left pointer backwards when an old duplicate was seen before current left (e.g. "abba" fails if you do not use `max(left, lastSeen + 1)`).',
      'Confusing substring (contiguous) with subsequence (can skip characters).',
      'Failing on empty string `""` or string with spaces `" "`.',
      'Using an O(N^3) check checking all substrings with a set.'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'What character set are we dealing with? Can there be spaces or symbols?',
        goodAnswer: 'The constraints specify English letters, digits, symbols, and spaces. We must not assume only lowercase a-z.',
        redFlag: 'Assumes only lowercase a-z and uses fixed size array of 26.'
      },
      {
        phase: 'APPROACH',
        question: 'Why does jumping the left pointer directly using a hash map achieve O(N) rather than O(2N)?',
        goodAnswer: 'In a sliding window with a set, left might increment one step at a time, visiting each character twice. With index jumping, each character is inspected once by right.',
        redFlag: 'Cannot explain the difference between set-based shrinking and map-based index jumping.'
      },
      {
        phase: 'CODING',
        question: 'In `abba`, what happens when you process the second `a` at index 3?',
        goodAnswer: 'The first `a` was at index 0. However, left is already at index 2 (due to `b`). We must take `max(left, lastSeen + 1)` so left does not regress backwards from 2 to 1.',
        redFlag: 'Fails to wrap `lastSeen + 1` in `Math.max(left, ...)`.'
      },
      {
        phase: 'TESTING',
        question: 'What are the boundary inputs you would run?',
        goodAnswer: 'Empty string "", single character "a", string of identical characters "aaaa", string with space " ", and repeated pattern with non-monotonic jumps like "abba".',
        redFlag: 'Only tests "abcabcbb".'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: ['abcabcbb'],
        expected: 3,
        description: 'Standard repeated substring "abc"'
      },
      {
        id: 'tc-2',
        input: ['bbbbb'],
        expected: 1,
        description: 'All identical characters'
      },
      {
        id: 'tc-3',
        input: ['pwwkew'],
        expected: 3,
        description: 'Repeating character inside substring'
      },
      {
        id: 'tc-4',
        input: [''],
        expected: 0,
        description: 'Empty string'
      },
      {
        id: 'tc-5',
        input: [' '],
        expected: 1,
        description: 'Single whitespace character'
      },
      {
        id: 'tc-6',
        input: ['abba'],
        expected: 2,
        description: 'Crucial edge case: Left pointer must not move backwards'
      }
    ],
    runFunctionName: 'lengthOfLongestSubstring'
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'Intervals & Sorting',
    patterns: ['Sorting', 'Intervals'],
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    examples: [
      {
        input: 'intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]',
        output: '[[1, 6], [8, 10], [15, 18]]',
        explanation: 'Since intervals [1, 3] and [2, 6] overlap, merge them into [1, 6].'
      },
      {
        input: 'intervals = [[1, 4], [4, 5]]',
        output: '[[1, 5]]',
        explanation: 'Intervals [1, 4] and [4, 5] are considered overlapping because they touch at boundary 4.'
      }
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'If the intervals were sorted by their start times, how does that simplify determining whether two intervals overlap?'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'After sorting by start time, interval B overlaps with interval A if and only if B.start <= A.end.'
      },
      {
        level: 3,
        label: 'Merge Logic',
        text: 'If they overlap, what is the new end time? It is `max(A.end, B.end)`. If they do not overlap, append interval B as a new separate interval.'
      },
      {
        level: 4,
        label: 'In-Place vs New List',
        text: 'Building a new result list where you compare the current interval with the last interval in your result list makes the code clean and bug-free.'
      }
    ],
    starterCode: {
      javascript: `function merge(intervals) {
  // Write your solution here
  
}
`,
      python: `def merge(intervals):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}`,
      python: `def merge(intervals):
    if len(intervals) <= 1:
        return intervals
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for current in intervals[1:]:
        last = merged[-1]
        if current[0] <= last[1]:
            last[1] = max(last[1], current[1])
        else:
            merged.append(current)
    return merged`
    },
    optimalComplexity: {
      time: 'O(N log N)',
      space: 'O(N)',
      explanation: 'Sorting the N intervals by start time takes O(N log N). The single-pass merge takes O(N). Output space is O(N) in the worst case where no intervals overlap.'
    },
    trapsAndPitfalls: [
      'Assuming input intervals are already sorted.',
      'Forgetting that intervals touching at equal boundaries like [1,4] and [4,5] DO overlap.',
      'When merging, assigning `last.end = current.end` instead of `Math.max(last.end, current.end)` (fails when an interval is completely swallowed like [1, 10] and [2, 5]).'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Are the intervals guaranteed to be sorted initially? Can an interval have start == end?',
        goodAnswer: 'No, they are not guaranteed to be sorted. Yes, [start, start] like [2, 2] is valid under constraints.',
        redFlag: 'Assumes intervals are already sorted.'
      },
      {
        phase: 'APPROACH',
        question: 'Why sort by start time rather than end time?',
        goodAnswer: 'Sorting by start time ensures that once an interval starts after the current merged end, no subsequent interval can ever merge with the previous intervals.',
        redFlag: 'Suggests sorting by end time without handling overlapping starts.'
      },
      {
        phase: 'CODING',
        question: 'If current interval is completely inside previous interval like [1, 8] and [2, 4], what should the merged end be?',
        goodAnswer: 'It should remain 8! That is why we use `max(last.end, current.end)`.',
        redFlag: 'Directly assigns `last.end = current.end`, shrinking the interval to 4.'
      },
      {
        phase: 'TESTING',
        question: 'What test cases would catch common bugs?',
        goodAnswer: 'One interval completely enclosing another ([[1, 10], [2, 3]]), already merged disjoint intervals, intervals touching at a single point ([[1, 2], [2, 3]]), and unsorted input.',
        redFlag: 'Does not test nested intervals.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
        description: 'Standard multiple overlapping intervals'
      },
      {
        id: 'tc-2',
        input: [[[1, 4], [4, 5]]],
        expected: [[1, 5]],
        description: 'Touching boundaries [1,4] and [4,5]'
      },
      {
        id: 'tc-3',
        input: [[[1, 10], [2, 3], [4, 8]]],
        expected: [[1, 10]],
        description: 'One large interval containing smaller ones'
      },
      {
        id: 'tc-4',
        input: [[[2, 3], [1, 2]]],
        expected: [[1, 3]],
        description: 'Unsorted input array'
      },
      {
        id: 'tc-5',
        input: [[[1, 4]]],
        expected: [[1, 4]],
        description: 'Single interval'
      }
    ],
    runFunctionName: 'merge'
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    category: 'Graphs & BFS/DFS',
    patterns: ['BFS', 'DFS', 'Matrix Traversal', 'Connected Components'],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: '1'
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: '3'
      }
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] is \'0\' or \'1\'.'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'This is a connected components problem on an implicit graph. Each cell (r, c) with \'1\' is a node with edges to its 4 adjacent neighbors.'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'Iterate through each cell. When you find a \'1\', increment your island count, then launch a DFS or BFS to visit and mark all connected \'1\'s.'
      },
      {
        level: 3,
        label: 'Visited Marking',
        text: 'To avoid infinite loops, you can either use a visited set or mutate the grid in-place by flipping visited \'1\'s to \'0\'s or \'#\'s.'
      },
      {
        level: 4,
        label: 'Boundary Checking',
        text: 'Before recursing or enqueuing a neighbor, verify 0 <= r < m and 0 <= c < n and grid[r][c] === \'1\'.'
      }
    ],
    starterCode: {
      javascript: `function numIslands(grid) {
  // Write your solution here
  
}
`,
      python: `def num_islands(grid):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') {
      return;
    }
    grid[r][c] = '0'; // Sink island to mark as visited
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
      python: `def num_islands(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count`
    },
    optimalComplexity: {
      time: 'O(M * N)',
      space: 'O(M * N)',
      explanation: 'Every cell is visited a constant number of times. Worst-case space complexity is O(M * N) for the recursion call stack in DFS (or queue in BFS) if the grid is filled entirely with land.'
    },
    trapsAndPitfalls: [
      'Checking diagonal neighbors (problem specifies only horizontal and vertical connectivity).',
      'Forgetting to mark cells as visited before enqueuing in BFS (leads to duplicate queue entries and Memory Limit Exceeded).',
      'Exceeding maximum call stack size on large 300x300 grids if recursion depth is too high (good to mention BFS as an alternative to the interviewer).'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Are diagonal connections counted as part of the same island? Are we allowed to mutate the input grid?',
        goodAnswer: 'No, diagonals are not adjacent per prompt. Mutating in-place is O(1) extra space, but in production we should ask if the caller expects an immutable grid.',
        redFlag: 'Fails to ask if mutating input grid is permissible.'
      },
      {
        phase: 'APPROACH',
        question: 'Compare BFS vs DFS for this problem. Which would you choose and why?',
        goodAnswer: 'Both have O(M*N) time. DFS uses recursion stack up to O(M*N). BFS uses an explicit queue bounded by O(min(M, N)) if level-by-level, avoiding call stack overflow.',
        redFlag: 'Cannot explain the memory difference or trade-offs between BFS and DFS.'
      },
      {
        phase: 'CODING',
        question: 'In BFS, when should you mark a cell as visited: when you pop it or when you push it into the queue?',
        goodAnswer: 'When pushing it! If you mark it upon pop, neighboring cells might push the same cell multiple times, causing exponential memory explosion.',
        redFlag: 'Marks visited on pop and doesn\'t realize it causes redundant enqueuing.'
      },
      {
        phase: 'TESTING',
        question: 'What edge cases should you test?',
        goodAnswer: 'Grid with all 0s, grid with all 1s (single island), 1x1 grid, single row, single column, and snake-like patterns.',
        redFlag: 'Only tests the 2 given examples.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[
          ['1', '1', '1', '1', '0'],
          ['1', '1', '0', '1', '0'],
          ['1', '1', '0', '0', '0'],
          ['0', '0', '0', '0', '0']
        ]],
        expected: 1,
        description: 'Single large island'
      },
      {
        id: 'tc-2',
        input: [[
          ['1', '1', '0', '0', '0'],
          ['1', '1', '0', '0', '0'],
          ['0', '0', '1', '0', '0'],
          ['0', '0', '0', '1', '1']
        ]],
        expected: 3,
        description: 'Three distinct disconnected islands'
      },
      {
        id: 'tc-3',
        input: [[
          ['0', '0', '0'],
          ['0', '0', '0']
        ]],
        expected: 0,
        description: 'All water (0 islands)'
      },
      {
        id: 'tc-4',
        input: [[
          ['1']
        ]],
        expected: 1,
        description: '1x1 single land cell'
      }
    ],
    runFunctionName: 'numIslands'
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    patterns: ['Dynamic Programming', 'Unbounded Knapsack', 'BFS'],
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      {
        input: 'coins = [1, 2, 5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1',
        explanation: 'Cannot make 3 using only denomination 2.'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0',
        explanation: '0 coins needed to make amount 0.'
      }
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'Does a greedy approach (always picking the largest coin) work? Think of coins = [1, 3, 4] and amount = 6.'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'Greedy fails (it would pick 4 + 1 + 1 = 3 coins, whereas 3 + 3 = 2 coins is optimal). We must evaluate all subproblems via Dynamic Programming or BFS.'
      },
      {
        level: 3,
        label: 'DP Recurrence',
        text: 'Let `dp[i]` be minimum coins to make amount `i`. Base case: `dp[0] = 0`. For each coin `c`, if `i - c >= 0`, `dp[i] = min(dp[i], 1 + dp[i - c])`.'
      },
      {
        level: 4,
        label: 'Unreachable Sentinel Value',
        text: 'Initialize `dp` array with `amount + 1` (or Infinity). If `dp[amount]` is still `amount + 1` at the end, return -1.'
      }
    ],
    starterCode: {
      javascript: `function coinChange(coins, amount) {
  // Write your solution here
  
}
`,
      python: `def coin_change(coins, amount):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function coinChange(coins, amount) {
  if (amount === 0) return 0;
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], 1 + dp[i - coin]);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
      python: `def coin_change(coins, amount):
    if amount == 0:
        return 0
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], 1 + dp[i - coin])
    return -1 if dp[amount] > amount else dp[amount]`
    },
    optimalComplexity: {
      time: 'O(amount * len(coins))',
      space: 'O(amount)',
      explanation: 'We calculate `dp[i]` for each sub-amount from 1 to `amount`. For each sub-amount, we iterate through all `C` coin denominations. Space is O(amount) for the dp array.'
    },
    trapsAndPitfalls: [
      'Proposing a greedy algorithm without noticing that greedy fails for arbitrary coin systems (e.g. [1, 3, 4] for 6).',
      'Forgetting the base case `amount === 0` should return 0.',
      'Using a sentinel value like Infinity and getting integer overflow in languages with fixed integer sizes.'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Can coins be empty, or have negative values? What should we return if amount is 0?',
        goodAnswer: 'Constraints indicate 1 <= coins.length <= 12 and positive coin values. If amount is 0, answer is 0 coins.',
        redFlag: 'Fails to consider amount = 0.'
      },
      {
        phase: 'APPROACH',
        question: 'Why doesn\'t the greedy algorithm that works for US currency (quarters, dimes, nickels, pennies) work here?',
        goodAnswer: 'US currency is a canonical coin system where greedy is optimal. For arbitrary denominations like [1, 3, 4] with amount 6, greedy picks 4+1+1 (3 coins), but optimal is 3+3 (2 coins).',
        redFlag: 'Incurably clings to greedy sort-descending solution.'
      },
      {
        phase: 'CODING',
        question: 'Why do you initialize the DP table with `amount + 1` instead of `Infinity` or `0`?',
        goodAnswer: 'Because even with the smallest denomination 1, you can never need more than `amount` coins. Thus `amount + 1` is a safe upper bound and sentinel value.',
        redFlag: 'Initializes DP table with 0, meaning Math.min will always choose 0.'
      },
      {
        phase: 'TESTING',
        question: 'What are the essential test cases for Coin Change?',
        goodAnswer: 'amount = 0, impossible amount (coins = [2], amount = 3), single coin match (coins = [5], amount = 5), and counter-example to greedy (coins = [1, 3, 4], amount = 6).',
        redFlag: 'Does not test impossible amounts returning -1.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[1, 2, 5], 11],
        expected: 3,
        description: 'Standard example (5 + 5 + 1)'
      },
      {
        id: 'tc-2',
        input: [[2], 3],
        expected: -1,
        description: 'Impossible amount with even coin'
      },
      {
        id: 'tc-3',
        input: [[1], 0],
        expected: 0,
        description: 'Amount is 0'
      },
      {
        id: 'tc-4',
        input: [[1, 3, 4], 6],
        expected: 2,
        description: 'Greedy counter-example (3 + 3 = 2 coins)'
      },
      {
        id: 'tc-5',
        input: [[2, 5, 10, 1], 27],
        expected: 4,
        description: 'Mixed denominations (10 + 10 + 5 + 2 = 4 coins)'
      }
    ],
    runFunctionName: 'coinChange'
  },
  {
    id: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    patterns: ['Binary Search', 'Divide and Conquer'],
    description: `There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is **possibly rotated** at an unknown pivot index \`k\` (\`1 <= k < nums.length\`) such that the resulting array is \`[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]\` (**0-indexed**).

Given the array \`nums\` after the possible rotation and an integer \`target\`, return *the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`*.

You must write an algorithm with **\`O(log n)\`** runtime complexity.`,
    examples: [
      {
        input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0',
        output: '4'
      },
      {
        input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3',
        output: '-1'
      },
      {
        input: 'nums = [1], target = 0',
        output: '-1'
      }
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is an ascending array that is possibly rotated.',
      '-10^4 <= target <= 10^4'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'Even though the array is rotated, if you divide it in half, at least one of the two halves is guaranteed to be strictly sorted.'
      },
      {
        level: 2,
        label: 'Algorithmic Strategy',
        text: 'How can you check if the left half `nums[low..mid]` is sorted? By comparing `nums[low] <= nums[mid]`.'
      },
      {
        level: 3,
        label: 'Binary Search Branching',
        text: 'If the left half is sorted, check if target falls inside that range `nums[low] <= target < nums[mid]`. If so, search left; otherwise search right.'
      },
      {
        level: 4,
        label: 'Right Half Sorted',
        text: 'If left half is not sorted, then the right half MUST be sorted! Check if `nums[mid] < target <= nums[high]`.'
      }
    ],
    starterCode: {
      javascript: `function search(nums, target) {
  // Write your solution here
  
}
`,
      python: `def search(nums, target):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function search(nums, target) {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;

    // Check if left half is sorted
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else {
      // Right half is sorted
      if (nums[mid] < target && target <= nums[high]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }

  return -1;
}`,
      python: `def search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        
        # Left half is sorted
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            # Right half is sorted
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1`
    },
    optimalComplexity: {
      time: 'O(log N)',
      space: 'O(1)',
      explanation: 'Binary search halves the search space at each iteration. Time complexity is strictly O(log N). Only pointers are stored, so auxiliary space is O(1).'
    },
    trapsAndPitfalls: [
      'Using `<=` vs `<` incorrectly in boundary conditions (`nums[low] <= target && target < nums[mid]`).',
      'Forgetting that an unrotated array is a valid rotation with pivot = 0.',
      'Suggesting an O(N) linear search or two separate passes (find pivot then search) when a single binary search pass is cleaner.'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Can there be duplicate numbers in the array?',
        goodAnswer: 'The prompt specifies all values are distinct. (If duplicates were allowed, worst case would degrade to O(N)).',
        redFlag: 'Does not clarify if elements are distinct.'
      },
      {
        phase: 'APPROACH',
        question: 'Why does dividing the array at `mid` always leave at least one half cleanly sorted?',
        goodAnswer: 'Because a rotated sorted array only has one discontinuity (the drop point). That drop point can only exist in one of the two halves; the other half is strictly ascending.',
        redFlag: 'Cannot explain the invariant of the search.'
      },
      {
        phase: 'CODING',
        question: 'Why is `nums[low] <= nums[mid]` using `<=` rather than `<`?',
        goodAnswer: 'When low === mid (such as in a 2-element subarray), `nums[low] === nums[mid]`. Using `<=` ensures the 1-element slice is treated as sorted.',
        redFlag: 'Uses `<` which mishandles 2-element arrays.'
      },
      {
        phase: 'TESTING',
        question: 'What are the key test cases to check?',
        goodAnswer: 'Array not rotated at all [1, 2, 3], target at pivot, target at edges (index 0, index N-1), single element [1] target 0, and target missing.',
        redFlag: 'Only tests the first example.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[4, 5, 6, 7, 0, 1, 2], 0],
        expected: 4,
        description: 'Target exists in right rotated half'
      },
      {
        id: 'tc-2',
        input: [[4, 5, 6, 7, 0, 1, 2], 3],
        expected: -1,
        description: 'Target does not exist in array'
      },
      {
        id: 'tc-3',
        input: [[1], 0],
        expected: -1,
        description: 'Single element array target missing'
      },
      {
        id: 'tc-4',
        input: [[1], 1],
        expected: 0,
        description: 'Single element array target found'
      },
      {
        id: 'tc-5',
        input: [[3, 1], 1],
        expected: 1,
        description: 'Two elements rotated'
      },
      {
        id: 'tc-6',
        input: [[1, 2, 3, 4, 5], 4],
        expected: 3,
        description: 'Unrotated sorted array'
      }
    ],
    runFunctionName: 'search'
  },
  {
    id: 'kth-largest-element-in-an-array',
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    category: 'Heaps & Quickselect',
    patterns: ['Min-Heap', 'QuickSelect', 'Divide and Conquer'],
    description: `Given an integer array \`nums\` and an integer \`k\`, return *the \`k\`-th largest element in the array*.

Note that it is the \`k\`-th largest element in the sorted order, not the \`k\`-th distinct element.

Can you solve it without sorting the entire array in \`O(n log n)\`?`,
    examples: [
      {
        input: 'nums = [3, 2, 1, 5, 6, 4], k = 2',
        output: '5'
      },
      {
        input: 'nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4',
        output: '4'
      }
    ],
    constraints: [
      '1 <= k <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'Sorting takes O(N log N). Can we maintain only the top K largest elements seen so far?'
      },
      {
        level: 2,
        label: 'Min-Heap Strategy',
        text: 'A Min-Heap of size K holds the K largest elements. The root of the Min-Heap is always the smallest among the top K, which is precisely the K-th largest element!'
      },
      {
        level: 3,
        label: 'Quickselect Alternative',
        text: 'Hoare\'s Quickselect algorithm partitions like Quicksort but only recurses into one partition, achieving O(N) average time.'
      },
      {
        level: 4,
        label: 'Implementation Trade-off',
        text: 'In an interview, proposing both Min-Heap (O(N log K) guaranteed worst-case) and Quickselect (O(N) average) shows exceptional mastery of algorithmic trade-offs.'
      }
    ],
    starterCode: {
      javascript: `function findKthLargest(nums, k) {
  // Write your solution here
  
}
`,
      python: `def find_kth_largest(nums, k):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function findKthLargest(nums, k) {
  // Min-heap or Quickselect implementation
  const targetIndex = nums.length - k;

  function quickSelect(left, right) {
    const pivot = nums[right];
    let p = left;
    for (let i = left; i < right; i++) {
      if (nums[i] <= pivot) {
        [nums[i], nums[p]] = [nums[p], nums[i]];
        p++;
      }
    }
    [nums[p], nums[right]] = [nums[right], nums[p]];

    if (p === targetIndex) return nums[p];
    if (p < targetIndex) return quickSelect(p + 1, right);
    return quickSelect(left, p - 1);
  }

  return quickSelect(0, nums.length - 1);
}`,
      python: `import heapq

def find_kth_largest(nums, k):
    # Min-heap approach: O(N log K) time, O(K) space
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`
    },
    optimalComplexity: {
      time: 'O(N) average (Quickselect) or O(N log K) (Min-Heap)',
      space: 'O(1) extra space for in-place Quickselect, O(K) for Min-Heap',
      explanation: 'Quickselect shrinks expected remaining elements by half at each step (N + N/2 + N/4... = 2N). A Min-Heap maintains K items in O(N log K) worst case.'
    },
    trapsAndPitfalls: [
      'Removing duplicates (the problem specifies the K-th element in sorted order, NOT K-th unique element).',
      'Using a Max-Heap of size N, which takes O(N + K log N) space and time instead of Min-Heap of size K.',
      'Worst case O(N^2) in Quickselect if pivot selection is deterministic on adversarial sorted input without random pivoting.'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'Does "K-th largest" mean distinct values, or with duplicates allowed?',
        goodAnswer: 'It includes duplicates. For example, in [3, 3], the 2nd largest is 3, not undefined.',
        redFlag: 'Assumes deduplication with a Set.'
      },
      {
        phase: 'APPROACH',
        question: 'Why is a Min-Heap of size K preferable to a Max-Heap of size N for large streams of data?',
        goodAnswer: 'If N is 1 billion and K is 10, a Min-Heap uses 10 elements in memory (O(K)), whereas a Max-Heap requires storing all 1 billion elements (O(N)).',
        redFlag: 'Cannot explain why a Min-Heap is used to find the largest elements.'
      },
      {
        phase: 'CODING',
        question: 'How do you avoid the worst-case O(N^2) performance in Quickselect?',
        goodAnswer: 'By choosing a random pivot index (or median-of-three) and swapping it to the end before partitioning.',
        redFlag: 'Doesn\'t know Quickselect can degrade to O(N^2).'
      },
      {
        phase: 'TESTING',
        question: 'What are the boundary inputs for K?',
        goodAnswer: 'k = 1 (maximum element), k = nums.length (minimum element), array with all identical elements, and negative numbers.',
        redFlag: 'Only tests k = 2.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[3, 2, 1, 5, 6, 4], 2],
        expected: 5,
        description: 'Standard case: 2nd largest in array'
      },
      {
        id: 'tc-2',
        input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4],
        expected: 4,
        description: 'Array with duplicate elements'
      },
      {
        id: 'tc-3',
        input: [[1], 1],
        expected: 1,
        description: 'Single element array with k = 1'
      },
      {
        id: 'tc-4',
        input: [[7, 6, 5, 4, 3, 2, 1], 7],
        expected: 1,
        description: 'k equals array length (find minimum)'
      },
      {
        id: 'tc-5',
        input: [[-1, -2, 0, 5, 2], 3],
        expected: 0,
        description: 'Array with negative numbers and zero'
      }
    ],
    runFunctionName: 'findKthLargest'
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers & Monotonic Stack',
    patterns: ['Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        input: 'height = [4, 2, 0, 3, 2, 5]',
        output: '9'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    hints: [
      {
        level: 1,
        label: 'Conceptual Nudge',
        text: 'For any single bar at index i, how much water can sit directly on top of it?'
      },
      {
        level: 2,
        label: 'Mathematical Formulation',
        text: 'Water above bar i is `max(0, min(max_left, max_right) - height[i])`. You can precompute max_left and max_right using two arrays in O(N) time and O(N) space.'
      },
      {
        level: 3,
        label: 'Two Pointers Space Optimization',
        text: 'Can we do it in O(1) space? Use two pointers `left = 0` and `right = n - 1` with running `maxLeft` and `maxRight`.'
      },
      {
        level: 4,
        label: 'Invariant',
        text: 'If `height[left] < height[right]`, the bottleneck for bar `left` is guaranteed to be `maxLeft`, regardless of what lies in between!'
      }
    ],
    starterCode: {
      javascript: `function trap(height) {
  // Write your solution here
  
}
`,
      python: `def trap(height):
    # Write your solution here
    pass
`
    },
    solutionCode: {
      javascript: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let maxLeft = 0;
  let maxRight = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= maxLeft) {
        maxLeft = height[left];
      } else {
        totalWater += maxLeft - height[left];
      }
      left++;
    } else {
      if (height[right] >= maxRight) {
        maxRight = height[right];
      } else {
        totalWater += maxRight - height[right];
      }
      right--;
    }
  }

  return totalWater;
}`,
      python: `def trap(height):
    left, right = 0, len(height) - 1
    max_left = max_right = total_water = 0

    while left < right:
        if height[left] < height[right]:
            if height[left] >= max_left:
                max_left = height[left]
            else:
                total_water += max_left - height[left]
            left += 1
        else:
            if height[right] >= max_right:
                max_right = height[right]
            else:
                total_water += max_right - height[right]
            right -= 1

    return total_water`
    },
    optimalComplexity: {
      time: 'O(N)',
      space: 'O(1)',
      explanation: 'We scan the array of length N once with two converging pointers. Only four scalar variables are maintained, yielding O(1) extra space.'
    },
    trapsAndPitfalls: [
      'O(N^2) brute force scanning left and right for every single bar.',
      'Moving the wrong pointer when `height[left] == height[right]`.',
      'Forgetting that water cannot be trapped on the outermost boundary bars.'
    ],
    probingQuestions: [
      {
        phase: 'CLARIFY',
        question: 'What is the minimum number of bars required to trap any water?',
        goodAnswer: 'At least 3 bars are required, since we need a left wall, a basin, and a right wall.',
        redFlag: 'Thinks 2 bars can trap water.'
      },
      {
        phase: 'APPROACH',
        question: 'Why is `height[left] < height[right]` sufficient to decide which pointer to advance without knowing intermediate bar heights?',
        goodAnswer: 'Because if height[left] < height[right], we know there exists some bar on the right at least as tall as height[left]. Therefore, the right boundary is NOT the limiting factor for left — only maxLeft limits left.',
        redFlag: 'Cannot explain the mathematical invariant behind the two-pointer approach.'
      },
      {
        phase: 'CODING',
        question: 'What happens when `height[left] == height[right]`?',
        goodAnswer: 'You can advance either pointer (or both). Both sides have a wall capable of bounding the other.',
        redFlag: 'Believes equal heights cause an infinite loop.'
      },
      {
        phase: 'TESTING',
        question: 'What edge cases should we verify?',
        goodAnswer: 'Empty array, strictly increasing heights (staircase up), strictly decreasing heights (staircase down), flat terrain [2, 2, 2], and bowl shape [3, 0, 3].',
        redFlag: 'Fails to consider monotonic slopes.'
      }
    ],
    testCases: [
      {
        id: 'tc-1',
        input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
        expected: 6,
        description: 'Standard multi-basin terrain'
      },
      {
        id: 'tc-2',
        input: [[4, 2, 0, 3, 2, 5]],
        expected: 9,
        description: 'Deep canyon'
      },
      {
        id: 'tc-3',
        input: [[1, 2, 3, 4, 5]],
        expected: 0,
        description: 'Monotonically increasing (no water trapped)'
      },
      {
        id: 'tc-4',
        input: [[3, 0, 3]],
        expected: 3,
        description: 'Simple bowl of width 1 and depth 3'
      },
      {
        id: 'tc-5',
        input: [[2, 0]],
        expected: 0,
        description: 'Only 2 bars (cannot trap water)'
      }
    ],
    runFunctionName: 'trap'
  }
];
