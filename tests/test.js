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
ok(E.warden(6, 0).hp === D.ISLANDS[6].hp && E.warden(6, 5).hp === Math.round(D.ISLANDS[6].hp * 1.2) && E.warden(1, 0).deck === D.ISLANDS[1].deck, "vogter skaleres med mørke");
ok(E.warden(3, 1).deck.length === D.ISLANDS[3].deck.length && E.warden(3, 1).deck.filter(id => D.BY[id].set === 2).length === 2 && D.STARLIT.every(x => x[0].every((id, k) => D.BY[id].c === D.BY[x[1][k]].c)) && D.ISLANDS.every((is, i) => E.warden(i, 1).deck.filter(id => D.BY[id].set === 2).length === 2) && D.STARLIT.length === D.ISLANDS.length, "Starlit-vogtere i Darkness");
ok(D.ISLANDS[1].hp === 16, "Root Witch 16 liv");
// 0.10.0 Starfall: twin-lys, Shine, Bloom, Starfall-pakker
{ const U = id => ({ id, a: D.BY[id].a, h: D.BY[id].h, mh: D.BY[id].h, shield: !!D.BY[id].kw.taage, el: D.BY[id].el });
  let side = { board: [U("g2"), U("s1"), U("t3"), null] };
  ok(E.attackOf(side, 0) === 3, "Blaze Kin tæller Blaze/Mist-twin"); ok(E.attackOf(side, 2) === 3, "Mist Kin tæller Blaze/Mist-twin");
  ok(E.attackOf(side, 1) === 4, "twin Kin tæller begge lys");
  side = { board: [U("r3"), U("s13"), null, null] }; ok(E.attackOf(side, 0) === 3 && E.attackOf(side, 1) === 5, "alle-lys-mytisk deler lys med alle");
  let bb = E.newBattle(Array(12).fill("r2"), 0, 9); E.startTurn(bb); bb.s[0].board[0] = U("r2"); bb.s[0].board[2] = U("r2"); bb.s[0].hand = ["s5"]; bb.s[0].lys = 5;
  E.play(bb, 0, 1); ok(bb.s[0].board[0].a === 2 && bb.s[0].board[0].h === 5 && bb.s[0].board[2].mh === 5, "Shine giver naboer +1/+1");
  bb = E.newBattle(Array(12).fill("r2"), 0, 9); E.startTurn(bb); bb.s[0].hand = ["s4"]; bb.s[0].lys = 2; E.play(bb, 0, 3); bb.s[1].board = [null, null, null, null];
  E.endTurn(bb); ok(bb.s[0].board[3] && bb.s[0].board[3].a === 1 && bb.s[0].board[3].h === 3, "Bloom vokser +1/+1 ved tur-slut");
  const sd = bb.s[0].board[3]; for (let t = 0; t < 4; t++) { bb.who = 0; bb.s[1].board = [null, null, null, null]; bb.s[1].hp = 99; E.endTurn(bb); }
  ok(sd.a === 3 && sd.mh === 5, "Bloom højst 3 gange");
  const rr = E.rng(11); for (let i = 0; i < 200; i++) { const st = E.openPack(rr, "star"); ok(st.length === 5 && st.every(id => D.BY[id].set === 2), "Starfall-pakke kun sæt 2");
    ok(E.openPack(rr).every(id => !D.BY[id].set) && E.openPack(rr, "rod").every(id => !D.BY[id].set), "almindelige pakker uden sæt 2"); }
  ok(D.CARDS.length === 63 && new Set(D.CARDS.map(c => c.id)).size === 63, "63 unikke kort");
  for (let i = 0; i < 200; i++) { ok(E.openPack(rr, "deep").every(id => D.BY[id].set === 3), "Deep-pakke kun sæt 3");
    ok(!E.openPack(rr).some(id => D.BY[id].set === 3) && !E.openPack(rr, "star").some(id => D.BY[id].set === 3), "andre pakker uden sæt 3"); }
  ok(D.CARDS.every(c => Object.keys(c.kw).every(k => D.KW[k])), "alle nøgleord forklaret"); }
{ const V = require("../voyage.js"), r5 = E.rng(5);
  for (let i = 0; i < 100; i++) { ok(V.traderStock({ bestDark: 1, coll: {} }, r5).some(id => D.BY[id].set === 2), "handler har Starfall-ånd efter oplåsning");
    ok(!V.traderStock({ bestDark: 0, coll: {} }, r5).some(id => D.BY[id].set), "handler uden Starfall før oplåsning"); }
  const st = V.EVENTS.find(e => e.id === "star");
  for (let i = 0; i < 100; i++) { const S1 = { bestDark: 1, coll: {}, deck: [], embers: 0 }, S0 = { bestDark: 0, coll: {}, deck: [], embers: 0 };
    ok(D.BY[st.ch[0].fx(S1, r5).card].set === 2 && !D.BY[st.ch[0].fx(S0, r5).card].set, "stjernehændelse giver Starfall kun efter oplåsning"); } }
