const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const upload = require('../config/fileUpload'); // Configurador de Multer para la subida de imágenes


const {
    verificarToken,
    verificarRoles
} = require('../middlewares/authMiddleware');

// =========================================================================
// 1. RUTAS PÚBLICAS Y DE ACTUALIZACIÓN RÁPIDA
// =========================================================================

// Obtener productos filtrados por sucursal
router.get('/', productoController.getProductos);
router.get("/:id/sucursales", productoController.getProductoSucursales);
router.post(
    "/:id/sucursales",
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    productoController.agregarProductoASucursal
);

// Obtener los productos favoritos/destacados de la sucursal activa
router.get('/destacados', productoController.getProductosDestacados);

// Obtener el detalle global de un producto por su ID
router.get('/:id', productoController.getProductoPorId);

// Modificar la disponibilidad (Disponible / Agotado) exclusiva de una sucursal
router.patch(
    '/:id/disponibilidad',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    productoController.cambiarDisponibilidad
);

// Marcar o desmarcar un producto como favorito/destacado en una sucursal
router.patch(
    '/:id/destacado',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    productoController.cambiarDestacado
);


// =========================================================================
// 2. RUTAS DE ADMINISTRACIÓN (CRUD Completo)
// =========================================================================

/**
 * CREAR PRODUCTO BASE Y VINCULARLO A LA SUCURSAL SELECCIONADA
 * 'imagen' es el name del campo file en el FormData enviado desde el frontend.
 */
router.post(
    '/',
    verificarToken,
    verificarRoles('admin'),
    upload.single('imagen'),
    productoController.crearProducto
);

/**
 * ACTUALIZAR PRODUCTO (DATOS GLOBALES Y PRECIO POR SUCURSAL)
 * Permite actualizar textos, categorías y opcionalmente reemplazar la imagen.
 */
/**
 * ACTUALIZAR PRODUCTO (DATOS GLOBALES Y PRECIO POR SUCURSAL)
 * Permite actualizar textos, categorías y opcionalmente reemplazar la imagen.
 */
router.put(
    '/:id',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    upload.single('imagen'),
    productoController.actualizarProducto
);
/**
 * ELIMINAR EL PRODUCTO DEL SISTEMA POR COMPLETO
 * Borra en cascada tanto el producto como sus registros de relación por sucursal.
 */
router.delete(
    '/:id',
    verificarToken,
    verificarRoles(
        'admin',
        'gerente'
    ),
    productoController.eliminarProducto
);

module.exports = router;