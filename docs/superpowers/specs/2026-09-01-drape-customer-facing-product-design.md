# Drape — Customer-facing product (v1) design

## Background

`fashion-ai-plan.html` is a 13-week plan for an AI fashion photography SaaS (originally branded Stitch AI). This spec is the first sub-project only: the customer-facing product with mocked generation. Dataset collection, LoRA training, ComfyUI, RunPod, Shopify/Salla, Stripe/Paymob, and launch ops are out of scope.

Product name is **Drape**. Audience is Egyptian fashion brands selling online. UI language is English only (no Arabic, no RTL toggle).

## Goal

Ship a single Next.js app that (1) looks and moves like [comfy.org](https://comfy.org/) with Drape branding, and (2) lets a signed-in user click through upload → five workflow tabs → fake progress → results, with real email/password auth and persisted mock jobs.

## In scope

- Landing (`/`), pricing (`/pricing`), sign-in, sign-up
- Dashboard, generate, results (auth-gated)
- Supabase email + password auth
- Mock generate API, credit ledger, `profiles` + `generations` tables
- Design system: Unique font, logo darks + mint accent, Comfy structure/motion on marketing pages
- Stub Terms and Privacy pages
- Tests listed in Testing

## Out of scope

- Real image/video models, ComfyUI, RunPod, LoRA, dataset work
- Shopify, Salla, Stripe, Paymob, Twilio/WhatsApp, Clerk, Prisma, Redis/BullMQ
- Arabic / RTL, admin panel, product library, store connect, onboarding wizard, billing webhooks
- Copying Comfy’s logo, copy, videos, client marks (Nike, Apple, …), SVG node assets, or PP Formula font files

## Architecture

One Next.js App Router app (TypeScript, Tailwind CSS). Supabase for auth and Postgres.

### Routes

| Path | Auth | Purpose |
|------|------|---------|
| `/` | Public | Marketing landing |
| `/pricing` | Public | Four EGP plans |
| `/sign-in` | Public; redirect if session | Email + password |
| `/sign-up` | Public; redirect if session | Email + password |
| `/dashboard` | Required | Credits + recent jobs |
| `/generate` | Required | Five-tab generation UI |
| `/results` | Required | Latest or selected job outputs |
| `/results/[id]` | Required | One job’s outputs |
| `/terms`, `/privacy` | Public | Stub legal copy |

Middleware (`@supabase/ssr`): unauthenticated visits to gated routes → `/sign-in`. Authenticated visits to `/sign-in` or `/sign-up` → `/dashboard`.

### Backend (this slice)

- `POST /api/generate` — create mock job, charge on success only
- `GET /api/generations` — current user’s jobs, newest first
- `GET /api/generations/[id]` — poll status
- `POST /api/billing/choose-plan` — mock plan change (no payment)

No GPU. Outputs are files copied to `public/samples/` from `assets/landing-images/`.

## Visual design

Match comfy.org **structure, spacing, padding, scrolling, and motion**. Do not copy their assets.

### Tokens

| Token | Value | Use |
|-------|--------|-----|
| Background | `#12191B` | Page, nav |
| Surface | `#1C3331` | Cards, nodes, inputs |
| Accent | `#3EC9A8` | CTAs, node titles, links, focus, progress |
| Text primary | `#F0EFED` | Headlines, body on dark |
| Text muted | `#C2BFB9` | Secondary copy |
| Text dim | `#7E7C78` | Footer, labels |
| Destructive | `#F44336` | Form/API errors |

No Comfy yellow (`#F2FF59`) and no plum banners. Announcement banner, if present, uses mint on `#1C3331`.

### Type

- Family: **Unique** from `fonts/Unique/` (web: `fonts/Unique/Web-TT/*.woff2`). Weights Thin–Bold. Variable font optional.
- No PP Formula. Headlines that Comfy sets in PP Formula Narrow use Unique SemiBold or Bold, uppercase, tight tracking.
- Buttons and nav: Unique Bold/SemiBold, uppercase, wide tracking, `rounded-2xl`.

### Logo

- Nav and footer: `assets/logo/Print_Transparent.svg` (mint wordmark + garment mark).
- Do not recolor. Do not use `Print.svg` on the site (it has a solid `#12191B` board).

### Components

- **Button primary:** mint fill, `#12191B` label, uppercase.
- **Button outline:** mint border and label; hover fills mint.
- **Node title:** mint rectangular bars behind Unique uppercase words (CSS, not Comfy SVGs).
- **Card:** `#1C3331`, `border-white/12`, large radius (~1.25em).
- **Nav:** sticky, same padding rhythm as comfy.org (`px-6 py-5` mobile, larger on desktop). Mobile: mint hamburger, sheet menu.
- **Focus:** 3px mint ring.

### Landing images

Use only `assets/landing-images/drape-1.jpg` … `drape-10.jpg` (editorial studio and lifestyle). Hero input/output cards, feature bands, and mock generate outputs all come from this set.

## Pages

### Landing `/`

Same section order and motion language as comfy.org:

1. Optional dismissible announcement (e.g. “Studio, try-on, and lifestyle shots — mock studio open”).
2. Sticky nav: logo, Product (anchor to workflows), Pricing, outline Sign in, mint Get started.
3. Hero: node-style headline, photo cards as input/output, mint CTA “Get started for free”.
4. Marquee of **text** category names (Abayas, Modest wear, Street, Tailoring, …). No third-party logos.
5. Five workflow feature bands (image + copy + CTA).
6. How it works — three steps.
7. Pricing teaser (four mini cards) linking to `/pricing`.
8. Footer: logo, Product, Pricing, Terms, Privacy.

**Default copy (editable later)**

- Hero: “Studio product photos from a phone shot.”
- Sub: “Drape turns a garment photo into studio, on-model, lifestyle, color variants, and video — built for Egyptian brands selling online.”
- How it works: (1) Upload a product photo (2) Pick Studio, Try-on, Lifestyle, Video, or Variants (3) Download and post.
- Workflow blurbs: short, English, fashion-specific. Hero does not mention “mock” or “preview.” Generate and results may label video output as “Video preview (mock).”

### Pricing `/pricing`

Four cards, monthly, EGP:

| Plan | Price | Credits / month |
|------|-------|-----------------|
| Starter | 400 EGP | 50 |
| Pro | 1000 EGP | 150 |
| Business | 2500 EGP | 400 |
| Agency | 6000 EGP | 1,200 |

Trial: 20 credits on signup, no card. CTA on each paid card: sign up, then mock `choose-plan` (adds that month’s credits, sets `profiles.plan`). No Stripe.

Credit costs (always): studio 1, lifestyle 1, try-on 2, variants 4, video 10.

### Auth

Email + password only. Unique-styled fields, inline English errors. After sign-up → `/dashboard`.

### Dashboard

Mint credit chip (top). Recent generations grid (12). “New generation” → `/generate`. Empty: “No generations yet” + CTA. Plan name visible.

### Generate

Tabs: Studio | Try-On | Lifestyle | Video | Variants. Image upload (video tab still starts from an image). Per-tab options:

- Studio: background white / grey / gradient
- Try-on: grid of 8–12 placeholder model refs (filters can be static)
- Lifestyle: preset names (Cairo interior, Nile, studio loft, street, beach)
- Video: 15s only, cost 10 credits
- Variants: up to 4 color chips

Submit button shows credit cost. Progress: staged labels on a timer while polling. Then `/results/[id]`.

### Results

Grid of outputs, zoom, download, regenerate (charges again), link back to dashboard. Video: still from samples + “Video preview (mock)” label; no fake MP4 required.

## Data model (Supabase)

```sql
profiles (
  id uuid primary key references auth.users,
  email text,
  plan text not null default 'trial',  -- trial | starter | pro | business | agency
  credits integer not null default 20,
  created_at timestamptz default now()
)

generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  workflow text not null,  -- studio | tryon | lifestyle | video | variants
  status text not null,    -- running | done | failed
  credits_used integer not null default 0,
  input_path text,
  output_paths text[] not null default '{}',
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
)
```

RLS: users read/update only their rows. `profiles` insert on signup via trigger on `auth.users` (plan `trial`, credits `20`).

`plan` values map to monthly credit grants: starter 50, pro 150, business 400, agency 1200.

## Data flow

1. Sign up → Auth user + profile (20 credits) → dashboard.
2. Generate: client `POST /api/generate` with workflow, options, image. Server requires session, loads profile, if `credits < cost` return 402 (no row). Else insert `running`, wait 3–8s (video 8s), set `done` + sample paths, decrement credits **only on success**. Failure → `failed`, credits unchanged.
3. Client polls `GET /api/generations/[id]` every 3s; stage copy is cosmetic.
4. Dashboard/results read generations for `user_id`. Credits always from `profiles.credits`.
5. Choose plan: set `plan`, add that tier’s monthly credits (mock; can be used more than once in v1, or once per account — **once per account** to avoid infinite credits).

## Error handling

English sentences only.

- Auth: wrong password, duplicate email, network.
- Upload: non-image rejected; max 10MB.
- 402: modal with balance, cost, link to `/pricing`.
- Job failed/timeout (~30s): `failed`, retry does not double-charge.
- Expired session on API → redirect `/sign-in`.
- Empty states and skeletons as in Pages.

## Testing

Vitest for credit/API logic:

- Credit costs and 402 when insufficient
- No charge on failed jobs
- Signup profile starts at 20 credits
- Generate creates `done` row with URLs and decrements
- List returns only the current user’s jobs
- Choose-plan once: Pro → plan `pro`, +150 credits
- Auth: logged-out generate API is 401

E2E:

- Landing loads
- Sign up → dashboard
- Studio mock → results
- Insufficient credits → modal

Visual QA in browser before done: landing vs comfy.org rhythm, mobile nav, generate tabs, empty dashboard.

## Project layout (target)

```
.   (this repo root)
  app/
  components/
  lib/supabase/
  public/samples/          # copies of assets/landing-images
  public/fonts/            # Unique woff2
  supabase/migrations/
  docs/superpowers/specs/
  assets/
  fonts/Unique/
```

Keep `assets/`, `fonts/Unique/`, and this spec in the repo. `fashion-ai-plan.html` stays as reference, not product UI.

## Constraints

- English only.
- Unique font only; licensed files already in `fonts/Unique/`.
- Recreate Comfy look in original CSS/JS. No scraping or vendoring comfy.org source.
- Generation is explicitly mock until training/LoRA exist.
