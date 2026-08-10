# redesign-v2.html — what's left, and it's all yours

The design work on this page is done. What remains is content only you can write. This file is the complete list, in priority order.

The page marks each gap with a visible orange chip. **The page is not submittable while any chip is showing** — an admissions reader who sees "Add: one honest line" reads it as an unfinished document, and that was one of the original rejection grounds.

To preview the page as a reader would see it, open devtools and add the class `drafts-hidden` to the `<html>` element. That hides every chip. It is deliberately opt-in with no UI control, so the page can never accidentally look finished when it isn't.

**26 chips outstanding** (was 48).

> **Status, 2026-08-10.** The author answered 32 of the 58 questions in
> `redesign-v2-content-questionnaire.docx`, and those answers are now in the page.
> Closed: the FUEL Up case study in full, the Masterclass case study in full, all four
> organisation labels, PPCoE, the PowerDocu contradiction, two of the three SAGE
> `ai-role` slots, the flowchart bot's human need, and the Project Management Tracker's
> category and description. The tables below are the original 48 and have not been
> re-marked — grep the page for `needs-copy` for the live list. 26 of the original 48 are
> closed. Four of the 26 remaining are new,
> narrower questions that replaced broader ones the answers only half-closed: what was
> considered and rejected (FUEL Up and the Masterclass), the year of the Masterclass, and
> which parts of the Project Management Tracker he built.
>
> **The log is 23 projects, not 24.** The author confirmed that MILES / MAVIS and the
> "ASV Logbook & Maintenance Web App" row were one project under two names. They are
> merged under MILES / MAVIS, which is the name to publish; Process automation dropped
> 8 → 7. The absorbed row supplied two facts the case study lacked — the vehicles are
> Air Specialist Vehicles, and PowerDocu generated the documentation the prompting
> worked from — and independently corroborated the Power Apps → Lovable rebuild.
>
> **A fourth organisation pill exists now: "RSAF (other units)".** FUEL Up, the
> masterclass and the Project Management Tracker are RSAF work that did not sit in
> RAiD, and before this they carried no `data-org`, so every organisation filter hid
> them — including two of the three featured projects. Distribution is RAiD 11,
> RSAF (other units) 3, Temasek Polytechnic 8, Freelance 1.

> **Palette and profile card, 2026-08-10.** The page is re-tinted toward the
> personal bear logo and the profile card is rebuilt on the anatomy of an F1
> driver card — role bar, full-bleed portrait, identity tier, stat strip.
>
> **Your job title was wrong in four places** and is now
> `Forward Deployed Solution Architect (Intern)` everywhere. The hero lede
> decodes "forward deployed" once, because it is insider vocabulary and a
> reviewer already flagged five other terms as undecodable.
>
> **Two things are now machine-enforced.** The hero and the Experience heading
> must state your title byte-identically, and the card's two figures are
> recounted from the live page — so if you add a project, `verify-page.mjs`
> fails until the card is updated. That is intentional: section 4 below lists
> six figures a panel cannot check, and the card must not become a seventh.
>
> **The RAiD blurb was rewritten** to describe choosing platforms rather than
> only building on one, since the heading now says architect. Every clause is
> backed by a row in the log, but the words are yours to adjust.
>
> **Still open, and yours:** you said your end goal is AI engineering, and the
> page does not say so anywhere. It was deliberately kept off the card, which
> carries only present-tense verifiable facts, and off the pill, which now
> reads "Aerospace Engineering + software & AI" and must not go back to
> reading as a pivot away from aerospace. The hero thesis is the one place it
> could go. See section 5.3 of the design spec.
>
> **One more correction, folded in alongside this work.** The profile card and
> the origin section now say the Aerospace Engineering diploma at Temasek
> Polytechnic is graduated, not "(studying)" — you confirmed this on
> 2026-08-10.

## 1. The three things that matter most

These aren't chips. They're the gaps a chip can't mark.

**Screenshot the three featured projects.** FUEL Up, MILES / MAVIS, and the Vibe Coding Masterclass have no imagery at all — no asset for them exists in `public/`. The three screenshots that do exist were placed in their matching project-log rows. "Twenty-four projects and not one I can see" was a rejection ground, and it's only partly closed. One image per flagship project would do more than everything else on this list.

**Say what FUEL Up and MILES / MAVIS actually are.** Two unexplained codenames on your flagship work was, on its own, enough to reject. One plain sentence each: what it is, who uses it.

**Write the Iteration beat.** Every featured case study has a beat labelled "Iteration — what the first version got wrong and what changed", and all three are empty. SUTD DAI's page describes teaching a "user-centred innovation process". Iteration *is* that process. Right now the page shows outcomes with no evidence you ever changed your mind, which is the single weakest thing about it as a DAI application.

