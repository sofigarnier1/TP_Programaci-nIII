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

/* Toast (fallback si no hay SweetAlert) */
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

/* Popup estilo Sabina (usa SweetAlert2 si está disponible) */
function avisarAgregado(nombre) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¡Producto agregado!",
      text: `"${nombre}" se agregó al carrito 💚`,
      icon: "success",
      timer: 1800,
      showConfirmButton: false,
      confirmButtonColor: "#70e686",
      background: "#fff",
      color: "#000",
      customClass: { popup: "sabina-success" }
    });
  } else {
    // Fallback al toast casero
    mostrarMensaje(`"${nombre}" agregado al carrito 💚`);
  }
}

/* Lee carrito */
function readCart() {
  try {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
  } catch {
    return [];
  }
}

/* Actualiza productos guardados */
function writeProductos(list) {
  localStorage.setItem("productos", JSON.stringify(list));
}

/* Productos: usa lo guardado o data.js */
let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;

function renderDetalle() {
  const id = getIdFromURL();
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  const prod = productos.find(p => String(p.id) === String(id));
  if (!prod) {
    cont.innerHTML = `<p style="text-align:center">Producto no encontrado.</p>`;
    return;
  }

  // Calcular stock disponible considerando el carrito
  const carrito = readCart();
  const enCarrito = carrito.find(i => String(i.id) === String(prod.id));
  let disponible = Math.max(0, Number(prod.stock || 0) - (Number(enCarrito?.cantidad || 0)));

  const materialTxt = prod.material ?? prod.descripcion ?? "—";

  cont.innerHTML = `
    <article class="detalle-card">
      <h1>${prod.nombre}</h1>

      <img class="detalle-img" src="${resolveImg(prod.img)}" alt="${prod.nombre}">

      <div class="detalle-info">
        <p><strong>Precio:</strong> $ ${Number(prod.precio || 0).toLocaleString("es-AR")}</p>
        <p><strong>Material:</strong> ${materialTxt}</p>
        <p><strong>Categoría:</strong> ${prod.categoria ?? "—"}</p>
        <p><strong>Stock:</strong> <span id="stockDisp">${disponible}</span></p>
      </div>

      <div class="detalle-actions">
        <button id="btnAgregarDetalle" class="btn btn-primary">Agregar al carrito</button>
        <a href="productos.html" class="btn btn-sec no-underline">Volver al catálogo</a>
      </div>
    </article>
  `;

  const btn = document.getElementById("btnAgregarDetalle");
  const stockEl = document.getElementById("stockDisp");

  // Actualiza stock visible y botón
  function updateStockUI() {
    stockEl.textContent = disponible;
    btn.disabled = disponible <= 0;
    btn.textContent = disponible > 0 ? "Agregar al carrito" : "Sin stock";
  }
  updateStockUI();

  // Acción al hacer clic
  if (btn) {
    btn.addEventListener("click", () => {
      if (disponible <= 0) return;

      agregarAlCarrito({
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio || 0),
        img: prod.img
      });

      // Restar stock visual y persistir
      disponible = Math.max(0, disponible - 1);
      prod.stock = disponible;
      const idx = productos.findIndex(p => String(p.id) === String(prod.id));
      if (idx >= 0) productos[idx].stock = disponible;
      writeProductos(productos);

      updateStockUI();

      avisarAgregado(prod.nombre);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initCarrito?.();
  renderDetalle();
});

