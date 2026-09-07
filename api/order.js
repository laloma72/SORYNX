// api/order.js
// Vercel Serverless Function — recibe el pedido de prueba y envía
// un email de notificación al administrador de SORYNX.
//
// Ningún dato de pago real se procesa aquí. El campo "Código de prueba"
// del formulario NUNCA se envía a este endpoint ni se incluye en el email.

const nodemailer = require("nodemailer");

const REQUIRED_FIELDS = [
  "fullName",
  "email",
  "address",
  "city",
  "postalCode",
  "country",
  "size",
];

const VALID_SIZES = ["S", "M", "L", "XL"];

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitize(value) {
  // Elimina etiquetas HTML básicas para evitar inyección en el email.
  return String(value).replace(/[<>]/g, "").trim().slice(0, 300);
}

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SRYNX-${stamp}-${rand}`;
}

function validatePayload(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return ["El cuerpo de la petición no es válido."];
  }

  REQUIRED_FIELDS.forEach((field) => {
    if (!body[field] || String(body[field]).trim().length === 0) {
      errors.push(`El campo "${field}" es obligatorio.`);
    }
  });

  if (body.email && !isValidEmail(body.email)) {
    errors.push("El email no tiene un formato válido.");
  }

  if (body.size && !VALID_SIZES.includes(body.size)) {
    errors.push("La talla seleccionada no es válida.");
  }

  return errors;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Método no permitido." });
  }

  const body = req.body || {};
  const errors = validatePayload(body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(" ") });
  }

  const orderId = generateOrderId();
  const now = new Date();
  const fecha = now.toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

  const order = {
    product: "SORYNX DARK ANGEL TEE",
    price: "0,00 €",
    size: sanitize(body.size),
    quantity: 1,
    fullName: sanitize(body.fullName),
    email: sanitize(body.email),
    address: sanitize(body.address),
    city: sanitize(body.city),
    postalCode: sanitize(body.postalCode),
    country: sanitize(body.country),
    orderId,
    fecha,
  };

  let emailSent = false;
  let emailError = null;

  try {
    await sendOrderEmail(order);
    emailSent = true;
  } catch (err) {
    emailError = err.message;
    // No bloqueamos la confirmación del pedido de prueba si falla el email,
    // pero lo registramos en los logs de Vercel para poder diagnosticarlo.
    console.error("Error enviando email de pedido de prueba:", err);
  }

  return res.status(200).json({
    orderId,
    emailSent,
    emailError: emailSent ? undefined : emailError,
  });
};

async function sendOrderEmail(order) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    ADMIN_EMAIL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    throw new Error(
      "Faltan variables de entorno de email (SMTP_HOST, SMTP_USER, SMTP_PASS, ADMIN_EMAIL)."
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: Number(SMTP_PORT) !== 587, // true para 465, false para 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const text = `📦 NUEVO PEDIDO DE PRUEBA — SORYNX

INFORMACIÓN DEL PRODUCTO

Producto: ${order.product}
Precio: ${order.price}
Talla: ${order.size}
Cantidad: ${order.quantity}

---

INFORMACIÓN DEL CLIENTE

Nombre: ${order.fullName}
Email: ${order.email}

Dirección: ${order.address}
Ciudad: ${order.city}
Código postal: ${order.postalCode}
País: ${order.country}

---

INFORMACIÓN DEL PEDIDO

Estado: 🧪 PEDIDO DE PRUEBA — NO PAGADO
Fecha: ${order.fecha}
Número de pedido: ${order.orderId}
`;

  await transporter.sendMail({
    from: `"SORYNX — Pedidos de prueba" <${SMTP_USER}>`,
    to: ADMIN_EMAIL,
    replyTo: order.email,
    subject: `🧪 Nuevo pedido de prueba SORYNX — ${order.orderId}`,
    text,
  });
}
