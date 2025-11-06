// =============================
// Catálogo de productos Sabina
// =============================

import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

// --- Normalización y carga inicial ---
let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;
productos = productos.map((p) => ({
  ...p,
  precio: Number(p.precio) || 0,
  categoria: (p.categoria || "").toString(),
}));

localStorage.setItem("productos", JSON.stringify(productos));

// --- Helpers ---
const norm = (s = "") => s.toString().toLowerCase().trim();
const splitCats = (s = "") =>
  norm(s)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// --- Avisos visuales ---
function avisarAgregado(nombre) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "¡Producto agregado!",
      text: `"${nombre}" se agregó al carrito 💚`,
      icon: "success",
      timer: 1800,
      showConfirmButton: false,
      confirmButtonColor: "#70e686",
      background: "#fff",
      color: "#000",
      customClass: { popup: "sabina-success" },
    });
  } else {
    mostrarMensaje(`"${nombre}" agregado con éxito 💚`);
  }
}

function mostrarMensaje(texto = "Agregado con éxito 💚") {
  let aviso = document.getElementById("mensaje-exito");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "mensaje-exito";
    document.body.appendChild(aviso);
  }
  aviso.textContent = texto;
  aviso.classList.add("visible");
  setTimeout(() => aviso.classList.remove("visible"), 2500);
}

// --- Normalizador de rutas de imágenes ---
function normImg(src) {
  if (!src) return "";
  const base = location.pathname.includes("/pages/")
    ? "../assets/img/"
    : "assets/img/";
  if (src.startsWith("http")) return src;
  if (src.includes("assets/img/"))
    return src.replace(/^(\.\/|\/)+/, "").replace(/^(\.\.\/)+/, "");
  return base + src.replace(/^.*img\//, "");
}

// --- Renderizado de tarjetas ---
function crearTarjeta(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;
  art.dataset.cat = norm(p.categoria);

  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${normImg(p.img)}" alt="${p.nombre}" height="400" width="400">
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
  lista.forEach((p) => cont.appendChild(crearTarjeta(p)));
}

// --- Filtrado ---
function filtrarPorCategoria(valor) {
  const catSel = norm(valor);
  if (catSel === "all" || catSel === "todas" || !catSel) {
    renderCatalogo(productos);
    return;
  }
  const filtrados = productos.filter((p) => {
    const cats = splitCats(p.categoria);
    return cats.includes(catSel);
  });
  renderCatalogo(filtrados);
}

function aplicarFiltro() {
  const sel = document.getElementById("categoria");
  const valor = sel ? sel.value : "all";
  filtrarPorCategoria(valor);
}

// --- Inicialización general ---
function initCatalogo() {
  // 1) NAV: hamburguesa + toggle de menú
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      // misma lógica que en index.js
      const abierto = navLinks.classList.toggle("nav-open");
      navLinks.classList.toggle("active", abierto);
      hamburger.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  // 2) Render inicial del catálogo
  renderCatalogo(productos);

  // 3) Filtro por categoría (select + botón Aplicar)
  const params = new URLSearchParams(location.search);
  const catURL = params.get("cat");
  const sel = document.getElementById("categoria");

  if (catURL && sel) {
    sel.value = catURL;
    aplicarFiltro();
  }

  if (sel) sel.addEventListener("change", aplicarFiltro);

  const btn = document.getElementById("aplicar");
  if (btn) btn.addEventListener("click", aplicarFiltro);

  // 4) Clicks en tarjetas: agregar al carrito / ver detalle
  const cont = document.getElementById("productos");
  if (cont) {
    cont.addEventListener("click", (e) => {
      const addBtn = e.target.closest(".btnCarrito");
      const detBtn = e.target.closest(".btnDetalle");

      if (addBtn) {
        const card = addBtn.closest(".producto");
        const id = card?.dataset.id;
        const prod = productos.find((x) => String(x.id) === String(id));
        if (!prod) return;

        agregarAlCarrito({
          id: prod.id,
          nombre: prod.nombre,
          precio: prod.precio,
          img: prod.img,
        });

        avisarAgregado(prod.nombre);
        return;
      }

      if (detBtn) {
        const card = detBtn.closest(".producto");
        const id = card?.dataset.id;
        if (!id) return;

        const detalleBase = location.pathname.includes("/pages/")
          ? "producto.html"
          : "pages/producto.html";
        location.href = `${detalleBase}?id=${id}`;
      }
    });
  }

  // 5) Badge del carrito y sincronización de stock
  initCarrito();
}

// Boot
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalogo);
} else {
  initCatalogo();
}
