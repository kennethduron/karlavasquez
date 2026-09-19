# Phase 2.4A — Infrastructure preparation

## Scope guard

This phase verifies and prepares infrastructure only. Firebase Authentication
and Firestore remain the application runtime. No client data, users or legal
documents are migrated. `bufetekarlavasquez.com` is not connected and DNS is
not changed.

## Vercel transfer and deployment

- Dedicated team: `Bufete_Karla_Vasquez` (`bufete-karla-vasquez`)
- Project: `bufetekarlavasquez`
- Project ID: `prj_AQwGXTXY43sqirlBhOKRGo8sdKbC`
- Alias: `https://bufetekarlavasquez.vercel.app`
- Production deployment at the start of the phase: Ready, commit
  `e0afe27b90caa250856a13dc8adabc0f0e3df230`
- Framework: Next.js
- Root Directory: repository root (`./`, represented by an empty override)
- Node.js: `22.x`
- Git repository: `kennethduron/karlavasquez`
- Production Branch before: `feat/knv-foundation-phase-0`
- Production Branch after: `feat/knv-infrastructure-setup-phase-2-4a`

The project is no longer visible to the previously authenticated personal
Vercel CLI scope. The dedicated team dashboard owns the transferred project,
while the original production deployment and alias remain available.

## Vercel environment inventory at transfer verification

Values were not revealed.

| Variable                                   | Scope                | Type   |
| ------------------------------------------ | -------------------- | ------ |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Production / Preview | Config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Production / Preview | Config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Production / Preview | Config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Production / Preview | Config |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Production / Preview | Config |
| `FIREBASE_PROJECT_ID`                      | Production / Preview | Secret |
| `FIREBASE_CLIENT_EMAIL`                    | Production / Preview | Secret |
| `FIREBASE_PRIVATE_KEY`                     | Production / Preview | Secret |

The transfer preserved complete Firebase variable sets in both Production and
Preview. Development remains local and is intentionally not populated with
production secrets in Vercel.

## Phase 2.4A variables added in Vercel

Values were written directly from authenticated provider sessions and were not
stored in Git or local environment files.

| Variable                         | Scope      | Type   | Status                      |
| -------------------------------- | ---------- | ------ | --------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Production | Config | Configured                  |
| `NEXT_PUBLIC_SUPABASE_URL`       | Production | Config | Configured                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Production | Config | Configured                  |
| `SUPABASE_SERVICE_ROLE_KEY`      | Production | Secret | Configured                  |
| `RESEND_API_KEY`                 | Production | Secret | Configured, send-only       |
| `RESEND_FROM_NAME`               | Production | Config | Configured                  |
| `RESEND_FROM_EMAIL`              | —          | —      | Pending domain verification |
| `CLOUDINARY_CLOUD_NAME`          | Production | Config | Configured                  |
| `CLOUDINARY_API_KEY`             | Production | Config | Configured, server runtime  |
| `CLOUDINARY_API_SECRET`          | Production | Secret | Configured                  |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Production | Config | Configured                  |
| `B2_KEY_ID`                      | —          | —      | Blocked by B2 account error |
| `B2_APPLICATION_KEY`             | —          | —      | Blocked by B2 account error |
| `B2_BUCKET_NAME`                 | —          | —      | Blocked by B2 account error |
| `B2_ENDPOINT`                    | —          | —      | Blocked by B2 account error |
| `B2_REGION`                      | —          | —      | Blocked by B2 account error |

Preview received no new production-provider secrets. The existing Firebase
Preview variables were preserved for the current runtime.

## Supabase primary project

- Organization: `Karla Vasquez Tech`
- Project: `Bufete Karla Vasquez`
- Project ref: `oicqxuaztrzpvbpocwze`
- Region: East US (North Virginia), `us-east-1`
- Environment: primary Production project
- Status observed: Healthy
- Storage bucket: `legal-documents`, private
- Intended object path:
  `cases/{caseId}/documents/{documentId}/{versionId}-{safeFileName}`

Storage policies and application integration are deferred to Phase 2.4B. The
bucket has no public access and no public legal-document URLs may be created.

Auth preparation:

- Site URL: `https://bufetekarlavasquez.com`
- Allowed redirect: `https://bufetekarlavasquez.vercel.app/**`
- Allowed redirect: `https://bufetekarlavasquez.com/**`
- Email provider: enabled for future login/recovery
- Public user signup: disabled
- Anonymous sign-in: disabled
- Manual identity linking: disabled

