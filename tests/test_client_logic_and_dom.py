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


def test_dom_modal_and_controls_structure():
    html_path = get_project_file("index.html")
    assert html_path.exists()
    content = html_path.read_text(encoding="utf-8")

    # Mode buttons
    assert 'id="modeBtnVoice"' in content
    assert 'id="modeBtnApp"' in content

    # Reactive connection inputs in header
    assert 'id="inputServerUrl"' in content
    assert 'id="inputApiKey"' in content
    assert 'id="connectionBadge"' in content
    assert 'id="connectionStatusText"' in content

    # Ensure manual connect button is removed from header
    assert 'onclick="saveConnectionSettings()"' not in content
    assert "<span>Kết Nối</span>" not in content
    assert "Kết Nối" not in content

    # User Auth Modal and Inputs
    assert 'id="modalUserAuth"' in content
    assert 'id="inputEmail"' in content
    assert 'id="inputPassword"' in content
    assert 'id="inputFullName"' in content
    assert 'id="btnSubmitAuth"' in content

    # Quota bar
    assert 'id="userQuotaBar"' in content
    assert 'id="infoClonedSlots"' in content
    assert 'id="infoCharsUsed"' in content
    assert 'id="infoCharsLimit"' in content

    # Studio and controls
    assert 'id="inputTtsText"' in content
    assert 'id="selectVoice"' in content
    assert 'onclick="fillSampleText()"' in content
    assert 'id="btnSynthesize"' in content
    assert 'id="audioPlayer"' in content


def test_js_client_logic_handlers():
    js_path = get_project_file("assets/app.js")
    assert js_path.exists()
    content = js_path.read_text(encoding="utf-8")

    # Check state and handlers
    assert "function setTargetMode(" in content
    assert "debounce" in content
    assert "handleConnectionChange" in content
    assert "function submitAuthForm(" in content
    assert "function logoutUser(" in content
    assert "function fetchUserProfile(" in content
    assert "function updateVoiceCountDisplays(" in content
    assert "function fillSampleText(" in content
    assert "function synthesizeSpeech(" in content
    assert "function previewVoice(" in content
    assert "function saveCloneToAccount(" in content
    assert "function extractRecordedEmbedding(" in content
    assert "function deleteCustomVoice(" in content
