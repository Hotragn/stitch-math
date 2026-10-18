# Week 2 field scan (Side Hustle)

Snapshot: Oct 18, 03:10 UTC, about 28 hours before the deadline.
Source: the public DEV API, `GET /api/articles/latest?tag=hf26challenge`, every page, deduplicated by id, filtered to `published_at >= 2026-10-12T19:00Z` (when Week 2 opened).

- 981 posts tagged `hf26challenge` in the window.
- 25 of them say Week 1 or the Weekend challenge in their description, so they're excluded.
- That leaves 956 Week 2 entries. About 60 of those are placeholders ("hi", "test", "week2"), so roughly 900 are real entries.

Each entry got one primary cluster from a keyword pass over its title and description. I then read all 956 titles to fix up the clusters, so the counts are approximate (±10%).

| Cluster | Count | Status |
| --- | --- | --- |
| Receipts, invoices, expenses, bookkeeping, GST bills, bank statements | ~190 | **Saturated.** Copies of the page's first example ("invoice and receipt sorter for freelancers") alone are 100+. At least 8 entries are called "Shoebox", "LedgerLens" or "LocalLedger". |
| Product listings, e-commerce copy, resale pricing | ~115 | **Saturated.** Copies of the page's second example (Etsy/eBay listing writer) are 80+. |
| Freelancer scope creep, briefs to proposals, bids | ~90 | **Saturated.** 15+ are named ScopeShield, ScopeGuard or ScopeSentry. |
| Other one-offs | ~120 | Mixed; scanned by hand for gaps below |
| Dev tools, logs, release notes, code agents | ~55 | Crowded, and a weak fit for "someone would pay" |
| Placeholders, not real entries | ~60 | n/a |
| Marketing copilots ("LocalBiz AI", "HustleMate AI") | ~40 | **Saturated** and generic |
| Restaurant, menu, cafe, food ops | ~35 | **Saturated** for menu translation (page example 3, ~20 copies) |
| Shop credit books (kirana, khata, udhaar, stalls) | ~35 | **Saturated**, almost all South Asia |
| Study, tutoring, exams | ~26 | Crowded |
| Security, scams, phishing, PII | ~25 | Crowded |
| WhatsApp/chat orders to a sheet (bakers, tiffin, tailors) | ~23 | Crowded |
| Review replies, follow-ups, inbox | ~23 | Crowded (ReplyDesk / Reply Desk x4) |
| Trades: quotes, front desk, tenders | ~21 | Some (Sawhorse, QuoteDrop, Quote Desk, Second Ring, Tender Radar, mechanic quotes) |
| Contracts, leases, insurance fine print | ~21 | Some (NDA scanners x4, Lease Lens, insurance fine print, ClawbackMD, RateCon Radar) |
| Health, pharmacy, food safety | ~15 | Thin |
| Retail stock, sales analytics | ~15 | Thin |
| Document Q&A on PDFs | ~14 | Crowded for its size, generic |
| Photography, images | ~14 | Thin: FirstPass (wedding culling), MomentSort, Walkthrough (real-estate shoot order), altcheck |
| Career, resumes | ~13 | Generic |
| TabPFN forecasts (late invoices, no-shows, demand) | ~6 standalone, ~20 overall | Late-invoice predictors x4 |
| Video, podcast, audio, creators | ~10 overall | Thin: Klipkit (clips), chaptermill (show notes), YouTube chapters, Zubaan (dubbing), Kokoro audiobook proofreader |
| Translation, localization | ~10 overall | Thin besides menus: MT risk checker for translators (IRS Spanish), CRA/ARC French LoRA, game-script localization |
| Travel | ~5 | Generic |

## What the strongest Week 2 posts look like so far (by reactions)

Reactions are partly social, but they show what's landing:

