from pathlib import Path

def test_web_demo_static_files():
    html_path = Path("VoiceClonerWebDemo/index.html")
    assert html_path.exists()
    html = html_path.read_text(encoding="utf-8")
    assert "Server URL" in html or "server" in html.lower()
    assert "Client API Key" in html or "api key" in html.lower()
    assert "Tổng Hợp Âm Thanh" in html or "TTS" in html

def test_github_pages_workflow():
    workflow_path = Path("VoiceClonerWebDemo/.github/workflows/deploy-pages.yml")
    assert workflow_path.exists()
    content = workflow_path.read_text(encoding="utf-8")
    assert "actions/deploy-pages" in content
    assert "actions/upload-pages-artifact" in content

def test_dockerfile_packaging():
    dockerfile_path = Path("VoiceClonerWebDemo/Dockerfile")
    assert dockerfile_path.exists()
    content = dockerfile_path.read_text(encoding="utf-8")
    assert "nginx:alpine" in content
    assert "EXPOSE 80" in content
    assert "HEALTHCHECK" in content

def test_app_js_points_to_voice_server():
    app_js_path = Path("VoiceClonerWebDemo/assets/app.js")
    assert app_js_path.exists()
    content = app_js_path.read_text(encoding="utf-8")
    assert "8001" in content
    assert "vtts_worker_secret_key_123" in content
    assert "/internal/v1/synthesize" in content
    assert "/internal/v1/voices" in content
    assert "/internal/v1/embed" in content


