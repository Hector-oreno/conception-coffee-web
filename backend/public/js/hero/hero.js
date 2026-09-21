// ==========================================================
// AUTENTICACIÓN HERO
// ==========================================================

function obtenerTokenHero() {

    return localStorage.getItem(
        "token_conception"
    ) || null;

}


function headersHero(
    headersAdicionales = {}
) {

    const token =
        obtenerTokenHero();


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
// CARGAR SLIDERS EN EL PANEL ADMINISTRATIVO
// ==========================================================

async function cargarSlidersAdmin() {

    const tbody =
        document.getElementById(
            "tbody-sliders"
        );

    const contador =
        document.getElementById(
            "heroSliderCount"
        );


    if (!tbody) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                "/api/hero/admin",
                {
                    headers:
                        headersHero()
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
                "No fue posible cargar los sliders."
            );

        }


        const sliders =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        // ==================================================
        // ACTUALIZAR CONTADOR
        // ==================================================

        if (contador) {

            contador.textContent =
                sliders.length === 1
                    ? "1 slider"
                    : `${sliders.length} sliders`;

        }


        // ==================================================
        // ESTADO VACÍO
        // ==================================================

        if (sliders.length === 0) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="hero-admin-empty"
                    >

                        <div class="hero-admin-empty-icon">

                            <i class="far fa-images"></i>

                        </div>

                        <strong>
                            No hay sliders registrados
                        </strong>

                        <p>
                            Agrega una imagen para comenzar
                            a preparar la portada del sitio.
                        </p>

                    </td>

                </tr>

            `;

            return;

        }


        // ==================================================
        // RENDERIZAR SLIDERS
        // ==================================================

        tbody.innerHTML =
            sliders
                .map((slider, index) => {

                    const activo =
                        Number(slider.activo) === 1;


                    const publicado =
                        slider.estado_publicacion ===
                        "publicado";

                    const esPrimero =
                        index === 0;


                    const esUltimo =
                        index ===
                        sliders.length - 1;
                    


                    const estadoDisponibilidad =
                        activo
                            ? `
                                <span
                                    class="hero-status
                                    hero-status-active"
                                >
                                    <span
                                        class="hero-status-dot"
                                    ></span>

                                    Activo
                                </span>
                            `
                            : `
                                <span
                                    class="hero-status
                                    hero-status-inactive"
                                >
                                    <span
                                        class="hero-status-dot"
                                    ></span>

                                    Inactivo
                                </span>
                            `;


                    const estadoPublicacion =
                        publicado
                            ? `
                                <span
                                    class="hero-status
                                    hero-status-published"
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
                                    class="hero-status
                                    hero-status-draft"
                                >
                                    <i
                                        class="far fa-clock"
                                        aria-hidden="true"
                                    ></i>

                                    Borrador
                                </span>
                            `;


                    return `

                        <tr>

                            <!-- ORDEN -->
                            <td
                                class="hero-slider-order"
                            >

                                <span>
                                    ${slider.orden}
                                </span>

                            </td>


                            <!-- PREVIEW -->
                            <td>

                                <div
                                    class="hero-slider-preview"
                                >

                                    <img
                                        src="${slider.imagen_url}"
                                        alt="Vista previa del slider ${slider.orden}"
                                        loading="lazy"
                                    >

                                </div>

                            </td>


                            <!-- ARCHIVO -->
                            <td>

                                <div
                                    class="hero-slider-file"
                                    title="${slider.imagen_url}"
                                >

                                    <i
                                        class="far fa-image"
                                        aria-hidden="true"
                                    ></i>

                                    <span>
                                        ${slider.imagen_url}
                                    </span>

                                </div>

                            </td>


                            <!-- DISPONIBILIDAD -->
                            <td>

                                ${estadoDisponibilidad}

                            </td>


                            <!-- PUBLICACIÓN -->
                            <td>

                                ${estadoPublicacion}

                            </td>


                            <!-- ACCIONES -->
                            <td>

                                <div class="hero-slider-actions">


                                    ${
                                        !esPrimero
                                            ? `
                                                <button
                                                type="button"
                                                class="hero-action-btn
                                                hero-action-order"
                                                onclick="moverSlider(
                                                    ${slider.id},
                                                    'arriba'
                                                )"
                                                title="Mover hacia arriba"
                                                aria-label="Mover slider hacia arriba"
                                            >

                                                <i
                                                    class="fas fa-arrow-up"
                                                    aria-hidden="true"
                                                ></i>

                                            </button>
                                        `
                                        : ""
                                }


                                ${
                                    !esUltimo
                                        ? `
                                            <button
                                                type="button"
                                                class="hero-action-btn
                                                hero-action-order"
                                                onclick="moverSlider(
                                                    ${slider.id},
                                                    'abajo'
                                                )"
                                                title="Mover hacia abajo"
                                                aria-label="Mover slider hacia abajo"
                                            >

                                                <i
                                                    class="fas fa-arrow-down"
                                                    aria-hidden="true"
                                                ></i>

                                            </button>
                                        `
                                        : ""
                                }


                                <button
                                    type="button"
                                    class="hero-action-btn
                                    hero-action-visibility"
                                    onclick="alternarEstadoSlider(
                                        ${slider.id},
                                        ${slider.orden},
                                        ${slider.activo}
                                    )"
                                    title="${
                                        activo
                                            ? "Desactivar slider"
                                            : "Activar slider"
                                    }"
                                    aria-label="${
                                        activo
                                            ? "Desactivar slider"
                                            : "Activar slider"
                                    }"
                                >

                                    <i
                                        class="fas ${
                                            activo
                                                ? "fa-eye-slash"
                                                : "fa-eye"
                                        }"
                                        aria-hidden="true"
                                    ></i>

                                </button>


                                <button
                                    type="button"
                                    class="hero-action-btn
                                    hero-action-delete"
                                    onclick="eliminarSliderAdmin(
                                        ${slider.id}
                                    )"
                                    title="Eliminar slider"
                                    aria-label="Eliminar slider"
                                >

                                    <i
                                        class="fas fa-trash-alt"
                                        aria-hidden="true"
                                    ></i>

                                </button>

                            </div>

                        </td>

                        </tr>

                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Error al cargar sliders:",
            error
        );


        if (contador) {

            contador.textContent =
                "—";

        }


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="hero-admin-error"
                >

                    <i
                        class="fas fa-triangle-exclamation"
                    ></i>

                    <strong>
                        No fue posible cargar los sliders.
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
// PREVIEW DE IMAGEN DEL NUEVO SLIDER
// ==========================================================

