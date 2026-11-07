# CLAUDE.md - VoiceClonerWebDemo

Guidance for AI agents working in the web studio repository.

## Architecture

- `index.html` — header controls, auth modal, TTS/Library/Clone tabs, DOM ids used by tests.
- `assets/app.js` — mode switching, debounced connection checks, auth, catalog loading, synthesis, cloning.
- `assets/style.css` — dark studio theme and responsive layout.
- `tests/` — static contract tests plus DOM and JavaScript handler assertions.

## Commands

```bash
pytest tests/ -v
pytest tests/test_client_logic_and_dom.py -v
pytest tests/test_web_demo.py -v
docker build -t voicecloner-demo .
```

On Windows, use `..\.venv\Scripts\python.exe -m pytest tests/ -v` if `python` is not on PATH.

## Invariants

- Never hardcode voice counts, voice names, engine names, or API keys. Read them from the server response or DOM input.
- `updateVoiceCountDisplays()` and `fillSampleText()` are the only bindings for dynamic catalog data.
- Connection changes are debounced (400 ms) and use the sequence counter to ignore stale responses.
- API keys stay in the DOM; only the JWT access token is persisted.
- Voice mode uses `/internal/v1/*`; Gateway mode uses `/v1/*` plus JWT.
- The page must keep working when opened directly from disk and when served by nginx.

## Repository Rules

- Run `pytest tests/ -v` before committing; never push a failing suite.
- Update `README.md` for user-facing behavior and `CONTEXT.md` for architecture changes.
- Activate hooks once per clone: `git config core.hooksPath .githooks`.
- Develop on a feature branch; do not push directly to `master` without confirmation.
