// Balance for vilde ånder på havet: typisk deck (start + pakker) mod vilde møder pr. overfart.
const E = require("../engine.js"), D = require("../cards.js"), V = require("../voyage.js");
const STARTER = ["g1","g1","g2","g3","t1","t2","t3","r1","r2","r3","n1","n1"];
function deckAfter(packs, seed) {
  const r = E.rng(seed), coll = {}; STARTER.forEach(id => coll[id] = (coll[id]||0)+1);
  for (let i = 0; i < packs; i++) E.openPack(r).forEach(id => coll[id] = Math.min(E.deckLimit(id), (coll[id]||0)+1));
  const pool = []; Object.keys(coll).forEach(id => { for (let k = 0; k < coll[id]; k++) pool.push(id); });
  pool.sort((a,b) => { const A=D.BY[a],B=D.BY[b]; const R={c:0,u:1,r:2,m:3}; return (R[B.r]*3+B.a+B.h-B.c*1.6)-(R[A.r]*3+A.a+A.h-A.c*1.6); });
  return pool.slice(0, 15);
}
const N = +process.argv[2] || 400;
for (let to = 1; to < 7; to++) { let w = 0; const r = E.rng(to * 7);
  for (let g = 0; g < N; g++) { const enc = V.wildEncounter(to, r), b = E.newBattle(deckAfter(2 + to, g * 13 + to), enc, g + 1); E.startTurn(b);
    let n = 0; while (!b.over && n < 200) { E.aiTurn(b); n++; } if (b.over === "win") w++; }
  console.log("overfart til ø" + (to + 1) + ": spiller vinder " + Math.round(w / N * 100) + " %"); }
