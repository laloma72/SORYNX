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
  const allowedSizes=["S","M","L","XL"];
  const items=Array.isArray(body.items) ? body.items : [{
    product:body.product,
    size:body.size,
    quantity:1
  }];

  const normalized=items.map(item=>({
    productKey:clean(item.product,80),
    size:clean(item.size,10),
    quantity:Math.min(10,Math.max(1,Number(item.quantity)||1))
  }));

  if (!normalized.length || normalized.some(item=>!PRODUCTS[item.productKey] || !allowedSizes.includes(item.size))) {
    return res.status(400).json({message:"Producto, talla o cantidad no válidos."});
  }

  const orderId="SRYNX-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,7).toUpperCase();
  const origin=req.headers.origin || "https://sorynx.vercel.app";

  try {
    const session=await stripe.checkout.sessions.create({
      mode:"payment",
      billing_address_collection:"auto",
      shipping_address_collection:{allowed_countries:["ES"]},
      line_items:normalized.map(item=>({
        price_data:{
          currency:"eur",
          product_data:{name:PRODUCTS[item.productKey]+" · Talla "+item.size},
          unit_amount:1000
        },
        quantity:item.quantity
      })),
      metadata:{
        order_id:orderId,
        cart:JSON.stringify(normalized).slice(0,450)
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
