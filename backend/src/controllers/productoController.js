const productoModel = require('../models/productoModel');
const auditoriaModel = require('../models/auditoriaModel');


const imageStorageService =
    require(
        '../services/imageStorageService'
    );



const imageReferenceService =
    require('../services/imageReferenceService');



// Helper rápido para estandarizar el ID de sucursal (Busca en URL o en el cuerpo)
// Asegurar que nunca intente leer de un undefined
function obtenerSucursalId(req) {
    if (!req) return 1;
    
    // Usamos encadenamiento opcional (?.) para evitar que lance excepciones si el objeto no existe
    const id = req.query?.sucursal || 
               req.body?.sucursal_id || 
               req.params?.sucursal_id || 
               req.headers?.['x-sucursal-id'] || 1;

    // Validamos estrictamente que sea un número válido y mayor a 0
    const parsedId = Number(id);
    return isNaN(parsedId) || parsedId <= 0 ? 1 : parsedId;
}


// ==========================================================================
// SUCURSAL AUTORIZADA PARA OPERACIONES ADMINISTRATIVAS
// ==========================================================================

function obtenerSucursalAutorizada(req) {

    if (!req.usuario) {

        return null;

    }


    // ======================================================
    // GERENTE
    // Siempre opera sobre SU sucursal.
    // ======================================================

    if (req.usuario.rol === 'gerente') {

        const sucursalUsuario =
            Number(
                req.usuario.sucursal_id
            );


        if (
            !Number.isInteger(sucursalUsuario) ||
            sucursalUsuario <= 0
        ) {

            return null;

        }


        return sucursalUsuario;

    }


    // ======================================================
    // ADMIN
    // Puede seleccionar sucursal.
    // ======================================================

    if (req.usuario.rol === 'admin') {

        const solicitada =
            req.query?.sucursalId ??
            req.query?.sucursal ??
            req.body?.sucursal_id ??
            req.headers?.['x-sucursal-id'];


        const sucursalId =
            Number(solicitada);


        if (
            !Number.isInteger(sucursalId) ||
            sucursalId <= 0
        ) {

            return null;

        }


        return sucursalId;

    }


    // Cualquier otro rol no tiene autoridad administrativa
    return null;

}

// 1. PARA EL ADMINISTRADOR Y CLIENTE
const getProductos = async (req, res) => {
    try {
        const { buscar, soloDisponibles, sucursalId: sucursalQuery } = req.query;

        // PRIORIDAD: 
        // 1. Si viene sucursalId en la URL (ej: /api/productos?sucursalId=2), usas ese.
        // 2. Si no viene, usas el helper de la cookie/sesión obtenerSucursalId(req).
        const sucursalId = sucursalQuery ? parseInt(sucursalQuery) : obtenerSucursalId(req);

        // Convertimos a booleano la bandera opcional
        const esSoloDisponibles = soloDisponibles === 'true' || soloDisponibles === '1';

        // Pasamos el filtro al modelo
        const productos = await productoModel.obtenerProductos(buscar, sucursalId, esSoloDisponibles);

        res.json({
            success: true,
            total: productos.length,
            data: productos
        });
    } catch (error) {
        console.error('Error en getProductos:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo productos' });
    }
};

// 2. OBTENER PRODUCTOS DESTACADOS POR SUCURSAL
const getProductosDestacados = async (req, res) => {
    try {
        const sucursalId = obtenerSucursalId(req);
        
        // Validamos que el modelo exista antes de llamarlo para evitar caídas
        if (!productoModel || typeof productoModel.obtenerProductosDestacados !== 'function') {
            throw new Error("El método obtenerProductosDestacados no está definido en productoModel");
        }

        const productos = await productoModel.obtenerProductosDestacados(sucursalId);

        res.json({
            success: true,
            total: productos ? productos.length : 0,
            data: productos || []
        });
    } catch (error) {
        // Esto dejará un rastro limpio en tu terminal de Express sin tumbar el proceso
        console.error('Error controlado en getProductosDestacados:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno al obtener los productos destacados del servidor.' 
        });
    }
};

