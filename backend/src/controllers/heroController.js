const HeroModel = require('../models/heroModel');
const fs = require('fs');
const path = require('path');

const obtenerSlidersAdmin = async (req, res) => {
    try {
        const sliders = await HeroModel.obtenerTodosAdmin();
        res.json({ success: true, data: sliders });
    } catch (error) {
        console.error('Error en obtenerSlidersAdmin:', error);
        res.status(500).json({ success: false, message: 'Error al obtener sliders para administración' });
    }
};

const obtenerSlidersCliente = async (req, res) => {
    try {
        const sliders = await HeroModel.obtenerTodosCliente();
        res.json({ success: true, data: sliders });
    } catch (error) {
        console.error('Error en obtenerSlidersCliente:', error);
        res.status(500).json({ success: false, message: 'Error al obtener sliders para el cliente' });
    }
};

const crearSlider = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se subió ninguna imagen' });
        }

        const imagenUrl = `/images/uploads/${req.file.filename}`;
        const siguienteOrden = await HeroModel.obtenerSiguienteOrden();
        const insertId = await HeroModel.crear(imagenUrl, siguienteOrden);

        res.json({ 
            success: true, 
            message: 'Slider creado correctamente en modo borrador', 
            id: insertId 
        });
    } catch (error) {
        console.error('Error en crearSlider:', error);
        res.status(500).json({ success: false, message: 'Error al crear el slider' });
    }
};

const actualizarSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const { orden, activo } = req.body;

        const actualizado = await HeroModel.actualizar(id, orden, activo);
        if (!actualizado) {
            return res.status(404).json({ success: false, message: 'Slider no encontrado' });
        }

        res.json({ success: true, message: 'Slider actualizado en borrador' });
    } catch (error) {
        console.error('Error en actualizarSlider:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el slider' });
    }
};

const publicarCambios = async (req, res) => {
    try {
        await HeroModel.publicarTodos();
        res.json({ success: true, message: '¡Todos los cambios han sido publicados en la página principal!' });
    } catch (error) {
        console.error('Error en publicarCambios:', error);
        res.status(500).json({ success: false, message: 'Error al publicar los cambios' });
    }
};

const eliminarSlider = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscamos la ruta usando el modelo antes de borrar el registro
        const slider = await HeroModel.obtenerPorId(id);
        if (!slider) {
            return res.status(404).json({ success: false, message: 'Slider no encontrado' });
        }

        // Borramos de la BD usando el modelo
        await HeroModel.eliminar(id);

        // Borramos el archivo físico en el disco
        const nombreArchivo = path.basename(slider.imagen_url);
        const rutaFisicaCompleta = path.join(__dirname, '../../public/images/uploads', nombreArchivo);

        fs.unlink(rutaFisicaCompleta, (err) => {
            if (err) console.error('Aviso: La foto no se pudo eliminar físicamente:', err);
        });

        res.json({ success: true, message: 'Slider eliminado permanentemente' });
    } catch (error) {
        console.error('Error en eliminarSlider:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el slider' });
    }
};

module.exports = {
    obtenerSlidersAdmin,
    obtenerSlidersCliente,
    crearSlider,
    actualizarSlider,
    publicarCambios,
    eliminarSlider
};