const PlannerCatalogo = {

    catalogo: [],

    modoFormulario: "nuevo",

    platilloEditando: null,

    viendoInactivos: false,

    async iniciar() {

        this.inicializarPreview();

        await this.cargarCatalogo();


        const btnGuardar = document.getElementById("btnGuardarPlatillo");

        if (btnGuardar) {

            btnGuardar.addEventListener("click", (e) => {

                e.preventDefault();

                this.guardarPlatillo();

            });

        }


        const btnNuevo = document.getElementById("btnNuevoPlatilloCatalogo");

        if (btnNuevo) {

            btnNuevo.addEventListener("click", (e) => {

                e.preventDefault();

                e.stopPropagation();

                

                console.log(document.getElementById("modalNuevoPlatillo"));

                mostrarModalEstatico("modalNuevoPlatillo");

            });

        }

        const btnCerrar = document.getElementById("cerrarModalNuevoPlatillo");      

        if (btnCerrar) {

            btnCerrar.addEventListener("click", () => {

                this.cerrarModalNuevo();

            });

        } 
        
        const buscador = document.getElementById("buscarPlatilloCatalogo");

        if (buscador) {

            buscador.addEventListener("input", (e) => {

                this.buscarPlatillo(e.target.value);

            });

        }


        const btnInactivos =
            document.getElementById("btnPlatillosInactivos");

        if (btnInactivos) {

            btnInactivos.addEventListener("click", () => {

                this.abrirInactivos();

            });

        }

    
    },



    abrirModalNuevo() {

        document.getElementById("modalNuevoPlatillo").style.display = "flex";

    },

    cerrarModalNuevo() {

        document.getElementById("modalNuevoPlatillo").style.display = "none";

        ocultarModalEstatico("modalNuevoPlatillo");

    },


    inicializarPreview() {

        const inputImagen = document.getElementById("catalogoImagen");

        if (!inputImagen) return;

        inputImagen.addEventListener("change", e => {

            const archivo = e.target.files[0];

            if (!archivo) return;

            const lector = new FileReader();

            lector.onload = evento => {

                document.getElementById("catalogoPreview").src =
                    evento.target.result;

            };

            lector.readAsDataURL(archivo);

        });

    },

    async cargarCatalogo() {

        try {

            const result = await PlannerAPI.obtenerCatalogo();

            if (!result.success) return;

            this.catalogo = result.data;

            this.renderCatalogo();

        } catch (error) {

            console.error(error);

        }

    },


    async guardarPlatillo() {

        

        try {

            const formData = new FormData();

            formData.append(
                "nombre",
                document.getElementById("catalogoNombre").value.trim()
            );

            formData.append(
                "precio",
                document.getElementById("catalogoPrecio").value
            );

            formData.append(
                "acompanamientos",
                document.getElementById("catalogoGuarniciones").value.trim()
            );

            const inputImagen = document.getElementById("catalogoImagen");

            if (inputImagen && inputImagen.files.length > 0) {

                formData.append(
                "imagen",
                inputImagen.files[0]
            );

        }

            if (!formData.get("nombre")) {

                alert("Ingrese el nombre del platillo.");

                return;

            }

            let result;

           

            if (this.modoFormulario === "nuevo") {

                result = await PlannerAPI.guardarPlatillo(formData);

            } else {

                result = await PlannerAPI.actualizarPlatillo(this.platilloEditando, formData);

            }

            if (!result.success) {

                alert(result.message);

                return;

            }

            alert("Platillo creado correctamente.");

            document.getElementById("catalogoNombre").value = "";

            document.getElementById("catalogoPrecio").value = "";

            document.getElementById("catalogoGuarniciones").value = "";

            document.getElementById("catalogoImagen").value = "";

            document.getElementById("catalogoPreview").src =
                "images/uploads/Logo_carta.png";

            this.limpiarFormulario();

            this.cerrarModalNuevo();

            await this.cargarCatalogo();

            } catch (error) {

            console.error(error);

            alert("Ocurrió un error al guardar el platillo.");

        }

    },



    limpiarFormulario() {

        document.getElementById("catalogoNombre").value = "";

        document.getElementById("catalogoPrecio").value = "";

        document.getElementById("catalogoGuarniciones").value = "";

        document.getElementById("catalogoImagen").value = "";

        document.getElementById("catalogoPreview").src =
            "images/uploads/Logo_carta.png";

        document.getElementById("btnGuardarPlatillo").textContent =
            "Guardar Platillo";

        this.modoFormulario = "nuevo";

        this.platilloEditando = null;

    },



    renderCatalogo(lista = this.catalogo) {

        const contenedor = document.getElementById("listaCatalogo");

        if (!contenedor) return;

        if (lista.length === 0) {

            contenedor.innerHTML = `
                <div class="catalogo-empty">

                    <i class="fas fa-search"></i>

                    <p>No se encontraron platillos.</p>

                </div>
            `;

            return;
        }

        contenedor.innerHTML = lista.map(platillo => `

            

            <div class="catalogo-card">

                <div class="catalogo-card-imagen">

                    <img
                        src="${platillo.imagen_defecto || 'images/uploads/Logo_carta.png'}"
                        alt="${platillo.nombre_plato}">

                </div>

                <div class="catalogo-card-info">

                    <h4>${platillo.nombre_plato}</h4>

                    <span class="catalogo-precio">
                        Q ${parseFloat(platillo.precio_base).toFixed(2)}
                    </span>

                    <p>
                        ${platillo.acompanamientos_defecto || "Sin guarniciones"}
                    </p>

                </div>

                <div class="catalogo-card-actions">

                    <button
                        class="btn-editar"
                        data-id="${platillo.id}">

                        <i class="fas fa-pen"></i>

                    </button>

                    <button
                        class="btn-eliminar"
                        data-id="${platillo.id}">

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            </div>

        `).join("");

        this.activarEventosTarjetas();

    },


    buscarPlatillo(texto) {

        texto = texto.toLowerCase().trim();

        if (!texto) {

            this.renderCatalogo();

            return;

        }

        const resultados = this.catalogo.filter(platillo => {

            return (

                platillo.nombre_plato.toLowerCase().includes(texto) ||

                platillo.acompanamientos_defecto
                    .toLowerCase()
                    .includes(texto)

            );

        });

        this.renderCatalogo(resultados);

    },


    async abrirInactivos() {

        if (this.viendoInactivos) {

            this.viendoInactivos = false;

            document.getElementById("btnPlatillosInactivos").innerHTML =
                '<i class="fas fa-box-archive"></i> Platillos Inactivos';

            await this.cargarCatalogo();

            return;

        }

        this.viendoInactivos = true;

        document.getElementById("btnPlatillosInactivos").innerHTML =
            '<i class="fas fa-arrow-left"></i> Volver al Catálogo';

        const result = await PlannerAPI.obtenerPlatillosInactivos();

        if (!result.success) {

            alert(result.message);

            return;

        }

        this.renderInactivos(result.data);

    },


    renderInactivos(lista) {

        const contenedor = document.getElementById("listaCatalogo");

        if (!contenedor) return;

        if (lista.length === 0) {

            contenedor.innerHTML = `

                <div class="catalogo-empty">

                    No existen platillos inactivos.

                </div>

            `;

            return;

        }

        contenedor.innerHTML = lista.map(platillo => `

            <div class="catalogo-card">

                <div class="catalogo-card-imagen">

                    <img
                        src="${platillo.imagen_defecto || 'images/uploads/Logo_carta.png'}">

                </div>

                <div class="catalogo-card-info">

                    <h4>${platillo.nombre_plato}</h4>

                    <span>

                        Q ${parseFloat(platillo.precio_base).toFixed(2)}

                    </span>

                </div>

                <div class="catalogo-card-actions">

                    <button
                        class="btn-reactivar"
                        data-id="${platillo.id}">

                        ♻️

                    </button>

                </div>

            </div>

        `).join("");

        this.activarEventosInactivos();

    },


    activarEventosInactivos() {

        document
        .querySelectorAll(".btn-reactivar")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const id = Number(btn.dataset.id);

                this.reactivarPlatillo(id);

            });

        });

    },


    async reactivarPlatillo(id) {

        const result =
            await PlannerAPI.reactivarPlatillo(id);

        if (!result.success) {

            alert(result.message);

            return;

        }

        await this.abrirInactivos();

    },



    activarEventosTarjetas() {

        document.querySelectorAll(".btn-editar").forEach(btn => {

            btn.addEventListener("click", () => {

                const id = Number(btn.dataset.id);

                this.editarPlatillo(id);

            });

        });


        document.querySelectorAll(".btn-eliminar").forEach(btn => {

            btn.addEventListener("click", () => {

                const id = Number(btn.dataset.id);

                this.eliminarPlatillo(id);

            });

        });

    },


    editarPlatillo(id) {

        
        const platillo = this.catalogo.find(p => p.id == id);

        if (!platillo) return;

        this.modoFormulario = "editar";

        this.platilloEditando = id;

        document.getElementById("catalogoNombre").value =
            platillo.nombre_plato;

        document.getElementById("catalogoPrecio").value =
            platillo.precio_base;

        document.getElementById("catalogoGuarniciones").value =
            platillo.acompanamientos_defecto;

        document.getElementById("catalogoPreview").src =
            platillo.imagen_defecto || "images/uploads/Logo_carta.png";

        document.getElementById("btnGuardarPlatillo").textContent =
            "Actualizar Platillo";

        mostrarModalEstatico("modalNuevoPlatillo");

    },


    async eliminarPlatillo(id) {

        const confirmar = confirm(
        `¿Desea desactivar este platillo?

        El platillo dejará de aparecer en el catálogo,
        pero podrá reactivarse más adelante.`
        );

        if (!confirmar) return;

        const result = await PlannerAPI.eliminarPlatillo(id);

        if (!result.success) {

            alert(result.message);

            return;

        }

        await this.cargarCatalogo();

        alert("Platillo desactivado correctamente.");

    },


    

};