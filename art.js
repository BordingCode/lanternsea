// Procedural ånde-kunst (0.7.0): hver ånd har sin egen form bygget af simple dele.
// window.ART(id, card, rng) → SVG-streng (viewBox 0 0 100 100). Ingen eksterne billeder.
(function (root) {
  var COL = { glod: ["#ffb347", "#ff6a2a", "#fff1c9", "#7a2a08"], taage: ["#9fd8ff", "#4a7dff", "#eaf6ff", "#1a2f6a"], rod: ["#8ff0a6", "#2f9c5a", "#eaffef", "#12401f"] };
  // Hver ånds opskrift: krop + ekstra dele.
  var FORM = {
    g1: ["orb:12", "flame"], g2: ["beast", "ears:round", "flame"], g3: ["runner", "trail"], g4: ["beast", "ears:point", "tail", "flame"],
    g5: ["drop", "arms:fire"], g6: ["beast:big", "ears:point", "crown"], g7: ["orb:17", "rays"], g8: ["orb:13", "horns", "wings:small"],
    g9: ["drop", "horns", "trumpet"],
    t1: ["orb:12", "veil"], t2: ["eel"], t3: ["bird"], t4: ["ray"], t5: ["drop", "hood", "mask"], t6: ["drop", "hood", "moon"],
    t7: ["orb:18", "tentacles", "waves"], t8: ["lantern"], t9: ["fish", "crest"],
    r1: ["orb:11", "sprout"], r2: ["beetle"], r3: ["snake", "sprout"], r4: ["orb:13", "fountain"], r5: ["beast", "antlers"],
    r6: ["tree"], r7: ["seed", "sprout", "rings"], r8: ["block", "sprout", "shield"], r9: ["willow"],
    n1: ["orb:10", "moth"], n2: ["drop", "hood", "lamp"], n3: ["fish", "lure"],
  };
  function f(n) { return n.toFixed(1); }
  function eyes(cx, cy, s, r) {
    var dx = s * (0.32 + r() * 0.1), er = Math.max(1.8, s * 0.13), sleepy = r() < 0.2;
    var e = function (x) {
      return sleepy ? '<path d="M' + f(x - er) + " " + f(cy) + " q" + f(er) + " " + f(er * 0.9) + " " + f(er * 2) + ' 0" stroke="#1a1030" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
        : '<ellipse cx="' + f(x) + '" cy="' + f(cy) + '" rx="' + f(er) + '" ry="' + f(er * 1.3) + '" fill="#1a1030"/><circle cx="' + f(x + er * 0.35) + '" cy="' + f(cy - er * 0.45) + '" r="' + f(er * 0.38) + '" fill="#fff"/>';
    };
    return e(cx - dx) + e(cx + dx);
  }
  function build(id, c, r) {
    var col = COL[c.el], B = "url(#b" + id + ")", st = ' stroke="' + col[3] + '" stroke-width="1.2" stroke-opacity=".55"';
    var parts = FORM[id] || ["orb:14"], back = "", body = "", front = "", cx = 50, cy = 56, s = 14, eyeY = 52;
    parts.forEach(function (p) {
      var k = p.split(":"), n = k[0], a = k[1];
      if (n === "orb") { s = +a; body += '<circle cx="50" cy="56" r="' + s + '" fill="' + B + '"' + st + "/>"; eyeY = 54; }
      else if (n === "drop") { s = 15; body += '<path d="M50 30 C66 46 66 72 50 72 C34 72 34 46 50 30Z" fill="' + B + '"' + st + "/>"; eyeY = 56; }
      else if (n === "beast") {
        s = a === "big" ? 17 : 14;
        back += [36, 44, 56, 64].map(function (x) { return '<rect x="' + (x - 2.5) + '" y="' + (62 + s * 0.3) + '" width="5" height="' + (8 + s * 0.2) + '" rx="2.5" fill="' + col[1] + '"/>'; }).join("");
        body += '<ellipse cx="50" cy="58" rx="' + (s * 1.25) + '" ry="' + s + '" fill="' + B + '"' + st + "/>"; eyeY = 54;
      }
      else if (n === "runner") {
        s = 12; back += '<path d="M38 66 l-6 10 M46 68 l2 11 M56 68 l-3 11 M63 65 l7 9" stroke="' + col[1] + '" stroke-width="4" stroke-linecap="round"/>';
        body += '<ellipse cx="50" cy="58" rx="19" ry="11" fill="' + B + '"' + st + ' transform="rotate(-12 50 58)"/>'; eyeY = 54; cx = 56;
      }
      else if (n === "eel") {
        s = 11; body += '<path d="M18 70 C30 40 44 80 58 52 S80 36 84 46" stroke="' + col[0] + '" stroke-width="14" fill="none" stroke-linecap="round"/>' +
          '<path d="M28 58 l-6 -8 M44 66 l2 -10 M60 50 l-2 -10" stroke="' + col[1] + '" stroke-width="3" stroke-linecap="round"/>';
        front += eyes(80, 44, 9, r); eyeY = -99; return;
      }
      else if (n === "bird") {
        s = 12; back += '<path d="M48 54 C34 30 18 36 8 30 C20 50 32 60 48 60Z M52 54 C66 30 82 36 92 30 C80 50 68 60 52 60Z" fill="' + col[0] + '" opacity=".9"' + st + "/>";
        body += '<ellipse cx="50" cy="58" rx="11" ry="13" fill="' + B + '"' + st + '/><path d="M47 60 l3 6 l3 -6z" fill="#ffd27a"/>'; eyeY = 53;
      }
      else if (n === "ray") {
        s = 12; back += '<path d="M50 62 C56 78 70 86 84 90" stroke="' + col[1] + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
        body += '<path d="M50 36 C60 46 86 50 92 56 C78 62 60 64 50 72 C40 64 22 62 8 56 C14 50 40 46 50 36Z" fill="' + B + '"' + st + "/>"; eyeY = 54;
      }
      else if (n === "fish") {
        s = 13; back += '<path d="M66 56 l18 -12 l-4 12 l4 12z" fill="' + col[1] + '"/>';
        body += '<ellipse cx="46" cy="56" rx="22" ry="14" fill="' + B + '"' + st + '/><path d="M40 44 q8 -10 16 0" fill="' + col[1] + '"/>'; eyeY = 52; cx = 40;
      }
      else if (n === "snake") {
        s = 10; body += '<path d="M76 78 C52 84 28 76 38 62 S70 52 58 38" stroke="' + col[0] + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
          '<path d="M76 78 C52 84 28 76 38 62 S70 52 58 38" stroke="' + col[1] + '" stroke-width="3" stroke-dasharray="2 5" fill="none"/>';
        front += '<circle cx="57" cy="36" r="9" fill="' + B + '"' + st + "/>" + eyes(57, 35, 8, r) + '<path d="M57 44 l0 5 l-2 2 M57 49 l2 2" stroke="#ff4a6a" stroke-width="1.2" fill="none"/>'; eyeY = -99; return;
      }
      else if (n === "beetle") {
        s = 15; back += [0, 1, 2].map(function (i) { var y = 54 + i * 9; return '<path d="M30 ' + y + " l-10 4 M70 " + y + ' l10 4" stroke="' + col[3] + '" stroke-width="3" stroke-linecap="round"/>'; }).join("") +
          '<path d="M44 36 q-4 -10 -10 -12 M56 36 q4 -10 10 -12" stroke="' + col[3] + '" stroke-width="2" fill="none"/>';
        body += '<ellipse cx="50" cy="62" rx="20" ry="18" fill="' + B + '"' + st + '/><path d="M50 46 L50 80" stroke="' + col[3] + '" stroke-width="1.5" stroke-opacity=".6"/>' +
          '<circle cx="50" cy="42" r="9" fill="' + col[1] + '"' + st + "/>";
        front += eyes(50, 41, 9, r); eyeY = -99; return;
      }
      else if (n === "block") { s = 14; body += '<rect x="32" y="40" width="36" height="34" rx="9" fill="' + B + '"' + st + "/>"; eyeY = 53; }
      else if (n === "seed") { s = 12; body += '<path d="M50 38 C66 48 62 76 50 76 C38 76 34 48 50 38Z" fill="' + B + '"' + st + '/><path d="M50 44 L50 72" stroke="' + col[1] + '" stroke-width="1.4"/>'; eyeY = 60; }
      else if (n === "lantern") {
        s = 12; body += '<path d="M42 28 q8 -8 16 0" stroke="#c9a86a" stroke-width="2" fill="none"/><rect x="36" y="32" width="28" height="6" rx="2" fill="#c9a86a"/>' +
          '<rect x="38" y="38" width="24" height="30" rx="6" fill="' + B + '"' + st + '/><rect x="36" y="68" width="28" height="5" rx="2" fill="#c9a86a"/>'; eyeY = 52;
      }
      else if (n === "tree") {
        s = 16; back += '<rect x="44" y="58" width="12" height="28" rx="3" fill="#6a4a2a"/><path d="M44 84 l-8 4 M56 84 l8 4" stroke="#6a4a2a" stroke-width="3" stroke-linecap="round"/>';
        body += '<circle cx="34" cy="46" r="15" fill="' + col[1] + '"/><circle cx="66" cy="46" r="15" fill="' + col[1] + '"/><circle cx="50" cy="38" r="20" fill="' + B + '"' + st + "/>"; eyeY = 40;
      }
      else if (n === "willow") {
        s = 15; back += '<rect x="45" y="52" width="10" height="32" rx="3" fill="#6a4a2a"/>';
        body += '<ellipse cx="50" cy="40" rx="24" ry="16" fill="' + B + '"' + st + "/>" +
          [24, 32, 40, 60, 68, 76].map(function (x, i) { return '<path d="M' + x + ' 46 q' + (i < 3 ? -3 : 3) + " 16 " + (i < 3 ? -1 : 1) + ' 30" stroke="' + col[1] + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; }).join("");
        eyeY = 40;
      }
      // tilbehør
      else if (n === "flame") { var fy = cy - s - 2; back += '<path d="M' + (cx - 7) + " " + (fy + 6) + " C" + (cx - 8) + " " + (fy - 6) + " " + (cx - 1) + " " + (fy - 8) + " " + cx + " " + (fy - 16) + " C" + (cx + 4) + " " + (fy - 8) + " " + (cx + 9) + " " + (fy - 4) + " " + (cx + 7) + " " + (fy + 6) + 'Z" fill="' + col[1] + '" class="flick"/>'; }
      else if (n === "ears") { var pt = a === "point"; back += '<path d="' + (pt ? "M34 48 l-4 -16 l12 10z M66 48 l4 -16 l-12 10z" : "") + '" fill="' + col[1] + '"/>' + (pt ? "" : '<circle cx="35" cy="44" r="6" fill="' + col[1] + '"/><circle cx="65" cy="44" r="6" fill="' + col[1] + '"/>'); }
      else if (n === "tail") { back += '<path d="M66 62 C80 60 84 48 80 40" stroke="' + col[1] + '" stroke-width="6" fill="none" stroke-linecap="round"/>'; }
      else if (n === "antlers") { back += '<path d="M40 46 L32 26 M35 33 L26 30 M33 28 L36 18 M60 46 L68 26 M65 33 L74 30 M67 28 L64 18" stroke="#d8c8a8" stroke-width="3" stroke-linecap="round" fill="none"/>'; }
      else if (n === "trail") { back += '<path d="M30 52 l-18 -4 M30 58 l-22 0 M30 64 l-16 4" stroke="' + col[0] + '" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'; }
      else if (n === "arms") { front += '<path d="M36 58 l-12 -6 M64 58 l12 -6" stroke="' + col[1] + '" stroke-width="4" stroke-linecap="round"/><circle cx="22" cy="50" r="5" fill="#fff1c9"/><circle cx="78" cy="50" r="5" fill="#fff1c9"/>'; }
      else if (n === "crown") { front += '<path d="M38 ' + (cy - s - 1) + " l3 -10 l5 6 l4 -9 l4 9 l5 -6 l3 10z" + '" fill="#ffd27a" stroke="#9a5f17" stroke-width=".8"/>'; }
      else if (n === "rays") { back += Array.from({ length: 12 }, function (_, i) { var t = i / 12 * Math.PI * 2; return '<path d="M' + f(50 + Math.cos(t) * 21) + " " + f(56 + Math.sin(t) * 21) + " L" + f(50 + Math.cos(t) * 31) + " " + f(56 + Math.sin(t) * 31) + '" stroke="' + col[0] + '" stroke-width="3" stroke-linecap="round"/>'; }).join(""); }
      else if (n === "horns") { var hy = (FORM[id][0] === "drop" ? 36 : 46); back += '<path d="M42 ' + hy + " q-8 -4 -8 -14 q4 6 12 8z M58 " + hy + ' q8 -4 8 -14 q-4 6 -12 8z" fill="' + col[3] + '"/>'; }
      else if (n === "wings") { back += '<path d="M38 54 q-14 -14 -24 -4 q10 2 24 12z M62 54 q14 -14 24 -4 q-10 2 -24 12z" fill="' + col[0] + '" opacity=".85"/>'; }
      else if (n === "trumpet") { front += '<path d="M60 62 l16 -8 l4 -6 l2 14 l-6 -2 l-16 6z" fill="#ffd27a" stroke="#9a5f17" stroke-width=".8"/>'; }
      else if (n === "veil") { back += '<path d="M50 34 C76 40 74 80 62 84 L50 76 L38 84 C26 80 24 40 50 34Z" fill="' + col[2] + '" opacity=".35"/>'; }
      else if (n === "hood") { front += '<path d="M34 54 C34 30 66 30 66 54 C62 44 38 44 34 54Z" fill="' + col[3] + '" opacity=".9"/>'; }
      else if (n === "mask") { front += '<rect x="38" y="52" width="24" height="7" rx="3.5" fill="#1a1030" opacity=".85"/>'; eyeY = -99; front += '<circle cx="44" cy="55.5" r="1.6" fill="#eaf6ff"/><circle cx="56" cy="55.5" r="1.6" fill="#eaf6ff"/>'; }
      else if (n === "moon") { back += '<path d="M74 20 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16z" fill="#eaf6ff"/>'; }
      else if (n === "tentacles") { back += [0, 1, 2, 3, 4].map(function (i) { var x = 30 + i * 10; return '<path d="M' + x + " 66 q" + (i % 2 ? 6 : -6) + " 12 " + (i % 2 ? -2 : 2) + ' 24" stroke="' + col[1] + '" stroke-width="4" fill="none" stroke-linecap="round"/>'; }).join(""); }
      else if (n === "waves") { front += '<path d="M30 34 q5 -6 10 0 t10 0 t10 0 t10 0" stroke="' + col[2] + '" stroke-width="2.4" fill="none"/>'; }
      else if (n === "crest") { back += '<path d="M30 46 q10 -16 24 -8 q-6 0 -8 6" fill="' + col[2] + '" opacity=".8"/>'; }
      else if (n === "sprout") { var sy = parts[0] === "block" ? 40 : parts[0] === "snake" ? 76 : cy - s; back += '<path d="M50 ' + (sy + 2) + " L50 " + (sy - 9) + '" stroke="#2f7a3a" stroke-width="2"/><path d="M50 ' + (sy - 6) + " q-10 -8 -14 0 q8 4 14 0z M50 " + (sy - 9) + ' q10 -8 14 0 q-8 4 -14 0z" fill="#8ff0a6"/>'; }
      else if (n === "fountain") { back += '<path d="M50 42 q-10 -18 -18 -6 M50 42 q10 -18 18 -6 M50 42 l0 -14" stroke="' + col[2] + '" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="32" cy="38" r="2" fill="#9fd8ff"/><circle cx="68" cy="38" r="2" fill="#9fd8ff"/><circle cx="50" cy="26" r="2" fill="#9fd8ff"/>'; }
      else if (n === "rings") { back += '<circle cx="50" cy="58" r="26" fill="none" stroke="' + col[2] + '" stroke-width=".8" opacity=".6"/><circle cx="50" cy="58" r="33" fill="none" stroke="' + col[2] + '" stroke-width=".6" opacity=".4"/>'; }
      else if (n === "shield") { front += '<path d="M60 58 l12 -2 l0 10 q-2 8 -6 10 q-4 -2 -6 -10z" fill="#c9a86a" stroke="#6a4a2a" stroke-width=".8"/>'; }
      else if (n === "moth") { back += '<path d="M48 54 C30 30 14 40 20 54 C14 66 30 74 48 60Z M52 54 C70 30 86 40 80 54 C86 66 70 74 52 60Z" fill="' + col[0] + '" opacity=".8"/><circle cx="28" cy="48" r="4" fill="' + col[2] + '"/><circle cx="72" cy="48" r="4" fill="' + col[2] + '"/>'; }
      else if (n === "lamp") { front += '<path d="M66 60 l0 -6" stroke="#c9a86a" stroke-width="1.4"/><rect x="62" y="60" width="9" height="11" rx="2" fill="#ffd27a" stroke="#9a5f17" stroke-width=".8"/>'; }
      else if (n === "lure") { back += '<path d="M44 44 q-2 -16 -14 -18" stroke="' + col[3] + '" stroke-width="1.6" fill="none"/><circle cx="29" cy="26" r="4" fill="#fff1a8"/><circle cx="29" cy="26" r="9" fill="#fff1a8" opacity=".25"/>'; front += '<path d="M28 60 l4 -3 l4 3 l4 -3 l4 3" stroke="#eaf6ff" stroke-width="1.2" fill="none"/>'; }
    });
    var eye = eyeY > 0 ? eyes(cx, eyeY, s, r) : "";
    var crown = c.r === "m" || c.r === "r" ? '<circle cx="50" cy="54" r="42" fill="none" stroke="' + (c.r === "m" ? "#d48bff" : "#ffc861") + '" stroke-width="1.4" stroke-dasharray="3 5" opacity=".8" class="' + (c.r === "m" ? "spin" : "") + '"/>' : "";
    var sparkles = c.r === "r" || c.r === "m" ? [[16, 20], [84, 26], [20, 82], [82, 80]].map(function (p) { return '<path d="M' + p[0] + " " + (p[1] - 4) + " l1.2 2.8 l2.8 1.2 l-2.8 1.2 l-1.2 2.8 l-1.2 -2.8 l-2.8 -1.2 l2.8 -1.2z" + '" fill="' + (c.r === "m" ? "#e8c4ff" : "#ffe7a8") + '"/>'; }).join("") : "";
    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="b' + id + '" cx="40%" cy="35%"><stop offset="0" stop-color="' + col[2] + '"/><stop offset=".55" stop-color="' + col[0] + '"/><stop offset="1" stop-color="' + col[1] + '"/></radialGradient>' +
      '<radialGradient id="h' + id + '"><stop offset="0" stop-color="' + col[0] + '" stop-opacity=".5"/><stop offset="1" stop-color="' + col[0] + '" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="50" cy="55" r="48" fill="url(#h' + id + ')"/>' + crown + sparkles + back + body + front + eye + "</svg>";
  }
  root.ART = function (id, card, rng) { return build(id, card, rng); };
})(this);
