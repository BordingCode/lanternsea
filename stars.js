// Constellations (0.12.0): named combinations the player DISCOVERS in battle.
// Dommer nat 4: "kombinationerne lærer man ikke at bruge bevidst … giv et par tydelige sæt-kombinationer som mål".
// Each one is a combo of keywords; the first time you pull it off → a pack. Every later time → a small banner,
// so the combo is visible whenever it happens. Ren logik (ingen DOM) — testes i node (tests/test.js).
(function (root) {
  var D = typeof module !== "undefined" ? require("./cards.js") : root.DATA;
  var E = typeof module !== "undefined" ? require("./engine.js") : root.ENG;
  // pts: star figure (0–10 grid) drawn in the book. set2: needs Starfall cards.
  var LIST = [
    { id: "wildfire", n: "Wildfire", hint: "Four spirits of one light on the field — one of them with Kin.", t: "A Kin spirit got +3 from three kin beside it.", pts: [[1, 8], [3, 5], [5, 7], [7, 3], [9, 5]] },
    { id: "warband", n: "The Warband", hint: "Stand one spirit between two who Rally.", t: "A spirit got +2 attack from Rally on both sides.", pts: [[1, 6], [5, 3], [9, 6], [5, 8]] },
    { id: "feast", n: "The Feast", hint: "Soften a foe with Spark — then let a Devourer finish it, the same turn.", t: "Spark, then Devour, in one turn.", pts: [[2, 2], [4, 5], [3, 8], [7, 7], [8, 4]] },
    { id: "mistwall", n: "Mist Wall", hint: "Three veiled spirits on the field at once.", t: "Three spirits with Veil stood together.", pts: [[1, 5], [4, 4], [6, 6], [9, 5]] },
    { id: "deeproots", n: "Deep Roots", hint: "Heal your lantern 4 or more in a single turn.", t: "Mend healed your lantern 4+ in one turn.", pts: [[5, 1], [5, 5], [2, 9], [5, 9], [8, 9]] },
    { id: "trap", n: "The Trap", hint: "Let an Ambush destroy something the moment it lands.", t: "An Ambush killed a spirit as it arrived.", pts: [[2, 3], [8, 3], [5, 8], [2, 3]] },
    { id: "sweep", n: "Clean Sweep", hint: "Destroy three enemy spirits in one attack.", t: "Three enemy spirits fell in one turn.", pts: [[1, 2], [4, 4], [6, 6], [9, 8]] },
    { id: "strike", n: "Lantern Strike", hint: "Hit the enemy lantern for 10 or more in one turn.", t: "10+ damage to the enemy lantern in one turn.", pts: [[5, 1], [3, 5], [6, 5], [4, 9]] },
    { id: "lastlight", n: "Last Light", hint: "Win with your lantern at 3 life or less.", t: "You won on the edge of the dark.", pts: [[5, 2], [3, 6], [5, 9], [7, 6], [5, 2]] },
    { id: "crown", n: "Star Crown", set2: 1, hint: "Play a Shine spirit between two friends.", t: "Shine blessed both neighbours at once.", pts: [[1, 7], [3, 3], [5, 6], [7, 3], [9, 7]] },
    { id: "bloom", n: "Full Bloom", set2: 1, hint: "Keep a Bloom spirit alive until it has grown three times.", t: "A Bloom spirit grew to its full size.", pts: [[5, 9], [5, 5], [2, 2], [5, 4], [8, 2]] },
    { id: "twin", n: "Twin Fire", set2: 1, hint: "A twin-light Kin spirit with kin of BOTH its lights beside it.", t: "A twin-light spirit drew on both its lights.", pts: [[2, 2], [5, 5], [8, 2], [5, 5], [5, 9]] }
  ];
  var BY = {}; LIST.forEach(function (s) { BY[s.id] = s; });

  // Board state checks — after one of your plays (or any time on your turn).
  function boardFeats(b) {
    var P = b.s[0], out = [];
    P.board.forEach(function (u, i) {
      if (!u) return;
      var c = D.BY[u.id];
      if (c.kw.flok) {
        var kin = P.board.filter(function (v, j) { return v && j !== i && D.shareLight(c, D.BY[v.id]); });
        if (kin.length >= 3) out.push("wildfire");
        if (c.el2 && c.el2 !== "*") {
          var a = kin.some(function (v) { return D.hasLight(D.BY[v.id], c.el); }), z = kin.some(function (v) { return D.hasLight(D.BY[v.id], c.el2); });
          var pure = kin.some(function (v) { var o = D.BY[v.id]; return D.hasLight(o, c.el) && !D.hasLight(o, c.el2); }) && kin.some(function (v) { var o = D.BY[v.id]; return D.hasLight(o, c.el2) && !D.hasLight(o, c.el); });
          if (a && z && pure) out.push("twin");
        }
      }
      var L = P.board[i - 1], R = P.board[i + 1];
      if (L && R && D.BY[L.id].kw.rally && D.BY[R.id].kw.rally) out.push("warband");
      if (c.kw.bloom && (u.bl || 0) >= 3) out.push("bloom");
    });
    if (P.board.filter(function (u) { return u && D.BY[u.id].kw.taage; }).length >= 3) out.push("mistwall");
    return out;
  }
  // evs: everything that happened on YOUR turn so far (plays + your attack). foeEvs: the enemy's turn (for traps).
  function check(b, evs, foeEvs) {
    var out = boardFeats(b), face = 0, kills = 0, heal = 0, sparked = false, devoured = false;
    evs.forEach(function (e, k) {
      if (e.t === "face" && e.si === 1) face += e.n;
      if (e.t === "die" && e.si === 1) kills++;
      if (e.t === "heal" && e.si === 0) heal += e.n;
      if (e.t === "play" && e.si === 0) {
        var c = D.BY[e.id], nx = evs[k + 1];
        if (c.kw.gnist && nx && (nx.t === "hit" || nx.t === "die") && nx.si === 1) sparked = true;
        if (c.kw.shine) { var n = 0; for (var j = k + 1; j < evs.length && evs[j].t === "shine"; j++) n++; if (n >= 2) out.push("crown"); }
      }
      if (e.t === "grow" && e.si === 0 && !e.bloom) devoured = true;
    });
    // Sweep and Deep Roots count only your attack phase (the "end turn" part).
    var atk = evs.slice(lastIndex(evs));
    if (atk.filter(function (e) { return e.t === "die" && e.si === 1; }).length >= 3) out.push("sweep");
    if (heal >= 4) out.push("deeproots");
    if (face >= 10) out.push("strike");
    if (sparked && devoured) out.push("feast");
    (foeEvs || []).forEach(function (e, k) {
      if (e.t === "ambush" && e.si === 0) { var nx = foeEvs[k + 1], n2 = foeEvs[k + 2]; if ((nx && nx.t === "die" && nx.si === 1) || (nx && nx.t === "hit" && n2 && n2.t === "die" && n2.si === 1)) out.push("trap"); }
    });
    if (b.over === "win" && b.s[0].hp <= 3) out.push("lastlight");
    return out.filter(function (id, i) { return out.indexOf(id) === i; });
  }
  // Start of the attack phase = first "atk" event (or the end, if none).
  function lastIndex(evs) { for (var i = 0; i < evs.length; i++) if (evs[i].t === "atk") return i; return evs.length; }

  // Hvilke billeder KAN dette deck nå? (deckbyggeren viser det — så deckbygning bliver vejen til at opdage dem)
  function reach(deck) {
    var C = deck.map(function (id) { return D.BY[id]; }).filter(Boolean), kw = function (k) { return C.filter(function (c) { return c.kw[k]; }); }, out = [];
    if (kw("flok").some(function (c) { return C.filter(function (o) { return o !== c && D.shareLight(c, o); }).length >= 3; })) out.push("wildfire");
    if (kw("rally").length >= 2) out.push("warband");
    if (kw("gnist").length && kw("sluger").length) out.push("feast");
    if (kw("taage").length >= 3) out.push("mistwall");
    var mend = kw("rod").map(function (c) { return c.kw.rod; }).sort(function (a, b) { return b - a; });
    if ((mend[0] || 0) + (mend[1] || 0) + (mend[2] || 0) >= 4) out.push("deeproots");
    if (kw("ambush").length) out.push("trap");
    out.push("sweep", "strike", "lastlight");
    if (kw("shine").length) out.push("crown");
    if (kw("bloom").length) out.push("bloom");
    if (kw("flok").some(function (c) { return c.el2 && c.el2 !== "*" && C.some(function (o) { return o !== c && D.hasLight(o, c.el) && !D.hasLight(o, c.el2); }) && C.some(function (o) { return o !== c && D.hasLight(o, c.el2) && !D.hasLight(o, c.el); }); })) out.push("twin");
    return out;
  }

  var api = { LIST: LIST, BY: BY, check: check, boardFeats: boardFeats, reach: reach };
  if (typeof module !== "undefined") module.exports = api; else root.STARS = api;
})(this);
