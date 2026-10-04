import type { Problem, TestCase, TestExecutionResult } from '../types/interview';

declare global {
  interface Window {
    Sk?: any;
  }
}

/**
 * Safely converts any JavaScript value into a legible string for test results.
 * Handles undefined, null, NaN, Infinity, BigInt, and circular references cleanly.
 */
function safeStringify(val: any): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'bigint') return `${val}n`;
  if (typeof val === 'number') {
    if (Number.isNaN(val)) return 'NaN';
    if (!Number.isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';
  }
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Robust structural equality check for unit test outputs.
 * Accounts for NaN, arrays, objects, and order-flexible problems like Two Sum.
 */
function deepEqual(a: any, b: any, problemId?: string): boolean {
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    // For Two Sum, indices can be returned in any order per problem specification
    if (problemId === 'two-sum' && a.length === 2 && b.length === 2) {
      const sortedA = [...a].sort((x, y) => x - y);
      const sortedB = [...b].sort((x, y) => x - y);
      return sortedA[0] === sortedB[0] && sortedA[1] === sortedB[1];
    }

    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], problemId)) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key], problemId)) return false;
    }
    return true;
  }

  return false;
}

let skulptLoadPromise: Promise<any> | null = null;

/**
 * Ensures the Skulpt Python runtime is ready on window.Sk.
 * Attempts local /vendor/ files first (offline), with fallback to CDN.
 */
async function ensureSkulpt(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if (window.Sk && window.Sk.builtinFiles) {
    return window.Sk;
  }
  if (skulptLoadPromise) return skulptLoadPromise;

  skulptLoadPromise = (async () => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          if (window.Sk && window.Sk.builtinFiles) return resolve();
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });
    };

    try {
      await loadScript('/vendor/skulpt.min.js');
      await loadScript('/vendor/skulpt-stdlib.js');
    } catch {
      // Fallback to jsdelivr CDN if local files are missing
      await loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js');
    }

    if (!window.Sk) {
      throw new Error('Skulpt Python engine could not be initialized.');
    }
    return window.Sk;
  })();

  return skulptLoadPromise;
}

export async function runTests(
  problem: Problem,
  code: string,
  language: 'javascript' | 'python',
  customTestCases?: TestCase[]
): Promise<TestExecutionResult[]> {
  const testsToRun = customTestCases && customTestCases.length > 0 ? customTestCases : problem.testCases;

  if (language === 'javascript') {
    return runJavaScriptTests(problem, code, testsToRun);
  } else {
    return runPythonTests(problem, code, testsToRun);
  }
}

function runJavaScriptTests(
  problem: Problem,
  code: string,
  testCases: TestCase[]
): TestExecutionResult[] {
  const funcNamePy = problem.runFunctionName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  const results: TestExecutionResult[] = [];

  for (const tc of testCases) {
    const logs: string[] = [];
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalConsoleInfo = console.info;

    // Sandbox capture console
    const customLog = (...args: any[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? safeStringify(a) : String(a))).join(' '));
    };

    const startTime = performance.now();
    try {
      console.log = customLog;
      console.warn = customLog;
      console.error = customLog;
      console.info = customLog;

      // Wrap user code and locate the entry function safely
      const wrappedCode = `
        ${code}

        let __fn = null;
        if (typeof ${problem.runFunctionName} === 'function') {
          __fn = ${problem.runFunctionName};
        } else if (typeof ${funcNamePy} === 'function') {
          __fn = ${funcNamePy};
        } else if (typeof solution === 'function') {
          __fn = solution;
        }

        if (!__fn) {
          throw new Error("Function '${problem.runFunctionName}' is not defined. Please implement it with 'function ${problem.runFunctionName}(...)'");
        }

        return __fn(...args);
      `;

      // Deep clone inputs to avoid tests mutating inputs for subsequent tests
      const clonedArgs = JSON.parse(JSON.stringify(tc.input));

      const runner = new Function('args', wrappedCode);
      const actual = runner(clonedArgs);

      const duration = performance.now() - startTime;
      const passed = deepEqual(actual, tc.expected, problem.id);

      results.push({
        testId: tc.id,
        description: tc.description,
        passed,
        input: safeStringify(tc.input),
        expected: safeStringify(tc.expected),
        actual: safeStringify(actual),
        executionTimeMs: Math.round(duration * 100) / 100,
        logs: logs.length > 0 ? logs : undefined
      });
    } catch (err: any) {
      const duration = performance.now() - startTime;
      results.push({
        testId: tc.id,
        description: tc.description,
        passed: false,
        input: safeStringify(tc.input),
        expected: safeStringify(tc.expected),
        actual: 'Runtime Error',
        executionTimeMs: Math.round(duration * 100) / 100,
        error: err.message || String(err),
        logs: logs.length > 0 ? logs : undefined
      });
    } finally {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      console.info = originalConsoleInfo;
    }
  }

  return results;
}

