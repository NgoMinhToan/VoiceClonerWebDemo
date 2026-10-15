// VoiceClonerWebDemo - Standalone Static Client Logic

let currentTab = 'tts';
let availableVoices = [];
let audioContext = null;
let currentAudioElement = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;

function getServerUrl() {
  return localStorage.getItem('vc_server_url') || 'http://localhost:8000';
}

function getApiKey() {
  return localStorage.getItem('vc_api_key') || 'vc_live_w1e2b3d4e5m6o7k8e9y0z1x2c3v4b5n6';
}

function saveConnectionSettings() {
  const url = document.getElementById('inputServerUrl').value.trim().replace(/\/+$/, '');
  const key = document.getElementById('inputApiKey').value.trim();
  localStorage.setItem('vc_server_url', url || 'http://localhost:8000');
  localStorage.setItem('vc_api_key', key);
  showToast('Đã lưu thông tin kết nối!', 'success');
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
  return fetch(`${base}${endpoint}`, { ...options, headers });
}

async function checkConnection() {
  const badge = document.getElementById('connectionBadge');
  const statusText = document.getElementById('connectionStatusText');
  try {
    statusText.textContent = 'Đang kiểm tra...';
    const res = await serverFetch('/health');
    if (res.ok) {
      badge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      statusText.textContent = 'Đã kết nối Server';
      loadVoices();
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    badge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30';
    statusText.textContent = 'Mất kết nối Server';
  }
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
    const res = await serverFetch('/v1/voices');
    if (res.ok) {
      availableVoices = await res.json();
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
  sel.innerHTML = availableVoices.map(v => `
    <option value="${v.id}">${v.name} (${v.accent || v.spec})</option>
  `).join('');
}

async function synthesizeSpeech() {
  const text = document.getElementById('inputTtsText').value.trim();
  if (!text) {
    showToast('Vui lòng nhập văn bản cần tổng hợp!', 'error');
    return;
  }

  const voice = document.getElementById('selectVoice').value;
  const speed = parseFloat(document.getElementById('inputSpeed').value) || 1.0;
  const pitch = parseInt(document.getElementById('inputPitch').value) || 0;
  const emotion = parseInt(document.getElementById('inputEmotion').value) || 0;
  const denoise = document.getElementById('checkDenoise').checked;
  const smartPause = document.getElementById('checkSmartPause').checked;

  const btn = document.getElementById('btnSynthesize');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tổng hợp 48kHz WAV...`;

  try {
    const res = await serverFetch('/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        speed,
        pitch,
        emotion,
        denoise,
        smart_pause: smartPause,
        format: 'wav'
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Lỗi ${res.status}`);
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    playGeneratedAudio(audioUrl);
    showToast('Tổng hợp âm thanh thành công!', 'success');
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
    showToast('Đang tải bản nghe thử...', 'info');
    const res = await serverFetch('/v1/voices/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_id: voiceId })
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    }
  } catch (e) {
    showToast('Lỗi khi nghe thử', 'error');
  }
}

function renderLibrary() {
  const container = document.getElementById('voiceCardsGrid');
  if (!container) return;

  if (!availableVoices.length) {
    container.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-500">Đang nạp danh mục giọng đọc hoặc chưa kết nối server...</div>`;
    return;
  }

  container.innerHTML = availableVoices.map(v => `
    <div class="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition space-y-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
          ${v.name[0]}
        </div>
        <div>
          <h4 class="font-bold text-sm text-white">${v.name}</h4>
          <span class="text-[11px] text-slate-400">${v.accent || 'Chuẩn'} • ${v.gender === 'female' ? 'Nữ' : 'Nam'}</span>
        </div>
      </div>
      <p class="text-xs text-slate-400 italic">"${v.sample_text || v.description || 'Giọng đọc chuẩn AI VieNeu-TTS 48kHz'}"</p>
      <div class="flex items-center justify-between pt-2 border-t border-slate-800">
        <span class="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">${v.spec || '48kHz HQ'}</span>
        <button onclick="previewVoice('${v.id}')" class="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition flex items-center space-x-1">
          <i class="fa-solid fa-play text-[10px]"></i>
          <span>Nghe thử 3s</span>
        </button>
      </div>
    </div>
  `).join('');
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
      const blob = new Blob(recordedChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inputServerUrl').value = getServerUrl();
  document.getElementById('inputApiKey').value = getApiKey();
  checkConnection();
});
