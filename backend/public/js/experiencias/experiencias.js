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
// CARGAR LISTADO
// ==========================================================

async function cargarExperienciasAdmin() {

    const tbody =
        document.getElementById(
            "tbody-experiencias"
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


        tbody.innerHTML = "";


        if (
            !Array.isArray(resultado.data) ||
            resultado.data.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="text-center text-muted py-4"
                    >
                        <i
                            class="fas fa-images me-2"
                            aria-hidden="true"
                        ></i>

                        No hay registros en la sección
                        de experiencias.
                    </td>
                </tr>
            `;

            return;

        }


        resultado.data.forEach(
            experiencia => {

                const fila =
                    crearFilaExperiencia(
                        experiencia
                    );

                tbody.appendChild(
                    fila
                );

            }
        );


    } catch (error) {

        console.error(
            "Error al cargar experiencias:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="text-center text-danger py-4"
                >
                    <i
                        class="fas fa-exclamation-triangle me-2"
                        aria-hidden="true"
                    ></i>

                    Error al conectar con el servidor.
                </td>
            </tr>
        `;

    }

}


// ==========================================================
// CREAR FILA
// ==========================================================

function crearFilaExperiencia(
    experiencia
) {

    const fila =
        document.createElement(
            "tr"
        );


    // ID
    const tdId =
        document.createElement(
            "td"
        );

    tdId.className =
        "text-center fw-bold";

    tdId.textContent =
        experiencia.id;


    // IMAGEN
    const tdImagen =
        document.createElement(
            "td"
        );

    const imagen =
        document.createElement(
            "img"
        );

    imagen.src =
        experiencia.imagen_url;

    imagen.alt =
        experiencia.titulo
            ? `Miniatura de ${experiencia.titulo}`
            : "Miniatura de experiencia";

    imagen.className =
        "img-thumbnail";

    imagen.style.width =
        "70px";

    imagen.style.height =
        "50px";

    imagen.style.objectFit =
        "cover";

    tdImagen.appendChild(
        imagen
    );


    // TÍTULO
    const tdTitulo =
        document.createElement(
            "td"
        );

    tdTitulo.className =
        "fw-semibold";

    tdTitulo.textContent =
        experiencia.titulo ||
        "Sin título";


    // DISPONIBILIDAD
    const tdActivo =
        document.createElement(
            "td"
        );

    tdActivo.className =
        "text-center";

    tdActivo.innerHTML =
        experiencia.activo
            ? `
                <span
                    class="badge bg-success-subtle text-success px-2 py-1"
                >
                    <i
                        class="fas fa-check me-1"
                        aria-hidden="true"
                    ></i>
                    Activo
                </span>
            `
            : `
                <span
                    class="badge bg-danger-subtle text-danger px-2 py-1"
                >
                    <i
                        class="fas fa-times me-1"
                        aria-hidden="true"
                    ></i>
                    Inactivo
                </span>
            `;


    // PUBLICACIÓN
    const tdPublicacion =
        document.createElement(
            "td"
        );

    tdPublicacion.className =
        "text-center";

    tdPublicacion.innerHTML =
        experiencia.estado_publicacion ===
        "publicado"
            ? `
                <span
                    class="badge bg-info-subtle text-info px-2 py-1"
                >
                    <i
                        class="fas fa-globe me-1"
                        aria-hidden="true"
                    ></i>
                    Publicado
                </span>
            `
            : `
                <span
                    class="badge bg-warning-subtle text-warning px-2 py-1"
                >
                    <i
                        class="fas fa-edit me-1"
                        aria-hidden="true"
                    ></i>
                    Borrador
                </span>
            `;


    // ACCIONES
    const tdAcciones =
        document.createElement(
            "td"
        );

    tdAcciones.className =
        "text-center";


    const grupo =
        document.createElement(
            "div"
        );

    grupo.className =
        "btn-group btn-group-sm";


    const btnEstado =
        document.createElement(
            "button"
        );

    btnEstado.type =
        "button";

    btnEstado.className =
        "btn btn-outline-secondary";

    btnEstado.setAttribute(
        "aria-label",
        experiencia.activo
            ? "Ocultar experiencia"
            : "Activar experiencia"
    );

    btnEstado.innerHTML = `
        <i
            class="fas ${
                experiencia.activo
                    ? "fa-eye-slash"
                    : "fa-eye"
            }"
            aria-hidden="true"
        ></i>
    `;

    btnEstado.addEventListener(
        "click",
        () => {

            alternarEstadoExperiencia(
                experiencia.id,
                Number(
                    experiencia.activo
                )
            );

        }
    );


    const btnEliminar =
        document.createElement(
            "button"
        );

    btnEliminar.type =
        "button";

    btnEliminar.className =
        "btn btn-outline-danger";

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

    btnEliminar.addEventListener(
        "click",
        () => {

            eliminarExperienciaAdmin(
                experiencia.id
            );

        }
    );


    grupo.append(
        btnEstado,
        btnEliminar
    );

    tdAcciones.appendChild(
        grupo
    );


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
// ABRIR MODAL
// ==========================================================

function abrirModalExperiencia() {

    const formulario =
        document.getElementById(
            "form-experiencia"
        );

    const idInput =
        document.getElementById(
            "experiencia-id"
        );

    const modalElement =
        document.getElementById(
            "modalExperiencia"
        );


    if (formulario) {
        formulario.reset();
    }


    if (idInput) {
        idInput.value = "";
    }


    if (!modalElement) {
        return;
    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


// ==========================================================
// GUARDAR EXPERIENCIA
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


    if (
        !fileInput ||
        fileInput.files.length === 0
    ) {

        alert(
            "Por favor, selecciona una imagen para la experiencia."
        );

        return;

    }


    const formData =
        new FormData();


    formData.append(
        "titulo",
        tituloInput?.value?.trim() || ""
    );


    formData.append(
        "imagen",
        fileInput.files[0]
    );


    try {

        const respuesta =
            await fetch(
                "/api/experiencias",
                {
                    method: "POST",

                    /*
                     * No agregar Content-Type.
                     * El navegador genera automáticamente
                     * multipart/form-data + boundary.
                     */
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
            "Error al intentar subir el registro."
        );

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