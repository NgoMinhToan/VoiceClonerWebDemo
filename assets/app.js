// VoiceClonerWebDemo - Dual-Mode Testing Client (Voice Server 8001 vs App Server 8000)

let targetMode = localStorage.getItem('vc_target_mode') || 'voice'; // 'voice' or 'app'
let currentTab = 'tts';
let authTab = 'login';
let availableVoices = [];
let currentUser = null;
let recordedChunks = [];
let recordedAudioBlob = null;
let recordingTimer = null;
let recordingSeconds = 0;
let mediaRecorder = null;
let currentClonedNpzBase64 = null;

// Config getters/setters per mode
function getServerUrl() {
  if (targetMode === 'voice') {
    return localStorage.getItem('vc_voice_server_url') || 'http://localhost:8001';
  }
  return localStorage.getItem('vc_app_server_url') || 'http://localhost:8000';
}

function getApiKey() {
  if (targetMode === 'voice') {
    return localStorage.getItem('vc_voice_api_key') || 'vtts_worker_secret_key_123';
  }
  return localStorage.getItem('vc_client_api_key') || 'vc_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
}

function getUserToken() {
  return localStorage.getItem('vc_user_access_token') || '';
}

function setUserToken(token) {
  if (token) {
    localStorage.setItem('vc_user_access_token', token);
  } else {
    localStorage.removeItem('vc_user_access_token');
  }
}

function setTargetMode(mode) {
  targetMode = mode;
  localStorage.setItem('vc_target_mode', mode);

  const btnVoice = document.getElementById('modeBtnVoice');
  const btnApp = document.getElementById('modeBtnApp');
  const userAccountSection = document.getElementById('userAccountSection');
  const voiceModeActions = document.getElementById('voiceModeActions');
  const appModeActions = document.getElementById('appModeActions');
  const librarySubtitle = document.getElementById('librarySubtitle');

  if (mode === 'voice') {
    btnVoice.className = 'px-2.5 py-1 rounded-md font-semibold transition bg-indigo-600 text-white flex items-center space-x-1';
    btnApp.className = 'px-2.5 py-1 rounded-md font-semibold transition text-slate-400 hover:text-white flex items-center space-x-1';
    userAccountSection.classList.add('hidden');
    document.getElementById('userQuotaBar').classList.add('hidden');
    voiceModeActions.classList.remove('hidden');
    appModeActions.classList.add('hidden');
    librarySubtitle.textContent = 'Danh mục 23 giọng đọc AI bản ngữ Việt Nam chuẩn 48kHz từ Voice Server.';
  } else {
    btnApp.className = 'px-2.5 py-1 rounded-md font-semibold transition bg-indigo-600 text-white flex items-center space-x-1';
    btnVoice.className = 'px-2.5 py-1 rounded-md font-semibold transition text-slate-400 hover:text-white flex items-center space-x-1';
    userAccountSection.classList.remove('hidden');
    voiceModeActions.classList.add('hidden');
    appModeActions.classList.remove('hidden');
    librarySubtitle.textContent = 'Danh mục 23 giọng preset + giọng clone của tài khoản trên App Server.';
  }

  document.getElementById('inputServerUrl').value = getServerUrl();
  document.getElementById('inputApiKey').value = getApiKey();
  checkConnection();
}

function saveConnectionSettings() {
  const url = document.getElementById('inputServerUrl').value.trim().replace(/\/+$/, '');
  const key = document.getElementById('inputApiKey').value.trim();

  if (targetMode === 'voice') {
    localStorage.setItem('vc_voice_server_url', url || 'http://localhost:8001');
    localStorage.setItem('vc_voice_api_key', key || 'vtts_worker_secret_key_123');
  } else {
    localStorage.setItem('vc_app_server_url', url || 'http://localhost:8000');
    localStorage.setItem('vc_client_api_key', key || 'vc_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6');
  }

  showToast('Đã lưu thông tin cấu hình kết nối!', 'success');
  checkConnection();
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-indigo-600');
  toast.className = `${bg} text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : (type === 'error' ? 'circle-exclamation' : 'circle-info')}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

async function serverFetch(endpoint, options = {}) {
  const base = getServerUrl();
  const key = getApiKey();
  const headers = {
    'X-API-Key': key,
    ...(options.headers || {}),
  };
  const token = getUserToken();
  if (targetMode === 'app' && token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${base}${endpoint}`, { ...options, headers });
}

