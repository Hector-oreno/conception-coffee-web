const mysql =
    require('mysql2/promise');

const fs =
    require('fs');

const path =
    require('path');

require('dotenv').config();


// ==========================================================
// CONFIGURACIÓN BASE
// ==========================================================

const config = {

    host:
        process.env.DB_HOST,

    port:
        Number(
            process.env.DB_PORT || 3306
        ),

    user:
        process.env.DB_USER,

    password:
        process.env.DB_PASSWORD,

    database:
        process.env.DB_NAME,

    waitForConnections:
        true,

    connectionLimit:
        10,

    queueLimit:
        0

};


    // ==========================================================
    // SSL OPCIONAL
    //
    // Local:
    // DB_SSL=true
    // DB_SSL_CA_PATH=./certs/aiven-ca.pem
    //
    // Render:
    // DB_SSL=true
    // DB_SSL_CA=<certificado completo>
    // ==========================================================

    if (
        String(
            process.env.DB_SSL
        ).toLowerCase() === 'true'
    ) {

        const caDirecto =
            process.env.DB_SSL_CA;

        const caPath =
            process.env.DB_SSL_CA_PATH;


        if (caDirecto) {

            config.ssl = {
                ca: caDirecto.replace(
                    /\\n/g,
                    '\n'
                )
            };

        } else if (caPath) {

            const rutaCA =
                path.resolve(
                    process.cwd(),
                    caPath
                );


            if (!fs.existsSync(rutaCA)) {

                throw new Error(
                    `No se encontró el certificado SSL de la base de datos: ${rutaCA}`
                );

            }


            config.ssl = {
                ca:
                    fs.readFileSync(
                        rutaCA
                    )
            };

        } else {

            throw new Error(
                'DB_SSL_CA o DB_SSL_CA_PATH es obligatorio cuando DB_SSL=true.'
            );

        }

    }


// ==========================================================
// POOL MYSQL
// ==========================================================

const pool =
    mysql.createPool(
        config
    );


module.exports =
    pool;