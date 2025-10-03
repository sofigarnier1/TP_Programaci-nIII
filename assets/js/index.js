import { productos as datosProductos } from "./data.js";
import { initCarrito } from "./carrito.js";

let productos = JSON.parse(localStorage.getItem("productos")) || datosProductos;
localStorage.setItem("productos", JSON.stringify(productos));

function tomarAleatorios(producto, n = 2) {
  const src = [...producto];                            // crea una copia del array

  const enStock = src.filter(p => p.stock > 0);         // filtra productos con stock > 0
  const base = enStock.length >= n ? enStock : src;     // verifica si se tiene la cant de productos necesarios

  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];            // desordena los elementos del array
  }
  return base.slice(0, n);                              // corta los primeros n elementos y los devuelve
}

function tarjetaDestacada(p) {                          // para crear la tarjeta, recibe un producto
  const art = document.createElement("div");
  art.className = "producto";
  art.innerHTML = `
    <h3>${p.nombre}</h3>
    <img src="${p.img}" alt="${p.nombre}" height="400" width="400">
    <p><strong>Precio:</strong> $${p.precio.toLocaleString("es-AR")}</p>

    <div class="botones">
      <button type="button" class="btnDetalle">Ver detalles</button>
      <button type="button" class="btnCarrito">Agregar al carrito</button>
    </div>
    `;
  return art;
}

function initIndex() {
  const cont = document.getElementById("destacados");                // busca un elemento de la seccion destacados
  if (!cont) return;

  const destacados = tomarAleatorios(productos, 2);                  // se seleccionan dos elementos aleatorios del array productos
  cont.innerHTML = "";                                               // vacía el contenido de div#destacados
  destacados.forEach(p => cont.appendChild(tarjetaDestacada(p)));    // para cada elemento de destacados, devuelve la estructura del producto
                                                                     // con appendChild mete la tarjeta en #destacados
  document.addEventListener("DOMContentLoaded", () => { initCarrito(); });
}                                                                   

document.addEventListener("DOMContentLoaded", initIndex);