const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req,res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow","POST");
    return res.status(405).send("Method Not Allowed");
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send("Webhook secret not configured");

  let event;
  try {
    event=stripe.webhooks.constructEvent(req.body,req.headers["stripe-signature"],process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature error:",err.message);
    return res.status(400).send("Invalid signature");
  }

  if (event.type === "checkout.session.completed") {
    const session=event.data.object;
    if (session.payment_status === "paid") {
      try { await sendOrderEmail(session); }
      catch (err) { console.error("Paid order email error:",err); return res.status(500).send("Email delivery failed"); }
    }
  }
  return res.status(200).json({received:true});
};

async function sendOrderEmail(session) {
  const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS,ADMIN_EMAIL}=process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) throw new Error("Faltan variables SMTP.");
  const m=session.metadata || {};
  const amount=((session.amount_total || 0)/100).toFixed(2)+" €";
  const shipping=session.customer_details?.address || {};
  const text=`📦 NUEVO PEDIDO PAGADO — SORYNX

Pedido: ${m.order_id || session.id}
Estado: PAGADO
Importe: ${amount}
Fecha: ${new Date().toLocaleString("es-ES",{timeZone:"Europe/Madrid"})}

PRODUCTO
${m.product || "SORYNX"}
Talla: ${m.size || "-"}

CLIENTE
Nombre: ${m.full_name || session.customer_details?.name || "-"}
Email: ${session.customer_details?.email || session.customer_email || "-"}

ENVÍO
Dirección: ${m.address || shipping.line1 || ""}
Ciudad: ${m.city || shipping.city || ""}
Código postal: ${m.postal_code || shipping.postal_code || ""}
País: ${m.country || shipping.country || ""}

Stripe Checkout Session: ${session.id}
`;
  const transporter=nodemailer.createTransport({
    host:SMTP_HOST,port:Number(SMTP_PORT)||465,secure:Number(SMTP_PORT)!==587,
    auth:{user:SMTP_USER,pass:SMTP_PASS}
  });
  await transporter.sendMail({
    from:`"SORYNX — Pedidos" <${SMTP_USER}>`,
    to:ADMIN_EMAIL,replyTo:session.customer_details?.email || undefined,
    subject:`📦 Pedido pagado SORYNX — ${m.order_id || session.id}`,text
  });
}
