const E = require("../engine.js"), D = require("../cards.js"), fs = require("fs"), path = require("path");
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log("FEJL:", m); } };
// regler
let b = E.newBattle(["g1","g1","g1","g1","g1","g1","g1","g1","g1","g1","g1","g1"], 0, 42);
E.startTurn(b); ok(b.s[0].lys === 1, "lys tur 1");
ok(E.play(b, 0, 0), "kan lægge gnistfnug"); ok(b.s[1].hp === 9, "gnist rammer lygten (10-1)");
ok(!E.play(b, 0, 1), "ikke nok lys");
E.endTurn(b); ok(b.s[1].hp === 8, "angreb rammer lygte");
// tåge
b = E.newBattle(Array(12).fill("t1"), 0, 1); E.startTurn(b); b.s[1].board[0] = {id:"t1",a:1,h:1,mh:1,shield:true,el:"taage"};
b.s[0].board[0] = {id:"g3",a:3,h:1,mh:1,shield:false,el:"glod"}; b.s[0].hand=[]; E.endTurn(b);
ok(b.s[1].board[0] && !b.s[1].board[0].shield, "tåge tog første slag");
// pakker
const r = E.rng(7); for (let i = 0; i < 200; i++) { const p = E.openPack(r); ok(p.length === 5 && p.every(id => D.BY[id]), "pakke gyldig"); }
// AI-decks gyldige
D.ISLANDS.forEach(is => ok(is.deck.every(id => D.BY[id]), "ø-deck " + is.n));
// gemte tilstande fra tidligere versioner
const dir = path.join(__dirname, "gemte");
for (const f of fs.readdirSync(dir)) { const s = E.migrate(JSON.parse(fs.readFileSync(path.join(dir, f)))); ok(s.sv === E.SAVE_VERSION && Array.isArray(s.deck) && typeof s.coll === "object", "gemt " + f); }
// balance-bot: AI mod AI med ø-decks, ingen uendelige kampe
let turns = 0, wins = 0;
for (let g = 0; g < 300; g++) { const isl = g % 7; const bb = E.newBattle(D.ISLANDS[(isl + 1) % 7].deck, isl, g + 1); E.startTurn(bb);
  let n = 0; while (!bb.over && n < 200) { E.aiTurn(bb); n++; }
  ok(bb.over, "kamp slutter " + g); turns += n; if (bb.over === "win") wins++; }
console.log("balance: snit halv-ture", (turns / 300).toFixed(1), "spiller-side vinder", wins, "/300");
console.log(fails ? fails + " fejl" : "alle tests ok"); process.exit(fails ? 1 : 0);
