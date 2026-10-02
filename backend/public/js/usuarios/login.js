/* ==========================================================================
   CONCEPTION COFFEE
   LOGIN ADMINISTRATIVO
   ========================================================================== */

(() => {

    'use strict';


    // ======================================================================
    // ELEMENTOS
    // ======================================================================

    const formulario =
        document.getElementById(
            'form-login'
        );

    const inputCorreo =
        document.getElementById(
            'correo'
        );

    const inputPassword =
        document.getElementById(
            'password'
        );

    const botonLogin =
        document.getElementById(
            'btnLogin'
        );

    const botonTexto =
        document.getElementById(
            'btnLoginText'
        );

    const botonIcono =
        botonLogin?.querySelector(
            '.btn-login-icon i'
        );

    const botonPassword =
        document.getElementById(
            'toggleLoginPassword'
        );

    const mensaje =
        document.getElementById(
            'loginMessage'
        );

    const mensajeTexto =
        document.getElementById(
            'loginMessageText'
        );

    const mensajeIcono =
        document.getElementById(
            'loginMessageIcon'
        );


    if (
        !formulario ||
        !inputCorreo ||
        !inputPassword ||
        !botonLogin
    ) {

        console.error(
            'No se pudo inicializar el formulario de acceso.'
        );

        return;

    }


    // ======================================================================
    // CONSTANTES
    // ======================================================================

    const TOKEN_KEY =
        'token_conception';

    const USUARIO_KEY =
        'usuario_conception';


    // ======================================================================
    // MENSAJES
    // ======================================================================

    function ocultarMensaje() {

        if (!mensaje) {
            return;
        }


        mensaje.hidden =
            true;

        mensaje.classList.remove(
            'info',
            'success',
            'warning',
            'error'
        );


        if (mensajeTexto) {

            mensajeTexto.textContent =
                '';

        }

    }


    function mostrarMensaje(
        tipo,
        texto
    ) {

        if (
            !mensaje ||
            !mensajeTexto
        ) {
            return;
        }


        mensaje.classList.remove(
            'info',
            'success',
            'warning',
            'error'
        );


        mensaje.classList.add(
            tipo
        );


        mensajeTexto.textContent =
            texto;


        if (mensajeIcono) {

            const iconos = {

                info:
                    'fas fa-circle-info',

                success:
                    'fas fa-circle-check',

                warning:
                    'fas fa-triangle-exclamation',

                error:
                    'fas fa-circle-exclamation'

            };


            mensajeIcono.className =
                iconos[tipo] ||
                iconos.info;

        }


        mensaje.hidden =
            false;

    }


    // ======================================================================
    // ESTADO DEL BOTÓN
    // ======================================================================

    function establecerCargando(
        cargando
    ) {

        botonLogin.disabled =
            cargando;


        inputCorreo.disabled =
            cargando;


        inputPassword.disabled =
            cargando;


        if (botonPassword) {

            botonPassword.disabled =
                cargando;

        }


        if (botonTexto) {

            botonTexto.textContent =
                cargando
                    ? 'Verificando acceso...'
                    : 'Iniciar sesión';

        }


        if (botonIcono) {

            botonIcono.className =
                cargando
                    ? 'fas fa-spinner fa-spin'
                    : 'fas fa-arrow-right';

        }

    }


    // ======================================================================
    // LIMPIAR SESIÓN LOCAL
    // ======================================================================

    function limpiarSesionLocal() {

        localStorage.removeItem(
            TOKEN_KEY
        );

        localStorage.removeItem(
            USUARIO_KEY
        );

    }


    // ======================================================================
    // MENSAJE RECIBIDO DESDE AUTH-GUARD
    // ======================================================================

    function procesarEstadoURL() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const estado =
            parametros.get(
                'estado'
            );


        if (!estado) {
            return;
        }


        const estados = {

            'sin-sesion': {
                tipo:
                    'info',

                mensaje:
                    'Inicia sesión para acceder al panel administrativo.'
            },

            'sesion-finalizada': {
                tipo:
                    'warning',

                mensaje:
                    'Tu sesión finalizó o dejó de ser válida. Inicia sesión nuevamente.'
            },

            'sin-acceso': {
                tipo:
                    'error',

                mensaje:
                    'Tu cuenta no tiene acceso al panel administrativo.'
            }

        };


        const configuracion =
            estados[estado];


        if (configuracion) {

            mostrarMensaje(
                configuracion.tipo,
                configuracion.mensaje
            );

        }


        // Quitamos el parámetro sin recargar.
        // Evita repetir el aviso al refrescar posteriormente.

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    }


    // ======================================================================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ======================================================================

    function alternarPassword() {

        const mostrando =
            inputPassword.type ===
            'text';


        inputPassword.type =
            mostrando
                ? 'password'
                : 'text';


        botonPassword?.setAttribute(
            'aria-pressed',
            String(!mostrando)
        );


        botonPassword?.setAttribute(
            'aria-label',
            mostrando
                ? 'Mostrar contraseña'
                : 'Ocultar contraseña'
        );


        const icono =
            botonPassword
                ?.querySelector('i');


        if (icono) {

            icono.className =
                mostrando
                    ? 'fas fa-eye'
                    : 'fas fa-eye-slash';

        }


        inputPassword.focus();

    }


    // ======================================================================
    // VALIDACIÓN LOCAL
    // ======================================================================

    function validarFormulario() {

        const correo =
            inputCorreo.value
                .trim()
                .toLowerCase();


        const password =
            inputPassword.value;


        if (!correo) {

            mostrarMensaje(
                'error',
                'Ingresa tu correo electrónico.'
            );


            inputCorreo.focus();

            return null;

        }


        if (!inputCorreo.validity.valid) {

            mostrarMensaje(
                'error',
                'Ingresa un correo electrónico válido.'
            );


            inputCorreo.focus();

            return null;

        }


        if (!password) {

            mostrarMensaje(
                'error',
                'Ingresa tu contraseña.'
            );


            inputPassword.focus();

            return null;

        }


        return {
            correo,
            password
        };

    }


    // ======================================================================
    // INTERPRETAR ERROR DEL LOGIN
    // ======================================================================

    function mensajeErrorLogin(
        status,
        data
    ) {

        switch (status) {

            case 400:

                return (
                    data?.message ||
                    'Revisa los datos ingresados.'
                );


            case 401:

                return (
                    'Correo o contraseña incorrectos.'
                );


            case 403:

                return (
                    'Tu cuenta no tiene autorización para acceder.'
                );


            case 429:

                return (
                    'Se realizaron demasiados intentos. Espera un momento antes de volver a intentarlo.'
                );


            case 503:

                return (
                    'El servicio no está disponible temporalmente. Intenta nuevamente en unos minutos.'
                );


            default:

                if (status >= 500) {

                    return (
                        'Ocurrió un problema en el servidor. Intenta nuevamente.'
                    );

                }


                return (
                    data?.message ||
                    'No fue posible iniciar sesión.'
                );

        }

    }


    // ======================================================================
    // INICIAR SESIÓN
    // ======================================================================

    async function iniciarSesion(
        event
    ) {

        event.preventDefault();


        ocultarMensaje();


        const datos =
            validarFormulario();


        if (!datos) {
            return;
        }


        establecerCargando(
            true
        );


        try {

            const response =
                await fetch(
                    '/api/usuarios/login',
                    {
                        method:
                            'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                datos
                            )
                    }
                );


            let data =
                null;


            try {

                data =
                    await response.json();

            } catch {

                data =
                    null;

            }


            // ==========================================================
            // LOGIN RECHAZADO
            // ==========================================================

            if (
                !response.ok ||
                !data?.success
            ) {

                mostrarMensaje(
                    response.status === 503
                        ? 'warning'
                        : 'error',

                    mensajeErrorLogin(
                        response.status,
                        data
                    )
                );


                return;

            }


            // ==========================================================
            // RESPUESTA INCOMPLETA
            // ==========================================================

            if (
                !data.token ||
                !data.usuario
            ) {

                console.error(
                    'Respuesta de login incompleta:',
                    data
                );


                mostrarMensaje(
                    'error',
                    'El servidor devolvió una respuesta de acceso incompleta.'
                );


                return;

            }


            // ==========================================================
            // GUARDAR SESIÓN
            // ==========================================================

            localStorage.setItem(
                TOKEN_KEY,
                data.token
            );


            localStorage.setItem(
                USUARIO_KEY,
                JSON.stringify(
                    data.usuario
                )
            );


            // ==========================================================
            // ACCESO CORRECTO
            // ==========================================================

            mostrarMensaje(
                'success',
                'Acceso verificado. Abriendo el panel...'
            );


            if (botonTexto) {

                botonTexto.textContent =
                    'Acceso verificado';

            }


            if (botonIcono) {

                botonIcono.className =
                    'fas fa-check';

            }


            window.setTimeout(
                () => {

                    window.location.replace(
                        '/admin.html'
                    );

                },
                300
            );


        } catch (error) {

            console.error(
                'Error de conexión durante login:',
                error
            );


            mostrarMensaje(
                'warning',
                'No fue posible conectar con el servidor. Comprueba tu conexión e intenta nuevamente.'
            );


        } finally {

            // Si hubo éxito, la navegación ocurrirá enseguida.
            // Si seguimos en esta página, restauramos el formulario.

            window.setTimeout(
                () => {

                    if (
                        window.location.pathname
                            .endsWith(
                                '/login.html'
                            )
                    ) {

                        establecerCargando(
                            false
                        );

                    }

                },
                350
            );

        }

    }


    // ======================================================================
    // COMPROBAR SESIÓN EXISTENTE
    // ======================================================================

    async function comprobarSesionExistente() {

        const token =
            localStorage.getItem(
                TOKEN_KEY
            );


        if (!token) {

            return false;

        }


        establecerCargando(
            true
        );


        mostrarMensaje(
            'info',
            'Comprobando tu sesión actual...'
        );


        try {

            const response =
                await fetch(
                    '/api/usuarios/sesion',
                    {
                        method:
                            'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        cache:
                            'no-store'
                    }
                );


            let data =
                null;


            try {

                data =
                    await response.json();

            } catch {

                data =
                    null;

            }


            // ==========================================================
            // SESIÓN VÁLIDA
            // ==========================================================

            if (
                response.ok &&
                data?.success &&
                data?.usuario
            ) {

                const rolesPanel = [
                    'admin',
                    'gerente',
                    'cajero',
                    'mesero',
                    'cocina'
                ];


                if (
                    !rolesPanel.includes(
                        data.usuario.rol
                    )
                ) {

                    limpiarSesionLocal();


                    mostrarMensaje(
                        'error',
                        'Tu cuenta no tiene acceso al panel administrativo.'
                    );


                    establecerCargando(
                        false
                    );


                    return false;

                }


                localStorage.setItem(
                    USUARIO_KEY,
                    JSON.stringify(
                        data.usuario
                    )
                );


                mostrarMensaje(
                    'success',
                    'Tu sesión sigue activa. Abriendo el panel...'
                );


                window.setTimeout(
                    () => {

                        window.location.replace(
                            '/admin.html'
                        );

                    },
                    250
                );


                return true;

            }


            // ==========================================================
            // SESIÓN INVÁLIDA
            // ==========================================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                limpiarSesionLocal();


                establecerCargando(
                    false
                );


                return false;

            }


            // ==========================================================
            // SERVIDOR TEMPORALMENTE NO DISPONIBLE
            // ==========================================================

            if (
                response.status === 503
            ) {

                mostrarMensaje(
                    'warning',
                    data?.message ||
                    'No fue posible validar tu sesión porque el servicio está temporalmente no disponible.'
                );


                establecerCargando(
                    false
                );


                return false;

            }


            // ==========================================================
            // OTRO ERROR
            // ==========================================================

            mostrarMensaje(
                'warning',
                'No fue posible comprobar tu sesión actual. Puedes intentar iniciar sesión nuevamente.'
            );


            establecerCargando(
                false
            );


            return false;


        } catch (error) {

            console.error(
                'Error comprobando sesión existente:',
                error
            );


            // Importante:
            // NO destruimos el token por un error de red.

            mostrarMensaje(
                'warning',
                'No fue posible comprobar tu sesión por un problema de conexión.'
            );


            establecerCargando(
                false
            );


            return false;

        }

    }


    // ======================================================================
    // EVENTOS
    // ======================================================================

    formulario.addEventListener(
        'submit',
        iniciarSesion
    );


    botonPassword?.addEventListener(
        'click',
        alternarPassword
    );


    inputCorreo.addEventListener(
        'input',
        () => {

            if (
                mensaje?.classList.contains(
                    'error'
                )
            ) {

                ocultarMensaje();

            }

        }
    );


    inputPassword.addEventListener(
        'input',
        () => {

            if (
                mensaje?.classList.contains(
                    'error'
                )
            ) {

                ocultarMensaje();

            }

        }
    );


    // ======================================================================
    // INICIALIZACIÓN
    // ======================================================================

    async function inicializarLogin() {

        procesarEstadoURL();


        const redirigiendo =
            await comprobarSesionExistente();


        if (redirigiendo) {
            return;
        }


        // Si no había un mensaje proveniente de auth-guard
        // y tampoco hubo error al validar una sesión existente,
        // simplemente dejamos el formulario disponible.

        if (!mensaje?.hidden) {

            return;

        }


        inputCorreo.focus();

    }


    // ==========================================================================
    // VIDEO DE MARCA
    // ==========================================================================

    function inicializarVideoMarca() {

        const video =
            document.getElementById(
                'loginBrandVideo'
            );

        if (!video) {
            return;
        }


        const mediaDesktop =
            window.matchMedia(
                '(min-width: 901px)'
            );


        const mediaMovimientoReducido =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            );


        const actualizarVideo = () => {

            const puedeReproducir =
                mediaDesktop.matches &&
                !mediaMovimientoReducido.matches;


            if (!puedeReproducir) {

                video.pause();

                return;

            }


            if (!video.src) {

                const src =
                    video.dataset.src;

                if (!src) {
                    return;
                }

                video.src =
                    src;

                video.load();

            }


            const reproduccion =
                video.play();


            if (
                reproduccion &&
                typeof reproduccion.catch ===
                    'function'
            ) {

                reproduccion.catch(
                    () => {
                        // El acceso sigue funcionando
                        // aunque el video no pueda reproducirse.
                    }
                );

            }

        };


        actualizarVideo();


        mediaDesktop.addEventListener(
            'change',
            actualizarVideo
        );


        mediaMovimientoReducido.addEventListener(
            'change',
            actualizarVideo
        );

    }




    inicializarVideoMarca();

})();