const pool =
    require('../config/db');


// ==========================================================================
// COLUMNAS QUE PUEDEN REFERENCIAR IMÁGENES DE /images/uploads/
// ==========================================================================

const REFERENCIAS_IMAGEN = [

    {
        tabla: 'productos',
        columna: 'imagen'
    },

    {
        tabla: 'menu_ejecutivo',
        columna: 'imagen'
    },

    {
        tabla: 'menu_ejecutivo_catalogo',
        columna: 'imagen_defecto'
    },

    {
        tabla: 'experiencias',
        columna: 'imagen_url'
    },

    {
        tabla: 'sliders_inicio',
        columna: 'imagen_url'
    },

    {
        tabla: 'sucursales',
        columna: 'imagen_url'
    }

];


// ==========================================================================
// VALIDAR URL INTERNA DE UPLOAD
// ==========================================================================

function normalizarUrlImagen(url) {

    if (
        typeof url !== 'string' ||
        !url.trim()
    ) {
        return null;
    }


    const valor =
        url.trim();


    const prefijo =
        '/images/uploads/';


    if (
        !valor.startsWith(
            prefijo
        )
    ) {
        return null;
    }


    const nombre =
        valor.slice(
            prefijo.length
        );


    /*
     * Solamente permitimos un nombre de archivo.
     * No aceptamos subdirectorios ni traversal.
     */

    if (
        !nombre ||
        nombre === '.' ||
        nombre === '..' ||
        nombre.includes('/') ||
        nombre.includes('\\') ||
        nombre.includes('\0')
    ) {
        return null;
    }


    return (
        prefijo +
        nombre
    );

}


// ==========================================================================
// BUSCAR REFERENCIAS ACTIVAS DE UNA IMAGEN
// ==========================================================================

async function obtenerReferenciasImagen(url) {

    const urlNormalizada =
        normalizarUrlImagen(
            url
        );


    if (!urlNormalizada) {
        return [];
    }


    const referencias = [];


    for (
        const referencia
        of REFERENCIAS_IMAGEN
    ) {

        const {
            tabla,
            columna
        } = referencia;


        /*
         * tabla y columna NO provienen del usuario.
         * Proceden exclusivamente de la constante
         * REFERENCIAS_IMAGEN definida arriba.
         */

        const query = `
            SELECT COUNT(*) AS total
            FROM \`${tabla}\`
            WHERE \`${columna}\` = ?
        `;


        const [rows] =
            await pool.query(
                query,
                [
                    urlNormalizada
                ]
            );


        const total =
            Number(
                rows?.[0]?.total || 0
            );


        if (total > 0) {

            referencias.push({

                tabla,

                columna,

                total

            });

        }

    }


    return referencias;

}


// ==========================================================================
// COMPROBAR SI UNA IMAGEN SIGUE UTILIZADA
// ==========================================================================

async function estaReferenciada(url) {

    const referencias =
        await obtenerReferenciasImagen(
            url
        );


    return referencias.length > 0;

}


// ==========================================================================
// CONTAR TODAS LAS REFERENCIAS
// ==========================================================================

async function contarReferencias(url) {

    const referencias =
        await obtenerReferenciasImagen(
            url
        );


    return referencias.reduce(
        (
            total,
            referencia
        ) =>
            total +
            referencia.total,
        0
    );

}


// ==========================================================================
// EXPORTACIONES
// ==========================================================================

module.exports = {

    normalizarUrlImagen,

    obtenerReferenciasImagen,

    estaReferenciada,

    contarReferencias

};