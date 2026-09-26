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
                imagen_url,
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

    const [rows] =
        await pool.query(`
            SELECT
                id,
                nombre,
                direccion,
                horario,
                telefono,
                mapa_url,
                imagen_url
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
                    mapa_url,
                    imagen_url
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
const insertarSucursal =
    async (
        nombre,
        direccion,
        horario,
        telefono,
        mapaUrl,
        imagenUrl
    ) => {

        const [resultado] =
            await pool.query(
                `
                INSERT INTO sucursales
                (
                    nombre,
                    direccion,
                    horario,
                    telefono,
                    mapa_url,
                    imagen_url,
                    activa
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    1
                )
                `,
                [
                    nombre,
                    direccion || null,
                    horario || null,
                    telefono || null,
                    mapaUrl || null,
                    imagenUrl || null
                ]
            );


        return resultado.insertId;

    };



const actualizarSucursal =
    async (
        id,
        nombre,
        direccion,
        horario,
        telefono,
        mapaUrl,
        imagenUrl
    ) => {

        const [resultado] =
            await pool.query(
                `
                UPDATE sucursales
                SET
                    nombre = ?,
                    direccion = ?,
                    horario = ?,
                    telefono = ?,
                    mapa_url = ?,
                    imagen_url = ?
                WHERE id = ?
                `,
                [
                    nombre,
                    direccion || null,
                    horario || null,
                    telefono || null,
                    mapaUrl || null,
                    imagenUrl || null,
                    id
                ]
            );


        return resultado.affectedRows > 0;

    };




const cambiarEstadoSucursal =
    async (id, activa) => {

        const [resultado] =
            await pool.query(
                `
                UPDATE sucursales
                SET activa = ?
                WHERE id = ?
                `,
                [
                    activa,
                    id
                ]
            );


        return resultado.affectedRows > 0;

    };


const obtenerSucursalPorId =
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
                    mapa_url,
                    imagen_url,
                    activa,
                    es_principal
                FROM sucursales
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        return rows.length > 0
            ? rows[0]
            : null;

    };



module.exports = {
     obtenerSucursales,
    insertarSucursal,
    actualizarSucursal,
    cambiarEstadoSucursal,
    obtenerSucursalPrincipal,
    obtenerSucursalActivaPorId,
    obtenerSucursalPorId
};