async function checkConnection() {
  const badge = document.getElementById('connectionBadge');
  const statusText = document.getElementById('connectionStatusText');
  const pnaBanner = document.getElementById('pnaNoticeBanner');
  try {
    statusText.textContent = 'Đang kiểm tra...';
    let res = await serverFetch(targetMode === 'voice' ? '/internal/v1/health' : '/health');
    if (!res.ok) {
      res = await serverFetch('/health');
    }

    if (res.ok) {
      const data = await res.json();
      badge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      statusText.textContent = targetMode === 'voice' ? `Voice Server (${data.total_voices || 23} giọng)` : 'App Server Online';
      if (pnaBanner) pnaBanner.classList.add('hidden');

      if (targetMode === 'app' && getUserToken()) {
        fetchUserProfile();
      }
      loadVoices();
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    badge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30';
    statusText.textContent = 'Mất kết nối Server';
    if (window.location.protocol === 'https:' && (getServerUrl().includes('localhost') || getServerUrl().includes('127.0.0.1'))) {
      if (pnaBanner) pnaBanner.classList.remove('hidden');
    }
  }
}

// User Profile & Auth
async function fetchUserProfile() {
  try {
    const res = await serverFetch('/v1/auth/me');
    if (res.ok) {
      currentUser = await res.json();
      document.getElementById('userAccountBtnText').textContent = currentUser.full_name || currentUser.email;
      document.getElementById('infoUserName').textContent = currentUser.full_name;
      document.getElementById('infoUserEmail').textContent = currentUser.email;
      document.getElementById('infoClonedSlots').textContent = `${currentUser.cloned_voices_count}/${currentUser.max_cloned_slots}`;
      document.getElementById('infoCharsUsed').textContent = (currentUser.daily_tts_chars_used || 0).toLocaleString();
      document.getElementById('infoCharsLimit').textContent = (currentUser.daily_tts_chars_limit || 100000).toLocaleString();
      document.getElementById('userQuotaBar').classList.remove('hidden');
    } else {
      logoutUser();
    }
  } catch (e) {
    console.error('fetchUserProfile error', e);
  }
}

function openAuthModal() {
  document.getElementById('modalUserAuth').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('modalUserAuth').classList.add('hidden');
}

function switchAuthTab(tab) {
  authTab = tab;
  const btnLogin = document.getElementById('authTabLogin');
  const btnReg = document.getElementById('authTabRegister');
  const groupFullName = document.getElementById('groupFullName');
  const btnSubmit = document.getElementById('btnSubmitAuth');
  const title = document.getElementById('authModalTitle');

  if (tab === 'login') {
    btnLogin.className = 'py-2 px-4 border-b-2 border-indigo-500 text-white font-bold';
    btnReg.className = 'py-2 px-4 text-slate-400 hover:text-white';
    groupFullName.classList.add('hidden');
    btnSubmit.textContent = 'Đăng Nhập';
    title.textContent = 'Đăng Nhập Tài Khoản App Server';
  } else {
    btnReg.className = 'py-2 px-4 border-b-2 border-indigo-500 text-white font-bold';
    btnLogin.className = 'py-2 px-4 text-slate-400 hover:text-white';
    groupFullName.classList.remove('hidden');
    btnSubmit.textContent = 'Đăng Ký Tài Khoản';
    title.textContent = 'Đăng Ký Tài Khoản Mới';
  }
}

async function submitAuthForm() {
  const email = document.getElementById('inputEmail').value.trim();
  const password = document.getElementById('inputPassword').value.trim();
  const fullName = document.getElementById('inputFullName').value.trim();

  if (!email || !password) {
    showToast('Vui lòng điền đầy đủ email và mật khẩu!', 'error');
    return;
  }

  const endpoint = authTab === 'login' ? '/v1/auth/login' : '/v1/auth/register';
  const body = authTab === 'login' ? { email, password } : { email, password, full_name: fullName || 'Tester' };

  try {
    const res = await serverFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok && data.access_token) {
      setUserToken(data.access_token);
      showToast(authTab === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký thành công!', 'success');
      closeAuthModal();
      fetchUserProfile();
      loadVoices();
    } else {
      showToast(`Thất bại: ${data.detail || 'Lỗi xác thực'}`, 'error');
    }
  } catch (e) {
    showToast('Lỗi khi gửi yêu cầu xác thực', 'error');
  }
}

async function logoutUser() {
  try {
    await serverFetch('/v1/auth/logout', { method: 'POST' });
  } catch (e) {}
  setUserToken('');
  currentUser = null;
  document.getElementById('userAccountBtnText').textContent = 'Đăng Nhập';
  document.getElementById('userQuotaBar').classList.add('hidden');
  showToast('Đã đăng xuất tài khoản!', 'info');
  loadVoices();
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(`tab-content-${tabId}`);
  const btn = document.getElementById(`tab-btn-${tabId}`);
  if (target) target.classList.remove('hidden');
  if (btn) btn.classList.add('active');

  if (tabId === 'library') renderLibrary();
}

async function loadVoices() {
  try {
    const endpoint = targetMode === 'voice' ? '/internal/v1/voices' : '/v1/voices';
    let res = await serverFetch(endpoint);
    if (!res.ok && targetMode === 'voice') {
      res = await serverFetch('/v1/voices');
    }
    if (res.ok) {
      const data = await res.json();
      availableVoices = data.voices || data.data || (Array.isArray(data) ? data : []);
      populateVoiceSelect();
      if (currentTab === 'library') renderLibrary();
    }
  } catch (e) {
    console.error('loadVoices failed', e);
  }
}

function populateVoiceSelect() {
  const sel = document.getElementById('selectVoice');
  if (!sel) return;

  let optionsHtml = '';
  if (targetMode === 'voice' && currentClonedNpzBase64) {
    optionsHtml += `<option value="__cloned_voice__" selected>🌟 [Giọng Clone Tức Thì .npz]</option>`;
  }

  optionsHtml += availableVoices.map(v => {
    const prefix = !v.is_builtin ? '⭐ [Clone] ' : '';
    return `<option value="${v.id || v.name}">${prefix}${v.name} (${v.accent || v.gender || '48kHz'})</option>`;
  }).join('');

  sel.innerHTML = optionsHtml;
}

async function synthesizeSpeech() {
  const text = document.getElementById('inputTtsText').value.trim();
  if (!text) {
    showToast('Vui lòng nhập văn bản cần tổng hợp!', 'error');
    return;
  }

  const voiceVal = document.getElementById('selectVoice').value;
  const speed = parseFloat(document.getElementById('inputSpeed').value) || 1.0;
  const pitch = parseInt(document.getElementById('inputPitch').value) || 0;
  const emotion = parseInt(document.getElementById('inputEmotion').value) || 0;
  const denoise = document.getElementById('checkDenoise').checked;
  const smartPause = document.getElementById('checkSmartPause').checked;

  const btn = document.getElementById('btnSynthesize');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tổng hợp 48kHz WAV...`;

  const payload = {
    text,
    speed,
    pitch,
    emotion,
    denoise,
    smart_pause: smartPause,
    format: 'wav'
  };

  if (targetMode === 'voice' && voiceVal === '__cloned_voice__' && currentClonedNpzBase64) {
    payload.ref_npz_base64 = currentClonedNpzBase64;
  } else {
    payload.voice = voiceVal;
    payload.voice_id = voiceVal;
  }

  try {
    const endpoint = targetMode === 'voice' ? '/internal/v1/synthesize' : '/v1/audio/speech';
    let res = await serverFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Lỗi HTTP ${res.status}`);
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    playGeneratedAudio(audioUrl);
    showToast('Tổng hợp âm thanh 48kHz thành công!', 'success');
    if (targetMode === 'app' && currentUser) {
      fetchUserProfile();
    }
  } catch (err) {
    showToast(`Thất bại: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-play mr-2"></i> Tổng Hợp & Nghe Thử`;
  }
}

