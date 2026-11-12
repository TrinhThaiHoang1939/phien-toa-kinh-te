// Cảnh phòng xử án: vẽ bằng SVG (khung 1600×900) + bong bóng thoại và hiệu ứng bằng HTML.
(function () {
  "use strict";
  const W = 1600, H = 900;

  // ---------- Hình vẽ ----------
  function scales(cx, cy, s, color) {
    // Biểu tượng cán cân công lý
    return `<g transform="translate(${cx} ${cy}) scale(${s})" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round">
      <line x1="0" y1="-32" x2="0" y2="28"/>
      <circle cx="0" cy="-35" r="4" fill="${color}"/>
      <line x1="-30" y1="-24" x2="30" y2="-24"/>
      <line x1="-30" y1="-24" x2="-40" y2="2"/><line x1="-30" y1="-24" x2="-20" y2="2"/>
      <line x1="30" y1="-24" x2="20" y2="2"/><line x1="30" y1="-24" x2="40" y2="2"/>
      <path d="M-44 2 Q-30 16 -16 2 Z" fill="${color}"/>
      <path d="M16 2 Q30 16 44 2 Z" fill="${color}"/>
      <path d="M-14 34 L14 34 L8 26 L-8 26 Z" fill="${color}"/>
    </g>`;
  }

  function background() {
    let panels = "";
    for (let x = 20; x < W; x += 170) {
      if (x > 540 && x < 1020) continue;
      panels += `<rect x="${x}" y="110" width="140" height="440" rx="6" fill="url(#panel)" stroke="#1d130c" stroke-width="3"/>
                 <rect x="${x + 14}" y="126" width="112" height="190" rx="4" fill="none" stroke="rgba(255,220,160,.08)" stroke-width="2"/>
                 <rect x="${x + 14}" y="332" width="112" height="200" rx="4" fill="none" stroke="rgba(255,220,160,.08)" stroke-width="2"/>`;
    }
    let planks = "";
    for (let i = -6; i <= 14; i++) {
      const xb = -400 + i * 170, xt = 800 + (xb - 800) * 0.42;
      planks += `<line x1="${xt}" y1="600" x2="${xb}" y2="900" stroke="rgba(0,0,0,.28)" stroke-width="2"/>`;
    }
    return `
      <rect width="${W}" height="${H}" fill="url(#wall)"/>
      <rect y="0" width="${W}" height="56" fill="#2a1a10"/>
      <rect y="56" width="${W}" height="10" fill="#7a5530"/>
      <rect y="66" width="${W}" height="6" fill="#3a2414"/>
      ${panels}
      <rect y="560" width="${W}" height="40" fill="#3b2516"/>
      <rect y="560" width="${W}" height="5" fill="#8a6136"/>
      <!-- tấm nền sau thẩm phán -->
      <path d="M590 600 L590 170 Q590 70 800 70 Q1010 70 1010 170 L1010 600 Z" fill="url(#drape)" stroke="#c9a24a" stroke-width="5"/>
      <path d="M612 600 L612 176 Q612 92 800 92 Q988 92 988 176 L988 600 Z" fill="none" stroke="rgba(240,207,126,.35)" stroke-width="2"/>
      <circle cx="800" cy="150" r="52" fill="#3a140f" stroke="#e2bb62" stroke-width="5"/>
      ${scales(800, 152, 1.05, "#f0cf7e")}
      <!-- sàn -->
      <rect y="600" width="${W}" height="300" fill="url(#floor)"/>
      ${planks}
      <rect y="600" width="${W}" height="6" fill="rgba(0,0,0,.35)"/>
      <!-- đèn chiếu -->
      <ellipse id="spot-prosecution" class="spot" cx="250" cy="880" rx="260" ry="50"/>
      <ellipse id="spot-defense" class="spot" cx="1350" cy="880" rx="260" ry="50"/>
      <ellipse id="spot-judge" class="spot" cx="800" cy="620" rx="320" ry="40"/>`;
  }

  // Nhân vật luật sư/công tố, vẽ ở bên trái và quay mặt sang phải (bên phải dùng bản lật gương).
  function lawyer(o) {
    const hairMan = `<path d="M204 478 C192 418 232 398 266 402 C302 406 312 432 306 456 C292 438 262 432 240 440 C224 448 216 462 216 486 Z" fill="${o.hair}"/>
      <path d="M266 402 C286 404 300 414 306 430 C290 420 272 418 256 420 Z" fill="rgba(255,255,255,.08)"/>`;
    const hairWoman = `<circle cx="196" cy="438" r="30" fill="${o.hair}"/>
      <path d="M202 492 C188 420 230 396 268 402 C304 408 314 436 306 460 C296 440 268 430 244 438 C228 446 220 470 222 500 Z" fill="${o.hair}"/>
      <path d="M234 418 C254 410 280 412 296 426" stroke="rgba(255,255,255,.12)" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    const neckwear = o.woman
      ? `<path d="M226 538 L250 572 L274 538 Z" fill="#f5efe4"/><path d="M236 548 Q250 586 264 548 Q262 600 250 606 Q238 600 236 548 Z" fill="#f5efe4" stroke="#d8cfbf"/>`
      : `<path d="M218 534 L250 584 L282 534 Z" fill="#f5efe4"/><path d="M243 548 L257 548 L263 604 L250 620 L237 604 Z" fill="${o.tie}"/>`;
    return `
      <g class="body-anim">
        <!-- tay chỉ (hiện khi phản đối) -->
        <g class="point-arm">
          <path d="M318 556 L476 506 L486 534 L336 604 Z" fill="${o.robe}"/>
          <path d="M470 504 L488 540" stroke="${o.trim}" stroke-width="6"/>
          <circle cx="500" cy="520" r="16" fill="${o.skin}"/>
          <rect x="506" y="512" width="34" height="9" rx="4.5" fill="${o.skin}"/>
        </g>
        <path d="M120 660 L140 568 Q160 534 214 528 L286 528 Q340 534 360 568 L380 660 Z" fill="${o.robe}"/>
        <path d="M214 528 L250 600 L286 528" fill="none" stroke="${o.trim}" stroke-width="6"/>
        <path d="M140 568 Q160 534 214 528" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>
        ${neckwear}
        <rect x="233" y="498" width="36" height="40" rx="10" fill="${o.skinShade}"/>
        <g class="head">
          <ellipse cx="252" cy="462" rx="47" ry="55" fill="${o.skin}"/>
          <ellipse cx="208" cy="470" rx="9" ry="14" fill="${o.skinShade}"/>
          ${o.woman ? hairWoman : hairMan}
          <g class="eyes">
            <ellipse cx="256" cy="464" rx="5" ry="6.5" fill="#1b130e"/>
            <ellipse cx="284" cy="464" rx="5" ry="6.5" fill="#1b130e"/>
            <circle cx="258" cy="462" r="1.6" fill="#fff"/><circle cx="286" cy="462" r="1.6" fill="#fff"/>
          </g>
          <path d="M246 446 L266 ${o.woman ? 444 : 449}" stroke="${o.brow}" stroke-width="4" stroke-linecap="round"/>
          <path d="M276 ${o.woman ? 444 : 449} L294 446" stroke="${o.brow}" stroke-width="4" stroke-linecap="round"/>
          <path d="M292 472 Q302 486 290 490" fill="none" stroke="${o.skinShade}" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="248" cy="488" rx="10" ry="6" fill="rgba(220,110,90,.18)"/>
          <path class="mouth-closed" d="M264 503 Q276 507 288 501" fill="none" stroke="#7a3a2c" stroke-width="3.5" stroke-linecap="round"/>
          <ellipse class="mouth-open" cx="277" cy="504" rx="9" ry="7" fill="#6b2a20"/>
          ${o.woman ? `<circle cx="210" cy="490" r="4" fill="#e2bb62"/>` : ""}
        </g>
      </g>`;
  }

  function podium(cx, label, side) {
    const x = cx - 185;
    return `
      <g class="podium">
        <rect x="${x - 10}" y="618" width="390" height="26" rx="5" fill="#9a6c3c"/>
        <rect x="${x - 10}" y="618" width="390" height="6" rx="3" fill="#c08d55"/>
        <rect x="${x}" y="644" width="370" height="256" fill="url(#podium)"/>
        <rect x="${x + 22}" y="664" width="326" height="210" rx="6" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="4"/>
        <rect x="${x + 22}" y="664" width="326" height="210" rx="6" fill="none" stroke="rgba(255,220,160,.12)" stroke-width="2" transform="translate(2 2)"/>
        <rect x="${cx - 112}" y="690" width="224" height="46" rx="6" fill="url(#brass)" stroke="#6b4a1f" stroke-width="2"/>
        <text x="${cx}" y="720" text-anchor="middle" class="plate">${label}</text>
        <g class="you-tag" id="you-${side}">
          <rect x="${cx - 38}" y="750" width="76" height="30" rx="15" fill="#f0cf7e"/>
          <text x="${cx}" y="771" text-anchor="middle" class="you-text">BẠN</text>
        </g>
        <rect x="${cx + (side === "prosecution" ? 40 : -150)}" y="606" width="110" height="14" rx="2" fill="#efe7d6" transform="rotate(${side === "prosecution" ? -4 : 4} ${cx} 612)"/>
        <rect x="${cx + (side === "prosecution" ? 46 : -144)}" y="600" width="104" height="10" rx="2" fill="#f8f2e6" transform="rotate(${side === "prosecution" ? -2 : 2} ${cx} 606)"/>
      </g>`;
  }

  function judge() {
    return `
      <g id="char-judge" class="char">
        <g class="body-anim">
          <path d="M680 352 L700 300 Q726 276 770 272 L830 272 Q874 276 900 300 L920 352 Z" fill="#141414"/>
          <path d="M770 272 L800 318 L830 272" fill="none" stroke="#c9a24a" stroke-width="5"/>
          <path d="M778 274 L800 304 L822 274 Z" fill="#f5efe4"/>
          <rect x="784" y="246" width="32" height="32" rx="8" fill="#c99577"/>
          <g class="head">
            <ellipse cx="800" cy="224" rx="42" ry="49" fill="#e0b394"/>
            <ellipse cx="757" cy="228" rx="8" ry="12" fill="#c99577"/><ellipse cx="843" cy="228" rx="8" ry="12" fill="#c99577"/>
            <path d="M758 226 C752 186 770 168 800 168 C830 168 848 186 842 226 C838 200 826 190 800 190 C774 190 762 200 758 226 Z" fill="#cfcfcf"/>
            <path d="M762 214 C760 196 772 184 790 182" stroke="#e9e9e9" stroke-width="4" fill="none" stroke-linecap="round"/>
            <g class="eyes"><ellipse cx="785" cy="228" rx="4.5" ry="5.5" fill="#1b130e"/><ellipse cx="815" cy="228" rx="4.5" ry="5.5" fill="#1b130e"/></g>
            <g fill="none" stroke="#3a2a1c" stroke-width="3"><circle cx="785" cy="228" r="12"/><circle cx="815" cy="228" r="12"/><path d="M797 228 L803 228"/></g>
            <path d="M772 210 L796 212 M804 212 L828 210" stroke="#9a9a9a" stroke-width="4" stroke-linecap="round"/>
            <path d="M800 236 L796 250 L804 250" fill="none" stroke="#c18a6c" stroke-width="2.5" stroke-linecap="round"/>
            <path class="mouth-closed" d="M788 260 Q800 264 812 260" fill="none" stroke="#7a3a2c" stroke-width="3.5" stroke-linecap="round"/>
            <ellipse class="mouth-open" cx="800" cy="261" rx="9" ry="6.5" fill="#6b2a20"/>
          </g>
        </g>
      </g>
      <!-- bục thẩm phán -->
      <rect x="500" y="338" width="600" height="28" rx="5" fill="#9a6c3c"/>
      <rect x="500" y="338" width="600" height="6" rx="3" fill="#c08d55"/>
      <rect x="516" y="366" width="568" height="250" fill="url(#bench)"/>
      <rect x="540" y="386" width="160" height="206" rx="6" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="4"/>
      <rect x="900" y="386" width="160" height="206" rx="6" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="4"/>
      <circle cx="800" cy="450" r="46" fill="#3a140f" stroke="#e2bb62" stroke-width="5"/>
      ${scales(800, 452, 0.9, "#f0cf7e")}
      <rect x="700" y="520" width="200" height="44" rx="6" fill="url(#brass)" stroke="#6b4a1f" stroke-width="2"/>
      <text x="800" y="549" text-anchor="middle" class="plate">THẨM PHÁN</text>
      <!-- búa -->
      <ellipse cx="990" cy="340" rx="34" ry="9" fill="#4a2e18"/>
      <rect x="958" y="326" width="64" height="12" rx="4" fill="#6b4425"/>
      <g id="gavel" class="gavel">
        <rect x="900" y="296" width="96" height="9" rx="4" fill="#7a4e2a"/>
        <rect x="986" y="278" width="30" height="44" rx="6" fill="#5a3518"/>
        <rect x="986" y="278" width="30" height="8" rx="3" fill="#c9a24a"/>
        <rect x="986" y="314" width="30" height="8" rx="3" fill="#c9a24a"/>
      </g>`;
  }

  function svg() {
    const pros = { robe: "#7a1f22", trim: "#d4a94e", tie: "#7a1f22", skin: "#f0c6a6", skinShade: "#d9a888", hair: "#2b1a12", brow: "#2b1a12", woman: true };
    const def = { robe: "#1a1d26", trim: "#5d7fb0", tie: "#2f5f9c", skin: "#e7b893", skinShade: "#cc9b77", hair: "#1c140f", brow: "#1c140f", woman: false };
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2618"/><stop offset="1" stop-color="#24170e"/></linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4d321f"/><stop offset="1" stop-color="#3a2516"/></linearGradient>
        <linearGradient id="drape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e2420"/><stop offset="1" stop-color="#4a1814"/></linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d2617"/><stop offset="1" stop-color="#5a3a22"/></linearGradient>
        <linearGradient id="podium" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5230"/><stop offset="1" stop-color="#4f331d"/></linearGradient>
        <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d4829"/><stop offset="1" stop-color="#46301b"/></linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d58a"/><stop offset="1" stop-color="#b8893c"/></linearGradient>
        <radialGradient id="spotg"><stop offset="0" stop-color="rgba(255,226,160,.35)"/><stop offset="1" stop-color="rgba(255,226,160,0)"/></radialGradient>
      </defs>
      ${background()}
      ${judge()}
      <g id="char-prosecution" class="char side-left">${lawyer(pros)}</g>
      <g id="char-defense" class="char side-right"><g transform="translate(${W} 0) scale(-1 1)">${lawyer(def)}</g></g>
      ${podium(250, "CÔNG TỐ VIÊN", "prosecution")}
      ${podium(1350, "LUẬT SƯ", "defense")}
    </svg>`;
  }

  // ---------- Điều khiển ----------
  let root, bubble, bubbleName, bubbleBody, bubbleHint, typing = null, fmt = (t) => t;
  const NAMES = { prosecution: "Công tố viên", defense: "Luật sư", judge: "Thẩm phán" };
  let playerRole = "prosecution";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function mount(el, format) {
    root = el;
    fmt = format || fmt;
    root.innerHTML = `
      <div class="stage-inner">
        ${svg()}
        <div class="bubble" hidden><div class="bubble-name"></div><div class="bubble-body"></div><div class="bubble-hint">Bấm để hiện hết ▸</div></div>
        <div class="fx-banner" hidden></div>
        <div class="fx-objection" hidden><span>PHẢN ĐỐI!</span></div>
        <div class="fx-stamp" hidden></div>
        <div class="stage-alerts"></div>
      </div>`;
    bubble = root.querySelector(".bubble");
    bubbleName = root.querySelector(".bubble-name");
    bubbleBody = root.querySelector(".bubble-body");
    bubbleHint = root.querySelector(".bubble-hint");
    bubble.addEventListener("click", (e) => { if (!e.target.closest(".src-chip")) skip(); });
  }

  function setRoles(role) {
    playerRole = role;
    root.querySelector("#you-prosecution").style.display = role === "prosecution" ? "" : "none";
    root.querySelector("#you-defense").style.display = role === "defense" ? "" : "none";
    reset();
  }

  function reset() {
    skip();
    hideBubble();
    root.querySelectorAll(".char").forEach((c) => c.classList.remove("talking", "active", "pointing", "dim"));
    root.querySelectorAll(".spot").forEach((s) => s.classList.remove("on"));
    root.querySelector(".stage-alerts").innerHTML = "";
  }

  function focus(speaker) {
    ["prosecution", "defense", "judge"].forEach((s) => {
      root.querySelector("#char-" + s).classList.toggle("active", s === speaker);
      root.querySelector("#char-" + s).classList.toggle("dim", !!speaker && s !== speaker);
      root.querySelector("#spot-" + s).classList.toggle("on", s === speaker);
    });
  }

  function placeBubble(speaker, label) {
    bubble.className = "bubble from-" + speaker + (speaker === playerRole ? " mine" : "");
    bubbleName.textContent = (NAMES[speaker] || "") + (speaker === "judge" ? "" : speaker === playerRole ? " (Bạn)" : " (AI)") + (label ? " · " + label : "");
    bubble.hidden = false;
  }

  function hideBubble() {
    if (bubble) bubble.hidden = true;
  }

  function skip() {
    if (typing) typing.finish();
  }

  function say(speaker, text, opts) {
    opts = opts || {};
    skip();
    focus(speaker);
    placeBubble(speaker, opts.label);
    bubble.classList.remove("thinking");
    bubbleBody.textContent = "";
    bubbleHint.hidden = false;
    const ch = root.querySelector("#char-" + speaker);
    ch.classList.add("talking");
    const cps = opts.cps || 70;
    return new Promise((resolve) => {
      let i = 0, done = false, last = performance.now(), raf;
      const finish = () => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        bubbleBody.innerHTML = fmt(text);
        bubbleBody.scrollTop = 0;
        bubbleHint.hidden = true;
        ch.classList.remove("talking");
        typing = null;
        resolve();
      };
      typing = { finish };
      const tick = (now) => {
        if (done) return;
        i = Math.min(text.length, i + ((now - last) / 1000) * cps);
        last = now;
        bubbleBody.textContent = text.slice(0, Math.floor(i));
        bubbleBody.scrollTop = bubbleBody.scrollHeight;
        if (i >= text.length) finish();
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
  }

  function thinking(speaker, label) {
    skip();
    focus(speaker);
    placeBubble(speaker, "");
    bubble.classList.add("thinking");
    bubbleBody.innerHTML = `<span class="dots"><i></i><i></i><i></i></span> <span class="muted-ink">${label || ""}</span>`;
    bubbleHint.hidden = true;
  }

  function clearThinking() {
    if (bubble && bubble.classList.contains("thinking")) { bubble.classList.remove("thinking"); hideBubble(); }
  }

  async function banner(text, ms) {
    const b = root.querySelector(".fx-banner");
    b.textContent = text;
    b.hidden = false;
    b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
    await sleep(ms || 1300);
    b.hidden = true;
  }

  async function objection(side) {
    skip();
    hideBubble();
    const ch = root.querySelector("#char-" + side);
    focus(side);
    ch.classList.add("pointing");
    const o = root.querySelector(".fx-objection");
    o.className = "fx-objection from-" + side;
    o.hidden = false;
    root.classList.remove("shake"); void root.offsetWidth; root.classList.add("shake");
    await sleep(1250);
    o.hidden = true;
    setTimeout(() => ch.classList.remove("pointing"), 2500);
  }

  async function gavel(times) {
    const g = root.querySelector("#gavel");
    for (let k = 0; k < (times || 1); k++) {
      g.classList.remove("strike"); void g.getBoundingClientRect(); g.classList.add("strike");
      root.classList.remove("thud"); void root.offsetWidth; root.classList.add("thud");
      await sleep(420);
    }
    g.classList.remove("strike");
  }

  async function stamp(text, ok) {
    const s = root.querySelector(".fx-stamp");
    s.textContent = text;
    s.className = "fx-stamp " + (ok ? "ok" : "no");
    s.hidden = false;
    await sleep(1300);
    s.hidden = true;
  }

  function alert(html) {
    const el = document.createElement("div");
    el.className = "stage-alert";
    el.innerHTML = html;
    root.querySelector(".stage-alerts").appendChild(el);
    return el;
  }

  window.Stage = { mount, setRoles, reset, say, thinking, clearThinking, hideBubble, banner, objection, gavel, stamp, alert, skip, focus };
})();
