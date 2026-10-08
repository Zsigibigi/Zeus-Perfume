# ZEUS — Az istenek illata

Animált, mobilra optimalizált bemutató oldal a **Zeus** és a **Pharaon** parfümhöz
(Eau de Parfum, 100 ml, 51 600 Ft). **Next.js** (App Router) projekt, az animációk külső animációs könyvtár nélkül készültek.

## Élő oldal

**https://zsigibigi.github.io/Zeus-Perfume/**

Minden feltöltés (push) után a `.github/workflows/pages.yml` automatikusan
újraépíti az oldalt (statikus export), és kiteszi a `gh-pages` ágra.

Egyszeri beállítás a GitHubon: **Settings → Pages → Build and deployment →
Source: Deploy from a branch → Branch: `gh-pages` / `(root)` → Save**.

## Indítás helyben

```bash
npm install
npm run dev      # fejlesztői szerver: http://localhost:3000
npm run build    # statikus export az out/ mappába
npm start        # az out/ mappa kiszolgálása
```

## Fájlok

- `app/page.jsx` – az oldal tartalma (hero, kollekció, lábléc)
- `app/layout.jsx` – betűtípusok (`next/font`), meta adatok
- `app/globals.css` – minden stílus és CSS animáció
- `components/ZeusEffects.jsx` – kliens komponens, ez indítja az animációkat
- `lib/zeus.js` – intro, villámok, 3D palackok, kollekcióváltó, kosár
- `assets/img/` – a háttér nélküli palackképek
- `.github/workflows/pages.yml` – automatikus kitelepítés GitHub Pages-re

## Felépítés (rövid, kb. 2,5–3 képernyő)

1. **Intro + hero** – a nyitójelenet maga a hero:
   ΖΕΥΣ felirat villódzik egy aranyvonal fölött → villám csap a vonalba (villanás,
   rázkódás, szikrák, lökéshullám) → a „ZEUS” betűk egyenként becsapódnak →
   a Zeus palack kétszer megpördülve megérkezik → záró villám a kupakba.
2. **Kollekció** – Zeus / Pharaon váltó: villám csap a színpadra, a palack kipörög,
   az új bepörög, a háttér színe és az illatjegyek is cserélődnek, „Kosárba” gomb.
3. **Lábléc**.

## Interakciók

- **Palack forgatása ujjal/egérrel**: oldalra húzva 3D-ben forog, lendülettel pörög tovább,
  majd visszaáll szemből. Koppintásra megpördül, és villám csap a kupakjába.
- **Koppints bárhová** → villám csap az ujjad helyére.
- **Kosárba** → villám a gombba, szikraeső, kosárszámláló, értesítés.
- Opcionális mennydörgés hang (navigáció hang gombja), Androidon rövid rezgés.
- A `prefers-reduced-motion` beállítást tiszteletben tartja.

## Teljesítmény

- Minden CSS animáció csak `transform`/`opacity` (GPU-n fut).
- A villámok canvasra rajzolódnak `shadowBlur` nélkül, és a canvas csak akkor dolgozik,
  amikor éppen van villám vagy szikra.
- A betűtípusokat a `next/font` helyben szolgálja ki, nem blokkolják a megjelenést.

## Szerkesztés

- Termékek (név, leírás, illatjegyek, ár): `lib/zeus.js` → `PRODUCTS`
- Szövegek: `app/page.jsx`
- Színek: `app/globals.css` → `:root`
- Képek: `assets/img/zeus.webp`, `assets/img/pharaon.webp`
