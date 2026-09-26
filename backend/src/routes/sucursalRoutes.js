const express =
    require('express');

const router =
    express.Router();

const sucursalController =
    require('../controllers/sucursalController');

const upload =
    require('../config/fileUpload');

const {
    verificarToken,
    verificarRoles
} = require('../middlewares/authMiddleware');


// ==========================================================
// RUTAS DEL MÓDULO · SUCURSALES
// ==========================================================


// ==========================================================
// RUTAS PÚBLICAS
// ==========================================================


// Listado de sucursales
// Utilizado por Index y La Carta
router.get(
    '/',
    sucursalController.getSucursales
);


// ==========================================================
// RUTAS ADMINISTRATIVAS
// ==========================================================


// ==========================================================
// CREAR SUCURSAL
// ==========================================================
//
// multipart/form-data porque ahora puede recibir:
// - nombre
// - direccion
// - horario
// - telefono
// - mapa_url
// - imagen
//

router.post(
    '/',
    verificarToken,
    verificarRoles('admin'),
    upload.single('imagen'),
    sucursalController.crearSucursal
);


// ==========================================================
// EDITAR SUCURSAL
// ==========================================================
//
// La fotografía es opcional.
//
// Si no se envía una imagen nueva:
// → conserva la fotografía actual.
//
// Si se envía una imagen nueva:
// → actualiza imagen_url
// → el controller elimina el archivo anterior.
//

router.put(
    '/:id',
    verificarToken,
    verificarRoles('admin'),
    upload.single('imagen'),
    sucursalController.actualizarSucursal
);


// ==========================================================
// ACTIVAR / DESACTIVAR SUCURSAL
// ==========================================================
//
// Esta operación NO elimina la sucursal.
// Solo modifica el campo activa.
//

router.patch(
    '/:id/estado',
    verificarToken,
    verificarRoles('admin'),
    sucursalController.toggleEstadoSucursal
);


// ==========================================================
// EXPORTAR ROUTER
// ==========================================================

module.exports =
    router;