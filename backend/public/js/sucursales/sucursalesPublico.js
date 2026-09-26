// ==========================================================
// SUCURSALES · SITIO PÚBLICO
// ==========================================================

let listaSucursales = [];

let indiceSucursalActual = 0;


// ==========================================================
// INICIALIZACIÓN
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarSucursalesCliente();

    }
);


// ==========================================================
// INICIALIZAR
// ==========================================================

async function inicializarSucursalesCliente() {

    const btnPrev =
        document.getElementById(
            "btnPrevBranch"
        );

    const btnNext =
        document.getElementById(
            "btnNextBranch"
        );


    if (btnPrev) {

        btnPrev.onclick = () => {

            moverSucursal(-1);

        };

    }


    if (btnNext) {

        btnNext.onclick = () => {

            moverSucursal(1);

        };

    }


    await cargarSucursalesSlider();

}


// ==========================================================
// CARGAR SUCURSALES
// ==========================================================

async function cargarSucursalesSlider() {

    const cardContainer =
        document.getElementById(
            "sucursalCardInfo"
        );


    if (!cardContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/sucursales"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                `Error HTTP ${response.status}`
            );

        }


        if (!Array.isArray(data)) {

            throw new Error(
                "Respuesta inválida de sucursales."
            );

        }


        // ==================================================
        // SOLO SUCURSALES ACTIVAS
        // ==================================================

        listaSucursales =
            data.filter(
                sucursal =>
                    Number(
                        sucursal.activa
                    ) === 1
            );


        // ==================================================
        // SIN SUCURSALES
        // ==================================================

        if (
            listaSucursales.length === 0
        ) {

            mostrarEstadoVacioSucursales();

            return;

        }


        indiceSucursalActual = 0;


        mostrarSucursalActual();


    } catch (error) {

        console.error(
            "Error cargando sucursales:",
            error
        );


        mostrarErrorSucursales();

    }

}


// ==========================================================
// MOSTRAR SUCURSAL ACTUAL
// ==========================================================

function mostrarSucursalActual() {

    const sucursal =
        listaSucursales[
            indiceSucursalActual
        ];


    if (!sucursal) {
        return;
    }


    actualizarImagenSucursal(
        sucursal
    );


    actualizarInformacionSucursal(
        sucursal
    );


    actualizarMapaSucursal(
        sucursal
    );


    actualizarContadorSucursales();


    actualizarNavegacionSucursales();

}


// ==========================================================
// IMAGEN
// ==========================================================

function actualizarImagenSucursal(
    sucursal
) {

    const imagen =
        document.getElementById(
            "sucursalImagen"
        );

    const etiqueta =
        document.getElementById(
            "sucursalImagenEtiqueta"
        );


    if (!imagen) {
        return;
    }


    imagen.src =
        sucursal.imagen_url ||
        "/images/uploads/logo_carta.png";


    imagen.alt =
        sucursal.imagen_url
            ? `${
                sucursal.nombre ||
                "Conception Coffee"
            }`
            : "Conception Coffee";


    imagen.classList.toggle(
        "branch-image-fallback",
        !sucursal.imagen_url
    );


    if (etiqueta) {

        etiqueta.textContent =
            sucursal.nombre ||
            "Conception Coffee";

    }

}


// ==========================================================
// INFORMACIÓN
// ==========================================================

function actualizarInformacionSucursal(
    sucursal
) {

    const card =
        document.getElementById(
            "sucursalCardInfo"
        );

    const indice =
        document.getElementById(
            "sucursalIndice"
        );

    const principal =
        document.getElementById(
            "sucursalPrincipal"
        );


    if (!card) {
        return;
    }


    card.innerHTML = "";


    if (indice) {

        indice.textContent =
            `${String(
                indiceSucursalActual + 1
            ).padStart(
                2,
                "0"
            )} — SEDE`;

    }


    if (principal) {

        principal.hidden =
            Number(
                sucursal.es_principal
            ) !== 1;

    }


    // ======================================================
    // NOMBRE
    // ======================================================

    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        sucursal.nombre ||
        "Conception Coffee";


    card.appendChild(
        titulo
    );


    // ======================================================
    // DETALLES
    // ======================================================

    const detalles =
        document.createElement(
            "div"
        );


    detalles.className =
        "branch-details";


    if (sucursal.direccion) {

        detalles.appendChild(
            crearDetalleSucursal(
                "fa-location-dot",
                "Dirección",
                sucursal.direccion
            )
        );

    }


    if (sucursal.horario) {

        detalles.appendChild(
            crearDetalleSucursal(
                "fa-clock",
                "Horario",
                sucursal.horario
            )
        );

    }


    if (sucursal.telefono) {

        detalles.appendChild(
            crearDetalleSucursal(
                "fa-phone",
                "Teléfono",
                sucursal.telefono,
                crearTelefonoSucursal(
                    sucursal.telefono
                )
            )
        );

    }


    if (
        detalles.children.length === 0
    ) {

        const vacio =
            document.createElement(
                "p"
            );


        vacio.className =
            "branch-info-empty";


        vacio.textContent =
            "La información de esta sede estará disponible próximamente.";


        detalles.appendChild(
            vacio
        );

    }


    card.appendChild(
        detalles
    );

}


