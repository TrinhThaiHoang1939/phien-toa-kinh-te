// Tra cứu giáo trình ngay trong trình duyệt: chấm điểm theo âm tiết + cặp âm tiết (bigram), có trọng số IDF.
(function () {
  const STOP = new Set("và là của các những có trong được cho với để một không này đó thì mà như từ khi đã cũng ra vào lại về theo nhiều rất hay hoặc nên do vì nó họ ta chúng tôi bạn phía đây ấy".split(" "));

  function norm(s) {
    return (s || "").normalize("NFC").toLowerCase();
  }
  function syllables(s) {
    return norm(s).match(/[\p{L}\p{N}]+/gu) || [];
  }
  function terms(s) {
    const sy = syllables(s);
    const out = [];
    for (let i = 0; i < sy.length; i++) {
      if (!STOP.has(sy[i]) && sy[i].length > 1) out.push(sy[i]);
      if (i + 1 < sy.length) out.push(sy[i] + " " + sy[i + 1]);
    }
    return out;
  }

  const docs = (window.CORPUS || []).map((c) => {
    const tf = new Map();
    for (const t of terms(c.title + " " + c.title + " " + c.text)) tf.set(t, (tf.get(t) || 0) + 1);
    return { chunk: c, tf, len: c.text.length };
  });
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const N = docs.length || 1;
  const idf = (t) => Math.log(1 + N / (df.get(t) || N));

  function search(query, opts = {}) {
    const k = opts.k || 3;
    const boost = new Set(opts.boost || []);
    const exclude = new Set(opts.exclude || []);
    const q = new Map();
    for (const t of terms(query)) q.set(t, (q.get(t) || 0) + 1);
    const scored = docs
      .filter((d) => !exclude.has(d.chunk.id))
      .map((d) => {
        let s = 0;
        for (const [t, qn] of q) {
          const f = d.tf.get(t);
          if (!f) continue;
          const w = t.includes(" ") ? 2 : 1;
          s += w * idf(t) * Math.min(qn, 3) * (1 + Math.log(f));
        }
        s = s / Math.sqrt(1 + d.len / 1500);
        if (boost.has(d.chunk.id)) s = s * 1.4 + 2;
        return { chunk: d.chunk, score: s };
      })
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, k).filter((x) => x.score > 0).map((x) => x.chunk);
  }

  // Câu trong một đoạn khớp nhất với truy vấn (dùng cho chế độ thử).
  function bestSentence(chunk, query, avoid) {
    const q = new Set(terms(query));
    const sents = chunk.text.split(/(?<=[.!?…])\s+/).filter((s) => s.length > 40 && s.length < 320);
    let best = sents[0] || chunk.text.slice(0, 200), bestScore = -1;
    for (const s of sents) {
      if (avoid && avoid.has(s)) continue;
      let sc = 0;
      for (const t of terms(s)) if (q.has(t)) sc += t.includes(" ") ? 2 : 1;
      if (sc > bestScore) { bestScore = sc; best = s; }
    }
    return best;
  }

  function byId(id) {
    return (window.CORPUS || []).find((c) => c.id === id);
  }

  window.Retrieval = { search, bestSentence, byId, terms };
})();
