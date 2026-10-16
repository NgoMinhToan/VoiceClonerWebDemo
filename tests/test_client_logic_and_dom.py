from pathlib import Path


def test_dom_modal_and_controls_structure():
    html_path = Path("VoiceClonerWebDemo/index.html")
    assert html_path.exists()
    content = html_path.read_text(encoding="utf-8")

    # Mode buttons
    assert 'id="modeBtnVoice"' in content
    assert 'id="modeBtnApp"' in content

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
    js_path = Path("VoiceClonerWebDemo/assets/app.js")
    assert js_path.exists()
    content = js_path.read_text(encoding="utf-8")

    # Check state and handlers
    assert "function setTargetMode(" in content
    assert "function saveConnectionSettings(" in content
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
