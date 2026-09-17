document.addEventListener("DOMContentLoaded", async () => {

    // 1. Poblamos el select con las sucursales reales de la BD
    await cargarSelectSucursalesAdmin();

    // 2. Iniciamos el módulo de Productos
    if (typeof Productos !== 'undefined' && typeof Productos.iniciar === 'function') {
        Productos.iniciar();
    }


    const sidebarToggle =
        document.getElementById(
            'sidebarToggle'
        );

    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            'click',
            alternarSidebarAdmin
        );

    }


});

// =========================================================================
// MÓDULO: PRODUCTOS (Puentes hacia Componentes Especializados)
// =========================================================================

// Obtener productos cruzados con la SUCURSAL de la base de datos
async function cargarProductos() {
    await ProductosTable.cargarProductos();
}

// Abrir el modal cargando los datos cruzados por Sucursal
async function abrirModalEditar(id) {
    await ProductosModal.abrirEditar(id);
}

// Cargar la información del producto en el botón de sucursal
async function abrirModalSucursales(id) {
    await ProductosModal.abrirSucursales(id);
}

// Cerrar el modal de asignación de sucursales
function cerrarModalSucursales() {
    if (typeof ProductosModal !== 'undefined' && typeof ProductosModal.cerrarSucursales === 'function') {
        ProductosModal.cerrarSucursales();
    } else {
        const modal = document.getElementById("modal-sucursales");
        if (modal) modal.style.display = "none";
    }
}

// Función para eliminar el producto por sucursal
async function darBajaProducto(id) {
    if (
        !confirm(
            '¿Deseas dar de baja este producto en la sucursal seleccionada?'
        )
    ) {
        return;
    }
    
    const resultado = await ProductosActions.darBajaProducto(id);
    if (resultado.success) {
        alert('Producto dado de baja correctamente.');
        await cargarProductos();
    } else {
        alert(
            `Error al dar de baja: ${
                resultado.message ||
                'Intente de nuevo.'
            }`
        );
    }
}

// Cambiar Disponibilidad Rápida por Sucursal
async function conmutarDisponibilidad(id, estadoActual) {
    const exito = await ProductosActions.conmutarDisponibilidad(id, estadoActual);
    if (exito) {
        await cargarProductos();
    } else {
        alert('No se pudo actualizar la disponibilidad del producto.');
    }
}

// Cambiar Destacado Rápido por Sucursal
async function conmutarDestacado(id, destacadoActual) {
    const exito = await ProductosActions.conmutarDestacado(id, destacadoActual);
    if (exito) {
        await cargarProductos();
    } else {
        alert('No se pudo actualizar el estado destacado.');
    }
}


// =========================================================================
// SIDEBAR ADMINISTRATIVO
// =========================================================================

function obtenerContenedorAdmin() {

    return document.querySelector(
        '.admin-container'
    );

}


function colapsarSidebarAdmin() {

    const contenedor =
        obtenerContenedorAdmin();


    if (!contenedor) {
        return;
    }


    contenedor.classList.add(
        'sidebar-collapsed'
    );


    const boton =
        document.getElementById(
            'sidebarToggle'
        );


    if (boton) {

        boton.setAttribute(
            'aria-label',
            'Expandir menú'
        );

        boton.title =
            'Expandir menú';

    }

}


function expandirSidebarAdmin() {

    const contenedor =
        obtenerContenedorAdmin();


    if (!contenedor) {
        return;
    }


    contenedor.classList.remove(
        'sidebar-collapsed'
    );


    const boton =
        document.getElementById(
            'sidebarToggle'
        );


    if (boton) {

        boton.setAttribute(
            'aria-label',
            'Contraer menú'
        );

        boton.title =
            'Contraer menú';

    }

}


function alternarSidebarAdmin() {

    const contenedor =
        obtenerContenedorAdmin();


    if (!contenedor) {
        return;
    }


    if (
        contenedor.classList.contains(
            'sidebar-collapsed'
        )
    ) {

        expandirSidebarAdmin();

    } else {

        colapsarSidebarAdmin();

    }

}


// =========================================================================
// ENRUTADOR GLOBAL DEL PANEL ADMINISTRATIVO
// =========================================================================

