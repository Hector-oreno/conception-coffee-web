const db = require('../config/db'); 

const Experiencia = {
    getAllAdmin: () => {
        return db.query('SELECT * FROM experiencias ORDER BY id DESC');
    },

    getAllCliente: () => {
        return db.query("SELECT * FROM experiencias WHERE activo = 1 AND estado_publicacion = 'publicado' ORDER BY id DESC");
    },

    create: async (data) => {

        const [result] =
            await db.query(
                `
                INSERT INTO experiencias
                (
                    imagen_url,
                    titulo,
                    activo,
                    estado_publicacion
                )
                VALUES
                (
                    ?,
                    ?,
                    1,
                    'borrador'
                )
                `,
                [
                    data.imagen_url,
                    data.titulo
                ]
            );

        return result.insertId;

    },

    updateEstado: async (id, activo) => {

        const [result] =
            await db.query(
                `
                UPDATE experiencias
                SET
                    activo = ?,
                    estado_publicacion = 'borrador'
                WHERE id = ?
                `,
                [
                    activo,
                    id
                ]
            );

        return result.affectedRows > 0;

    },

    obtenerPorId: async (id) => {

        const [rows] =
            await db.query(
                `
                SELECT
                    id,
                    imagen_url
                FROM experiencias
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );

        return rows[0] || null;

    },


    eliminar: async (id) => {

        const [result] =
            await db.query(
                `
                DELETE FROM experiencias
                WHERE id = ?
                `,
                [id]
            );

        return result.affectedRows > 0;

    },

    publicarTodos: () => {

        return db.query(
            `
            UPDATE experiencias
            SET estado_publicacion = 'publicado'
            `
        );

    }
};

module.exports = Experiencia;