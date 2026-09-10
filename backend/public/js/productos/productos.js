const Productos = {

    async iniciar() {

        // Escuchar cuando el usuario cambia de sucursal en el combo desplegable
        const selectSucursal = document.getElementById('selectSucursal');

        if (selectSucursal) {
            selectSucursal.addEventListener('change', (e) => {
                const idSucursal = e.target.value;
        
                // Verificamos cuál es la función encargada de cargar los productos
                if (typeof Productos !== 'undefined' && typeof Productos.cargar === 'function') {
                    Productos.cargar(idSucursal); 
                } else if (typeof cargarProductos === 'function') {
                    cargarProductos(idSucursal);
                }
            });
        }
           
        // Carga inicial
        cargarProductos();

        await ProductosForm.inicializarCategorias();
        Productos.inicializarBuscador();

    },


    inicializarBuscador() {

        const inputBuscar = document.getElementById('buscarProducto');

        if (inputBuscar) {

            inputBuscar.addEventListener('input', () => {

                cargarProductos();

            });

        }

    },



    obtenerSucursalSeleccionada() {

        const select = document.getElementById('selectSucursal');

        return select ? select.value : '1';

    },

    manejarCargaConLoader() {

        const overlay = document.getElementById('loadingOverlay');

        if (overlay)
            overlay.style.display = 'flex';

        setTimeout(async () => {

            await cargarProductos();

            if (overlay)
                overlay.style.display = 'none';

        }, 1200);

    },


    

};