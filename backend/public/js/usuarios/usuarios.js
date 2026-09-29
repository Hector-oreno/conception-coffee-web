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

let usuarioSesionActual = null;


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

                            <div class="usuario-actions">

                                <button
                                    type="button"
                                    class="usuario-action-btn usuario-action-edit"
                                    onclick="abrirModalEditarUsuario(${usr.id})"
                                    title="Editar usuario"
                                >
                                    <i class="fas fa-pen"></i>
                                </button>


                                <button
                                    type="button"
                                    class="
                                        usuario-action-btn
                                        ${
                                            Number(usr.activo) === 1
                                                ? 'usuario-action-disable'
                                                : 'usuario-action-enable'
                                        }
                                    "
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
                                    <i
                                        class="fas ${
                                            Number(usr.activo) === 1
                                                ? 'fa-ban'
                                                : 'fa-check'
                                        }"
                                    ></i>
                                </button>

                            </div>

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



async function abrirModalCrearUsuario() {

    const modal =
        document.getElementById(
            'modal-usuario'
        );

    const formulario =
        document.getElementById(
            'form-crear-usuario'
        );


    if (!modal || !formulario) {
        return;
    }


    // ======================================================
    // LIMPIAR FORMULARIO
    // ======================================================

    formulario.reset();


    document.getElementById(
        'usuario-id'
    ).value = '';


    // ======================================================
    // MODO CREAR
    // ======================================================

    document.getElementById(
        'usuarioModalEyebrow'
    ).textContent =
        'Nueva cuenta';


    document.getElementById(
        'usuarioModalTitulo'
    ).textContent =
        'Registrar Usuario';


    document.getElementById(
        'usuarioModalDescripcion'
    ).textContent =
        'Crea una cuenta y define sus permisos dentro de Conception Coffee.';


    document.getElementById(
        'btnGuardarUsuarioTexto'
    ).textContent =
        'Registrar Usuario';


    const boton =
        document.getElementById(
            'btnGuardarUsuario'
        );


    const icono =
        boton?.querySelector('i');


    if (icono) {

        icono.className =
            'fas fa-plus';

    }


    // ======================================================
    // CONTRASEÑA · SOLO CREACIÓN
    // ======================================================

    const passwordSection =
        document.getElementById(
            'usuarioPasswordSection'
        );

    const password =
        document.getElementById(
            'usr-password'
        );


    if (passwordSection) {

        passwordSection.hidden =
            false;

    }


    if (password) {

        password.required =
            true;

        password.value =
            '';

        evaluarPasswordUsuario('');


        password.type =
            'password';

    }


    document.getElementById(
        'usuarioPermisosNumero'
    ).textContent =
        '03';


    // ======================================================
    // SUCURSALES
    // ======================================================

    await cargarSucursalesUsuario();


    const rol =
        document.getElementById(
            'usr-rol'
        );


    if (rol) {

        evaluarSeleccionSucursal(
            rol.value
        );

    }


    // ======================================================
    // ABRIR
    // ======================================================

    modal.classList.add(
        'active'
    );


    document.body.classList.add(
        'usuario-modal-open'
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    'usr-nombre'
                )
                ?.focus();

        },
        50
    );

}


