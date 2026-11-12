// Phiên Toà Kinh Tế — logic chính.
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const ROLE = { prosecution: "Công tố viên", defense: "Luật sư", judge: "Thẩm phán" };
  const CRITERIA = [
    ["theory", "Đúng lý luận"],
    ["evidence", "Dẫn chứng"],
    ["rebuttal", "Phản bác"],
    ["logic", "Logic"]
  ];
  const OBJ_WIN = 3, OBJ_LOSE = -2;
  const ID_RE = "I{1,3}\\.\\d\\.[a-zđ]\\d?";
  const CITE_RE = new RegExp("\\[(" + ID_RE + "(?:\\s*[,;]\\s*" + ID_RE + ")*)\\]", "g");

  // ---------------- Cài đặt ----------------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* trình duyệt chặn lưu */ } }
  };
  const settings = Object.assign({ key: "", model: Gemini.DEFAULT_MODEL, demo: false }, store.get("ptkt.settings", {}));
  const aiReady = () => settings.demo || !!settings.key;

  // ---------------- Trạng thái phiên toà ----------------
  let S = null;

  // ---------------- Tiện ích ----------------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function chip(id) {
    const c = Retrieval.byId(id);
    return c ? `<button type="button" class="src-chip" data-src="${esc(id)}" title="${esc(c.title)} · tr. ${esc(c.pages)}">${esc(id)}</button>` : esc(id);
  }
  function richText(text) {
    return esc(text)
      .split(/\n{2,}/)
      .map((p) => "<p>" + p.replace(/\n/g, "<br>").replace(CITE_RE, (_, ids) => ids.split(/\s*[,;]\s*/).map(chip).join(" ")) + "</p>")
      .join("");
  }
  function citedIds(text) {
    const out = new Set();
    String(text).replace(CITE_RE, (_, ids) => { ids.split(/\s*[,;]\s*/).forEach((i) => Retrieval.byId(i) && out.add(i)); return ""; });
    return [...out];
  }
  function toast(msg, ms) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.hidden = true), ms || 4200);
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp10 = (n) => Math.max(0, Math.min(10, Math.round(Number(n) || 0)));
  const sum = (o) => CRITERIA.reduce((a, [k]) => a + clamp10(o && o[k]), 0);
  const uniqChunks = (arr) => { const seen = new Set(); return arr.filter((c) => c && !seen.has(c.id) && seen.add(c.id)); };
  const docsBlock = (chunks) => chunks.map((c) => `[${c.id}] ${c.title} (tr. ${c.pages})\n${c.text}`).join("\n\n---\n\n");

  // ---------------- Màn hình chuẩn bị ----------------
  let pickedCase = null;

  function renderCases() {
    $("#case-grid").innerHTML = CASES.map((c, i) => `
      <button type="button" class="case-card" data-case="${esc(c.id)}">
        <span class="case-no">Vụ án số ${String(i + 1).padStart(2, "0")}</span>
        <span class="case-title">${esc(c.title)}</span>
        <span class="case-topic">${esc(c.topic)}</span>
        <span class="case-claim">${esc(c.claim)}</span>
      </button>`).join("");
  }

  function renderModeBanner() {
    const b = $("#mode-banner");
    if (settings.demo) {
      b.className = "mode-banner demo";
      b.innerHTML = "Đang ở <b>chế độ thử</b>: đối thủ và điểm số chỉ mang tính minh hoạ, không gọi Gemini.";
    } else if (settings.key) {
      b.className = "mode-banner ok";
      b.innerHTML = `Đã sẵn sàng với Gemini · model <b>${esc(Gemini.cleanModel(settings.model))}</b>`;
    } else {
      b.className = "mode-banner warn";
      b.innerHTML = 'Chưa có API key. <button type="button" class="link" data-open-settings>Nhập key</button> hoặc bật chế độ thử trong Cài đặt AI.';
    }
  }

  function updateStart() {
    $("#btn-start").disabled = !pickedCase;
    $("#start-hint").textContent = pickedCase
      ? (aiReady() ? "Sẵn sàng. Toà sẽ khai mạc khi bạn bấm nút." : "Cần nhập API key hoặc bật chế độ thử trước khi mở phiên toà.")
      : "Chọn một vụ án để bắt đầu.";
  }

  // ---------------- Cài đặt AI ----------------
  function fillModelSelect(list, selected) {
    const sel = $("#set-model");
    const ids = list.map((m) => m.id);
    if (selected && !ids.includes(selected)) list = [{ id: selected, label: selected }].concat(list);
    sel.innerHTML = list.map((m) => `<option value="${esc(m.id)}">${esc(m.label === m.id ? m.id : m.label + " — " + m.id)}</option>`).join("");
    sel.value = selected || (list[0] && list[0].id) || "";
  }

  function openSettings() {
    $("#set-key").value = settings.key;
    $("#set-demo").checked = settings.demo;
    fillModelSelect(store.get("ptkt.models", []), Gemini.cleanModel(settings.model));
    $("#settings-msg").textContent = "";
    $("#dlg-settings").showModal();
  }

  async function loadModels() {
    const msg = $("#settings-msg");
    const key = $("#set-key").value.trim();
    msg.className = "small";
    msg.textContent = "Đang tải danh sách model…";
    try {
      const list = await Gemini.listModels(key);
      if (!list.length) throw new Error("Không tìm thấy model nào hỗ trợ tạo văn bản.");
      store.set("ptkt.models", list);
      const cur = $("#set-model").value;
      fillModelSelect(list, list.some((m) => m.id === cur) && cur !== Gemini.DEFAULT_MODEL ? cur : list[0].id);
      msg.className = "small ok";
      msg.textContent = `Tìm thấy ${list.length} model. Đã chọn ${$("#set-model").value}.`;
    } catch (e) {
      msg.className = "small err";
      msg.textContent = e.message;
    }
  }

  async function testKey() {
    const msg = $("#settings-msg");
    msg.className = "small";
    msg.textContent = "Đang kiểm tra…";
    try {
      const out = await Gemini.generate({
        key: $("#set-key").value.trim(), model: $("#set-model").value,
        prompt: "Trả lời đúng một cụm từ: Sẵn sàng", temperature: 0
      });
      msg.className = "small ok";
      msg.textContent = "Kết nối thành công. Gemini trả lời: " + out.slice(0, 60);
    } catch (e) {
      msg.className = "small err";
      msg.textContent = e.message;
    }
  }

  function saveSettings() {
    settings.key = $("#set-key").value.trim();
    settings.model = $("#set-model").value || Gemini.DEFAULT_MODEL;
    settings.demo = $("#set-demo").checked;
    store.set("ptkt.settings", settings);
    renderModeBanner();
    updateStart();
  }

  // ---------------- Hồ sơ & giáo trình ----------------
  function renderDossier() {
    const c = S.c, me = S.role, ai = S.aiRole;
    $("#tab-case").innerHTML = `
      <h3>${esc(c.title)}</h3>
      <p class="story">${esc(c.story)}</p>
      <div class="claim"><div class="eyebrow">Luận điểm đưa ra xét xử</div>${esc(c.claim)}</div>
      <div class="stance ${me}"><div class="eyebrow">Bạn — ${ROLE[me]}</div>${esc(c[me])}</div>
      <div class="stance ${ai} dim"><div class="eyebrow">Đối thủ AI — ${ROLE[ai]}</div>${esc(c[ai])}</div>
      <details class="hints"><summary>Gợi ý lập luận cho bạn</summary><ul>${c.hints[me].map((h) => "<li>" + richText(h).replace(/^<p>|<\/p>$/g, "") + "</li>").join("")}</ul></details>
      <div class="eyebrow">Tài liệu liên quan</div>
      <div class="chips">${c.sources.map(chip).join(" ")}</div>`;
    renderDocList("");
  }

  function renderDocList(q) {
    const list = q.trim() ? Retrieval.search(q, { k: 8 }) : CORPUS;
    $("#doc-list").innerHTML = list.length ? list.map((c) => `
      <details class="doc" id="doc-${esc(c.id)}">
        <summary><span class="doc-id">${esc(c.id)}</span><span class="doc-title">${esc(c.title)}</span><span class="doc-page">tr. ${esc(c.pages)}</span></summary>
        <div class="doc-text">${esc(c.text).split("\n").map((p) => "<p>" + p + "</p>").join("")}</div>
      </details>`).join("") : '<p class="muted small">Không tìm thấy đoạn phù hợp.</p>';
  }

  function openDoc(id) {
    if (!$("#screen-court").classList.contains("active")) return;
    switchTab("docs");
    $("#doc-search").value = "";
    renderDocList("");
    const el = document.getElementById("doc-" + id);
    if (!el) return;
    el.open = true;
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1600);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function switchTab(name) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + name));
  }

  // ---------------- Biên bản ----------------
  function addMessage(m) {
    m.id = "m" + S.messages.length;
    S.messages.push(m);
    const el = document.createElement("article");
    el.className = `msg ${m.speaker} ${m.kind || "speech"}${m.isPlayer ? " mine" : ""}`;
    el.id = m.id;
    const who = m.speaker === "judge" ? "Thẩm phán" : `${ROLE[m.speaker]}${m.isPlayer ? " (Bạn)" : " (AI)"}`;
    const label = { question: "Chất vấn", answer: "Trả lời chất vấn", ruling: "Phán quyết phản đối", objection: "Phản đối", opening: "Khai mạc" }[m.kind] || (m.round ? `Vòng ${m.round}` : "");
    el.innerHTML = `<header><span class="who">${esc(who)}</span>${label ? `<span class="lbl">${esc(label)}</span>` : ""}</header><div class="body">${richText(m.text)}</div>`;
    $("#transcript").appendChild(el);
    scrollDown();
    return m;
  }

  function showTyping(speaker, text) {
    hideTyping();
    Stage.thinking(speaker, text);
    const el = document.createElement("div");
    el.className = `typing ${speaker}`;
    el.id = "typing";
    el.innerHTML = `<span class="dots"><i></i><i></i><i></i></span> ${esc(text)}`;
    $("#transcript").appendChild(el);
    scrollDown();
  }
  function hideTyping() { const t = $("#typing"); if (t) t.remove(); Stage.clearThinking(); }
  function scrollDown() { const t = $("#transcript"); t.scrollTop = t.scrollHeight; }

  function showRetry(err, fn) {
    hideTyping();
    const el = Stage.alert(`<p>${esc(err.message || err)}</p><div><button type="button" class="btn gold small">Thử lại</button> <button type="button" class="btn ghost small" data-demo>Chuyển sang chế độ thử</button></div>`);
    el.querySelector(".btn.gold").onclick = () => { el.remove(); fn(); };
    el.querySelector("[data-demo]").onclick = () => {
      settings.demo = true; store.set("ptkt.settings", settings); renderModeBanner();
      el.remove(); toast("Đã chuyển sang chế độ thử."); fn();
    };
  }

  // Ghi vào biên bản + nhân vật nói bằng bong bóng thoại.
  const KIND_LABEL = { question: "Chất vấn", answer: "Trả lời chất vấn", ruling: "Phán quyết", objection: "Phản đối", opening: "Khai mạc", final: "Tuyên án" };
  async function speak(m, cps) {
    addMessage(m);
    const token = S;
    await Stage.say(m.speaker, m.text, { label: KIND_LABEL[m.kind] || (m.round ? "Vòng " + m.round : ""), cps });
    return token === S;
  }

  function transcriptText(limit) {
    const ms = S.messages.filter((m) => m.kind !== "system");
    return ms.slice(limit ? -limit : 0).map((m) => {
      const who = m.speaker === "judge" ? "Thẩm phán" : `${ROLE[m.speaker]} (${m.isPlayer ? "người chơi" : "AI"})`;
      const tag = m.kind === "objection" ? " [PHẢN ĐỐI]" : m.kind === "ruling" ? " [PHÁN QUYẾT]" : m.kind === "question" ? " [CHẤT VẤN]" : m.kind === "answer" ? " [TRẢ LỜI CHẤT VẤN]" : "";
      return `${who}${tag}: ${m.text}`;
    }).join("\n\n");
  }

  // ---------------- Bắt đầu phiên toà ----------------
  function startTrial() {
    if (!pickedCase) return;
    if (!aiReady()) { openSettings(); toast("Nhập Gemini API key hoặc bật chế độ thử trước."); return; }
    const role = document.querySelector('input[name="role"]:checked').value;
    const rounds = +$("#opt-rounds").value;
    const c = CASES.find((x) => x.id === pickedCase);
    S = {
      c, role, aiRole: role === "prosecution" ? "defense" : "prosecution",
      difficulty: $("#opt-difficulty").value, rounds, time: +$("#opt-time").value,
      messages: [], steps: [], idx: 0, objPoints: 0, objLog: [], objectTarget: null,
      busy: false, ended: false, waiting: null, usedSentences: new Set(), verdictData: null
    };
    S.steps.push({ type: "opening" });
    const mid = Math.ceil(rounds / 2);
    for (let r = 1; r <= rounds; r++) {
      S.steps.push({ type: "speech", side: "prosecution", round: r });
      S.steps.push({ type: "speech", side: "defense", round: r });
      if (r === mid) S.steps.push({ type: "question" }, { type: "answer" });
    }
    S.steps.push({ type: "verdict" });

    $("#transcript").innerHTML = "";
    $("#court-case").textContent = c.title;
    $("#court-topic").textContent = c.topic;
    $("#obj-score").textContent = "0";
    Stage.setRoles(role);
    $("#verdict").hidden = true;
    renderDossier();
    switchTab("case");
    setComposer(false, "Toà chuẩn bị khai mạc…");
    showScreen("court");
    next();
  }

  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === "screen-" + name));
    window.scrollTo(0, 0);
  }

  async function next() {
    if (!S || S.ended) return;
    const step = S.steps[S.idx++];
    if (!step) return;
    await runStep(step);
  }

  async function runStep(step) {
    const token = S;
    switch (step.type) {
      case "opening": {
        $("#court-phase").textContent = "Khai mạc";
        await sleep(400);
        Stage.focus("judge");
        await Stage.gavel(2);
        if (token !== S) return;
        await Stage.banner("Phiên toà bắt đầu");
        if (token !== S) return;
        if (!await speak({
          speaker: "judge", kind: "opening",
          text: `Toà tuyên bố khai mạc phiên xét xử vụ án “${S.c.title}”.\n\nTóm tắt vụ việc: ${S.c.story}\n\nLuận điểm đưa ra xét xử: ${S.c.claim}\n\nPhiên toà gồm ${S.rounds} vòng tranh luận. Công tố viên trình bày trước, Luật sư trình bày sau. Toà mời Công tố viên.`
        }, 90)) return;
        return next();
      }
      case "speech":
        $("#court-phase").textContent = `Vòng ${step.round}/${S.rounds}`;
        if (step.side === "prosecution") { await Stage.banner(`Vòng ${step.round}`, 1000); if (token !== S) return; }
        if (step.side === S.role) return playerTurn(step, `Lượt của bạn — ${ROLE[S.role]}, vòng ${step.round}/${S.rounds}`);
        return aiSpeech(step);
      case "question":
        $("#court-phase").textContent = "Chất vấn";
        return judgeQuestion(step);
      case "answer":
        return playerTurn(step, "Trả lời chất vấn của Thẩm phán");
      case "verdict":
        $("#court-phase").textContent = "Nghị án";
        return deliverVerdict(step);
    }
  }

  // ---------------- Lượt người chơi ----------------
  function playerTurn(step, label) {
    S.waiting = step;
    setComposer(true, label);
    startTimer();
    $("#input").focus();
  }

  function setComposer(on, label) {
    $("#input").disabled = !on;
    $("#btn-send").disabled = !on;
    $("#turn-label").textContent = label;
    $("#composer").classList.toggle("live", on);
    updateObjectBtn();
  }

  async function submitPlayer(auto) {
    if (!S || !S.waiting) return;
    let text = $("#input").value.trim();
    if (!text && !auto) { toast("Hãy trình bày lập luận trước khi gửi."); return; }
    if (!text) text = "(Không trình bày kịp trong thời gian quy định.)";
    const step = S.waiting;
    S.waiting = null;
    stopTimer();
    $("#input").value = "";
    updateCount();
    S.objectTarget = null;
    setComposer(false, "Đang chờ…");
    if (auto) toast("Hết giờ — phần bạn đã viết được nộp tự động.");
    if (!await speak({
      speaker: S.role, isPlayer: true, text, round: step.round,
      kind: step.type === "answer" ? "answer" : "speech", sources: citedIds(text)
    }, 200)) return;
    await sleep(500);
    next();
  }

  // ---------------- Đồng hồ ----------------
  function startTimer() {
    stopTimer();
    if (!S.time) { $("#timer").hidden = true; return; }
    S.timer = { left: S.time * 1000, last: Date.now(), paused: false };
    $("#timer").hidden = false;
    drawTimer();
    S.timer.id = setInterval(() => {
      const t = S && S.timer;
      if (!t) return;
      const now = Date.now();
      if (!t.paused) t.left -= now - t.last;
      t.last = now;
      drawTimer();
      if (t.left <= 0) submitPlayer(true);
    }, 250);
  }
  function stopTimer() {
    if (S && S.timer) clearInterval(S.timer.id);
    if (S) S.timer = null;
    $("#timer").hidden = true;
  }
  function pauseTimer(p) { if (S && S.timer) { S.timer.paused = p; S.timer.last = Date.now(); } }
  function drawTimer() {
    const t = S.timer;
    const left = Math.max(0, t.left);
    const s = Math.ceil(left / 1000);
    $("#timer-text").textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    const C = 2 * Math.PI * 15.5;
    const ring = $("#timer-ring");
    ring.style.strokeDasharray = C;
    ring.style.strokeDashoffset = C * (1 - left / (S.time * 1000));
    $("#timer").classList.toggle("low", s <= 20);
  }

  // ---------------- Đối thủ AI ----------------
  const DIFF = {
    easy: "DỄ: lập luận ngắn và đơn giản. Trong mỗi lượt, cố ý mắc đúng một lỗi lý luận dễ nhận ra (ví dụ nhầm cartel với trust, gán sai khái niệm, hoặc khái quát quá đà) để người chơi tập bắt lỗi. Tuyệt đối không tiết lộ đó là lỗi cố ý.",
    normal: "VỪA: lập luận chặt chẽ, bám sát giáo trình, phản bác đúng trọng tâm. Không cố ý mắc lỗi.",
    hard: "KHÓ: sắc bén, tấn công vào điểm yếu nhất của người chơi, có thể đặt câu hỏi vặn. Thỉnh thoảng (không phải lượt nào) cài một lập luận nghe hợp lý nhưng sai bản chất theo giáo trình — một ngụy biện tinh vi để thử thách người chơi. Tuyệt đối không tiết lộ."
  };

  function lastPlayerText() {
    for (let i = S.messages.length - 1; i >= 0; i--) if (S.messages[i].isPlayer) return S.messages[i].text;
    return "";
  }

  async function aiSpeech(step) {
    const ai = S.aiRole, me = S.role, c = S.c;
    S.aiBusy = true;
    updateObjectBtn();
    showTyping(ai, `${ROLE[ai]} (AI) đang soạn lập luận…`);
    const query = lastPlayerText() + " " + c.claim + " " + c[ai];
    const chunks = uniqChunks(Retrieval.search(query, { k: 4, boost: c.sources }));
    const token = S;
    try {
      let text;
      if (settings.demo) {
        await sleep(1100);
        text = demoSpeech(step, chunks);
      } else {
        const hasOpp = S.messages.some((m) => m.isPlayer && m.kind === "speech");
        let task = hasOpp
          ? `Phản bác trực tiếp ý chính trong phát biểu gần nhất của ${ROLE[me]} (người chơi), rồi củng cố lập trường của bạn.`
          : "Trình bày lập luận mở đầu cho lập trường của bạn.";
        if (step.round === S.rounds) task += " Đây là vòng cuối: kết thúc bằng một câu kết luận mạnh.";
        text = await Gemini.generate({
          key: settings.key, model: settings.model, temperature: S.difficulty === "easy" ? 0.9 : 0.75,
          system: `Bạn đóng vai ${ROLE[ai]} trong một phiên toà giả lập dùng để sinh viên ôn tập học phần Kinh tế chính trị Mác – Lênin (Chương 4: độc quyền và độc quyền nhà nước trong nền kinh tế thị trường). Người chơi là ${ROLE[me]} ở phía bên kia.

VỤ ÁN: ${c.title}
Bối cảnh: ${c.story}
Luận điểm đưa ra xét xử: ${c.claim}
Lập trường của bạn: ${ai === "prosecution" ? "BẢO VỆ luận điểm. " : "PHẢN BÁC luận điểm. "}${c[ai]}
Độ khó: ${DIFF[S.difficulty]}

Quy tắc:
- Viết tiếng Việt, giọng tranh tụng trang trọng, mở đầu bằng “Thưa Hội đồng xét xử”.
- Dài ${S.difficulty === "easy" ? "50–80" : "70–120"} từ (lời nói hiện trong bong bóng thoại nên cần ngắn gọn, sắc), một đoạn. Không dùng tiêu đề, gạch đầu dòng hay định dạng markdown. Không ghi tên vai ở đầu câu trả lời.
- Khi dựa vào giáo trình, ghi mã mục trong ngoặc vuông, ví dụ [II.1.b]. Chỉ dùng mã có trong TÀI LIỆU.
- Không bịa số liệu, trích dẫn hay sự kiện ngoài tài liệu và bối cảnh vụ án.
- Luôn giữ vững lập trường của mình, kể cả khi lập trường đó trái với kết luận của giáo trình: khi đó hãy khai thác những điểm giáo trình thừa nhận (mặt tích cực, biểu hiện mới, sự điều chỉnh) để bảo vệ.`,
          prompt: `TÀI LIỆU (trích giáo trình):\n${docsBlock(chunks)}\n\nDIỄN BIẾN PHIÊN TOÀ ĐẾN NAY:\n${transcriptText(10)}\n\nNHIỆM VỤ: Đây là lượt của bạn ở vòng ${step.round}/${S.rounds}. ${task}`
        });
        text = text.replace(/^\s*(\*\*)?(Công tố viên|Luật sư)[^:\n]{0,20}:\s*(\*\*)?/i, "").replace(/\*\*/g, "");
      }
      if (token !== S) return;
      hideTyping();
      const m = { speaker: ai, isPlayer: false, text, round: step.round, kind: "speech", sources: citedIds(text) };
      if (!await speak(m)) return;
      S.objectTarget = m;
      S.aiBusy = false;
      updateObjectBtn();
      if (S.steps[S.idx] && S.steps[S.idx].type !== "speech") await sleep(1500);
      if (token !== S) return;
      next();
    } catch (e) {
      if (token !== S) return;
      showRetry(e, () => aiSpeech(step));
    }
  }

  function demoSpeech(step, chunks) {
    const ai = S.aiRole, c = S.c;
    const hints = c.hints[ai];
    const hint = hints[(step.round - 1) % hints.length].replace(/\s*\[[^\]]+\]\s*$/, "");
    const hintIds = citedIds(hints[(step.round - 1) % hints.length]);
    const chunk = (hintIds[0] && Retrieval.byId(hintIds[0])) || chunks[0] || Retrieval.byId(c.sources[0]);
    const sent = Retrieval.bestSentence(chunk, lastPlayerText() + " " + hint, S.usedSentences);
    S.usedSentences.add(sent);
    const hasOpp = S.messages.some((m) => m.isPlayer && m.kind === "speech");
    const open = hasOpp
      ? `Thưa Hội đồng xét xử, lập luận vừa rồi của phía ${ROLE[S.role]} chưa đứng vững.`
      : "Thưa Hội đồng xét xử, tôi xin trình bày quan điểm của mình.";
    const close = step.round === S.rounds
      ? (ai === "prosecution" ? "Vì vậy, tôi đề nghị Hội đồng xét xử chấp nhận toàn bộ luận điểm đã nêu." : "Vì vậy, tôi đề nghị Hội đồng xét xử bác bỏ luận điểm buộc tội.")
      : "Đề nghị phía đối phương trả lời thẳng vào vấn đề này.";
    return `${open} ${hint}. Giáo trình viết: “${sent.trim()}” [${chunk.id}]. ${close}`;
  }

  // ---------------- Thẩm phán chất vấn ----------------
  async function judgeQuestion(step) {
    S.aiBusy = true;
    updateObjectBtn();
    showTyping("judge", "Thẩm phán đang xem xét hồ sơ…");
    const token = S;
    try {
      let q;
      if (settings.demo) {
        await sleep(900);
        q = S.c.judgeQuestion;
      } else {
        const mine = S.messages.filter((m) => m.isPlayer).map((m) => m.text).join(" ");
        const chunks = uniqChunks(S.c.sources.map(Retrieval.byId).concat(Retrieval.search(mine + " " + S.c.claim, { k: 3 }))).slice(0, 5);
        const out = await Gemini.generate({
          key: settings.key, model: settings.model, json: true, temperature: 0.5,
          system: "Bạn là Thẩm phán chủ toạ một phiên toà giả lập ôn tập Kinh tế chính trị Mác – Lênin. Bạn công tâm, ngắn gọn, am hiểu giáo trình. Chỉ trả lời bằng JSON.",
          prompt: `TÀI LIỆU:\n${docsBlock(chunks)}\n\nVỤ ÁN: ${S.c.title}\nLuận điểm: ${S.c.claim}\n\nDIỄN BIẾN:\n${transcriptText(12)}\n\nHãy đặt MỘT câu hỏi chất vấn ngắn (tối đa 40 từ) dành cho ${ROLE[S.role]} (người chơi), nhắm vào điểm yếu hoặc chỗ chưa rõ trong lập luận của họ, buộc họ vận dụng kiến thức giáo trình. Nếu người chơi chưa nói gì đáng kể, hãy hỏi một khái niệm then chốt của vụ án.\nTrả về JSON: {"question": "..."}`
        });
        q = (out && out.question) || S.c.judgeQuestion;
      }
      if (token !== S) return;
      hideTyping();
      if (!await speak({ speaker: "judge", kind: "question", text: `Toà yêu cầu ${ROLE[S.role]} trả lời: ${q}` })) return;
      S.aiBusy = false;
      updateObjectBtn();
      next();
    } catch (e) {
      if (token !== S) return;
      showRetry(e, () => judgeQuestion(step));
    }
  }

  // ---------------- Phản đối ----------------
  function updateObjectBtn() {
    const b = $("#btn-object");
    const can = !!(S && !S.ended && !S.busy && !S.aiBusy && S.objectTarget && !S.objectTarget.objected);
    b.disabled = !can;
  }

  function openObjection() {
    if (!S || !S.objectTarget) return;
    pauseTimer(true);
    const t = S.objectTarget.text;
    $("#obj-quote").textContent = t.length > 320 ? t.slice(0, 320) + "…" : t;
    $("#obj-reason").value = "";
    $("#dlg-object").returnValue = "";
    $("#dlg-object").showModal();
    $("#obj-reason").focus();
  }

  async function submitObjection(reason) {
    const target = S.objectTarget;
    if (!target || !reason) { pauseTimer(false); return; }
    target.objected = true;
    S.busy = true;
    updateObjectBtn();
    $("#btn-send").disabled = true;
    const token = S;
    await Stage.objection(S.role);
    if (token !== S) return;
    await speak({ speaker: S.role, isPlayer: true, kind: "objection", text: "Phản đối! " + reason }, 160);
    if (token !== S) return;
    showTyping("judge", "Thẩm phán đang xem xét phản đối…");
    try {
      let r;
      if (settings.demo) {
        await sleep(900);
        const ok = reason.length >= 40 && /\[|giáo trình|sai|nhầm|không đúng|bịa|lạc đề|xuyên tạc/i.test(reason);
        r = { sustained: ok, explanation: ok
          ? "Lý do phản đối cụ thể và có căn cứ. Phía đối phương cần điều chỉnh lập luận cho đúng giáo trình."
          : "Lý do phản đối chưa chỉ ra được sai sót cụ thể trong phát biểu của đối phương. (Chế độ thử: phản đối được chấp nhận khi lý do đủ cụ thể, có viện dẫn giáo trình.)" };
      } else {
        const chunks = uniqChunks(Retrieval.search(target.text + " " + reason, { k: 4, boost: S.c.sources }));
        r = await Gemini.generate({
          key: settings.key, model: settings.model, json: true, temperature: 0.2,
          system: "Bạn là Thẩm phán chủ toạ một phiên toà giả lập ôn tập Kinh tế chính trị Mác – Lênin. Bạn phán quyết công tâm, dựa trên giáo trình được cung cấp. Chỉ trả lời bằng JSON.",
          prompt: `TÀI LIỆU:\n${docsBlock(chunks)}\n\nPHÁT BIỂU BỊ PHẢN ĐỐI (của ${ROLE[S.aiRole]}, AI):\n${target.text}\n\nLÝ DO PHẢN ĐỐI (của ${ROLE[S.role]}, người chơi):\n${reason}\n\nChấp nhận phản đối (sustained = true) chỉ khi phát biểu bị phản đối thực sự có sai sót — hiểu sai hoặc xuyên tạc lý luận so với giáo trình, bịa số liệu, hoặc lạc đề — VÀ lý do người chơi nêu chỉ ra đúng sai sót đó. Bất đồng quan điểm thông thường không phải là căn cứ phản đối. Nếu không, bác bỏ.\nTrả về JSON: {"sustained": true hoặc false, "explanation": "2–3 câu giải thích, ghi mã mục giáo trình trong ngoặc vuông nếu cần"}`
        });
      }
      if (token !== S) return;
      hideTyping();
      const ok = !!r.sustained;
      const pts = ok ? OBJ_WIN : OBJ_LOSE;
      S.objPoints += pts;
      S.objLog.push({ quote: target.text, reason, sustained: ok, explanation: r.explanation || "" });
      $("#obj-score").textContent = (S.objPoints > 0 ? "+" : "") + S.objPoints;
      Stage.focus("judge");
      await Stage.gavel(1);
      await Stage.stamp(ok ? "Chấp nhận" : "Bác bỏ", ok);
      if (token !== S) return;
      await speak({
        speaker: "judge", kind: "ruling",
        text: `${ok ? "Phản đối được chấp nhận" : "Phản đối bị bác bỏ"} (${pts > 0 ? "+" : ""}${pts} điểm). ${r.explanation || ""}`
      });
    } catch (e) {
      if (token !== S) return;
      hideTyping();
      target.objected = false;
      S.messages.pop();
      const last = $("#transcript").lastElementChild;
      if (last && last.classList.contains("objection")) last.remove();
      toast(e.message, 6000);
    } finally {
      if (token === S) {
        S.busy = false;
        $("#btn-send").disabled = !S.waiting;
        updateObjectBtn();
        pauseTimer(false);
      }
    }
  }

  // ---------------- Tuyên án ----------------
  async function deliverVerdict(step) {
    setComposer(false, "Hội đồng xét xử đang nghị án…");
    S.objectTarget = null;
    updateObjectBtn();
    showTyping("judge", "Hội đồng xét xử đang nghị án…");
    const token = S;
    try {
      let v;
      if (settings.demo) {
        await sleep(1400);
        v = demoVerdict();
      } else {
        const mine = S.messages.filter((m) => m.isPlayer).map((m) => m.text).join(" ");
        const chunks = uniqChunks(S.c.sources.map(Retrieval.byId).concat(Retrieval.search(mine + " " + S.c.claim, { k: 4 }))).slice(0, 6);
        const objSummary = S.objLog.length
          ? S.objLog.map((o, i) => `${i + 1}. ${o.sustained ? "Chấp nhận" : "Bác bỏ"} — ${o.reason}`).join("\n")
          : "Không có phản đối nào.";
        v = await Gemini.generate({
          key: settings.key, model: settings.model, json: true, temperature: 0.3,
          system: "Bạn là Thẩm phán chủ toạ một phiên toà giả lập dùng để sinh viên ôn tập Kinh tế chính trị Mác – Lênin. Bạn chấm điểm nghiêm túc, công bằng, dựa trên giáo trình được cung cấp, nhận xét cụ thể và mang tính xây dựng. Chỉ trả lời bằng JSON hợp lệ.",
          prompt: `TÀI LIỆU:\n${docsBlock(chunks)}\n\nVỤ ÁN: ${S.c.title}\nLuận điểm: ${S.c.claim}\nNgười chơi: ${ROLE[S.role]} — ${S.c[S.role]}\nĐối thủ AI: ${ROLE[S.aiRole]} — ${S.c[S.aiRole]}\n\nBIÊN BẢN PHIÊN TOÀ:\n${transcriptText()}\n\nPHẢN ĐỐI (điểm phản đối đã được tính riêng, không cộng vào thang dưới đây):\n${objSummary}\n\nChấm cả người chơi và đối thủ AI theo 4 tiêu chí, mỗi tiêu chí từ 0 đến 10 (số nguyên):\n- theory: vận dụng đúng lý luận giáo trình\n- evidence: dẫn chứng, ví dụ, viện dẫn mục giáo trình\n- rebuttal: phản bác trúng điểm yếu của đối phương\n- logic: lập luận liền mạch, không tự mâu thuẫn\nLượt bỏ trống hoặc quá sơ sài phải bị điểm thấp. Không thiên vị AI. Bên đứng về phản đề vẫn có thể đạt điểm cao nếu khai thác đúng những điểm giáo trình thừa nhận và không xuyên tạc lý luận.\n\nTrả về JSON đúng cấu trúc:\n{"player": {"theory": 0, "evidence": 0, "rebuttal": 0, "logic": 0},\n "opponent": {"theory": 0, "evidence": 0, "rebuttal": 0, "logic": 0},\n "comments": {"theory": "1 câu nhận xét cho người chơi", "evidence": "...", "rebuttal": "...", "logic": "..."},\n "verdict": "Lời tổng kết của Thẩm phán, 3–4 câu, KHÔNG nêu bên thắng",\n "strengths": ["2–3 điểm mạnh của người chơi"],\n "improvements": ["2–3 điều người chơi cần cải thiện"],\n "key_points": [{"point": "kiến thức then chốt của vụ án, 1 câu", "source": "mã mục, ví dụ II.1.b"}]}\nkey_points gồm 3–4 mục.`
        });
      }
      if (token !== S) return;
      hideTyping();
      S.verdictData = v;
      S.ended = true;
      setComposer(false, "Phiên toà đã kết thúc");
      $("#btn-send").disabled = false;
      $("#btn-send").innerHTML = "Xem bản án";
      Stage.focus("judge");
      await Stage.gavel(3);
      if (token !== S) return;
      await Stage.banner("Tuyên án", 1100);
      if (token !== S) return;
      await speak({ speaker: "judge", kind: "final", text: "Hội đồng xét xử tuyên án. " + (v.verdict || "") }, 80);
      if (token !== S) return;
      await sleep(600);
      if (token === S) showVerdict(v);
    } catch (e) {
      if (token !== S) return;
      showRetry(e, () => deliverVerdict(step));
    }
  }

  function demoVerdict() {
    const mine = S.messages.filter((m) => m.isPlayer && m.kind !== "objection").map((m) => m.text);
    const all = mine.join(" ");
    const words = (all.match(/\S+/g) || []).length;
    const cites = citedIds(all).length;
    const termHits = new Set(Retrieval.terms(all).filter((t) => t.includes(" ")).filter((t) => S.c.sources.some((id) => Retrieval.byId(id).text.toLowerCase().includes(t)))).size;
    const rebut = (all.match(/đối phương|phía (công tố|luật sư)|tuy nhiên|nhưng|ngược lại|chưa đúng|không đúng/gi) || []).length;
    const nums = (all.match(/\d+|ví dụ|chẳng hạn/gi) || []).length;
    const base = words < 30 ? 1 : 3;
    const player = {
      theory: clamp10(base + cites * 1.5 + termHits / 6),
      evidence: clamp10(base + nums + cites),
      rebuttal: clamp10(base + rebut * 1.2),
      logic: clamp10(base + words / 70)
    };
    const o = { easy: 5, normal: 6, hard: 7 }[S.difficulty];
    const opponent = { theory: o, evidence: o, rebuttal: o, logic: o };
    const kp = S.c.hints.prosecution.map((h) => ({ point: h.replace(/\s*\[[^\]]+\]\s*$/, "") + ".", source: citedIds(h)[0] || "" }));
    return {
      player, opponent,
      comments: {
        theory: cites ? "Có viện dẫn mục giáo trình, nên tiếp tục giải thích rõ khái niệm." : "Nên viện dẫn mã mục giáo trình như [II.1.b] để tăng sức nặng.",
        evidence: nums ? "Có sử dụng ví dụ, số liệu." : "Còn thiếu ví dụ, số liệu cụ thể từ vụ án hoặc giáo trình.",
        rebuttal: rebut ? "Đã phản hồi lập luận của đối phương." : "Chưa phản bác trực tiếp ý của đối phương.",
        logic: words > 120 ? "Lập luận có độ dài hợp lý." : "Lập luận còn ngắn, cần triển khai đầy đủ hơn."
      },
      verdict: "Đây là bản án ở chế độ thử, điểm được ước lượng tự động theo độ dài, số lần viện dẫn giáo trình và mức độ phản bác. Hãy kết nối Gemini để được Thẩm phán AI chấm điểm và nhận xét chi tiết.",
      strengths: [cites ? "Biết viện dẫn giáo trình" : "Tham gia đầy đủ các lượt", rebut ? "Có phản bác đối phương" : "Giữ được lập trường"],
      improvements: ["Trích mã mục giáo trình khi nêu khái niệm", "Phản bác trực tiếp vào câu chữ của đối phương"],
      key_points: kp, demo: true
    };
  }

  function showVerdict(v) {
    const p = v.player || {}, o = v.opponent || {};
    const you = sum(p) + S.objPoints, ai = sum(o);
    const win = you > ai ? 1 : you < ai ? -1 : 0;
    $("#v-title").textContent = win > 0 ? "Bạn thắng kiện!" : win < 0 ? "Bạn thua kiện" : "Hai bên bất phân thắng bại";
    $("#v-sub").textContent = `${S.c.title} · Bạn là ${ROLE[S.role]}`;
    $("#v-you").textContent = you;
    $("#v-ai").textContent = ai;
    $("#verdict").classList.toggle("win", win > 0);
    $("#verdict").classList.toggle("lose", win < 0);
    $("#v-criteria").innerHTML = CRITERIA.map(([k, name]) => `
      <div class="crit">
        <div class="crit-head"><span>${name}</span><span><b>${clamp10(p[k])}</b> <span class="muted">/ ${clamp10(o[k])} AI</span></span></div>
        <div class="bars"><i class="you" style="width:${clamp10(p[k]) * 10}%"></i><i class="ai" style="width:${clamp10(o[k]) * 10}%"></i></div>
        <div class="crit-note">${esc((v.comments || {})[k] || "")}</div>
      </div>`).join("") + `
      <div class="crit obj"><div class="crit-head"><span>Phản đối</span><span><b>${S.objPoints > 0 ? "+" : ""}${S.objPoints}</b></span></div>
      <div class="crit-note">${S.objLog.length ? S.objLog.filter((x) => x.sustained).length + "/" + S.objLog.length + " phản đối được chấp nhận" : "Không sử dụng quyền phản đối"}</div></div>`;
    $("#v-text").innerHTML = richText(v.verdict || "");
    const li = (arr) => (arr || []).map((s) => "<li>" + esc(s) + "</li>").join("") || "<li class='muted'>—</li>";
    $("#v-strengths").innerHTML = li(v.strengths);
    $("#v-improve").innerHTML = li(v.improvements);
    $("#v-keys").innerHTML = (v.key_points || []).map((k) => {
      const id = String(k.source || "").replace(/[\[\]\s]/g, "");
      return `<li>${esc(k.point)} ${Retrieval.byId(id) ? `<span class="src-ref">${esc(id)} · tr. ${esc(Retrieval.byId(id).pages)}</span>` : ""}</li>`;
    }).join("");
    $("#v-note").textContent = v.demo ? "Chế độ thử: điểm chỉ mang tính minh hoạ." : `Thẩm phán AI: ${Gemini.cleanModel(settings.model)}. Tổng điểm = 4 tiêu chí (tối đa 40) + điểm phản đối.`;
    $("#verdict").hidden = false;
  }

  function exportTranscript() {
    if (!S) return;
    const lines = [`BIÊN BẢN PHIÊN TOÀ — ${S.c.title}`, `Người chơi: ${ROLE[S.role]} · Độ khó: ${S.difficulty} · ${new Date().toLocaleString("vi-VN")}`, ""];
    lines.push(transcriptText());
    if (S.verdictData) {
      const p = S.verdictData.player || {}, o = S.verdictData.opponent || {};
      lines.push("", "KẾT QUẢ", `Bạn: ${sum(p) + S.objPoints} (4 tiêu chí: ${sum(p)}, phản đối: ${S.objPoints})`, `Đối thủ AI: ${sum(o)}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bien-ban-${S.c.id}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function leaveCourt() {
    if (S && !S.ended && S.messages.length > 1 && !confirm("Rời phiên toà? Diễn biến hiện tại sẽ mất.")) return;
    if (S) stopTimer();
    S = null;
    hideTyping();
    Stage.reset();
    $("#verdict").hidden = true;
    $("#btn-send").innerHTML = "Trình bày <kbd>Ctrl</kbd>+<kbd>Enter</kbd>";
    showScreen("setup");
    renderModeBanner();
    updateStart();
  }

  function updateCount() {
    const n = ($("#input").value.match(/\S+/g) || []).length;
    $("#char-count").textContent = n ? n + " từ" : "";
  }

  // ---------------- Gắn sự kiện ----------------
  function bind() {
    $("#corpus-source").textContent = window.CORPUS_SOURCE || "";
    Stage.mount($("#stage"), richText);
    renderCases();
    renderModeBanner();
    updateStart();

    $("#case-grid").addEventListener("click", (e) => {
      const card = e.target.closest(".case-card");
      if (!card) return;
      pickedCase = card.dataset.case;
      document.querySelectorAll(".case-card").forEach((c) => c.classList.toggle("picked", c === card));
      updateStart();
    });
    $("#btn-start").addEventListener("click", startTrial);
    $("#btn-settings").addEventListener("click", openSettings);
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-settings]")) openSettings();
      const src = e.target.closest(".src-chip");
      if (src) openDoc(src.dataset.src);
    });
    $("#btn-load-models").addEventListener("click", loadModels);
    $("#btn-test-key").addEventListener("click", testKey);
    $("#settings-form").addEventListener("submit", (e) => { if (e.submitter && e.submitter.id === "btn-save-settings") saveSettings(); });

    $("#btn-send").addEventListener("click", () => {
      if (S && S.ended) { Stage.skip(); if (S.verdictData) showVerdict(S.verdictData); return; }
      submitPlayer(false);
    });
    $("#input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submitPlayer(false); }
    });
    $("#input").addEventListener("input", updateCount);

    $("#btn-object").addEventListener("click", openObjection);
    $("#dlg-object").addEventListener("close", () => {
      const reason = $("#obj-reason").value.trim();
      if ($("#dlg-object").returnValue === "ok" && reason) submitObjection(reason);
      else pauseTimer(false);
    });

    document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));
    $("#doc-search").addEventListener("input", (e) => renderDocList(e.target.value));

    $("#btn-leave").addEventListener("click", leaveCourt);
    $("#btn-review").addEventListener("click", () => ($("#verdict").hidden = true));
    $("#btn-again").addEventListener("click", () => { if (S) S.ended = true; leaveCourt(); });
    $("#btn-export").addEventListener("click", exportTranscript);
  }

  bind();
})();
