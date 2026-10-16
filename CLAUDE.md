# CLAUDE.md - VoiceClonerWebDemo

Guidance for Claude Code and AI agents working on `VoiceClonerWebDemo`.

## Project Overview
`VoiceClonerWebDemo` is a pure static web studio client (HTML5, Tailwind CSS, JavaScript) deployable to GitHub Pages or served via Docker `nginx:alpine`.

- **Port**: 3000 (when running via Docker)
- **Dual-Mode Architecture**:
  - Mode 1: Direct Voice Server connection (port 8001, `vtts_worker_...` API key, instant `.npz` cloning without DB/auth).
  - Mode 2: App Server Gateway connection (port 8000, `vc_live_...` client key, User JWT login, quota bar, database clone storage).
- **Dynamic Catalog**: Automatically adapts to any connected voice server. Never hardcode voice counts or engine strings.

---

## Mandatory Developer & AI Agent Rules

### 0. Initial Repository Setup
When opening or cloning this repository, ensure pre-push verification hooks are active:
```bash
git config core.hooksPath .githooks
```

### 1. Test Verification Before Push
**Rule:** You MUST run and pass all test suites before making any git commit or push:
```bash
pytest tests/ -v
```

### 2. Documentation Synchronization
**Rule:** Whenever modifying UI layout, JavaScript methods, or connection logic, you MUST update:
- `PLAN.md`: Keep testing checklist and mode specifications current.
- `README.md`: Keep deployment guides and user manual current.

### 3. Server-Agnostic Design
- Never hardcode specific voice counts (e.g. "23 giọng") or engine model names in UI labels or subtitles.
- Use `updateVoiceCountDisplays()` and `fillSampleText()` to bind dynamically to the server's response.

---

## Testing Commands
```bash
# Run full test suite
pytest tests/ -v

# Run client logic and DOM tests
pytest tests/test_client_logic_and_dom.py -v

# Run static files and dual-mode contract tests
pytest tests/test_web_demo.py -v
```
