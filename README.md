# SORYNX — Checkout de prueba

Simulación de compra de la **SORYNX DARK ANGEL TEE** (precio 0,00 €) para
probar el flujo completo antes de integrar un cobro real (Stripe u otro).
No hay ningún sistema de pago real conectado.

## Estructura

```
sorynx-test-checkout/
├── public/
│   ├── index.html        ← página del checkout de prueba
│   ├── css/style.css
│   ├── js/main.js
│   └── img/
│       ├── tee_flat_front.jpg   ← imagen del producto (frontal)
│       └── tee_flat_back.jpg    ← imagen del producto (trasera)
├── api/
│   └── order.js           ← función serverless (recibe el pedido y envía el email)
├── package.json
├── vercel.json
└── .env.example
```

## 1. Dónde poner tu imagen de la camiseta

Ya incluí las fotos recortadas de tu mockup en `public/img/`
(`tee_flat_front.jpg` y `tee_flat_back.jpg`). Si más adelante quieres
sustituirlas por fotos definitivas del producto, guarda los nuevos
archivos con esos mismos nombres en `public/img/`, o cambia las rutas
`src="img/..."` en `public/index.html`.

## 2. Dónde poner el email que recibe los pedidos

En la variable de entorno `ADMIN_EMAIL` (ver paso 4). Ahora mismo está
puesta a modo de ejemplo con `ssorynx@gmail.com` en `.env.example` — es
el email que ya aparece como contacto en tu web actual, cámbialo si
quieres recibir los pedidos en otra dirección.

## 3. Instalar dependencias

```bash
npm install
```

## 4. Configurar las variables de entorno (envío de email)

Copia `.env.example` como `.env` para probar en local, **y además**
añade las mismas claves en Vercel:

`Project Settings → Environment Variables`

| Variable     | Qué es                                                                 |
|--------------|-------------------------------------------------------------------------|
| `SMTP_HOST`  | Servidor SMTP (con Gmail: `smtp.gmail.com`)                            |
| `SMTP_PORT`  | Puerto SMTP (465 con SSL, o 587)                                        |
| `SMTP_USER`  | Cuenta de email que envía la notificación                              |
| `SMTP_PASS`  | Contraseña de aplicación (**no** tu contraseña normal de Gmail)         |
| `ADMIN_EMAIL`| Email donde quieres recibir los pedidos de prueba                      |

Para Gmail necesitas una "contraseña de aplicación": actívala en
https://myaccount.google.com/apppasswords (requiere verificación en dos
pasos activada en la cuenta). Nunca escribas esta contraseña directamente
en el código ni en el HTML — solo va en las variables de entorno.

## 5. Probar en local

```bash
npx vercel dev
```

Abre `http://localhost:3000`.

## 6. Desplegar en Vercel

```bash
npx vercel --prod
```

(o conecta el repositorio desde el panel de Vercel). Recuerda añadir las
variables de entorno del paso 4 antes del primer despliegue, si no el
formulario funcionará pero el email no se enviará (verás el aviso en los
logs de la función `api/order`).

## Flujo completo

1. El usuario elige una talla (S / M / L / XL) → se habilita "Continuar".
2. Rellena el formulario de envío (nombre, email, dirección, ciudad,
   código postal, país) — todos obligatorios.
3. Ve la sección "🧪 Pago de prueba" con el campo "Código de prueba"
   (acepta cualquier texto, no se guarda ni se envía a ningún sitio).
4. Pulsa "Realizar pedido de prueba":
   - Si falta algún dato o la talla, se marcan los campos y se explica
     qué falta.
   - Si todo es correcto, el formulario se envía a `/api/order`.
5. `api/order.js` valida los datos otra vez en el servidor, genera un
   número de pedido único y envía el email a `ADMIN_EMAIL` con todos los
   datos del pedido (sin el código de prueba).
6. El usuario ve la pantalla de confirmación con el número de pedido y
   el estado "PEDIDO DE PRUEBA — NO PAGADO".

## Seguridad ya aplicada

- No hay contraseñas ni claves en el HTML/JS del navegador — todo pasa
  por variables de entorno del servidor.
- No se piden número de tarjeta, CVV ni caducidad en ningún momento.
- El "Código de prueba" solo vive en el navegador: nunca se manda al
  backend ni aparece en el email.
- Los datos se validan tanto en el navegador como en el servidor
  (`api/order.js`), y se sanean antes de insertarlos en el email.
- La página lleva `<meta name="robots" content="noindex, nofollow">`
  para que no se indexe mientras es un entorno de prueba.

## Conectar Stripe más adelante

Cuando quieras cobrar de verdad, el sitio donde se integraría Stripe es
el bloque "🧪 Pago de prueba" en `public/index.html` (sustituyéndolo por
Stripe Elements/Checkout) y el punto en `api/order.js` donde hoy se
genera `orderId` — ahí es donde crearías el `PaymentIntent` o la sesión
de Stripe Checkout antes de confirmar el pedido.
