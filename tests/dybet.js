// Deepreach-balance (0.15.0): et "færdigt" deck fra Mørkhavet (+ k Deep-pakker) mod hver Deepreach-vogter.
// Brug: node tests/dybet.js [N]   — mål: en kurve ca. 90 → 45 % (ankomsten må gerne føles som et nyt, hårdere hav).
const E = require("../engine.js"), D = require("../cards.js");
const STARTER = ["g1","g1","g2","g3","t1","t2","t3","r1","r2","r3","n1","n1"];
const R = { c: 0, u: 1, r: 2, m: 3 };
function deckAfter(seed, deepPacks) {
  const r = E.rng(seed), coll = {}; STARTER.forEach(id => coll[id] = (coll[id] || 0) + 1);
  const add = id => coll[id] = Math.min(E.deckLimit(id), (coll[id] || 0) + 1);
  for (let i = 0; i < 22; i++) E.openPack(r).forEach(add);
  for (let i = 0; i < 6; i++) E.openPack(r, "star").forEach(add);
  for (let i = 0; i < deepPacks; i++) E.openPack(r, "deep").forEach(add);
  const pool = []; Object.keys(coll).forEach(id => { for (let k = 0; k < coll[id]; k++) pool.push(id); });
  pool.sort((a, b) => { const A = D.BY[a], B = D.BY[b]; return (R[B.r] * 3 + B.a + B.h - B.c * 1.6) - (R[A.r] * 3 + A.a + A.h - A.c * 1.6); });
  const deck = []; let big = 0;
  pool.forEach(id => { if (deck.length >= 15) return; if (D.BY[id].c >= 5) { if (big >= 3) return; big++; } deck.push(id); });
  const cheapN = () => deck.filter(id => D.BY[id].c <= 2).length;
  const rest = pool.filter(id => D.BY[id].c <= 2); deck.forEach(id => { const k = rest.indexOf(id); if (k >= 0) rest.splice(k, 1); });
  for (let i = deck.length - 1; i >= 0 && cheapN() < 6 && rest.length; i--) if (D.BY[deck[i]].c >= 4) deck[i] = rest.shift();
  return deck;
}
const N = +process.argv[2] || 300, HP = +(process.argv[3] || 0); // HP = Lantern Glass-bonus
E.setSea(1);
[0, 3, 8].forEach(dp => {
  const row = D.ISLANDS.map((isl, i) => {
    let w = 0;
    for (let g = 0; g < N; g++) {
      const b = E.newBattle(deckAfter(g * 17 + i, dp + i), E.warden(i, 0), g + 999 * i, { hp: HP }); E.startTurn(b);
      let n = 0; while (!b.over && n < 300) { E.aiTurn(b); n++; }
      if (b.over === "win") w++;
    }
    return (100 * w / N).toFixed(0).padStart(3) + "%";
  });
  console.log(`Deep-pakker ${String(dp).padStart(2)}+ø: ` + row.join(" "));
});
E.setSea(0);
