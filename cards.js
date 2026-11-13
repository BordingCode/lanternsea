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
  ];
  var BY = {}; CARDS.forEach(function (c) { BY[c.id] = c; });
  var EL = { glod: "Blaze", taage: "Mist", rod: "Root" };
  var RAR = { c: "Common", u: "Uncommon", r: "Rare", m: "Mythic" };
  var KW = {
    gnist: "Spark N: when played, deal N damage to the spirit opposite (or the enemy lantern).",
    taage: "Veil: ignores the first damage it takes.",
    flok: "Kin: +1 attack for each other spirit of yours with the same light.",
    rod: "Mend N: heals your lantern N when you end your turn.",
    sluger: "Devour: gains +1/+1 when it kills a spirit.",
    rally: "Rally: your spirits next to it get +1 attack.",
    ambush: "Ambush N: an enemy landing opposite takes N damage.",
  };
  // The islands: wardens with fixed decks
  var ISLANDS = [
    { n: "Skerrystone", foe: "The Hungry Gull", say: "Mine! Every light on this rock is MINE!", beaten: "Fine… keep your little lamp. Skraak.", hp: 10, deck: ["n1","n1","g1","g1","t1","t1","r2","r2","g3","t2","n1","g2"] },
    { n: "Kelpwood", foe: "The Root Witch", say: "Roots remember, little light. They will hold you here forever.", beaten: "Then grow, little light. Grow far from my wood.", hp: 18, trait: "regrow", deck: ["r1","r2","r2","r3","r3","r3","r4","n2","r5","r5","g2","g3","g2","n1"] },
    { n: "Ash Holm", foe: "The Coal Reeve", say: "Burn bright, and ash is all that’s left. Let me show you.", beaten: "Hm. You burn hotter than I ever did.", hp: 12, trait: "embers", deck: ["r2","n1","g2","g2","g3","g3","g4","g4","g5","n1","g2","g6"] },
    { n: "Storm Skerry", foe: "The Twins", say: "One of us strikes. The other one laughs.", beaten: "We’ll argue later about whose fault this was.", hp: 30, trait: "gale", deck: ["g2","g2","t3","t3","g4","t4","g5","t5","n3","g6","g4","t4","g3","t2"] },
    { n: "Mist Sound", foe: "The Blind Pilot", say: "I cannot see you. I do not need to.", beaten: "So that is what light looks like. I had forgotten.", hp: 15, trait: "fog", deck: ["t1","t1","t2","t2","t3","t3","t4","n1","t5","n1","t6","t3"] },
    { n: "Deadwater", foe: "The Drowned King", say: "Every sailor comes to me in the end.", beaten: "Go, then. The sea can wait.", hp: 28, trait: "tide", deck: ["r3","r3","r5","r5","t4","t4","t6","r6","n3","t5","r4","r4","g5","t7"] },
    { n: "The Black Lighthouse", foe: "The Dark", say: "I was here before the first flame. I will be here after the last.", beaten: "…then I will wait. I am good at waiting.", hp: 42, trait: "night", deck: ["g4","g4","t4","t4","r5","r5","g5","t5","t6","g6","r6","n3","g7","r7","t7","n2"] },
  ];
  // Vogter-evner: én enkel regel pr. ø, der ændrer hvordan man skal spille (navn + max ~8 ord).
  var TRAITS = {
    regrow: { n: "Regrowth", t: "Her spirits heal 1 after her turn." },
    embers: { n: "Live Coals", t: "His Blaze spirits arrive with Spark 1." },
    gale: { n: "Gale", t: "The leftmost lane is closed." },
    fog: { n: "Fog", t: "You can't see the pilot's next move." },
    tide: { n: "High Tide", t: "His lantern heals 2 after his turn." },
    night: { n: "Endless Night", t: "The Dark draws 2 cards each turn." },
  };
  var api = { TRAITS: TRAITS, CARDS: CARDS, BY: BY, EL: EL, RAR: RAR, KW: KW, ISLANDS: ISLANDS };
  if (typeof module !== "undefined") module.exports = api; else root.DATA = api;
})(this);
