// Genera un código de pedido tipo SB-XXXXXX
function genOrderCode(prefix = "SB-") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return prefix + out;
}

// Lanza el modal "Compra confirmada"
function showCompraConfirmada(orderId) {
  Swal.fire({
    title: '¡Compra confirmada!',
    html: `
      <p>Gracias por tu compra. Registramos tus datos correctamente.</p>
      <p><strong>N° de pedido:</strong> ${orderId}</p>
    `,
    icon: 'success',
    showCloseButton: true,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#70e686',   // Verde Sabina
    background: '#fff',
    color: '#000',
    customClass: { popup: 'sabina-success' },
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then(() => {
    // limpiar carrito y preview de orden
    localStorage.setItem('carrito', '[]');
    localStorage.removeItem('ordenPreview');
    // si usás stocks sincronizados y querés restaurar al base:
    // (descomentalo en caso de tener la función disponible en este scope)
    // restoreStocksToBase();

    // Redirigir a donde prefieras (home o catálogo)
    window.location.href = '/pages/productos.html';
  });
}

// Enganchá el submit del formulario de finalizar
const form = document.getElementById('formFinalizar');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // (si validás datos, hacelo acá; cuando esté OK:)
    const orderId = genOrderCode('SB-');
    showCompraConfirmada(orderId);
  });
}
