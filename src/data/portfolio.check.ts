/**
 * Data invariants for the project taxonomy.
 *
 * Enforces the rules in docs/superpowers/specs/2026-08-08-project-taxonomy-design.md
 * that the type system cannot express. Run with `npm test`.
 *
 * This is a plain tsx script rather than a test-framework suite: the repo has no test
 * runner, and `tsx` is already a devDependency, so these checks cost no new packages.
 */
import {
  CATEGORIES,
  CATEGORY_LABEL,
  ROLES,
  featuredProject,
  projects,
} from "./portfolio";

const failures: string[] = [];

function check(label: string, fn: () => void) {
  try {
    fn();
    console.log(`  ok  ${label}`);
  } catch (err) {
    failures.push(label);
    console.log(`FAIL  ${label}`);
    console.log(`      ${(err as Error).message}`);
  }
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const all = [featuredProject, ...projects];

// ── Taxonomy shape ────────────────────────────────────────────────────────────

check("CATEGORIES lists the six categories, strongest first", () => {
  const expected = [
    "Simulation & Decision Support",
    "Full-Stack Platforms",
    "Enterprise Applications",
    "Process Automation",
    "Developer Enablement & R&D",
    "Competitions & Credentials",
  ];
  assert(
    JSON.stringify([...CATEGORIES]) === JSON.stringify(expected),
    `got ${JSON.stringify([...CATEGORIES])}`,
  );
});

check("every category has a badge label", () => {
  for (const c of CATEGORIES) {
    assert(Boolean(CATEGORY_LABEL[c]), `missing label for "${c}"`);
  }
});

check("badge labels fit the chip (<= 12 chars)", () => {
  for (const c of CATEGORIES) {
    const label = CATEGORY_LABEL[c];
    assert(label.length <= 12, `"${label}" is ${label.length} chars`);
  }
});

// ── Project data ──────────────────────────────────────────────────────────────

check("every project has a category from the taxonomy", () => {
  for (const p of all) {
    assert(
      (CATEGORIES as readonly string[]).includes(p.category),
      `${p.id} has "${p.category}"`,
    );
  }
});

check("every project has a role from the closed set", () => {
  for (const p of all) {
    assert(
      (ROLES as readonly string[]).includes(p.role),
      `${p.id} has "${p.role}"`,
    );
  }
});

check("all competition entries are marked Competitor", () => {
  const competitions = all.filter(
    (p) => p.category === "Competitions & Credentials",
  );
  assert(competitions.length === 4, `found ${competitions.length}, expected 4`);
  for (const p of competitions) {
    assert(p.role === "Competitor", `${p.id} has role "${p.role}"`);
  }
});

check("no duplicate project ids", () => {
  const ids = all.map((p) => p.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert(dupes.length === 0, `duplicated: ${dupes.join(", ")}`);
});

check("the featured project is not repeated in the archive", () => {
  const titles = projects.map((p) => p.title.toLowerCase());
  assert(
    !titles.includes(featuredProject.title.toLowerCase()),
    `"${featuredProject.title}" appears in projects[]`,
  );
  assert(
    !titles.includes("facility booking app"),
    `the old duplicate "Facility Booking App" is still in projects[]`,
  );
});

// ── Publication rules (spec §4, §7) ───────────────────────────────────────────

const BANNED_TERMS = [
  "war fighting",
  "warfighting",
  "combat",
  "mission planning",
];

const CODENAMES = ["boldface", "miles", "mavis", "grid", "fuel"];

check("no military-purpose vocabulary anywhere", () => {
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
    assert(!corpus.includes(term), `found banned term "${term}"`);
  }
});

check("no title leads with a bare codename", () => {
  for (const p of all) {
    const firstWord = p.title.toLowerCase().split(/[\s/]+/)[0];
    assert(
      !CODENAMES.includes(firstWord),
      `"${p.title}" leads with codename "${firstWord}"`,
    );
  }
});

// ── Report ────────────────────────────────────────────────────────────────────

console.log("");
if (failures.length > 0) {
  console.log(`${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log(`All checks passed (${all.length} projects).`);
