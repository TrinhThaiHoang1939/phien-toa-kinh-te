# Phiên Toà Kinh Tế

Game giả lập phiên toà: người chơi tranh luận với đối thủ AI (Gemini) về **độc quyền và độc quyền nhà nước** trong học phần Kinh tế chính trị Mác – Lênin (Chương 4, Mục II–III). Một Thẩm phán AI đọc cáo trạng, chất vấn, phán quyết phản đối và chấm điểm theo giáo trình.

Toàn bộ là trang tĩnh (HTML/CSS/JS), không cần máy chủ: chạy được trên GitHub Pages hoặc mở trực tiếp file `index.html`.

## Chạy thử trên máy

Mở `index.html` bằng Chrome/Edge. Vào **Cài đặt AI**:
- Dán Gemini API key → bấm **Tải danh sách** để chọn model → **Kiểm tra kết nối** → **Lưu**.
- Hoặc tick **Chế độ thử** để chơi không cần key (đối thủ và điểm số chỉ minh hoạ).

Key chỉ lưu trong trình duyệt của máy đó (localStorage), không nằm trong code.

## Đưa lên GitHub Pages

1. Tạo repo mới trên GitHub (ví dụ `phien-toa-kinh-te`), tải toàn bộ thư mục này lên (giữ nguyên cấu trúc).
2. Vào **Settings → Pages** → *Source*: **Deploy from a branch** → chọn nhánh `main`, thư mục `/ (root)` → **Save**.
3. Sau 1–2 phút, trang có địa chỉ `https://<tên-tài-khoản>.github.io/phien-toa-kinh-te/`.
4. Trên máy trình chiếu, mở trang → **Cài đặt AI** → dán key.

**Không commit API key vào repo.** Repo GitHub Pages là công khai.

Nên giới hạn key cho an toàn: vào Google Cloud Console → *APIs & Services → Credentials* → chọn key → *Application restrictions: Websites* → thêm `https://<tên-tài-khoản>.github.io/*`. Sau buổi trình bày có thể xoá key hoặc tạo key mới.

## Cấu trúc

| File | Nội dung |
| --- | --- |
| `index.html` | Giao diện: chọn vụ án, phòng xử án, cài đặt, bản án |
| `style.css` | Giao diện phòng xử án |
| `data/corpus.js` | Giáo trình đã cắt thành 21 đoạn có mã mục (II.1.a … III.3.b4) và số trang |
| `data/cases.js` | 6 vụ án: bối cảnh, luận điểm, lập trường hai bên, gợi ý, câu chất vấn mẫu |
| `js/scene.js` | Cảnh phòng xử án (SVG), nhân vật, bong bóng thoại, hiệu ứng Phản đối/búa |
| `js/retrieval.js` | Tra cứu giáo trình trong trình duyệt để đưa đoạn liên quan vào prompt |
| `js/gemini.js` | Gọi Gemini API |
| `js/app.js` | Luồng phiên toà, đồng hồ, phản đối, chấm điểm |

Muốn thêm vụ án: sao chép một mục trong `data/cases.js` và sửa nội dung. Mã trong `sources` và trong ngoặc vuông của `hints` phải khớp mã trong `data/corpus.js`.

## Luật chơi

- Công tố viên (trái) và Luật sư (phải) đứng đối diện, Thẩm phán ngồi giữa. Lời nói hiện bằng bong bóng thoại trên đầu nhân vật; bấm vào bong bóng để hiện hết chữ ngay. Toàn bộ lời thoại được lưu ở tab **Biên bản**.

- Công tố viên bảo vệ luận điểm (khớp giáo trình); Luật sư phản bác (phản đề, khó hơn).
- Mỗi vòng: Công tố viên trình bày trước, Luật sư sau. Giữa phiên, Thẩm phán chất vấn người chơi.
- **Phản đối!**: đúng +3 điểm, sai −2 điểm. Đồng hồ tạm dừng khi đang phản đối.
- Bản án: 4 tiêu chí × 10 điểm (đúng lý luận, dẫn chứng, phản bác, logic) + điểm phản đối, so với đối thủ AI.
