// ==========================================================
// AUTENTICACIÓN SUCURSALES
// ==========================================================

function obtenerTokenSucursales() {

    return localStorage.getItem(
        'token_conception'
    ) || null;

}


function headersSucursales(
    headersAdicionales = {}
) {

    const token =
        obtenerTokenSucursales();


    return {

        ...headersAdicionales,

        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {})

    };

}


document.addEventListener('DOMContentLoaded', () => {
    cargarTablaSucursales();
});

// 1. Cargar la tabla de sucursales en el Admin
async function cargarTablaSucursales() {
    const tbody = document.getElementById('tablaSucursalesBody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/sucursales');
        const sucursales = await response.json();

        tbody.innerHTML = '';

        if (sucursales.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay sucursales registradas.</td></tr>`;
            return;
        }

        sucursales.forEach(suc => {
            const estadoBadge = suc.activa == 1 
                ? `<span class="badge badge-activa">Activa</span>` 
                : `<span class="badge badge-inactiva">Inactiva</span>`;

            // Botón de acción dinámico según el estado
            const btnEstadoHTML = suc.activa == 1
                ? `<button class="btn-estado btn-inactivar" title="Desactivar sucursal" onclick="toggleEstadoSucursal(${suc.id}, ${suc.activa})">
                        🚫 Desactivar
                   </button>`
                : `<button class="btn-estado btn-activar" title="Activar sucursal" onclick="toggleEstadoSucursal(${suc.id}, ${suc.activa})">
                        ✅ Activar
                    </button>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${suc.id}</strong></td>
                <td><strong>${suc.nombre}</strong></td>
                <td>${suc.direccion || '<em>Sin dirección</em>'}</td>
                <td>${suc.horario || '<em>Sin horario</em>'}</td>
                <td>${suc.telefono || '<em>N/A</em>'}</td>
                <td>${estadoBadge}</td>
                <td>${btnEstadoHTML}</td>
            `;
    
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar tabla de sucursales:', error);
    }
}

// 2. Guardar nueva sucursal completa
async function guardarNuevaSucursal(e) {
    e.preventDefault();

    const nombre = document.getElementById('nuevaSucursalNombre').value;
    const direccion = document.getElementById('nuevaSucursalDireccion').value;
    const horario = document.getElementById('nuevaSucursalHorario').value;
    const telefono = document.getElementById('nuevaSucursalTelefono').value;

    try {
        const res = await fetch('/api/sucursales', {
            method: 'POST',
            headers:
                headersSucursales({
                    'Content-Type':
                        'application/json'
                }),
            body: JSON.stringify({ nombre, direccion, horario, telefono })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            cerrarModalSucursal();
            document.getElementById('formNuevaSucursal').reset();
            
            // Recargamos la tabla y también el selector de la pestaña productos si existe
            await cargarTablaSucursales();
            if (typeof cargarSelectSucursalesAdmin === 'function') {
                cargarSelectSucursalesAdmin();
            }
        } else {
            alert('Error: ' + (data.error || 'No se pudo guardar la sucursal'));
        }
    } catch (err) {
        console.error('Error guardando sucursal:', err);
    }
}


// Cambiar estado Activa / Inactiva
async function toggleEstadoSucursal(id, estadoActual) {
    const nuevoEstado = estadoActual == 1 ? 0 : 1;
    const accionTexto = nuevoEstado === 1 ? 'activar' : 'inactivar';

    if (!confirm(`¿Estás seguro de que deseas ${accionTexto} esta sucursal?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/sucursales/${id}/estado`, {
            method: 'PATCH',
            headers:
                headersSucursales({
                    'Content-Type':
                        'application/json'
                }),
            body: JSON.stringify({ activa: nuevoEstado })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            // Recargamos la tabla de sucursales
            await cargarTablaSucursales();
            
            // Recargamos el select de productos por si se inactivo la sucursal
            if (typeof cargarSelectSucursalesAdmin === 'function') {
                await cargarSelectSucursalesAdmin();
            }
        } else {
            alert('Error: ' + (data.error || 'No se pudo cambiar el estado'));
        }
    } catch (err) {
        console.error('Error cambiando estado:', err);
    }
}

function abrirModalSucursal() {
    document.getElementById('modalSucursal').style.display = 'flex';
}

function cerrarModalSucursal() {
    document.getElementById('modalSucursal').style.display = 'none';
}

