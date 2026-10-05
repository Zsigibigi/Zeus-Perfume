# ZEUS — Az istenek illata

Animált bemutató weboldal a **ZEUS** parfümhöz (Ambrózia és Égi Zafír kiadás).
Tiszta HTML + CSS + JavaScript, külső könyvtár és build lépés nélkül.

## Indítás

Elég megnyitni az `index.html`-t böngészőben, de helyi szerverrel a legjobb:

```bash
python3 -m http.server 8000
# majd: http://localhost:8000
```

## Animációk

- **Nyitó intro**: viharfelhők, aranyparázs, villámcsapás a képernyő közepére, villanás
  és rázkódás, lökéshullám, a „ZEUS” felirat kirajzolódik és arannyal telik meg,
  kibomló görög meander, görög betűkből dekódolódó alcím, oldalsó villámok, számláló,
  végül a kép egy cikcakkos villám mentén kettéhasad. (Kihagyható: gomb vagy `Esc`.)
- **Hero**: élő viharos égbolt (canvas) véletlenszerű villámokkal, a felirat betűnként
  emelkedik és csillog, a palackok lebegnek, egérre 3D-ben dőlnek, fényes csík fut
  végig rajtuk, forgó görög feliratos glória.
- **Kattints bárhová** → villám csap a kurzor helyére szikrákkal.
- Görgetésre: szövegek betűnkénti beúsztatása, görög betűs „scramble” címkék,
  szóról szóra kivilágosodó bekezdés, sebességfüggő futószalag, vízszintesen görgő
  „Mestermű” galéria, számlálók arany körgyűrűkkel, villódzó idézet saját viharral.
- **Kollekció kártyák**: 3D dőlés, csillanás, forgó arany keret.
- **Illatpiramis**: kiadásváltáskor villám csap a palackba, a jegyek és mérők animálnak.
- **Rendelés**: animált ár, „Kosárba” gombra villám és szikraeső, kosárszámláló, értesítés.
- Egyedi kurzor, mágneses gombok, görgetésjelző, filmszemcse, opcionális szintetizált
  mennydörgés hang (a navigáció hang gombjával kapcsolható be).
- A `prefers-reduced-motion` beállítást tiszteletben tartja (intro és villanások nélkül).

## Szerkesztés

- Szövegek: `index.html`
- Illatjegyek, mérők és árak: `js/main.js` → `EDITIONS`
- Színek, betűtípusok: `css/style.css` → `:root`
- Képek: `assets/img/` (háttér nélküli, kivágott palackok)

> Az illatjegyek, árak és statisztikák mintaadatok — cseréld le a valós adatokra.
