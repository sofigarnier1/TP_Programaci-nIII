import { productos } from './data.js';

function renderizarProducto(p) {
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  cont.innerHTML = "";

  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;

  art.innerHTML = `
      <h3>${p.nombre}</h3>
      <img src="${p.img}" alt="${p.nombre}" height="400" width="400">
      <p><strong>Precio:</strong> $ ${p.precio.toLocaleString("es-AR")}</p>
      <p><strong>Material:</strong> ${p.descripcion}</p>
      <p><strong>Categoría:</strong> ${p.categoria}</p>
      <p><strong>Stock:</strong> <span class="stock">${p.stock}</span></p>
  `;

  const divBotones = document.createElement("div");
  divBotones.className = "botones";

  const btnAgregar = document.createElement("button");
  btnAgregar.type = "button";
  btnAgregar.className = "agregar";
  btnAgregar.textContent = "Agregar al carrito";

  const btnVolver = document.createElement("a");
  btnVolver.href = "./productos.html";
  btnVolver.innerHTML = `<button type="button">Volver al catálogo</button>`;

  divBotones.appendChild(btnAgregar);
  divBotones.appendChild(btnVolver);

  cont.appendChild(art);
  cont.appendChild(divBotones);

  if (p.stock === 0) {
    btnAgregar.disabled = true;
    btnAgregar.textContent = "Sin stock";
  } else {
    btnAgregar.addEventListener("click", () => agregarProducto(p, btnAgregar));
  }
}

function agregarProducto(p, btn) {
  const art = btn.closest(".botones").previousElementSibling;
  const stockEl = art.querySelector(".stock");

  if (p.stock > 0) {
    p.stock--;
    stockEl.textContent = p.stock;
    alert(`Se agregó ${p.nombre} al carrito.`);
  }

  if (p.stock === 0) {
    btn.disabled = true;
    btn.textContent = "Sin stock";
  }
}

function initProducto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const producto = productos.find(p => String(p.id) === String(id));
  if (!producto) return;

  renderizarProducto(producto);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProducto);
} else {
  initProducto();
}

export { initProducto };