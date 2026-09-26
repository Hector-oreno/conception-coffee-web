const sucursalModel =
    require('../models/sucursalModel');

const fs =
    require('fs');

const path =
    require('path');

const getSucursales = async (req, res) => {
    try {
        const sucursales = await sucursalModel.obtenerSucursales();
        res.json(sucursales);
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// ==========================================================
// CREAR SUCURSAL
// ==========================================================

const crearSucursal =
    async (req, res) => {

        try {

            const {
                nombre,
                direccion,
                horario,
                telefono,
                mapa_url
            } = req.body;


            const nombreLimpio =
                nombre?.trim();


            if (!nombreLimpio) {

                // Multer pudo haber guardado una imagen
                // antes de detectar que falta el nombre.
                if (req.file?.path) {

                    fs.unlink(
                        req.file.path,
                        () => {}
                    );

                }


                return res.status(400).json({

                    success: false,

                    message:
                        'El nombre de la sucursal es obligatorio.'

                });

            }


            const imagenUrl =
                req.file
                    ? `/images/uploads/${req.file.filename}`
                    : null;


            const nuevoId =
                await sucursalModel
                    .insertarSucursal(
                        nombreLimpio,
                        direccion?.trim() || null,
                        horario?.trim() || null,
                        telefono?.trim() || null,
                        mapa_url?.trim() || null,
                        imagenUrl
                    );


            return res.status(201).json({

                success: true,

                message:
                    'Sucursal creada correctamente.',

                id:
                    nuevoId

            });


        } catch (error) {

            console.error(
                'Error al crear sucursal:',
                error
            );


            // Si la BD falló después de que Multer
            // guardó la fotografía, la limpiamos.
            if (req.file?.path) {

                fs.unlink(
                    req.file.path,
                    errorArchivo => {

                        if (
                            errorArchivo &&
                            errorArchivo.code !== 'ENOENT'
                        ) {

                            console.warn(
                                'No fue posible limpiar la imagen de sucursal:',
                                errorArchivo.message
                            );

                        }

                    }
                );

            }


            return res.status(500).json({

                success: false,

                message:
                    'Error interno al crear la sucursal.'

            });

        }

    };



// ==========================================================
// ACTUALIZAR SUCURSAL
// ==========================================================

const actualizarSucursal =
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {
                nombre,
                direccion,
                horario,
                telefono,
                mapa_url
            } = req.body;


            const nombreLimpio =
                nombre?.trim();


            if (!nombreLimpio) {

                if (req.file?.path) {

                    fs.unlink(
                        req.file.path,
                        () => {}
                    );

                }


                return res.status(400).json({

                    success: false,

                    message:
                        'El nombre de la sucursal es obligatorio.'

                });

            }


            // ==============================================
            // OBTENER REGISTRO ACTUAL
            // ==============================================

            const sucursalActual =
                await sucursalModel
                    .obtenerSucursalPorId(
                        id
                    );


            if (!sucursalActual) {

                if (req.file?.path) {

                    fs.unlink(
                        req.file.path,
                        () => {}
                    );

                }


                return res.status(404).json({

                    success: false,

                    message:
                        'Sucursal no encontrada.'

                });

            }


            // ==============================================
            // DETERMINAR IMAGEN
            // ==============================================

            const imagenAnterior =
                sucursalActual.imagen_url;


            const imagenNueva =
                req.file
                    ? `/images/uploads/${req.file.filename}`
                    : imagenAnterior;


            // ==============================================
            // ACTUALIZAR BD
            // ==============================================

            const actualizado =
                await sucursalModel
                    .actualizarSucursal(
                        id,
                        nombreLimpio,
                        direccion?.trim() || null,
                        horario?.trim() || null,
                        telefono?.trim() || null,
                        mapa_url?.trim() || null,
                        imagenNueva
                    );


            if (!actualizado) {

                if (req.file?.path) {

                    fs.unlink(
                        req.file.path,
                        () => {}
                    );

                }


                return res.status(404).json({

                    success: false,

                    message:
                        'No fue posible actualizar la sucursal.'

                });

            }


            // ==============================================
            // BORRAR IMAGEN ANTERIOR
            // ==============================================

            if (
                req.file &&
                imagenAnterior &&
                imagenAnterior !== imagenNueva
            ) {

                const nombreArchivoAnterior =
                    path.basename(
                        imagenAnterior
                    );


                const rutaAnterior =
                    path.join(
                        __dirname,
                        '../../public/images/uploads',
                        nombreArchivoAnterior
                    );


                fs.unlink(
                    rutaAnterior,
                    errorArchivo => {

                        if (
                            errorArchivo &&
                            errorArchivo.code !== 'ENOENT'
                        ) {

                            console.warn(
                                'No fue posible eliminar la imagen anterior de la sucursal:',
                                errorArchivo.message
                            );

                        }

                    }
                );

            }


            return res.json({

                success: true,

                message:
                    'Sucursal actualizada correctamente.'

            });


        } catch (error) {

            console.error(
                'Error al actualizar sucursal:',
                error
            );


            // Si se subió una fotografía nueva y la operación
            // falló, eliminamos esa fotografía.
            if (req.file?.path) {

                fs.unlink(
                    req.file.path,
                    errorArchivo => {

                        if (
                            errorArchivo &&
                            errorArchivo.code !== 'ENOENT'
                        ) {

                            console.warn(
                                'No fue posible limpiar la nueva imagen de sucursal:',
                                errorArchivo.message
                            );

                        }

                    }
                );

            }


            return res.status(500).json({

                success: false,

                message:
                    'Error interno al actualizar la sucursal.'

            });

        }

    };





// ==========================================================
// ACTIVAR / DESACTIVAR SUCURSAL
// ==========================================================

const toggleEstadoSucursal =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { activa } =
                req.body;


            if (
                activa !== 0 &&
                activa !== 1 &&
                activa !== false &&
                activa !== true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Estado de sucursal inválido."

                });

            }


            const nuevoEstado =
                Number(activa);


            const actualizado =
                await sucursalModel
                    .cambiarEstadoSucursal(
                        id,
                        nuevoEstado
                    );


            if (!actualizado) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Sucursal no encontrada."

                });

            }


            return res.json({

                success: true,

                message:
                    `Sucursal ${
                        nuevoEstado === 1
                            ? "activada"
                            : "inactivada"
                    } correctamente.`

            });


        } catch (error) {

            console.error(
                "Error al cambiar estado de sucursal:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Error al cambiar el estado de la sucursal."

            });

        }

    };



module.exports = {
    getSucursales,
    crearSucursal,
    actualizarSucursal,
    toggleEstadoSucursal
};