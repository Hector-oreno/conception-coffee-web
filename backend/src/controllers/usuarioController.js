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

    // RegEx Estándar OWASP (Mínimo 10 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial)
    const regexOWASP = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#-]).{10,}$/;

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

                if (!regexOWASP.test(password)) {

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


                    sucursalFinal =
                        sucursalId;

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
                            req.usuario.sucursal_id

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