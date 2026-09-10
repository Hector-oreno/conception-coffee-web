// public/js/planner/planner-form.js

const PlannerForm = {
    init(ctx) {
        this.cargarCatalogo(ctx);

        this.inicializarSelectorProductos(ctx);

        this.inicializarPrecioPersonalizado(ctx);

        this.inicializarGuarniciones(ctx);

    },


    cargarCatalogo(ctx) {

        const select = document.getElementById("planner-product-select");

        if (!select) return;

        select.innerHTML = `
            <option value="">Seleccione un platillo...</option>
        `;

        
        ctx.catalogo.forEach(producto => {

            select.insertAdjacentHTML(
                "beforeend",
                `
                        <option value="${producto.id}">
                            ${producto.nombre}
                        </option>
                `
            );

        });

        

    },

    // Escucha cuando el usuario selecciona un platillo del catálogo maestro
    inicializarSelectorProductos(ctx) {
        const select = document.getElementById("planner-product-select");
        if (!select) return;

        select.onchange = () => {

            
            const dia = ctx.obtenerDiaActual();
            const idSeleccionado = select.value;

            if (idSeleccionado) {
                dia.producto = Number(idSeleccionado);
                dia.personalizado = false; 
                
                const productoData = ctx.obtenerProducto(dia.producto);

                
                if (typeof PlannerUI !== 'undefined') {
                    PlannerUI.actualizarVistaPrevia(ctx, productoData);
                }

                

            } else {
                dia.producto = null;
            }
            
            ctx.cambiosPendientes = true;

            ctx.renderEditor();


        };
    },

    // Gestiona el checkbox de "Precio Personalizado" y su input numérico
    inicializarPrecioPersonalizado(ctx) {
        const chkPrecio = document.getElementById("chkPrecio");
        const campoPrecio = document.getElementById("plannerPrecioField");
        const inputPrecio = document.getElementById("plannerInputPrecio");

        if (!chkPrecio || !campoPrecio || !inputPrecio) return;

        // Al cambiar el switch de activar/desactivar precio propio
        chkPrecio.onchange = () => {
            campoPrecio.classList.toggle("planner-hidden", !chkPrecio.checked);
            const dia = ctx.obtenerDiaActual();

            if (!chkPrecio.checked) {

                dia.precioPersonalizado = null; 

                if (typeof PlannerArtwork !== "undefined") {
                    PlannerArtwork.render(ctx);
                }

                ctx.renderEditor();

                if (dia.producto) {
                    const prodData = ctx.obtenerProducto(dia.producto);
                    if (typeof PlannerUI !== 'undefined') PlannerUI.actualizarVistaPrevia(ctx, prodData);
                }
            }
            if (typeof PlannerUI !== 'undefined') PlannerUI.actualizarBadge(ctx);
        };

        // Al escribir directamente el precio personalizado
        inputPrecio.oninput = () => {
            const valor = parseFloat(inputPrecio.value);
            const dia = ctx.obtenerDiaActual();

            if (!isNaN(valor) && valor > 0) {

                dia.precioPersonalizado = valor;

                ctx.renderEditor();

                dia.personalizado = true;

                ctx.cambiosPendientes = true;

                if (dia.producto) {
                    const prodData = ctx.obtenerProducto(dia.producto);
                    if (typeof PlannerUI !== 'undefined') PlannerUI.actualizarVistaPrevia(ctx, prodData);
                }
            }
            if (typeof PlannerUI !== 'undefined') PlannerUI.actualizarBadge(ctx);
        };
    },

    // =========================================
    // Checkbox de guarniciones
    // =========================================

    inicializarGuarniciones(ctx) {

        const chk = document.getElementById("chkGuarniciones");

        const campo = document.getElementById("plannerGuarnicionField");

        if (!chk || !campo) return;

        chk.onchange = () => {

            campo.classList.toggle(

                "planner-hidden",

                !chk.checked

            );

            const dia = ctx.obtenerDiaActual();

            dia.personalizado = chk.checked;

            ctx.cambiosPendientes = true;

        };

    },




    // Rellena los campos del formulario cuando el usuario cambia de día en la interfaz
    actualizarPanelPersonalizacion(ctx) {
        const dia = ctx.obtenerDiaActual();
        const inputPrecio = document.getElementById("plannerInputPrecio");
        const chkPrecio = document.getElementById("chkPrecio");
        const campoPrecio = document.getElementById("plannerPrecioField");

        // Sincronizar valor numérico del precio
        if (inputPrecio) {
            inputPrecio.value = dia.precioPersonalizado !== null ? dia.precioPersonalizado : "";
        }

        // Sincronizar el estado visual del contenedor de precio
        if (chkPrecio && campoPrecio) {

            const tienePrecioPropio =
                dia.precioPersonalizado !== null &&
                dia.precioPersonalizado !== "";

            chkPrecio.checked = tienePrecioPropio;

            campoPrecio.classList.toggle(
                "planner-hidden",
                !tienePrecioPropio
            );

            if (!tienePrecioPropio && inputPrecio) {
                inputPrecio.value = "";
            }

        }   

        // Renderizar los chips de guarnición asociados al día actual
        if (typeof PlannerEditor !== 'undefined' && typeof PlannerEditor.renderizarGuarniciones === 'function') {
            PlannerEditor.renderizarGuarniciones(ctx);
        } else if (typeof renderizarGuarniciones === 'function') {
            renderizarGuarniciones(ctx);
        }

        if (typeof PlannerUI !== 'undefined') {
            PlannerUI.actualizarBadge(ctx);
        }


        if (
            typeof PlannerEditor !== "undefined"
        ) {

            PlannerEditor.renderizarPlantillas(ctx);

            PlannerEditor.actualizarEstadoPlantilla(ctx);

        }


        if (
            typeof PlannerArtwork !== "undefined"
        ) {

            PlannerArtwork.render(ctx);

        }


        if (typeof PlannerArtwork !== "undefined") {
            PlannerArtwork.render(ctx);
        }


    },

    

};