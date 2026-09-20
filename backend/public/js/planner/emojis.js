const PlannerEmojis = {


    PALETA: [

    // ==========================================
    // CARNES Y PROTEÍNAS
    // ==========================================

    "🥩", // carne / res
    "🍖", // carne con hueso
    "🍗", // pollo
    "🥓", // tocino
    "🌭", // salchicha
    "🍔", // hamburguesa
    "🧆", // croqueta / falafel
    "🥚", // huevo
    "🍳", // huevo preparado


    // ==========================================
    // PESCADOS Y MARISCOS
    // ==========================================

    "🐟", // pescado
    "🐠", // pescado
    "🍤", // camarón
    "🦐", // camarón
    "🦀", // cangrejo
    "🦞", // langosta
    "🦑", // calamar
    "🐙", // pulpo
    "🦪", // ostra


    // ==========================================
    // ARROZ, PASTA, PAN Y GRANOS
    // ==========================================

    "🍚", // arroz
    "🍙", // arroz
    "🍘", // arroz
    "🍝", // pasta
    "🍜", // fideos
    "🍞", // pan
    "🥖", // baguette
    "🥐", // croissant
    "🫓", // pan plano
    "🌮", // tortilla / taco
    "🫘", // frijoles


    // ==========================================
    // VERDURAS Y GUARNICIONES
    // ==========================================

    "🥔", // papa
    "🍠", // camote / batata
    "🌽", // elote
    "🥕", // zanahoria
    "🥦", // brócoli
    "🥬", // hojas / lechuga
    "🥒", // pepino
    "🍅", // tomate
    "🍆", // berenjena
    "🫑", // chile pimiento
    "🌶️", // chile
    "🧅", // cebolla
    "🧄", // ajo
    "🍄", // hongos
    "🫛", // arvejas / guisantes
    "🥑", // aguacate
    "🥗", // ensalada


    // ==========================================
    // QUESOS Y LÁCTEOS
    // ==========================================

    "🧀", // queso
    "🥛", // leche
    "🧈", // mantequilla


    // ==========================================
    // FRUTAS
    // ==========================================

    "🥭",
    "🍍",
    "🍌",
    "🍎",
    "🍏",
    "🍐",
    "🍊",
    "🍋",
    "🍋‍🟩",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍒",
    "🍑",
    "🥝",
    "🥥",


    // ==========================================
    // PLATILLOS / PREPARACIONES
    // ==========================================

    "🍲", // caldo / sopa
    "🥘", // comida preparada
    "🍛", // arroz con preparación
    "🍱", // plato completo
    "🥣", // bowl / sopa
    "🍽️", // plato general
    "🔥", // asado
    "♨️", // caliente


    // ==========================================
    // COMPLEMENTOS
    // ==========================================

    "🥜", // maní
    "🌰", // nueces
    "🫒", // aceituna
    "🍯", // miel
    "🧂", // sal

    ],

    emojis: [],

    busquedaActual: "",
    viendoInactivos: false,
    modoSeleccion: false,
    resolveSeleccion: null,
    palabraPendiente: null,

    async iniciar() {

        await this.cargarEmojis();

        const input = document.getElementById("buscarEmoji");

        const btnInactivos =
            document.getElementById(
                "btnEmojisInactivos"
            );


        if (btnInactivos) {

            btnInactivos.onclick = () => {

                this.alternarInactivos();

            };

        }



        if (!input) return;

        input.oninput = (e) => {

            const texto =
                e.target.value
                    .trim()
                    .toLowerCase();

            this.busquedaActual = texto;

            if (!texto) {

                this.renderEmojis(
                    this.emojis
                );

                return;
            }

            const filtrados =
                this.emojis.filter(
                    item => {

                        const palabra =
                            String(
                                item.palabra_clave || ""
                            )
                            .toLowerCase();

                        return palabra.includes(
                            texto
                        );

                    }
                );

            this.renderEmojis(
                filtrados,
                texto
            );

        };

    },

    async cargarEmojis() {

        try {

            const result =
                await PlannerAPI.obtenerEmojis();
                

            if (!result.success) return;

            this.emojis = result.data;
            

            this.renderEmojis();

        } catch(error){

            console.error(error);

        }

    },


    renderEmojis(lista = this.emojis, busqueda = "") {

        const contenedor =
            document.getElementById("listaEmojis");

        if (!contenedor) return;

        if (lista.length === 0) {

            // ==========================================
            // DICCIONARIO COMPLETAMENTE VACÍO
            // ==========================================

            if (this.emojis.length === 0) {

                contenedor.innerHTML = `
                    <div class="catalogo-empty">
                        No existen emojis registrados.
                    </div>
                `;

                return;
            }


            // ==========================================
            // SIN RESULTADOS PARA LA BÚSQUEDA
            // ==========================================

            contenedor.innerHTML = `
                <div class="catalogo-empty">

                    <p>
                        No encontramos resultados para
                        <strong>${busqueda}</strong>.
                    </p>

                    ${
                        busqueda
                            ? `
                            <button
                                type="button"
                                id="btnRegistrarEmoji"
                                class="btn-primary">

                                + Registrar "${busqueda}"

                            </button>
                        `
                        : ""
                    }

                </div>
            `;


            // ==========================================
            // EVENTO REGISTRAR
            // ==========================================

            const btnRegistrar =
                document.getElementById(
                    "btnRegistrarEmoji"
                );

            if (btnRegistrar) {

                btnRegistrar.onclick = () => {

                    this.abrirRegistroEmoji(
                        busqueda
                    );

                };

            }

            return;
        }

        contenedor.innerHTML = lista.map(item => `

            <div class="emoji-card">

                <div class="emoji-icon">

                    ${item.emoji}

                </div>

                <div class="emoji-info">

                    <h4>

                        ${item.palabra_clave}

                    </h4>

                </div>

                <div class="emoji-card-actions">

                    <button
                        class="btn-editar-emoji"
                        data-id="${item.id}">

                        <i class="fas fa-pen"></i>

                    </button>

                    <button
                        class="btn-desactivar-emoji"
                        data-id="${item.id}">

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            </div>

        `).join("");


        // ==========================================
        // ACCIONES ADMINISTRATIVAS
        // ==========================================

        if (!this.modoSeleccion) {

            contenedor
                .querySelectorAll(
                    ".btn-editar-emoji"
                )
                .forEach(boton => {

                    boton.onclick = (e) => {

                        e.stopPropagation();

                        const id =
                            Number(
                                boton.dataset.id
                            );


                        const item =
                            this.emojis.find(
                                emoji =>
                                    Number(emoji.id) === id
                            );


                        if (item) {

                            this.abrirEdicionEmoji(
                                item
                            );

                        }

                    };

                });


            contenedor
                .querySelectorAll(
                    ".btn-desactivar-emoji"
                )
                .forEach(boton => {

                    boton.onclick = async (e) => {

                        e.stopPropagation();

                        const id =
                            Number(
                                boton.dataset.id
                            );


                        await this.desactivarEmoji(
                            id
                        );

                    };

                });

        }




        // =====================================
        // MODO SELECCIÓN
        // =====================================

        if (this.modoSeleccion) {

            document
                .querySelectorAll(".emoji-card")
                .forEach((card, index) => {

                    card.classList.add("emoji-card-selectable");

                    card.onclick = async () => {

                        const item = lista[index];

                        try {

                            const result = await PlannerAPI.crearEmoji(
                                this.palabraPendiente,
                                item.emoji
                            );

                            if (!result.success) {

                                alert("No se pudo guardar el emoji.");

                                return;

                            }

                            this.modoSeleccion = false;

                            ocultarModalEstatico("modalEmojis");

                            this.resolveSeleccion(item.emoji);

                            this.resolveSeleccion = null;

                            this.palabraPendiente = null;

                        } catch (error) {

                            console.error(error);

                            alert("Error al guardar el emoji.");

                        }

                    };

                });

            }

    },

    abrirRegistroEmoji(palabra) {

        if (!palabra) return;

        this.palabraPendiente =
            String(palabra)
                .trim()
                .toLowerCase();

        const contenedor =
            document.getElementById(
                "listaEmojis"
            );

        if (!contenedor) return;


        contenedor.innerHTML = `

            <div class="emoji-register">

                <h4>
                    Selecciona un emoji para
                    "${this.palabraPendiente}"
                </h4>

                <div class="emoji-palette">

                    ${this.PALETA.map(emoji => `

                        <button
                            type="button"
                            class="emoji-palette-option"
                            data-emoji="${emoji}">

                            ${emoji}

                        </button>

                    `).join("")}

                </div>

                <button
                    type="button"
                    id="btnCancelarRegistroEmoji"
                    class="btn-secondary">

                    Cancelar

                </button>

            </div>

        `;


        // ==========================================
        // SELECCIONAR EMOJI
        // ==========================================

        contenedor
            .querySelectorAll(
                ".emoji-palette-option"
            )
            .forEach(boton => {

                boton.onclick = async () => {

                    const emoji =
                        boton.dataset.emoji;

                    await this.guardarNuevoEmoji(
                        this.palabraPendiente,
                        emoji
                    );

                };

            });


        // ==========================================
        // CANCELAR
        // ==========================================

        const cancelar =
            document.getElementById(
                "btnCancelarRegistroEmoji"
            );

        if (cancelar) {

            cancelar.onclick = () => {

                this.renderEmojis(
                    this.emojis
                );

            };

        }

    },

    async guardarNuevoEmoji(
        palabra,
        emoji
    ) {

        try {

            const resultado =
                await PlannerAPI.crearEmoji(
                    palabra,
                    emoji
                );


            if (!resultado.success) {

                alert(
                    resultado.message ||
                    "No fue posible registrar el emoji."
                );

                return;

            }


            // ==========================================
            // RECARGAR DESDE MARIA DB
            // ==========================================

            await this.cargarEmojis();

            await this.actualizarMetricas();



            
            // ==========================================
            // LIMPIAR BUSCADOR
            // ==========================================

            const input =
                document.getElementById(
                    "buscarEmoji"
                );

            if (input) {

                input.value =
                    palabra;

            }


            // ==========================================
            // MOSTRAR EL REGISTRO NUEVO
            // ==========================================

            const textoBusqueda =
                String(
                    palabra || ""
                )
                .toLowerCase();


            const encontrados =
                this.emojis.filter(
                    item => {

                        const palabraClave =
                            String(
                                item.palabra_clave || ""
                            )
                            .toLowerCase();

                        return palabraClave.includes(
                            textoBusqueda
                        );

                    }
                );

            this.renderEmojis(
                encontrados,
                palabra
            );


        } catch (error) {

            console.error(
                "Error registrando emoji:",
                error
            );

            alert(
                "No fue posible registrar el emoji."
            );

        }

    },


    async desactivarEmoji(id) {

        const confirmar =
            confirm(
                "¿Deseas desactivar esta asociación de emoji?\n\n" +
                "No se eliminará y podrás reactivarla después."
            );


        if (!confirmar) {
            return;
        }


        const resultado =
            await PlannerAPI.desactivarEmoji(
                id
            );


        if (!resultado.success) {

            alert(
                resultado.message ||
                "No fue posible desactivar el emoji."
            );

            return;

        }


        await this.cargarEmojis();
        await this.actualizarMetricas();


    

    },

 
    async alternarInactivos() {

        const boton =
            document.getElementById(
                "btnEmojisInactivos"
            );


        // ==========================================
        // VOLVER A ACTIVOS
        // ==========================================

        if (this.viendoInactivos) {

            this.viendoInactivos =
                false;


            if (boton) {

                boton.innerHTML = `
                    <i class="fas fa-box-archive"></i>
                    Emojis Inactivos
                `;

            }


            await this.cargarEmojis();

            
            return;

        }


        // ==========================================
        // MOSTRAR INACTIVOS
        // ==========================================

        const resultado =
            await PlannerAPI
                .obtenerEmojisInactivos();


        if (!resultado.success) {

            alert(
                resultado.message ||
                "No fue posible obtener los emojis inactivos."
            );

            return;

        }


        this.viendoInactivos =
            true;


        if (boton) {

            boton.innerHTML = `
                <i class="fas fa-arrow-left"></i>
                Volver al Diccionario
            `;

        }


        this.renderEmojisInactivos(
            resultado.data
        );

    },


    renderEmojisInactivos(lista) {

        const contenedor =
            document.getElementById(
                "listaEmojis"
            );


        if (!contenedor) {
            return;
        }


        if (
            !Array.isArray(lista) ||
            lista.length === 0
        ) {

            contenedor.innerHTML = `
                <div class="catalogo-empty">
                    <p>
                        No existen emojis inactivos.
                    </p>
                </div>
            `;

            return;

        }


        contenedor.innerHTML =
            lista.map(item => `

                <div class="emoji-card emoji-card-inactive">

                    <div class="emoji-icon">
                        ${item.emoji}
                    </div>

                    <div class="emoji-info">

                        <h4>
                            ${item.palabra_clave}
                        </h4>

                        <small>
                            Inactivo
                        </small>

                    </div>

                    <div class="emoji-card-actions">

                        <button
                            type="button"
                            class="btn-reactivar-emoji"
                            data-id="${item.id}"
                            title="Reactivar emoji"
                        >
                            <i class="fas fa-rotate-left"></i>
                        </button>

                    </div>

                </div>

            `).join("");


        contenedor
            .querySelectorAll(
                ".btn-reactivar-emoji"
            )
            .forEach(boton => {

                boton.onclick = async () => {

                    const id =
                        Number(
                            boton.dataset.id
                        );


                    await this.reactivarEmoji(
                        id
                    );

                };

            });

    },


    async reactivarEmoji(id) {

        const resultado =
            await PlannerAPI.reactivarEmoji(
                id
            );


        if (!resultado.success) {

            alert(
                resultado.message ||
                "No fue posible reactivar el emoji."
            );

            return;

        }


        const inactivos =
            await PlannerAPI
                .obtenerEmojisInactivos();


        if (inactivos.success) {

            this.renderEmojisInactivos(
                inactivos.data
            );

        }


        if (
            typeof PlannerDashboard !== "undefined"
        ) {

            await PlannerDashboard
                .cargarMetricasDashboard();

        }

    },


    abrirEdicionEmoji(item) {

        if (!item) {
            return;
        }


        const contenedor =
            document.getElementById(
                "listaEmojis"
            );


        if (!contenedor) {
            return;
        }


        const palabraActual =
            String(
                item.palabra_clave || ""
            );


        const emojiActual =
            String(
                item.emoji || ""
            );


        contenedor.innerHTML = `

            <div class="emoji-register emoji-edit">

                <div class="emoji-edit-header">

                    <span class="emoji-edit-current">
                        ${emojiActual}
                    </span>

                    <div>

                        <h4>
                            Editar asociación
                        </h4>

                        <p>
                            Modifica la palabra o selecciona
                            un nuevo emoji.
                        </p>

                    </div>

                </div>


                <div class="emoji-edit-field">

                    <label for="emojiEditarPalabra">
                        Palabra clave
                    </label>

                    <input
                        type="text"
                        id="emojiEditarPalabra"
                        value="${palabraActual}"
                        autocomplete="off"
                    >

                </div>


                <div class="emoji-edit-field">

                    <label>
                        Emoji
                    </label>

                    <input
                        type="hidden"
                        id="emojiEditarSeleccionado"
                        value="${emojiActual}"
                    >

                    <div class="emoji-palette">

                        ${this.PALETA.map(emoji => `

                            <button
                                type="button"
                                class="emoji-palette-option
                                ${
                                    emoji === emojiActual
                                        ? "selected"
                                        : ""
                                }"
                                data-emoji="${emoji}"
                            >
                                ${emoji}
                            </button>

                        `).join("")}

                    </div>

                </div>


                <div class="emoji-edit-actions">

                    <button
                        type="button"
                        id="btnCancelarEdicionEmoji"
                        class="btn-secondary"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        id="btnGuardarEdicionEmoji"
                        class="btn-primary"
                    >
                        Guardar Cambios
                    </button>

                </div>

            </div>

        `;


        const inputEmoji =
            document.getElementById(
                "emojiEditarSeleccionado"
            );


        contenedor
            .querySelectorAll(
                ".emoji-palette-option"
            )
            .forEach(boton => {

                boton.onclick = () => {

                    contenedor
                        .querySelectorAll(
                            ".emoji-palette-option"
                        )
                        .forEach(opcion => {

                            opcion.classList.remove(
                                "selected"
                            );

                        });


                    boton.classList.add(
                        "selected"
                    );


                    if (inputEmoji) {

                        inputEmoji.value =
                            boton.dataset.emoji;

                    }

                };

            });


        const cancelar =
            document.getElementById(
                "btnCancelarEdicionEmoji"
            );


        if (cancelar) {

            cancelar.onclick = () => {

                this.renderEmojis(
                    this.emojis
                );

            };

        }


        const guardar =
            document.getElementById(
                "btnGuardarEdicionEmoji"
            );


        if (guardar) {

            guardar.onclick = async () => {

                const inputPalabra =
                    document.getElementById(
                        "emojiEditarPalabra"
                    );


                const palabra =
                    String(
                        inputPalabra?.value || ""
                    )
                    .trim()
                    .toLowerCase();


                const emoji =
                    String(
                        inputEmoji?.value || ""
                    )
                    .trim();


                if (!palabra || !emoji) {

                    alert(
                        "La palabra y el emoji son obligatorios."
                    );

                    return;

                }


                const resultado =
                    await PlannerAPI.actualizarEmoji(
                        item.id,
                        palabra,
                        emoji
                    );


                if (!resultado.success) {

                    alert(
                        resultado.message ||
                        "No fue posible actualizar el emoji."
                    );

                    return;

                }


                await this.cargarEmojis();

                await this.actualizarMetricas();

            };

        }

    },

    async actualizarMetricas() {

        if (
            typeof PlannerDashboard !== "undefined" &&
            typeof PlannerDashboard.cargarMetricasDashboard === "function"
        ) {

            await PlannerDashboard
                .cargarMetricasDashboard();

        }

    },



};



