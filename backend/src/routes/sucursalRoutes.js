const express = require('express');

const router = express.Router();

const sucursalController =
    require('../controllers/sucursalController');

const {
    verificarToken,
    verificarRoles
} = require('../middlewares/authMiddleware');


// ==========================================================
// RUTAS PÚBLICAS
// ==========================================================

// Listado de sucursales para Index y La Carta
router.get(
    '/',
    sucursalController.getSucursales
);


// ==========================================================
// RUTAS ADMINISTRATIVAS
// ==========================================================

// Crear sucursal
router.post(
    '/',
    verificarToken,
    verificarRoles('admin'),
    sucursalController.crearSucursal
);


// Activar / desactivar sucursal
router.patch(
    '/:id/estado',
    verificarToken,
    verificarRoles('admin'),
    sucursalController.toggleEstadoSucursal
);


module.exports = router;