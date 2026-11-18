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

## Nat 4 (0.9.6 → 0.10.0)
**0.9.6 — dommerens fejl:** pakken reagerer straks (et ekstra tryk springer rysten over), "Reveal all" ~1,5 s (før 6–8 s),
sjældenhed som ædelsten på hvert kort, **fair starthånd** (`fairHand` i engine: har decket et 1-lys-kort, er der ét på
hånden — tur 1 har kun 1 lys), autoDeck tager mindst 2 til 1 lys, tryk på tomt felt uden valgt kort forklarer hvad man gør.

**0.10.0 — Starfall (sæt 2).** Telemetri: Mathias tændte Den Sorte Fyr (nat 3) og har 30/36 → indholdet var slut, og hans
deck (mono-Blaze) ændrede sig aldrig. Starfall lander første gang Den Sorte Fyr er tændt (`S.bestDark >= 1`): en lille
begivenhed (stjerneskud + historie) og 2 gratis Starfall-pakker; derefter kan man vælge en Starfall-pakke efter hver vogter.
13 kort (`set: 2`, kun i Starfall-pakker, aldrig på havet/i vilde møder). Tre nye ting, alle for at gøre **deckbygning på
tværs af lys** interessant:
- **Twin light** (`el2`): tæller som begge lys for Kin (begge veje). `"*"` = alle lys (mytisk). Kin bruger nu `D.shareLight`.
- **Bloom**: +1/+1 ved slutningen af din tur, højst 3 gange (uden loft var Starseed +9–10 point bedst i `tests/kortrate.js`).
- **Shine N**: når den lægges, får naboerne +N/+N (placering i egen række, permanent i modsætning til Rally).
Balance: `node tests/kortrate.js 30000` (tilfældige decks mod ø 2–7, Darkness 1): alle Starfall-kort mellem −2,2 og +2,9.
**Synergi i deckbyggeren:** tryk på et kort → kort, der spiller sammen med det (Kin-lys, Devour+Spark), lyser grønt, og
infofeltet siger hvorfor ("Kin: 14 spirits in your deck share its light").
Samlingen er nu 49; milepæle 42 og 49 (49 → 3 pakker).
Sejlads (0.10.1): stjernehændelsen ('Starfall' på havet) giver en Starfall-ånd efter oplåsning og dukker op ~30 % af gangene; Fog Trader har altid én Starfall-ånd på hylden.
**Starlit-vogtere (0.10.2):** i Darkness I+ har hver vogter byttet 2 kort ud med 2 Starfall-ånder til *samme pris*
(`D.STARLIT[i] = [ind, ud]`) — så genspilningen føles ny, og man ser de nye mekanikker fra modstanderens side. Første forsøg
(lægge 2 kort *til*) gjorde Deadwater sejere (længere deck → senere deck-out mod en vogter, der heler); "byt de 2 billigste"
ændrede kurven for meget. Samme-pris-byt holdt Darkness-tabellen næsten uændret (D1: 100/93/80/75/71/42/43 mod før 98/94/74/84/77/41/30).

## Darkness-regler (0.11.0) — et langsigtet mål, der ændrer spillet, ikke kun tallene
Før: hvert niveau = +10 % vogterliv. Nu lægger hvert niveau én synlig regel til (`D.DARK`, gælder fra sit niveau og op),
og livet stiger kun 4 %/niveau:
I **Starlit** (vogterne kalder Starfall-ånder) · II **Vanguard** (vogteren starter med sin billigste ånd på brættet, hvis den
koster ≤ 2 — respekterer Gale) · III **Shroud** (vogterens første planlagte træk vises som "?") · IV **Black Tide** (vogterens
lygte heler 1 efter dens tur) · V **Deep Night** (vogteren starter med 2 ekstra kort).
Forkastet: "Hunger" (3 starthåndkort) — alt for hård (D4 Deadwater 4 %); +1 lys til vogteren pr. tur — D5 næsten 0 %.
`node tests/moerke.js 400`: D1 100/93/81/78/74/42/46 · D3 100/78/63/64/64/35/32 · D5 100/66/52/41/32/11/12 (før: D5 …/13/6).
Botten bruger ikke vogterens plan, så Shroud koster mennesker mere end tallene viser. Vilde møder får ingen Darkness-regler.
Sejrsbeskeden fortæller den nye regel; søkortet og vogterens info viser de aktive regler.

