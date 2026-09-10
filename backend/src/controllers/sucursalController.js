const sucursalModel = require('../models/sucursalModel');

const getSucursales = async (req, res) => {
    try {
        const sucursales = await sucursalModel.obtenerSucursales();
        res.json(sucursales);
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// NUEVA FUNCIÓN: Crear sucursal
const crearSucursal = async (req, res) => {
    try {
        const { nombre, direccion, telefono } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ error: 'El nombre de la sucursal es obligatorio' });
        }

        const nuevoId = await sucursalModel.insertarSucursal(nombre.trim(), direccion, telefono);
        
        res.json({
            success: true,
            message: 'Sucursal creada correctamente',
            id: nuevoId
        });
    } catch (error) {
        console.error('Error al crear sucursal:', error);
        res.status(500).json({ error: 'Error interno al crear sucursal' });
    }
};


// Cambiar el estado activa/inactiva de una sucursal
const toggleEstadoSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const { activa } = req.body; // Recibe 1 o 0 (o boolean)

        await sucursalModel.cambiarEstadoSucursal(id, activa ? 1 : 0);

        res.json({
            success: true,
            message: `Sucursal ${activa ? 'activada' : 'inactivada'} correctamente`
        });
    } catch (error) {
        console.error('Error al cambiar estado de sucursal:', error);
        res.status(500).json({ error: 'Error al cambiar estado de la sucursal' });
    }
};



module.exports = {
    getSucursales,
    crearSucursal,
    toggleEstadoSucursal
};