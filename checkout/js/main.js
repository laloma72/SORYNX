(() => {
  "use strict";

  /* ============ ESTADO ============ */
  const state = {
    size: null,
  };

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

  /* ============ CAMBIO DE VISTA DE IMAGEN ============ */
  const mediaBtns = document.querySelectorAll(".media-switch-btn");
  const imgFront = document.getElementById("productImgFront");
  const imgBack = document.getElementById("productImgBack");

  mediaBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mediaBtns.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const view = btn.dataset.view;
      imgFront.classList.toggle("is-hidden", view !== "front");
      imgBack.classList.toggle("is-hidden", view !== "back");
    });
  });

  /* ============ CONTINUAR AL FORMULARIO ============ */
  const orderPanel = document.getElementById("orderPanel");
  const progressNav = document.getElementById("progressNav");
  const progressSteps = progressNav.querySelectorAll(".progress-step");

  function setProgress(stepNumber) {
    progressSteps.forEach((step) => {
      const n = Number(step.dataset.step);
      step.classList.toggle("is-active", n === stepNumber);
      step.classList.toggle("is-done", n < stepNumber);
    });
  }

  continueBtn.addEventListener("click", () => {
    if (!state.size) {
      sizeError.hidden = false;
      return;
    }
    orderPanel.classList.remove("is-hidden");
    setProgress(2);
    orderPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("fullName").focus();
  });

  /* ============ VALIDACIÓN DEL FORMULARIO ============ */
  const form = document.getElementById("orderForm");
  const submitBtn = document.getElementById("submitBtn");
  const generalError = document.getElementById("formGeneralError");
  const confirmPanel = document.getElementById("confirmPanel");

  const requiredFields = [
    { id: "fullName", message: "Introduce tu nombre completo." },
    { id: "email", message: "Introduce un email válido." },
    { id: "address", message: "Introduce tu dirección." },
    { id: "city", message: "Introduce tu ciudad." },
    { id: "postalCode", message: "Introduce tu código postal." },
    { id: "country", message: "Introduce tu país." },
  ];

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clearFieldErrors() {
    document.querySelectorAll(".field-error[data-error-for]").forEach((el) => {
      el.hidden = true;
      el.textContent = "";
    });
    document.querySelectorAll(".form-field input").forEach((input) => {
      input.classList.remove("has-error");
    });
    generalError.hidden = true;
  }

  function showFieldError(id, message) {
    const input = document.getElementById(id);
    const errorEl = document.querySelector(`[data-error-for="${id}"]`);
    input.classList.add("has-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function validateForm() {
    clearFieldErrors();
    let firstInvalid = null;
    let valid = true;

    if (!state.size) {
      valid = false;
    }

    requiredFields.forEach(({ id, message }) => {
      const input = document.getElementById(id);
      const value = input.value.trim();
      let fieldValid = value.length > 0;

      if (fieldValid && id === "email") {
        fieldValid = isValidEmail(value);
      }

      if (!fieldValid) {
        valid = false;
        showFieldError(id, message);
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!valid) {
      generalError.hidden = false;
      generalError.textContent = !state.size
        ? "Falta seleccionar una talla. Vuelve arriba y elige S, M, L o XL."
        : "Completa todos los campos obligatorios marcados para continuar.";
      if (firstInvalid) firstInvalid.focus();
    }

    return valid;
  }

  /* ============ GENERAR ID DE PEDIDO (fallback local) ============ */
  function generateOrderId() {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `SRYNX-${stamp}-${rand}`;
  }

  /* ============ ENVÍO ============ */
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setProgress(3);
    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");

    const payload = {
      product: "SORYNX DARK ANGEL TEE",
      price: "0,00 €",
      size: state.size,
      quantity: 1,
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      postalCode: document.getElementById("postalCode").value.trim(),
      country: document.getElementById("country").value.trim(),
      // El código de prueba se usa solo para simular la validación de pago
      // en el cliente. Nunca se incluye en el payload enviado al servidor.
    };

    let result = null;

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || "No se pudo registrar el pedido de prueba.");
      }

      result = await response.json();
    } catch (err) {
      // Si el backend no está desplegado todavía (por ejemplo, probando
      // solo el front-end en local), seguimos mostrando la confirmación
      // de prueba con un ID generado en el cliente, y avisamos en consola.
      console.warn("No se pudo contactar con /api/order:", err.message);
      result = { orderId: generateOrderId(), emailSent: false };
    }

    // Pequeña pausa para que la animación de carga se perciba
    await new Promise((resolve) => setTimeout(resolve, 500));

    submitBtn.classList.remove("is-loading");
    document.getElementById("confirmSize").textContent = state.size;
    document.getElementById("confirmOrderId").textContent = result.orderId || generateOrderId();

    orderPanel.classList.add("is-hidden");
    confirmPanel.classList.remove("is-hidden");
    confirmPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ============ REINICIAR ============ */
  document.getElementById("restartBtn").addEventListener("click", () => {
    form.reset();
    clearFieldErrors();
    state.size = null;
    sizeButtons.forEach((b) => {
      b.classList.remove("is-selected");
      b.setAttribute("aria-checked", "false");
    });
    continueBtn.disabled = true;
    confirmPanel.classList.add("is-hidden");
    orderPanel.classList.add("is-hidden");
    setProgress(1);
    submitBtn.disabled = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
