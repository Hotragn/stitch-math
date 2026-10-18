# Ideas: 28 candidates, scored

Every candidate comes from a paid-demand signal in [pain-signals.md](pain-signals.md) (rows #) or from my own targeted searches (links inline). I ran novelty checks against the 956 Week 2 entries ([field-week2.md](field-week2.md)) and with `search_dev_to_semantic`. None is on the banned list ([banned-ideas.md](banned-ideas.md)).

Scores are 1 to 5:
- **W**: writing and story potential
- **R**: relevance; open AI essential, and strong evidence someone pays
- **C**: creativity and novelty against the field and the market
- **E**: can be built and tested on real public samples in the ~22 hours left
- **P**: partner fit
- **U**: a first user is plausible

Total = 2W + 2R + 2C + 2E + P + U (max 50).

| # | Idea | Buyer | What they pay today | Why an open model | Our price | W | R | C | E | P | U | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Stitch-math checker**: Gemma reads each row of a written knit/crochet pattern into stitches; code counts every size | Indie pattern designers (Ravelry, Etsy, LoveCrafts) | Tech editor £30/h, 0.5 to 7 h a pattern ([Sam Loves Yarn](https://www.samlovesyarn.co.uk/services-7)); about £50 a pattern against a £3.75 sale price ([Woolly Wormhead](https://woollywormhead.com/blog/2018/5/10/the-true-cost-of-a-pattern-revisited)) | Per-check cost must be ~$0; an unreleased pattern is the product (local Ollama); chat models fail stitch math (our spike) | $5 per pattern, or $12/mo | 5 | 5 | 5 | 4 | 3 | 3 | **45** |
| 2 | **Deposition page:line summaries where code checks every cite** | Solo litigators, freelance paralegals | SmartDepo $1/page or $25 to $85 a summary ([pricing](https://www.smartdepo.law/pricing-old)); Upwork ~$55/h; 20 to 25 pages/h by hand ([Opus 2](https://opus2.com/deposition-summary-guide)) | Client confidentiality (ABA Formal Op. 512); runs locally | $0.50/page | 3 | 4 | 3 | 3 | 2 | 2 | **32** |
| 3 | **UK check-out report drafts**: compare check-in inventory items with today's photos | Self-managing landlords, letting agents, inventory clerks | £126 to £216 a report (row 16); clerks £70 to £150, software £5 to £15 per property a month (row 17) | Photos of a tenant's home are personal data; per-report cost | £9 a report | 4 | 5 | 3 | 2 | 2 | 1 | **33** |
| 4 | Certified-translation drafts for translators (foreign birth certificates kept in layout; code checks every number and date survives) | Freelance certified translators | $24.95 to $31.75 a page; freelancers $50 to $150 a document (row 59) | Government ID documents are highly sensitive | $3 a page | 3 | 4 | 4 | 3 | 2 | 1 | 31 |
| 5 | Audiobook proof-listening: narration vs manuscript, word-level diff | Indie narrators and producers (ACX) | $30 to $75 per finished hour (row 54) | Whisper makes per-hour cost ~$0; unreleased manuscript | $5 per finished hour | 4 | 4 | 2 | 2 | 2 | 1 | 27 |
| 6 | Medical chronology for personal-injury firms (every visit with a page cite) | PI paralegals | $50 to $1,500 a file (rows 5 to 6) | PHI and HIPAA | $25 a file | 3 | 5 | 2 | 2 | 2 | 1 | 27 |
| 7 | SSDI record summaries | Claimants, advocates | $5 to $75 (row 7) | PHI | $5 | 2 | 3 | 2 | 2 | 2 | 1 | 19 |
| 8 | Scopist pre-pass on rough steno transcripts | Court reporters | $1 to $1.50/page (row 9) | Confidential testimony | $0.25/page | 2 | 3 | 4 | 1 | 1 | 1 | 21 |
| 9 | Roof-supplement finder (missed items on the adjuster's Xactimate estimate) | Roofing contractors | $199 an estimate gig; $100 an estimate job post (rows 10 to 12) | Claim data; cost | $29 an estimate | 3 | 4 | 4 | 1 | 2 | 1 | 27 |
| 10 | Manual J load-calc report prep from a floor plan | HVAC contractors | $65 to $800 (row 13) | Cost | $15 | 2 | 3 | 3 | 1 | 1 | 1 | 19 |
| 11 | Home-inspection narratives from a note and a photo | Home inspectors | Spectora $109.99/mo; ReportHost ~$6 a report (rows 14 to 15) | Offline in basements | $3 a report | 3 | 3 | 1 | 3 | 2 | 1 | 23 |
| 12 | Old church-record transcription and translation (Latin/Italian) | Genealogists | $20 per 50 words (row 18); Transkribus €99/yr (row 20) | Per-page cost; niche scripts | $1 a page | 4 | 3 | 4 | 2 | 2 | 1 | 29 |
| 13 | Family-tree data entry from handwritten records | Family historians | $250 to $750 a job (row 19) | Cost | $9 a batch | 3 | 3 | 3 | 2 | 2 | 1 | 25 |
| 14 | Podcast show notes and chapters | Podcasters | Up to $50 to $200 an episode (rows 21 to 22) | Cost | $9/mo | 2 | 3 | 1 | 3 | 2 | 2 | 21 |
| 15 | YouTube chapters | YouTubers | $3 to $6 a video (row 24) | Cost | Free tier | 2 | 2 | 1 | 3 | 1 | 2 | 18 |
| 16 | Sermon to short clips | Church media volunteers | $19 to $39/mo; agencies $497 to $997/mo (rows 52 to 53) | Cost | $9/mo | 3 | 3 | 2 | 2 | 2 | 2 | 23 |
| 17 | Obituary drafts for funeral homes | Funeral homes | $50 to $100 an obituary (row 25) | Sensitive family details | $10 | 3 | 3 | 1 | 4 | 1 | 1 | 23 |
| 18 | Wedding-day timeline builder | Photographers, planners | $79.95 tool (row 29) | Weak | $5 | 2 | 2 | 2 | 4 | 1 | 1 | 21 |
| 19 | Ceremony scripts | Officiants | $100 to $200 (row 30) | Weak | $9 | 2 | 2 | 1 | 4 | 1 | 1 | 19 |
| 20 | Audio to sheet music (Basic Pitch, open-source) | Music teachers | $50 to $100 a piece (row 34) | Cost | $3 a piece | 3 | 3 | 3 | 1 | 1 | 2 | 23 |
| 21 | Choir learning tracks per voice part from MusicXML | Choirs, barbershop quartets | From $250 a song (row 35) | AI barely needed | $5 a song | 3 | 3 | 4 | 2 | 2 | 1 | 27 |
| 22 | Cottage-food label checks | Farmers-market bakers | $9 a panel; $50 to $200 Fiverr (rows 38 to 39) | Mostly deterministic | $3 | 2 | 2 | 2 | 3 | 1 | 1 | 19 |
| 23 | HOA minutes in Robert's Rules form, from a Zoom transcript | Volunteer board secretaries | Gigs from $20 to $50 (row 40) | Board matters are confidential | $5 a meeting | 2 | 3 | 2 | 3 | 1 | 1 | 21 |
| 24 | Subtitle condensing to reading-speed limits | Freelance subtitlers | $3 per program minute (row 43); Rev $6.49 to $15.99/min (row 42) | Cost | $0.20/min | 2 | 3 | 3 | 3 | 1 | 1 | 23 |
| 25 | Research-interview transcripts, de-identified locally | Qualitative researchers | ~$1.67/min (row 44); IRBs restrict cloud tools | IRB data rules | $0.10/min | 3 | 4 | 3 | 2 | 2 | 3 | 30 |
| 26 | Fire-claim contents inventory from home photos | Total-loss claimants, public adjusters | $75 starter (row 56); the insurer's 2 to 3 h interview isn't enough (row 57) | Home photos are private | $29 an inventory | 5 | 3 | 4 | 2 | 3 | 1 | 32 |
| 27 | Warranty repair stories (concern, cause, correction) | Dealer technicians | Unpaid flat-rate time (row 58) | Cost | $49/mo per shop | 2 | 2 | 3 | 3 | 1 | 1 | 21 |
| 28 | Back-of-book index drafts | Self-published authors | $3.50 to $5.50 a page ([SelfPublishingAdvice](https://selfpublishingadvice.org/how-to-create-a-book-index/)) | Cost | $99 a book | 3 | 3 | 1 | 3 | 1 | 1 | 23 |

Checked and dropped for a crowded market (see [banned-ideas.md](banned-ideas.md)):
- Home-inspection narratives (Spectora AI Report Assist, Binsr)
- Pet vaccine-record checks
- Fair-housing listing checks
- Book indexing (IndexAI and IndexerLabs at $99; the [ASI](https://asindexing.org/ai-and-book-indexing/) is critical of AI indexes)

## Top 3
1. **Stitch-math checker: 45.** Recommended.
2. **Deposition summaries with checked cites: 32.** Ranked above #3 because it's easier to build and can be tested on public-domain transcripts.
3. **UK check-out report drafts: 33.** The strongest per-report price, but the market is filling: The Property AI already flags damage ([G2](https://www.g2.com/products/the-property-ai/reviews)), and InventoryBase has BaseAI ([site](https://inventorybase.co.uk/)). Real test data, meaning paired check-in and check-out photos, is scarce.

Runner-up: the fire-claim contents inventory (32). It has a strong story, but prices would need a SerpApi key we don't have, and a first user is unlikely.
