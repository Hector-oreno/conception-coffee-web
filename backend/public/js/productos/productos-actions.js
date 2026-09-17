// ==========================================================
// AUTENTICACIÓN
// ==========================================================

function obtenerTokenProductos() {

    return localStorage.getItem(
        "token_conception"
    ) || null;

}


function headersProductos(
    headersAdicionales = {}
) {

    const token =
        obtenerTokenProductos();


    return {

        ...headersAdicionales,

        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {})

    };

}


function obtenerSucursalProductos() {

    if (
        typeof Productos === 'undefined' ||
        typeof Productos.obtenerSucursalSeleccionada !== 'function'
    ) {

        throw new Error(
            'No fue posible determinar la sucursal seleccionada.'
        );

    }


    const sucursalId =
        Number(
            Productos.obtenerSucursalSeleccionada()
        );


    if (
        !Number.isInteger(sucursalId) ||
        sucursalId <= 0
    ) {

        throw new Error(
            'Selecciona una sucursal válida.'
        );

    }


    return sucursalId;

}


// ==========================================================
// ACTIONS
// ==========================================================

const ProductosActions = {


    // ======================================================
    // 1. CREAR / ACTUALIZAR PRODUCTO
    // ======================================================

    async guardarProducto(
        formData,
        idProducto = null
    ) {

        const url =
            idProducto
                ? `/api/productos/${idProducto}`
                : "/api/productos";


        const metodo =
            idProducto
                ? "PUT"
                : "POST";


        try {

            const respuesta =
                await fetch(
                    url,
                    {
                        method: metodo,

                        // IMPORTANTE:
                        // No agregar Content-Type manualmente
                        // porque formData necesita su boundary.
                        headers:
                            headersProductos(),

                        body:
                            formData
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${respuesta.status}`
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error al guardar el producto:",
                error
            );


            return {
                success: false,
                message: error.message
            };

        }

    },


    // ======================================================
    // 2. CAMBIAR DISPONIBILIDAD
    // ======================================================

    async conmutarDisponibilidad(
        id,
        estadoActual
    ) {

        const nuevoEstado =
            Number(estadoActual) === 1
                ? 0
                : 1;


        try {

            const respuesta =
                await fetch(
                    `/api/productos/${id}/disponibilidad`,
                    {
                        method: "PATCH",

                        headers:
                            headersProductos({
                                "Content-Type":
                                    "application/json"
                            }),

                        body:
                            JSON.stringify({

                                disponible:
                                    nuevoEstado,

                                sucursal_id:
                                    typeof Productos !== 'undefined' &&
                                    typeof Productos.obtenerSucursalSeleccionada === 'function'
                                        ? Productos.obtenerSucursalSeleccionada()
                                        : 1

                            })
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${respuesta.status}`
                );

            }


            return resultado.success === true;


        } catch (error) {

            console.error(
                "Error al cambiar disponibilidad:",
                error
            );

            return false;

        }

    },


    // ======================================================
    // 3. CAMBIAR DESTACADO
    // ======================================================

    async conmutarDestacado(
        id,
        destacadoActual
    ) {

        const nuevoDestacado =
            Number(destacadoActual) === 1
                ? 0
                : 1;


        try {

            const respuesta =
                await fetch(
                    `/api/productos/${id}/destacado`,
                    {
                        method: "PATCH",

                        headers:
                            headersProductos({
                                "Content-Type":
                                    "application/json"
                            }),

                        body:
                            JSON.stringify({

                                destacado:
                                    nuevoDestacado,

                                sucursal_id:
                                    typeof Productos !== 'undefined' &&
                                    typeof Productos.obtenerSucursalSeleccionada === 'function'
                                        ? Productos.obtenerSucursalSeleccionada()
                                        : 1

                            })
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${respuesta.status}`
                );

            }


            return resultado.success === true;


        } catch (error) {

            console.error(
                "Error al cambiar destacado:",
                error
            );

            return false;

        }

    },


    // ======================================================
    // 4. DAR DE BAJA / ELIMINAR
    // ======================================================

    async darBajaProducto(id) {

        try {

            const respuesta =
                await fetch(
                    `/api/productos/${id}`,
                    {
                        method: "DELETE",

                        headers:
                            headersProductos({
                                "Content-Type":
                                    "application/json"
                            }),

                        body:
                            JSON.stringify({

                                sucursal_id:
                                    typeof Productos !== 'undefined' &&
                                    typeof Productos.obtenerSucursalSeleccionada === 'function'
                                        ? Productos.obtenerSucursalSeleccionada()
                                        : 1

                            })
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${respuesta.status}`
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error al dar de baja el producto:",
                error
            );


            return {
                success: false,
                message: error.message
            };

        }

    },


    // ======================================================
    // 5. OBTENER PRODUCTO POR ID
    // ======================================================

    async obtenerProductoPorId(
        id,
        sucursalId
    ) {

        try {

            const response =
                await fetch(
                    `/api/productos/${id}?sucursal=${encodeURIComponent(
                        sucursalId
                    )}`,
                    {
                        headers:
                            headersProductos()
                    }
                );


            const resultado =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${response.status}`
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error en obtenerProductoPorId:",
                error
            );


            return {
                success: false,
                message: error.message
            };

        }

    },


    // ======================================================
    // 6. OBTENER PRODUCTOS
    // ======================================================

    async obtenerProductos(
        textoBuscar = "",
        sucursalId
    ) {

        const sucursalNumero =
            Number(sucursalId);


        if (
            !Number.isInteger(sucursalNumero) ||
            sucursalNumero <= 0
        ) {

            return {
                success: false,
                message:
                    'Selecciona una sucursal válida.'
            };

        }


        try {

            const url =
                `/api/productos` +
                `?buscar=${encodeURIComponent(
                    textoBuscar || ""
                )}` +
                `&sucursal=${encodeURIComponent(
                    sucursalNumero
                )}`;


            const response =
                await fetch(
                    url,
                    {
                        headers:
                            headersProductos()
                    }
                );


            const resultado =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${response.status}`
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error en obtenerProductos (Action):",
                error
            );


            return {
                success: false,
                message:
                    error.message
            };

        }

    },


    // ======================================================
    // 7. OBTENER SUCURSALES DEL PRODUCTO
    // ======================================================

    async obtenerProductoSucursales(id) {

        try {

            const response =
                await fetch(
                    `/api/productos/${id}/sucursales`,
                    {
                        headers:
                            headersProductos()
                    }
                );


            const resultado =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${response.status}`
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error en obtenerProductoSucursales (Action):",
                error
            );


            return {
                success: false,
                message: error.message
            };

        }

    },


    // ======================================================
    // 8. VINCULAR PRODUCTO A SUCURSAL
    // ======================================================

    async vincularProductoASucursal(
        productoId,
        sucursalId,
        precio
    ) {

        try {

            const response =
                await fetch(
                    `/api/productos/${productoId}/sucursales`,
                    {
                        method: "POST",

                        headers:
                            headersProductos({
                                "Content-Type":
                                    "application/json"
                            }),

                        body:
                            JSON.stringify({

                                sucursal_id:
                                    sucursalId,

                                precio:
                                    Number(precio)

                            })
                    }
                );


            const resultado =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${response.status}`
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error en vincularProductoASucursal (Action):",
                error
            );


            return {
                success: false,
                message: error.message
            };

        }

    },

    async actualizarProductoSucursal(
        productoId,
        sucursalId,
        datos
    ) {

        try {

            const response =
                await fetch(
                    `/api/productos/${productoId}/sucursal`,
                    {
                        method:
                            "PATCH",

                        headers:
                            headersProductos({
                                "Content-Type":
                                    "application/json"
                            }),

                        body:
                            JSON.stringify({

                                precio:
                                    Number(datos.precio),

                                disponible:
                                    Number(datos.disponible),

                                destacado:
                                    Number(datos.destacado),

                                sucursal_id:
                                    Number(sucursalId)

                            })

                    }
                );


            const resultado =
            await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${response.status}`
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error en actualizarProductoSucursal:",
                error
            );


            return {
                success: false,
                message:
                    error.message
            };

        }

    }




};




// ==========================================================
// EXPONER GLOBALMENTE
// ==========================================================

window.ProductosActions =
    ProductosActions;