# Admin Panel Audit — Art By Shahbaz

_Audit date: 2026-09-05 · Branch: `main` · Stack: Next.js 14 (App Router) + Supabase_

## 1. How the system is wired

```
ADMIN UI (client)          API ROUTES (server)              DATABASE / STORAGE          STOREFRONT (server)
/admin/products     ──►    /api/admin/products      ──►     Supabase "products"   ◄──   / , /products , /products/[slug]
/admin/gallery      ──►    /api/admin/gallery       ──►     Supabase "gallery"    ◄──   /gallery
/admin/banners      ──►    /api/admin/banners       ──►     Supabase "banners"    ◄──   / (hero)
/admin/settings     ──►    /api/admin/settings|social──►    "settings"/"social_links" ◄─ every page (header/footer/about)
/admin/reviews|faqs ──►    /api/admin/reviews|faqs  ──►     "reviews"/"faqs"      ◄──   / (home sections)
      + image files ──►    /api/admin/upload        ──►     Storage bucket "artbyshahbaz-images"
```

**Key facts:**
- Every API route uses `getSupabaseAdmin()` — the **service-role** client, which bypasses all row-level security.
- Every public page declares `export const dynamic = "force-dynamic"` → **no build caching, server-rendered on every request.** This is the reason admin edits *do* show up on the site.
- The storefront reads through `src/lib/data-store.ts › getFullSiteData()`, one `Promise.all` of 8 Supabase selects.

---

## 2. Scenario: "I change a product image — does it reflect on the home page?"

**Answer: Yes, the data flow works. It is not broken.** Step by step:

| Step | What happens | File |
|---|---|---|
| 1 | Admin opens `/admin/products`, clicks **Edit**, clicks **Upload Image** | `src/app/admin/products/page.tsx:48` |
| 2 | File is POSTed to `/api/admin/upload` (multipart). Type + 10 MB size checked. | `src/app/api/admin/upload/route.ts` |
| 3 | Saved to Storage as `products/<timestamp>-<random>.<ext>` (`upsert:false` → always a **new unique URL**), public URL returned | same |
| 4 | Client sets `editing.image_url` = new URL, shows preview | `page.tsx:56` |
| 5 | **Save Product** → `PUT /api/admin/products/<id>` with whitelisted columns incl. `image_url` | `page.tsx:60`, `.../products/[id]/route.ts` |
| 6 | Row updated in Supabase `products` (service role, `updated_at` bumped) | `[id]/route.ts:26` |
| 7 | Next visit to `/`, `/products`, `/products/<slug>` → `getFullSiteData()` re-queries Supabase → new `image_url` rendered by `next/image` | `src/app/page.tsx:10-13` |

**Where the new image appears immediately (on next page load / refresh):**
- ✅ `/products` listing — always
- ✅ `/products/<slug>` detail — always
- ⚠️ `/` home — **only if that product is one of the 6 shown.** Home shows `is_featured && is_active` products, `slice(0, 6)` (falls back to most recent active products if none are flagged featured). A non-featured product, or the 7th+ featured product, will not be visible on the home page — by design, not a bug.

**Things that can make it *look* like it didn't work (not code bugs):**
- The home tab was already open — you must reload; there is no live/websocket refresh.
- If you reuse an image URL you uploaded before, Vercel's image optimizer may serve its cached copy for ~60 s. Fresh uploads get a new filename, so this is rare.
- Any CDN/proxy placed in front of the site later could cache HTML (none configured in the repo today).

---

## 3. Section-by-section audit

