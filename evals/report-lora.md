
## The checker with the Tinker-trained 4B reader (Qwen3.5-4B + LoRA)

Same 32 cases, same scoring. Craft and sizes come from plain code; every line is read by the 4B model alone.

| Reader | Errors caught (of 24) | False alarms on clean | False alarms on error versions | Rows checked (clean) |
| --- | --- | --- | --- | --- |
| Qwen3.5-4B + Tinker LoRA + code | 21 | 1 | 4 | 82/86 |

| Case | Flags |
| --- | --- |
| ball/clean | [] |
| bear-head/clean | [] |
| blanket/clean | [] |
| cowl/clean | [] |
| hat/clean | [] |
| mittens/clean | [4] |
| scarf/clean | [] |
| yoke/clean | [] |
| hat/m0 | [9] |
| hat/m1 | [13] |
| hat/m2 | [5] |
| ball/m3 | [5] |
| ball/m4 | [4] |
| ball/m5 | [11] |
| bear-head/m6 | [7] |
| bear-head/m7 | [12] |
| bear-head/m8 | [10] |
| mittens/m9 | [4,9] |
| mittens/m10 | [4] |
| mittens/m11 | [4,3] |
| cowl/m12 | [4,8] |
| cowl/m13 | [4] |
| cowl/m14 | [6,8] |
| yoke/m15 | [4] |
| yoke/m16 | [6] |
| yoke/m17 | [10] |
| blanket/m18 | [3] |
| blanket/m19 | [4] |
| blanket/m20 | [] |
| scarf/m21 | [4] |
| scarf/m22 | [] |
| scarf/m23 | [6,8] |
