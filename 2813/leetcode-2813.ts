/**
 * Copyright (c) 2026 https://github.com/ori88c/
 * All rights reserved.
 *
 * This code may NOT be copied, modified, or translated to other languages.
 * For self-study purposes only.
 *
 * See LICENSE file or visit https://github.com/ori88c/ for full terms.
 */

interface ItemMetadata {
  profit: number;
  category: number;
}

/**
 * Profit-descending comparer defined once (improves readability and avoids
 * recreating the comparer per call).
 */
const descByProfitComparer = (
  i1: Readonly<ItemMetadata>,
  i2: Readonly<ItemMetadata>
): number => (i2.profit - i1.profit);

/**
 * - Full proof and detailed reasoning: see 2813/README.md
 * - Proof outline (short):
 *   1) Sort items by descending profit; take the first k as the initial set.
 *   2) Only a new category can improve elegance (profit is already maximized by prefix).
 *   3) Initial categories never fully leave (keep one representative per initial category).
 *   4) Track duplicates (by category) in a descending stack; replace only the smallest-profit duplicate.
 *   5) Early exits: stop when k categories are reached or when further suffix items cannot improve.
 *
 * ### Comment philosophy
 * Comments are generally discouraged; the code should be self-explanatory.
 * Here they focus on reasoning/proof (the "why"), not restating the "what".
 *
 * @param items Items with profit/category metadata.
 * @param k     Required subsequence length.
 */
export function findMaxElegance(
  items: readonly Readonly<ItemMetadata>[],
  k: number
): number {
  if (items.length < k) {
    throw new Error(
      `Insufficient items: received ${items.length} items while the ` +
      `sub-sequence length should be exactly ${k}`
    );
  }

  const itemsDescByProfit = items.toSorted(descByProfitComparer);
  let currProfitsSum = 0;
  const usedCategories = new Set<number>();

  // Descending-profit stack of duplicate-category items (array simulates a stack).
  // Holds only items that are eligible for eviction by a better category.
  const duplicatesDescByProfit: number[] = [];

  const getCurrElegance = (): number =>
    (usedCategories.size * usedCategories.size) + currProfitsSum;

  // Populate the K-prefix initial set.
  for (let i = 0; i < k; ++i) {
    const { category, profit } = itemsDescByProfit[i];

    if (usedCategories.has(category)) {
      // If a category appears X times in the K-prefix, push the last X-1 items
      // (smallest profits); the largest representative cannot be replaced by
      // a more-optimal item.
      duplicatesDescByProfit.push(profit);
    } else {
      usedCategories.add(category);
    }

    currProfitsSum += profit;
  }

  // Now, consider potentially more-optimal replacement candidates from the [k,n)
  // suffix.
  let maxFoundElegance = getCurrElegance();
  for (let i = k; i < items.length; ++i) {
    if (usedCategories.size === k) break; // Cannot improve further.

    const { profit, category } = itemsDescByProfit[i];
    if (usedCategories.has(category)) {
      // Does not increase the c^2 factor, and has a lower profit than an
      // existing item. i.e., cannot be a useful replacement.
      continue;
    }

    // Reaching here means:
    // New category item. It can improve only if the c^2 gain beats the potential
    // total-profit decrement. The duplicate stack cannot be empty here because
    // usedCategories.size < k implies at least one category has multiple items.
    currProfitsSum -= duplicatesDescByProfit.pop()!;
    currProfitsSum += profit;
    usedCategories.add(category);
    
    const candidateElegance = getCurrElegance();
    if (candidateElegance <= maxFoundElegance) {
      // Further items are useless too, due to the Descending order profit-wise.
      break;
    }
    
    maxFoundElegance = candidateElegance;
  }
  
  return maxFoundElegance;
}
