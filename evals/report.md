# Eval: 8 clean patterns + 24 single-error versions

Run 2026-10-18T11:26:38.033Z. Patterns are in `evals/base/`, errors in `evals/mutants.json`. All written by the author; each error version changes exactly one thing.

A seeded error counts as caught if a flag lands on its line or up to 3 lines after it. Every other flag is a false alarm.

| System | Errors caught (of 24) | False alarms on the 8 clean patterns | False alarms on the 24 error versions | Rows checked (clean) | Median time |
| --- | --- | --- | --- | --- | --- |
| regex reader + code | 6 | 0 | 0 | 38/81 | 0.0 s |
| Gemma alone | 18 | 17 | 33 | n/a | 4.0 s |
| Gemma reader + code | 22 | 1 | 2 | 83/83 | 20.5 s |

## By error kind

| Kind | Count | regex reader + code | Gemma alone | Gemma reader + code |
| --- | --- | --- | --- | --- |
| stated count typo | 10 | 3 | 10 | 10 |
| wrong instruction | 9 | 3 | 6 | 7 |
| cast-on doesn't fit | 5 | 0 | 2 | 5 |

## Every case

| Case | Kind | Line | regex reader + code | Gemma alone | Gemma reader + code |
| --- | --- | --- | --- | --- | --- |
| ball/clean | clean | - | [] | [] | [] |
| bear-head/clean | clean | - | [] | [] | [10] |
| blanket/clean | clean | - | [] | [] | [] |
| cowl/clean | clean | - | [] | [4,6] | [] |
| hat/clean | clean | - | [] | [9,11,13,15,16,17,18] | [] |
| mittens/clean | clean | - | [] | [4,14] | [] |
| scarf/clean | clean | - | [] | [4,6] | [] |
| yoke/clean | clean | - | [] | [4,6,8,10] | [] |
| hat/m0 | stated count typo | 9 | [] | [9,11,13,15,16,17,18] | [9] |
| hat/m1 | wrong instruction | 13 | [] | [9,11,13,15,17,18] | [13] |
| hat/m2 | cast-on doesn't fit | 4 | [] | [9,11,13,15,16,17,18] | [5] |
| ball/m3 | stated count typo | 5 | [5] | [5] | [5] |
| ball/m4 | wrong instruction | 4 | [4] | [] | [4] |
| ball/m5 | wrong instruction | 11 | [11] | [11] | [] |
| bear-head/m6 | wrong instruction | 7 | [7] | [] | [7] |
| bear-head/m7 | stated count typo | 12 | [12] | [12] | [12] |
| bear-head/m8 | stated count typo | 10 | [10] | [10] | [10] |
| mittens/m9 | stated count typo | 9 | [] | [4,7,8,9,10,11,14,16] | [9] |
| mittens/m10 | wrong instruction | 11 | [] | [4,14] | [11] |
| mittens/m11 | cast-on doesn't fit | 2 | [] | [4,14] | [3] |
| cowl/m12 | wrong instruction | 4 | [] | [4,6] | [4,8] |
| cowl/m13 | cast-on doesn't fit | 2 | [] | [4,6] | [4] |
| cowl/m14 | stated count typo | 6 | [] | [4,6] | [6,8] |
| yoke/m15 | stated count typo | 4 | [] | [4,6,8,10] | [4] |
| yoke/m16 | wrong instruction | 6 | [] | [4,6,8,10] | [6] |
| yoke/m17 | stated count typo | 10 | [] | [4,6,8,10] | [10] |
| blanket/m18 | cast-on doesn't fit | 2 | [] | [] | [3] |
| blanket/m19 | stated count typo | 4 | [] | [4] | [4] |
| blanket/m20 | wrong instruction | 3 | [] | [] | [] |
| scarf/m21 | cast-on doesn't fit | 2 | [] | [6] | [4] |
| scarf/m22 | stated count typo | 6 | [] | [6] | [6] |
| scarf/m23 | wrong instruction | 4 | [] | [4,6] | [6,8] |
