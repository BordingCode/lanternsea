// Beslutningsmåler (nat 7, forskningsnat): betyder spillerens valg noget i kamp?
// Tre spillere med samme deck mod samme vogter:
//   tilfældig — lægger tilfældige kort på tilfældige pladser, til lyset er brugt
//   grådig   — "læg det dyreste du har råd til" (vogterens egen AI)
//   tænker   — prøver ALLE lovlige træk denne tur, simulerer hele runden (min tur + vogterens svar)
//              og vælger den bedste stilling bagefter.
// Mål for beslutninger:
//   - kløften tænker − grådig (sejrsrate): hvor meget det betaler sig at tænke
//   - "enig %": hvor tit tænkerens træk er præcis det samme som det grådige (høj = valget er trivielt)
//   - "reelle valg": gennemsnitligt antal træk-sæt pr. tur, der ender i en mærkbart forskellig stilling
// Brug: node tests/beslutninger.js [N] [--regel=navn]   (regler: se RULES nederst — prøves KUN her, ikke i spillet)
const E = require("../engine.js"), D = require("../cards.js");
const STARTER = ["g1","g1","g2","g3","t1","t2","t3","r1","r2","r3","n1","n1"];
function deckAfter(packs, seed) {
  const r = E.rng(seed), coll = {}; STARTER.forEach(id => coll[id] = (coll[id]||0)+1);
  for (let i = 0; i < packs; i++) E.openPack(r).forEach(id => coll[id] = Math.min(E.deckLimit(id), (coll[id]||0)+1));
  const pool = []; Object.keys(coll).forEach(id => { for (let k = 0; k < coll[id]; k++) pool.push(id); });
  pool.sort((a,b) => { const A=D.BY[a],B=D.BY[b]; const R={c:0,u:1,r:2,m:3}; return (R[B.r]*3+B.a+B.h-B.c*1.6)-(R[A.r]*3+A.a+A.h-A.c*1.6); });
  return pool.slice(0, 15);
}
// --decks=fil.json: brug rigtige decks (fx hentet fra browseren med vaerktoejer/tmp/n7_startdeck.py) i stedet for deckAfter.
const DECKS = (a => a ? JSON.parse(require("fs").readFileSync(a.slice(8))) : null)(process.argv.find(a => a.startsWith("--decks=")));
function clone(b) { const r = b.r; b.r = null; const c = JSON.parse(JSON.stringify(b)); b.r = r; c.r = E.rng(7); c.log = []; return c; }
// Alle lovlige træk-sæt (rækkefølge-uafhængige): liste af [{hi-id, slot}] — kortene identificeres ved id.
function allMoveSets(b, cap) {
  const out = [], p = b.s[0];
  (function rec(hand, lys, taken, cur) {
    out.push(cur.slice()); if (out.length >= cap) return;
    const seen = new Set();
    hand.forEach((id, hi) => {
      if (id == null) return; const c = D.BY[id]; if (c.c > lys || seen.has(id)) return; seen.add(id);
      // undgå dubletter af samme sæt: kun kort med indeks ≥ sidste valgte kortposition
      if (cur.length && hi < cur[cur.length - 1].hi) return;
      for (let s = 0; s < E.SLOTS; s++) {
        if (taken[s] || E.closed(b, s)) continue;
        taken[s] = true; cur.push({ id, slot: s, hi });
        rec(hand.map((x, k) => k === hi ? null : x), lys - c.c, taken, cur);
        cur.pop(); taken[s] = false;
        if (out.length >= cap) return;
      }
    });
  })(p.hand.slice(), p.lys, p.board.map(u => !!u), []);
  return out;
}
function applySet(b, set) { set.forEach(m => { const hi = b.s[0].hand.indexOf(m.id); if (hi >= 0) E.play(b, hi, m.slot); }); }
function boardVal(side) { return side.board.reduce((t, u) => t + (u ? u.a * 1.2 + u.h * 0.8 + (u.shield ? 1 : 0) : 0), 0); }
function evalState(b) {
  if (b.over === "win") return 1e6; if (b.over === "lose") return -1e6;
  const P = b.s[0], F = b.s[1];
  return (P.hp - F.hp) * 1.5 + boardVal(P) - boardVal(F) + P.hand.length * 0.6 - F.hand.length * 0.3;
}
function scoreSet(b, set) {
  const c = clone(b); applySet(c, set);
  if (!c.over) E.endTurn(c);
  if (!c.over) E.aiTurn(c); // vogterens tur (følger sin plan)
  return evalState(c);
}
const key = set => set.map(m => m.id + "@" + m.slot).sort().join(",");
const stats = { turns: 0, agree: 0, real: 0 };
function thinkerTurn(b, rec) {
  const sets = allMoveSets(b, 4000);
  let best = null, bestSc = -Infinity; const scores = [];
  sets.forEach(s => { const sc = scoreSet(b, s); scores.push(sc); if (sc > bestSc) { bestSc = sc; best = s; } });
  if (rec) {
    const greedy = E.chooseMoves(b, 0, b.s[0].lys);
    stats.turns++; if (key(greedy) === key(best)) stats.agree++;
    // "reelle valg": træk der ligger inden for 3 point af det bedste, men ikke er identiske i udfald
    const near = new Set(scores.filter(x => x >= bestSc - 3 && x > -1e5).map(x => x.toFixed(1)));
    stats.real += near.size;
  }
  applySet(b, best); if (!b.over) E.endTurn(b);
}
function greedyTurn(b) { E.aiTurn(b); }
function randomTurn(b) {
  const p = b.s[0];
  for (let g = 0; g < 8; g++) {
    const opts = []; p.hand.forEach((id, hi) => { for (let s = 0; s < E.SLOTS; s++) if (E.canPlay(b, hi, s)) opts.push([hi, s]); });
    if (!opts.length) break; const o = opts[Math.floor(b.r() * opts.length)]; E.play(b, o[0], o[1]); if (b.over) return;
  }
  E.endTurn(b);
}
// "venstre": sådan spiller testrobotten (spiltest.py) — sidste spilbare kort på hånden, på den første ledige plads.
function leftTurn(b) {
  const p = b.s[0];
  for (let g = 0; g < 8; g++) {
    let hi = -1; p.hand.forEach((id, k) => { if (D.BY[id].c <= p.lys) hi = k; });
    if (hi < 0) break; let s = -1; for (let k = 0; k < E.SLOTS; k++) if (E.canPlay(b, hi, k)) { s = k; break; }
    if (s < 0) break; E.play(b, hi, s); if (b.over) return;
  }
  E.endTurn(b);
}
// "rådet": følger kampens ene råd — dyreste kort først, men læg det foran vogterens ånder/falmede kort, hvis muligt.
function adviceTurn(b) {
  const p = b.s[0], want = new Set((b.plan || []).map(m => m.slot)); b.s[1].board.forEach((u, k) => { if (u) want.add(k); });
  for (let g = 0; g < 8; g++) {
    let hi = -1; p.hand.forEach((id, k) => { if (D.BY[id].c <= p.lys && (hi < 0 || D.BY[id].c > D.BY[p.hand[hi]].c)) hi = k; });
    if (hi < 0) break; let s = -1;
    for (let k = 0; k < E.SLOTS; k++) if (E.canPlay(b, hi, k) && want.has(k)) { s = k; break; }
    if (s < 0) for (let k = 0; k < E.SLOTS; k++) if (E.canPlay(b, hi, k)) { s = k; break; }
    if (s < 0) break; E.play(b, hi, s); if (b.over) return;
  }
  E.endTurn(b);
}
function run(kind, N, islands) {
  const res = [];
  islands.forEach(i => {
    let w = 0;
    for (let g = 0; g < N; g++) {
      const deck = DECKS ? DECKS[g % DECKS.length] : deckAfter(2 + i, g * 31 + i), b = E.newBattle(deck, i, g + 1000 * i + 1); E.startTurn(b);
      let n = 0;
      while (!b.over && n < 200) {
        if (b.who === 1) E.aiTurn(b);
        else if (kind === "tænker") thinkerTurn(b, true);
        else if (kind === "grådig") greedyTurn(b);
        else if (kind === "venstre") leftTurn(b);
        else if (kind === "rådet") adviceTurn(b);
        else randomTurn(b);
        n++;
      }
      if (b.over === "win") w++;
    }
    res.push(Math.round(100 * w / N));
  });
  return res;
}
// Regler, der kun prøves af her (omskriver motoren i hukommelsen):
const arg = (process.argv.find(a => a.startsWith("--regel=")) || "").slice(8);
const RULES = require("./regler-forsoeg.js");
if (arg) { if (!RULES[arg]) { console.log("ukendt regel", arg, Object.keys(RULES)); process.exit(1); } RULES[arg](E, D); console.log("REGEL:", arg); }
const N = +process.argv[2] || 60, ISL = (process.argv.find(a => a.startsWith("--oer=")) || "--oer=0,1,2,3,4").slice(6).split(",").map(Number);
const t0 = Date.now();
const lft = run("venstre", N, ISL), adv = run("rådet", N, ISL), rnd = run("tilfældig", N, ISL), gr = run("grådig", N, ISL), th = run("tænker", N, ISL);
console.log("ø        " + ISL.map(i => ("ø" + (i + 1)).padStart(5)).join(""));
console.log("venstre  " + lft.map(x => (x + "%").padStart(5)).join(""));
console.log("tilfældig" + rnd.map(x => (x + "%").padStart(5)).join(""));
console.log("rådet    " + adv.map(x => (x + "%").padStart(5)).join(""));
console.log("grådig   " + gr.map(x => (x + "%").padStart(5)).join(""));
console.log("tænker   " + th.map(x => (x + "%").padStart(5)).join(""));
const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
console.log(`kløft tænker−grådig: ${(avg(th) - avg(gr)).toFixed(1)} point · grådig−tilfældig: ${(avg(gr) - avg(rnd)).toFixed(1)} point`);
console.log(`enig med grådig: ${(100 * stats.agree / stats.turns).toFixed(0)}% af ${stats.turns} ture · reelle valg pr. tur: ${(stats.real / stats.turns).toFixed(2)}`);
console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s)`);
