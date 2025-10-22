
import { productos as datosProductos } from "./data.js";
import { initCarrito, agregarAlCarrito } from "./carrito.js";


const getMaterial = (p = {}) => {
  const cand = [
    p.material, p.Material, p.materiales, p.Materiales, p.mat,
    p.especificaciones?.material, p.detalle?.material, p.info?.material
  ];
  const val = cand.find(v => v !== undefined && v !== null && String(v).trim() !== "");
  return val ? String(val).trim() : "";
};


const stored = JSON.parse(localStorage.getItem("productos")) || [];
const needsRefresh = stored.length === 0 || stored.some(p => getMaterial(p) === "");

let productos = (needsRefresh ? datosProductos : stored).map(p => ({
  ...p,
  precio: Number(p.precio) || 0,
  categoria: (p.categoria || "").toString(),
  material: p.material ?? p.descripcion ?? "—"
}));

localStorage.setItem("productos", JSON.stringify(productos));


const norm = (s = "") => s.toString().toLowerCase().trim();
const splitCats = (s = "") => norm(s).split(",").map(x => x.trim()).filter(Boolean);


function crearTarjeta(p) {
  const art = document.createElement("div");
  art.className = "producto";
  art.dataset.id = p.id;
  art.dataset.cat = norm(p.categoria);

  // Ruta segura para imágenes
  const imgBase = location.pathname.includes("/pages/") ? "../assets/img/" : "assets/img/";
  const normImg = (src) =>
    src?.startsWith("http") ? src :
    src?.includes("/assets/img/") ? src :
    imgBase + src.replace(/^.*img\//, "");

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
  lista.forEach(p => cont.appendChild(crearTarjeta(p)));
}


function filtrarPorCategoria(valor) {
  const catSel = norm(valor);
  if (catSel === "all" || catSel === "todas" || !catSel) {
    renderCatalogo(productos);
    return;
  }
  const filtrados = productos.filter(p => {
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


function initCatalogo() {
  renderCatalogo(productos);

  // Filtro desde URL
  const params = new URLSearchParams(location.search);
  const catURL = params.get("cat");
  const sel = document.getElementById("categoria");
  if (catURL && sel) {
    sel.value = catURL;
    aplicarFiltro();
  }

  // Eventos de filtros
  if (sel) sel.addEventListener("change", aplicarFiltro);
  const btn = document.getElementById("aplicar");
  if (btn) btn.addEventListener("click", aplicarFiltro);

  // Delegación de eventos
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
        if (id) {
          const detalleBase = location.pathname.includes("/pages/")
            ? "producto.html"
            : "pages/producto.html";
          location.href = `${detalleBase}?id=${id}`;
        }
      }
    });
  }

  // Actualiza contador carrito
  initCarrito();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalogo);
} else {
  initCatalogo();
}


// Mensaje de confirmación
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
