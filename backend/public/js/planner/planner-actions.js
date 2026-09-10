const PlannerActions = {

    semanaCalendarioSeleccionada: null,
     
    async guardarPlanificacion() {

        if (!Planner.semanaActualId) {

            alert("No hay una semana seleccionada.");

            return;
        }

        // ==========================================
        // CONSTRUIR PLANIFICACIÓN DE LOS 7 DÍAS
        // ==========================================

        const dias = [];

        Object.values(Planner.semana).forEach(dia => {

            dias.push({

                dia_semana:
                    dia.dia_semana,

                fecha_especifica:
                    dia.fecha_especifica
                        ? String(dia.fecha_especifica).substring(0, 10)
                        : null,

                estado_dia:
                    dia.estado,

                disponible_web:
                    dia.disponible_web ? 1 : 0,

                plato_catalogo_id:
                    dia.producto,

                precio_real:
                    dia.precioPersonalizado,

                acompanamientos_especificos:
                    Array.isArray(dia.guarnicionesPersonalizadas)
                        ? dia.guarnicionesPersonalizadas.join(",")
                        : null,

                texto_alternativo:
                    dia.observaciones,


                plantilla_id:
                    dia.plantillaId
                        ? Number(dia.plantillaId)
                        : null

            });

        });


        // ==========================================
        // VALIDAR SUCURSALES SELECCIONADAS
        // ==========================================

        const sucursales =
            Planner.sucursalesSeleccionadas;

        if (
            !Array.isArray(sucursales) ||
            sucursales.length === 0
        ) {

            alert(
                "Selecciona al menos una sucursal."
            );

            return;
        }


        // ==========================================
        // GUARDAR PLANIFICACIÓN POR SUCURSAL
        // ==========================================

        try {

            for (const sucursalId of sucursales) {

                const payload = {

                    semana_id:
                        Planner.semanaActualId,

                    sucursal_id:
                        sucursalId,

                    dias

                };

                const resultado =
                    await PlannerAPI.guardarSemana(
                        payload
                    );

                if (!resultado.success) {

                    throw new Error(
                        resultado.message ||
                        `No fue posible guardar la sucursal ${sucursalId}.`
                    );

                }

            }


            // ==========================================
            // CONFIRMACIÓN
            // ==========================================

            alert(
                sucursales.length === 1
                    ? "Planificación guardada correctamente."
                    : `Planificación guardada en ${sucursales.length} sucursales correctamente.`
            );


        } catch (error) {

            console.error(
                "Error al guardar planificación:",
                error
            );

            alert(
                "No fue posible guardar toda la planificación."
            );

        }

    },    


    async publicarSemana(ctx) {

        // ==========================================
        // VALIDAR SEMANA COMPLETA
        // ==========================================

        const pendientes =
            this.validarSemanaCompleta(ctx);

        if (pendientes.length > 0) {

            alert(

                "No es posible publicar la semana.\n\n" +

                "Faltan completar los siguientes días:\n\n" +

                pendientes.join("\n")

            );

            return;

        }


        // ==========================================
        // VALIDAR IDENTIDAD DE LA SEMANA
        // ==========================================

        if (!Planner.semanaActualId) {

            alert(
                "No hay una semana seleccionada para publicar."
            );

            return;

        }


        try {

            const respuesta =
                await PlannerAPI.publicarSemana(
                    Planner.semanaActualId
                );


            if (respuesta.success) {

                Planner.estadoSemana =
                    "PUBLICADA";


                if (
                    typeof PlannerUI !== "undefined"
                ) {

                    PlannerUI.actualizarBadge(
                        Planner
                    );

                }


                alert(
                    "Semana publicada correctamente."
                );


                ocultarModalEstatico(
                    "plannerWorkspace"
                );


                if (
                    typeof PlannerDashboard !== "undefined"
                ) {

                    await PlannerDashboard
                        .cargarHistorialSemanas();

                }

            } else {

                alert(
                    respuesta.message ||
                    "No fue posible publicar la semana."
                );

            }


        } catch (error) {

            console.error(
                "Error al publicar la semana:",
                error
            );

            alert(
                "No fue posible publicar la semana."
            );

        }

    },


    

    async crearNuevaSemanaEstrategica() {

        try {

            const resultado = await PlannerAPI.crearSemana();

            if (!resultado.success || !resultado.data) {

                throw new Error(
                    resultado.message ||
                    "No fue posible crear la nueva semana."
                );

            }

            // ==========================================
            // 1. REFRESCAR DASHBOARD DESDE LA BD
            // ==========================================

            if (
                typeof PlannerDashboard !== "undefined" &&
                typeof PlannerDashboard.cargarHistorialSemanas === "function"
            ) {

                await PlannerDashboard.cargarHistorialSemanas();

            }

            // ==========================================
            // 2. ABRIR LA SEMANA RECIÉN CREADA
            // ==========================================

            Planner.abrirPlanner(resultado.data);

        } catch (error) {

            console.error(
                "Error al crear la semana:",
                error
            );

            alert(
                "No fue posible crear la nueva semana."
            );

        }

    },


    iniciar() {

        const btnGuardar =
            document.getElementById("plannerBtnGuardar");

        if (btnGuardar) {

            btnGuardar.onclick = () => {

                PlannerActions.guardarPlanificacion();

            };

        }

        const btnCancelar =
            document.getElementById("plannerBtnCancelar");

        if (btnCancelar) {

            btnCancelar.onclick = () => {

                ocultarModalEstatico("plannerWorkspace");

            };

        }

        const btnPublicar =
            document.getElementById("plannerBtnPublicar");

        if (btnPublicar) {

            btnPublicar.onclick = () => {

                PlannerActions.publicarSemana(Planner);

            };

        }

    },


    async abrirSelectorSemana() {

        // ==========================================
        // SEGURIDAD VISUAL / FUNCIONAL
        // SOLO ADMIN PUEDE PLANIFICAR NUEVAS SEMANAS
        // ==========================================

        const usuarioSesion =
            JSON.parse(
                localStorage.getItem(
                    "usuario_conception"
                ) || "null"
            );


        if (
            !usuarioSesion ||
            usuarioSesion.rol !== "admin"
        ) {

            console.warn(
                "Acceso denegado: solo un administrador puede crear nuevas semanas."
            );

            return;

        }


        // ==========================================
        // ELEMENTOS DEL MODAL
        // ==========================================

        const modal =
            document.getElementById(
                "modalSeleccionSemana"
            );

        const contenedor =
            document.getElementById(
                "plannerSemanasDisponibles"
            );

        const btnCrear =
            document.getElementById(
                "btnCrearSemanaSeleccionada"
            );


        if (!modal || !contenedor) {
            return;
        }


        // ==========================================
        // LIMPIAR SELECCIÓN ANTERIOR
        // ==========================================

        this.semanaCalendarioSeleccionada =
            null;


        if (btnCrear) {

            btnCrear.disabled =
                true;

        }


        // ==========================================
        // ABRIR MODAL
        // ==========================================

        modal.style.display =
            "flex";


        contenedor.innerHTML =
            "<p>Cargando semanas disponibles...</p>";


        // ==========================================
        // CARGAR SEMANAS DISPONIBLES
        // ==========================================

        try {

            const resultado =
                await PlannerAPI
                    .obtenerSemanasDisponibles(3);


            if (!resultado.success) {

                contenedor.innerHTML =
                    "<p>No fue posible cargar el calendario.</p>";

                return;

            }


            this.renderSemanasDisponibles(
                resultado.data
            );


        } catch (error) {

            console.error(
                "Error cargando semanas disponibles:",
                error
            );


            contenedor.innerHTML =
                "<p>No fue posible cargar el calendario.</p>";

        }

    },


    cerrarSelectorSemana() {

        const modal =
            document.getElementById("modalSeleccionSemana");

        if (modal) {
            modal.style.display = "none";
        }

        this.semanaCalendarioSeleccionada = null;

    },



    renderSemanasDisponibles(semanas) {

        const contenedor =
            document.getElementById(
                "plannerSemanasDisponibles"
            );

        if (!contenedor) return;


        if (!Array.isArray(semanas) || semanas.length === 0) {

            contenedor.innerHTML =
                "<p>No hay semanas disponibles.</p>";

            return;

        }


        contenedor.innerHTML = semanas
            .map(semana => {

                const inicio =
                    this.formatearFechaCalendario(
                        semana.fecha_inicio
                    );

                const fin =
                    this.formatearFechaCalendario(
                        semana.fecha_fin
                    );


                // ======================================
                // SEMANA YA EXISTENTE
                // ======================================

                if (!semana.disponible) {

                    return `
                        <button
                            type="button"
                            class="planner-week-option existing"
                            disabled>

                            <span class="planner-week-range">
                                ${inicio} — ${fin}
                            </span>

                            <span class="planner-week-status">
                                Semana ${semana.numero_semana}
                                · ${semana.estado}
                            </span>

                        </button>
                    `;

                }


                // ======================================
                // SEMANA DISPONIBLE
                // ======================================

                return `
                    <button
                        type="button"
                        class="planner-week-option"
                        data-fecha-inicio="${semana.fecha_inicio}"
                        onclick="
                            PlannerActions.seleccionarSemanaCalendario(
                                this,
                                '${semana.fecha_inicio}'
                            )
                        ">

                        <span class="planner-week-range">
                            ${inicio} — ${fin}
                        </span>

                        <span class="planner-week-status available">
                            Disponible
                        </span>

                    </button>
                `;

            })
            .join("");

    },


    formatearFechaCalendario(fechaTexto) {

        const partes =
            fechaTexto.split("-");

        const fecha =
            new Date(
                Number(partes[0]),
                Number(partes[1]) - 1,
                Number(partes[2])
            );

        return fecha.toLocaleDateString(
            "es-GT",
            {
                day: "numeric",
                month: "short"
            }
        );

    },


    seleccionarSemanaCalendario(
        elemento,
        fechaInicio
    ) {

        document
            .querySelectorAll(".planner-week-option")
            .forEach(opcion => {
                opcion.classList.remove("selected");
            });


        elemento.classList.add("selected");

        this.semanaCalendarioSeleccionada =
            fechaInicio;


        const btnCrear =
            document.getElementById(
                "btnCrearSemanaSeleccionada"
            );

        if (btnCrear) {
            btnCrear.disabled = false;
        }

    },



    async crearSemanaSeleccionada() {

        if (!this.semanaCalendarioSeleccionada) {

            alert(
                "Selecciona una semana para continuar."
            );

            return;

        }


        const fechaInicio =
            this.semanaCalendarioSeleccionada;


        try {

            const resultado =
                await PlannerAPI.crearSemana(
                    fechaInicio
                );


            if (!resultado.success) {

                alert(
                    resultado.message ||
                    "No fue posible crear la semana."
                );

                return;

            }


            // Cerrar selector
            this.cerrarSelectorSemana();


            // Refrescar historial desde BD
            if (
                typeof PlannerDashboard !== "undefined" &&
                typeof PlannerDashboard.cargarHistorialSemanas === "function"
            ) {

                await PlannerDashboard
                    .cargarHistorialSemanas();

            }


            // Abrir planificación recién creada
            Planner.abrirPlanner(
                resultado.data
            );


        } catch (error) {

            console.error(
                "Error creando semana:",
                error
            );

            alert(
                "No fue posible crear la planificación."
            );

        }

    },


    validarSemanaCompleta(ctx) {

        const pendientes = [];

        Object.values(ctx.semana).forEach(dia => {

            if (

                dia.estado === "ACTIVO" &&

                !dia.producto

            ) {

                pendientes.push(dia.dia_semana);

            }

        });

        return pendientes;

    },


    async obtenerTextoWhatsApp(semanaId) {

        try {

            // ==========================================
            // USUARIO ACTUAL
            // ==========================================

            const usuarioSesion =
                JSON.parse(
                    localStorage.getItem(
                        "usuario_conception"
                    ) || "null"
                );


            if (!usuarioSesion) {

                alert(
                    "No se encontró una sesión válida."
                );

                return;

            }


            // ==========================================
            // DETERMINAR SUCURSAL
            // ==========================================

            let sucursalId = null;


            // GERENTE:
            // siempre utiliza su sucursal asignada
            if (usuarioSesion.rol === "gerente") {

                sucursalId =
                    Number(
                        usuarioSesion.sucursal_id
                    );

            }


            // ADMIN:
            // utiliza la sucursal actualmente
            // seleccionada en el Planner
            else if (usuarioSesion.rol === "admin") {

                sucursalId =
                    Number(
                        Planner.sucursalActualId
                    );

            }


            // ==========================================
            // VALIDAR SUCURSAL
            // ==========================================

            if (
                !Number.isInteger(sucursalId) ||
                sucursalId <= 0
            ) {

                alert(
                    "Selecciona una sucursal antes de generar el texto de WhatsApp."
                );

                return;

            }


            // ==========================================
            // GENERAR TEXTO
            // ==========================================

            const result =
                await PlannerAPI.generarWhatsApp(
                    semanaId,
                    sucursalId
                );


            if (!result.success) {

                alert(
                    result.message ||
                    "No fue posible generar el texto de WhatsApp."
                );

                return;

            }


            // ==========================================
            // COPIAR AL PORTAPAPELES
            // ==========================================

            await navigator.clipboard.writeText(
                result.textoWhatsApp
            );


            alert(
                "¡Texto con emojis generado y copiado al portapapeles con éxito! 📋☕"
            );


        } catch (error) {

            console.error(
                "Error al procesar el texto de WhatsApp:",
                error
            );

            alert(
                "No fue posible generar el texto de WhatsApp."
            );

        }

    },


    async confirmarEliminarSemana(
        semanaId,
        numeroSemana,
        estado
    ) {

        let mensaje =
            `¿Eliminar la Semana ${numeroSemana}?\n\n` +
            `Se eliminará también toda la planificación asociada.`;

        if (estado === "PUBLICADA") {

            mensaje =
                `⚠️ La Semana ${numeroSemana} está PUBLICADA.\n\n` +
                `Si la eliminas, dejará de estar programada para mostrarse ` +
                `cuando llegue su fecha.\n\n` +
                `¿Deseas eliminarla de todos modos?`;

        }

        const confirmado = window.confirm(mensaje);

        if (!confirmado) return;


        try {

            const resultado =
                await PlannerAPI.eliminarSemana(semanaId);


            if (!resultado.success) {

                alert(
                    resultado.message ||
                    "No fue posible eliminar la semana."
                );

                return;

            }


            // ==========================================
            // REFRESCAR HISTORIAL DESDE LA BD
            // ==========================================

            if (
                typeof PlannerDashboard !== "undefined" &&
                typeof PlannerDashboard.cargarHistorialSemanas === "function"
            ) {

                await PlannerDashboard.cargarHistorialSemanas();

            }


            alert(resultado.message);

        } catch (error) {

            console.error(
                "Error al eliminar semana:",
                error
            );

            alert(
                "Ocurrió un error al eliminar la semana."
            );

        }

    },



};

window.PlannerActions = PlannerActions;