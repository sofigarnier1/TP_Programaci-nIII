import { agregarAlCarrito, initCarrito } from "./carrito.js";
import { productos as datosProductos } from "./data.js";

function resolveImg(src = "") {
  if (src.includes("../assets/")) return src;
  if (src.includes("assets/")) return "../" + src.replace(/^\.?\//, "");
  return "../assets/img/" + src.replace(/^\/+/, "").replace(/^(\.\.\/)+/, "");
}

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

function readProductos() {
  try { return JSON.parse(localStorage.getItem("productos")) || datosProductos; }
  catch { return datosProductos; }
}

function renderDetalle() {
  const id = getIdFromURL();
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  const productos = readProductos();
  const prod = productos.find(p => String(p.id) === String(id));
  if (!prod) {
    cont.innerHTML = `<p style="text-align:center">Producto no encontrado.</p>`;
    return;
  }

  const materialTxt = prod.material ?? prod.descripcion ?? "—";
  const stockInicial = typeof prod.stock !== "undefined" ? Number(prod.stock) : NaN;

  cont.innerHTML = `
    <article class="detalle-card">
      <h1>${prod.nombre}</h1>
      <img class="detalle-img" src="${resolveImg(prod.img)}" alt="${prod.nombre}">
      <div class="detalle-info">
        <p><strong>Precio:</strong> $ ${Number(prod.precio || 0).toLocaleString("es-AR")}</p>
        <p><strong>Material:</strong> ${materialTxt}</p>
        <p><strong>Categoría:</strong> ${prod.categoria ?? "—"}</p>
        <p><strong>Stock:</strong> <span id="stock-value">${Number.isNaN(stockInicial) ? "—" : stockInicial}</span></p>
      </div>
      <div class="detalle-actions">
        <button id="btnAgregarDetalle" class="btn-solid">Agregar al carrito</button>
        <a href="productos.html" class="btn-ghost">Volver al catálogo</a>
      </div>
    </article>
  `;

  const btn = document.getElementById("btnAgregarDetalle");
  const sv  = document.getElementById("stock-value");

  const setBtnEstado = (stockNum) => {
    const sinStock = Number(stockNum) <= 0 || Number.isNaN(Number(stockNum));
    btn.disabled = sinStock;
    btn.textContent = sinStock ? "Sin stock" : "Agregar al carrito";
  };

  setBtnEstado(stockInicial);

  if (btn) {
    btn.addEventListener("click", () => {
      const cur = readProductos().find(p => String(p.id) === String(id));
      const stockActual = cur ? Number(cur.stock || 0) : 0;
      if (stockActual <= 0) { setBtnEstado(stockActual); mostrarMensaje("Sin stock 😕"); return; }

      agregarAlCarrito({
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio || 0),
        img: prod.img
      });

      const actualizado = readProductos().find(p => String(p.id) === String(id));
      const nuevoStock = actualizado ? Number(actualizado.stock ?? NaN) : NaN;
      if (sv) sv.textContent = Number.isNaN(nuevoStock) ? "—" : nuevoStock;
      setBtnEstado(nuevoStock);
      mostrarMensaje("Producto agregado con éxito 💚");
    });
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "productos") {
      const actualizado = readProductos().find(p => String(p.id) === String(id));
      const nuevoStock = actualizado ? Number(actualizado.stock ?? NaN) : NaN;
      if (sv) sv.textContent = Number.isNaN(nuevoStock) ? "—" : nuevoStock;
      setBtnEstado(nuevoStock);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCarrito?.();
  renderDetalle();
});