async function abrirModalEditarUsuario(
    usuarioId
) {

    const usuario =
        usuariosCargados.find(
            item =>
                Number(item.id) ===
                Number(usuarioId)
        );


    if (!usuario) {

        alert(
            'No fue posible encontrar el usuario.'
        );

        return;

    }


    const modal =
        document.getElementById(
            'modal-usuario'
        );

    const formulario =
        document.getElementById(
            'form-crear-usuario'
        );


    if (!modal || !formulario) {
        return;
    }


    formulario.reset();


    // ======================================================
    // DATOS
    // ======================================================

    document.getElementById(
        'usuario-id'
    ).value =
        usuario.id;


    document.getElementById(
        'usr-nombre'
    ).value =
        usuario.nombre || '';


    document.getElementById(
        'usr-correo'
    ).value =
        usuario.correo || '';


    document.getElementById(
        'usr-rol'
    ).value =
        usuario.rol || 'cliente';


    // ======================================================
    // MODO EDICIÓN
    // ======================================================

    document.getElementById(
        'usuarioModalEyebrow'
    ).textContent =
        'Editar cuenta';


    document.getElementById(
        'usuarioModalTitulo'
    ).textContent =
        'Editar Usuario';


    document.getElementById(
        'usuarioModalDescripcion'
    ).textContent =
        'Actualiza la identidad y los permisos de esta cuenta.';


    document.getElementById(
        'btnGuardarUsuarioTexto'
    ).textContent =
        'Guardar Cambios';


    const boton =
        document.getElementById(
            'btnGuardarUsuario'
        );


    const icono =
        boton?.querySelector('i');


    if (icono) {

        icono.className =
            'fas fa-check';

    }


    // ======================================================
    // OCULTAR CONTRASEÑA
    // ======================================================

    const passwordSection =
        document.getElementById(
            'usuarioPasswordSection'
        );

    const password =
        document.getElementById(
            'usr-password'
        );


    if (passwordSection) {

        passwordSection.hidden =
            true;

    }


    if (password) {

        password.required =
            false;

        password.value =
            '';

    }


    document.getElementById(
        'usuarioPermisosNumero'
    ).textContent =
        '02';


    // ======================================================
    // CARGAR SUCURSALES
    // ======================================================

    await cargarSucursalesUsuario();


    evaluarSeleccionSucursal(
        usuario.rol
    );


    const sucursal =
        document.getElementById(
            'usr-sucursal'
        );


    if (
        sucursal &&
        usuario.sucursal_id
    ) {

        sucursal.value =
            String(
                usuario.sucursal_id
            );

    }


    // ======================================================
    // PROTEGER PROPIA CUENTA VISUALMENTE
    // ======================================================

    const sesion =
        obtenerUsuarioSesionActual();


    const esPropiaCuenta =
        Number(sesion?.id) ===
        Number(usuario.id);


    const rol =
        document.getElementById(
            'usr-rol'
        );


    if (rol) {

        rol.disabled =
            esPropiaCuenta;

    }


    if (sucursal) {

        sucursal.disabled =
            esPropiaCuenta;

    }


    const info =
        document.getElementById(
            'usuarioRoleInfoTexto'
        );


    if (
        esPropiaCuenta &&
        info
    ) {

        info.textContent =
            'Puedes actualizar tu nombre y correo, pero no puedes modificar tus propios permisos.';

    } else {

        actualizarDescripcionRol(
            usuario.rol
        );

    }


    modal.classList.add(
        'active'
    );


    document.body.classList.add(
        'usuario-modal-open'
    );

}


