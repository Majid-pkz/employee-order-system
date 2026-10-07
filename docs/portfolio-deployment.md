# Publish the portfolio demo for free

Use Vercel Hobby for the Next.js app and Turso Free for a separate persistent SQLite/libSQL database. These plans can cost $0/month while usage stays within their free limits. Vercel Hobby is for personal, non-commercial projects, so this setup is for the fictional portfolio demo. Review the providers' current limits before signup.

- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Turso Free plan](https://turso.tech/pricing)
- [Turso integration in Vercel Marketplace](https://vercel.com/marketplace/tursocloud/database)

## Source and review

The application redesign from PR #12 is merged into `main` in `Majid-pkz/employee-order-system`. The Vercel deployment preparation is on `portfolio/vercel-demo`. The repository's Protect Main rule requires one approving review before this follow-up can merge.

A separate Vercel demo project can deploy the prepared branch while review is pending. Set that branch as the project's production branch or deploy its exact commit through Vercel. Do not deploy the older main branch as the refreshed demo.

## Account setup

1. Use a personal Vercel Hobby account.
2. Create a **new** Turso Free database named `staff-pantry-demo`. You can use Turso directly or the Vercel Marketplace integration; select the free plan.
3. Connect that new database to a new Vercel project named `staff-pantry-demo`, using the prepared source branch.
4. Keep this project's database separate from the internal application and any other project.

No real employee data or workplace database credentials are needed. Account authorization and private values belong in the provider dashboards.

## Project settings

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root directory | Repository root |
| Node.js | 24.x |
| Install command | `npm ci --include=dev` |
| Build command | `npm run build:vercel` |
| Source branch | `portfolio/vercel-demo` while deployment review is pending |
| Plan | Hobby |
| Function region | Sydney, configured in `vercel.json` |

When `ALLOW_DEMO_SEED=true`, the first build inspects the chosen database, applies migrations and creates the fictional demo data. It rejects unrelated tables, unfamiliar employee/admin accounts, non-demo products and orders with unknown owners **before** database writes. With `ALLOW_DEMO_SEED=false`, normal builds compile the application without inspecting or changing the database.

## Environment variables

Set these in Vercel's **Production** environment for the dedicated demo project. Do not share the production database with Preview deployments.

| Variable | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | New demo database's `libsql://...` URL |
| `TURSO_AUTH_TOKEN` | Token for that new demo database |
| `AUTH_SECRET` | New random secret of at least 32 characters |
| `AUTH_TRUST_HOST` | `true` |
| `APP_TIMEZONE` | `Australia/Sydney` |
| `DEMO_MODE` | `true` |
| `ALLOW_DEMO_SEED` | `true` for the first deployment |
| `DEMO_EMPLOYEE_ID` | `DEMO001` |
| `DEMO_EMPLOYEE_PASSWORD` | Disposable demo passcode, 8–72 printable ASCII characters |
| `DEMO_ADMIN_USERNAME` | `demo-admin` |
| `DEMO_ADMIN_PASSWORD` | Long, unique private administrator password |

The application also accepts `DATABASE_URL`/`DATABASE_AUTH_TOKEN`. Use one matching URL/token pair; do not configure conflicting pairs. Marketplace-provided Turso variables work directly.

Hosted connections use the HTTP-only libSQL adapter. Vercel refuses local SQLite URLs and does not fall back to a local database when configuration is missing.

Generate the authentication secret locally:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Leave `AUTH_URL` unset on the first Vercel deployment so Auth.js can infer the HTTPS host. After Vercel assigns the final public URL, set `AUTH_URL` to that exact origin, for example `https://your-assigned-project.vercel.app`, and redeploy. Do not copy the local `http://localhost:3000` value into Vercel.

The employee demo credentials are displayed to visitors. The administrator password, authentication secret and database token stay private. Do not prefix any of these with `NEXT_PUBLIC_`.

## Publish and verify

Deploy the prepared branch. After the first successful deployment, set `ALLOW_DEMO_SEED=false` and redeploy. Later builds do not run migrations or seeding, and do not depend on finding a seeded employee during compilation.

Check `/api/health` after deployment: HTTP 200 with `status: "ok"` means the required schema is available; HTTP 503 means the database is not ready. In demo mode, this endpoint includes a connection source, hosted/local mode and a destination fingerprint. Compare these with `/deployment-health.json` from the build when diagnosing a configuration mismatch. Neither endpoint exposes database URLs, tokens or application records. A successful build alone does not verify runtime database readiness. Save an order before redeploying and confirm the same order remains afterwards.

For a future release that changes the database schema, back up the dedicated demo database and run `npm run db:prepare-demo` in an authorized environment with its matching database URL/token and `DEMO_MODE=true`, before deploying. Keep `ALLOW_DEMO_SEED=false` to apply migrations without seeding. This explicit preparation command uses the same business-data preflight before any writes. Production secrets must stay in the provider's secure environment; do not copy them into repository files.

Confirm these actions on the live URL:

1. All six product photographs load on desktop and mobile.
2. Sign in using the displayed employee demo details; place and edit an order.
3. Sign out, then confirm that order editing requires sign-in.
4. Sign in privately at `/admin`; check account management and PDF exports.
5. Close the cycle and confirm ordering stops immediately; reopen it with a future deadline.
6. Add the public URL and repository link to your portfolio.

The demo creates a cycle with a 30-day deadline. Extend the deadline or reopen the existing demonstration cycle through the private admin interface when appropriate. Do not use the demo seed to reset an existing business database.

This setup uses bundled product photos and a hosted database. No paid persistent disk or image-storage subscription is required. A custom domain is optional.
