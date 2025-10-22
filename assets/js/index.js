import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;
productos = productos.map(p => ({
  ...p,
  img: (p.img || "").replace(/^\/+assets\//, "assets/").replace(/^(\.\.\/)+assets\//, "assets/"),
  precio: Number(p.precio) || 0
}));
localStorage.setItem("productos", JSON.stringify(productos));

function tomarAleatorios(arr, n = 2) {
  const src = [...arr];
  const enStock = src.filter(p => Number(p.stock) > 0);
  const base = enStock.length >= n ? enStock : src;
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.slice(0, n);
}

function tarjetaDestacada(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;

  const normImg = (src = "") => {
    if (/^https?:\/\//i.test(src)) return src;
    const inPages = location.pathname.includes("/pages/");
    let s = src.replace(/^\/+/, "").replace(/^(\.\.\/)+/, "");
    if (s.startsWith("assets/img/")) return inPages ? ("../" + s) : s;
    const base = inPages ? "../assets/img/" : "assets/img/";
    return base + s.replace(/^.*img\//, "");
  };

  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${normImg(p.img)}" alt="${p.nombre}" height="400" width="400">
    <p><strong>Precio:</strong> $ ${Number(p.precio).toLocaleString("es-AR")}</p>
    <div class="botones">
      <button type="button" class="btnDetalle">Ver detalles</button>
      <button type="button" class="btnCarrito">Agregar al carrito</button>
    </div>
  `;
  return art;
}

function initIndex() {
  const cont = document.getElementById("destacados");
  if (!cont) return;

  const destacados = tomarAleatorios(productos, 2);
  cont.innerHTML = "";
  destacados.forEach(p => cont.appendChild(tarjetaDestacada(p)));

  cont.addEventListener("click", (e) => {
    const btnAdd = e.target.closest(".btnCarrito");
    if (btnAdd) {
      const card = btnAdd.closest(".producto");
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

    const btnDet = e.target.closest(".btnDetalle");
    if (btnDet) {
      const card = btnDet.closest(".producto");
      const id = card?.dataset.id;
      if (id) {
        const detalleBase = location.pathname.includes("/pages/")
          ? "producto.html"
          : "pages/producto.html";
        location.href = `${detalleBase}?id=${id}`;
      }
    }
  });

  initCarrito();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIndex);
} else {
  initIndex();
}


