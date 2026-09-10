const PlantillasAdmin = {

    plantillas: [],

    plantillaEditando: null,
    configTemporal: null,

    configuracionesOriginales: {

        "conception-clasica": {

            colorPrimario:
                "#FF6A0A",

            colorSecundario:
                "#FFD36D",

            colorFondoInferior:
                "#FFF8E6",

            mostrarPrecio:
                true,

            mostrarGuarniciones:
                true,

            mostrarTelefono:
                true,

            mostrarDireccion:
                true,

            mostrarLogo:
                true

        },


        "conception-moderna": {

            colorPrimario:
                "#5D2C18",

            colorAcento:
                "#FF6A0A",

            colorFondo:
                "#F4EEE8",

            mostrarPrecio:
                true,

            mostrarGuarniciones:
                true,

            mostrarTelefono:
                true,

            mostrarDireccion:
                true,

            mostrarLogo:
                true

        },


        "conception-premium": {

            colorPrimario:
                "#24150F",

            colorAcento:
                "#D8B176",

            colorFondoInferior:
                "#F5EEE5",

            mostrarPrecio:
                true,

            mostrarGuarniciones:
                true,

            mostrarTelefono:
                true,

            mostrarDireccion:
                true,

            mostrarLogo:
                true

        }

    },


    // ======================================================
    // INICIAR
    // ======================================================

    async iniciar() {

        await this.cargarPlantillas();

    },


    // ======================================================
    // CARGAR PLANTILLAS
    // ======================================================

    async cargarPlantillas() {

        const grid =
            document.getElementById(
                "plantillasAdminGrid"
            );

        if (!grid) {

            console.warn(
                "No se encontró #plantillasAdminGrid."
            );

            return;

        }


        try {

            grid.innerHTML = `

                <div class="plantillas-loading">

                    <i class="fas fa-spinner fa-spin"></i>

                    Cargando plantillas...

                </div>

            `;


            const resultado =
                await PlannerAPI.obtenerPlantillasAdmin();


            if (
                !resultado.success ||
                !Array.isArray(resultado.data)
            ) {

                throw new Error(
                    resultado.message ||
                    "Respuesta inválida del servidor."
                );

            }


            this.plantillas =
                resultado.data;


            this.renderizar();


        } catch (error) {

            console.error(
                "Error cargando plantillas:",
                error
            );


            grid.innerHTML = `

                <div class="plantillas-error">

                    <i class="fas fa-triangle-exclamation"></i>

                    <strong>
                        No fue posible cargar las plantillas.
                    </strong>

                </div>

            `;

        }

    },


    // ======================================================
    // RENDERIZAR
    // ======================================================

    renderizar() {

        const grid =
            document.getElementById(
                "plantillasAdminGrid"
            );

        if (!grid) return;


        if (this.plantillas.length === 0) {

            grid.innerHTML = `

                <div class="plantillas-empty">
                    No existen plantillas registradas.
                </div>

            `;

            return;

        }


        grid.innerHTML =
            this.plantillas
                .map(
                    plantilla =>
                        this.crearTarjeta(
                            plantilla
                        )
                )
                .join("");

        this.inicializarEventosTarjetas();

    },


    // ======================================================
    // CREAR TARJETA
    // ======================================================

    crearTarjeta(plantilla) {

        const activa =
            Number(plantilla.activa) === 1;


        return `

            <article class="plantilla-admin-card">

                <div
                    class="
                        plantilla-admin-preview
                        plantilla-preview-${plantilla.slug}
                    "
                >

                    <span>
                        ${this.obtenerInicial(
                            plantilla.nombre
                        )}
                    </span>

                </div>


                <div class="plantilla-admin-body">

                    <div class="plantilla-admin-title">

                        <div>

                            <h3>
                                ${plantilla.nombre}
                            </h3>

                            <p>
                                ${plantilla.descripcion || ""}
                            </p>

                        </div>


                        <span
                            class="
                                plantilla-status
                                ${activa
                                    ? "activa"
                                    : "inactiva"}
                            "
                        >

                            ${activa
                                ? "Activa"
                                : "Inactiva"}

                        </span>

                    </div>


                    <div class="plantilla-admin-actions">

                        <button
                            type="button"
                            class="btn-configurar-plantilla"
                            data-id="${plantilla.id}"
                        >

                            <i class="fas fa-sliders"></i>

                            Configurar

                        </button>

                    </div>

                </div>

            </article>

        `;

    },


    // ======================================================
    // INICIAL
    // ======================================================

    obtenerInicial(nombre) {

        const partes =
            String(nombre || "")
                .trim()
                .split(/\s+/);


        return partes.length > 1
            ? partes[1]
                .charAt(0)
                .toUpperCase()
            : "P";

    },


    inicializarEventosTarjetas() {

        document
            .querySelectorAll(
                ".btn-configurar-plantilla"
            )
            .forEach(boton => {

                boton.onclick = () => {

                    const plantillaId =
                        Number(
                            boton.dataset.id
                        );

                    this.abrirConfigurador(
                        plantillaId
                    );

                };

            });

    },


    abrirConfigurador(plantillaId) {

        const plantilla =
            this.plantillas.find(
                item =>
                    Number(item.id) ===
                    Number(plantillaId)
            );

        if (!plantilla) {

            console.error(
                "Plantilla no encontrada:",
                plantillaId
            );

            return;
        }


        // ==========================================
        // GUARDAR PLANTILLA ACTUAL
        // ==========================================

        this.plantillaEditando =
            plantilla;


        // ==========================================
        // COPIA INDEPENDIENTE DE CONFIGURACIÓN
        // ==========================================

        this.configTemporal =
            JSON.parse(
                JSON.stringify(
                    plantilla.configuracion || {}
                )
            );


        // ==========================================
        // TÍTULO Y DESCRIPCIÓN
        // ==========================================

        const titulo =
            document.getElementById(
                "plantillaConfigTitulo"
            );

        const descripcion =
            document.getElementById(
                "plantillaConfigDescripcion"
            );


        if (titulo) {

            titulo.textContent =
                plantilla.nombre;

        }


        if (descripcion) {

            descripcion.textContent =
                plantilla.descripcion || "";

        }


        // ==========================================
        // CARGAR COLORES
        // ==========================================

        this.renderizarControlesColores();


        // ==========================================
        // CARGAR SWITCHES
        // ==========================================

        this.cargarSwitches();


        // ==========================================
        // EVENTOS DEL MODAL
        // ==========================================

        this.inicializarEventosConfigurador();


        // ==========================================
        // VISTA PREVIA
        // ==========================================

        this.renderizarPreview();


        // ==========================================
        // MOSTRAR MODAL
        // ==========================================

        const modal =
            document.getElementById(
                "modalConfigPlantilla"
            );

        if (modal) {

            modal.style.display =
                "flex";

        }

        this.inicializarModalArrastrable();

    },



    obtenerDefinicionColores() {

        if (!this.plantillaEditando) {
            return [];
        }


        switch (
            this.plantillaEditando.slug
        ) {

            case "conception-clasica":

                return [

                    {
                        clave:
                            "colorPrimario",

                        etiqueta:
                            "Color principal"
                    },

                    {
                        clave:
                            "colorSecundario",

                        etiqueta:
                            "Color de acento"
                    },

                    {
                        clave:
                            "colorFondoInferior",

                        etiqueta:
                            "Fondo inferior"
                    }

                ];


            case "conception-moderna":

                return [

                    {
                        clave:
                            "colorPrimario",

                        etiqueta:
                            "Color principal"
                    },

                    {
                        clave:
                            "colorAcento",

                        etiqueta:
                            "Color de acento"
                    },

                    {
                        clave:
                            "colorFondo",

                        etiqueta:
                            "Color de fondo"
                    }

                ];


            case "conception-premium":

                return [

                    {
                        clave:
                            "colorPrimario",

                        etiqueta:
                            "Color principal"
                    },

                    {
                        clave:
                            "colorAcento",

                        etiqueta:
                            "Color dorado / acento"
                    },

                    {
                        clave:
                            "colorFondoInferior",

                        etiqueta:
                            "Fondo inferior"
                    }

                ];


            default:

                return [];

        }

    },


    renderizarControlesColores() {

        const contenedor =
            document.getElementById(
                "plantillaConfigColores"
            );

        if (!contenedor) return;


        const definiciones =
            this.obtenerDefinicionColores();


        contenedor.innerHTML =
            definiciones
                .map(definicion => {

                    const valor =
                        this.configTemporal[
                            definicion.clave
                        ] || "#000000";


                    return `

                        <label class="plantilla-color-row">

                            <span>
                                ${definicion.etiqueta}
                            </span>


                            <input
                                type="color"
                                class="plantilla-color-input"
                                data-config-key="${definicion.clave}"
                                value="${valor}"
                            >


                            <span
                                class="plantilla-color-value"
                                data-color-value="${definicion.clave}"
                            >
                                ${valor}
                            </span>

                        </label>

                    `;

                })
                .join("");


        // ==========================================
        // CAMBIO DE COLOR EN VIVO
        // ==========================================

        contenedor
            .querySelectorAll(
                ".plantilla-color-input"
            )
            .forEach(input => {

                input.oninput = () => {

                    const clave =
                        input.dataset.configKey;

                    const valor =
                        input.value;


                    this.configTemporal[
                        clave
                    ] = valor;


                    const texto =
                        contenedor.querySelector(
                            `[data-color-value="${clave}"]`
                        );

                    if (texto) {

                        texto.textContent =
                            valor.toUpperCase();

                    }


                    this.renderizarPreview();

                };

            });

    },



    cargarSwitches() {

        const config =
            this.configTemporal || {};


        const campos = {

            configMostrarPrecio:
                "mostrarPrecio",

            configMostrarGuarniciones:
                "mostrarGuarniciones",

            configMostrarTelefono:
                "mostrarTelefono",

            configMostrarDireccion:
                "mostrarDireccion",

            configMostrarLogo:
                "mostrarLogo"

        };


        Object.entries(
            campos
        ).forEach(
            ([elementoId, propiedad]) => {

                const elemento =
                    document.getElementById(
                        elementoId
                    );

                if (!elemento) return;


                elemento.checked =
                    config[propiedad] !== false;

            }
        );


        const activa =
            document.getElementById(
                "configPlantillaActiva"
            );


        if (activa) {

            activa.checked =
                this.plantillaEditando?.activa === true ||
                Number(this.plantillaEditando?.activa) === 1;

        }   

    },


    inicializarEventosConfigurador() {

        const campos = {

            configMostrarPrecio:
                "mostrarPrecio",

            configMostrarGuarniciones:
                "mostrarGuarniciones",

            configMostrarTelefono:
                "mostrarTelefono",

            configMostrarDireccion:
                "mostrarDireccion",

            configMostrarLogo:
                "mostrarLogo"

        };


        const activa =
            document.getElementById(
                "configPlantillaActiva"
            );

        if (activa) {

            activa.onchange = () => {

                this.renderizarPreview();

            };

        }


        Object.entries(
            campos
        ).forEach(
            ([elementoId, propiedad]) => {

                const elemento =
                    document.getElementById(
                        elementoId
                    );

                if (!elemento) return;


                elemento.onchange = () => {

                    this.configTemporal[
                        propiedad
                    ] = elemento.checked;


                    this.renderizarPreview();

                };

            }
        );


        // ==========================================
        // CERRAR / CANCELAR
        // ==========================================

        const cerrar =
            document.getElementById(
                "btnCerrarConfigPlantilla"
            );

        const cancelar =
            document.getElementById(
                "btnCancelarConfigPlantilla"
            );


        if (cerrar) {

            cerrar.onclick = () =>
                this.cerrarConfigurador();

        }


        if (cancelar) {

            cancelar.onclick = () =>
                this.cerrarConfigurador();

        }


        const guardar =
            document.getElementById(
            "btnGuardarConfigPlantilla"
        );


        if (guardar) {

            guardar.onclick = () =>
                this.guardarConfiguracion();

        }

        const restaurar =
            document.getElementById(
                "btnRestaurarConfigPlantilla"
            );


        if (restaurar) {

            restaurar.onclick = () => {

                this.restaurarConfiguracion();

        };

    }




    },


    cerrarConfigurador() {

        const overlay =
            document.getElementById(
                "modalConfigPlantilla"
            );

        const modal =
            document.querySelector(
                ".plantilla-config-modal"
            );


        // ==========================================
        // OCULTAR
        // ==========================================

        if (overlay) {

            overlay.style.display =
                "none";

        }


        // ==========================================
        // RESTAURAR POSICIÓN ORIGINAL
        // ==========================================

        if (modal) {

            modal.style.position = "";

            modal.style.left = "";

            modal.style.top = "";

            modal.style.margin = "";

        }


        // ==========================================
        // LIMPIAR ESTADO
        // ==========================================

        this.plantillaEditando =
            null;

        this.configTemporal =
            null;

    },


    obtenerDatosDemo() {

        return {

            dia:
                "Lunes",

            fecha:
                "2026-08-24",

            plato:
                "Caldo de pata (res)",

            precio:
                32,

            guarniciones: [
                "Arroz",
                "Aguacate"
            ],


            // Usamos una imagen que ya sabemos que existe
            // en tu proyecto.
            imagen:
                "/images/uploads/Logo_carta.png",


            sucursal: {

                id: 1,

                nombre:
                    "Conception Coffee",

                telefono:
                    "5987-8068",

                direccion:
                    "KM 87.5 Carretera al Pacífico, Santa Lucía Cotzumalguapa, interior de Gasolinera Texaco",

                horario:
                    "Lunes a Domingo · 7:00 AM – 9:00 PM"

            }

        };

    },



    renderizarPreview() {

        const contenedor =
            document.getElementById(
                "plantillaConfigPreview"
            );

        if (
            !contenedor ||
            !this.plantillaEditando
        ) {

            return;

        }


        // ==========================================
        // BUSCAR RENDERER REAL
        // ==========================================

        const renderer =
            window.PlannerArtworkTemplates?.[
                this.plantillaEditando.slug
            ];


        if (
            !renderer ||
            typeof renderer.render !== "function"
        ) {

            contenedor.innerHTML = `

                <div class="plantillas-error">

                    No existe un renderer para
                    ${this.plantillaEditando.nombre}.

                </div>

            `;

            return;

        }


        // ==========================================
        // DATOS DEMO
        // ==========================================

        const datos =
            this.obtenerDatosDemo();


        // ==========================================
        // PLANTILLA TEMPORAL
        // ==========================================

        datos.plantilla = {

            ...this.plantillaEditando,

            configuracion:
                this.configTemporal

        };


        // ==========================================
        // UTILIZAR EL MISMO RENDERER DEL PLANNER
        // ==========================================

        renderer.render(
            contenedor,
            datos
        );

    },


    async guardarConfiguracion() {

        if (
            !this.plantillaEditando ||
            !this.configTemporal
        ) {

            return;

        }


        const boton =
            document.getElementById(
                "btnGuardarConfigPlantilla"
            );


        const chkActiva =
            document.getElementById(
                "configPlantillaActiva"
            );


        const activa =
            chkActiva
                ? chkActiva.checked
                : true;


        try {

            // ==========================================
            // BLOQUEAR BOTÓN
            // ==========================================

            if (boton) {

                boton.disabled = true;

                boton.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Guardando...
                `;

            }


            // ==========================================
            // GUARDAR EN API
            // ==========================================

            const resultado =
                await PlannerAPI
                    .actualizarConfiguracionPlantilla(
                        this.plantillaEditando.id,
                        this.configTemporal,
                        activa
                    );


            if (!resultado.success) {

                throw new Error(
                    resultado.message ||
                    "No fue posible guardar la configuración."
                );

            }


            // ==========================================
            // CERRAR CONFIGURADOR
            // ==========================================

            this.cerrarConfigurador();


            // ==========================================
            // RECARGAR TARJETAS DESDE BD
            // ==========================================

            await this.cargarPlantillas();


            // ==========================================
            // CONFIRMACIÓN
            // ==========================================

            console.log(
                "Plantilla actualizada correctamente."
            );


        } catch (error) {

            console.error(
                "Error guardando plantilla:",
                error
            );


            alert(
                error.message ||
                "No fue posible guardar la plantilla."
            );


        } finally {

            if (boton) {

                boton.disabled = false;

                boton.innerHTML = `
                    <i class="fas fa-save"></i>
                    Guardar cambios
                `;

            }

        }

    },



    restaurarConfiguracion() {

        if (!this.plantillaEditando) {
            return;
        }


        const slug =
            this.plantillaEditando.slug;


        const original =
            this.configuracionesOriginales[
                slug
            ];


        if (!original) {

            console.warn(
                "No existe configuración original para:",
                slug
            );

            return;

        }


        // ==========================================
        // CREAR COPIA LIMPIA
        // ==========================================

        this.configTemporal =
            JSON.parse(
                JSON.stringify(original)
            );


        // ==========================================
        // ACTUALIZAR CONTROLES
        // ==========================================

        this.renderizarControlesColores();

        this.cargarSwitches();


        // ==========================================
        // ACTUALIZAR PREVIEW
        // ==========================================

        this.renderizarPreview();

    },


    inicializarModalArrastrable() {

        const modal =
            document.querySelector(
                ".plantilla-config-modal"
            );

        const handle =
            document.getElementById(
                "plantillaConfigDragHandle"
            );


        if (!modal || !handle) {
            return;
        }


        // Evitar registrar los eventos varias veces
        if (modal.dataset.draggableInicializado === "1") {
            return;
        }

        modal.dataset.draggableInicializado = "1";


        let arrastrando = false;

        let offsetX = 0;
        let offsetY = 0;


        // ==========================================
        // COMENZAR A ARRASTRAR
        // ==========================================

        handle.addEventListener(
            "mousedown",
            (event) => {

                // No arrastrar al pulsar botones del header
                if (
                    event.target.closest("button")
                ) {
                    return;
                }


                const rect =
                    modal.getBoundingClientRect();


                // Convertimos la posición centrada
                // a coordenadas fijas
                modal.style.position =
                    "fixed";

                modal.style.left =
                    `${rect.left}px`;

                modal.style.top =
                    `${rect.top}px`;

                modal.style.margin =
                    "0";


                offsetX =
                    event.clientX -
                    rect.left;

                offsetY =
                    event.clientY -
                    rect.top;


                arrastrando = true;

            }
        );


        // ==========================================
        // MOVER
        // ==========================================

        document.addEventListener(
            "mousemove",
            (event) => {

                if (!arrastrando) {
                    return;
                }


                let nuevaX =
                    event.clientX -
                    offsetX;

                let nuevaY =
                    event.clientY -
                    offsetY;


                // ======================================
                // EVITAR SACAR EL MODAL DE LA PANTALLA
                // ======================================

                const ancho =
                    modal.offsetWidth;

                const alto =
                    modal.offsetHeight;


                const margen = 10;


                nuevaX =
                    Math.max(
                        margen,
                        Math.min(
                            nuevaX,
                            window.innerWidth -
                            ancho -
                            margen
                        )
                    );


                nuevaY =
                    Math.max(
                        margen,
                        Math.min(
                            nuevaY,
                            window.innerHeight -
                            alto -
                            margen
                        )
                    );


                modal.style.left =
                    `${nuevaX}px`;

                modal.style.top =
                    `${nuevaY}px`;

            }
        );


        // ==========================================
        // TERMINAR
        // ==========================================

        document.addEventListener(
            "mouseup",
            () => {

                arrastrando = false;

            }
        );

    },




};


window.PlantillasAdmin =
    PlantillasAdmin;