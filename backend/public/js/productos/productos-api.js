const ProductosAPI = {

    // ==========================================================
    // OBTENER CATEGORÍAS
    // ==========================================================

    async obtenerCategorias() {

        try {

            const response =
                await fetch(
                    `${CONFIG.API_BASE_URL}/categorias`
                );


            const resultado =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    `Error HTTP ${response.status}`
                );

            }


            return (
                resultado.data ||
                resultado
            );


        } catch (error) {

            console.error(
                'Error en ProductosAPI.obtenerCategorias:',
                error
            );


            throw error;

        }

    }

};