class Producto {
    cosntructor(id, nombre, descripcion, categoria, cantidad, precio) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.cantidad = cantidad;
        this.precio = precio;
    }
}

const producto1 = new Producto(1, "Aros", "Tradicionales de acero quirurgico", "aros", 8, 5000);
const producto2 = new Producto(2, "Aros", "De acero dorado", "aros", 4, 6000);
const producto3 = new Producto(3, "Cadena", "De acero dorado", "cadenas", 5, 7500);
const productos = [producto1, producto2, producto3];

console.log("Todos los productos:")
for (const Producto of productos) {
    console.log(producto.id);
    console.log(producto.nombre);
    console.log("");
}

console.log("Nombres:")
productos.forEach(Producto => {
    console.log(producto.nombre);
});

console.log("Valor total del stock (ARS): $")
productos.reduce(Producto.precio);

console.log("Productos de la categoria aros: ")
const aros = productos.filter(Producto => producto.categoria = "aros");