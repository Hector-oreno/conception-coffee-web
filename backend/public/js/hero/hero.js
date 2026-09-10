// ==========================================================
// AUTENTICACIÓN HERO
// ==========================================================

function obtenerTokenHero() {

    return localStorage.getItem(
        "token_conception"
    ) || null;

}


function headersHero(
    headersAdicionales = {}
) {

    const token =
        obtenerTokenHero();


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



// Cargar los sliders al inicializar el módulo
async function cargarSlidersAdmin() {
    const tbody = document.getElementById('tbody-sliders');
    if (!tbody) return;

    try {
        const respuesta =
            await fetch(
                '/api/hero/admin',
                {
                    headers:
                        headersHero()
                }
            );

        const resultado = await respuesta.json();

        if (!resultado.success) throw new Error(resultado.message);

        tbody.innerHTML = '';

        if (resultado.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-image me-2"></i> No hay sliders registrados en este momento.
                    </td>
                </tr>`;
            return;
        }

        resultado.data.forEach(slider => {
            // Estilos estéticos según disponibilidad (Activo/Inactivo)
            const badgeActivo = slider.activo 
                ? '<span class="badge bg-success-subtle text-success px-2 py-1"><i class="fas fa-check me-1"></i>Activo</span>'
                : '<span class="badge bg-danger-subtle text-danger px-2 py-1"><i class="fas fa-times me-1"></i>Inactivo</span>';

            // Estilos Premium según estado de publicación
            const badgeSincro = slider.estado_publicacion === 'publicado'
                ? '<span class="badge bg-info-subtle text-info px-2 py-1"><i class="fas fa-globe me-1"></i>Publicado</span>'
                : '<span class="badge bg-warning-subtle text-warning px-2 py-1"><i class="fas fa-edit me-1"></i>Borrador</span>';

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="text-center fw-bold">${slider.orden}</td>
                <td>
                    <img src="${slider.imagen_url}" class="img-thumbnail" style="width: 100px; height: 50px; object-fit: cover;">
                </td>
                <td class="text-muted text-break">${slider.imagen_url}</td>
                <td class="text-center">${badgeActivo}</td>
                <td class="text-center">${badgeSincro}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" onclick="alternarEstadoSlider(${slider.id}, ${slider.orden}, ${slider.activo})">
                            <i class="fas ${slider.activo ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="eliminarSliderAdmin(${slider.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al cargar sliders:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle me-2"></i> Error al conectar con el servidor.
                </td>
            </tr>`;
    }
}

function abrirModalSlider() {
    const formulario = document.getElementById('form-slider');
    if (formulario) formulario.reset();
    
    const inputId = document.getElementById('slider-id');
    if (inputId) inputId.value = '';

    const modalElement = document.getElementById('modalSlider');
    if (!modalElement) {
        console.error("No se encontró el elemento HTML con id 'modalSlider'");
        return;
    }
    
    // Dejamos que Bootstrap manipule el estado de forma nativa y limpia
    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalBootstrap.show();
}

// Guardar nuevo registro (Envío con Multipart/Form-Data para Multer)
async function guardarSlider(event) {
    event.preventDefault();

    const inputFile = document.getElementById('slider-imagen');
    if (inputFile.files.length === 0) {
        alert('Por favor, selecciona una imagen.');
        return;
    }

    const formData = new FormData();
    formData.append('imagen', inputFile.files[0]);

    try {
        const respuesta = await fetch('/api/hero', {
            method: 'POST',
            headers: headersHero(),
            body: formData
        });

        const resultado = await respuesta.json();
        if (!resultado.success) throw new Error(resultado.message);

        // Ocultar modal e informar
        const modalElement = document.getElementById('modalSlider');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();

        alert('Slider agregado correctamente como borrador.');
        cargarSlidersAdmin();

    } catch (error) {
        console.error('Error al guardar slider:', error);
        alert('Ocurrió un error al subir la imagen.');
    }
}

// Activar/Desactivar temporalmente (Lo devuelve a modo borrador hasta publicar)
async function alternarEstadoSlider(id, orden, estadoActual) {
    try {
        const nuevoEstadoActivo = estadoActual === 1 ? 0 : 1;

        const respuesta = await fetch(`/api/hero/${id}`, {
            method: 'PUT',
            headers:
                headersHero({
                    'Content-Type':
                        'application/json'
                }),

            body: JSON.stringify({ orden: orden, activo: nuevoEstadoActivo })
        });

        const resultado = await respuesta.json();
        if (!resultado.success) throw new Error(resultado.message);

        cargarSlidersAdmin();
    } catch (error) {
        console.error('Error al alternar estado:', error);
    }
}

// Eliminar permanentemente
async function eliminarSliderAdmin(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este slider de forma permanente? Se borrará el archivo físico del servidor.')) return;

    try {
        const respuesta = await fetch(`/api/hero/${id}`, { method: 'DELETE', headers: headersHero() });
        const resultado = await respuesta.json();

        if (!resultado.success) throw new Error(resultado.message);

        alert('Slider eliminado con éxito.');
        cargarSlidersAdmin();
    } catch (error) {
        console.error('Error al eliminar slider:', error);
    }
}

// Botón Publicar: Pasa todos los borradores a la web del cliente
async function publicarSlidersAlCliente() {
    try {
        const respuesta = await fetch('/api/hero/publicar', { method: 'PUT', headers: headersHero() });
        const resultado = await respuesta.json();

        if (!resultado.success) throw new Error(resultado.message);

        alert('¡Cambios sincronizados! La vitrina del cliente se ha actualizado.');
        cargarSlidersAdmin();
    } catch (error) {
        console.error('Error al publicar cambios:', error);
        alert('Error al intentar publicar los cambios.');
    }
}