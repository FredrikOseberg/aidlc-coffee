---
name: code-review
description: Review code changes against team code-quality and engineering practices — test coverage and naming, explicit dependency injection, narrow abstractions, discriminated unions, recorded decisions, no speculative config, supply-chain and CI hygiene. Use when reviewing diff or PR, before committing, or as self-check while implementing.
---

Review code changes against team code-quality and engineering practices. Run two ways:

- **Reviewing a diff or PR** — apply rubric to changes, report every violation.
- **While implementing** — before commit, self-check work-in-progress against rubric.

This skill judges *artifact* — code and tests as they stand — not process that made them. If project ships own `CLAUDE.md` or `DECISIONS.md`, treat as authoritative where it conflicts with this skill; this skill = portable baseline.

## Step 1 — Establish what changed

Determine review scope:

- Branch or PR: `git diff <base>...HEAD` (base usually `main`).
- Before commit: `git diff` and `git diff --staged`.
- Mid-implementation: code you just wrote or edited.

Read test files and production files together — test quality judged against code it covers, so neither half assessable alone.

## Step 2 — Apply the rubric

Every check. Each: confirm holds or flag specific `file:line`.

### Tests

**Behavior is covered.** Every new or changed behavior — function, branch, field, option — has test exercising it. Revert-the-line check: if behavior-bearing line reverted, some test must go red. Flag production code whose regression no test catches.
*Implementation-mode self-check:* write test before code, watch it fail for right reason — test that passes against unchanged code pinned nothing.

**Declarative wiring is not tested.** Flag test whose only assertion = declarative call ran — "impact metric incremented," "counter/histogram emitted," "route registered," "logger called." These restate implementation line-for-line, pin no behavior, usually need spy to write at all. Such code rides along uncovered *by design*: test observable behavior wiring sits on instead (branch that emits metric — its status code, its effect on state — not emission). "Behavior is covered" rule above does not demand test for emission itself; do not add one, flag if present.

**Same given and when — extend the existing test, don't add a new one.** Flag a new test that repeats the setup and action of an existing test only to assert an extra side effect (event, log, metric, audit record). If a test already covers that given and when, add the assertion to its then instead of duplicating the setup. Fewer, focused tests beat many overlapping ones; a new test is justified only when the given or when genuinely differs or the behavior asserted is genuinely easier to understand in isolation.

One assertion may already be enough. If the side-effect code is shared across paths, asserting the same payload again for another action type, branch, or item in a fan-out adds no coverage. Check: delete the side-effect code — if an existing test already fails, don't add more.

Behavior that is genuinely different does earn its own test or assertion:

- the side effect should not fire (failure path or other negative case)
- the action still succeeds when writing the side effect fails
- a specific edge-case value appears in the payload

This is different from "Declarative wiring is not tested" above: a persisted domain event can be real behavior. Keep an assertion that pins new behavior; drop one that repeats what another test already proves.

**Tests assert state, not mock calls.** Flag `vi.fn` / `vi.spyOn` + `toHaveBeenCalled(With)` where injected real (or in-memory) impl would let test assert observable *outcome* instead — e.g. assert `store.getEvents()` empty, not `insertEvents` `not.toHaveBeenCalled()`. Mocks couple test to call shape and ambient state, pass even when behavior broken; real injected dependency tests through seam, survives refactors. Hand-rolled fakes (plain object whose method throws/records) = injection, not mocking — fine. Spying justified only when effect has no readable back-channel (fire-and-forget call into something with no inspectable state).

**Tests are named by behavior, not mechanics.** Flag `it(...)` strings with "resolves", "returns", "throws", "is instance of", "sets", "calls" — describe mechanics, not user-facing capability. Exception: "throws" fine when throwing *is* contract (`'throws when url is missing'`). Name needing "and" describes two behaviors — split test. Expect names like `'evicts the oldest entry when the cache is full'`.

**Test data is minimal.** Flag constructor inputs in test body not in assertion — move to factory with defaults so body mentions only data participating in `expect`. Defaults named `defaultX`, never `unusedX`. Test that cares about a field overrides it with value visibly *different* from default, so assertion shows value flowing through, not tautology.

