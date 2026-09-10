const Experiencia = require('../models/experienciasModel');
const fs = require('fs');
const path = require('path');

exports.obtenerExperienciasAdmin = async (req, res) => {
    try {
        // En mysql2/promise, el resultado viene en un arreglo donde el primer elemento [rows] son los datos
        const [rows] = await Experiencia.getAllAdmin();
        return res.json({ success: true, data: rows || [] });
    } catch (error) {
        console.error("Error en obtenerExperienciasAdmin:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.obtenerExperienciasCliente = async (req, res) => {
    try {
        const [rows] = await Experiencia.getAllCliente(); 
        return res.json({ success: true, data: rows || [] });
    } catch (error) {
        console.error("Error en obtenerExperienciasCliente:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.crearExperiencia = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Falta la imagen.' });

        const nuevaExp = {
            imagen_url: `/images/uploads/${req.file.filename}`,
            titulo: req.body.titulo || 'Nueva Experiencia'
        };

        await Experiencia.create(nuevaExp);
        return res.json({ success: true, message: 'Experiencia guardada como borrador.' });
    } catch (error) {
        console.error("Error en crearExperiencia:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.actualizarExperiencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        await Experiencia.updateEstado(id, activo);
        return res.json({ success: true, message: 'Estado actualizado correctamente.' });
    } catch (error) {
        console.error("Error en actualizarExperiencia:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.eliminarExperiencia = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await Experiencia.delete(id);
        if (!result || !result.length) return res.status(404).json({ success: false, message: 'No se encontró el registro.' });

        const pathFisico = path.join(__dirname, '../../public', result[0].imagen_url);

        // Borrado del archivo físico
        fs.unlink(pathFisico, async (errFs) => {
            if (errFs) console.error('Aviso: El archivo físico no existía o no se pudo borrar:', errFs.message);
            
            await Experiencia.deleteConfirm(id);
            return res.json({ success: true, message: 'Eliminado con éxito de la base de datos.' });
        });
    } catch (error) {
        console.error("Error en eliminarExperiencia:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.publicarCambios = async (req, res) => {
    try {
        await Experiencia.publicarTodos();
        return res.json({ success: true, message: 'Cambios sincronizados en la web.' });
    } catch (error) {
        console.error("Error en publicarCambios:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};