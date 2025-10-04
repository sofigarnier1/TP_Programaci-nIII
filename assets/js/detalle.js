import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;

productos = productos.map(p => ({
  ...p,
  precio: Number(p.precio) || 0,
  stock: Number(p.stock) || 0
}));
localStorage.setItem("productos", JSON.stringify(productos));

function renderizarProducto(p) {
  const cont = document.getElementById("detalleProducto");
  if (!cont) return;

  cont.innerHTML = "";

  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;

  const imgSrc = p.img || "assets/img/placeholder.png";

  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${imgSrc}" alt="${p.nombre}" height="400" width="400">
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

    btnVolver.href = "pages/productos.html";
  btnVolver.innerHTML = <button type="button">Volver al catálogo</button>;

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
  const art = btn.closest(".botones")?.previousElementSibling;
  const stockEl = art?.querySelector(".stock");

  if (p.stock > 0) {
    p.stock--;
    if (stockEl) stockEl.textContent = p.stock;


    agregarAlCarrito({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      img: p.img
    });

    productos = productos.map(prod => (prod.id === p.id ? p : prod));
    localStorage.setItem("productos", JSON.stringify(productos));

    alert(Se agregó ${p.nombre} al carrito.);
  }

  if (p.stock === 0) {
    btn.disabled = true;
    btn.textContent = "Sin stock";
  }
}

function initProducto() {
  initCarrito();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const producto = productos.find(p => String(p.id) === String(id));
  if (!producto) {
    const cont = document.getElementById("detalleProducto");
    if (cont) cont.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  renderizarProducto(producto);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProducto);
} else {
  initProducto();
}

export { initProducto };
