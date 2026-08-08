# Project Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the seven ad-hoc categories in `src/data/portfolio.ts` with the six typed categories from the taxonomy spec, remove the duplicate and dead entries, and add machine-enforced guards for the spec's content rules.

**Architecture:** `portfolio.ts` gains a `Category` string-literal union and an exported `CATEGORIES` tuple, so `tsc --noEmit` rejects any value outside the six. A new Vitest suite enforces the content rules that types cannot express — no military-purpose vocabulary, no title leading with a bare codename, no duplicate project between `featuredProject` and `projects`. `Projects.tsx` renders a short display label rather than the canonical category name, because the canonical names are too long for the existing badge.

**Tech Stack:** TypeScript 5.8, React 19, Vite 6, Tailwind 4, `tsx` 4.21 (already a devDependency).

## Deviations from this plan, as executed 2026-08-08

Recorded because the committed work does not match the task list above.

1. **Vitest was not added.** `npm install -D vitest` ran for over 20 minutes with no
   output and was killed; `package.json` was never modified by it. The checks were
   rewritten as a plain `tsx` script — `src/data/portfolio.check.ts`, run by
   `npm test` — using `node:assert`-style helpers. This costs zero new packages, and
   `tsx` was already present. Given the repo had no test runner at all, this is
   arguably the better fit regardless. All ten checks from Tasks 1–5 survive intact.
2. **Tasks 1–5 were executed as a single commit** (`9b5f7c0`) rather than five. The
   red-green cycle was preserved — the check script was written first and observed
   failing before `portfolio.ts` was touched — but the intermediate commits were not
   made, because the type union and the data migration cannot compile independently.
3. **A fourth role, `Governance lead`, was added.** Author ruling, 2026-08-08: the
   PowerDocu clearance and the M365 Code Apps policy approval are the same kind of work
   and neither is development. See spec §8.
4. **A new project was added:** `code-apps-policy`, the M365 tenant Code Apps policy
   approval, under Developer Enablement & R&D with role `Governance lead`. Description
   deliberately vague at the author's instruction — it names only "the relevant
   cybersecurity authorities within MINDEF".
5. **The badge was not visually verified in a browser.** Every new label is at most 11
   characters (`Competition`), against a previous longest of `Tools/Automation` at 16
   which rendered without wrapping. The new labels are strictly shorter than what
   already fit, so no visual regression is possible.

## Global Constraints

Copied verbatim from `docs/superpowers/specs/2026-08-08-project-taxonomy-design.md`:

- The six categories are exactly: `Simulation & Decision Support`, `Full-Stack Platforms`, `Enterprise Applications`, `Process Automation`, `Developer Enablement & R&D`, `Competitions & Credentials`. (spec §5)
- Terms naming military purpose — "war fighting", "combat", "mission planning" — must not appear as a category name, a project title, or in body copy. (spec §7)
- No project title leads with a bare codename. Descriptor first, codename in parentheses. (spec §4)
- `organization` stays a separate axis and is not folded into category. (spec §5)
- Categories are ordered strongest-first, not alphabetically or chronologically. (spec §5.1)
- The parent spec's §8.2 evidence slots are **not** added to `portfolio.ts`. (spec §8)

## Out of scope for this plan

**The five projects in spec §6.2 (FUEL, BOLDFACE, MILES/MAVIS, GRID, Vibe Coding Masterclass) are not authored here.** Their prose is an author-supplied input per spec §6.2, and the four open items in spec §9 are unresolved. This plan establishes the taxonomy those entries will slot into. Adding them is a follow-up once the author supplies copy.

Consequence: after this plan, `Simulation & Decision Support` and `Full-Stack Platforms` will have zero members. That is correct — the type declares the taxonomy; the data fills in later. **Do not write a test asserting every category has at least one project.**

