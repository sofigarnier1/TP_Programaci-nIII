import { agregarAlCarrito, initCarrito } from "./carrito.js";
import { productos as datosProductos } from "./data.js";

/* =========================
   Utilidades
   ========================= */

function resolveImg(src = "") {
  // Si ya viene con ../assets/... la dejo
  if (src.includes("../assets/")) return src;
  // Si viene con assets/... la adapto para /pages/
  if (src.includes("assets/")) {
    return "../" + src.replace(/^\.?\//, "");
  }
  // Si viene solo "aros.jpeg" o similar
  return "../assets/img/" + src
    .replace(/^\/+/, "")
    .replace(/^(\.\.\/)+/, "");
}

function getIdFromURL() {
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

/* Toast fallback si no hay SweetAlert */
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
      customClass: { popup: "sabina-success" },
    });
  } else {
    // Fallback al toast casero
    mostrarMensaje(`"${nombre}" agregado al carrito 💚`);
  }
}

/* Lee carrito (por si lo necesitamos en el futuro) */
function readCart() {
  try {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
  } catch {
    return [];
  }
}

/* Lee productos: usa LS si está bien, si no cae a data.js */
function readProductos() {
  try {
    const guardados = JSON.parse(localStorage.getItem("productos") || "null");
    if (Array.isArray(guardados) && guardados.length) return guardados;
  } catch {
    // ignoramos error y usamos data.js
  }
  return datosProductos;
}

/* =========================
   Render del detalle
   ========================= */

function renderDetalle() {
  const id = getIdFromURL();
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  let productos = readProductos();
  const prod = productos.find((p) => String(p.id) === String(id));

  if (!prod) {
    cont.innerHTML = `<p style="text-align:center">Producto no encontrado.</p>`;
    return;
  }

  // El stock "visible" ya debería estar sincronizado por carrito.js (stockBase - carrito)
  let disponible = Math.max(0, Number(prod.stock ?? 0));
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

  // Actualiza el stock visible y el estado del botón
  function updateStockUI() {
    stockEl.textContent = disponible;
    btn.disabled = disponible <= 0;
    btn.textContent = disponible > 0 ? "Agregar al carrito" : "Sin stock";
  }
  updateStockUI();

  // Acción al hacer clic en "Agregar al carrito"
  if (btn) {
    btn.addEventListener("click", () => {
      if (disponible <= 0) return;

      // Delega la lógica de carrito y stock a carrito.js
      agregarAlCarrito({
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio || 0),
        img: prod.img,
      });

      // Volvemos a leer productos desde LS para reflejar el nuevo stock
      productos = readProductos();
      const actualizado = productos.find((p) => String(p.id) === String(id));
      disponible = Math.max(0, Number(actualizado?.stock ?? 0));
      updateStockUI();

      avisarAgregado(prod.nombre);
    });
  }

  // Si cambia el carrito/productos en otra pestaña, actualizamos stock visible
  window.addEventListener("storage", (e) => {
    if (e.key === "productos" || e.key === "carrito") {
      const prodsActuales = readProductos();
      const actualizado = prodsActuales.find((p) => String(p.id) === String(id));
      disponible = Math.max(0, Number(actualizado?.stock ?? 0));
      updateStockUI();
    }
  });
}

/* =========================
   Boot
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  // Actualiza badge del nav y sincroniza stock según carrito actual
  if (typeof initCarrito === "function") {
    initCarrito();
  }
  renderDetalle();
});