function cambiarSeccion(seccion) {

    // ==========================================================
    // CONFIGURACIÓN CENTRAL DE SECCIONES
    // ==========================================================

    const configuracionSecciones = {

        productos: {
            id: 'seccion-productos',
            titulo: 'Gestión de Productos',
            subtitulo:
                'Administra los platillos, precios y disponibilidad de la vitrina digital.'
        },

        ejecutivo: {
            id: 'seccion-ejecutivo',
            titulo: 'Menú de la Semana',
            subtitulo:
                'Planifica y actualiza los platos ejecutivos para la rotación semanal.'
        },

        hero: {
            id: 'seccion-hero',
            titulo: 'Sliders de Inicio',
            subtitulo:
                'Configura las imágenes principales de la página de inicio.'
        },

        experiencias: {
            id: 'seccion-experiencias',
            titulo: 'Sección Experiencias',
            subtitulo:
                'Administra las reseñas y los comentarios destacados de tus clientes.'
        },

        sucursales: {
            id: 'seccion-sucursales',
            titulo: 'Gestión de Sucursales',
            subtitulo:
                'Administra la información de tus sucursales, horarios y ubicaciones.'
        },

        plantillas: {
            id: 'seccion-plantillas',
            titulo: 'Plantillas del Menú',
            subtitulo:
                'Personaliza la presentación visual del Menú Ejecutivo.'
        },

        usuarios: {
            id: 'seccion-usuarios',
            titulo: 'Gestión de Usuarios',
            subtitulo:
                'Administra los accesos, roles y sucursales del personal.'
        },

        auditoria: {
            id: 'seccion-auditoria',
            titulo: 'Auditoría y Seguridad',
            subtitulo:
                'Monitorea las IPs de origen, sesiones activas e historial de conexiones.'
        }

    };


    // ==========================================================
    // VALIDAR SECCIÓN
    // ==========================================================

    const dataSeccion =
        configuracionSecciones[seccion];


    if (!dataSeccion) {

        console.warn(
            `La sección "${seccion}" no está registrada.`
        );

        return;

    }


    // ==========================================================
    // VALIDAR PERMISOS VISUALES
    // ==========================================================

    const usuarioSesion =
        JSON.parse(
            localStorage.getItem(
                'usuario_conception'
            ) || 'null'
        );


    if (usuarioSesion) {

        const permisos =
            window.PERMISOS_SECCIONES?.[
                usuarioSesion.rol
            ] || [];


        if (!permisos.includes(seccion)) {

            console.warn(
                `Acceso visual denegado a: ${seccion}`
            );

            return;

        }

    }


    // ==========================================================
    // OCULTAR TODAS LAS SECCIONES DEL ADMIN
    // ==========================================================
    //
    // IMPORTANTE:
    // - Quitamos is-active.
    // - Eliminamos cualquier display inline heredado.
    // - El CSS global decide qué módulo se ve.
    //
    // Esto evita que Productos, Planner, Sliders, Usuarios,
    // Auditoría, etc. se acumulen en pantalla.
    // ==========================================================

    document
        .querySelectorAll('.admin-module')
        .forEach(modulo => {

            modulo.classList.remove(
                'is-active'
            );

            modulo.style.removeProperty(
                'display'
            );

        });


    // ==========================================================
    // OBTENER SECCIÓN SOLICITADA
    // ==========================================================

    const seccionObjetivo =
        document.getElementById(
            dataSeccion.id
        );


    if (!seccionObjetivo) {

        console.error(
            `No existe #${dataSeccion.id} en admin.html`
        );

        return;

    }


    // ==========================================================
    // MOSTRAR ÚNICAMENTE LA SECCIÓN SOLICITADA
    // ==========================================================

    seccionObjetivo.classList.add(
        'is-active'
    );


    // ==========================================================
    // ACTUALIZAR BOTÓN ACTIVO
    // ==========================================================

    document
        .querySelectorAll('.menu-btn')
        .forEach(btn => {

            btn.classList.toggle(
                'active',
                btn.dataset.seccion === seccion
            );

        });


    // ==========================================================
    // TÍTULO / SUBTÍTULO
    // ==========================================================

    const titulo =
        document.getElementById(
            'section-title'
        );

    const subtitulo =
        document.getElementById(
            'section-subtitle'
        );


    if (titulo) {

        titulo.textContent =
            dataSeccion.titulo;

    }


    if (subtitulo) {

        subtitulo.textContent =
            dataSeccion.subtitulo;

    }


    // ==========================================================
    // CARGA ESPECÍFICA DEL MÓDULO
    // ==========================================================

    switch (seccion) {

        case 'productos':

            if (
                typeof cargarProductos ===
                'function'
            ) {

                cargarProductos();

            }

            break;


        case 'ejecutivo':

            if (
                typeof Planner !== 'undefined' &&
                typeof Planner.iniciar ===
                'function'
            ) {

                Planner.iniciar();

            }

            break;


        case 'hero':

            if (
                typeof cargarSlidersAdmin ===
                'function'
            ) {

                cargarSlidersAdmin();

            }

            break;


        case 'experiencias':

            if (
                typeof cargarExperienciasAdmin ===
                'function'
            ) {

                cargarExperienciasAdmin();

            }

            break;


        case 'sucursales':

            if (
                typeof cargarTablaSucursales ===
                'function'
            ) {

                cargarTablaSucursales();

            }

            break;


        case 'plantillas':

            if (
                typeof PlantillasAdmin !== 'undefined' &&
                typeof PlantillasAdmin.iniciar ===
                'function'
            ) {

                PlantillasAdmin.iniciar();

            }

            break;


        case 'usuarios':

            if (
                typeof cargarUsuarios ===
                'function'
            ) {

                cargarUsuarios();

            }

            break;


        case 'auditoria':

            if (
                typeof cargarAuditoriaIPs ===
                'function'
            ) {

                cargarAuditoriaIPs();

            }

            break;

    }


    // ==========================================================
    // EXPANDIR SIDEBAR AL CAMBIAR DE MÓDULO
    // ==========================================================

    if (
        typeof expandirSidebarAdmin ===
        'function'
    ) {

        expandirSidebarAdmin();

    }

}

