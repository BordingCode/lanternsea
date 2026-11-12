// Sæt 1: Mørkhavet. el: glod|taage|rod. r: c|u|r|m. kw: nøgleord.
(function (root) {
  var CARDS = [
    // Glød — angreb
    { id: "g1", n: "Gnistfnug", el: "glod", r: "c", c: 1, a: 1, h: 1, kw: { gnist: 1 }, t: "Lille, men bider straks." },
    { id: "g2", n: "Kulungen", el: "glod", r: "c", c: 2, a: 2, h: 2, kw: { flok: 1 }, t: "Brænder klarere i flok." },
    { id: "g3", n: "Askeløber", el: "glod", r: "c", c: 2, a: 3, h: 1, kw: {}, t: "Hurtig og skrøbelig." },
    { id: "g4", n: "Emberulv", el: "glod", r: "u", c: 3, a: 3, h: 3, kw: { sluger: 1 }, t: "Vokser af hvert bytte." },
    { id: "g5", n: "Flammevæver", el: "glod", r: "u", c: 4, a: 2, h: 3, kw: { gnist: 3 }, t: "Kaster en flammepil, når den kommer." },
    { id: "g6", n: "Glødekongen", el: "glod", r: "r", c: 5, a: 4, h: 4, kw: { flok: 1, sluger: 1 }, t: "Hele ilden bøjer sig." },
    { id: "g7", n: "Solhjerte", el: "glod", r: "m", c: 7, a: 6, h: 6, kw: { gnist: 4 }, t: "Et stykke af den gamle sol." },
    // Tåge — list
    { id: "t1", n: "Dugslør", el: "taage", r: "c", c: 1, a: 1, h: 1, kw: { taage: 1 }, t: "Svær at ramme." },
    { id: "t2", n: "Tågeål", el: "taage", r: "c", c: 2, a: 2, h: 2, kw: { taage: 1 }, t: "Glider af hvert slag." },
    { id: "t3", n: "Spejlmåge", el: "taage", r: "c", c: 3, a: 2, h: 3, kw: { flok: 1 }, t: "Hvor én flyver, flyver flere." },
    { id: "t4", n: "Skumringsrokke", el: "taage", r: "u", c: 3, a: 3, h: 2, kw: { taage: 1, flok: 1 }, t: "Svømmer i stimer gennem tågen." },
    { id: "t5", n: "Drømmefanger", el: "taage", r: "u", c: 4, a: 3, h: 3, kw: { taage: 1, gnist: 1 }, t: "Stjæler et øjeblik fra fjenden." },
    { id: "t6", n: "Nattens Kvinde", el: "taage", r: "r", c: 5, a: 4, h: 3, kw: { taage: 1, sluger: 1 }, t: "Hun tager dem, én efter én." },
    { id: "t7", n: "Havets Hukommelse", el: "taage", r: "m", c: 6, a: 5, h: 5, kw: { taage: 1, flok: 1 }, t: "Alt, havet har slugt, husker hun." },
    // Rod — liv
    { id: "r1", n: "Mosspire", el: "rod", r: "c", c: 1, a: 0, h: 3, kw: { rod: 1 }, t: "Tålmodig. Helende." },
    { id: "r2", n: "Barkbille", el: "rod", r: "c", c: 2, a: 1, h: 4, kw: {}, t: "Et skjold med ben." },
    { id: "r3", n: "Rodslange", el: "rod", r: "c", c: 3, a: 2, h: 4, kw: { flok: 1 }, t: "Rødderne finder hinanden." },
    { id: "r4", n: "Kildeånd", el: "rod", r: "u", c: 3, a: 2, h: 3, kw: { rod: 2 }, t: "Hvor den står, springer vand." },
    { id: "r5", n: "Stenhjort", el: "rod", r: "u", c: 4, a: 3, h: 6, kw: {}, t: "Ældre end øerne." },
    { id: "r6", n: "Moderegen", el: "rod", r: "r", c: 5, a: 3, h: 7, kw: { rod: 2, flok: 1 }, t: "Alt levende søger hendes skygge." },
    { id: "r7", n: "Verdenstræets Frø", el: "rod", r: "m", c: 6, a: 4, h: 9, kw: { rod: 3 }, t: "Første og sidste træ." },
    // Neutrale (alle lys)
    { id: "n1", n: "Lygtemøl", el: "glod", r: "c", c: 1, a: 1, h: 2, kw: {}, t: "Drages mod alt lys." },
    { id: "n2", n: "Fyrvogter", el: "rod", r: "u", c: 2, a: 1, h: 2, kw: { gnist: 1, rod: 1 }, t: "Holder flammen i live." },
    { id: "n3", n: "Mørkfisker", el: "taage", r: "r", c: 4, a: 4, h: 2, kw: { gnist: 2, taage: 1 }, t: "Fisker i det sorte vand." },
  ];
  var BY = {}; CARDS.forEach(function (c) { BY[c.id] = c; });
  var EL = { glod: "Glød", taage: "Tåge", rod: "Rod" };
  var RAR = { c: "Almindelig", u: "Ualmindelig", r: "Sjælden", m: "Mytisk" };
  var KW = {
    gnist: "Gnist N: når den lægges, N skade på ånden overfor (eller fjendens lygte).",
    taage: "Tåge: ignorerer den første skade, den får.",
    flok: "Flok: +1 angreb for hver anden af dine ånder med samme lys.",
    rod: "Rod N: heler din lygte N, når du slutter din tur.",
    sluger: "Sluger: får +1/+1, når den dræber en ånd.",
  };
  // Øerne: vogtere med faste decks
  var ISLANDS = [
    { n: "Skærstenen", foe: "Den Sultne Måge", hp: 10, deck: ["n1","n1","g1","g1","t1","t1","r2","r2","g3","t2","n1","g2"] },
    { n: "Tangskoven", foe: "Rodheksen", hp: 13, deck: ["r1","r1","r2","r2","r3","r3","r4","n2","r5","g2","r2","r3"] },
    { n: "Askeholmen", foe: "Kulfogeden", hp: 14, deck: ["g1","g1","g2","g2","g3","g3","g4","g4","g5","n1","g2","g6"] },
    { n: "Tågesundet", foe: "Den Blinde Lods", hp: 15, deck: ["t1","t1","t2","t2","t3","t3","t4","t4","t5","n3","t6","t3"] },
    { n: "Stormskæret", foe: "Tvillingerne", hp: 16, deck: ["g2","g2","t3","t3","g4","t4","g5","t5","n3","g6","r5","r5","g3","t2"] },
    { n: "Dødvandet", foe: "Druknekongen", hp: 18, deck: ["r3","r3","r5","r5","t4","t4","t6","r6","n3","t5","r4","r4","g5","t7"] },
    { n: "Den Sorte Fyr", foe: "Mørket", hp: 22, deck: ["g4","g4","t4","t4","r5","r5","g5","t5","t6","g6","r6","n3","g7","r7","t7","n2"] },
  ];
  var api = { CARDS: CARDS, BY: BY, EL: EL, RAR: RAR, KW: KW, ISLANDS: ISLANDS };
  if (typeof module !== "undefined") module.exports = api; else root.DATA = api;
})(this);