// 0.11.0 Darkness-regler
{ ok(D.DARK.length === E.MAXDARK + 1 && D.DARK.slice(1).every(x => x.n && x.t), "Darkness-regler beskrevet");
  for (let sd = 1; sd < 60; sd++) { const b2 = E.newBattle(Array(12).fill("g1"), E.warden(0, 2), sd), b1 = E.newBattle(Array(12).fill("g1"), E.warden(0, 1), sd);
    ok(b2.s[1].board.filter(Boolean).length === 1 && b1.s[1].board.filter(Boolean).length === 0, "Vanguard fra Darkness II"); }
  { const g = E.newBattle(Array(12).fill("g1"), E.warden(3, 2), 4); ok(!g.s[1].board[0], "Vanguard respekterer Gale"); }
  { const d5 = E.newBattle(Array(12).fill("g1"), E.warden(5, 5), 4), d4 = E.newBattle(Array(12).fill("g1"), E.warden(5, 4), 4); ok(d5.s[1].hand.length === d4.s[1].hand.length + 2, "Deep Night: +2 startkort"); }
  { const t = E.newBattle(Array(12).fill("r2"), E.warden(0, 4), 3); E.startTurn(t); E.endTurn(t); t.s[1].hp = 5; t.s[1].hand = []; t.plan = []; E.aiTurn(t); ok(t.s[1].hp === 6, "Black Tide heler 1"); }
  { const t = E.newBattle(Array(12).fill("r2"), E.warden(0, 3), 3); E.startTurn(t); E.endTurn(t); t.s[1].hp = 5; t.s[1].hand = []; t.plan = []; E.aiTurn(t); ok(t.s[1].hp === 5, "ingen Black Tide før IV"); }
  { const w = E.newBattle(Array(12).fill("g1"), { hp: 9, deck: Array(12).fill("g1") }, 4); ok(w.dark === 0 && !w.s[1].board.some(Boolean), "vilde møder uden Darkness-regler"); } }
