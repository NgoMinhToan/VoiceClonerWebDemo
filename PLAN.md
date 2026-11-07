# Plan: VoiceClonerWebDemo

Open work only. Git history and `CONTEXT.md` record what is already implemented.

## Current Focus

- Keep both connection modes working against the current gateway and worker contracts.
- Preserve dynamic catalog binding and zero credential storage.

## Backlog (candidates, not committed)

- Add streaming or progressive playback for long synthesis results.
- Improve mobile layout and keyboard handling for the studio and clone flows.
- Add a browser compatibility matrix for `MediaRecorder` formats.
- Expand tests for error paths (expired JWT, quota exceeded, worker 503).
- Add accessibility checks for tabs, modals, and the recording controls.

## Verification Checklist

```bash
pytest tests/ -v
```

Any UI change must keep the DOM contract tests and dynamic-catalog assertions green.
