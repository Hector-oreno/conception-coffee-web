const pool = require('../config/db'); // Conexión a MariaDB

// =========================================================================
// 1. OBTENER TODOS LOS PRODUCTOS POR SUCURSAL
// =========================================================================
const obtenerProductos = async (buscar = '', sucursalId = 1, soloDisponibles = false) => {
    let query = `
        SELECT
            p.id,
            p.nombre,
            p.descripcion,
            p.imagen,
            p.categoria_id,
            p.tipo,
            p.codigo_sku,
            p.activo,
            ps.precio,        -- Desde tabla intermedia
            ps.disponible,    -- Desde tabla intermedia
            ps.destacado,     -- Desde tabla intermedia
            c.nombre AS categoria_nombre,
            c.slug AS categoria_slug
        FROM productos p
        INNER JOIN producto_sucursal ps ON p.id = ps.producto_id
        INNER JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = TRUE AND ps.sucursal_id = ?
    `;
    
    const params = [sucursalId];

    // Si la llamada viene del cliente público, filtramos solo los disponibles
    if (soloDisponibles) {
        query += ` AND ps.disponible = 1`;
    }

    if (buscar && buscar.trim() !== '') {
        query += ` AND p.nombre LIKE ?`;
        params.push(`%${buscar.trim()}%`);
    }

    query += ` ORDER BY p.id ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
};

// =========================================================================
// 2. OBTENER PRODUCTOS DESTACADOS POR SUCURSAL (Para el Inicio del Cliente)
// =========================================================================
const obtenerProductosDestacados = async (sucursalId = 1) => {
    const [rows] = await pool.query(`
        SELECT
            p.id, p.nombre, p.descripcion, p.imagen, p.categoria_id, p.tipo, p.codigo_sku, p.activo,
            ps.precio, ps.disponible, ps.destacado,
            c.nombre AS categoria_nombre,
            c.slug AS categoria_slug
        FROM productos p
        INNER JOIN producto_sucursal ps ON p.id = ps.producto_id
        INNER JOIN categorias c ON p.categoria_id = c.id
        WHERE ps.destacado = 1
          AND p.activo = 1
          AND ps.disponible = 1
          AND ps.sucursal_id = ?
        ORDER BY p.id ASC
    `, [sucursalId]);

    return rows;
};

// =========================================================================
// 3. OBTENER UN ÚNICO PRODUCTO POR ID Y SUCURSAL (Para cargar el Modal)
// =========================================================================
const obtenerProductoPorId = async (id, sucursalId = 1) => {
    const query = `
        SELECT 
            p.id, p.nombre, p.descripcion, p.imagen, p.categoria_id, p.tipo, p.codigo_sku, p.activo,
            ps.precio, ps.disponible, ps.destacado,
            c.nombre AS categoria_nombre 
        FROM productos p
        INNER JOIN producto_sucursal ps ON p.id = ps.producto_id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ? AND ps.sucursal_id = ?
    `;
    const [rows] = await pool.query(query, [id, sucursalId]);
    return rows.length > 0 ? rows[0] : null;
};


// ========================================================================
// OBTENER PRODUCTO + TODAS SUS SUCURSALES
// ========================================================================

const obtenerProductoSucursales = async (id) => {

    const query = `
        SELECT

            p.id,
            p.nombre,
            p.descripcion,
            p.codigo_sku,

            s.id AS sucursal_id,
            s.nombre AS sucursal_nombre,

            ps.precio,
            ps.disponible,
            ps.destacado,

            CASE
                WHEN ps.producto_id IS NULL THEN 0
                ELSE 1
            END AS asignado


        FROM productos p

        CROSS JOIN sucursales s

        LEFT JOIN producto_sucursal ps
            ON p.id = ps.producto_id
            AND s.id = ps.sucursal_id

        WHERE p.id = ?

        ORDER BY s.nombre
    `;

    const [rows] = await pool.query(query,[id]);

    return rows;

};

// Obtener lista de sucursales para el SELECT del frontend
const obtenerSucursales = async () => {
    const [rows] = await pool.query('SELECT id, nombre FROM sucursales ORDER BY id ASC');
    return rows;
};


// =========================================================================
// 4. INSERTAR PRODUCTO (Maestro + Relación con Sucursal Activa)
// =========================================================================
const insertarProducto = async (producto, sucursalId = 1) => {
    // ¡CORREGIDO! Usamos categoria_id de forma consistente con el controlador
    const { nombre, descripcion, precio, categoria_id, destacado, disponible, imagen, tipo } = producto;
    
    // Generación automática de SKU basada en el tipo
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM productos WHERE tipo = ?', [tipo || 'servicio']);
    const prefijo = (tipo === 'producto') ? 'P' : 'S';
    const nuevoSku = `${prefijo}-${String(rows[0].total + 1).padStart(4, '0')}`;

    // Insertar en la Tabla Maestra Global
    const queryMaestro = `
        INSERT INTO productos (nombre, descripcion, categoria_id, tipo, codigo_sku, imagen)
        VALUES (?, ?, ?, ?, ?, ?)
    `; 
    const [resultado] = await pool.query(queryMaestro, [
        nombre, 
        descripcion, 
        categoria_id, 
        tipo || 'servicio',
        nuevoSku,
        imagen
    ]);

    const nuevoProductoId = resultado.insertId;

    // Insertar la relación inicial en la tabla intermedia de la Sucursal
    const queryIntermedia = `
        INSERT INTO producto_sucursal (producto_id, sucursal_id, precio, disponible, destacado)
        VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(queryIntermedia, [nuevoProductoId, sucursalId, precio, disponible || 1, destacado || 0]);

    return nuevoProductoId;
};

