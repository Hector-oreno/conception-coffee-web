const db =
    require('../config/db');


const UsuarioModel = {


    // ======================================================
    // OBTENER TODOS LOS USUARIOS
    // ======================================================

    obtenerTodos: async () => {

        const query = `

            SELECT
                u.id,
                u.nombre,
                u.correo,
                u.rol,
                u.activo,
                u.sucursal_id,
                u.creado_en,
                u.actualizado_en,

                s.nombre AS sucursal_nombre

            FROM usuarios u

            LEFT JOIN sucursales s
                ON u.sucursal_id = s.id

            ORDER BY u.id DESC

        `;


        const [rows] =
            await db.query(query);


        return rows;

    },


    // ======================================================
    // BUSCAR USUARIO POR CORREO
    // ======================================================

    buscarPorCorreo: async (correo) => {

        const query = `

            SELECT
                id,
                nombre,
                correo,
                password_hash,
                rol,
                sucursal_id,
                activo,
                creado_en,
                actualizado_en

            FROM usuarios

            WHERE correo = ?

            LIMIT 1

        `;


        const [rows] =
            await db.query(
                query,
                [correo]
            );


        return rows[0] || null;

    },


    // ======================================================
    // CREAR USUARIO
    // ======================================================

    crear: async ({
        nombre,
        correo,
        passwordHash,
        rol,
        sucursal_id
    }) => {

        const query = `

            INSERT INTO usuarios
            (
                nombre,
                correo,
                password_hash,
                rol,
                sucursal_id,
                activo
            )

            VALUES
            (
                ?, ?, ?, ?, ?, 1
            )

        `;


        const [result] =
            await db.query(
                query,
                [
                    nombre,
                    correo,
                    passwordHash,
                    rol,
                    sucursal_id
                ]
            );


        return result.insertId;

    },


    // ======================================================
    // CREAR SESIÓN
    // ======================================================

    crearSesion: async ({
        usuarioId,
        jti,
        ipOrigen,
        userAgent,
        expiraEn
    }) => {

        const query = `

            INSERT INTO sesiones_usuario
            (
                usuario_id,
                jti,
                ip_origen,
                user_agent,
                expira_en
            )

            VALUES
            (
                ?, ?, ?, ?, ?
            )

        `;


        const [result] =
            await db.query(
                query,
                [
                    usuarioId,
                    jti,
                    ipOrigen,
                    userAgent,
                    expiraEn
                ]
            );


        return result.insertId;

    },


    // ======================================================
    // BUSCAR SESIÓN POR JTI
    // ======================================================

    buscarSesionPorJTI: async (jti) => {

        const query = `

            SELECT
                id,
                usuario_id,
                jti,
                login_en,
                ultimo_acceso,
                logout_en,
                expira_en,
                revocada,
                revocada_en

            FROM sesiones_usuario

            WHERE jti = ?

            LIMIT 1

        `;


        const [rows] =
            await db.query(
                query,
                [jti]
            );


        return rows[0] || null;

    },


    // ======================================================
    // CERRAR / REVOCAR SESIÓN
    // ======================================================

    cerrarSesion: async (
        usuarioId,
        jti
    ) => {

        const query = `

            UPDATE sesiones_usuario

            SET
                logout_en =
                    CURRENT_TIMESTAMP,

                revocada = 1,

                revocada_en =
                    CURRENT_TIMESTAMP

            WHERE usuario_id = ?

            AND jti = ?

            AND revocada = 0

        `;


        const [result] =
            await db.query(
                query,
                [
                    usuarioId,
                    jti
                ]
            );


        return result.affectedRows > 0;

    },


    // ======================================================
    // AUDITORÍA
    // ======================================================

    obtenerAuditoriaSesiones: async () => {

        const query = `

            SELECT
                ses.id,
                ses.jti,

                ses.ip_origen,
                ses.user_agent,

                ses.login_en,
                ses.ultimo_acceso,
                ses.logout_en,
                ses.expira_en,

                ses.revocada,
                ses.revocada_en,

                u.id AS usuario_id,
                u.nombre,
                u.correo,
                u.rol,

                suc.nombre AS sucursal_nombre

            FROM sesiones_usuario ses

            INNER JOIN usuarios u
                ON ses.usuario_id = u.id

            LEFT JOIN sucursales suc
                ON u.sucursal_id = suc.id

            ORDER BY
                ses.login_en DESC

            LIMIT 100

        `;


        const [rows] =
            await db.query(query);


        return rows;

    },


    // ======================================================
    // REVOCAR SESIÓN POR JTI
    // ======================================================

    revocarSesionJTI: async (jti) => {

        const query = `

            UPDATE sesiones_usuario

            SET
                revocada = 1,

                revocada_en =
                    CURRENT_TIMESTAMP

            WHERE jti = ?

            AND revocada = 0

        `;


        const [result] =
            await db.query(
                query,
                [jti]
            );


        return result.affectedRows > 0;

    },


    // ======================================================
    // CAMBIAR ESTADO DE USUARIO
    // ======================================================

    cambiarEstado: async (
        usuarioId,
        nuevoEstado
    ) => {

        const query = `

            UPDATE usuarios

            SET activo = ?

            WHERE id = ?

        `;


        const [result] =
            await db.query(
                query,
                [
                    nuevoEstado,
                    usuarioId
                ]
            );


        return result.affectedRows > 0;

    },


    // ======================================================
    // REVOCAR TODAS LAS SESIONES DE UN USUARIO
    // ======================================================

    revocarSesionesUsuario: async (
        usuarioId
    ) => {

        const query = `

            UPDATE sesiones_usuario

            SET
                revocada = 1,
                revocada_en = CURRENT_TIMESTAMP

            WHERE usuario_id = ?

            AND revocada = 0

            AND logout_en IS NULL

        `;


        const [result] =
            await db.query(
                query,
                [usuarioId]
            );


        return result.affectedRows;

    },


    // ======================================================
    // OBTENER USUARIO POR ID
    // ======================================================

    obtenerPorId: async (usuarioId) => {

        const query = `

            SELECT
                id,
                nombre,
                correo,
                rol,
                sucursal_id,
                activo,
                creado_en,
                actualizado_en

            FROM usuarios

            WHERE id = ?

            LIMIT 1

        `;


        const [rows] =
            await db.query(
                query,
                [usuarioId]
            );


        return rows[0] || null;

    },



    // ======================================================
    // BUSCAR CORREO EN OTRO USUARIO
    // ======================================================

    buscarCorreoEnOtroUsuario:
        async (
            correo,
            usuarioId
        ) => {

            const query = `

                SELECT
                    id

                FROM usuarios

                WHERE correo = ?

                AND id <> ?

                LIMIT 1

            `;


            const [rows] =
                await db.query(
                    query,
                    [
                        correo,
                        usuarioId
                    ]
                );


            return rows[0] || null;

        },


    // ======================================================
    // COMPROBAR SUCURSAL ACTIVA
    // ======================================================

    obtenerSucursalActivaPorId:
        async (sucursalId) => {

            const query = `

                SELECT
                    id,
                    nombre

                FROM sucursales

                WHERE id = ?

                AND activa = 1

                LIMIT 1

            `;


            const [rows] =
                await db.query(
                    query,
                    [sucursalId]
                );


            return rows[0] || null;

        },


    // ======================================================
    // ACTUALIZAR USUARIO
    // ======================================================

    actualizar: async ({
        usuarioId,
        nombre,
        correo,
        rol,
        sucursal_id
    }) => {

        const query = `

            UPDATE usuarios

            SET
                nombre = ?,
                correo = ?,
                rol = ?,
                sucursal_id = ?

            WHERE id = ?

        `;


        const [result] =
            await db.query(
                query,
                [
                    nombre,
                    correo,
                    rol,
                    sucursal_id,
                    usuarioId
                ]
            );


        return result.affectedRows > 0;

    },


    // ======================================================
    // OBTENER CREDENCIALES POR ID
    // ======================================================

    obtenerCredencialesPorId:
        async (usuarioId) => {

            const query = `

                SELECT
                    id,
                    password_hash,
                    activo

                FROM usuarios

                WHERE id = ?

                LIMIT 1

            `;


            const [rows] =
                await db.query(
                    query,
                    [usuarioId]
                );


            return rows[0] || null;

        },


    // ======================================================
    // ACTUALIZAR CONTRASEÑA
    // ======================================================

    actualizarPassword:
        async (
            usuarioId,
            passwordHash
        ) => {

            const query = `

                UPDATE usuarios

                SET password_hash = ?

                WHERE id = ?

            `;


            const [result] =
                await db.query(
                    query,
                    [
                        passwordHash,
                        usuarioId
                    ]
                );


            return result.affectedRows > 0;

        },



    // ======================================================
    // REVOCAR OTRAS SESIONES DEL USUARIO
    // ======================================================

    revocarOtrasSesionesUsuario:
        async (
            usuarioId,
            jtiActual
        ) => {

            const query = `

                UPDATE sesiones_usuario

                SET
                    revocada = 1,
                    revocada_en =
                        CURRENT_TIMESTAMP

                WHERE usuario_id = ?

                AND jti <> ?

                AND revocada = 0

                AND logout_en IS NULL

            `;


            const [result] =
                await db.query(
                    query,
                    [
                        usuarioId,
                        jtiActual
                    ]
                );


            return result.affectedRows;

        },





};


module.exports =
    UsuarioModel;