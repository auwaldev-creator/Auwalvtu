# Auwntech Fullstack VTU Experience

A dark-green VTU platform covering landing, biometric onboarding, member dashboard, admin authority, and Supabase-backed security controls.

## Features
- **Landing + Auth**: ChatGPT-inspired landing, welcome-back login, Opay-style multi-step signup (Personal → Face verification → Security).
- **Biometric onboarding**: WebRTC camera capture, encrypted template upload to Supabase storage `biometrics` bucket.
- **Account generation**: Unique 10-digit Auwntech account number automatically generated and tied to user name for deposits.
- **Suspicious activity**: 4 wrong passwords lock login for 1 hour; wrong transaction PIN immediately suspends account and notifies admin.
- **Push-style alerts**: Toast stack updated on every activity (top-ups, transfers, admin adjustments).
- **Wallet + transactions**: Wallet balances, quick actions, Moniepoint-style transaction cards with balance before/after.
- **Admin console**: Sole first registrant becomes admin; can credit/debit any wallet, resolve alerts, and monitor suspensions.
- **Supabase schema**: Profiles, wallets, transactions, PIN attempts, admin alerts, plus wallet total RPC for admin metrics.

## Prerequisites
1. Node 18+
2. Supabase project with SQL editor access
3. Storage bucket named `biometrics` (private) for face templates
4. Random string for `SESSION_SECRET`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill Supabase credentials plus `SESSION_SECRET`.
3. Run the SQL in `supabase/migrations/0001_init.sql` inside Supabase.
4. Create a private storage bucket `biometrics`.
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000` and complete signup. The very first account becomes the sole admin.

## Key Folders
- `app/` – Landing, login, signup, dashboard, admin pages + API routes.
- `components/` – Notification stack, stepper, camera capture.
- `lib/` – Supabase helpers, security utilities, session handling.
- `supabase/migrations/` – Schema and helper function for wallet totals.

## Security & Suspicious Logic
- Passwords & transaction PINs hashed with bcrypt.
- Account numbers derived from phone hash + random digits.
- Login attempts tracked with `failed_login_count` and `suspended_until` timestamps.
- PIN failures trigger `admin_alerts` and 1-hour suspension immediately.
- Session cookie signed with `SESSION_SECRET`, HttpOnly + Secure.

## Notifications
- Frontend `NotificationStack` component renders push-style toasts.
- Hook it to Supabase Realtime or Pusher to broadcast real-time activities.

## Admin Workflows
- `/api/admin/funds` – credit/debit any user wallet (auth required, admin only).
- `/api/admin/overview` – aggregated wallet totals, suspensions, and alert feed.

## Next Steps
- Connect Supabase Realtime for live feeds.
- Wire mobile push (FCM/Expo) using the same alert payloads.
- Integrate actual VTU providers for airtime/data fulfillment via additional API routes.

Enjoy building with Auwntech.
