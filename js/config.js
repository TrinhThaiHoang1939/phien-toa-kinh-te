// ============================================================
// CẤU HÌNH AI CHO BẢN TRÌNH BÀY
// Dán Gemini API key vào apiKey (giữ nguyên dấu ngoặc kép).
// Để trống ("") thì game tự chơi với đối thủ mẫu, không gọi AI.
//
// LƯU Ý: repo công khai thì ai mở trang cũng xem được key này.
// Nên giới hạn key theo tên miền trong Google Cloud Console
// (Credentials → API key → Website restrictions: https://<tài-khoản>.github.io/*)
// và xoá hoặc đổi key sau buổi trình bày.
// ============================================================
window.APP_CONFIG = {
  apiKey: "",
  model: "gemini-2.5-flash" // nếu model không tồn tại, game tự chọn model khả dụng
};
