// Gọi Gemini API trực tiếp từ trình duyệt (không cần máy chủ).
(function () {
  const BASE = "https://generativelanguage.googleapis.com/v1beta";
  const DEFAULT_MODEL = "gemini-2.5-flash";

  function cleanModel(m) {
    return (m || DEFAULT_MODEL).replace(/^models\//, "").trim();
  }

  function friendlyError(status, body) {
    const msg = (body && body.error && body.error.message) || "";
    if (status === 400 && /API key/i.test(msg)) return "API key không hợp lệ. Kiểm tra lại trong Cài đặt AI.";
    if (status === 403) return "Key bị từ chối (403). Có thể key bị giới hạn tên miền hoặc chưa bật Gemini API.";
    if (status === 404) return "Không tìm thấy model. Bấm “Tải danh sách” trong Cài đặt AI để chọn model khác.";
    if (status === 429) return "Hết hạn mức gọi API (429). Đợi một lúc rồi thử lại, hoặc đổi model.";
    if (status >= 500) return "Máy chủ Gemini đang bận (" + status + "). Thử lại sau giây lát.";
    return "Lỗi gọi Gemini (" + status + "): " + msg.slice(0, 200);
  }

  async function request(path, init, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs || 60000);
    try {
      const res = await fetch(BASE + path, Object.assign({}, init, { signal: ctrl.signal }));
      let body = null;
      try { body = await res.json(); } catch (_) { /* không phải JSON */ }
      if (!res.ok) throw new Error(friendlyError(res.status, body));
      return body;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("Gemini phản hồi quá lâu. Kiểm tra mạng rồi thử lại.");
      if (e instanceof TypeError) throw new Error("Không kết nối được tới Gemini. Kiểm tra mạng internet.");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  function extractJSON(text) {
    const t = (text || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    try { return JSON.parse(t); } catch (_) { /* thử tìm khối {...} */ }
    const m = t.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (_) { /* bỏ qua */ } }
    throw new Error("Thẩm phán AI trả lời sai định dạng. Thử lại.");
  }

  async function generate({ key, model, system, prompt, json, temperature, maxTokens }) {
    if (!key) throw new Error("Chưa có API key. Mở Cài đặt AI để nhập key.");
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: temperature == null ? 0.7 : temperature }
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    if (json) body.generationConfig.responseMimeType = "application/json";
    if (maxTokens) body.generationConfig.maxOutputTokens = maxTokens;

    const data = await request("/models/" + encodeURIComponent(cleanModel(model)) + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body)
    }, 90000);

    const cand = data && data.candidates && data.candidates[0];
    const parts = (cand && cand.content && cand.content.parts) || [];
    const text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim();
    if (!text) {
      const reason = (cand && cand.finishReason) || (data && data.promptFeedback && data.promptFeedback.blockReason) || "không rõ";
      throw new Error("Gemini không trả lời (lý do: " + reason + "). Thử lại.");
    }
    return json ? extractJSON(text) : text;
  }

  async function listModels(key) {
    if (!key) throw new Error("Nhập API key trước.");
    const data = await request("/models?pageSize=200", { headers: { "x-goog-api-key": key } }, 20000);
    const skip = /(tts|image|embedding|embed|live|audio|vision|aqa|robotics|computer|native|learnlm|gemma)/i;
    const list = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => ({ id: cleanModel(m.name), label: m.displayName || cleanModel(m.name) }))
      .filter((m) => /gemini/i.test(m.id) && !skip.test(m.id));
    const ver = (id) => parseFloat((id.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
    const rank = (id) => (/flash/.test(id) ? 2 : 0) + (/lite/.test(id) ? -1 : 0) + (/preview|exp/.test(id) ? -0.5 : 0) + (/latest/.test(id) ? -0.2 : 0);
    list.sort((a, b) => ver(b.id) - ver(a.id) || rank(b.id) - rank(a.id) || a.id.localeCompare(b.id));
    return list;
  }

  window.Gemini = { generate, listModels, DEFAULT_MODEL, cleanModel };
})();