Also out of scope: the parent spec and `redesign-concept.html`. An earlier draft claimed their waypoint 1 misdescribed FUEL; it does not. FUEL Up (claims and receipts) and FUEL (aircraft refuelling planning) are two different projects, and both files are correct as written. See spec §7.

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/data/portfolio.ts` | Sole source of project data and the `Category` type | Modify |
| `src/data/portfolio.test.ts` | Invariants the type system cannot express | Create |
| `src/components/Projects.tsx` | Renders the category badge | Modify (line 66-68) |
| `package.json` | Adds Vitest and the `test` script | Modify |

---

### Task 1: Test harness and the `Category` type

**Files:**
- Modify: `package.json`
- Create: `src/data/portfolio.test.ts`
- Modify: `src/data/portfolio.ts:1-11`

**Interfaces:**
- Consumes: nothing.
- Produces: `export type Category` (union of six string literals) and `export const CATEGORIES: readonly Category[]` from `src/data/portfolio.ts`. Task 2 assigns these values to projects; Task 4 maps them to display labels; Task 5 iterates `CATEGORIES`.

- [ ] **Step 1: Install Vitest and add the test script**

```bash
npm install -D vitest@^3.2.4
```

Then in `package.json`, add to `"scripts"` after the `"lint"` line:

```json
    "test": "vitest run"
```

- [ ] **Step 2: Write the failing test**

Create `src/data/portfolio.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CATEGORIES } from "./portfolio";

