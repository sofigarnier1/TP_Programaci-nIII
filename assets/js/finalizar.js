function genOrderCode(prefix = "SB-") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix + out;
}

function showCompraConfirmada(orderId) {
  if (typeof Swal === "undefined") {
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
    confirmButtonColor: "#70e686", 
    background: "#fff",
    color: "#000",
    customClass: { popup: "sabina-success" },
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    localStorage.setItem("carrito", "[]");
    localStorage.removeItem("ordenPreview");

    window.location.href = "productos.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form =
    document.getElementById("checkoutForm") ||
    document.getElementById("formFinalizar");

  if (!form) return;

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

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    const orderId = genOrderCode("SB-");
    showCompraConfirmada(orderId);
  });
});
