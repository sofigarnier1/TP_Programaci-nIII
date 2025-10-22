import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";

// --- helper robusto para material ---
const getMaterial = (p = {}) => {
  const cand = [
    p.material, p.Material, p.materiales, p.Materiales, p.mat,
    p.especificaciones?.material, p.detalle?.material, p.info?.material
  ];
  const val = cand.find(v => v !== undefined && v !== null && String(v).trim() !== "");
  return val ? String(val).trim() : "";
};

// ——— Cargar del storage (si existe) ———
const stored = JSON.parse(localStorage.getItem("productos")) || [];

// Si falta el campo material en alguno, forzamos refresh desde data.js
const needsRefresh = stored.length === 0 || stored.some(p => getMaterial(p) === "");

// Base: si hay que refrescar, usamos datosProductos; si no, lo guardado
let productosBase = needsRefresh ? datosProductos : stored;

let productos = (JSON.parse(localStorage.getItem("productos")) || datosProductos).map(p => ({
  ...p,
  precio: Number(p.precio) || 0,
  categoria: (p.categoria || "").toString(),
  material: p.material ?? p.descripcion ?? "—"   // 👈 clave
}));
localStorage.setItem("productos", JSON.stringify(productos));




// Helpers
const norm = (s = "") => s.toString().toLowerCase().trim();
const splitCats = (s = "") => norm(s).split(",").map(x => x.trim()).filter(Boolean);

// 2) Crear tarjeta
function crearTarjeta(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;
  art.dataset.cat = norm(p.categoria); // <-- clave para el filtro
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

// 3) Render catálogo
function renderCatalogo(lista) {
  const cont = document.getElementById("productos");
  if (!cont) return;
  cont.innerHTML = "";
  lista.forEach(p => cont.appendChild(crearTarjeta(p)));
}

// 4) Filtrado
function filtrarPorCategoria(valor) {
  const catSel = norm(valor);
  if (catSel === "all" || catSel === "todas" || !catSel) {
    renderCatalogo(productos);
    return;
  }
  const filtrados = productos.filter(p => {
    const cats = splitCats(p.categoria); // soporta "aros, collares"
    return cats.includes(catSel);
  });
  renderCatalogo(filtrados);
}

function aplicarFiltro() {
  const sel = document.getElementById("categoria");
  const valor = sel ? sel.value : "all";
  filtrarPorCategoria(valor);
}

// 5) Init
function initCatalogo() {
  // Render inicial
  renderCatalogo(productos);

  // Preselección por URL: ?cat=aros
  const params = new URLSearchParams(location.search);
  const catURL = params.get("cat");
  const sel = document.getElementById("categoria");
  if (catURL && sel) {
    sel.value = catURL;
    aplicarFiltro();
  }

  // Filtro automático al cambiar
  if (sel) sel.addEventListener("change", aplicarFiltro);

  // (Opcional) Soporta botón "Aplicar" si lo dejás en el HTML
  const btn = document.getElementById("aplicar");
  if (btn) btn.addEventListener("click", aplicarFiltro);

  // Delegación de clicks (agregar al carrito / ver detalles)
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
          precio: prod.precio,
          img: prod.img
        });
        mostrarMensaje("Producto agregado con éxito 💚");
        return;
      }

      // Ver detalles
      const detBtn = e.target.closest(".btnDetalle");
      if (detBtn) {
        const card = detBtn.closest(".producto");
        const id = card?.dataset.id;
        if (id) location.href = `producto.html?id=${id}`;
      }
    });
  }

  // Contador del nav
  initCarrito();
}

// Boot
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalogo);
} else {
  initCatalogo();
}

// === Cartel de confirmación ===
function mostrarMensaje(texto = "Agregado con éxito 💚") {
  // Crear el contenedor si no existe
  let aviso = document.getElementById("mensaje-exito");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "mensaje-exito";
    document.body.appendChild(aviso);
  }

  aviso.textContent = texto;
  aviso.classList.add("visible");

  // Se oculta automáticamente después de 2,5s
  setTimeout(() => aviso.classList.remove("visible"), 2500);
}
