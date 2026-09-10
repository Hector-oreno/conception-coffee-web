const ProductosModal = {

    abrirModalNuevoProducto() {

        document.getElementById('seccion-sucursales').style.display = 'block';

        document.getElementById('modal-title').innerText = 'Nuevo Producto';

        document.getElementById('form-producto').reset();

        document.getElementById('producto-id').value = '';

        // Inyectar dinámicamente las sucursales que existen en el selector principal
        const selectSucursal = document.getElementById('selectSucursal');

        const contenedor = document.getElementById('contenedor-sucursales-modal');

        if (contenedor && selectSucursal) {

            contenedor.innerHTML = '';

            Array.from(selectSucursal.options).forEach(option => {

                if (option.value === "") return;

                const estaSeleccionada = (option.value === selectSucursal.value);

                const div = document.createElement('label');

                div.className = 'branch-card';

                div.innerHTML = `
                    <input
                        type="checkbox"
                        name="sucursales_alta"
                        value="${option.value}"
                        ${estaSeleccionada ? 'checked' : ''}>

                    <div class="branch-card-content">

                        <div class="branch-card-title">

                            <i class="fas fa-store"></i>

                            ${option.text}

                        </div>

                        <small>

                            Disponible desde la creación del producto

                        </small>

                    </div>
                `;

                contenedor.appendChild(div);

            });

        }

        document.getElementById('modal-producto').style.display = 'flex';

    },

    cerrarModal() {

        document.getElementById('modal-producto').style.display = 'none';

    },

    async abrirEditar(id) {
        try {
            // Obtenemos la sucursal seleccionada desde el estado de la app
            const sucursalId = typeof Productos !== 'undefined' && typeof Productos.obtenerSucursalSeleccionada === 'function'
                ? Productos.obtenerSucursalSeleccionada()
                : (window.sucursalActivaId || 1);

            // Llamamos a la capa de acciones para traer la data limpia
            const resultado = await ProductosActions.obtenerProductoPorId(id, sucursalId);

            if (resultado.success) {
                const prod = resultado.data;

                // Llenado y comportamiento estético del formulario
                document.getElementById('seccion-sucursales').style.display = 'none';
                document.getElementById('modal-title').innerText = 'Editar Producto';
                document.getElementById('producto-id').value = prod.id;
                document.getElementById('prod-nombre').value = prod.nombre;
                document.getElementById('prod-precio').value = prod.precio; 
                document.getElementById('prod-categoria').value = prod.categoria_id; 
                document.getElementById('prod-descripcion').value = prod.descripcion || '';
                document.getElementById('prod-destacado').checked = prod.destacado === 1;

                // --- INYECCIÓN INTELIGENTE DE SUCURSALES EN EDICIÓN ---
                const selectSucursal = document.getElementById('selectSucursal');
                const contenedor = document.getElementById('contenedor-sucursales-modal');
                
                if (contenedor && selectSucursal) {
                    contenedor.innerHTML = '';
                    
                    Array.from(selectSucursal.options).forEach(option => {
                        if (option.value === "") return;

                        const div = document.createElement('div');
                        div.style.display = 'flex';
                        div.style.alignItems = 'center';
                        div.style.gap = '10px';
                        
                        const perteneceASucursal = (option.value === sucursalId.toString());

                        div.innerHTML = `
                            <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer;">
                                <input type="checkbox" name="sucursales_alta" value="${option.value}" ${perteneceASucursal ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                                <span>${option.text}</span>
                            </label>
                        `;
                        contenedor.appendChild(div);
                    });
                }

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
        // 1. Cambiamos títulos y mostramos la selección de múltiples sucursales
        document.getElementById('seccion-sucursales').style.display = 'block';
        document.getElementById('modal-title').innerText = 'Agregar Nuevo Producto';
        
        // 2. Limpiamos el formulario por si quedó data de una edición anterior
        this.limpiarFormulario();

        // 3. Inyectamos la lista de sucursales disponibles para que el admin elija dónde darlo de alta
        const selectSucursal = document.getElementById('selectSucursal');
        const contenedor = document.getElementById('contenedor-sucursales-modal');
        
        if (contenedor && selectSucursal) {
            contenedor.innerHTML = '';
            Array.from(selectSucursal.options).forEach(option => {
                if (option.value === "") return; // Ignoramos el placeholder "Seleccionar Sucursal"

                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.alignItems = 'center';
                div.style.gap = '10px';
                div.innerHTML = `
                    <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer;">
                        <input type="checkbox" name="sucursales_alta" value="${option.value}" style="width: 18px; height: 18px; cursor: pointer;">
                        <span>${option.text}</span>
                    </label>
                `;
                contenedor.appendChild(div);
            });
        }

        // 4. Mostramos el modal en pantalla
        document.getElementById('modal-producto').style.display = 'flex';
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
    return `
        <div class="sucursal-card">
            <div class="sucursal-card-header">
                <label class="sucursal-check">
                    <input type="checkbox" checked disabled>
                    <span>${sucursal.sucursal_nombre}</span>
                </label>
            </div>
            <div class="sucursal-card-body">
                <div class="campo-sucursal">
                    <label>Precio</label>
                    <input type="number" value="${sucursal.precio ?? ""}" step="0.01">
                </div>
                <div class="campo-sucursal campo-center">
                    <label>Disponible</label>
                    <input type="checkbox" ${Number(sucursal.disponible) ? "checked" : ""}>
                </div>
                <div class="campo-sucursal campo-center">
                    <label>Favorito</label>
                    <input type="checkbox" ${Number(sucursal.destacado) ? "checked" : ""}>
                </div>
            </div>
            <div class="sucursal-card-footer">
                <button class="btn-guardar-sucursal">
                    <i class="fas fa-save"></i> Guardar
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