// ==========================================================
// CREAR DETALLE
// ==========================================================

function crearDetalleSucursal(
    icono,
    etiqueta,
    valor,
    contenidoPersonalizado = null
) {

    const fila =
        document.createElement(
            "div"
        );


    fila.className =
        "branch-detail";


    const iconoContenedor =
        document.createElement(
            "span"
        );


    iconoContenedor.className =
        "branch-detail-icon";


    iconoContenedor.innerHTML = `

        <i
            class="fas ${icono}"
            aria-hidden="true"
        ></i>

    `;


    const contenido =
        document.createElement(
            "div"
        );


    const label =
        document.createElement(
            "span"
        );


    label.className =
        "branch-detail-label";


    label.textContent =
        etiqueta;


    const valorElemento =
        document.createElement(
            "div"
        );


    valorElemento.className =
        "branch-detail-value";


    if (contenidoPersonalizado) {

        valorElemento.appendChild(
            contenidoPersonalizado
        );

    } else {

        valorElemento.textContent =
            valor;

    }


    contenido.append(
        label,
        valorElemento
    );


    fila.append(
        iconoContenedor,
        contenido
    );


    return fila;

}


// ==========================================================
// TELÉFONO
// ==========================================================

function crearTelefonoSucursal(
    telefono
) {

    const enlace =
        document.createElement(
            "a"
        );


    const numeroLimpio =
        String(
            telefono
        ).replace(
            /[^\d+]/g,
            ""
        );


    enlace.href =
        `tel:${numeroLimpio}`;


    enlace.textContent =
        telefono;


    return enlace;

}


// ==========================================================
// MAPA
// ==========================================================

function actualizarMapaSucursal(
    sucursal
) {

    const seccion =
        document.getElementById(
            "branchMapSection"
        );

    const iframe =
        document.getElementById(
            "mapaDinamico"
        );

    const enlace =
        document.getElementById(
            "branchMapLink"
        );


    const tieneMapa =
        Boolean(
            sucursal.mapa_url
        );


    if (seccion) {

        seccion.hidden =
            !tieneMapa;

    }


    if (iframe) {

        if (tieneMapa) {

            iframe.src =
                sucursal.mapa_url;


            iframe.title =
                `Ubicación de ${
                    sucursal.nombre ||
                    "Conception Coffee"
                }`;

        } else {

            iframe.removeAttribute(
                "src"
            );

        }

    }


    if (enlace) {

        enlace.hidden =
            !tieneMapa;


        if (tieneMapa) {

            enlace.href =
                sucursal.mapa_url;

        } else {

            enlace.removeAttribute(
                "href"
            );

        }

    }

}


// ==========================================================
// NAVEGACIÓN
// ==========================================================

function moverSucursal(
    direccion
) {

    if (
        listaSucursales.length <= 1
    ) {
        return;
    }


    indiceSucursalActual +=
        direccion;


    if (
        indiceSucursalActual >=
        listaSucursales.length
    ) {

        indiceSucursalActual = 0;

    }


    if (
        indiceSucursalActual < 0
    ) {

        indiceSucursalActual =
            listaSucursales.length - 1;

    }


    mostrarSucursalActual();

}


// ==========================================================
// CONTADOR
// ==========================================================

function actualizarContadorSucursales() {

    const actual =
        document.getElementById(
            "sucursalActual"
        );

    const total =
        document.getElementById(
            "sucursalTotal"
        );


    if (actual) {

        actual.textContent =
            String(
                indiceSucursalActual + 1
            ).padStart(
                2,
                "0"
            );

    }


    if (total) {

        total.textContent =
            String(
                listaSucursales.length
            ).padStart(
                2,
                "0"
            );

    }

}


// ==========================================================
// MOSTRAR / OCULTAR FLECHAS
// ==========================================================

function actualizarNavegacionSucursales() {

    const navegacion =
        document.querySelector(
            ".branches-navigation"
        );


    if (!navegacion) {
        return;
    }


    navegacion.hidden =
        listaSucursales.length <= 1;

}


// ==========================================================
// ESTADO VACÍO
// ==========================================================

function mostrarEstadoVacioSucursales() {

    const card =
        document.getElementById(
            "sucursalCardInfo"
        );


    if (!card) {
        return;
    }


    card.innerHTML = `

        <div class="branch-state">

            <i
                class="fas fa-location-dot"
                aria-hidden="true"
            ></i>

            <strong>
                Próximamente
            </strong>

            <p>
                Estamos preparando la información
                de nuestras sedes.
            </p>

        </div>

    `;

}


// ==========================================================
// ERROR
// ==========================================================

function mostrarErrorSucursales() {

    const card =
        document.getElementById(
            "sucursalCardInfo"
        );


    if (!card) {
        return;
    }


    card.innerHTML = `

        <div class="branch-state branch-state-error">

            <strong>
                No fue posible cargar las sucursales.
            </strong>

            <p>
                Intenta nuevamente en unos momentos.
            </p>

        </div>

    `;

}