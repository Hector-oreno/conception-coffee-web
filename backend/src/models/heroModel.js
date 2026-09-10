const pool = require('../config/db');

const HeroModel = {
    // Obtener todos para el admin
    obtenerTodosAdmin: async () => {
        const [rows] = await pool.query(
            'SELECT id, imagen_url, orden, activo, estado_publicacion FROM sliders_inicio ORDER BY orden ASC'
        );
        return rows;
    },

    // Obtener solo los publicados para el cliente
    obtenerTodosCliente: async () => {
        const [rows] = await pool.query(
            "SELECT imagen_url, orden FROM sliders_inicio WHERE estado_publicacion = 'publicado' AND activo = 1 ORDER BY orden ASC"
        );
        return rows;
    },

    // Buscar uno solo por ID (para cuando necesitemos la URL de la imagen antes de borrar)
    obtenerPorId: async (id) => {
        const [rows] = await pool.query('SELECT imagen_url FROM sliders_inicio WHERE id = ?', [id]);
        return rows[0] || null;
    },

    // Calcular el siguiente número de orden disponible
    obtenerSiguienteOrden: async () => {
        const [rows] = await pool.query('SELECT MAX(orden) AS max_orden FROM sliders_inicio');
        return (rows[0].max_orden || 0) + 1;
    },

    // Crear un nuevo registro
    crear: async (imagenUrl, orden) => {
        const [result] = await pool.query(
            'INSERT INTO sliders_inicio (imagen_url, orden) VALUES (?, ?)',
            [imagenUrl, orden]
        );
        return result.insertId;
    },

    // Actualizar datos básicos (Orden/Activo) y pasarlo a borrador automáticamente
    actualizar: async (id, orden, activo) => {
        const [result] = await pool.query(
            "UPDATE sliders_inicio SET orden = ?, activo = ?, estado_publicacion = 'borrador' WHERE id = ?",
            [orden, activo, id]
        );
        return result.affectedRows > 0;
    },

    // Publicar todo de golpe
    publicarTodos: async () => {
        const [result] = await pool.query("UPDATE sliders_inicio SET estado_publicacion = 'publicado'");
        return result.affectedRows;
    },

    // Eliminar de la base de datos
    eliminar: async (id) => {
        const [result] = await pool.query('DELETE FROM sliders_inicio WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = HeroModel;