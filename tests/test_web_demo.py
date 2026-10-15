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
