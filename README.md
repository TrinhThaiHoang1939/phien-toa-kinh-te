# Phiên Toà Kinh Tế

Game ôn tập **Kinh tế chính trị Mác – Lênin** về **độc quyền và độc quyền nhà nước** (giáo trình Chương 4, Mục II–III). Người chơi trả lời câu hỏi nhanh và vận dụng lý luận để phân tích tình huống thực tế, tranh luận với đối thủ AI trong một phiên toà giả lập. Thẩm phán AI chấm điểm và nhận xét dựa trên giáo trình.

## Cách chơi (10–15 phút)

- Chọn 1 trong 6 tình huống và vai: *Công tố viên* (bảo vệ luận điểm, khớp giáo trình) hoặc *Luật sư* (phản biện, thử thách hơn).
- Mỗi vòng có hai phần:
  1. **Câu hỏi nhanh**: một câu trắc nghiệm, 30 giây.
  2. **Vấn đề vận dụng**: hai bên lần lượt trình bày.
- Giữa phiên, Thẩm phán hỏi thêm một câu vận dụng.
- Thấy đối thủ sai kiến thức thì bấm **Phản đối!**: đúng +3 điểm, sai −2 điểm.
- Kết quả tính trên thang 100: tranh luận chiếm 60% (kiến thức, vận dụng, dẫn chứng, phản biện), câu hỏi nhanh 40%, cộng điểm phản đối.
- Đối thủ và Thẩm phán dùng Gemini (cấu hình trong `js/config.js`).

Trong phòng xử án, tab **Giáo trình** cho tra cứu toàn bộ 21 mục. Bấm vào mã mục như `[II.1.b]` để mở đúng đoạn tương ứng.

## Chạy trên máy

Giải nén rồi mở `index.html` bằng Chrome, Edge hoặc Firefox. Không cần cài đặt gì.

## Cấu hình AI

Mở `js/config.js` và dán Gemini API key vào `apiKey`. Key lấy miễn phí tại [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

```js
window.APP_CONFIG = {
  apiKey: "AIza...",
  model: "gemini-2.5-flash"
};
```

- Để trống `apiKey` thì game vẫn chơi được, nhưng dùng đối thủ mẫu và điểm tranh luận chỉ là ước lượng.
- Nếu model không tồn tại, game tự chọn một model khả dụng.

**Lưu ý:** repo công khai thì ai mở trang cũng xem được key. Nên giới hạn key theo tên miền trong Google Cloud Console (*Credentials → API key → Website restrictions*: `https://<tài-khoản>.github.io/*`), đặt hạn mức sử dụng, và xoá hoặc đổi key sau buổi trình bày.

## Đưa lên GitHub Pages

1. Giữ đúng cấu trúc thư mục: `index.html`, `style.css`, `js/`, `data/` nằm ở gốc repo.
2. Vào **Settings → Pages**, chọn *Branch* `main` và thư mục `/ (root)`, rồi bấm **Save**.
3. Sau 1–2 phút, trang có địa chỉ `https://<tài-khoản>.github.io/<tên-repo>/`.

## Cấu trúc

| File | Nội dung |
| --- | --- |
| `index.html`, `style.css` | Giao diện |
| `js/app.js` | Luồng chơi, câu hỏi nhanh, phản đối, chấm điểm |
| `js/scene.js` | Cảnh phòng xử án (SVG), nhân vật, bong bóng thoại, hiệu ứng |
| `js/config.js` | API key và model Gemini |
| `js/gemini.js` | Gọi Gemini API từ trình duyệt |
| `js/retrieval.js` | Tra cứu giáo trình để đưa đoạn liên quan vào prompt |
| `data/corpus.js` | Giáo trình cắt thành 21 mục (II.1.a … III.3.b4), có số trang |
| `data/cases.js` | 6 tình huống: bối cảnh, luận điểm, vấn đề vận dụng từng vòng, gợi ý |
| `data/quiz.js` | Ngân hàng 24 câu trắc nghiệm có giải thích |

Thêm tình huống hoặc câu hỏi: sao chép một mục trong `data/cases.js` hoặc `data/quiz.js` rồi sửa nội dung. Mã mục trong `source`, `sources` và trong ngoặc vuông phải khớp với `data/corpus.js`.

## Lưu ý

- AI có thể sai. Hãy đối chiếu với giáo trình.
- Dự án học tập, phi thương mại. Nội dung kiến thức thuộc giáo trình Kinh tế chính trị Mác – Lênin.
