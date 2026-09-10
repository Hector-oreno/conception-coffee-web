/* ==========================================================
   FAVORITOS DE LA CASA
   ========================================================== */

let favoritosDataGlobal = [];


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        cargarFavoritosDeLaCasa
    );

} else {

    cargarFavoritosDeLaCasa();

}


/* ==========================================================
   CARGAR PRODUCTOS DESTACADOS
   ========================================================== */

async function cargarFavoritosDeLaCasa() {

    const seccion =
        document.getElementById(
            "favoritos"
        );


    try {

        const response =
            await fetch(
                "/api/productos/destacados"
            );


        if (!response.ok) {

            throw new Error(
                "No fue posible consultar los productos destacados."
            );

        }


        const resultado =
            await response.json();


        if (
            !resultado.success ||
            !Array.isArray(resultado.data) ||
            resultado.data.length === 0
        ) {

            if (seccion) {
                seccion.style.display = "none";
            }

            return;

        }


        favoritosDataGlobal =
            resultado.data;


        renderizarPestañasCategorias(
            favoritosDataGlobal
        );


        filtrarYRenderizarFavoritos(
            "todos"
        );


    } catch (error) {

        console.error(
            "Error cargando los favoritos de la casa:",
            error
        );


        if (seccion) {
            seccion.style.display = "none";
        }

    }

}


/* ==========================================================
   CATEGORÍAS
   ========================================================== */

function renderizarPestañasCategorias(productos) {

    const tabsContainer =
        document.querySelector(
            ".featured-tabs"
        );


    if (!tabsContainer) {
        return;
    }


    tabsContainer.innerHTML = "";


    const mapaCategorias =
        new Map();


    productos.forEach(producto => {

        if (
            producto.categoria_slug &&
            !mapaCategorias.has(
                producto.categoria_slug
            )
        ) {

            mapaCategorias.set(
                producto.categoria_slug,
                producto.categoria_nombre ||
                producto.categoria_slug
            );

        }

    });


    crearBotonCategoria(
        tabsContainer,
        "todos",
        "Todos",
        true
    );


    mapaCategorias.forEach(
        (nombre, slug) => {

            crearBotonCategoria(
                tabsContainer,
                slug,
                nombre,
                false
            );

        }
    );

}


/* ==========================================================
   CREAR BOTÓN DE CATEGORÍA
   ========================================================== */

function crearBotonCategoria(
    contenedor,
    categoria,
    texto,
    activo
) {

    const boton =
        document.createElement(
            "button"
        );


    boton.type =
        "button";


    boton.className =
        `tab-btn${activo ? " active" : ""}`;


    boton.dataset.categoria =
        categoria;


    boton.textContent =
        texto;


    boton.setAttribute(
        "aria-pressed",
        activo ? "true" : "false"
    );


    boton.addEventListener(
        "click",
        () => {

            contenedor
                .querySelectorAll(
                    ".tab-btn"
                )
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                    item.setAttribute(
                        "aria-pressed",
                        "false"
                    );

                });


            boton.classList.add(
                "active"
            );


            boton.setAttribute(
                "aria-pressed",
                "true"
            );


            filtrarYRenderizarFavoritos(
                categoria
            );

        }
    );


    contenedor.appendChild(
        boton
    );

}


/* ==========================================================
   FILTRAR Y RENDERIZAR
   ========================================================== */

function filtrarYRenderizarFavoritos(
    categoriaSlug
) {

    const carousel =
        document.getElementById(
            "carousel-destacados"
        );


    if (!carousel) {
        return;
    }


    const productos =
        categoriaSlug === "todos"

            ? favoritosDataGlobal

            : favoritosDataGlobal.filter(
                producto =>
                    producto.categoria_slug ===
                    categoriaSlug
            );


    carousel.innerHTML = "";


    if (productos.length === 0) {

        const mensaje =
            document.createElement(
                "p"
            );


        mensaje.className =
            "no-data";


        mensaje.textContent =
            "No hay productos disponibles en esta categoría.";


        carousel.appendChild(
            mensaje
        );


        return;

    }


    productos.forEach(
        producto => {

            carousel.appendChild(
                crearFavorito(
                    producto
                )
            );

        }
    );


    // Volver al inicio al cambiar categoría
    carousel.scrollTo({
        left: 0,
        behavior: "smooth"
    });

}


/* ==========================================================
   CREAR PRODUCTO FAVORITO
   ========================================================== */

function crearFavorito(producto) {

    const articulo =
        document.createElement(
            "article"
        );


    articulo.className =
        "featured-card";


    /* ------------------------------
       IMAGEN
       ------------------------------ */

    const imagenValida =
        obtenerImagenProducto(
            producto.imagen
        );


    const visual =
        document.createElement(
            "div"
        );


    visual.className =
        imagenValida
            ? "featured-visual"
            : "featured-visual featured-visual-fallback";


    if (imagenValida) {

        const imagen =
            document.createElement(
                "img"
            );


        imagen.src =
            imagenValida;


        imagen.alt =
            producto.nombre
                ? `${producto.nombre} de Conception Coffee`
                : "Producto destacado de Conception Coffee";


        imagen.loading =
            "lazy";


        imagen.addEventListener(
            "error",
            () => {

                imagen.remove();

                visual.classList.add(
                    "featured-visual-fallback"
                );

                crearFallbackVisual(
                    visual
                );

            },
            { once: true }
        );


        visual.appendChild(
            imagen
        );

    } else {

        crearFallbackVisual(
            visual
        );

    }


    /* ------------------------------
       INFORMACIÓN
       ------------------------------ */

    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "featured-content";


    
    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        producto.nombre ||
        "Producto Conception Coffee";


    const linea =
        document.createElement(
            "span"
        );


    linea.className =
        "featured-line";


    linea.setAttribute(
        "aria-hidden",
        "true"
    );


    contenido.append(
        
        titulo,
        linea
    );


    articulo.append(
        visual,
        contenido
    );


    return articulo;

}


/* ==========================================================
   FALLBACK SIN FOTOGRAFÍA
   ========================================================== */

function crearFallbackVisual(
    contenedor
) {

    if (
        contenedor.children.length > 0
    ) {
        return;
    }


    const etiqueta =
        document.createElement(
            "span"
        );


    etiqueta.textContent =
        "Conception Coffee";


    contenedor.appendChild(
        etiqueta
    );

}


/* ==========================================================
   NORMALIZAR IMAGEN
   ========================================================== */

function obtenerImagenProducto(
    imagen
) {

    if (
        !imagen ||
        typeof imagen !== "string" ||
        imagen.trim() === ""
    ) {

        return null;

    }


    const ruta =
        imagen.trim();


    /*
     * Logo_carta es un fallback administrativo,
     * no una fotografía real del producto.
     */
    if (
        ruta.toLowerCase().includes(
            "logo_carta"
        )
    ) {

        return null;

    }


    if (
        ruta.startsWith("http://") ||
        ruta.startsWith("https://")
    ) {

        return ruta;

    }


    return ruta.startsWith("/")
        ? ruta
        : `/${ruta}`;

}