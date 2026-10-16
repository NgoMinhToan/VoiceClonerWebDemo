# VoiceClonerWebDemo

Web Studio thử nghiệm tổng hợp và nhân bản giọng nói AI tiếng Việt chuẩn 48kHz (Decoupled Dual-Mode Client dành cho hệ thống Voice Cloner).

---

## 1. Giới Thiệu & Điểm Nổi Bật

`VoiceClonerWebDemo` là ứng dụng web tĩnh hoàn toàn độc lập (HTML5, Tailwind CSS, JavaScript thuần), được thiết kế để kiểm thử toàn diện cả 2 tầng của nền tảng Voice Cloner và tương thích với bất kỳ AI Voice Server nào:
- **Tách rời 100%**: Có thể chạy trực tiếp từ file `index.html`, container Docker `nginx:alpine`, hoặc tự động deploy lên GitHub Pages.
- **Khám phá danh mục giọng động (Dynamic Catalog Discovery)**: Không gắn cứng số lượng giọng đọc hay nhà cung cấp; tự động nạp, đếm và hiển thị toàn bộ danh sách giọng do server kết nối cung cấp.
- **Hỗ trợ 2 Chế Độ Kiểm Thử (Dual-Mode Testing)**:
  - 🎙️ **Chế độ 1: Trực Tiếp Voice Server (Cổng 8001)**:
    - Kiểm thử trực tiếp AI Engine (như `vienueTTS_server` hoặc worker tuân thủ chuẩn Voice API).
    - Nghe thử toàn bộ danh mục giọng đọc có sẵn được trả về từ worker.
    - Thu âm và trích xuất đặc trưng speaker embedding (`.npz`) để phát thử nghiệm giọng clone tức thì không cần đăng nhập hay cơ sở dữ liệu.
  - 🏢 **Chế độ 2: Qua App Server Gateway (`VoiceClonerAppServer` - Cổng 8000)**:
    - Kiểm thử trọn vẹn luồng ứng dụng người dùng cuối: Đăng ký, Đăng nhập, cấp phát JWT access token.
    - Theo dõi trực tiếp hạn mức sử dụng ký tự hôm nay và số lượng slot clone (tối đa 3 slots).
    - Nhân bản và lưu trữ vĩnh viễn giọng đọc mới vào cơ sở dữ liệu PostgreSQL/SQLite của tài khoản.
    - Quản lý và xóa giọng clone riêng tư.
- **Hỗ trợ Private Network Access (PNA)**: Kết nối trơn tru từ GitHub Pages (HTTPS) về máy chủ cục bộ (HTTP localhost).

---

## 2. Hướng Dẫn Sử Dụng

### 2.1 Chọn Chế Độ Kiểm Thử
Trên thanh tiêu đề (Header):
- Bấm **"1. Voice Server (8001)"** để kết nối trực tiếp đến microservice AI `vienueTTS_server`. Nhập URL `http://localhost:8001` và Worker Key `vtts_worker_secret_key_123`.
- Bấm **"2. App Server (8000)"** để kết nối đến API Gateway `VoiceClonerAppServer`. Nhập URL `http://localhost:8000` và Client API Key `vc_live_...`.
- Bấm nút **"Đăng Nhập"** (ở Chế độ 2) để đăng nhập hoặc tạo tài khoản mới kiểm tra hạn mức cá nhân.

### 2.2 Các Tính Năng
1. **TTS Studio**: Nhập văn bản tiếng Việt hoặc tiếng Anh, tùy chỉnh tốc độ (0.5x - 2.0x), cao độ (-12 đến +12 st), cảm xúc và thưởng thức âm thanh 48kHz WAV.
2. **Thư Viện Giọng Đọc**: Xem danh sách giọng đọc động có sẵn và các giọng clone đã tạo, bấm nghe thử mẫu 3s hoặc xóa giọng clone.
3. **Phòng Thu & Nhân Bản (Clone Studio)**: Thu âm giọng đọc mẫu từ 5 - 15 giây và bấm nút nhân bản để thử nghiệm ngay hoặc lưu vào tài khoản.

---

## 3. Khởi Chạy Web Studio

### Chạy bằng Docker:
```bash
docker run -d -p 3000:80 --name voicecloner-demo ghcr.io/ngominhtoan/voicecloner-demo:latest
```
Truy cập: `http://localhost:3000`

### Mở trực tiếp:
Mở file `index.html` bằng bất kỳ trình duyệt hiện đại nào (Chrome, Edge, Firefox, Safari).

---

## 4. Tự Động Deploy Lên GitHub Pages
Repository tích hợp sẵn GitHub Actions workflow `.github/workflows/deploy-pages.yml`. Mỗi khi push commit lên nhánh `master` hoặc `main`, workflow sẽ chạy toàn bộ test trước, và tự động deploy website lên GitHub Pages nếu tests pass.

---

## 5. Kiểm Thử Hệ Thống

Chạy bộ kiểm thử tự động pytest:
```bash
pytest tests/ -v
```

### Kích Hoạt Git Pre-Push Hook Cục Bộ:
Để git tự động chạy kiểm thử trước mỗi lần push:
```bash
git config core.hooksPath .githooks
```