function inicializarPreviewSlider() {

    const input =
        document.getElementById(
            "slider-imagen"
        );

    const contenedor =
        document.getElementById(
            "contenedor-preview"
        );

    const preview =
        document.getElementById(
            "slider-preview"
        );

    const nombreArchivo =
        document.getElementById(
            "heroSliderFileName"
        );


    if (
        !input ||
        !contenedor ||
        !preview
    ) {

        return;

    }


    input.onchange = () => {

        const archivo =
            input.files?.[0];


        if (!archivo) {

            preview.removeAttribute(
                "src"
            );

            contenedor.classList.add(
                "hero-slider-preview-hidden"
            );

            if (nombreArchivo) {

                nombreArchivo.textContent =
                    "";

            }

            return;

        }


        // ==============================================
        // VALIDAR ARCHIVO
        // ==============================================

        if (
            !archivo.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Selecciona un archivo de imagen válido."
            );

            input.value = "";

            return;

        }


        // ==============================================
        // GENERAR PREVIEW LOCAL
        // ==============================================

        const lector =
            new FileReader();


        lector.onload = evento => {

            preview.src =
                evento.target.result;


            contenedor.classList.remove(
                "hero-slider-preview-hidden"
            );


            if (nombreArchivo) {

                nombreArchivo.textContent =
                    archivo.name;

            }

        };


        lector.readAsDataURL(
            archivo
        );

    };

}



// ==========================================================
// ABRIR MODAL · NUEVO SLIDER
// ==========================================================

function abrirModalSlider() {

    const formulario =
        document.getElementById(
            "form-slider"
        );


    if (formulario) {

        formulario.reset();

    }


    const contenedorPreview =
        document.getElementById(
            "contenedor-preview"
        );

    const preview =
        document.getElementById(
            "slider-preview"
        );

    const nombreArchivo =
        document.getElementById(
            "heroSliderFileName"
        );


    if (contenedorPreview) {

        contenedorPreview.classList.add(
            "hero-slider-preview-hidden"
        );

    }


    if (preview) {

        preview.removeAttribute(
            "src"
        );

    }


    if (nombreArchivo) {

        nombreArchivo.textContent =
            "";

    }


    // Configurar selector de archivo
    inicializarPreviewSlider();


    const modalElement =
        document.getElementById(
            "modalSlider"
        );


    if (!modalElement) {

        console.error(
            "No se encontró el modal de sliders."
        );

        return;

    }


    const modalBootstrap =
        bootstrap.Modal
            .getOrCreateInstance(
                modalElement
            );


    modalBootstrap.show();

}

