// Anonymous play telemetry for Spilsmedjen's game.
// No names, no personal data: a random session id kept in localStorage, plus game events.
//
// Usage in the game:
//   <script src="telemetri.js"></script>
//   Telemetri.init("<slug>", "<version>");
//   Telemetri.log("pack_open", {set: "s1", rarities: ["c","c","r"]});
//   Telemetri.log("battle_end", {won: true, turns: 7, deck: [...ids]});
//   Telemetri.log("progress", {chapter: 2, node: 14});   // how far the player has come
//
// Events are batched and sent every 15 s and when the page is hidden.
// Failures are silently dropped: telemetry must never break or slow the game.
(function () {
  var URL = "https://spilsmedjen-api.mathiasjob.workers.dev/t";
  var q = [], game = "?", version = "?", session = "?";
  function sid() {
    try {
      var s = localStorage.getItem("telemetri_sid");
      if (!s) { s = Math.random().toString(36).slice(2, 12); localStorage.setItem("telemetri_sid", s); }
      return s;
    } catch (e) { return "anon"; }
  }
  function flush() {
    if (!q.length) return;
    var batch = q.splice(0, 40);
    var body = JSON.stringify(batch);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(URL, new Blob([body], { type: "text/plain" }))) return;
      fetch(URL, { method: "POST", body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  window.Telemetri = {
    init: function (g, v) {
      game = g; version = v; session = sid();
      this.log("session_start", { ua_mobile: /Mobi|Android|iPad|Tablet/i.test(navigator.userAgent),
        w: window.innerWidth, h: window.innerHeight });
      setInterval(flush, 15000);
      document.addEventListener("visibilitychange", function () { if (document.hidden) flush(); });
    },
    log: function (kind, data) {
      q.push({ game: game, session: session, kind: kind, data: Object.assign({ v: version }, data || {}) });
      if (q.length >= 40) flush();
    },
    flush: flush,
  };
})();