// ==========================================================================
// 3. CREAR UN NUEVO PRODUCTO
// Crea el producto maestro y lo vincula a las sucursales seleccionadas.
// Gestiona de forma segura el ciclo de vida del upload.
// ==========================================================================

const crearProducto = async (req, res) => {

    let imagenProcesada =
        null;


    try {

        const {
            nombre,
            precio,
            categoria_id,
            descripcion,
            sucursales
        } = req.body;


        // ==============================================================
        // VALIDACIONES BÁSICAS
        // ==============================================================

        const nombreLimpio =
            typeof nombre === 'string'
                ? nombre.trim()
                : '';


        const categoriaId =
            Number(categoria_id);


        const precioFinal =
            Number(precio);


        if (!nombreLimpio) {

            if (req.file?.filename) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        req.file.filename
                    );

            }


            return res.status(400).json({

                success: false,

                message:
                    'El nombre del producto es obligatorio.'

            });

        }


        if (
            !Number.isInteger(categoriaId) ||
            categoriaId <= 0
        ) {

            if (req.file?.filename) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        req.file.filename
                    );

            }


            return res.status(400).json({

                success: false,

                message:
                    'La categoría indicada no es válida.'

            });

        }


        if (
            !Number.isFinite(precioFinal) ||
            precioFinal < 0
        ) {

            if (req.file?.filename) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        req.file.filename
                    );

            }


            return res.status(400).json({

                success: false,

                message:
                    'El precio indicado no es válido.'

            });

        }


        // ==============================================================
        // VALIDAR SUCURSALES ANTES DE PROCESAR LA IMAGEN
        // ==============================================================

        let listaSucursales =
            [];


        if (sucursales) {

            try {

                listaSucursales =
                    typeof sucursales === 'string'
                        ? JSON.parse(sucursales)
                        : sucursales;

            } catch {

                if (req.file?.filename) {

                    await imageStorageService
                        .eliminarArchivoSeguro(
                            req.file.filename
                        );

                }


                return res.status(400).json({

                    success: false,

                    message:
                        'La lista de sucursales no es válida.'

                });

            }

        }


        if (
            !Array.isArray(listaSucursales) ||
            listaSucursales.length === 0
        ) {

            if (req.file?.filename) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        req.file.filename
                    );

            }


            return res.status(400).json({

                success: false,

                message:
                    'Selecciona al menos una sucursal.'

            });

        }


        listaSucursales =
            listaSucursales
                .map(
                    (sucursalId) =>
                        Number(sucursalId)
                )
                .filter(
                    (sucursalId) =>
                        Number.isInteger(sucursalId) &&
                        sucursalId > 0
                );


        if (listaSucursales.length === 0) {

            if (req.file?.filename) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        req.file.filename
                    );

            }


            return res.status(400).json({

                success: false,

                message:
                    'No se recibió ninguna sucursal válida.'

            });

        }


        // Evitamos procesar dos veces una misma sucursal.

        listaSucursales =
            [
                ...new Set(
                    listaSucursales
                )
            ];


        // ==============================================================
        // PROCESAR IMAGEN
        // ==============================================================

        let imagen =
            null;


        if (req.file) {

            imagenProcesada =
                await imageStorageService
                    .procesarUpload(
                        req.file
                    );


            imagen =
                imagenProcesada.url;

        }


        // ==============================================================
        // CREAR PRODUCTO MAESTRO
        // ==============================================================

        const nuevoProductoId =
            await productoModel
                .registrarProductoMaestro({

                    nombre:
                        nombreLimpio,

                    descripcion:
                        typeof descripcion === 'string'
                            ? descripcion.trim()
                            : '',

                    imagen,

                    categoria_id:
                        categoriaId

                });


        // ==============================================================
        // VINCULAR PRODUCTO A SUCURSALES
        // ==============================================================

        for (
            const sucursalId
            of listaSucursales
        ) {

            await productoModel
                .vincularProductoASucursal(

                    nuevoProductoId,

                    sucursalId,

                    precioFinal

                );

        }


        // ==============================================================
        // AUDITORÍA
        // ==============================================================

        await auditoriaModel
            .registrarMovimiento({

                id_usuario:
                    req.usuario.id,

                rol_usuario:
                    req.usuario.rol,

                accion:
                    'CREAR',

                tabla_afectada:
                    'productos',

                id_registro_afectado:
                    nuevoProductoId,

                descripcion:
                    `Se creó el producto general: ${nombreLimpio} y se asignó a sus sucursales.`,

                valor_anterior:
                    null,

                valor_nuevo:
                    JSON.stringify({

                        nombre:
                            nombreLimpio,

                        precio:
                            precioFinal,

                        categoria_id:
                            categoriaId,

                        sucursales:
                            listaSucursales,

                        imagen

                    })

            });


        return res.json({

            success: true,

            message:
                'Producto creado y replicado en las sucursales seleccionadas con éxito.',

            id:
                nuevoProductoId

        });


    } catch (error) {

        // ==============================================================
        // ROLLBACK DEL ARCHIVO NUEVO
        // ==============================================================
        //
        // Si procesarUpload reutilizó una imagen existente,
        // NO debemos borrarla.
        //
        // Solo limpiamos cuando este request conservó físicamente
        // un archivo nuevo.
        // ==============================================================

        if (
            imagenProcesada &&
            imagenProcesada.duplicado === false &&
            imagenProcesada.url
        ) {

            try {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        imagenProcesada.url
                    );

            } catch (cleanupError) {

                console.error(
                    'No fue posible limpiar la imagen después del error:',
                    cleanupError
                );

            }

        }


        // ==============================================================
        // IMAGEN CON CONTENIDO INVÁLIDO
        // ==============================================================

        if (
            error.code ===
            'INVALID_IMAGE_CONTENT'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'El archivo enviado no es una imagen JPEG, PNG o WebP válida.'

            });

        }


        console.error(
            'Error en crearProducto:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Error al crear el producto en el servidor.'

        });

    }

};

