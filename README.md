# SORYNX — Sitio web oficial

Web preparada para ser la futura tienda online de **SORYNX**. Diseño en negro y blanco, estética premium / streetwear, con la estructura lista para añadir productos reales cuando estén disponibles.

## Estructura del proyecto

```
sorynx-website/
├── index.html          → Toda la estructura y el contenido de la página
├── css/
│   └── style.css       → Estilos, colores, tipografía y animaciones
├── js/
│   └── main.js         → Menú móvil, scroll, animaciones y cursor
├── assets/             → Aquí van las fotos de producto cuando existan
└── README.md
```

No hay dependencias ni build: es HTML/CSS/JS puro. Se abre directamente o se sube tal cual a cualquier hosting estático.

## Cómo subirlo a GitHub

1. Descomprime el zip.
2. Crea un repositorio nuevo en GitHub (por ejemplo `sorynx-website`).
3. Dentro de la carpeta descomprimida:
   ```bash
   git init
   git add .
   git commit -m "Primera versión del sitio SORYNX"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/sorynx-website.git
   git push -u origin main
   ```
4. Para publicarlo gratis con **GitHub Pages**:
   - Ve a `Settings → Pages` en el repositorio.
   - En "Source" elige la rama `main` y la carpeta `/ (root)`.
   - Guarda. En un par de minutos la web estará en
     `https://TU-USUARIO.github.io/sorynx-website/`.

## Cómo añadir un producto real

Abre `index.html` y busca la sección `<!-- ============ TIENDA / PRODUCTOS ============ -->`. Cada producto es un bloque:

```html
<article class="product-card">
  <div class="product-index">01 / 05</div>
  <div class="product-media">
    <div class="placeholder-mark">S</div>
  </div>
  <div class="product-info">
    <h3 class="product-name">Próximamente</h3>
    <p class="product-price">— — —</p>
    <button class="product-btn" disabled>Aún no disponible</button>
  </div>
</article>
```

Para activarlo:

1. Sustituye `<div class="placeholder-mark">S</div>` por una imagen real:
   ```html
   <img src="assets/nombre-del-producto.jpg" alt="Nombre del producto">
   ```
2. Cambia `Próximamente` por el nombre real de la prenda.
3. Cambia `— — —` por el precio, por ejemplo `49,90 €`.
4. Quita el atributo `disabled` del botón y cambia el texto a `Comprar` (o conéctalo a tu pasarela de pago / plataforma de e-commerce).

Puedes duplicar el bloque `<article class="product-card">` completo para añadir un sexto, séptimo, etc. producto: la cuadrícula se reorganiza sola, no hace falta tocar el CSS.

## Personalización rápida

- **Colores:** todos los colores están centralizados como variables al principio de `css/style.css` (bloque `:root`). Cambiar `--black` o `--off-white` actualiza toda la web.
- **Textos:** el eslogan, la sección "Sobre SORYNX" y los textos del footer están directamente en `index.html`, en español y listos para editar.
- **Redes sociales:** en el `<footer>`, sustituye los `href="#"` de Instagram / TikTok / X por tus enlaces reales.
- **Email de contacto:** cambia `contacto@sorynx.com` en el footer por el correo real de la marca.

## Notas técnicas

- Tipografías: `Unbounded` (logo y titulares) e `Inter` (texto), cargadas desde Google Fonts.
- Sin frameworks ni librerías externas de JavaScript.
- Menú hamburguesa, scroll suave y animaciones de aparición funcionan sin dependencias.
- Se respeta `prefers-reduced-motion` para usuarios que desactivan animaciones en su sistema.