function evaluarSeleccionSucursal(
    rol
) {

    const grupoSucursal =
        document.getElementById(
            'group-sucursal'
        );

    const selectSucursal =
        document.getElementById(
            'usr-sucursal'
        );


    if (
        !grupoSucursal ||
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


    grupoSucursal.hidden =
        !requiereSucursal;


    selectSucursal.required =
        requiereSucursal;


    if (!requiereSucursal) {

        selectSucursal.value =
            '';

    }


    actualizarDescripcionRol(
        rol
    );

}


function actualizarDescripcionRol(
    rol
) {

    const elemento =
        document.getElementById(
            'usuarioRoleInfoTexto'
        );


    if (!elemento) {
        return;
    }


    const descripciones = {

        admin:
            'Acceso global a las herramientas administrativas y gestión del sistema.',

        gerente:
            'Gestiona las operaciones disponibles para la sucursal asignada.',

        cajero:
            'Acceso operativo a productos y funciones correspondientes a caja.',

        mesero:
            'Acceso operativo limitado a las herramientas habilitadas para servicio.',

        cocina:
            'Acceso a las funciones de cocina y Menú Ejecutivo de su sucursal.',

        cliente:
            'Cuenta web sin acceso al panel administrativo.'

    };


    elemento.textContent =
        descripciones[rol] ||
        'Selecciona un rol para definir el alcance de la cuenta.';

}




// 3. Registrar Usuario vía POST
// Política de contraseña del sistema:
// mínimo 10 caracteres, mayúscula, minúscula,
// número y carácter especial permitido.


const regexPasswordSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#-]).{10,}$/;

async function guardarUsuario(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            'usuario-id'
        )?.value.trim() || '';


    const editando =
        Boolean(id);


    const nombre =
        document.getElementById(
            'usr-nombre'
        )?.value.trim() || '';


    const correo =
        document.getElementById(
            'usr-correo'
        )?.value
            .trim()
            .toLowerCase() || '';


    const rol =
        document.getElementById(
            'usr-rol'
        )?.value || '';


    const sucursalSelect =
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


    if (
        !nombre ||
        !correo ||
        !rol
    ) {

        alert(
            'Completa los campos obligatorios.'
        );

        return;

    }


    if (
        requiereSucursal &&
        !sucursalSelect?.value
    ) {

        alert(
            'Debes seleccionar una sucursal para este rol.'
        );

        sucursalSelect?.focus();

        return;

    }


    const payload = {

        nombre,

        correo,

        rol,

        sucursal_id:
            requiereSucursal
                ? Number(
                    sucursalSelect.value
                )
                : null

    };


    // ======================================================
    // CONTRASEÑA · SOLO CREACIÓN
    // ======================================================

    if (!editando) {

        const password =
            document.getElementById(
                'usr-password'
            )?.value || '';


        if (
            !regexPasswordSegura.test(
                password
            )
        ) {

            alert(
                'La contraseña todavía no cumple todos los requisitos de seguridad.'
            );

            document
                .getElementById(
                    'usr-password'
                )
                ?.focus();

            return;

        }


        payload.password =
            password;

    }


    const token =
        obtenerTokenUsuario();


    if (!token) {

        alert(
            'Tu sesión ya no está disponible.'
        );

        return;

    }


    const boton =
        document.getElementById(
            'btnGuardarUsuario'
        );

    const textoBoton =
        document.getElementById(
            'btnGuardarUsuarioTexto'
        );

    const iconoBoton =
        boton?.querySelector('i');


    try {

        if (boton) {

            boton.disabled =
                true;

        }


        if (textoBoton) {

            textoBoton.textContent =
                editando
                    ? 'Guardando...'
                    : 'Registrando...';

        }


        if (iconoBoton) {

            iconoBoton.className =
                'fas fa-spinner fa-spin';

        }


        const response =
            await fetch(
                editando
                    ? `/api/usuarios/${id}`
                    : '/api/usuarios/registro',
                {
                    method:
                        editando
                            ? 'PUT'
                            : 'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        'Authorization':
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                `Error HTTP ${response.status}`
            );

        }


        cerrarModalUsuario();


        await cargarUsuarios();


        alert(
            editando
                ? 'Usuario actualizado correctamente.'
                : 'Usuario registrado correctamente.'
        );


    } catch (error) {

        console.error(
            'Error guardando usuario:',
            error
        );


        alert(
            error.message ||
            'No fue posible guardar el usuario.'
        );


    } finally {

        if (boton) {

            boton.disabled =
                false;

        }


        if (textoBoton) {

            textoBoton.textContent =
                editando
                    ? 'Guardar Cambios'
                    : 'Registrar Usuario';

        }


        if (iconoBoton) {

            iconoBoton.className =
                editando
                    ? 'fas fa-check'
                    : 'fas fa-plus';

        }

    }

}