// 4. OBTENER UN PRODUCTO POR ID (Cruzado con su Sucursal para cargar el Modal)
const getProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const sucursalId = obtenerSucursalId(req);
        const producto = await productoModel.obtenerProductoPorId(id, sucursalId);
        if (producto) {
            res.json({ success: true, data: producto });
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado en esta sucursal' });
        }
    } catch (error) {
        console.error('Error en getProductoPorId:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el producto' });
    }
};

const getProductoSucursales = async (req,res)=>{

    try{

        const {id}=req.params;

        const data =
            await productoModel.obtenerProductoSucursales(id);

        return res.json({

            success:true,

            data

        });

    }catch(error){

        console.error(error);

        return res.status(500).json({

            success:false,

            message:"Error obteniendo sucursales."

        });

    }

};


// ==========================================================================
// 5. ACTUALIZAR UN PRODUCTO EXISTENTE
// Actualiza datos globales y datos de la sucursal seleccionada.
// Gestiona de forma segura el reemplazo de imágenes.
// ==========================================================================

const actualizarProducto = async (req, res) => {

    let imagenProcesada =
        null;


    try {

        const { id } =
            req.params;


        const {
            nombre,
            descripcion,
            precio,
            categoria_id,
            destacado,
            disponible
        } = req.body;


        // ==============================================================
        // SUCURSAL AUTORIZADA
        // ==============================================================

        const sucursalId =
            obtenerSucursalAutorizada(
                req
            );


        if (!sucursalId) {

            /*
             * Multer ya pudo haber escrito el archivo antes
             * de llegar al controller.
             */

            if (req.file?.filename) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        req.file.filename
                    );

            }


            return res.status(403).json({

                success: false,

                message:
                    'No tienes una sucursal autorizada para realizar esta operación.'

            });

        }


        // ==============================================================
        // ESTADO ANTERIOR
        // ==============================================================

        const valorAnterior =
            await productoModel
                .obtenerProductoPorId(
                    id,
                    sucursalId
                );


        if (!valorAnterior) {

            if (req.file?.filename) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        req.file.filename
                    );

            }


            return res.status(404).json({

                success: false,

                message:
                    'Producto no encontrado en esta sucursal.'

            });

        }


        // ==============================================================
        // PROCESAR NUEVA IMAGEN
        // ==============================================================

        let nuevaImagen =
            undefined;


        /*
         * Solo el administrador puede modificar
         * la imagen global del producto.
         */

        if (
            req.usuario.rol === 'admin' &&
            req.file
        ) {

            imagenProcesada =
                await imageStorageService
                    .procesarUpload(
                        req.file
                    );


            nuevaImagen =
                imagenProcesada.url;

        }


        /*
         * Si por el flujo actual un rol distinto de admin
         * llegara hasta aquí con un archivo, no lo utilizamos
         * y tampoco lo dejamos abandonado.
         */

        if (
            req.usuario.rol !== 'admin' &&
            req.file?.filename
        ) {

            await imageStorageService
                .eliminarArchivoSeguro(
                    req.file.filename
                );

        }


        // ==============================================================
        // DATOS A ACTUALIZAR
        // ==============================================================

        const datosActualizar = {

            nombre,

            descripcion,

            precio:
                parseFloat(
                    precio
                ),

            categoria_id:
                categoria_id
                    ? parseInt(
                        categoria_id,
                        10
                    )
                    : undefined,

            destacado:
                destacado === 'true' ||
                destacado === '1' ||
                destacado === 1 ||
                destacado === true
                    ? 1
                    : 0,

            disponible:
                disponible === 'false' ||
                disponible === '0' ||
                disponible === 0 ||
                disponible === false
                    ? 0
                    : 1,

            /*
             * undefined significa:
             * conservar la imagen existente.
             */

            imagen:
                nuevaImagen

        };


        // ==============================================================
        // ACTUALIZAR SEGÚN EL ROL
        // ==============================================================

        let modificado =
            false;


        if (
            req.usuario.rol === 'admin'
        ) {

            modificado =
                await productoModel
                    .modificarProducto(
                        id,
                        datosActualizar,
                        sucursalId
                    );

        } else if (
            req.usuario.rol === 'gerente'
        ) {

            modificado =
                await productoModel
                    .modificarProductoSucursal(
                        Number(id),
                        sucursalId,
                        {

                            precio:
                                datosActualizar.precio,

                            destacado:
                                datosActualizar.destacado,

                            disponible:
                                datosActualizar.disponible

                        }
                    );

        } else {

            /*
             * Si procesamos una imagen nueva antes de descubrir
             * un rol no permitido, hacemos rollback.
             */

            if (
                imagenProcesada &&
                imagenProcesada.duplicado === false &&
                imagenProcesada.url
            ) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        imagenProcesada.url
                    );

            }


            return res.status(403).json({

                success: false,

                message:
                    'No tienes permisos para modificar productos.'

            });

        }


        if (!modificado) {

            /*
             * La BD no aplicó el cambio.
             *
             * Si este request creó físicamente una imagen nueva,
             * la eliminamos.
             *
             * Una imagen reutilizada nunca se elimina.
             */

            if (
                imagenProcesada &&
                imagenProcesada.duplicado === false &&
                imagenProcesada.url
            ) {

                await imageStorageService
                    .eliminarArchivoSeguro(
                        imagenProcesada.url
                    );

            }


            return res.status(400).json({

                success: false,

                message:
                    'No se pudieron aplicar los cambios en la sucursal.'

            });

        }


        // ==============================================================
        // OBTENER ESTADO NUEVO
        // ==============================================================

        const valorNuevo =
            await productoModel
                .obtenerProductoPorId(
                    id,
                    sucursalId
                );


        // ==============================================================
        // AUDITORÍA
        // ==============================================================

        await auditoriaModel
            .registrarMovimiento({

                id_usuario:
                    req.usuario.id,

                rol_usuario:
                    req.usuario.rol,

                accion:
                    'MODIFICAR',

                tabla_afectada:
                    'productos',

                id_registro_afectado:
                    id,

                descripcion:
                    `Se modificó el producto ID ${id} en la sucursal ${sucursalId}: ${nombre}`,

                valor_anterior:
                    JSON.stringify(
                        valorAnterior
                    ),

                valor_nuevo:
                    JSON.stringify(
                        valorNuevo
                    )

            });


        // ==============================================================
        // LIMPIAR IMAGEN ANTERIOR SI FUE REEMPLAZADA
        // ==============================================================

        const imagenAnterior =
            valorAnterior.imagen;


        const imagenActual =
            valorNuevo?.imagen;

        if (
            req.usuario.rol === 'admin' &&
            imagenProcesada &&
            imagenAnterior &&
            imagenActual &&
            imagenAnterior !== imagenActual
        ) {

            try {

                const sigueReferenciada =
                    await imageReferenceService
                        .estaReferenciada(
                            imagenAnterior
                        );


                if (!sigueReferenciada) {

                    await imageStorageService
                        .eliminarArchivoSeguro(
                            imagenAnterior
                        );

                }

            } catch (cleanupError) {

                /*
                 * La actualización principal ya fue exitosa.
                 *
                 * Un problema limpiando la imagen anterior
                 * NO debe convertir la operación completa en 500.
                 */

                console.error(
                    'No fue posible limpiar la imagen anterior del producto:',
                    cleanupError
                );

            }

        }


        return res.json({

            success: true,

            message:
                'Producto e inventario de sucursal actualizados correctamente.'

        });


    } catch (error) {

        // ==============================================================
        // ROLLBACK DE IMAGEN NUEVA
        // ==============================================================

        if (
            imagenProcesada &&
            imagenProcesada.duplicado === false &&
            imagenProcesada.url
        ) {

            try {

                /*
                 * Antes de eliminar comprobamos si la BD llegó
                 * a utilizar la imagen.
                 *
                 * Esto protege el caso donde la actualización
                 * principal funcionó pero posteriormente falló
                 * auditoría u otra operación.
                 */

                const estaEnUso =
                    await imageReferenceService
                        .estaReferenciada(
                            imagenProcesada.url
                        );


                if (!estaEnUso) {

                    await imageStorageService
                        .eliminarArchivoSeguro(
                            imagenProcesada.url
                        );

                }

            } catch (cleanupError) {

                console.error(
                    'No fue posible realizar el rollback de la imagen:',
                    cleanupError
                );

            }

        }


        // ==============================================================
        // CONTENIDO DE IMAGEN INVÁLIDO
        // ==============================================================

        if (
            error.code ===
            'INVALID_IMAGE_CONTENT'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'El archivo enviado no es una imagen JPEG, PNG o WebP válida.'

            });

        }


        console.error(
            'Error en actualizarProducto:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Error al actualizar el producto.'

        });

    }

};

