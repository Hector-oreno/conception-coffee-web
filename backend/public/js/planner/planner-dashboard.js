const PlannerDashboard = {

    async iniciar() {

        await this.cargarMetricasDashboard();

        await this.cargarHistorialSemanas();

        this.inicializarFiltros();

        // ==========================================
        // PERMISOS VISUALES DEL DASHBOARD
        // ==========================================

        const usuarioSesion =
            JSON.parse(
                localStorage.getItem(
                    "usuario_conception"
                ) || "null"
            );


        const esAdmin =
            usuarioSesion?.rol === "admin";


        const btnPlanificar =
            document.getElementById(
                "plannerBtnPlanificarSemana"
            );


        if (btnPlanificar) {

            btnPlanificar.style.display =
                esAdmin
                    ? ""
                    : "none";

        }




        document
            .getElementById("plannerKpiCatalogo")
            ?.addEventListener("click", async () => {

                mostrarModalEstatico("modalCatalogo");

                if (typeof PlannerCatalogo !== "undefined") {

                await PlannerCatalogo.cargarCatalogo();

            }

        });

        document
            .getElementById("plannerKpiEmojis")
            ?.addEventListener("click", async () => {

                mostrarModalEstatico("modalEmojis");

                if (typeof PlannerEmojis !== "undefined") {

                await PlannerEmojis.iniciar();

            }

        });

        document
            .getElementById("btnNuevoPlatilloCatalogo")
            ?.addEventListener("click", () => {

                ocultarModalEstatico("modalCatalogo");

                mostrarModalEstatico("modalNuevoPlatillo");

        });

        document
            .getElementById("cerrarModalNuevoPlatillo")
            ?.addEventListener("click", () => {

                ocultarModalEstatico("modalNuevoPlatillo");

                mostrarModalEstatico("modalCatalogo");

        });


        

    },

    async cargarMetricasDashboard() {

        try {

            // Usamos PlannerAPI porque ya envía
            // el token de autenticación
            const result =
                await PlannerAPI.obtenerMetricas();


            if (result.success) {

                // Total de platillos
                document
                    .getElementById('lbl-total-platillos')
                    .textContent =
                        result.data.totalPlatillos;


                // Total de emojis
                document
                    .getElementById('lbl-total-emojis')
                    .textContent =
                        result.data.totalEmojis;

            }

        } catch (error) {

            console.error(
                'Error al cargar métricas:',
                error
            );

        }

    },

    async cargarHistorialSemanas() {

        try {
            const result = await PlannerAPI.obtenerHistorial();
        
            const tablaBody = document.getElementById('tabla-historial-semanas');
            tablaBody.innerHTML = ''; // Limpiamos la tabla antes de renderizar


            const usuarioSesion =
                JSON.parse(
                    localStorage.getItem(
                        "usuario_conception"
                    ) || "null"
                );

            const esAdmin =
                usuarioSesion?.rol === "admin";
        
            if (!result.success || result.data.length === 0) {
                 tablaBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay semanas planificadas aún.</td></tr>`;
                return;
            }
        
            const filtroAnio =
                document.getElementById(
                    "plannerFiltroAnio"
                );


            if (filtroAnio) {

                const valorActual =
                    filtroAnio.value;


                const anios =
                    [
                        ...new Set(
                            result.data.map(
                                semana =>
                                    String(
                                        semana.fecha_inicio
                                    ).substring(0, 4)
                            )
                        )
                    ]
                    .sort();


                filtroAnio.innerHTML = `
                    <option value="">
                        Todos los años
                    </option>
                `;


                anios.forEach(anio => {

                    filtroAnio.insertAdjacentHTML(
                        "beforeend",
                        `
                        <option value="${anio}">
                            ${anio}
                        </option>
                        `
                    );

                });


                if (
                    anios.includes(
                        valorActual
                    )
                ) {

                    filtroAnio.value =
                        valorActual;

                }

            }



            result.data.forEach(semana => {
                 // Formateamos las fechas de forma legible local (DD/MM/AAAA)
                const fechaInicio = new Date(semana.fecha_inicio).toLocaleDateString('es-GT', { timeZone: 'UTC' });
                const fechaFin = new Date(semana.fecha_fin).toLocaleDateString('es-GT', { timeZone: 'UTC' });
                const fechaCreado = new Date(semana.creado_en).toLocaleDateString('es-GT');


                // ==========================================
                // ESTADO TEMPORAL CALCULADO
                // ==========================================

                const hoy = new Date();

                hoy.setHours(0, 0, 0, 0);

                const inicioSemana = new Date(
                    `${String(semana.fecha_inicio).substring(0, 10)}T00:00:00`  
                );

                const finSemana = new Date(
                    `${String(semana.fecha_fin).substring(0, 10)}T00:00:00`
                );

                let estadoTemporal = "";
                let estadoTemporalClass = "";

                if (semana.estado === "PUBLICADA") {

                    if (hoy < inicioSemana) {

                        estadoTemporal = "PROGRAMADA";
                        estadoTemporalClass = "bg-info text-dark";

                    } else if (hoy > finSemana) {

                        estadoTemporal = "FINALIZADA";
                        estadoTemporalClass = "bg-secondary";

                    } else {

                        estadoTemporal = "ACTIVA";
                        estadoTemporalClass = "bg-success";

                    }

                }



                // Badge de estado dinámico según el valor de la BD
                const badgeClass = semana.estado === 'PUBLICADA' ? 'bg-success' : 'bg-warning text-dark';
            
                const fila = `
                    <tr
                        data-semana="${semana.numero_semana}"
                        data-rango="${fechaInicio} al ${fechaFin}"
                        data-anio="${String(semana.fecha_inicio).substring(0, 4)}"
                        data-estado="${semana.estado}"
                    >
                        <td><strong>Semana N° ${semana.numero_semana}</strong></td>
                        <td>${fechaInicio} al ${fechaFin}</td>
                        <td>
                            <span class="badge ${badgeClass}">
                                ${semana.estado}
                            </span>

                            ${
                                estadoTemporal
                                    ? `
                                        <span class="badge ${estadoTemporalClass} ms-1">
                                            ${estadoTemporal}
                                        </span>
                                    `
                                    : ""
                            }

                        </td>
                        <td><small class="text-muted">${fechaCreado}</small></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="PlannerWorkspace.editarPlanificacionSemanal(${semana.id})">
                                <i class="fas fa-edit"></i> Gestionar Menú
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="PlannerActions.obtenerTextoWhatsApp(${semana.id})">
                                <i class="fab fa-whatsapp"></i> Texto WA
                            </button>
                            ${
                                esAdmin
                                    ?`
                                        <button
                                            class="btn btn-sm btn-outline-danger ms-1"
                                            onclick="PlannerActions.confirmarEliminarSemana(
                                                ${semana.id},
                                                ${semana.numero_semana},
                                                '${semana.estado}'
                                            )"
                                            title="Eliminar semana"
                                        >
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    `
                                    : ""
                            }


                        </td>
                    </tr>
                `;
                tablaBody.insertAdjacentHTML('beforeend', fila);
            });
        } catch (error) {
            console.error('Error al cargar historial:', error);
        }



    },

    inicializarFiltros() {

        const buscar =
            document.getElementById(
                "plannerBuscarSemana"
            );

        const filtroAnio =
            document.getElementById(
                "plannerFiltroAnio"
            );

        const filtroEstado =
            document.getElementById(
                "plannerFiltroEstado"
            );


        const aplicarFiltros = () => {

            const texto =
                buscar?.value
                    .trim()
                    .toLowerCase() || "";


            const anio =
                filtroAnio?.value || "";


            const estado =
                filtroEstado?.value || "";


            const filas =
                document.querySelectorAll(
                    "#tabla-historial-semanas tr[data-semana]"
                );


            filas.forEach(fila => {

                const numeroSemana =
                    fila.dataset.semana || "";

                const rango =
                    fila.dataset.rango
                        ?.toLowerCase() || "";

                const filaAnio =
                    fila.dataset.anio || "";

                const filaEstado =
                    fila.dataset.estado || "";


                const coincideTexto =
                    !texto ||
                    numeroSemana.includes(texto) ||
                    `semana ${numeroSemana}`.includes(texto) ||
                    rango.includes(texto);


                const coincideAnio =
                    !anio ||
                    filaAnio === anio;


                const coincideEstado =
                    !estado ||
                    filaEstado === estado;


                fila.style.display =
                    coincideTexto &&
                    coincideAnio &&
                    coincideEstado
                        ? ""
                        : "none";

            });

        };


        if (buscar) {
            buscar.oninput =
                aplicarFiltros;
        }


        if (filtroAnio) {
            filtroAnio.onchange =
                aplicarFiltros;
        }


        if (filtroEstado) {
            filtroEstado.onchange =
                aplicarFiltros;
        }

    },




};

window.PlannerDashboard = PlannerDashboard;