// 0.9.6: fair starthånd — et 1-lys-kort på hånden, når decket har ét
for (let sd = 1; sd < 400; sd++) { const dk = ["g1","g2","g2","g3","g3","g4","g4","g5","g5","g6","t3","t3","r3","r3"]; const bb = E.newBattle(dk, 0, sd);
  ok(bb.s[0].hand.some(id => D.BY[id].c <= 1) && bb.s[0].hand.length === 4 && bb.s[0].hand.length + bb.s[0].deck.length === dk.length, "fair starthånd " + sd); }
{ const bb = E.newBattle(Array(12).fill("g2"), 0, 5); ok(bb.s[0].hand.length === 4, "fair starthånd uden 1-lys-kort rører intet"); }
// 0.12.0: Constellations
{ const ST = require("../stars.js"); const u = id => ({ id, a: D.BY[id].a, h: D.BY[id].h, mh: D.BY[id].h, shield: !!D.BY[id].kw.taage, el: D.BY[id].el });
  const mk = () => { const b = E.newBattle(Array(12).fill("g1"), { hp: 30, deck: Array(12).fill("r1") }, 7); b.s[1].board = [null, null, null, null]; return b; };
  let b = mk(); b.s[0].board = [u("g2"), u("g3"), u("g1"), u("n1")]; ok(ST.check(b, []).includes("wildfire"), "Wildfire: Kin + 3 af samme lys");
  b.s[0].board = [u("g2"), u("g3"), u("t1"), u("n1")]; ok(!ST.check(b, []).includes("wildfire"), "ikke Wildfire med kun 2 slægt");
  b.s[0].board = [u("g8"), u("g3"), u("r8"), null]; ok(ST.check(b, []).includes("warband"), "Warband: mellem to Rally");
  b.s[0].board = [u("t1"), u("t2"), null, u("n3")]; ok(ST.check(b, []).includes("mistwall"), "Mist Wall");
  b.s[0].board = [u("s1"), u("g3"), u("t1"), null]; ok(ST.check(b, []).includes("twin"), "Twin Fire: Steamling med Blaze + Mist");
  b.s[0].board = [u("s1"), u("g3"), u("g1"), null]; ok(!ST.check(b, []).includes("twin"), "ikke Twin Fire med kun ét lys");
  b.s[0].board = [Object.assign(u("s4"), { bl: 3 }), null, null, null]; ok(ST.check(b, []).includes("bloom"), "Full Bloom");
  // hændelser: spil rigtige træk
  b = mk(); b.s[0].board = [null, null, null, null]; b.s[1].board = [u("r2"), null, null, null]; b.s[0].hand = ["g5", "g4"]; b.s[0].lys = 8; b.turn = 8;
  const st = b.log.length; E.play(b, 0, 1); ok(!ST.check(b, b.log.slice(st)).includes("feast"), "ikke Feast uden Devour-drab");
  b.s[1].board = [null, Object.assign(u("r5"), {}), null, null];
  b = mk(); b.s[1].board = [null, u("r3"), null, null]; b.s[0].hand = ["g5", "g4"]; b.s[0].lys = 8; b.turn = 8; b.s[0].board = [null, null, null, null];
  let s0 = b.log.length; E.play(b, 0, 1); /* Spark 3 på Rootsnake (4) → 1 liv */ b.s[0].board[1] = null; E.play(b, 0, 1); E.endTurn(b);
  ok(ST.check(b, b.log.slice(s0)).includes("feast"), "Feast: Spark og Devour-drab i samme tur");
  b = mk(); b.s[0].board = [u("r6"), u("r7"), null, null]; b.s[0].hp = 5; s0 = b.log.length; E.endTurn(b); ok(ST.check(b, b.log.slice(s0)).includes("deeproots"), "Deep Roots: Mend 5");
  b = mk(); b.s[0].board = [u("g7"), u("g6"), null, null]; s0 = b.log.length; E.endTurn(b); ok(ST.check(b, b.log.slice(s0)).includes("strike"), "Lantern Strike: 6+5 ≥ 10");
  b = mk(); b.s[0].board = [u("g7"), u("g7"), u("g7"), null]; b.s[1].board = [u("r1"), u("r1"), u("r1"), null]; s0 = b.log.length; E.endTurn(b); ok(ST.check(b, b.log.slice(s0)).includes("sweep"), "Clean Sweep");
  b = mk(); b.s[0].board = [u("s5"), null, u("g3"), null]; b.s[0].hand = ["s12"]; b.s[0].lys = 8; b.s[0].board[0] = u("g3"); s0 = b.log.length; E.play(b, 0, 1); ok(ST.check(b, b.log.slice(s0)).includes("crown"), "Star Crown");
  b = mk(); b.s[0].board = [u("n3"), null, null, null]; b.who = 1; b.s[1].hand = ["g1"]; b.s[1].lys = 1; s0 = b.log.length; E.play(b, 0, 0); ok(ST.check(b, [], b.log.slice(s0)).includes("trap"), "The Trap: Ambush dræber ved landing");
  b = mk(); b.s[0].hp = 2; b.s[1].hp = 3; b.s[0].board = [u("g7"), null, null, null]; s0 = b.log.length; E.endTurn(b); ok(b.over === "win" && ST.check(b, b.log.slice(s0)).includes("lastlight"), "Last Light");
  { const r = ST.reach(["g2","g3","g1","n1","g4","g5"]); ok(r.includes("wildfire") && r.includes("feast") && !r.includes("mistwall") && !r.includes("twin"), "reach: Blaze-deck"); }
  { const r = ST.reach(["s1","g3","t1","t2","t8","r4","r1","n2"]); ok(r.includes("twin") && r.includes("mistwall") && r.includes("deeproots"), "reach: blandet deck"); }
  ok(ST.LIST.every(x => x.pts.length >= 3 && x.hint && x.t && x.n), "alle stjernebilleder har figur og tekst");
  ok(typeof E.migrate({ sv: 1, coll: {}, deck: [] }).stars === "object", "gammel gemt tilstand får stars"); }
