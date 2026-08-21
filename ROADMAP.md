# WebChat — Build Roadmap

> Personal project for my CV: <https://quangtu224.github.io/FirstWebsite/>
> Repo: `github.com/quangtu224/Webchat`

---

## 0. Background & principles

The university version of this project (WBS — Rechnerübung, FAU) consisted of five assignments:

| Aufgabe | What the assignment covered | How we redo it here |
|---|---|---|
| 01 — Git, schlanker Client | Plain HTML client, polling `GET /savedMessages` once per second via XHR | Same idea, but with `fetch` + `async/await` |
| 02 — Pimp my Client | DOM message history, sessions via Web Storage, WebSocket (`message` / `typing` / `noLongerTyping`), Notifications API, Giphy API, XSS assessment | Keep WebSocket + typing + notifications + XSS. Giphy → optional |
| 03 — Webpack & WebRTC | Bundling with Webpack, Secret Messaging mode over PeerJS | Bundling → **Vite** (faster, less config). WebRTC → optional stretch goal |
| 04 — TypeScript & WebAssembly | Spellcheck (Typo.js) + word prediction (Rust → WASM) | **TypeScript stays (required)**. WASM → optional stretch goal |
| 05 — Chat-Server | Express + MongoDB/Mongoose + REST + `express-ws` + nginx reverse proxy + Docker Compose + OpenStack VM | Keep all of it. OpenStack → replaced by free public infrastructure + **CI/CD** |

**What makes this stronger than the coursework** (and what actually sells on a CV):
automated CI/CD, tested build & container packaging, images pushed to a registry, automated deployment, a real README and a public demo.

**Principles throughout**

