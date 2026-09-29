// backend/routes/usuarioRoutes.js

const express = require('express');

const router = express.Router();

const usuarioController =
    require('../controllers/usuarioController');

const {
    verificarToken,
    verificarRoles
} = require('../middlewares/authMiddleware');


// ==========================================================
// RUTAS PÚBLICAS
// ==========================================================

// Login
router.post(
    '/login',
    usuarioController.login

);

router.get(
    '/sesion',
    verificarToken,
    usuarioController.validarSesion
);


// ==========================================================
// RUTAS PROTEGIDAS - ADMINISTRACIÓN DE USUARIOS
// ==========================================================

// Listar usuarios
router.get(
    '/',
    verificarToken,
    verificarRoles('admin'),
    usuarioController.obtenerTodos
);


// Crear usuarios desde el panel administrativo
router.post(
    '/registro',
    verificarToken,
    verificarRoles('admin'),
    usuarioController.registrar
);


// ==========================================================
// EDITAR USUARIO
// ==========================================================

router.put(
    '/:id',
    verificarToken,
    verificarRoles('admin'),
    usuarioController.editar
);



// Cambiar estado de un usuario
router.patch(
    '/:id/estado',
    verificarToken,
    verificarRoles('admin'),
    usuarioController.cambiarEstado
);


// ==========================================================
// CAMBIAR CONTRASEÑA PROPIA
// ==========================================================

router.put(
    '/me/password',
    verificarToken,
    usuarioController.cambiarPassword
);



// ==========================================================
// SESIÓN DEL USUARIO AUTENTICADO
// ==========================================================

// Cerrar la propia sesión
router.post(
    '/logout',
    verificarToken,
    usuarioController.logout
);


// ==========================================================
// AUDITORÍA - SOLO ADMIN
// ==========================================================

router.get(
    '/auditoria-sesiones',
    verificarToken,
    verificarRoles('admin'),
    usuarioController.obtenerHistorialSesiones
);


// Revocar una sesión desde administración
router.post(
    '/revocar-sesion',
    verificarToken,
    verificarRoles('admin'),
    usuarioController.revocarSesion
);


module.exports = router;