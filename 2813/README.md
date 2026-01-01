## Proof for LeetCode 2813 (Maximum Elegance of a K-Length Subsequence)

**Copyright (c) 2026 https://github.com/ori88c/**

**All rights reserved.**

This proof may NOT be copied, modified, or translated to other languages. For self-study purposes only. See the repository `LICENSE` or visit https://github.com/ori88c/ for full terms.

### Problem (brief)
Given items with `profit` and `category`, select exactly `k` items to maximize  
`elegance = sum(profits) + (#distinctCategories)^2`.

### Notation
- `n` — number of items  
- Items are sorted by descending `profit` into an array `DESC_ITEMS_BY_PROFIT`.  
- `k` — required subsequence size  
- `ICS` — initial category set (a Set of unique categories) from the `[0, k)` prefix of `DESC_ITEMS_BY_PROFIT`

### Key Observations
#### Observation 1 — Only a new category can improve elegance
The first `k` items already maximize profit. Any suffix item can help only by
adding a *new* category; otherwise its lower profit cannot improve elegance.

#### Observation 2 — An initial category never fully leaves (ICS is preserved)
Assume **by contradiction** that all `R` items of some category `c ∈ ICS` are removed and replaced by a group `x1, x2, …, xR` (sorted descending, so `xR` is smallest). Because suffix profits are ≤ prefix profits, swapping the highest-profit item of category `c` for `xR` yields ≥ total profit and strictly increases (or preserves) the distinct-category count. This improves or preserves elegance, contradicting optimality of that replacement group. Therefore, every ICS category keeps at least one representative.

#### Observation 3 — Replacement policy (duplicates stack)
Since one item per ICS category stays, only duplicate items (second, third, … of
a category) are eligible for eviction. To minimize profit loss, evict the
smallest-profit duplicate. Sorting `DESC_ITEMS_BY_PROFIT` descending by profit lets us maintain a
**descending stack of duplicates**; its top is always the **best eviction candidate**.

#### Observation 4 — Early exits / pruning
The following pruning insights flow from the observations and are often overlooked:
- If a candidate’s category already exists → skip (no category gain, lower-or-equal profit).
- If `|distinct-categories| == k`, further items cannot increase distinct categories or total profit → stop.  
- If the category is new but the category-gain (increment to the `(#distinctCategories)^2` part) is **smaller than the profit-loss for the best eviction candidate**, then no later item (with even smaller profit) can help → break (profits are descending).

### Algorithm Outline
1. Sort items by descending profit.
2. Take the first `k` items as the initial set; track `currProfit` and `ICS`.  
   Push only duplicate-category items into a descending stack (smallest on top).  
3. Traverse the suffix `[k, n)`:
   - Skip if category already used.  
   - Otherwise evaluate replacing the current smallest-profit duplicate: if the category gain outweighs the profit loss, replace and update elegance; otherwise break (profits are descending).  
4. Track the maximum elegance seen.

### Correctness Sketch
- By Observation 1, only new categories can improve elegance once profit is
  maximized by the prefix.
 - Observation 2 guarantees each initial category **keeps a representative** (the highest-profit item for that category in the prefix), so only duplicates are replaceable.
- Observation 3 selects the optimal duplicate to evict (minimizes profit loss).
- Observation 4 justifies pruning: after failing the replacement test in descending
  order, later items cannot reverse the outcome.
Together these yield an optimal `k`-subsequence.

### Complexity
- Sorting: `O(n log n)`  
- Single pass with stack/set operations: `O(n)`  
- Space: `O(n)` for arrays/stack/set.