- [What if the scoreboard had no delay?](https://dev.to/satviksingh192/what-if-the-scoreboard-had-no-delay-3gi2) (59 reactions)
- [LedgerShield](https://dev.to/shreyansh_agrahari_2009db/ledgershield-reconcile-confidently-keep-financial-data-local-57kd) (32): a reconciliation tool, in the saturated cluster
- [Scope-Creep Guard](https://dev.to/vidisha_gupta_/scope-creep-guard-a-local-gemma-ai-that-tells-clients-thats-out-of-scope-so-you-dont-have-18n2) (27)
- [ShelfMitra](https://dev.to/apples_one_cd174284bffb/the-90-day-window-every-medical-shop-misses-i-built-shelfmitra-to-catch-it-in-tamil-hindi-and-26dd) (25): pharmacy expiry returns window, multilingual. A specific money pain.
- [We Searched eBay for 237 Recalled Products](https://dev.to/dronzer2code/we-searched-ebay-for-237-recalled-products-only-45-of-12562-listings-named-the-model-2efi) (23): leads with a measured finding about the world
- [AudioBite.tech: From $0 to My First $10](https://dev.to/kakeroth/from-0-to-my-first-10-how-i-built-audiobite-with-tabpfn-and-gemma-4-to-end-the-voice-note-chaos-27f7) (22): **claims a real paying user**. The bar for "first user" is set.
- [I Built an Open-Weight AI That Prices Etsy Shops](https://dev.to/sarvar_04/i-built-an-open-weight-ai-that-prices-etsy-shops-on-your-laptop-24dk) (20)
- [It caught "partner" "pareja" in an IRS rule](https://dev.to/p0rt/it-caught-partner-pareja-in-an-irs-rule-and-missed-return-devolucion-an-offline-mt-7ge) (13): an MT risk checker for translators, with a Tinker LoRA
- [RevCheck](https://dev.to/alexgeorgiev17/revcheck-paste-two-used-car-listings-get-a-second-opinion-before-you-drive-across-town-1e7e) (14), by a past Weekend DigitalOcean winner

Pattern in the better titles: a specific buyer, a number or a concrete moment, and "the model can't invent X" (Sawhorse: "a quoting desk that isn't allowed to invent a price"; StallSheet; CloseTab). That "model picks words, code owns facts" framing is now common, so it's no longer a differentiator on its own.

## Banned for us (saturated or a copy of the page's examples)

Receipt/invoice/expense sorting and bookkeeping; bank statements to spreadsheets; listing writers of any kind (Etsy, eBay, Shopify, WhatsApp catalogs, real-estate listings); menu translation; freelancer scope creep and proposal writers; kirana/khata credit books; WhatsApp orders to a sheet; generic small-business marketing copilots; review-reply desks; NDA/contract red-flag scanners; late-invoice predictors; generic document Q&A; resume tailoring; log analyzers; phishing checkers.

## Open gaps (few or no entries)

Found by hand in the 956 titles. Each has at most 1 or 2 entries, and none of these is a page example:

1. **Property managers and small landlords**: move-in/move-out condition reports, deposit deduction letters, maintenance request triage. 0 entries. (Lease Lens is for tenants.)
2. **Captions and subtitles for creators** (SRT timing, burned-in captions, non-English): 0 direct, apart from a Hinglish dubbing entry.
3. **Old handwriting and genealogy transcription** (census records, letters, deeds): 0. (Recipe Roots is close, but it's a family recipe-card cookbook.)
4. **Court and legal interpreting, certified-translation prep**: 1 adjacent (an MT checker for an IRS Spanish rule).
5. **Insurance claims and appeals** for patients or small clinics: 2 (insurance fine print, ClawbackMD denials).
6. **Grant reports for nonprofits** (not grant finding): 1 adjacent (FundPilot reads grant requirements).
7. **HOA, club and church meeting minutes** from recordings: 0.
8. **Accessibility for small sites** (alt text, PDF tagging): 2 (altcheck, AccessSprint).
9. **Photographers' client deliverables** (culling, gallery captions, model releases): 2 (FirstPass, MomentSort).
10. **Notaries and loan signing agents**: 0.
11. **Music teachers and studios** (lesson notes, practice plans): 1 adjacent (Rivo, a fee manager).
12. **Auto repair shops** (repair orders explained to customers): 1 opposite (a quote lie detector for customers).
13. **Translators' QA** (terminology consistency, glossary checks): 1 to 2.
14. **Transcriptionists, court reporters, academic transcription**: 0 direct.
15. **Tabletop game masters, hobby communities** (session recaps from recordings): 0.
