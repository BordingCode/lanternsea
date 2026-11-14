// Kort-vinderrate (0.10.0): tilfældige 15-korts decks fra hele samlingen mod ø 2–7 (Darkness 1).
// For hvert kort: sejrsrate når det er i decket minus når det ikke er. Store + = dominerende, store − = dødt.
// Brug: node tests/kortrate.js [N]
const E = require("../engine.js"), D = require("../cards.js");
const N = +process.argv[2] || 4000, r = E.rng(4242);
const pool = D.CARDS.filter(c => !c.sea);
const stat = {}; pool.forEach(c => stat[c.id] = { inW: 0, inN: 0 });
let W = 0;
for (let g = 0; g < N; g++) {
  const deck = [], cnt = {};
  while (deck.length < 15) { const c = pool[Math.floor(r() * pool.length)]; if ((cnt[c.id] || 0) >= E.deckLimit(c.id)) continue; if (c.c >= 5 && deck.filter(id => D.BY[id].c >= 5).length >= 3) continue; cnt[c.id] = (cnt[c.id] || 0) + 1; deck.push(c.id); }
  const isl = 1 + (g % 6), b = E.newBattle(deck, E.warden(isl, 1), (r() * 1e9) >>> 0); E.startTurn(b);
  let n = 0; while (!b.over && n < 200) { E.aiTurn(b); n++; }
  const won = b.over === "win"; if (won) W++;
  Object.keys(cnt).forEach(id => { stat[id].inN++; if (won) stat[id].inW++; });
}
const all = W / N;
const rows = pool.map(c => { const s = stat[c.id], inR = s.inW / Math.max(1, s.inN), outR = (W - s.inW) / Math.max(1, N - s.inN); return [c.id, c.n, c.set ? "★" : " ", c.r, c.c, ((inR - outR) * 100).toFixed(1), s.inN]; });
rows.sort((a, b) => b[5] - a[5]);
console.log("samlet sejrsrate", (all * 100).toFixed(1) + "%", "over", N, "kampe");
rows.forEach(x => console.log(x.join("\t")));
