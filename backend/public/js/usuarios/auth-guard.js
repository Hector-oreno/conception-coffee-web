/* ==========================================================================
   CONCEPTION COFFEE
   GUARDIÁN DE AUTENTICACIÓN DEL PANEL ADMINISTRATIVO
   ========================================================================== */

    // ==========================================================================
// PERMISOS VISUALES POR ROL
// ==========================================================================

window.PERMISOS_SECCIONES = {

    admin: [
        'productos',
        'ejecutivo',
        'hero',
        'experiencias',
        'sucursales',
        'plantillas',
        'usuarios',
        'auditoria'
    ],

    gerente: [
        'productos',
        'ejecutivo'
    ],

    cajero: [
        'productos'
    ],

    mesero: [
        'productos'
    ],

    cocina: [
        'ejecutivo'
    ]

};



(async function protegerPanelAdministrativo() {

    const token =
        localStorage.getItem(
            'token_conception'
        );


    // ==============================================================
    // SIN TOKEN
    // ==============================================================

    if (!token) {

        limpiarSesionLocal();

        window.location.replace(
            '/login.html?estado=sin-sesion'
        );

        return;

    }


    try {

        // ==========================================================
        // VALIDAR SESIÓN
        // ==========================================================

        const response =
            await fetch(
                '/api/usuarios/sesion',
                {
                    method: 'GET',

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    cache:
                        'no-store'
                }
            );


        let resultado =
            null;


        try {

            resultado =
                await response.json();

        } catch {

            resultado =
                null;

        }


        // ==========================================================
        // SESIÓN REALMENTE INVÁLIDA
        // ==========================================================
        //
        // Aquí sí eliminamos credenciales locales.
        // ==============================================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            limpiarSesionLocal();


            window.location.replace(
                '/login.html?estado=sesion-finalizada'
            );

            return;

        }


        // ==========================================================
        // SERVICIO TEMPORALMENTE NO DISPONIBLE
        // ==========================================================
        //
        // NO destruimos la sesión.
        // ==============================================================

        if (
            response.status === 503
        ) {

            mostrarErrorTemporalSesion(
                resultado?.message ||
                'El servicio no está disponible temporalmente.'
            );

            return;

        }


        // ==========================================================
        // OTRO ERROR DEL SERVIDOR
        // ==========================================================
        //
        // 500, 502, 504, etc.
        // Tampoco destruimos la sesión local.
        // ==============================================================

        if (!response.ok) {

            console.error(
                'Error temporal validando sesión:',
                response.status,
                resultado
            );


            mostrarErrorTemporalSesion(
                'No fue posible validar tu sesión en este momento.'
            );

            return;

        }


        // ==========================================================
        // RESPUESTA INESPERADA
        // ==============================================================

        if (
            !resultado?.success ||
            !resultado?.usuario
        ) {

            console.error(
                'Respuesta de sesión inesperada:',
                resultado
            );


            mostrarErrorTemporalSesion(
                'No fue posible validar correctamente la sesión.'
            );

            return;

        }


        const usuario =
            resultado.usuario;


        // ==========================================================
        // ROLES CON ACCESO AL PANEL
        // ==============================================================

        const rolesPermitidos = [
            'admin',
            'gerente',
            'cajero',
            'mesero',
            'cocina'
        ];


        if (
            !rolesPermitidos.includes(
                usuario.rol
            )
        ) {

            // Aquí sí sabemos que el usuario está autenticado,
            // pero su rol no puede utilizar este panel.

            limpiarSesionLocal();


            window.location.replace(
                '/login.html?estado=sin-acceso'
            );

            return;

        }


        // ==========================================================
        // ACTUALIZAR CACHE LOCAL CON DATOS REALES
        // ==============================================================

        localStorage.setItem(
            'usuario_conception',
            JSON.stringify(usuario)
        );


        // ==========================================================
        // MOSTRAR PANEL
        // ==============================================================

        mostrarUsuarioConectado(
            usuario
        );


        aplicarPermisosSecciones(
            usuario
        );


    } catch (error) {

        // ==========================================================
        // ERROR DE RED
        // ==========================================================
        //
        // fetch() rechazado:
        // servidor detenido, conexión perdida, etc.
        //
        // IMPORTANTE:
        // NO eliminamos el token.
        // ==============================================================

        console.error(
            'No fue posible validar la sesión por un problema de conexión:',
            error
        );


        mostrarErrorTemporalSesion(
            'No se pudo conectar con el servidor. Tu sesión no ha sido eliminada.'
        );

    }

})();


