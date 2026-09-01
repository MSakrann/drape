# Drape Customer-Facing Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Next.js Drape app whose marketing site matches comfy.org’s structure and motion (Drape tokens, Unique, mint), with Supabase email/password auth and a click-through mock generation flow.

**Architecture:** One App Router codebase. Pure functions in `lib/` own credits, mock outputs, and job/plan rules (Vitest). API routes call those functions with a Supabase adapter. Marketing and app pages share `components/` (Button, NodeTitle, Card, header/footer). Generation never talks to a GPU; it waits, then returns `/samples/drape-*.jpg`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Playwright, `@supabase/supabase-js`, `@supabase/ssr`

**Spec:** `docs/superpowers/specs/2026-09-01-drape-customer-facing-product-design.md`

## Global Constraints

- English only. No Arabic, no RTL toggle.
- Unique font only, files already in `fonts/Unique/`. No PP Formula. No scraping or vendoring comfy.org source.
- Recreate Comfy look in original CSS/JS. Do not copy Comfy’s logo, copy, videos, client marks, or SVG node assets.
- Tokens: background `#12191B`, surface `#1C3331`, accent `#3EC9A8`, text primary `#F0EFED`, muted `#C2BFB9`, dim `#7E7C78`, destructive `#F44336`. No Comfy yellow `#F2FF59`, no plum.
- Logo on site: `assets/logo/Print_Transparent.svg` only. Do not use `Print.svg`.
- Landing images: only `assets/landing-images/drape-1.jpg` … `drape-10.jpg`.
- Hero does not mention “mock” or “preview.” Generate/results may label video as “Video preview (mock).”
- Credit costs: studio 1, lifestyle 1, try-on 2, variants 4, video 10. Video is 15s only.
- Trial: 20 credits on signup. Plans: Starter 400 EGP / 50 credits, Pro 1000 / 150, Business 2500 / 400, Agency 6000 / 1200, monthly.
- Charge credits only when a mock job succeeds. Failed jobs do not deduct.
- Choose paid plan once per account (only from `trial`).
- Generation is explicitly mock until training/LoRA exist. No ComfyUI, RunPod, Stripe, Shopify, Clerk, Prisma, Redis.

---

## File Map

- `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `middleware.ts`, `.gitignore`, `.env.example` — app tooling
- `app/globals.css` — tokens, Unique `@font-face`, marquee keyframes, focus ring
- `app/layout.tsx` — root html/body, Unique, dark background
- `lib/types.ts` — `Workflow`, `Plan`, `GenerationStatus`
- `lib/credits.ts` — costs, grants, `hasEnoughCredits`, `canChoosePaidPlan`
- `lib/mock-generate.ts` — sample paths, `pickOutputPaths`, `mockDelayMs`, `progressStages`
- `lib/generate-service.ts` — `executeGenerate` (402 / success / fail)
- `lib/choose-plan.ts` — `executeChoosePlan` (once from trial)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts` — browser/server/middleware clients
- `lib/supabase/adapter.ts` — repo used by API routes
- `components/ui/button.tsx`, `components/ui/node-title.tsx`, `components/ui/card.tsx`
- `components/logo.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`, `components/announcement-banner.tsx`
- `components/credits-chip.tsx`, `components/empty-state.tsx`, `components/insufficient-credits-modal.tsx`, `components/generation-progress.tsx`
- `app/page.tsx` — landing
- `app/pricing/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`
- `app/sign-in/page.tsx`, `app/sign-up/page.tsx`
- `app/dashboard/page.tsx`, `app/generate/page.tsx`, `app/results/page.tsx`, `app/results/[id]/page.tsx`
- `app/api/generate/route.ts`, `app/api/generations/route.ts`, `app/api/generations/[id]/route.ts`, `app/api/billing/choose-plan/route.ts`
- `supabase/migrations/20260901000000_init.sql`
- `public/fonts/` — Unique woff2 copies
- `public/samples/` — drape-1.jpg … drape-10.jpg copies
- `public/logo.svg` — copy of Print_Transparent.svg
- `lib/credits.test.ts`, `lib/mock-generate.test.ts`, `lib/generate-service.test.ts`, `lib/choose-plan.test.ts`
- `e2e/landing.spec.ts`, `e2e/auth-generate.spec.ts`

---

