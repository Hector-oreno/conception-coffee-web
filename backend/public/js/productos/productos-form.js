const ProductosForm = {
    init() {
        const formulario = document.getElementById('form-producto');
        if (!formulario) {
            console.warn('No se encontró el formulario "#form-producto" en el DOM.');
            return;
        }

        // Limpiamos cualquier manejador previo
        formulario.removeAttribute('onsubmit');
        
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.procesarGuardado(formulario);
        });
    },


    // Aquí sí manipulamos el HTML usando los datos puros que nos da el API
    async inicializarCategorias() {
        const selectCat = document.getElementById('prod-categoria');
        if (!selectCat) return;

        try {
            // Llamamos al API puro
            const categorias = await ProductosAPI.obtenerCategorias();
            
            selectCat.innerHTML = categorias.map(cat =>
                `<option value="${cat.id}">${cat.nombre}</option>`
            ).join('');
        } catch (error) {
            console.error('Error al poblar el select de categorías:', error);
        }
    },


    async procesarGuardado(formulario) {
        try {
            // Creamos un FormData completamente vacío para armarlo de forma explícita
            const formData = new FormData();

            // 1. Capturamos los elementos del DOM usando los IDs exactos de tus modales
            const idProducto = document.getElementById('producto-id').value;
            const nombre = document.getElementById('prod-nombre').value;
            const precio = document.getElementById('prod-precio').value;
            const categoriaId = document.getElementById('prod-categoria').value;
            const descripcion = document.getElementById('prod-descripcion').value;
            const destacado = document.getElementById('prod-destacado').checked ? 1 : 0;
            const inputImagen = document.getElementById('prod-imagen');

            // 2. Adjuntamos los datos usando las llaves exactas que busca tu productoController.js
            formData.append('nombre', nombre.trim());
            formData.append('precio', parseFloat(precio) || 0.00);
            formData.append('categoria_id', parseInt(categoriaId, 10) || 1); // Evita el NaN de raíz
            formData.append('descripcion', descripcion.trim());
            formData.append('destacado', destacado);

            // 3. Adjuntamos el archivo físico de la imagen si el usuario seleccionó uno
            if (inputImagen && inputImagen.files.length > 0) {
                formData.append('imagen', inputImagen.files[0]);
            }

            // 4. Manejo e Inyección de Sucursales
            if (!idProducto) {
                // Modo CREACIÓN: Capturamos las sucursales marcadas en los checkboxes
                const checkboxes = document.querySelectorAll('input[name="sucursales_alta"]:checked');
                const sucursalesSeleccionadas = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));

                if (sucursalesSeleccionadas.length === 0) {
                    alert('Por favor, selecciona al menos una sucursal para dar de alta el producto.');
                    return;
                }
                
                // Lo mandamos como string JSON nítido tal como lo parsea tu backend
                formData.append('sucursales', JSON.stringify(sucursalesSeleccionadas));
            } else {
                // Modo EDICIÓN: Agregamos la sucursal activa
                const sucursalId = typeof Productos !== 'undefined' && typeof Productos.obtenerSucursalSeleccionada === 'function'
                    ? Productos.obtenerSucursalSeleccionada()
                    : (window.sucursalActivaId || 1);
                
                formData.append('sucursalId', sucursalId);
            }

            // 5. Enviamos de forma física al módulo de acciones de la API
            const resultado = await ProductosActions.guardarProducto(formData, idProducto || null);

            if (resultado.success) {
                alert(idProducto ? 'Producto actualizado con éxito.' : 'Producto creado y replicado correctamente.');
                
                if (typeof ProductosModal !== 'undefined') {
                    ProductosModal.cerrar();
                }

                if (typeof cargarProductos === 'function') {
                    await cargarProductos();
                }
            } else {
                alert('Error al procesar la solicitud: ' + (resultado.message || 'Intente de nuevo.'));
            }

        } catch (error) {
            console.error('Error crítico en el flujo del formulario:', error);
            alert('Ocurrió un error inesperado al comunicar con el servidor.');
        }
    }
};

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ProductosForm.init();
});