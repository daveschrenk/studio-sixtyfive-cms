# Studio Sixtyfive Directory Platform

Multi-tenant Next.js directory platform and Studio Sixtyfive CMS. One Vercel
project serves several domains with host-isolated content, metadata, sitemaps,
robots rules, and administration.

## Live Domains

- `studiosixtyfive.com` - CMS and factory hub
- `dfwgaragedoorinstallers.com` - DFW garage-door directory
- `charlottefencecompanies.com` - Charlotte fence directory
- `dallastowingcompanies.com` - Dallas towing directory

Tenant definitions live in `lib/tenants.ts`. The CMS site registry lives in
`lib/sites-hub.ts`.

## Development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Before submitting a change, run:

```bash
npm run build
```

The production build generates hundreds of listing and city routes, so a full
build is the required release check.

## Configuration

Copy `.env.example` to `.env.local` and supply only the values needed for the
feature being tested. Never commit environment files or service-account keys.

Production secrets are stored as encrypted Vercel environment variables. The
Google Search Console integration uses a read-only service account and these
variables:

- `GSC_SERVICE_ACCOUNT_EMAIL`
- `GSC_PRIVATE_KEY`

The Sites hub reports a 28-day daily average of Search Console clicks and
impressions. Finalized data ends three days before the current date and is
cached for one hour.

## Deployment

The Vercel project is `davidschrenk-gmailcoms-projects/dfw-garage-install`.
Production deploys must pass `npm run build` before release. After deployment,
verify `https://studiosixtyfive.com/admin/sites/` and one public route on each
tenant domain.

## Source Recovery

This repository was established from the exact source retained by Vercel for
production deployment `dpl_2GL3CJb3VDvHcZ8MtfNmncPdhsdH`, created September
14, 2026. See `docs/SOURCE_RECOVERY.md` for provenance and validation details.

## Project Records

- `CHANGELOG.md` records production-facing changes.
- `docs/SOURCE_RECOVERY.md` records the repository baseline and recovery.
- The live project board is at `https://big-dir-kanban.vercel.app/`.