## Nat 5 (0.11.2 → 0.12.0) — Constellations
Dom nat 4: 6,6 — **kombinationer 5** (laveste): "Kin/Rally/Veil lærer man ikke at bruge bevidst … giv et par tydelige
sæt-kombinationer som mål". Telemetri: Mathias spiller stadig mono-Blaze (nu med 3 Starfall-kort) og taber i Darkness I ved ø 3–4.
**Constellations** (`stars.js`, ren logik): 12 navngivne kombinationer, man *opdager* i kamp — Wildfire (Kin +3), Warband
(mellem to Rally), Feast (Spark + Devour-drab i samme tur), Mist Wall (3 Veil), Deep Roots (Mend 4+), The Trap (Ambush dræber),
Clean Sweep (3 drab i ét angreb), Lantern Strike (10+ på lygten), Last Light (vind på ≤3 liv) + 3 Starfall (Star Crown, Full Bloom,
Twin Fire). Første gang: stjernefigur tegnes, +1 pakke. Senere gange: lille banner "✦ Wildfire", så kombinationen kan *ses*
hver gang. Bogen ligger i Collection (ukendte viser et hint = en opskrift). Mål: få spilleren til at bygge andre decks end
mono-Blaze for at finde resten. `node tests/stjerner.js` måler hvor ofte en bot rammer hvert billede (Feast/Sweep/Trap er sjældne
med en tilfældig bot — de kræver vilje). Lantern Strike 8 → 10 (52 % af bot-kampe var for let).
0.11.2-rettelser: samlingstælleren stiger, mens nye ånder vendes; båden lægger til ved stoppets kant; tablet-kampen bruger
720 px (før 560 → stort tomt hul); månen på havet er en lille segl med stjerner (den grå cirkel lignede en fejl).

## Nat 8 (0.15.0) — Skibet og The Deepreach. Svar på Mathias: "hurtigt færdig, bygger ikke op til noget stort, vildt meget glimmer, rejse til nye steder"
Telemetri: Mathias spillede fra 06:34 til 19:19 på tablet, tændte Den Sorte Fyr to gange (Darkness I), havde hele samlingen (49/49)
→ hver pakke smeltede til glimmer, og der var intet at bruge det på. Løsning, der binder alle tre ønsker sammen:
- **⚓ Skibet** (glimmer-sink med et synligt mål): Lantern Glass I–III (+1 lygteliv/niveau i alle kampe; 40/90/160),
  Spare Wick (4. flamme; 150) og tre dele til et nyt hav — Deep Hull (100), Storm Sails (150), Star Compass (200, kræver
  Den Sorte Fyr tændt). Båden på skærmen får dele på, efterhånden som man bygger.
- **The Deepreach** — et andet hav med 5 øer og egne vogtere (Glow Lure / Echoes / Hunger / Feast / Abyss). Hvert hav har sin egen
  rejse (`S.sea`, `S.seas[k]` med island/best/flames/voy/quest/dark/runs; `E.switchSea`). Samling, deck, glimmer og skib er fælles.
  Man skifter hav ved at trykke på havets navn (⇄). `D.ISLANDS` peger på det aktive havs øer (`E.setSea`), så al gammel kode virker.
- **Et fjerde lys: Deep** (14 ånder, sæt 3, kun i Deep-pakker/Deepreach-farvande): **Echo** (første gang den dør → tilbage på hånden),
  **Afterglow N** (dør → N skade på fjendens lygte). Døden er en ressource — modsat Devour/Bloom, der vil overleve.
- Glimmer-sink nr. 2: købte pakker i Deepreach er Deep-pakker; Deep-ånder kan lokkes, når man har været der. Milepæle 56/63.
Balance: `node tests/dybet.js 400` (færdigt Mørkhavs-deck mod Deepreach, D0): 79/79/61/46/51 % — som Mørkhavet på Darkness I–II.
Kortrate (`tests/kortrate.js`): Echo-kort var svage (−3 til −6) → +1 liv/angreb; nu alle Deep-kort mellem −4 og +3.
Botten bruger ikke vogterens plan, og Glow Lure (Ambush på alle vogterens ånder) kræver, at man læser brættet.