// =========================================================================
// 5. MODIFICAR PRODUCTO (Datos globales + Datos por Sucursal)
// =========================================================================
const modificarProducto = async (id, datos, sucursalId = 1) => {
    const { nombre, descripcion, precio, categoria_id, destacado, disponible, imagen } = datos;
    
    // ¡REPARADO! Agregamos alias explícitos para que no haya columnas ambiguas
    const [actual] = await pool.query(
        'SELECT p.categoria_id, ps.destacado, ps.disponible FROM producto_sucursal ps INNER JOIN productos p ON p.id = ps.producto_id WHERE p.id = ? AND ps.sucursal_id = ?', 
        [id, sucursalId]
    );
    if (actual.length === 0) return false;

    // Validación estricta para evitar el molesto NaN en la query
    const validCategoriaId = categoria_id && !isNaN(categoria_id) ? Number(categoria_id) : actual[0].categoria_id;
    const estadoDestacado = destacado !== undefined && destacado !== null ? Number(destacado) : actual[0].destacado;
    const estadoDisponible = disponible !== undefined && disponible !== null ? Number(disponible) : actual[0].disponible;

    // Actualizar Tabla Maestra General
    let queryMaestro = `UPDATE productos SET nombre = ?, descripcion = ?, categoria_id = ?`;
    const paramsMaestro = [nombre, descripcion, validCategoriaId];
    if (imagen) {
        queryMaestro += `, imagen = ?`;
        paramsMaestro.push(imagen);
    }
    queryMaestro += ` WHERE id = ?`;
    paramsMaestro.push(id);
    await pool.query(queryMaestro, paramsMaestro);

    // Actualizar Tabla Intermedia de la Sucursal
    const queryIntermedia = `
        UPDATE producto_sucursal 
        SET precio = ?, destacado = ?, disponible = ? 
        WHERE producto_id = ? AND sucursal_id = ?
    `;
    await pool.query(queryIntermedia, [precio, estadoDestacado, estadoDisponible, id, sucursalId]);
    
    return true;
};


// ==========================================================================
// MODIFICAR DATOS OPERATIVOS DE UN PRODUCTO EN UNA SUCURSAL
// GERENTE: no modifica información global del producto
// ==========================================================================

const modificarProductoSucursal = async (
    productoId,
    sucursalId,
    datos
) => {

    const {
        precio,
        destacado,
        disponible
    } = datos;


    // ==========================================
    // COMPROBAR ASIGNACIÓN
    // ==========================================

    const [actual] =
        await pool.query(
            `
            SELECT
                precio,
                destacado,
                disponible

            FROM producto_sucursal

            WHERE producto_id = ?

            AND sucursal_id = ?

            LIMIT 1
            `,
            [
                productoId,
                sucursalId
            ]
        );


    if (actual.length === 0) {

        return false;

    }


    // ==========================================
    // CONSERVAR VALORES SI NO VIENEN
    // ==========================================

    const precioFinal =
        precio !== undefined &&
        precio !== null &&
        precio !== ''
            ? Number(precio)
            : actual[0].precio;


    const destacadoFinal =
        destacado !== undefined &&
        destacado !== null
            ? Number(destacado)
            : actual[0].destacado;


    const disponibleFinal =
        disponible !== undefined &&
        disponible !== null
            ? Number(disponible)
            : actual[0].disponible;


    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (
        !Number.isFinite(precioFinal) ||
        precioFinal < 0
    ) {

        throw new Error(
            'Precio inválido.'
        );

    }


    if (
        destacadoFinal !== 0 &&
        destacadoFinal !== 1
    ) {

        throw new Error(
            'Estado destacado inválido.'
        );

    }


    if (
        disponibleFinal !== 0 &&
        disponibleFinal !== 1
    ) {

        throw new Error(
            'Estado de disponibilidad inválido.'
        );

    }


    // ==========================================
    // ACTUALIZAR SOLO producto_sucursal
    // ==========================================

    const [resultado] =
        await pool.query(
            `
            UPDATE producto_sucursal

            SET
                precio = ?,
                destacado = ?,
                disponible = ?

            WHERE producto_id = ?

            AND sucursal_id = ?
            `,
            [
                precioFinal,
                destacadoFinal,
                disponibleFinal,
                productoId,
                sucursalId
            ]
        );


    return resultado.affectedRows > 0;

};


