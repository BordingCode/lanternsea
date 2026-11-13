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
// rally
{ const side = { board: [{id:"g3",a:3,h:1,mh:1,el:"glod"}, {id:"r8",a:1,h:3,mh:3,el:"rod"}, null, {id:"g3",a:3,h:1,mh:1,el:"glod"}] };
  ok(E.attackOf(side, 0) === 4, "rally giver naboen +1"); ok(E.attackOf(side, 3) === 3, "rally rammer ikke ikke-naboer"); ok(E.attackOf(side, 1) === 1, "rally giver ikke sig selv"); }
// vogter-evner
const isl = n => D.ISLANDS.findIndex(i => i.trait === n);
b = E.newBattle(Array(12).fill("g1"), isl("gale"), 3); E.startTurn(b); ok(!E.canPlay(b, 0, 0) && E.canPlay(b, 0, 1), "gale lukker bane 1");
ok(b.plan.every(m => m.slot !== 0), "gale: vogterens plan bruger ikke bane 1");
b = E.newBattle(Array(12).fill("r2"), isl("embers"), 3); E.startTurn(b); E.endTurn(b);
b.s[1].hand = ["n1"]; b.s[1].lys = 1; const hp0 = b.s[0].hp; E.play(b, 0, 2); ok(b.s[0].hp === hp0 - 1, "embers: Blaze-ånd får Spark 1");
b = E.newBattle(Array(12).fill("r2"), isl("regrow"), 3); E.startTurn(b); E.endTurn(b);
b.s[1].board[1] = {id:"r2",a:1,h:2,mh:4,shield:false,el:"rod"}; b.s[1].hand = []; b.plan = []; E.aiTurn(b); ok(b.s[1].board[1].h === 3, "regrow heler 1");
b = E.newBattle(Array(12).fill("r2"), isl("tide"), 3); E.startTurn(b); E.endTurn(b); b.s[1].hp = 10; b.s[1].hand = []; b.plan = []; E.aiTurn(b); ok(b.s[1].hp === 12, "tide heler lygten 2");
b = E.newBattle(Array(12).fill("r2"), isl("night"), 3); E.startTurn(b); const h1 = b.s[1].hand.length; E.endTurn(b); ok(b.s[1].hand.length === h1 + 2, "night trækker 2");
D.ISLANDS.forEach(i => ok(!i.trait || D.TRAITS[i.trait], "evne findes " + i.n));
// pakker
const r = E.rng(7); for (let i = 0; i < 200; i++) { const p = E.openPack(r); ok(p.length === 5 && p.every(id => D.BY[id]), "pakke gyldig"); }
for (const el of ["glod","taage","rod"]) for (let i = 0; i < 100; i++) { const p = E.openPack(r, el); ok(p.slice(0, 4).every(id => D.BY[id].el === el), "temapakke " + el); ok(p.length === 5, "temapakke 5 kort"); }
ok(Array.isArray(E.migrate({sv:1,coll:{},deck:[]}).packq), "gammel gemt tilstand får packq");
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
