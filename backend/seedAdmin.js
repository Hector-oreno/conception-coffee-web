require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./src/config/db');


// ==========================================================
// DATOS DEL PRIMER ADMINISTRADOR
// ==========================================================

const ADMIN = {

    nombre: 'Hector Oreno',

    correo: 'heoreno@conceptioncoffee.com',

    password: ''

};


// ==========================================================
// POLÍTICA DE CONTRASEÑA
// ==========================================================

const regexPasswordSegura =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#-]).{10,}$/;


// ==========================================================
// CREAR PRIMER ADMINISTRADOR
// ==========================================================

async function crearPrimerAdmin() {

    try {

        const nombre =
            String(ADMIN.nombre || '').trim();

        const correo =
            String(ADMIN.correo || '')
                .trim()
                .toLowerCase();

        const password =
            String(ADMIN.password || '');


        // Validar campos
        if (!nombre || !correo || !password) {

            throw new Error(
                'Nombre, correo y contraseña son obligatorios.'
            );

        }


        // Validar contraseña
        if (!regexPasswordSegura.test(password)) {

            throw new Error(
                'La contraseña debe tener mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
            );

        }


        // Verificar si ya existe un administrador
        const [admins] =
            await db.query(`
                SELECT id
                FROM usuarios
                WHERE rol = 'admin'
                LIMIT 1
            `);


        if (admins.length > 0) {

            throw new Error(
                'Ya existe un administrador. El seed fue cancelado.'
            );

        }


        // Verificar si el correo ya existe
        const [existente] =
            await db.query(
                `
                SELECT id
                FROM usuarios
                WHERE correo = ?
                LIMIT 1
                `,
                [correo]
            );


        if (existente.length > 0) {

            throw new Error(
                'Ya existe un usuario con ese correo.'
            );

        }


        // Crear hash seguro
        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        // Insertar administrador
        const [resultado] =
            await db.query(
                `
                INSERT INTO usuarios
                (
                    nombre,
                    correo,
                    password_hash,
                    rol,
                    sucursal_id,
                    activo
                )
                VALUES
                (
                    ?, ?, ?, 'admin', NULL, 1
                )
                `,
                [
                    nombre,
                    correo,
                    passwordHash
                ]
            );


        console.log('');
        console.log(
            'Administrador creado correctamente.'
        );

        console.log(
            `ID: ${resultado.insertId}`
        );

        console.log(
            `Correo: ${correo}`
        );


    } catch (error) {

        console.error('');
        console.error(
            'No se creó el administrador:'
        );

        console.error(
            error.message
        );


    } finally {

        await db.end();

    }

}


crearPrimerAdmin();