// =========================================================================
// 6. DAR DE BAJA LÓGICA (Borrón general a nivel de todo el sistema)
// =========================================================================

const darBajaProducto = async (id) => {
    const query = `UPDATE productos SET activo = 0 WHERE id = ?`;
    const [resultado] = await pool.query(query, [id]);
    return resultado.affectedRows > 0;
};


// Modificar el guardar para soportar múltiples sucursales si se mandan en un array
const asignarSucursales = async (productoId, sucursalesArray, precio) => {
    // Limpiamos asignaciones previas si es una edición
    await pool.query('DELETE FROM producto_sucursal WHERE producto_id = ?', [productoId]);
    
    // Insertamos en las sucursales seleccionadas
    for (const sucursalId of sucursalesArray) {
        await pool.query(
            'INSERT INTO producto_sucursal (producto_id, sucursal_id, precio, disponible, destacado) VALUES (?, ?, ?, 1, 0)',
            [productoId, sucursalId, precio]
        );
    }
};


// =========================================================================
// 7. SWITCH DE DISPONIBILIDAD POR SUCURSAL (Controla cascada de favoritos)
// =========================================================================
const actualizarEstadoDisponibilidad = async (id, disponible, sucursalId = 1) => {
    const estado = Number(disponible); 
    
    // Si se agota (0), reinicia destacado a 0 de forma automática para cumplir la regla del negocio
    const query = estado === 0 
        ? `UPDATE producto_sucursal SET disponible = 0, destacado = 0 WHERE producto_id = ? AND sucursal_id = ?`
        : `UPDATE producto_sucursal SET disponible = 1 WHERE producto_id = ? AND sucursal_id = ?`;

    const [resultado] = await pool.query(query, [id, sucursalId]);
    return resultado.affectedRows > 0;
};

// =========================================================================
// 8. SWITCH DE DESTACADO POR SUCURSAL
// =========================================================================
const actualizarEstadoDestacado = async (id, destacado, sucursalId = 1) => {
    const query = `UPDATE producto_sucursal SET destacado = ? WHERE producto_id = ? AND sucursal_id = ?`;
    const [resultado] = await pool.query(query, [Number(destacado), id, sucursalId]);
    return resultado.affectedRows > 0;
};

const eliminarProductoTotal = async (id) => {
    // 1. Apagamos la disponibilidad y el destacado en todas las sucursales vinculadas para que salga de las vitrinas
    await pool.query('UPDATE producto_sucursal SET disponible = 0, destacado = 0 WHERE producto_id = ?', [id]);

    // 2. Desactivamos el producto de forma global en la tabla maestra (Baja Lógica)
    const [resultado] = await pool.query('UPDATE productos SET activo = 0 WHERE id = ?', [id]);

    return resultado.affectedRows > 0;
};


// 1. REGISTRAR SOLO EL MAESTRO (Devuelve el ID generado)
const registrarProductoMaestro = async (datos) => {
    const { nombre, descripcion, imagen, categoria_id } = datos;
    const query = `
        INSERT INTO productos (nombre, descripcion, imagen, categoria_id, tipo, activo) 
        VALUES (?, ?, ?, ?, 'producto', 1)
    `;
    const [resultado] = await pool.query(query, [nombre, descripcion, imagen, categoria_id]);
    return resultado.insertId; // Retorna el ID para poder amarrarlo a las sucursales
};

// 2. VINCULAR O CLONAR UN PRODUCTO A UNA SUCURSAL ESPECÍFICA
const vincularProductoASucursal = async (productoId, sucursalId, precio) => {
    // Usamos INSERT INTO ... ON DUPLICATE KEY UPDATE por si el registro ya existía inactivo, lo reactive
    const query = `
        INSERT INTO producto_sucursal (producto_id, sucursal_id, precio, disponible, destacado)
        VALUES (?, ?, ?, 1, 0)
        ON DUPLICATE KEY UPDATE precio = ?, disponible = 1
    `;
    await pool.query(query, [productoId, sucursalId, precio, precio]);
    return true;
};

// 3. EL BORRADO LOCAL (Apagar disponibilidad en la sucursal seleccionada)
const eliminarDeSucursal = async (productoId, sucursalId) => {
    const query = `
        UPDATE producto_sucursal 
        SET disponible = 0, destacado = 0 
        WHERE producto_id = ? AND sucursal_id = ?
    `;
    const [resultado] = await pool.query(query, [productoId, sucursalId]);
    return resultado.affectedRows > 0;
};



module.exports = {
    obtenerProductos,
    obtenerProductosDestacados,
    obtenerProductoPorId,
    insertarProducto,
    modificarProducto,
    darBajaProducto,
    actualizarEstadoDisponibilidad,
    actualizarEstadoDestacado,
    eliminarProductoTotal,
    registrarProductoMaestro,
    vincularProductoASucursal,
    eliminarDeSucursal,
    obtenerProductoSucursales,
    obtenerSucursales,
    modificarProductoSucursal
};