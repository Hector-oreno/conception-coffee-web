const pool = require('../config/db');

const registrarMovimiento = async (log) => {
    // Desestructuramos usando los campos reales de tu tabla
    const { id_usuario, rol_usuario, accion, tabla_afectada, id_registro_afectado, descripcion, valor_anterior, valor_nuevo } = log;

    const query = `
        INSERT INTO auditoria_logs 
        (id_usuario, rol_usuario, accion, tabla_afectada, id_registro_afectado, descripcion, valor_anterior, valor_nuevo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await pool.query(query, [
        id_usuario || null,      // Si no hay sesión, guarda NULL
        rol_usuario || 'Admin',  // Por defecto Admin si no hay roles aún
        accion,                  // Ejemplo: 'CREAR'
        tabla_afectada,          // 'productos'
        id_registro_afectado,    // El id que devolvió MariaDB
        descripcion || null,     // Un texto opcional
        valor_anterior || null,  // JSON anterior (NULL al crear)
        valor_nuevo || null      // JSON con los datos nuevos
    ]);

    return resultado;
};

module.exports = { registrarMovimiento };