// ========================================================================
// AGREGAR UN PRODUCTO EXISTENTE A UNA NUEVA SUCURSAL
// ========================================================================

// ==========================================================================
// AGREGAR PRODUCTO EXISTENTE A UNA SUCURSAL
// ==========================================================================

const agregarProductoASucursal = async (req, res) => {

    try {

        const productoId =
            Number(req.params.id);

        const {
            precio
        } = req.body;


        // ======================================================
        // VALIDAR PRODUCTO
        // ======================================================

        if (
            !Number.isInteger(productoId) ||
            productoId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'El producto indicado no es válido.'

            });

        }


        // ======================================================
        // SUCURSAL AUTORIZADA
        // ======================================================

        const sucursalId =
            obtenerSucursalAutorizada(req);


        if (!sucursalId) {

            return res.status(403).json({

                success: false,

                message:
                    'No tienes una sucursal autorizada para realizar esta operación.'

            });

        }


        // ======================================================
        // VALIDAR PRECIO
        // ======================================================

        const precioFinal =
            Number(precio);


        if (
            !Number.isFinite(precioFinal) ||
            precioFinal < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'El precio indicado no es válido.'

            });

        }


        // ======================================================
        // VINCULAR A LA SUCURSAL AUTORIZADA
        // ======================================================

        await productoModel
            .vincularProductoASucursal(

                productoId,

                sucursalId,

                precioFinal

            );


        // ======================================================
        // AUDITORÍA REAL
        // ======================================================

        await auditoriaModel.registrarMovimiento({

            id_usuario:
                req.usuario.id,

            rol_usuario:
                req.usuario.rol,

            accion:
                'CREAR',

            tabla_afectada:
                'producto_sucursal',

            id_registro_afectado:
                productoId,

            descripcion:
                `Producto ${productoId} agregado a la sucursal ${sucursalId}.`,

            valor_anterior:
                null,

            valor_nuevo:
                JSON.stringify({

                    producto_id:
                        productoId,

                    sucursal_id:
                        sucursalId,

                    precio:
                        precioFinal

                })

        });


        return res.json({

            success: true,

            message:
                'Producto agregado correctamente a la sucursal.',

            sucursal_id:
                sucursalId

        });


    } catch (error) {

        console.error(
            'Error agregando producto a sucursal:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'No fue posible agregar el producto a la sucursal.'

        });

    }

};


