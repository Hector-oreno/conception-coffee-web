const express = require(
    "express"
);

const router =
    express.Router();

const menuSemanaController =
    require(
        "../controllers/menuSemanaController"
    );

const upload =
    require(
        "../config/fileUpload"
    );

const {
    verificarToken,
    verificarRoles
} = require(
    "../middlewares/authMiddleware"
);


// ==========================================================================
// MENÚ DE LA SEMANA · ROUTER
// ==========================================================================


// ==========================================================================
// CATÁLOGO MAESTRO
// ==========================================================================

// Obtener platillos activos
router.get(
    "/catalogo",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerCatalogo
);


// Obtener platillos inactivos
router.get(
    "/catalogo/inactivos",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .obtenerPlatillosInactivos
);


// Crear platillo
router.post(
    "/catalogo",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    upload.single(
        "imagen"
    ),

    menuSemanaController
        .crearPlatillo
);


// Actualizar platillo
router.put(
    "/catalogo/:id",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    upload.single(
        "imagen"
    ),

    menuSemanaController
        .actualizarPlatillo
);


// Desactivar platillo
router.delete(
    "/catalogo/:id",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .desactivarPlatillo
);


// Reactivar platillo
router.patch(
    "/catalogo/:id/reactivar",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .reactivarPlatillo
);


// ==========================================================================
// GUARNICIONES
// ==========================================================================

// Obtener catálogo de guarniciones
router.get(
    "/guarniciones",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerGuarniciones
);


// Crear guarnición
router.post(
    "/guarniciones",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .crearGuarnicion
);


// ==========================================================================
// DICCIONARIO DE EMOJIS
// ==========================================================================

// Obtener activos
router.get(
    "/emojis",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerDiccionarioEmojis
);


// Obtener inactivos
router.get(
    "/emojis/inactivos",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerEmojisInactivos
);


// Buscar asociación
router.get(
    "/emojis/buscar/:palabra",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .buscarEmojiPorPalabra
);


// Crear / recuperar / reactivar
router.post(
    "/emojis",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .crearEmoji
);


// Actualizar
router.put(
    "/emojis/:id",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .actualizarEmoji
);


// Desactivar
router.patch(
    "/emojis/:id/desactivar",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .desactivarEmoji
);


// Reactivar
router.patch(
    "/emojis/:id/reactivar",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .reactivarEmoji
);


// ==========================================================================
// MENÚ PÚBLICO
// ==========================================================================

// Menú publicado para el sitio web
router.get(
    "/menu-semana",

    menuSemanaController
        .obtenerMenuPublicado
);


// ==========================================================================
// DASHBOARD
// ==========================================================================

// Métricas
router.get(
    "/metricas",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerMetricas
);


// Historial
router.get(
    "/historial",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerHistorial
);


// ==========================================================================
// PLANIFICACIÓN DE SEMANAS
// ==========================================================================

// Calendario de semanas disponibles
router.get(
    "/semanas-disponibles",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerSemanasDisponibles
);


// Crear semana
router.post(
    "/crear-semana",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .crearNuevaSemana
);


// Eliminar semana
router.delete(
    "/semana/:id",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .eliminarSemana
);


// Sucursales planificadas
router.get(
    "/semana/:id/sucursales",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerSucursalesPlanificadas
);


// ==========================================================================
// GRILLA OPERATIVA
// ==========================================================================

// Obtener grilla de semana + sucursal
router.get(
    "/grilla",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerMenu
);


// Guardar planificación
router.post(
    "/guardar",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .guardarMenuMasivo
);


// ==========================================================================
// PUBLICACIÓN Y WHATSAPP
// ==========================================================================

// Publicar semana
router.post(
    "/publicar",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .publicarSemana
);


// Generar texto para WhatsApp
router.get(
    "/generar-whatsapp",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .generarTextoWhatsApp
);


// ==========================================================================
// PLANTILLAS PROMOCIONALES
// ==========================================================================

// Plantillas activas para Workspace
router.get(
    "/plantillas",

    verificarToken,

    verificarRoles(
        "admin",
        "gerente"
    ),

    menuSemanaController
        .obtenerPlantillas
);


// Todas las plantillas para administración
router.get(
    "/plantillas/admin",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .obtenerTodasPlantillas
);


// Actualizar configuración
router.put(
    "/plantillas/:id/configuracion",

    verificarToken,

    verificarRoles(
        "admin"
    ),

    menuSemanaController
        .actualizarConfiguracionPlantilla
);


// ==========================================================================
// EXPORTAR ROUTER
// ==========================================================================

module.exports =
    router;