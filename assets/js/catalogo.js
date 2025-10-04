import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

function normalizar(v){
  return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

let cache;
try { cache = JSON.parse(localStorage.getItem("productos") || "[]"); } catch { cache = []; }
let productos = Array.isArray(cache) && cache.length ? cache : datosProductos.slice();
productos = productos.map(p => ({
  ...p,
  precio: Number(p.precio) || 0,
  stock: Number(p.stock) || 0,
  categoria: normalizar(p.categoria),
  img: p.img || "assets/img/placeholder.png"
}));
if (!(Array.isArray(cache) && cache.length)) localStorage.setItem("productos", JSON.stringify(productos));

function crearTarjeta(p){
  const el = document.createElement("div");
  el.className = "producto";
  el.dataset.id = p.id;
  el.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${p.img}" alt="${p.nombre}" height="400" width="400">
    <p><strong>Precio:</strong> $ ${p.precio.toLocaleString("es-AR")}</p>
    <div class="botones">
      <button type="button" class="btnDetalle">Ver detalles</button>
      <button type="button" class="btnCarrito">Agregar al carrito</button>
    </div>`;
  return el;
}

function render(lista){
  const cont = document.getElementById("productos");
  if (!cont) return;
  cont.innerHTML = "";
  if (!lista.length){
    cont.innerHTML = <p>No hay productos para la categoría seleccionada.</p>;
    return;
  }
  lista.forEach(p => cont.appendChild(crearTarjeta(p)));
}

function aplicarFiltro(){
  const sel = document.getElementById("categoria");
  const val = sel ? normalizar(sel.value || "all") : "all";
  const lista = (val === "all") ? productos : productos.filter(p => p.categoria === val);
  render(lista);
}

function init(){
  // primer render (respeta el valor actual del select)
  aplicarFiltro();

  const btn = document.getElementById("aplicar");
  const sel = document.getElementById("categoria");
  if (btn) btn.addEventListener("click", aplicarFiltro);
  if (sel) sel.addEventListener("change", aplicarFiltro);

  const cont = document.getElementById("productos");
  if (cont){
    cont.addEventListener("click", (e) => {
      const add = e.target.closest(".btnCarrito");
      if (add){
        const id = add.closest(".producto")?.dataset.id;
        const prod = productos.find(x => String(x.id) === String(id));
        if (prod) agregarAlCarrito({ id: prod.id, nombre: prod.nombre, precio: prod.precio, img: prod.img });
        return;
      }
      const det = e.target.closest(".btnDetalle");
      if (det){
        const id = det.closest(".producto")?.dataset.id;
        if (id) location.href = pages/detalle.html?id=${encodeURIComponent(id)};
      }
    });
  }

  initCarrito();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


