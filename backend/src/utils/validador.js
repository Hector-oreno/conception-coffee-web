/**
 * Helper para validar políticas de seguridad en el sistema de usuarios.
 */
const Validador = {
    // Valida si el formato de correo es correcto
    validarEmail: (email) => {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(email);
    },

    // Valida la complejidad de la contraseña
    validarPasswordRobusto: (password) => {
        // Mínimo 10 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
        const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        return regexPassword.test(password);
    }
};

module.exports = Validador;