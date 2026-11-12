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
