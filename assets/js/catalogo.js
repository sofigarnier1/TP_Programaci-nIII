import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;

function normalizarCategoria(v) {
  return String(v || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase().trim();
}

productos = productos.map(p => ({
  ...p,
  precio: Number(p.precio) || 0,
  categoria: normalizarCategoria(p.categoria)
}));

localStorage.setItem("productos", JSON.stringify(productos));

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
  const valor = sel ? sel.value : "all";

  const vNorm = normalizarCategoria(valor);
  const lista = (vNorm === "all")
    ? productos
    : productos.filter(p => p.categoria === vNorm);

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
        agregarAlCarrito({
          id: prod.id,
          nombre: prod.nombre,
          precio: prod.precio,
          img: prod.img
        });
        return;
      }

      const detBtn = e.target.closest(".btnDetalle");
      if (detBtn) {
        const card = detBtn.closest(".producto");
        const id = card?.dataset.id;
        if (id) {

          location.href = pages/detalle.html?id=${encodeURIComponent(id)};
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


