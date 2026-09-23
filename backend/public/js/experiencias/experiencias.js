// ==========================================================
// AUTENTICACIÓN
// ==========================================================

function obtenerTokenExperiencias() {

    return localStorage.getItem(
        "token_conception"
    ) || null;

}


function headersExperiencias(
    headersAdicionales = {}
) {

    const token =
        obtenerTokenExperiencias();


    return {

        ...headersAdicionales,

        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {})

    };

}


// ==========================================================
// CARGAR EXPERIENCIAS EN EL PANEL ADMINISTRATIVO
// ==========================================================

async function cargarExperienciasAdmin() {

    const tbody =
        document.getElementById(
            "tbody-experiencias"
        );

    const contador =
        document.getElementById(
            "experienciasCount"
        );


    if (!tbody) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                "/api/experiencias/admin",
                {
                    headers:
                        headersExperiencias()
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${respuesta.status}`
            );

        }


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No fue posible cargar las experiencias."
            );

        }


        const experiencias =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        // ==============================================
        // CONTADOR
        // ==============================================

        if (contador) {

            contador.textContent =
                experiencias.length === 1
                    ? "1 experiencia"
                    : `${experiencias.length} experiencias`;

        }


        // ==============================================
        // ESTADO VACÍO
        // ==============================================

        if (experiencias.length === 0) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="experiencias-admin-empty"
                    >

                        <div
                            class="experiencias-admin-empty-icon"
                        >

                            <i class="far fa-images"></i>

                        </div>

                        <strong>
                            No hay experiencias registradas
                        </strong>

                        <p>
                            Agrega contenido para comenzar
                            a mostrar experiencias en el sitio.
                        </p>

                    </td>

                </tr>

            `;

            return;

        }


        // ==============================================
        // RENDER
        // ==============================================

        tbody.innerHTML = "";


        experiencias.forEach(
            experiencia => {

                tbody.appendChild(
                    crearFilaExperiencia(
                        experiencia
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "Error al cargar experiencias:",
            error
        );


        if (contador) {
            contador.textContent = "—";
        }


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="experiencias-admin-error"
                >

                    <i
                        class="fas fa-triangle-exclamation"
                    ></i>

                    <strong>
                        No fue posible cargar las experiencias.
                    </strong>

                    <span>
                        Intenta nuevamente en unos momentos.
                    </span>

                </td>

            </tr>

        `;

    }

}


// ==========================================================
// CREAR FILA DE EXPERIENCIA
// ==========================================================

function crearFilaExperiencia(
    experiencia
) {

    const fila =
        document.createElement(
            "tr"
        );


    const activo =
        Number(
            experiencia.activo
        ) === 1;


    const publicado =
        experiencia.estado_publicacion ===
        "publicado";


    // ======================================================
    // ID
    // ======================================================

    const tdId =
        document.createElement(
            "td"
        );


    tdId.className =
        "experiencia-id";


    tdId.innerHTML = `

        <span>
            ${experiencia.id}
        </span>

    `;


    // ======================================================
    // IMAGEN
    // ======================================================

    const tdImagen =
        document.createElement(
            "td"
        );


    tdImagen.innerHTML = `

        <div
            class="experiencia-preview"
        >

            <img
                src="${experiencia.imagen_url}"
                alt="${
                    experiencia.titulo
                        ? `Vista previa de ${experiencia.titulo}`
                        : "Vista previa de experiencia"
                }"
                loading="lazy"
            >

        </div>

    `;


    // ======================================================
    // INFORMACIÓN
    // ======================================================

    const tdTitulo =
        document.createElement(
            "td"
        );


    tdTitulo.innerHTML = `

        <div
            class="experiencia-info"
        >

            <strong>
                ${
                    experiencia.titulo ||
                    "Sin título"
                }
            </strong>

            <span>
                Experiencia de Conception Coffee
            </span>

        </div>

    `;


    // ======================================================
    // DISPONIBILIDAD
    // ======================================================

    const tdActivo =
        document.createElement(
            "td"
        );


    tdActivo.className =
        "experiencia-status-cell";


    tdActivo.innerHTML =
        activo
            ? `

                <span
                    class="
                        experiencia-status
                        experiencia-status-active
                    "
                >

                    <span
                        class="experiencia-status-dot"
                    ></span>

                    Activo

                </span>

            `
            : `

                <span
                    class="
                        experiencia-status
                        experiencia-status-inactive
                    "
                >

                    <span
                        class="experiencia-status-dot"
                    ></span>

                    Inactivo

                </span>

            `;


    // ======================================================
    // PUBLICACIÓN
    // ======================================================

    const tdPublicacion =
        document.createElement(
            "td"
        );


    tdPublicacion.className =
        "experiencia-status-cell";


    tdPublicacion.innerHTML =
        publicado
            ? `

                <span
                    class="
                        experiencia-status
                        experiencia-status-published
                    "
                >

                    <i
                        class="fas fa-globe"
                        aria-hidden="true"
                    ></i>

                    Publicado

                </span>

            `
            : `

                <span
                    class="
                        experiencia-status
                        experiencia-status-draft
                    "
                >

                    <i
                        class="far fa-clock"
                        aria-hidden="true"
                    ></i>

                    Borrador

                </span>

            `;


    // ======================================================
    // ACCIONES
    // ======================================================

    const tdAcciones =
        document.createElement(
            "td"
        );


    const acciones =
        document.createElement(
            "div"
        );


    acciones.className =
        "experiencia-actions";


    // VISIBILIDAD
    const btnEstado =
        document.createElement(
            "button"
        );


    btnEstado.type =
        "button";


    btnEstado.className =
        "experiencia-action-btn experiencia-action-visibility";


    btnEstado.title =
        activo
            ? "Ocultar experiencia"
            : "Activar experiencia";


    btnEstado.setAttribute(
        "aria-label",
        activo
            ? "Ocultar experiencia"
            : "Activar experiencia"
    );


    btnEstado.innerHTML = `

        <i
            class="fas ${
                activo
                    ? "fa-eye-slash"
                    : "fa-eye"
            }"
            aria-hidden="true"
        ></i>

    `;


    btnEstado.onclick = () => {

        alternarEstadoExperiencia(
            experiencia.id,
            Number(
                experiencia.activo
            )
        );

    };


    // ELIMINAR
    const btnEliminar =
        document.createElement(
            "button"
        );


    btnEliminar.type =
        "button";


    btnEliminar.className =
        "experiencia-action-btn experiencia-action-delete";


    btnEliminar.title =
        "Eliminar experiencia";


    btnEliminar.setAttribute(
        "aria-label",
        "Eliminar experiencia"
    );


    btnEliminar.innerHTML = `

        <i
            class="fas fa-trash-alt"
            aria-hidden="true"
        ></i>

    `;


    btnEliminar.onclick = () => {

        eliminarExperienciaAdmin(
            experiencia.id
        );

    };


    acciones.append(
        btnEstado,
        btnEliminar
    );


    tdAcciones.appendChild(
        acciones
    );


    // ======================================================
    // ARMAR FILA
    // ======================================================

    fila.append(
        tdId,
        tdImagen,
        tdTitulo,
        tdActivo,
        tdPublicacion,
        tdAcciones
    );


    return fila;

}

// ==========================================================
// PREVIEW · NUEVA EXPERIENCIA
// ==========================================================

function inicializarPreviewExperiencia() {

    const tituloInput =
        document.getElementById(
            "experiencia-titulo"
        );

    const imagenInput =
        document.getElementById(
            "experiencia-imagen"
        );

    const contenedor =
        document.getElementById(
            "experienciaPreviewContainer"
        );

    const preview =
        document.getElementById(
            "experienciaPreviewImage"
        );

    const tituloPreview =
        document.getElementById(
            "experienciaPreviewTitle"
        );

    const nombreArchivo =
        document.getElementById(
            "experienciaFileName"
        );


    if (
        !tituloInput ||
        !imagenInput ||
        !contenedor ||
        !preview
    ) {
        return;
    }


    // ==============================================
    // ACTUALIZAR TÍTULO EN TIEMPO REAL
    // ==============================================

    tituloInput.oninput = () => {

        if (!tituloPreview) {
            return;
        }

        tituloPreview.textContent =
            tituloInput.value.trim() ||
            "Nueva experiencia";

    };


    // ==============================================
    // PREVIEW DE IMAGEN
    // ==============================================

    imagenInput.onchange = () => {

        const archivo =
            imagenInput.files?.[0];


        if (!archivo) {

            preview.removeAttribute(
                "src"
            );

            contenedor.classList.add(
                "experiencia-preview-hidden"
            );

            if (nombreArchivo) {
                nombreArchivo.textContent = "";
            }

            return;

        }


        if (
            !archivo.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Selecciona un archivo de imagen válido."
            );

            imagenInput.value = "";

            return;

        }


        const lector =
            new FileReader();


        lector.onload = evento => {

            preview.src =
                evento.target.result;

            contenedor.classList.remove(
                "experiencia-preview-hidden"
            );

            if (nombreArchivo) {

                nombreArchivo.textContent =
                    archivo.name;

            }

            if (tituloPreview) {

                tituloPreview.textContent =
                    tituloInput.value.trim() ||
                    "Nueva experiencia";

            }

        };


        lector.readAsDataURL(
            archivo
        );

    };

}




// ==========================================================
// ABRIR MODAL · NUEVA EXPERIENCIA
// ==========================================================

function abrirModalExperiencia() {

    const formulario =
        document.getElementById(
            "form-experiencia"
        );

    const modalElement =
        document.getElementById(
            "modalExperiencia"
        );

    const contenedorPreview =
        document.getElementById(
            "experienciaPreviewContainer"
        );

    const preview =
        document.getElementById(
            "experienciaPreviewImage"
        );

    const tituloPreview =
        document.getElementById(
            "experienciaPreviewTitle"
        );

    const nombreArchivo =
        document.getElementById(
            "experienciaFileName"
        );


    if (formulario) {
        formulario.reset();
    }


    if (contenedorPreview) {

        contenedorPreview.classList.add(
            "experiencia-preview-hidden"
        );

    }


    if (preview) {

        preview.removeAttribute(
            "src"
        );

    }


    if (tituloPreview) {

        tituloPreview.textContent =
            "Nueva experiencia";

    }


    if (nombreArchivo) {

        nombreArchivo.textContent = "";

    }


    inicializarPreviewExperiencia();


    if (!modalElement) {

        console.error(
            "No se encontró el modal de experiencias."
        );

        return;

    }


    const modal =
        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            );


    modal.show();

}


// ==========================================================
// GUARDAR NUEVA EXPERIENCIA
// ==========================================================

async function guardarExperiencia(
    event
) {

    event.preventDefault();


    const tituloInput =
        document.getElementById(
            "experiencia-titulo"
        );

    const fileInput =
        document.getElementById(
            "experiencia-imagen"
        );

    const botonGuardar =
        event.submitter;


    const titulo =
        tituloInput?.value?.trim() ||
        "";


    if (!titulo) {

        alert(
            "Escribe un título para la experiencia."
        );

        tituloInput?.focus();

        return;

    }


    if (
        !fileInput ||
        fileInput.files.length === 0
    ) {

        alert(
            "Selecciona una imagen para la experiencia."
        );

        return;

    }


    const archivo =
        fileInput.files[0];


    const formData =
        new FormData();


    formData.append(
        "titulo",
        titulo
    );


    formData.append(
        "imagen",
        archivo
    );


    // ==============================================
    // EVITAR DOBLE ENVÍO
    // ==============================================

    if (botonGuardar) {

        botonGuardar.disabled =
            true;

        botonGuardar.innerHTML = `

            <i class="fas fa-spinner fa-spin"></i>

            Guardando...

        `;

    }


    try {

        const respuesta =
            await fetch(
                "/api/experiencias",
                {
                    method: "POST",

                    headers:
                        headersExperiencias(),

                    body:
                        formData
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${respuesta.status}`
            );

        }


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No fue posible guardar la experiencia."
            );

        }


        cerrarModalExperiencia();


        alert(
            "Experiencia guardada correctamente como borrador."
        );


        await cargarExperienciasAdmin();


    } catch (error) {

        console.error(
            "Error al guardar experiencia:",
            error
        );


        alert(
            error.message ||
            "No fue posible guardar la experiencia."
        );


    } finally {

        if (botonGuardar) {

            botonGuardar.disabled =
                false;

            botonGuardar.innerHTML = `

                <i class="fas fa-plus"></i>

                Agregar Experiencia

            `;

        }

    }

}


