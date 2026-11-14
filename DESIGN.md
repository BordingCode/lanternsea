# Lanternsea — design (nat 1, opdateret nat 2)

> Nat 2: spillet er omdøbt fra Lygtebærer til **Lanternsea**, al spiltekst på engelsk (regel 13).
> Navne: Mørkhavet = The Dark Sea · Glød/Tåge/Rod = Blaze/Mist/Root · nøgleord Gnist/Tåge/Flok/Rod/Sluger =
> Spark/Veil/Kin/Mend/Devour · gløder = glimmer · Den Sorte Fyr = The Black Lighthouse. Interne id'er (glod/taage/rod) er uændrede, så gemte data virker.
>
> **Vogterens hensigt (0.3.0):** vogteren planlægger sin næste tur, og planen vises som falmede
> spøgelseskort i dens felter + ⚠ i banen. Den følger planen ærligt (ingen skjulte ekstra kort).
> Så bliver hver tur et lille puslespil: sæt en blokker overfor, eller udnyt den åbne bane.

## Verden
Mørkhavet: et øhav hvor lyset er gået ud. Du er Lygtebærer — du fanger *lysånder* (kortene) i din
lygte og sejler fra ø til ø for at tænde fyrene igen. Den sidste ø er **Den Sorte Fyr**, hvor
Mørket selv bor. Tre slags lys: **Glød** (ild, angreb), **Tåge** (undvigelse, list), **Rod**
(liv, udholdenhed).

## Designsøjler
1. **Pakken er et ritual** — hver pakke skal føles som et lille løfte. Hurtige almindelige kort,
   langsom, glødende spænding for de sjældne.
2. **Placering er strategi** — kampen er simpel at forstå (4 pladser mod 4), men hvor du
   lægger et kort, afgør alt.
3. **Kombinationer, ikke tal** — nøgleord der forstærker hinanden (Flok, Tåge, Sluger, Gnist, Rod).
4. **Tab kan mærkes** — 3 lygteflammer pr. rejse; slukkes de alle, starter rejsen forfra.
5. **Én tommelfinger** — alt vigtigt nederst på skærmen, stående format.

## Kernesløjfe
Sejl til næste ø → kamp → vind: pakke (5 kort) → byg deck → næste ø. Tab: mist en flamme.

## Kamp
- Begge har 15 liv (bosser mere). 4 pladser hver. Start-hånd 4, træk 1 pr. tur.
- Lys (mana) = turnummer, maks 8.
- Læg kort på en tom plads. Når du trykker **Slut tur**, angriber hver af dine ånder ånden
  overfor (som slår igen) — eller fjendens lygte, hvis pladsen er tom.
- Nøgleord: **Gnist N** (når den lægges: N skade på ånden overfor/lygten), **Tåge** (ignorerer
  første skade), **Flok** (+1 angreb pr. anden allieret af samme lys), **Rod** (heler din lygte 1
  ved tur-slut), **Sluger** (+1/+1 når den dræber en ånd).

## Deck
12–20 kort, maks 2 ens (mytiske maks 1).

## Progression / mål
7 øer i Mørkhavet; hver har en vogter med eget deck. Mål: tænd Den Sorte Fyr. Senere sæt = nye
have (udvidelser) når telemetrien viser at spillerne nærmer sig enden.

## Pakker
5 kort: 3 almindelige, 1 ualmindelig, 1 sjælden (1/6 chance for mytisk). Dubletter ud over
deck-grænsen smeltes til **gløder**; 12 gløder = en ekstra pakke.

## De første 10 minutter
1. Kort intro (2 linjer) → åbn 2 start-pakker (ritual).
2. Færdigt start-deck foreslået automatisk → første kamp mod en let vogter (lærer placering).
3. Sejr → pakke → "Tilføj til deck?" → ø 2.

## Vogter-evner (0.4.0, nat 2)
Hver vogter (undtagen den første) har én regel, der ændrer, hvordan man skal spille — inspireret af
princippet om "tilfældighed/variation man kan handle på" (viden/designere-principper.md):
Kelpwood **Regrowth** (hendes ånder heler 1 → dræb i ét slag) · Ash Holm **Live Coals** (Blaze-ånder ankommer
med Spark 1 → hold dine skrøbelige ånder væk fra hans planlagte baner) · Storm Skerry **Gale** (bane 1 lukket →
3 baner) · Mist Sound **Fog** (du kan ikke se planen) · Deadwater **High Tide** (lygten heler 2 → pres hårdt) ·
Black Lighthouse **Endless Night** (trækker 2 kort).

## Nat 2, del 2 (0.5.0–0.7.0)
- **Rally** (nyt nøgleord): dine ånder ved siden af får +1 angreb → placering inden for egen række betyder noget.
  6 nye ånder (Beacon Imp, Pyre Herald, Fog Lantern, Tidecaller, Hedge Warden, Elder Willow) → 30 i alt.
