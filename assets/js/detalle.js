import { agregarAlCarrito, initCarrito } from "./carrito.js";
import { productos as datosProductos } from "./data.js";

function getIdFromURL() {
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

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
    mostrarMensaje(`"${nombre}" agregado al carrito 💚`);
  }
}

function readProductos() {
  try {
    const guardados = JSON.parse(localStorage.getItem("productos") || "null");
    if (Array.isArray(guardados) && guardados.length) return guardados;
  } catch {

  }
  return datosProductos;
}

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

  let disponible = Math.max(0, Number(prod.stock ?? 0));
  const materialTxt = prod.material ?? prod.descripcion ?? "—";

  cont.innerHTML = `
    <article class="detalle-card">
      <h1>${prod.nombre}</h1>
      <img class="detalle-img" src="${prod.img}" alt="${prod.nombre}">
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

  function updateStockUI() {
    stockEl.textContent = disponible;
    btn.disabled = disponible <= 0;
    btn.textContent = disponible > 0 ? "Agregar al carrito" : "Sin stock";
  }
  updateStockUI();

  if (btn) {
    btn.addEventListener("click", () => {
      if (disponible <= 0) return;

      agregarAlCarrito({
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio || 0),
        img: prod.img,
      });

      productos = readProductos();
      const actualizado = productos.find((p) => String(p.id) === String(id));
      disponible = Math.max(0, Number(actualizado?.stock ?? 0));
      updateStockUI();

      avisarAgregado(prod.nombre);
    });
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "productos" || e.key === "carrito") {
      const prodsActuales = readProductos();
      const actualizado = prodsActuales.find((p) => String(p.id) === String(id));
      disponible = Math.max(0, Number(actualizado?.stock ?? 0));
      updateStockUI();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const abierto = navLinks.classList.toggle("nav-open");
      navLinks.classList.toggle("active", abierto);
      hamburger.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  if (typeof initCarrito === "function") {
    initCarrito();
  }

  renderDetalle();
});
