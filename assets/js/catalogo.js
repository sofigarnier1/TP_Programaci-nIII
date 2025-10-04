import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;
productos = productos.map(p => ({ ...p, precio: Number(p.precio) || 0 }));
localStorage.setItem("productos", JSON.stringify(productos));

const IMG_BASE = location.pathname.includes("/pages/") ? "../assets/img/" : "assets/img/";
function imgSrc(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.includes("assets/")) return path;
  return IMG_BASE + path.replace(/^\.?\/?assets\/img\//, "");
}

function crearTarjeta(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;
  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${imgSrc(p.img)}" alt="${p.nombre}" height="400" width="400">
    <p><strong>Precio:</strong> $ ${Number(p.precio).toLocaleString("es-AR")}</p>
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
  lista.forEach(p => cont.appendChild(crearTarjeta(p)));
}

function aplicarFiltro() {
  const sel = document.getElementById("categoria");
  const valor = sel ? sel.value : "all";
  const lista = valor === "all" ? productos : productos.filter(p => p.categoria === valor);
  renderCatalogo(lista);
}

function initCatalogo() {
  renderCatalogo(productos);

  const btn = document.getElementById("aplicar");
  const sel = document.getElementById("categoria");
  if (btn) btn.addEventListener("click", aplicarFiltro);
  if (sel) sel.addEventListener("change", aplicarFiltro);

  const cont = document.getElementById("productos");
  if (cont) {
    cont.addEventListener("click", (e) => {
      const addBtn = e.target.closest(".btnCarrito");
      if (addBtn) {
        const card = addBtn.closest(".producto");
        const id = card?.dataset.id;
        const prod = productos.find(x => String(x.id) === String(id));
        if (!prod) return;
        agregarAlCarrito({
          id: prod.id,
          nombre: prod.nombre,
          precio: Number(prod.precio) || 0,
          img: prod.img
        });
        return;
      }

      const detBtn = e.target.closest(".btnDetalle");
      if (detBtn) {
        const card = detBtn.closest(".producto");
        const id = card?.dataset.id;
        if (id) location.href = `producto.html?id=${id}`;
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

