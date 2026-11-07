# VoiceClonerWebDemo

Static browser studio for the Voice Cloner platform. It has no build step and can test either the inference worker directly or the full gateway flow.

## Dual-Mode Design

| | Mode 1 — Voice Server | Mode 2 — App Server |
| :--- | :--- | :--- |
| Target | `vienueTTS_server` or any compatible worker | `VoiceClonerAppServer` |
| Default URL | `http://localhost:8001` | `http://localhost:8000` |
| Auth | `X-API-Key: vtts_worker_...` | `X-API-Key: vc_live_...` + `Authorization: Bearer <JWT>` |
| Account | Not required | Register, login, profile, daily quota |
| Voices | Worker preset catalog | Gateway presets + the user's cloned voices |
| Cloning | Record → `.npz` → instant preview | Record → upload → saved to the account |
| Quota | None | Daily character limit and clone slots |

## Connection Behavior

There is no Connect button. Typing in the URL or API-key field is debounced by 400 ms, then:

1. **Health check** — an unreachable server shows `Mất kết nối Server` in red.
2. **Auth and catalog check** — a wrong key shows `Sai API Key (401/403)` in amber; success shows `Voice Server (N giọng)` or `App Server Online` in green.
3. An empty key shows `Chưa nhập API Key` in grey.

Voice lists, counts, and sample text are always read from the server response. Nothing is hardcoded.

## Features

- **TTS Studio** — text input, speed (0.5×–2.0×), pitch (−12…+12), emotion, denoise, smart pause, 48 kHz WAV playback.
- **Library** — dynamic preset catalog, cloned voices, sample preview, delete.
- **Clone Studio** — record 5–15 s, extract embedding, preview immediately, or save to the account in Gateway mode.
- **Quota bar** — daily characters and clone slots in Gateway mode.

## Running

Open `index.html` directly in a modern browser, or serve it:

```bash
docker build -t voicecloner-demo .
docker run -d -p 3000:80 --name voicecloner-demo voicecloner-demo
```

Root stack:

```bash
docker compose up -d --build demo
```

The container serves nginx on port 80; Compose maps `3000:80`.

## Deployment

`.github/workflows/deploy-pages.yml` runs the test suite and deploys to GitHub Pages on pushes to `master` or `main`.

## Security Notes

- API keys are never written to `localStorage` or hardcoded in the source; values are read from the DOM.
- Only the gateway JWT access token is persisted (`vc_user_access_token`).
- Private Network Access headers let an HTTPS GitHub Pages site reach a local HTTP server.

## Structure

```
index.html          # markup and tabs
assets/app.js       # connection, auth, TTS, library, cloning logic
assets/style.css    # theme and layout
tests/              # static contract and DOM/logic tests
```

## Testing

```bash
pytest tests/ -v
```

Enable the pre-push hook once:

```bash
git config core.hooksPath .githooks
```