function obtenerUsuarioSesionActual() {

    try {

        const usuario =
            localStorage.getItem(
                'usuario_conception'
            );


        usuarioSesionActual =
            usuario
                ? JSON.parse(usuario)
                : null;


        return usuarioSesionActual;


    } catch (error) {

        console.warn(
            'No fue posible leer el usuario de la sesión:',
            error
        );


        usuarioSesionActual =
            null;


        return null;

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

    const rol =
        document.getElementById(
            'usr-rol'
        );

    const sucursal =
        document.getElementById(
            'usr-sucursal'
        );


    modal?.classList.remove(
        'active'
    );


    document.body.classList.remove(
        'usuario-modal-open'
    );


    formulario?.reset();


    if (rol) {

        rol.disabled =
            false;

    }


    if (sucursal) {

        sucursal.disabled =
            false;

        sucursal.required =
            false;

    }


    const grupoSucursal =
        document.getElementById(
            'group-sucursal'
        );


    if (grupoSucursal) {

        grupoSucursal.hidden =
            true;

    }

}


document.addEventListener(
    'change',
    event => {

        if (
            event.target.id ===
            'usr-rol'
        ) {

            evaluarSeleccionSucursal(
                event.target.value
            );

        }

    }
);


// ==========================================================================
// SEGURIDAD VISUAL DE CONTRASEÑA
// ==========================================================================

function evaluarPasswordUsuario(password) {

    const reglas = {

        length:
            password.length >= 10,

        uppercase:
            /[A-Z]/.test(password),

        lowercase:
            /[a-z]/.test(password),

        number:
            /\d/.test(password),

        special:
            /[@$!%*?&.#-]/.test(password)

    };


    Object.entries(reglas)
        .forEach(
            ([regla, valida]) => {

                const elemento =
                    document.querySelector(
                        `[data-password-rule="${regla}"]`
                    );


                elemento?.classList.toggle(
                    'valid',
                    valida
                );

            }
        );


    const cumplidas =
        Object
            .values(reglas)
            .filter(Boolean)
            .length;


    const barras =
        document.querySelectorAll(
            '.usuario-password-meter span'
        );


    barras.forEach(
        (barra, indice) => {

            barra.classList.toggle(
                'active',
                indice < Math.min(cumplidas, 4)
            );

        }
    );


    const texto =
        document.getElementById(
            'usuarioPasswordStrengthText'
        );


    if (texto) {

        if (!password) {

            texto.textContent =
                'Sin evaluar';

        } else if (cumplidas <= 2) {

            texto.textContent =
                'Débil';

        } else if (cumplidas <= 4) {

            texto.textContent =
                'En progreso';

        } else {

            texto.textContent =
                'Cumple requisitos';

        }

    }


    return cumplidas === 5;

}


// ==========================================================================
// EVENTOS DE CONTRASEÑA
// ==========================================================================

document.addEventListener(
    'input',
    event => {

        if (
            event.target.id ===
            'usr-password'
        ) {

            evaluarPasswordUsuario(
                event.target.value
            );

        }

    }
);


document.addEventListener(
    'click',
    event => {

        const boton =
            event.target.closest(
                '#toggleUsuarioPassword'
            );


        if (!boton) {
            return;
        }


        const input =
            document.getElementById(
                'usr-password'
            );


        if (!input) {
            return;
        }


        const mostrando =
            input.type ===
            'text';


        input.type =
            mostrando
                ? 'password'
                : 'text';


        boton.setAttribute(
            'aria-pressed',
            String(!mostrando)
        );


        boton.setAttribute(
            'aria-label',
            mostrando
                ? 'Mostrar contraseña'
                : 'Ocultar contraseña'
        );


        const icono =
            boton.querySelector('i');


        if (icono) {

            icono.className =
                mostrando
                    ? 'fas fa-eye'
                    : 'fas fa-eye-slash';

        }

    }
);



// ==========================================================================
// MI CUENTA
// ==========================================================================

function obtenerDatosSesionLocal() {

    try {

        const valor =
            localStorage.getItem(
                'usuario_conception'
            );


        return valor
            ? JSON.parse(valor)
            : null;


    } catch (error) {

        console.warn(
            'No fue posible leer la sesión local:',
            error
        );


        return null;

    }

}


function nombreRolUsuario(rol) {

    const nombres = {

        admin:
            'Administrador',

        gerente:
            'Gerente',

        cajero:
            'Cajero',

        mesero:
            'Mesero',

        cocina:
            'Cocina',

        cliente:
            'Cliente'

    };


    return nombres[rol] || rol || '—';

}


// ==========================================================================
// ABRIR MI CUENTA
// ==========================================================================

async function abrirMiCuenta() {

    const modal =
        document.getElementById(
            'modalMiCuenta'
        );


    if (!modal) {
        return;
    }


    const token =
        obtenerTokenUsuario();


    if (!token) {

        window.location.replace(
            '/login.html'
        );

        return;

    }


    try {

        // No confiamos exclusivamente en localStorage.
        // Consultamos la sesión vigente al backend.

        const response =
            await fetch(
                '/api/usuarios/sesion',
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    cache:
                        'no-store'
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.usuario
        ) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    'token_conception'
                );

                localStorage.removeItem(
                    'usuario_conception'
                );


                window.location.replace(
                    '/login.html'
                );

                return;

            }


            throw new Error(
                data.message ||
                'No fue posible consultar la cuenta.'
            );

        }


        const usuario =
            data.usuario;


        // Mantener cache local actualizado.
        localStorage.setItem(
            'usuario_conception',
            JSON.stringify(usuario)
        );


        document.getElementById(
            'miCuentaNombre'
        ).textContent =
            usuario.nombre || '—';


        document.getElementById(
            'miCuentaCorreo'
        ).textContent =
            usuario.correo || '—';


        document.getElementById(
            'miCuentaRol'
        ).textContent =
            nombreRolUsuario(
                usuario.rol
            );


        document.getElementById(
            'miCuentaSucursal'
        ).textContent =
            usuario.sucursal_nombre ||
            (
                usuario.sucursal_id
                    ? `Sucursal #${usuario.sucursal_id}`
                    : 'Acceso global'
            );


        limpiarFormularioMiCuenta();


        modal.classList.add(
            'active'
        );


        document.body.classList.add(
            'cuenta-modal-open'
        );


    } catch (error) {

        console.error(
            'Error abriendo Mi cuenta:',
            error
        );


        alert(
            error.message ||
            'No fue posible cargar tu cuenta.'
        );

    }

}


