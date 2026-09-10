const pool = require('../config/db');

const obtenerCategorias = async () => {
    const [rows] = await pool.query(`
        SELECT *
        FROM categorias
        ORDER BY nombre ASC
    `);

    return rows;
};

module.exports = {
    obtenerCategorias
};