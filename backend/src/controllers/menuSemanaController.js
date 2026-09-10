const menuSemanaModel = require('../models/menuSemanaModel');

// ==========================================================================
// OBTENER SUCURSAL AUTORIZADA PARA EL PLANNER
// ==========================================================================

function obtenerSucursalPlanner(req, sucursalSolicitada) {

    if (!req.usuario) {
        return null;
    }


    // ======================================================
    // GERENTE
    // Siempre trabaja con la sucursal asignada en su cuenta
    // ======================================================

    if (req.usuario.rol === 'gerente') {

        const sucursalUsuario =
            Number(req.usuario.sucursal_id);


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
    // Puede trabajar con la sucursal seleccionada
    // ======================================================

    if (req.usuario.rol === 'admin') {

        const sucursalId =
            Number(sucursalSolicitada);


        if (
            !Number.isInteger(sucursalId) ||
            sucursalId <= 0
        ) {

            return null;

        }


        return sucursalId;

    }


    return null;

}


const menuSemanaController = {

    // ==========================================================================
    // OBTENER GRILLA DEL MENÚ
    // ==========================================================================

    obtenerMenu: async (req, res) => {

        try {

            const {
                seccionId,
                sucursalId
            } = req.query;


            // ======================================================
            // VALIDAR SEMANA
            // ======================================================

            const semanaId =
                Number(seccionId);


            if (
                !Number.isInteger(semanaId) ||
                semanaId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'La semana indicada no es válida.'

                });

            }


            // ======================================================
            // SUCURSAL AUTORIZADA
            // ======================================================

            const sucursalAutorizada =
                obtenerSucursalPlanner(
                    req,
                    sucursalId
                );


            if (!sucursalAutorizada) {

                return res.status(403).json({

                    success: false,

                    message:
                        'No tienes una sucursal autorizada para consultar este menú.'

                });

            }


            // ======================================================
            // CONSULTAR
            // ======================================================

            const menu =
                await menuSemanaModel
                    .obtenerMenuSemanaPorSucursal(
                        semanaId,
                        sucursalAutorizada
                    );


            return res.json({

                success: true,

                sucursal_id:
                    sucursalAutorizada,

                data:
                    menu

            });


        } catch (error) {

            console.error(
                'Error al obtener el menú:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Error interno del servidor al consultar el menú.'

            });

        }

    },


    obtenerMenuPublicado: async (req, res) => {

        try {

            // ==========================================
            // SUCURSAL OPCIONAL
            // ==========================================

            const sucursalId =
                req.query.sucursal
                    ? Number(req.query.sucursal)
                    : null;


            if (
                sucursalId !== null &&
                (
                    !Number.isInteger(sucursalId) ||
                    sucursalId <= 0
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "La sucursal indicada no es válida."

                });

            }


            // ==========================================
            // OBTENER MENÚ PUBLICADO
            // ==========================================

            const resultado =
                await menuSemanaModel.obtenerMenuPublicado(
                    sucursalId
                );


            return res.json({

                success: true,

                sucursal:
                    resultado.sucursal,

                data:
                    resultado.menu

            });


        } catch (error) {

            console.error(
                "Error obteniendo menú publicado:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "No fue posible obtener el menú publicado."

            });

        }

    },




    // ==========================================================================
    // GUARDAR MENÚ SEMANAL
    // ==========================================================================

    guardarMenuMasivo: async (req, res) => {

        try {

            const {
                semana_id,
                sucursal_id,
                dias
            } = req.body;


            // ======================================================
            // VALIDAR SEMANA
            // ======================================================

            const semanaId =
                Number(semana_id);


            if (
                !Number.isInteger(semanaId) ||
                semanaId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'La semana indicada no es válida.'

                });

            }


            // ======================================================
            // VALIDAR DÍAS
            // ======================================================

            if (
                !Array.isArray(dias) ||
                dias.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'No se recibieron días válidos para guardar.'

                });

            }


            // ======================================================
            // SUCURSAL AUTORIZADA
            // ======================================================

            const sucursalAutorizada =
                obtenerSucursalPlanner(
                    req,
                    sucursal_id
                );


            if (!sucursalAutorizada) {

                return res.status(403).json({

                    success: false,

                    message:
                        'No tienes una sucursal autorizada para guardar este menú.'

                });

            }


            // ======================================================
            // GUARDAR DÍAS
            // ======================================================

            let errores = 0;


            for (const dia of dias) {

                const exito =
                    await menuSemanaModel
                        .guardarDiaSucursal({

                            semana_id:
                                semanaId,

                            // MUY IMPORTANTE:
                            // jamás usamos directamente
                            // req.body.sucursal_id
                            sucursal_id:
                                sucursalAutorizada,

                            dia_semana:
                                dia.dia_semana,

                            fecha_especifica:
                                dia.fecha_especifica,

                            estado_dia:
                                dia.estado_dia ||
                                'ACTIVO',

                            disponible_web:
                                dia.disponible_web !== undefined
                                    ? dia.disponible_web
                                    : 1,

                            plato_catalogo_id:
                                dia.plato_catalogo_id ||
                                null,

                            precio_real:
                                dia.precio_real !== null &&
                                dia.precio_real !== undefined &&
                                dia.precio_real !== ''
                                    ? Number(
                                        dia.precio_real
                                    )
                                    : null,

                            acompanamientos_especificos:
                                dia.acompanamientos_especificos ||
                                null,

                            texto_alternativo:
                                dia.texto_alternativo ||
                                null,

                            plantilla_id:
                                dia.plantilla_id
                                    ? Number(
                                        dia.plantilla_id
                                    )
                                    : null

                        });


                if (!exito) {

                    errores++;

                }

            }


            // ======================================================
            // RESULTADO
            // ======================================================

            if (errores > 0) {

                return res.status(207).json({

                    success: false,

                    message:
                        `El menú se procesó con errores. ${errores} días no pudieron guardarse.`

                });

            }


            return res.json({

                success: true,

                message:
                    'Menú de la semana guardado correctamente.',

                sucursal_id:
                    sucursalAutorizada

            });


        } catch (error) {

            console.error(
                'Error al guardar el menú masivo:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Error crítico al intentar guardar el menú.'

            });

        }

    },


    // ======================================================
    // Crear una nueva semana de planificación
    // ======================================================

    crearNuevaSemana: async (req, res) => {

        try {

            const { fecha_inicio } = req.body;

            if (!fecha_inicio) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Debes seleccionar una semana."
                });
            }

            const semana =
                await menuSemanaModel.crearNuevaSemana(
                    fecha_inicio
                );

            return res.json({
                success: true,
                data: semana
            });

        } catch (error) {

            console.error(
                "Error al crear la semana:",
                error
            );

            if (error.message === "SEMANA_YA_EXISTE") {
                return res.status(409).json({
                    success: false,
                    message:
                        "Esta semana ya está planificada."
                });
            }

            if (error.message === "FECHA_NO_ES_LUNES") {
                return res.status(400).json({
                    success: false,
                    message:
                        "La planificación debe comenzar un lunes."
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "No fue posible crear la semana."
            });

        }

    },

    
    // ======================================================
    // Obtener calendario de semanas disponibles
    // ======================================================

    obtenerSemanasDisponibles: async (req, res) => {

        try {

            const meses =
                Number(req.query.meses) || 3;

            const semanas =
                await menuSemanaModel
                    .obtenerSemanasDisponibles(meses);

            return res.json({

                success: true,

                data: semanas

            });

        } catch (error) {

            console.error(
                "Error al obtener semanas disponibles:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "No fue posible obtener el calendario de planificación."

            });

        }

    },



    obtenerSucursalesPlanificadas: async (req, res) => {

        try {

            const semanaId =
                Number(req.params.id);

            if (!semanaId) {

                return res.status(400).json({
                    success: false,
                    message: "Semana inválida."
                });

            }

            const sucursales =
                await menuSemanaModel
                    .obtenerSucursalesPlanificadas(
                        semanaId
                    );

            return res.json({
                success: true,
                data: sucursales
            });

        } catch (error) {

            console.error(
                "Error obteniendo sucursales planificadas:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "No fue posible consultar las sucursales de la semana."
            });

        }

    },



    // ==========================================================================
    // GENERADOR DE TEXTO PARA WHATSAPP
    // Protegido por sucursal según el usuario autenticado
    // ==========================================================================

    generarTextoWhatsApp: async (req, res) => {

        try {

            const {
                semanaId,
                sucursalId
            } = req.query;


            // ======================================================
            // VALIDAR SEMANA
            // ======================================================

            const semanaIdFinal =
                Number(semanaId);


            if (
                !Number.isInteger(semanaIdFinal) ||
                semanaIdFinal <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'La semana indicada no es válida.'

                });

            }


            // ======================================================
            // OBTENER SUCURSAL AUTORIZADA
            // ======================================================

            const sucursalAutorizada =
                obtenerSucursalPlanner(
                    req,
                    sucursalId
                );


            if (!sucursalAutorizada) {

                return res.status(403).json({

                    success: false,

                    message:
                        'No tienes una sucursal autorizada para generar este texto.'

                });

            }


            // ======================================================
            // OBTENER MENÚ DE LA SUCURSAL AUTORIZADA
            // ======================================================

            const infoMenu =
                await menuSemanaModel
                    .obtenerMenuSemanaPorSucursal(
                        semanaIdFinal,
                        sucursalAutorizada
                    );


            const diccionario =
                await menuSemanaModel
                    .obtenerDiccionarioEmojis();


            if (
                !Array.isArray(infoMenu) ||
                infoMenu.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        'No hay menús registrados para esta semana en la sucursal autorizada.'

                });

            }


            // ======================================================
            // CONSTRUIR TEXTO
            // ======================================================

            let textoMensaje =
                `Restaurante Conception Coffee!!! Menú Ejecutivo!!!\n\n`;


            infoMenu.forEach(dia => {

                const diaMayuscula =
                    String(
                        dia.dia_semana || ''
                    ).toUpperCase();


                if (
                    dia.estado_dia === 'CERRADO' ||
                    dia.estado_dia === 'FERIADO'
                ) {

                    textoMensaje +=
                        `${diaMayuscula}: ${
                            dia.texto_alternativo ||
                            'Cerrado por descanso.'
                        }\n`;

                    return;

                }


                const nombrePlato =
                    dia.plato_base_nombre || 'Menú del día';


                const acompanamientos =
                    dia.acompanamientos || '';


                const lineaPlato =
                    `${nombrePlato}, ${acompanamientos}`;


                let emojisDetectados = '';


                diccionario.forEach(item => {

                    const regex =
                        new RegExp(
                            `\\b${item.palabra_clave}\\b`,
                            'i'
                        );


                    if (
                        regex.test(lineaPlato)
                    ) {

                        emojisDetectados +=
                            ` ${item.emoji}`;

                    }

                });


                textoMensaje +=
                    `${diaMayuscula}: ${nombrePlato}${emojisDetectados}`;


                if (acompanamientos) {

                    textoMensaje +=
                        ` - ${acompanamientos}`;

                }


                textoMensaje += '\n';

            });


            textoMensaje +=
                `\n(todos nuestros platillos incluyen refresco, tortillas y fruta de temporada)`;


            // ======================================================
            // RESPUESTA
            // ======================================================

            return res.json({

                success: true,

                sucursal_id:
                    sucursalAutorizada,

                textoWhatsApp:
                    textoMensaje

            });


        } catch (error) {

            console.error(
                'Error al generar el texto de WhatsApp:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Error interno al generar el texto de WhatsApp.'

            });

        }

    },

    // [NUEVO] 4. Obtener el historial de semanas registradas
    obtenerHistorial: async (req, res) => {
        try {
            const historial = await menuSemanaModel.obtenerHistorialSemanas();
            return res.json({ success: true, data: historial });
        } catch (error) {
            console.error('Error al obtener historial:', error);
            return res.status(500).json({ success: false, message: 'Error al cargar el historial de semanas.' });
        }
    },

    // [NUEVO] 5. Obtener las métricas del dashboard superior
    obtenerMetricas: async (req, res) => {
        try {
            const metricas = await menuSemanaModel.obtenerMetricasContadores();
            return res.json({ success: true, data: metricas });
        } catch (error) {
            console.error('Error al obtener métricas:', error);
            return res.status(500).json({ success: false, message: 'Error al obtener los contadores del panel.' });
        }
    },

    // 6. Obtener el catálogo maestro de platillos
    obtenerCatalogo: async (req, res) => {
        try {

            const catalogo = await menuSemanaModel.obtenerCatalogoPlatos();

            return res.json({
                success: true,
                data: catalogo
            });

        } catch (error) {

            console.error('Error al obtener catálogo:', error);

            return res.status(500).json({
                success: false,
                message: 'Error al obtener el catálogo de platillos.'
            });

        }
    },


    // 7. Crear un nuevo platillo del catálogo maestro
    crearPlatillo: async (req, res) => {

        try {

            const {
                nombre,
                precio,
                acompanamientos
            } = req.body;

            const imagen = req.file
                ? `/images/uploads/${req.file.filename}`
                : null;

            if (!nombre) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre del platillo es obligatorio."
                });
            }

            const nuevoId = await menuSemanaModel.crearPlatillo({

                nombre,
                precio,
                acompanamientos,
                imagen

            });

            return res.json({

                success: true,
                message: "Platillo creado correctamente.",
                id: nuevoId

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Error interno del servidor."

            });

        }

    },



    // 8. Actualizar un platillo del catálogo maestro
    actualizarPlatillo: async (req, res) => {

        try {

            const { id } = req.params;

            const {
                nombre,
                precio,
                acompanamientos
            } = req.body;

            const imagen = req.file
                ? `/images/uploads/${req.file.filename}`
                : null;

            if (!nombre) {

                return res.status(400).json({

                    success: false,
                    message: "El nombre del platillo es obligatorio."

                });

            }

            await menuSemanaModel.actualizarPlatillo(id, {

                nombre,
                precio,
                acompanamientos,
                imagen

            });

            return res.json({

                success: true,
                message: "Platillo actualizado correctamente."

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Error interno del servidor."

            });

        }

    },

    desactivarPlatillo: async (req, res) => {

        try {

            const { id } = req.params;

            const actualizado =
                await menuSemanaModel.desactivarPlatillo(id);

            if (!actualizado) {

                return res.status(404).json({

                    success: false,

                    message: "Platillo no encontrado."

                });

            }

            return res.json({

                success: true,

                message: "Platillo desactivado correctamente."

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Error interno del servidor."

            });

        }

    },


    obtenerPlatillosInactivos: async (req, res) => {

        try {

            const data =
                await menuSemanaModel.obtenerPlatillosInactivos();

            return res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Error interno del servidor."

            });

        }

    },


    reactivarPlatillo: async (req, res) => {

        try {

            const { id } = req.params;

            const actualizado =
                await menuSemanaModel.reactivarPlatillo(id);

            if (!actualizado) {

                return res.status(404).json({

                    success: false,

                    message: "Platillo no encontrado."

                });

            }

            return res.json({

                success: true,

                message: "Platillo reactivado correctamente."

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Error interno del servidor."

            });

        }

    },


    obtenerDiccionarioEmojis: async (req, res) => {

        try {

            const data =
                await menuSemanaModel.obtenerDiccionarioEmojis();

            return res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Error interno del servidor."

            });

        }

    },

    buscarEmojiPorPalabra: async (req,res)=>{

        try{

            const { palabra } = req.params;

            const emoji =
                await menuSemanaModel
                .buscarEmojiPorPalabra(palabra);

            return res.json({

                success:true,

                data:emoji

            });

        }catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:"Error interno."

            });

        }

    },


    async crearEmoji(req, res) {

        try {

            const { palabra_clave, emoji } = req.body;

            if (!palabra_clave || !emoji) {

                return res.status(400).json({
                    success: false,
                    message: "Palabra y emoji son obligatorios."
                });

            }

            const id = await menuSemanaModel.crearEmoji(
                palabra_clave,
                emoji
            );

            res.json({
                success: true,
                id
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    },



    publicarSemana: async (req, res) => {

        try {

            const { semanaId } = req.body;

            if (!semanaId) {

                return res.status(400).json({

                    success: false,

                    message: "No se recibió la semana a publicar."

                });

            }

            const publicada = await menuSemanaModel.publicarSemana(semanaId);

            return res.json({

                success: publicada,

                message: publicada
                    ? "Semana publicada correctamente."
                    : "No fue posible publicar la semana."

            });

        } catch (error) {

            console.error("Error al publicar semana:", error);

            return res.status(500).json({

                success: false,

                message: "Error interno del servidor."

            });

        }

    },


    // ======================================================
    // Eliminar semana futura
    // ======================================================

    eliminarSemana: async (req, res) => {

        try {

            const semanaId = Number(req.params.id);

            if (!Number.isInteger(semanaId) || semanaId <= 0) {

                return res.status(400).json({
                    success: false,
                    message: "Identificador de semana inválido."
                });

            }

            const resultado =
                await menuSemanaModel.eliminarSemana(semanaId);

            if (!resultado.success) {

                if (resultado.reason === "NO_EXISTE") {

                    return res.status(404).json({
                        success: false,
                        message: "La semana no existe."
                    });

                }

                if (resultado.reason === "SEMANA_PROTEGIDA") {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Esta semana ya fue publicada y forma parte del historial. No puede eliminarse."
                    });

                }

            }

            return res.json({

                success: true,

                message:
                    `Semana ${resultado.semana.numero_semana} eliminada correctamente.`

            });

        } catch (error) {

            console.error(
                "Error al eliminar semana:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "No fue posible eliminar la semana."

            });

        }

    },



    // ======================================================
    // GUARNICIONES - Obtener catálogo
    // ======================================================

    obtenerGuarniciones: async (req, res) => {

        try {

            const guarniciones =
                await menuSemanaModel.obtenerGuarniciones();

            return res.json({
                success: true,
                data: guarniciones
            });

        } catch (error) {

            console.error(
                "Error obteniendo guarniciones:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "No fue posible obtener las guarniciones."
            });

        }

    },


    // ======================================================
    // GUARNICIONES - Crear
    // ======================================================

    crearGuarnicion: async (req, res) => {

        try {

            const nombre =
                String(req.body.nombre || "").trim();

            if (!nombre) {

                return res.status(400).json({
                    success: false,
                    message:
                        "El nombre de la guarnición es obligatorio."
                });

            }

            const guarnicion =
                await menuSemanaModel.crearGuarnicion(
                    nombre
                );

            return res.status(201).json({
                success: true,
                data: guarnicion
            });

        } catch (error) {

            // UNIQUE(nombre)
            if (error.code === "ER_DUP_ENTRY") {

                return res.status(409).json({
                    success: false,
                    message:
                        "Esta guarnición ya existe."
                });

            }

            console.error(
                "Error creando guarnición:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "No fue posible crear la guarnición."
            });

        }

    },


    // ======================================================   
    // PLANTILLAS PROMOCIONALES
    // ======================================================

    obtenerPlantillas: async (req, res) => {

        try {

            const data =
                await menuSemanaModel
                    .obtenerPlantillasActivas();


            return res.json({
                success: true,
                data
            });


        } catch (error) {

            console.error(
                "Error obteniendo plantillas activas:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    "No fue posible obtener las plantillas."
            });

        }

    },


    obtenerTodasPlantillas: async (req, res) => {

        try {

            const data =
                await menuSemanaModel
                    .obtenerTodasPlantillas();


            return res.json({
                success: true,
                data
            });


        } catch (error) {

            console.error(
                "Error obteniendo administrador de plantillas:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    "No fue posible obtener las plantillas."
            });

        }

    },



    actualizarConfiguracionPlantilla: async (req, res) => {

        try {

            const plantillaId =
                Number(req.params.id);

            const {
                configuracion,
                activa
            } = req.body;


            if (!plantillaId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "La plantilla indicada no es válida."
                });

            }


            if (
                !configuracion ||
                typeof configuracion !== "object" ||
                Array.isArray(configuracion)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "La configuración de la plantilla no es válida."
                });

            }


            const actualizado =
                await menuSemanaModel
                    .actualizarConfiguracionPlantilla(
                        plantillaId,
                        configuracion,
                        Boolean(activa)
                    );


            if (!actualizado) {

                return res.status(404).json({
                    success: false,
                    message:
                        "No se encontró la plantilla."
                });

            }


            return res.json({
                success: true,
                message:
                    "Configuración actualizada correctamente."
            });


        } catch (error) {

            console.error(
                "Error actualizando plantilla:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "No fue posible actualizar la plantilla."
            });

        }

    },


    


};

module.exports = menuSemanaController;