// ==========================================================================
// CERRAR MI CUENTA
// ==========================================================================

function cerrarMiCuenta() {

    const modal =
        document.getElementById(
            'modalMiCuenta'
        );


    modal?.classList.remove(
        'active'
    );


    document.body.classList.remove(
        'cuenta-modal-open'
    );


    limpiarFormularioMiCuenta();

}


// ==========================================================================
// LIMPIAR FORMULARIO
// ==========================================================================

function limpiarFormularioMiCuenta() {

    document
        .getElementById(
            'formCambiarPassword'
        )
        ?.reset();


    evaluarPasswordMiCuenta(
        ''
    );


    const mensaje =
        document.getElementById(
            'cuentaSecurityMessage'
        );


    if (mensaje) {

        mensaje.hidden =
            true;

        mensaje.textContent =
            '';

        mensaje.classList.remove(
            'success',
            'error'
        );

    }


    document
        .querySelectorAll(
            '.cuenta-password-toggle'
        )
        .forEach(
            boton => {

                const target =
                    boton.dataset
                        .passwordTarget;


                const input =
                    document.getElementById(
                        target
                    );


                if (input) {

                    input.type =
                        'password';

                }


                boton.setAttribute(
                    'aria-pressed',
                    'false'
                );


                const icono =
                    boton.querySelector('i');


                if (icono) {

                    icono.className =
                        'fas fa-eye';

                }

            }
        );

}


// ==========================================================================
// EVALUAR NUEVA CONTRASEÑA
// ==========================================================================

function evaluarPasswordMiCuenta(
    password
) {

    const reglas = {

        length:
            password.length >= 10,

        uppercase:
            /[A-Z]/.test(
                password
            ),

        lowercase:
            /[a-z]/.test(
                password
            ),

        number:
            /\d/.test(
                password
            ),

        special:
            /[@$!%*?&.#-]/.test(
                password
            )

    };


    Object.entries(
        reglas
    ).forEach(
        ([regla, valida]) => {

            document
                .querySelector(
                    `[data-cuenta-rule="${regla}"]`
                )
                ?.classList.toggle(
                    'valid',
                    valida
                );

        }
    );


    const cumplidas =
        Object
            .values(reglas)
            .filter(Boolean)
            .length;


    document
        .querySelectorAll(
            '.cuenta-password-meter span'
        )
        .forEach(
            (barra, indice) => {

                barra.classList.toggle(
                    'active',
                    indice <
                    Math.min(
                        cumplidas,
                        4
                    )
                );

            }
        );


    const texto =
        document.getElementById(
            'cuentaPasswordStrengthText'
        );


    if (texto) {

        if (!password) {

            texto.textContent =
                'Sin evaluar';

        } else if (
            cumplidas <= 2
        ) {

            texto.textContent =
                'Débil';

        } else if (
            cumplidas <= 4
        ) {

            texto.textContent =
                'En progreso';

        } else {

            texto.textContent =
                'Cumple requisitos';

        }

    }


    return cumplidas === 5;

}


// ==========================================================================
// MOSTRAR MENSAJE
// ==========================================================================

function mostrarMensajeMiCuenta(
    tipo,
    texto
) {

    const mensaje =
        document.getElementById(
            'cuentaSecurityMessage'
        );


    if (!mensaje) {
        return;
    }


    mensaje.classList.remove(
        'success',
        'error'
    );


    mensaje.classList.add(
        tipo
    );


    mensaje.textContent =
        texto;


    mensaje.hidden =
        false;

}


// ==========================================================================
// CAMBIAR CONTRASEÑA
// ==========================================================================