**Partial-match assertions prefer `toMatchObject` over `objectContaining`.** For a subset check — assert the fields that matter, ignore volatile ones like `id`/`createdAt` — use `toMatchObject` with a plain object literal. Flag `expect.objectContaining` / `expect.arrayContaining`: `toMatchObject` expresses the same match, recurses into nested objects without a wrapper at each level, and reads as plain data. Use `toEqual` for an exact value — a primitive, or a full object where an extra field should fail. One idiom per file: `toMatchObject` for subset, `toEqual` for exact.

- `toMatchObject([...])` on an array pins exact length and order, so a separate `toHaveLength` is redundant — add it only when the test indexes an element (`events[0]`) instead of matching the array whole.
- A run of single-field assertions describing one value — `expect(x.id).toBe(...)`, `expect(x.items).toHaveLength(2)`, `expect(x.name).toBeDefined()` — is one `toMatchObject` in disguise. Collapse it: a single expected-shape literal shows the whole contract at a glance; ten separate lines hide it.

Guideline, not a hard rule. When working around `toMatchObject` makes the assertion harder to read than the wrapper would be, keep the wrapper.

**Layout separates given / when / then.** Expect setup, action, assertion separated by single blank lines — no `// Given` / `// When` / `// Then` comments. Trivial one-line tests skip blank lines; multiple assertions in `then` group stay together.

**Tests sit at the seam they exercise.** Test each behavior at the layer that owns it. Flag:

- A higher-level test re-asserting what a lower-level test already pins — an executor test re-checking a full event payload that the event class's own test covers. If the same break already goes red at the lower level, the higher assertion is duplicate coverage: it drifts, costs maintenance, and hides that the real higher-level target — the wiring and orchestration — may be the under-tested part. The higher test asserts its own contract (did it trigger, did it pick the right source) and leaves payload detail to the layer that owns it.

**Test-factory overrides are wired end-to-end or omitted.** An override param on a `createFakeX` factory must be settable and observable through the same returned handle. Flag one that no test passes — dead ceremony, delete it — or one the constructed component uses but the returned fake doesn't reflect, so tests read back the default while the code under test sees the override. If a single test needs the seam, have that test bring its own stub or mutate the returned fake instead.

**Failure tests target realistic failures.** Flag a test that stubs a collaborator to throw only to reach a defensive `catch` — a local DB write on the happy path made to fail when it realistically can't. That pins scaffolding, not behavior. Ask which failure is real: external calls (network, upstream service) genuinely fail — test that one, and let it carry the failure-handling assertions once. Drop manufactured throws for paths that don't realistically fail. Related to "Cleverness is reversible" below: these tests set up state production never reaches.

### Design

**Dependencies are injected explicitly.** Flag `?? globalThis.x`, `?? Date.now`, `?? () => …` in constructor — bastard injection hides runtime requirements. Every collaborator (clock, scheduler, transport, logger, …) *required* in options object, assigned without fallback. Ambient globals wired only in composition root — `createX` factory. grep diff for `??`, `globalThis`, `Date.now`, `Math.random`, `setTimeout`, `new Date()`; any outside composition root = hidden, untestable state. Same for library global-singleton initializer (`initialize()` returning module-stored instance) where constructable instance exists (`new X(...)`) — global forces tests to reach in and stub it; inject instance, assert it directly.

**Put the decision where the data is (GRASP: Information Expert).** If a class fetches an object and then reads its fields to decide something, that decision belongs with whoever owns the object. Add a method there that returns the answer and call it. If the decision needs an extra input, inject it into the owner, not into the caller. Controllers don't decide things.

**Abstractions are the narrowest that fit the job.** Flag collaborator bundling two unrelated jobs — e.g. `Clock` exposing both `now()` and `setTimeout`. Split (`Clock` reads instant; `Scheduler` runs recurring work). Name collaborator after *one* thing it does that varies between production and test.

**States are discriminated unions, not booleans.** Flag `boolean` encoding state — `closed: boolean` should be `status: 'open' | 'closed'`. Flag several booleans that are really one enum, and callback payloads that should be discriminated variants each carrying exactly own fields.

**No speculative config.** Flag config option, field, or branch with no test or caller exercising it — config is scope, unused option is dead weight. Default to library built-in behavior; add knob only with code that needs it, expose narrowest escape hatch.

**Cleverness is reversible.** Flag over-engineering: abstraction with single impl and speculative seam; seam or helper whose only caller is a test; tests that set up state production never reaches; invariants needing comment to follow. Prefer more direct shape.

