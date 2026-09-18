# HANGER & CO.

A t-shirt shop that skips the usual hero-banner-plus-grid template. Instead:

- Shirts hang on a **draggable clothing rack** — drag/scroll horizontally to browse, like flipping through a rack in a store.
- Each shirt is a **hand-drawn SVG illustration** (no stock photos), recoloured live when you pick a swatch.
- Click a shirt and it **unhooks** off its hanger with a little swing animation before opening the detail panel.
- A **tape-measure scroll bar** under the rack tracks (and lets you jump) your position as you browse.
- Sizes are picked from a **ruler-style selector** instead of a plain dropdown.
- The basket is a **paper-ticket list**; checkout ends with a **packing-tape animation** and a receipt-style order confirmation.
- Everything is mocked — it's a demo shop. No real payment is collected, no card details are ever asked for.

## Stack

Plain HTML / CSS / vanilla JS. No build step, no dependencies, no framework.
Basket state persists to `localStorage` so it survives a page refresh.

## Run it

Any static file server works. For example, from this folder:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173` in a browser. Opening `index.html` directly by
double-clicking also works in most browsers.

## Files

- `index.html` — page structure (header, rack, drawers for detail/basket/checkout)
- `styles.css` — all styling, animation and the hand-drawn visual language
- `script.js` — product data, SVG shirt generation, rack drag-scroll, basket + checkout logic
