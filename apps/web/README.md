# Web App

Next.js dashboard and API surface for FOMO Firewall.

Core pages:

- `/` dashboard
- `/token/[address]` token case file

Core API routes:

- `/api/tokens/trending-risk`
- `/api/token/[address]/score`
- `/api/alerts/recent`

All Birdeye calls must happen server-side through `packages/birdeye`.
