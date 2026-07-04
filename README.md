# GyanNext

A premium, modern, responsive educational platform combining school learning, programming
courses and career-ready skill training — built with **React + Vite + Tailwind CSS** and
**Firebase** (Auth, Firestore, Storage).

## AI-Generated Tests, AI Doubt Assistant & Coding Tests (Cloud Function setup)

Three features need one Cloud Functions deployment (`functions/`) because they all require
private API keys that can't safely live in the browser:

1. **AI-generated MCQ tests** (`generateMcqs`) — teacher pastes text/PDF, AI drafts questions.
2. **AI Doubt Assistant** (`askDoubt`) — real tutoring chat for students, backed by Claude.
3. **Real coding tests** (`runCode`) — student code runs in an actual sandboxed judge
   (Judge0 CE) and is graded by comparing output exactly — never evaluate code in the browser.

Setup:

1. Upgrade your Firebase project to the **Blaze (pay-as-you-go) plan** — required for
   Cloud Functions with secrets and outbound network calls.
2. Install the Firebase CLI if you don't have it: `npm install -g firebase-tools`
3. Log in and select your project:
   ```bash
   firebase login
   firebase use --add
   ```
4. Get an API key from [console.anthropic.com](https://console.anthropic.com) (powers
   `generateMcqs` and `askDoubt`) and set it as a secret:
   ```bash
   firebase functions:secrets:set ANTHROPIC_API_KEY
   ```
5. Get a **free** Judge0 CE key from [rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
   (powers `runCode`) and set it as a secret:
   ```bash
   firebase functions:secrets:set RAPIDAPI_KEY
   ```
6. Install function dependencies and deploy everything:
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```
7. Don't forget Firestore and Storage rules too, since new collections/paths were added:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

If a secret isn't set yet, the relevant feature shows a clear error message in the UI
instead of failing silently — you can deploy these one at a time.

## What's fully implemented

- **Public site**: Home (hero + search, categories, featured courses, school/programming
  showcases, testimonials, FAQ, contact teaser), About, Courses catalog with search/filter,
  Course detail with curriculum accordion, Contact (form + map), multi-step Admission form
  (student + parent info, board & multi-course selection, document upload UI).
- **Auth**: Student login/register, Teacher login/register (with pending-approval state),
  hidden `/admin-login` (not linked anywhere in the nav/footer), Forgot Password, email
  verification on signup — all wired to real Firebase Authentication.
- **Student dashboard**: Overview (real — every stat and the progress chart are computed
  live), My Courses (real enrollments + real progress % + real uploaded materials), Live
  Classes (real, embedded in-site video via Jitsi — auto-fills your name), Assignments
  (real), Tests (real — both MCQ and coding tests; coding submissions run in a real sandboxed
  judge and are auto-graded by output match), Attendance (auto-marked on live class join),
  Progress Report (real), Certificates (real, downloadable PDF + public QR verification),
  AI Doubt Assistant (real — backed by Claude via a Cloud Function), Notifications (real
  announcements), Profile.
- **Teacher dashboard**: Overview, My Students (real), Create Assignment (real), Create
  Test (real — MCQ with optional AI generation, or a real auto-graded coding test), Upload
  Content (real), Live Classes (real), Submissions (real grading), Student Reports (real —
  assignment completion % and average test scores per student, computed live).
- **Admin dashboard**: Overview (real — stats, monthly signup chart, and enrollment-by-category
  chart all computed from live Firestore data), Teacher Approvals (real), Student Management
  (real), Course & Live Class Management (real enrollment counts + real scheduled classes;
  course catalog itself is static content), Announcements (real — posts appear instantly on
  student Notifications), Reports & Analytics (real — completion rate, submissions, live
  classes held, test attempts, enrollment trend, all computed live), Settings (real — saved
  to and loaded from Firestore; backup section documents the real Firebase/gcloud steps since
  that action can't run from a browser).
- **Dark mode**, glassmorphism cards, gradient brand system, mobile-first responsive layout,
  SEO meta tags, Firestore security rules, and a documented Firestore schema.

## What's intentionally stubbed (with clear TODOs in code)

Building a complete production LMS (real-time Google Meet auto-provisioning, a sandboxed
coding-test judge, server-side certificate PDF generation, payment processing, an AI backend)
is a multi-week engineering effort in itself. These pages are fully designed and wired to
realistic data shapes, with comments pointing to exactly what a backend implementation needs:

- **Google Meet links** are pasted by the teacher rather than auto-generated — production
  would call the Google Calendar API from a Cloud Function.
## What's left (small, honest gaps)

- **Google Meet auto-provisioning** was replaced entirely with an embedded Jitsi Meet room
  (see the Live Classes section above) — this was a deliberate, better fit for "join inside
  the site with your real name," not a limitation.
- **Payments** aren't implemented — course "prices" are catalog display only; enrollment is
  free/instant. Adding Razorpay/Stripe before enrollment is the natural next step if needed.
- **Custom auth claims**: role checks (teacher/admin) read the user's Firestore profile on
  every privileged action rather than using Firebase custom claims. This works correctly but
  is slightly slower than claims-based checks; fine at this scale, worth revisiting if the
  platform grows large.

Don't forget to deploy `storage.rules` alongside `firestore.rules` now that Upload Content
writes real files:
```bash
firebase deploy --only storage,firestore:rules
```
- **Contact/Admission forms** currently just show a success state — see the comments in
  `src/pages/Contact.jsx` and `src/pages/Admission.jsx` for the Firestore writes / Storage
  uploads to add.

## Tech Stack

- React 19 + Vite
- Tailwind CSS 3 (dark mode via `class` strategy)
- React Router v6
- Firebase (Auth, Firestore, Storage)
- Recharts (dashboards), lucide-react (icons), qrcode.react (certificates)

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your Firebase project credentials
npm run dev
```

### Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Email/Password**.
3. Create a **Firestore** database (production mode).
4. Enable **Storage**.
5. Copy your web app config into `.env` (see `.env.example`).
6. Deploy the security rules in `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
7. See `FIRESTORE_SCHEMA.md` for the full collection layout.
8. To create your first Super Admin: register a normal account, then manually change that
   user's `role` field to `"admin"` and `status` to `"active"` in the Firestore console —
   there's intentionally no public UI to grant admin access.

### Build & Deploy (Netlify)

```bash
npm run build
```

This repo includes `netlify.toml` with the SPA redirect rule already configured — connect
the repo to Netlify (or drag-and-drop the `dist/` folder) and set your `VITE_FIREBASE_*`
environment variables in Netlify's dashboard under Site settings → Environment variables.

## Project Structure

```
src/
  components/       Reusable UI (layout, dashboard shell, course cards, form primitives)
  pages/
    auth/            Student/Teacher/Admin login & register
    student/          Student dashboard pages
    teacher/          Teacher dashboard pages
    admin/            Admin dashboard pages
  context/          Auth & Theme React context providers
  firebase/         Firebase init + auth/firestore helper functions
  data/             Static course catalog, testimonials, FAQ, nav configs
firestore.rules      Role-based Firestore security rules
FIRESTORE_SCHEMA.md   Full collection schema reference
```

## Design System

- **Primary**: `#6C63FF` · **Secondary**: `#4F8CFF`
- **Fonts**: Poppins (display/headings), Inter (body)
- Brand gradient, glassmorphism cards, and dark mode are defined as reusable utility classes
  in `src/index.css` (`.btn-primary`, `.glass-card`, `.input-field`, etc.) and Tailwind
  tokens in `tailwind.config.js`.
