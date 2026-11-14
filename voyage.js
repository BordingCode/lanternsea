// The Voyage (0.8.0): sejladsen mellem øerne. Ren logik + data, ingen DOM (testes i node).
// Hver overfart har 2 skillevejene med 2 valg hver. Knudetyper: vilde ånder (kamp → fang en ånd),
// mærkelige farvande (historie med valg), vrag (glimmer), tågehandleren (køb en ånd), havn (tænd en flamme).
(function (root) {
  var D = typeof module !== "undefined" ? require("./cards.js") : root.DATA;
  var E = typeof module !== "undefined" ? require("./engine.js") : root.ENG;

  var NODES = {
    wild: { i: "⚔️", n: "Wild spirits", t: "Fight to catch one. Lose, and a flame goes out." },
    event: { i: "❓", n: "Strange waters", t: "Something waits out there." },
    wreck: { i: "⚓", n: "Wreck", t: "Salvage glimmer — and maybe more." },
    trader: { i: "🏮", n: "Fog Trader", t: "Trade glimmer for a spirit." },
    haven: { i: "🏝", n: "Haven", t: "Rest. Relight a lost flame." },
    treasure: { i: "🗺️", n: "X marks the spot", t: "Your torn map leads here." },
  };
  var MELT = { c: 1, u: 2, r: 4, m: 8 };

  function pick(a, r) { return a[Math.floor(r() * a.length)]; }
  function weighted(w, r) { var tot = 0, k; for (k in w) tot += w[k]; var x = r() * tot; for (k in w) { x -= w[k]; if (x < 0) return k; } return k; }

  // En overfart til ø `to`: [[a,b],[c,d]] — mindst én vild kamp, højst én havn, ingen ens par.
  function makeLeg(to, r) {
    for (var tries = 0; tries < 50; tries++) {
      var steps = [];
      for (var s = 0; s < 2; s++) {
        var a = weighted({ wild: 34, event: 36, wreck: 10, trader: 10, haven: 10 }, r), b;
        do { b = weighted({ wild: 34, event: 36, wreck: 10, trader: 10, haven: 10 }, r); } while (b === a);
        steps.push([a, b]);
      }
      var flat = steps[0].concat(steps[1]);
      if (flat.indexOf("wild") < 0) continue;
      if (flat.filter(function (x) { return x === "haven"; }).length > 1) continue;
      return { to: to, step: 0, nodes: steps, done: [], boon: null };
    }
    return { to: to, step: 0, nodes: [["wild", "event"], ["event", "wreck"]], done: [], boon: null };
  }

  // Vilde ånder: en lille flok af ét lys. Bliver stærkere jo længere ude.
  var WILDNAME = { glod: "Wild Blaze spirits", taage: "Wild Mist spirits", rod: "Wild Root spirits" };
  function wildEncounter(to, r, dark) {
    var el = pick(["glod", "taage", "rod"], r);
    var pool = D.CARDS.filter(function (c) { return c.el === el && !c.sea && (c.r === "c" || (c.r === "u" && to >= 2) || (c.r === "r" && to >= 4)); });
    var deck = [];
    for (var i = 0; i < 9 + to; i++) deck.push(pick(pool, r).id);
    return { el: el, n: "Open sea", foe: WILDNAME[el], hp: 7 + to * 2 + (dark || 0) * 2, deck: deck, trait: null, wild: true };
  }

  // Tre ånder at vælge imellem: en ukendt drifter (hvis der er nogen), ellers en sjælden, + to fra flokkens lys.
  function rewardChoices(el, coll, r) {
    var out = [];
    var drift = D.CARDS.filter(function (c) { return c.sea && !(coll[c.id] > 0) && c.r !== "m"; });
    var dEl = drift.filter(function (c) { return c.el === el; });
    if (dEl.length) out.push(pick(dEl, r).id); else if (drift.length) out.push(pick(drift, r).id);
    else out.push(pick(D.CARDS.filter(function (c) { return c.r === "r" && !c.sea; }), r).id);
    var rest = D.CARDS.filter(function (c) { return c.el === el && !c.sea && (c.r === "c" || c.r === "u"); });
    for (var g = 0; out.length < 3 && g < 40; g++) { var id = pick(rest, r).id; if (out.indexOf(id) < 0) out.push(id); }
    return out;
  }

  // Giv et kort; over deck-grænsen smeltes det til glimmer (som i pakkerne). Returnerer smeltet mængde.
  function give(S, id) {
    var lim = E.deckLimit(id), c = D.BY[id];
    S.coll[id] = (S.coll[id] || 0) + 1;
    if (S.coll[id] > lim) { S.coll[id] = lim; S.embers += MELT[c.r]; return MELT[c.r]; }
    return 0;
  }
  function randomCard(r, rar, opts) {
    opts = opts || {};
    var pool = D.CARDS.filter(function (c) { return c.r === rar && (opts.sea ? true : !c.sea); });
    return pick(pool, r).id;
  }
  function boon(S, k, n) { S.voy.boon = S.voy.boon || {}; S.voy.boon[k] = (S.voy.boon[k] || 0) + n; }
  function boonText(b) {
    if (!b) return "";
    var p = [];
    if (b.hp) p.push((b.hp > 0 ? "+" : "−") + Math.abs(b.hp) + " lantern life");
    if (b.draw) p.push("+" + b.draw + " card in your opening hand");
    return p.join(" · ");
  }

  // Historier: hver har to valg. fx(S, r) ændrer gemt tilstand og returnerer {t: tekst, card: id?}.
  // Kort, konkrete tekster (≤ ~25 ord) — det skal læses på en telefon midt i en rejse.
  var EVENTS = [
    { id: "bell", i: "🔔", n: "The Drowned Bell", t: "A bell tolls beneath the waves. Something down there is calling your name.",
      ch: [
        { t: "Dive for it", sub: "Half the time a rare spirit. Half the time, cold water.", fx: function (S, r) {
          if (r() < 0.5) { var id = randomCard(r, "r", { sea: true }); give(S, id); return { t: "Your hand closes on something warm. A spirit rises with you.", card: id }; }
          boon(S, "hp", -4); return { t: "Only cold and dark. You surface shaking — your lantern is weaker for the next warden (−4 life)." }; } },
        { t: "Row on", sub: "Some calls are best left unanswered.", fx: function () { return { t: "The bell falls silent behind you." }; } },
      ] },
    { id: "whale", i: "🐋", n: "Whale of Lights", t: "A whale made of slow lights surfaces beside your boat and looks at you.",
      ch: [
        { t: "Ride its wake", sub: "+1 card in your opening hand next warden battle.", fx: function (S) { boon(S, "draw", 1); return { t: "You fly across the water. Your spirits stir, eager." }; } },
        { t: "Sing to it", sub: "+6 ✦ glimmer", fx: function (S) { S.embers += 6; return { t: "It sings back. Glimmer rains from its spout. (+6 ✦)" }; } },
      ] },
    { id: "keeper", i: "👻", n: "The Lost Keeper", t: "The ghost of an old lighthouse keeper drifts on a raft. “Spare a little light, sailor?”",
      ch: [
        { t: "Give 6 ✦ glimmer", sub: "+4 lantern life next warden battle.", need: function (S) { return S.embers >= 6; }, fx: function (S) { S.embers -= 6; boon(S, "hp", 4); return { t: "“Bless you.” She breathes on your lantern. It burns stronger (+4 life next warden battle)." }; } },
        { t: "Sail past", sub: "You need every spark you have.", fx: function () { return { t: "She watches you go, and fades." }; } },
      ] },
    { id: "sirens", i: "🎶", n: "Singing Rocks", t: "Voices sing from black rocks: “Give us one spirit, and pass in peace.”",
      ch: [
        { t: "Give a spirit", sub: "Lose a random spare spirit. Gain a pack.", fx: function (S, r) {
          var inDeck = function (id) { return S.deck.filter(function (x) { return x === id; }).length; };
          var spare = Object.keys(S.coll).filter(function (id) { return S.coll[id] > inDeck(id); });
          if (!spare.length) { S.packs++; return { t: "They take pity on your small lantern. A pack washes aboard anyway." }; }
          var id = pick(spare, r); S.coll[id]--; if (!S.coll[id]) delete S.coll[id];
          var cnt = 0; S.deck = S.deck.filter(function (x) { if (x === id && ++cnt > (S.coll[id] || 0)) return false; return true; });
          S.packs++; return { t: D.BY[id].n + " walks into the song. A sealed pack floats up where it went.", lost: id }; } },
        { t: "Push through", sub: "−3 lantern life next warden battle.", fx: function (S) { boon(S, "hp", -3); return { t: "The rocks scrape your hull. Your lantern flickers (−3 life next warden battle)." }; } },
      ] },
    { id: "star", i: "🌠", n: "Starfall", t: "A star falls hissing into the sea just ahead of you.",
      ch: [
        { t: "Fish it out", sub: "A random spirit — any rarity.", fx: function (S, r) {
          var x = r(), rar = x < 0.1 ? "m" : x < 0.4 ? "r" : x < 0.75 ? "u" : "c", id = randomCard(r, rar, { sea: rar === "m" });
          var m = give(S, id); return { t: "Still glowing, it climbs into your lantern." + (m ? " (A spare — melted into " + m + " ✦.)" : ""), card: id }; } },
        { t: "Make a wish", sub: "+3 ✦ glimmer and a lantern blessing (+2 life).", fx: function (S) { S.embers += 3; boon(S, "hp", 2); return { t: "You wish for courage. The sea feels a little brighter. (+3 ✦, +2 life next warden battle)" }; } },
      ] },
    { id: "storm", i: "⛈️", n: "Eye of the Storm", t: "Lightning dances on your mast. The air tastes of iron.",
      ch: [
        { t: "Catch the lightning", sub: "+1 card in hand, but −2 lantern life, next warden battle.", fx: function (S) { boon(S, "draw", 1); boon(S, "hp", -2); return { t: "It burns — and it crackles in your deck. (+1 card, −2 life next warden battle)" }; } },
        { t: "Lower the sail", sub: "Wait it out. Safe.", fx: function () { return { t: "The storm rolls past. You lose nothing but time." }; } },
      ] },
    { id: "bottle", i: "🍾", n: "Message in a Bottle", t: "A bottle bobs against the hull. Inside: a map scrap, and a few sparks.",
      ch: [
        { t: "Read it", sub: "Learn about the next warden. +3 ✦", fx: function (S) { S.embers += 3; var is = D.ISLANDS[S.island], tr = is.trait && D.TRAITS[is.trait];
          return { t: "“" + is.n + " is held by " + is.foe + ". " + (tr ? "Beware — " + tr.n + ": " + tr.t : "Strike its open lanes.") + "” (+3 ✦)" }; } },
        { t: "Keep the bottle", sub: "+5 ✦ glimmer (it’s pretty).", fx: function (S) { S.embers += 5; return { t: "It catches the light nicely. (+5 ✦)" }; } },
      ] },
    { id: "map", i: "🧭", n: "The Torn Map", t: "Half a map, pinned under a dead lantern on a drifting crate. An X near the next island.",
      need: function (S) { return S.island < D.ISLANDS.length - 1 && !S.quest; },
      ch: [
        { t: "Keep the map", sub: "On the next crossing, one path will lead to treasure.", fx: function (S) { S.quest = { to: S.island + 1 }; return { t: "You fold it into your coat. Next crossing — look for the X. 🗺️" }; } },
        { t: "Trade it to the gulls", sub: "+5 ✦ glimmer now.", fx: function (S) { S.embers += 5; return { t: "The gulls pay in shiny bits. (+5 ✦)" }; } },
      ] },
    { id: "ghost", i: "🚢", n: "The Ghost Ship", t: "A ship of pale lanterns drifts past. No one at the wheel. Something glows in the hold.",
      ch: [
        { t: "Board it", sub: "Likely a drifter spirit. But the crew may take a flame.", need: function (S) { return S.flames >= 2; }, fx: function (S, r) {
          if (r() < 0.6) { var dr = D.CARDS.filter(function (c) { return c.sea && c.r !== "m"; }), id = pick(dr, r).id, m = give(S, id); return { t: "In the hold, a spirit no pack has ever held. It follows you home." + (m ? " (A spare — melted into " + m + " ✦.)" : ""), card: id }; }
          S.flames--; return { t: "Cold hands in the dark. You escape — but one flame stays behind on the ship.", flameLost: 1 }; } },
        { t: "Hail it", sub: "+4 ✦ — they toss you a few coins.", fx: function (S) { S.embers += 4; return { t: "A pale hand waves. A pouch lands on your deck. (+4 ✦)" }; } },
      ] },
    { id: "shrine", i: "⛩️", n: "The Old Shrine", t: "A tiny shrine on a rock, built by keepers long ago. A bowl waits for an offering.",
      ch: [
        { t: "Offer 8 ✦ glimmer", sub: "Gain a pack.", need: function (S) { return S.embers >= 8; }, fx: function (S) { S.embers -= 8; S.packs++; return { t: "The bowl glows. When you look again, a sealed pack lies in it." }; } },
        { t: "Say a prayer", sub: "+1 card in your opening hand next warden battle.", fx: function (S) { boon(S, "draw", 1); return { t: "You feel lighter. Your spirits stand ready." }; } },
      ] },
    { id: "kelp", i: "🌿", n: "The Kelp Maze", t: "Glowing kelp closes in around your boat. Somewhere inside, something hums.",
      ch: [
        { t: "Follow the glow", sub: "Maybe a Root spirit. Maybe nothing.", fx: function (S, r) {
          if (r() < 0.6) { var pool = D.CARDS.filter(function (c) { return c.el === "rod" && !c.sea && (c.r === "c" || c.r === "u"); }), id = pick(pool, r).id, m = give(S, id);
            return { t: "A small root spirit, humming to itself. It climbs aboard." + (m ? " (A spare — melted into " + m + " ✦.)" : ""), card: id }; }
          return { t: "Just kelp, all the way down. You find your way out." }; } },
        { t: "Cut straight through", sub: "+4 ✦, but −2 lantern life next warden battle.", fx: function (S) { S.embers += 4; boon(S, "hp", -2); return { t: "Sap and sparks everywhere. (+4 ✦, −2 life next warden battle)" }; } },
      ] },
    { id: "shoal", i: "🐟", n: "Moonlit Shoal", t: "Under the moon, a shoal of mist-fish dances in perfect circles.",
      ch: [
        { t: "Join the dance", sub: "A Mist spirit joins you.", fx: function (S, r) {
          var pool = D.CARDS.filter(function (c) { return c.el === "taage" && !c.sea && (c.r === "c" || c.r === "u"); }), id = pick(pool, r).id, m = give(S, id);
          return { t: "You dance badly. One fish thinks it’s funny, and stays." + (m ? " (A spare — melted into " + m + " ✦.)" : ""), card: id }; } },
        { t: "Just watch", sub: "+3 lantern life next warden battle.", fx: function (S) { boon(S, "hp", 3); return { t: "It’s beautiful. Your lantern burns steadier for it. (+3 life next warden battle)" }; } },
      ] },
  ];

  // Skattekortet (0.9.2): et kort fra én overfart lover en skat på den næste — hvis man vælger den vej.
  function placeTreasure(S, leg, r) {
    if (!S.quest || S.quest.to !== leg.to) return leg;
    leg.nodes[1][r() < 0.5 ? 0 : 1] = "treasure"; S.quest = null;
    return leg;
  }
  function dig(S, r) {
    var drift = D.CARDS.filter(function (c) { return c.sea && !(S.coll[c.id] > 0); }), id, g = 5 + Math.floor(r() * 4);
    id = drift.length ? pick(drift, r).id : randomCard(r, "r");
    var m = give(S, id); S.embers += g;
    return { t: "You dig where the X is. A chest — " + g + " ✦ glimmer, and a spirit curled up asleep inside." + (m ? " (A spare — melted into " + m + " ✦.)" : ""), card: id };
  }
  function pickEvent(S, r) {
    var seen = (S.voy && S.voy.seenEv) || [];
    var pool = EVENTS.filter(function (e) { return seen.indexOf(e.id) < 0 && (!e.need || e.need(S)); });
    if (!pool.length) pool = EVENTS;
    return pick(pool, r);
  }
  // Vrag: glimmer, og nogle gange en ånd.
  function salvage(S, r) {
    var g = 4 + Math.floor(r() * 5); S.embers += g;
    if (r() < 0.35) { var id = randomCard(r, r() < 0.3 ? "u" : "c"); var m = give(S, id); return { t: "Among the timbers: " + g + " ✦ — and a spirit, sleeping in a lamp." + (m ? " (A spare — melted into " + m + " ✦.)" : ""), card: id, g: g }; }
    return { t: "You pry " + g + " ✦ glimmer from the broken hull.", g: g };
  }
  // Havn: tænd en flamme igen — eller, hvis alle brænder, hvil og få glimmer.
  function rest(S) {
    if (S.flames < 3) { S.flames++; return { t: "Warm fires and quiet water. A lost flame is lit again. 🔥", flame: 1 }; }
    S.embers += 5; boon(S, "hp", 2); return { t: "All your flames burn bright. You rest anyway. (+5 ✦, +2 life next warden battle)" };
  }
  // Tågehandleren: 3 ånder til salg (en drifter, hvis der er nogen tilbage).
  var PRICE = { c: 4, u: 7, r: 14, m: 30 };
  function traderStock(S, r) {
    var out = [];
    var drift = D.CARDS.filter(function (c) { return c.sea && !(S.coll[c.id] > 0); });
    if (drift.length) out.push(pick(drift, r).id);
    for (var g = 0; out.length < 3 && g < 50; g++) {
      var id = randomCard(r, r() < 0.25 ? "r" : r() < 0.6 ? "u" : "c");
      if (out.indexOf(id) < 0 && (S.coll[id] || 0) < E.deckLimit(id)) out.push(id);
    }
    return out;
  }

  var api = { NODES: NODES, EVENTS: EVENTS, PRICE: PRICE, makeLeg: makeLeg, wildEncounter: wildEncounter, rewardChoices: rewardChoices,
    give: give, placeTreasure: placeTreasure, dig: dig, pickEvent: pickEvent, salvage: salvage, rest: rest, traderStock: traderStock, boonText: boonText };
  if (typeof module !== "undefined") module.exports = api; else root.VOY = api;
})(this);
