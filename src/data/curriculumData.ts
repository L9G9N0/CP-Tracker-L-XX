/**
 * Project L-X1 Curriculum Dataset
 *
 * This file is the single source of truth for all curriculum data.
 * To add new tiers, sub-categories, or problems, simply edit this file.
 * The app will automatically pick up changes on next load.
 *
 * Structure:
 *   Tier -> subCategories -> problems
 *   Each problem: { id, name, url }
 *
 * The `id` is the Codeforces problem ID (contestId + index, e.g. "2210B").
 * The `url` is the full Codeforces problem URL.
 */

import type { Tier } from '../types';

const curriculumData: Tier[] = [
  {
    tier: "Tier 1 (900)",
    subCategories: [
      {
        name: "Pure Greedy & Math",
        problems: [
          { id: "2210B", name: "Simply Sitting on Chairs", url: "https://codeforces.com/problemset/problem/2210/B" },
          { id: "2209B", name: "Array", url: "https://codeforces.com/problemset/problem/2209/B" },
          { id: "2200C", name: "Specialty String", url: "https://codeforces.com/problemset/problem/2200/C" },
          { id: "2169A", name: "Alice and Bob", url: "https://codeforces.com/problemset/problem/2169/A" },
          { id: "2149C", name: "MEX rose", url: "https://codeforces.com/problemset/problem/2149/C" },
          { id: "2148C", name: "Pacer", url: "https://codeforces.com/problemset/problem/2148/C" },
          { id: "2114B", name: "Not Quite a Palindromic String", url: "https://codeforces.com/problemset/problem/2114/B" },
        ],
      },
      {
        name: "Two Pointers Integration (900)",
        problems: [
          { id: "2136B", name: "Like the Bitset", url: "https://codeforces.com/problemset/problem/2136/B" },
          { id: "2060C", name: "Game of Mathletes", url: "https://codeforces.com/problemset/problem/2060/C" },
        ],
      },
    ],
  },
  {
    tier: "Tier 2 (1000)",
    subCategories: [
      {
        name: "Greedy, Math & Implementation",
        problems: [
          { id: "2217B", name: "Flip the Bit (Easy Version)", url: "https://codeforces.com/problemset/problem/2217/B" },
          { id: "2203B", name: "Beautiful Numbers", url: "https://codeforces.com/problemset/problem/2203/B" },
          { id: "2194B", name: "Offshores", url: "https://codeforces.com/problemset/problem/2194/B" },
          { id: "2193C", name: "Replace and Sum", url: "https://codeforces.com/problemset/problem/2193/C" },
        ],
      },
      {
        name: "Two Pointers Integration (1000)",
        problems: [
          { id: "2143B", name: "Discounts", url: "https://codeforces.com/problemset/problem/2143/B" },
          { id: "2034B", name: "Rakhsh's Revival", url: "https://codeforces.com/problemset/problem/2034/B" },
        ],
      },
    ],
  },
  {
    tier: "Tier 3 (1100)",
    subCategories: [
      {
        name: "Advanced Greedy, Prefix Logic",
        problems: [
          { id: "2218D", name: "The 67th OEIS Problem", url: "https://codeforces.com/problemset/problem/2218/D" },
          { id: "2211B", name: "Mickey Mouse Constructive", url: "https://codeforces.com/problemset/problem/2211/B" },
          { id: "2208B", name: "Cyclists", url: "https://codeforces.com/problemset/problem/2208/B" },
        ],
      },
      {
        name: "Two Pointers Masterclass (1100)",
        problems: [
          { id: "2128B", name: "Deque Process", url: "https://codeforces.com/problemset/problem/2128/B" },
          { id: "2111C", name: "Equal Values", url: "https://codeforces.com/problemset/problem/2111/C" },
        ],
      },
    ],
  },
];

export default curriculumData;
