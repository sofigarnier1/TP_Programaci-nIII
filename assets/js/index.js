import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

/* =========================
   Normalizador de imágenes
   ========================= */

function normImg(path) {
  if (!path) return "";
  let clean = String(path).trim();

  // saco ./, / o ../ del principio
  clean = clean.replace(/^(\.\/|\/)+/, "").replace(/^(\.\.\/)+/, "");
  // ahora clean debería ser: "assets/img/loquesea.jpg"

  // si la página está dentro de /pages/, tengo que subir un nivel
  const enSubcarpeta = location.pathname.includes("/pages/");
  if (enSubcarpeta) {
    return "../" + clean;
  }
  // si estoy en la raíz, va directo
  return clean;
}

/* =========================
   Productos + localStorage
   ========================= */

function cargarProductos() {
  let base = null;

  // Leo del localStorage si existe
  try {
    base = JSON.parse(localStorage.getItem("productos") || "null");
  } catch {
    base = null;
  }

  // Si no hay nada útil en LS, uso los del data.js
  if (!Array.isArray(base) || base.length === 0) {
    base = datosProductos;
  }

  // Limpio y normalizo las rutas + precio
  const normalizados = base.map((p) => {
    const precioNum = Number(p.precio) || 0;
    const imgLimpia = (p.img || "")
      .toString()
      .trim()
      .replace(/^(\.\/|\/)+/, "")
      .replace(/^(\.\.\/)+/, ""); // deja "assets/img/..."

    return {
      ...p,
      precio: precioNum,
      img: imgLimpia,
    };
  });

  // Guardo de nuevo en localStorage ya corregidos
  localStorage.setItem("productos", JSON.stringify(normalizados));

  // Debug suave por si algo falla con las imágenes
  if (normalizados.length) {
    console.log("Productos cargados en index:", normalizados);
    console.log(
      "Ejemplo ruta imagen normalizada:",
      normalizados[0].img,
      "→ src real:",
      normImg(normalizados[0].img)
    );
  }

  return normalizados;
}

const productos = cargarProductos();

/* =========================
   Utilidades de inicio
   ========================= */

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

function tarjetaDestacada(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;

  const srcImg = normImg(p.img);

  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${srcImg}" alt="${p.nombre}" height="400" width="400">
    <p><strong>Precio:</strong> $ ${Number(p.precio).toLocaleString("es-AR")}</p>
    <div class="botones">
      <button type="button" class="btnDetalle">Ver detalles</button>
      <button type="button" class="btnCarrito">Agregar al carrito</button>
    </div>
  `;
  return art;
}

/* =========================
   Inicialización
   ========================= */

function initIndex() {
  // 1) NAV: hamburguesa + toggle de menú
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // 2) Carrito (badge en el nav)
  try {
    initCarrito();
  } catch (e) {
    console.error("Error al inicializar carrito:", e);
  }

  // 3) DESTACADOS solo si existe #destacados (inicio)
  const cont = document.getElementById("destacados");
  if (!cont) return;

  const destacados = tomarAleatorios(productos, 2);
  cont.innerHTML = "";
  destacados.forEach((p) => cont.appendChild(tarjetaDestacada(p)));

  // Eventos de botones de las tarjetas
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

      if (typeof Swal !== "undefined") {
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
      }

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
}

// Disparo cuando cargue
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIndex);
} else {
  initIndex();
}