**Perf claims are measured.** Flag change justified by performance with no benchmark. Quote *ratio* (~2×), not absolute throughput, keep slower baseline in benchmark file so speedup stays measurable.

**Hot-path additions account for their cost.** When change adds work — timing, logging, metric, instrumentation, allocation — to known hot path (per-request or per-event handler, tight loop), change must state per-call cost at system's stated scale and confirm it's dominated by real work, or flag it. Locally-trivial line (`performance.now()`, `observeHistogram`) fine per-batch, ruinous per-event; review names which it is. Hot-path instrumentation with no cost reasoning = gap — especially in a codebase already tuned for performance.

### Compatibility

**Narrowing is breaking until proven otherwise.** A change narrows what customers can do when it makes a parser, schema, or validator stricter, adds a rate limit, or removes an option, field, or route. Trace every caller, frontend included. Must fix unless the PR states what existing data or usage was checked and found unaffected, or a fallback or migration covers them. Rejections surface as 4xx with a reason, never as 5xx or a swallowed error.

### Decisions and framing

**Non-obvious decisions are recorded.** Flag non-obvious design choice — abstraction reverted, knob deliberately omitted, trade-off taken — with no `DECISIONS.md` entry. Each entry states decision in one sentence, explains *why* including alternative that lost, lands *with* code, supersedes any earlier entry it invalidates explicitly, pins behavioral claims to test that enforces them.

**Gaps are framed as incomplete, not broken.** In review notes and commit messages, call behavior no test pins down "not handled yet" — not "bug" / "broken" / "defect". Reserve "bug" for code violating an *existing* test or contract, or narrowing what customers can already do; mis-framing gap as defect invites "fix" nobody asked for.

### Style

- `import type` (or `import { type X }`) for type-only imports.
- Default to no comments; comment explains *why* something non-obvious, never *what* code does. Flag comments/docs that repeat an explanation given elsewhere, or claim behavior code doesn't enforce (says "required", code makes it optional).
- Tests colocated with source — `foo.ts` next to `foo.test.ts`, no separate `test/` tree.
- Defer language and compiler specifics (import extensions, strictness flags) to project's own config and `CLAUDE.md`.
- Local names follow the scope's existing convention. If the file names all its fakes `fakeX`, keep that — don't rename one to the plain form. A `fake` / `real` / `actual` / `tmp` qualifier is stale only when the distinction it marked is gone: siblings are unqualified, or a refactor removed the real/fake split — often visible as one binding forcing `key: value` where siblings use object shorthand. Then rename to the plain form. After any change that drops a param, branch, or override, sweep the touched scope for names, comments, and types that only existed to mark the removed distinction.

### Supply-chain & CI security

**Apply only when the diff touches** dependency manifests, lockfiles, package-manager config (`.yarnrc`, `.yarnrc.yml`, `.npmrc`, `pnpm-workspace.yaml`, `bunfig.toml`), CI workflows, or `Dockerfile`s. Pure application-code diff — skip, don't manufacture findings. Threat: a compromised dependency running during install or build, or a workflow token that leaks to job code or carries more permission than it needs. Each check — control present, or flag absence at `file:line`.

**Install scripts disabled.** A dependency `postinstall` is the main payload vector. yarn 1 → `.yarnrc` `ignore-scripts true`; Berry → `.yarnrc.yml` `enableScripts: false`; npm → `.npmrc` `ignore-scripts=true`; pnpm ≥10 / bun block by default — there flag an `allowBuilds` / `onlyBuiltDependencies` / `trustedDependencies` list wider than needed. Flag a new install path (repo, `Dockerfile`, script) with no guard.

**Frozen lockfile at every install site.** Flag a bare install in any workflow, `Dockerfile`, or script: `yarn`/`yarn install` → `--frozen-lockfile`, Berry → `--immutable`, `npm install` → `npm ci`, `pnpm install` → `--frozen-lockfile`, `bun install` → `--frozen-lockfile` (bun does not auto-freeze — flag required).

**One lockfile, matching the manager.** Flag a second lockfile of a different manager (`yarn.lock` + `bun.lockb`) — ambiguous which tree installs, "frozen" then means nothing.

