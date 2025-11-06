// assets/js/index.js

import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

// Normalizo productos y guardo en localStorage
let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;

productos = productos.map((p) => ({
  ...p,
  img: (p.img || "")
    .replace(/^\/+assets\//, "assets/")
    .replace(/^(\.\.\/)+assets\//, "assets/"),
  precio: Number(p.precio) || 0,
}));

localStorage.setItem("productos", JSON.stringify(productos));

function readProductos() {
  try {
    return JSON.parse(localStorage.getItem("productos")) || datosProductos;
  } catch {
    return datosProductos;
  }
}

// (la dejo por si la querés usar en otro lado)
function mostrarMensaje(texto = "Producto agregado con éxito 💚") {
  let aviso = document.getElementById("mensaje-exito");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "mensaje-exito";
    document.body.appendChild(aviso);
  }
  aviso.textContent = texto;
  aviso.style.opacity = "1";
  setTimeout(() => (aviso.style.opacity = "0"), 2000);
}

// elijo N productos aleatorios
function tomarAleatorios(arr, n = 2) {
  const src = [...arr];
  const enStock = src.filter((p) => Number(p.stock) > 0);
  const base = enStock.length >= n ? enStock : src;

  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.slice(0, n);
}

// tarjeta que se muestra en el inicio
function tarjetaDestacada(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;
  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${p.img}" alt="${p.nombre}" height="400" width="400">
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

  // 🔹 Tarjetas destacadas
  const destacados = tomarAleatorios(productos, 2);
  cont.innerHTML = "";
  destacados.forEach((p) => cont.appendChild(tarjetaDestacada(p)));

  cont.addEventListener("click", (e) => {
    const btnAdd = e.target.closest(".btnCarrito");
    if (btnAdd) {
      const card = btnAdd.closest(".producto");
      const id = card?.dataset.id;
      const prod = productos.find((x) => String(x.id) === String(id));
      if (!prod) return;

      agregarAlCarrito({
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio) || 0,
        img: prod.img,
      });

      Swal.fire({
        title: "¡Producto agregado!",
        text: `"${prod.nombre}" se agregó al carrito 💚`,
        icon: "success",
        confirmButtonColor: "#70e686",
        background: "#fff",
        color: "#000",
        timer: 1800,
        showConfirmButton: false,
        customClass: {
          popup: "sabina-success",
        },
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

  // 🔹 MENÚ HAMBURGUESA
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const abierto = navLinks.classList.toggle("nav-open");
      hamburger.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  // 🔹 Carrito en la barra
  initCarrito();
}

// inicializo cuando carga el DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIndex);
} else {
  initIndex();
}
