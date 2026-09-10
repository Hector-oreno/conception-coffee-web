document
    .getElementById('form-login')
    .addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();


            const correo =
                document
                    .getElementById('correo')
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById('password')
                    .value;


            const boton =
                document.querySelector(
                    '.btn-login'
                );


            try {

                // ==========================================
                // BLOQUEAR BOTÓN
                // ==========================================

                boton.disabled = true;

                boton.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Verificando...
                `;


                // ==========================================
                // LOGIN
                // ==========================================

                const res =
                    await fetch(
                        '/api/usuarios/login',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify({
                                    correo,
                                    password
                                })
                        }
                    );


                const data =
                    await res.json();


                // ==========================================
                // LOGIN FALLIDO
                // ==========================================

                if (
                    !res.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        'Credenciales inválidas.'
                    );

                    return;

                }


                // ==========================================
                // GUARDAR SESIÓN
                // ==========================================

                localStorage.setItem(
                    'token_conception',
                    data.token
                );


                localStorage.setItem(
                    'usuario_conception',
                    JSON.stringify(
                        data.usuario
                    )
                );


                // ==========================================
                // IR AL ADMIN
                // ==========================================

                window.location.href =
                    '/admin.html';


            } catch (error) {

                console.error(
                    'Error iniciando sesión:',
                    error
                );


                alert(
                    'No fue posible conectar con el servidor.'
                );


            } finally {

                boton.disabled = false;

                boton.innerHTML = `
                    <i class="fas fa-lock"></i>
                    Iniciar Sesión
                `;

            }

        }
    );