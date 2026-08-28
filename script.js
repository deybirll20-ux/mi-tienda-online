// =====================================================
// CONEXIÓN CON SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://yuivmqncvmsbtiigxsqt.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_r1ZMaIIEVcAt26_P-FBu9Q_DUenqDH_";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// INICIAR SESIÓN
// =====================================================

async function iniciarSesion() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const mensaje =
        document.getElementById("mensaje");

    if (!email || !password) {

        mensaje.textContent =
            "Completa todos los campos.";

        mensaje.style.color = "red";

        return;
    }

    mensaje.textContent =
        "Ingresando...";

    try {

        const {
            data,
            error
        } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });

        if (error) {

            console.error(error);

            mensaje.textContent =
                "Correo o contraseña incorrectos.";

            mensaje.style.color = "red";

            return;
        }

        mensaje.textContent =
            "Inicio de sesión correcto.";

        mensaje.style.color =
            "green";

        setTimeout(() => {

            window.location.href =
                "admin.html";

        }, 500);

    }

    catch(error) {

        console.error(error);

        mensaje.textContent =
            "No se pudo conectar con Supabase.";

        mensaje.style.color =
            "red";
    }
}


// =====================================================
// COMPROBAR SESIÓN
// =====================================================

async function comprobarSesion() {

    const {
        data,
        error
    } =
    await supabaseClient.auth.getSession();

    if (error) {

        console.error(error);

        return null;
    }

    return data.session;
}


// =====================================================
// PROTEGER ADMIN
// =====================================================

async function protegerAdmin() {

    const session =
        await comprobarSesion();

    if (!session) {

        window.location.href =
            "admin-login.html";

        return false;
    }

    return true;
}


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function cerrarSesion() {

    const {
        error
    } =
    await supabaseClient.auth.signOut();

    if (error) {

        console.error(error);

        return;
    }

    window.location.href =
        "admin-login.html";
}


// =====================================================
// PUBLICAR PRODUCTO EN SUPABASE
// =====================================================

async function publicarProducto() {

    const nombre =
        document
        .getElementById("nombreProducto")
        .value.trim();

    const archivo =
        document
        .getElementById("imagenProducto")
        .files[0];

    const color =
        document
        .getElementById("colorProducto")
        .value.trim();

    const talla =
        document
        .getElementById("tallaProducto")
        .value.trim();

    const precio =
        document
        .getElementById("precioProducto")
        .value;

    const mensaje =
        document
        .getElementById("mensaje");


    if (
        !nombre ||
        !archivo ||
        !color ||
        !talla ||
        !precio
    ) {

        mensaje.textContent =
            "Completa todos los campos.";

        mensaje.style.color =
            "red";

        return;
    }


    mensaje.textContent =
        "Publicando producto...";

    mensaje.style.color =
        "#333";


    try {

        // -------------------------------------------------
        // Convertir imagen a Base64
        // -------------------------------------------------

        const imagen =
            await convertirImagenBase64(archivo);


        // -------------------------------------------------
        // Insertar en Supabase
        // -------------------------------------------------

        const {
            data,
            error
        } =
        await supabaseClient
        .from("productos")
        .insert({

            nombre: nombre,

            imagen: imagen,

            color: color,

            talla: talla,

            precio: Number(precio),

            activo: true

        })
        .select();


        if (error) {

            console.error(
                "Error Supabase:",
                error
            );

            mensaje.textContent =
                "Error al publicar: " +
                error.message;

            mensaje.style.color =
                "red";

            return;
        }


        console.log(
            "Producto guardado:",
            data
        );


        mensaje.textContent =
            "Producto publicado correctamente.";

        mensaje.style.color =
            "green";


        limpiarFormulario();

        cargarProductos();

    }

    catch(error) {

        console.error(error);

        mensaje.textContent =
            "Ocurrió un error al publicar.";

        mensaje.style.color =
            "red";
    }
}


// =====================================================
// CONVERTIR IMAGEN A BASE64
// =====================================================

function convertirImagenBase64(archivo) {

    return new Promise((resolve, reject) => {

        const lector =
            new FileReader();

        lector.onload = () => {

            resolve(
                lector.result
            );

        };

        lector.onerror = reject;

        lector.readAsDataURL(archivo);

    });
}