Staff accounts will be created by an administrator. Firebase login remains
active until the coordinated Phase 2.4B cutover.

## Provider boundaries

| Responsibility                        | Provider                 | Data classification                             |
| ------------------------------------- | ------------------------ | ----------------------------------------------- |
| Auth, PostgreSQL, private legal files | Supabase                 | Confidential/restricted                         |
| Public website and editorial media    | Cloudinary               | Public only                                     |
| Push notifications                    | Firebase Cloud Messaging | Device tokens and minimal notification payloads |
| Transactional email                   | Resend                   | Contact and message delivery metadata           |
| Encrypted offsite backup              | Backblaze B2             | Restricted, encrypted/controlled                |

The application-facing contracts live in
`src/domain/integration-ports.ts`. Provider-specific SDK calls must remain in
`src/infrastructure/<provider>` and must not be called directly from UI
components.

## FCM preparation

The existing Firebase project `knv-development` is retained. Auth, Firestore,
rules and current login code must remain unchanged during this phase.

The Firebase Web App exists, FCM HTTP v1 is enabled, the legacy API remains
disabled, and a new Web Push VAPID key pair was generated. Its public key is
stored as `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in Vercel Production. Firebase Admin
credentials remain server-only. The full permission UX, service worker and
token lifecycle remain deferred.

Phase 2.4B will add the notification runtime behind `PushNotificationPort`:

1. obtain an FCM registration token using the public Firebase web config and a
   Web Push VAPID public key;
2. register `/firebase-messaging-sw.js` at root scope over HTTPS;
3. store tokens per authenticated staff user in PostgreSQL with revocation and
   last-seen metadata;
4. send from a server-only adapter using Firebase Admin credentials;
5. keep notification payloads free of privileged case or client details.

Notification permission must be requested only after a user action. The VAPID
public key is the only additional browser-visible value; Admin credentials stay
server-only.

## Environment scope policy

- Production receives production provider configuration.
- Preview receives only values required for intentional preview QA. Production
  secrets are not copied automatically.
- Development uses ignored `.env.local` values or emulators.
- `NEXT_PUBLIC_*` is limited to browser-safe identifiers and public keys.
- Supabase service role, Cloudinary API secret, Resend API key, Firebase private
  key and all B2 credentials are server-only.
- `SUPABASE_DB_URL` is omitted until database tooling actually requires it.

## Backup architecture (not yet scheduled)

Future database flow:

`Supabase PostgreSQL -> controlled export -> encryption -> private B2 bucket`

Future storage flow:

`Supabase private Storage -> object inventory -> encrypted archive/copy -> private B2 bucket`

Backups require a bucket-scoped B2 application key. The master account key is
not permitted. Schedules, retention, immutable-copy strategy and restore tests
belong to Phase 2.4B after the Supabase cutover is validated.

B2 Cloud Storage was enabled on the dedicated Backblaze account and the account
reports its data region as `US East`. Bucket creation is currently blocked by a
provider-side `Account trouble` B2 API response. No bucket or application key
was created, no master key was used, and no billing information was added.

## Connectivity checks

`npm run test:providers` performs read-only checks and reports only PASS, FAIL
or SKIPPED_NOT_CONFIGURED. It never logs credentials. Checks are harmless:

- Supabase REST schema reachability;
- Resend authenticated domain listing, without sending email;
- Cloudinary authenticated one-item resource listing, without upload;
- Backblaze B2 authorization and bucket-scope validation, without backup writes.

The script is preparatory and providers without configured local credentials
are explicitly skipped.

Authenticated dashboards independently confirmed that the Supabase project is
Healthy, Resend accepted creation of a send-only key, Cloudinary loaded the
dedicated product environment, and Firebase FCM accepted VAPID generation.
Backblaze connectivity is blocked by the account error described above.

## Deferred work

- Firebase-to-Supabase user/data cutover, PostgreSQL schema activation and RLS
- Supabase Storage policies and document integration
- Resend production sender/domain DNS and actual email delivery
- Cloudinary runtime integration and uploads
- FCM service worker, token lifecycle and notification sending
- Backblaze scheduled backups and restore tests
- custom-domain and DNS cutover
- Phase 3
