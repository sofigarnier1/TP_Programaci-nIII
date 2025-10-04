// catalogo.js
import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

// --- Datos ---
let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;

// Aseguramos tipos y normalizamos categoría para que el filtro no falle por mayúsculas/acentos
function normalizarCategoria(v) {
  return String(v || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // saca acentos
    .toLowerCase().trim();
}

productos = productos.map(p => ({
  ...p,
  precio: Number(p.precio) || 0,
  categoria: normalizarCategoria(p.categoria)
}));

localStorage.setItem("productos", JSON.stringify(productos));

// --- Render de tarjeta ---
function crearTarjeta(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;

  const imgSrc = p.img || "assets/img/placeholder.png";

  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${imgSrc}" alt="${p.nombre}" height="400" width="400">
    <p><strong>Precio:</strong> $ ${p.precio.toLocaleString("es-AR")}</p>
    <div class="botones">
      <button type="button" class="btnDetalle">Ver detalles</button>
      <button type="button" class="btnCarrito">Agregar al carrito</button>
    </div>
  `;
  return art;
}

// --- Render catálogo ---
function renderCatalogo(lista) {
  const cont = document.getElementById("productos");
  if (!cont) return;
  cont.innerHTML = "";
  if (!Array.isArray(lista) || !lista.length) {
    cont.innerHTML = <p>No hay productos para la categoría seleccionada.</p>;
    return;
  }
  lista.forEach(p => cont.appendChild(crearTarjeta(p)));
}

// --- Filtro ---
function aplicarFiltro() {
  const sel = document.getElementById("categoria");
  const valor = sel ? sel.value : "all";

  // normalizamos el valor del select para comparar contra p.categoria normalizada
  const vNorm = normalizarCategoria(valor);
  const lista = (vNorm === "all")
    ? productos
    : productos.filter(p => p.categoria === vNorm);

  renderCatalogo(lista);
}

// --- Init ---
function initCatalogo() {
  // Eventos de filtro
  const btn = document.getElementById("aplicar");
  const sel = document.getElementById("categoria");
  if (btn) btn.addEventListener("click", aplicarFiltro);
  if (sel) sel.addEventListener("change", aplicarFiltro);

  // Render inicial respetando el valor actual del select (por si no es "all")
  aplicarFiltro();

  // Delegación de clicks (agregar al carrito / ver detalles)
  const cont = document.getElementById("productos");
  if (cont) {
    cont.addEventListener("click", (e) => {
      // Agregar al carrito
      const addBtn = e.target.closest(".btnCarrito");
      if (addBtn) {
        const card = addBtn.closest(".producto");
        const id = card?.dataset.id;
        const prod = productos.find(x => String(x.id) === String(id));
        if (!prod) return;
        agregarAlCarrito({
          id: prod.id,
          nombre: prod.nombre,
          precio: prod.precio,
          img: prod.img
        });
        return;
      }

      // Ver detalles (ajustado para GitHub Pages)
      const detBtn = e.target.closest(".btnDetalle");
      if (detBtn) {
        const card = detBtn.closest(".producto");
        const id = card?.dataset.id;
        if (id) {
          // Con <base href="/TP_Programaci-nIII/"> y estando en /pages/productos.html,
          // apuntamos a la página de detalle ubicada en /pages/detalle.html
          location.href = pages/detalle.html?id=${encodeURIComponent(id)};
        }
      }
    });
  }

  // Badge del nav
  initCarrito();
}

// --- Boot ---
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalogo);
} else {
  initCatalogo();
}