/**
 * Client-side execution for Python code in the browser using Skulpt Python 3 engine.
 * Full support for dicts, lists, recursion, enumerate, range, and algorithmic standard library.
 */
async function runPythonTests(
  problem: Problem,
  code: string,
  testCases: TestCase[]
): Promise<TestExecutionResult[]> {
  const funcNamePy = problem.runFunctionName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  const results: TestExecutionResult[] = [];

  let Sk: any;
  try {
    Sk = await ensureSkulpt();
  } catch (err: any) {
    return testCases.map(tc => ({
      testId: tc.id,
      description: tc.description,
      passed: false,
      input: safeStringify(tc.input),
      expected: safeStringify(tc.expected),
      actual: 'Engine Load Error',
      executionTimeMs: 0,
      error: `Python in-browser engine could not be initialized: ${err.message}. Switch to JavaScript for instant execution.`
    }));
  }

  // Helper to convert JS input arguments into Skulpt Python types
  const jsToSk = (val: any): any => {
    if (val === null || val === undefined) return Sk.builtin.none.none$;
    if (typeof val === 'boolean') return val ? Sk.builtin.bool.true$ : Sk.builtin.bool.false$;
    if (typeof val === 'number') {
      return Number.isInteger(val) ? new Sk.builtin.int_(val) : new Sk.builtin.float_(val);
    }
    if (typeof val === 'string') return new Sk.builtin.str(val);
    if (Array.isArray(val)) return new Sk.builtin.list(val.map(jsToSk));
    if (typeof val === 'object') {
      const dict = new Sk.builtin.dict([]);
      for (const [k, v] of Object.entries(val)) {
        dict.mp$ass_subscript(jsToSk(k), jsToSk(v));
      }
      return dict;
    }
    return Sk.builtin.none.none$;
  };

  for (const tc of testCases) {
    const logs: string[] = [];
    const startTime = performance.now();

    try {
      Sk.configure({
        output: (text: string) => {
          if (text && text.trim().length > 0) {
            logs.push(text.replace(/\n$/, ''));
          }
        },
        read: (x: string) => {
          if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) {
            throw new Error(`Python module not found: ${x}`);
          }
          return Sk.builtinFiles['files'][x];
        },
        python3: true
      });

      // 2500ms execution timeout to guard against infinite loops
      Sk.execLimit = 2500;

      // Compile and run module
      const modulePromise = Sk.misceval.asyncToPromise(() => {
        return Sk.importMainWithBody('<stdin>', false, code, true);
      });
      const module = await modulePromise;

      // Locate entry function
      let pyFunc = module.tp$getattr(new Sk.builtin.str(funcNamePy));
      if (!pyFunc) {
        pyFunc = module.tp$getattr(new Sk.builtin.str(problem.runFunctionName));
      }
      if (!pyFunc) {
        // Search module dictionary for any candidate function
        const dict = module.tp$getattr(new Sk.builtin.str('__dict__'));
        if (dict && dict.entries) {
          for (const key of Object.keys(dict.entries)) {
            if (!key.startsWith('_')) {
              const candidate = module.tp$getattr(new Sk.builtin.str(key));
              if (candidate && candidate.tp$call) {
                pyFunc = candidate;
                break;
              }
            }
          }
        }
      }

      if (!pyFunc) {
        throw new Error(
          `Function 'def ${funcNamePy}(...)' or 'def ${problem.runFunctionName}(...)' not found in your Python code.`
        );
      }

      // Convert cloned input arguments
      const clonedInput = JSON.parse(JSON.stringify(tc.input));
      const pyArgs = clonedInput.map(jsToSk);

      // Execute Python function
      const pyResult = Sk.misceval.callsimArray(pyFunc, pyArgs);
      const actual = Sk.ffi.remapToJs(pyResult);

      const duration = performance.now() - startTime;
      const passed = deepEqual(actual, tc.expected, problem.id);

      results.push({
        testId: tc.id,
        description: tc.description,
        passed,
        input: safeStringify(tc.input),
        expected: safeStringify(tc.expected),
        actual: safeStringify(actual),
        executionTimeMs: Math.round(duration * 100) / 100,
        logs: logs.length > 0 ? logs : undefined
      });
    } catch (err: any) {
      const duration = performance.now() - startTime;
      let errMsg = err.message || err.toString();
      if (err.tp$str) {
        errMsg = err.tp$str().v;
      }
      if (errMsg.includes('run time limit')) {
        errMsg = 'Time Limit Exceeded (2500ms): Potential infinite loop detected in Python code.';
      }

      results.push({
        testId: tc.id,
        description: tc.description,
        passed: false,
        input: safeStringify(tc.input),
        expected: safeStringify(tc.expected),
        actual: 'Runtime Error',
        executionTimeMs: Math.round(duration * 100) / 100,
        error: errMsg,
        logs: logs.length > 0 ? logs : undefined
      });
    }
  }

  return results;
}