// ==========================================================
// CREAR NUEVO SLIDER
// ==========================================================

async function guardarSlider(event) {

    event.preventDefault();


    const inputFile =
        document.getElementById(
            "slider-imagen"
        );

    const botonGuardar =
        event.submitter;


    if (
        !inputFile ||
        inputFile.files.length === 0
    ) {

        alert(
            "Selecciona una imagen para el slider."
        );

        return;

    }


    const archivo =
        inputFile.files[0];


    const formData =
        new FormData();


    formData.append(
        "imagen",
        archivo
    );


    // ==============================================
    // BLOQUEAR DOBLE ENVÍO
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
                "/api/hero",
                {
                    method: "POST",

                    headers:
                        headersHero(),

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
                "No fue posible crear el slider."
            );

        }


        // ==============================================
        // CERRAR MODAL
        // ==============================================

        const modalElement =
            document.getElementById(
                "modalSlider"
            );


        const modal =
            bootstrap.Modal
                .getInstance(
                    modalElement
                );


        if (modal) {

            modal.hide();

        }


        alert(
            "Slider agregado correctamente como borrador."
        );


        await cargarSlidersAdmin();


    } catch (error) {

        console.error(
            "Error al guardar slider:",
            error
        );


        alert(
            error.message ||
            "Ocurrió un error al subir la imagen."
        );


    } finally {

        if (botonGuardar) {

            botonGuardar.disabled =
                false;

            botonGuardar.innerHTML = `

                <i class="fas fa-plus"></i>

                Agregar Slider

            `;

        }

    }

}


// ==========================================================
// REORDENAR SLIDER
// ==========================================================

async function moverSlider(
    id,
    direccion
) {

    try {

        const respuesta =
            await fetch(
                `/api/hero/${id}/reordenar`,
                {
                    method: "PATCH",

                    headers:
                        headersHero({
                            "Content-Type":
                                "application/json"
                        }),

                    body:
                        JSON.stringify({
                            direccion
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
                "No fue posible cambiar el orden."
            );

        }


        await cargarSlidersAdmin();


    } catch (error) {

        console.error(
            "Error al reordenar slider:",
            error
        );


        alert(
            error.message ||
            "No fue posible cambiar el orden."
        );

    }

}


// Activar/Desactivar temporalmente (Lo devuelve a modo borrador hasta publicar)
async function alternarEstadoSlider(id, orden, estadoActual) {
    try {
        const nuevoEstadoActivo = estadoActual === 1 ? 0 : 1;

        const respuesta = await fetch(`/api/hero/${id}`, {
            method: 'PUT',
            headers:
                headersHero({
                    'Content-Type':
                        'application/json'
                }),

            body: JSON.stringify({ orden: orden, activo: nuevoEstadoActivo })
        });

        const resultado = await respuesta.json();
        if (!resultado.success) throw new Error(resultado.message);

        cargarSlidersAdmin();
    } catch (error) {
        console.error('Error al alternar estado:', error);
    }
}

// Eliminar permanentemente
async function eliminarSliderAdmin(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este slider de forma permanente? Se borrará el archivo físico del servidor.')) return;

    try {
        const respuesta = await fetch(`/api/hero/${id}`, { method: 'DELETE', headers: headersHero() });
        const resultado = await respuesta.json();

        if (!resultado.success) throw new Error(resultado.message);

        alert('Slider eliminado con éxito.');
        cargarSlidersAdmin();
    } catch (error) {
        console.error('Error al eliminar slider:', error);
    }
}

// Botón Publicar: Pasa todos los borradores a la web del cliente
async function publicarSlidersAlCliente() {
    try {
        const respuesta = await fetch('/api/hero/publicar', { method: 'PUT', headers: headersHero() });
        const resultado = await respuesta.json();

        if (!resultado.success) throw new Error(resultado.message);

        alert('¡Cambios sincronizados! La vitrina del cliente se ha actualizado.');
        cargarSlidersAdmin();
    } catch (error) {
        console.error('Error al publicar cambios:', error);
        alert('Error al intentar publicar los cambios.');
    }
}