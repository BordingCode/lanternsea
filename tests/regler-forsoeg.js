// Regel-forsøg til tests/beslutninger.js — ændrer motoren KUN i testprocessen.
module.exports = {
  // Ubrugt lys gemmes: op til 1 lys overføres til næste tur.
  gem(E) {
    const st = E.startTurn, et = E.endTurn;
    E.endTurn = function (b) { const p = b.s[b.who]; p.gemt = Math.min(1, p.lys); return et(b); };
    E.startTurn = function (b) { st(b); const p = b.s[b.who]; p.lys += p.gemt || 0; p.gemt = 0; };
  },
};
const D = require("../cards.js");
const I0 = JSON.parse(JSON.stringify(D.ISLANDS[0]));
function isl(o) { return () => Object.assign(D.ISLANDS[0], JSON.parse(JSON.stringify(I0)), o); }
Object.assign(module.exports, {
  dive: isl({ trait: "dive" }),
  ashrunners: isl({ deck: ["g3","g3","g1","g1","t1","t1","r2","r2","n1","t2","n1","g2"] }),
  dive_ash: isl({ trait: "dive", deck: ["g3","g3","g1","g1","t1","t1","r2","r2","n1","t2","n1","g2"] }),
  dive_hp12: isl({ trait: "dive", hp: 12 }),
  dive_hp8: isl({ trait: "dive", hp: 8 }),
  dive_hp9: isl({ trait: "dive", hp: 9 }),
  dive_blid: isl({ trait: "dive", deck: ["n1","n1","g1","g1","t1","t1","r2","r2","t1","t2","n1","g2"] }),
  dive_blid2: isl({ trait: "dive", deck: ["n1","n1","g1","g1","t1","t1","r2","r2","t1","t2","n1","n1"] }),
  dive_blid2_hp12: isl({ trait: "dive", hp: 12, deck: ["n1","n1","g1","g1","t1","t1","r2","r2","t1","t2","n1","n1"] }),
  ingen: isl({ trait: undefined }),
  ash_hp12: isl({ hp: 12, deck: ["g3","g3","g1","g1","t1","t1","r2","r2","n1","t2","n1","g2"] }),
});
