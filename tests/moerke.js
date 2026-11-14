// Darkness-balance: et "færdigt" deck (start + N pakker) mod hver vogter på hvert mørke-niveau.
const E = require("../engine.js"), D = require("../cards.js");
const STARTER = ["g1","g1","g2","g3","t1","t2","t3","r1","r2","r3","n1","n1"];
function deckAfter(packs, seed) {
  const r = E.rng(seed), coll = {}; STARTER.forEach(id => coll[id] = (coll[id]||0)+1);
  for (let i = 0; i < packs; i++) E.openPack(r).forEach(id => coll[id] = Math.min(E.deckLimit(id), (coll[id]||0)+1));
  const pool = []; Object.keys(coll).forEach(id => { for (let k = 0; k < coll[id]; k++) pool.push(id); });
  pool.sort((a,b) => { const A=D.BY[a],B=D.BY[b]; const R={c:0,u:1,r:2,m:3}; return (R[B.r]*3+B.a+B.h-B.c*1.6)-(R[A.r]*3+A.a+A.h-A.c*1.6); });
  // samme kurve-regel som spillets "Build for me" (app.js autoDeck): maks 3 til 5+, mindst 6 til ≤2
  const deck = []; let big = 0;
  pool.forEach(id => { if (deck.length >= 15) return; if (D.BY[id].c >= 5) { if (big >= 3) return; big++; } deck.push(id); });
  const cheapN = () => deck.filter(id => D.BY[id].c <= 2).length;
  const rest = pool.filter(id => D.BY[id].c <= 2); deck.forEach(id => { const k = rest.indexOf(id); if (k >= 0) rest.splice(k, 1); });
  for (let i = deck.length - 1; i >= 0 && cheapN() < 6 && rest.length; i--) if (D.BY[deck[i]].c >= 4) deck[i] = rest.shift();
  while (deck.length < 15 && rest.length) deck.push(rest.shift());
  return deck;
}
const N = +process.argv[2] || 300;
for (let dark = 0; dark <= E.MAXDARK; dark++) {
  const row = [];
  for (let i = 0; i < 7; i++) { let w = 0;
    for (let g = 0; g < N; g++) { const b = E.newBattle(deckAfter(12 + dark * 4, g * 17 + i), E.warden(i, dark), g + 99); E.startTurn(b);
      let n = 0; while (!b.over && n < 300) { E.aiTurn(b); n++; } if (b.over === "win") w++; }
    row.push(Math.round(w / N * 100) + "%"); }
  console.log("Darkness " + dark + ": " + row.join("  "));
}
