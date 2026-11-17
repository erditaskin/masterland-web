# Masterland web

This is the existing static public website, migrated with its Git history. Preserve its design and Turkish/English legal, support, deletion and app-ads.txt routes. Do not introduce a framework or a login form for an infrastructure migration.

Deploy to the user-owned Masterland VPS at `142.93.88.194`, using Nginx, versioned releases and TLS. Do not deploy to Netlify or create another hosted Site. Secrets never belong in `public/` or Git. The API is a separate service at `api.masterland.app`.

Validate internal links, public routes, HTTP headers and actual browser layout after changes. Static screenshots do not verify provider acceptance.
