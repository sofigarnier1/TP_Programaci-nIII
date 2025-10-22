import { productos as datosProductos } from "./data.js";
import { agregarAlCarrito, initCarrito } from "./carrito.js";

/* Normaliza ruta de imagen para /pages/ */
function resolveImg(src = "") {
  if (src.startsWith("../")) return src;
  return "../" + src.replace(/^\.?\//, "");
}

/* Obtiene ?id=... */
function getIdFromURL() {
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

/* Toast */
function mostrarMensaje(texto = "Producto agregado con éxito 💚") {
  let aviso = document.getElementById("mensaje-exito");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "mensaje-exito";
    document.body.appendChild(aviso);
  }
  aviso.textContent = texto;
  aviso.classList.add("visible");
  setTimeout(() => aviso.classList.remove("visible"), 2500);
}

/* Productos: usa lo guardado o data.js */
const productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;

function renderDetalle() {
  const id = getIdFromURL();
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  const prod = productos.find(p => String(p.id) === String(id));
  if (!prod) {
    cont.innerHTML = `<p style="text-align:center">Producto no encontrado.</p>`;
    return;
  }

  // 👇 acá mapeamos "descripcion" como "Material" si no existe "material"
  const materialTxt = prod.material ?? prod.descripcion ?? "—";

  cont.innerHTML = `
    <article class="detalle-card">
      <h1>${prod.nombre}</h1>

      <img class="detalle-img" src="${resolveImg(prod.img)}" alt="${prod.nombre}">

      <div class="detalle-info">
        <p><strong>Precio:</strong> $ ${Number(prod.precio || 0).toLocaleString("es-AR")}</p>
        <p><strong>Material:</strong> ${materialTxt}</p>
        <p><strong>Categoría:</strong> ${prod.categoria ?? "—"}</p>
        <p><strong>Stock:</strong> ${typeof prod.stock !== "undefined" ? prod.stock : "—"}</p>
      </div>

      <div class="detalle-actions">
        <button id="btnAgregarDetalle" class="btn-solid">Agregar al carrito</button>
        <a href="productos.html" class="btn-ghost">Volver al catálogo</a>
      </div>
    </article>
  `;

  const btn = document.getElementById("btnAgregarDetalle");
  if (btn) {
    btn.addEventListener("click", () => {
      agregarAlCarrito({
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio || 0),
        img: prod.img
      });
      mostrarMensaje("Producto agregado con éxito 💚");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initCarrito?.();
  renderDetalle();
});
