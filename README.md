# BillEase — Ionic React Migration

This is the Ionic React version of BillEase, migrated from Next.js + Capacitor.

## What changed

| Before (Next.js) | After (Ionic React) |
|---|---|
| `NEXT_PUBLIC_` env vars | `REACT_APP_` env vars |
| `next/link` + `useRouter` | `IonRouterOutlet` + `useHistory` |
| shadcn/ui sidebar | Native `IonTabBar` (bottom tabs) |
| Custom `PageHeader` | `IonHeader` + `IonToolbar` (auto safe area) |
| `SidebarInset` with CSS safe-area hack | Just works — Ionic handles it |
| `Sheet` for add/edit | `IonModal` with bottom sheet breakpoints |
| Manual date picker | Native `IonDatetime` with `preferWheel` |

## What stayed the same (copy as-is)

- `src/lib/firebase.ts` — only changed `NEXT_PUBLIC_` to `REACT_APP_`
- `src/lib/firestore.ts` — identical logic, just removed `'use client'`
- `src/lib/types.ts` — identical
- `src/lib/api-client.ts` — identical

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp env.example .env
# Fill in your Firebase credentials — same values as your Next.js .env.local
# Just rename NEXT_PUBLIC_ → REACT_APP_
```

### 3. Run in browser

```bash
npm start
```

### 4. Build for mobile

```bash
npm run build
npx cap add ios       # First time only
npx cap add android   # First time only
npx cap sync
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

---

## File structure

```
src/
├── App.tsx                    # Root: routing + tab bar
├── theme/
│   └── global.css             # Ionic CSS variables + BillEase green theme
├── lib/
│   ├── firebase.ts            # Firebase init (unchanged)
│   ├── firestore.ts           # Firestore functions + hooks (unchanged)
│   ├── types.ts               # TypeScript types (unchanged)
│   └── api-client.ts          # AI import API (unchanged)
├── components/
│   ├── AuthProvider.tsx        # Firebase auth context
│   ├── BillListItem.tsx        # Bill card with swipe gestures
│   ├── AddBillModal.tsx        # Bottom sheet modal to add bill
│   └── EditBillModal.tsx       # Bottom sheet modal to edit bill
└── pages/
    ├── DashboardPage.tsx
    ├── BillsPage.tsx
    ├── BillImportPage.tsx      # AI import feature
    ├── CalendarPage.tsx
    ├── SavingsPage.tsx
    ├── ReportsPage.tsx
    ├── SettingsPage.tsx
    ├── ProfilePage.tsx
    └── auth/
        ├── SignInPage.tsx
        └── SignUpPage.tsx
```

---

## Key Ionic features you now get for free

- **iOS safe area** — `IonHeader`/`IonToolbar` automatically avoids the notch and status bar. No more hamburger menu being hidden behind the status bar.
- **Swipe to delete/edit** — `IonItemSliding` gives native swipe gestures on bill items
- **Bottom sheet modals** — `IonModal` with `initialBreakpoint` gives the native iOS bottom sheet feel
- **Native date picker** — `IonDatetime` with `preferWheel` uses the native wheel picker on iOS
- **Pull to refresh** — `IonRefresher` built in on every page
- **Tab bar** — Standard mobile bottom tab navigation instead of a sidebar
- **Action sheets** — `IonSelect` with `interface="action-sheet"` uses the native iOS action sheet for dropdowns
