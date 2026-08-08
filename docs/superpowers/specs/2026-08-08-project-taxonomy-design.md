# Project Taxonomy — Design

**Date:** 2026-08-08
**Target files:** `src/data/portfolio.ts`, `redesign-concept.html`
**Relates to:** `2026-08-08-daylight-ascent-portfolio-design.md` (the parent spec). This
document does not supersede it. It fills the gap that spec left: how the seventeen
projects *outside* the three featured waypoints are grouped, and it corrects one factual
error in the parent's §8.3.

---

## 1. Context

`src/data/portfolio.ts` holds 20 projects under seven ad-hoc categories: `Enterprise`,
`Requested`, `R&D`, `Trainings`, `Tools/Automation`, `Competitions`, `Aerospace`. These
were accreted, not designed, and three problems follow:

1. **They mix incompatible axes.** `Requested` describes *who asked for it*. `Enterprise`
   describes *deployment scope*. `R&D` describes *intent*. `Aerospace` describes
   *domain*. A reader cannot predict where any project sits, so the grouping carries no
   information and gets skipped.
2. **`Requested` is meaningless to an outsider.** It encodes an internal RAiD workflow
   distinction that no external reader shares.
3. **Five of the strongest projects are missing entirely.** FUEL, BOLDFACE, MILES, MAVIS
   and GRID appear only in `redesign-concept.html` and the parent spec. There is nothing
   in the data layer to recategorise.

## 2. Goals

- One consistent axis, so a reader can predict where a project sits after seeing two
  examples.
- Category names drawn from job-description vocabulary, since the reader is
  pattern-matching this page against a role they are hiring for.
- Preserve the parent spec's three featured waypoints untouched. Categories do
  *browsing* work; the waypoints do *argument* work.

## 3. Non-goals

- Rewriting the three featured case studies' structure. Only waypoint 1's *subject
  matter* changes (§7), not the three-beat form.
- Adding quantified metrics. The parent spec's §8.2 evidence-slot approach stands.
- Filter UI, sort behaviour, or animation for the category chips. Data and naming only.

## 4. Audience decision

