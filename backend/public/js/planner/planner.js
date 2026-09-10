const Planner = {
    // --------------------------------------------------
    // Estado General y Almacenamiento Local Temporal
    // --------------------------------------------------
    diaActual: "LUNES",

    estadoActual: "ACTIVO",

    cambiosPendientes: false,

    sucursalesSeleccionadas: [],

    semanaActual: null,

    catalogoActual: [],


    semanaActualId: null,

    catalogo: [],

    guarnicionesCatalogo: [],

    sucursales: [],

    numeroSemana: null,

    sucursalActualId: null,

    
    fechaInicio: null,

    fechaFin: null,

    semanaInicializada: false,

    semana: {
        LUNES: {},
        MARTES: {},
        MIERCOLES: {},
        JUEVES: {},
        VIERNES: {},
        SABADO: {},
        DOMINGO: {}
    },

    // Copia de la semana cargada desde la base de datos.
    // Nunca se modifica directamente; sirve para restaurar
    // los cambios cuando el usuario pulsa "Cancelar".
    semanaOriginal: {},

    plantillas: [],

    plantillasHistoricas: [],

    // --------------------------------------------------
    // Inicializador Maestro
    // --------------------------------------------------
    iniciar() {

        if (!this.semanaInicializada) {

            this.inicializarSemana();

            this.semanaInicializada = true;

        }

        if (this.catalogo.length === 0) {
            this.cargarCatalogo();
        }

        if (typeof PlannerDashboard !== 'undefined' &&
            typeof PlannerDashboard.iniciar === 'function') {
            PlannerDashboard.iniciar();
        }

        if (typeof PlannerWorkspace !== 'undefined' &&
            typeof PlannerWorkspace.iniciar === 'function') {
            PlannerWorkspace.iniciar();
        }

        // Inicializar componentes distribuidos si están cargados en el cliente
        if (typeof PlannerSidebar !== 'undefined') PlannerSidebar.init(this);
        if (typeof PlannerForm !== 'undefined') PlannerForm.init(this);
        if (typeof PlannerEditor !== 'undefined') PlannerEditor.init(this);

        if (typeof PlannerCatalogo !== "undefined") {
            PlannerCatalogo.iniciar();
        }


        if (typeof PlannerActions !== "undefined") {

            PlannerActions.iniciar();

        }

        this.renderEditor();
    },

    inicializarSemana() {

        const nombresDias = {
            LUNES: "Lunes",
            MARTES: "Martes",
            MIERCOLES: "Miércoles",
            JUEVES: "Jueves",
            VIERNES: "Viernes",
            SABADO: "Sábado",
            DOMINGO: "Domingo"
        };

        Object.keys(this.semana).forEach(dia => {

            this.semana[dia] = {

                dia_semana: nombresDias[dia],

                fecha_especifica: null,

                disponible_web: true,

                estado: "ACTIVO",

                producto: null,

                precioPersonalizado: null,

                guarnicionesPersonalizadas: [],

                observaciones: "",

                personalizado: false,

                plantillaId: null,

            };

        });

    },


    asignarFechasSemana() {

        if (!this.fechaInicio) return;

        const partes = String(this.fechaInicio)
            .substring(0, 10)
            .split("-")
            .map(Number);

        const fechaBase = new Date(
            partes[0],
            partes[1] - 1,
            partes[2]
        );

        Object.keys(this.semana).forEach((dia, index) => {

            const fechaActual = new Date(fechaBase);

            fechaActual.setDate(
                fechaBase.getDate() + index
            );

            const fechaFormateada =
                fechaActual.getFullYear() +
                "-" +
                String(fechaActual.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(fechaActual.getDate()).padStart(2, "0");

            this.semana[dia].fecha_especifica =
                fechaFormateada;

        });

    },




    // Retorna la data del día seleccionado actual
    obtenerDiaActual() {
        return this.semana[this.diaActual];
    },

    // Catálogo mock temporal (Luego se consumirá de PlannerActions / PlannerApi)
    obtenerCatalogoDemo() {
        return {
            1: { id: 1, nombre: "Caldo de Res", precio: 32, imagen: "images/uploads/Logo_carta.png", guarniciones: ["Arroz", "Aguacate"] },
            2: { id: 2, nombre: "Hilachas", precio: 35, imagen: "images/uploads/Logo_carta.png", guarniciones: ["Arroz", "Papa"] },
            3: { id: 3, nombre: "Pepián", precio: 38, imagen: "images/uploads/Logo_carta.png", guarniciones: ["Arroz", "Elote"] },
            4: { id: 4, nombre: "Lomito", precio: 58, imagen: "images/uploads/Logo_carta.png", guarniciones: ["Ensalada", "Papas"] }
        };
    },

    obtenerProducto(id) {

        return this.catalogo.find(
         producto => producto.id == id
        ) ?? null;

    },

    // Disparador de refresco visual global
    renderEditor() {

        if (typeof PlannerUI !== 'undefined') {

            PlannerUI.renderEditor(this);

        }

        if (typeof PlannerSidebar !== 'undefined') {

            PlannerSidebar.render(this);

            PlannerSidebar.actualizarSidebar(this);

        }

    },


    
    

    async abrirPlanner(datosSemana) {

        // ==========================================
        // 1. GUARDAR DATOS RECIBIDOS
        // ==========================================

        this.semanaActual = datosSemana;


        // ==========================================
        // 2. SEMANA EXISTENTE
        //    Viene como ARRAY desde la grilla
        // ==========================================

        if (
            Array.isArray(datosSemana) &&
            datosSemana.length > 0
        ) {

            this.semanaActualId =
                datosSemana[0].semana_id;

            // Compatibilidad temporal
            window.semanaSeleccionadaId =
                this.semanaActualId;

            this.numeroSemana =
                datosSemana[0].numero_semana;

            this.fechaInicio =
                datosSemana[0].fecha_inicio;

            this.fechaFin =
                datosSemana[0].fecha_fin;

            this.estadoSemana =
                datosSemana[0].estado;


            // Convertir backend → estado interno
            this.cargarSemana();

        }


        // ==========================================
        // 3. SEMANA NUEVA
        //    Viene como OBJETO
        // ==========================================

        else if (
            datosSemana &&
            !Array.isArray(datosSemana)
        ) {

            this.inicializarSemana();

            this.semanaActualId =
                datosSemana.id;

            // Compatibilidad temporal
            window.semanaSeleccionadaId =
                this.semanaActualId;

            this.numeroSemana =
                datosSemana.numero_semana;

            this.fechaInicio =
                datosSemana.fecha_inicio;

            this.fechaFin =
                datosSemana.fecha_fin;

            this.estadoSemana =
                datosSemana.estado;

            this.asignarFechasSemana();

        }


        // ==========================================
        // 4. CARGAR INFORMACIÓN AUXILIAR
        // ==========================================

        await Promise.all([

            this.cargarSucursales(),

            this.cargarGuarnicionesCatalogo(),

            this.cargarPlantillas()

        ]);


        // ==========================================
        // PLANTILLAS HISTÓRICAS
        // ==========================================

        this.cargarPlantillasHistoricas(datosSemana);


        // ==========================================
        // 5. MOSTRAR PLANNER
        // ==========================================

        const modal =
            document.getElementById(
                "plannerWorkspace"
            );

        if (modal) {

            modal.style.display =
                "flex";

        }


        // ==========================================
        // 6. CARGAR CATÁLOGO DE PLATILLOS
        // ==========================================

        if (
            typeof PlannerForm !== "undefined" &&
            typeof PlannerForm.cargarCatalogo === "function"
        ) {

            await PlannerForm.cargarCatalogo(this);

        }


        // ==========================================
        // 7. RENDER PRINCIPAL
        // ==========================================

        this.renderEditor();


        // ==========================================
        // 8. RENDER DE PLANTILLAS
        // ==========================================

        if (
            typeof PlannerEditor !== "undefined"
        ) {

            PlannerEditor.renderizarPlantillas(
                this
            );

            PlannerEditor.actualizarEstadoPlantilla(
                this
            );

        }

    },

    cargarSemana() {

        if (!Array.isArray(this.semanaActual)) return;

        this.inicializarSemana();

        
        this.semanaActual.forEach(dia => {

            

            const nombreDia = dia.dia_semana
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toUpperCase();

            if (!this.semana[nombreDia]) return;

            this.semana[nombreDia] = {

                dia_semana: dia.dia_semana,

                fecha_especifica: dia.fecha_especifica,

                disponible_web: Boolean(dia.disponible_web),

                estado: dia.estado_dia,

                producto: dia.plato_catalogo_id,

                precioPersonalizado: dia.precio_real,

                guarnicionesPersonalizadas:
                    dia.acompanamientos
                    ? dia.acompanamientos
                        .split(",")
                        .map(g => g.trim())
                    : [],

                observaciones: dia.texto_alternativo || "",

                personalizado: false,

                plantillaId:
                    dia.plantilla_id
                        ? Number(dia.plantilla_id)
                        : null,

            };

        });

    },

    async cargarCatalogo() {

        try {

            const result = await PlannerAPI.obtenerCatalogo();

            if (result.success) {

                
                this.catalogo = result.data.map(producto => ({
                    

                    id: producto.id,

                    nombre: producto.nombre_plato,

                    precio: Number(producto.precio_base ?? 0),

                    imagen: producto.imagen_defecto || "images/uploads/Logo_carta.png",

                    guarniciones: producto.acompanamientos_defecto
                        ? producto.acompanamientos_defecto.split(",").map(g => g.trim())
                        : []

                }));


                if (typeof PlannerForm !== 'undefined') {
                    PlannerForm.cargarCatalogo(this);
                }
                
                

            }

        } catch (error) {

            console.error(
                "Error al cargar el catálogo:",
                error
            );

            

        }

    },

  

    
    async cargarSucursales() {

        const container =
            document.getElementById(
                "plannerSucursalesContainer"
            );

        const chkTodas =
            document.getElementById(
                "chkSucursalesTodas"
            );

        if (!container) return;

        try {

            const sucursales =
                await PlannerAPI.obtenerSucursales();

            this.sucursales =
                Array.isArray(sucursales)
                    ? sucursales
                    : [];

            const activas =
                this.sucursales.filter(
                    sucursal =>
                        Number(sucursal.activa) === 1
                );

            container.innerHTML = "";

            // Restaurar "Todas" para usuarios con permiso global
            if (chkTodas) {

                const contenedorTodas =
                    chkTodas.closest(
                        ".planner-check"
                    );

                if (contenedorTodas) {

                    contenedorTodas.style.display =
                        "";

                }

            }


            // ==========================================
            // GERENTE: SOLO SU SUCURSAL ASIGNADA
            // ==========================================

            const usuarioSesion =
                JSON.parse(
                    localStorage.getItem(
                        "usuario_conception"
                    ) || "null"
                );

            // ==========================================
            // CONTROL DEL BOTÓN PUBLICAR
            // ==========================================

            const btnPublicar =
                document.getElementById(
                    "plannerBtnPublicar"
                );


            if (btnPublicar) {

                btnPublicar.style.display =
                    usuarioSesion?.rol === "admin"
                        ? ""
                        : "none";

            }



            if (
                usuarioSesion &&
                usuarioSesion.rol === "gerente"
            ) {

                const sucursalUsuarioId =
                    Number(
                        usuarioSesion.sucursal_id
                    );


                const sucursalAsignada =
                    activas.find(
                        sucursal =>
                            Number(sucursal.id) ===
                            sucursalUsuarioId
                    );


                // ======================================
                // VALIDAR SUCURSAL
                // ======================================

                if (!sucursalAsignada) {

                    container.innerHTML = `
                        <small>
                            No tienes una sucursal activa asignada.
                        </small>
                    `;

                    this.sucursalActualId =
                        null;

                    this.sucursalesSeleccionadas =
                        [];

                    return;

                }


                // ======================================
                // ESTADO INTERNO DEL PLANNER
                // ======================================

                this.sucursalActualId =
                    sucursalUsuarioId;

                this.sucursalesSeleccionadas = [
                    sucursalUsuarioId
                ];


                // ======================================
                // MOSTRAR SUCURSAL SIN CHECKBOX
                // ======================================

                container.innerHTML = `

                    <div class="planner-gerente-sucursal">

                        <i class="fas fa-map-marker-alt"></i>

                        <div>

                            <small>
                                Sucursal asignada
                            </small>

                            <strong>
                                ${sucursalAsignada.nombre}
                            </strong>

                        </div>

                    </div>

                `;


                // ======================================
                // OCULTAR "TODAS"
                // ======================================

                if (chkTodas) {

                    const contenedorTodas =
                        chkTodas.closest(
                            ".planner-check"
                        );

                    if (contenedorTodas) {

                        contenedorTodas.style.display =
                            "none";

                    } else {

                        chkTodas.style.display =
                            "none";

                    }

                }


                // IMPORTANTE:
                // El gerente termina aquí.
                // No continúa creando checkboxes.
                return;

            }

            if (activas.length === 0) {

                container.innerHTML = `
                    <small>
                        No hay sucursales activas.
                    </small>
                `;

                this.sucursalActualId = null;

                return;

            }

            activas.forEach(sucursal => {

                const label =
                    document.createElement("label");

                label.className =
                    "planner-check planner-branch-item";

                label.innerHTML = `
                    <input
                        type="checkbox"
                        class="planner-sucursal-check"
                        value="${sucursal.id}"
                    >

                    <span>
                        ${sucursal.nombre}
                    </span>
                `;

                container.appendChild(label);

            });


            // ==========================================
            // CONSULTAR QUÉ SUCURSALES YA ESTÁN
            // PLANIFICADAS PARA ESTA SEMANA
            // ==========================================

            let planificadas = [];

            if (this.semanaActualId) {

                const resultado =
                    await PlannerAPI
                        .obtenerSucursalesPlanificadas(
                            this.semanaActualId
                        );

                if (
                    resultado.success &&
                    Array.isArray(resultado.data)
                ) {

                    planificadas =
                        resultado.data.map(Number);

                }

            }


            // ==========================================
            // SEMANA SIN PLANIFICACIÓN TODAVÍA
            // ==========================================

            if (planificadas.length === 0) {

                this.sucursalActualId =
                    Number(activas[0].id);

                this.sucursalesSeleccionadas = [
                    this.sucursalActualId
                ];

            } else {

                this.sucursalesSeleccionadas =
                    planificadas;

                this.sucursalActualId =
                    planificadas[0];

            }


            // ==========================================
            // REFLEJAR ESTADO DE BD EN CHECKBOXES
            // ==========================================

            container
                .querySelectorAll(
                    ".planner-sucursal-check"
                )
                .forEach(check => {

                    check.checked =
                        this.sucursalesSeleccionadas
                            .includes(
                                Number(check.value)
                            );

                });


            // ==========================================
            // CHECKBOX "TODAS"
            // ==========================================

            if (chkTodas) {

                chkTodas.checked =
                    activas.length > 0 &&
                        this.sucursalesSeleccionadas.length ===
                            activas.length;

            }

            

            // ==========================================
            // EVENTOS DE SUCURSALES
            // ==========================================

            container
                .querySelectorAll(
                    ".planner-sucursal-check"
                )
                .forEach(check => {

                    check.addEventListener(
                        "change",
                        () => {

                            this.actualizarSucursalesSeleccionadas();

                        }
                    );

                });


            // ==========================================
            // EVENTO "TODAS"
            // ==========================================

            if (chkTodas) {

                chkTodas.checked = false;

                chkTodas.onchange = () => {

                    const checks =
                        container.querySelectorAll(
                            ".planner-sucursal-check"
                        );

                    checks.forEach(check => {

                        check.checked =
                            chkTodas.checked;

                    });

                    this.actualizarSucursalesSeleccionadas();

                };

            }

        } catch (error) {

            console.error(
                "Error cargando sucursales:",
                error
            );

            container.innerHTML = `
                <small>
                    No fue posible cargar las sucursales.
                </small>
            `;

        }

    },


    actualizarSucursalesSeleccionadas() {

        const checks =
            document.querySelectorAll(
                "#plannerSucursalesContainer .planner-sucursal-check:checked"
            );

        this.sucursalesSeleccionadas =
            Array.from(checks)
                .map(check =>
                    Number(check.value)
                );


        

        const todosLosChecks =
            document.querySelectorAll(
                "#plannerSucursalesContainer .planner-sucursal-check"
            );

        const chkTodas =
            document.getElementById(
            "chkSucursalesTodas"
        );

        if (chkTodas) {

            chkTodas.checked =
                todosLosChecks.length > 0 &&
                    this.sucursalesSeleccionadas.length ===
                        todosLosChecks.length;

        }



        
        // Mantener una sucursal actual
        // para el editor individual
        this.sucursalActualId =
            this.sucursalesSeleccionadas.length > 0
                ? this.sucursalesSeleccionadas[0]
                : null;


        
    },


    async cargarGuarnicionesCatalogo() {

        try {

            const resultado =
                await PlannerAPI.obtenerGuarniciones();

            if (
                resultado.success &&
                Array.isArray(resultado.data)
            ) {

                this.guarnicionesCatalogo =
                    resultado.data;

            } else {

                this.guarnicionesCatalogo = [];

            }

        } catch (error) {

            console.error(
                "Error cargando catálogo de guarniciones:",
                error
            );

            this.guarnicionesCatalogo = [];

        }

    },


    async cargarPlantillas() {

        try {

            const resultado =
                await PlannerAPI.obtenerPlantillas();

            if (
                resultado.success &&
                Array.isArray(resultado.data)
            ) {

                this.plantillas =
                    resultado.data;

            } else {

                this.plantillas = [];

            }

        } catch (error) {

            console.error(
                "Error cargando plantillas:",
                error
            );

            this.plantillas = [];

        }

    },


    cargarPlantillasHistoricas(datosSemana) {

        this.plantillasHistoricas = [];

        if (!Array.isArray(datosSemana)) {
            return;
        }


        datosSemana.forEach(dia => {

            // ==========================================
            // NO TIENE PLANTILLA
            // ==========================================

            if (!dia.plantilla_id) {
                return;
            }


            // ==========================================
            // SI ESTÁ ACTIVA, YA EXISTE EN plantillas
            // ==========================================

            const existeActiva =
                (this.plantillas || []).some(
                    plantilla =>
                        Number(plantilla.id) ===
                        Number(dia.plantilla_id)
                );


            if (existeActiva) {
                return;
            }


            // ==========================================
            // LA GRILLA DEBE TRAER SU INFORMACIÓN
            // ==========================================

            if (!dia.plantilla_slug) {
                return;
            }


            // ==========================================
            // EVITAR DUPLICADOS
            // ==========================================

            const existeHistorica =
                this.plantillasHistoricas.some(
                    plantilla =>
                        Number(plantilla.id) ===
                        Number(dia.plantilla_id)
                );


            if (existeHistorica) {
                return;
            }


            // ==========================================
            // CONFIGURACIÓN
            // ==========================================

            let configuracion = {};


            if (dia.plantilla_configuracion) {

                try {

                    configuracion =
                        typeof dia.plantilla_configuracion === "string"
                            ? JSON.parse(
                                dia.plantilla_configuracion
                            )
                            : dia.plantilla_configuracion;

                } catch (error) {

                    console.error(
                        "Configuración histórica inválida:",
                        error
                    );

                }

            }


            // ==========================================
            // REGISTRAR SOLO PARA RENDER HISTÓRICO
            // ==========================================

            this.plantillasHistoricas.push({

                id:
                    Number(dia.plantilla_id),

                nombre:
                    dia.plantilla_nombre,

                slug:
                    dia.plantilla_slug,

                configuracion,

                activa:
                    Number(
                        dia.plantilla_activa
                    ) === 1

            });

        });

    },



};


window.semanaSeleccionadaId = null;

window.Planner = Planner;