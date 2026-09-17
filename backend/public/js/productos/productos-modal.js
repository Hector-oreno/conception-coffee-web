const ProductosModal = {

    
    cerrarModal() {

        document.getElementById('modal-producto').style.display = 'none';

    },

    async abrirEditar(id) {
        try {

            if (typeof colapsarSidebarAdmin === 'function') {
                colapsarSidebarAdmin();
            }

            // Obtenemos la sucursal seleccionada desde el estado de la app
            const sucursalId =
                Productos.obtenerSucursalSeleccionada();

            // Llamamos a la capa de acciones para traer la data limpia
            const resultado = await ProductosActions.obtenerProductoPorId(id, sucursalId);

            if (resultado.success) {
                const prod = resultado.data;

                // Llenado y comportamiento estético del formulario
                document.getElementById('modal-title').innerText = 'Editar Producto';
                document.getElementById('producto-id').value = prod.id;
                document.getElementById('prod-nombre').value = prod.nombre;
                document.getElementById('prod-precio').value = prod.precio; 
                document.getElementById('prod-categoria').value = prod.categoria_id; 
                document.getElementById('prod-descripcion').value = prod.descripcion || '';
                document.getElementById('prod-destacado').checked = prod.destacado === 1;
                
                
                // Desplegar visualmente el contenedor del modal
                document.getElementById('modal-producto').style.display = 'flex';
            } else {
                alert('No se pudieron obtener los datos: ' + resultado.message);
            }
        } catch (error) {
            console.error('Error al renderizar el modal de edición:', error);
        }
    },


    // Abre el modal configurado para crear un producto nuevo
    abrirCrear() {

        // ======================================================
        // COLAPSAR SIDEBAR PARA DAR MÁS ESPACIO
        // ======================================================

        if (
            typeof colapsarSidebarAdmin ===
            'function'
        ) {

            colapsarSidebarAdmin();

        }


        // ======================================================
        // LIMPIAR FORMULARIO
        // ======================================================

        this.limpiarFormulario();


        // ======================================================
        // ELEMENTOS DEL MODAL
        // ======================================================

        const titulo =
            document.getElementById(
                'modal-title'
            );

        const selectSucursal =
            document.getElementById(
                'selectSucursal'
            );

        const contenedor =
            document.getElementById(
                'contenedor-sucursales-modal'
            );


        // ======================================================
        // CONFIGURAR TÍTULO
        // ======================================================

        if (titulo) {

            titulo.innerText =
                'Agregar Nuevo Producto';

        }


        // ======================================================
        // GENERAR SUCURSALES DISPONIBLES
        // ======================================================

        if (
            contenedor &&
            selectSucursal
        ) {

            contenedor.innerHTML = '';


            Array
                .from(selectSucursal.options)
                .forEach(option => {

                    if (!option.value) {
                        return;
                    }


                    const seleccionada =
                        option.value ===
                        selectSucursal.value;


                    const label =
                        document.createElement(
                            'label'
                        );


                    label.className =
                        'branch-card';


                    label.innerHTML = `

                        <input
                            type="checkbox"
                            name="sucursales_alta"
                            value="${option.value}"
                            ${seleccionada ? 'checked' : ''}
                        >

                        <div class="branch-card-content">

                            <div class="branch-card-title">

                                <i class="fas fa-store"></i>

                                ${option.text}

                            </div>

                            <small>
                                Disponible desde la creación
                            </small>

                        </div>

                    `;


                    contenedor.appendChild(
                        label
                    );

                });

        }


        // ======================================================
        // ABRIR MODAL
        // ======================================================

        const modal =
            document.getElementById(
                'modal-producto'
            );


        if (modal) {

            modal.style.display =
                'flex';

        }

    },
    
    // Cierra el modal de forma segura
    cerrar() {
        document.getElementById('modal-producto').style.display = 'none';
        this.limpiarFormulario();
    },

    // Helper interno para resetear los inputs
    limpiarFormulario() {
        document.getElementById('producto-id').value = '';
        document.getElementById('prod-nombre').value = '';
        document.getElementById('prod-precio').value = '';
        document.getElementById('prod-categoria').value = '';
        document.getElementById('prod-descripcion').value = '';
        document.getElementById('prod-destacado').checked = false;
        
        const inputImagen = document.getElementById('prod-imagen');
        if (inputImagen) inputImagen.value = ''; // Resetea el selector de archivos
    },


    // Abre el modal secundario para gestionar las sucursales del producto
    async abrirSucursales(id) {
        try {

            if (typeof colapsarSidebarAdmin === 'function') {
                colapsarSidebarAdmin();
            }
            // Llamamos a la capa de acciones físicas para traer la data limpia
            const resultado = await ProductosActions.obtenerProductoSucursales(id);

            if (!resultado.success) {
                if (typeof utils !== 'undefined' && typeof utils.mostrarMensajeExito === 'function') {
                    utils.mostrarMensajeExito("⚠ Producto", resultado.message);
                } else {
                    alert(resultado.message);
                }
                return;
            }

            const producto = resultado.data[0];

            // Inyectamos textos e información general en el modal de sucursales
            document.getElementById("modalProductoId").value = producto.id;
            document.getElementById("modalSku").textContent = producto.codigo_sku || "S/N";
            document.getElementById("modalNombreProducto").textContent = producto.nombre;
            document.getElementById("modalDescripcionProducto").textContent = producto.descripcion || "Sin descripción";

            // Llamamos a tu función que dibuja el listado dentro de este modal
            if (typeof renderSucursalesProducto === 'function') {
                renderSucursalesProducto(resultado.data);
            }

            // Mostramos el modal en la interfaz
            document.getElementById("modal-sucursales").style.display = "flex";

        } catch (error) {
            console.error('Error al renderizar modal de sucursales:', error);
            if (typeof utils !== 'undefined' && typeof utils.mostrarMensajeExito === 'function') {
                utils.mostrarMensajeExito("❌ Error", "No fue posible cargar la información del producto.");
            } else {
                alert("No fue posible cargar la información del producto.");
            }
        }
    },

    // Cerramos el modal de sucursales de forma limpia
    cerrarSucursales() {
        const modal = document.getElementById("modal-sucursales");
        if (modal) modal.style.display = "none";
    },



    



};