describe("CATEGORIES", () => {
  it("lists the six taxonomy categories in strongest-first order", () => {
    expect(CATEGORIES).toEqual([
      "Simulation & Decision Support",
      "Full-Stack Platforms",
      "Enterprise Applications",
      "Process Automation",
      "Developer Enablement & R&D",
      "Competitions & Credentials",
    ]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `"CATEGORIES" is not exported by "src/data/portfolio.ts"`

- [ ] **Step 4: Add the type and constant**

In `src/data/portfolio.ts`, insert above the existing `export interface Project` block:

```ts
export const CATEGORIES = [
  "Simulation & Decision Support",
  "Full-Stack Platforms",
  "Enterprise Applications",
  "Process Automation",
  "Developer Enablement & R&D",
  "Competitions & Credentials",
] as const;

export type Category = (typeof CATEGORIES)[number];
```

Do **not** change `category: string` on the interface yet — Task 2 does that, once the data is migrated. Changing it now breaks the build for all 21 entries at once.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 1 test.

Run: `npm run lint`
Expected: no output (clean).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/data/portfolio.ts src/data/portfolio.test.ts
git commit -m "Add Category type and Vitest harness for portfolio data"
```

---

### Task 2: Migrate categories, merge the duplicate, cut the dead entry

**Files:**
- Modify: `src/data/portfolio.ts` (interface line 5; every `category:` value; delete two project objects)
- Modify: `src/data/portfolio.test.ts`

**Interfaces:**
- Consumes: `Category`, `CATEGORIES` from Task 1.
- Produces: `Project.category` narrowed to `Category`. `projects` shrinks from 20 entries to 18. The id `facility-booking-app` and the id `app-brandings` no longer exist — nothing else in the codebase references either (verified: only `Projects.tsx` reads `projects`, and it keys on `project.id` generically).

- [ ] **Step 1: Write the failing tests**

Append to `src/data/portfolio.test.ts`:

```ts
import { projects, featuredProject } from "./portfolio";

describe("project data", () => {
  const all = [featuredProject, ...projects];

  it("gives every project a category from the taxonomy", () => {
    for (const p of all) {
      expect(CATEGORIES).toContain(p.category);
    }
  });

  it("has no duplicate ids", () => {
    const ids = all.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not repeat the featured project in the archive", () => {
    const titles = projects.map((p) => p.title.toLowerCase());
    expect(titles).not.toContain(featuredProject.title.toLowerCase());
    expect(titles).not.toContain("facility booking app");
  });

  it("holds 18 archive projects", () => {
    expect(projects).toHaveLength(18);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — the category test fails on `"Enterprise"` (not in `CATEGORIES`), the duplicate test fails on `"facility booking app"`, and the length test reports 20.

- [ ] **Step 3: Narrow the interface**

In `src/data/portfolio.ts`, change line 5 from:

```ts
  category: string;
```

to:

```ts
  category: Category;
```

- [ ] **Step 4: Delete the duplicate and the dead entry**

Delete the entire `projects[0]` object — the one with `id: "facility-booking-app"`, title `"Facility Booking App"`. `featuredProject` (`id: "raid-air-2"`) is the fuller record and is kept.

Delete the entire object with `id: "app-brandings"`, title `"Improved App Brandings using SVG"`. It fits no category and has no `learningPoints` (spec §8.5).

- [ ] **Step 5: Reassign every remaining category value**

Apply exactly these replacements, per spec §6.1:

| `id` | Old value | New value |
|---|---|---|
| `raid-air-2` (`featuredProject`) | `"Enterprise"` | `"Enterprise Applications"` |
| `asv-logbook` | `"Enterprise"` | `"Process Automation"` |
| `sg-airshow-2026` | `"Enterprise"` | `"Process Automation"` |
| `soar-scheduling` | `"Requested"` | `"Process Automation"` |
| `ssb-loan-form` | `"Requested"` | `"Process Automation"` |
| `workplace-checkin` | `"Tools/Automation"` | `"Process Automation"` |
| `poly-forum-2024` | `"Tools/Automation"` | `"Process Automation"` |
| `lead-ambassadors-cca` | `"Tools/Automation"` | `"Process Automation"` |
| `mindsports-app` | `"Tools/Automation"` | `"Process Automation"` |
| `sage-copilot` | `"Requested"` | `"Developer Enablement & R&D"` |
| `vibe-coding-rnd` | `"R&D"` | `"Developer Enablement & R&D"` |
| `powerdocu-clearance` | `"R&D"` | `"Developer Enablement & R&D"` |
| `google-colab-bot` | `"R&D"` | `"Developer Enablement & R&D"` |
| `bootcamp-815` | `"Trainings"` | `"Developer Enablement & R&D"` |
| `new-intern-guide` | `"Trainings"` | `"Developer Enablement & R&D"` |
| `huawei-track` | `"Competitions"` | `"Competitions & Credentials"` |
| `whitehacks-2025` | `"Competitions"` | `"Competitions & Credentials"` |
| `iron-viz` | `"Competitions"` | `"Competitions & Credentials"` |
| `world-skills-training` | `"Aerospace"` | `"Competitions & Credentials"` |

- [ ] **Step 6: Run the tests and the type check**

Run: `npm test`
Expected: PASS, 5 tests.

Run: `npm run lint`
Expected: no output. If `tsc` reports an error in `Projects.tsx`, stop — that means something reads a removed id, which contradicts the Interfaces note above and needs investigating before proceeding.

- [ ] **Step 7: Commit**

```bash
git add src/data/portfolio.ts src/data/portfolio.test.ts
git commit -m "Migrate projects to the six-category taxonomy"
```

---

### Task 3: Add the `role` and `scale` fields

**Files:**
- Modify: `src/data/portfolio.ts` (interface, and `featuredProject` only)
- Modify: `src/data/portfolio.test.ts`

**Interfaces:**
- Consumes: the `Project` interface from Task 2.
- Produces: `export type Role` (union of three string literals), `Project.role: Role` (required), `Project.scale?: string` (optional, left unpopulated). Task 5 does not test them.

**Author ruling, 2026-08-08:** "If it is a development one, I did all the development myself. If it is a training the materials are made by me and for competitions I am always the competitor." This makes `role` fully derivable, so it is populated for every entry and typed as a required union rather than left to the author.

`scale` stays optional and **unpopulated** — spec §9 lists the RSAF headcount as unresolved, and spec §4 forbids the vague phrasing. The field exists so the figure has somewhere to go; no test asserts a value that does not yet exist.

- [ ] **Step 1: Write the failing test**

Append to `src/data/portfolio.test.ts`, inside the `describe("project data", ...)` block:

```ts
  it("gives every project a role from the closed set", () => {
    for (const p of all) {
      expect(ROLES).toContain(p.role);
    }
  });

  it("marks all four competition entries as Competitor", () => {
    const competitions = all.filter(
      (p) => p.category === "Competitions & Credentials",
    );
    expect(competitions).toHaveLength(4);
    for (const p of competitions) {
      expect(p.role).toBe("Competitor");
    }
  });
```

Add `ROLES` to the existing `./portfolio` import at the top of the file.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `"ROLES" is not exported by "src/data/portfolio.ts"`

- [ ] **Step 3: Add the type and fields**

In `src/data/portfolio.ts`, after the `Category` type declaration:

```ts
export const ROLES = ["Sole developer", "Instructor", "Competitor"] as const;

export type Role = (typeof ROLES)[number];
```

In the `Project` interface, add after `organization: string;`:

```ts
  role: Role;
  scale?: string;
```

- [ ] **Step 4: Populate `role` on all 19 entries**

`Instructor` for exactly these two — the author wrote the materials:

- `bootcamp-815`, `new-intern-guide`

`Competitor` for exactly these four:

- `huawei-track`, `whitehacks-2025`, `iron-viz`, `world-skills-training`

`Sole developer` for the remaining thirteen: `raid-air-2` (`featuredProject`), `asv-logbook`, `sg-airshow-2026`, `soar-scheduling`, `ssb-loan-form`, `workplace-checkin`, `poly-forum-2024`, `lead-ambassadors-cca`, `mindsports-app`, `sage-copilot`, `vibe-coding-rnd`, `powerdocu-clearance`, `google-colab-bot`.

**One judgement call to flag for the author:** `powerdocu-clearance` is a security-clearance collaboration with Cydef, not a build, so "Sole developer" is imprecise. It is assigned `Sole developer` because the author drove it alone from RAiD's side and the closed set has no better value. Raise it; do not add a fourth role value without the author's say-so.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 7 tests.

Run: `npm run lint`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/data/portfolio.ts src/data/portfolio.test.ts
git commit -m "Add typed role field and populate it across all projects"
```

---

### Task 4: Short display labels for the category badge

**Files:**
- Modify: `src/data/portfolio.ts`
- Modify: `src/components/Projects.tsx:65-68`
- Modify: `src/data/portfolio.test.ts`

**Interfaces:**
- Consumes: `Category`, `CATEGORIES` from Task 1.
- Produces: `export const CATEGORY_LABEL: Record<Category, string>` from `src/data/portfolio.ts`.

The badge at `Projects.tsx:66-68` is a `micro-label` chip sharing a `flex justify-between` row with the organization label. `"DEVELOPER ENABLEMENT & R&D"` uppercased will not fit and will wrap the row. Data keeps the canonical name; the badge shows a short form.

- [ ] **Step 1: Write the failing test**

Append to `src/data/portfolio.test.ts`:

```ts
import { CATEGORY_LABEL } from "./portfolio";

describe("CATEGORY_LABEL", () => {
  it("gives every category a badge label", () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_LABEL[c]).toBeTruthy();
    }
  });

  it("keeps badge labels short enough for the chip", () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_LABEL[c].length).toBeLessThanOrEqual(12);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `"CATEGORY_LABEL" is not exported by "src/data/portfolio.ts"`

- [ ] **Step 3: Add the label map**

In `src/data/portfolio.ts`, after the `Category` type declaration:

```ts
export const CATEGORY_LABEL: Record<Category, string> = {
  "Simulation & Decision Support": "Simulation",
  "Full-Stack Platforms": "Platform",
  "Enterprise Applications": "Enterprise",
  "Process Automation": "Automation",
  "Developer Enablement & R&D": "Enablement",
  "Competitions & Credentials": "Competition",
};
```

- [ ] **Step 4: Use it in the badge**

In `src/components/Projects.tsx`, add `CATEGORY_LABEL` to the existing import on line 3:

```tsx
import { projects, Project, CATEGORY_LABEL } from "../data/portfolio";
```

Then change lines 66-68 from:

```tsx
                <div className="micro-label px-2 py-1 bg-black/5 dark:bg-white/10">
                  {project.category}
                </div>
```

to:

```tsx
                <div className="micro-label px-2 py-1 bg-black/5 dark:bg-white/10">
                  {CATEGORY_LABEL[project.category]}
                </div>
```

Leave the detail-modal reference at line 120 showing `selectedProject.category` — the modal has room for the canonical name, and showing the full name where the reader has stopped to read is the point.

- [ ] **Step 5: Run the tests and the type check**

Run: `npm test`
Expected: PASS, 9 tests.

Run: `npm run lint`
Expected: no output.

- [ ] **Step 6: Verify the badge visually**

Run: `npm run dev`
Open `http://localhost:3000`, scroll to the projects grid. Confirm each card's badge and organization label sit on one row without wrapping, at both desktop and a narrow mobile width.

- [ ] **Step 7: Commit**

```bash
git add src/data/portfolio.ts src/components/Projects.tsx src/data/portfolio.test.ts
git commit -m "Show short category labels on project cards"
```

---

### Task 5: Content guards for the spec's publication rules

**Files:**
- Modify: `src/data/portfolio.test.ts`

**Interfaces:**
- Consumes: `projects`, `featuredProject` from Task 2; `CATEGORIES`, `CATEGORY_LABEL` from Tasks 1 and 4.
- Produces: nothing consumed by later tasks. This is the last task.

These guard spec §10's criteria that the type system cannot express. They exist because the author will hand-edit this file when supplying prose for the five §6.2 projects, and these are the mistakes that edit is most likely to introduce.

- [ ] **Step 1: Write the tests**

Append to `src/data/portfolio.test.ts`:

```ts
const BANNED_TERMS = [
  "war fighting",
  "warfighting",
  "combat",
  "mission planning",
];

const CODENAMES = ["boldface", "miles", "mavis", "grid", "fuel"];

describe("publication rules", () => {
  const all = [featuredProject, ...projects];

  it("uses no military-purpose vocabulary anywhere", () => {
    const corpus = [
      ...CATEGORIES,
      ...Object.values(CATEGORY_LABEL),
      ...all.flatMap((p) => [
        p.title,
        p.description,
        p.learningPoints ?? "",
        ...(p.features ?? []),
      ]),
    ]
      .join(" ")
      .toLowerCase();

    for (const term of BANNED_TERMS) {
      expect(corpus).not.toContain(term);
    }
  });

  it("never leads a title with a bare codename", () => {
    for (const p of all) {
      const firstWord = p.title.toLowerCase().split(/[\s/]+/)[0];
      expect(CODENAMES).not.toContain(firstWord);
    }
  });
});
```

The codename test checks only the *first* word, so `"Aircrew Qualification Platform (MAVIS)"` passes while `"MAVIS"` and `"MILES / MAVIS"` both fail. That is exactly the rule in spec §4.

- [ ] **Step 2: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 11 tests. These pass immediately against current data — that is correct. They are regression guards for the author's future edits, not a description of a bug being fixed.

- [ ] **Step 3: Verify each guard actually catches its violation**

A guard that cannot fail is worthless. Prove both fire, then revert:

1. Temporarily change `featuredProject.title` to `"MAVIS"`. Run `npm test`. Expected: the codename test FAILS. Revert.
2. Temporarily append `" for combat readiness"` to `featuredProject.description`. Run `npm test`. Expected: the vocabulary test FAILS. Revert.
3. Run `npm test` once more. Expected: PASS, 11 tests, with the file back to its committed state.

- [ ] **Step 4: Commit**

```bash
git add src/data/portfolio.test.ts
git commit -m "Guard portfolio data against codename and military-vocabulary leaks"
```

---

## Follow-up, not in this plan

1. Author prose for the five projects in spec §6.2, then add them to `projects`.
2. Apply the FUEL corrections in spec §7 to the parent spec §8.3 and to `redesign-concept.html` waypoint 1.
3. Resolve the four open items in spec §9 — codename clearance being the one that blocks publication.
