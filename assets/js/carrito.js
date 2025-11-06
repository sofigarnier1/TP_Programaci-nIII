// === Utils ===
function readCart() {
  try { return JSON.parse(localStorage.getItem("carrito") || "[]"); }
  catch { return []; }
}
function writeCart(items) {
  localStorage.setItem("carrito", JSON.stringify(items));
  updateBadges(items);
  // mantener stock sincronizado cada vez que se escribe el carrito
  syncStocksWithCart();
}
function money(n){ try { return Number(n||0).toLocaleString("es-AR"); } catch { return n; } }

function updateBadges(items){
  const count = items.reduce((a, it) => a + Number(it.cantidad||1), 0);
  const nav = document.getElementById("nav-cart");
  if (nav) nav.textContent = `🛒 (${count})`;
  const badge = document.getElementById("badgeCarrito");
  if (badge) badge.textContent = count;
}

function readProductos(){
  try { return JSON.parse(localStorage.getItem("productos") || "[]"); }
  catch { return []; }
}
function writeProductos(list){
  localStorage.setItem("productos", JSON.stringify(list));
}

// Agrega stockBase si falta (lo hace una sola vez)
function ensureStockBase(){
  const prods = readProductos();
  let touched = false;
  for (const p of prods){
    if (typeof p.stockBase === "undefined") {
      p.stockBase = Number(p.stock ?? 0);
      if (typeof p.stock !== "undefined") p.stock = Number(p.stock);
      touched = true;
    }
  }
  if (touched) writeProductos(prods);
}

// Cantidad en carrito de un producto
function qtyInCart(prodId){
  const c = readCart();
  const item = c.find(x => String(x.id) === String(prodId));
  return Number(item?.cantidad || 0);
}

// Recalcula p.stock = p.stockBase - qtyEnCarrito
function syncStocksWithCart(){
  const prods = readProductos();
  let touched = false;
  for (const p of prods){
    const base = Number(p.stockBase ?? p.stock ?? 0);
    const enCarrito = qtyInCart(p.id);
    const nuevo = Math.max(0, base - enCarrito);
    if (p.stock !== nuevo){
      p.stock = nuevo;
      touched = true;
    }
  }
  if (touched) writeProductos(prods);
}

// Restaura el stock “visible” a su base (usado al vaciar carrito)
function restoreStocksToBase(){
  const prods = readProductos();
  let touched = false;
  for (const p of prods){
    const base = Number(p.stockBase ?? p.stock ?? 0);
    if (p.stock !== base){
      p.stock = base;
      touched = true;
    }
  }
  if (touched) writeProductos(prods);
}

// === API pública ===
function agregarAlCarrito(prod){
  // prod: { id, nombre, precio (number), img }
  // Evitar agregar más de lo disponible
  const prods = readProductos();
  const p = prods.find(x => String(x.id) === String(prod.id));
  const base = Number(p?.stockBase ?? p?.stock ?? Infinity);
  const enCarrito = qtyInCart(prod.id);
  const disponible = base - enCarrito;
  if (disponible <= 0) {
    // sin stock disponible para agregar otro
    return;
  }

  const cart = readCart();
  const productos = readProductos();
  const pIdx = productos.findIndex(p => String(p.id) === String(prod.id));
  const stock = pIdx >= 0 ? Number(productos[pIdx].stock || 0) : 0;
  if (pIdx >= 0 && stock <= 0) { updateBadges(cart); return; }
  if (pIdx >= 0) ajustarStockProducto(prod.id, -1);

  const idx = cart.findIndex(i => String(i.id) === String(prod.id));
  if (idx >= 0) {
    cart[idx].cantidad = Number(cart[idx].cantidad || 1) + 1;
  } else {
    cart.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: Number(prod.precio) || 0,
      img: sanImg(prod.img || ""),
      cantidad: 1
    });
  }
  writeCart(cart); // también sincroniza stocks
}

function actualizarBadge() { updateBadges(readCart()); }

function initCarrito() {
  ensureStockBase();    // crea stockBase si falta
  syncStocksWithCart(); // ajusta stocks visibles según carrito actual
  actualizarBadge();

  window.addEventListener("storage", (e) => {
    if (e.key === "carrito") {
      actualizarBadge();
      syncStocksWithCart(); // mantener sincronía entre pestañas
      renderCart(); // reflejar cambios entre pestañas
    }
    if (e.key === "productos") {
      // si cambió el catálogo, refrescar tabla
      renderCart();
    }
  });
}

