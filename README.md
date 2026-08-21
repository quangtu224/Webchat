# WebChat

> Realtime chat application: TypeScript · Express · WebSocket · MongoDB · Docker · GitHub Actions

<!-- TODO(Phase 10): add the CI badge
[![CI](https://github.com/quangtu224/Webchat/actions/workflows/ci.yml/badge.svg)](https://github.com/quangtu224/Webchat/actions/workflows/ci.yml)
-->

<!-- TODO(Phase 9): add the demo link -->
<!-- TODO(Phase 10): add a demo GIF under docs/screenshots/ -->

**🚧 Work in progress.** See [ROADMAP.md](ROADMAP.md) for the build plan and current status.

---

## Features

- [ ] Realtime messaging over WebSocket
- [ ] "Typing…" indicator
- [ ] Message history persisted in MongoDB
- [ ] Desktop notifications when the window is not focused
- [ ] XSS hardening (see [docs/security.md](docs/security.md))
- [ ] Docker packaging with an nginx reverse proxy
- [ ] Automated CI/CD via GitHub Actions

## Architecture

<!-- TODO(Phase 10): replace with a Mermaid diagram -->

```
Browser  ──HTTP/WS──►  nginx  ──►  Node (Express + ws)  ──►  MongoDB
```

## Running locally

Requires Docker and Docker Compose.

```bash
cp .env.example .env
```

```bash
docker compose up --build
```

Then open <http://localhost>.

## Development

<!-- TODO(Phase 1-2): fill in once both packages exist -->

```bash
cd server && npm run dev
```

```bash
cd client && npm run dev
```

## Tech stack and rationale

<!-- TODO(Phase 10): write this section — it is the part recruiters actually read -->

## Trade-offs & lessons learned

<!-- TODO(Phase 10): why polling gave way to WebSockets, why Vite over Webpack, how reconnection is handled -->

---

Author: Quang Tu Dinh · [Portfolio](https://quangtu224.github.io/FirstWebsite/)
