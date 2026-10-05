# ZEUS — Az istenek illata

Animált, mobilra optimalizált bemutató oldal a **Zeus** és a **Pharaon** parfümhöz
(Eau de Parfum, 100 ml, 51 600 Ft). Tiszta HTML + CSS + JavaScript, külső könyvtár nélkül.

## Indítás

```bash
python3 -m http.server 8000
# majd: http://localhost:8000
```

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
- A betűtípusok nem blokkolják a megjelenést.

## Szerkesztés

- Termékek (név, leírás, illatjegyek, ár): `js/main.js` → `PRODUCTS`
- Szövegek: `index.html`
- Színek, betűtípusok: `css/style.css` → `:root`
- Képek: `assets/img/zeus.webp`, `assets/img/pharaon.webp` (háttér nélküli palackok)
