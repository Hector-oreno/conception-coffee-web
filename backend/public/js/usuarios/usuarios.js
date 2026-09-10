// ==========================================================================
// OBTENER TOKEN DE LA SESIÓN ACTUAL
// ==========================================================================

function obtenerTokenUsuario() {

    const token =
        localStorage.getItem(
            'token_conception'
        );

    return token || null;

}

let usuariosCargados = [];

let filtroEstadoUsuario = 'activos';


// 1. Obtener y renderizar lista de usuarios
async function cargarUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando lista de usuarios...</td></tr>';

    try {
        const token = obtenerTokenUsuario();

        if (!token) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="text-center"
                    >
                        Debes iniciar sesión para consultar usuarios.
                    </td>
                </tr>
            `;

            return;

        
        }


        const res = await fetch('/api/usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!data.success || !data.data || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados.</td></tr>';
            return;
        }

        usuariosCargados =
            data.data;


        // ==========================================
        // CARGAR SUCURSALES EN EL FILTRO
        // ==========================================

        cargarSucursalesFiltroUsuarios();


        // ==========================================
        // RENDERIZAR
        // ==========================================

        renderizarUsuarios();

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error al conectar con la API de usuarios.</td></tr>';
    }
}


function renderizarUsuarios() {

    const tbody =
        document.getElementById(
            'tbody-usuarios'
        );

    if (!tbody) return;


    const busqueda =
        (
            document.getElementById(
                'buscarUsuario'
            )?.value || ''
        )
            .trim()
            .toLowerCase();


    const rol =
        document.getElementById(
            'filtroRolUsuario'
        )?.value || '';


    const sucursal =
        document.getElementById(
            'filtroSucursalUsuario'
        )?.value || '';


    // ==========================================
    // FILTRAR
    // ==========================================

    const usuarios =
        usuariosCargados.filter(
            usuario => {

                // Estado
                if (
                    filtroEstadoUsuario ===
                    'activos' &&
                    Number(usuario.activo) !== 1
                ) {

                    return false;

                }


                if (
                    filtroEstadoUsuario ===
                    'inactivos' &&
                    Number(usuario.activo) === 1
                ) {

                    return false;

                }


                // Búsqueda
                if (busqueda) {

                    const texto =
                        `${usuario.nombre || ''} ${usuario.correo || ''}`
                            .toLowerCase();


                    if (
                        !texto.includes(
                            busqueda
                        )
                    ) {

                        return false;

                    }

                }


                // Rol
                if (
                    rol &&
                    usuario.rol !== rol
                ) {

                    return false;

                }


                // Sucursal
                if (
                    sucursal &&
                    String(
                        usuario.sucursal_id
                    ) !== sucursal
                ) {

                    return false;

                }


                return true;

            }
        );


    // ==========================================
    // CONTADOR
    // ==========================================

    const contador =
        document.getElementById(
            'usuariosCantidad'
        );


    if (contador) {

        contador.textContent =
            `${usuarios.length} ${
                usuarios.length === 1
                    ? 'usuario'
                    : 'usuarios'
            }`;

    }


    // ==========================================
    // SIN RESULTADOS
    // ==========================================

    if (usuarios.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center"
                >
                    No hay usuarios que coincidan
                    con los filtros.
                </td>

            </tr>

        `;

        return;

    }


    // ==========================================
    // RENDER
    // ==========================================

    tbody.innerHTML =
        usuarios.map(
            usr => {

                const badgeEstado =
                    Number(usr.activo) === 1

                        ? '<span class="badge-activo">Activo</span>'

                        : '<span class="badge-inactivo">Inactivo</span>';


                const nombreSucursal =
                    usr.sucursal_nombre ||
                    'Todas / Global';


                return `

                    <tr>

                        <td>
                            <strong>
                                #${usr.id}
                            </strong>
                        </td>

                        <td>
                            ${usr.nombre}
                        </td>

                        <td>
                            ${usr.correo}
                        </td>

                        <td>

                            <span class="badge-rol">
                                ${usr.rol.toUpperCase()}
                            </span>

                        </td>

                        <td>
                            ${nombreSucursal}
                        </td>

                        <td>
                            ${badgeEstado}
                        </td>

                        <td>

                            <button
                                class="btn-accion-sm"
                                onclick="toggleEstadoUsuario(
                                    ${usr.id},
                                    ${usr.activo}
                                )"
                                title="${
                                    Number(usr.activo) === 1
                                        ? 'Desactivar usuario'
                                        : 'Reactivar usuario'
                                }"
                            >

                                <i class="fas fa-power-off"></i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join('');

}


function filtrarUsuariosEstado(
    estado,
    boton
) {

    filtroEstadoUsuario =
        estado;


    document
        .querySelectorAll(
            '.usuario-filtro'
        )
        .forEach(
            item =>
                item.classList.remove(
                    'active'
                )
        );


    if (boton) {

        boton.classList.add(
            'active'
        );

    }


    renderizarUsuarios();

}

function cargarSucursalesFiltroUsuarios() {

    const select =
        document.getElementById(
            'filtroSucursalUsuario'
        );

    if (!select) return;


    const valorActual =
        select.value;


    const sucursales =
        new Map();


    usuariosCargados.forEach(
        usuario => {

            if (
                usuario.sucursal_id &&
                usuario.sucursal_nombre
            ) {

                sucursales.set(
                    String(
                        usuario.sucursal_id
                    ),
                    usuario.sucursal_nombre
                );

            }

        }
    );


    select.innerHTML = `

        <option value="">
            Todas las sucursales
        </option>

    `;


    sucursales.forEach(
        (nombre, id) => {

            select.insertAdjacentHTML(
                'beforeend',
                `
                <option value="${id}">
                    ${nombre}
                </option>
                `
            );

        }
    );


    select.value =
        valorActual;

}


// ==========================================================================
// CARGAR SUCURSALES ACTIVAS EN EL MODAL DE USUARIOS
// ==========================================================================

async function cargarSucursalesUsuario() {

    const select =
        document.getElementById(
            'usr-sucursal'
        );

    if (!select) return;


    // Estado inicial
    select.innerHTML = `

        <option value="">
            Cargando sucursales...
        </option>

    `;


    try {

        const response =
            await fetch(
                '/api/sucursales'
            );


        if (!response.ok) {

            throw new Error(
                'No fue posible obtener las sucursales.'
            );

        }


        const sucursales =
            await response.json();


        if (!Array.isArray(sucursales)) {

            throw new Error(
                'Respuesta inválida de sucursales.'
            );

        }


        // Solo sucursales activas
        const activas =
            sucursales.filter(
                sucursal =>
                    Number(sucursal.activa) === 1
            );


        select.innerHTML = `

            <option value="">
                Selecciona una sucursal
            </option>

        `;


        activas.forEach(
            sucursal => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    sucursal.id;


                option.textContent =
                    sucursal.nombre;


                select.appendChild(
                    option
                );

            }
        );


        if (activas.length === 0) {

            select.innerHTML = `

                <option value="">
                    No hay sucursales activas
                </option>

            `;

        }


    } catch (error) {

        console.error(
            'Error cargando sucursales para usuarios:',
            error
        );


        select.innerHTML = `

            <option value="">
                Error cargando sucursales
            </option>

        `;

    }

}



// 2. Control de Modal
async function abrirModalCrearUsuario() {

    const formulario =
        document.getElementById(
            'form-crear-usuario'
        );

    const grupoSucursal =
        document.getElementById(
            'group-sucursal'
        );

    const rol =
        document.getElementById(
            'usr-rol'
        );


    if (formulario) {

        formulario.reset();

    }


    if (grupoSucursal) {

        grupoSucursal.style.display =
            'none';

    }


    // Cargar sucursales reales
    await cargarSucursalesUsuario();


    // Después del reset el primer rol es admin,
    // por lo tanto no necesita sucursal.
    if (rol) {

        evaluarSeleccionSucursal(
            rol.value
        );

    }


    const modal =
        document.getElementById(
            'modal-usuario'
        );


    if (modal) {

        modal.style.display =
            'flex';

    }

}


function evaluarSeleccionSucursal(rol) {

    const groupSucursal =
        document.getElementById(
            'group-sucursal'
        );

    const selectSucursal =
        document.getElementById(
            'usr-sucursal'
        );


    if (
        !groupSucursal ||
        !selectSucursal
    ) {

        return;

    }


    const requiereSucursal =
        [
            'gerente',
            'cajero',
            'mesero',
            'cocina'
        ].includes(rol);


    groupSucursal.style.display =
        requiereSucursal
            ? 'block'
            : 'none';


    // HTML también obliga a elegirla
    // cuando corresponde.
    selectSucursal.required =
        requiereSucursal;


    if (!requiereSucursal) {

        selectSucursal.value =
            '';

    }

}


// 3. Registrar Usuario vía POST
// Expresión Regular bajo estándar OWASP (Mín. 10 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 especial)
const regexPasswordSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#-]).{10,}$/;

async function guardarNuevoUsuario(e) {
    e.preventDefault();

    const passwordInput = document.getElementById('usr-password').value;

    // 1. Validar la contraseña en el Frontend según Estándar OWASP
    if (!regexPasswordSegura.test(passwordInput)) {
        alert(
            "⚠️ La contraseña no cumple con las políticas de seguridad OWASP:\n\n" +
            "• Mínimo 10 caracteres de longitud.\n" +
            "• Al menos una letra mayúscula (A-Z).\n" +
            "• Al menos una letra minúscula (a-z).\n" +
            "• Al menos un número (0-9).\n" +
            "• Al menos un carácter especial (@, $, !, %, *, ?, &, #, ., -)."
        );
        document.getElementById('usr-password').focus();
        return; // Detiene el envío
    }

    // 2. Armar Payload
    const rol =
        document.getElementById(
            'usr-rol'
        ).value;


    const selectSucursal =
        document.getElementById(
            'usr-sucursal'
        );


    const requiereSucursal =
        [
            'gerente',
            'cajero',
            'mesero',
            'cocina'
        ].includes(rol);


    // ==========================================
    // VALIDAR SUCURSAL
    // ==========================================

    if (
        requiereSucursal &&
        !selectSucursal.value
    ) {

        alert(
            'Debes seleccionar una sucursal para este rol.'
        );

        selectSucursal.focus();

        return;

    }


    // ==========================================
    // ARMAR PAYLOAD
    // ==========================================

    const payload = {

        nombre:
            document
                .getElementById('usr-nombre')
                .value
                .trim(),

        correo:
            document
                .getElementById('usr-correo')
                .value
                .trim()
                .toLowerCase(),

        password:
            passwordInput,

        rol,

        sucursal_id:
            requiereSucursal
                ? Number(selectSucursal.value)
                : null

    };

    try {
        const token =
            obtenerTokenUsuario();

        if (!token) {

            alert(
                'Debes iniciar sesión para crear usuarios.'
            );

            return;

        }

        const res = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            alert('Usuario registrado exitosamente.');
            cerrarModalUsuario();
            cargarUsuarios(); // Recargar tabla
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error guardando usuario:', error);
        alert('Ocurrió un error en el servidor.');
    }
}


// ==========================================================================
// ACTIVAR / DESACTIVAR USUARIO
// ==========================================================================

async function toggleEstadoUsuario(
    usuarioId,
    estadoActual
) {

    const token =
        obtenerTokenUsuario();

    if (!token) {

        alert(
            'Debes iniciar sesión nuevamente.'
        );

        return;

    }


    const nuevoEstado =
        Number(estadoActual) === 1
            ? 0
            : 1;


    const accion =
        nuevoEstado === 1
            ? 'activar'
            : 'desactivar';


    const confirmar =
        confirm(
            `¿Estás seguro de que deseas ${accion} este usuario?`
        );


    if (!confirmar) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/usuarios/${usuarioId}/estado`,
                {
                    method: 'PATCH',

                    headers: {
                        'Content-Type':
                            'application/json',

                        'Authorization':
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            activo:
                                nuevoEstado
                        })
                }
            );


        const resultado =
            await response.json();


        if (
            !response.ok ||
            !resultado.success
        ) {

            alert(
                resultado.message ||
                'No fue posible cambiar el estado del usuario.'
            );

            return;

        }


        alert(
            resultado.message
        );


        // Recargar usuarios desde el backend
        await cargarUsuarios();


    } catch (error) {

        console.error(
            'Error cambiando estado del usuario:',
            error
        );


        alert(
            'Ocurrió un error al cambiar el estado del usuario.'
        );

    }

}



document.addEventListener(
    'input',
    event => {

        if (
            event.target.id ===
            'buscarUsuario'
        ) {

            renderizarUsuarios();

        }

    }
);


function cerrarModalUsuario() {

    const modal =
        document.getElementById(
            'modal-usuario'
        );

    const formulario =
        document.getElementById(
            'form-crear-usuario'
        );

    const grupoSucursal =
        document.getElementById(
            'group-sucursal'
        );


    // Cerrar modal
    if (modal) {

        modal.style.display =
            'none';

    }


    // Limpiar formulario
    if (formulario) {

        formulario.reset();

    }


    // Volver a ocultar sucursal
    if (grupoSucursal) {

        grupoSucursal.style.display =
            'none';

    }

}


document.addEventListener(
    'change',
    event => {

        if (
            event.target.id ===
            'filtroRolUsuario' ||
            event.target.id ===
            'filtroSucursalUsuario'
        ) {

            renderizarUsuarios();

        }

    }
);