// ==========================================================================
// 6. REMOVER PRODUCTO DE UNA SUCURSAL
// No elimina el producto maestro.
// ==========================================================================

const eliminarProducto = async (req, res) => {

    try {

        const productoId =
            Number(req.params.id);


        // ======================================================
        // VALIDAR PRODUCTO
        // ======================================================

        if (
            !Number.isInteger(productoId) ||
            productoId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'El producto indicado no es válido.'

            });

        }


        // ======================================================
        // SUCURSAL AUTORIZADA
        // ======================================================

        const sucursalId =
            obtenerSucursalAutorizada(req);


        if (!sucursalId) {

            return res.status(403).json({

                success: false,

                message:
                    'No tienes una sucursal autorizada para realizar esta operación.'

            });

        }


        // ======================================================
        // ESTADO ANTERIOR PARA AUDITORÍA
        // ======================================================

        const valorAnterior =
            await productoModel.obtenerProductoPorId(
                productoId,
                sucursalId
            );


        if (!valorAnterior) {

            return res.status(404).json({

                success: false,

                message:
                    'El producto no está asignado a esta sucursal.'

            });

        }


        // ======================================================
        // REMOVER ÚNICAMENTE DE LA SUCURSAL
        // ======================================================

        const borradoExitoso =
            await productoModel.eliminarDeSucursal(
                productoId,
                sucursalId
            );


        if (!borradoExitoso) {

            return res.status(404).json({

                success: false,

                message:
                    'El producto no estaba asignado a esta sucursal.'

            });

        }


        // ======================================================
        // AUDITORÍA
        // ======================================================

        await auditoriaModel.registrarMovimiento({

            id_usuario:
                req.usuario.id,

            rol_usuario:
                req.usuario.rol,

            accion:
                'DAR_BAJA',

            tabla_afectada:
                'producto_sucursal',

            id_registro_afectado:
                productoId,

            descripcion:
                `Producto ${productoId} dado de baja en la sucursal ${sucursalId}.`,

            valor_anterior:
                JSON.stringify(
                    valorAnterior
                ),

            valor_nuevo:
                null

        });


        return res.json({

            success: true,

            message:
                'El producto fue dado de baja correctamente.',

            sucursal_id:
                sucursalId

        });


    } catch (error) {

        console.error(
            'Error en eliminarProducto:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Error en el servidor al remover el producto de la sucursal.'

        });

    }

};