// === Render versión SIMPLE (div#contCarrito) ===
function mostrarCarrito() {
  const cont = document.getElementById("contCarrito");
  if (!cont) return;
  const carrito = readCart();
  cont.innerHTML = "";
  if (carrito.length === 0) {
    cont.innerHTML = "<p>Tu carrito está vacío.</p>";
    cont.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }
  carrito.forEach(item => {
    const div = document.createElement("div");
    div.className = "itemCarrito";
    div.innerHTML = `
      <h3>${item.nombre}</h3>
      <p>Precio: $ ${money(item.precio)}</p>
      <p>Cantidad: ${item.cantidad}</p>
    `;
    cont.appendChild(div);
  });
  const total = carrito.reduce((acc, item) => acc + Number(item.precio||0) * Number(item.cantidad||1), 0);
  const pTotal = document.createElement("p");
  pTotal.innerHTML = `<strong>Total</strong>: $ ${money(total)}`;
  cont.appendChild(pTotal);
}

function vaciarCarrito(){
  const cart = readCart();
  if (!cart.length){ updateBadges([]); return; }

  // devuelve stock por cada ítem del carrito
  const devolver = cart.reduce((acc, it) => {
    const id = String(it.id);
    acc[id] = (acc[id] || 0) + Number(it.cantidad || 1);
    return acc;
  }, {});

  Object.entries(devolver).forEach(([id, qty]) => {
    ajustarStockProducto(id, +qty);
  });

  writeCart([]);
  updateBadges([]);
}


