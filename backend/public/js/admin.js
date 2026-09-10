document.addEventListener("DOMContentLoaded", async () => {

    // 1. Poblamos el select con las sucursales reales de la BD
    await cargarSelectSucursalesAdmin();

    // 2. Iniciamos el módulo de Productos
    if (typeof Productos !== 'undefined' && typeof Productos.iniciar === 'function') {
        Productos.iniciar();
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
    if (!confirm('¿Estás seguro de que deseas eliminar este producto por completo?')) return;
    
    const resultado = await ProductosActions.darBajaProducto(id);
    if (resultado.success) {
        alert('Producto eliminado correctamente.');
        await cargarProductos();
    } else {
        alert(`Error al eliminar: ${resultado.message || 'Intente de nuevo.'}`);
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
// ENRUTADOR GLOBAL DE LA INTERFAZ DE USUARIO (UI)
// =========================================================================

function cambiarSeccion(seccion) {

    // ==========================================================
    // VALIDAR PERMISO VISUAL DE LA SECCIÓN
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

            console.trace(
                `Acceso denegado a la sección: ${seccion}`
            );

            return;

        }

    }



    // 1. CONTROL DE EMERGENCIA: Asegurar que la sección ejecutivo no esté atrapada en productos
    const seccionEjecutivo = document.getElementById('seccion-ejecutivo');
    const seccionProductos = document.getElementById('seccion-productos');
    const contenedorMain = document.querySelector('.main.main-content') || document.querySelector('.main-content');

    if (seccionEjecutivo && seccionProductos && contenedorMain) {
        // Si por algún error de renderizado la sección ejecutivo quedó metida dentro de productos
        if (seccionProductos.contains(seccionEjecutivo)) {
            // La sacamos de ahí y la ponemos de vuelta en el contenedor principal como hermana
            contenedorMain.appendChild(seccionEjecutivo);
        }
    }

    // 2. Configuración normal de tus secciones
    const configuracionSecciones = {
        'productos': {
            id: 'seccion-productos',
            titulo: 'Gestión de Productos',
            subtitulo: 'Administra los platillos, precios y disponibilidad de la vitrina digital.'
        },
        'ejecutivo': {
            id: 'seccion-ejecutivo',
            titulo: 'Menú de la Semana',
            subtitulo: 'Planifica y actualiza los platos ejecutivos para la rotación semanal.'
        },
        'hero': {
            id: 'seccion-hero',
            titulo: 'Sliders de Inicio',
            subtitulo: 'Configura las imágenes principales de la página de inicio.'
        },
        'experiencias': {
            id: 'seccion-experiencias',
            titulo: 'Sección Experiencias',
            subtitulo: 'Administra las reseñas y los comentarios destacados de tus clientes.'
        },

        'sucursales': {
            id: 'seccion-sucursales',
            titulo: 'Gestión de Sucursales',
            subtitulo: 'Administra la información de tus sucursales, horarios y ubicaciones.'
        },

        'plantillas': {
            id: 'seccion-plantillas',
            titulo: 'Plantillas del Menú',
            subtitulo: 'Personaliza la presentación visual del Menú Ejecutivo.'
        },

        'usuarios': {
            id: 'seccion-usuarios',
            titulo: 'Gestión de Usuarios',
            subtitulo: 'Administra los accesos, roles y sucursales del personal.'
        },

        'auditoria': {
            id: 'seccion-auditoria',
            titulo: 'Auditoría y Seguridad',
            subtitulo: 'Monitorea las IPs de origen, sesiones activas e historial de conexiones.'
        }
        

    };

    // 3. Ocultar de forma automática todas las secciones declaradas
    Object.values(configuracionSecciones).forEach(sec => {
        const elemento = document.getElementById(sec.id);
        if (elemento) elemento.style.display = 'none';
    });

    // 4. Manejo estético de botones del Menú Lateral (.active)
    const botones = document.querySelectorAll('.menu-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    
    const botonActivo = Array.from(botones).find(btn => {
        const attr = btn.getAttribute('onclick') || '';
        return attr.includes(seccion);
    });
    if (botonActivo) botonActivo.classList.add('active');

    // 5. Renderizar textos y títulos dinámicos
    const dataSeccion = configuracionSecciones[seccion];

    if (dataSeccion) {
        const seccionObjetivo = document.getElementById(dataSeccion.id);
        const tituloGlobal = document.getElementById("section-title");
        const subtituloGlobal = document.getElementById("section-subtitle");

        // Mostrar únicamente la sección seleccionada
        if (seccionObjetivo) {
            seccionObjetivo.style.display = "block";
        }

        // Actualizar títulos
        if (tituloGlobal) {
            tituloGlobal.innerText = dataSeccion.titulo;
        }

        if (subtituloGlobal) {
            subtituloGlobal.innerText = dataSeccion.subtitulo;
        }

        // Inicializar Planner únicamente al entrar al módulo
        if (
            seccion === "ejecutivo" &&
            typeof Planner !== "undefined" &&
            typeof Planner.iniciar === "function"
        ) {
            Planner.iniciar();
        }


        // Sliders
        if (
            seccion === "hero" &&
            typeof cargarSlidersAdmin === "function"
        ) {
            cargarSlidersAdmin();
        }


        // Experiencias
        if (
            seccion === "experiencias" &&
            typeof cargarExperienciasAdmin === "function"
        ) {
            cargarExperienciasAdmin();
        }


        // Plantillas
        if (
            seccion === "plantillas" &&
            typeof PlantillasAdmin !== "undefined" &&
            typeof PlantillasAdmin.iniciar === "function"
        ) {
            PlantillasAdmin.iniciar();
        }


        // Usuarios
        if (
            seccion === "usuarios" &&
            typeof cargarUsuarios === "function"
        ) {
            cargarUsuarios();
        }


        // Auditoría
        if (
            seccion === "auditoria" &&
            typeof cargarAuditoriaIPs === "function"
        ) {
            cargarAuditoriaIPs();
        }



    } else {
        console.warn(`La sección "${seccion}" no está registrada.`);
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


