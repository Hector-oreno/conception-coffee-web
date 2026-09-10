// public/js/productos/productos-table.js

const ProductosTable = {

    
    async cargarProductos() {
        const tbody = document.getElementById('tabla-productos-body');
        const overlay = document.getElementById('loadingOverlay');
        const mensajeVacio = document.getElementById('mensajeVacio');
        
        if (!tbody) return;

        try {
            // 1. Mostrar overlay de carga si existe
            if (overlay) overlay.style.display = 'flex';

            // 2. Obtener los parámetros globales necesarios
            const inputBuscar = document.getElementById('buscarProducto');
            const textoBuscar = inputBuscar ? inputBuscar.value : '';
            const sucursalId = typeof Productos !== 'undefined' && typeof Productos.obtenerSucursalSeleccionada === 'function'
                ? Productos.obtenerSucursalSeleccionada()
                : (window.sucursalActivaId || null);

            // 3. Si no hay sucursal seleccionada, limpiamos y salimos
            if (!sucursalId) {
                tbody.innerHTML = '';
                if (mensajeVacio) mensajeVacio.classList.remove('d-none');
                return;
            }

            if (mensajeVacio) mensajeVacio.classList.add('d-none');

            // 4. Invocar la capa de acciones físicas
            const resultado = await ProductosActions.obtenerProductos(textoBuscar, sucursalId);

            // 5. Evaluar y pintar los datos
            if (resultado.success) {
                // Seteamos la variable global por si la usas en otro lado
                window.productosGlobal = resultado.data;
                this.renderizar(resultado.data);
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No se encontraron productos para esta sucursal.</td></tr>`;
            }

        } catch (error) {
            console.error('Error al orquestar la tabla de productos:', error);
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error de conexión con el servidor backend.</td></tr>`;
        } finally {
            // 6. Ocultar overlay de carga pase lo que pase
            if (overlay) overlay.style.display = 'none';
        }
    },



    // 1. Filtrado rápido visual en el navegador (Tu función original intacta)
    filtrarProductosTabla() {
        const texto = document.getElementById('buscarProducto').value.toLowerCase();
        const filas = document.querySelectorAll('#tabla-productos-body tr');

        filas.forEach(fila => {
            const celdaNombre = fila.getElementsByTagName('td')[1];
            if (celdaNombre) {
                const nombre = celdaNombre.textContent.toLowerCase();
                fila.style.display = nombre.includes(texto) ? '' : 'none';
            }
        });
    },

    // 2. Renderizado real adaptado con tu lógica multi-sucursal y diseño premium
    renderizar(productosGlobal) {
        const tbody = document.getElementById('tabla-productos-body');
        if (!tbody) return;

        if (!productosGlobal || productosGlobal.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No se encontraron productos para esta sucursal o término de búsqueda.</td></tr>`;
            return;
        }

        // Construcción del HTML exactamente como lo tenías en admin.js
        tbody.innerHTML = productosGlobal.map(prod => {
            // Lógica exacta de tus imágenes
            let urlImagen = prod.imagen && prod.imagen.trim() !== "" ? prod.imagen : null;
            if (urlImagen) {
                if (!urlImagen.startsWith('http')) {
                    const rutaLimpia = urlImagen.startsWith('/') ? urlImagen : `/${urlImagen}`;
                    urlImagen = rutaLimpia;
                }
            } else {
                urlImagen = '/images/uploads/Logo_carta.png'; 
            }

            return `
                <tr>
                    <td><img src="${urlImagen}" alt="${prod.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button class="star-toggle-btn" onclick="conmutarDestacado(${prod.id}, ${prod.destacado})" style="background: none; border: none; cursor: pointer; padding: 0;">
                                <i class="${prod.destacado ? 'fas' : 'far'} fa-star" 
                                    style="color: ${prod.destacado ? '#ffc107' : '#ccc'}; font-size: 1.1rem;">
                                </i>
                            </button>
                            <strong>${prod.nombre}</strong>
                        </div>
                    </td>
                    <td>${prod.categoria_nombre || 'Sin categoría'}</td>
                    <td>Q${parseFloat(prod.precio).toFixed(2)}</td>
                    <td>
                        <button class="badge-status-btn" onclick="conmutarDisponibilidad(${prod.id}, ${prod.disponible})" style="background: none; border: none; cursor: pointer; padding: 0;">
                            <span class="role-badge ${prod.disponible ? 'disponible' : 'no-disponible'}">
                                 ${prod.disponible ? 'Disponible' : 'Agotado'}
                            </span>
                        </button>
                    </td>
                    <td class="acciones-producto">
                        <button class="btn-editar" title="Editar Producto" onclick="abrirModalEditar(${prod.id})">
                            <i class="fas fa-edit"></i>
                        </button>

                        <button class="btn-sucursal" title="Administrar Sucursales" onclick="abrirModalSucursales(${prod.id})">
                            <i class="fas fa-store"></i>
                        </button>

                        <button class="btn-eliminar" title="Eliminar Producto" onclick="darBajaProducto(${prod.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    

};