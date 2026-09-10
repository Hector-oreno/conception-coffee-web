const db = require('../config/db'); 

const Experiencia = {
    getAllAdmin: () => {
        return db.query('SELECT * FROM experiencias ORDER BY id DESC');
    },

    getAllCliente: () => {
        return db.query("SELECT * FROM experiencias WHERE activo = 1 AND estado_publicacion = 'publicado' ORDER BY id DESC");
    },

    create: (data) => {
        return db.query('INSERT INTO experiencias (imagen_url, titulo, activo, estado_publicacion) VALUES (?, ?, 1, "borrador")', 
        [data.imagen_url, data.titulo]);
    },

    updateEstado: (id, activo) => {
        return db.query('UPDATE experiencias SET activo = ?, estado_publicacion = "borrador" WHERE id = ?', [activo, id]);
    },

    delete: (id) => {
        return db.query('SELECT imagen_url FROM experiencias WHERE id = ?', [id]);
    },

    deleteConfirm: (id) => {
        return db.query('DELETE FROM experiencias WHERE id = ?', [id]);
    },

    publicarTodos: () => {
        return db.query("UPDATE experiencias SET estado_publicacion = 'publicado' WHERE activo = 1");
    }
};

module.exports = Experiencia;