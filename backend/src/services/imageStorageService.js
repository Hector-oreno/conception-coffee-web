const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


const imageReferenceService =
    require(
        './imageReferenceService'
    );


// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================

const UPLOADS_DIR =
    path.resolve(
        process.cwd(),
        'public',
        'images',
        'uploads'
    );


const PUBLIC_PREFIX =
    '/images/uploads/';


const FIRMAS_PERMITIDAS = {

    jpeg: {
        extension: '.jpg',
        mime: 'image/jpeg'
    },

    png: {
        extension: '.png',
        mime: 'image/png'
    },

    webp: {
        extension: '.webp',
        mime: 'image/webp'
    }

};


// ==========================================================================
// ÍNDICE DE CONTENIDO
// ==========================================================================

const indiceHashes =
    new Map();


let indiceInicializado =
    false;


let promesaInicializacion =
    null;



// ==========================================================================
// VALIDAR QUE UNA RUTA PERTENEZCA AL DIRECTORIO DE UPLOADS
// ==========================================================================

function resolverRutaSegura(rutaArchivo) {

    if (
        typeof rutaArchivo !== 'string' ||
        !rutaArchivo.trim()
    ) {
        return null;
    }


    const entrada =
        rutaArchivo.trim();


    /*
     * Aceptamos únicamente:
     *
     *   archivo.jpg
     *
     * o una URL pública interna:
     *
     *   /images/uploads/archivo.jpg
     *
     * Nunca aceptamos rutas físicas ni segmentos relativos.
     */

    let nombreArchivo;


    if (
        entrada.startsWith(
            PUBLIC_PREFIX
        )
    ) {

        nombreArchivo =
            entrada.slice(
                PUBLIC_PREFIX.length
            );

    } else {

        nombreArchivo =
            entrada;

    }


    /*
     * El nombre final debe ser estrictamente un nombre
     * de archivo, nunca una ruta.
     */

    if (
        !nombreArchivo ||
        nombreArchivo === '.' ||
        nombreArchivo === '..' ||
        nombreArchivo.includes('/') ||
        nombreArchivo.includes('\\') ||
        nombreArchivo.includes('\0')
    ) {
        return null;
    }


    /*
     * Rechazamos nombres especiales o manipulaciones
     * que path.basename pudiera normalizar silenciosamente.
     */

    if (
        path.basename(
            nombreArchivo
        ) !== nombreArchivo
    ) {
        return null;
    }


    const rutaCompleta =
        path.resolve(
            UPLOADS_DIR,
            nombreArchivo
        );


    const rutaRelativa =
        path.relative(
            UPLOADS_DIR,
            rutaCompleta
        );


    if (
        !rutaRelativa ||
        rutaRelativa.startsWith('..') ||
        path.isAbsolute(
            rutaRelativa
        )
    ) {
        return null;
    }


    return rutaCompleta;

}


// ==========================================================================
// DETECTAR FORMATO REAL MEDIANTE FIRMA BINARIA
// ==========================================================================

async function detectarFormatoReal(rutaArchivo) {

    const rutaSegura =
        resolverRutaSegura(
            rutaArchivo
        );


    if (!rutaSegura) {
        return null;
    }


    let handle;

    try {

        handle =
            await fs.promises.open(
                rutaSegura,
                'r'
            );


        const buffer =
            Buffer.alloc(12);


        const {
            bytesRead
        } =
            await handle.read(
                buffer,
                0,
                buffer.length,
                0
            );


        if (bytesRead < 4) {
            return null;
        }


        // JPEG: FF D8 FF
        if (
            buffer[0] === 0xFF &&
            buffer[1] === 0xD8 &&
            buffer[2] === 0xFF
        ) {

            return {
                tipo: 'jpeg',
                ...FIRMAS_PERMITIDAS.jpeg
            };

        }


        // PNG:
        // 89 50 4E 47 0D 0A 1A 0A
        if (
            bytesRead >= 8 &&
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4E &&
            buffer[3] === 0x47 &&
            buffer[4] === 0x0D &&
            buffer[5] === 0x0A &&
            buffer[6] === 0x1A &&
            buffer[7] === 0x0A
        ) {

            return {
                tipo: 'png',
                ...FIRMAS_PERMITIDAS.png
            };

        }


        // WebP:
        // RIFF....WEBP
        if (
            bytesRead >= 12 &&
            buffer.toString(
                'ascii',
                0,
                4
            ) === 'RIFF' &&
            buffer.toString(
                'ascii',
                8,
                12
            ) === 'WEBP'
        ) {

            return {
                tipo: 'webp',
                ...FIRMAS_PERMITIDAS.webp
            };

        }


        return null;

    } finally {

        if (handle) {

            await handle.close();

        }

    }

}


