const pool = require('../config/db');

// ==========================================================
// OBTENER TODAS LAS SUCURSALES
// ==========================================================

const obtenerSucursales = async () => {

    const [rows] =
        await pool.query(`
            SELECT
                id,
                nombre,
                direccion,
                horario,
                telefono,
                mapa_url,
                activa,
                es_principal
            FROM sucursales
            ORDER BY
                es_principal DESC,
                id ASC
        `);

    return rows;

};


// Obtener la sucursal principal activa
const obtenerSucursalPrincipal = async () => {

    const [rows] = await pool.query(`
        SELECT
            id,
            nombre,
            direccion,
            horario,
            telefono,
            mapa_url
        FROM sucursales
        WHERE activa = 1
        AND es_principal = 1
        LIMIT 1
    `);

    return rows.length > 0
        ? rows[0]
        : null;

};

const obtenerSucursalActivaPorId =
    async (id) => {

        const [rows] =
            await pool.query(
                `
                SELECT
                    id,
                    nombre,
                    direccion,
                    horario,
                    telefono,
                    mapa_url
                FROM sucursales
                WHERE id = ?
                AND activa = 1
                LIMIT 1
                `,
                [id]
            );


        return rows.length > 0
            ? rows[0]
            : null;

    };


// Insertar sucursal completa
const insertarSucursal = async (nombre, direccion, horario, telefono) => {
    const query = 'INSERT INTO sucursales (nombre, direccion, horario, telefono, activa) VALUES (?, ?, ?, ?, 1)';
    const [resultado] = await pool.query(query, [nombre, direccion || null, horario || null, telefono || null]);
    return resultado.insertId;
};

// Cambiar estado activa / inactiva
const cambiarEstadoSucursal = async (id, activa) => {
    const query = 'UPDATE sucursales SET activa = ? WHERE id = ?';
    await pool.query(query, [activa, id]);
};

module.exports = {
    obtenerSucursales,
    insertarSucursal,
    cambiarEstadoSucursal,
    obtenerSucursalPrincipal,
    obtenerSucursalActivaPorId
};