const E = require("../engine.js"), D = require("../cards.js"), fs = require("fs"), path = require("path");
for (const f of ["app.js","engine.js","cards.js","sw.js","art.js","voyage.js"]) { try { require("child_process").execFileSync(process.execPath, ["--check", require("path").join(__dirname, "..", f)]); } catch (e) { console.log("FEJL: syntaks i " + f + "\n" + e.stderr); process.exit(1); } }
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
// ambush
b = E.newBattle(Array(12).fill("g1"), 0, 5); E.startTurn(b); b.s[1].board[2] = {id:"r2",a:1,h:4,mh:4,shield:false,el:"rod"};
b.s[0].hand = ["g3","t1"]; b.s[0].lys = 5; E.play(b, 0, 2); ok(!b.s[0].board[2], "ambush dræber Ashrunner (1 liv) der lander overfor");
E.play(b, 0, 2); ok(b.s[0].board[2] && !b.s[0].board[2].shield, "Veil tager ambush-skaden");
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
ok(Array.isArray(E.migrate({sv:1,coll:{},deck:[]}).packq), "gammel gemt tilstand får packq"); ok(typeof E.migrate({sv:1,coll:{},deck:[]}).miles === "object", "gammel gemt tilstand får miles");
// sejladsen (0.8.0)
{ const V = require("../voyage.js"), rv = E.rng(11);
  for (let i = 0; i < 300; i++) { const L = V.makeLeg(1 + i % 6, rv), f = L.nodes[0].concat(L.nodes[1]);
    ok(f.includes("wild") && f.filter(x => x === "haven").length <= 1 && L.nodes.every(p => p[0] !== p[1] && p.every(t => V.NODES[t])), "overfart gyldig"); }
  for (let to = 1; to < 7; to++) for (let i = 0; i < 30; i++) { const w = V.wildEncounter(to, rv); ok(w.deck.length >= 10 && w.deck.every(id => D.BY[id] && !D.BY[id].sea) && w.hp > 0, "vildt møde gyldigt");
    const bb = E.newBattle(Array(12).fill("g2"), w, i + 1); E.startTurn(bb); let n = 0; while (!bb.over && n < 200) { E.aiTurn(bb); n++; } ok(bb.over, "vild kamp slutter");
    if (w.leader) ok(D.BY[w.leader].r === "r" && w.deck.includes(w.leader) && V.rewardChoices(w.el, {}, rv, w.leader).includes(w.leader), "leder kan vindes");
    const ch = V.rewardChoices(w.el, {}, rv, w.leader); ok(ch.length === 3 && new Set(ch).size === 3 && ch.every(id => D.BY[id]), "3 forskellige belønninger"); }
  ok(D.CARDS.filter(c => c.sea).length === 6, "6 drifters");
  for (let i = 0; i < 500; i++) ok(E.openPack(rv).every(id => !D.BY[id].sea), "drifters aldrig i pakker");
  for (const ev of V.EVENTS) for (const ch of ev.ch) for (let k = 0; k < 20; k++) {
    const S = E.newSave(); ["g1","g1","g2","g3","t1","t2","t3","r1","r2","r3","n1","n1","r4"].forEach(id => S.coll[id] = (S.coll[id]||0)+1); S.deck = ["g1","g1","g2","g3","t1","t2","t3","r1","r2","r3","n1","n1"]; S.island = 2; S.embers = k;
    S.voy = V.makeLeg(2, rv); if (ch.need && !ch.need(S)) continue; const res = ch.fx(S, rv);
    ok(res && typeof res.t === "string" && res.t.length > 5, "hændelse " + ev.id + " giver tekst"); ok(S.embers >= 0 && S.flames <= 3, "hændelse " + ev.id + " holder tilstand gyldig");
    ok(Object.keys(S.coll).every(id => S.coll[id] >= 1 && S.coll[id] <= E.deckLimit(id)) && S.deck.every(id => S.coll[id] >= S.deck.filter(x => x === id).length), "hændelse " + ev.id + " samling/deck konsistent");
    if (res.card) ok(D.BY[res.card], "hændelse kort findes"); }
  { const S = E.newSave(); S.flames = 2; S.voy = V.makeLeg(1, rv); V.rest(S); ok(S.flames === 3, "havn tænder flamme"); V.rest(S); ok(S.flames === 3 && S.voy.boon.hp === 2, "havn ved fulde flammer giver liv"); }
  { const b2 = E.newBattle(Array(15).fill("g2"), 1, 3, { hp: 4, draw: 1 }); ok(b2.s[0].hp === 19 && b2.s[0].hand.length === 5, "voyage-bonus: liv og ekstra kort"); }
  { const b3 = E.newBattle(Array(15).fill("g2"), 1, 3, { hp: -40 }); ok(b3.s[0].hp >= 1, "lygten starter aldrig på 0"); }
  ok(E.migrate({sv:1,coll:{},deck:[]}).voy === null, "gammel gemt tilstand får voy");
  { const S = E.newSave(); S.island = 2; S.quest = { to: 3 }; const L = V.placeTreasure(S, V.makeLeg(3, rv), rv); ok(L.nodes[1].includes("treasure") && !S.quest, "skattekort giver skat på næste overfart");
    const L2 = V.placeTreasure(S, V.makeLeg(4, rv), rv); ok(!L2.nodes[0].concat(L2.nodes[1]).includes("treasure"), "ingen skat uden kort");
    const res = V.dig(S, rv); ok(D.BY[res.card] && S.coll[res.card] >= 1, "skatten giver en ånd");
    const S6 = E.newSave(); S6.island = 6; ok(!V.EVENTS.find(e => e.id === "map").need(S6), "intet skattekort på sidste overfart"); }
  ok(V.NODES.treasure && V.EVENTS.length === 12, "12 historier"); }
// Darkness (0.9.0)
ok(E.newSave().dark === 0 && E.migrate({sv:1,coll:{},deck:[]}).dark === 0, "dark i gemt tilstand");
ok(E.warden(6, 0).hp === D.ISLANDS[6].hp && E.warden(6, 5).hp === Math.round(D.ISLANDS[6].hp * 1.5) && E.warden(1, 2).deck === D.ISLANDS[1].deck, "vogter skaleres med mørke");
ok(D.ISLANDS[1].hp === 16, "Root Witch 16 liv");
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
