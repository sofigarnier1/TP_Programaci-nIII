// Genera un código de pedido tipo SB-XXXXXX
function genOrderCode(prefix = "SB-") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix + out;
}

// Lanza el modal "Compra confirmada" y hace cleanup + redirección
function showCompraConfirmada(orderId) {
  if (typeof Swal === "undefined") {
    // Fallback simple sin SweetAlert
    alert(`Compra confirmada. N° de pedido: ${orderId}`);
    localStorage.setItem("carrito", "[]");
    localStorage.removeItem("ordenPreview");
    window.location.href = "productos.html";
    return;
  }

  Swal.fire({
    title: "¡Compra confirmada!",
    html: `
      <p>Gracias por tu compra. Registramos tus datos correctamente.</p>
      <p><strong>N° de pedido:</strong> ${orderId}</p>
    `,
    icon: "success",
    showCloseButton: true,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#70e686", // Verde Sabina
    background: "#fff",
    color: "#000",
    customClass: { popup: "sabina-success" },
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    // limpiar carrito y preview de orden
    localStorage.setItem("carrito", "[]");
    localStorage.removeItem("ordenPreview");
    // Si tenés restoreStocksToBase() disponible en este scope, podrías llamarla acá.
    // restoreStocksToBase();

    // Redirigir al catálogo (desde /pages/)
    window.location.href = "productos.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Soporta tanto el id nuevo como el viejo por si quedó alguno
  const form =
    document.getElementById("checkoutForm") ||
    document.getElementById("formFinalizar");

  if (!form) return;

  // Si existen estos campos, manejamos mostrar/ocultar dirección (envío/retiro)
  const entrega = document.getElementById("entrega");
  const bloqueDireccion = document.getElementById("bloqueDireccion");
  const direccion = document.getElementById("direccion");
  const ciudad = document.getElementById("ciudad");
  const provincia = document.getElementById("provincia");
  const cp = document.getElementById("cp");

  function syncDireccion() {
    if (!entrega || !bloqueDireccion) return;

    const esEnvio = entrega.value === "envio";
    bloqueDireccion.hidden = !esEnvio;

    const campos = [direccion, ciudad, provincia, cp];
    campos.forEach((inp) => {
      if (!inp) return;
      inp.required = esEnvio;
      if (!esEnvio) {
        inp.classList.remove("is-invalid", "is-valid");
      }
    });
  }

  if (entrega) {
    entrega.addEventListener("change", syncDireccion);
    syncDireccion();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validación nativa bootstrap-like
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    const orderId = genOrderCode("SB-");
    showCompraConfirmada(orderId);
  });
});
