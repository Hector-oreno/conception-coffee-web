const express = require('express');

const router = express.Router();

const experienciasController =
    require('../controllers/experienciasController');

const upload =
    require('../config/fileUpload');

const {
    verificarToken,
    verificarRoles
} = require('../middlewares/authMiddleware');


// ==========================================================
// RUTAS PÚBLICAS
// ==========================================================

// Experiencias publicadas para el sitio
router.get(
    '/cliente',
    experienciasController.obtenerExperienciasCliente
);


// ==========================================================
// RUTAS ADMINISTRATIVAS
// ==========================================================

// Listado completo del Admin
router.get(
    '/admin',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    experienciasController.obtenerExperienciasAdmin
);


// Crear experiencia
router.post(
    '/',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    upload.single('imagen'),
    experienciasController.crearExperiencia
);


// Publicar cambios
router.put(
    '/publicar',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    experienciasController.publicarCambios
);


// Cambiar estado / actualizar
router.put(
    '/:id',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    experienciasController.actualizarExperiencia
);


// Eliminar
router.delete(
    '/:id',
    verificarToken,
    verificarRoles('admin', 'gerente'),
    experienciasController.eliminarExperiencia
);


module.exports = router;