// =========================================================================
// RENDERIZADO DINÁMICO DE SUCURSALES (Mudado desde admin.js)
// =========================================================================

function renderSucursalesProducto(lista) {
    const contenedor = document.getElementById("tablaSucursalesProducto");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    lista.forEach(sucursal => {
        if (Number(sucursal.asignado) === 1) {
            contenedor.innerHTML += renderSucursalAsignada(sucursal);
        } else {
            contenedor.innerHTML += renderSucursalNoAsignada(sucursal);
        }
    });
}

function renderSucursalAsignada(sucursal) {

    const productoId =
        Number(sucursal.id || sucursal.producto_id);

    const sucursalId =
        Number(sucursal.sucursal_id);


    return `
        <div
            class="sucursal-card"
            id="card-sucursal-${sucursalId}"
        >

            <div class="sucursal-card-header">

                <label class="sucursal-check">

                    <input
                        type="checkbox"
                        checked
                        disabled
                    >

                    <span>
                        ${sucursal.sucursal_nombre}
                    </span>

                </label>

            </div>


            <div class="sucursal-card-body">

                <div class="campo-sucursal">

                    <label>
                        Precio
                    </label>

                    <input
                        id="precio-${sucursalId}"
                        type="number"
                        value="${sucursal.precio ?? ""}"
                        step="0.01"
                        min="0"
                    >

                </div>


                <div class="campo-sucursal campo-center">

                    <label>
                        Disponible
                    </label>

                    <input
                        id="disponible-${sucursalId}"
                        type="checkbox"
                        ${Number(sucursal.disponible) === 1 ? "checked" : ""}
                    >

                </div>


                <div class="campo-sucursal campo-center">

                    <label>
                        Favorito
                    </label>

                    <input
                        id="favorito-${sucursalId}"
                        type="checkbox"
                        ${Number(sucursal.destacado) === 1 ? "checked" : ""}
                    >

                </div>

            </div>


            <div class="sucursal-card-footer">

                <button
                    type="button"
                    class="btn-guardar-sucursal"
                    onclick="
                        guardarSucursalExistente(
                            ${productoId},
                            ${sucursalId}
                        )
                    "
                >

                    <i class="fas fa-save"></i>
                    Guardar

                </button>

            </div>

        </div>
    `;

}

function renderSucursalNoAsignada(sucursal) {
    // Nota: Validamos de forma segura la existencia de sucursal.id o sucursal.producto_id
    const prodId = sucursal.id || document.getElementById("modalProductoId").value;
    
    return `
        <div class="sucursal-card sucursal-card-disabled" id="card-sucursal-${sucursal.sucursal_id}">
            <div class="sucursal-card-header">
                <label class="sucursal-check">
                    <input type="checkbox" disabled>
                    <span>${sucursal.sucursal_nombre}</span>
                </label>
            </div>
            <div class="sucursal-empty">
                <p>Este producto todavía no pertenece a esta sucursal.</p>
                <button class="btn-agregar-sucursal" 
                        onclick="activarSucursal(${prodId}, ${sucursal.sucursal_id}, '${sucursal.sucursal_nombre}')">
                    <i class="fas fa-plus-circle"></i> Agregar a esta sucursal
                </button>
            </div>
        </div>
    `;
}

