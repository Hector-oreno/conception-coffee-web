
let sesionesAuditoria = [];

let filtroAuditoriaActual =
    'activas';


// 1. Obtener historial de auditoría de sesiones
async function cargarAuditoriaIPs() {
    const tbody = document.getElementById('tbody-auditoria');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando registros de auditoría...</td></tr>';

    const token =
        obtenerTokenUsuario();

    if (!token) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    Debes iniciar sesión para consultar la auditoría.
                </td>
            </tr>
        `;

        return;

    }

    try {
        const res = await fetch('/api/usuarios/auditoria-sesiones', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await res.json();

        if (!result.success || !result.data || result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Sin actividad de sesiones registrada.</td></tr>';
            return;
        }


        sesionesAuditoria =
            result.data;

        renderizarAuditoria();

        
    } catch (error) {
        console.error('Error en auditoría:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Error al conectar con el servidor de auditoría.</td></tr>';
    }
}


function renderizarAuditoria() {

    const tbody =
        document.getElementById(
            'tbody-auditoria'
        );

    if (!tbody) return;


    const ahora =
        new Date();


    // ==========================================
    // CLASIFICAR SESIONES
    // ==========================================

    const sesiones =
        sesionesAuditoria.filter(
            sesion => {

                const expirada =
                    sesion.expira_en &&
                    new Date(
                        sesion.expira_en
                    ) <= ahora;


                const activa =
                    Number(
                        sesion.revocada
                    ) !== 1 &&
                    !sesion.logout_en &&
                    !expirada;


                if (
                    filtroAuditoriaActual ===
                    'activas'
                ) {

                    return activa;

                }


                if (
                    filtroAuditoriaActual ===
                    'finalizadas'
                ) {

                    return !activa;

                }


                return true;

            }
        );


    // ==========================================
    // CONTADOR
    // ==========================================

    const cantidad =
        document.getElementById(
            'auditoriaCantidad'
        );


    if (cantidad) {

        cantidad.textContent =
            `${sesiones.length} ${
                sesiones.length === 1
                    ? 'sesión'
                    : 'sesiones'
            }`;

    }


    // ==========================================
    // SIN RESULTADOS
    // ==========================================

    if (sesiones.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center"
                >
                    No hay sesiones para mostrar.
                </td>

            </tr>

        `;

        return;

    }


    // ==========================================
    // RENDER
    // ==========================================

    tbody.innerHTML =
        sesiones.map(
            sesion => {

                let badgeEstado = '';

                let botonRevocar = '-';


                const expirada =
                    sesion.expira_en &&
                    new Date(
                        sesion.expira_en
                    ) <= ahora;


                if (
                    Number(
                        sesion.revocada
                    ) === 1
                ) {

                    badgeEstado =
                        '<span class="badge-sesion-revocada">Revocada</span>';

                } else if (
                    sesion.logout_en
                ) {

                    badgeEstado =
                        '<span class="badge-sesion-cerrada">Cerrada</span>';

                } else if (
                    expirada
                ) {

                    badgeEstado =
                        '<span class="badge-sesion-expirada">Expirada</span>';

                } else {

                    badgeEstado =
                        '<span class="badge-sesion-activa">Activa</span>';


                    botonRevocar = `

                        <button
                            class="btn-revocar"
                            onclick="revocarSesion('${sesion.jti}')"
                            title="Forzar cierre"
                        >
                            <i class="fas fa-ban"></i>
                            Revocar
                        </button>

                    `;

                }


                return `

                    <tr>

                        <td>
                            <code>
                                #${sesion.id}
                            </code>
                        </td>

                        <td>

                            <strong>
                                ${sesion.nombre}
                            </strong>

                            <br>

                            <small>
                                ${sesion.correo}
                            </small>

                        </td>

                        <td>

                            <span class="badge-rol">
                                ${sesion.rol.toUpperCase()}
                            </span>

                        </td>

                        <td>

                            <code class="ip-block">
                                ${sesion.ip_origen || '0.0.0.0'}
                            </code>

                        </td>

                        <td>

                            <span
                                class="text-truncate-ua"
                                title="${sesion.user_agent || 'Desconocido'}"
                            >
                                ${simplificarUserAgent(
                                    sesion.user_agent
                                )}
                            </span>

                        </td>

                        <td>
                            ${
                                new Date(
                                    sesion.login_en
                                ).toLocaleString()
                            }
                        </td>

                        <td>
                            ${badgeEstado}
                        </td>

                        <td>
                            ${botonRevocar}
                        </td>

                    </tr>

                `;

            }
        )
        .join('');

}


function filtrarAuditoria(
    estado,
    boton
) {

    filtroAuditoriaActual =
        estado;


    document
        .querySelectorAll(
            '.auditoria-filtro'
        )
        .forEach(
            item =>
                item.classList.remove(
                    'active'
                )
        );


    if (boton) {

        boton.classList.add(
            'active'
        );

    }


    renderizarAuditoria();

}



// 2. Revocar sesión explícitamente desde la tabla por JTI
async function revocarSesion(jti) {
    if (!confirm('¿Estás seguro de que deseas revocar esta sesión? El usuario será desconectado inmediatamente.')) {
        return;
    }

    try {
        const token =
            obtenerTokenUsuario();

        if (!token) {

            alert(
                'Debes iniciar sesión para administrar sesiones.'
            );

            return;

        }


        const res = await fetch('/api/usuarios/revocar-sesion', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ jti })
        });

        const data = await res.json();

        if (data.success) {
            alert('Sesión revocada exitosamente.');
            cargarAuditoriaIPs(); // Refrescar tabla
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error al revocar sesión:', error);
        alert('No se pudo revocar la sesión.');
    }
}

function simplificarUserAgent(ua) {
    if (!ua) return 'Desconocido';

    let sistema =
        ua.includes('Windows') ? 'Windows' :
        ua.includes('Mac') ? 'macOS' :
        ua.includes('Android') ? 'Android' :
        ua.includes('iPhone') ? 'iOS' :
        'Linux';

    let navegador =
        ua.includes('Edg') ? 'Edge' :
        ua.includes('Chrome') ? 'Chrome' :
        ua.includes('Firefox') ? 'Firefox' :
        'Safari';

    return `${navegador} (${sistema})`;
}
// Uso al renderizar la celda: simplificarUserAgent(sesion.user_agent) -> "Chrome (Windows)"