function renderCart(){
  const tbody = document.getElementById("cart-body");
  const vacio = document.getElementById("cart-empty");
  const itemsEl = document.getElementById("resumen-items");
  const totalEl = document.getElementById("resumen-total");
  const btnVaciar = document.getElementById("btn-vaciar");
  const btnFinalizar = document.getElementById("btn-finalizar");

  // Si no están estos nodos, no es la versión tabla
  if (!tbody || !vacio || !itemsEl || !totalEl) return;

  const cart = readCart();
  updateBadges(cart);

  if (!cart.length){
    tbody.innerHTML = "";
    vacio.hidden = false;
    itemsEl.textContent = "0";
    totalEl.textContent = "$ 0";
    if (btnFinalizar) btnFinalizar.disabled = true;
    // evitar duplicar listeners
    return;
  }
  vacio.hidden = true;

  // Construimos filas con input de cantidad y botón eliminar (sin columna Acciones)
  tbody.innerHTML = cart.map((p) => {
    const precio = Number(p.precio)||0;
    const qty = Math.max(1, Number(p.cantidad||1));
    const subtotal = precio * qty;
    const img = p.img || '../assets/img/placeholder.png';
    return `
      <tr data-id="${String(p.id)}">
        <td>
          <div class="prod">
            <img src="${img}" alt="${p.nombre || 'Producto'}">
            <div class="prod-info">
              <div class="name">${p.nombre || 'Producto'}</div>
              <button class="btn btn-mini btn-remove" type="button" aria-label="Eliminar ${p.nombre || 'producto'}">Eliminar</button>
            </div>
          </div>
        </td>
        <td class="num">$ ${money(precio)}</td>
        <td class="center">
          <input class="qty" type="number" min="1" step="1" value="${qty}" aria-label="Cantidad de ${p.nombre || 'producto'}">
        </td>
        <td class="num subtotal"><strong>$ ${money(subtotal)}</strong></td>
      </tr>
    `;
  }).join("");

  // Totales
  refreshTotals();

  // Habilitar / deshabilitar finalizar
  if (btnFinalizar) btnFinalizar.disabled = cart.length === 0;

  // Delegación: cambiar cantidad (bind una sola vez)
  if (!tbody._boundQty) {
    tbody.addEventListener("input", onQtyChange);
    tbody._boundQty = true;
  }
  // Delegación: eliminar producto (bind una sola vez)
  if (!tbody._boundRemove) {
    tbody.addEventListener("click", onRemoveClick);
    tbody._boundRemove = true;
  }

  // Botón Vaciar
// Botón Vaciar (con SweetAlert2)
if (btnVaciar && !btnVaciar._bound) {
  btnVaciar.addEventListener("click", () => {
    // si no está SweetAlert cargado, usa confirm() como fallback
    if (typeof Swal === "undefined") {
      if (!confirm("¿Vaciar todo el carrito?")) return;
      writeCart([]);
      restoreStocksToBase();
      tbody.innerHTML = "";
      renderCart();
      return;
    }

    Swal.fire({
      title: "¿Vaciar el carrito?",
      text: "Se quitarán todos los productos. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#70e686",   // Verde Sabina
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
      background: "#fff",
      color: "#000",
      customClass: {
        popup: "rounded-4 shadow",
        confirmButton: "fw-bold",
        cancelButton: "fw-bold"
      }
    }).then((result) => {
      if (!result.isConfirmed) return;

      // Vaciar y restaurar stocks base
      writeCart([]);
      restoreStocksToBase();
      tbody.innerHTML = "";
      renderCart();

      Swal.fire({
        title: "Carrito vacío",
        text: "Se eliminaron todos los productos.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        background: "#fff",
        color: "#000"
      });
    });
  });
  btnVaciar._bound = true;
}


  // Botón Finalizar
  if (btnFinalizar && !btnFinalizar._bound) {
    btnFinalizar.addEventListener("click", () => {
      const c = readCart();
      if (!c.length) return;

      const total = c.reduce((a, it) => a + (Number(it.precio)||0) * (Number(it.cantidad)||1), 0);
      const items = c.reduce((a, it) => a + Number(it.cantidad||1), 0);

      localStorage.setItem("ordenPreview", JSON.stringify({
        fecha: new Date().toISOString(),
        items,
        total,
        moneda: "ARS",
        cart: c
      }));

      // Ajustá la ruta si tu página se llama distinto
      window.location.href = "/pages/finalizar.html";
    });
    btnFinalizar._bound = true;
  }

  // === handlers internos ===
  function onQtyChange(e){
    const input = e.target.closest(".qty");
    if (!input) return;

    const tr = input.closest("tr");
    const id = tr?.dataset.id;
    const nuevaCant = Math.max(1, parseInt(input.value || "1", 10));

    const c = readCart();
    const idx = c.findIndex(x => String(x.id) === String(id));
    if (idx < 0) return;

    // Validar contra stock disponible
    const prods = readProductos();
    const p = prods.find(x => String(x.id) === String(id));
    const base = Number(p?.stockBase ?? p?.stock ?? Infinity);
    const enCarritoOtros = c
      .filter(x => String(x.id) === String(id))
      .reduce((a, x) => a + Number(x.cantidad||0), 0) - Number(c[idx].cantidad||0);
    const maxPosible = Math.max(1, base - enCarritoOtros); // lo restante que puedo asignar a este ítem

    c[idx].cantidad = Math.min(nuevaCant, maxPosible);
    input.value = c[idx].cantidad;

    writeCart(c); // sincroniza stocks

    // actualizar subtotal de esa fila
    const precio = Number(c[idx].precio)||0;
    const subCell = tr.querySelector(".subtotal");
    if (subCell) subCell.innerHTML = `<strong>$ ${money(precio * c[idx].cantidad)}</strong>`;

    refreshTotals();
  }

function onRemoveClick(e){
  const btn = e.target.closest(".btn-remove");
  if (!btn) return;

  const tr = btn.closest("tr");
  const id = tr?.dataset.id;
  const nombre = tr.querySelector(".name")?.textContent || "este producto";

  Swal.fire({
    title: `¿Eliminar "${nombre}" del carrito?`,
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#70e686",      
    cancelButtonColor: "#aaa",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    background: "#fff",
    color: "#000",
    customClass: {
      popup: "rounded-4 shadow",
      confirmButton: "fw-bold",
      cancelButton: "fw-bold"
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const c = readCart().filter(x => String(x.id) !== String(id));
      writeCart(c);
      renderCart();

      Swal.fire({
        title: "Producto eliminado",
        text: `"${nombre}" fue quitado del carrito.`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        background: "#fff",
        color: "#000"
      });
    }
  });
}



  function refreshTotals(){
    const c = readCart();
    const itemsCount = c.reduce((acc, it) => acc + Number(it.cantidad||1), 0);
    const total = c.reduce((acc, it) => acc + (Number(it.precio)||0) * Number(it.cantidad||1), 0);
    itemsEl.textContent = String(itemsCount);
    totalEl.textContent = `$ ${money(total)}`;
    if (btnFinalizar) btnFinalizar.disabled = itemsCount === 0;
  }
}

// === Boot ===
document.addEventListener("DOMContentLoaded", () => {
  initCarrito();
  mostrarCarrito();
  renderCart();

  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav-links");
  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      nav.classList.toggle("active");
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", !expanded);
    });
  }
});

// Export para usar desde catálogo o detalle
export { initCarrito, agregarAlCarrito };

<script type="module" src="../assets/js/carrito.js"></script>
