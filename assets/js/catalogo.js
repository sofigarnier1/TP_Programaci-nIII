import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

function toPath(path) {
  if (!path) return (location.pathname.includes("/pages/") ? "../" : "") + "assets/img/placeholder.png";
  if (path.startsWith("http") || path.startsWith("/") || path.startsWith("../")) return path;
  return (location.pathname.includes("/pages/") ? "../" : "") + path;
}

let cache;
try { cache = JSON.parse(localStorage.getItem("productos") || "[]"); } catch { cache = []; }
let productos = Array.isArray(cache) && cache.length ? cache : datosProductos.slice();
productos = productos.map(p => ({ ...p, precio: Number(p.precio) || 0, stock: Number(p.stock) || 0 }));
if (!(Array.isArray(cache) && cache.length)) localStorage.setItem("productos", JSON.stringify(productos));

function crearTarjeta(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;
  const imgSrc = toPath(p.img);
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

function aplicarFiltro() {
  const sel = document.getElementById("categoria");
  const valor = sel ? String(sel.value || "all").toLowerCase().trim() : "all";
  const lista = (valor === "all") ? productos : productos.filter(p => String(p.categoria || "").toLowerCase().trim() === valor);
  renderCatalogo(lista);
}

function initCatalogo() {
  const btn = document.getElementById("aplicar");
  const sel = document.getElementById("categoria");
  if (btn) btn.addEventListener("click", aplicarFiltro);
  if (sel) sel.addEventListener("change", aplicarFiltro);
  aplicarFiltro();

  const cont = document.getElementById("productos");
  if (cont) {
    cont.addEventListener("click", (e) => {
      const addBtn = e.target.closest(".btnCarrito");
      if (addBtn) {
        const card = addBtn.closest(".producto");
        const id = card?.dataset.id;
        const prod = productos.find(x => String(x.id) === String(id));
        if (!prod) return;
        agregarAlCarrito({ id: prod.id, nombre: prod.nombre, precio: prod.precio, img: prod.img });
        return;
      }
      const detBtn = e.target.closest(".btnDetalle");
      if (detBtn) {
        const card = detBtn.closest(".producto");
        const id = card?.dataset.id;
        if (id) {
          const url = location.pathname.includes("/pages/") ? detalle.html?id=${encodeURIComponent(id)} : pages/detalle.html?id=${encodeURIComponent(id)};
          location.href = url;
        }
      }
    });
  }

  initCarrito();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalogo);
} else {
  initCatalogo();
}

