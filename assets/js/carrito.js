document.addEventListener("DOMContentLoaded", mostrarCarrito);

// === Utils ===
function readCart() {
  try { return JSON.parse(localStorage.getItem("carrito") || "[]"); }
  catch { return []; }
}
function writeCart(items) {
  localStorage.setItem("carrito", JSON.stringify(items));
}
function money(n){ try { return Number(n||0).toLocaleString("es-AR"); } catch { return n; } }

function updateBadges(items){
  const count = items.reduce((a, it) => a + Number(it.cantidad||1), 0);
  const nav = document.getElementById("nav-cart");
  if (nav) nav.textContent = `🛒 (${count})`;
  const badge = document.getElementById("badgeCarrito");
  if (badge) badge.textContent = count;
}

// === API pública ===
function agregarAlCarrito(prod){
  // prod: { id, nombre, precio (number), img }
  const cart = readCart();
  const idx = cart.findIndex(i => String(i.id) === String(prod.id));
  if (idx >= 0) {
    cart[idx].cantidad = Number(cart[idx].cantidad || 1) + 1;
  } else {
    cart.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: Number(prod.precio) || 0,
      img: prod.img || "",
      cantidad: 1
    });
  }
  writeCart(cart);
  updateBadges(cart);
}

function actualizarBadge() { updateBadges(readCart()); }

function initCarrito() {
  actualizarBadge();
  window.addEventListener("storage", (e) => {
    if (e.key === "carrito") actualizarBadge();
  });
}

// === Render versión SIMPLE (div#contCarrito) ===
function mostrarCarrito() {
  const cont = document.getElementById("contCarrito");
  if (!cont) return; // si no existe, no renderizamos esta versión

  const carrito = readCart();
  cont.innerHTML = "";

  if (carrito.length === 0) {
    cont.innerHTML = "<p>Tu carrito está vacío.</p>"; // <-- typo corregido
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

// === Render versión TABLA (tbody#cart-body + resumen) ===
function renderCart(){
  const tbody = document.getElementById("cart-body");
  const vacio = document.getElementById("cart-empty");
  const itemsEl = document.getElementById("resumen-items");
  const totalEl = document.getElementById("resumen-total");

  // Si no están estos nodos, no es la versión tabla
  if (!tbody || !vacio || !itemsEl || !totalEl) return;

  const cart = readCart();
  updateBadges(cart);

  if (!cart.length){
    tbody.innerHTML = "";
    vacio.hidden = false;
    itemsEl.textContent = "0";
    totalEl.textContent = "$ 0";
    return;
  }
  vacio.hidden = true;

  tbody.innerHTML = cart.map((p) => {
  const precio = Number(p.precio)||0;
  const qty = Number(p.cantidad||1);
  const subtotal = precio * qty;
  return `
    <tr>
      <td>
        <div class="prod">
          <img src="${p.img || '../assets/img/placeholder.png'}" alt="${p.nombre || 'Producto'}">
          <div>
            <div class="name">${p.nombre || 'Producto'}</div>
          </div>
        </div>
      </td>
      <td class="num">$ ${money(precio)}</td>
      <td class="center">${qty}</td>
      <td class="num"><strong>$ ${money(subtotal)}</strong></td>
    </tr>
  `;
}).join("");


  const itemsCount = cart.reduce((acc, it) => acc + Number(it.cantidad||1), 0);
  const total = cart.reduce((acc, it) => acc + (Number(it.precio)||0) * Number(it.cantidad||1), 0);
  itemsEl.textContent = String(itemsCount);
  totalEl.textContent = `$ ${money(total)}`;
}


// === Boot ===
document.addEventListener("DOMContentLoaded", () => {
  initCarrito();
  mostrarCarrito(); // render simple si existe #contCarrito
  renderCart();     // render tabla si existen nodos de tabla

  // === MENU HAMBURGUESA === 
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav-links");

  hamburger.addEventListener("click", () => {
    nav.classList.toggle("active");
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", !expanded);
  });
});

// Export para usar desde catálogo o detalle
export { initCarrito, agregarAlCarrito };
