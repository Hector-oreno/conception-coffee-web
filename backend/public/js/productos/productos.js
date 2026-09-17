const Productos = {

    async iniciar() {

        const selectSucursal =
            document.getElementById(
                'selectSucursal'
            );


        // ======================================================
        // CAMBIO DE SUCURSAL
        // ======================================================

        if (selectSucursal) {

            selectSucursal.addEventListener(
                'change',
                async () => {

                    await cargarProductos();

                }
            );

        }


        // ======================================================
        // CARGA INICIAL
        // ======================================================

        await ProductosForm
            .inicializarCategorias();


        this.inicializarBuscador();


        await cargarProductos();

    },


    // ==========================================================
    // BUSCADOR
    // ==========================================================

    inicializarBuscador() {

        const inputBuscar =
            document.getElementById(
                'buscarProducto'
            );


        if (!inputBuscar) {
            return;
        }


        inputBuscar.addEventListener(
            'input',
            async () => {

                await cargarProductos();

            }
        );

    },


    // ==========================================================
    // SUCURSAL SELECCIONADA
    // ÚNICA FUENTE DE VERDAD DEL MÓDULO PRODUCTOS
    // ==========================================================

    obtenerSucursalSeleccionada() {

        const select =
            document.getElementById(
                'selectSucursal'
            );


        if (!select) {
            return null;
        }


        const sucursalId =
            Number(select.value);


        if (
            !Number.isInteger(sucursalId) ||
            sucursalId <= 0
        ) {

            return null;

        }


        return sucursalId;

    },


    // ==========================================================
    // RECARGA CON LOADER
    // ==========================================================

    async manejarCargaConLoader() {

        const overlay =
            document.getElementById(
                'loadingOverlay'
            );


        try {

            if (overlay) {
                overlay.style.display =
                    'flex';
            }


            await cargarProductos();


        } finally {

            if (overlay) {
                overlay.style.display =
                    'none';
            }

        }

    }

};