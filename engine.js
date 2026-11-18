// Ren spillogik — ingen DOM. Testes i node (tests/).
(function (root) {
  var D = typeof module !== "undefined" ? require("./cards.js") : root.DATA;
  var SLOTS = 4, MAXLYS = 8;

  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function unit(id) { var c = D.BY[id]; return { id: id, a: c.a, h: c.h, mh: c.h, shield: !!c.kw.taage, el: c.el }; }
  function side(deck, hp, r) {
    var d = shuffle(deck.slice(), r);
    return { hp: hp, mhp: hp, deck: d, hand: d.splice(0, 4), board: [null, null, null, null], lys: 0, echoed: {} };
  }
  // Nøgleord inkl. dem en vogter-evne giver dens ånder (Deepreach, 0.15.0).
  var TRAITKW = { lure: ["ambush", 1], echoes: ["echo", 1], hunger: ["sluger", 1], abyss: ["glow", 1] };
  function kwOf(b, si, id, k) {
    var n = D.BY[id].kw[k] || 0, t = si === 1 && b && TRAITKW[b.trait];
    if (t && t[0] === k) n = Math.max(n, t[1]);
    return n;
  }
  // Hvilket hav er aktivt: D.ISLANDS peger på havets øer (motoren og testene læser D.ISLANDS).
  function setSea(sea) { var S0 = D.SEAS[sea] || D.SEAS[0]; D.ISLANDS = S0.islands; D.STARLIT = S0.id === "dark" ? D.STARLIT0 : []; D.SEA = S0; }
  // island: index i D.ISLANDS eller et møde-objekt {hp, deck, trait}. opt (valgfri): {hp: ±lygteliv, draw: ekstra startkort}.
  function newBattle(playerDeck, island, seed, opt) {
    var r = rng(seed || Date.now()); opt = opt || {};
    var isl = typeof island === "number" ? D.ISLANDS[island] : island;
    var b = { r: r, turn: 1, who: 0, over: null, log: [], plan: null, trait: isl.trait || null, dark: isl.dark || 0,
      s: [side(playerDeck, Math.max(1, 15 + (opt.hp || 0)), r), side(isl.deck, isl.hp, r)] };
    for (var k = 0; k < (opt.draw || 0) && b.s[0].deck.length; k++) b.s[0].hand.push(b.s[0].deck.shift());
    fairHand(b.s[0]);
    // Darkness V — Deep Night: vogteren starter med 2 ekstra kort på hånden.
    if (b.dark >= 5) for (var x = 0; x < 2 && b.s[1].deck.length; x++) b.s[1].hand.push(b.s[1].deck.shift());
    // Darkness II — Vanguard: vogteren starter med sin billigste ånd på brættet (på en tilfældig åben plads).
    if (b.dark >= 2 && b.s[1].hand.some(function (id) { return D.BY[id].c <= 2; })) {
      var F = b.s[1], lo = 0; F.hand.forEach(function (id, k) { if (D.BY[id].c < D.BY[F.hand[lo]].c) lo = k; });
      var open = [0, 1, 2, 3].filter(function (k) { return !closed(b, k); }), at = open[Math.floor(r() * open.length)];
      F.board[at] = unit(F.hand.splice(lo, 1)[0]);
    }
    planFoe(b);
    return b;
  }
  // 0.9.6 (dommer): tur 1 har 1 lys — har du et 1-lys-kort i decket, er der mindst ét på starthånden.
  // Det dyreste kort på hånden byttes med det første billige i decket (og decket blandes ikke om).
  function fairHand(p) {
    if (p.hand.some(function (id) { return D.BY[id].c <= 1; })) return;
    var j = -1; for (var i = 0; i < p.deck.length; i++) if (D.BY[p.deck[i]].c <= 1) { j = i; break; }
    if (j < 0 || !p.hand.length) return;
    var hi = 0; p.hand.forEach(function (id, k) { if (D.BY[id].c > D.BY[p.hand[hi]].c) hi = k; });
    var t = p.hand[hi]; p.hand[hi] = p.deck[j]; p.deck[j] = t;
  }
  function ev(b, e) { b.log.push(e); }
  function damageUnit(b, si, slot, n) {
    var u = b.s[si].board[slot]; if (!u || n <= 0) return false;
    if (u.shield) { u.shield = false; ev(b, { t: "dodge", si: si, slot: slot }); return false; }
    u.h -= n; ev(b, { t: "hit", si: si, slot: slot, n: n });
    if (u.h <= 0) { b.s[si].board[slot] = null; ev(b, { t: "die", si: si, slot: slot, id: u.id }); onDeath(b, si, u); return true; }
    return false;
  }
  // Deep (0.15.0): Echo (første gang den dør i kampen → tilbage på hånden), Afterglow N (N skade på fjendens lygte), Feast (vogter-evne).
  function onDeath(b, si, u) {
    var P = b.s[si];
    if (kwOf(b, si, u.id, "echo") && !P.echoed[u.id]) { P.echoed[u.id] = 1; P.hand.push(u.id); ev(b, { t: "echo", si: si, id: u.id }); }
    var g = kwOf(b, si, u.id, "glow");
    if (g && !b.over) { ev(b, { t: "glow", si: si, n: g }); damageHero(b, 1 - si, g); }
    if (si === 0 && b.trait === "feast" && !b.over && b.s[1].hp < b.s[1].mhp) { b.s[1].hp = Math.min(b.s[1].mhp, b.s[1].hp + 2); ev(b, { t: "heal", si: 1, n: 2 }); }
  }
  function damageHero(b, si, n) {
    b.s[si].hp -= n; ev(b, { t: "face", si: si, n: n });
    if (b.s[si].hp <= 0 && !b.over) { b.over = si === 1 ? "win" : "lose"; ev(b, { t: "over", res: b.over }); }
  }
  function startTurn(b) {
    var p = b.s[b.who];
    p.lys = Math.min(b.turn, MAXLYS);
    var draws = b.who === 1 && b.trait === "night" ? 2 : 1;
    if (!(b.turn === 1 && b.who === 0)) for (var k = 0; k < draws; k++) { if (p.deck.length) p.hand.push(p.deck.shift()); else damageHero(b, b.who, 1); }
  }
  function closed(b, slot) { return b.trait === "gale" && slot === 0; }
  function canPlay(b, hi, slot) {
    var p = b.s[b.who], id = p.hand[hi];
    return !b.over && id != null && slot >= 0 && slot < SLOTS && !closed(b, slot) && !p.board[slot] && D.BY[id].c <= p.lys;
  }
  function play(b, hi, slot) {
    if (!canPlay(b, hi, slot)) return false;
    var p = b.s[b.who], id = p.hand.splice(hi, 1)[0], c = D.BY[id];
    p.lys -= c.c; p.board[slot] = unit(id); ev(b, { t: "play", si: b.who, slot: slot, id: id });
    // Ambush: en ånd overfor rammer den, der lander (svaret på vogterens synlige plan).
    var opp = b.s[1 - b.who].board[slot], amb = opp && kwOf(b, 1 - b.who, opp.id, "ambush");
    if (amb) { ev(b, { t: "ambush", si: 1 - b.who, slot: slot }); if (damageUnit(b, b.who, slot, amb)) return true; }
    // Shine (Starfall): naboerne i din egen række får +N/+N.
    if (c.kw.shine) [slot - 1, slot + 1].forEach(function (j) { var v = p.board[j]; if (v) { v.a += c.kw.shine; v.h += c.kw.shine; v.mh += c.kw.shine; ev(b, { t: "shine", si: b.who, slot: j, n: c.kw.shine }); } });
    var spark = (c.kw.gnist || 0) + (b.who === 1 && b.trait === "embers" && D.hasLight(c, "glod") ? 1 : 0);
    if (spark) {
      var o = 1 - b.who;
      if (b.s[o].board[slot]) damageUnit(b, o, slot, spark); else damageHero(b, o, spark);
    }
    return true;
  }
  function attackOf(p, slot) {
    var u = p.board[slot], c = D.BY[u.id], a = u.a;
    if (c.kw.flok) p.board.forEach(function (v, i) { if (v && i !== slot && D.shareLight(c, D.BY[v.id])) a++; });
    [slot - 1, slot + 1].forEach(function (j) { var v = p.board[j]; if (v && D.BY[v.id].kw.rally) a++; });
    return a;
  }
  function endTurn(b) {
    if (b.over) return;
    var me = b.who, o = 1 - me, P = b.s[me], O = b.s[o];
    for (var i = 0; i < SLOTS && !b.over; i++) {
      var u = P.board[i]; if (!u) continue;
      var a = attackOf(P, i);
      if (a <= 0) continue;
      ev(b, { t: "atk", si: me, slot: i });
      var v = O.board[i];
      if (v) {
        var back = attackOf(O, i);
        var killed = damageUnit(b, o, i, a);
        if (back > 0 && P.board[i]) damageUnit(b, me, i, back);
        if (killed && P.board[i] && kwOf(b, me, u.id, "sluger")) { u.a++; u.h++; u.mh++; ev(b, { t: "grow", si: me, slot: i }); }
      } else damageHero(b, o, a + (me === 1 && b.trait === "dive" ? 1 : 0)); // Dive (Skerrystone): mågens ånder rammer åbne baner hårdere
    }
    P.board.forEach(function (u, i) { if (u && D.BY[u.id].kw.bloom && (u.bl || 0) < 3) { u.bl = (u.bl || 0) + 1; u.a++; u.h++; u.mh++; ev(b, { t: "grow", si: me, slot: i, bloom: 1 }); } });
    P.board.forEach(function (u) { if (u && D.BY[u.id].kw.rod) { var n = D.BY[u.id].kw.rod; P.hp = Math.min(P.mhp, P.hp + n); ev(b, { t: "heal", si: me, n: n }); } });
    // Darkness IV — Black Tide: vogterens lygte heler 1 efter dens tur.
    if (me === 1 && b.dark >= 4 && P.hp < P.mhp) { P.hp = Math.min(P.mhp, P.hp + 1); ev(b, { t: "heal", si: 1, n: 1 }); }
    if (me === 1 && b.trait === "tide" && P.hp < P.mhp) { P.hp = Math.min(P.mhp, P.hp + 2); ev(b, { t: "heal", si: 1, n: 2 }); }
    if (me === 1 && b.trait === "regrow") P.board.forEach(function (u, i) { if (u && u.h < u.mh) { u.h++; ev(b, { t: "regrow", si: 1, slot: i }); } });
    if (b.over) return;
    b.who = o; if (o === 0) b.turn++;
    startTurn(b);
  }
  // AI: vælg træk (uden at ændre noget) for side si med lys `lys`. Dyreste først; foretræk at
  // slå spillerens ånder, ellers tomme baner. Returnerer [{id, slot}].
  function chooseMoves(b, si, lys) {
    var p = b.s[si], opp = b.s[1 - si], hand = p.hand.slice(), taken = p.board.map(function (u, i) { return !!u || closed(b, i); }), out = [];
    for (var guard = 0; guard < 8; guard++) {
      var best = -1, bestSlot = -1, bestScore = -1e9;
      hand.forEach(function (id, hi) {
        var c = D.BY[id]; if (c.c > lys) return;
        for (var s = 0; s < SLOTS; s++) {
          if (taken[s]) continue;
          var foe = opp.board[s], sc = c.c * 10, amb = foe && kwOf(b, 1 - si, foe.id, "ambush");
          if (amb) sc -= c.h <= amb && !c.kw.taage ? 25 : 4;
          if (foe) { sc += (c.a >= foe.h ? 8 : 0) + (c.h > foe.a ? 4 : -3) + (c.kw.gnist ? 6 : 0); }
          else sc += 3;
          if (c.kw.shine) [s - 1, s + 1].forEach(function (j) { if (j >= 0 && j < SLOTS && p.board[j]) sc += 3 * c.kw.shine; });
          if (sc > bestScore) { bestScore = sc; best = hi; bestSlot = s; }
        }
      });
      if (best < 0) break;
      var id = hand.splice(best, 1)[0]; lys -= D.BY[id].c; taken[bestSlot] = true;
      out.push({ id: id, slot: bestSlot });
    }
    return out;
  }
  // Vogterens hensigt: hvad den lægger og hvor i sin NÆSTE tur. Vises for spilleren og følges ærligt.
  function planFoe(b) { b.plan = b.over ? [] : chooseMoves(b, 1, Math.min(b.turn, MAXLYS)); }
  function aiTurn(b) {
    var si = b.who, p = b.s[si];
    var moves = si === 1 && b.plan ? b.plan : chooseMoves(b, si, p.lys);
    moves.forEach(function (m) {
      if (b.over) return;
      var hi = p.hand.indexOf(m.id);
      if (hi >= 0) play(b, hi, m.slot);
    });
    if (si === 1) b.plan = null;
    if (b.over) return;
    endTurn(b);
    if (si === 1) planFoe(b);
  }
  // Darkness (0.9.0): hver gang Den Sorte Fyr tændes, bliver Mørket dybere. Vogterne får +10 % liv pr. niveau (20 % gjorde Den Sorte Fyr umulig ved V — tests/moerke.js).
  var MAXDARK = 5;
  if (D.SEAS) setSea(0);
  function warden(i, dark) {
    var is = D.ISLANDS[i], o = {}; for (var k in is) o[k] = is[k];
    o.hp = Math.round(is.hp * (1 + 0.04 * (dark || 0))); o.dark = dark || 0; // 0.11.0: 10 % → 4 % pr. niveau, nu hvor hvert niveau har en regel
    // Starlit (Darkness): 2 kort byttes med øens 2 Starfall-ånder til samme pris (D.STARLIT[i] = [ind, ud]).
    if (dark >= 1 && D.STARLIT && D.STARLIT[i]) {
      var d = is.deck.slice(); D.STARLIT[i][1].forEach(function (id, k) { var j = d.lastIndexOf(id); if (j >= 0) d[j] = D.STARLIT[i][0][k]; });
      o.deck = d;
    }
    return o;
  }
  // Pakker
  // el (valgfri): temapakke — almindelige og ualmindelige kommer fra det lys; den sjældne kan være hvad som helst.
  function openPack(r, el) {
    function pick(rar) {
      // "star" = Starfall-pakke (kun sæt 2); ellers aldrig sæt 2.
      // "deep" = Deep-pakke (kun sæt 3, Deepreach).
      var pool = D.CARDS.filter(function (c) { return c.r === rar && !c.sea && (el === "star" ? c.set === 2 : el === "deep" ? c.set === 3 : !c.set && (!el || rar === "r" || rar === "m" || c.el === el)); });
      return pool[Math.floor(r() * pool.length)].id;
    }
    var top = r() < 1 / 6 ? "m" : "r";
    var ids = [pick("c"), pick("c"), pick("c"), pick("u"), pick(top)];
    return ids;
  }
  function deckLimit(id) { return D.BY[id].r === "m" ? 1 : 2; }
  function validDeck(deck, coll) {
    if (deck.length < 12 || deck.length > 20) return false;
    var cnt = {}; for (var i = 0; i < deck.length; i++) { var id = deck[i]; cnt[id] = (cnt[id] || 0) + 1;
      if (!D.BY[id] || cnt[id] > deckLimit(id) || cnt[id] > (coll[id] || 0)) return false; }
    return true;
  }
  // Gemt tilstand + migrering
  var SAVE_VERSION = 1;
  // Hav-skift (0.15.0): hvert hav har sin egen rejse. Det aktive havs felter ligger øverst i S (så al gammel kode virker),
  // de andre havs ligger i S.seas[havnummer]. Samling, deck, glimmer, pakker og skib er fælles.
  var SEAFIELDS = ["island", "best", "flames", "voy", "quest", "dark", "runs"];
  function switchSea(s, to, flames) {
    if (to === s.sea) return s;
    var cur = {}; SEAFIELDS.forEach(function (k) { cur[k] = s[k]; }); s.seas[s.sea] = cur;
    var nx = s.seas[to] || { island: 0, best: 0, flames: maxFlames(s), voy: null, quest: null, dark: 0, runs: 1 };
    SEAFIELDS.forEach(function (k) { s[k] = nx[k]; }); delete s.seas[to];
    s.sea = to; setSea(to);
    return s;
  }
  // Skibet (0.15.0): Spare Wick giver en 4. flamme.
  function maxFlames(s) { return s && s.ship && s.ship.wick ? 4 : 3; }
  function newSave() { return { sv: SAVE_VERSION, coll: {}, deck: [], island: 0, flames: 3, best: 0, packs: 2, packq: [], miles: {}, voy: null, quest: null, dark: 0, embers: 0, wins: 0, losses: 0, runs: 1, seen: {}, stars: {}, sea: 0, seas: {}, ship: {} }; }
  function migrate(s) {
    if (!s || typeof s !== "object") return newSave();
    var base = newSave();
    for (var k in base) if (!(k in s)) s[k] = base[k];
    // fjern ukendte kort (hvis et kort nogensinde fjernes)
    for (var id in s.coll) if (!D.BY[id]) delete s.coll[id];
    s.deck = s.deck.filter(function (id) { return D.BY[id]; });
    s.sv = SAVE_VERSION;
    if (!D.SEAS[s.sea]) s.sea = 0;
    setSea(s.sea);
    return s;
  }
  var api = { maxFlames: maxFlames, kwOf: kwOf, setSea: setSea, SEAFIELDS: SEAFIELDS, switchSea: switchSea, MAXDARK: MAXDARK, warden: warden, SLOTS: SLOTS, closed: closed, chooseMoves: chooseMoves, planFoe: planFoe, rng: rng, newBattle: newBattle, startTurn: startTurn, canPlay: canPlay, play: play, endTurn: endTurn, aiTurn: aiTurn, attackOf: attackOf, openPack: openPack, deckLimit: deckLimit, validDeck: validDeck, newSave: newSave, migrate: migrate, SAVE_VERSION: SAVE_VERSION };
  if (typeof module !== "undefined") module.exports = api; else root.ENG = api;
})(this);
