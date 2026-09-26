(() => {
  "use strict";

  /* ============ ESTADO ============ */
  const state = {
    size: null,
    product: new URLSearchParams(window.location.search).get("product") || "black-blade",
  };

  const PRODUCT_NAMES = {
    "black-blade": "SORYNX BLACK BLADE TEE",
    "dark-angel-white": "SORYNX DARK ANGEL WHITE TEE",
    "black-dragon": "SORYNX BLACK DRAGON TEE",
  };
  state.productName = PRODUCT_NAMES[state.product] || PRODUCT_NAMES["black-blade"];
  const confirmProduct = document.querySelector(".confirm-row dd");
  if (confirmProduct) confirmProduct.textContent = state.productName;

  /* ============ SELECCIÓN DE TALLA ============ */
  const sizeButtons = document.querySelectorAll(".size-btn");
  const sizeError = document.getElementById("sizeError");
  const continueBtn = document.getElementById("continueBtn");

  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach((b) => {
        b.classList.remove("is-selected");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-checked", "true");
      state.size = btn.dataset.size;
      sizeError.hidden = true;
      continueBtn.disabled = false;
    });
  });

  /* ============ CONTINUAR DIRECTAMENTE A STRIPE ============ */
  continueBtn.addEventListener("click", async () => {
    if (!state.size) {
      sizeError.hidden = false;
      return;
    }

    continueBtn.disabled = true;
    continueBtn.classList.add("is-loading");
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          product: state.product,
          size: state.size
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        throw new Error(data.message || "No se pudo iniciar Stripe Checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      continueBtn.disabled = false;
      continueBtn.classList.remove("is-loading");
      window.alert(err.message);
    }
  });

  /* ============ REINICIAR ============ */
  document.getElementById("restartBtn")?.addEventListener("click", () => {
    state.size = null;
    sizeButtons.forEach((b) => {
      b.classList.remove("is-selected");
      b.setAttribute("aria-checked", "false");
    });
    continueBtn.disabled = true;
    continueBtn.classList.remove("is-loading");
    window.scrollTo({top:0,behavior:"smooth"});
  });

})();
