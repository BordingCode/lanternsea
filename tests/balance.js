// Balance-bot: et "typisk" spillerdeck (start + N pakker) mod hver ø. Begge sider spilles af AI'en.
const E = require("../engine.js"), D = require("../cards.js");
const STARTER = ["g1","g1","g2","g3","t1","t2","t3","r1","r2","r3","n1","n1"];
function deckAfter(packs, seed) {
  const r = E.rng(seed), coll = {}; STARTER.forEach(id => coll[id] = (coll[id]||0)+1);
  for (let i = 0; i < packs; i++) E.openPack(r).forEach(id => coll[id] = Math.min(E.deckLimit(id), (coll[id]||0)+1));
  const pool = []; Object.keys(coll).forEach(id => { for (let k = 0; k < coll[id]; k++) pool.push(id); });
  pool.sort((a,b) => { const A=D.BY[a],B=D.BY[b]; const R={c:0,u:1,r:2,m:3}; return (R[B.r]*3+B.a+B.h-B.c*1.6)-(R[A.r]*3+A.a+A.h-A.c*1.6); });
  return pool.slice(0, 15);
}
const N = +process.argv[2] || 400, cardStats = {};
D.ISLANDS.forEach((isl, i) => {
  let w = 0;
  for (let g = 0; g < N; g++) {
    const deck = deckAfter(2 + i, g * 31 + i), b = E.newBattle(deck, i, g + 1000 * i); E.startTurn(b);
    let n = 0; while (!b.over && n < 300) { E.aiTurn(b); n++; }
    const won = b.over === "win"; if (won) w++;
    new Set(deck).forEach(id => { const s = cardStats[id] = cardStats[id] || [0,0]; s[0]++; if (won) s[1]++; });
  }
  console.log(`ø ${i+1} ${isl.n.padEnd(14)} (${2+i} pakker): spilleren vinder ${(100*w/N).toFixed(0)}%`);
});
console.log("\nKort-vinderrate (når kortet er i decket):");
Object.entries(cardStats).sort((a,b)=>b[1][1]/b[1][0]-a[1][1]/a[1][0]).forEach(([id,[n,w]]) => console.log(`  ${D.BY[id].n.padEnd(20)} ${(100*w/n).toFixed(0)}%  (${n})`));
