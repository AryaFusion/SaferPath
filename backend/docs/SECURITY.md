# Security and release-gate notes

## Threat model and controls

| Asset / threat | Control | Residual risk |
|---|---|---|
| Route/trip ownership, IDOR | Server-side session ownership checks, state machines, expiry, and idempotency constraints | The present backend uses opaque session references rather than a full account identity provider. Deploy behind an authenticated session issuer. |
| Sharing-link forwarding or stalking | High-entropy token hashing, expiry, revocation, scope-filtered polling/SSE, request rate limiting | A recipient can forward an active link; revoke immediately when suspected. |
| Evidence malware or IDOR | Owner checks, short-lived hashed authorization, MIME/signature/size checks, quarantine and fail-closed scanning | Production requires real object storage and malware scanning. |
| Provider SSRF/compromise | Server-configured HTTPS hosts only, no credentials/nonstandard ports, bounded reads/timeouts, schema normalization | DNS/network egress controls remain a deployment responsibility. |
| Operator analytics exposure | Separate audit records, HMAC subject references, consent gate, aggregate threshold, operator token | Use SSO/RBAC in front of the internal operator API. |
| Token/location leakage | No request-body logging, redacted events, route-template logs, restricted fields, retention | Reverse proxies and deployment logs must preserve redaction policy. |
| Resource exhaustion/report abuse | Request-body cap, bounded schemas/replay, global rate limit, bounded SSE replay/date ranges | Use shared Redis-backed limits and WAF controls for multi-instance production. |

## Production configuration

`APP_ENV=production` (or `release`) rejects debug mode, demo mode, fixture weather, non-HTTPS CORS origins, local/wildcard trusted hosts, the default analytics secret, and short/missing analytics operator secrets. Configure TLS termination, HTTPS-only origins, reverse-proxy body/connection limits, trusted hosts, and private metrics collection. Cookie CSRF controls are not implemented because this API currently uses request/session references rather than cookie authentication; do not introduce cookie authentication without CSRF, Secure, HttpOnly, and SameSite protections.

## Data inventory and retention

Route requests/routes, reports, evidence, trip sessions/events, grants, handoffs, and analytics have their documented retention timestamps and owner-scoped access. Evidence is restricted/quarantined; location is transient and is not an analytics dimension. Analytics is optional, consent-gated, HMAC-subject keyed, and deleted for linkable privacy requests; anonymous analytics cannot be re-linked. Audit events are separate governance data. Help points and normalized public signals are public infrastructure data. Job runs are operational records.

## Incident and recovery

For account/session or sharing-link compromise: revoke grants/sessions, preserve redacted audit evidence, and rotate affected secrets. For evidence/provider/database compromise: isolate the integration, rotate credentials, preserve audit trails, and communicate only verified handoff/provider states. Escalate abnormal analytics access as a privileged-access incident.

Local PostgreSQL/PostGIS recovery was verified on 2026-09-19: `saferpath` was dumped with `pg_dump -Fc`, restored into the isolated `saferpath_restore` database, and verified with `PostGIS_Version()` (3.5), Alembic metadata, and representative identity/tenant counts. Migration downgrade is not a production recovery mechanism; restore from the pre-deploy backup instead. Production disaster recovery remains an operational deployment responsibility and has not been independently verified in this development environment.

## Residual-risk register

1. **Authentication identity provider absent (high):** opaque session references are a development boundary, not a complete account-takeover defense. Owner: platform/security. Status: required before internet-facing account deployment.
2. **No tenant/partner model exists (medium):** tenant isolation cannot be meaningfully tested until tenant identities and roles are introduced. Owner: platform. Status: explicit architecture dependency.
3. **Single-process rate limits (medium):** use a shared backing store/WAF before horizontally scaled production. Owner: SRE. Status: deployment requirement.
4. **External providers (medium):** availability and DNS/egress restrictions remain operational controls. Owner: SRE. Status: enforce firewall/DNS allowlists at deployment.
