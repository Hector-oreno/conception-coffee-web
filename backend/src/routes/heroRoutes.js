const express = require('express');

const router = express.Router();

const heroController =
    require('../controllers/heroController');

const upload =
    require('../config/fileUpload');

const {
    verificarToken,
    verificarRoles
} = require('../middlewares/authMiddleware');


// ==========================================================
// RUTAS PÚBLICAS
// ==========================================================

// Slider visible en el sitio web
router.get(
    '/cliente',
    heroController.obtenerSlidersCliente
);


// ==========================================================
// RUTAS ADMINISTRATIVAS
// ==========================================================

// Listado completo del Admin
router.get(
    '/admin',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    heroController.obtenerSlidersAdmin
);


// Crear slider
router.post(
    '/',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    upload.single('imagen'),
    heroController.crearSlider
);


// Publicar cambios
router.put(
    '/publicar',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    heroController.publicarCambios
);


// Actualizar slider
router.put(
    '/:id',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    heroController.actualizarSlider
);


// Eliminar slider
router.delete(
    '/:id',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    heroController.eliminarSlider
);


module.exports = router;