async function cambiarPasswordMiCuenta(
    event
) {

    event.preventDefault();


    const passwordActual =
        document.getElementById(
            'cuentaPasswordActual'
        )?.value || '';


    const passwordNueva =
        document.getElementById(
            'cuentaPasswordNueva'
        )?.value || '';


    const confirmarPassword =
        document.getElementById(
            'cuentaPasswordConfirmar'
        )?.value || '';


    if (
        !passwordActual ||
        !passwordNueva ||
        !confirmarPassword
    ) {

        mostrarMensajeMiCuenta(
            'error',
            'Completa los tres campos de contraseña.'
        );

        return;

    }


    if (
        !evaluarPasswordMiCuenta(
            passwordNueva
        )
    ) {

        mostrarMensajeMiCuenta(
            'error',
            'La nueva contraseña todavía no cumple todos los requisitos.'
        );

        return;

    }


    if (
        passwordNueva !==
        confirmarPassword
    ) {

        mostrarMensajeMiCuenta(
            'error',
            'La nueva contraseña y su confirmación no coinciden.'
        );

        return;

    }


    const token =
        obtenerTokenUsuario();


    if (!token) {

        window.location.replace(
            '/login.html'
        );

        return;

    }


    const boton =
        document.getElementById(
            'btnCambiarPassword'
        );

    const textoBoton =
        boton?.querySelector(
            'span'
        );

    const icono =
        boton?.querySelector(
            'i'
        );


    try {

        if (boton) {

            boton.disabled =
                true;

        }


        if (textoBoton) {

            textoBoton.textContent =
                'Actualizando...';

        }


        if (icono) {

            icono.className =
                'fas fa-spinner fa-spin';

        }


        const response =
            await fetch(
                '/api/usuarios/me/password',
                {
                    method:
                        'PUT',

                    headers: {

                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            passwordActual,

                            passwordNueva,

                            confirmarPassword

                        })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            mostrarMensajeMiCuenta(
                'error',
                data.message ||
                'No fue posible actualizar la contraseña.'
            );

            return;

        }


        document
            .getElementById(
                'formCambiarPassword'
            )
            ?.reset();


        evaluarPasswordMiCuenta(
            ''
        );


        mostrarMensajeMiCuenta(
            'success',
            data.sesionesRevocadas > 0
                ? `Contraseña actualizada. Se cerraron ${data.sesionesRevocadas} sesiones adicionales.`
                : 'Contraseña actualizada correctamente.'
        );


    } catch (error) {

        console.error(
            'Error cambiando contraseña:',
            error
        );


        mostrarMensajeMiCuenta(
            'error',
            'No fue posible conectar con el servidor.'
        );


    } finally {

        if (boton) {

            boton.disabled =
                false;

        }


        if (textoBoton) {

            textoBoton.textContent =
                'Cambiar contraseña';

        }


        if (icono) {

            icono.className =
                'fas fa-shield-halved';

        }

    }

}



// ==========================================================================
// EVENTOS · MI CUENTA
// ==========================================================================

document.addEventListener(
    'click',
    event => {

        // Abrir
        if (
            event.target.closest(
                '#btnAbrirMiCuenta'
            )
        ) {

            abrirMiCuenta();

            return;

        }


        // Cerrar
        if (
            event.target.closest(
                '#btnCerrarMiCuenta'
            ) ||
            event.target.closest(
                '#btnCancelarMiCuenta'
            )
        ) {

            cerrarMiCuenta();

            return;

        }


        // Mostrar / ocultar contraseña
        const toggle =
            event.target.closest(
                '.cuenta-password-toggle'
            );


        if (toggle) {

            const target =
                toggle.dataset
                    .passwordTarget;


            const input =
                document.getElementById(
                    target
                );


            if (!input) {
                return;
            }


            const mostrando =
                input.type === 'text';


            input.type =
                mostrando
                    ? 'password'
                    : 'text';


            toggle.setAttribute(
                'aria-pressed',
                String(!mostrando)
            );


            const icono =
                toggle.querySelector(
                    'i'
                );


            if (icono) {

                icono.className =
                    mostrando
                        ? 'fas fa-eye'
                        : 'fas fa-eye-slash';

            }

        }

    }
);


document.addEventListener(
    'input',
    event => {

        if (
            event.target.id ===
            'cuentaPasswordNueva'
        ) {

            evaluarPasswordMiCuenta(
                event.target.value
            );

        }

    }
);


document
    .getElementById(
        'formCambiarPassword'
    )
    ?.addEventListener(
        'submit',
        cambiarPasswordMiCuenta
    );



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