const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <--- ¡Importación corregida aquí!

// ══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL ALMACENAMIENTO (MULTER)
// ══════════════════════════════════════════════════════════════
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // process.cwd() apunta a la raíz del backend (C:\Proyectos\conception-coffee-web\backend)
        const destPath = path.join(process.cwd(), 'public/images/uploads');
        
        // Creamos la carpeta automáticamente si hiciera falta de forma segura con fs
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        
        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ══════════════════════════════════════════════════════════════
// FILTRO DE SEGURIDAD PARA IMÁGENES
// ══════════════════════════════════════════════════════════════
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (jpg, jpeg, png, webp)'));
    }
};

// ══════════════════════════════════════════════════════════════
// INICIALIZACIÓN DEL MIDDLEWARE
// ══════════════════════════════════════════════════════════════
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite máximo de 5MB por foto
});

module.exports = upload;