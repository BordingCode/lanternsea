// Ren spillogik — ingen DOM. Testes i node (tests/).
(function (root) {
  var D = typeof module !== "undefined" ? require("./cards.js") : root.DATA;
  var SLOTS = 4, MAXLYS = 8;

  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function shuffle(a, r) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function unit(id) { var c = D.BY[id]; return { id: id, a: c.a, h: c.h, mh: c.h, shield: !!c.kw.taage, el: c.el }; }
  function side(deck, hp, r) {
    var d = shuffle(deck.slice(), r);
    return { hp: hp, mhp: hp, deck: d, hand: d.splice(0, 4), board: [null, null, null, null], lys: 0 };
  }
  function newBattle(playerDeck, island, seed) {
    var r = rng(seed || Date.now());
    var isl = D.ISLANDS[island];
    var b = { r: r, turn: 1, who: 0, over: null, log: [], plan: null,
      s: [side(playerDeck, 15, r), side(isl.deck, isl.hp, r)] };
    planFoe(b);
    return b;
  }
  function ev(b, e) { b.log.push(e); }
  function damageUnit(b, si, slot, n) {
    var u = b.s[si].board[slot]; if (!u || n <= 0) return false;
    if (u.shield) { u.shield = false; ev(b, { t: "dodge", si: si, slot: slot }); return false; }
    u.h -= n; ev(b, { t: "hit", si: si, slot: slot, n: n });
    if (u.h <= 0) { b.s[si].board[slot] = null; ev(b, { t: "die", si: si, slot: slot, id: u.id }); return true; }
    return false;
  }
  function damageHero(b, si, n) {
    b.s[si].hp -= n; ev(b, { t: "face", si: si, n: n });
    if (b.s[si].hp <= 0 && !b.over) { b.over = si === 1 ? "win" : "lose"; ev(b, { t: "over", res: b.over }); }
  }
  function startTurn(b) {
    var p = b.s[b.who];
    p.lys = Math.min(b.turn, MAXLYS);
    if (!(b.turn === 1 && b.who === 0)) { if (p.deck.length) p.hand.push(p.deck.shift()); else damageHero(b, b.who, 1); }
  }
  function canPlay(b, hi, slot) {
    var p = b.s[b.who], id = p.hand[hi];
    return !b.over && id != null && slot >= 0 && slot < SLOTS && !p.board[slot] && D.BY[id].c <= p.lys;
  }
  function play(b, hi, slot) {
    if (!canPlay(b, hi, slot)) return false;
    var p = b.s[b.who], id = p.hand.splice(hi, 1)[0], c = D.BY[id];
    p.lys -= c.c; p.board[slot] = unit(id); ev(b, { t: "play", si: b.who, slot: slot, id: id });
    if (c.kw.gnist) {
      var o = 1 - b.who;
      if (b.s[o].board[slot]) damageUnit(b, o, slot, c.kw.gnist); else damageHero(b, o, c.kw.gnist);
    }
    return true;
  }
  function attackOf(p, slot) {
    var u = p.board[slot], c = D.BY[u.id], a = u.a;
    if (c.kw.flok) p.board.forEach(function (v, i) { if (v && i !== slot && v.el === u.el) a++; });
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
        if (killed && P.board[i] && D.BY[u.id].kw.sluger) { u.a++; u.h++; u.mh++; ev(b, { t: "grow", si: me, slot: i }); }
      } else damageHero(b, o, a);
    }
    P.board.forEach(function (u) { if (u && D.BY[u.id].kw.rod) { var n = D.BY[u.id].kw.rod; P.hp = Math.min(P.mhp, P.hp + n); ev(b, { t: "heal", si: me, n: n }); } });
    if (b.over) return;
    b.who = o; if (o === 0) b.turn++;
    startTurn(b);
  }
  // AI: vælg træk (uden at ændre noget) for side si med lys `lys`. Dyreste først; foretræk at
  // slå spillerens ånder, ellers tomme baner. Returnerer [{id, slot}].
  function chooseMoves(b, si, lys) {
    var p = b.s[si], opp = b.s[1 - si], hand = p.hand.slice(), taken = p.board.map(Boolean), out = [];
    for (var guard = 0; guard < 8; guard++) {
      var best = -1, bestSlot = -1, bestScore = -1e9;
      hand.forEach(function (id, hi) {
        var c = D.BY[id]; if (c.c > lys) return;
        for (var s = 0; s < SLOTS; s++) {
          if (taken[s]) continue;
          var foe = opp.board[s], sc = c.c * 10;
          if (foe) { sc += (c.a >= foe.h ? 8 : 0) + (c.h > foe.a ? 4 : -3) + (c.kw.gnist ? 6 : 0); }
          else sc += 3;
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
  // Pakker
  function openPack(r) {
    function pick(rar) { var pool = D.CARDS.filter(function (c) { return c.r === rar; }); return pool[Math.floor(r() * pool.length)].id; }
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
  function newSave() { return { sv: SAVE_VERSION, coll: {}, deck: [], island: 0, flames: 3, best: 0, packs: 2, embers: 0, wins: 0, losses: 0, runs: 1, seen: {} }; }
  function migrate(s) {
    if (!s || typeof s !== "object") return newSave();
    var base = newSave();
    for (var k in base) if (!(k in s)) s[k] = base[k];
    // fjern ukendte kort (hvis et kort nogensinde fjernes)
    for (var id in s.coll) if (!D.BY[id]) delete s.coll[id];
    s.deck = s.deck.filter(function (id) { return D.BY[id]; });
    s.sv = SAVE_VERSION;
    return s;
  }
  var api = { SLOTS: SLOTS, chooseMoves: chooseMoves, planFoe: planFoe, rng: rng, newBattle: newBattle, startTurn: startTurn, canPlay: canPlay, play: play, endTurn: endTurn, aiTurn: aiTurn, attackOf: attackOf, openPack: openPack, deckLimit: deckLimit, validDeck: validDeck, newSave: newSave, migrate: migrate, SAVE_VERSION: SAVE_VERSION };
  if (typeof module !== "undefined") module.exports = api; else root.ENG = api;
})(this);