// ==========================================================================
// APLICAR PERMISOS VISUALES SEGÚN ROL
// ==========================================================================

function aplicarPermisosSecciones(usuario) {

    const permisos =
        PERMISOS_SECCIONES[
            usuario.rol
        ] || [];


    document
        .querySelectorAll(
            '.menu-btn[data-seccion]'
        )
        .forEach(
            boton => {

                const seccion =
                    boton.dataset.seccion;


                boton.style.display =
                    permisos.includes(seccion)
                        ? ''
                        : 'none';

            }
        );


    // ==========================================================
    // ELEMENTOS EXCLUSIVOS DEL ADMINISTRADOR
    // ==========================================================

    document
        .querySelectorAll(
            '[data-solo-admin="true"]'
        )
        .forEach(elemento => {

            elemento.style.display =
                usuario.rol === 'admin'
                    ? ''
                    : 'none';

        });

}



// ==========================================================================
// MOSTRAR IDENTIDAD DEL USUARIO CONECTADO
// ==========================================================================

function mostrarUsuarioConectado(usuario) {

    const nombre =
        document.getElementById(
            'sidebarUsuarioNombre'
        );

    const rol =
        document.getElementById(
            'sidebarUsuarioRol'
        );

    const sucursal =
        document.getElementById(
            'sidebarUsuarioSucursal'
        );


    if (nombre) {

        nombre.textContent =
            usuario.nombre ||
            'Usuario';

    }


    if (rol) {

        const nombresRol = {

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


        rol.textContent =
            nombresRol[usuario.rol] ||
            usuario.rol;

    }


    if (sucursal) {

        if (usuario.sucursal_id) {

            sucursal.textContent =
                usuario.sucursal_nombre ||
                `Sucursal #${usuario.sucursal_id}`;

            sucursal.hidden =
                false;

        } else {

            sucursal.textContent =
                'Acceso global';

            sucursal.hidden =
                false;

        }

    }

}

function limpiarSesionLocal() {

    localStorage.removeItem(
        'token_conception'
    );

    localStorage.removeItem(
        'usuario_conception'
    );

}


function mostrarErrorTemporalSesion(
    mensaje
) {

    console.warn(
        mensaje
    );


    // Por ahora dejamos un aviso sencillo.
    // Después podemos sustituirlo por un componente visual
    // global del Admin.

    const existente =
        document.getElementById(
            'adminSessionWarning'
        );


    if (existente) {

        existente.textContent =
            mensaje;

        return;

    }


    const aviso =
        document.createElement(
            'div'
        );


    aviso.id =
        'adminSessionWarning';


    aviso.setAttribute(
        'role',
        'alert'
    );


    aviso.textContent =
        mensaje;


    aviso.className =
        'admin-session-warning';


    document.body.appendChild(
        aviso
    );

}




// ==========================================================================
// CERRAR SESIÓN
// ==========================================================================

async function cerrarSesion() {

    const token =
        localStorage.getItem(
            'token_conception'
        );


    // Si no existe token, limpiar y regresar al login
    if (!token) {

        localStorage.removeItem(
            'usuario_conception'
        );

        window.location.replace(
            '/login.html'
        );

        return;

    }


    try {

        const response =
            await fetch(
                '/api/usuarios/logout',
                {
                    method: 'POST',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        const resultado =
            await response.json();


        if (
            !response.ok ||
            !resultado.success
        ) {

            console.warn(
                'El servidor no pudo cerrar la sesión:',
                resultado.message
            );

        }


    } catch (error) {

        console.error(
            'Error cerrando sesión:',
            error
        );

    } finally {

        // ==========================================
        // LIMPIAR SESIÓN DEL NAVEGADOR
        // ==========================================

        localStorage.removeItem(
            'token_conception'
        );

        localStorage.removeItem(
            'usuario_conception'
        );


        // ==========================================
        // REGRESAR AL LOGIN
        // ==========================================

        window.location.replace(
            '/login.html'
        );

    }

}