const categoriaModel = require('../models/categoriaModel');

const getCategorias = async (req, res) => {
    try {

        const categorias =
            await categoriaModel.obtenerCategorias();

        res.json({
            success: true,
            total: categorias.length,
            data: categorias
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Error obteniendo categorías'
        });

    }
};

module.exports = {
    getCategorias
};