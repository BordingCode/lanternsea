// Hvor ofte opnås hvert stjernebillede (Constellation)? Bot-spiller (samme AI som vogterne) med tilfældige decks.
// Brug: node tests/stjerner.js [N]. Sundt: hvert billede kan nås (> 0 %), men ikke i næsten hver kamp.
const D = require("../cards.js"), E = require("../engine.js"), ST = require("../stars.js");
const N = +process.argv[2] || 3000; let seed = 1; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pool = set2 => D.CARDS.filter(c => set2 || !c.set);
function deck(kind, set2) {
  let p = pool(set2); if (kind !== "mix") p = p.filter(c => D.hasLight(c, kind));
  const d = []; while (d.length < 15) { const c = p[Math.floor(R() * p.length)]; if (d.filter(x => x === c.id).length < E.deckLimit(c.id)) d.push(c.id); } return d;
}
for (const set2 of [false, true]) {
  const cnt = {}, kinds = ["glod", "taage", "rod", "mix"]; ST.LIST.forEach(s => cnt[s.id] = 0);
  for (let g = 0; g < N; g++) {
    const b = E.newBattle(deck(kinds[g % 4], set2), E.warden(1 + g % 6, set2 ? 1 : 0), g + 1); E.startTurn(b);
    const got = {}; let n = 0;
    while (!b.over && n < 60) {
      const s0 = b.log.length; E.aiTurn(b); ST.check(b, b.log.slice(s0)).forEach(id => got[id] = 1);
      if (b.over) break; const s1 = b.log.length; E.aiTurn(b); ST.check(b, [], b.log.slice(s1)).forEach(id => { if (id === "trap") got[id] = 1; }); n++;
    }
    Object.keys(got).forEach(id => cnt[id]++);
  }
  console.log(set2 ? "\nMed Starfall (Darkness I):" : "Uden Starfall:");
  ST.LIST.forEach(s => console.log("  " + s.n.padEnd(16) + (100 * cnt[s.id] / N).toFixed(1).padStart(5) + " % af kampe"));
}