// ==========================================================================
// CAMBIAR DISPONIBILIDAD DE PRODUCTO
// Operación administrativa protegida por sucursal
// ==========================================================================

const cambiarDisponibilidad = async (req, res) => {

    try {

        const { id } =
            req.params;

        const { disponible } =
            req.body;


        // ======================================================
        // OBTENER SUCURSAL AUTORIZADA
        // ======================================================

        const sucursalId =
            obtenerSucursalAutorizada(req);


        if (!sucursalId) {

            return res.status(403).json({

                success: false,

                message:
                    'No tienes una sucursal autorizada para realizar esta operación.'

            });

        }


        // ======================================================
        // VALIDAR PRODUCTO
        // ======================================================

        const productoId =
            Number(id);


        if (
            !Number.isInteger(productoId) ||
            productoId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'El producto indicado no es válido.'

            });

        }


        // ======================================================
        // NORMALIZAR DISPONIBILIDAD
        // ======================================================

        let nuevoEstado;


        if (
            disponible === true ||
            disponible === 1 ||
            disponible === '1' ||
            disponible === 'true'
        ) {

            nuevoEstado = 1;

        } else if (
            disponible === false ||
            disponible === 0 ||
            disponible === '0' ||
            disponible === 'false'
        ) {

            nuevoEstado = 0;

        } else {

            return res.status(400).json({

                success: false,

                message:
                    'El estado de disponibilidad no es válido.'

            });

        }


        // ======================================================
        // ACTUALIZAR ÚNICAMENTE LA SUCURSAL AUTORIZADA
        // ======================================================

        const modificado =
            await productoModel
                .actualizarEstadoDisponibilidad(
                    productoId,
                    nuevoEstado,
                    sucursalId
                );


        if (!modificado) {

            return res.status(404).json({

                success: false,

                message:
                    'El producto no está asignado a la sucursal autorizada.'

            });

        }


        return res.json({

            success: true,

            message:
                'Disponibilidad actualizada correctamente.',

            sucursal_id:
                sucursalId

        });


    } catch (error) {

        console.error(
            'Error en cambiarDisponibilidad:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Error interno del servidor.'

        });

    }

};

