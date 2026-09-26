const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  "black-blade": "SORYNX BLACK BLADE TEE",
  "dark-angel-white": "SORYNX DARK ANGEL WHITE TEE",
  "black-dragon": "SORYNX BLACK DRAGON TEE"
};

function clean(value, max=300) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0,max);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({message:"Método no permitido."});
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({message:"Stripe no está configurado todavía en Vercel."});
  }

  const body=req.body || {};
  const productKey=clean(body.product,80);
  const productName=PRODUCTS[productKey];
  const size=clean(body.size,10);
  const email=clean(body.email,200);

  if (!productName || !["S","M","L","XL"].includes(size) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({message:"Datos de pedido no válidos."});
  }

  const orderId="SRYNX-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();
  const origin=req.headers.origin || "https://sorynx.vercel.app";

  try {
    const session=await stripe.checkout.sessions.create({
      mode:"payment",
      customer_email:email,
      billing_address_collection:"auto",
      line_items:[{
        price_data:{
          currency:"eur",
          product_data:{name:productName},
          unit_amount:1000
        },
        quantity:1
      }],
      discounts:[{coupon:"SORYNX_TEST_100_OFF"}],
      metadata:{
        order_id:orderId, product:productName, product_key:productKey, size,
        full_name:clean(body.fullName), address:clean(body.address),
        city:clean(body.city), postal_code:clean(body.postalCode), country:clean(body.country)
      },
      success_url:origin+"/checkout/?stripe_success=1&session_id={CHECKOUT_SESSION_ID}",
      cancel_url:origin+"/checkout/?stripe_cancelled=1"
    });
    return res.status(200).json({url:session.url,orderId});
  } catch (err) {
    console.error("Stripe Checkout error:",err);
    return res.status(500).json({message:"No se pudo crear el Checkout de Stripe."});
  }
};
