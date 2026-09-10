const express = require('express');
const router = express.Router();
const menuSemanaController = require('../controllers/menuSemanaController');
const upload = require('../config/fileUpload');

const {
    verificarToken,
    verificarRoles
} = require('../middlewares/authMiddleware');

// =========================================================================
// RUTAS DEL MÓDULO: MENÚ DE LA SEMANA (CONTROLADO Y AUTOMÁTICO)
// =========================================================================


// RUTA 1: Obtener el catálogo maestro de platos
router.get(
    '/catalogo',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerCatalogo
);

router.post(
    '/catalogo',
    verificarToken,
    verificarRoles('admin'),
    upload.single('imagen'),
    menuSemanaController.crearPlatillo
);


router.put(
    '/catalogo/:id',
    verificarToken,
    verificarRoles('admin'),
    upload.single('imagen'),
    menuSemanaController.actualizarPlatillo
);


router.delete(
    '/catalogo/:id',
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.desactivarPlatillo
);


router.get(
    '/catalogo/inactivos',
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.obtenerPlatillosInactivos
);


router.patch(
    '/catalogo/:id/reactivar',
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.reactivarPlatillo
);


router.get(
    "/emojis",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerDiccionarioEmojis
);


router.get(
    "/emojis/buscar/:palabra",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.buscarEmojiPorPalabra
);


router.get(
    "/guarniciones",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerGuarniciones
);


router.post(
    "/emojis",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.crearEmoji
);


router.post(
    "/guarniciones",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.crearGuarnicion
);





router.get("/menu-semana", menuSemanaController.obtenerMenuPublicado);

// [NUEVA] RUTA: Obtener métricas / contadores superiores del dashboard

router.get(
    '/metricas',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerMetricas
);


router.get(
    '/historial',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerHistorial
);


router.get(
    "/semanas-disponibles",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerSemanasDisponibles
);


// [NUEVA] RUTA: Obtener el historial maestro de semanas para la tabla inicial


router.delete(
    "/semana/:id",
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.eliminarSemana
);





router.get(
    "/plantillas",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerPlantillas
);

router.get(
    "/plantillas/admin",
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.obtenerTodasPlantillas
);

router.put(
    "/plantillas/:id/configuracion",
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.actualizarConfiguracionPlantilla
);


// RUTA 2: Obtener la grilla operativa diaria de una semana y sucursal específica


// RUTA 3: Guardar o Actualizar de forma masiva/individual la grilla
router.get(
    "/semana/:id/sucursales",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerSucursalesPlanificadas
);


router.get(
    '/grilla',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.obtenerMenu
);


router.post(
    '/guardar',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.guardarMenuMasivo
);

// RUTA 4: Crear automáticamente una nueva semana operativa
router.post(
    '/crear-semana',
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.crearNuevaSemana
);

router.post(
    '/publicar',
    verificarToken,
    verificarRoles('admin'),
    menuSemanaController.publicarSemana
);

// RUTA 4: Obtener el bloque de texto traducido con emojis listo para WhatsApp
router.get(
    '/generar-whatsapp',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    menuSemanaController.generarTextoWhatsApp
);

module.exports = router;