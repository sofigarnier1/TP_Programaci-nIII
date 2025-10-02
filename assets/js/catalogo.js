import { productos } from "./data.js";

function crearTarjeta(p) {
  const el = document.createElement('div');
  el.className = 'producto';
  el.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${p.img}" alt="${p.nombre}" height="400" width="400">
    <p><strong>Precio:</strong> $ ${p.precio.toLocaleString("es-AR")}</p>

    <div class="botones">
      <a href="producto.html?id=${p.id}">
        <button type="button">Ver detalles</button>
      </a>
      <button type="button">Agregar al carrito</button>
    </div>
  `;
  return el;
}

function renderCatalogo(productos) {
  const cont = document.getElementById("productos");
  if (!cont) return;             
  cont.innerHTML = '';
  productos.forEach(p => cont.appendChild(crearTarjeta(p)));
}

function aplicarFiltro() {
  const sel = document.getElementById("categoria");
  const valor = sel ? sel.value : 'all';
  const lista = (valor === 'all') ? productos : productos.filter(p => p.categoria === valor);
  renderCatalogo(lista);
}

function initCatalogo() {
  renderCatalogo(productos);   

  const btn = document.getElementById("aplicar");
  const sel = document.getElementById("categoria");
  if (btn) btn.addEventListener('click', aplicarFiltro);
  if (sel) sel.addEventListener('change', aplicarFiltro);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalogo);
} else {
  initCatalogo();
}