## 2. Featured case studies — 20 chips

Each of the three cards runs a six-beat spine: the person, framing, your role, iteration, validation, and what you'd do differently.

| Project | Line | What it asks |
|---|---|---|
| FUEL Up | 1029 | Who uses FUEL Up, and at which organisation |
| FUEL Up | 1043 | Who hit this problem and what it was costing them |
| FUEL Up | 1052 | What you decided the problem actually was, and what you ruled out |
| FUEL Up | 1062 | Timeline, team size, or the hard constraint |
| FUEL Up | 1068 | One obstacle you handled alone |
| FUEL Up | 1074 | Who used it, signed it off, or tested it |
| FUEL Up | 1080 | One honest line |
| MILES / MAVIS | 1121 | Who uses MILES / MAVIS, and at which organisation |
| MILES / MAVIS | 1135 | Who hit this problem and what it was costing them |
| MILES / MAVIS | 1144 | What you decided the problem actually was, and what you ruled out |
| MILES / MAVIS | 1155 | Timeline, team size, or the hard constraint |
| MILES / MAVIS | 1161 | One obstacle you handled alone |
| MILES / MAVIS | 1167 | Who used it, signed it off, or tested it |
| MILES / MAVIS | 1173 | One honest line |
| Masterclass | 1230 | Who the learners were and what the gap was costing them |
| Masterclass | 1238 | What you decided the problem actually was, and what you ruled out |
| Masterclass | 1247 | Dates, cohort size, or the hard constraint |
| Masterclass | 1253 | One obstacle you handled alone |
| Masterclass | 1267 | One honest line |
| Featured intro | 1017 | The "Draft copy" banner — delete it once the cards are filled |

## 3. Acronyms nobody outside your unit can decode — 5 chips

A reviewer flagged each of these as "cannot be understood as written". Expand them, or replace them with a generic descriptor if the real name shouldn't be published.

| Line | Acronym |
|---|---|
| 954 | PPCoE |
| 1539 | SSB |
| 1665 | Cydef |
| 1680 | SAGE / ME5 / Delta Agent — and what the integration actually does |
| 1706 | 815 SQN |

## 4. Numbers with no source — 6 chips

Every one of these is currently a claim a panel can't check.

| Line | What's unsourced |
|---|---|
| 1481 | Who can confirm the two-day build, or the dates it ran between |
| 1566 | How the efficiency and accuracy change was measured, and who reported it |
| 1608 | Where the 500-student figure comes from, and who counted it |
| 1653 | Who measured the months-to-days figure, and against which project |
| 1706 | Where the 35-attendee figure comes from |
| 1692 | What "replicate GPT-4.1 concepts" means, what was built, what the licence constraint was |

## 5. Competition outcomes — 4 chips

The Competitions category claims "assessed by somebody other than me", and no entry says how it went. Lines 1757, 1771, 1785, 1809. "Didn't place" is a perfectly good answer and beats silence.

## 6. Everything else — 13 chips

Lines 1432, 1447, 1633, 1825 — organisation labels. Line 1438 — what MILES / MAVIS was built on. Line 1665 — whether PowerDocu was cleared for your personal use or for citizen developers generally; the page currently says both. Lines 1684, 1686, 1688 — what the SAGE agent does for whom, and which parts you built. Line 1706 — what Lovable was actually used for. Line 1733 — who needed flowcharts out of written text. Lines 1825, 1829 — the Project Management Tracker's category, organisation, and what it even is.

## 7. Two judgement calls left for you

**The closing line still says "Open to AI engineering and software development opportunities."** That's a job-hunting line, and it's the last thing a reader sees. If this page is going to an admissions panel, it probably shouldn't be there.

**There's no "why design, why AI, why study" anywhere on the page.** It was deliberately out of scope for the design work, because it's content strategy rather than design. It's also the question the programme most wants answered.

## Verifying your changes

`node scripts/verify-page.mjs` checks horizontal overflow, console errors, broken images, the no-JavaScript path, contrast, anchor occlusion, the skip link, and that nothing has reintroduced an external dependency. Exit 0 means clean. Run it after editing.

## What was fixed for you (don't undo these)

The dark contact section was rendering through an accidental `filter: invert(1)` — navy showing as cream — because a Tailwind utility collided with the page's own `.invert` class. That CDN is gone and the page now owns its whole stylesheet. Contact and footer are also readable with JavaScript disabled and in print; a broken portrait image no longer deletes your profile card; the mobile nav reaches every section; the empty sky between case studies is down from about 80vh to 54vh; and the project log no longer contradicts itself about what work exists.