// =====================================================
// CARGAR PRODUCTOS DESDE SUPABASE
// =====================================================

async function cargarProductos() {

    const contenedor =
        document.getElementById(
            "listaProductos"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML =
        "<p>Cargando productos...</p>";


    try {

        const {
            data,
            error
        } =
        await supabaseClient
        .from("productos")
        .select("*")
        .eq("activo", true)
        .order(
            "creado_en",
            {
                ascending: false
            }
        );


        if (error) {

            console.error(error);

            contenedor.innerHTML =
                "<p>Error al cargar productos.</p>";

            return;
        }


        contenedor.innerHTML = "";


        if (!data || data.length === 0) {

            contenedor.innerHTML =
                "<p>Todavía no hay productos publicados.</p>";

            return;
        }


        data.forEach(producto => {

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "producto";


            tarjeta.innerHTML = `

                <img
                    src="${producto.imagen || ""}"
                    alt="${escapeHTML(producto.nombre || "")}"
                >

                <div class="producto-info">

                    <h3>
                        ${escapeHTML(producto.nombre || "")}
                    </h3>

                    <p>
                        Precio: S/ ${producto.precio || "0.00"}
                    </p>

                    <p>
                        Color: ${escapeHTML(producto.color || "")}
                    </p>

                    <p>
                        Talla: ${escapeHTML(producto.talla || "")}
                    </p>

                    <div class="acciones">

                        <button
                            class="editar"
                            onclick="editarProducto('${producto.id}')">

                            EDITAR

                        </button>

                        <button
                            class="eliminar"
                            onclick="eliminarProducto('${producto.id}')">

                            ELIMINAR

                        </button>

                    </div>

                </div>
            `;


            contenedor.appendChild(
                tarjeta
            );

        });

    }

    catch(error) {

        console.error(error);

        contenedor.innerHTML =
            "<p>Error inesperado.</p>";
    }
}


// =====================================================
// EDITAR PRODUCTO
// =====================================================

async function editarProducto(id) {

    try {

        const {
            data: producto,
            error
        } =
        await supabaseClient
        .from("productos")
        .select("*")
        .eq("id", id)
        .single();


        if (error || !producto) {

            alert(
                "No se encontró el producto."
            );

            return;
        }


        document
        .getElementById("nombreProducto")
        .value =
            producto.nombre || "";


        document
        .getElementById("colorProducto")
        .value =
            producto.color || "";


        document
        .getElementById("tallaProducto")
        .value =
            producto.talla || "";


        document
        .getElementById("precioProducto")
        .value =
            producto.precio || "";


        // Guardamos el ID que estamos editando

        document
        .getElementById("nombreProducto")
        .dataset.editando =
            id;


        abrirVentana(
            "ventanaSubir"
        );

    }

    catch(error) {

        console.error(error);
    }
}


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

async function eliminarProducto(id) {

    const confirmar =
        confirm(
            "¿Quieres eliminar este producto?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const {
            error
        } =
        await supabaseClient
        .from("productos")
        .delete()
        .eq("id", id);


        if (error) {

            console.error(error);

            alert(
                "No se pudo eliminar el producto."
            );

            return;
        }


        alert(
            "Producto eliminado correctamente."
        );


        cargarProductos();

    }

    catch(error) {

        console.error(error);
    }
}


// =====================================================
// LIMPIAR FORMULARIO
// =====================================================

function limpiarFormulario() {

    document
    .getElementById(
        "nombreProducto"
    )
    .value = "";


    document
    .getElementById(
        "imagenProducto"
    )
    .value = "";


    document
    .getElementById(
        "colorProducto"
    )
    .value = "";


    document
    .getElementById(
        "tallaProducto"
    )
    .value = "";


    document
    .getElementById(
        "precioProducto"
    )
    .value = "";


    document
    .getElementById(
        "nombreProducto"
    )
    .dataset.editando = "";
}


// =====================================================
// SEGURIDAD HTML
// =====================================================

function escapeHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto;

    return div.innerHTML;
}


// =====================================================
// INICIAR ADMIN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        const esAdmin =
            document.getElementById(
                "listaProductos"
            );

        if (esAdmin) {

            const protegido =
                await protegerAdmin();

            if (!protegido) {
                return;
            }

            cargarProductos();
        }

    }
);