function playGeneratedAudio(url) {
  const player = document.getElementById('audioPlayer');
  const downloadLink = document.getElementById('btnDownloadAudio');
  if (player) {
    player.src = url;
    player.play();
  }
  if (downloadLink) {
    downloadLink.href = url;
    downloadLink.classList.remove('hidden');
  }
}

async function previewVoice(voiceId) {
  try {
    showToast('Đang phát bản nghe thử...', 'info');
    let res;
    if (targetMode === 'voice') {
      res = await serverFetch('/internal/v1/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Xin chào! Đây là bản nghe thử được kết xuất trực tiếp bằng công nghệ AI VieNeu-TTS 48kHz.",
          voice: voiceId,
          voice_id: voiceId,
          format: "wav"
        })
      });
    } else {
      res = await serverFetch('/v1/voices/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_id: voiceId })
      });
    }

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      showToast('Đang phát âm thanh mẫu!', 'success');
    } else {
      showToast('Lỗi khi nghe thử giọng', 'error');
    }
  } catch (e) {
    showToast('Lỗi kết nối khi nghe thử', 'error');
  }
}

async function deleteCustomVoice(voiceId) {
  if (!confirm('Bạn có chắc chắn muốn xóa giọng clone này không?')) return;
  try {
    const res = await serverFetch(`/v1/voices/${voiceId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Đã xóa giọng clone thành công!', 'success');
      loadVoices();
      if (currentUser) fetchUserProfile();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(`Xóa thất bại: ${data.detail || 'Lỗi'}`, 'error');
    }
  } catch (e) {
    showToast('Lỗi khi xóa giọng clone', 'error');
  }
}

function renderLibrary() {
  const container = document.getElementById('voiceCardsGrid');
  if (!container) return;

  if (!availableVoices.length) {
    container.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-500">Đang nạp danh mục giọng đọc hoặc chưa kết nối server...</div>`;
    return;
  }

  container.innerHTML = availableVoices.map(v => {
    const isCustom = !v.is_builtin;
    return `
      <div class="glass-panel p-5 rounded-2xl border ${isCustom ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800'} hover:border-indigo-500/50 transition space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl ${isCustom ? 'bg-amber-600/20 text-amber-400' : 'bg-indigo-600/20 text-indigo-400'} flex items-center justify-center font-bold text-sm">
              ${v.name[0]}
            </div>
            <div>
              <h4 class="font-bold text-sm text-white flex items-center gap-1.5">
                <span>${v.name}</span>
                ${isCustom ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Clone</span>' : ''}
              </h4>
              <span class="text-[11px] text-slate-400">${v.accent || v.gender || 'Chuẩn 48kHz'}</span>
            </div>
          </div>
          ${isCustom && targetMode === 'app' ? `
            <button onclick="deleteCustomVoice('${v.id}')" class="text-slate-500 hover:text-rose-400 text-xs px-2 py-1" title="Xóa giọng clone">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>
        <p class="text-xs text-slate-400 italic">"${v.description || v.sample_text || 'Giọng đọc chuẩn AI VieNeu-TTS 48kHz'}"</p>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800">
          <span class="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">48kHz HQ</span>
          <button onclick="previewVoice('${v.id || v.name}')" class="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition flex items-center space-x-1">
            <i class="fa-solid fa-play text-[10px]"></i>
            <span>Nghe thử 3s</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Studio Voice Recording
async function toggleRecording() {
  const btn = document.getElementById('btnRecord');
  const timerLabel = document.getElementById('recordTimer');

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(recordingTimer);
    btn.className = 'w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition text-lg';
    btn.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      recordedAudioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(recordedAudioBlob);
      document.getElementById('recordedAudioPreview').src = url;
      document.getElementById('recordedAudioContainer').classList.remove('hidden');
      showToast('Đã thu âm xong mẫu giọng!', 'success');
    };

    mediaRecorder.start();
    recordingSeconds = 0;
    recordingTimer = setInterval(() => {
      recordingSeconds++;
      const m = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
      const s = String(recordingSeconds % 60).padStart(2, '0');
      timerLabel.textContent = `${m}:${s}`;
    }, 1000);

    btn.className = 'w-14 h-14 rounded-full bg-slate-800 border-2 border-rose-500 text-rose-400 flex items-center justify-center animate-pulse transition text-lg';
    btn.innerHTML = `<i class="fa-solid fa-stop"></i>`;
    showToast('Đang thu âm... Hãy đọc đoạn văn mẫu bên trên.', 'info');
  } catch (err) {
    showToast('Không thể truy cập microphone!', 'error');
  }
}

// Mode 1 Action: Extract embedding .npz on Voice Server
async function extractRecordedEmbedding() {
  if (!recordedAudioBlob) {
    showToast('Chưa có mẫu âm thanh để trích xuất!', 'error');
    return;
  }

  const btn = document.getElementById('btnExtractEmbedding');
  const badge = document.getElementById('embeddingStatusBadge');
  const btnUse = document.getElementById('btnUseClonedVoice');

  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Đang trích xuất đặc trưng (.npz)...`;

  try {
    const formData = new FormData();
    formData.append('audio_file', recordedAudioBlob, 'voice_sample.wav');

    let res = await serverFetch('/internal/v1/embed', { method: 'POST', body: formData });
    if (!res.ok) {
      res = await serverFetch('/v1/embed', { method: 'POST', body: formData });
    }

    if (!res.ok) throw new Error(`Voice Server trả về mã ${res.status}`);

    const npzBlob = await res.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      currentClonedNpzBase64 = base64Data;
      populateVoiceSelect();

      badge.textContent = '✓ Đã trích xuất thành công đặc trưng speaker embedding (.npz)!';
      badge.classList.remove('hidden');
      btnUse.classList.remove('hidden');
      showToast('Trích xuất đặc trưng giọng clone thành công!', 'success');
    };
    reader.readAsDataURL(npzBlob);
  } catch (err) {
    showToast(`Trích xuất thất bại: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-dna"></i> <span>Trích Xuất Đặc Trưng Giọng (.npz)</span>`;
  }
}

function useClonedVoiceForTts() {
  switchTab('tts');
  const sel = document.getElementById('selectVoice');
  if (sel) sel.value = '__cloned_voice__';
  showToast('Đã kích hoạt giọng clone trong TTS Studio!', 'success');
}

// Mode 2 Action: Clone voice officially to User Account on App Server
async function saveCloneToAccount() {
  if (!recordedAudioBlob) {
    showToast('Vui lòng thu âm mẫu giọng trước khi lưu!', 'error');
    return;
  }
  if (!currentUser) {
    showToast('Vui lòng Đăng nhập tài khoản trên App Server để lưu giọng clone!', 'error');
    openAuthModal();
    return;
  }

  const name = document.getElementById('inputCloneName').value.trim();
  if (!name) {
    showToast('Vui lòng nhập tên cho giọng clone!', 'error');
    return;
  }

  const [gender, region] = document.getElementById('selectCloneGenderRegion').value.split('_');
  const btn = document.getElementById('btnSaveCloneToAccount');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Đang huấn luyện & lưu vào tài khoản...`;

  try {
    const formData = new FormData();
    formData.append('audio_file', recordedAudioBlob, 'clone_sample.wav');
    formData.append('name', name);
    formData.append('gender', gender);
    formData.append('region', region);
    formData.append('category', 'Thuyết minh');
    formData.append('denoise', 'true');

    const res = await serverFetch('/v1/voices/clone', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      showToast(`Đã nhân bản thành công giọng '${name}'!`, 'success');
      loadVoices();
      fetchUserProfile();
      switchTab('library');
    } else {
      showToast(`Nhân bản thất bại: ${data.detail || 'Lỗi server'}`, 'error');
    }
  } catch (e) {
    showToast('Lỗi khi gửi yêu cầu nhân bản giọng', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1.5"></i> <span>Lưu Giọng Clone Vào Tài Khoản App Server</span>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTargetMode(targetMode);
});
