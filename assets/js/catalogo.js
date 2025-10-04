import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;
// Aseguro precio numérico para evitar NaN al calcular totales
productos = productos.map(p => ({ ...p, precio: Number(p.precio) || 0 }));
localStorage.setItem("productos", JSON.stringify(productos));

function crearTarjeta(p) {  // crea una tarjeta de producto
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id; // <- ID para clicks
  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${p.img}" alt="${p.nombre}" height="400" width="400">
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
  lista.forEach(p => cont.appendChild(crearTarjeta(p)));
}

function aplicarFiltro() {
  const sel = document.getElementById("categoria");
  const valor = sel ? sel.value : "all";
  const lista = (valor === "all") ? productos : productos.filter(p => p.categoria === valor);
  renderCatalogo(lista);
}

function initCatalogo() {
  // 1) Render inicial
  renderCatalogo(productos);

  // 2) Filtros
  const btn = document.getElementById("aplicar");
  const sel = document.getElementById("categoria");
  if (btn) btn.addEventListener("click", aplicarFiltro);
  if (sel) sel.addEventListener("change", aplicarFiltro);

  // 3) Delegación de clicks (agregar al carrito / ver detalles)
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
          precio: prod.precio,  // ya es número
          img: prod.img
        });
        return; // evitamos seguir evaluando para este click
      }

      // Ver detalles
      const detBtn = e.target.closest(".btnDetalle");
      if (detBtn) {
        const card = detBtn.closest(".producto");
        const id = card?.dataset.id;
        if (id) {
          // Si esta página está en /pages/, el detalle también:
          location.href = `producto.html?id=${id}`;
        }
      }
    });
  }

  // 4) Contador del nav
  initCarrito();
}

// Boot
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalogo);
} else {
  initCatalogo();
}
