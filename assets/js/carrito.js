document.addEventListener("DOMContentLoaded", mostrarCarrito);

function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const cont = document.getElementById("contCarrito");

    cont.innerHTML = "";

    if (carrito.length === 0) {
        cont.innterHTML = "<p>Tu carrito está vacío.</p>"
        return;
    }

    carrito.forEach(item => {
        const div = document.createElement("div");
        div.className = "itemCarrito";
        div.innerHTML = `
            <h3>${item.nombre}</h3>
            <p>Precio: $${item.precio}</p>
            <p>Cantidad: ${item.cantidad}</p>
        `;
        cont.appendChild(div);
    });

    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const pTotal = document.createElement("p");
    pTotal.innerHTML = `<strong>Total</strong>: $${total}`;
    cont.appendChild(pTotal);
}

function actualizarBadge() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const badge = document.getElementById("badgeCarrito");
  if (badge) badge.textContent = total;
}

function initCarrito() {
    actualizarBadge();
    window.addEventListener("storage", (e) => {
        if (e.key === "carrito") {
            actualizarBadge();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => { initCarrito(); });

export { initCarrito };

