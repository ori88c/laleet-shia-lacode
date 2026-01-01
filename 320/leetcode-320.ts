/**
 * Copyright (c) 2026 https://github.com/ori88c/
 * All rights reserved.
 * 
 * This code may NOT be copied, modified, or translated to other languages.
 * For self-study purposes only.
 * 
 * See LICENSE file or visit https://github.com/ori88c/ for full terms.
 */

/**
 * LeetCode 320: Generalized Abbreviation
 *
 * ### Key Optimization
 * Typical implementations create new intermediate strings at each recursive step, incurring
 * O(n) string concatenation overhead **per call**. This implementation avoids that by maintaining
 * an array of **path blocks** that can be expanded/truncated in O(1) during backtracking.
 * Strings are only materialized **once** per valid abbreviation (at leaf nodes), eliminating
 * redundant O(n) operations during recursive exploration.
 *
 * ### Recursive Structure Design
 * A typical approach combines two steps in one call: after abbreviating, immediately keep
 * the next character (to prevent adjacent numbers). This solution achieves a cleaner, more
 * compact recursive body by using the `mustKeepCurrentChar` flag to **defer** this constraint
 * to the next recursive call.
 *
 * ### Complexity Analysis
 * - Time Complexity: O(n * n^n)
 * - Space Complexity: O(n * n^n)
 *
 * The complexity is often misanalyzed as O(2^n) by treating this as a binary choice problem
 * (abbreviate or not). However, at each position i with k characters remaining, we have
 * O(k) = O(n) branching choices: keep the character as-is, OR abbreviate the next 1, 2,
 * ..., k characters. This O(n) branching factor at each recursive level yields O(n^n)
 * total recursive calls. The additional n factor accounts for joining the result strings
 * at leaf nodes.
 */
export function generateAbbreviations(word: string): string[] {
  const results: string[] = []; // O(n^n)
  const intermediateBlocks: string[] = [];

	// Recursively explores all abbreviation combinations for the substring
	// starting at suffixStart, building results via in-place array modifications.
  const recursiveExpandFrom = (
    suffixStart: number,
    mustKeepCurrentChar: boolean  // true after abbreviation, enforces no adjacent numbers
  ): void => {
    if (suffixStart >= word.length) {
      results.push(intermediateBlocks.join(''));
      return;
    }

    // Option I: Keep current char.
    intermediateBlocks.push(word[suffixStart]);
    recursiveExpandFrom(suffixStart + 1, false);
    intermediateBlocks.pop(); // Backtrack.

    if (mustKeepCurrentChar) {
      return;
    }
    
    // Option II: Replace [suffixStart, replacementEndExclusive) with a number.
    for (
      let replacementEndExclusive = suffixStart + 1;
      replacementEndExclusive <= word.length;
      ++replacementEndExclusive
    ) {
      const strReplacementLength = `${replacementEndExclusive - suffixStart}`;
      // Spread string into individual characters for O(1) backtracking.
      intermediateBlocks.push(...strReplacementLength);
      recursiveExpandFrom(replacementEndExclusive, true);

      // Backtrack.
      popMultiple(intermediateBlocks, strReplacementLength.length);
    }
  };
  
  recursiveExpandFrom(0, false);
  return results;
}

function popMultiple<T>(arr: T[], popCount: number): void {
  for (let i = 0; i < popCount; ++i) arr.pop();
}