function activarSucursal(productoId, sucursalId, nombreSucursal) {
    const card = document.getElementById(`card-sucursal-${sucursalId}`);
    if (!card) return;

    card.outerHTML = `
        <div class="sucursal-card">
            <div class="sucursal-card-header">
                <label class="sucursal-check">
                    <input type="checkbox" checked disabled>
                    <span>${nombreSucursal}</span>
                </label>
            </div>
            <div class="sucursal-card-body">
                <div class="campo-sucursal">
                    <label>Precio</label>
                    <input id="precio-${sucursalId}" type="number" placeholder="0.00" step="0.01">
                </div>
                <div class="campo-sucursal campo-center">
                    <label>Disponible</label>
                    <input id="disponible-${sucursalId}" type="checkbox" checked>
                </div>
                <div class="campo-sucursal campo-center">
                    <label>Favorito</label>
                    <input id="favorito-${sucursalId}" type="checkbox">
                </div>
            </div>
            <div class="sucursal-card-footer">
                <button class="btn-guardar-sucursal" onclick="guardarSucursalNueva(${productoId}, ${sucursalId})">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
        </div>
    `;
}



async function guardarSucursalNueva(productoId, sucursalId) {
    // 1. Extraemos el precio escrito en el input dinámico de la tarjeta
    const precioInput = document.getElementById(`precio-${sucursalId}`);
    const precio = precioInput ? precioInput.value : "";

    // 2. Validación en capa visual
    if (precio === "" || Number(precio) <= 0) {
        if (typeof utils !== 'undefined' && typeof utils.mostrarMensajeExito === 'function') {
            utils.mostrarMensajeExito(
                "⚠ Precio requerido",
                "Debe ingresar un precio válido para agregar el producto a esta sucursal."
            );
        } else {
            alert("Debe ingresar un precio válido.");
        }
        return;
    }

    try {
        // 3. Delegamos la petición física a nuestra capa de acciones
        const resultado = await ProductosActions.vincularProductoASucursal(productoId, sucursalId, precio);

        if (resultado.success) {
            if (typeof utils !== 'undefined' && typeof utils.mostrarMensajeExito === 'function') {
                utils.mostrarMensajeExito(
                    "✅ Sucursal agregada",
                    "El producto fue agregado correctamente a la sucursal."
                );
            } else {
                alert("Sucursal agregada correctamente.");
            }

            // 4. Recargamos únicamente el contenido del modal de sucursales para refrescar las tarjetas
            const productoIdActual = document.getElementById("modalProductoId").value;
            if (typeof ProductosModal !== 'undefined' && typeof ProductosModal.abrirSucursales === 'function') {
                await ProductosModal.abrirSucursales(productoIdActual);
            } else if (typeof abrirModalSucursales === 'function') {
                await abrirModalSucursales(productoIdActual);
            }
        } else {
            if (typeof utils !== 'undefined' && typeof utils.mostrarMensajeExito === 'function') {
                utils.mostrarMensajeExito("❌ Error", resultado.message);
            } else {
                alert(resultado.message);
            }
        }
    } catch (error) {
        console.error('Error en flujo guardarSucursalNueva:', error);
    }
}

async function guardarSucursalExistente(
    productoId,
    sucursalId
) {

    const precioInput =
        document.getElementById(
            `precio-${sucursalId}`
        );

    const disponibleInput =
        document.getElementById(
            `disponible-${sucursalId}`
        );

    const favoritoInput =
        document.getElementById(
            `favorito-${sucursalId}`
        );


    if (
        !precioInput ||
        !disponibleInput ||
        !favoritoInput
    ) {

        console.error(
            'No se encontraron los controles de la sucursal.',
            {
                productoId,
                sucursalId
            }
        );

        return;

    }


    const precio =
        Number(precioInput.value);


    if (
        !Number.isFinite(precio) ||
        precio < 0
    ) {

        alert(
            'Debe ingresar un precio válido.'
        );

        return;

    }


    const disponible =
        disponibleInput.checked
            ? 1
            : 0;


    const destacado =
        favoritoInput.checked
            ? 1
            : 0;


    try {

        const resultado =
            await ProductosActions
                .actualizarProductoSucursal(
                    productoId,
                    sucursalId,
                    {
                        precio,
                        disponible,
                        destacado
                    }
                );


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                'No fue posible guardar los cambios.'
            );

        }

        // ==================================================
        // VOLVER A CONSULTAR LA BD
        // ==================================================

        const productoIdActual =
            document.getElementById(
                'modalProductoId'
            ).value;


        await ProductosModal
            .abrirSucursales(
                productoIdActual
            );


        if (
            typeof utils !== 'undefined' &&
            typeof utils.mostrarMensajeExito ===
                'function'
        ) {

            utils.mostrarMensajeExito(
                'Sucursal actualizada',
                'Los cambios fueron guardados correctamente.'
            );

        } else {

            alert(
                'Cambios guardados correctamente.'
            );

        }


    } catch (error) {

        console.error(
            'Error guardando cambios de sucursal:',
            error
        );


        alert(
            error.message ||
            'No fue posible guardar los cambios.'
        );

    }

}