### Task 1: Scaffold Next.js app, tokens, fonts, samples

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `vitest.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- Create: `public/fonts/` (copy Unique woff2), `public/samples/` (copy landing jpgs), `public/logo.svg`

**Interfaces:**
- Consumes: nothing
- Produces: runnable Next app; CSS variables `--drape-bg`, `--drape-surface`, `--drape-accent`, `--drape-text`, `--drape-muted`, `--drape-dim`, `--drape-destructive`; font-family `Unique`

- [ ] **Step 1: Write package.json and configs**

```json
{
  "name": "drape",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

Install: `npm install next@15 react@19 react-dom@19 && npm install -D typescript @types/react @types/react-dom @types/node tailwindcss @tailwindcss/postcss vitest @vitejs/plugin-react jsdom @playwright/test eslint eslint-config-next`

`tsconfig.json` paths: `"@/*": ["./*"]`, `strict: true`.

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "node", include: ["lib/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

`.gitignore`: `node_modules`, `.next`, `.env`, `.env.local`, `test-results`, `playwright-report`, `.DS_Store`

`.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 2: Copy static assets**

```bash
mkdir -p public/fonts public/samples
cp fonts/Unique/Web-TT/Unique-Thin.woff2 fonts/Unique/Web-TT/Unique-ExtraLight.woff2 fonts/Unique/Web-TT/Unique-Light.woff2 fonts/Unique/Web-TT/Unique-Regular.woff2 fonts/Unique/Web-TT/Unique-Medium.woff2 fonts/Unique/Web-TT/Unique-SemiBold.woff2 fonts/Unique/Web-TT/Unique-Bold.woff2 public/fonts/
cp assets/landing-images/drape-*.jpg public/samples/
cp assets/logo/Print_Transparent.svg public/logo.svg
```

- [ ] **Step 3: Write `app/globals.css` and root layout**

`app/globals.css` — `@import "tailwindcss";` then `@font-face` for Unique Thin 100 through Bold 700 from `/fonts/Unique-*.woff2`. `:root` variables exactly:

```css
--drape-bg: #12191B;
--drape-surface: #1C3331;
--drape-accent: #3EC9A8;
--drape-text: #F0EFED;
--drape-muted: #C2BFB9;
--drape-dim: #7E7C78;
--drape-destructive: #F44336;
```

`body { background: var(--drape-bg); color: var(--drape-text); font-family: Unique, sans-serif; }`
`@keyframes drape-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`
Focus: `*:focus-visible { outline: 3px solid var(--drape-accent); outline-offset: 2px; }`

`app/layout.tsx`: `lang="en"`, import `./globals.css`, metadata title `Drape`, description `Studio product photos from a phone shot.`

Temporary `app/page.tsx`: `<main>Drape</main>` so build works (replaced in Task 6).

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: compiled successfully.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts postcss.config.mjs .gitignore .env.example app public
git commit -m "chore: scaffold Next.js app with Unique fonts and Drape tokens"
```

---

### Task 2: Credits and plan rules

**Files:**
- Create: `lib/types.ts`, `lib/credits.ts`
- Test: `lib/credits.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `export type Workflow = "studio" | "tryon" | "lifestyle" | "video" | "variants"`
  - `export type Plan = "trial" | "starter" | "pro" | "business" | "agency"`
  - `export type GenerationStatus = "running" | "done" | "failed"`
  - `export const CREDIT_COSTS: Record<Workflow, number>`
  - `export const MONTHLY_CREDITS: Record<Exclude<Plan, "trial">, number>`
  - `export const PLAN_PRICE_EGP: Record<Exclude<Plan, "trial">, number>`
  - `export const TRIAL_CREDITS = 20`
  - `export function creditCost(workflow: Workflow): number`
  - `export function hasEnoughCredits(balance: number, workflow: Workflow): boolean`
  - `export function monthlyGrant(plan: Exclude<Plan, "trial">): number`
  - `export function canChoosePaidPlan(currentPlan: Plan): boolean`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  CREDIT_COSTS,
  MONTHLY_CREDITS,
  PLAN_PRICE_EGP,
  TRIAL_CREDITS,
  canChoosePaidPlan,
  creditCost,
  hasEnoughCredits,
  monthlyGrant,
} from "./credits";

describe("creditCost", () => {
  it("matches spec costs", () => {
    expect(creditCost("studio")).toBe(1);
    expect(creditCost("lifestyle")).toBe(1);
    expect(creditCost("tryon")).toBe(2);
    expect(creditCost("variants")).toBe(4);
    expect(creditCost("video")).toBe(10);
  });
});

describe("hasEnoughCredits", () => {
  it("is true when balance equals cost", () => {
    expect(hasEnoughCredits(10, "video")).toBe(true);
  });
  it("is false when balance is below cost", () => {
    expect(hasEnoughCredits(9, "video")).toBe(false);
  });
});

describe("plans", () => {
  it("uses trial 20 and listed EGP prices and grants", () => {
    expect(TRIAL_CREDITS).toBe(20);
    expect(PLAN_PRICE_EGP.starter).toBe(400);
    expect(PLAN_PRICE_EGP.pro).toBe(1000);
    expect(PLAN_PRICE_EGP.business).toBe(2500);
    expect(PLAN_PRICE_EGP.agency).toBe(6000);
    expect(monthlyGrant("starter")).toBe(50);
    expect(monthlyGrant("pro")).toBe(150);
    expect(monthlyGrant("business")).toBe(400);
    expect(monthlyGrant("agency")).toBe(1200);
  });
  it("allows choosing a paid plan only from trial", () => {
    expect(canChoosePaidPlan("trial")).toBe(true);
    expect(canChoosePaidPlan("starter")).toBe(false);
    expect(canChoosePaidPlan("pro")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/credits.test.ts`
Expected: FAIL (cannot find module `./credits`)

- [ ] **Step 3: Write minimal implementation**

`lib/types.ts`:

```ts
export type Workflow = "studio" | "tryon" | "lifestyle" | "video" | "variants";
export type Plan = "trial" | "starter" | "pro" | "business" | "agency";
export type GenerationStatus = "running" | "done" | "failed";
```

`lib/credits.ts`:

```ts
import type { Plan, Workflow } from "./types";

export const TRIAL_CREDITS = 20;

export const CREDIT_COSTS: Record<Workflow, number> = {
  studio: 1,
  lifestyle: 1,
  tryon: 2,
  variants: 4,
  video: 10,
};

export const MONTHLY_CREDITS: Record<Exclude<Plan, "trial">, number> = {
  starter: 50,
  pro: 150,
  business: 400,
  agency: 1200,
};

export const PLAN_PRICE_EGP: Record<Exclude<Plan, "trial">, number> = {
  starter: 400,
  pro: 1000,
  business: 2500,
  agency: 6000,
};

export function creditCost(workflow: Workflow): number {
  return CREDIT_COSTS[workflow];
}

export function hasEnoughCredits(balance: number, workflow: Workflow): boolean {
  return balance >= creditCost(workflow);
}

export function monthlyGrant(plan: Exclude<Plan, "trial">): number {
  return MONTHLY_CREDITS[plan];
}

export function canChoosePaidPlan(currentPlan: Plan): boolean {
  return currentPlan === "trial";
}
```

Re-export types from `credits.ts` if tests import only from `./credits`; otherwise tests should import types from `./types`. Keep tests importing functions from `./credits` only as written.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/credits.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts lib/credits.ts lib/credits.test.ts
git commit -m "feat: add credit costs and plan grant rules"
```

---

### Task 3: Mock output picker and progress stages

**Files:**
- Create: `lib/mock-generate.ts`
- Test: `lib/mock-generate.test.ts`

**Interfaces:**
- Consumes: `Workflow` from `lib/types.ts`
- Produces:
  - `export const SAMPLE_PATHS: string[]` — `/samples/drape-1.jpg` through `/samples/drape-10.jpg`
  - `export function pickOutputPaths(workflow: Workflow): string[]`
  - `export function mockDelayMs(workflow: Workflow): number`
  - `export function progressStages(workflow: Workflow): string[]`

Rules: studio/lifestyle return 1 path; tryon return 1; variants return 4 distinct paths; video return 1 path. `mockDelayMs`: video `8000`, others `4000`. Stages: `["Removing background...", "Generating image...", "Upscaling..."]` except video last stage `"Rendering video..."`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { SAMPLE_PATHS, mockDelayMs, pickOutputPaths, progressStages } from "./mock-generate";

describe("SAMPLE_PATHS", () => {
  it("has ten /samples/drape-N.jpg files", () => {
    expect(SAMPLE_PATHS).toHaveLength(10);
    expect(SAMPLE_PATHS[0]).toBe("/samples/drape-1.jpg");
    expect(SAMPLE_PATHS[9]).toBe("/samples/drape-10.jpg");
  });
});

describe("pickOutputPaths", () => {
  it("returns one path for studio", () => {
    expect(pickOutputPaths("studio")).toHaveLength(1);
    expect(SAMPLE_PATHS).toContain(pickOutputPaths("studio")[0]);
  });
  it("returns four distinct paths for variants", () => {
    const paths = pickOutputPaths("variants");
    expect(paths).toHaveLength(4);
    expect(new Set(paths).size).toBe(4);
  });
});

describe("mockDelayMs", () => {
  it("is 8000 for video and 4000 otherwise", () => {
    expect(mockDelayMs("video")).toBe(8000);
    expect(mockDelayMs("studio")).toBe(4000);
  });
});

describe("progressStages", () => {
  it("ends with Rendering video for video", () => {
    expect(progressStages("video").at(-1)).toBe("Rendering video...");
    expect(progressStages("studio").at(-1)).toBe("Upscaling...");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/mock-generate.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Workflow } from "./types";

export const SAMPLE_PATHS = Array.from({ length: 10 }, (_, i) => `/samples/drape-${i + 1}.jpg`);

export function pickOutputPaths(workflow: Workflow): string[] {
  const count = workflow === "variants" ? 4 : 1;
  return SAMPLE_PATHS.slice(0, count);
}

export function mockDelayMs(workflow: Workflow): number {
  return workflow === "video" ? 8000 : 4000;
}

export function progressStages(workflow: Workflow): string[] {
  const last = workflow === "video" ? "Rendering video..." : "Upscaling...";
  return ["Removing background...", "Generating image...", last];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/mock-generate.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/mock-generate.ts lib/mock-generate.test.ts
git commit -m "feat: add mock sample outputs and progress stages"
```

---

### Task 4: executeGenerate service (charge on success only)

**Files:**
- Create: `lib/generate-service.ts`
- Test: `lib/generate-service.test.ts`

**Interfaces:**
- Consumes: `creditCost`, `hasEnoughCredits` from `lib/credits.ts`; `pickOutputPaths`, `mockDelayMs` from `lib/mock-generate.ts`; `Workflow`, `GenerationStatus` from `lib/types.ts`
- Produces:
  - `export type GenerateInput = { userId: string; workflow: Workflow }`
  - `export type GenerateOk = { ok: true; id: string; outputPaths: string[]; creditsUsed: number }`
  - `export type GenerateErr = { ok: false; status: 401 | 402 | 500; message: string }`
  - `export type GenerationRepo` with methods below
  - `export async function executeGenerate(repo: GenerationRepo, input: GenerateInput, options?: { fail?: boolean; now?: () => Promise<void> }): Promise<GenerateOk | GenerateErr>`

`GenerationRepo`:

```ts
export type ProfileRow = { credits: number; plan: string };

export type GenerationRepo = {
  getProfile(userId: string): Promise<ProfileRow | null>;
  insertRunning(userId: string, workflow: Workflow): Promise<{ id: string }>;
  markDone(id: string, outputPaths: string[], creditsUsed: number): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  decrementCredits(userId: string, amount: number): Promise<void>;
};
```

Behavior: no profile → `{ ok: false, status: 401, message: "Please sign in again." }`. Insufficient credits → 402 `"Not enough credits."` and **no** insert. Else insert running, await `options.now ?? delay(mockDelayMs)`, if `fail` then markFailed and do not decrement, else markDone + decrementCredits.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { executeGenerate, type GenerationRepo, type ProfileRow } from "./generate-service";
import type { Workflow } from "./types";

function fakeRepo(init: { credits: number; failInsert?: boolean }): GenerationRepo & { credits: number; rows: { id: string; status: string; creditsUsed: number }[] } {
  const state = {
    credits: init.credits,
    rows: [] as { id: string; status: string; creditsUsed: number; error?: string; paths?: string[] }[],
  };
  return {
    get credits() { return state.credits; },
    get rows() { return state.rows; },
    async getProfile(): Promise<ProfileRow | null> {
      return { credits: state.credits, plan: "trial" };
    },
    async insertRunning() {
      const id = "job-1";
      state.rows.push({ id, status: "running", creditsUsed: 0 });
      return { id };
    },
    async markDone(id, outputPaths, creditsUsed) {
      const row = state.rows.find((r) => r.id === id)!;
      row.status = "done";
      row.creditsUsed = creditsUsed;
      row.paths = outputPaths;
    },
    async markFailed(id, errorMessage) {
      const row = state.rows.find((r) => r.id === id)!;
      row.status = "failed";
      row.error = errorMessage;
    },
    async decrementCredits(_userId, amount) {
      state.credits -= amount;
    },
  };
}

describe("executeGenerate", () => {
  it("returns 402 and inserts nothing when credits are too low", async () => {
    const repo = fakeRepo({ credits: 0 });
    const result = await executeGenerate(repo, { userId: "u1", workflow: "studio" }, { now: async () => {} });
    expect(result).toEqual({ ok: false, status: 402, message: "Not enough credits." });
    expect(repo.rows).toHaveLength(0);
    expect(repo.credits).toBe(0);
  });

  it("decrements on success", async () => {
    const repo = fakeRepo({ credits: 20 });
    const result = await executeGenerate(repo, { userId: "u1", workflow: "studio" }, { now: async () => {} });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.creditsUsed).toBe(1);
      expect(result.outputPaths).toHaveLength(1);
    }
    expect(repo.credits).toBe(19);
    expect(repo.rows[0].status).toBe("done");
  });

  it("does not decrement on failure", async () => {
    const repo = fakeRepo({ credits: 20 });
    const result = await executeGenerate(
      repo,
      { userId: "u1", workflow: "video" },
      { fail: true, now: async () => {} },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(500);
    expect(repo.credits).toBe(20);
    expect(repo.rows[0].status).toBe("failed");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/generate-service.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `lib/generate-service.ts` implementing the behavior above**

Use `creditCost` / `hasEnoughCredits` / `pickOutputPaths`. Success message path returns `GenerateOk`. Failure message: `"Generation failed. Try again."`. 401 message: `"Please sign in again."`. 402 message: `"Not enough credits."`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/generate-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/generate-service.ts lib/generate-service.test.ts
git commit -m "feat: charge credits only when mock generation succeeds"
```

---

### Task 5: executeChoosePlan (once from trial)

**Files:**
- Create: `lib/choose-plan.ts`
- Test: `lib/choose-plan.test.ts`

**Interfaces:**
- Consumes: `canChoosePaidPlan`, `monthlyGrant` from `lib/credits.ts`; `Plan` from `lib/types.ts`
- Produces:
  - `export type PlanRepo = { getPlanAndCredits(userId: string): Promise<{ plan: Plan; credits: number } | null>; setPlan(userId: string, plan: Exclude<Plan, "trial">, nextCredits: number): Promise<void> }`
  - `export async function executeChoosePlan(repo: PlanRepo, userId: string, plan: Plan): Promise<{ ok: true; plan: Plan; credits: number } | { ok: false; status: 400 | 401 | 409; message: string }>`

If `plan === "trial"` → 400 `"Choose a paid plan."`. No profile → 401 `"Please sign in again."`. `!canChoosePaidPlan` → 409 `"You already have a plan."`. Else `nextCredits = current + monthlyGrant(plan)`, `setPlan`, return ok.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { executeChoosePlan, type PlanRepo } from "./choose-plan";
import type { Plan } from "./types";

function repo(plan: Plan, credits: number): PlanRepo & { plan: Plan; credits: number } {
  const state = { plan, credits };
  return {
    get plan() { return state.plan; },
    get credits() { return state.credits; },
    async getPlanAndCredits() { return { plan: state.plan, credits: state.credits }; },
    async setPlan(_id, nextPlan, nextCredits) {
      state.plan = nextPlan;
      state.credits = nextCredits;
    },
  };
}

describe("executeChoosePlan", () => {
  it("adds 150 credits and sets pro from trial", async () => {
    const r = repo("trial", 20);
    const result = await executeChoosePlan(r, "u1", "pro");
    expect(result).toEqual({ ok: true, plan: "pro", credits: 170 });
  });
  it("rejects a second paid plan", async () => {
    const r = repo("starter", 50);
    const result = await executeChoosePlan(r, "u1", "pro");
    expect(result).toEqual({ ok: false, status: 409, message: "You already have a plan." });
  });
  it("rejects trial as the chosen plan", async () => {
    const r = repo("trial", 20);
    const result = await executeChoosePlan(r, "u1", "trial");
    expect(result).toEqual({ ok: false, status: 400, message: "Choose a paid plan." });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/choose-plan.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `lib/choose-plan.ts`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/choose-plan.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/choose-plan.ts lib/choose-plan.test.ts
git commit -m "feat: allow a single mock paid-plan grant from trial"
```

---

### Task 6: UI primitives (Button, NodeTitle, Card, Logo)

**Files:**
- Create: `components/ui/button.tsx`, `components/ui/node-title.tsx`, `components/ui/card.tsx`, `components/logo.tsx`

**Interfaces:**
- Consumes: CSS variables from Task 1
- Produces:
  - `export function Button({ variant, href, className, children, ...props }: { variant?: "primary" | "outline"; href?: string } & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string })` — if `href`, render `next/link`
  - `export function NodeTitle({ lines }: { lines: string[] })`
  - `export function Card({ className, children }: { className?: string; children: React.ReactNode })`
  - `export function Logo({ className }: { className?: string })` — `next/image` or `img` src `/logo.svg` alt `Drape`

- [ ] **Step 1: Implement Button**

Primary: `bg-[var(--drape-accent)] text-[var(--drape-bg)] uppercase tracking-wider font-bold rounded-2xl h-10 px-6`. Outline: `border border-[var(--drape-accent)] text-[var(--drape-accent)] hover:bg-[var(--drape-accent)] hover:text-[var(--drape-bg)]` plus same radius/type. Both `inline-flex items-center justify-center`.

- [ ] **Step 2: Implement NodeTitle**

Each `lines` item is a mint bar: `bg-[var(--drape-accent)] text-[var(--drape-bg)] uppercase font-semibold tracking-tight px-4 py-2` stacked with `flex flex-col items-center gap-1`. Used as `h1` wrapper (`<h1 className="flex flex-col items-center">`).

- [ ] **Step 3: Implement Card and Logo**

Card: `rounded-[1.25em] border border-white/12 bg-[var(--drape-surface)]`. Logo: height 40px, `src="/logo.svg"`.

- [ ] **Step 4: Smoke-check by temporarily rendering all three on `app/page.tsx`, `npm run build`, then revert page to `<main>Drape</main>` if Task 8 has not started. Prefer leaving them unused until Task 7–8; build must still pass.

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components
git commit -m "feat: add Button, NodeTitle, Card, and Logo primitives"
```

---

### Task 7: Header, footer, announcement banner

**Files:**
- Create: `components/site-header.tsx`, `components/site-footer.tsx`, `components/announcement-banner.tsx`

**Interfaces:**
- Consumes: `Logo`, `Button` from Task 6
- Produces:
  - `export function SiteHeader({ signedIn, credits }: { signedIn: boolean; credits?: number })`
  - `export function SiteFooter()`
  - `export function AnnouncementBanner({ message }: { message: string })` — dismissible; `localStorage` key `drape-banner-v1`

Header (public): sticky `top-0 z-50`, `px-6 py-5 lg:px-[clamp(0.25rem,4vw,5rem)] lg:py-8`, `bg-[var(--drape-bg)]`. Left Logo. Center (hidden until `lg`): links `Product` → `/#workflows`, `Pricing` → `/pricing`, Unique extra-bold uppercase tracking-wider `text-sm`. Right: outline `Sign in` → `/sign-in`, primary `Get started` → `/sign-up`. Mobile: mint `size-10 rounded-xl` menu button; sheet with the same links.

Header (signedIn): replace auth CTAs with `Dashboard` → `/dashboard`, credits text `{credits} credits`, `Sign out` button (wire `onSignOut` later in Task 10; for now `formAction` placeholder `#`). Export optional `onSignOut?: () => void`.

Footer: Logo, links Product, Pricing, Terms `/terms`, Privacy `/privacy`, dim Unique text.

Banner copy (passed by landing): `Studio, try-on, and lifestyle shots from a single product photo.` Mint text on `bg-[var(--drape-surface)]`, close button.

- [ ] **Step 1: Implement the three components as specified**

- [ ] **Step 2: Commit**

```bash
git add components/site-header.tsx components/site-footer.tsx components/announcement-banner.tsx
git commit -m "feat: add sticky nav, footer, and dismissible banner"
```

---

### Task 8: Marketing pages (landing, pricing, terms, privacy)

**Files:**
- Modify: `app/layout.tsx` — wrap children with no extra chrome (pages compose header themselves)
- Modify: `app/page.tsx` — full landing
- Create: `app/pricing/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`

**Interfaces:**
- Consumes: SiteHeader, SiteFooter, AnnouncementBanner, NodeTitle, Button, Card, SAMPLE_PATHS, PLAN_PRICE_EGP, MONTHLY_CREDITS, CREDIT_COSTS
- Produces: public routes `/`, `/pricing`, `/terms`, `/privacy`

- [ ] **Step 1: Landing `app/page.tsx`**

Compose in this order:

1. `AnnouncementBanner` with the copy from Task 7 (no word “mock”).
2. `SiteHeader signedIn={false}`.
3. Hero `section` `px-6 pt-6 pb-16 lg:px-10`: `NodeTitle lines={["Studio product photos", "from a phone shot."]}`. Subtext: `Drape turns a garment photo into studio, on-model, lifestyle, color variants, and video — built for Egyptian brands selling online.` Three `Card`s with `img` `/samples/drape-1.jpg` (input), `/samples/drape-2.jpg`, `/samples/drape-3.jpg` (output) `object-cover`. CTA `Button href="/sign-up"` “Get started for free”.
4. Marquee: duplicate list `["Abayas","Kaftans","Modest wear","Street","Tailoring","Evening","Hijab","Menswear","Kids","Accessories"]` in a `overflow-hidden` row; inner `flex w-max animate-[drape-marquee_30s_linear_infinite]`. Text `uppercase tracking-wider text-[var(--drape-muted)]`.
5. Section `id="workflows"`: five bands. Each `Card` + image + blurb + `Button href="/sign-up"`:
   - Studio / `drape-4.jpg` / `Clean white-studio product shots from a handheld photo.`
   - Try-on / `drape-5.jpg` / `See the garment on model references, hijab or not.`
   - Lifestyle / `drape-6.jpg` / `Place the piece in Cairo interiors, the Nile, or the street.`
   - Video / `drape-7.jpg` / `A 15-second vertical clip for Reels and TikTok.`
   - Variants / `drape-8.jpg` / `The same piece in navy, rose, olive, and cream.`
6. How it works: three steps — `Upload a product photo` / `Pick Studio, Try-on, Lifestyle, Video, or Variants` / `Download and post`.
7. Pricing teaser: four mini cards from `PLAN_PRICE_EGP` + `MONTHLY_CREDITS`, link to `/pricing`.
8. `SiteFooter`.

Use `drape-9.jpg` and `drape-10.jpg` in how-it-works or hero extras so all ten images appear on the landing.

- [ ] **Step 2: Pricing page**

Four `Card`s: Starter 400 EGP / 50 credits / month, Pro 1000 / 150, Business 2500 / 400, Agency 6000 / 1200. Each CTA `Button href="/sign-up"` “Get started”. Note: `Trial includes 20 credits. No card required.` List credit costs: Studio 1, Lifestyle 1, Try-on 2, Variants 4, Video 10.

- [ ] **Step 3: Terms and Privacy stubs**

English placeholder: Drape is a fashion photography product. AI-generated content is owned by the user. Contact placeholder `hello@drape.example`. Header + footer.

- [ ] **Step 4: Run `npm run build`**

Expected: PASS. Open `/` later in Task 14 for visual QA.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/pricing app/terms app/privacy
git commit -m "feat: add Drape landing, pricing, and legal stub pages"
```

---

### Task 9: Supabase SQL, clients, and API adapter

**Files:**
- Create: `supabase/migrations/20260901000000_init.sql`
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `lib/supabase/adapter.ts`
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `GenerationRepo` from `lib/generate-service.ts`, `PlanRepo` from `lib/choose-plan.ts`, `Workflow` from `lib/types.ts`
- Produces: `createBrowserClient()`, `createServerClient()`, `updateSession(request)` used by `middleware.ts`; `supabaseGenerationRepo(client): GenerationRepo`; `supabasePlanRepo(client): PlanRepo`; `getUserId(client): Promise<string | null>`

- [ ] **Step 1: Write migration**

```sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'trial',
  credits integer not null default 20,
  created_at timestamptz not null default now()
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workflow text not null,
  status text not null,
  credits_used integer not null default 0,
  input_path text,
  output_paths text[] not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own generations read" on public.generations for select using (auth.uid() = user_id);
create policy "own generations insert" on public.generations for insert with check (auth.uid() = user_id);
create policy "own generations update" on public.generations for update using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, plan, credits)
  values (new.id, new.email, 'trial', 20);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Implement `@supabase/ssr` clients per current Supabase Next.js App Router docs (cookie adapter in `server.ts` and `middleware.ts`). `middleware.ts` matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `samples`, `fonts`, `logo.svg`. `updateSession` then: if path starts with `/dashboard`, `/generate`, `/results` and no user → redirect `/sign-in`; if path is `/sign-in` or `/sign-up` and user exists → redirect `/dashboard`.

- [ ] **Step 3: Implement adapter methods mapping to `profiles` and `generations` columns exactly as in the SQL. `insertRunning` sets `status` `running`. `markDone` sets `done`, `output_paths`, `credits_used`, `completed_at`. `decrementCredits` is `credits = credits - amount` (never below the check already done in executeGenerate).

- [ ] **Step 4: Document in README (create `README.md`): create a Supabase project, run the migration in SQL editor, copy URL and anon key to `.env.local`. Enable Email provider, disable confirmations for local/dev so signup lands on dashboard immediately.

- [ ] **Step 5: Commit**

```bash
git add supabase lib/supabase middleware.ts README.md
git commit -m "feat: add Supabase schema, SSR clients, and session middleware"
```

---

### Task 10: Auth pages and API routes

**Files:**
- Create: `app/sign-in/page.tsx`, `app/sign-up/page.tsx`
- Create: `app/api/generate/route.ts`, `app/api/generations/route.ts`, `app/api/generations/[id]/route.ts`, `app/api/billing/choose-plan/route.ts`
- Modify: `components/site-header.tsx` — Sign out calls `supabase.auth.signOut()` then `router.push("/")`

**Interfaces:**
- Consumes: `executeGenerate`, `executeChoosePlan`, adapters, `creditCost`
- Produces: REST as in spec

- [ ] **Step 1: Sign-up page**

Client component: email, password (min 8). Submit `supabase.auth.signUp({ email, password })`. Errors mapped:
- duplicate → `An account with this email already exists.`
- weak/short → `Use a password with at least 8 characters.`
- network → `Something went wrong. Check your connection.`
Success → `router.push("/dashboard")`. Same visual language (Card, Unique labels, mint Button). Link to sign-in.

- [ ] **Step 2: Sign-in page**

`signInWithPassword`. Invalid → `Email or password is incorrect.` Success → `/dashboard`.

- [ ] **Step 3: API `POST /api/generate`**

JSON `{ workflow: Workflow }`. `createServerClient`, `getUser()`, no user → 401 `{ message: "Please sign in again." }`. Else `executeGenerate(supabaseGenerationRepo(supabase), { userId, workflow })`. Return result status codes. Do not wait on a real upload in v1; ignore extra fields.

- [ ] **Step 4: `GET /api/generations`**

Session required. Select generations for `user_id` order `created_at desc` limit 12. 401 if logged out.

- [ ] **Step 5: `GET /api/generations/[id]`**

Session required. Single row if `user_id` matches, else 404 `{ message: "Generation not found." }`.

- [ ] **Step 6: `POST /api/billing/choose-plan`**

JSON `{ plan: Plan }`. `executeChoosePlan`. Map statuses.

- [ ] **Step 7: Commit**

```bash
git add app/sign-in app/sign-up app/api components/site-header.tsx
git commit -m "feat: add email auth pages and mock generate APIs"
```

---

### Task 11: Dashboard

**Files:**
- Create: `app/dashboard/page.tsx`, `components/credits-chip.tsx`, `components/empty-state.tsx`

**Interfaces:**
- Consumes: `GET /api/generations` shape `{ id, workflow, status, output_paths, created_at }[]`; profile `credits`, `plan`
- Produces: dashboard UI

- [ ] **Step 1: CreditsChip** — mint text ` {credits} credits ` and dim plan label (`Trial`, `Starter`, …).

- [ ] **Step 2: EmptyState** — title `No generations yet`, `Button href="/generate"` `New generation`.

- [ ] **Step 3: Dashboard page (server component)**

Load session profile + last 12 generations. `SiteHeader signedIn credits={profile.credits}`. Grid of outputs (first `output_paths[0]` or surface placeholder if `running`). Skeleton: 12 `animate-pulse` Cards if you fetch on client; server render is enough with empty vs grid. `Button href="/generate"` always visible.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard components/credits-chip.tsx components/empty-state.tsx
git commit -m "feat: add dashboard with credit chip and recent jobs"
```

---

### Task 12: Generate page

**Files:**
- Create: `app/generate/page.tsx`, `components/insufficient-credits-modal.tsx`, `components/generation-progress.tsx`

**Interfaces:**
- Consumes: `creditCost`, `progressStages`, `hasEnoughCredits`, `POST /api/generate`, `GET /api/generations/[id]`
- Produces: tabbed generate UX

- [ ] **Step 1: InsufficientCreditsModal**

Props `{ open, balance, cost, onClose }`. Text: `Not enough credits.` `You have {balance}. This job costs {cost}.` Link `/pricing`.

- [ ] **Step 2: GenerationProgress**

Props `{ stages: string[]; activeIndex: number }`. Show current stage label.

- [ ] **Step 3: Generate page (client)**

Tabs: Studio | Try-On | Lifestyle | Video | Variants. File input `accept="image/*"`; reject non-image with `Use a JPEG or PNG up to 10MB.`; reject `file.size > 10 * 1024 * 1024` with the same sentence plus size.

Options:
- Studio: radio white / grey / gradient
- Try-on: 8 buttons `Model 1` … `Model 8` (no photos required)
- Lifestyle: select Cairo interior, Nile, studio loft, street, beach
- Video: read-only `15 seconds`
- Variants: up to 4 color buttons navy, dusty rose, olive, cream (toggle)

Submit `Button`: `Generate · {n} credits`. On click, if `!hasEnoughCredits(balance, workflow)` open modal (no POST). Else POST `{ workflow }`, then poll `GET /api/generations/${id}` every 3s. Advance `activeIndex` every 1.5s through `progressStages(workflow)`. On `done` → `router.push(/results/${id})`. On `failed` show `Generation failed. Try again.` without a second charge. Client timeout 30s: show the same failed sentence.

Load `balance` from a server wrapper or `/api` profile: add `GET /api/me` returning `{ credits, plan }` from `profiles` (session required, 401 otherwise). Create that route in this task.

- [ ] **Step 4: `GET /api/me`**

Returns `{ credits, plan, email }` for the session user.

- [ ] **Step 5: Commit**

```bash
git add app/generate app/api/me components/insufficient-credits-modal.tsx components/generation-progress.tsx
git commit -m "feat: add five-tab mock generate flow with credit gating"
```

---

### Task 13: Results pages

**Files:**
- Create: `app/results/[id]/page.tsx`, `app/results/page.tsx`

**Interfaces:**
- Consumes: generation row; `creditCost`
- Produces: results grid, regenerate, dashboard link

- [ ] **Step 1: `app/results/[id]/page.tsx`**

If no session, middleware already redirected. Fetch generation by id; 404 page `Generation not found.` with link dashboard. Grid of `output_paths` images, click to open full-size (`<dialog>` or `window.open`). Download: `<a download href={path}>Download</a>`. If `workflow === "video"`, caption `Video preview (mock)` on the still. `Button` Regenerate: POST `/api/generate` with same `workflow`, then navigate to new id (charges again). `Button href="/dashboard"` outline.

- [ ] **Step 2: `app/results/page.tsx`**

Redirect to latest generation id for the user, or `/generate` if none.

- [ ] **Step 3: Wire pricing CTAs for signed-in trial users**

On `app/pricing/page.tsx`, if signed in and plan is trial, buttons call `POST /api/billing/choose-plan` with that plan then refresh dashboard. If already paid, show `You are on the {plan} plan.` without extra grant. If signed out, keep `/sign-up`.

- [ ] **Step 4: Commit**

```bash
git add app/results app/pricing
git commit -m "feat: add results viewer, regenerate, and mock plan picker"
```

---

### Task 14: Playwright E2E and visual QA

**Files:**
- Create: `playwright.config.ts`, `e2e/landing.spec.ts`, `e2e/auth-generate.spec.ts`

**Interfaces:**
- Consumes: running `next dev` and configured `.env.local` Supabase
- Produces: e2e coverage from the spec

- [ ] **Step 1: Playwright config**

`testDir: e2e`, `webServer: { command: "npm run dev", url: "http://localhost:3000" }`, `baseURL: "http://localhost:3000"`.

- [ ] **Step 2: `e2e/landing.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("landing loads hero copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Studio product photos");
  await expect(page.getByRole("link", { name: /get started for free/i })).toBeVisible();
});
```

- [ ] **Step 3: `e2e/auth-generate.spec.ts`**

Use a unique email `drape-${Date.now()}@example.com` / password `password8`. Flow: `/sign-up` → expect `/dashboard` → `getByRole('link', { name: 'New generation' })` → studio generate → expect URL `/results/` → image visible.

Second test: cannot easily drain 20 credits in one spec without looping; instead call generate until 402 by looping 21 studio jobs **or** skip if too slow. Prefer: a test that opens generate and, after mocking, checks modal by intercepting:

```ts
await page.route("**/api/generate", async (route) => {
  await route.fulfill({ status: 402, contentType: "application/json", body: JSON.stringify({ message: "Not enough credits." }) });
});
```

Then click Generate and `expect(page.getByText("Not enough credits.")).toBeVisible()`.

- [ ] **Step 4: Run e2e**

Run: `npx playwright test`
Expected: PASS (Supabase must be configured; if missing, fail with a clear skip only after documenting README — do not skip in code; engineer sets `.env.local` first).

- [ ] **Step 5: Visual QA in the browser**

Check landing vs comfy.org rhythm (sticky nav, node titles, marquee, rounded cards, mint CTAs), mobile hamburger, generate tabs, empty dashboard. Fix CSS gaps in the same commit if trivial.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e
git commit -m "test: add Playwright coverage for landing, auth, generate, and 402 modal"
```

---

## Self-review (spec coverage)

| Spec item | Task |
|-----------|------|
| Routes `/`, `/pricing`, `/sign-in`, `/sign-up`, `/dashboard`, `/generate`, `/results`, `/results/[id]`, `/terms`, `/privacy` | 8, 10, 11, 12, 13 |
| Middleware auth gates | 9 |
| Tokens, Unique, logo transparent, no Comfy yellow/plum | 1, 6, 7, 8 |
| Landing section order + English copy + 10 images | 8 |
| EGP plans and credit table | 2, 8 |
| Trial 20, charge on success, 402, once-per-account plan | 2, 4, 5, 10 |
| Five workflows, video 15s / 10 credits, mock samples | 3, 12, 13 |
| Video mock label | 13 |
| Vitest credit/API logic | 2, 3, 4, 5 |
| Playwright landing, signup, studio, 402 | 14 |
| SQL profiles/generations + trigger | 9 |
| English errors | 10, 12 |

No remaining spec gaps. Types `Workflow`, `Plan`, `executeGenerate`, `executeChoosePlan`, `GenerationRepo`, `PlanRepo` are consistent across tasks.
