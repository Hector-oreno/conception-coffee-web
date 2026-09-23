const Experiencia = require('../models/experienciasModel');
const fs = require('fs');
const path = require('path');

exports.obtenerExperienciasAdmin = async (req, res) => {
    try {
        // En mysql2/promise, el resultado viene en un arreglo donde el primer elemento [rows] son los datos
        const [rows] = await Experiencia.getAllAdmin();
        return res.json({ success: true, data: rows || [] });
    } catch (error) {
        console.error("Error en obtenerExperienciasAdmin:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.obtenerExperienciasCliente = async (req, res) => {
    try {
        const [rows] = await Experiencia.getAllCliente(); 
        return res.json({ success: true, data: rows || [] });
    } catch (error) {
        console.error("Error en obtenerExperienciasCliente:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.crearExperiencia =
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Falta la imagen."

                });

            }

            const titulo =
                req.body.titulo?.trim();


            if (!titulo) {

                if (req.file?.filename) {

                    const rutaFisica =
                        path.join(
                            __dirname,
                            "../../public/images/uploads",
                            req.file.filename
                        );


                    fs.unlink(
                        rutaFisica,
                        () => {}
                    );

                }


                return res.status(400).json({

                    success: false,

                    message:
                        "El título de la experiencia es obligatorio."

                });

            }


            const nuevaExp = {

                imagen_url:
                    `/images/uploads/${req.file.filename}`,

                titulo:
                    req.body.titulo?.trim() ||
                    "Nueva Experiencia"

            };


            await Experiencia.create(
                nuevaExp
            );


            return res.json({

                success: true,

                message:
                    "Experiencia guardada como borrador."

            });


        } catch (error) {

            console.error(
                "Error en crearExperiencia:",
                error
            );


            // ==========================================
            // LIMPIAR ARCHIVO SI FALLÓ LA BD
            // ==========================================

            if (req.file?.filename) {

                const rutaFisica =
                    path.join(
                        __dirname,
                        "../../public/images/uploads",
                        req.file.filename
                    );


                fs.unlink(
                    rutaFisica,
                    errorArchivo => {

                        if (
                            errorArchivo &&
                            errorArchivo.code !==
                                "ENOENT"
                        ) {

                            console.warn(
                                "No fue posible limpiar la imagen después del error:",
                                errorArchivo.message
                            );

                        }

                    }
                );

            }


            return res.status(500).json({

                success: false,

                message:
                    "Error al crear la experiencia."

            });

        }

};


exports.actualizarExperiencia =
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { activo } =
                req.body;


            if (
                activo !== 0 &&
                activo !== 1 &&
                activo !== false &&
                activo !== true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Estado de disponibilidad inválido."

                });

            }


            const actualizado =
                await Experiencia.updateEstado(
                    id,
                    Number(activo)
                );


            if (!actualizado) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Experiencia no encontrada."

                });

            }


            return res.json({

                success: true,

                message:
                    "Estado actualizado correctamente."

            });


        } catch (error) {

            console.error(
                "Error en actualizarExperiencia:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Error al actualizar la experiencia."

            });

        }

};

exports.eliminarExperiencia = async (req, res) => {

        try {

            const { id } =
                req.params;


            // ==========================================
            // BUSCAR EXPERIENCIA
            // ==========================================

            const experiencia =
                await Experiencia.obtenerPorId(
                    id
                );


            if (!experiencia) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No se encontró la experiencia."

                });

            }


            // ==========================================
            // ELIMINAR REGISTRO
            // ==========================================

            const eliminado =
                await Experiencia.eliminar(
                    id
                );


            if (!eliminado) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No se pudo eliminar la experiencia."

                });

            }


            // ==========================================
            // ELIMINAR ARCHIVO FÍSICO
            // ==========================================

            const nombreArchivo =
                path.basename(
                    experiencia.imagen_url
                );


            const rutaFisica =
                path.join(
                    __dirname,
                    "../../public/images/uploads",
                    nombreArchivo
                );


            fs.unlink(
                rutaFisica,
                error => {

                    if (error) {

                        console.warn(
                            "Aviso: no fue posible eliminar el archivo físico de la experiencia:",
                            error.message
                        );

                    }

                }
            );


            return res.json({

                success: true,

                message:
                    "Experiencia eliminada correctamente."

            });


        } catch (error) {

            console.error(
                "Error en eliminarExperiencia:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Error al eliminar la experiencia."

            });

        }

};

exports.publicarCambios = async (req, res) => {
    try {
        await Experiencia.publicarTodos();
        return res.json({ success: true, message: 'Cambios sincronizados en la web.' });
    } catch (error) {
        console.error("Error en publicarCambios:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};