**Primary reader: civilian hiring managers and recruiters, outside defence.** This is
consistent with the parent spec §2 ("hiring managers and recruiters for AI / software
engineering roles"), and it settles three naming questions:

- Internal codenames carry zero meaning and impose a decode cost. They are retained but
  demoted: **descriptor first, codename in parentheses** — "Aircrew Qualification
  Platform (MAVIS)", not "MAVIS".
- Military framing is removed from all category names. "War Fighting Mock Up" reads to a
  civilian as either classified or unfinished; both are bad. See §5, category 1.
- **Scale must be stated in absolute numbers.** "The entire RSAF" is meaningless to
  someone outside defence. An approximate headcount is required.

## 5. The taxonomy

Six groupings. The single axis for the first five is **scope of ownership** — how much
of a system the author was responsible for, and how many people it reached. They are
ordered strongest-first, not alphabetically or chronologically.

The sixth is deliberately off-axis: a competition is a different *kind* of evidence than
a shipped system, and forcing Whitehacks into "Process Automation" would break the
ladder's meaning for every other entry.

| # | Category | The claim it makes | Assignment rule |
|---|---|---|---|
| 1 | **Simulation & Decision Support** | *I can model a domain I wasn't trained in* | The system reasons about a situation rather than recording transactions |
| 2 | **Full-Stack Platforms** | *I own systems, not features* | The author held the architecture and roadmap, not just an assigned component |
| 3 | **Enterprise Applications** | *I build with governance* | Multi-department deployment with at least two of: RBAC, audit trail, approval workflow |
| 4 | **Process Automation** | *I ship a working process in days* | One workflow, one requesting party, days-to-weeks delivery |
| 5 | **Developer Enablement & R&D** | *I scale the practice past myself* | The output is a capability in other people, or a tool/clearance others depend on |
| 6 | **Competitions & Credentials** | *externally assessed* | Judged or certified by a third party |

`organization` (RAiD / Temasek Polytechnic / Freelance) stays a **separate** axis and is
not folded into category. A poly CCA app and an RSAF system can share a capability while
obviously differing in stakes, and showing that is stronger than hiding the earlier work.

### 5.1 The distribution is uneven, and that is intentional

Categories 1–3 hold five projects between them; categories 4–5 hold fifteen. This
honestly reflects a seven-month internship — most of the volume is fast delivery, and
the deep-ownership work is recent and few. The design does not disguise this. It is the
reason categories are **ordered strongest-first**: the reader meets the thin, strong
categories before the long tail, rather than having to dig for them.

## 6. Project mapping

### 6.1 Existing entries — recategorised

| Existing `id` | New category |
|---|---|
| `facility-booking-app` | Enterprise Applications *(merge — see §8)* |
| `asv-logbook` | Process Automation |
| `sg-airshow-2026` | Process Automation |
| `soar-scheduling` | Process Automation |
| `ssb-loan-form` | Process Automation |
| `workplace-checkin` | Process Automation |
| `poly-forum-2024` | Process Automation |
| `lead-ambassadors-cca` | Process Automation |
| `mindsports-app` | Process Automation |
| `sage-copilot` | Developer Enablement & R&D |
| `vibe-coding-rnd` | Developer Enablement & R&D |
| `powerdocu-clearance` | Developer Enablement & R&D |
| `bootcamp-815` | Developer Enablement & R&D |
| `new-intern-guide` | Developer Enablement & R&D |
| `google-colab-bot` | Developer Enablement & R&D |
| `huawei-track` | Competitions & Credentials |
| `whitehacks-2025` | Competitions & Credentials |
| `iron-viz` | Competitions & Credentials |
| `world-skills-training` | Competitions & Credentials |
| `app-brandings` | **Cut** — see §8 |

### 6.2 Entries to author

These do not exist in the data layer and must be written from scratch. Prose is an
**author-supplied input**, exactly as the parent spec §8.4 requires for the waypoints.

| Project | Category | Public descriptor (codename demoted) |
|---|---|---|
| FUEL | Simulation & Decision Support | *author to supply — must not name the operational scenario* |
| BOLDFACE | Full-Stack Platforms | *author to supply* |
| MILES / MAVIS | Full-Stack Platforms | *author to supply* |
| GRID | Enterprise Applications | *author to supply — OCR document processing* |
| Power Apps Vibe Coding Masterclass | Developer Enablement & R&D | (no codename) |

Resulting totals: 24 projects if MILES/MAVIS is one entry, 25 if two. See §9.

## 7. Correction to the parent spec

**FUEL is operational modelling, not claims digitalisation.** The parent spec's §8.3
table row 1 and the corresponding prose in `redesign-concept.html` are wrong and must be
corrected before either ships, or the site will contradict itself.

| Location | Current | Required change |
|---|---|---|
| Parent spec §8.3, row 1 | "FUEL Up — claims & receipt digitalisation … *Can you ship production software?*" | Subject becomes operational modelling; the question becomes *Can you model a domain you weren't trained in?* |
| `redesign-concept.html`, waypoint 1 cold open | "A claim only becomes a number after somebody has typed a receipt into a form twice." | Replace. Author-supplied, per parent spec §8.4. |
| `redesign-concept.html`, waypoint 1 section comment | Describes the claims/receipt framing | Update to match |

**The altitude ladder still holds.** Parent spec §8.3's "one process → one platform → a
whole community" was about *scope*, and one operational scenario is still narrower in
scope than a platform. Running order is unchanged. Only what waypoint 1 *claims* changes.

**Security framing becomes more load-bearing, not less.** The parent spec §12 already
requires FUEL's "operational planning scenarios" framing to stay vague. Now that the
category name itself is public, that constraint extends to the category: **"Simulation &
Decision Support"** is the approved public label. Terms naming military purpose — "war
fighting", "combat", "mission planning" — must not appear as a category name, a project
title, or in body copy.

## 8. Data model changes

In `src/data/portfolio.ts`:

1. **Type the category.** Replace `category: string` with a union of the six values, so a
   typo fails the build rather than silently creating a seventh category.
2. **Add `role: string`** — what the author personally did, in the parent spec's own
   vocabulary (Lead Developer / Solution Owner / Lead Instructor). Category says how big
   the system was; role says how much of it was the author's. Both are needed, and
   neither substitutes for the other.
3. **Add `scale?: string`** — absolute numbers, per §4. Optional, because it does not
   apply to competitions or R&D.
4. **Resolve the duplicate.** `featuredProject` (`raid-air-2`, "RSAF Facility Booking
   App") and `projects[0]` (`facility-booking-app`, "Facility Booking App") are the same
   project entered twice with divergent `tools` arrays and truncated `learningPoints`.
   Keep the fuller `featuredProject` record; delete `projects[0]`.
5. **Cut `app-brandings`.** "Improved App Brandings using SVG" fits no category, has no
   `learningPoints`, and is the weakest item in the set. Inventing a home for it would
   damage the taxonomy to save one entry.

The parent spec's §8.2 evidence slots ("What exists now" / "Who confirmed it" / "What I'd
do differently") stay where they are — in the waypoint prose for the three featured
projects. They are not added to `portfolio.ts` for all 24 entries; that prose does not
exist and inventing it would violate §8.2's ban on abstract-noun impact claims.

## 9. Open items

These block content, not structure. Implementation of the data model may proceed while
they resolve.

- **Codename clearance.** BOLDFACE, MILES, MAVIS, GRID and FUEL are assumed publishable
  on the author's confirmation, per parent spec §12. BOLDFACE carries a specific aviation
  procedure meaning and needs a second check. Demoting codenames to parentheses (§4)
  reduces but does not eliminate the exposure. **Unresolved.**
- **MILES / MAVIS — one entry or two?** `redesign-concept.html` treats them as a single
  paired waypoint. Whether the archive splits them changes the project count and the
  Full-Stack Platforms category size.
- **RSAF headcount.** Required to replace "the entire RSAF" with an absolute figure (§4).
- **Masterclass cohort size and partner institutions.** Required for the "Who confirmed
  it" slot on featured waypoint 3.

## 10. Success criteria

- Every project in `portfolio.ts` carries exactly one of six typed categories; the build
  fails on any other value.
- No category name, project title, or body string contains military-purpose vocabulary
  (§7).
- No project title leads with a bare codename (§4).
- `featuredProject` and `projects` share no duplicate project.
- The three featured waypoints' structure is byte-identical to the parent spec's §8.1
  three-beat form; only waypoint 1's subject matter differs.