// Cargar el select de sucursales en la pestaña de Productos
async function cargarSelectSucursalesAdmin() {
    try {
        const response = await fetch('/api/sucursales');
        const sucursales = await response.json();

        // Apuntamos al ID exacto de tu HTML: "selectSucursal"
        const selectAdmin = document.getElementById('selectSucursal'); 
        
        if (selectAdmin && Array.isArray(sucursales) && sucursales.length > 0) {
            selectAdmin.innerHTML = ''; // Limpiamos la opción estática de Santa Lucía

            sucursales.forEach((sucursal, index) => {
                const option = document.createElement('option');
                option.value = sucursal.id;
                option.textContent = sucursal.nombre;
                
                // Dejamos seleccionada la primera por defecto
                if (index === 0) {
                    option.selected = true;
                }
                
                selectAdmin.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando sucursales en admin:', error);
    }
}

// =========================================================================
// VENTANAS EMERGENTES (MODALES GENÉRICOS / ESTÁTICOS)
// =========================================================================

function mostrarModalEstatico(idModal) {
    const modal = document.getElementById(idModal);
    if (!modal) return;

    modal.style.display = "flex";

    // Si se levanta el Workspace del planificador, disparamos su lógica interna
    if (idModal === "plannerWorkspace") {
        if (typeof Planner !== 'undefined' && typeof Planner.iniciar === 'function') {
            Planner.iniciar();
        }
    }
}

function ocultarModalEstatico(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'none';
}

// Guardar nueva sucursal completa
async function guardarNuevaSucursal(e) {
    e.preventDefault();

    const nombre = document.getElementById('nuevaSucursalNombre').value;
    const direccion = document.getElementById('nuevaSucursalDireccion').value;
    const horario = document.getElementById('nuevaSucursalHorario') ? document.getElementById('nuevaSucursalHorario').value : '';
    const telefono = document.getElementById('nuevaSucursalTelefono') ? document.getElementById('nuevaSucursalTelefono').value : '';

    try {
        const res = await fetch('/api/sucursales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, direccion, horario, telefono })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            alert('¡Sucursal creada exitosamente!');
            cerrarModalSucursal();
            document.getElementById('formNuevaSucursal').reset();
            
            // 1. Recarga la tabla de la pestaña Sucursales
            if (typeof cargarTablaSucursales === 'function') {
                await cargarTablaSucursales();
            }

            // 2. Recarga el select desplegable de la pestaña Productos
            if (typeof cargarSelectSucursalesAdmin === 'function') {
                await cargarSelectSucursalesAdmin();
            }
        } else {
            alert('Error: ' + (data.error || 'No se pudo crear la sucursal'));
        }
    } catch (err) {
        console.error('Error enviando sucursal:', err);
    }
}

function abrirModalSucursal() {
    document.getElementById('modalSucursal').style.display = 'flex';
}

function cerrarModalSucursal() {
    document.getElementById('modalSucursal').style.display = 'none';
}


