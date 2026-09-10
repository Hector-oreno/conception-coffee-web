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

    modoSeleccion: false,
    resolveSeleccion: null,
    palabraPendiente: null,

    async iniciar() {

        await this.cargarEmojis();

        const input = document.getElementById("buscarEmoji");

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
                this.emojis.filter(item =>
                    String(item.palabra_clave)
                        .toLowerCase()
                        .includes(texto)
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


        // =====================================
        // MODO SELECCIÓN
        // =====================================

        if (this.modoSeleccion) {

            document
                .querySelectorAll(".emoji-card")
                .forEach((card, index) => {

                    card.style.cursor = "pointer";

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

            const encontrados =
                this.emojis.filter(
                    item =>
                        item.palabra_clave
                            .toLowerCase()
                            .includes(
                                palabra.toLowerCase()
                            )
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


    async seleccionarEmoji(palabra) {

        this.modoSeleccion = true;
        this.palabraPendiente = palabra;

        await this.cargarEmojis();

        mostrarModalEstatico("modalEmojis");

        this.renderEmojis();

        return new Promise(resolve => {

            this.resolveSeleccion = resolve;

        });

    },

    
    

};



