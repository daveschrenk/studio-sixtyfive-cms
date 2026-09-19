# Source Recovery Record

## Why Recovery Was Necessary

The local project copy available on September 18, 2026 was older than the code
running in production. The production deployment contained newer listing
detail routes, the Dallas towing tenant, factory controls, review ingestion,
and tenant-aware sitemap behavior. There was no Git repository connected to
the Vercel project.

## Recovery Source

- Vercel team: `davidschrenk-gmailcoms-projects`
- Vercel project: `dfw-garage-install`
- Project ID: `prj_HAlIZJpActFEm8wPeiBehhDNnF1L`
- Baseline deployment: `dpl_2GL3CJb3VDvHcZ8MtfNmncPdhsdH`
- Baseline deployment date: September 14, 2026
- Recovered files: 200

Files were read from Vercel's retained deployment-file API. Top-level Vercel
source packaging was normalized back into the application directory without
altering application content.

## Validation

After recovery, dependencies were installed and the complete Next.js production
build passed. The baseline included 486 generated pages plus dynamic admin and
API routes.

The September 18 Search Console integration was then applied to the recovered
source, built locally, deployed through Vercel, and visually verified on the
production CMS. The final deployment preserved all four domains and existing
factory, listing, review, sitemap, and contact behavior.

## Security

No Vercel token, Google service-account key, CMS password, email API key, or
Blob token is stored in this repository. Secret values remain in Vercel's
encrypted environment-variable store. Local `.env` files, service-account JSON
files, `.vercel`, build output, and dependencies are excluded by `.gitignore`.

## Canonical Source Going Forward

The private GitHub repository
`https://github.com/daveschrenk/studio-sixtyfive-cms` is the canonical source.
Its `main` branch is connected to the existing Vercel project. Future
production changes should be committed here and deployed from a reviewed
commit. Recovering deployment files from Vercel should be treated as an
emergency procedure, not the normal development workflow.
