# Kế Hoạch Chuẩn Hóa & Kiểm Thử VoiceClonerWebDemo

**Mục tiêu:** Xây dựng `VoiceClonerWebDemo` thành một Web Studio thử nghiệm kiểm thử 2 chế độ (Dual-Mode Client) hoàn toàn độc lập, linh hoạt và không gắn cứng với bất kỳ số lượng giọng đọc hay nhà cung cấp AI cụ thể nào:
1. **Chế độ 1: Trực tiếp Voice Server (`vienueTTS_server` hoặc bất kỳ Voice Worker chuẩn nào - Port 8001):** Dành cho kiểm thử trực tiếp mô hình AI (khám phá danh mục giọng động do server cung cấp, thu âm và trích xuất embedding `.npz` để thử nghiệm tức thì không cần đăng nhập hay cơ sở dữ liệu).
2. **Chế độ 2: Qua App Server Gateway (`VoiceClonerAppServer` - Port 8000):** Dành cho kiểm thử trọn vẹn luồng ứng dụng người dùng cuối (Đăng ký/Đăng nhập JWT, quản lý slot clone, lưu trữ giọng clone vào cơ sở dữ liệu, theo dõi hạn ngạch ký tự hàng ngày, kiểm soát rate limit).

---

## 1. Trạng Thái Hiện Tại & Đánh Giá
- **Vấn đề phát hiện:** Trước đây Web Demo mang các chuỗi tĩnh như "23 giọng", "công nghệ VieNeu-TTS v3", làm giảm tính linh hoạt khi kết nối đến các Voice Server có số lượng giọng khác nhau.
- **Hành động khắc phục:**
  - Chuyển đổi toàn bộ hiển thị số lượng giọng (`#librarySubtitle`, `#voiceCountBadge`, Connection Status) sang dạng tính toán động từ `availableVoices.length` và API trả về.
  - Sử dụng hàm `fillSampleText()` đọc trực tiếp `sample_text` từ đối tượng giọng nói được server cung cấp.
  - Loại bỏ các thẻ `<option>` tĩnh trong `<select id="selectVoice">`, tạo động hoàn toàn khi nạp API.
  - Bổ sung bộ chuyển chế độ (Mode Toggle Pill) trên Header: "1. Voice Server (8001)" và "2. App Server (8000)".
  - Tách biệt cấu hình `Server URL` và `Key` độc lập theo từng chế độ trong `localStorage`.
  - Tích hợp Modal đăng nhập/đăng ký tài khoản App Server (`/v1/auth/login`, `/v1/auth/register`) và hiển thị thanh User Quota Bar.

---

## 2. Danh Sách Tính Năng & Giao Diện Theo Chế Độ

| Chức năng | Chế độ Voice Server (8001) | Chế độ App Server Gateway (8000) |
| :--- | :--- | :--- |
| **Xác thực** | `X-API-Key: vtts_worker_...` | `X-API-Key: vc_live_...` + `Authorization: Bearer <JWT>` |
| **Quản lý Tài Khoản** | Không yêu cầu tài khoản | Hỗ trợ Đăng ký, Đăng nhập, Xem hạn mức ký tự và slot clone |
| **Thư viện Giọng Đọc** | Danh mục giọng động do Voice Server trả về | Giọng preset từ Gateway + Các giọng clone riêng của User từ Database |
| **TTS Studio** | Tổng hợp văn bản 48kHz WAV trực tiếp | Tổng hợp văn bản qua Gateway kèm trừ hạn mức ký tự hàng ngày |
| **Clone Studio** | Thu âm -> Trích xuất `.npz` -> Nghe thử tức thì | Thu âm -> Gửi lên Gateway -> Lưu vĩnh viễn vào tài khoản User |

---

## 3. Kế Hoạch Kiểm Thử
- [x] Test kiểm tra các file tĩnh (`index.html`, `style.css`, `app.js`).
- [x] Test khẳng định không còn chuỗi hardcode "23 giọng" trong HTML và JS.
- [x] Test workflow tự động deploy lên GitHub Pages (`deploy-pages.yml`).
- [x] Test cấu trúc Dockerfile (`nginx:alpine` với cổng 80 và healthcheck wget).
- [x] Test logic chuyển đổi 2 chế độ và hỗ trợ đầy đủ các endpoint.
