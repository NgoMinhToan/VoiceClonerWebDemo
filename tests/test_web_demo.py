from pathlib import Path


def get_project_file(rel_path: str) -> Path:
    clean_path = rel_path
    if clean_path.startswith("VoiceClonerWebDemo/") or clean_path.startswith("VoiceClonerWebDemo\\"):
        clean_path = clean_path[len("VoiceClonerWebDemo/"):]

    candidates = [
        Path("VoiceClonerWebDemo") / clean_path,
        Path(clean_path),
        Path(__file__).resolve().parent.parent / clean_path,
    ]
    for c in candidates:
        if c.exists():
            return c
    return Path("VoiceClonerWebDemo") / clean_path


def test_web_demo_static_files():
    html_path = get_project_file("index.html")
    assert html_path.exists()
    html = html_path.read_text(encoding="utf-8")
    assert "Voice Server" in html
    assert "App Server" in html
    assert "Dual-Mode" in html
    assert "Tổng Hợp Âm Thanh" in html
    # Assert no hardcoded 23 voices in subtitle
    assert "23 giọng" not in html


def test_github_pages_workflow():
    workflow_path = get_project_file(".github/workflows/deploy-pages.yml")
    assert workflow_path.exists()
    content = workflow_path.read_text(encoding="utf-8")
    assert "actions/deploy-pages" in content
    assert "actions/upload-pages-artifact" in content


def test_dockerfile_packaging():
    dockerfile_path = get_project_file("Dockerfile")
    assert dockerfile_path.exists()
    content = dockerfile_path.read_text(encoding="utf-8")
    assert "nginx:alpine" in content
    assert "EXPOSE 80" in content
    assert "HEALTHCHECK" in content


def test_app_js_dual_mode_and_dynamic_discovery():
    app_js_path = get_project_file("assets/app.js")
    assert app_js_path.exists()
    content = app_js_path.read_text(encoding="utf-8")
    # Mode 1: Voice Server
    assert "8001" in content
    assert "/internal/v1/synthesize" in content
    assert "/internal/v1/embed" in content
    # Mode 2: App Server Gateway
    assert "8000" in content
    assert "/v1/auth/login" in content
    assert "/v1/auth/me" in content
    assert "/v1/voices/clone" in content
    # Dynamic functions & reactive connection
    assert "updateVoiceCountDisplays" in content
    assert "fillSampleText" in content
    assert "debounce" in content
    assert "23 giọng" not in content

    # Security & reactive credentials: No default keys or credential localStorage
    assert "vtts_worker_secret_key_123" not in content
    assert "vc_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" not in content
    assert "vc_voice_api_key" not in content
    assert "vc_client_api_key" not in content