| Admin section | Create | Edit | Delete | Reaches storefront? | Notes |
|---|---|---|---|---|---|
| **Products** | ✅ | ✅ | ✅ | ✅ live | Image, price, description, featured/active all propagate. Category **label** does not render (see Break #5). |
| **Categories** | ✅ | ✅ (per `[id]`) | ✅ | ✅ live | Drives the filter chips on `/` and `/products`. Filter works via `category_id`. |
| **Gallery** | ✅ | ✅ | ✅ | ✅ live (`/gallery`) | Straightforward. Deleting a row leaves the image file in Storage. |
| **Banners** | ✅ | ✅ | ✅ | ✅ live (home hero) | `is_active` is only *soft* honored — an inactive banner still shows if it's the only row (`page.tsx:21`). |
| **Reviews** | ✅ | ✅ | ✅ | ⚠️ partial | `is_visible` column exists but the home page renders reviews **unfiltered** — hidden reviews still show publicly. |
| **FAQs** | ✅ | ✅ | ✅ | ⚠️ partial | Same `is_visible` gap as reviews. |
| **Settings** | n/a | ✅ | n/a | ✅ live | Writes to newest `settings` row; auto-creates if missing. `whatsapp_number` field here is **dead** — storefront reads `social_links.whatsapp` instead. |
| **Social** | n/a | ✅ | n/a | ✅ live | WhatsApp number here is the one actually used site-wide. |

---

## 4. What is broken / risky (ranked)

### 🔴 Critical — admin has effectively no security

1. **All `/api/admin/*` routes are completely unauthenticated.** `src/middleware.ts` matcher is `["/admin/:path*"]`, which matches the *HTML pages* but **not** `/api/admin/*`. Every route handler just creates the service-role client and runs. Anyone on the internet can:
   ```
   curl -X DELETE https://yoursite/api/admin/products/<id>
   curl -X POST   https://yoursite/api/admin/products -d '{...}'
   curl -X PUT    https://yoursite/api/admin/settings  -d '{...}'
   curl -X POST   https://yoursite/api/admin/upload    -F file=@x.jpg
   ```
   The login screen only hides the dashboard UI; it protects nothing.

2. **Middleware only checks the cookie *exists*, never validates it.** It doesn't verify the JWT signature, expiry, or role. `document.cookie = "sb-access-token=x"` in a browser console gets you into every admin page.

3. **No admin allow-list / role check.** `/api/admin/login` accepts *any* valid Supabase Auth user. If the Supabase project has sign-ups enabled (default), anyone can self-register and log in.

4. **Hardcoded project URL + publishable key committed in source** — `src/app/api/admin/login/route.ts:15-19` has literal fallbacks (`immiuseedphxcbiowqck.supabase.co`, `sb_publishable_...`). `.env.local` itself is correctly gitignored.

### 🟠 Functional breaks

5. **Category name never shows on the storefront.** `getFullSiteData()` selects `categories(name)` (a nested object) but nothing flattens it to `product.category_name`. `ProductCard` (`:44`) and `/products/[slug]` (`:92`) both render `product.category_name` → always `undefined`. The category *filter* still works; the *label* is dead everywhere.

6. **Silent empty storefront if a query errors.** `safeSelect()` returns `[]` on *any* error (only `settings`/`social` fall back to demo data). The products query relies on the PostgREST embed `categories(name)`, which needs the foreign key relationship to be detectable. If that FK is missing/renamed, the entire products query fails → home and `/products` show **zero products with no visible error** (only a server log line). Same fragility for gallery/banners/reviews/faqs.

7. **Reviews / FAQs "visible" toggle is ignored publicly.** `is_visible` exists in the schema and is set on insert, but `src/app/page.tsx` renders both lists with no `.filter(x => x.is_visible)`. Hiding an item in admin won't hide it on the site.

8. **Admin session dies abruptly after ~1 hour.** Login cookie `maxAge = expires_in` (~3600s) with **no refresh-token flow** (`login/route.ts:54`). The admin gets silently bounced to `/admin/login` mid-edit and loses unsaved dialog input.

### 🟡 Minor / hygiene

9. **Orphaned Storage files.** Replacing a product/banner/gallery image uploads a new object; the old file is never deleted. Deleting a row never deletes its image. Storage grows unbounded.
10. **Duplicate WhatsApp fields** — `settings.whatsapp_number` vs `social_links.whatsapp`. Only the latter is wired to the storefront.
11. **`next.config.mjs` allows `hostname: '**'`** for `next/image` — any HTTPS host can be proxied through your image optimizer (minor abuse/cost vector).
12. **No CSRF protection** on state-changing routes (moot until #1 is fixed, then required).
13. **Content tables never `ENABLE ROW LEVEL SECURITY`** in `supabase/schema.sql` — no database-level safety net; everything trusts the API layer, which currently trusts everyone.
14. **`old/` is gitignored** but `data-store.ts` reads `old/data/data.json` as its demo fallback → that fallback is dead code in any real deployment (harmless, since Supabase is configured in prod).

---

## 5. What works well

- **Live propagation:** `force-dynamic` on every public page means all admin content edits (product fields, prices, featured/active flags, banners, gallery, settings text, social links, categories) appear on the next page load. No stale-build problem.
- Upload → Storage → public URL → DB → render chain is sound; unique filenames prevent stale-image caching.
- All CRUD is genuinely wired end-to-end to real tables — no mock data in the admin path.
- `safeSelect()` table isolation: one broken table won't blank the entire site.
- Product slug generation (`slugify(name) + Date.now().toString(36)`) avoids collisions.

---

## 6. Recommended fix order

1. **Add auth to `/api/admin/*`** — a shared `requireAdmin(req)` helper that verifies the Supabase JWT from the cookie and checks an admin allow-list (env var email list or an `is_admin` claim/table). Call it at the top of every admin route handler.
2. **Harden middleware** — actually verify the token (`supabase.auth.getUser(token)`) instead of checking presence; extend coverage or rely on the per-route guard above.
3. **Remove hardcoded Supabase URL/key** from `login/route.ts`; fail loudly if env vars are missing.
4. **Fix `category_name`** — map `row.categories?.name → category_name` in `getFullSiteData()` and the products API.
5. **Filter `is_visible`** for reviews and FAQs in `src/app/page.tsx`.
6. **Add refresh-token handling** so admin sessions survive past 1 hour.
7. Delete old Storage objects on image replace / row delete.
