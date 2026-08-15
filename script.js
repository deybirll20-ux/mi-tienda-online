function pedirProducto(nombre, precio, color, talla) {

    const numeroWhatsApp = "51901486795";

    const mensaje =
        "Hola, quiero pedir este producto:\n\n" +
        "Producto: " + nombre + "\n" +
        "Precio: S/ " + precio + "\n" +
        "Color: " + color + "\n" +
        "Talla: " + talla;

    const enlace =
        "https://wa.me/" +
        numeroWhatsApp +
        "?text=" +
        encodeURIComponent(mensaje);

    window.open(enlace, "_blank");

}