
const ProductosAPI = {
    // 1. OBTENER CATEGORÍAS (Solo datos, no toca el HTML)
    async obtenerCategorias() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/categorias`);
            const resultado = await response.json();
            return resultado.data || resultado; 
        } catch (error) {
            console.error('Error en ProductosAPI.obtenerCategorias:', error);
            throw error;
        }
    },

    // 2. OBTENER PRODUCTOS (Traído del fetch de tu cargarProductos antiguo)
    async obtenerProductos(textoBuscar, sucursalId) {
        try {
            const url = `${CONFIG.API_BASE_URL}/productos?buscar=${encodeURIComponent(textoBuscar)}&sucursal=${sucursalId}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error en ProductosAPI.obtenerProductos:', error);
            throw error;
        }
    }
};