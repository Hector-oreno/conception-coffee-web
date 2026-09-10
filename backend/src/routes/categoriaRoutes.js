const express = require('express');

const router = express.Router();

const {
    getCategorias
} = require('../controllers/categoriaController');

router.get('/', getCategorias);

module.exports = router;