// ==========================================================================
// CALCULAR SHA-256 SIN CARGAR TODO EL ARCHIVO EN MEMORIA
// ==========================================================================

function calcularHashArchivo(rutaArchivo) {

    return new Promise(
        (resolve, reject) => {

            const rutaSegura =
                resolverRutaSegura(
                    rutaArchivo
                );


            if (!rutaSegura) {

                reject(
                    new Error(
                        'Ruta de imagen no válida.'
                    )
                );

                return;

            }


            const hash =
                crypto.createHash(
                    'sha256'
                );


            const stream =
                fs.createReadStream(
                    rutaSegura
                );


            stream.on(
                'error',
                reject
            );


            stream.on(
                'data',
                (chunk) => {

                    hash.update(
                        chunk
                    );

                }
            );


            stream.on(
                'end',
                () => {

                    resolve(
                        hash.digest(
                            'hex'
                        )
                    );

                }
            );

        }
    );

}


// ==========================================================================
// DESREGISTRAR ARCHIVO DEL ÍNDICE DE HASHES
// ==========================================================================

function desregistrarArchivoDelIndice(
    rutaArchivo
) {

    const rutaSegura =
        resolverRutaSegura(
            rutaArchivo
        );


    if (!rutaSegura) {
        return false;
    }


    const nombreArchivo =
        path.basename(
            rutaSegura
        );


    let eliminado =
        false;


    for (
        const [
            hash,
            archivos
        ]
        of indiceHashes.entries()
    ) {

        if (
            !(archivos instanceof Set)
        ) {
            continue;
        }


        if (
            archivos.delete(
                nombreArchivo
            )
        ) {

            eliminado =
                true;


            if (
                archivos.size === 0
            ) {

                indiceHashes.delete(
                    hash
                );

            }


            break;

        }

    }


    return eliminado;

}


// ==========================================================================
// ELIMINAR ARCHIVO ÚNICAMENTE DENTRO DE UPLOADS
// ==========================================================================

async function eliminarArchivoSeguro(
    rutaArchivo
) {

    const rutaSegura =
        resolverRutaSegura(
            rutaArchivo
        );


    if (!rutaSegura) {
        return false;
    }


    try {

        await fs.promises.unlink(
            rutaSegura
        );


        desregistrarArchivoDelIndice(
            rutaArchivo
        );


        return true;

    } catch (error) {

        if (
            error.code === 'ENOENT'
        ) {

            /*
             * Aunque el archivo físico ya no exista,
             * limpiamos cualquier referencia obsoleta
             * que pudiera permanecer en el índice.
             */

            desregistrarArchivoDelIndice(
                rutaArchivo
            );


            return false;

        }


        throw error;

    }

}


// ==========================================================================
// CONVERTIR NOMBRE FÍSICO EN URL PÚBLICA
// ==========================================================================

function construirUrlPublica(rutaArchivo) {

    const rutaSegura =
        resolverRutaSegura(
            rutaArchivo
        );


    if (!rutaSegura) {
        return null;
    }


    return (
        PUBLIC_PREFIX +
        path.basename(
            rutaSegura
        )
    );

}


// ==========================================================================
// LISTAR ARCHIVOS DEL DIRECTORIO DE UPLOADS
// ==========================================================================

async function listarArchivosUploads() {

    try {

        const entradas =
            await fs.promises.readdir(
                UPLOADS_DIR,
                {
                    withFileTypes: true
                }
            );


        return entradas
            .filter(
                (entrada) =>
                    entrada.isFile()
            )
            .map(
                (entrada) =>
                    entrada.name
            );

    } catch (error) {

        if (error.code === 'ENOENT') {

            await fs.promises.mkdir(
                UPLOADS_DIR,
                {
                    recursive: true
                }
            );

            return [];

        }


        throw error;

    }

}


// ==========================================================================
// INICIALIZAR ÍNDICE SHA-256
// ==========================================================================

async function inicializarIndiceHashes() {

    if (indiceInicializado) {
        return;
    }


    if (promesaInicializacion) {

        await promesaInicializacion;

        return;

    }


    promesaInicializacion =
        (async () => {

            const archivos =
                await listarArchivosUploads();


            for (const archivo of archivos) {

                const formato =
                    await detectarFormatoReal(
                        archivo
                    );


                /*
                 * Ignoramos cualquier archivo que no sea
                 * una imagen válida soportada.
                 */

                if (!formato) {
                    continue;
                }


                const hash =
                    await calcularHashArchivo(
                        archivo
                    );


                /*
                 * Conservamos la primera ruta encontrada
                 * para cada contenido.
                 */

                if (
                    !indiceHashes.has(
                        hash
                    )
                ) {

                    indiceHashes.set(
                        hash,
                        new Set()
                    );

                }


                indiceHashes
                    .get(hash)
                    .add(archivo);

            }


            indiceInicializado =
                true;

        })();


    try {

        await promesaInicializacion;

    } finally {

        promesaInicializacion =
            null;

    }

}

