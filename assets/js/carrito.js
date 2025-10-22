document.addEventListener("DOMContentLoaded", mostrarCarrito);

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

const normImg = (src = "") => {
  if (/^https?:\/\//i.test(src)) return src;
  const inPages = location.pathname.includes("/pages/");
  let s = src.replace(/^\/+/, "").replace(/^(\.\.\/)+/, "");
  if (s.startsWith("assets/img/")) return inPages ? ("../" + s) : s;
  const base = inPages ? "../assets/img/" : "assets/img/";
  return base + s.replace(/^.*img\//, "");
};
const sanImg = (src = "") =>
  (src || "").replace(/^\/+assets\//, "assets/").replace(/^(\.\.\/)+assets\//, "assets/");

function agregarAlCarrito(prod){
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

function mostrarCarrito() {
  const cont = document.getElementById("contCarrito");
  if (!cont) return;
  const carrito = readCart();
  cont.innerHTML = "";
  if (carrito.length === 0) {
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

function renderCart(){
  const tbody = document.getElementById("cart-body");
  const vacio = document.getElementById("cart-empty");
  const itemsEl = document.getElementById("resumen-items");
  const totalEl = document.getElementById("resumen-total");
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
            <img src="${normImg(p.img || 'placeholder.png')}" alt="${p.nombre || 'Producto'}">
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

export { initCarrito, agregarAlCarrito };
