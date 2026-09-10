const jwt = require('jsonwebtoken');
const db = require('../config/db');


// ==========================================================
// JWT SECRET
// ==========================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {

    throw new Error(
        'JWT_SECRET no está configurado en las variables de entorno.'
    );

}


// ==========================================================
// VERIFICAR TOKEN + SESIÓN + USUARIO
// ==========================================================

const verificarToken = async (req, res, next) => {

    try {

        // ==================================================
        // 1. LEER AUTHORIZATION HEADER
        // ==================================================

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Acceso denegado: token no proporcionado.'
            });

        }


        const token =
            authHeader.substring(7).trim();


        if (!token) {

            return res.status(401).json({
                success: false,
                message:
                    'Acceso denegado: token no proporcionado.'
            });

        }


        // ==================================================
        // 2. VERIFICAR FIRMA Y EXPIRACIÓN DEL JWT
        // ==================================================

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET,
                {
                    algorithms: ['HS256']
                }
            );


        // ==================================================
        // 3. EL JWT DEBE TENER JTI E ID DE USUARIO
        // ==================================================

        if (
            !decoded.jti ||
            !decoded.id
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Sesión inválida.'
            });

        }


        // ==================================================
        // 4. BUSCAR SESIÓN + USUARIO EN BD
        // ==================================================

        const [rows] =
            await db.query(
                `
                SELECT
                    ses.id AS sesion_id,
                    ses.usuario_id,
                    ses.jti,
                    ses.revocada,
                    ses.revocada_en,
                    ses.logout_en,
                    ses.expira_en,

                    u.nombre,
                    u.correo,
                    u.rol,
                    u.sucursal_id,
                    u.activo

                FROM sesiones_usuario ses

                INNER JOIN usuarios u
                    ON u.id = ses.usuario_id

                WHERE ses.jti = ?

                AND ses.usuario_id = ?

                LIMIT 1
                `,
                [
                    decoded.jti,
                    decoded.id
                ]
            );


        // ==================================================
        // 5. LA SESIÓN DEBE EXISTIR
        // ==================================================

        if (rows.length === 0) {

            return res.status(401).json({
                success: false,
                message:
                    'La sesión ya no es válida.'
            });

        }


        const sesion =
            rows[0];


        // ==================================================
        // 6. USUARIO DEBE SEGUIR ACTIVO
        // ==================================================

        if (Number(sesion.activo) !== 1) {

            return res.status(403).json({
                success: false,
                message:
                    'El usuario se encuentra inactivo.'
            });

        }


        // ==================================================
        // 7. SESIÓN NO REVOCADA
        // ==================================================

        if (Number(sesion.revocada) === 1) {

            return res.status(401).json({
                success: false,
                message:
                    'La sesión fue revocada.'
            });

        }


        // ==================================================
        // 8. SESIÓN NO CERRADA
        // ==================================================

        if (sesion.logout_en) {

            return res.status(401).json({
                success: false,
                message:
                    'La sesión ya fue cerrada.'
            });

        }


        // ==================================================
        // 9. VALIDAR EXPIRACIÓN REGISTRADA EN BD
        // ==================================================

        const expiraEn =
            new Date(sesion.expira_en);


        if (
            Number.isNaN(expiraEn.getTime()) ||
            expiraEn.getTime() <= Date.now()
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'La sesión ha expirado.'
            });

        }


        // ==================================================
        // 10. USAR DATOS ACTUALES DE BD
        //
        // No confiamos para autorización en rol/sucursal
        // que quedaron congelados dentro del JWT.
        // ==================================================

        req.usuario = {

            id:
                Number(sesion.usuario_id),

            nombre:
                sesion.nombre,

            correo:
                sesion.correo,

            rol:
                sesion.rol,

            sucursal_id:
                sesion.sucursal_id !== null
                    ? Number(sesion.sucursal_id)
                    : null,

            jti:
                sesion.jti,

            sesion_id:
                Number(sesion.sesion_id)

        };


        next();


    } catch (error) {

        // ==================================================
        // JWT EXPIRADO
        // ==================================================

        if (
            error.name === 'TokenExpiredError'
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'El token ha expirado.'
            });

        }


        // ==================================================
        // JWT INVÁLIDO
        // ==================================================

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'NotBeforeError'
        ) {

            return res.status(401).json({
                success: false,
                message:
                    'Token inválido.'
            });

        }


        // ==================================================
        // ERROR INTERNO
        // ==================================================

        console.error(
            'Error verificando autenticación:',
            error
        );


        return res.status(500).json({
            success: false,
            message:
                'Error interno verificando la sesión.'
        });

    }

};


// ==========================================================
// VERIFICAR ROLES
// ==========================================================

const verificarRoles =
    (...rolesPermitidos) => {

        return (req, res, next) => {

            if (!req.usuario) {

                return res.status(401).json({
                    success: false,
                    message:
                        'Usuario no autenticado.'
                });

            }


            if (
                !rolesPermitidos.includes(
                    req.usuario.rol
                )
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        'No tienes permisos para realizar esta operación.'
                });

            }


            next();

        };

    };


module.exports = {
    verificarToken,
    verificarRoles
};