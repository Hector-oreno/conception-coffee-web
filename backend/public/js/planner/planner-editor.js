
const PlannerEditor = {
    init(ctx) {
        this.inicializarChips(ctx);
        



    },

    inicializarChips(ctx) {

        const input =
            document.getElementById(
                "plannerChipInput"
            );

        const sugerencias =
            document.getElementById(
                "plannerGuarnicionesSugerencias"
            );

        if (!input) return;


        // =====================================================
        // MOSTRAR SUGERENCIAS DEL CATÁLOGO
        // =====================================================

        const mostrarSugerencias = () => {

            if (!sugerencias) return;

            const texto =
                input.value.trim();

            const busqueda =
                texto.toLowerCase();


            // Sin texto → ocultar
            if (!busqueda) {

                sugerencias.innerHTML = "";

                sugerencias.classList.add(
                    "planner-hidden"
                );

                return;
            }


            const catalogo =
                Array.isArray(ctx.guarnicionesCatalogo)
                    ? ctx.guarnicionesCatalogo
                    : [];


            // =================================================
            // BUSCAR COINCIDENCIAS
            // =================================================

            const coincidencias =
                catalogo
                    .filter(guarnicion =>
                        String(guarnicion.nombre)
                            .toLowerCase()
                            .includes(busqueda)
                    )
                    .slice(0, 6);


            sugerencias.innerHTML = "";


            // =================================================
            // GUARNICIONES EXISTENTES
            // =================================================

            coincidencias.forEach(guarnicion => {

                const boton =
                    document.createElement("button");

                boton.type = "button";

                boton.className =
                    "planner-guarnicion-sugerencia";

                boton.textContent =
                    guarnicion.nombre;


                boton.onclick = async () => {

                    await this.agregarGuarnicionAlDia(
                        ctx,
                        guarnicion.nombre
                    );

                    input.value = "";

                    sugerencias.innerHTML = "";

                    sugerencias.classList.add(
                        "planner-hidden"
                    );

                };


                sugerencias.appendChild(
                    boton
                );

            });


            // =================================================
            // COMPROBAR SI YA EXISTE EXACTAMENTE
            // =================================================

            const existeExacta =
                catalogo.some(
                    guarnicion =>
                        String(guarnicion.nombre)
                            .toLowerCase() ===
                        busqueda
                );


            // =================================================
            // CREAR NUEVA GUARNICIÓN
            // =================================================

            if (!existeExacta) {

                const botonCrear =
                    document.createElement("button");

                botonCrear.type =
                    "button";

                botonCrear.className =
                    "planner-guarnicion-sugerencia crear";

                botonCrear.textContent =
                    `+ Crear nueva guarnición "${texto}"`;


                botonCrear.onclick = async () => {

                    await this.crearNuevaGuarnicion(
                        ctx,
                        texto
                    );

                    input.value = "";

                    sugerencias.innerHTML = "";

                    sugerencias.classList.add(
                        "planner-hidden"
                    );

                };


                sugerencias.appendChild(
                    botonCrear
                );

            }


            // =================================================
            // MOSTRAR PANEL
            // =================================================

            sugerencias.classList.remove(
                "planner-hidden"
            );

        };


        // =====================================================
        // EVENTO DE ESCRITURA
        // =====================================================

        input.oninput =
            mostrarSugerencias;


        // =====================================================
        // ENTER
        // =====================================================

        input.onkeydown = async (e) => {

            if (e.key !== "Enter") return;

            e.preventDefault();


            const texto =
                input.value.trim();

            if (!texto) return;


            const catalogo =
                Array.isArray(ctx.guarnicionesCatalogo)
                    ? ctx.guarnicionesCatalogo
                    : [];


            const existente =
                catalogo.find(
                    guarnicion =>
                        String(guarnicion.nombre)
                            .toLowerCase() ===
                        texto.toLowerCase()
                );


            // =================================================
            // SI EXISTE → SELECCIONAR
            // =================================================

            if (existente) {

                await this.agregarGuarnicionAlDia(
                    ctx,
                    existente.nombre
                );

            }

            // =================================================
            // SI NO EXISTE → CREAR
            // =================================================

            else {

                await this.crearNuevaGuarnicion(
                    ctx,
                    texto
                );

            }


            // =================================================
            // LIMPIAR
            // =================================================

            input.value = "";


            if (sugerencias) {

                sugerencias.innerHTML = "";

                sugerencias.classList.add(
                    "planner-hidden"
                );

            }

        };

    },

    renderizarGuarniciones(ctx) {
        const dia = ctx.obtenerDiaActual();
        const contenedor = document.getElementById("plannerChipContainer");
        if (!contenedor) return;

        contenedor.innerHTML = "";

        dia.guarnicionesPersonalizadas.forEach((guarnicion, index) => {

            const chip = document.createElement("div");

            chip.className = "planner-chip";

            chip.innerHTML = `
                <span>${guarnicion}</span>
                <button
                    type="button"
                    data-index="${index}">
                    &times;
                </button>
            `;

            chip.querySelector("button").onclick = () => {
                dia.guarnicionesPersonalizadas.splice(index, 1);

                this.renderizarGuarniciones(ctx);

                if (typeof PlannerArtwork !== "undefined") {
                    PlannerArtwork.render(ctx);
                }

                if (dia.producto) {
                    const prodData = ctx.obtenerProducto(dia.producto);
                    if (typeof PlannerUI !== "undefined") {
                        PlannerUI.actualizarVistaPrevia(ctx, prodData);
                    }
                }

                if (typeof PlannerUI !== "undefined") {
                    PlannerUI.actualizarBadge(ctx);
                }
            };

            contenedor.appendChild(chip);
        });
    },


    async agregarGuarnicionAlDia(ctx, nombre) {

        const dia = ctx.obtenerDiaActual();

        if (!dia) return;

        if (!Array.isArray(dia.guarnicionesPersonalizadas)) {
            dia.guarnicionesPersonalizadas = [];
        }

        const nombreLimpio =
            String(nombre).trim();

        // ==========================================
        // EVITAR DUPLICADOS
        // ==========================================

        const existe =
            dia.guarnicionesPersonalizadas.some(
                guarnicion =>
                    String(guarnicion)
                        .trim()
                        .toLowerCase() ===
                    nombreLimpio.toLowerCase()
            );

        if (existe) return;


        // ==========================================
        // AGREGAR AL DÍA
        // ==========================================

        dia.guarnicionesPersonalizadas.push(
            nombreLimpio
        );

        dia.personalizado = true;

        ctx.cambiosPendientes = true;


        // ==========================================
        // ACTUALIZAR INTERFAZ
        // ==========================================

        this.renderizarGuarniciones(ctx);

        if (typeof PlannerArtwork !== "undefined") {
            PlannerArtwork.render(ctx);
        }

        if (dia.producto) {

            const prodData =
                ctx.obtenerProducto(dia.producto);

            if (typeof PlannerUI !== "undefined") {

                PlannerUI.actualizarVistaPrevia(
                    ctx,
                    prodData
                );

            }

        }

        if (typeof PlannerUI !== "undefined") {

            PlannerUI.actualizarBadge(ctx);

        }

    },


    async crearNuevaGuarnicion(ctx, nombre) {

        const nombreLimpio =
            String(nombre || "").trim();

        if (!nombreLimpio) return;


        try {

            // ==========================================
            // CREAR EN MARIA DB
            // ==========================================

            const resultado =
                await PlannerAPI.crearGuarnicion(
                    nombreLimpio
                );


            if (!resultado.success) {

                alert(
                    resultado.message ||
                    "No fue posible crear la guarnición."
                );

                return;

            }


            // ==========================================
            // REFRESCAR CATÁLOGO DESDE BD
            // ==========================================

            await ctx.cargarGuarnicionesCatalogo();


            // ==========================================
            // AGREGAR AUTOMÁTICAMENTE AL DÍA
            // ==========================================

            await this.agregarGuarnicionAlDia(
                ctx,
                resultado.data.nombre
            );


        } catch (error) {

            console.error(
                "Error creando guarnición:",
                error
            );

            alert(
                "No fue posible crear la guarnición."
            );

        }

    },  
    
    

    renderizarPlantillas(ctx) {

        const grid =
            document.getElementById(
                "plannerTemplateGrid"
            );

        if (!grid) return;


        const dia =
            ctx.obtenerDiaActual();

        if (!dia) return;


        const plantillas =
            Array.isArray(ctx.plantillas)
                ? ctx.plantillas
                : [];



        const plantillaHistoricaActual =
            (ctx.plantillasHistoricas || []).find(
                plantilla =>
                    Number(plantilla.id) ===
                    Number(dia.plantillaId)
            );


        if (plantillas.length === 0) {

            grid.innerHTML = `
                <div class="planner-template-empty">
                    No hay plantillas disponibles.
                </div>
            `;

            return;

        }


        grid.innerHTML =
            plantillas.map(plantilla => {

                const seleccionada =
                    Number(dia.plantillaId) ===
                    Number(plantilla.id);

                return `

                    <button
                        type="button"
                        class="
                            planner-template-option
                            ${seleccionada ? "selected" : ""}
                        "
                        data-template-id="${plantilla.id}">

                        <div class="
                            planner-template-thumbnail
                            template-${plantilla.slug}
                        ">

                            <span>
                                ${this.obtenerInicialPlantilla(
                                    plantilla.nombre
                                )}
                            </span>

                        </div>

                        <div class="planner-template-info">

                            <strong>
                                ${plantilla.nombre}
                            </strong>

                            <small>
                                ${plantilla.descripcion || ""}
                            </small>

                        </div>

                        <span class="planner-template-check">
                            ${seleccionada ? "✓" : ""}
                        </span>

                    </button>

                `;

            }).join("");


        if (plantillaHistoricaActual) {

            grid.insertAdjacentHTML(
                "beforeend",
            `

                <div class="planner-template-historical">

                    <div>
                        <strong>
                            ${plantillaHistoricaActual.nombre}
                        </strong>

                        <small>
                            Plantilla asignada anteriormente.
                            Actualmente está inactiva.
                    </small>
                </div>

                <span>
                    Histórica
                </span>

            </div>

            `
        );

    }


        grid
            .querySelectorAll(
                ".planner-template-option"
            )
            .forEach(boton => {

                boton.onclick = () => {

                    const plantillaId =
                        Number(
                            boton.dataset.templateId
                        );

                    this.seleccionarPlantilla(
                        ctx,
                        plantillaId
                    );

                };

            });

    },


    obtenerInicialPlantilla(nombre) {

        if (!nombre) return "C";

        const partes =
            String(nombre)
                .trim()
                .split(/\s+/);

        return partes.length > 1
            ? partes[1].charAt(0).toUpperCase()
            : partes[0].charAt(0).toUpperCase();

    },



    seleccionarPlantilla(
        ctx,
        plantillaId
    ) {

        const dia =
            ctx.obtenerDiaActual();

        if (!dia) return;


        dia.plantillaId =
            Number(plantillaId);

        ctx.cambiosPendientes =
            true;


        // ==========================================
        // APLICAR A TODA LA SEMANA
        // ==========================================

        const aplicarTodaSemana =
            document.getElementById(
                "chkPlantillaTodaSemana"
            );

        if (
            aplicarTodaSemana &&
            aplicarTodaSemana.checked
        ) {

            Object.values(
                ctx.semana
            ).forEach(diaSemana => {

                diaSemana.plantillaId =
                    Number(plantillaId);

            });

        }


        this.renderizarPlantillas(ctx);

        this.actualizarEstadoPlantilla(ctx);

        if (
            typeof PlannerArtwork !== "undefined"
        ) {

            PlannerArtwork.render(ctx);

        }

    },


    actualizarEstadoPlantilla(ctx) {

        const estado =
            document.getElementById(
                "plannerArtworkStatus"
            );

        if (!estado) return;


        const dia =
            ctx.obtenerDiaActual();

        const plantilla =
            (ctx.plantillas || [])
                .find(
                    item =>
                        Number(item.id) ===
                        Number(dia.plantillaId)
                );


        if (!plantilla) {

            estado.textContent =
                "Sin plantilla";

            return;

        }


        estado.textContent =
            plantilla.nombre;

    },


   
    
    
};