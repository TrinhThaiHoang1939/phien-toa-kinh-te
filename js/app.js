// Phiên Toà Kinh Tế — logic chính.
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const ROLE = { prosecution: "Công tố viên", defense: "Luật sư", judge: "Thẩm phán", player: "Bạn" };
  const CRITERIA = [
    ["knowledge", "Kiến thức"],
    ["application", "Vận dụng"],
    ["evidence", "Dẫn chứng"],
    ["rebuttal", "Phản biện"]
  ];
  const OBJ_WIN = 3, OBJ_LOSE = -2;
  const QUIZ_SECONDS = 30;
  const ID_RE = "I{1,3}\\.\\d\\.[a-zđ]\\d?";
  const CITE_RE = new RegExp("\\[(" + ID_RE + "(?:\\s*[,;]\\s*" + ID_RE + ")*)\\]", "g");

  // ---------------- Cài đặt ----------------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* trình duyệt chặn lưu */ } },
    del(k) { try { localStorage.removeItem(k); } catch (_) { /* bỏ qua */ } }
  };
  const CFG = window.APP_CONFIG || {};
  const settings = { key: (CFG.apiKey || "").trim(), model: CFG.model || Gemini.DEFAULT_MODEL, demo: !(CFG.apiKey || "").trim() };

  // Gọi Gemini; nếu model không tồn tại (404) thì tự chọn model khả dụng rồi thử lại một lần.
  async function askAI(opts) {
    try {
      return await Gemini.generate(Object.assign({ key: settings.key, model: settings.model }, opts));
    } catch (e) {
      if (!/Không tìm thấy model/.test(e.message) || settings.modelChecked) throw e;
      settings.modelChecked = true;
      const list = await Gemini.listModels(settings.key);
      if (!list.length) throw e;
      settings.model = list[0].id;
      renderModeBanner();
      return Gemini.generate(Object.assign({ key: settings.key, model: settings.model }, opts));
    }
  }

  let S = null; // trạng thái phiên đang chơi

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
  const inlineRich = (t) => richText(t).replace(/^<p>|<\/p>$/g, "");
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
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const clamp10 = (n) => clamp(Math.round(Number(n) || 0), 0, 10);
  const sumCrit = (o) => CRITERIA.reduce((a, [k]) => a + clamp10(o && o[k]), 0);
  const uniqChunks = (arr) => { const seen = new Set(); return arr.filter((c) => c && !seen.has(c.id) && seen.add(c.id)); };
  const docsBlock = (chunks) => chunks.map((c) => `[${c.id}] ${c.title} (tr. ${c.pages})\n${c.text}`).join("\n\n---\n\n");
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const radio = (name) => document.querySelector(`input[name="${name}"]:checked`).value;

  // ---------------- Trang chủ ----------------
  let pickedCase = null;

  function renderCases() {
    $("#case-grid").innerHTML = CASES.map((c, i) => `
      <button type="button" class="level-card" data-case="${esc(c.id)}">
        <span class="level-no">${String(i + 1).padStart(2, "0")}</span>
        <span class="level-body">
          <span class="level-topic">${esc(c.topic)}</span>
          <span class="level-title">${esc(c.title)}</span>
          <span class="level-claim">${esc(c.claim)}</span>
          <span class="level-meta">${c.sources.map((id) => `<i>${esc(id)}</i>`).join("")}</span>
        </span>
        <span class="level-go" aria-hidden="true">▸</span>
      </button>`).join("");
  }

  function goPanel(name) {
    document.querySelectorAll("#screen-setup .panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
    window.scrollTo(0, 0);
    if (name === "role") renderPickedCase();
  }

  function renderPickedCase() {
    const i = CASES.findIndex((c) => c.id === pickedCase);
    const c = CASES[i];
    if (!c) return;
    $("#picked-case").innerHTML = `<span class="level-no small">${String(i + 1).padStart(2, "0")}</span>
      <span><span class="level-topic">${esc(c.topic)}</span><b>${esc(c.title)}</b><span class="pc-claim">${esc(c.claim)}</span></span>`;
    updateStart();
  }

  function renderModeBanner() {
    const b = $("#mode-banner");
    if (!settings.demo) {
      b.className = "mode-banner ok";
      b.innerHTML = `Đối thủ &amp; Thẩm phán: <b>Gemini</b> · ${esc(Gemini.cleanModel(settings.model))}`;
    } else {
      b.className = "mode-banner demo";
      b.innerHTML = "Chế độ trình diễn: đối thủ dùng lập luận mẫu từ giáo trình.";
    }
  }

  function updateStart() {
    $("#start-hint").textContent = settings.demo
      ? "Đối thủ mẫu — điểm tranh luận được ước lượng tự động."
      : `Đối thủ và Thẩm phán: Gemini · ${Gemini.cleanModel(settings.model)}`;
  }

  // ---------------- Hồ sơ & giáo trình ----------------
  function renderDossier() {
    {
      const c = S.c, me = S.role, ai = S.aiRole;
      $("#tab-case").innerHTML = `
        <h3>${esc(c.title)}</h3>
        <p class="story">${esc(c.story)}</p>
        <div class="claim"><div class="eyebrow">Luận điểm</div>${esc(c.claim)}</div>
        <div class="stance ${me}"><div class="eyebrow">Bạn — ${ROLE[me]}</div>${esc(c[me])}</div>
        <div class="stance ${ai} dim"><div class="eyebrow">Đối thủ AI — ${ROLE[ai]}</div>${esc(c[ai])}</div>
        <div class="eyebrow">Vấn đề vận dụng từng vòng</div>
        <ol class="focus-list">${c.focus.slice(0, S.rounds).map((f) => "<li>" + esc(f) + "</li>").join("")}</ol>
        <details class="hints"><summary>Gợi ý lập luận cho bạn</summary><ul>${c.hints[me].map((h) => "<li>" + inlineRich(h) + "</li>").join("")}</ul></details>
        <div class="eyebrow">Mục giáo trình liên quan</div>
        <div class="chips">${c.sources.map(chip).join(" ")}</div>`;
    }
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
    if (!$("#verdict").hidden) $("#verdict").hidden = true;
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
  const KIND_LABEL = { question: "Câu hỏi vận dụng", answer: "Trả lời", ruling: "Phán quyết", objection: "Phản đối", opening: "Khai mạc", final: "Tổng kết", quiz: "Câu hỏi nhanh", focus: "Vấn đề vận dụng", explain: "Giải thích" };

  function addMessage(m) {
    m.id = "m" + S.messages.length;
    S.messages.push(m);
    const el = document.createElement("article");
    el.className = `msg ${m.speaker} ${m.kind || "speech"}${m.isPlayer ? " mine" : ""}`;
    const who = m.speaker === "judge" || m.speaker === "player" ? ROLE[m.speaker] : `${ROLE[m.speaker]}${m.isPlayer ? " (Bạn)" : " (AI)"}`;
    const label = KIND_LABEL[m.kind] || (m.round ? `Vòng ${m.round}` : "");
    el.innerHTML = `<header><span class="who">${esc(who)}</span>${label ? `<span class="lbl">${esc(label)}</span>` : ""}</header><div class="body">${richText(m.text)}</div>`;
    $("#transcript").appendChild(el);
    return m;
  }

  function transcriptText(limit) {
    const ms = S.messages;
    return ms.slice(limit ? -limit : 0).map((m) => {
      const who = m.speaker === "judge" ? "Thẩm phán" : m.speaker === "player" ? "Người chơi" : `${ROLE[m.speaker]} (${m.isPlayer ? "người chơi" : "AI"})`;
      const tag = m.kind && KIND_LABEL[m.kind] && m.kind !== "opening" ? ` [${KIND_LABEL[m.kind].toUpperCase()}]` : "";
      return `${who}${tag}: ${m.text}`;
    }).join("\n\n");
  }

  // Ghi biên bản + nhân vật nói bằng bong bóng thoại. Trả về false nếu phiên đã kết thúc giữa chừng.
  async function speak(m, cps) {
    addMessage(m);
    const token = S;
    if (m.speaker !== "player") await Stage.say(m.speaker, m.text, { label: KIND_LABEL[m.kind] || (m.round ? "Vòng " + m.round : ""), cps });
    return token === S;
  }
  const thinking = (who, text) => Stage.thinking(who, text);
  const stopThinking = () => Stage.clearThinking();

  function showRetry(err, fn) {
    stopThinking();
    const el = Stage.alert(`<p>${esc(err.message || err)}</p><div><button type="button" class="btn gold small">Thử lại</button> <button type="button" class="btn ghost small" data-demo>Chơi tiếp với đối thủ mẫu</button></div>`);
    el.querySelector(".btn.gold").onclick = () => { el.remove(); fn(); };
    el.querySelector("[data-demo]").onclick = () => {
      settings.demo = true; renderModeBanner(); updateStart();
      el.remove(); toast("Đã chuyển sang đối thủ mẫu."); fn();
    };
  }

  // ---------------- Bắt đầu ----------------
  function startGame() {
    if (!pickedCase) { goPanel("case"); return; }
    const role = radio("role");
    const rounds = +radio("rounds");
    const c = CASES.find((x) => x.id === pickedCase);
    S = {
      mode: "debate", c, role, aiRole: role === "prosecution" ? "defense" : "prosecution",
      difficulty: radio("difficulty"), rounds, time: +radio("time"),
      messages: [], steps: [], idx: 0, objPoints: 0, objLog: [], objectTarget: null,
      busy: false, aiBusy: false, ended: false, waiting: null, usedSentences: new Set(), verdictData: null,
      quizItems: [], quizIdx: 0, quiz: { asked: 0, correct: 0, wrong: [] }
    };

    {
      const tagged = shuffle(QUIZ.filter((q) => q.cases.includes(c.id)));
      const others = shuffle(QUIZ.filter((q) => !q.cases.includes(c.id) && q.cases.length === 0));
      S.quizItems = tagged.concat(others).slice(0, rounds);
      S.steps.push({ type: "opening" });
      const mid = Math.ceil(rounds / 2);
      for (let r = 1; r <= rounds; r++) {
        S.steps.push({ type: "quiz", round: r }, { type: "focus", round: r });
        S.steps.push({ type: "speech", side: "prosecution", round: r }, { type: "speech", side: "defense", round: r });
        if (r === mid) S.steps.push({ type: "question" }, { type: "answer" });
      }
      S.steps.push({ type: "verdict" });
    }

    $("#transcript").innerHTML = "";
    $("#court-case").textContent = c.title;
    $("#court-topic").textContent = c.topic;
    $("#quiz-score").textContent = "0/0";
    $("#verdict").hidden = true;
    $("#btn-send").innerHTML = "Trình bày <kbd>Ctrl</kbd>+<kbd>Enter</kbd>";
    Stage.setRoles(S.role);
    renderDossier();
    switchTab("case");
    hideChoices();
    setComposer(false, "Phiên toà chuẩn bị bắt đầu…");
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
    if (step) await runStep(step);
  }

  async function runStep(step) {
    const token = S;
    switch (step.type) {
      case "opening": {
        $("#court-phase").textContent = "Khai mạc";
        await sleep(350);
        Stage.focus("judge");
        await Stage.gavel(2);
        if (token !== S) return;
        await Stage.banner("Phiên toà bắt đầu");
        if (token !== S) return;
        const text = `Phiên toà kiến thức bắt đầu.\n\nTình huống: ${S.c.story}\n\nLuận điểm: ${S.c.claim}\n\nMỗi vòng gồm một câu hỏi nhanh và một vấn đề vận dụng. Công tố viên bảo vệ luận điểm, Luật sư phản biện. Hãy dùng đúng khái niệm và dẫn giáo trình.`;
        if (!await speak({ speaker: "judge", kind: "opening", text }, 95)) return;
        await sleep(400);
        return next();
      }
      case "quiz":
        $("#court-phase").textContent = `Vòng ${step.round}/${S.rounds}`;
        await Stage.banner(`Vòng ${step.round}`, 1000);
        if (token !== S) return;
        return quizStep(step);
      case "focus": {
        const f = S.c.focus[step.round - 1];
        S.currentFocus = f;
        if (!await speak({ speaker: "judge", kind: "focus", text: `Vấn đề vòng ${step.round}: ${f}\n\nMời Công tố viên trình bày.`, round: step.round }, 95)) return;
        await sleep(400);
        return next();
      }
      case "speech":
        $("#court-phase").textContent = `Vòng ${step.round}/${S.rounds}`;
        if (step.side === S.role) return playerTurn(step, `Lượt của bạn — ${ROLE[S.role]}, vòng ${step.round}/${S.rounds}`);
        return aiSpeech(step);
      case "question":
        $("#court-phase").textContent = "Câu hỏi vận dụng";
        return judgeQuestion(step);
      case "answer":
        S.currentFocus = S.lastQuestion;
        return playerTurn(step, "Trả lời câu hỏi của Thẩm phán");
      case "verdict":
        $("#court-phase").textContent = "Tổng kết";
        return deliverVerdict(step);
    }
  }

  // ---------------- Câu hỏi nhanh (trắc nghiệm) ----------------
  function hideChoices() {
    $("#choices").hidden = true;
    $("#choices").innerHTML = "";
    $("#composer").classList.remove("mode-choices");
  }

  function askChoice(opts, seconds) {
    return new Promise((resolve) => {
      let done = false;
      const box = $("#choices");
      box.innerHTML = opts.map((o, i) => `<button type="button" class="choice" data-i="${i}"><span class="key">${"ABCD"[i]}</span><span>${esc(o.t)}</span></button>`).join("");
      box.hidden = false;
      $("#composer").classList.add("mode-choices");
      setComposer(false, "Chọn đáp án đúng nhất");
      $("#turn-label").textContent = "Chọn đáp án đúng nhất (phím A–D)";
      const finish = (i) => {
        if (done) return;
        done = true;
        stopTimer();
        document.removeEventListener("keydown", onKey);
        box.querySelectorAll(".choice").forEach((b) => (b.disabled = true));
        resolve(i);
      };
      const onKey = (e) => {
        if (document.querySelector("dialog[open]")) return;
        const i = "abcd".indexOf((e.key || "").toLowerCase());
        if (i >= 0 && i < opts.length) finish(i);
      };
      box.onclick = (e) => { const b = e.target.closest(".choice"); if (b) finish(+b.dataset.i); };
      document.addEventListener("keydown", onKey);
      if (seconds) startTimer(seconds, () => finish(-1));
    });
  }

  function waitContinue(label) {
    return new Promise((resolve) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn gold continue";
      b.innerHTML = (label || "Tiếp tục") + " ▸";
      $("#choices").appendChild(b);
      const go = () => { document.removeEventListener("keydown", onKey); resolve(); };
      const onKey = (e) => { if (e.key === "Enter" && !document.querySelector("dialog[open]")) { e.preventDefault(); go(); } };
      b.onclick = go;
      document.addEventListener("keydown", onKey);
      b.focus();
    });
  }

  async function quizStep(step) {
    const token = S;
    const item = S.quizItems[S.quizIdx++];
    const opts = shuffle(item.options.map((t, i) => ({ t, ok: i === item.answer })));
    if (!await speak({ speaker: "judge", kind: "quiz", text: `Câu hỏi nhanh: ${item.q}` }, 120)) return;
    const pick = await askChoice(opts, QUIZ_SECONDS);
    if (token !== S) return;
    const right = opts.findIndex((o) => o.ok);
    const ok = pick === right;
    S.quiz.asked++;
    if (ok) S.quiz.correct++; else S.quiz.wrong.push({ item, picked: pick >= 0 ? opts[pick].t : null });
    $("#quiz-score").textContent = `${S.quiz.correct}/${S.quiz.asked}`;
    const btns = $("#choices").querySelectorAll(".choice");
    btns[right].classList.add("correct");
    if (pick >= 0 && !ok) btns[pick].classList.add("wrong");
    addMessage({ speaker: "player", kind: "answer", text: pick >= 0 ? `Chọn: ${opts[pick].t}` : "(Hết giờ, không chọn đáp án.)" });
    Stage.focus("judge");
    await Stage.stamp(ok ? "Chính xác" : pick < 0 ? "Hết giờ" : "Chưa đúng", ok);
    if (token !== S) return;
    const text = `${ok ? "Chính xác!" : "Chưa đúng. Đáp án: " + item.options[item.answer] + "."} ${item.explain} [${item.source}]`;
    if (!await speak({ speaker: "judge", kind: "explain", text }, 110)) return;
    await waitContinue("Vào phần tranh luận");
    if (token !== S) return;
    hideChoices();
    setComposer(false, "Đang chờ…");
    next();
  }

  // ---------------- Lượt người chơi ----------------
  function playerTurn(step, label) {
    S.waiting = step;
    setComposer(true, label);
    const f = $("#focus-line");
    f.hidden = !S.currentFocus;
    f.textContent = S.currentFocus ? "Vấn đề: " + S.currentFocus : "";
    if (S.time) startTimer(S.time, () => submitPlayer(true));
    $("#input").focus();
  }

  function setComposer(on, label) {
    $("#input").disabled = !on;
    $("#btn-send").disabled = !on;
    $("#turn-label").textContent = label;
    $("#composer").classList.toggle("live", on);
    if (!on) $("#focus-line").hidden = true;
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
  function startTimer(seconds, onExpire) {
    stopTimer();
    S.timer = { left: seconds * 1000, total: seconds * 1000, last: Date.now(), paused: false, onExpire };
    $("#timer").hidden = false;
    drawTimer();
    S.timer.id = setInterval(() => {
      const t = S && S.timer;
      if (!t) return;
      const now = Date.now();
      if (!t.paused) t.left -= now - t.last;
      t.last = now;
      drawTimer();
      if (t.left <= 0) { const f = t.onExpire; stopTimer(); f && f(); }
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
    ring.style.strokeDashoffset = C * (1 - left / t.total);
    $("#timer").classList.toggle("low", s <= Math.min(20, t.total / 3000));
  }

  // ---------------- Đối thủ AI ----------------
  const DIFF = {
    easy: "DỄ: lập luận ngắn, đơn giản. Trong mỗi lượt, cố ý mắc đúng một lỗi kiến thức dễ nhận ra (ví dụ nhầm cartel với trust, gán sai khái niệm, khái quát quá đà) để người chơi tập phát hiện. Tuyệt đối không tiết lộ đó là lỗi cố ý.",
    normal: "VỪA: lập luận chặt chẽ, bám sát giáo trình, phản biện đúng trọng tâm. Không cố ý mắc lỗi.",
    hard: "KHÓ: sắc bén, tấn công vào điểm yếu nhất trong lập luận của người chơi. Thỉnh thoảng (không phải lượt nào) cài một lập luận nghe hợp lý nhưng sai bản chất theo giáo trình để thử thách người chơi. Tuyệt đối không tiết lộ."
  };

  function lastPlayerText() {
    for (let i = S.messages.length - 1; i >= 0; i--) if (S.messages[i].isPlayer && S.messages[i].kind !== "objection") return S.messages[i].text;
    return "";
  }

  async function aiSpeech(step) {
    const ai = S.aiRole, me = S.role, c = S.c;
    const focus = c.focus[step.round - 1];
    S.aiBusy = true;
    updateObjectBtn();
    thinking(ai, `${ROLE[ai]} đang chuẩn bị lập luận…`);
    const chunks = uniqChunks(Retrieval.search(focus + " " + lastPlayerText() + " " + c[ai], { k: 4, boost: c.sources }));
    const token = S;
    try {
      let text;
      if (settings.demo) {
        await sleep(1100);
        text = demoSpeech(step, chunks);
      } else {
        const opponentSpoke = S.messages.some((m) => m.isPlayer && m.kind === "speech" && m.round === step.round);
        let task = `Vấn đề của vòng này: “${focus}”. Trả lời trực tiếp vấn đề bằng khái niệm và lý luận trong giáo trình, vận dụng vào tình huống.`;
        if (opponentSpoke) task += ` Đồng thời phản biện ý chính trong phát biểu vừa rồi của ${ROLE[me]} (người chơi), chỉ ra chỗ hiểu chưa đúng hoặc thiếu nếu có.`;
        if (step.round === S.rounds) task += " Đây là vòng cuối: kết bằng một câu khái quát.";
        text = await askAI({
          temperature: S.difficulty === "easy" ? 0.9 : 0.75,
          system: `Bạn đóng vai ${ROLE[ai]} trong một trò chơi ôn tập học phần Kinh tế chính trị Mác – Lênin (Chương 4: độc quyền và độc quyền nhà nước). Trò chơi dùng hình thức phiên toà chỉ để tạo không khí; nội dung là KIỂM TRA KIẾN THỨC và VẬN DỤNG LÝ LUẬN. Người chơi là ${ROLE[me]} phía bên kia.

TÌNH HUỐNG: ${c.title}
${c.story}
Luận điểm: ${c.claim}
Lập trường của bạn: ${ai === "prosecution" ? "BẢO VỆ luận điểm. " : "PHẢN BIỆN luận điểm. "}${c[ai]}
Độ khó: ${DIFF[S.difficulty]}

Quy tắc:
- Viết tiếng Việt, mở đầu bằng “Thưa Thẩm phán”.
- Dài ${S.difficulty === "easy" ? "50–80" : "70–120"} từ, một đoạn (lời nói hiện trong bong bóng thoại). Không tiêu đề, không gạch đầu dòng, không markdown, không ghi tên vai.
- Dùng đúng thuật ngữ kinh tế chính trị (tư bản tài chính, tài phiệt, chế độ tham dự, xuất khẩu tư bản, sở hữu nhà nước…). KHÔNG dùng thuật ngữ pháp lý như bị cáo, tội danh, vi phạm pháp luật, bản án, cáo trạng.
- Khi dựa vào giáo trình, ghi mã mục trong ngoặc vuông, ví dụ [II.1.b]. Chỉ dùng mã có trong TÀI LIỆU.
- Không bịa số liệu, trích dẫn hay sự kiện ngoài tài liệu và tình huống.
- Giữ vững lập trường của mình kể cả khi nó trái với kết luận giáo trình: khi đó khai thác những điểm giáo trình thừa nhận (mặt tích cực, biểu hiện mới, sự điều chỉnh).`,
          prompt: `TÀI LIỆU (trích giáo trình):\n${docsBlock(chunks)}\n\nDIỄN BIẾN ĐẾN NAY:\n${transcriptText(10)}\n\nNHIỆM VỤ (vòng ${step.round}/${S.rounds}): ${task}`
        });
        text = text.replace(/^\s*(\*\*)?(Công tố viên|Luật sư)[^:\n]{0,20}:\s*(\*\*)?/i, "").replace(/\*\*/g, "");
      }
      if (token !== S) return;
      stopThinking();
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
    const raw = hints[(step.round - 1) % hints.length];
    const hint = raw.replace(/\s*\[[^\]]+\]\s*$/, "");
    const hintIds = citedIds(raw);
    const chunk = (hintIds[0] && Retrieval.byId(hintIds[0])) || chunks[0] || Retrieval.byId(c.sources[0]);
    const sent = Retrieval.bestSentence(chunk, c.focus[step.round - 1] + " " + hint, S.usedSentences);
    S.usedSentences.add(sent);
    const opponentSpoke = S.messages.some((m) => m.isPlayer && m.kind === "speech" && m.round === step.round);
    const open = opponentSpoke ? `Thưa Thẩm phán, lập luận của ${ROLE[S.role]} chưa đầy đủ.` : "Thưa Thẩm phán, về vấn đề này,";
    const close = step.round === S.rounds
      ? (ai === "prosecution" ? "Vì vậy, luận điểm đã nêu là đúng với lý luận của giáo trình." : "Vì vậy, không thể khẳng định luận điểm một cách tuyệt đối.")
      : "Đề nghị phía bên kia trả lời thẳng vào vấn đề này.";
    return `${open} ${hint}. Giáo trình viết: “${sent.trim()}” [${chunk.id}]. ${close}`;
  }

  // ---------------- Câu hỏi vận dụng của Thẩm phán ----------------
  async function judgeQuestion(step) {
    S.aiBusy = true;
    updateObjectBtn();
    thinking("judge", "Thẩm phán đang chuẩn bị câu hỏi…");
    const token = S;
    try {
      let q;
      if (settings.demo) {
        await sleep(900);
        q = S.c.judgeQuestion;
      } else {
        const mine = S.messages.filter((m) => m.isPlayer).map((m) => m.text).join(" ");
        const chunks = uniqChunks(S.c.sources.map(Retrieval.byId).concat(Retrieval.search(mine + " " + S.c.claim, { k: 3 }))).slice(0, 5);
        const out = await askAI({
          json: true, temperature: 0.5,
          system: "Bạn là Thẩm phán điều khiển một trò chơi ôn tập Kinh tế chính trị Mác – Lênin. Bạn kiểm tra kiến thức và khả năng vận dụng của người chơi, công tâm, ngắn gọn. Chỉ trả lời bằng JSON.",
          prompt: `TÀI LIỆU:\n${docsBlock(chunks)}\n\nTÌNH HUỐNG: ${S.c.title}\nLuận điểm: ${S.c.claim}\n\nDIỄN BIẾN:\n${transcriptText(12)}\n\nĐặt MỘT câu hỏi vận dụng ngắn (tối đa 40 từ) cho ${ROLE[S.role]} (người chơi): kiểm tra một khái niệm then chốt trong giáo trình hoặc chỗ người chơi hiểu chưa rõ, và yêu cầu áp dụng vào tình huống. Không dùng thuật ngữ pháp lý.\nTrả về JSON: {"question": "..."}`
        });
        q = (out && out.question) || S.c.judgeQuestion;
      }
      if (token !== S) return;
      stopThinking();
      S.lastQuestion = q;
      if (!await speak({ speaker: "judge", kind: "question", text: `Câu hỏi dành cho ${ROLE[S.role]}: ${q}` })) return;
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
    const can = !!(S && S.mode === "debate" && !S.ended && !S.busy && !S.aiBusy && S.objectTarget && !S.objectTarget.objected);
    $("#btn-object").disabled = !can;
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
    thinking("judge", "Thẩm phán đang xem xét…");
    try {
      let r;
      if (settings.demo) {
        await sleep(900);
        const ok = reason.length >= 40 && /\[|giáo trình|sai|nhầm|không đúng|bịa|lạc đề|xuyên tạc/i.test(reason);
        r = { sustained: ok, explanation: ok
          ? "Lý do phản đối cụ thể, có căn cứ giáo trình. Đối thủ cần điều chỉnh lại lập luận."
          : "Lý do chưa chỉ ra được lỗi kiến thức cụ thể. (Với đối thủ mẫu, phản đối được chấp nhận nếu lý do đủ cụ thể và có viện dẫn giáo trình.)" };
      } else {
        const chunks = uniqChunks(Retrieval.search(target.text + " " + reason, { k: 4, boost: S.c.sources }));
        r = await askAI({
          json: true, temperature: 0.2,
          system: "Bạn là Thẩm phán điều khiển một trò chơi ôn tập Kinh tế chính trị Mác – Lênin. Bạn phán quyết công tâm, dựa trên giáo trình được cung cấp. Chỉ trả lời bằng JSON.",
          prompt: `TÀI LIỆU:\n${docsBlock(chunks)}\n\nPHÁT BIỂU BỊ PHẢN ĐỐI (của ${ROLE[S.aiRole]}, AI):\n${target.text}\n\nLÝ DO PHẢN ĐỐI (của người chơi):\n${reason}\n\nChấp nhận (sustained = true) chỉ khi phát biểu thực sự có lỗi kiến thức — hiểu sai hoặc xuyên tạc lý luận so với giáo trình, bịa số liệu, hoặc lạc đề — VÀ lý do người chơi chỉ ra đúng lỗi đó. Bất đồng quan điểm thông thường không phải căn cứ. Nếu không, bác bỏ.\nTrả về JSON: {"sustained": true hoặc false, "explanation": "2–3 câu giải thích kiến thức đúng, ghi mã mục giáo trình trong ngoặc vuông nếu cần"}`
        });
      }
      if (token !== S) return;
      stopThinking();
      const ok = !!r.sustained;
      const pts = ok ? OBJ_WIN : OBJ_LOSE;
      S.objPoints += pts;
      S.objLog.push({ quote: target.text, reason, sustained: ok, explanation: r.explanation || "" });
      Stage.focus("judge");
      await Stage.gavel(1);
      await Stage.stamp(ok ? "Chấp nhận" : "Bác bỏ", ok);
      if (token !== S) return;
      await speak({ speaker: "judge", kind: "ruling", text: `${ok ? "Phản đối được chấp nhận" : "Phản đối bị bác bỏ"} (${pts > 0 ? "+" : ""}${pts} điểm). ${r.explanation || ""}` });
    } catch (e) {
      if (token !== S) return;
      stopThinking();
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

  // ---------------- Tổng kết ----------------
  async function deliverVerdict(step) {
    setComposer(false, "Thẩm phán đang tổng kết…");
    S.objectTarget = null;
    S.aiBusy = true;
    updateObjectBtn();
    thinking("judge", "Thẩm phán đang tổng kết…");
    const token = S;
    try {
      let v;
      if (settings.demo) {
        await sleep(1400);
        v = demoVerdict();
      } else {
        const mine = S.messages.filter((m) => m.isPlayer).map((m) => m.text).join(" ");
        const chunks = uniqChunks(S.c.sources.map(Retrieval.byId).concat(Retrieval.search(mine + " " + S.c.claim, { k: 4 }))).slice(0, 6);
        const objSummary = S.objLog.length ? S.objLog.map((o, i) => `${i + 1}. ${o.sustained ? "Chấp nhận" : "Bác bỏ"} — ${o.reason}`).join("\n") : "Không có.";
        const quizSummary = `${S.quiz.correct}/${S.quiz.asked} câu đúng` + (S.quiz.wrong.length ? `; sai: ${S.quiz.wrong.map((w) => w.item.q).join(" | ")}` : "");
        v = await askAI({
          json: true, temperature: 0.3,
          system: "Bạn là Thẩm phán của một trò chơi ôn tập Kinh tế chính trị Mác – Lênin. Bạn đánh giá KIẾN THỨC và khả năng VẬN DỤNG của người chơi một cách nghiêm túc, công bằng, dựa trên giáo trình; nhận xét cụ thể, mang tính xây dựng, như một giảng viên. Chỉ trả lời bằng JSON hợp lệ.",
          prompt: `TÀI LIỆU:\n${docsBlock(chunks)}\n\nTÌNH HUỐNG: ${S.c.title}\nLuận điểm: ${S.c.claim}\nNgười chơi: ${ROLE[S.role]} — ${S.c[S.role]}\nĐối thủ AI: ${ROLE[S.aiRole]} — ${S.c[S.aiRole]}\nCác vấn đề vận dụng: ${S.c.focus.slice(0, S.rounds).join(" | ")}\n\nBIÊN BẢN:\n${transcriptText()}\n\nCâu hỏi nhanh (tính điểm riêng): ${quizSummary}\nPhản đối (tính điểm riêng): ${objSummary}\n\nChấm phần TRANH LUẬN của người chơi và của đối thủ AI theo 4 tiêu chí, mỗi tiêu chí 0–10 (số nguyên):\n- knowledge: hiểu và dùng đúng khái niệm, lý luận giáo trình\n- application: vận dụng lý luận vào tình huống, trả lời đúng vấn đề của từng vòng\n- evidence: dẫn chứng, ví dụ, viện dẫn mục giáo trình\n- rebuttal: phản biện trúng điểm yếu của bên kia\nLượt bỏ trống hoặc sơ sài phải bị điểm thấp. Không thiên vị AI. Bên phản đề vẫn có thể đạt điểm cao nếu khai thác đúng những điểm giáo trình thừa nhận và không xuyên tạc lý luận.\n\nTrả về JSON đúng cấu trúc:\n{"player": {"knowledge": 0, "application": 0, "evidence": 0, "rebuttal": 0},\n "opponent": {"knowledge": 0, "application": 0, "evidence": 0, "rebuttal": 0},\n "comments": {"knowledge": "1 câu nhận xét cho người chơi", "application": "...", "evidence": "...", "rebuttal": "..."},\n "verdict": "Nhận xét tổng quát của Thẩm phán về kiến thức và cách vận dụng của người chơi, 3–4 câu",\n "strengths": ["2–3 điểm mạnh"],\n "improvements": ["2–3 điểm cần cải thiện, nêu rõ khái niệm nào cần ôn"],\n "key_points": [{"point": "kiến thức then chốt của tình huống, 1 câu", "source": "mã mục, ví dụ II.1.b"}]}\nkey_points gồm 3–4 mục.`
        });
      }
      if (token !== S) return;
      stopThinking();
      S.verdictData = v;
      S.ended = true;
      setComposer(false, "Phiên đã kết thúc");
      $("#btn-send").disabled = false;
      $("#btn-send").innerHTML = "Xem kết quả";
      Stage.focus("judge");
      await Stage.gavel(3);
      if (token !== S) return;
      await Stage.banner("Tổng kết", 1100);
      if (token !== S) return;
      await speak({ speaker: "judge", kind: "final", text: v.verdict || "Phiên toà kết thúc." }, 85);
      if (token !== S) return;
      await sleep(600);
      if (token === S) showResult();
    } catch (e) {
      if (token !== S) return;
      showRetry(e, () => deliverVerdict(step));
    }
  }

  function demoVerdict() {
    const mine = S.messages.filter((m) => m.isPlayer && m.kind !== "objection" && m.speaker !== "player").map((m) => m.text);
    const all = mine.join(" ");
    const words = (all.match(/\S+/g) || []).length;
    const cites = citedIds(all).length;
    const focusTerms = new Set(Retrieval.terms(S.c.focus.join(" ")).filter((t) => t.includes(" ")));
    const applied = Retrieval.terms(all).filter((t) => focusTerms.has(t)).length;
    const termHits = new Set(Retrieval.terms(all).filter((t) => t.includes(" ")).filter((t) => S.c.sources.some((id) => Retrieval.byId(id).text.toLowerCase().includes(t)))).size;
    const rebut = (all.match(/đối phương|bên kia|công tố|luật sư|tuy nhiên|nhưng|ngược lại|chưa đúng|không đúng/gi) || []).length;
    const nums = (all.match(/\d+|ví dụ|chẳng hạn/gi) || []).length;
    const base = words < 30 ? 1 : 3;
    const player = {
      knowledge: clamp10(base + termHits / 5 + cites),
      application: clamp10(base + applied / 2 + words / 120),
      evidence: clamp10(base + nums + cites),
      rebuttal: clamp10(base + rebut * 1.2)
    };
    const o = { easy: 5, normal: 6, hard: 7 }[S.difficulty];
    return {
      player, opponent: { knowledge: o, application: o, evidence: o, rebuttal: o },
      comments: {
        knowledge: termHits > 3 ? "Dùng được nhiều khái niệm trong giáo trình." : "Nên dùng chính xác hơn các khái niệm của giáo trình.",
        application: applied > 2 ? "Bám được vấn đề của từng vòng." : "Cần trả lời thẳng vào vấn đề của từng vòng.",
        evidence: cites ? "Có viện dẫn mục giáo trình." : "Nên trích mã mục như [II.1.b] khi nêu khái niệm.",
        rebuttal: rebut ? "Đã phản hồi lập luận của bên kia." : "Chưa phản biện trực tiếp ý của bên kia."
      },
      verdict: "Phiên toà kết thúc. Với đối thủ mẫu, điểm tranh luận được ước lượng tự động theo khái niệm, viện dẫn giáo trình và mức độ phản biện.",
      strengths: [cites ? "Biết viện dẫn giáo trình" : "Tham gia đầy đủ các lượt", rebut ? "Có phản biện bên kia" : "Giữ được lập trường"],
      improvements: ["Nêu định nghĩa khái niệm trước khi vận dụng", "Trích mã mục giáo trình cho mỗi luận cứ"],
      key_points: S.c.hints.prosecution.map((h) => ({ point: h.replace(/\s*\[[^\]]+\]\s*$/, "") + ".", source: citedIds(h)[0] || "" })),
      demo: true
    };
  }

  function rank(score) {
    if (score >= 85) return ["Xuất sắc", "Nắm vững và vận dụng tốt lý luận."];
    if (score >= 70) return ["Giỏi", "Kiến thức chắc, có thể vận dụng sắc bén hơn."];
    if (score >= 50) return ["Đạt", "Nắm được ý chính. Hãy ôn lại các mục bên dưới."];
    return ["Cần ôn thêm", "Hãy xem lại các câu chưa đúng và đọc lại giáo trình."];
  }

  function showResult() {
    const q = S.quiz;
    const quizPct = q.asked ? q.correct / q.asked : 0;
    let score, chips;
    {
      const v = S.verdictData || {};
      const dP = sumCrit(v.player), dA = sumCrit(v.opponent);
      score = clamp(Math.round((dP / 40) * 60 + quizPct * 40 + S.objPoints), 0, 100);
      chips = [
        `<div><b>${dP}/40</b><span>Tranh luận (AI: ${dA}/40)</span></div>`,
        `<div><b>${q.correct}/${q.asked}</b><span>Câu hỏi nhanh</span></div>`,
        `<div><b>${S.objPoints > 0 ? "+" : ""}${S.objPoints}</b><span>Phản đối (${S.objLog.filter((x) => x.sustained).length}/${S.objLog.length} đúng)</span></div>`
      ];
      const p = v.player || {}, o = v.opponent || {};
      $("#v-criteria").innerHTML = CRITERIA.map(([k, name]) => `
        <div class="crit">
          <div class="crit-head"><span>${name}</span><span><b>${clamp10(p[k])}</b> <span class="muted">/ ${clamp10(o[k])} AI</span></span></div>
          <div class="bars"><i class="you" style="width:${clamp10(p[k]) * 10}%"></i><i class="ai" style="width:${clamp10(o[k]) * 10}%"></i></div>
          <div class="crit-note">${esc((v.comments || {})[k] || "")}</div>
        </div>`).join("");
      $("#v-text").innerHTML = richText(v.verdict || "");
      const li = (arr) => (arr || []).map((s) => "<li>" + esc(s) + "</li>").join("") || "<li class='muted'>—</li>";
      $("#v-strengths").innerHTML = li(v.strengths);
      $("#v-improve").innerHTML = li(v.improvements);
      $("#v-keys").innerHTML = (v.key_points || []).map((k) => {
        const id = String(k.source || "").replace(/[\[\]\s]/g, "");
        const c = Retrieval.byId(id);
        return `<li>${esc(k.point)} ${c ? `<button type="button" class="src-chip" data-src="${esc(id)}">${esc(id)} · tr. ${esc(c.pages)}</button>` : ""}</li>`;
      }).join("");
      $("#v-note").textContent = v.demo ? "Đối thủ mẫu: điểm tranh luận chỉ mang tính ước lượng." : `Thẩm phán AI: ${Gemini.cleanModel(settings.model)}. Điểm = tranh luận (60%) + câu hỏi nhanh (40%) + điểm phản đối. AI có thể sai — hãy đối chiếu giáo trình.`;
    }
    const [title, sub] = rank(score);
    $("#v-score").textContent = score;
    $("#v-title").textContent = title;
    $("#v-sub").textContent = `${S.c.title} · ${ROLE[S.role]} · ${sub}`;
    $("#v-breakdown").innerHTML = chips.join("");
    $("#v-review-wrap").hidden = !q.wrong.length;
    $("#v-review").innerHTML = q.wrong.map((w) => `
      <li><div class="rq">${esc(w.item.q)}</div>
      <div class="ra">Đáp án: <b>${esc(w.item.options[w.item.answer])}</b>${w.picked ? ` <span class="muted">— bạn chọn: ${esc(w.picked)}</span>` : ' <span class="muted">— hết giờ</span>'}</div>
      <div class="rx">${esc(w.item.explain)} ${chip(w.item.source)}</div></li>`).join("");
    $("#verdict").className = "verdict " + (score >= 70 ? "win" : score < 50 ? "lose" : "");
    $("#verdict").hidden = false;
  }

  function exportTranscript() {
    if (!S) return;
    const head = [`PHIÊN TOÀ KINH TẾ — ${S.c.title}`, `Vai: ${ROLE[S.role]} · Độ khó: ${S.difficulty} · ${new Date().toLocaleString("vi-VN")}`];
    const lines = head.concat(["", transcriptText(), "", `Câu hỏi nhanh: ${S.quiz.correct}/${S.quiz.asked}`]);
    if (S.verdictData) {
      const p = S.verdictData.player || {}, o = S.verdictData.opponent || {};
      lines.push(`Tranh luận: ${sumCrit(p)}/40 (AI: ${sumCrit(o)}/40)`, `Phản đối: ${S.objPoints}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bien-ban-${S.c.id}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function leaveGame(force, panel) {
    if (!force && S && !S.ended && S.messages.length > 1 && !confirm("Thoát? Tiến trình hiện tại sẽ mất.")) return;
    if (S) stopTimer();
    S = null;
    Stage.reset();
    hideChoices();
    $("#verdict").hidden = true;
    showScreen("setup");
    goPanel(panel || "title");
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
    $("#title-bg").innerHTML = Stage.scene("tt-");
    $("#portrait-prosecution").innerHTML = Stage.portrait("prosecution");
    $("#portrait-defense").innerHTML = Stage.portrait("defense");
    renderCases();
    renderModeBanner();
    updateStart();

    $("#case-grid").addEventListener("click", (e) => {
      const card = e.target.closest(".level-card");
      if (!card) return;
      pickedCase = card.dataset.case;
      document.querySelectorAll(".level-card").forEach((c) => c.classList.toggle("picked", c === card));
      goPanel("role");
    });
    $("#btn-play").addEventListener("click", () => goPanel("case"));
    document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => goPanel(b.dataset.go)));
    $("#btn-how").addEventListener("click", () => $("#dlg-how").showModal());
    $("#btn-about").addEventListener("click", () => $("#dlg-about").showModal());
    $("#btn-start").addEventListener("click", startGame);
    document.addEventListener("click", (e) => {
      const src = e.target.closest(".src-chip");
      if (src) openDoc(src.dataset.src);
    });

    $("#btn-send").addEventListener("click", () => {
      if (S && S.ended) { Stage.skip(); showResult(); return; }
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

    $("#btn-leave").addEventListener("click", () => leaveGame(false, "title"));
    $("#btn-review").addEventListener("click", () => ($("#verdict").hidden = true));
    $("#btn-again").addEventListener("click", () => leaveGame(true, "case"));
    $("#btn-export").addEventListener("click", exportTranscript);
  }

  bind();
})();
