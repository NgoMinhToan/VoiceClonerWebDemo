# Project Context: VoiceClonerWebDemo

Current state of the web studio. Git history is the changelog.

## 1. Role

A static, dependency-free HTML/CSS/JavaScript client used to exercise both layers of the platform. It does not host audio or state; every operation is a direct request to the selected server.

- Runtime: browser only (no bundler, no framework)
- Container: `nginx:alpine-slim`, served on port 80 and mapped to 3000 in Compose
- Deployment: GitHub Pages via `deploy-pages.yml`, which tests before publishing

## 2. Connection Model

- `targetMode` is `voice` or `app`, persisted in `localStorage` as `vc_target_mode`.
- Server URL and API key inputs are debounced 400 ms; each change triggers a health check and then a catalog request.
- `checkConnection()` uses a sequence counter to discard stale responses.
- The connection badge distinguishes unreachable server, invalid key, missing key, and success.
- Gateway mode adds JWT login/registration, a quota bar, and account-scoped clones.

## 3. State and Security

- `availableVoices`, `currentUser`, and recording objects live in module-level variables.
- API keys are read from the DOM on demand and are never persisted.
- The JWT access token is stored in `localStorage` under `vc_user_access_token`.
- All catalog counts, voice names, and sample text come from server payloads; no hardcoded catalog or vendor strings.

## 4. Endpoints by Mode

| Action | Voice mode | Gateway mode |
| :--- | :--- | :--- |
| Health | `GET /internal/v1/health` | `GET /health` |
| Catalog | `GET /internal/v1/voices` | `GET /v1/voices` |
| Synthesize | `POST /internal/v1/synthesize` | `POST /v1/audio/speech` |
| Preview | `POST /internal/v1/synthesize` | `POST /v1/voices/preview` |
| Embed | `POST /internal/v1/embed` | `POST /v1/voices/clone` |
| Auth | — | `/v1/auth/register`, `/login`, `/me`, `/logout` |

## 5. UI Structure

- Header: mode toggle, server URL, API key, account controls, connection badge.
- Tabs: TTS, Library, Clone.
- Authentication modal plus toast notifications; the TTS voice selector is a `<select>` populated from the catalog.
- PNA banner appears when a private-network request is blocked.

## 6. Known Constraints

- No streaming playback; synthesized audio is fetched as a complete WAV blob.
- Browser microphone recording uses `MediaRecorder`; output format depends on browser support.
- Recording length is enforced client-side before extraction.
- The pre-push hook calls bare `python`; on Windows, run tests with the root `.venv`.

## 7. Verification

```bash
pytest tests/ -v
```

Six tests cover static assets, GitHub Pages workflow, Dockerfile packaging, DOM contracts, dual-mode handler presence, and the absence of hardcoded keys or voice counts.