// ==========================================================
// CERRAR MODAL SIN DEJAR EL FOCO ATRAPADO
// ==========================================================

function cerrarModalExperiencia() {

    const modalElement =
        document.getElementById(
            "modalExperiencia"
        );


    if (!modalElement) {
        return;
    }


    /*
     * El warning de aria-hidden ocurría porque
     * el botón dentro del modal conservaba el foco
     * mientras Bootstrap ocultaba el modal.
     */
    if (
        document.activeElement &&
        modalElement.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    if (modal) {
        modal.hide();
    }

}


// ==========================================================
// CAMBIAR VISIBILIDAD
// ==========================================================

async function alternarEstadoExperiencia(
    id,
    estadoActual
) {

    const nuevoEstado =
        Number(estadoActual) === 1
            ? 0
            : 1;


    try {

        const respuesta =
            await fetch(
                `/api/experiencias/${id}`,
                {
                    method: "PUT",

                    headers:
                        headersExperiencias({
                            "Content-Type":
                                "application/json"
                        }),

                    body:
                        JSON.stringify({
                            activo:
                                nuevoEstado
                        })
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${respuesta.status}`
            );

        }


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No fue posible cambiar la visibilidad."
            );

        }


        await cargarExperienciasAdmin();


    } catch (error) {

        console.error(
            "Error al cambiar visibilidad:",
            error
        );

    }

}


// ==========================================================
// ELIMINAR EXPERIENCIA
// ==========================================================

async function eliminarExperienciaAdmin(
    id
) {

    const confirmado =
        confirm(
            "¿Estás seguro de eliminar permanentemente esta experiencia? Se borrará el archivo del servidor."
        );


    if (!confirmado) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `/api/experiencias/${id}`,
                {
                    method: "DELETE",

                    headers:
                        headersExperiencias()
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${respuesta.status}`
            );

        }


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No fue posible eliminar la experiencia."
            );

        }


        alert(
            "Experiencia eliminada con éxito."
        );


        await cargarExperienciasAdmin();


    } catch (error) {

        console.error(
            "Error al eliminar:",
            error
        );


        alert(
            error.message ||
            "No fue posible eliminar la experiencia."
        );

    }

}


// ==========================================================
// PUBLICAR EN EL SITIO WEB
// ==========================================================

async function publicarExperienciasAlCliente() {

    try {

        const respuesta =
            await fetch(
                "/api/experiencias/publicar",
                {
                    method: "PUT",

                    headers:
                        headersExperiencias()
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${respuesta.status}`
            );

        }


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No fue posible publicar las experiencias."
            );

        }


        alert(
            "¡Sincronizado! Las experiencias ya son visibles para tus clientes."
        );


        await cargarExperienciasAdmin();


    } catch (error) {

        console.error(
            "Error al publicar cambios:",
            error
        );


        alert(
            error.message ||
            "Ocurrió un error al publicar."
        );

    }

}