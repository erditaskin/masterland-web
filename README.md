# Masterland website

Static Turkish and English landing, privacy, support and account deletion pages.

Public directory: `public`. No framework, build command or runtime environment variables are required. The current host is the dedicated Masterland VPS at `142.93.88.194`, served through Nginx and Cloudflare. Netlify is the previous host; its configuration is retained only as a rollback reference.

Preview locally: `python3 -m http.server 8765 --directory public`.

The content is a draft. Complete and review privacy disclosures, retention periods and app behavior before public release. `robots.txt` currently blocks indexing. No application credentials belong in this repository.

## World atlas

`/atlas/` hosts the self-contained Turkish and English city, production-chain and mastery design atlas. New content is marked as a proposal in the interface.

`deploy/masterland-web-deploy` activates versioned `/opt/masterland/web/RELEASE/public` releases through an atomic `current` symlink, checks the privacy route, and restores the previous release on failure. `rollback` restores the retained prior version. Deployment notifications use only the server-side Masterland Slack webhook. TLS, firewall and database operations belong to `masterland-api/deploy`; web deployment does not alter them. Preserve all legal/support/app-ads.txt routes.

The shared header and footer are generated from `scripts/build-navigation.py`. Run
`python3 scripts/build-navigation.py` after editing site navigation and
`python3 scripts/build-navigation.py --check` before deploying. The home page is
`/`; the bilingual game guide is `/game/`.

The public Atlas shows city guides and the interactive map. The old content and
artwork tree is archived in `reference/atlas-tree.html`, outside the deployed
`public/` directory.