// 0.15.0 The Deep: Echo, Afterglow, vogter-evner, hav-skift
{ const nb = (deck, isl) => { const b = E.newBattle(deck, isl, 3); b.s[0].hand = []; b.s[1].hand = []; return b; };
  // Echo: dør → tilbage på hånden, kun første gang
  let b = nb(Array(12).fill("g1"), { hp: 20, deck: Array(12).fill("g1") });
  b.s[0].board[1] = { id: "x2", a: 1, h: 2, mh: 2, shield: false, el: "dyb" }; b.s[1].board[1] = { id: "g3", a: 5, h: 9, mh: 9, shield: false, el: "glod" };
  E.endTurn(b); ok(!b.s[0].board[1] && b.s[0].hand.includes("x2"), "Echo: død ånd kommer tilbage på hånden");
  b.s[0].board[2] = { id: "x2", a: 1, h: 2, mh: 2, shield: false, el: "dyb" }; b.s[0].hand = []; b.s[1].board[2] = { id: "g3", a: 5, h: 9, mh: 9, shield: false, el: "glod" }; b.who = 0;
  E.endTurn(b); ok(!b.s[0].hand.includes("x2"), "Echo: kun første gang i kampen");
  // Afterglow: dør → skade på fjendens lygte
  b = nb(Array(12).fill("g1"), { hp: 20, deck: Array(12).fill("g1") });
  b.s[0].board[0] = { id: "x12", a: 1, h: 1, mh: 6, shield: false, el: "dyb" }; b.s[1].board[0] = { id: "g3", a: 5, h: 9, mh: 9, shield: false, el: "glod" };
  E.endTurn(b); ok(b.s[1].hp === 17, "Afterglow 3 rammer fjendens lygte (" + b.s[1].hp + ")");
  // vogter-evner
  E.setSea(1); ok(D.ISLANDS.length === 5 && D.ISLANDS[0].n === "Glasswater", "Deepreach aktiv");
  D.ISLANDS.forEach(is => ok(is.deck.every(id => D.BY[id]) && D.TRAITS[is.trait], "Deepreach-ø " + is.n));
  b = nb(Array(12).fill("g1"), 0); b.s[1].board[2] = { id: "t1", a: 1, h: 1, mh: 1, shield: false, el: "taage" }; b.s[0].hand = ["g3"]; b.s[0].lys = 5;
  E.play(b, 0, 2); ok(b.s[0].board[2] === null, "Glow Lure: vogterens ånder har Ambush 1");
  b = nb(Array(12).fill("g1"), 3); b.s[1].hp = 20; b.s[0].board[0] = { id: "g1", a: 1, h: 1, mh: 1, shield: false, el: "glod" }; b.s[1].board[0] = { id: "r5", a: 3, h: 6, mh: 6, shield: false, el: "rod" };
  E.endTurn(b); ok(b.s[1].hp === 22, "Feast: vogteren heler 2, når din ånd dør");
  b = nb(Array(12).fill("g1"), 1); b.who = 1; b.s[1].board[0] = { id: "r2", a: 1, h: 1, mh: 1, shield: false, el: "rod" }; b.s[0].board[0] = { id: "g3", a: 3, h: 9, mh: 9, shield: false, el: "glod" };
  E.endTurn(b); ok(b.s[1].hand.includes("r2"), "Echoes: vogterens ånder har Echo");
  // hav-skift bevarer hver rejse
  const S = E.newSave(); S.island = 4; S.dark = 2; S.flames = 2; E.switchSea(S, 1);
  ok(S.island === 0 && S.dark === 0 && S.flames === 3 && D.ISLANDS === D.SEAS[1].islands, "nyt hav starter forfra");
  S.island = 2; E.switchSea(S, 0); ok(S.island === 4 && S.dark === 2 && S.flames === 2 && S.seas[1].island === 2 && D.ISLANDS === D.SEAS[0].islands, "tilbage til Mørkhavet: rejsen er bevaret");
  const S2 = E.migrate(JSON.parse(JSON.stringify(Object.assign(S, { sea: 1 })))); ok(D.ISLANDS === D.SEAS[1].islands, "migrate vælger det gemte hav");
  E.setSea(0); }
// AI-decks gyldige
D.ISLANDS.forEach(is => ok(is.deck.every(id => D.BY[id]), "ø-deck " + is.n));
// gemte tilstande fra tidligere versioner
const dir = path.join(__dirname, "gemte");
for (const f of fs.readdirSync(dir)) { const s = E.migrate(JSON.parse(fs.readFileSync(path.join(dir, f)))); ok(s.sv === E.SAVE_VERSION && Array.isArray(s.deck) && typeof s.coll === "object", "gemt " + f); }
// balance-bot: AI mod AI med ø-decks, ingen uendelige kampe
let turns = 0, wins = 0;
E.setSea(0);
for (let g = 0; g < 300; g++) { const isl = g % 7; const bb = E.newBattle(D.ISLANDS[(isl + 1) % 7].deck, isl, g + 1); E.startTurn(bb);
  let n = 0; while (!bb.over && n < 200) { E.aiTurn(bb); n++; }
  ok(bb.over, "kamp slutter " + g); turns += n; if (bb.over === "win") wins++; }
console.log("balance: snit halv-ture", (turns / 300).toFixed(1), "spiller-side vinder", wins, "/300");
console.log(fails ? fails + " fejl" : "alle tests ok"); process.exit(fails ? 1 : 0);
