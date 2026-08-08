# Project Taxonomy — Design

**Date:** 2026-08-08
**Target files:** `src/data/portfolio.ts`, `redesign-concept.html`
**Relates to:** `2026-08-08-daylight-ascent-portfolio-design.md` (the parent spec). This
document does not supersede it, and corrects nothing in it. It fills the gap that spec
left: how the projects *outside* the three featured waypoints are grouped.

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

- Touching the three featured case studies at all. They are correct as specced; see §7.
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
| 3 | **Enterprise Applications** | *I build with governance* | A deliberate governance layer — at least two of: RBAC, audit trail, approval workflow |
| 4 | **Process Automation** | *I ship a working process in days* | One workflow, one requesting party, days-to-weeks delivery, no governance layer beyond the platform default |
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

### 5.2 Categories 3 and 4 split on governance, not on adoption breadth

An earlier draft made Enterprise Applications require *multi-department deployment*. That
was wrong on two counts, and FUEL Up exposed both (§7).

**It misused the word.** In industry vocabulary an enterprise application is one built to
organisational standards — access control, auditability, integration with corporate
systems. It is a statement about how the thing was built, not about how far it has
spread. A hiring manager reads it the first way.

**It made category a function of time.** Under a deployment-breadth rule, an unchanged
codebase migrates from Process Automation to Enterprise Applications as adoption grows.
A project's category should describe the work, which is finished, not its uptake, which
is not.

Reach is already carried by `scale` (§8.3), which is the right home for it. Encoding it
twice made the two fields disagree the moment a project started scaling.

The boundary is therefore **the presence of a deliberate governance layer**. Native
platform behaviour does not count: `ssb-loan-form` routes an approval, but that is
FormSG's built-in routing rather than an access model the author designed, so it stays in
Process Automation. Re-checked against all eight current Process Automation entries — the
revised rule moves none of them.

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
| FUEL | Simulation & Decision Support | *author to supply — aircraft refuelling planning* |
| FUEL Up | Enterprise Applications | *author to supply — claims and receipt digitalisation* |
| BOLDFACE | Full-Stack Platforms | *author to supply* |
| MILES / MAVIS | Full-Stack Platforms | *author to supply* |
| GRID | Enterprise Applications | *author to supply — OCR document processing* |
| Power Apps Vibe Coding Masterclass | Developer Enablement & R&D | (no codename) |

Both FUEL and FUEL Up must lead with a descriptor, not the codename (§4). `FUEL` is in
the guarded codename list, so a title starting with either word fails `npm test`.

Resulting totals: 26 projects if MILES/MAVIS is one entry, 27 if two. See §9.

## 7. FUEL and FUEL Up are two different projects

**No correction to the parent spec is required.** An earlier draft of this document
claimed the parent spec's §8.3 misdescribed FUEL. It did not. The two names are similar
enough to be mistaken for each other, so they are recorded here explicitly:

| Name | What it is | Category | Status |
|---|---|---|---|
| **FUEL Up** | Claims and receipt digitalisation — RBAC, audit trail, SharePoint integration, data validation, governance | Enterprise Applications *(resolved — see below)* | Featured waypoint 1, parent spec §8.3. Framing is correct as written. |
| **FUEL** | Plans optimal aircraft refuelling | Simulation & Decision Support | Archive entry, not yet authored |

`redesign-concept.html`'s waypoint 1 cold open — *"A claim only becomes a number after
somebody has typed a receipt into a form twice"* — is about FUEL Up and stays.

**FUEL Up is Enterprise Applications. Resolved 2026-08-08.**

Author ruling: *"FUEL Up was used by one requesting party but it is in the scaling phase
as more departments have shown interest to adopt it."*

Under the original rule this was a demotion — one requesting party meant Process
Automation. It is instead the case that broke the rule, and the rule changed (§5.2).
FUEL Up carries RBAC and an audit trail, which is a governance layer somebody chose to
build; that is the Enterprise Applications marker, and it was true on the day the work
finished regardless of how many departments have since adopted it.

**The scaling fact is an asset, and belongs in the prose rather than the category.**
"Built to a standard that survived other departments asking for it" is a stronger claim
than either category name makes on its own, and it is the kind of third-party validation
the parent spec's §8.2 "Who confirmed it" slot exists to hold. Waypoint 1 should carry it
once the author supplies the copy. The number of interested departments is an open item
(§9) — the claim needs a figure, since "more departments" is exactly the vague
quantifier §4 rules out.

**FUEL validates category 1's definition.** "Plans optimal aircraft refuelling" is a
system that reasons about a situation rather than recording transactions — the §5 rule,
met exactly.

**Security framing.** Parent spec §12 requires FUEL's operational framing to stay vague.
**"Simulation & Decision Support"** is the approved public label. Terms naming military
purpose — "war fighting", "combat", "mission planning" — must not appear as a category
name, a project title, or in body copy. Refuelling optimisation is benign on its face;
the constraint is on how the operational context around it is described.

## 8. Data model changes

In `src/data/portfolio.ts`:

1. **Type the category.** Replace `category: string` with a union of the six values, so a
   typo fails the build rather than silently creating a seventh category.
2. **Add `role: Role`** — what the author personally did. Category says how big the
   system was; role says how much of it was the author's. Both are needed, and neither
   substitutes for the other. A reader who sees only "Enterprise Applications" assumes
   the least impressive reading available, which here is the wrong one.

   **Author ruling, 2026-08-08:** *"If it is a development one, I did all the development
   myself. If it is a training the materials are made by me and for competitions I am
   always the competitor."* This collapses `Role` to a closed set of three —
   `Sole developer`, `Instructor`, `Competitor` — typed as a union so a typo fails the
   build, and populated for every entry rather than left as author input.

   One entry resists the rule: `powerdocu-clearance` is a security-clearance
   collaboration with Cydef, not a build. It carries `Sole developer` because the author
   drove it alone from RAiD's side, and the closed set has no better value. Revisit if
   the author wants a fourth.
3. **Add `scale?: string`** — absolute numbers, per §4. Optional, and left **unpopulated**
   until the RSAF headcount in §9 resolves. The field exists so the figure has somewhere
   to go; §4's ban on "the entire RSAF" means a placeholder is worse than an empty field.
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
- **FUEL Up's adoption figure.** The category question is resolved — Enterprise
  Applications (§7). What remains is the number: how many departments have asked to adopt
  it. "More departments have shown interest" fails §4's absolute-numbers rule, and the fact is
  worth stating precisely because it is external validation rather than self-assessment.
- **RSAF headcount.** Required to replace "the entire RSAF" with an absolute figure (§4).
- **Masterclass cohort size and partner institutions.** Required for the "Who confirmed
  it" slot on featured waypoint 3.

## 10. Success criteria

- Every project in `portfolio.ts` carries exactly one of six typed categories; the build
  fails on any other value.
- Every project carries exactly one of three typed roles; all four Competitions &
  Credentials entries carry `Competitor`.
- No category name, project title, or body string contains military-purpose vocabulary
  (§7).
- No project title leads with a bare codename (§4).
- `featuredProject` and `projects` share no duplicate project.
- The parent spec's three featured waypoints are unchanged by this work.
- FUEL and FUEL Up appear as two separate projects, neither titled with a bare codename.
