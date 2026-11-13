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
// "Klog" spiller: ser vogterens plan (spøgelseskort) som om de allerede stod der, og foretrækker
// at lægge dræbende/holdbare ånder overfor dem — og ellers åbne baner uden trussel (fri skade på lygten).
function smartTurn(b) {
  const me = b.s[0], foe = b.s[1], ghost = [null, null, null, null];
  (b.plan || []).forEach(m => { ghost[m.slot] = { a: D.BY[m.id].a, h: D.BY[m.id].h }; });
  for (let guard = 0; guard < 8; guard++) {
    let best = -1, bestSlot = -1, bestScore = -1e9;
    me.hand.forEach((id, hi) => {
      const c = D.BY[id]; if (c.c > me.lys) return;
      for (let s = 0; s < 4; s++) {
        if (!E.canPlay(b, hi, s)) continue;
        const f = foe.board[s] || ghost[s]; let sc = c.c * 10;
        if (f) sc += (c.a >= f.h ? 10 : 0) + (c.h > f.a ? 6 : -4) + (c.kw.gnist && foe.board[s] ? 6 : 0);
        else sc += 5 + c.a;
        if (sc > bestScore) { bestScore = sc; best = hi; bestSlot = s; }
      }
    });
    if (best < 0) break;
    E.play(b, best, bestSlot); if (b.over) return;
  }
  E.endTurn(b);
}
const SMART = process.argv.includes("--klog");
const N = +process.argv[2] || 400, cardStats = {};
D.ISLANDS.forEach((isl, i) => {
  let w = 0;
  for (let g = 0; g < N; g++) {
    const deck = deckAfter(2 + i, g * 31 + i), b = E.newBattle(deck, i, g + 1000 * i); E.startTurn(b);
    let n = 0; while (!b.over && n < 300) { if (SMART && b.who === 0) smartTurn(b); else E.aiTurn(b); n++; }
    const won = b.over === "win"; if (won) w++;
    new Set(deck).forEach(id => { const s = cardStats[id] = cardStats[id] || [0,0]; s[0]++; if (won) s[1]++; });
  }
  console.log(`ø ${i+1} ${isl.n.padEnd(14)} (${2+i} pakker): spilleren vinder ${(100*w/N).toFixed(0)}%`);
});
console.log("\nKort-vinderrate (når kortet er i decket):");
Object.entries(cardStats).sort((a,b)=>b[1][1]/b[1][0]-a[1][1]/a[1][0]).forEach(([id,[n,w]]) => console.log(`  ${D.BY[id].n.padEnd(20)} ${(100*w/n).toFixed(0)}%  (${n})`));
