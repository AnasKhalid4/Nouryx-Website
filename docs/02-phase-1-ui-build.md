# Nouryx Website — Phase 1: Complete UI + Navigations

Build the full Nouryx website UI with all pages, navigation, and bilingual content data files — no Firebase/backend integration yet, just pixel-perfect UI inspired by Fresha with Nouryx's warm beige color scheme.

---

## DESIGN SYSTEM

| Token | Value |
|---|---|
| **Primary** | `#C9AA8B` (warm gold/beige — buttons, accents, CTAs) |
| **Primary Dark** | `#B8956F` (hover state) |
| **Primary Light** | `#E8D5C0` (subtle backgrounds) |
| **Hero Gradient** | Animated cycling purple/pink radial gradients (Fresha-style) |
| **Background** | `#FAFAF8` (off-white, warm) |
| **Surface** | `#FFFFFF` |
| **Text Primary** | `#1A1A1A` |
| **Text Secondary** | `#6B6B6B` |
| **Border** | `#E5E5E5` |
| **Heading Font** | Public Sans (semibold/bold) |
| **Body Font** | Montserrat (regular/medium) |
| **Radius** | Cards: 12px, Buttons: 8px, Inputs: 8px |
| **Shadows** | Minimal — only subtle `0 1px 3px rgba(0,0,0,0.04)` on cards |

**Style Rules:**
- Clean, minimalistic, professional — NO heavy shadows
- Generous whitespace between sections
- Cards: very light border OR extremely subtle shadow, not both
- Buttons: solid `#C9AA8B` with white text, hover `#B8956F`
- Outline buttons: `#C9AA8B` border + text, transparent bg

---

## PAGES BUILT (ALL COMPLETE ✅)

### 1. PUBLIC PAGES

#### Home Page (`/`) ✅
Sections (top to bottom):
1. **Header** — Logo left, nav links (Home, Salons, Pricing, About Us), language toggle (FR/EN), Login + "List Your Business" buttons right. Transparent on hero, solid on scroll.
2. **Hero Section** — Animated cycling purple/pink gradients (Fresha-style). Heading, subtitle, search bar, stats counter.
3. **Featured Salons** — Grid of salon cards with animated gradient background. Image, name, rating, city, category.
4. **For Business Section** — Split layout: Left text + bullet points, Right: bookings.png image.
5. **Advantages Section** — Full background image (advantage.webp) with parallax effect, dark overlay, feature cards.
6. **Stats Section** — Big numbers with gold accent color.
7. **Reviews Section** — Full background image (reviews.jpg) with parallax effect, testimonial quotes.
8. **Download App Section** — Split: Left text + app store badges, Right: download.jpg image.
9. **Footer** — Newsletter signup, sitemap columns, large stylized "nouryx®" text.

#### Pricing Page (`/pricing`) ✅
- Hero: "Software that grows with your business"
- Single plan card: €29.99/month, 2-month free trial badge
- Features list with checkmarks
- CTA: "Start Free Trial"

#### About Us (`/about`) ✅
- Company story, mission, values
- Stats section
- Team/vision section

#### Salons Listing (`/salons`) ✅
- Search bar + filters (category, location, rating)
- Grid of salon cards
- Pagination

#### Salon Detail (`/salon/[id]`) ✅
- Full-width image carousel (Fresha-style)
- Salon info (name, rating, address, description)
- Tabbed: Services | Reviews
- Services grouped by category, selectable
- Floating bottom bar: selected count + total + "Book Now"

### 2. AUTH PAGES

#### Login (`/login`) ✅
- Split layout: Left form, Right decorative image
- Email + password fields
- "Forgot Password?" link
- Login button

#### Sign Up (`/signup`) ✅
- Matching login design (left form, right image)
- Client + Salon Owner tabs
- Multi-step salon signup

#### Forgot Password (`/forgot-password`) ✅
- Email input + Send Reset Link button

### 3. USER PAGES

#### User Bookings (`/bookings`) ✅
- Tabs: In Process | Completed | Cancelled
- Booking cards with salon image, name, date, time, status badge, price

#### Booking Flow (`/booking`) ✅
- Full-width calendar date picker
- Time slot grid
- Summary: services, date, time, price, notes
- Confirm button

#### User Profile (`/profile`) ✅
- Avatar, name, email, phone
- Links: Edit Profile, Favorites, Notifications, Chat, Settings

#### Edit Profile (`/profile/edit`) ✅
#### Favorites (`/profile/favorites`) ✅
#### User Settings (`/profile/settings`) ✅
#### Notifications (`/notifications`) ✅

#### Chat List (`/chat`) ✅
- WhatsApp desktop style split view

#### Chat Thread (`/chat/[id]`) ✅
- Message bubbles, image messages, input bar

### 4. SALON DASHBOARD PAGES

#### Dashboard Home (`/dashboard`) ✅
- Stats cards: Total Orders, Completed, Rating, Earnings
- Today's bookings list
- Full-width centered layout

#### Salon Bookings (`/dashboard/bookings`) ✅
- Full calendar view with colored appointment blocks
- Tabs: Pending | In Process | Completed | Cancelled

#### Booking Detail (`/dashboard/bookings/[id]`) ✅
#### Salon Profile (`/dashboard/profile`) ✅
#### Manage Services (`/dashboard/services`) ✅
#### Salon Settings (`/dashboard/settings`) ✅
#### Subscription (`/dashboard/subscription`) ✅

---

## FOLDER STRUCTURE (Phase 1)

```
nouryx-web/
├── public/
│   └── images/
│       ├── advantage.webp
│       ├── reviews.jpg
│       ├── bookings.png
│       └── download.jpg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home
│   │   ├── globals.css
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   ├── salons/page.tsx
│   │   ├── salon/[id]/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── booking/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   ├── edit/page.tsx
│   │   │   ├── favorites/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── bookings/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── services/page.tsx
│   │       ├── settings/page.tsx
│   │       └── subscription/page.tsx
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── ui/              # shadcn/ui components (19 components)
│   │   └── home/            # HeroSection, FeaturedSalons, StatsSection, ReviewsSection, etc.
│   ├── data/
│   │   ├── content.en.ts
│   │   ├── content.fr.ts
│   │   ├── mock-salons.ts
│   │   └── mock-bookings.ts
│   ├── lib/
│   │   └── utils.ts
│   └── hooks/
│       └── use-locale.ts
```

---

## UI ENHANCEMENTS APPLIED

1. **Animated gradient hero** — 3 cycling purple/pink gradients (Fresha-style)
2. **Gradient extends into header** — Transparent header on hero, solid white on scroll
3. **Featured salons gradient** — Animated gradient background matching hero
4. **Parallax backgrounds** — advantage.webp and reviews.jpg with `background-attachment: fixed`
5. **Fresha-style footer** — Newsletter, sitemap columns, giant "nouryx®" brand text
6. **WhatsApp-style chat** — Split view with conversation list + thread
7. **Full-width dashboard** — All dashboard pages centered with generous spacing
8. **Public Sans headings** — For all bold headings
9. **Montserrat body** — For all body text
10. **Real images** — bookings.png, download.jpg, advantage.webp, reviews.jpg

---

## STATUS: PHASE 1 COMPLETE ✅

All 24 pages built with mock data, bilingual FR/EN content, responsive design, and Fresha-inspired UI. Ready for Phase 2 (Firebase integration).
