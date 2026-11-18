// Set 1: The Dark Sea. el: glod(Blaze)|taage(Mist)|rod(Root) — internal ids kept for save compatibility. r: c|u|r|m. kw: keywords.
(function (root) {
  var CARDS = [
    // Blaze — attack
    { id: "g1", n: "Spark Mote", el: "glod", r: "c", c: 1, a: 1, h: 1, kw: { gnist: 1 }, t: "Small, but it bites at once." },
    { id: "g2", n: "Coalcub", el: "glod", r: "c", c: 2, a: 2, h: 2, kw: { flok: 1 }, t: "Burns brighter with kin." },
    { id: "g3", n: "Ashrunner", el: "glod", r: "c", c: 2, a: 3, h: 1, kw: {}, t: "Fast and fragile." },
    { id: "g4", n: "Cinderwolf", el: "glod", r: "u", c: 3, a: 3, h: 3, kw: { sluger: 1 }, t: "Grows with every kill." },
    { id: "g5", n: "Flameweaver", el: "glod", r: "u", c: 4, a: 2, h: 3, kw: { gnist: 3 }, t: "Throws a flame-dart as it arrives." },
    { id: "g6", n: "The Cinder King", el: "glod", r: "r", c: 5, a: 4, h: 4, kw: { flok: 1, sluger: 1 }, t: "All fire bows to him." },
    { id: "g7", n: "Sunheart", el: "glod", r: "m", c: 7, a: 6, h: 6, kw: { gnist: 4 }, t: "A shard of the old sun." },
    // Mist — trickery
    { id: "t1", n: "Dewveil", el: "taage", r: "c", c: 1, a: 1, h: 1, kw: { taage: 1 }, t: "Hard to hit." },
    { id: "t2", n: "Mist Eel", el: "taage", r: "c", c: 2, a: 2, h: 1, kw: { taage: 1 }, t: "Slips off every blow." },
    { id: "t3", n: "Mirror Gull", el: "taage", r: "c", c: 3, a: 2, h: 3, kw: { flok: 1 }, t: "Where one flies, more follow." },
    { id: "t4", n: "Dusk Ray", el: "taage", r: "u", c: 3, a: 3, h: 2, kw: { taage: 1, flok: 1 }, t: "Swims in shoals through the mist." },
    { id: "t5", n: "Dreamthief", el: "taage", r: "u", c: 4, a: 3, h: 3, kw: { taage: 1, gnist: 1 }, t: "Steals a moment from the foe." },
    { id: "t6", n: "Lady of Night", el: "taage", r: "r", c: 5, a: 4, h: 3, kw: { taage: 1, sluger: 1 }, t: "She takes them, one by one." },
    { id: "t7", n: "Memory of the Sea", el: "taage", r: "m", c: 6, a: 5, h: 5, kw: { taage: 1, flok: 1 }, t: "All the sea has swallowed, she remembers." },
    // Root — life
    { id: "r1", n: "Mossprout", el: "rod", r: "c", c: 1, a: 0, h: 3, kw: { rod: 1 }, t: "Patient. Healing." },
    { id: "r2", n: "Barkbeetle", el: "rod", r: "c", c: 2, a: 1, h: 4, kw: { ambush: 1 }, t: "A shield with legs — and jaws." },
    { id: "r3", n: "Rootsnake", el: "rod", r: "c", c: 3, a: 2, h: 4, kw: { flok: 1 }, t: "Roots find each other." },
    { id: "r4", n: "Wellspring", el: "rod", r: "u", c: 3, a: 2, h: 3, kw: { rod: 2 }, t: "Where it stands, water rises." },
    { id: "r5", n: "Stonestag", el: "rod", r: "u", c: 4, a: 3, h: 6, kw: {}, t: "Older than the islands." },
    { id: "r6", n: "Mother Oak", el: "rod", r: "r", c: 5, a: 3, h: 7, kw: { rod: 2, flok: 1 }, t: "All living things seek her shade." },
    { id: "r7", n: "Seed of the First Tree", el: "rod", r: "m", c: 6, a: 4, h: 9, kw: { rod: 3 }, t: "First tree, and last." },
    // Sæt 1b (0.5.0): Rally — placering inden for din egen række betyder noget
    { id: "g8", n: "Beacon Imp", el: "glod", r: "c", c: 2, a: 1, h: 2, kw: { rally: 1 }, t: "Cheers on whoever stands beside it." },
    { id: "g9", n: "Pyre Herald", el: "glod", r: "u", c: 4, a: 3, h: 3, kw: { rally: 1, gnist: 1 }, t: "Its horn lights the line." },
    { id: "t8", n: "Fog Lantern", el: "taage", r: "c", c: 2, a: 0, h: 3, kw: { taage: 1, rally: 1 }, t: "A small light the mist protects." },
    { id: "t9", n: "Tidecaller", el: "taage", r: "u", c: 3, a: 2, h: 2, kw: { taage: 1, rally: 1 }, t: "Calls the shoal to strike as one." },
    { id: "r8", n: "Hedge Warden", el: "rod", r: "c", c: 2, a: 1, h: 3, kw: { rally: 1 }, t: "Keeps the line tight." },
    { id: "r9", n: "Elder Willow", el: "rod", r: "u", c: 4, a: 2, h: 5, kw: { rally: 1, rod: 1 }, t: "Its branches shelter its neighbours." },
    // Wanderers
    { id: "n1", n: "Lantern Moth", el: "glod", r: "c", c: 1, a: 1, h: 2, kw: {}, t: "Drawn to every light." },
    { id: "n2", n: "Lampkeeper", el: "rod", r: "u", c: 2, a: 1, h: 2, kw: { gnist: 1, rod: 1 }, t: "Keeps the flame alive." },
    { id: "n3", n: "Darkfisher", el: "taage", r: "r", c: 4, a: 4, h: 2, kw: { ambush: 2, taage: 1 }, t: "Its lure waits for whatever swims close." },
    // Drifters (0.8.0): found only at sea, on the voyage between islands — never in packs, can't be lured.
    { id: "d1", n: "Wreckwisp", el: "taage", r: "u", c: 2, a: 2, h: 2, kw: { ambush: 1, taage: 1 }, t: "Haunts the hulls it sank.", sea: 1 },
    { id: "d2", n: "Bellfish", el: "rod", r: "u", c: 3, a: 2, h: 4, kw: { ambush: 1, rally: 1 }, t: "Rings when danger swims near.", sea: 1 },
    { id: "d3", n: "Stormpetrel", el: "glod", r: "u", c: 3, a: 3, h: 2, kw: { gnist: 2 }, t: "Rides the lightning home.", sea: 1 },
    { id: "d4", n: "Whalesong", el: "taage", r: "r", c: 5, a: 3, h: 6, kw: { rally: 1, rod: 2 }, t: "Its song carries the whole shoal.", sea: 1 },
    { id: "d5", n: "Drowned Lamplighter", el: "rod", r: "r", c: 4, a: 3, h: 4, kw: { gnist: 1, rod: 1, ambush: 1 }, t: "Still tending a lamp under the waves.", sea: 1 },
    { id: "d6", n: "The Starfallen", el: "glod", r: "m", c: 6, a: 5, h: 5, kw: { gnist: 2, rally: 1 }, t: "It fell from the sky and kept burning.", sea: 1 },
    // Set 2 — Starfall (0.10.0): unlocked when the Black Lighthouse is lit the first time. Only in Starfall packs.
    // el2 = a second light (twin: counts as both lights, for Kin) · "*" = every light. Bloom: grows +1/+1 at the end of your turn.
    // Shine N: when played, the spirits beside it get +N/+N.
    { id: "s1", n: "Steamling", el: "glod", el2: "taage", r: "c", c: 2, a: 2, h: 2, kw: { flok: 1 }, t: "Fire met fog, and giggled.", set: 2 },
    { id: "s2", n: "Bogwisp", el: "taage", el2: "rod", r: "c", c: 2, a: 1, h: 3, kw: { flok: 1 }, t: "Lights the way across the marsh — sometimes.", set: 2 },
    { id: "s3", n: "Emberbark", el: "rod", el2: "glod", r: "c", c: 3, a: 2, h: 4, kw: { flok: 1 }, t: "A tree that remembers the fire.", set: 2 },
    { id: "s4", n: "Starseed", el: "rod", r: "c", c: 2, a: 0, h: 2, kw: { bloom: 1 }, t: "Plant it. Protect it. Wait.", set: 2 },
    { id: "s5", n: "Starwick", el: "glod", r: "c", c: 2, a: 1, h: 1, kw: { shine: 1 }, t: "A candle that blesses whoever stands near.", set: 2 },
    { id: "s6", n: "Geyser Drake", el: "glod", el2: "taage", r: "u", c: 4, a: 3, h: 3, kw: { flok: 1, gnist: 2 }, t: "It sleeps under the sea and wakes up boiling.", set: 2 },
    { id: "s7", n: "Ashgrove Stag", el: "rod", el2: "glod", r: "u", c: 4, a: 3, h: 4, kw: { flok: 1, rally: 1 }, t: "Its antlers smoulder like dry branches.", set: 2 },
    { id: "s8", n: "Glowcap", el: "taage", r: "u", c: 3, a: 1, h: 3, kw: { taage: 1, bloom: 1 }, t: "A mushroom that only grows in the dark.", set: 2 },
    { id: "s9", n: "Phoenix Chick", el: "glod", r: "u", c: 3, a: 2, h: 3, kw: { bloom: 1, sluger: 1 }, t: "Small now. Not for long.", set: 2 },
    { id: "s10", n: "Moonpool", el: "taage", r: "u", c: 3, a: 1, h: 3, kw: { shine: 1, taage: 1 }, t: "The moon bathes here, and so do its friends.", set: 2 },
    { id: "s11", n: "Marsh Mother", el: "taage", el2: "rod", r: "r", c: 5, a: 3, h: 5, kw: { flok: 1, bloom: 1 }, t: "Every reed in the marsh is one of her children.", set: 2 },
    { id: "s12", n: "Old Starwarden", el: "rod", r: "r", c: 5, a: 3, h: 5, kw: { shine: 2 }, t: "It caught the first falling star — and kept it.", set: 2 },
    { id: "s13", n: "Heart of the Starfall", el: "glod", el2: "*", r: "m", c: 7, a: 4, h: 6, kw: { shine: 2, bloom: 1, flok: 1 }, t: "Every light in the sea leans toward it.", set: 2 },
    // Set 3 — The Deep (0.15.0): a fourth light, found in the Deepreach (the sea beyond the Black Lighthouse). Only in Deep packs and Deepreach waters.
    // Echo: the first time it dies in a battle, it returns to your hand. Afterglow N: when it dies, N damage to the enemy lantern.
    { id: "x1", n: "Lanternfry", el: "dyb", r: "c", c: 1, a: 1, h: 1, kw: { glow: 1 }, t: "Goes out with a pop of light.", set: 3 },
    { id: "x2", n: "Glass Jelly", el: "dyb", r: "c", c: 2, a: 2, h: 2, kw: { echo: 1 }, t: "Break it, and it drifts back together.", set: 3 },
    { id: "x3", n: "Bonefish", el: "dyb", r: "c", c: 2, a: 2, h: 1, kw: { flok: 1, glow: 1 }, t: "Swims with the shoal. Dies with a flash.", set: 3 },
    { id: "x4", n: "Reefling", el: "dyb", el2: "rod", r: "c", c: 2, a: 1, h: 3, kw: { flok: 1 }, t: "Half coral, half curious.", set: 3 },
    { id: "x5", n: "Gulper", el: "dyb", r: "c", c: 3, a: 3, h: 3, kw: { echo: 1 }, t: "Mostly mouth. Always comes back hungry.", set: 3 },
    { id: "x6", n: "Angler", el: "dyb", r: "u", c: 3, a: 2, h: 3, kw: { ambush: 1, glow: 1 }, t: "Its light is a promise. It never keeps it.", set: 3 },
    { id: "x7", n: "Ghostlight Shoal", el: "dyb", r: "u", c: 3, a: 3, h: 3, kw: { flok: 1, echo: 1 }, t: "Count them. Now count again.", set: 3 },
    { id: "x8", n: "Pressure Crab", el: "dyb", r: "u", c: 4, a: 3, h: 5, kw: { glow: 2 }, t: "The deeper it lives, the harder it pops.", set: 3 },
    { id: "x9", n: "Tidewraith", el: "dyb", el2: "taage", r: "u", c: 4, a: 3, h: 2, kw: { taage: 1, echo: 1 }, t: "You can’t kill the tide.", set: 3 },
    { id: "x10", n: "Vent Eel", el: "dyb", el2: "glod", r: "u", c: 3, a: 2, h: 3, kw: { gnist: 1, glow: 1 }, t: "Born in the boiling cracks of the sea floor.", set: 3 },
    { id: "x11", n: "The Pale Choir", el: "dyb", r: "r", c: 5, a: 4, h: 5, kw: { rally: 1, echo: 1 }, t: "Drowned voices, singing the shoal forward.", set: 3 },
    { id: "x12", n: "Leviathan Calf", el: "dyb", r: "r", c: 5, a: 4, h: 6, kw: { glow: 3 }, t: "Only a baby. Its mother is watching.", set: 3 },
    { id: "x13", n: "Coral Matron", el: "dyb", el2: "rod", r: "r", c: 5, a: 3, h: 6, kw: { flok: 1, rod: 2 }, t: "The reef is her family. All of it.", set: 3 },
    { id: "x14", n: "The Sleeper Below", el: "dyb", r: "m", c: 7, a: 6, h: 7, kw: { echo: 1, glow: 3 }, t: "When it dreams, the whole sea glows.", set: 3 },
  ];
  var BY = {}; CARDS.forEach(function (c) { BY[c.id] = c; });
  var EL = { glod: "Blaze", taage: "Mist", rod: "Root", dyb: "Deep" };
  // Lysene et kort har (twin-kort har to; "*" = alle tre).
  function lights(c) { return c.el2 === "*" ? ["glod", "taage", "rod", "dyb"] : c.el2 ? [c.el, c.el2] : [c.el]; }
  function hasLight(c, el) { return lights(c).indexOf(el) >= 0; }
  function shareLight(a, b) { return lights(a).some(function (e) { return hasLight(b, e); }); }
  function lightName(c) { return c.el2 === "*" ? "Every light" : lights(c).map(function (e) { return EL[e]; }).join(" & "); }
  var RAR = { c: "Common", u: "Uncommon", r: "Rare", m: "Mythic" };
  var KW = {
    gnist: "Spark N: when played, deal N damage to the spirit opposite (or the enemy lantern).",
    taage: "Veil: ignores the first damage it takes.",
    flok: "Kin: +1 attack for each other spirit of yours with the same light.",
    rod: "Mend N: heals your lantern N when you end your turn.",
    sluger: "Devour: gains +1/+1 when it kills a spirit.",
    rally: "Rally: your spirits next to it get +1 attack.",
    ambush: "Ambush N: an enemy landing opposite takes N damage.",
    bloom: "Bloom: grows +1/+1 at the end of your turn — up to 3 times.",
    shine: "Shine N: when played, the spirits beside it get +N/+N.",
    echo: "Echo: the first time it dies in a battle, it returns to your hand.",
    glow: "Afterglow N: when it dies, it deals N damage to the enemy lantern.",
  };
  var TWIN = "Twin light: it counts as both lights — for its own Kin, and for its allies’ Kin.";
  // The islands: wardens with fixed decks
  var ISLANDS = [
    { n: "Skerrystone", lore: "A bare rock where gulls fight over washed-up lights.", foe: "The Hungry Gull", say: "Mine! Every light on this rock is MINE!", beaten: "Fine… keep your little lamp. Skraak.", hp: 10, trait: "dive", deck: ["n1","n1","g1","g1","t1","t1","r2","r2","t1","t2","n1","g2"] },
    { n: "Kelpwood", lore: "A forest that grows out of the sea. Its roots drink the dark.", foe: "The Root Witch", say: "Roots remember, little light. They will hold you here forever.", beaten: "Then grow, little light. Grow far from my wood.", hp: 16, trait: "regrow", deck: ["r1","r2","r2","r3","r3","r3","r4","n2","r5","r5","g2","g3","g2","n1"] },
    { n: "Ash Holm", lore: "An island of cinders. The ground is still warm.", foe: "The Coal Reeve", say: "Burn bright, and ash is all that’s left. Let me show you.", beaten: "Hm. You burn hotter than I ever did.", hp: 12, trait: "embers", deck: ["r2","n1","g2","g2","g3","g3","g4","g4","g5","n1","g2","g6"] },
    { n: "Storm Skerry", lore: "Two peaks, one storm. The lightning never stops.", foe: "The Twins", say: "One of us strikes. The other one laughs.", beaten: "We’ll argue later about whose fault this was.", hp: 30, trait: "gale", deck: ["g2","g2","t3","t3","g4","t4","g5","t5","n3","g6","g4","t4","g3","t2"] },
    { n: "Mist Sound", lore: "Fog so thick that sailors steer by sound alone.", foe: "The Blind Pilot", say: "I cannot see you. I do not need to.", beaten: "So that is what light looks like. I had forgotten.", hp: 15, trait: "fog", deck: ["t1","t1","t2","t2","t3","t3","t4","n1","t5","n1","t6","t3"] },
    { n: "Deadwater", lore: "Still black water over a sunken town. Bells ring below.", foe: "The Drowned King", say: "Every sailor comes to me in the end.", beaten: "Go, then. The sea can wait.", hp: 28, trait: "tide", deck: ["r3","r3","r5","r5","t4","t4","t6","r6","n3","t5","r4","r4","g5","t7"] },
    { n: "The Black Lighthouse", lore: "Where the first light went out. The Dark lives here.", foe: "The Dark", say: "I was here before the first flame. I will be here after the last.", beaten: "…then I will wait. I am good at waiting.", hp: 42, trait: "night", deck: ["g4","g4","t4","t4","r5","r5","g5","t5","t6","g6","r6","n3","g7","r7","t7","n2"] },
  ];
  // The Deepreach (0.15.0): the second sea, beyond the Black Lighthouse. Reached by ship (the Shipwright).
  var DEEP = [
    { n: "Glasswater", lore: "Water so clear you can see the drowned lights glowing far below.", foe: "The Glass Heron", say: "Step where you like, little lamp. Every step is a lure.", beaten: "Hm. You looked before you stepped. Rare.", hp: 12, trait: "lure", deck: ["x1","x1","x2","x2","x3","x3","x6","x6","t1","t2","x5","x4","x8","t4"] },
    { n: "Bonereef", lore: "A reef grown over the bones of something enormous.", foe: "The Bone Choir", say: "We died once. It did not take.", beaten: "Rest, then. We will sing about you.", hp: 23, trait: "echoes", deck: ["x2","x2","x5","x5","x7","x7","x4","x4","r2","r3","x13","x9","x8","r5"] },
    { n: "The Gulf of Teeth", lore: "Everything here eats. Everything here is eaten.", foe: "The Old Gulper", say: "Ahh. Something shiny swims into my mouth.", beaten: "Bah. Too bony anyway.", hp: 25, trait: "hunger", deck: ["g2","g3","x3","x3","x5","x5","x10","x10","g4","x6","x8","g5","x12","x9"] },
    { n: "Coralspire", lore: "A tower of living coral. Its queen feeds on every fallen light.", foe: "The Coral Queen", say: "Fall, little spirits. My reef is always hungry.", beaten: "Then my reef will grow without you. Go.", hp: 25, trait: "feast", deck: ["x4","x4","r2","r2","x7","x6","r4","x8","x13","r6","x11","x9","r5","x12"] },
    { n: "The Sunless Trench", lore: "The bottom of the world. Something huge is sleeping here.", foe: "The Dreamer in the Trench", say: "You woke me. Now you are part of my dream.", beaten: "…the dream ends. The deep is yours, lantern-bearer.", hp: 46, trait: "abyss", deck: ["x2","x3","x5","x5","x7","x7","x8","x8","x9","x10","x11","x12","x13","t6","g6","x14"] },
  ];
  // Søkort-positioner pr. hav (x, y i 100×162).
  var SEAS = [
    { id: "dark", n: "The Dark Sea", islands: ISLANDS, pos: [[30, 148], [70, 128], [34, 106], [68, 84], [30, 62], [66, 40], [50, 15]] },
    { id: "deep", n: "The Deepreach", islands: DEEP, pos: [[50, 146], [26, 116], [70, 90], [32, 58], [56, 20]] },
  ];
  // Starlit (0.10.2): i Darkness har vogterne også fået stjerner — 2 Starfall-ånder pr. ø, der passer til deres lys.
  // [ind, ud]: Starfall-ånderne erstatter kort med samme pris, så vogterens kurve ikke ændres.
  var STARLIT = [[["s5", "s2"], ["g2", "t2"]], [["s4", "s3"], ["g3", "r3"]], [["s5", "s9"], ["g2", "g4"]], [["s1", "s6"], ["g2", "g5"]],
    [["s8", "s1"], ["t3", "t2"]], [["s10", "s11"], ["r4", "t6"]], [["s13", "s12"], ["g7", "r6"]]];
  // Darkness-regler (0.11.0): hvert niveau lægger én synlig regel til (de gælder fra deres niveau og op).
  var DARK = [null,
    { n: "Starlit", t: "Wardens call Starfall spirits." },
    { n: "Vanguard", t: "Wardens start with a cheap spirit on the board." },
    { n: "Shroud", t: "One of the warden’s next moves is hidden." },
    { n: "Black Tide", t: "Warden lanterns heal 1 after their turn." },
    { n: "Deep Night", t: "Wardens start with 2 extra cards." }];
  // 0.14.0 (nat 7): Skerrystone fik Dive — første kamp havde intet valg (tests/beslutninger.js: tilfældig spiller vandt 99 %).
  // Nu: tilfældig ~80 %, grådig ~87 %, tænkende ~99 %. Ashrunner (3/1) byttet ud med Dewveil, så tærsklen ikke blev for høj.
  // Vogter-evner: én enkel regel pr. ø, der ændrer hvordan man skal spille (navn + max ~8 ord).
  var TRAITS = {
    dive: { n: "Dive", t: "Its spirits hit your lantern +1 through open lanes." },
    regrow: { n: "Regrowth", t: "Her spirits heal 1 after her turn." },
    embers: { n: "Live Coals", t: "His Blaze spirits arrive with Spark 1." },
    gale: { n: "Gale", t: "The leftmost lane is closed." },
    fog: { n: "Fog", t: "You can't see the pilot's next move." },
    tide: { n: "High Tide", t: "His lantern heals 2 after his turn." },
    night: { n: "Endless Night", t: "The Dark draws 2 cards each turn." },
    lure: { n: "Glow Lure", t: "Its spirits have Ambush 1." },
    echoes: { n: "Echoes", t: "Its spirits have Echo." },
    hunger: { n: "Hunger", t: "Its spirits have Devour." },
    feast: { n: "Feast", t: "Her lantern heals 2 when one of your spirits dies." },
    abyss: { n: "Abyss", t: "Its spirits have Afterglow 1." },
  };
  var api = { STARLIT0: STARLIT, SEAS: SEAS, DEEP: DEEP, DARK: DARK, STARLIT: STARLIT, TWIN: TWIN, lights: lights, hasLight: hasLight, shareLight: shareLight, lightName: lightName, TRAITS: TRAITS, CARDS: CARDS, BY: BY, EL: EL, RAR: RAR, KW: KW, ISLANDS: ISLANDS };
  if (typeof module !== "undefined") module.exports = api; else root.DATA = api;
})(this);