- **Temapakker**: efter hver sejr vælger man Blaze/Mist/Root-pakke (almindelige+ualmindelige fra det lys, den
  sjældne kan være alt). Giver retning mod Kin-decks. `S.packq` holder ventende temapakker.
- **Samlemappe + milepæle**: 10/15/20/25/30 ånder giver bonuspakker (30 → 3). **Lure**: lok en bestemt ånd for
  glimmer (5/10/22/40 efter sjældenhed) — dubletter bliver til noget, man selv styrer (Hearthstones dust-princip).
- **Søkort** i stedet for liste; **kampscene** (horisont + vogterens fyr, der tændes ved sejr); kort intro (≤ ~8 ord pr. linje).
- **Kunst** (art.js): hver ånd har sin egen opskrift af dele (krop + ører/vinger/gevir/finner/krone …).
- Nederlag giver et konkret råd (vogter-specifikt), så tabet peger fremad.

### Sværhedskurve (balance-bot, simpel spiller, 600 kampe/ø, 0.6.6+)
ø1 100 % · ø2 87 % · ø3 69 % · ø4 75 % · ø5 57 % · ø6 49 % · ø7 44 %. Botten bruger ikke vogterens plan;
en "klog" bot (`node tests/balance.js 400 --klog`) vinder kun lidt mere → planen giver endnu få svarmuligheder.

## Ambush (0.7.2)
Svar på vogterens synlige plan: **Ambush N** — en fjende, der lander overfor, får N skade (Veil tager det).
Giv til Darkfisher (Ambush 2 · Veil, før Spark 2) og Barkbeetle (Ambush 1). AI'en undgår at lande skrøbelige ånder
overfor baghold. Næste: flere Ambush-kort, så "læg en fælde, hvor spøgelseskortet står" bliver en rigtig strategi.

## The Voyage (0.8.0, nat 3) — svar på "Der er ikke nok eventyr"
Telemetri (nat 2): Mathias tændte 4 fyrtårne og tabte på ø 5 (Mist Sound) efter ~12 min, med 26/30 ånder → rejsen var bare 7 kampe i træk, og samlingen
løb tør. Nu sejler man **mellem øerne** (fra ø 2): hver overfart har 2 skillevejene × 2 synlige valg (`voyage.js`):
- ⚔ **Wild spirits** — lille kamp mod en flok af ét lys (liv 7+2·ø). Vind → vælg 1 af 3 ånder (ofte en drifter).
  Tab → en flamme går ud (reel indsats, men man valgte selv risikoen ved skillevejen). Bot: 96 % → 67 % (ø2→ø7), `tests/vild.js`.
- ❓ **Strange waters** — 7 små historier med 2 valg (risiko/belønning): Drowned Bell, Whale of Lights, Lost Keeper,
  Singing Rocks, Starfall, Eye of the Storm, Message in a Bottle. Nogle giver en **velsignelse/forbandelse** til næste
  vogterkamp (±lygteliv, +1 startkort) — `S.voy.boon`, bruges når vogterkampen starter.
- ⚓ **Wreck** (glimmer, 35 % en ånd) · 🏮 **Fog Trader** (køb 1 af 3 for glimmer — giver glimmer et formål) ·
  🏝 **Haven** (tænd en mistet flamme; ellers +5 ✦ og +2 liv).
- **Drifters**: 6 nye ånder (d1–d6), kun på havet — aldrig i pakker, kan ikke lokkes. Samlingen er nu 36.
Gemt tilstand: `S.voy = {to, step, nodes, done, boon, seenEv}`; valget forpligtes, før stoppet vises (ingen gen-valg ved genindlæsning).
Ø 1 har ingen overfart (de første minutter skal hurtigt frem til første kamp).

## Darkness (0.9.0, nat 3) — det langsigtede mål efter Den Sorte Fyr
Før: efter sejren startede alt forfra med de samme vogtere. Nu: hver gang Den Sorte Fyr tændes, vender Mørket
dybere tilbage — **Darkness I–V** (`S.dark`, `S.bestDark`). Vogterne får +10 % liv pr. niveau (`E.warden(i, dark)`),
vilde ånder +2 liv pr. niveau, hver vogtersejr giver +3 ✦ pr. niveau, og den endelige sejr giver 3 + niveau pakker.
20 %/niveau gjorde Den Sorte Fyr umulig ved V (bot 0 %) → 10 %. `node tests/moerke.js 300` måler hele tabellen.
Små ting samme nat: Root Witch 18 → 16 liv (dommer + Mathias tabte ved de første øer); plads-forhåndsvisning (0.8.4);
pakke-finale (0.8.2).
Idéer til senere niveauer: én ekstra regel pr. niveau (fx vogtere starter med en ånd på brættet), egne Darkness-drifters.