// ==========================================================================
// ELEGIR REPRESENTANTE PARA UN CONTENIDO YA EXISTENTE
// ==========================================================================

async function elegirArchivoRepresentante(
    archivos,
    excluir = null
) {

    if (
        !(archivos instanceof Set) ||
        archivos.size === 0
    ) {
        return null;
    }


    const candidatos =
        Array.from(
            archivos
        )
            .filter(
                (archivo) =>
                    archivo !== excluir
            )
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );


    if (candidatos.length === 0) {
        return null;
    }


    /*
     * Primera prioridad:
     * una ruta que ya esté utilizada actualmente
     * por la base de datos.
     */

    for (const archivo of candidatos) {

        const url =
            construirUrlPublica(
                archivo
            );


        if (!url) {
            continue;
        }


        const referenciada =
            await imageReferenceService
                .estaReferenciada(
                    url
                );


        if (referenciada) {
            return archivo;
        }

    }


    /*
     * Si ninguna copia está referenciada todavía,
     * utilizamos una elección determinística.
     *
     * Nunca dependemos del orden de fs.readdir().
     */

    return candidatos[0];

}



// ==========================================================================
// PROCESAR UN UPLOAD RECIÉN RECIBIDO
// ==========================================================================

async function procesarUpload(file) {

    if (
        !file ||
        typeof file.filename !== 'string' ||
        !file.filename.trim()
    ) {

        return {
            url: null,
            hash: null,
            duplicado: false,
            formato: null
        };

    }


    const nombreNuevo =
        file.filename.trim();


    const rutaNueva =
        resolverRutaSegura(
            nombreNuevo
        );


    if (!rutaNueva) {

        throw new Error(
            'La ruta del archivo recibido no es válida.'
        );

    }


    try {

        const formato =
            await detectarFormatoReal(
                nombreNuevo
            );


        if (!formato) {

            await eliminarArchivoSeguro(
                nombreNuevo
            );


            const error =
                new Error(
                    'El archivo recibido no es una imagen JPEG, PNG o WebP válida.'
                );


            error.code =
                'INVALID_IMAGE_CONTENT';


            throw error;

        }


        const hash =
            await calcularHashArchivo(
                nombreNuevo
            );


        await inicializarIndiceHashes();


        const archivosExistentes =
            indiceHashes.get(
                hash
            );


        const representante =
            await elegirArchivoRepresentante(
                archivosExistentes,
                nombreNuevo
            );


       /*
        * Ya existía el mismo contenido.
         *
        * Eliminamos exclusivamente el upload recién
        * recibido y reutilizamos una ruta existente.
        */

        if (representante) {

            await eliminarArchivoSeguro(
                nombreNuevo
            );


            return {

                url:
                    construirUrlPublica(
                        representante
                    ),

                hash,

                duplicado: true,

                formato

            };

        }


        /*
        * Contenido nuevo.
        *
        * Registramos el archivo recién recibido como
        * primera copia conocida de este SHA-256.
        */

        if (
            !indiceHashes.has(
                hash
            )
        ) {

            indiceHashes.set(
                hash,
                new Set()
            );

        }


        indiceHashes
            .get(hash)
            .add(nombreNuevo);


        return {

            url:
                construirUrlPublica(
                    nombreNuevo
                ),

            hash,

            duplicado: false,

            formato

        };


        return {

            url:
                construirUrlPublica(
                    nombreNuevo
                ),

            hash,

            duplicado: false,

            formato

        };

    } catch (error) {

        /*
         * Si ocurre un error inesperado durante el
         * procesamiento, intentamos no dejar el upload
         * recién recibido abandonado.
         */

        if (
            error.code !==
            'INVALID_IMAGE_CONTENT'
        ) {

            try {

                await eliminarArchivoSeguro(
                    nombreNuevo
                );

            } catch (
                cleanupError
            ) {

                console.error(
                    'No fue posible limpiar el upload después del error:',
                    cleanupError
                );

            }

        }


        throw error;

    }

}



// ==========================================================================
// EXPORTACIONES
// ==========================================================================
module.exports = {

    UPLOADS_DIR,

    resolverRutaSegura,

    detectarFormatoReal,

    calcularHashArchivo,

    construirUrlPublica,

    inicializarIndiceHashes,

    elegirArchivoRepresentante,

    procesarUpload,

    desregistrarArchivoDelIndice,

    eliminarArchivoSeguro

};