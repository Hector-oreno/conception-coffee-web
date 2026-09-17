// public/js/productos/productos-table.js

const ProductosTable = {

    
    async cargarProductos() {

        const tbody =
            document.getElementById(
                'tabla-productos-body'
            );

        const overlay =
            document.getElementById(
                'loadingOverlay'
            );

        const mensajeVacio =
            document.getElementById(
                'mensajeVacio'
            );


        if (!tbody) {
            return;
        }


        try {

            // ======================================================
            // MOSTRAR CARGA
            // ======================================================

            if (overlay) {
                overlay.style.display = 'flex';
            }


            // ======================================================
            // OBTENER FILTROS ACTUALES
            // ======================================================

            const inputBuscar =
                document.getElementById(
                    'buscarProducto'
                );


            const textoBuscar =
                inputBuscar
                    ? inputBuscar.value.trim()
                    : '';


            const sucursalId =
                Productos
                    .obtenerSucursalSeleccionada();


            // ======================================================
            // VALIDAR SUCURSAL
            // ======================================================

            if (!sucursalId) {

                tbody.innerHTML = '';

                if (mensajeVacio) {
                    mensajeVacio.classList.remove(
                        'd-none'
                    );
                }

                return;

            }


            if (mensajeVacio) {
                mensajeVacio.classList.add(
                    'd-none'
                );
            }


            // ======================================================
            // CONSULTAR API
            // ======================================================

            const resultado =
                await ProductosActions
                    .obtenerProductos(
                        textoBuscar,
                        sucursalId
                    );


            // ======================================================
            // RENDERIZAR RESPUESTA REAL DE BD
            // ======================================================

            if (
                resultado.success &&
                Array.isArray(resultado.data)
            ) {

                
                this.renderizar(
                    resultado.data
                );


                return;

            }


            this.renderizar([]);


        } catch (error) {

            console.error(
                'Error al cargar productos:',
                error
            );


            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="productos-estado-tabla productos-estado-error"
                    >
                        No fue posible cargar los productos.
                    </td>
                </tr>
            `;


        } finally {

            if (overlay) {
                overlay.style.display =
                    'none';
            }

        }

    },



    // 2. Renderizado real adaptado con tu lógica multi-sucursal y diseño premium
    renderizar(productosGlobal) {

        const tbody =
            document.getElementById(
                'tabla-productos-body'
            );


        if (!tbody) {
            return;
        }


        if (
            !Array.isArray(productosGlobal) ||
            productosGlobal.length === 0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="productos-estado-tabla"
                    >
                        No se encontraron productos
                        para esta sucursal.
                    </td>

                </tr>

            `;

            return;

        }


        tbody.innerHTML =
            productosGlobal
                .map(prod => {

                    let urlImagen =
                        prod.imagen &&
                        prod.imagen.trim() !== ''
                            ? prod.imagen
                            : '/images/uploads/Logo_carta.png';


                    if (
                        urlImagen &&
                        !urlImagen.startsWith('http')
                    ) {

                        urlImagen =
                            urlImagen.startsWith('/')
                                ? urlImagen
                                : `/${urlImagen}`;

                    }


                    const destacado =
                        Number(prod.destacado) === 1;


                    const disponible =
                        Number(prod.disponible) === 1;


                    const precio =
                        Number(prod.precio);


                    return `

                        <tr>

                            <td>

                                <img
                                    src="${urlImagen}"
                                    alt="${prod.nombre}"
                                    class="producto-thumbnail"
                                    loading="lazy"
                                >

                            </td>


                            <td>

                                <div class="producto-nombre-wrap">

                                    <button
                                        type="button"
                                        class="
                                            producto-favorito-btn
                                            ${destacado ? 'is-active' : ''}
                                        "
                                        title="${
                                            destacado
                                                ? 'Quitar de destacados'
                                                : 'Marcar como destacado'
                                        }"
                                        onclick="
                                            conmutarDestacado(
                                                ${prod.id},
                                                ${destacado ? 1 : 0}
                                            )
                                        "
                                    >

                                        <i
                                            class="${
                                                destacado
                                                    ? 'fas'
                                                    : 'far'
                                            } fa-star"
                                        ></i>

                                    </button>


                                    <span class="producto-nombre">
                                        ${prod.nombre}
                                    </span>

                                </div>

                            </td>


                            <td>
                                ${
                                    prod.categoria_nombre ||
                                    'Sin categoría'
                                }
                            </td>


                            <td>

                                <span class="producto-precio">

                                    Q${
                                        Number.isFinite(precio)
                                            ? precio.toFixed(2)
                                            : '0.00'
                                    }

                                </span>

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="producto-estado-btn"
                                    onclick="
                                        conmutarDisponibilidad(
                                            ${prod.id},
                                            ${disponible ? 1 : 0}
                                        )
                                    "
                                    title="Cambiar disponibilidad"
                                >

                                    <span
                                        class="
                                            producto-estado
                                            ${
                                                disponible
                                                    ? 'producto-estado--disponible'
                                                    : 'producto-estado--agotado'
                                            }
                                        "
                                    >
                                        ${
                                            disponible
                                                ? 'Disponible'
                                                : 'Agotado'
                                        }
                                    </span>

                                </button>

                            </td>


                            <td>

                                <div class="producto-acciones">

                                    <button
                                        type="button"
                                        class="
                                            producto-accion
                                            producto-accion--editar
                                        "
                                        title="Editar producto"
                                        onclick="
                                            abrirModalEditar(
                                                ${prod.id}
                                            )
                                        "
                                    >
                                        <i class="fas fa-pen"></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="
                                            producto-accion
                                            producto-accion--sucursal
                                        "
                                        title="Administrar sucursales"
                                        onclick="
                                            abrirModalSucursales(
                                                ${prod.id}
                                            )
                                        "
                                    >
                                        <i class="fas fa-store"></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="
                                            producto-accion
                                            producto-accion--baja
                                        "
                                        title="
                                            Dar de baja en esta sucursal
                                        "
                                        onclick="
                                            darBajaProducto(
                                                ${prod.id}
                                            )
                                        "
                                    >
                                        <i class="fas fa-box-archive"></i>
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                })
                .join('');

    },

    

};