// ==========================================================================
// CAMBIAR ESTADO DESTACADO DE PRODUCTO
// Operación administrativa protegida por sucursal
// ==========================================================================

const cambiarDestacado = async (req, res) => {

    try {

        const { id } =
            req.params;

        const { destacado } =
            req.body;


        // ======================================================
        // SUCURSAL AUTORIZADA
        // ======================================================

        const sucursalId =
            obtenerSucursalAutorizada(req);


        if (!sucursalId) {

            return res.status(403).json({

                success: false,

                message:
                    'No tienes una sucursal autorizada para realizar esta operación.'

            });

        }


        // ======================================================
        // VALIDAR PRODUCTO
        // ======================================================

        const productoId =
            Number(id);


        if (
            !Number.isInteger(productoId) ||
            productoId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'El producto indicado no es válido.'

            });

        }


        // ======================================================
        // NORMALIZAR DESTACADO
        // ======================================================

        let nuevoEstado;


        if (
            destacado === true ||
            destacado === 1 ||
            destacado === '1' ||
            destacado === 'true'
        ) {

            nuevoEstado = 1;

        } else if (
            destacado === false ||
            destacado === 0 ||
            destacado === '0' ||
            destacado === 'false'
        ) {

            nuevoEstado = 0;

        } else {

            return res.status(400).json({

                success: false,

                message:
                    'El estado destacado no es válido.'

            });

        }


        // ======================================================
        // MODIFICAR SOLO SUCURSAL AUTORIZADA
        // ======================================================

        const modificado =
            await productoModel
                .actualizarEstadoDestacado(
                    productoId,
                    nuevoEstado,
                    sucursalId
                );


        if (!modificado) {

            return res.status(404).json({

                success: false,

                message:
                    'El producto no está asignado a la sucursal autorizada.'

            });

        }


        return res.json({

            success: true,

            message:
                'Estado destacado actualizado correctamente.',

            sucursal_id:
                sucursalId

        });


    } catch (error) {

        console.error(
            'Error en cambiarDestacado:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Error interno del servidor.'

        });

    }

};

