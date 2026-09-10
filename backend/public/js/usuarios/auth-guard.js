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


    // ======================================================================
    // NO EXISTE TOKEN
    // ======================================================================

    if (!token) {

        window.location.replace(
            '/login.html'
        );

        return;

    }


    try {

        // ==================================================================
        // VALIDAR SESIÓN CONTRA EL BACKEND
        // ==================================================================

        const response =
            await fetch(
                '/api/usuarios/sesion',
                {
                    method: 'GET',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    },

                    cache: 'no-store'
                }
            );


        const resultado =
            await response.json();


        // ==================================================================
        // SESIÓN INVÁLIDA / EXPIRADA / REVOCADA
        // ==================================================================

        if (
            !response.ok ||
            !resultado.success ||
            !resultado.usuario
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


        // ==================================================================
        // SOLO ROLES ADMINISTRATIVOS
        // ==================================================================

        const rolesPermitidos = [
            'admin',
            'gerente',
            'cajero',
            'mesero',
            'cocina'
        ];


        if (
            !rolesPermitidos.includes(
                resultado.usuario.rol
            )
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


        // ==================================================================
        // MOSTRAR USUARIO CONECTADO
        // ==================================================================

        mostrarUsuarioConectado(
            resultado.usuario
        );

        aplicarPermisosSecciones(
            resultado.usuario
        );


        

    } catch (error) {

        console.error(
            'Error validando sesión administrativa:',
            error
        );


        localStorage.removeItem(
            'token_conception'
        );

        localStorage.removeItem(
            'usuario_conception'
        );


        window.location.replace(
            '/login.html'
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
                `Sucursal #${usuario.sucursal_id}`;

            sucursal.style.display =
                'inline';

        } else {

            sucursal.textContent =
                'Acceso global';

            sucursal.style.display =
                'inline';

        }

    }

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