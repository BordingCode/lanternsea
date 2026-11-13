// Lanternsea — UI. Rules live in engine.js, cards in cards.js.
(function () {
  "use strict";
  var VERSION = "0.8.0";
  var KEY = "lanternsea_save", OLDKEY = "lygtebaerer_save"; // the game was called Lygtebærer before 0.2.0 — same origin, so old saves are still here
  var D = window.DATA, E = window.ENG, VOY = window.VOY;
  var app = document.getElementById("app");
  var R = E.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  try { Telemetri.init("lanternsea", VERSION); } catch (e) {}
  function T(k, d) { try { Telemetri.log(k, d); } catch (e) {} }

  // ---------- gem ----------
  var S;
  function load() {
    var raw = null; try { raw = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(OLDKEY)); } catch (e) {}
    S = raw ? E.migrate(raw) : null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var STARTER = ["g1", "g1", "g2", "g3", "t1", "t2", "t3", "r1", "r2", "r3", "n1", "n1"];

  // ---------- lyd (WebAudio-syntese) ----------
  var AC = null;
  var OUT = null; // fælles forstærker → kompressor → højttaler (lydene var for svage før 0.3.3)
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }
  function out() {
    var a = ac(); if (!a) return null;
    if (!OUT || OUT.ctx !== a) {
      try {
        var g = a.createGain(), cmp = a.createDynamicsCompressor();
        g.gain.value = 2.6; cmp.threshold.value = -14; cmp.knee.value = 8; cmp.ratio.value = 6; cmp.attack.value = 0.003; cmp.release.value = 0.2;
        g.connect(cmp); cmp.connect(a.destination); OUT = g; OUT.ctx = a;
      } catch (e) { return a.destination; }
    }
    return OUT;
  }
  function tone(f, dur, type, vol, slide, delay) {
    var a = ac(); if (!a) return;
    var t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out()); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, delay) {
    var a = ac(); if (!a) return;
    var n = a.sampleRate * dur, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 1800; s.buffer = buf; g.gain.value = vol || 0.2;
    s.connect(f); f.connect(g); g.connect(out()); s.start(a.currentTime + (delay || 0));
  }
  var SFX = {
    tap: function () { tone(660, 0.06, "triangle", 0.14); },
    tear: function () { noise(0.35, 0.35); tone(200, 0.3, "sawtooth", 0.05, 900); },
    flip: function (r) {
      var base = { c: 520, u: 660, r: 784, m: 988 }[r];
      tone(base, 0.18, "triangle", 0.12);
      if (r !== "c") tone(base * 1.5, 0.3, "sine", 0.1, null, 0.08);
      if (r === "r" || r === "m") tone(base * 2, 0.5, "sine", 0.08, null, 0.16);
      if (r === "r" || r === "m") { noise(0.3, 0.35, 0.02); tone(base / 2, 0.6, "sine", 0.2, base / 4); }
      if (r === "m") { tone(base * 2.5, 0.7, "sine", 0.07, null, 0.26); tone(base * 3, 0.9, "sine", 0.05, null, 0.36); }
    },
    charge: function () { tone(220, 0.9, "sine", 0.06, 660); },
    play: function () { tone(330, 0.12, "triangle", 0.2, 520); },
    atk: function () { noise(0.08, 0.35); },
    hit: function () { tone(140, 0.15, "square", 0.16, 70); noise(0.06, 0.25); },
    die: function () { tone(300, 0.35, "sawtooth", 0.14, 60); },
    face: function () { tone(110, 0.25, "square", 0.1, 55); noise(0.15, 0.2); },
    heal: function () { tone(523, 0.15, "sine", 0.08); tone(784, 0.2, "sine", 0.06, null, 0.08); },
    dodge: function () { tone(900, 0.14, "sine", 0.14, 1400); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.35, "triangle", 0.12, null, i * 0.12); }); },
    lose: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.45, "sine", 0.1, null, i * 0.18); }); },
  };

  // ---------- hjælpere ----------
  function h(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var toastT;
  function toast(msg) { var t = document.getElementById("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("on"); }, 2200); }
  function modal(html, buttons) {
    var m = document.getElementById("modal");
    m.innerHTML = '<div class="sheet">' + html + '<div class="row" style="width:100%"></div></div>';
    var row = m.querySelector(".row");
    return new Promise(function (res) {
      buttons.forEach(function (b) {
        var el = h('<button class="btn ' + (b.sec ? "sec" : "") + " " + (b.cls || "") + '" style="flex:1">' + b.t + "</button>");
        el.onclick = function () { SFX.tap(); m.classList.add("hidden"); res(b.v); };
        row.appendChild(el);
      });
      m.classList.remove("hidden");
    });
  }
  function hash(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }

  // Procedural ånde-kunst: hvert kort får sit eget lille lysvæsen.
  var ARTC = {};
  function art(id) {
    if (!ARTC[id]) ARTC[id] = window.ART(id, D.BY[id], E.rng(hash(id) + 7)); // tegnes i art.js
    return ARTC[id];
  }
  function kwText(c) {
    var k = c.kw, out = [];
    if (k.gnist) out.push("Spark " + k.gnist); if (k.taage) out.push("Veil"); if (k.flok) out.push("Kin");
    if (k.rod) out.push("Mend " + k.rod); if (k.sluger) out.push("Devour"); if (k.rally) out.push("Rally"); if (k.ambush) out.push("Ambush " + k.ambush);
    return out.join(" · ");
  }
  function cardHTML(id, o) {
    o = o || {}; var c = D.BY[id];
    var a = o.unit ? o.unit.a + (o.bonus || 0) : c.a, hp = o.unit ? o.unit.h : c.h;
    return '<div class="card ' + c.el + " " + c.r + (o.cls ? " " + o.cls : "") + '" data-id="' + id + '"' + (o.attr || "") + ">" +
      '<div class="art">' + art(id) + "</div>" +
      (o.unit ? "" : '<div class="cost">' + c.c + "</div>") +
      '<div class="nm">' + esc(c.n) + "</div>" +
      '<div class="kw">' + kwText(c) + "</div>" +
      '<div class="st at' + (o.bonus > 0 ? " boosted" : "") + '">' + a + '</div><div class="st hp' + (o.unit && hp < o.unit.mh ? " hurt" : "") + '">' + hp + "</div>" +
      (o.unit && o.unit.shield ? '<div class="shield"></div>' : "") +
      (o.badge ? '<div class="badge">' + o.badge + "</div>" : "") +
      (o.isNew ? '<div class="new">NEW!</div>' : "") + "</div>";
  }
  function cardInfo(id) {
    var c = D.BY[id], s = "<b>" + esc(c.n) + "</b> · " + D.EL[c.el] + " · " + D.RAR[c.r] + " · costs " + c.c + " light<br>";
    var k = c.kw, parts = [];
    Object.keys(k).forEach(function (key) { parts.push(D.KW[key].replace(/\bN\b/g, k[key])); });
    return s + (parts.length ? parts.join("<br>") : "<i>" + esc(c.t) + "</i>");
  }
  function flamesHTML() { var s = ""; for (var i = 0; i < 3; i++) s += '<i class="flame' + (i < S.flames ? "" : " out") + '"></i> '; return s; }
  function owned(id) { return S.coll[id] || 0; }
  function uniqueOwned() { return D.CARDS.filter(function (c) { return owned(c.id) > 0; }).length; }
  // Samle-milepæle: et langsigtet mål ved siden af rejsen. Belønninger gives automatisk (og indhentes, hvis de blev sprunget over).
  var MILES = [10, 15, 20, 25, 30, 36]; // 36 = alle, også drifterne fra havet (0.8.0)
  var LURE = { c: 5, u: 10, r: 22, m: 40 }; // glimmer-pris for at lokke en bestemt ånd (som Hearthstones dust)
  function mileReward(m) { return m === 30 ? 3 : m === 36 ? 2 : 1; }
  function claimMiles() {
    var n = uniqueOwned(), got = [];
    S.miles = S.miles || {};
    MILES.forEach(function (m) { if (n >= m && !S.miles[m]) { S.miles[m] = 1; S.packs += mileReward(m); got.push(m); T("progress", { step: "collection", n: m }); } });
    if (got.length) save();
    return got;
  }

  // Søkort: øerne snor sig fra bunden (start) mod The Black Lighthouse øverst. Procedural SVG.
  var ISLPOS = [[30, 148], [70, 128], [34, 106], [68, 84], [30, 62], [66, 40], [50, 15]];
  function seaChart() {
    var W = '<svg viewBox="0 0 100 162" preserveAspectRatio="xMidYMid meet" class="chart"><defs>' +
      '<radialGradient id="lit"><stop offset="0" stop-color="#fff6d8"/><stop offset=".4" stop-color="#ffb347" stop-opacity=".6"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="dark"><stop offset=".3" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><radialGradient id="sea" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="#1d2a55"/><stop offset="1" stop-color="#080c1a"/></radialGradient></defs>' +
      '<rect width="100" height="162" fill="url(#sea)" rx="6"/>';
    var r = E.rng(77);
    for (var k = 0; k < 26; k++) { var wx = r() * 92 + 2, wy = r() * 156 + 3; W += '<path d="M' + wx.toFixed(1) + " " + wy.toFixed(1) + " q2 -1.4 4 0 t4 0" + '" stroke="#6fc3ff" stroke-opacity=".13" stroke-width=".5" fill="none"/>'; }
    // rute
    var path = "M" + ISLPOS[0][0] + " " + ISLPOS[0][1];
    for (var i = 1; i < ISLPOS.length; i++) { var a0 = ISLPOS[i - 1], a1 = ISLPOS[i]; path += " Q" + ((a0[0] + a1[0]) / 2 + (i % 2 ? 14 : -14)) + " " + ((a0[1] + a1[1]) / 2) + " " + a1[0] + " " + a1[1]; }
    W += '<path d="' + path + '" stroke="#c9a86a" stroke-opacity=".45" stroke-width=".7" stroke-dasharray="1.6 2" fill="none"/>';
    // Overfartens to stop (sejladsen mellem øerne) som små lys på ruten.
    if (S.island > 0) {
      var q0 = ISLPOS[S.island - 1], q2 = ISLPOS[S.island], q1 = [(q0[0] + q2[0]) / 2 + (S.island % 2 ? 14 : -14), (q0[1] + q2[1]) / 2], vy = S.voy && S.voy.to === S.island ? S.voy : null;
      [1 / 3, 2 / 3].forEach(function (t, k) {
        var x = (1 - t) * (1 - t) * q0[0] + 2 * t * (1 - t) * q1[0] + t * t * q2[0], y = (1 - t) * (1 - t) * q0[1] + 2 * t * (1 - t) * q1[1] + t * t * q2[1], done = vy && vy.step > k;
        W += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.2" fill="' + (done ? "#ffd27a" : "#0b1020") + '" stroke="#c9a86a" stroke-width=".5"/>' + (done ? "" : '<text x="' + x.toFixed(1) + '" y="' + (y + 1.1).toFixed(1) + '" font-size="2.8" text-anchor="middle" fill="#c9a86a">?</text>');
      });
    }
    D.ISLANDS.forEach(function (is, i) {
      var p = ISLPOS[i], st = i < S.island ? "done" : i === S.island ? "cur" : "lock", rr = E.rng(hash(is.n));
      var n = 9, R = i === 6 ? 9.5 : 7.5 + rr() * 1.5, pts = [];
      for (var j = 0; j < n; j++) { var ang = j / n * Math.PI * 2, rad = R * (0.75 + rr() * 0.4); pts.push([p[0] + Math.cos(ang) * rad * 1.25, p[1] + Math.sin(ang) * rad * 0.8]); }
      function mid(u, v) { return ((u[0] + v[0]) / 2).toFixed(1) + " " + ((u[1] + v[1]) / 2).toFixed(1); }
      var d = "M" + mid(pts[n - 1], pts[0]);
      for (j = 0; j < n; j++) d += " Q" + pts[j][0].toFixed(1) + " " + pts[j][1].toFixed(1) + " " + mid(pts[j], pts[(j + 1) % n]);
      var land = st === "lock" ? "#1a2036" : st === "done" ? "#3a5a3a" : "#4a4a6a", rim = st === "lock" ? "#2a3150" : "#c9a86a";
      W += '<g class="mi ' + st + '" data-i="' + i + '">' + (i === 6 && st !== "done" ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="18" fill="url(#dark)" class="darkaura"/>' : "") + (st === "done" ? '<circle cx="' + p[0] + '" cy="' + (p[1] - 4) + '" r="11" fill="url(#lit)"/>' : "") +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="transparent"/>' +
        '<path d="' + d + 'Z" fill="' + land + '" stroke="' + rim + '" stroke-width=".5"/>' +
        // fyrtårn
        '<rect x="' + (p[0] - 0.9) + '" y="' + (p[1] - 6) + '" width="1.8" height="5" fill="' + (st === "lock" ? "#2a3150" : "#e8e0d0") + '"/>' +
        '<circle cx="' + p[0] + '" cy="' + (p[1] - 6.5) + '" r="1.3" fill="' + (st === "done" ? "#fff1a8" : st === "cur" ? "#553" : "#223") + '"/>' +
        '<text x="' + p[0] + '" y="' + (p[1] + 11) + '" text-anchor="middle" font-size="3.4" fill="' + (st === "lock" ? "#5a6388" : "#dfe3ff") + '" font-weight="700">' + (st === "lock" && i > S.island + 1 ? "?" : esc(is.n)) + "</text>" +
        (st === "cur" ? '<g class="boat"><path d="M' + (p[0] + 7) + " " + (p[1] + 2) + " l6 0 l-1.2 2 l-3.6 0z" + '" fill="#c9a86a"/><path d="M' + (p[0] + 10) + " " + (p[1] + 2) + " l0 -6 l3 5z" + '" fill="#eef0ff"/><circle cx="' + (p[0] + 9) + '" cy="' + (p[1] + 0.6) + '" r=".9" fill="#ffd27a"/></g>' : "") +
        "</g>";
    });
    return W + "</svg>";
  }

  // Kampens baggrund: horisont, bølger og vogterens ø med et slukket fyrtårn. Tændes ved sejr.
  function battleScene(wild) {
    var r = E.rng(hash(wild ? "open sea " + wild : D.ISLANDS[S.island].n)), waves = "";
    for (var k = 0; k < 14; k++) { var x = r() * 96, y = 26 + r() * 13; waves += '<path d="M' + x.toFixed(1) + " " + y.toFixed(1) + ' q1.5 -1 3 0 t3 0" stroke="#6fc3ff" stroke-opacity="' + (0.08 + (y - 26) / 100).toFixed(2) + '" stroke-width=".35" fill="none"/>'; }
    var iw = 18 + r() * 8, top = 20 - r() * 3;
    if (wild) return '<svg class="scene" viewBox="0 0 100 40" preserveAspectRatio="xMidYMid slice"><rect width="100" height="24.5" fill="#0b1020" fill-opacity=".3"/><rect y="24.5" width="100" height="16" fill="#0d1430"/>' +
      '<circle cx="' + (20 + r() * 60).toFixed(1) + '" cy="9" r="3" fill="#eef0ff" fill-opacity=".5"/>' + waves + waves.replace(/stroke-opacity="[^"]*"/g, 'stroke-opacity=".12" transform="translate(4 -3)"') + "</svg>";
    return '<svg class="scene" viewBox="0 0 100 40" preserveAspectRatio="xMidYMid slice"><defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1020" stop-opacity="0"/><stop offset="1" stop-color="#1a2348"/></linearGradient>' +
      '<radialGradient id="beam"><stop offset="0" stop-color="#fff1a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="100" height="24.5" fill="url(#sky)"/><rect y="24.5" width="100" height="16" fill="#0d1430"/>' +
      '<path d="M' + (50 - iw / 2) + ' 24.6 Q' + (50 - iw / 4) + " " + top + " 50 " + (top + 0.5) + " Q" + (50 + iw / 4) + " " + top + " " + (50 + iw / 2) + ' 24.6Z" fill="#141a33"/>' +
      '<rect x="49.2" y="' + (top - 7) + '" width="1.6" height="7.5" fill="#1f2747"/><rect x="48.8" y="' + (top - 8.2) + '" width="2.4" height="1.4" fill="#1f2747"/>' +
      '<g class="lamp"><circle cx="50" cy="' + (top - 8.8) + '" r="7" fill="url(#beam)"/><circle cx="50" cy="' + (top - 8.8) + '" r=".9" fill="#fff6d8"/></g>' +
      waves + "</svg>";
  }

  // ---------- skærme ----------
  function show(el) { app.innerHTML = ""; app.appendChild(el); var t = document.getElementById("toast"); clearTimeout(toastT); t.classList.remove("on"); }

  function intro() {
    var el = h('<div class="screen intro"><div class="grow" style="display:flex;flex-direction:column;justify-content:center;gap:8px">' +
      '<div style="width:140px;margin:0 auto">' + document.createElement("div").outerHTML + "</div>" +
      '<h1 style="text-align:center">Lanternsea</h1>' +
      '<p class="lead">The light has left the <b>Dark Sea</b>.</p>' +
      '<p class="lead">Catch spirits. Build a deck.<br>Relight <b>the Black Lighthouse</b>.</p>' +
      '<p class="dim" style="text-align:center">🔥🔥🔥 Lose them all, and the voyage restarts.</p>' +
      '</div><div class="bottom"><button class="btn" id="go">Open your first pack</button></div></div>');
    el.querySelector("div[style*='140px']").innerHTML = '<img src="icon.svg" alt="" style="width:140px;filter:drop-shadow(0 0 30px #ffb34788)">';
    el.querySelector("#go").onclick = function () {
      SFX.tap();
      S = E.newSave(); STARTER.forEach(function (id) { S.coll[id] = (S.coll[id] || 0) + 1; });
      S.deck = STARTER.slice(); save(); T("progress", { step: "start" });
      packScreen(true);
    };
    show(el);
  }

  function home() {
    var caught = claimMiles();
    var el = h('<div class="screen"><div class="hud"><div class="flames">' + flamesHTML() + '</div><div class="row"><span class="pill">✦ ' + S.embers + ' glimmer</span><button class="pill" id="binder">📖 ' + uniqueOwned() + "/" + D.CARDS.length + " spirits</button></div></div>" +
      '<h2 style="margin-top:10px">The Dark Sea' + (S.runs > 1 ? ' <span class="dim" style="font-size:14px">· voyage ' + S.runs + "</span>" : "") + '</h2><div class="map"></div><div class="info" id="islinfo" style="min-height:64px"></div>' +
      '<div class="bottom"><div class="row"><button class="btn sec" id="deck">Deck (' + S.deck.length + ')</button><button class="btn sec" id="packs">Packs (' + S.packs + ")</button></div>" +
      '<button class="btn" id="sail">' + (legDone() ? "Land on " : "Set sail for ") + esc(D.ISLANDS[S.island].n) + "</button></div></div>");
    var map = el.querySelector(".map");
    map.innerHTML = seaChart();
    var islInfo = el.querySelector("#islinfo");
    function showIsl(i) {
      var is = D.ISLANDS[i], known = i <= S.island;
      islInfo.innerHTML = "<b>" + (i + 1) + ". " + esc(is.n) + "</b>" + (i < S.island ? " <span style='color:var(--gold)'>· lit ✦</span>" : i === S.island ? " <span style='color:var(--gold)'>· next</span>" : "") + "<br>" +
        (known ? "<span class='dim'>Warden: " + esc(is.foe) + " · " + is.hp + " life</span>" + (is.trait ? "<br><span class='trait'>⚑ " + D.TRAITS[is.trait].n + ":</span> " + D.TRAITS[is.trait].t : "") : "<span class='dim'>Beyond the dark. Unknown.</span>") +
        (i === S.island && S.voy && S.voy.to === i && S.voy.boon && VOY.boonText(S.voy.boon) ? "<br><span style='color:#8dffb0'>✧ Voyage: " + VOY.boonText(S.voy.boon) + "</span>" : "");
      map.querySelectorAll(".mi").forEach(function (g) { g.classList.toggle("picked", +g.dataset.i === i); });
    }
    map.onclick = function (ev) { var g = ev.target.closest(".mi"); if (g) { SFX.tap(); showIsl(+g.dataset.i); } };
    showIsl(S.island);
    el.querySelector("#deck").onclick = function () { SFX.tap(); deckScreen(); };
    el.querySelector("#binder").onclick = function () { SFX.tap(); binderScreen(); };
    var pb = el.querySelector("#packs"); pb.disabled = S.packs < 1 && S.embers < 12;
    if (S.packs < 1 && S.embers >= 12) pb.textContent = "Buy pack (12 ✦)";
    pb.onclick = function () {
      SFX.tap();
      if (S.packs < 1 && S.embers >= 12) { S.embers -= 12; S.packs++; save(); }
      if (S.packs > 0) packScreen(false);
    };
    el.querySelector("#sail").onclick = function () {
      SFX.tap();
      if (!E.validDeck(S.deck, S.coll)) { toast("Your deck needs 12–20 cards"); deckScreen(); return; }
      if (!legDone()) return voyageScreen();
      battleScreen();
    };
    show(el);

    if (caught.length) toast("🏆 Collection " + caught[caught.length - 1] + "/" + D.CARDS.length + " — bonus pack!");
    else if (S.packs > 0 && !S.seen.packhint) { S.seen.packhint = 1; save(); toast("You have an unopened pack!"); }
  }

  // ---------- pakke-ritualet ----------
  var RORD = { c: 0, u: 1, r: 2, m: 3 };
  var PACKNAME = { glod: "BLAZE TIDE", taage: "MIST TIDE", rod: "ROOT TIDE" };
  function packScreen(first) {
    if (S.packs < 1) return home();
    var ptype = S.packq && S.packq.length ? S.packq[0] : null;
    var el = h('<div class="screen"><div class="hud"><span class="pill">Packs: ' + S.packs + '</span><span class="pill">' + uniqueOwned() + "/" + D.CARDS.length + ' spirits</span></div>' +
      '<div class="packzone"><div class="pack"><div class="lbl">' + (ptype ? PACKNAME[ptype] : "THE DARK SEA") + '<br><span style="font-size:13px;color:#dfe3ff">5 light-spirits</span></div></div></div>' +
      '<div class="bottom"><div class="dim" style="text-align:center" id="hint">Tap the pack to tear it open</div><div class="row" id="btns"></div></div></div>');
    var pack = el.querySelector(".pack"), zone = el.querySelector(".packzone");
    if (ptype) pack.classList.add("p-" + ptype);
    var opened = false;
    zone.onclick = function () {
      if (opened) return; opened = true;
      ac(); pack.classList.add("shake"); SFX.charge();
      setTimeout(function () { pack.classList.remove("shake"); pack.classList.add("tear"); SFX.tear(); }, 520);
      setTimeout(function () { reveal(); }, 950);
    };
    function reveal() {
      S.packs--; if (ptype) S.packq.shift();
      el.querySelector(".hud .pill").textContent = "Packs: " + S.packs;
      var ids = E.openPack(R, ptype).sort(function (a, b) { return RORD[D.BY[a].r] - RORD[D.BY[b].r]; });
      var newOnes = {}, melted = 0;
      ids.forEach(function (id) {
        if (!owned(id)) newOnes[id] = 1;
        S.coll[id] = owned(id) + 1;
        var lim = E.deckLimit(id);
        if (S.coll[id] > lim) { S.coll[id] = lim; melted += { c: 1, u: 2, r: 4, m: 8 }[D.BY[id].r]; }
      });
      S.embers += melted; save();
      T("pack_open", { rar: ids.map(function (i) { return D.BY[i].r; }), ids: ids, uniq: uniqueOwned() });
      zone.innerHTML = '<div class="reveal"></div>';
      var rv = zone.querySelector(".reveal"), left = ids.length;
      el.querySelector("#hint").textContent = "Tap the cards to turn them over";
      ids.forEach(function (id, i) {
        var c = D.BY[id];
        var sc = h('<div class="slotc ' + c.r + '"><div class="flip"><div class="back"></div>' + cardHTML(id, { isNew: newOnes[id] }) + "</div></div>");
        sc.style.width = "var(--w)"; sc.querySelector(".flip").style.aspectRatio = "5/7";
        sc.style.animation = "fadein .3s " + i * 0.08 + "s both";
        var busy = false;
        sc.onclick = function () {
          if (busy || sc.classList.contains("open")) { if (sc.classList.contains("open")) toast(D.BY[id].n + " — " + D.BY[id].t); return; }
          busy = true;
          var wait0 = { c: 0, u: 350, r: 800, m: 1300 }[c.r];
          if (wait0) { sc.classList.add("charge"); SFX.charge(); }
          setTimeout(function () {
            sc.classList.remove("charge"); sc.classList.add("open"); SFX.flip(c.r);
            if (c.r === "m" || c.r === "r") { var f = h('<div class="flash"></div>'); if (c.r === "r") f.style.background = "radial-gradient(#ffc861aa,#ffc86100 60%)"; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 800); burst(sc, c.r); }
            if (navigator.vibrate && c.r !== "c") try { navigator.vibrate(c.r === "m" ? [30, 40, 60] : 25); } catch (e) {}
            left--; if (!left) done();
          }, wait0);
        };
        rv.appendChild(sc);
      });
      var btns = el.querySelector("#btns");
      var all = h('<button class="btn sec">Reveal all</button>');
      all.onclick = function () {
        var k = 0;
        rv.querySelectorAll(".slotc:not(.open)").forEach(function (s) { setTimeout(function () { s.click(); }, k++ * 220); });
      };
      btns.appendChild(all);
      function done() {
        var nNew = Object.keys(newOnes).length;
        el.querySelector("#hint").innerHTML = (nNew ? "<b style='color:var(--gold)'>" + nNew + " new spirits!</b> " : "") + (melted ? "Duplicates melted into <b>" + melted + " ✦ glimmer</b>." : "") + (!nNew && !melted ? "More spirits for your collection." : "");
        btns.innerHTML = "";
        var got = claimMiles();
        if (got.length) {
          el.querySelector("#hint").innerHTML += "<br><b style='color:var(--m)'>🏆 Collection " + got[got.length - 1] + "/" + D.CARDS.length + "!</b> Bonus pack" + (got.reduce(function (a, m) { return a + mileReward(m); }, 0) > 1 ? "s" : "") + " earned.";
          SFX.win();
        }
        var next = h('<button class="btn">' + (S.packs > 0 ? "Next pack (" + S.packs + ")" : "Continue") + "</button>");
        next.onclick = function () {
          SFX.tap();
          if (S.packs > 0) return packScreen(first);
          if (first) { S.deck = autoDeck(); save(); toast("I built a deck for you — change it whenever you like"); }
          else if (Object.keys(newOnes).length) toast("Add new spirits to your deck under 'Deck'");
          home();
        };
        btns.appendChild(next);
      }
    }
    show(el);
  }

  // Gnister + banner + rystelse, når et sjældent/mytisk kort vendes.
  function particles(target, col, n, reach) {
    var rc = target.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2;
    for (var i = 0; i < n; i++) {
      var sp = document.createElement("div"), ang = Math.random() * Math.PI * 2, d = reach * (0.4 + Math.random() * 0.6);
      sp.className = "spark"; sp.style.left = cx + "px"; sp.style.top = cy + "px"; sp.style.background = col[i % 3];
      sp.style.setProperty("--dx", Math.cos(ang) * d + "px"); sp.style.setProperty("--dy", Math.sin(ang) * d + "px");
      sp.style.animationDelay = Math.random() * 0.12 + "s"; document.body.appendChild(sp);
      (function (e) { setTimeout(function () { e.remove(); }, 1200); })(sp);
    }
  }
  var ELCOL = { glod: ["#ffb347", "#ff6a2a", "#fff1c9"], taage: ["#9fd8ff", "#4a7dff", "#eaf6ff"], rod: ["#8ff0a6", "#2f9c5a", "#eaffef"] };
  function burst(target, r) {
    particles(target, r === "m" ? ["#d48bff", "#fff", "#9fd8ff"] : ["#ffc861", "#fff1c9", "#ff9a3d"], r === "m" ? 28 : 16, r === "m" ? 220 : 160);
    var bn = h('<div class="rarebanner">' + (r === "m" ? "MYTHIC!" : "RARE!") + "</div>");
    bn.style.color = r === "m" ? "var(--m)" : "var(--r)"; document.body.appendChild(bn); setTimeout(function () { bn.remove(); }, 1900);
    app.classList.remove("quake"); void app.offsetWidth; app.classList.add("quake");
  }

  // Automatisk deck: 15 kort, foretræk sjældne og en god kurve.
  function autoDeck() {
    var pool = [];
    D.CARDS.forEach(function (c) { for (var i = 0; i < Math.min(owned(c.id), E.deckLimit(c.id)); i++) pool.push(c.id); });
    pool.sort(function (a, b) {
      var A = D.BY[a], B = D.BY[b];
      return (RORD[B.r] * 3 + B.a + B.h - B.c * 1.6) - (RORD[A.r] * 3 + A.a + A.h - A.c * 1.6);
    });
    // Kurve: maks 3 kort der koster 5+, og mindst 6 der koster ≤2 (ellers sker der intet de første ture).
    var deck = [], big = 0;
    pool.forEach(function (id) { if (deck.length >= 15) return; if (D.BY[id].c >= 5) { if (big >= 3) return; big++; } deck.push(id); });
    var cheapN = function () { return deck.filter(function (id) { return D.BY[id].c <= 2; }).length; };
    var rest = pool.filter(function (id) { return D.BY[id].c <= 2; });
    deck.forEach(function (id) { var k = rest.indexOf(id); if (k >= 0) rest.splice(k, 1); });
    for (var i = deck.length - 1; i >= 0 && cheapN() < 6 && rest.length; i--) { if (D.BY[deck[i]].c >= 4) deck[i] = rest.shift(); }
    while (deck.length < 15 && rest.length) deck.push(rest.shift());
    return deck;
  }

  // Et konkret råd efter et nederlag, så tabet peger fremad (kort: maks ~12 ord).
  var TRAITTIP = {
    regrow: "Hit hard: wounded spirits of hers heal. Kill in one blow.",
    embers: "Keep fragile spirits out of lanes where his Blaze will land.",
    gale: "Only three lanes — every space counts. Pack stronger spirits.",
    fog: "No plan to read. Veil spirits survive the surprise.",
    tide: "His lantern heals. Push many lanes at once.",
    night: "It draws fast. End it quickly, or build to outlast.",
  };
  var TIPS = [
    "Faded cards show the warden’s next move. Block them.",
    "Kin spirits grow stronger with friends of the same light.",
    "Rally spirits boost the spirits beside them.",
    "Spark hits the moment you play it — aim it.",
    "An empty lane hits the enemy lantern. Find open lanes.",
    "Lure missing spirits with glimmer in the Collection.",
    "Choose tide packs that match your deck’s light.",
  ];
  function tipHTML(isl) {
    var t = isl.trait && R() < 0.6 ? TRAITTIP[isl.trait] : TIPS[Math.floor(R() * TIPS.length)];
    return "<p class='tip'>💡 " + t + "</p>";
  }

  // ---------- samlemappe ----------
  function binderScreen() {
    var n = uniqueOwned(), next = MILES.filter(function (m) { return !S.miles || !S.miles[m]; })[0];
    var bars = ["glod", "taage", "rod"].map(function (e) {
      var all = D.CARDS.filter(function (c) { return c.el === e; }), have = all.filter(function (c) { return owned(c.id); }).length;
      return '<div class="ebar ' + e + '"><span>' + D.EL[e] + '</span><div><i style="width:' + (have / all.length * 100) + '%"></i></div><b>' + have + "/" + all.length + "</b></div>";
    }).join("");
    var miles = MILES.map(function (m) { var done = S.miles && S.miles[m]; return '<span class="mile' + (done ? " done" : n >= m ? " ready" : "") + '">' + (done ? "✦ " : "") + m + "</span>"; }).join("");
    var el = h('<div class="screen"><div class="hud"><h2 style="margin:0">Collection</h2><div class="row"><span class="pill">✦ ' + S.embers + '</span><span class="pill">' + n + "/" + D.CARDS.length + "</span></div></div>" +
      '<div class="bars">' + bars + "</div>" +
      '<div class="miles">' + miles + '</div><div class="dim" style="font-size:13px;text-align:center;margin:2px 0 8px">' +
      (next ? "Catch " + (next - n) + " more for a bonus pack" + (next === 30 ? " — and the Keeper's reward" : "") + "." : "Every spirit of the Dark Sea is yours.") + "</div>" +
      '<div class="grid"></div><div class="info" id="binfo">Tap a spirit to read it — or lure one you’re missing with ✦ glimmer.</div>' +
      '<div class="bottom" style="margin-top:8px"><button class="btn" id="back">Back</button></div></div>');
    var grid = el.querySelector(".grid"), binfo = el.querySelector("#binfo");
    D.CARDS.forEach(function (c) {
      var o = owned(c.id);
      var w = h('<div>' + (o ? cardHTML(c.id, { badge: "×" + o }) : '<div class="card unknown ' + c.r + (c.sea ? " sea" : "") + '"><div class="q">' + (c.sea ? "🌊" : "?") + '</div><div class="nm">' + (c.sea ? "Found at sea" : D.RAR[c.r]) + "</div></div>") + "</div>");
      w.onclick = function () {
        SFX.tap();
        if (c.sea && !o) { binfo.innerHTML = "<b>A drifter.</b> <span class='dim'>Some spirits never come in packs. Look for them on the voyage between islands — catch wild spirits, trade with the Fog Trader, or brave strange waters.</span>"; return; }
        binfo.innerHTML = (o ? cardInfo(c.id) : "<span class='dim'>Not caught yet:</span><br>" + cardInfo(c.id)) + (c.sea ? "<br><span style='color:#6fc3ff'>🌊 Drifter — found only at sea.</span>" : "");
        if (o < E.deckLimit(c.id) && !c.sea) {
          var cost = LURE[c.r], btn = h('<button class="btn lure"' + (S.embers < cost ? " disabled" : "") + ">Lure it · " + cost + " ✦</button>");
          if (S.embers < cost) btn.textContent = "Lure it · " + cost + " ✦ (you have " + S.embers + ")";
          btn.onclick = function (ev) {
            ev.stopPropagation(); if (S.embers < cost) return;
            S.embers -= cost; S.coll[c.id] = owned(c.id) + 1; save();
            T("lure", { id: c.id, r: c.r, cost: cost });
            SFX.flip(c.r); if (c.r === "r" || c.r === "m") burst(w, c.r); else particles(w, ELCOL[c.el], 14, 90);
            var got = claimMiles(), msg = got.length ? "🏆 Collection " + got[got.length - 1] + "/" + D.CARDS.length + " — bonus pack!" : c.n + " joins you" + (o ? "" : " — add it under 'Deck'");
            setTimeout(function () { binderScreen(); toast(msg); }, 900);
          };
          binfo.appendChild(btn);
        }
      };
      grid.appendChild(w);
    });
    el.querySelector("#back").onclick = function () { SFX.tap(); home(); };
    show(el);
  }

  // ---------- deckbygger ----------
  function deckScreen() {
    var filter = "all";
    var el = h('<div class="screen"><div class="hud"><h2 style="margin:0">Your deck</h2><div class="row"><div class="curve"></div><span class="pill" id="cnt"></span></div></div>' +
      '<div class="dim" style="font-size:13px;margin:4px 0 8px">Tap a spirit to add it. Tap − to remove. 12–20 cards.</div><div id="elmix" class="elmix"></div>' +
      '<div class="filters"><button class="chip on" data-f="all">All</button><button class="chip" data-f="deck">In deck</button><button class="chip" data-f="glod">Blaze</button><button class="chip" data-f="taage">Mist</button><button class="chip" data-f="rod">Root</button><button class="chip" data-f="missing">Missing</button></div>' +
      '<div class="grid"></div><div class="info" id="dinfo">Tap a card to read it.</div>' +
      '<div class="bottom" style="margin-top:8px"><div class="row"><button class="btn sec" id="auto">Build for me</button><button class="btn" id="back">Done</button></div></div></div>');
    var grid = el.querySelector(".grid");
    function inDeck(id) { return S.deck.filter(function (x) { return x === id; }).length; }
    function render() {
      grid.innerHTML = "";
      D.CARDS.forEach(function (c) {
        var o = owned(c.id), d = inDeck(c.id);
        if (filter === "deck" && !d) return;
        if (filter === "missing" ? o : !o) return;
        if (["glod", "taage", "rod"].indexOf(filter) >= 0 && c.el !== filter) return;
        var wrap = h('<div style="position:relative">' + cardHTML(c.id, { cls: o ? (d ? "" : "notin") : "unowned", badge: o ? d + "/" + o : "?" }) + "</div>");
        if (d) {
          var minus = h('<button class="chip" style="position:absolute;left:50%;bottom:-17px;transform:translateX(-50%);padding:0 16px;line-height:24px;font-size:18px;background:#5a1f12">−</button>');
          minus.onclick = function (ev) { ev.stopPropagation(); S.deck.splice(S.deck.indexOf(c.id), 1); save(); SFX.tap(); render(); };
          wrap.appendChild(minus);
        }
        wrap.onclick = function () {
          el.querySelector("#dinfo").innerHTML = o ? cardInfo(c.id) : "You haven't caught this spirit yet.";
          if (!o) return;
          if (d >= Math.min(o, E.deckLimit(c.id))) { toast(d >= E.deckLimit(c.id) ? "Max " + E.deckLimit(c.id) + " of each in a deck" : "You only own " + o); return; }
          if (S.deck.length >= 20) { toast("Deck is full (20)"); return; }
          S.deck.push(c.id); save(); SFX.play(); render();
        };
        grid.appendChild(wrap);
      });
      var n = S.deck.length, cnt = el.querySelector("#cnt");
      cnt.textContent = n + " cards"; cnt.style.background = n < 12 || n > 20 ? "#5a1f12" : "#14402a";
      var ec = { glod: 0, taage: 0, rod: 0 }; S.deck.forEach(function (id) { ec[D.BY[id].el]++; });
      el.querySelector("#elmix").innerHTML = "<span class='e glod'>🔥 " + ec.glod + "</span><span class='e taage'>🌫 " + ec.taage + "</span><span class='e rod'>🌱 " + ec.rod + "</span>";
      var cv = [0, 0, 0, 0, 0, 0, 0]; S.deck.forEach(function (id) { cv[Math.min(6, D.BY[id].c - 1 < 0 ? 0 : D.BY[id].c - 1)]++; });
      var mx = Math.max.apply(null, cv) || 1;
      el.querySelector(".curve").innerHTML = cv.map(function (v) { return '<div style="height:' + (v / mx * 100) + '%"></div>'; }).join("");
    }
    el.querySelectorAll(".chip[data-f]").forEach(function (b) {
      b.onclick = function () { el.querySelectorAll(".chip[data-f]").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); filter = b.dataset.f; SFX.tap(); render(); };
    });
    el.querySelector("#auto").onclick = function () { S.deck = autoDeck(); save(); SFX.play(); render(); toast("Deck built"); };
    el.querySelector("#back").onclick = function () {
      if (S.deck.length < 12) { toast("At least 12 cards in your deck"); return; }
      SFX.tap(); home();
    };
    show(el); render();
  }

  // ---------- kamp ----------
  // enc: et vildt møde på havet (VOY.wildEncounter); ellers øens vogter.
  function battleScreen(enc) {
    var wild = !!enc, isl = enc || D.ISLANDS[S.island], opt = null;
    if (!wild && S.voy && S.voy.to === S.island && S.voy.boon) { opt = S.voy.boon; S.voy.boon = null; save(); }
    var b = E.newBattle(S.deck, wild ? enc : S.island, (R() * 1e9) >>> 0, opt);
    E.startTurn(b);
    var sel = -1, busy = false;
    var el = h('<div class="screen battle">' +
      '<div class="hero foe"><span>' + (wild ? "🌊" : "🌑") + ' <b>' + esc(isl.foe) + '</b></span><div class="hpbar"><div></div></div><span class="num"></span></div>' +
      '<div class="board" id="b1"></div><div class="midwrap">' + battleScene(wild && enc.el) + '<div class="mid" id="mid"></div></div><div class="lanes" id="lanes"></div><div class="board" id="b0"></div>' +
      '<div class="hero me"><span class="lys"></span><div class="hpbar"><div></div></div><span class="num"></span></div>' +
      '<div class="info" id="info"></div><div class="hand"></div>' +
      '<div class="row"><button class="btn sec" id="quit" style="padding:12px 14px;font-size:15px">Flee</button><div class="grow dim" style="font-size:13px;text-align:center" id="deckn"></div><button class="btn endbtn" id="end">End turn</button></div></div>');
    var b0 = el.querySelector("#b0"), b1 = el.querySelector("#b1"), hand = el.querySelector(".hand"), info = el.querySelector("#info"), mid = el.querySelector("#mid"), lanesEl = el.querySelector("#lanes");
    for (var i = 0; i < 4; i++) { b0.appendChild(h('<div class="slot" data-s="' + i + '"></div>')); b1.appendChild(h('<div class="slot" data-s="' + i + '"></div>')); }
    var view = null; // det viste brætstade (kan halte efter motoren under animation)
    function snap() { view = JSON.parse(JSON.stringify({ s: b.s.map(function (p) { return { hp: p.hp, mhp: p.mhp, board: p.board }; }) })); }
    snap();
    // Vogterens plan for næste tur (vises kun i din tur, mens intet animeres).
    function ghostAt(slot) {
      if (busy || b.over || b.who !== 0 || !b.plan || b.trait === "fog") return null;
      for (var k = 0; k < b.plan.length; k++) if (b.plan[k].slot === slot) return b.plan[k].id;
      return null;
    }
    function drawBoards() {
      [b0, b1].forEach(function (bd, si) {
        var side = view.s[si];
        bd.querySelectorAll(".slot").forEach(function (sl, i) {
          var u = side.board[i];
          var bonus = u ? E.attackOf(side, i) - u.a : 0;
          var g = !u && si === 1 ? ghostAt(i) : null;
          sl.innerHTML = u ? cardHTML(u.id, { unit: u, bonus: bonus }) : g ? cardHTML(g, { cls: "ghost", badge: "next" }) : "";
          sl.classList.toggle("target", si === 0 && sel >= 0 && !u && !busy && E.canPlay(b, sel, i));
          sl.classList.toggle("closed", E.closed(b, i));
        });
      });
      // Forhåndsvisning pr. bane: hvad sker der, når du trykker "Slut tur"?
      var lanes = "";
      for (var L = 0; L < 4; L++) {
        var mine = view.s[0].board[L], theirs = view.s[1].board[L], txt = "", gh = theirs ? null : ghostAt(L);
        if (mine) {
          var am = E.attackOf(view.s[0], L);
          if (am <= 0) txt = "<span class='dim'>—</span>";
          else if (!theirs) txt = "<b style='color:var(--gold)'>↑" + am + "</b><br><span class='dim'>lantern</span>";
          else if (theirs.shield) txt = "↑" + am + "<br><span style='color:var(--taage)'>veiled</span>";
          else txt = "↑" + am + "<br>" + (am >= theirs.h ? "<span style='color:#8dffb0'>kills</span>" : "<span class='dim'>" + theirs.h + " life</span>");
        } else if (theirs && (theirs.a > 0 || D.BY[theirs.id].kw.ambush)) { var amb = D.BY[theirs.id].kw.ambush; txt = "<span style='color:#ff8a8a'>↓" + theirs.a + "</span><br><span class='" + (amb ? "trait" : "dim") + "'>" + (amb ? "ambush " + amb : "open") + "</span>"; }
        else if (gh && D.BY[gh].a > 0) txt = "<span style='color:#ff8a8a'>⚠ ↓" + D.BY[gh].a + "</span><br><span class='dim'>next turn</span>";
        lanes += "<div>" + txt + "</div>";
      }
      lanesEl.innerHTML = lanes;
      [["foe", 1], ["me", 0]].forEach(function (x) {
        var p = view.s[x[1]], hero = el.querySelector(".hero." + x[0]);
        hero.querySelector(".hpbar div").style.width = Math.max(0, p.hp / p.mhp * 100) + "%";
        hero.querySelector(".num").textContent = "♥ " + Math.max(0, p.hp) + "/" + p.mhp;
      });
    }
    function drawHand() {
      var p = b.s[0];
      // Lys (mana) som et stort tal + prikker — før 0.8.0 lignede lygtens livsbar lyset (dommer, nat 2).
      el.querySelector(".lys").innerHTML = '<span class="lysn">' + p.lys + "<small>/" + Math.min(b.turn, 8) + '</small></span><span class="lysw">light<span class="dots">' + Array.from({ length: Math.min(b.turn, 8) }, function (_, i) { return '<i class="' + (i < p.lys ? "on" : "") + '"></i>'; }).join("") + "</span></span>";
      hand.innerHTML = "";
      p.hand.forEach(function (id, hi) {
        var c = h(cardHTML(id, { cls: (hi === sel ? "sel " : "") + (D.BY[id].c > p.lys ? "cant" : "") }));
        c.onclick = function () {
          if (busy) return;
          sel = sel === hi ? -1 : hi; SFX.tap();
          info.innerHTML = sel >= 0 ? cardInfo(id) + (D.BY[id].c > p.lys ? "<br><span style='color:#ff8a8a'>Not enough light yet.</span>" : "<br><span style='color:var(--gold)'>Tap an empty space.</span>") : "";
          drawHand(); drawBoards();
        };
        hand.appendChild(c);
      });
      el.querySelector("#deckn").textContent = "Turn " + b.turn + " · " + p.deck.length + " in deck";
      el.querySelector("#end").disabled = busy;
      var canAny = p.hand.some(function (id, hi) { for (var k = 0; k < 4; k++) if (E.canPlay(b, hi, k)) return true; return false; });
      el.querySelector("#end").classList.toggle("ready", !busy && !b.over && b.who === 0 && !canAny);
    }
    function full() { snap(); drawBoards(); drawHand(); }
    b0.onclick = function (ev) {
      var sl = ev.target.closest(".slot"); if (!sl || busy) return;
      var i = +sl.dataset.s;
      if (sel >= 0) {
        if (E.canPlay(b, sel, i)) {
          var start = b.log.length; E.play(b, sel, i); sel = -1; info.innerHTML = "";
          animate(b.log.slice(start)).then(after);
        } else if (b.s[0].board[i]) { info.innerHTML = cardInfo(b.s[0].board[i].id); }
        else toast("Not enough light");
      } else if (b.s[0].board[i]) info.innerHTML = cardInfo(b.s[0].board[i].id);
    };
    el.querySelector(".hero.foe").onclick = function () {
      info.innerHTML = "<b>" + esc(isl.foe) + "</b> · " + isl.hp + " life" + (b.trait ? "<br><span class='trait'>⚑ " + D.TRAITS[b.trait].n + ":</span> " + esc(D.TRAITS[b.trait].t) : "");
    };
    b1.onclick = function (ev) {
      var sl = ev.target.closest(".slot"); if (!sl) return; var u = b.s[1].board[+sl.dataset.s], g = ghostAt(+sl.dataset.s);
      if (u) info.innerHTML = cardInfo(u.id);
      else if (g) info.innerHTML = cardInfo(g) + "<br><span style='color:#ff8a8a'>Arrives here next turn.</span>";
    };
    function slotEl(si, slot) { return (si ? b1 : b0).querySelectorAll(".slot")[slot]; }
    function floatTxt(target, txt, cls) { var f = h('<div class="float ' + (cls || "") + '">' + txt + "</div>"); target.appendChild(f); setTimeout(function () { f.remove(); }, 800); }
    // Synlig synergi: når en ånd lander, vis hvem der fik mere angreb (Kin/Rally), og hvorfor.
    function kinPing(si, slot) {
      var side = view.s[si], u = side.board[slot]; if (!u) return;
      var without = { board: side.board.map(function (v, j) { return j === slot ? null : v; }) };
      side.board.forEach(function (v, j) {
        if (!v) return;
        var now = E.attackOf(side, j), before = j === slot ? v.a : E.attackOf(without, j);
        if (now > before) floatTxt(slotEl(si, j), "+" + (now - before) + " ⚔", "g");
      });
    }
    // Afspil motorens hændelser én for én på det viste brætstade.
    function animate(evs) {
      busy = true; drawHand();
      var p = Promise.resolve();
      evs.forEach(function (e) {
        p = p.then(function () {
          var V = view.s;
          if (e.t === "play") { V[e.si].board[e.slot] = JSON.parse(JSON.stringify(b.s[e.si].board[e.slot] || { id: e.id, a: D.BY[e.id].a, h: D.BY[e.id].h, mh: D.BY[e.id].h, shield: !!D.BY[e.id].kw.taage, el: D.BY[e.id].el })); var u0 = V[e.si].board[e.slot]; u0.h = D.BY[e.id].h; u0.a = D.BY[e.id].a; u0.mh = u0.h; u0.shield = !!D.BY[e.id].kw.taage; drawBoards(); var c = slotEl(e.si, e.slot).querySelector(".card"); if (c) c.classList.add("drop"); SFX.play(); if (e.si === 1) mid.textContent = wild ? "A wild " + D.BY[e.id].n + " joins the fight" : isl.foe + " calls " + D.BY[e.id].n; kinPing(e.si, e.slot); return wait(380); }
          if (e.t === "ambush") { var ca = slotEl(e.si, e.slot).querySelector(".card"); if (ca) { ca.classList.remove("lunge0", "lunge1"); void ca.offsetWidth; ca.classList.add("lunge" + e.si); } floatTxt(slotEl(e.si, e.slot), "Ambush!", "b"); SFX.atk(); return wait(320); }
          if (e.t === "atk") { var c2 = slotEl(e.si, e.slot).querySelector(".card"); if (c2) { c2.classList.remove("lunge0", "lunge1"); void c2.offsetWidth; c2.classList.add("lunge" + e.si); } SFX.atk(); return wait(200); }
          if (e.t === "hit") { var u = V[e.si].board[e.slot]; if (u) u.h -= e.n; drawBoards(); var se = slotEl(e.si, e.slot), c3 = se.querySelector(".card"); if (c3) c3.classList.add("hitfx"); floatTxt(se, "−" + e.n, e.n >= 4 ? "big" : ""); SFX.hit(); return wait(260); }
          if (e.t === "dodge") { var u2 = V[e.si].board[e.slot]; if (u2) u2.shield = false; drawBoards(); floatTxt(slotEl(e.si, e.slot), "veiled!", "b"); SFX.dodge(); return wait(260); }
          if (e.t === "die") { var c4 = slotEl(e.si, e.slot).querySelector(".card"); if (c4) { c4.classList.add("die"); particles(c4, ELCOL[D.BY[e.id].el], 12, 70); } SFX.die(); return wait(330).then(function () { V[e.si].board[e.slot] = null; drawBoards(); }); }
          if (e.t === "grow") { var u3 = V[e.si].board[e.slot]; if (u3) { u3.a++; u3.h++; u3.mh++; } drawBoards(); floatTxt(slotEl(e.si, e.slot), "+1/+1", "g"); SFX.heal(); return wait(260); }
          if (e.t === "face") { V[e.si].hp -= e.n; drawBoards(); var he = el.querySelector(e.si ? ".hero.foe" : ".hero.me"); he.classList.remove("hit"); void he.offsetWidth; he.classList.add("hit"); floatTxt(he, "−" + e.n); SFX.face();
            if (e.si === 0) { var vg = h('<div class="vignette"></div>'); document.body.appendChild(vg); setTimeout(function () { vg.remove(); }, 520); app.classList.remove("quake"); void app.offsetWidth; app.classList.add("quake"); }
            else particles(he, ["#ffc861", "#fff1c9", "#ff9a3d"], 10, 60); if (navigator.vibrate && e.si === 0) try { navigator.vibrate(30); } catch (x) {} return wait(300); }
          if (e.t === "regrow") { var u5 = V[e.si].board[e.slot]; if (u5) u5.h = Math.min(u5.mh, u5.h + 1); drawBoards(); floatTxt(slotEl(e.si, e.slot), "+1", "g"); SFX.heal(); return wait(200); }
          if (e.t === "heal") { V[e.si].hp = Math.min(V[e.si].mhp, V[e.si].hp + e.n); drawBoards(); floatTxt(el.querySelector(e.si ? ".hero.foe" : ".hero.me"), "+" + e.n, "g"); SFX.heal(); return wait(220); }
          return null;
        });
      });
      return p.then(function () { busy = false; });
    }
    function after() {
      if (b.over) return finish();
      full();
    }
    el.querySelector("#end").onclick = function () {
      if (busy || b.over) return;
      SFX.tap(); sel = -1; info.innerHTML = "";
      var start = b.log.length; E.endTurn(b);
      mid.textContent = "Your spirits attack…";
      animate(b.log.slice(start)).then(function () {
        if (b.over) return finish();
        mid.textContent = wild ? "The wild spirits move…" : isl.foe + "'s turn…";
        return wait(350).then(function () {
          var s2 = b.log.length; E.aiTurn(b);
          return animate(b.log.slice(s2));
        }).then(function () {
          mid.textContent = b.over ? "" : b.trait === "fog" ? "Fog hides the pilot's plan" : (b.plan && b.plan.length ? "Faded cards: " + (wild ? "the spirits’" : "the warden’s") + " next move" : "Your turn — light: " + b.s[0].lys);
          after();
        });
      });
    };
    el.querySelector("#quit").onclick = function () {
      if (busy) return;
      modal("<h2>Flee the battle?</h2><p class='dim' style='text-align:center'>Fleeing counts as a defeat — one flame goes out.</p>", [{ t: "Stay", v: 0, sec: true }, { t: "Flee", v: 1 }]).then(function (v) {
        if (v) { b.over = "lose"; finish(true); }
      });
    };
    function finish(fled) {
      busy = true; mid.textContent = ""; lanesEl.innerHTML = "";
      if (b.over === "win") el.querySelector(".scene").classList.add("lit");
      var won = b.over === "win";
      T("battle_end", { won: won, fled: !!fled, island: S.island, turns: b.turn, deck: S.deck, hp: b.s[0].hp, wild: wild ? enc.el : undefined });
      if (wild) return finishWild(won, enc);
      var msg;
      if (won) {
        S.wins++; S.packs++; S.island++; S.best = Math.max(S.best, S.island); S.voy = null;
        SFX.win();
        if (S.island >= D.ISLANDS.length) {
          T("progress", { step: "victory", runs: S.runs });
          S.island = 0; S.flames = 3; S.runs++; S.packs += 2; S.voy = null;
          msg = "<h1>The Black Lighthouse burns!</h1><p style='text-align:center'>You lit the whole Dark Sea. The spirits sing.<br><br>You get 3 packs. The Dark will return — a new voyage awaits.</p>";
        } else {
          T("progress", { island: S.island });
          msg = "<h1>Victory!</h1><p style='text-align:center'>" + esc(isl.foe) + " is defeated, and the lighthouse on " + esc(isl.n) + " is lit.<br>You get <b>1 pack</b>.</p>";
        }
      } else {
        S.losses++; S.flames--; SFX.lose();
        if (S.flames <= 0) {
          T("progress", { step: "voyage_lost", reached: S.island });
          S.island = 0; S.flames = 3; S.runs++; S.voy = null;
          msg = "<h1 style='color:#b46bff'>The lantern goes out</h1><p style='text-align:center'>Your last flame died. The Dark takes the islands back, and the voyage must begin again.<br><br>But the spirits are still yours.</p>" + tipHTML(isl);
        } else {
          msg = "<h1 style='color:#b46bff'>Defeat</h1><p style='text-align:center'>" + esc(isl.foe) + " put out one of your flames.<br>" + S.flames + " flame" + (S.flames === 1 ? "" : "s") + " left.</p>" + tipHTML(isl);
        }
      }
      save();
      setTimeout(function () {
        if (won && S.island > 0) {
          // Vælg selv belønningen: en temapakke, så man kan bygge mod et lys (Kin) — Rosewater: lad spillerne vælge deres spil.
          msg = msg.replace("You get <b>1 pack</b>.", "Choose your pack:") + "<p class='dim' style='text-align:center;font-size:13px;margin:0'>Commons and uncommons of that light. The rare can be anything.</p>";
          modal(msg, [{ t: "🔥 Blaze", v: "glod", cls: "pb-glod" }, { t: "🌫 Mist", v: "taage", cls: "pb-taage" }, { t: "🌱 Root", v: "rod", cls: "pb-rod" }]).then(function (v) {
            S.packq = S.packq || []; S.packq.unshift(v); save(); T("pack_choice", { el: v, island: S.island }); packScreen(false);
          });
        } else modal(msg, [{ t: won ? "Open the pack" : "To the map", v: 1 }]).then(function () { if (won) packScreen(false); else home(); });
      }, 500);
    }
    show(el); full();
    if (opt && VOY.boonText(opt)) toast("✧ Voyage: " + VOY.boonText(opt));
    if (wild) mid.innerHTML = "<div>Win, and one of them joins you.</div>";
    else if (b.trait) { mid.innerHTML = "<div><span class='trait'>⚑ " + D.TRAITS[b.trait].n + ":</span> " + esc(D.TRAITS[b.trait].t) + "</div>"; }
    else mid.textContent = "Pick a card and place it on an empty space";
    if (!S.seen.battlehint) {
      S.seen.battlehint = 1; save();
      modal("<h2>How to fight</h2><p style='line-height:1.5'>1. Tap a card in your hand, then tap an empty space.<br>2. Cards cost <b>light</b> — you get more light every turn.<br>3. Tap <b>End turn</b>: each of your spirits attacks the spirit straight across — or the enemy lantern if that space is empty.<br>4. <b>Faded cards</b> show where the warden will play next turn.<br><br><b>Where</b> you place your spirits is the whole art.</p>", [{ t: "Got it", v: 1 }]);
    }
  }

  // ---------- sejladsen (The Voyage, 0.8.0) ----------
  function legDone() { return S.island < 1 || !!(S.voy && S.voy.to === S.island && S.voy.step >= 2); }
  function ensureLeg() {
    if (!S.voy || S.voy.to !== S.island) { var seen = S.voy && S.voy.seenEv; S.voy = VOY.makeLeg(S.island, R); S.voy.seenEv = (seen || []).slice(-4); save(); }
    return S.voy;
  }
  function nodeHTML(type, cls) { var N = VOY.NODES[type]; return '<button class="node ' + type + " " + (cls || "") + '" data-t="' + type + '"><span class="ni">' + N.i + '</span><b>' + N.n + "</b><small>" + N.t + "</small></button>"; }
  function voyageScreen() {
    var v = ensureLeg(), to = D.ISLANDS[S.island], from = D.ISLANDS[S.island - 1];
    var rows = "";
    for (var k = 1; k >= 0; k--) {
      var pair = v.nodes[k].map(function (t) {
        var cls = k < v.step ? (v.done[k] === t ? "took" : "skip") : k === v.step ? "open" : "ahead";
        return nodeHTML(t, cls);
      }).join("");
      rows += '<div class="fork' + (k === v.step ? " now" : "") + '">' + pair + "</div>";
    }
    var done = v.step >= 2;
    var el = h('<div class="screen voyage"><div class="hud"><div class="flames">' + flamesHTML() + '</div><span class="pill">✦ ' + S.embers + " glimmer</span></div>" +
      '<h2 style="margin:8px 0 2px">' + (done ? "Land ho!" : "Crossing to " + esc(to.n)) + '</h2><p class="dim" style="margin:0 0 6px;font-size:14px">' + (done ? esc(to.foe) + " waits on the shore." : "Choose your course. You can see what lies ahead.") + "</p>" +
      '<div class="route"><div class="port to">⚑ ' + esc(to.n) + "</div>" + rows + '<div class="port from">⛵ ' + esc(from.n) + "</div></div>" +
      '<div class="info" id="vinfo">' + (v.boon && VOY.boonText(v.boon) ? "<span style='color:#8dffb0'>✧ For the next warden: " + VOY.boonText(v.boon) + "</span>" : "<span class='dim'>Tap a glowing waypoint to sail there.</span>") + "</div>" +
      '<div class="bottom"><div class="row"><button class="btn sec" id="back">Chart</button>' + (done ? '<button class="btn" id="land">Land on ' + esc(to.n) + "</button>" : "") + "</div></div></div>");
    el.querySelectorAll(".node.open").forEach(function (nb) {
      nb.onclick = function () {
        SFX.tap(); var t = nb.dataset.t;
        v.done[v.step] = t; v.step++; save(); // forpligt valget med det samme (ingen gen-valg ved genindlæsning)
        T("voyage", { to: S.island, node: t, step: v.step });
        nodeScreen(t);
      };
    });
    el.querySelectorAll(".node.ahead,.node.took,.node.skip").forEach(function (nb) { nb.onclick = function () { el.querySelector("#vinfo").innerHTML = "<b>" + VOY.NODES[nb.dataset.t].i + " " + VOY.NODES[nb.dataset.t].n + "</b> — " + VOY.NODES[nb.dataset.t].t; }; });
    el.querySelector("#back").onclick = function () { SFX.tap(); home(); };
    var land = el.querySelector("#land");
    if (land) land.onclick = function () { SFX.tap(); if (!E.validDeck(S.deck, S.coll)) { toast("Your deck needs 12–20 cards"); deckScreen(); return; } battleScreen(); };
    show(el);
  }
  // Fælles skærm for et stop på havet: ikon, titel, tekst, plads til kort og knapper.
  function stopScreen(type, title, text, icon) {
    var el = h('<div class="screen stop ' + type + '"><div class="hud"><div class="flames">' + flamesHTML() + '</div><span class="pill" id="emb">✦ ' + S.embers + " glimmer</span></div>" +
      '<div class="grow stopbody"><div class="vista">' + battleScene(type + S.island) + '<div class="bigicon">' + (icon || VOY.NODES[type].i) + '</div></div><h2>' + esc(title) + '</h2><p class="lead">' + text + '</p><div class="stopcards"></div><p class="result"></p></div>' +
      '<div class="bottom" id="sbtns"></div></div>');
    show(el); return el;
  }
  function continueBtn(el, label) {
    var b2 = el.querySelector("#sbtns"); b2.innerHTML = "";
    var c = h('<button class="btn">' + (label || "Sail on") + "</button>");
    c.onclick = function () { SFX.tap(); var got = claimMiles(); voyageScreen(); if (got.length) toast("🏆 Collection " + got[got.length - 1] + "/" + D.CARDS.length + " — bonus pack!"); };
    b2.appendChild(c);
  }
  function showCard(el, id, isNew) {
    var c = D.BY[id], box = el.querySelector(".stopcards");
    box.innerHTML = '<div class="gift">' + cardHTML(id, { isNew: isNew }) + "</div>";
    SFX.flip(c.r); if (c.r === "r" || c.r === "m") burst(box.firstChild, c.r); else particles(box.firstChild, ELCOL[c.el], 14, 90);
    box.firstChild.onclick = function () { el.querySelector(".result").innerHTML = cardInfo(id); };
  }
  function nodeScreen(type) {
    var v = S.voy, el, res;
    if (type === "wild") {
      var enc = VOY.wildEncounter(S.island, R);
      el = stopScreen("wild", enc.foe + "!", "A shoal of wild spirits blocks your way. <b>Win</b>, and one of them joins you.<br><span style='color:#ff8a8a'>Lose, and a flame goes out.</span>");
      el.querySelector(".stopcards").innerHTML = '<div class="peek">' + enc.deck.filter(function (id, i, a) { return a.indexOf(id) === i; }).slice(0, 4).map(function (id) { return cardHTML(id); }).join("") + "</div>";
      var fb = h('<button class="btn">Fight · ' + enc.hp + " life</button>");
      fb.onclick = function () { SFX.tap(); battleScreen(enc); };
      el.querySelector("#sbtns").appendChild(fb);
      return;
    }
    if (type === "event") {
      var ev = VOY.pickEvent(S, R); v.seenEv = (v.seenEv || []).concat([ev.id]); save();
      el = stopScreen("event", ev.n, esc(ev.t), ev.i);
      var bx = el.querySelector("#sbtns");
      ev.ch.forEach(function (ch) {
        var ok = !ch.need || ch.need(S);
        var cb = h('<button class="btn choice' + (ok ? "" : " sec") + '"' + (ok ? "" : " disabled") + '><b>' + esc(ch.t) + "</b><small>" + esc(ch.sub) + "</small></button>");
        cb.onclick = function () {
          if (!ok) return; SFX.tap();
          var before = {}; for (var k in S.coll) before[k] = S.coll[k];
          res = ch.fx(S, R); save();
          T("voyage_event", { ev: ev.id, ch: ch.t, card: res.card || null });
          el.querySelector(".result").innerHTML = esc(res.t);
          el.querySelector("#emb").textContent = "✦ " + S.embers + " glimmer";
          if (res.card) showCard(el, res.card, !before[res.card]);
          continueBtn(el);
        };
        bx.appendChild(cb);
      });
      return;
    }
    if (type === "wreck") {
      el = stopScreen("wreck", "A wreck", "Broken timbers and a cold lamp, half under water.");
      var before = {}; for (var k in S.coll) before[k] = S.coll[k];
      res = VOY.salvage(S, R); save();
      el.querySelector(".result").innerHTML = esc(res.t);
      if (res.card) showCard(el, res.card, !before[res.card]); else SFX.heal();
      continueBtn(el); return;
    }
    if (type === "haven") {
      el = stopScreen("haven", "A quiet haven", "A sheltered cove with a small, warm fire. Old keepers left it lit for travellers.");
      res = VOY.rest(S); save();
      el.querySelector(".result").innerHTML = esc(res.t); el.querySelector(".flames").innerHTML = flamesHTML(); SFX.heal();
      continueBtn(el); return;
    }
    if (type === "trader") {
      el = stopScreen("trader", "The Fog Trader", "A lantern-eyed figure in a small boat. “Spirits for glimmer. One each, sailor.”");
      var stock = VOY.traderStock(S, R), box = el.querySelector(".stopcards");
      box.innerHTML = '<div class="shop"></div>';
      stock.forEach(function (id) {
        var price = VOY.PRICE[D.BY[id].r], w = h('<div class="ware">' + cardHTML(id, { isNew: !owned(id) }) + '<button class="btn buy">' + price + " ✦</button></div>");
        var bb = w.querySelector(".buy"); bb.disabled = S.embers < price;
        w.querySelector(".card").onclick = function () { el.querySelector(".result").innerHTML = cardInfo(id); };
        bb.onclick = function () {
          if (S.embers < price) return;
          S.embers -= price; var m = VOY.give(S, id); save(); T("voyage_buy", { id: id, price: price });
          box.querySelectorAll(".buy").forEach(function (x) { x.disabled = true; });
          bb.textContent = "Yours"; w.classList.add("bought");
          SFX.flip(D.BY[id].r); particles(w, ELCOL[D.BY[id].el], 14, 90);
          el.querySelector("#emb").textContent = "✦ " + S.embers + " glimmer";
          el.querySelector(".result").innerHTML = esc(D.BY[id].n) + " climbs into your lantern." + (m ? " (A spare — melted into " + m + " ✦.)" : "");
          continueBtn(el);
        };
        box.firstChild.appendChild(w);
      });
      if (S.embers < 4) el.querySelector(".result").innerHTML = "<span class='dim'>You have " + S.embers + " ✦. Win battles and open packs to gather more.</span>";
      continueBtn(el, "Leave");
      return;
    }
  }
  // Efter en kamp mod vilde ånder.
  function finishWild(won, enc) {
    save();
    if (won) {
      SFX.win();
      var ch = VOY.rewardChoices(enc.el, S.coll, R);
      setTimeout(function () {
        var el = stopScreen("wild", "Victory!", "The shoal scatters — but one spirit stays, curious. <b>Choose who joins you.</b>");
        var box = el.querySelector(".stopcards"); box.innerHTML = '<div class="shop"></div>';
        ch.forEach(function (id) {
          var w = h('<div class="ware">' + cardHTML(id, { isNew: !owned(id) }) + "</div>");
          w.onclick = function () {
            if (el.dataset.took) return; el.dataset.took = 1;
            var m = VOY.give(S, id); save(); T("voyage_catch", { id: id, el: enc.el });
            box.querySelectorAll(".ware").forEach(function (x) { if (x !== w) x.classList.add("gone"); });
            w.classList.add("bought"); SFX.flip(D.BY[id].r);
            if (D.BY[id].r === "r" || D.BY[id].r === "m") burst(w, D.BY[id].r); else particles(w, ELCOL[D.BY[id].el], 16, 90);
            el.querySelector(".result").innerHTML = esc(D.BY[id].n) + " joins you!" + (D.BY[id].sea ? " <span style='color:#6fc3ff'>🌊 A drifter — never found in packs.</span>" : "") + (m ? " (A spare — melted into " + m + " ✦.)" : "") + "<br><span class='dim'>Add it to your deck under ‘Deck’.</span>";
            continueBtn(el);
          };
          box.firstChild.appendChild(w);
        });
      }, 700);
      return;
    }
    S.losses++; S.flames--; SFX.lose();
    var msg;
    if (S.flames <= 0) {
      T("progress", { step: "voyage_lost", reached: S.island, at: "sea" });
      S.island = 0; S.flames = 3; S.runs++; S.voy = null;
      msg = "<h1 style='color:#b46bff'>The lantern goes out</h1><p style='text-align:center'>The wild spirits put out your last flame. The Dark takes the islands back, and the voyage must begin again.<br><br>But the spirits are still yours.</p>";
    } else msg = "<h1 style='color:#b46bff'>Driven off</h1><p style='text-align:center'>The wild spirits put out one of your flames.<br>" + S.flames + " flame" + (S.flames === 1 ? "" : "s") + " left. You sail on, shaken.</p>";
    save();
    setTimeout(function () { modal(msg, [{ t: S.voy ? "Sail on" : "To the map", v: 1 }]).then(function () { if (S.voy) voyageScreen(); else home(); }); }, 500);
  }

  // ---------- start ----------
  load();
  if (!S) intro(); else home();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
  window.__ls = { get S() { return S; }, SFX: SFX, resetAudio: function () { OUT = null; } }; // til fejlsøgning i browseren
})();
