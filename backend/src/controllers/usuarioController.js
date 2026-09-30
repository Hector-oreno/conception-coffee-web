    const crypto = require('crypto'); // Módulo nativo de Node.js para generar UUIDs/JTIs
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const UsuarioModel = require('../models/usuarioModel');

    const JWT_SECRET =
        process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        throw new Error(
            'JWT_SECRET no está configurado en las variables de entorno.'
        );
    }


    // Política de contraseña del sistema:
    // mínimo 10 caracteres, mayúscula, minúscula,
    // número y carácter especial permitido.
    const regexPasswordSegura =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#-]).{10,}$/;

    // Mapa de duraciones de sesión según el Rol (en horas)
    const DURACION_SESION_ROL = {
        admin: '8h',
        gerente: '10h',
        cajero: '12h',
        mesero: '12h',
        cocina: '24h',   // Pantallas KDS continuas
        cliente: '72h'
    };

    const usuarioController = {
        // ── 1. LISTAR USUARIOS ──
        obtenerTodos: async (req, res) => {

            try {

                const usuarios =
                    await UsuarioModel.obtenerTodos();

                return res.json({
                    success: true,
                    data: usuarios
                });

            } catch (error) {

                console.error(
                    'Error al listar usuarios:',
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        'Error interno al obtener usuarios.'
                });

            }

        },

        // ── 2. REGISTRAR USUARIO ──
        registrar: async (req, res) => {

            try {

                let {
                    nombre,
                    correo,
                    password,
                    rol,
                    sucursal_id
                } = req.body;


                // ==========================================
                // NORMALIZAR DATOS
                // ==========================================

                nombre =
                    String(nombre || "").trim();

                correo =
                    String(correo || "")
                        .trim()
                        .toLowerCase();

                rol =
                    String(rol || "")
                        .trim()
                        .toLowerCase();


                // ==========================================
                // CAMPOS OBLIGATORIOS
                // ==========================================

                if (
                    !nombre ||
                    !correo ||
                    !password ||
                    !rol
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'Nombre, correo, contraseña y rol son obligatorios.'
                    });

                }


                // ==========================================
                // ROLES PERMITIDOS
                // ==========================================

                const rolesPermitidos = [
                    'admin',
                    'gerente',
                    'cajero',
                    'mesero',
                    'cocina',
                    'cliente'
                ];


                if (!rolesPermitidos.includes(rol)) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'El rol seleccionado no es válido.'
                    });

                }


                // ==========================================
                // VALIDAR CONTRASEÑA
                // ==========================================

                if (!regexPasswordSegura.test(password)) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'La contraseña debe tener mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
                    });

                }


                // ==========================================
                // VALIDAR SUCURSAL SEGÚN ROL
                // ==========================================

                const rolesConSucursal = [
                    'gerente',
                    'cajero',
                    'mesero',
                    'cocina'
                ];


                let sucursalFinal = null;


                if (rolesConSucursal.includes(rol)) {

                    const sucursalId =
                        Number(sucursal_id);


                    if (
                        !Number.isInteger(sucursalId) ||
                        sucursalId <= 0
                    ) {

                        return res.status(400).json({
                            success: false,
                            message:
                                'Este rol requiere una sucursal válida.'
                        });

                    }


                    // ==================================================
                    // COMPROBAR QUE LA SUCURSAL EXISTA Y ESTÉ ACTIVA
                    // ==================================================

                    const sucursal =
                        await UsuarioModel
                            .obtenerSucursalActivaPorId(
                                sucursalId
                            );


                    if (!sucursal) {

                        return res.status(400).json({
                            success: false,
                            message:
                                'La sucursal seleccionada no existe o se encuentra inactiva.'
                        });

                    }


                    sucursalFinal =
                        sucursal.id;

                }


                // admin y cliente quedan globales
                if (
                    rol === 'admin' ||
                    rol === 'cliente'
                ) {

                    sucursalFinal =
                        null;

                }


                // ==========================================
                // CORREO DUPLICADO
                // ==========================================

                const existente =
                    await UsuarioModel.buscarPorCorreo(
                        correo
                    );


                if (existente) {

                    return res.status(409).json({
                        success: false,
                        message:
                            'El correo electrónico ya está registrado.'
                    });

                }


                // ==========================================
                // HASH DE CONTRASEÑA
                // ==========================================

                const passwordHash =
                    await bcrypt.hash(
                        password,
                        12
                    );


                // ==========================================
                // CREAR USUARIO
                // ==========================================

                const usuarioId =
                    await UsuarioModel.crear({

                        nombre,

                        correo,

                        passwordHash,

                        rol,

                        sucursal_id:
                            sucursalFinal

                    });


                return res.status(201).json({

                    success: true,

                    message:
                        'Usuario creado exitosamente.',

                    usuarioId

                });


            } catch (error) {

                console.error(
                    'Error al registrar usuario:',
                    error
                );


                // ==========================================
                // PROTECCIÓN EXTRA POR UNIQUE(correo)
                // ==========================================

                if (error.code === 'ER_DUP_ENTRY') {

                    return res.status(409).json({
                        success: false,
                        message:
                            'El correo electrónico ya está registrado.'
                    });

                }


                return res.status(500).json({
                    success: false,
                    message:
                        'Error interno del servidor al registrar usuario.'
                });

            }

        },


        // ==========================================================
        // EDITAR USUARIO
        // ==========================================================

        editar: async (req, res) => {

            try {

                // ==================================================
                // ID DEL USUARIO
                // ==================================================

                const usuarioId =
                    Number(
                        req.params.id
                    );


                if (
                    !Number.isInteger(usuarioId) ||
                    usuarioId <= 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'El usuario indicado no es válido.'
                    });

                }


                // ==================================================
                // OBTENER USUARIO ACTUAL
                // ==================================================

                const usuarioActual =
                    await UsuarioModel
                        .obtenerPorId(
                            usuarioId
                        );


                if (!usuarioActual) {

                    return res.status(404).json({
                        success: false,
                        message:
                            'No se encontró el usuario.'
                    });

                }


                // ==================================================
                // NORMALIZAR DATOS
                // ==================================================

                let {
                    nombre,
                    correo,
                    rol,
                    sucursal_id
                } = req.body;


                nombre =
                    String(
                        nombre || ''
                    ).trim();


                correo =
                    String(
                        correo || ''
                    )
                        .trim()
                        .toLowerCase();


                rol =
                    String(
                        rol || ''
                    )
                        .trim()
                        .toLowerCase();


                // ==================================================
                // CAMPOS OBLIGATORIOS
                // ==================================================

                if (
                    !nombre ||
                    !correo ||
                    !rol
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'Nombre, correo y rol son obligatorios.'
                    });

                }


                // ==================================================
                // VALIDAR CORREO
                // ==================================================

                const regexCorreo =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !regexCorreo.test(
                        correo
                    )
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'El correo electrónico no tiene un formato válido.'
                    });

                }


                // ==================================================
                // ROLES PERMITIDOS
                // ==================================================

                const rolesPermitidos = [
                    'admin',
                    'gerente',
                    'cajero',
                    'mesero',
                    'cocina',
                    'cliente'
                ];


                if (
                    !rolesPermitidos.includes(
                        rol
                    )
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'El rol seleccionado no es válido.'
                    });

                }


                // ==================================================
                // PROTEGER LA PROPIA CUENTA
                // ==================================================

                const esPropiaCuenta =
                    Number(
                        req.usuario.id
                    ) === usuarioId;


                if (esPropiaCuenta) {

                    // Puede modificar nombre y correo,
                    // pero no sus propios permisos.

                    if (
                        rol !==
                        usuarioActual.rol
                    ) {

                        return res.status(400).json({
                            success: false,
                            message:
                                'No puedes modificar el rol de tu propia cuenta.'
                        });

                    }


                    const sucursalActual =
                        usuarioActual.sucursal_id === null
                            ? null
                            : Number(
                                usuarioActual.sucursal_id
                            );


                    const sucursalSolicitada =
                        sucursal_id === null ||
                        sucursal_id === undefined ||
                        sucursal_id === ''
                            ? null
                            : Number(
                                sucursal_id
                            );


                    if (
                        sucursalSolicitada !==
                        sucursalActual
                    ) {

                        return res.status(400).json({
                            success: false,
                            message:
                                'No puedes modificar la sucursal de tu propia cuenta.'
                        });

                    }

                }


                // ==================================================
                // VALIDAR SUCURSAL SEGÚN ROL
                // ==================================================

                const rolesConSucursal = [
                    'gerente',
                    'cajero',
                    'mesero',
                    'cocina'
                ];


                let sucursalFinal =
                    null;


                if (
                    rolesConSucursal.includes(
                        rol
                    )
                ) {

                    const sucursalId =
                        Number(
                            sucursal_id
                        );


                    if (
                        !Number.isInteger(
                            sucursalId
                        ) ||
                        sucursalId <= 0
                    ) {

                        return res.status(400).json({
                            success: false,
                            message:
                                'Este rol requiere una sucursal válida.'
                        });

                    }


                    const sucursal =
                        await UsuarioModel
                            .obtenerSucursalActivaPorId(
                                sucursalId
                            );


                    if (!sucursal) {

                        return res.status(400).json({
                            success: false,
                            message:
                                'La sucursal seleccionada no existe o se encuentra inactiva.'
                        });

                    }


                    sucursalFinal =
                        sucursal.id;

                }


                // admin y cliente son globales
                if (
                    rol === 'admin' ||
                    rol === 'cliente'
                ) {

                    sucursalFinal =
                        null;

                }


                // ==================================================
                // CORREO DUPLICADO
                // ==================================================

                const correoExistente =
                    await UsuarioModel
                        .buscarCorreoEnOtroUsuario(
                            correo,
                            usuarioId
                        );


                if (correoExistente) {

                    return res.status(409).json({
                        success: false,
                        message:
                            'El correo electrónico ya está registrado.'
                    });

                }


                // ==================================================
                // ACTUALIZAR
                // ==================================================

                const actualizado =
                    await UsuarioModel
                        .actualizar({

                            usuarioId,

                            nombre,

                            correo,

                            rol,

                            sucursal_id:
                                sucursalFinal

                        });


                if (!actualizado) {

                    return res.status(404).json({
                        success: false,
                        message:
                            'No fue posible actualizar el usuario.'
                    });

                }


                // ==================================================
                // SEGURIDAD DE SESIONES
                // ==================================================
                //
                // Si un administrador modifica el rol o sucursal
                // de OTRA cuenta, revocamos sus sesiones abiertas.
                //
                // El middleware ya consulta rol/sucursal actuales,
                // pero obligar a iniciar sesión nuevamente deja
                // explícito el cambio de permisos.
                // ==================================================

                const permisosCambiaron =
                    usuarioActual.rol !== rol ||
                    Number(
                        usuarioActual.sucursal_id || 0
                    ) !==
                    Number(
                        sucursalFinal || 0
                    );


                let sesionesRevocadas =
                    0;


                if (
                    !esPropiaCuenta &&
                    permisosCambiaron
                ) {

                    sesionesRevocadas =
                        await UsuarioModel
                            .revocarSesionesUsuario(
                                usuarioId
                            );

                }


                return res.json({

                    success: true,

                    message:
                        'Usuario actualizado correctamente.',

                    sesionesRevocadas

                });


            } catch (error) {

                console.error(
                    'Error actualizando usuario:',
                    error
                );


                // Protección adicional por UNIQUE(correo)
                if (
                    error.code ===
                    'ER_DUP_ENTRY'
                ) {

                    return res.status(409).json({
                        success: false,
                        message:
                            'El correo electrónico ya está registrado.'
                    });

                }


                return res.status(500).json({
                    success: false,
                    message:
                        'Error interno al actualizar el usuario.'
                });

            }

        },




        // ── CAMBIAR ESTADO DE USUARIO ──
        cambiarEstado: async (req, res) => {

            try {

                const usuarioId =
                    Number(req.params.id);

                const { activo } =
                    req.body;


                // ==========================================
                // VALIDAR ID
                // ==========================================

                if (
                    !Number.isInteger(usuarioId) ||
                    usuarioId <= 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'El usuario indicado no es válido.'
                    });

                }


                // ==========================================
                // VALIDAR ESTADO
                // Solo aceptamos 0 o 1
                // ==========================================

                const nuevoEstado =
                    Number(activo);


                if (
                    nuevoEstado !== 0 &&
                    nuevoEstado !== 1
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'El estado indicado no es válido.'
                    });

                }


                // ==========================================
                // PROTEGER AL ADMIN ACTUAL
                // ==========================================

                if (
                    Number(req.usuario.id) ===
                    usuarioId
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'No puedes cambiar el estado de tu propia cuenta.'
                    });

                }


                // ==========================================
                // CAMBIAR ESTADO
                // ==========================================

                const actualizado =
                    await UsuarioModel.cambiarEstado(
                        usuarioId,
                        nuevoEstado
                    );


                if (!actualizado) {

                    return res.status(404).json({
                        success: false,
                        message:
                            'No se encontró el usuario.'
                    });

                }


                // ==========================================
                // SI SE DESACTIVA:
                // REVOCAR TODAS SUS SESIONES
                // ==========================================

                let sesionesRevocadas = 0;


                if (nuevoEstado === 0) {

                    sesionesRevocadas =
                        await UsuarioModel
                            .revocarSesionesUsuario(
                                usuarioId
                            );

                }


                return res.json({

                    success: true,

                    message:
                        nuevoEstado === 1
                            ? 'Usuario activado correctamente.'
                            : 'Usuario desactivado correctamente.',

                    sesionesRevocadas

                });


            } catch (error) {

                console.error(
                    'Error cambiando estado del usuario:',
                    error
                );


                return res.status(500).json({
                    success: false,
                    message:
                        'Error interno al cambiar el estado del usuario.'
                });

            }

        },





        // ── 3. LOGIN DE USUARIOS ──
        login: async (req, res) => {

            try {

                let {
                    correo,
                    password
                } = req.body;


                // ==========================================
                // VALIDAR DATOS
                // ==========================================

                correo =
                    String(correo || "")
                        .trim()
                        .toLowerCase();


                if (!correo || !password) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'Ingresa correo y contraseña.'
                    });

                }


                // ==========================================
                // BUSCAR USUARIO
                // ==========================================

                const usuario =
                    await UsuarioModel.buscarPorCorreo(
                        correo
                    );


                // Mismo mensaje si no existe o está inactivo.
                // Evita revelar qué correos existen.
                if (
                    !usuario ||
                    Number(usuario.activo) !== 1
                ) {

                    return res.status(401).json({
                        success: false,
                        message:
                            'Correo o contraseña incorrectos.'
                    });

                }


                // ==========================================
                // VERIFICAR CONTRASEÑA
                // ==========================================

                const passwordValido =
                    await bcrypt.compare(
                        password,
                        usuario.password_hash
                    );


                if (!passwordValido) {

                    return res.status(401).json({
                        success: false,
                        message:
                            'Correo o contraseña incorrectos.'
                    });

                }


                // ==========================================
                // GENERAR JTI ÚNICO
                // ==========================================

                const jti =
                    crypto.randomUUID();


                // ==========================================
                // DURACIÓN SEGÚN ROL
                // ==========================================

                const tiempoExpiracion =
                    DURACION_SESION_ROL[
                        usuario.rol
                    ] || '8h';


                // ==========================================
                // GENERAR JWT
                // ==========================================

                const token =
                    jwt.sign(
                        {
                            id:
                                usuario.id,

                            nombre:
                                usuario.nombre,

                            correo:
                                usuario.correo,

                            rol:
                                usuario.rol,

                            sucursal_id:
                                usuario.sucursal_id,

                            jti
                        },

                        JWT_SECRET,

                        {
                            expiresIn:
                                tiempoExpiracion,

                            algorithm:
                                'HS256'
                        }
                    );


                // ==========================================
                // LEER EXPIRACIÓN REAL DEL JWT
                // ==========================================

                const tokenDecodificado =
                    jwt.decode(token);


                if (!tokenDecodificado?.exp) {

                    throw new Error(
                        'No fue posible determinar la expiración del token.'
                    );

                }


                const expiraEn =
                    new Date(
                        tokenDecodificado.exp * 1000
                    );


                // ==========================================
                // IP
                // ==========================================

                let ipOrigen =
                    req.ip ||
                    req.socket?.remoteAddress ||
                    null;


                if (ipOrigen) {

                    ipOrigen =
                        String(ipOrigen)
                            .split(',')[0]
                            .trim()
                            .substring(0, 45);

                }


                // ==========================================
                // USER AGENT
                // ==========================================

                const userAgent =
                    String(
                        req.headers['user-agent'] ||
                        'Desconocido'
                    ).substring(0, 500);


                // ==========================================
                // CREAR SESIÓN EN BD
                // ==========================================

                const sesionId =
                    await UsuarioModel.crearSesion({

                        usuarioId:
                            usuario.id,

                        jti,

                        ipOrigen,

                        userAgent,

                        expiraEn

                    });


                // ==========================================
                // RESPUESTA SEGURA
                // ==========================================

                return res.json({

                    success: true,

                    message:
                        'Inicio de sesión exitoso.',

                    token,

                    sesionId,

                    usuario: {

                        id:
                            usuario.id,

                        nombre:
                            usuario.nombre,

                        correo:
                            usuario.correo,

                        rol:
                            usuario.rol,

                        sucursal_id:
                            usuario.sucursal_id

                    }

                });


            } catch (error) {

                console.error(
                    'Error en el login:',
                    error
                );


                return res.status(500).json({
                    success: false,
                    message:
                        'Error interno del servidor al iniciar sesión.'
                });

            }

        },


        // ── VALIDAR SESIÓN ACTUAL ──
        validarSesion: async (req, res) => {

            try {

                // Si llegamos aquí, verificarToken ya comprobó:
                // - JWT válido
                // - JTI existente
                // - sesión no revocada
                // - sesión no cerrada
                // - sesión no expirada
                // - usuario activo

                return res.json({

                    success: true,

                    usuario: {

                        id:
                            req.usuario.id,

                        nombre:
                            req.usuario.nombre,

                        correo:
                            req.usuario.correo,

                        rol:
                            req.usuario.rol,

                        sucursal_id:
                            req.usuario.sucursal_id,

                        sucursal_nombre:
                            req.usuario.sucursal_nombre ||
                                null


                    }

                });

            } catch (error) {

                console.error(
                    'Error validando sesión:',
                    error
                );

                return res.status(500).json({

                    success: false,

                    message:
                        'Error interno validando la sesión.'

                });

            }

        },


        // ==========================================================
        // CAMBIAR CONTRASEÑA DE LA CUENTA AUTENTICADA
        // ==========================================================

        cambiarPassword: async (req, res) => {

            try {

                const usuarioId =
                    Number(
                        req.usuario.id
                    );


                const {
                    passwordActual,
                    passwordNueva,
                    confirmarPassword
                } = req.body;


                // ==================================================
                // CAMPOS OBLIGATORIOS
                // ==================================================

                if (
                    !passwordActual ||
                    !passwordNueva ||
                    !confirmarPassword
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'Completa todos los campos de contraseña.'
                    });

                }


                // ==================================================
                // CONFIRMACIÓN
                // ==================================================

                if (
                    passwordNueva !==
                    confirmarPassword
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'La nueva contraseña y su confirmación no coinciden.'
                    });

                }


                // ==================================================
                // POLÍTICA DE CONTRASEÑA
                // ==================================================

                if (
                    !regexPasswordSegura.test(
                        passwordNueva
                    )
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'La nueva contraseña debe tener mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
                    });

                }


                // ==================================================
                // CREDENCIALES ACTUALES
                // ==================================================

                const credenciales =
                    await UsuarioModel
                        .obtenerCredencialesPorId(
                            usuarioId
                        );


                if (
                    !credenciales ||
                    Number(
                        credenciales.activo
                    ) !== 1
                ) {

                    return res.status(401).json({
                        success: false,
                        message:
                            'La cuenta ya no se encuentra disponible.'
                    });

                }


                // ==================================================
                // VERIFICAR CONTRASEÑA ACTUAL
                // ==================================================

                const passwordActualValido =
                    await bcrypt.compare(
                        passwordActual,
                        credenciales.password_hash
                    );


                if (!passwordActualValido) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'La contraseña actual no es correcta.'
                    });

                }


                // ==================================================
                // IMPEDIR REUTILIZAR LA MISMA CONTRASEÑA
                // ==================================================

                const esMismaPassword =
                    await bcrypt.compare(
                        passwordNueva,
                        credenciales.password_hash
                    );


                if (esMismaPassword) {

                    return res.status(400).json({
                        success: false,
                        message:
                            'La nueva contraseña debe ser diferente de la actual.'
                    });

                }


                // ==================================================
                // GENERAR NUEVO HASH
                // ==================================================

                const nuevoHash =
                    await bcrypt.hash(
                        passwordNueva,
                        12
                    );


                // ==================================================
                // ACTUALIZAR
                // ==================================================

                const actualizado =
                    await UsuarioModel
                        .actualizarPassword(
                            usuarioId,
                            nuevoHash
                        );


                if (!actualizado) {

                    return res.status(500).json({
                        success: false,
                        message:
                            'No fue posible actualizar la contraseña.'
                    });

                }


                // ==================================================
                // REVOCAR LAS DEMÁS SESIONES
                // ==================================================
                //
                // No usamos revocarSesionesUsuario() porque también
                // revocaría la sesión desde la que se hizo el cambio.
                // ==================================================

                const sesionesRevocadas =
                    await UsuarioModel
                        .revocarOtrasSesionesUsuario(
                            usuarioId,
                            req.usuario.jti
                        );


                return res.json({

                    success: true,

                    message:
                        'Contraseña actualizada correctamente.',

                    sesionesRevocadas

                });


            } catch (error) {

                console.error(
                    'Error cambiando contraseña:',
                    error
                );


                return res.status(500).json({
                    success: false,
                    message:
                        'Error interno al actualizar la contraseña.'
                });

            }

        },




        // ── 4. CIERRE DE SESIÓN (Logout explícito para auditoría) ──
        logout: async (req, res) => {

            try {

                // verificarToken ya certificó:
                // usuario + jti + sesión

                const usuarioId =
                    req.usuario.id;

                const jti =
                    req.usuario.jti;


                const cerrada =
                    await UsuarioModel.cerrarSesion(
                        usuarioId,
                    jti
                );


                if (!cerrada) {

                    return res.status(401).json({
                        success: false,
                        message:
                            'La sesión ya no se encuentra activa.'
                    });

                }


                return res.json({
                    success: true,
                    message:
                        'Sesión cerrada correctamente.'
                });


            } catch (error) {

                console.error(
                    'Error cerrando sesión:',
                    error
                );


                return res.status(500).json({
                    success: false,
                    message:
                        'Error interno al cerrar sesión.'
                });

            }

        },

        // ── 5. CONSULTAR AUDITORÍA DE SESIONES ──
        obtenerHistorialSesiones: async (req, res) => {

            try {

                const historial =
                    await UsuarioModel.obtenerAuditoriaSesiones();


                return res.json({

                    success: true,

                    data: historial

                });


            } catch (error) {

                console.error(
                    'Error consultando auditoría de sesiones:',
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        'Error al consultar el historial de sesiones.'

                });

            }

        },

        // ── 6. REVOCAR SESIÓN EXPLÍCITAMENTE POR JTI ──
        revocarSesion: async (req, res) => {

            try {

                const { jti } =
                    req.body;


                if (
                    !jti ||
                    typeof jti !== 'string' ||
                    !jti.trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            'Se requiere un JTI válido.'

                    });

                }


                // ==========================================
                // EVITAR QUE EL ADMIN REVOQUE
                // SU PROPIA SESIÓN DESDE AUDITORÍA
                // ==========================================

                if (
                    req.usuario &&
                    req.usuario.jti === jti.trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            'No puedes revocar tu propia sesión desde la auditoría. Utiliza Cerrar sesión.'

                    });

                }


                const revocada =
                    await UsuarioModel.revocarSesionJTI(
                        jti.trim()
                    );


                if (!revocada) {

                    return res.status(404).json({

                        success: false,

                        message:
                            'La sesión no existe o ya fue revocada.'

                    });

                }


                return res.json({

                    success: true,

                    message:
                        'Sesión revocada exitosamente.'

                });


            } catch (error) {

                console.error(
                    'Error al revocar sesión:',
                    error
                );


                return res.status(500).json({

                    success: false,

                    message:
                        'Error interno al revocar la sesión.'

                });

            }

        }


    };

    module.exports = usuarioController;