**No install bypasses the config.** `.yarnrc` governs only yarn, `.npmrc` only npm. Flag an install outside the committed config's reach — `npm`/`bun install` in a script, temp dir, or `Dockerfile` stage not inheriting it — unless the flag (`--ignore-scripts`, frozen) is on that command.

**New config reaches the Docker build.** A whitelist-style `.dockerignore` (`*` then `!src`, …) excludes everything not listed. When the diff adds config the build needs (`.yarnrc`, `.npmrc`), it must be added too (`!.yarnrc`) — otherwise it never enters the build context and the hardening silently does nothing.

**Least-privilege workflow token.** Flag a workflow/job with no `permissions:` block — inherits a broad default. Default `contents: read`; widen only per step need (`id-token: write` OIDC, `contents: write` release commit/tag, `packages: write` registry). Prefer per-job blocks, so a build/test job running dependency code carries no write or `id-token` scope it never uses.

**Checkout does not persist credentials.** Flag `actions/checkout` without `persist-credentials: false` — default writes `GITHUB_TOKEN` into `.git/config`, readable by any later step or build-time dependency. Exception: a later step doing an authenticated git op (push, tag) needs them — leave, note why.

**Disabling scripts doesn't skip the build.** `ignore-scripts` also stops the repo's own `prepare`/`prepack` — the step that usually builds. Confirm the build moved somewhere explicit: a CI build step, a README note for contributors, and a husky hook that runs the binary directly rather than `yarn <script>` (which breaks under `ignore-scripts` on husky v8). Publishing is unaffected — `npm publish` reads `.npmrc`, not `.yarnrc`, so `prepack` still builds.

**Coherent release-age cooldown.** Flag `minimumReleaseAgeExclude` with no `minimumReleaseAge` set — the exclude does nothing and the cooldown never applies. Cheapest defense against a same-day compromise (Renovate / pnpm `minimumReleaseAge`).

**Trusted publishing, not a stored token.** Flag a release publishing to npm with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` instead of OIDC (`id-token: write`, no npm token in `secrets`). A reusable workflow declaring no npm-token secret is already correct.

**A reusable-workflow call passes only the secrets it needs.** When one workflow calls another (`uses: .../some-workflow.yml@…`), `secrets: inherit` hands the called workflow the caller's entire secret set. If it needs only specific secrets, pass those by name instead. Over-sharing is worst under `pull_request_target`, which runs with secrets even on pull requests from forks.

### Bigger picture — step back from the diff

After line-level pass, stop judging delta, look at whole. Per-line checks pass cleanly on changes that shouldn't exist as written. This pass requires *searching codebase*, not just reading diff — grep/glob for siblings before concluding something is new.

**Reinvention check.** Before accepting new helper, factory, fake, type, constant, or function, search for one that already does the job — test utilities especially (new `createTestX` / bootstrap helper / in-memory fake often duplicates one already in `test-utils/`, sibling module, or shared package). If equivalent exists, fix = "reuse it," not "review new copy." Name the existing one. Same for hand-rolled logic on top of a library/SDK/platform: check its options, and how our own code uses it, for a built-in first.

**Rule of three.** If change = 3rd or 4th copy of same shape (same option block, same setup ceremony, same mapping), duplication earned an abstraction — flag it, name extraction. Conversely, do *not* push to abstract 2nd occurrence; two not yet a pattern, premature abstraction is its own debt.

**Baseline, not delta.** Judge the file/module the change lands in, not just added lines. PR extending an already-bloated/wrong-shaped file → maybe shrink baseline, don't extend. Check whether the extended thing should exist in current form at all; a locally-clean diff can still be the wrong move.

**Right home.** Does addition belong in this file / layer / module? Helper used by one caller may belong next to that caller, not shared util; cross-cutting concern dropped into leaf module may belong higher up.

## Step 3 — Report

Each finding: `file:line`, which rubric check it breaks and why it applies here, concrete fix. Group by severity:

- **Must fix** — would ship a defect or leave production behavior unpinned.
- **Should fix** — clear rubric violation; costs quality or maintenance, nothing breaks.
- **Note** — judgment call or observation, not a clear violation.

Number findings in one sequence across all groups (1, 2, 3… — never restart per group), so the user can reply "fix 1, 3, 4".

If changes clean, say so plainly, name strongest checks they passed. Don't invent violations to look thorough.
