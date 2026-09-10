require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const multer = require('multer');
const path = require('path');


// ==========================================================
// CONFIGURACIÓN Y RUTAS
// ==========================================================

const pool = require('./src/config/db');

const categoriaRoutes =
    require('./src/routes/categoriaRoutes');

const productoRoutes =
    require('./src/routes/productoRoutes');

const sucursalRoutes =
    require('./src/routes/sucursalRoutes');

const menuSemanaRoutes =
    require('./src/routes/menuSemanaRoutes');

const heroRoutes =
    require('./src/routes/heroRoutes');

const experienciasRoutes =
    require('./src/routes/experienciasRoutes');

const usuarioRoutes =
    require('./src/routes/usuarioRoutes');


const app = express();


// ==========================================================
// PRODUCCIÓN / PROXY
// ==========================================================

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}


// ==========================================================
// SEGURIDAD HTTP
// ==========================================================

app.use(
    helmet({
        // La CSP estricta la configuraremos cuando tengamos
        // dominio definitivo y revisemos todos los CDN.
        contentSecurityPolicy: false,

        // Evita problemas con imágenes/recursos servidos
        // desde el mismo proyecto durante la demo.
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    })
);


// ==========================================================
// PARSERS
// ==========================================================

app.use(
    express.json({
        limit: '1mb'
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: '1mb'
    })
);


// ==========================================================
// RATE LIMIT GENERAL PARA API
// ==========================================================

const apiLimiter = rateLimit({

    windowMs:
        15 * 60 * 1000,

    limit:
        500,

    standardHeaders:
        'draft-8',

    legacyHeaders:
        false,

    message: {
        success: false,
        message:
            'Demasiadas solicitudes. Intenta nuevamente más tarde.'
    }

});


app.use(
    '/api',
    apiLimiter
);


// ==========================================================
// RATE LIMIT ESPECIAL PARA AUTENTICACIÓN
// ==========================================================

const authLimiter = rateLimit({

    windowMs:
        15 * 60 * 1000,

    limit:
        10,

    standardHeaders:
        'draft-8',

    legacyHeaders:
        false,

    skipSuccessfulRequests:
        true,

    message: {
        success: false,
        message:
            'Demasiados intentos de acceso. Intenta nuevamente más tarde.'
    }

});


// IMPORTANTE:
// Este limiter debe ir antes del router de usuarios.
//
// Si tu login NO es POST /api/usuarios/login,
// después ajustamos únicamente esta ruta.

app.use(
    '/api/usuarios/login',
    authLimiter
);


// ==========================================================
// ARCHIVOS ESTÁTICOS
// ==========================================================

const publicPath =
    path.join(
        __dirname,
        'public'
    );


app.use(
    express.static(
        publicPath
    )
);


// ==========================================================
// API - RUTAS
// ==========================================================

app.use(
    '/api/categorias',
    categoriaRoutes
);

app.use(
    '/api/productos',
    productoRoutes
);

app.use(
    '/api/sucursales',
    sucursalRoutes
);

app.use(
    '/api/planner',
    menuSemanaRoutes
);


// Compatibilidad temporal con código anterior.
// Más adelante podemos comprobar si todavía se utiliza.
app.use(
    '/api/menu-semana',
    menuSemanaRoutes
);

app.use(
    '/api/hero',
    heroRoutes
);

app.use(
    '/api/experiencias',
    experienciasRoutes
);

app.use(
    '/api/usuarios',
    usuarioRoutes
);


// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get(
    '/api/health',
    async (req, res) => {

        try {

            await pool.query(
                'SELECT 1'
            );


            return res.status(200).json({
                success: true,
                status: 'ok'
            });

        } catch (error) {

            console.error(
                'Health check database error:',
                error.message
            );


            return res.status(503).json({
                success: false,
                status: 'unavailable'
            });

        }

    }
);


// ==========================================================
// PÁGINA PRINCIPAL
// ==========================================================

app.get(
    '/',
    (req, res) => {

        res.sendFile(
            path.join(
                publicPath,
                'index.html'
            )
        );

    }
);


// ==========================================================
// 404 PARA API
// ==========================================================

app.use(
    '/api',
    (req, res) => {

        return res.status(404).json({
            success: false,
            message:
                'Endpoint no encontrado.'
        });

    }
);


// ==========================================================
// MANEJO GLOBAL DE ERRORES
// ==========================================================

app.use(
    (error, req, res, next) => {

        // --------------------------------------------------
        // MULTER
        // --------------------------------------------------

        if (
            error instanceof
            multer.MulterError
        ) {

            if (
                error.code ===
                'LIMIT_FILE_SIZE'
            ) {

                return res.status(413).json({
                    success: false,
                    message:
                        'La imagen supera el límite permitido de 5 MB.'
                });

            }


            return res.status(400).json({
                success: false,
                message:
                    'Error procesando el archivo enviado.'
            });

        }


        // --------------------------------------------------
        // FILTRO DE ARCHIVOS
        // --------------------------------------------------

        if (
            error.message &&
            error.message.includes(
                'Solo se permiten archivos de imagen'
            )
        ) {

            return res.status(415).json({
                success: false,
                message:
                    error.message
            });

        }


        // --------------------------------------------------
        // BODY DEMASIADO GRANDE
        // --------------------------------------------------

        if (
            error.type ===
            'entity.too.large'
        ) {

            return res.status(413).json({
                success: false,
                message:
                    'La solicitud supera el tamaño permitido.'
            });

        }


        // --------------------------------------------------
        // ERROR NO CONTROLADO
        // --------------------------------------------------

        console.error(
            'Error no controlado:',
            error
        );


        return res.status(500).json({
            success: false,
            message:
                'Ocurrió un error interno en el servidor.'
        });

    }
);


// ==========================================================
// INICIO DEL SERVIDOR
// ==========================================================

const PORT =
    Number(
        process.env.PORT
    ) || 3000;


app.listen(
    PORT,
    '0.0.0.0',
    () => {

        console.log(
            `Servidor ejecutándose en puerto ${PORT}`
        );

    }
);