1. Every phase gets **its own branch and its own pull request**, and `main` is left in a working state after every merge. See [Branching strategy](#2-branching-strategy).
2. No secrets in Git. Everything comes from environment variables.
3. Free tooling only — and at minimum, nothing that requires a credit card.
4. Every phase has a **Definition of Done (DoD)**. Do not move on until it is met.

---

## 1. Target architecture

```
                                 ┌──────────────────────────┐
   Browser                       │  Container: nginx        │
   ┌──────────┐    HTTP/WS       │  - serves static files   │
   │  Client  │ ───────────────► │  - reverse proxy /api    │
   │ (Vite/TS)│                  │  - reverse proxy /ws     │
   └──────────┘                  └───────────┬──────────────┘
                                             │ :3000
                                 ┌───────────▼──────────────┐
                                 │  Container: node         │
                                 │  Express + ws + Mongoose │
                                 └───────────┬──────────────┘
                                             │ :27017
                                 ┌───────────▼──────────────┐
                                 │  MongoDB                 │
                                 │  (container / Atlas M0)  │
                                 └──────────────────────────┘
```

This mirrors Abbildung 2 of Aufgabe 5 exactly, only the OpenStack VM is swapped for free infrastructure.

### Target directory layout

```
Webchat/
├── .github/workflows/          # CI/CD
│   ├── ci.yml
│   └── cd.yml
├── client/                     # Front-end (Vite + TypeScript)
│   ├── src/
│   │   ├── main.ts
│   │   ├── ws.ts               # WebSocket client
│   │   ├── api.ts              # REST calls
│   │   ├── ui.ts               # DOM handling
│   │   └── types.ts            # shared types
│   ├── public/
│   ├── index.html              # ← existing file, moves here
│   ├── css/style.css           # ← existing file, moves here
│   ├── vite.config.ts
│   └── package.json
├── server/                     # Back-end (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts            # server bootstrap
│   │   ├── app.ts              # Express setup
│   │   ├── config.ts           # env parsing
│   │   ├── db.ts               # Mongo connection
│   │   ├── models/message.ts   # Mongoose model
│   │   ├── routes/chat.ts      # REST routes
│   │   └── ws/hub.ts           # WebSocket hub (broadcast)
│   ├── test/
│   └── package.json
├── docker/
│   ├── nginx.conf
│   ├── Dockerfile.client
│   └── Dockerfile.server
├── docs/
│   ├── architecture.md
│   └── screenshots/
├── docker-compose.yml          # full local stack
├── .env.example
├── .gitignore
├── README.md
└── ROADMAP.md                  # this file
```

### Technology choices (all free)

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript | Required by Aufgabe 4; a strong signal on a CV |
| Client build | Vite | Replaces Webpack from Aufgabe 3 — less config, fast dev server |
| Server | Node.js 22 + Express | Same as Aufgabe 5 |
| Realtime | `ws` | Lighter than Socket.IO, closer to the raw WebSocket API of Aufgabe 2 |
| Database | MongoDB (Docker locally) + MongoDB Atlas M0 (prod) | Atlas M0 gives 512 MB free |
| ODM | Mongoose | Same as Aufgabe 5 |
| Reverse proxy | nginx | Same as Aufgabe 5 |
| Containers | Docker + Docker Compose, multi-stage builds | Project requirement |
| Registry | GitHub Container Registry (ghcr.io) | Free for public packages |
| CI/CD | GitHub Actions | Unlimited free minutes on public repos |
| Testing | Vitest + Supertest | Fast, minimal configuration |
| Lint/Format | ESLint + Prettier | Industry standard |
| Hosting | see Phase 9 | |

---

## 2. Branching strategy

**One branch per phase, one pull request per phase.** `main` must always be in a working state.

```
main ────●────────●────────●────────●────►   each ● is one merged phase
          \      / \      / \      /
           ●──●─┘   ●──●─┘   ●──●─┘          working commits inside a phase
        phase/01  phase/02  phase/03
```

### Branch names

Numbered so they sort in build order:

| Phase | Branch |
|---|---|
| 0 | `phase/00-bootstrap` |
| 1 | `phase/01-rest-polling` |
| 2 | `phase/02-server-rest` |
| 3 | `phase/03-websocket` |
| 4 | `phase/04-typescript-build` |
| 5 | `phase/05-security` |
| 6 | `phase/06-testing` |
| 7 | `phase/07-docker` |
| 8 | `phase/08-ci` |
| 9 | `phase/09-cd` |
| 10 | `phase/10-cv-polish` |

Anything outside the phase plan uses the ordinary prefixes: `fix/…`, `docs/…`, `chore/…`.

### The loop, once per phase

1. Start from an up-to-date `main` — never branch off the previous phase branch:

```bash
git switch main && git pull
```

2. Cut the branch:

```bash
git switch -c phase/01-rest-polling
```

3. Work. Commit in small steps as you go — several commits per phase is correct, not messy. Follow the commit conventions at the bottom of this file.

4. Push and open a PR against `main`:

```bash
git push -u origin phase/01-rest-polling
```

5. Before merging, check the phase's **Definition of Done**. That is what the DoD is for — it is the review checklist for your own PR.

6. Merge with `--no-ff` (see below), then clean up:

```bash
git switch main && git pull && git branch -d phase/01-rest-polling
```

7. Tick the phase off in the progress tracker below.

### Merge with a merge commit, not squash

On GitHub choose **"Create a merge commit"**, not "Squash and merge". Reason: it keeps one merge commit per phase on `main`, so

```bash
git log --first-parent main --oneline
```

prints exactly one line per phase — a clean, readable project timeline — while the detailed commits stay reachable inside each phase. Squashing throws away the working history that shows *how* you built it, which is a large part of what makes a portfolio repo interesting to read.

### Notes

- From Phase 8 onward CI runs automatically on every PR, so the branch-per-phase habit starts paying for itself there. Setting it up now means nothing has to change later.
- If a phase drags on and `main` moves ahead, rebase onto it: `git switch phase/0X-… && git rebase main`.
- Only rebase branches nobody else has pulled. Once a branch is shared, merge instead.

---

## Phase 0 — Project bootstrap ✅ (already set up for you)

**Goal:** a clean repo with conventions in place, ready to code in.

Already created: `ROADMAP.md`, `.gitignore`, `.editorconfig`, `.nvmrc`, `.env.example`, `README.md` (skeleton).

**Your steps:**

1. Cut the branch (see the branching strategy above):

```bash
git switch main && git pull && git switch -c phase/00-bootstrap
```

2. Move the existing files into `client/`:

```bash
mkdir -p client/css && git mv index.html client/index.html && git mv css/style.css client/css/style.css
```

3. Create the two packages:

```bash
cd client && npm init -y && cd ../server && npm init -y && cd ..
```

4. Commit and push:

```bash
git add -A && git commit -m "chore: restructure project into client/ and server/"
```

```bash
git push -u origin phase/00-bootstrap
```

5. Open a PR against `main`, check the DoD below, merge with a merge commit, then delete the branch.

**DoD:** `git status` is clean; opening `client/index.html` in a browser still shows the same UI.

---

## Phase 1 — Static client + REST polling (≈ Aufgabe 1)

**Goal:** understand the request/response cycle before jumping into realtime. This is exactly what Aufgabe 1 forced you to do with `XMLHttpRequest` + `setInterval`.

**Your steps:**

1. In `client/`, install Vite and TypeScript:

```bash
npm i -D vite typescript
```

2. Create `client/vite.config.ts` with a `server.proxy` entry pointing `/api` and `/ws` at `http://localhost:3000` — this keeps CORS out of your way during development.
3. Write `client/src/api.ts`: a `getMessages()` function calling `GET /api/messages`, and `postMessage(text, author)` calling `POST /api/messages`. Use `fetch` + `async/await`.
4. Write `client/src/ui.ts`: a `renderMessages(list)` function that builds DOM matching the existing `.message` / `.message--me` / `.bubble` structure in `index.html`.
5. Write `client/src/main.ts`: `setInterval(refresh, 1000)` — polling, as in Aufgabe 1.1.2. Handle the `submit` event of `form.composer`.
6. Add `<script type="module" src="/src/main.ts"></script>` to `index.html` and remove the hard-coded sample messages.

**Learning tip:** open the Network tab in DevTools and watch the HTTP status codes — that is precisely the analysis Aufgabe 1.1.1 asks for.

**DoD:** `npm run dev` works; the message list renders from a mock array (no server needed yet — mock it in `api.ts`).

---

## Phase 2 — Back end: Express + MongoDB + REST (≈ Aufgabe 5.3.1 & 5.3.2)

**Goal:** a real server with persistent data.

**Your steps:**

1. In `server/`:

```bash
npm i express mongoose dotenv helmet
```

```bash
npm i -D typescript tsx @types/express @types/node vitest supertest @types/supertest
```

2. `server/src/config.ts` — read `PORT`, `DB_URL` and `NODE_ENV` from `process.env`. **`DB_URL` must come from the environment**, exactly as Aufgabe 5.3.1 requires.
3. `server/src/models/message.ts` — Mongoose schema `{ author: String, text: String, room: String, createdAt: Date }`, exporting a `Message` model.
4. `server/src/routes/chat.ts` — an Express Router:
   - `GET /api/messages` → return the full history as JSON (the equivalent of `/savedMessages`)
   - `POST /api/messages` → accept JSON, store it in Mongo, return the saved object
   - `GET /api/health` → `{ status: "ok" }` (CI and the Docker healthcheck will use this)
5. `server/src/app.ts` wires up `helmet()`, `express.json()` and the router. `server/src/index.ts` connects to the database, then calls `listen`.
6. Run Mongo locally with Docker:

```bash
docker run -d --name webchat-mongo -p 27017:27017 -v webchat-mongo-data:/data/db mongo:7
```

7. Test with curl (Aufgabe 5.3.2 recommends the same approach, since a browser cannot easily send a JSON POST):

```bash
curl -X POST http://localhost:3000/api/messages -H "Content-Type: application/json" -d "{\"author\":\"Quang Tu\",\"text\":\"hello\",\"room\":\"general\"}"
```

8. Drop the mock in `client/src/api.ts` and point it at the real API.

**DoD:** restart the server and the data is still there (the "persistent" requirement of Aufgabe 5.3.1). The polling client displays real messages.

---

## Phase 3 — Realtime: WebSocket + typing + sessions (≈ Aufgabe 2.3, 2.4, 2.5)

**Goal:** drop polling in favour of a bidirectional channel.

**Your steps:**

1. Server: install `ws` and `@types/ws`. Write `server/src/ws/hub.ts`:
   - Attach a `WebSocketServer` to the existing HTTP server on path `/ws`
   - Define the JSON message envelope: `{ event: "message" | "typing" | "noLongerTyping", ... }` — the three event types from Aufgabe 2.4
   - `message` → store in Mongo **then** broadcast to every client (Aufgabe 5.3.3)
   - `typing` / `noLongerTyping` → broadcast only, never stored
2. Client `client/src/ws.ts`: open the connection and reconnect automatically on drop (with increasing backoff). **Do not hard-code `ws://localhost:3000`** — derive it from `location`:
   `const proto = location.protocol === "https:" ? "wss:" : "ws:"`
3. Emit `typing` when the user presses a character key; emit `noLongerTyping` after 2 seconds of inactivity (debounce) — exactly the Aufgabe 2.4 spec.
4. Show/hide the "typing…" indicator when the corresponding event arrives.
5. Simple sessions via `localStorage`: no name stored → `prompt()` for one and save it; name present → greet the user (Aufgabe 2.3).
6. On page load: call `GET /api/messages` once to load history, then rely on the WebSocket alone. Remove the `setInterval` from Phase 1.
7. (Optional) Notifications API when the window is not focused — Aufgabe 2.5. Handle the case where the user denies permission.

**DoD:** open two tabs, type in tab A → tab B updates immediately without F5. The typing indicator works. Stop and restart the server → the client reconnects on its own.

---

## Phase 4 — Strict TypeScript + production build (≈ Aufgabe 3, 4)

**Goal:** typed code, and a static artifact you can put into a container.

**Your steps:**

1. A `tsconfig.json` for each package with at least `"strict": true` (Aufgabe 4 only mandates `noImplicitAny`; we go stricter).
2. Define the WebSocket envelope types once and use them on both sides, so client and server cannot drift apart.
3. `client`: `npm run build` → produces `client/dist/` (bundled HTML + JS + CSS with hashed filenames).
4. `server`: build with `tsc` into `server/dist/`, or run TypeScript directly in production via `tsx` (simpler).
5. Add scripts to each `package.json`: `dev`, `build`, `start`, `test`, `lint`, `typecheck`.
6. Install ESLint + Prettier at the repository root and configure them for both packages.

**DoD:** `npm run typecheck` passes in both packages; `npm run build` produces a working `client/dist/index.html`.

---

## Phase 5 — Security & quality (≈ Aufgabe 2.7)

**Goal:** Aufgabe 2.7 only asks you to *assess* XSS. We assess **and** fix — and that is a genuinely good interview story.

**Your steps:**

1. Attack your own app locally: send the message `<img src=x onerror=alert(1)>`. If the alert fires, you are using `innerHTML` somewhere you should not.
2. Fix it: render message content with `textContent` (or `document.createTextNode`). Never build HTML strings from user input.
3. Validate server-side: cap `text` length (say 2000 characters) and `author` (50), reject malformed payloads. Never trust the client.
4. Enable `helmet()` with a Content-Security-Policy; add rate limiting (`express-rate-limit`) on `POST /api/messages`.
5. Write `docs/security.md` describing the **attack vectors tried**, the **results**, and the **mitigations applied**. That is your answer to Aufgabe 2.7, written up as portfolio material.

**DoD:** the XSS payload renders as plain text and does not execute. `docs/security.md` exists.

---

## Phase 6 — Testing

**Goal:** have tests so CI has something to run. CI without tests is just a build script.

**Your steps:**

1. Server (Vitest + Supertest): test `GET /api/health`, `POST /api/messages` with valid and invalid payloads, and that `GET /api/messages` returns the correct ordering.
2. Use `mongodb-memory-server` so tests do not need a real Mongo instance (CI will thank you).
3. Client: test pure functions — the timestamp formatter, the WebSocket envelope parser.
4. Set a realistic target: cover the main paths. You do not need 100 % coverage.

**DoD:** `npm test` is green in both packages and runs on a clean machine with no Mongo installed.

---

## Phase 7 — Containerization (≈ Aufgabe 5.4)

**Goal:** `docker compose up` brings up the entire system.

**Your steps:**

1. `docker/Dockerfile.server` — multi-stage:
   - `build` stage: `node:22-alpine`, `npm ci`, `npm run build`
   - `runtime` stage: `node:22-alpine`, copying only `dist/` plus production dependencies, running as a non-root user, with a `HEALTHCHECK` hitting `/api/health`
2. `docker/Dockerfile.client` — multi-stage: build with Node → copy `dist/` into `nginx:alpine`.
3. `docker/nginx.conf` — reverse proxy exactly as in Abbildung 2 of Aufgabe 5:
   - `/` → static files
   - `/api` → `http://server:3000`
   - `/ws` → `http://server:3000` plus `proxy_set_header Upgrade $http_upgrade;` and `proxy_set_header Connection "upgrade";` (**omit those two lines and WebSockets silently break** — the classic mistake)
4. `docker-compose.yml` with three services `mongo`, `server`, `nginx`; `depends_on`; a named volume for Mongo; variables read from `.env`. Containers address each other by service name (Aufgabe 5.4 notes this too).
5. Add `.dockerignore` (exclude `node_modules`, `.git`, `dist`).

```bash
docker compose up --build
```

**DoD:** `http://localhost` (port 80, not 3000) serves the full realtime chat. `docker compose down && docker compose up` → previous messages are still there.

---

## Phase 8 — CI: GitHub Actions

**Goal:** every push is checked automatically; every commit on `main` produces an image.

**Your steps:**

1. `.github/workflows/ci.yml`, triggered on `push` and `pull_request`:
   - job `quality`: checkout → `setup-node` (with npm caching) → `npm ci` → `lint` → `typecheck` → `test`
   - job `docker`: runs only if `quality` passed — builds both images as a smoke test
2. `.github/workflows/cd.yml`, triggered on pushes to `main`:
   - log in to `ghcr.io` using `GITHUB_TOKEN` (no manual secret needed)
   - build & push `ghcr.io/quangtu224/webchat-server` and `…-client`
   - tag with both `latest` and the commit SHA
   - declare `permissions: contents: read` + `packages: write` — without this you get a 403
3. Enable branch protection on `main`: require CI to pass before merging (Settings → Branches).
4. Add the CI status badge to `README.md`.

**DoD:** open a test PR → the checks run. Merge to `main` → the package appears under the repo's Packages tab.

---

## Phase 9 — CD: deployment

**Goal:** a public URL you can put on your CV.

Pick **one** route (recommended: A first, B once you are comfortable):

### A. Render — the easiest path

- Create a Web Service from the Dockerfile, or from the image on ghcr.io
- Set `DB_URL` to a MongoDB Atlas M0 cluster (free, 512 MB)
- HTTPS and a `*.onrender.com` domain come included, and WebSockets are supported
- ⚠️ The free tier sleeps after a period without traffic, so the first request takes tens of seconds. Say so in the README, or visitors will assume the app is broken.

### B. A free VM (Oracle Cloud Always Free / Google Cloud e2-micro)

This is the closest thing to Aufgabe 5.4 — you genuinely operate `docker compose` on a VM:

- Create the VM and open ports 80/443 in the firewall rules (Aufgabe 5.2.1 calls these Security Groups)
- Install Docker, `git clone`, `docker compose up -d`
- Add HTTPS with Caddy or certbot (Let's Encrypt, free)
- Automated deploys: a workflow that SSHes into the VM and runs `docker compose pull && docker compose up -d`, using the secrets `SSH_PRIVATE_KEY` and `HOST`
- ⚠️ Oracle Always Free sign-up is sometimes difficult to get approved; check current conditions before committing to this route.

> Free-tier terms change often — check the provider's current pricing page before you decide.

**Required either way:**

- Never commit secrets. Use GitHub Secrets.
- `.env.example` must list every variable (with no real values).
- Test WebSockets over real HTTPS (`wss://`) — working locally over `ws://` proves nothing about production.

**DoD:** open the public URL on your phone over mobile data (not your home wifi) and chat with your desktop.

---

## Phase 10 — Polish for the CV

**Goal:** a recruiter gives your repo about 60 seconds. Optimize for those 60 seconds.

**Your steps:**

1. `README.md` needs, in this order:
   - a one-line description + **demo link** + an animated GIF (ScreenToGif is free)
   - the CI badge
   - an architecture diagram (Mermaid — GitHub renders it inline)
   - the tech stack **and the reasoning behind each choice**
   - how to run it locally, in exactly two commands
   - what you learned / which problems you solved
2. Write a "Trade-offs & lessons learned" section — it lands better than any feature list. For example: why polling gave way to WebSockets, why Vite over Webpack, how reconnection is handled.
3. Add screenshots under `docs/screenshots/`.
4. Update <https://quangtu224.github.io/FirstWebsite/> with a project entry linking to the repo and the demo.
5. Set repository topics on GitHub: `typescript`, `websocket`, `docker`, `github-actions`, `express`, `mongodb`.

**DoD:** hand the repo to someone who knows nothing about it; within a minute they understand what it does and how to run it.

---

## Stretch goals (later, once it works end to end)

Only touch these once Phases 0–10 are done. A working build beats a pile of half-finished features.

| Feature | Source | Notes |
|---|---|---|
| Multiple chat rooms | — | The sidebar UI already exists; only the logic is missing |
| JWT + bcrypt authentication | — | Upgrade from `localStorage` sessions to real auth |
| Secret Messaging over WebRTC | Aufgabe 3.3 | PeerJS, peer-to-peer messages that never reach the server |
| Giphy integration | Aufgabe 2.6 | `@gif <keyword>`; needs a free API key; mind the rate limiting |
| Spellcheck + word prediction (WASM) | Aufgabe 4 | Rust + wasm-pack; the heaviest item, but "WebAssembly" stands out on a CV |
| End-to-end tests | — | Playwright, running in CI |

---

## Progress tracker

| Phase | Topic | Branch | Status |
|---|---|---|---|
| 0 | Project bootstrap | `phase/00-bootstrap` | ⬜ |
| 1 | Static client + REST polling | `phase/01-rest-polling` | ⬜ |
| 2 | Express + MongoDB + REST | `phase/02-server-rest` | ⬜ |
| 3 | WebSocket realtime | `phase/03-websocket` | ⬜ |
| 4 | TypeScript + build | `phase/04-typescript-build` | ⬜ |
| 5 | Security (XSS) | `phase/05-security` | ⬜ |
| 6 | Testing | `phase/06-testing` | ⬜ |
| 7 | Docker + nginx | `phase/07-docker` | ⬜ |
| 8 | CI (GitHub Actions) | `phase/08-ci` | ⬜ |
| 9 | CD (deployment) | `phase/09-cd` | ⬜ |
| 10 | CV polish | `phase/10-cv-polish` | ⬜ |

---

## Commit conventions

Use Conventional Commits so the history reads professionally — people reviewing a CV project do read `git log`:

```
feat(client): add typing indicator
fix(server): handle abrupt client disconnects
chore(ci): add typecheck step
docs(readme): add architecture diagram
```

## Time estimate

At roughly 1–2 hours a day: Phases 0–3 in about a week, Phases 4–6 in about a week, Phases 7–10 in about a week.
Phases 7 and 9 usually take longer than expected — leave slack for them.
