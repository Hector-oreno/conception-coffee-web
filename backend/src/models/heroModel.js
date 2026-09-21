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


    // Reordenar dos sliders de forma atómica
    reordenar: async (
        sliderId,
        direccion
    ) => {

        const connection =
            await pool.getConnection();

        try {

            await connection.beginTransaction();


            // ==========================================
            // OBTENER SLIDER ACTUAL
            // ==========================================

            const [actualRows] =
                await connection.query(
                    `
                    SELECT
                        id,
                        orden
                    FROM sliders_inicio
                    WHERE id = ?
                    FOR UPDATE
                    `,
                    [sliderId]
                );


            if (actualRows.length === 0) {

                await connection.rollback();

                return {
                    success: false,
                    reason: "NO_EXISTE"
                };

            }


            const actual =
                actualRows[0];


            // ==========================================
            // BUSCAR VECINO
            // ==========================================

            const operador =
                direccion === "arriba"
                    ? "<"
                    : ">";

            const ordenamiento =
                direccion === "arriba"
                    ? "DESC"
                    : "ASC";


            const [vecinoRows] =
                await connection.query(
                    `
                    SELECT
                        id,
                        orden
                    FROM sliders_inicio
                    WHERE orden ${operador} ?
                    ORDER BY orden ${ordenamiento}
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [actual.orden]
                );


            if (vecinoRows.length === 0) {

                await connection.rollback();

                return {
                    success: false,
                    reason: "LIMITE"
                };

            }


            const vecino =
                vecinoRows[0];


            // ==========================================
            // INTERCAMBIAR ORDEN
            // ==========================================

            await connection.query(
                `
                UPDATE sliders_inicio
                SET
                    orden = ?,
                    estado_publicacion = 'borrador'
                WHERE id = ?
                `,
                [
                    vecino.orden,
                    actual.id
                ]
            );


            await connection.query(
                `
                UPDATE sliders_inicio
                SET
                    orden = ?,
                    estado_publicacion = 'borrador'
                WHERE id = ?
                `,
                [
                    actual.orden,
                    vecino.id
                ]
            );


            await connection.commit();


            return {
                success: true
            };


        } catch (error) {

            await connection.rollback();

            throw error;


        } finally {

            connection.release();

        }

    },



    // Publicar todo de golpe
    publicarTodos: async () => {
        const [result] = await pool.query("UPDATE sliders_inicio SET estado_publicacion = 'publicado'");
        return result.affectedRows;
    },

    // Eliminar slider y compactar automáticamente el orden
    eliminar: async (id) => {

        const connection =
            await pool.getConnection();

        try {

            await connection.beginTransaction();


            // ==========================================
            // OBTENER EL SLIDER ANTES DE ELIMINAR
            // ==========================================

            const [rows] =
                await connection.query(
                    `
                    SELECT
                        id,
                        orden
                    FROM sliders_inicio
                    WHERE id = ?
                    FOR UPDATE
                    `,
                    [id]
                );


            if (rows.length === 0) {

                await connection.rollback();

                return false;

            }


            const ordenEliminado =
                Number(rows[0].orden);


            // ==========================================
            // ELIMINAR
            // ==========================================

            await connection.query(
                `
                DELETE FROM sliders_inicio
                WHERE id = ?
                `,
                [id]
            );


            // ==========================================
            // COMPACTAR LOS SIGUIENTES
            // ==========================================

            await connection.query(
                `
                UPDATE sliders_inicio
                SET
                    orden = orden - 1,
                    estado_publicacion = 'borrador'
                WHERE orden > ?
                `,
                [ordenEliminado]
            );


            await connection.commit();

            return true;


        } catch (error) {

            await connection.rollback();

            throw error;


        } finally {

            connection.release();

        }

    },


    normalizarOrdenes: async () => {

        const connection =
            await pool.getConnection();

        try {

            await connection.beginTransaction();


            const [sliders] =
                await connection.query(
                    `
                    SELECT id
                    FROM sliders_inicio
                    ORDER BY orden ASC, id ASC
                    FOR UPDATE
                    `
                );


            for (
                let index = 0;
                index < sliders.length;
                index++
            ) {

                await connection.query(
                    `
                    UPDATE sliders_inicio
                    SET orden = ?
                    WHERE id = ?
                    `,
                    [
                        index + 1,
                        sliders[index].id
                    ]
                );

            }


            await connection.commit();

            return true;


        } catch (error) {

            await connection.rollback();

            throw error;


        } finally {

            connection.release();

        }

    },


};

module.exports = HeroModel;