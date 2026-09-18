/* ---------------------------------------------------------------
   HANGER & CO. — shop logic
   Vanilla JS, no dependencies. Basket persists to localStorage.
   ------------------------------------------------------------- */

(() => {
  "use strict";

  /* ---------------- silhouette paths (hand-drawn style) ---------------- */
  const SILHOUETTES = {
    "crew-short": {
      viewBox: "0 0 160 190",
      body: "M58 10 C64 20 96 20 102 10 L128 24 L150 54 L130 70 L116 58 L116 176 L44 176 L44 58 L30 70 L10 54 L32 24 Z"
    },
    "vneck-short": {
      viewBox: "0 0 160 190",
      body: "M58 10 L80 40 L102 10 L128 24 L150 54 L130 70 L116 58 L116 176 L44 176 L44 58 L30 70 L10 54 L32 24 Z"
    },
    "long": {
      viewBox: "0 0 170 190",
      body: "M58 10 C64 20 96 20 102 10 L132 26 L158 46 L146 112 L124 100 L116 58 L116 176 L44 176 L44 58 L36 100 L14 112 L2 46 L28 26 Z"
    }
  };

  const COLORS = {
    cream: "#e6dab8",
    ink:   "#2c2620",
    rust:  "#bf5432",
    olive: "#6f7a56",
    dust:  "#d9a79f"
  };

  const SIZES_STANDARD = ["S", "M", "L", "XL"];
  const SIZES_LIMITED  = ["S", "M", "L"];

  /* ---------------- product catalogue ---------------- */
  const PRODUCTS = [
    { id:"p01", name:"Rack Original", collection:"Classics", silhouette:"crew-short", graphic:"none",
      price:26, colors:["ink","cream","olive","rust","dust"], sizes:SIZES_STANDARD,
      desc:"The one we always come back to. Mid-weight cotton, no logo, no fuss — the shirt equivalent of a good plain sentence." },
    { id:"p02", name:"Ink Line Classic", collection:"Classics", silhouette:"crew-short", graphic:"none",
      price:28, colors:["cream","ink","olive"], sizes:SIZES_STANDARD,
      desc:"A slightly heavier hand-feel with a clean crew neck. Wears in, not out." },
    { id:"p03", name:"Rust Pocket Tee", collection:"Classics", silhouette:"crew-short", graphic:"pocket",
      price:30, colors:["rust","cream","dust"], sizes:SIZES_STANDARD,
      desc:"One small chest pocket, wide enough for a receipt or a bus ticket, not much else." },
    { id:"p04", name:"Field Notes Long", collection:"Classics", silhouette:"long", graphic:"none",
      price:38, colors:["olive","ink"], sizes:SIZES_STANDARD,
      desc:"Long sleeves, brushed-back cotton. For the weather that can't make up its mind." },

    { id:"p05", name:"Quiet Stripe", collection:"Minimal Line", silhouette:"crew-short", graphic:"stripe",
      price:32, colors:["ink","olive"], sizes:SIZES_STANDARD,
      desc:"A single chest stripe, no text, no noise. It just sits there, being tasteful." },
    { id:"p06", name:"Bare Vee", collection:"Minimal Line", silhouette:"vneck-short", graphic:"none",
      price:29, colors:["cream","dust","ink"], sizes:SIZES_STANDARD,
      desc:"A shallow v-neck cut for people who find crew necks a little too loud." },
    { id:"p07", name:"Minimal Vee Long", collection:"Minimal Line", silhouette:"long", graphic:"none",
      price:40, colors:["cream","olive"], sizes:SIZES_STANDARD,
      desc:"Long-sleeve, v-neck, absolutely nothing printed on it. Very confident of itself." },

    { id:"p08", name:"Say Nothing", collection:"Statement", silhouette:"crew-short", graphic:"text", text:"QUIET",
      price:34, colors:["ink","rust"], sizes:SIZES_STANDARD,
      desc:"A statement tee that states, specifically, the opposite of a statement." },
    { id:"p09", name:"Loud & Clear", collection:"Statement", silhouette:"vneck-short", graphic:"text", text:"YES.",
      price:34, colors:["rust","cream"], sizes:SIZES_STANDARD,
      desc:"For the days you're sure about something. One word, printed with conviction." },
    { id:"p10", name:"Statement Stripe Long", collection:"Statement", silhouette:"long", graphic:"stripe",
      price:44, colors:["rust","ink"], sizes:SIZES_STANDARD,
      desc:"Long sleeve with a bold chest stripe. Not subtle. Not trying to be." },

    { id:"p11", name:"Drop 001 Slub", collection:"Limited Drop", silhouette:"crew-short", graphic:"stripe",
      price:42, colors:["dust","olive"], sizes:SIZES_LIMITED,
      desc:"Small-batch slub cotton, uneven on purpose. Once these are gone, that's it." },
    { id:"p12", name:"Drop 001 Long", collection:"Limited Drop", silhouette:"long", graphic:"pocket",
      price:46, colors:["ink"], sizes:SIZES_LIMITED,
      desc:"The long-sleeve half of Drop 001. One colour, limited run, no restock promised." }
  ];

  /* ---------------- state ---------------- */
  const state = {
    filter: "all",
    basket: loadBasket(),
    detailProduct: null,
    detailColor: null,
    detailSize: null,
    detailQty: 1,
    shipMethod: "standard"
  };

  function loadBasket(){
    try{
      const raw = localStorage.getItem("hanger_basket");
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveBasket(){
    try{ localStorage.setItem("hanger_basket", JSON.stringify(state.basket)); }catch(e){}
  }

  /* ---------------- svg builders ---------------- */
  function shirtSVG(product, color, size){
    const sil = SILHOUETTES[product.silhouette];
    const fill = COLORS[color] || COLORS.cream;
    const isLight = ["cream","dust"].includes(color);
    const graphicColor = isLight ? "#2c2620" : "#f2ead9";
    const graphicOpacity = 0.85;

    let graphic = "";
    if(product.graphic === "stripe"){
      graphic = `<rect x="44" y="86" width="72" height="13" fill="${graphicColor}" opacity="${graphicOpacity}"/>`;
    } else if(product.graphic === "pocket"){
      graphic = `<rect x="56" y="72" width="26" height="22" rx="2" fill="none" stroke="${graphicColor}" stroke-width="2.2" opacity="${graphicOpacity}"/>`;
    } else if(product.graphic === "text"){
      graphic = `<text x="80" y="108" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="15" fill="${graphicColor}" opacity="${graphicOpacity}">${escapeXML(product.text||"")}</text>`;
    }

    return `<svg class="shirt-svg" viewBox="${sil.viewBox}" xmlns="http://www.w3.org/2000/svg">
      <path d="${sil.body}" fill="${fill}" stroke="#262019" stroke-width="2.6" stroke-linejoin="round"/>
      ${graphic}
    </svg>`;
  }

  function escapeXML(s){
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }

  const HANGER_SVG = `<svg class="hanger-icon" viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 3 C24 3 27 6 27 10 C27 13 24 15 21 15 L34 27 L6 27 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;

  /* ---------------- rendering: the rack ---------------- */
  const rackEl = document.getElementById("rack");

  function visibleProducts(){
    if(state.filter === "all") return PRODUCTS;
    return PRODUCTS.filter(p => p.collection === state.filter);
  }

  function renderRack(){
    const list = visibleProducts();
    rackEl.innerHTML = list.map(p => {
      const color = p.colors[0];
      return `<div class="hanger-item" data-id="${p.id}">
        ${HANGER_SVG}
        <div class="shirt-swing" data-id="${p.id}">${shirtSVG(p, color)}</div>
        <div class="price-tag">
          <span class="tag-hole"></span>
          <span class="tag-name">${p.name}</span>
          <span class="tag-price">$${p.price.toFixed(2)}</span>
        </div>
      </div>`;
    }).join("");
    rackEl.scrollLeft = 0;
    buildTape();
    updateTapeMarker();
  }

  rackEl.addEventListener("click", (e) => {
    if(rackEl.classList.contains("was-dragged")) return;
    const swing = e.target.closest(".shirt-swing");
    if(!swing) return;
    const id = swing.dataset.id;
    const product = PRODUCTS.find(p => p.id === id);
    if(!product) return;
    swing.classList.add("unhooked");
    setTimeout(() => openDetail(product), 320);
  });

  /* ---------------- drag-to-scroll rail ---------------- */
  (function enableDrag(){
    let isDown = false, startX = 0, startScroll = 0, moved = 0;

    rackEl.addEventListener("pointerdown", (e) => {
      isDown = true; moved = 0;
      startX = e.clientX;
      startScroll = rackEl.scrollLeft;
      rackEl.setPointerCapture(e.pointerId);
    });
    rackEl.addEventListener("pointermove", (e) => {
      if(!isDown) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if(moved > 6) rackEl.classList.add("dragging");
      rackEl.scrollLeft = startScroll - dx;
      updateTapeMarker();
    });
    function endDrag(){
      if(!isDown) return;
      isDown = false;
      rackEl.classList.remove("dragging");
      if(moved > 6){
        rackEl.classList.add("was-dragged");
        setTimeout(() => rackEl.classList.remove("was-dragged"), 50);
      }
    }
    rackEl.addEventListener("pointerup", endDrag);
    rackEl.addEventListener("pointerleave", endDrag);
    rackEl.addEventListener("pointercancel", endDrag);
    rackEl.addEventListener("wheel", (e) => {
      if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
        rackEl.scrollLeft += e.deltaY;
        e.preventDefault();
      }
      updateTapeMarker();
    }, { passive:false });
    rackEl.addEventListener("scroll", updateTapeMarker);
  })();

  /* ---------------- tape measure ---------------- */
  const tapeSvg = document.getElementById("tape");
  const tapeMarker = document.getElementById("tape-marker");

  function buildTape(){
    let marks = "";
    for(let i = 0; i <= 100; i++){
      const x = i * 10;
      const tall = i % 5 === 0;
      const h = tall ? 18 : 9;
      marks += `<line x1="${x}" y1="34" x2="${x}" y2="${34-h}" stroke="currentColor" stroke-width="${tall?1.4:1}" opacity="${tall?0.8:0.45}"/>`;
      if(tall && i % 10 === 0 && i>0){
        marks += `<text x="${x}" y="${34-h-3}" font-size="7" fill="currentColor" text-anchor="middle" font-family="Courier New, monospace" opacity="0.6">${i/10}</text>`;
      }
    }
    tapeSvg.innerHTML = marks;
  }

  function updateTapeMarker(){
    const max = rackEl.scrollWidth - rackEl.clientWidth;
    const ratio = max > 0 ? rackEl.scrollLeft / max : 0;
    const wrapWidth = tapeMarker.parentElement.clientWidth;
    tapeMarker.style.left = (ratio * (wrapWidth - 2)) + "px";
  }

  document.querySelector(".tape-wrap").addEventListener("click", (e) => {
    const wrap = e.currentTarget;
    const rect = wrap.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const max = rackEl.scrollWidth - rackEl.clientWidth;
    rackEl.scrollTo({ left: ratio * max, behavior:"smooth" });
  });

  window.addEventListener("resize", updateTapeMarker);

  /* ---------------- filters ---------------- */
  document.getElementById("tag-filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-filter");
    if(!btn) return;
    document.querySelectorAll(".tag-filter").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.filter = btn.dataset.filter;
    renderRack();
  });

  /* ---------------- detail drawer ---------------- */
  const detailScrim = document.getElementById("detail-scrim");
  const detailDrawer = document.getElementById("detail-drawer");
  const detailBody = document.getElementById("detail-body");

  function openDetail(product){
    state.detailProduct = product;
    state.detailColor = product.colors[0];
    state.detailSize = product.sizes[Math.floor(product.sizes.length/2)];
    state.detailQty = 1;
    renderDetail();
    detailScrim.classList.add("is-open");
    detailDrawer.classList.add("is-open");
    detailDrawer.setAttribute("aria-hidden","false");
    renderRack(); // reset any unhook animation state
  }
  function closeDetail(){
    detailScrim.classList.remove("is-open");
    detailDrawer.classList.remove("is-open");
    detailDrawer.setAttribute("aria-hidden","true");
  }
  document.getElementById("detail-close").addEventListener("click", closeDetail);
  detailScrim.addEventListener("click", closeDetail);

  function renderDetail(){
    const p = state.detailProduct;
    if(!p) return;
    detailBody.innerHTML = `
      <div class="detail-stage">${shirtSVG(p, state.detailColor, state.detailSize)}</div>
      <div class="detail-collection">${p.collection}</div>
      <h2>${p.name}</h2>
      <div class="detail-price">$${p.price.toFixed(2)}</div>
      <p class="detail-desc">${p.desc}</p>

      <span class="field-label">Colour — ${state.detailColor}</span>
      <div class="swatches" id="swatches">
        ${p.colors.map(c => `<button class="swatch ${c===state.detailColor?'is-selected':''}" data-color="${c}" style="background:${COLORS[c]}" aria-label="${c}"></button>`).join("")}
      </div>

      <span class="field-label">Size</span>
      <div class="ruler-sizes" id="ruler-sizes">
        ${p.sizes.map(s => `<div class="ruler-size ${s===state.detailSize?'is-selected':''}" data-size="${s}">${s}</div>`).join("")}
      </div>

      <div class="qty-row">
        <span class="field-label" style="margin:0;">Qty</span>
        <div class="qty-stepper" id="qty-stepper">
          <button data-step="-1" aria-label="decrease">–</button>
          <span id="qty-display">${state.detailQty}</span>
          <button data-step="1" aria-label="increase">+</button>
        </div>
      </div>

      <button class="btn-stitched" id="add-basket-btn">Add to basket — take it off the rack</button>
      <div class="added-flash" id="added-flash"></div>
    `;

    detailBody.querySelector("#swatches").addEventListener("click", (e) => {
      const sw = e.target.closest(".swatch");
      if(!sw) return;
      state.detailColor = sw.dataset.color;
      renderDetail();
    });
    detailBody.querySelector("#ruler-sizes").addEventListener("click", (e) => {
      const rs = e.target.closest(".ruler-size");
      if(!rs) return;
      state.detailSize = rs.dataset.size;
      renderDetail();
    });
    detailBody.querySelector("#qty-stepper").addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if(!btn) return;
      const step = parseInt(btn.dataset.step, 10);
      state.detailQty = Math.max(1, Math.min(9, state.detailQty + step));
      detailBody.querySelector("#qty-display").textContent = state.detailQty;
    });
    detailBody.querySelector("#add-basket-btn").addEventListener("click", () => {
      addToBasket(p, state.detailColor, state.detailSize, state.detailQty);
      const flash = detailBody.querySelector("#added-flash");
      flash.textContent = `added ${state.detailQty} × ${p.name} (${state.detailSize}, ${state.detailColor}) to basket`;
      setTimeout(() => { if(flash) flash.textContent = ""; }, 2200);
    });
  }

  /* ---------------- basket ---------------- */
  const basketScrim = document.getElementById("basket-scrim");
  const basketDrawer = document.getElementById("basket-drawer");
  const basketLinesEl = document.getElementById("basket-lines");
  const basketSummaryEl = document.getElementById("basket-summary");
  const basketCountEl = document.getElementById("basket-count");

  function addToBasket(product, color, size, qty){
    const existing = state.basket.find(l => l.id===product.id && l.color===color && l.size===size);
    if(existing){ existing.qty += qty; }
    else{
      state.basket.push({ id: product.id, color, size, qty });
    }
    saveBasket();
    updateBasketCount();
  }
  function removeLine(idx){
    state.basket.splice(idx,1);
    saveBasket();
    renderBasket();
    updateBasketCount();
  }
  function changeQty(idx, delta){
    const line = state.basket[idx];
    if(!line) return;
    line.qty = Math.max(1, Math.min(9, line.qty + delta));
    saveBasket();
    renderBasket();
    updateBasketCount();
  }
  function updateBasketCount(){
    const total = state.basket.reduce((n,l)=>n+l.qty,0);
    basketCountEl.textContent = total;
    basketCountEl.classList.remove("bump");
    void basketCountEl.offsetWidth;
    basketCountEl.classList.add("bump");
  }

  function basketTotals(){
    let subtotal = 0;
    state.basket.forEach(line => {
      const p = PRODUCTS.find(pp => pp.id===line.id);
      if(p) subtotal += p.price * line.qty;
    });
    const shipping = state.basket.length === 0 ? 0 : (state.shipMethod === "express" ? 12 : 5);
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function renderBasket(){
    if(state.basket.length === 0){
      basketLinesEl.innerHTML = `<p class="basket-empty">Your basket is empty. Go pull a shirt off the rack.</p>`;
      basketSummaryEl.innerHTML = "";
      return;
    }
    basketLinesEl.innerHTML = state.basket.map((line, idx) => {
      const p = PRODUCTS.find(pp => pp.id===line.id);
      if(!p) return "";
      return `<div class="basket-line" data-idx="${idx}">
        ${shirtSVG(p, line.color, line.size)}
        <div class="basket-line-info">
          <div class="bl-name">${p.name}</div>
          <div class="bl-meta">${line.color} · size ${line.size}</div>
          <div class="bl-row">
            <div class="bl-qty">
              <button data-act="dec">–</button>
              <span>${line.qty}</span>
              <button data-act="inc">+</button>
            </div>
            <div class="bl-price">$${(p.price*line.qty).toFixed(2)}</div>
          </div>
          <button class="bl-remove" data-act="remove">remove</button>
        </div>
      </div>`;
    }).join("");

    const t = basketTotals();
    basketSummaryEl.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>$${t.subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Shipping (${state.shipMethod})</span><span>$${t.shipping.toFixed(2)}</span></div>
      <div class="summary-row total"><span>Total</span><span>$${t.total.toFixed(2)}</span></div>
      <button class="btn-stitched" id="checkout-btn">Checkout</button>
    `;
    basketSummaryEl.querySelector("#checkout-btn").addEventListener("click", () => {
      closeBasket();
      openCheckout();
    });

    basketLinesEl.addEventListener("click", basketLineHandler);
  }
  function basketLineHandler(e){
    const line = e.target.closest(".basket-line");
    if(!line) return;
    const idx = parseInt(line.dataset.idx, 10);
    const act = e.target.dataset.act;
    if(act === "inc") changeQty(idx, 1);
    else if(act === "dec") changeQty(idx, -1);
    else if(act === "remove") removeLine(idx);
  }

  function openBasket(){
    renderBasket();
    basketScrim.classList.add("is-open");
    basketDrawer.classList.add("is-open");
    basketDrawer.setAttribute("aria-hidden","false");
  }
  function closeBasket(){
    basketScrim.classList.remove("is-open");
    basketDrawer.classList.remove("is-open");
    basketDrawer.setAttribute("aria-hidden","true");
  }
  document.getElementById("btn-basket").addEventListener("click", openBasket);
  document.getElementById("basket-close").addEventListener("click", closeBasket);
  basketScrim.addEventListener("click", closeBasket);

  /* ---------------- checkout ---------------- */
  const checkoutScrim = document.getElementById("checkout-scrim");
  const checkoutDrawer = document.getElementById("checkout-drawer");
  const checkoutBody = document.getElementById("checkout-body");

  function openCheckout(){
    if(state.basket.length === 0){ openBasket(); return; }
    renderCheckoutForm();
    checkoutScrim.classList.add("is-open");
    checkoutDrawer.classList.add("is-open");
    checkoutDrawer.setAttribute("aria-hidden","false");
  }
  function closeCheckout(){
    checkoutScrim.classList.remove("is-open");
    checkoutDrawer.classList.remove("is-open");
    checkoutDrawer.setAttribute("aria-hidden","true");
  }
  document.getElementById("checkout-close").addEventListener("click", closeCheckout);
  checkoutScrim.addEventListener("click", closeCheckout);

  function renderCheckoutForm(){
    const t = basketTotals();
    checkoutBody.innerHTML = `
      <h2 class="checkout-title">Shipping details</h2>
      <p class="checkout-sub">This is a demo shop — no real order is placed and no payment is collected.</p>

      <div class="co-field">
        <label for="co-name">Full name</label>
        <input id="co-name" type="text" autocomplete="name" placeholder="Jordan Rivera">
      </div>
      <div class="co-field">
        <label for="co-email">Email</label>
        <input id="co-email" type="email" autocomplete="email" placeholder="you@example.com">
      </div>
      <div class="co-field">
        <label for="co-address">Address</label>
        <input id="co-address" type="text" autocomplete="street-address" placeholder="221B Baker Street">
      </div>
      <div class="co-row">
        <div class="co-field">
          <label for="co-city">City</label>
          <input id="co-city" type="text" autocomplete="address-level2" placeholder="Springfield">
        </div>
        <div class="co-field">
          <label for="co-zip">ZIP / postal</label>
          <input id="co-zip" type="text" autocomplete="postal-code" placeholder="12345">
        </div>
      </div>

      <span class="field-label">Shipping method</span>
      <div class="ship-options" id="ship-options">
        <div class="ship-opt ${state.shipMethod==='standard'?'is-selected':''}" data-ship="standard">Standard<br>$5 · 5–7 days</div>
        <div class="ship-opt ${state.shipMethod==='express'?'is-selected':''}" data-ship="express">Express<br>$12 · 2 days</div>
      </div>

      <div class="summary-row total" style="margin-top:16px;"><span>Total due (demo)</span><span id="co-total">$${t.total.toFixed(2)}</span></div>
      <p class="co-error" id="co-error"></p>
      <button class="btn-stitched" id="place-order-btn">Place demo order</button>
    `;

    checkoutBody.querySelector("#ship-options").addEventListener("click", (e) => {
      const opt = e.target.closest(".ship-opt");
      if(!opt) return;
      state.shipMethod = opt.dataset.ship;
      renderCheckoutForm();
    });

    checkoutBody.querySelector("#place-order-btn").addEventListener("click", () => {
      const name = checkoutBody.querySelector("#co-name").value.trim();
      const email = checkoutBody.querySelector("#co-email").value.trim();
      const address = checkoutBody.querySelector("#co-address").value.trim();
      const city = checkoutBody.querySelector("#co-city").value.trim();
      const zip = checkoutBody.querySelector("#co-zip").value.trim();
      const errEl = checkoutBody.querySelector("#co-error");

      if(!name || !email || !address || !city || !zip){
        errEl.textContent = "Please fill in every field — even demo shirts need somewhere to (not) go.";
        return;
      }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        errEl.textContent = "That email doesn't look quite right.";
        return;
      }
      errEl.textContent = "";
      runPackingAnimation({ name, email, address, city, zip });
    });
  }

  function runPackingAnimation(customer){
    checkoutBody.innerHTML = `
      <div class="pack-anim">
        <div class="pack-box">
          <svg viewBox="0 0 90 70" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="14" width="82" height="52" fill="#e6dab8" stroke="#262019" stroke-width="2.4"/>
            <path d="M4 14 L45 2 L86 14" fill="none" stroke="#262019" stroke-width="2.4" stroke-linejoin="round"/>
            <path d="M45 2 L45 66" stroke="#262019" stroke-width="1.4" opacity=".4"/>
          </svg>
          <div class="tape-strip"></div>
        </div>
        <p class="pack-label">packing your (demo) order…</p>
      </div>
    `;
    setTimeout(() => finalizeOrder(customer), 1150);
  }

  function finalizeOrder(customer){
    const t = basketTotals();
    const orderId = "HC-" + Math.random().toString(36).slice(2,8).toUpperCase();
    const eta = new Date(Date.now() + (state.shipMethod==="express" ? 2 : 6) * 86400000);
    const etaStr = eta.toLocaleDateString(undefined, { month:"short", day:"numeric" });

    const receiptLines = state.basket.map(line => {
      const p = PRODUCTS.find(pp => pp.id===line.id);
      return p ? `<div><span>${line.qty}× ${p.name} (${line.color}/${line.size})</span><span>$${(p.price*line.qty).toFixed(2)}</span></div>` : "";
    }).join("");

    try{
      const orders = JSON.parse(localStorage.getItem("hanger_orders") || "[]");
      orders.push({ orderId, customer, total: t.total, date: new Date().toISOString() });
      localStorage.setItem("hanger_orders", JSON.stringify(orders));
    }catch(e){}

    checkoutBody.innerHTML = `
      <div class="confirm-body">
        <div class="confirm-stamp">ORDER PACKED</div>
        <div class="confirm-order">Order <strong>${orderId}</strong></div>
        <div class="confirm-eta">Estimated (demo) arrival: ${etaStr}, to ${customer.city}</div>
        <div class="receipt">
          ${receiptLines}
          <div><span>Shipping (${state.shipMethod})</span><span>$${t.shipping.toFixed(2)}</span></div>
          <div style="font-weight:bold; border-top:1px dashed #4a4038; margin-top:6px; padding-top:6px;"><span>Total</span><span>$${t.total.toFixed(2)}</span></div>
        </div>
        <button class="btn-stitched secondary" id="continue-shopping-btn">Continue shopping</button>
      </div>
    `;

    state.basket = [];
    saveBasket();
    updateBasketCount();

    checkoutBody.querySelector("#continue-shopping-btn").addEventListener("click", closeCheckout);
  }

  /* ---------------- init ---------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  renderRack();
  updateBasketCount();

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){ closeDetail(); closeBasket(); closeCheckout(); }
  });
})();
