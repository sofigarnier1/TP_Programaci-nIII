import { productos } from './data.js';

const $ = (s) => document.querySelector(s);

function renderProducto(p) {
  const cont = $('#producto');
  if (!cont) {
    console.warn('[producto] No se encontró #producto');
    return;
  }

  cont.innerHTML = `
    <div class="producto" data-id="${p.id}">
      <h3>${p.nombre}</h3>
      <img src="${p.img}" alt="${p.nombre}" height="400" width="400">
      <p><strong>Precio:</strong> $ ${p.precio.toLocaleString("es-AR")}</p>
      <p><strong>Material:</strong> ${p.descripcion}</p>
      <p><strong>Categoría:</strong> ${p.categoria}</p>
      <p><strong>Stock:</strong> ${p.stock}</p>
      <label>
        <button type="button" id="btn-agregar">Agregar al carrito</button>
        <a href="./productos.html"><button type="button">Volver al catálogo</button></a>
      </label>
    </div>
  `;

  const btn = $('#btn-agregar');
  if (btn) btn.addEventListener('click', () => alert(`Agregado: ${p.nombre}`));
}

function renderError(msg) {
  const cont = $('#producto');
  if (!cont) return;
  cont.innerHTML = `
    <p>${msg}</p>
    <a href="./productos.html"><button type="button">Volver al catálogo</button></a>
  `;
}

function initProducto() {
  console.log('[producto] initProducto()');
  console.log('[producto] productos cargados:', productos?.length);

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  console.log('[producto] id de URL =', id);

  if (!id) return renderError('Falta el parámetro "id" en la URL.');

  const p = productos.find(x => String(x.id) === String(id));
  console.log('[producto] producto encontrado =', p);
  if (!p) return renderError(`No se encontró el producto con id ${id}.`);

  renderProducto(p);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProducto);
} else {
  initProducto();
}

export { initProducto };