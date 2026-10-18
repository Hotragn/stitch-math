# The notary loan-signing lane: field check and decision

## What I read (Oct 18, about 08:40 UTC)

- **The founder's file** `research/week2-entries.json` has 686 entries, but it ends at Oct 17 14:00 UTC (a cached API page).
- **My scan** has 956 entries, up to Oct 18 03:03 UTC.
- **The union is 1,042 entries.** I skimmed every title.
- **111 posts** matched documents, signatures, compliance, QC, notaries, real estate, legal or B2B checks in their title or description. I left 11 receipt/invoice-only posts to the title skim, since that cluster is already mapped.
- **96 of the 111 were read in full text:** a script pulled each body from the DEV API, and I read a digest of each ("What I Built", length, keyword hits). 15 return 404 (deleted).
- **Result:** 0 of the 96 bodies, and 0 of the 1,042 titles, mention notaries, loan signing, scanbacks, closing packages or signature checks. The keyword flags I first got were false hits ("design" contains "esign", and "initially" contains "initial").
- **The nearest entries:**
  - [CertProof](https://dev.to/aniket_dhingra_2706/certproof-2000-teams-signed-up-for-our-hackathon-nobody-wants-to-proofread-the-certificates-82l): it checks names on event certificates.
  - [Lease Lens](https://dev.to/onyxaholguincyber/lease-lens-a-local-gemma-4-reads-the-lease-plain-code-does-the-math-di5) and [ClauseCheck](https://dev.to/ayana_sarda/clausecheck-qa-for-tenants-2pmb)
  - Several contract red-flag scanners
  - [GearWitness](https://dev.to/abhiisalright/gearwitness-privacy-first-local-ai-return-inspection-for-equipment-rentals-12fj): rental return inspection
  - [Walkthrough](https://dev.to/prateekiiitg56/walkthrough-sorts-a-listing-shoot-into-a-house-tour-and-no-photo-ever-leaves-the-laptop-2agg): real-estate photo order

## Evidence for the lane

Pain:
- The NNA says a missing item is a common error and advises double-checking before leaving ([NNA](https://www.nationalnotary.org/notary-bulletin/blog/2017/09/signing-agent-tip-5-common-loan-signing-mistakes)).
- The Texas SOS training says a missed signature or initial is the agent's fault ([TX SOS](https://Www.Sos.State.Tx.us/statdoc/forms/presentations/2019/Notary%20Signing%20Agent.pdf)).
- Closewise, a signing service, calls missing initials and signatures the largest category of scanback errors. A miss found after the signer leaves "costs a second appointment" ([Closewise](https://www.closewise.com/signing-service-scanback-package-quality-control/)).
- Return trips for an agent's own error are often unpaid ([NotaryCafe](https://forum.notarycafe.com/t/return-trip-fee/31227)).

Money:
- Agents earn $60 to $100 per signing on platforms and $125 to $200 direct (secondary sources; see the [NotaryCafe fee threads](https://forum.notarycafe.com/t/question-on-fees-from-a-newbie/26969)).
- Signing services run their own QC teams that review scanbacks.

Competition:
- [Complete AI Training](https://completeaitraining.com/ai-agents/agent/loan-signing-package-review/) sells a "Loan Signing Package Review Agent" for $9/mo. It's a pack of instructions to paste into your own AI, not a checker, and it shows no users.

Open models:
- [mdefrance/yolos-small-signature-detection](https://huggingface.co/mdefrance/yolos-small-signature-detection) and [tech4humans/conditional-detr-50-signature-detector](https://huggingface.co/tech4humans/conditional-detr-50-signature-detector) are Apache-2.0 and ungated.
- The tech4humans YOLOv8s detector is AGPL and gated, which needs a Hugging Face account.

Why open is essential here:
- Every page of a loan package carries borrower names, loan amounts and often SSNs. Lenders and title companies hold vendors to strict data rules.
- So this is a real reason to run models locally, not a decoration.

## Risks

1. **No public signed packages exist.** Blank public-domain federal forms exist (the CFPB Closing Disclosure, IRS 4506-C). But the signed test pages would be either synthetic signatures placed digitally, labelled as simulation, or real pages that a person signs and photographs today.
2. **A heavier build:**
   - mapping fields from the PDF
   - aligning each page to the original
   - ink detection per box
   - a ~120 MB detector on a 512 MB, 0.1 CPU free server
   - phone capture flows
   Each one is a place for late bugs, which is the Week 1 lesson.
3. **Judges can't try it with their own material;** they'd only use our sample package.

## Decision

See [../DECISIONS.md](../DECISIONS.md), entry D1.
