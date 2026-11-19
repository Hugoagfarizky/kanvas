# Security policy

## Supported versions

Kanvas is pre-1.0. Security fixes land on `main` and in the latest published build on
<https://hugoagfarizky.github.io/kanvas/>. Older commits are not maintained.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Use GitHub's private vulnerability reporting:

1. Go to the [Security tab](https://github.com/Hugoagfarizky/kanvas/security).
2. Choose **Report a vulnerability**.
3. Include reproduction steps, affected browsers, and the impact you expect.

You can expect an initial response within a few days. Once a fix is ready, we will coordinate a
disclosure date and credit you unless you prefer to stay anonymous.

## Scope

Kanvas has no backend and does not send board data anywhere. The most relevant areas are:

- cross-site scripting through pasted or imported board content
- unsafe handling of image data URLs
- dependency vulnerabilities in the production bundle
- privacy leaks through third-party requests (there should be none beyond the optional font CDN)

## Out of scope

- Data loss caused by clearing browser storage. Boards are local by design; export/import is planned.
- Issues that require a compromised browser extension or physical device access.
- Denial of service against a server, since there is no server.
