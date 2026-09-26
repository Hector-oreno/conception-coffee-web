// ==========================================================
// AUTENTICACIÓN SUCURSALES
// ==========================================================

function obtenerTokenSucursales() {

    return localStorage.getItem(
        'token_conception'
    ) || null;

}


function headersSucursales(
    headersAdicionales = {}
) {

    const token =
        obtenerTokenSucursales();


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


let listaSucursalesAdmin = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarTablaSucursales();
});

// ==========================================================
// CARGAR TABLA DE SUCURSALES
// ==========================================================

async function cargarTablaSucursales() {

    const tbody =
        document.getElementById(
            "tablaSucursalesBody"
        );

    const contador =
        document.getElementById(
            "sucursalesCount"
        );


    if (!tbody) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/sucursales"
            );


        const sucursales =
            await response.json();


        if (!response.ok) {

            throw new Error(
                sucursales.error ||
                `Error HTTP ${response.status}`
            );

        }


        if (!Array.isArray(sucursales)) {

            throw new Error(
                "Respuesta inválida del servidor."
            );

        }


        listaSucursalesAdmin =
            sucursales;


        // ==================================================
        // CONTADOR
        // ==================================================

        if (contador) {

            contador.textContent =
                sucursales.length === 1
                    ? "1 sucursal"
                    : `${sucursales.length} sucursales`;

        }


        // ==================================================
        // ESTADO VACÍO
        // ==================================================

        if (sucursales.length === 0) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="sucursales-admin-empty"
                    >
                        No hay sucursales registradas.
                    </td>

                </tr>

            `;

            return;

        }


        // ==================================================
        // RENDER
        // ==================================================

        tbody.innerHTML =
            sucursales
                .map(sucursal => {

                    const activa =
                        Number(
                            sucursal.activa
                        ) === 1;


                    const dato =
                        valor =>
                            valor
                                ? `
                                    <span class="sucursal-data">
                                        ${valor}
                                    </span>
                                `
                                : `
                                    <span class="sucursal-data-empty">
                                        Sin información
                                    </span>
                                `;


                    return `

                        <tr>

                            <!-- ID -->
                            <td class="sucursal-id">

                                <span>
                                    ${sucursal.id}
                                </span>

                            </td>


                            <!-- NOMBRE -->
                            <td>

                                <div class="sucursal-info">

                                    <strong>
                                        ${sucursal.nombre}
                                    </strong>

                                    <span>
                                        ${
                                            Number(
                                                sucursal.es_principal
                                            ) === 1
                                                ? "Sucursal principal"
                                                : "Sucursal"
                                        }
                                    </span>

                                </div>

                            </td>


                            <!-- DIRECCIÓN -->
                            <td>
                                ${dato(sucursal.direccion)}
                            </td>


                            <!-- HORARIO -->
                            <td>
                                ${dato(sucursal.horario)}
                            </td>


                            <!-- TELÉFONO -->
                            <td>
                                ${dato(sucursal.telefono)}
                            </td>


                            <!-- ESTADO -->
                            <td class="sucursal-status-cell">

                                <span
                                    class="
                                        sucursal-status
                                        ${
                                            activa
                                                ? "sucursal-status-active"
                                                : "sucursal-status-inactive"
                                        }
                                    "
                                >

                                    <span
                                        class="sucursal-status-dot"
                                    ></span>

                                    ${
                                        activa
                                            ? "Activa"
                                            : "Inactiva"
                                    }

                                </span>

                            </td>


                            <!-- ACCIONES -->
                            <td>

                                <div class="sucursal-actions">

                                    <button
                                        type="button"
                                        class="
                                            sucursal-action-btn
                                            sucursal-action-edit
                                        "
                                        onclick="abrirEditarSucursal(
                                            ${sucursal.id}
                                        )"
                                    >

                                        <i
                                            class="fas fa-pen"
                                            aria-hidden="true"
                                        ></i>

                                        Editar

                                    </button>


                                    <button
                                        type="button"
                                        class="
                                            sucursal-action-btn
                                            ${
                                                activa
                                                    ? "sucursal-action-disable"
                                                    : "sucursal-action-enable"
                                            }
                                        "
                                        onclick="toggleEstadoSucursal(
                                            ${sucursal.id},
                                            ${sucursal.activa}
                                        )"
                                    >

                                        <i
                                            class="fas ${
                                                activa
                                                    ? "fa-ban"
                                                    : "fa-check"
                                            }"
                                            aria-hidden="true"
                                        ></i>

                                        ${
                                            activa
                                                ? "Desactivar"
                                                : "Activar"
                                        }

                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Error al cargar tabla de sucursales:",
            error
        );


        if (contador) {
            contador.textContent = "—";
        }


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="sucursales-admin-error"
                >
                    No fue posible cargar las sucursales.
                </td>

            </tr>

        `;

    }

}



// Cambiar estado Activa / Inactiva
async function toggleEstadoSucursal(id, estadoActual) {
    const nuevoEstado = estadoActual == 1 ? 0 : 1;
    const accionTexto = nuevoEstado === 1 ? 'activar' : 'inactivar';

    if (!confirm(`¿Estás seguro de que deseas ${accionTexto} esta sucursal?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/sucursales/${id}/estado`, {
            method: 'PATCH',
            headers:
                headersSucursales({
                    'Content-Type':
                        'application/json'
                }),
            body: JSON.stringify({ activa: nuevoEstado })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            // Recargamos la tabla de sucursales
            await cargarTablaSucursales();
            
            // Recargamos el select de productos por si se inactivo la sucursal
            if (typeof cargarSelectSucursalesAdmin === 'function') {
                await cargarSelectSucursalesAdmin();
            }
        } else {
            alert('Error: ' + (data.error || 'No se pudo cambiar el estado'));
        }
    } catch (err) {
        console.error('Error cambiando estado:', err);
    }
}


// ==========================================================
// PREVIEW DE FOTOGRAFÍA
// ==========================================================

function inicializarPreviewSucursal() {

    const input =
        document.getElementById(
            "nuevaSucursalImagen"
        );


    if (!input) {
        return;
    }


    input.onchange = () => {

        const archivo =
            input.files?.[0];


        if (!archivo) {
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

            input.value = "";

            return;

        }


        const lector =
            new FileReader();


        lector.onload = evento => {

            mostrarPreviewSucursal(
                evento.target.result,
                archivo.name
            );

        };


        lector.readAsDataURL(
            archivo
        );

    };

}


function mostrarPreviewSucursal(
    src,
    nombre = ""
) {

    const contenedor =
        document.getElementById(
            "sucursalPreviewContainer"
        );

    const imagen =
        document.getElementById(
            "sucursalPreviewImage"
        );

    const archivo =
        document.getElementById(
            "sucursalFileName"
        );


    if (!contenedor || !imagen) {
        return;
    }


    imagen.src =
        src;


    if (archivo) {

        archivo.textContent =
            nombre;

    }


    contenedor.classList.remove(
        "sucursal-preview-hidden"
    );

}


function limpiarPreviewSucursal() {

    const contenedor =
        document.getElementById(
            "sucursalPreviewContainer"
        );

    const imagen =
        document.getElementById(
            "sucursalPreviewImage"
        );

    const archivo =
        document.getElementById(
            "sucursalFileName"
        );


    if (contenedor) {

        contenedor.classList.add(
            "sucursal-preview-hidden"
        );

    }


    if (imagen) {

        imagen.removeAttribute(
            "src"
        );

    }


    if (archivo) {

        archivo.textContent = "";

    }

}


// ==========================================================
// GUARDAR SUCURSAL · CREAR / EDITAR
// ==========================================================

async function guardarSucursal(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "sucursal-id"
        )?.value.trim() || "";


    const nombre =
        document.getElementById(
            "nuevaSucursalNombre"
        )?.value.trim() || "";


    const direccion =
        document.getElementById(
            "nuevaSucursalDireccion"
        )?.value.trim() || "";


    const horario =
        document.getElementById(
            "nuevaSucursalHorario"
        )?.value.trim() || "";


    const telefono =
        document.getElementById(
            "nuevaSucursalTelefono"
        )?.value.trim() || "";


    const mapaUrl =
        document.getElementById(
            "nuevaSucursalMapa"
        )?.value.trim() || "";


    const imagenInput =
        document.getElementById(
            "nuevaSucursalImagen"
        );


    if (!nombre) {

        alert(
            "El nombre de la sucursal es obligatorio."
        );

        document
            .getElementById(
                "nuevaSucursalNombre"
            )
            ?.focus();

        return;

    }


    const editando =
        Boolean(id);


    const formData =
        new FormData();


    formData.append(
        "nombre",
        nombre
    );

    formData.append(
        "direccion",
        direccion
    );

    formData.append(
        "horario",
        horario
    );

    formData.append(
        "telefono",
        telefono
    );

    formData.append(
        "mapa_url",
        mapaUrl
    );


    if (
        imagenInput?.files?.length > 0
    ) {

        formData.append(
            "imagen",
            imagenInput.files[0]
        );

    }


    const boton =
        document.getElementById(
            "btnGuardarSucursal"
        );


    if (boton) {

        boton.disabled = true;


        const icono =
            boton.querySelector(
                "i"
            );


        const texto =
            document.getElementById(
                "btnGuardarSucursalTexto"
            );


        if (icono) {

            icono.className =
                "fas fa-spinner fa-spin";

        }


        if (texto) {

            texto.textContent =
                editando
                    ? "Guardando..."
                    : "Registrando...";

        }

    }


    try {

        const response =
            await fetch(
                editando
                    ? `/api/sucursales/${id}`
                    : "/api/sucursales",
                {
                    method:
                        editando
                            ? "PUT"
                            : "POST",

                    headers:
                        headersSucursales(),

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                `Error HTTP ${response.status}`
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "No fue posible guardar la sucursal."
            );

        }


        cerrarModalSucursal();


        await cargarTablaSucursales();


        if (
            typeof cargarSelectSucursalesAdmin ===
            "function"
        ) {

            await cargarSelectSucursalesAdmin();

        }


        alert(
            editando
                ? "Sucursal actualizada correctamente."
                : "Sucursal registrada correctamente."
        );


    } catch (error) {

        console.error(
            "Error guardando sucursal:",
            error
        );


        alert(
            error.message ||
            "No fue posible guardar la sucursal."
        );


    } finally {

        if (boton) {

            boton.disabled = false;


            const icono =
                boton.querySelector(
                    "i"
                );


            const texto =
                document.getElementById(
                    "btnGuardarSucursalTexto"
                );


            if (icono) {

                icono.className =
                    editando
                        ? "fas fa-check"
                        : "fas fa-plus";

            }


            if (texto) {

                texto.textContent =
                    editando
                        ? "Guardar Cambios"
                        : "Registrar Sucursal";

            }

        }

    }

}



// ==========================================================
// ABRIR MODAL · NUEVA SUCURSAL
// ==========================================================

function abrirModalSucursal() {

    const modal =
        document.getElementById(
            "modalSucursal"
        );

    const formulario =
        document.getElementById(
            "formNuevaSucursal"
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    document.getElementById(
        "sucursal-id"
    ).value = "";


    document.getElementById(
        "modalSucursalEyebrow"
    ).textContent = "Nueva sede";


    document.getElementById(
        "modalSucursalTitulo"
    ).textContent = "Registrar Sucursal";


    document.getElementById(
        "btnGuardarSucursalTexto"
    ).textContent = "Registrar Sucursal";


    const info =
        document.getElementById(
            "sucursalModalInfoTexto"
        );


    if (info) {

        info.innerHTML = `
            La nueva sucursal se registrará
            <strong>activa</strong>.
        `;

    }


    limpiarPreviewSucursal();


    inicializarPreviewSucursal();


    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "sucursal-modal-open"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "nuevaSucursalNombre"
                )
                ?.focus();

        },
        50
    );

}


// ==========================================================
// ABRIR MODAL · EDITAR SUCURSAL
// ==========================================================

function abrirEditarSucursal(id) {

    const sucursal =
        listaSucursalesAdmin.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!sucursal) {

        alert(
            "No fue posible encontrar la sucursal."
        );

        return;

    }


    const modal =
        document.getElementById(
            "modalSucursal"
        );

    const formulario =
        document.getElementById(
            "formNuevaSucursal"
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    document.getElementById(
        "sucursal-id"
    ).value =
        sucursal.id;


    document.getElementById(
        "nuevaSucursalNombre"
    ).value =
        sucursal.nombre || "";


    document.getElementById(
        "nuevaSucursalDireccion"
    ).value =
        sucursal.direccion || "";


    document.getElementById(
        "nuevaSucursalHorario"
    ).value =
        sucursal.horario || "";


    document.getElementById(
        "nuevaSucursalTelefono"
    ).value =
        sucursal.telefono || "";


    document.getElementById(
        "nuevaSucursalMapa"
    ).value =
        sucursal.mapa_url || "";


    document.getElementById(
        "modalSucursalEyebrow"
    ).textContent =
        "Editar sede";


    document.getElementById(
        "modalSucursalTitulo"
    ).textContent =
        "Editar Sucursal";


    document.getElementById(
        "btnGuardarSucursalTexto"
    ).textContent =
        "Guardar Cambios";


    const info =
        document.getElementById(
            "sucursalModalInfoTexto"
        );


    if (info) {

        info.innerHTML = `
            Los cambios actualizarán la información
            de esta sucursal.
            <strong>
                Su estado activo o inactivo no cambiará.
            </strong>
        `;

    }


    limpiarPreviewSucursal();


    // Mostrar fotografía existente
    if (sucursal.imagen_url) {

        mostrarPreviewSucursal(
            sucursal.imagen_url,
            "Fotografía actual"
        );

    }


    inicializarPreviewSucursal();


    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "sucursal-modal-open"
    );

}

function cerrarModalSucursal() {

    const modal =
        document.getElementById(
            "modalSucursal"
        );

    const formulario =
        document.getElementById(
            "formNuevaSucursal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "sucursal-modal-open"
    );


    formulario?.reset();


    limpiarPreviewSucursal();

}

