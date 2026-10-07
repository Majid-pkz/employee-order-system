# Publish the portfolio demo for free

Use Vercel Hobby for the Next.js app and Turso Free for a separate persistent SQLite/libSQL database. These plans can cost $0/month while usage stays within their free limits. Vercel Hobby is for personal, non-commercial projects, so this setup is for the fictional portfolio demo. Review the providers' current limits before signup.

- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Turso Free plan](https://turso.tech/pricing)
- [Turso integration in Vercel Marketplace](https://vercel.com/marketplace/tursocloud/database)

## Source and review

The prepared source is on `portfolio/verified-orders-refresh` in `Majid-pkz/employee-order-system`. PR #12 has passed application checks. The repository's Protect Main rule requires one approving review; main can be updated after that review.

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
| Source branch | `portfolio/verified-orders-refresh` while PR review is pending |
| Plan | Hobby |
| Function region | Sydney, configured in `vercel.json` |

The build first inspects the chosen database, then applies migrations and optionally creates the fictional demo data. It rejects unrelated tables, unfamiliar employee/admin accounts, non-demo products and orders with unknown owners **before** database writes.

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

Generate the authentication secret locally:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Leave `AUTH_URL` unset on the first Vercel deployment so Auth.js can infer the HTTPS host. After Vercel assigns the final public URL, set `AUTH_URL` to that exact origin, for example `https://your-assigned-project.vercel.app`, and redeploy. Do not copy the local `http://localhost:3000` value into Vercel.

The employee demo credentials are displayed to visitors. The administrator password, authentication secret and database token stay private. Do not prefix any of these with `NEXT_PUBLIC_`.

## Publish and verify

Deploy the prepared branch. After the first successful deployment, set `ALLOW_DEMO_SEED=false` and redeploy. Later builds continue to apply new migrations but skip demo seeding.

Confirm these actions on the live URL:

1. All six product photographs load on desktop and mobile.
2. Sign in using the displayed employee demo details; place and edit an order.
3. Sign out, then confirm that order editing requires sign-in.
4. Sign in privately at `/admin`; check account management and PDF exports.
5. Close the cycle and confirm ordering stops immediately; reopen it with a future deadline.
6. Add the public URL and repository link to your portfolio.

The demo creates a cycle with a 30-day deadline. Extend the deadline or reopen the existing demonstration cycle through the private admin interface when appropriate. Do not use the demo seed to reset an existing business database.

This setup uses bundled product photos and a hosted database. No paid persistent disk or image-storage subscription is required. A custom domain is optional.
