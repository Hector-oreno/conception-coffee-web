const pool = require('../config/db'); // Tu conexión a la base de datos
const sucursalModel = require('./sucursalModel');


const DIAS_SEMANA = [

    "Lunes",

    "Martes",

    "Miércoles",

    "Jueves",

    "Viernes",

    "Sábado",

    "Domingo"

];


const menuSemanaModel = {
    
    // 1. Obtener el Diccionario de Emojis para el generador de WhatsApp
    obtenerDiccionarioEmojis: async () => {
        const query = `SELECT palabra_clave, emoji FROM menu_emoji_diccionario`;
        const [rows] = await pool.query(query);
        return rows;
    },

    // 2. Obtener los platos del Catálogo Maestro para el buscador predictivo del Admin
    obtenerCatalogoPlatos: async () => {

        const query = `
            SELECT
                id,
                nombre_plato,
                precio_base,
                acompanamientos_defecto,
                imagen_defecto,
                estado
            FROM menu_ejecutivo_catalogo
            WHERE estado = 'ACTIVO'
            ORDER BY nombre_plato ASC
        `;

        const [rows] = await pool.query(query);

        return rows;

    },


    crearPlatillo: async (datos) => {

        const {
            nombre,
            precio,
            acompanamientos,
            imagen
        } = datos;

        const query = `
            INSERT INTO menu_ejecutivo_catalogo
            (
                nombre_plato,
                precio_base,
                acompanamientos_defecto,
                imagen_defecto
            )
            VALUES (?, ?, ?, ?)
    `   ;

        const [resultado] = await pool.query(query, [

            nombre,
            precio,
            acompanamientos,
            imagen

        ]);

        return resultado.insertId;

    },


 

    // 4. Obtener la grilla completa de Lunes a Domingo para una Sucursal y Semana específica
    obtenerMenuSemanaPorSucursal: async (semanaId, sucursalId) => {
        const query = `
            SELECT

                ms.id AS menu_sucursal_id,

                ms.semana_id,
                
                ms.sucursal_id,

                ms.dia_semana,

                ms.fecha_especifica,

                ms.estado_dia,

                ms.disponible_web,

                ms.precio_real,

                ms.texto_alternativo,

                ms.plato_catalogo_id,

                ms.plantilla_id,

                p.nombre AS plantilla_nombre,

                p.slug AS plantilla_slug,

                p.configuracion AS plantilla_configuracion,

                p.activa AS plantilla_activa,

                m.numero_semana,

                m.fecha_inicio,

                m.fecha_fin,

                m.estado,

                c.nombre_plato AS plato_base_nombre,

                COALESCE(
                    ms.acompanamientos_especificos,
                    c.acompanamientos_defecto
                ) AS acompanamientos,

                COALESCE(
                    c.imagen_defecto,
                    '/images/uploads/Logo_carta.png'
                ) AS imagen

            FROM menu_ejecutivo_sucursal ms

            INNER JOIN menu_semana_maestro m
            ON ms.semana_id = m.id

            LEFT JOIN menu_ejecutivo_catalogo c
            ON ms.plato_catalogo_id = c.id

            LEFT JOIN planner_plantillas p
            ON ms.plantilla_id = p.id

            WHERE

                ms.semana_id = ?

            AND

                ms.sucursal_id = ?

            ORDER BY FIELD(

                ms.dia_semana,

                'Lunes',

                'Martes',

                'Miércoles',

                'Jueves',

                'Viernes',

                'Sábado',

                'Domingo'

            )
        `;
        
        const [rows] = await pool.query(query, [semanaId, sucursalId]);

        // Si ya existe planificación simplemente la devolvemos
        if (rows.length > 0) {

            return rows;

        }

        console.log("No existe planificación. Se generará automáticamente...");

        // Obtener la información de la semana
        const [semana] = await pool.query(

            `
            SELECT fecha_inicio
            FROM menu_semana_maestro
            WHERE id = ?
            `,
            [semanaId]

        );

        if (semana.length === 0) {

            return [];

        }

        const fecha = new Date(semana[0].fecha_inicio);

        // Crear automáticamente los 7 días
        for (let i = 0; i < DIAS_SEMANA.length; i++) {

            const fechaActual = new Date(fecha);

            fechaActual.setDate(fecha.getDate() + i);

            await pool.query(

                `
                INSERT INTO menu_ejecutivo_sucursal
                (
                    semana_id,
                    sucursal_id,
                    dia_semana,
                    fecha_especifica,
                    estado_dia,
                    disponible_web
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    'ACTIVO',
                    1
                )
                `,
                [

                    semanaId,

                    sucursalId,

                    [
                        "Domingo",
                        "Lunes",
                        "Martes",
                        "Miércoles",
                        "Jueves",
                        "Viernes",
                        "Sábado"
                    ][fechaActual.getDay()],
                    
                    fechaActual.toISOString().substring(0,10)

                ]

            );

            
            
        }


        // Consultar nuevamente la planificación recién creada
            const [nuevaGrilla] = await pool.query(
                query,
                [semanaId, sucursalId]
            );

            return nuevaGrilla;

        
    },


    

    // ======================================================
    // 5. Guardar o Actualizar un día específico
    //    Upsert Operativo
    // ======================================================

    guardarDiaSucursal: async (datos) => {

        const {
            semana_id,
            sucursal_id,
            dia_semana,
            fecha_especifica,
            estado_dia,
            disponible_web,
            plato_catalogo_id,
            precio_real,
            acompanamientos_especificos,
            texto_alternativo,
            plantilla_id
        } = datos;


        const query = `

            INSERT INTO menu_ejecutivo_sucursal
            (
                semana_id,
                sucursal_id,
                dia_semana,
                fecha_especifica,
                estado_dia,
                disponible_web,
                plato_catalogo_id,
                precio_real,
                acompanamientos_especificos,
                texto_alternativo,
                plantilla_id
            )

            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )

            ON DUPLICATE KEY UPDATE

                estado_dia =
                    VALUES(estado_dia),

                disponible_web =
                    VALUES(disponible_web),

                plato_catalogo_id =
                    VALUES(plato_catalogo_id),

                precio_real =
                    VALUES(precio_real),

                acompanamientos_especificos =
                    VALUES(acompanamientos_especificos),

                texto_alternativo =
                    VALUES(texto_alternativo),

                plantilla_id =
                    VALUES(plantilla_id)

        `;


        const [resultado] =
            await pool.query(
                query,
                [
                    semana_id,
                    sucursal_id,
                    dia_semana,
                    fecha_especifica,
                    estado_dia,
                    disponible_web,
                    plato_catalogo_id,
                    precio_real,
                    acompanamientos_especificos,
                    texto_alternativo,
                    plantilla_id
                ]
            );


        return resultado.affectedRows > 0;

    },

    // 6. Obtener la última semana registrada para calcular la siguiente línea de tiempo
    obtenerUltimaSemanaRegistrada: async () => {
        const query = `
            SELECT numero_semana, fecha_fin 
            FROM menu_semana_maestro 
            ORDER BY fecha_fin DESC LIMIT 1
        `;
        const [rows] = await pool.query(query);
        return rows.length > 0 ? rows[0] : null;
    },


    // 7. Obtener la semana actualmente publicada
    obtenerSemanaPublicada: async () => {

        const query = `
            SELECT
                id,
                numero_semana
            FROM menu_semana_maestro
            WHERE estado = 'PUBLICADO'
            ORDER BY fecha_inicio DESC
            LIMIT 1
        `;

        const [rows] = await pool.query(query);

        return rows.length > 0
            ? rows[0]
            : null;

    },


    // ======================================================
    // Obtener menú PUBLICADO para el sitio web
    //
    // Sin sucursalId:
    // → usa la sucursal principal.
    //
    // Con sucursalId:
    // → usa la sucursal seleccionada.
    // =====================================================

    obtenerMenuPublicado: async (
        sucursalId = null
    ) => {

        // ==========================================
        // SEMANA PUBLICADA ACTUAL
        // ==========================================

        const semana =
            await menuSemanaModel.obtenerSemanaActual();


        if (!semana) {

            return {
                sucursal: null,
                menu: []
            };

        }


        // ==========================================
        // RESOLVER SUCURSAL
        // ==========================================

        let sucursal;


        if (sucursalId) {

            sucursal =
                await sucursalModel
                    .obtenerSucursalActivaPorId(
                        sucursalId
                    );

        } else {

            sucursal =
                await sucursalModel
                    .obtenerSucursalPrincipal();

        }


        if (!sucursal) {

            return {
                sucursal: null,
                menu: []
            };

        }


        // ==========================================
        // OBTENER MENÚ DE ESA SUCURSAL
        // ==========================================

        const menu =
            await menuSemanaModel
                .obtenerMenuSemanaPorSucursal(
                    semana.id,
                    sucursal.id
                );


        const hayMenu =
            menu.some(
                dia =>
                    dia.plato_catalogo_id !== null
            );


        if (!hayMenu) {

            return {
                sucursal,
                menu: []
            };

        }


        return {
            sucursal,
            menu
        };

    },


    // ======================================================
    // Obtener la semana PUBLICADA correspondiente al día actual    
    // ======================================================

    obtenerSemanaActual: async () => {

        const query = `
            SELECT
                id,
                numero_semana,
                fecha_inicio,
                fecha_fin,
                estado
            FROM menu_semana_maestro
            WHERE estado = 'PUBLICADA'
            AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
            ORDER BY fecha_inicio DESC
            LIMIT 1
        `;

        const [rows] = await pool.query(query);

        return rows.length > 0
            ? rows[0]
            : null;

    },



    // ======================================================
    // Crear una semana seleccionada desde el calendario
    // Regla: fecha_inicio debe ser LUNES
    // ======================================================

    crearNuevaSemana: async (fechaInicioSolicitada) => {

        if (!fechaInicioSolicitada) {
            throw new Error("FECHA_INICIO_REQUERIDA");
        }

        // ------------------------------------------
        // Construir fecha LOCAL sin usar UTC
        // ------------------------------------------

        const partes = String(fechaInicioSolicitada)
            .substring(0, 10)
            .split("-")
            .map(Number);

        if (
            partes.length !== 3 ||
            partes.some(valor => !Number.isInteger(valor))
        ) {
            throw new Error("FECHA_INVALIDA");
        }

        const fechaInicio = new Date(
            partes[0],
            partes[1] - 1,
            partes[2]
        );

        // 1 = lunes
        if (fechaInicio.getDay() !== 1) {
            throw new Error("FECHA_NO_ES_LUNES");
        }

        const fechaFin = new Date(fechaInicio);

        fechaFin.setDate(
            fechaInicio.getDate() + 6
        );

        const formatoFecha = fecha =>
            fecha.getFullYear() +
            "-" +
            String(fecha.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(fecha.getDate()).padStart(2, "0");

        const inicio = formatoFecha(fechaInicio);
        const fin = formatoFecha(fechaFin);

        // ------------------------------------------
        // Validar que ese rango no exista
        // ------------------------------------------

        const [existente] = await pool.query(
            `
            SELECT id
            FROM menu_semana_maestro
            WHERE fecha_inicio = ?
            AND fecha_fin = ?
            LIMIT 1
            `,
            [inicio, fin]
        );

        if (existente.length > 0) {
            throw new Error("SEMANA_YA_EXISTE");
        }

        // ------------------------------------------
        // Calcular siguiente número amigable
        // ------------------------------------------

        const calcularNumeroSemanaISO = (fecha) => {

            const fechaUTC = new Date(
                Date.UTC(
                    fecha.getFullYear(),
                    fecha.getMonth(),
                    fecha.getDate()
                )      
            );

            // ISO: jueves determina el año/semana
            const dia =
                fechaUTC.getUTCDay() || 7;

            fechaUTC.setUTCDate(
                fechaUTC.getUTCDate() + 4 - dia
            );

            const inicioAnio =
                new Date(
                    Date.UTC(
                        fechaUTC.getUTCFullYear(),
                        0,
                        1
                    )
                );

            return Math.ceil(
                (
                    (
                        fechaUTC - inicioAnio
                    ) / 86400000 + 1
                ) / 7
            );

        };


        const numeroSemana =
            calcularNumeroSemanaISO(fechaInicio);


        // ------------------------------------------
        // Insertar
        // ------------------------------------------

        const [resultado] = await pool.query(
            `
            INSERT INTO menu_semana_maestro
            (
                numero_semana,
                fecha_inicio,
                fecha_fin,
                estado
            )
            VALUES (?, ?, ?, 'BORRADOR')
            `,
            [
                numeroSemana,
                inicio,
                fin
            ]
        );

        return {
            id: resultado.insertId,
            numero_semana: numeroSemana,
            fecha_inicio: inicio,
            fecha_fin: fin,
            estado: "BORRADOR"
        };

    },

    // ======================================================
    // Obtener semanas disponibles para planificación
    // Genera lunes-domingo para los próximos meses
    // e indica cuáles ya existen en la BD.
    // ======================================================

    obtenerSemanasDisponibles: async (meses = 3) => {

        const mesesPermitidos = Math.min(
            Math.max(Number(meses) || 3, 1),
            12
        );

        // Traemos las semanas ya creadas dentro del período.
        const [existentes] = await pool.query(`
            SELECT
                id,
                numero_semana,
                fecha_inicio,
                fecha_fin,
                estado
            FROM menu_semana_maestro
            WHERE fecha_inicio >= CURDATE()
            AND fecha_inicio <= DATE_ADD(CURDATE(), INTERVAL ? MONTH)
            ORDER BY fecha_inicio ASC
        `, [mesesPermitidos]);

        const mapaExistentes = new Map();

        existentes.forEach(semana => {

            const fecha = new Date(
                semana.fecha_inicio
            );

            const fechaInicio =
                fecha.getFullYear() +
                "-" +
                String(
                    fecha.getMonth() + 1
                ).padStart(2, "0") +
                "-" +
                String(
                    fecha.getDate()
                ).padStart(2, "0");

            mapaExistentes.set(
                fechaInicio,
                semana
            );

        });

        // ==========================================
        // Encontrar el lunes de la semana actual
        // ==========================================

        const hoy = new Date();

        const dia = hoy.getDay();

        const diferencia =
            dia === 0
                ? -6
                : 1 - dia;

        const primerLunes = new Date(hoy);

        primerLunes.setDate(
            hoy.getDate() + diferencia
        );

        primerLunes.setHours(0, 0, 0, 0);

        // Fecha límite
        const limite = new Date(primerLunes);

        limite.setMonth(
            limite.getMonth() + mesesPermitidos
        );

        const formatoFecha = fecha =>
            fecha.getFullYear() +
            "-" +
            String(fecha.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(fecha.getDate()).padStart(2, "0");

        const semanas = [];

        let cursor = new Date(primerLunes);

        while (cursor <= limite) {

            const inicio = new Date(cursor);

            const fin = new Date(inicio);

            fin.setDate(
                inicio.getDate() + 6
            );

            const inicioTexto =
                formatoFecha(inicio);

            const finTexto =
                formatoFecha(fin);

            const existente =
                mapaExistentes.get(inicioTexto);

            semanas.push({

                fecha_inicio: inicioTexto,

                fecha_fin: finTexto,

                disponible: !existente,

                semana_id:
                    existente?.id ?? null,

                numero_semana:
                    existente?.numero_semana ?? null,

                estado:
                    existente?.estado ?? null

            });

            cursor.setDate(
                cursor.getDate() + 7
            );

        }

        return semanas;

    },


    // ======================================================
    // Obtener sucursales que ya tienen planificación
    // para una semana determinada
    // ======================================================

    obtenerSucursalesPlanificadas: async (semanaId) => {

        const [rows] = await pool.query(
            `
            SELECT DISTINCT
                sucursal_id
            FROM menu_ejecutivo_sucursal
            WHERE semana_id = ?
            ORDER BY sucursal_id ASC
            `,
            [semanaId]
        );

        return rows.map(
            row => Number(row.sucursal_id)
        );

    },


    publicarSemana: async (semanaId) => {

        const [resultado] = await pool.query(

            `
            UPDATE menu_semana_maestro
            SET estado = 'PUBLICADA'
            WHERE id = ?
            `,
            [semanaId]

        );

        return resultado.affectedRows > 0;

    },
       

    // [NUEVO] 7. Obtener el historial completo de semanas registradas para la tabla inicial
    obtenerHistorialSemanas: async () => {
        const query = `
            SELECT id, numero_semana, fecha_inicio, fecha_fin, estado, creado_en 
            FROM menu_semana_maestro 
            ORDER BY fecha_inicio DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    },

    // [NUEVO] 8. Obtener contadores para los KPIs superiores
    obtenerMetricasContadores: async () => {
        const queryPlatillos = `SELECT COUNT(*) AS total FROM menu_ejecutivo_catalogo`;
        const queryEmojis = `SELECT COUNT(*) AS total FROM menu_emoji_diccionario`;
        
        const [[resPlatillos], [resEmojis]] = await Promise.all([
            pool.query(queryPlatillos),
            pool.query(queryEmojis)
        ]);

        return {
            totalPlatillos: resPlatillos[0].total,
            totalEmojis: resEmojis[0].total
        };
    },


    actualizarPlatillo: async (id, datos) => {

        const {
            nombre,
            precio,
            acompanamientos,
            imagen
        } = datos;

        const query = `
            UPDATE menu_ejecutivo_catalogo
            SET
                nombre_plato = ?,
                precio_base = ?,
                acompanamientos_defecto = ?,
                imagen_defecto = ?
            WHERE id = ?
        `;

        await pool.query(query, [

            nombre,
            precio,
            acompanamientos,
            imagen,
            id

        ]);

    },


    desactivarPlatillo: async (id) => {

        const query = `
            UPDATE menu_ejecutivo_catalogo
            SET estado = 'INACTIVO'
            WHERE id = ?
        `;

        const [resultado] = await pool.query(query, [id]);

        return resultado.affectedRows > 0;

    },


    obtenerPlatillosInactivos: async () => {

        const query = `
            SELECT
                id,
                nombre_plato,
                precio_base,
                acompanamientos_defecto,
                imagen_defecto,
                estado
            FROM menu_ejecutivo_catalogo
            WHERE estado = 'INACTIVO'
            ORDER BY nombre_plato ASC
        `;

        const [rows] = await pool.query(query);

        return rows;

    },


    reactivarPlatillo: async (id) => {

        const query = `
            UPDATE menu_ejecutivo_catalogo
            SET estado = 'ACTIVO'
            WHERE id = ?
        `;

        const [resultado] = await pool.query(query, [id]);

        return resultado.affectedRows > 0;

    },



    obtenerDiccionarioEmojis: async () => {

        const query = `
            SELECT
                id,
                palabra_clave,
                emoji,
                estado
            FROM menu_emoji_diccionario
            WHERE estado = 'ACTIVO'
            ORDER BY palabra_clave ASC
        `;

        const [rows] = await pool.query(query);

        return rows;

    },


    buscarEmojiPorPalabra: async (palabra) => {

        const query = `
            SELECT
                id,
                palabra_clave,
                emoji
            FROM menu_emoji_diccionario
            WHERE palabra_clave = ?
            AND estado='ACTIVO'
            LIMIT 1
        `;

        const [rows] =
            await pool.query(query,[palabra]);

        return rows[0] || null;

    },

    async crearEmoji(palabra, emoji) {

        const sql = `
            INSERT INTO menu_emoji_diccionario
            (
                palabra_clave,
                emoji,
                estado
            )
            VALUES
            (
                ?, ?, 'ACTIVO'
            )
        `;

        const [result] = await pool.execute(sql, [
            palabra.toLowerCase(),
            emoji
        ]);

        return result.insertId;

    },


    // ======================================================
    // GUARNICIONES - Obtener catálogo activo
    // ======================================================

    obtenerGuarniciones: async () => {

        const [rows] = await pool.query(`
            SELECT
                id,
                nombre,
                activa
            FROM menu_guarniciones_catalogo
            WHERE activa = 1
            ORDER BY nombre ASC
        `);

        return rows;

    },


    // ======================================================
    // GUARNICIONES - Crear nueva
    // ======================================================

    crearGuarnicion: async (nombre) => {

        const nombreLimpio =
            String(nombre).trim();

        const [resultado] = await pool.query(
            `
            INSERT INTO menu_guarniciones_catalogo
                (nombre)
            VALUES (?)
            `,
            [nombreLimpio]
        );

        return {
            id: resultado.insertId,
            nombre: nombreLimpio,
            activa: 1
        };

    },


    // ======================================================  
    // Eliminar una semana futura y toda su planificación
    // ======================================================

    eliminarSemana: async (semanaId) => {

        const connection = await pool.getConnection();

        try {

            await connection.beginTransaction();

            // 1. Verificar que exista
            const [semanas] = await connection.query(
                `
                SELECT
                    id,
                    numero_semana,
                    fecha_inicio,
                    fecha_fin,
                    estado
                FROM menu_semana_maestro
                WHERE id = ?
                FOR UPDATE
                `,
                [semanaId]
            );

            if (semanas.length === 0) {

                await connection.rollback();

                return {
                    success: false,
                    reason: "NO_EXISTE"
                };
            }

            const semana = semanas[0];

            // 2. Protección:
            // no eliminar semanas que ya comenzaron
            const [validacion] = await connection.query(
                `
                SELECT
                    CASE

                        WHEN estado = 'BORRADOR'
                            THEN 1

                        WHEN estado = 'PUBLICADA'
                            AND fecha_inicio > CURDATE()
                            THEN 1

                        ELSE 0

                    END AS puede_eliminar

                FROM menu_semana_maestro
                WHERE id = ?
                `,
                [semanaId]
            );

            if (!validacion[0].puede_eliminar) {

                 await connection.rollback();

                return {
                    success: false,
                    reason: "SEMANA_PROTEGIDA",
                    semana
                };
            }

            // 3. Eliminar planificación hija
            await connection.query(
                `
                DELETE FROM menu_ejecutivo_sucursal
                WHERE semana_id = ?
                `,
                [semanaId]
            );

            // 4. Eliminar semana maestra
            await connection.query(
                `
                DELETE FROM menu_semana_maestro
                WHERE id = ?
                `,
                [semanaId]
            );

            await connection.commit();

            return {
                success: true,
                semana
            };

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();

        }

    },


    // ======================================================
    // PLANTILLAS PROMOCIONALES
    // Obtener plantillas activas
    // ======================================================

    obtenerTodasPlantillas: async () => {

        const [rows] = await pool.query(`
            SELECT
                id,
                nombre,
                slug,
                descripcion,
                preview_url,
                configuracion,
                activa
            FROM planner_plantillas
            ORDER BY id ASC
        `);

        return rows.map(plantilla => {

            let configuracion = {};

            if (plantilla.configuracion) {

                try {

                    configuracion =
                        typeof plantilla.configuracion === "string"
                            ? JSON.parse(plantilla.configuracion)
                            : plantilla.configuracion;

                } catch (error) {

                    console.error(
                        `Configuración inválida en plantilla ${plantilla.id}:`,
                        error
                    );

                }

            }

            return {
                ...plantilla,
                configuracion
            };

        });

    },


    obtenerPlantillasActivas: async () => {

        const [rows] = await pool.query(`
            SELECT
                id,
                nombre,
                slug,
                descripcion,
                preview_url,
                configuracion,
                activa
            FROM planner_plantillas
            WHERE activa = 1
            ORDER BY id ASC
        `);


        return rows.map(plantilla => {

            let configuracion = {};

            if (plantilla.configuracion) {

                try {

                    configuracion =
                        typeof plantilla.configuracion === "string"
                            ? JSON.parse(plantilla.configuracion)
                            : plantilla.configuracion;

                } catch (error) {

                    console.error(
                        `Configuración inválida en plantilla ${plantilla.id}:`,
                        error
                    );

                }

            }


            return {
                ...plantilla,
                configuracion
            };

        });

    },



    actualizarConfiguracionPlantilla: async (
        plantillaId,
        configuracion,
        activa
    ) => {

        const configuracionJSON =
            JSON.stringify(configuracion);

        const [resultado] = await pool.query(
            `
            UPDATE planner_plantillas

            SET
                configuracion = ?,
                activa = ?

            WHERE id = ?
            `,
            [
                configuracionJSON,
                activa ? 1 : 0,
                plantillaId
            ]
        );

        return resultado.affectedRows > 0;

    },





};

module.exports = menuSemanaModel;