// ==========================================================================
// ACTUALIZAR DATOS OPERATIVOS DE UN PRODUCTO EN UNA SUCURSAL
// Solo modifica producto_sucursal.
// ==========================================================================

const actualizarProductoSucursal = async (req, res) => {

    try {

        const productoId =
            Number(req.params.id);

        const sucursalId =
            obtenerSucursalAutorizada(req);


        // ======================================================
        // VALIDACIONES
        // ======================================================

        if (
            !Number.isInteger(productoId) ||
            productoId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'El producto indicado no es válido.'
            });

        }


        if (!sucursalId) {

            return res.status(403).json({
                success: false,
                message:
                    'No tienes una sucursal autorizada para realizar esta operación.'
            });

        }


        const precio =
            Number(req.body.precio);

        const disponible =
            Number(req.body.disponible) === 1
                ? 1
                : 0;

        const destacado =
            Number(req.body.destacado) === 1
                ? 1
                : 0;


        if (
            !Number.isFinite(precio) ||
            precio < 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'El precio indicado no es válido.'
            });

        }


        // ======================================================
        // ESTADO ANTERIOR
        // ======================================================

        const valorAnterior =
            await productoModel.obtenerProductoPorId(
                productoId,
                sucursalId
            );


        if (!valorAnterior) {

            return res.status(404).json({
                success: false,
                message:
                    'El producto no está asignado a esta sucursal.'
            });

        }


        // ======================================================
        // ACTUALIZAR SOLAMENTE producto_sucursal
        // ======================================================

        const modificado =
            await productoModel.modificarProductoSucursal(
                productoId,
                sucursalId,
                {
                    precio,
                    disponible,
                    destacado
                }
            );


        if (!modificado) {

            return res.status(400).json({
                success: false,
                message:
                    'No fue posible actualizar los datos de la sucursal.'
            });

        }


        // ======================================================
        // LEER NUEVAMENTE DESDE BD
        // ======================================================

        const valorNuevo =
            await productoModel.obtenerProductoPorId(
                productoId,
                sucursalId
            );


        // ======================================================
        // AUDITORÍA
        // ======================================================

        await auditoriaModel.registrarMovimiento({

            id_usuario:
                req.usuario.id,

            rol_usuario:
                req.usuario.rol,

            accion:
                'MODIFICAR_SUCURSAL',

            tabla_afectada:
                'producto_sucursal',

            id_registro_afectado:
                productoId,

            descripcion:
                `Se actualizaron los datos del producto ${productoId} en la sucursal ${sucursalId}.`,

            valor_anterior:
                JSON.stringify(valorAnterior),

            valor_nuevo:
                JSON.stringify(valorNuevo)

        });


        return res.json({

            success: true,

            message:
                'Datos de la sucursal actualizados correctamente.',

            data:
                valorNuevo

        });


    } catch (error) {

        console.error(
            'Error en actualizarProductoSucursal:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Error al actualizar los datos del producto en la sucursal.'

        });

    }

};


module.exports = {
    getProductos,
    getProductosDestacados,
    crearProducto,      
    getProductoPorId, 
    actualizarProducto,  
    eliminarProducto,
    cambiarDisponibilidad,
    cambiarDestacado,
    getProductoSucursales,
    agregarProductoASucursal,
    obtenerSucursalAutorizada,
    actualizarProductoSucursal
    
};