# VoiceClonerWebDemo

Web Studio thử nghiệm tổng hợp giọng nói AI tiếng Việt chuẩn 48kHz (Decoupled Static Frontend dành cho Voice Cloner).

---

## 1. Giới Thiệu & Điểm Nổi Bật

`VoiceClonerWebDemo` là ứng dụng web tĩnh hoàn toàn độc lập, không phụ thuộc vào mã nguồn Python hay mô hình AI cục bộ:
- **Tách rời 100%**: Chỉ bao gồm HTML5, Tailwind CSS và JavaScript thuần, có thể host trên bất kỳ Web Server hoặc CDN nào.
- **Tự động deploy lên GitHub Pages**: Mỗi khi push code lên nhánh `master`/`main`, GitHub Actions sẽ tự động kích hoạt pipeline build và phát hành trực tiếp.
- **Tùy biến kết nối linh hoạt**: Cho phép người dùng nhập trực tiếp **Server URL** và **Client API Key** (`vc_live_...`) ngay trên thanh điều khiển, dữ liệu được lưu an toàn trong `localStorage` của trình duyệt.
- **Các tính năng cốt lõi**:
  - 🎙️ **TTS Studio**: Tổng hợp giọng nói tức thì với bộ điều khiển tốc độ, cao độ, cảm xúc và bộ phát âm thanh 48kHz WAV tiêu chuẩn.
  - 📚 **Voice Catalog**: Nghe thử mẫu 3 giây danh mục giọng đọc có sẵn.
  - 🧪 **Clone Studio**: Thu âm giọng đọc trực tiếp từ microphone để gửi yêu cầu nhân bản giọng nói.

---

## 2. Hướng Dẫn Kết Nối & Sử Dụng

1. Mở trang web (qua GitHub Pages hoặc mở trực tiếp `index.html` trong trình duyệt).
2. Trên thanh tiêu đề (Header):
   - **Server URL**: Nhập địa chỉ của máy chủ [VoiceClonerAppServer](https://github.com/NgoMinhToan/VoiceClonerAppServer) (ví dụ: `http://localhost:8000` hoặc domain server của bạn).
   - **Key**: Nhập **Client API Key** được cấp từ trang quản trị của `VoiceClonerAppServer` (tiền tố `vc_live_...`).
   - Bấm nút **Kết Nối** để kiểm tra và lưu cấu hình.
3. Nhập văn bản và bấm **Tổng Hợp & Nghe Thử** để thưởng thức giọng đọc 48kHz.

---

## 3. Ảnh Chụp Giao Diện (Preview)

Giao diện Studio phong cách Dark Slate hiện đại:
```
+--------------------------------------------------------------------------+
|  [Voice Cloner Web Studio]        Server: [http://localhost:8000] [Key]  |
|--------------------------------------------------------------------------|
|  [1. TTS Studio]   |  [2. Voice Library]   |  [3. Clone Studio]          |
|--------------------------------------------------------------------------|
|  Văn bản:                                 |  Âm thanh đầu ra (48kHz):    |
|  [ Nhập đoạn văn bản tiếng Việt...     ]  |  [> Play ======== 00:03]     |
|  Giọng: [Minh Đức (48kHz)]                |  [ Tải file WAV ]            |
|  Tốc độ: 1.0x   Cao độ: 0   Cảm xúc: 85%  |                              |
|  [=== Nút Tổng Hợp & Nghe Thử ===]        |                              |
+--------------------------------------------------------------------------+
```

---

## 4. Tự Động Deploy Lên GitHub Pages

Repository đã được tích hợp sẵn file `.github/workflows/deploy-pages.yml`. Khi kích hoạt GitHub Pages trên repository:
1. Vào mục **Settings** -> **Pages** trên GitHub repo.
2. Tại mục **Build and deployment** -> **Source**, chọn **GitHub Actions**.
3. Mỗi khi push commit lên nhánh `master`, website sẽ tự động cập nhật trong vòng chưa đầy 1 phút.

---

## 5. Các Dự Án Liên Quan

- **[VoiceClonerAppServer](https://github.com/NgoMinhToan/VoiceClonerAppServer)**: API Gateway và Reverse Proxy trung tâm.
- **[vienueTTS_server](https://github.com/NgoMinhToan/vienueTTS_server)**: Microservice AI xử lý inference VieNeu-TTS.
- **Android Client**: Ứng dụng di động native Android tại repository [VoiceCloner](https://github.com/NgoMinhToan/voice-cloner-app).
