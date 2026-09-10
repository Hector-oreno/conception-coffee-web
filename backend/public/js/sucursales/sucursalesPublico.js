let listaSucursales = [];
let indiceSucursalActual = 0;

async function cargarSucursalesSlider() {
  const cardContainer = document.getElementById('sucursalCardInfo');
  
  if (!cardContainer) return;

  try {
    const res = await fetch('/api/sucursales');
    if (!res.ok) throw new Error('Error al consultar sucursales');
    
    const data = await res.json();

    // Filtramos solo las sucursales activas (activa == 1)
    listaSucursales = data.filter(s => s.activa == 1);

    if (listaSucursales.length === 0) {
      cardContainer.innerHTML = '<p>No hay sucursales disponibles por el momento.</p>';
      return;
    }

    // Renderizamos la primera sucursal
    indiceSucursalActual = 0;
    mostrarSucursalActual();

    // Eventos de botones
    const btnPrev = document.getElementById('btnPrevBranch');
    const btnNext = document.getElementById('btnNextBranch');

    if (btnPrev) {
      btnPrev.onclick = () => {
        indiceSucursalActual = (indiceSucursalActual > 0) ? indiceSucursalActual - 1 : listaSucursales.length - 1;
        mostrarSucursalActual();
      };
    }

    if (btnNext) {
      btnNext.onclick = () => {
        indiceSucursalActual = (indiceSucursalActual < listaSucursales.length - 1) ? indiceSucursalActual + 1 : 0;
        mostrarSucursalActual();
      };
    }

  } catch (error) {
    console.error('Error cargando sucursales:', error);
    cardContainer.innerHTML = '<p>No se pudo cargar la información de las sucursales.</p>';
  }
}

function mostrarSucursalActual() {
  const sucursal = listaSucursales[indiceSucursalActual];
  if (!sucursal) return;

  // ==========================================
  // INFORMACIÓN SEMÁNTICA DE LA SUCURSAL
  // ==========================================

  const cardContainer =
    document.getElementById(
        'sucursalCardInfo'
    );

  if (cardContainer) {

      cardContainer.innerHTML = '';


      const titulo =
          document.createElement('h3');

      titulo.textContent =
          sucursal.nombre ||
          'Conception Coffee';


      const address =
          document.createElement('address');

      address.className =
          'sucursal-address';


      // DIRECCIÓN
      if (sucursal.direccion) {

        const direccion =
            document.createElement('p');

        direccion.className =
            'sucursal-detail';

        direccion.innerHTML =
            '<span aria-hidden="true">📍</span> ' +
            '<strong>Dirección:</strong> ';

        const textoDireccion =
            document.createTextNode(
                sucursal.direccion
            );

        direccion.appendChild(
            textoDireccion
        );

        address.appendChild(
            direccion
        );

      }


      // HORARIO
      if (sucursal.horario) {

        const horario =
            document.createElement('p');

        horario.className =
            'sucursal-detail';

        horario.innerHTML =
            '<span aria-hidden="true">⏰</span> ' +
            '<strong>Horario:</strong> ';

        horario.appendChild(
            document.createTextNode(
                sucursal.horario
            )
        );

        address.appendChild(
            horario
        );

      }


      // TELÉFONO
      if (sucursal.telefono) {

        const telefono =
            document.createElement('p');

        telefono.className =
            'sucursal-detail';


        const numeroLimpio =
            String(
                sucursal.telefono
            ).replace(
                /[^\d+]/g,
                ''
            );


        telefono.innerHTML =
            '<span aria-hidden="true">📞</span> ' +
            '<strong>Teléfono:</strong> ';


        const enlaceTelefono =
            document.createElement('a');

        enlaceTelefono.href =
            `tel:${numeroLimpio}`;

        enlaceTelefono.textContent =
            sucursal.telefono;


        telefono.appendChild(
            enlaceTelefono
        );

        address.appendChild(
            telefono
        );

      }


      cardContainer.appendChild(
        titulo
      );

      cardContainer.appendChild(
        address
      );

  }

  // 2. Actualizar contador
  const counter = document.getElementById('sliderCounter');
  if (counter) {
    counter.textContent = `${indiceSucursalActual + 1} de ${listaSucursales.length}`;
  }

  // 3. Actualizar mapa iframe
  const mapaIframe =
      document.getElementById(
        'mapaDinamico'
      );

  const mapaCard =
    mapaIframe?.closest(
        '.branch-map-card'
    );


  if (
    mapaIframe &&
    mapaCard
  ) {

    // Limpiar placeholder anterior
    const placeholderAnterior =
        mapaCard.querySelector(
            '.branch-map-placeholder'
        );

    if (placeholderAnterior) {
        placeholderAnterior.remove();
    }


    if (sucursal.mapa_url) {

        mapaIframe.style.display =
            'block';

        mapaIframe.src =
            sucursal.mapa_url;

        mapaIframe.title =
            `Ubicación de ${
                sucursal.nombre ||
                'Conception Coffee'
            }`;

    } else {

        mapaIframe.style.display =
            'none';

        mapaIframe.removeAttribute(
            'src'
        );


        const placeholder =
            document.createElement(
                'div'
            );

        placeholder.className =
            'branch-map-placeholder';


        const etiqueta =
            document.createElement(
                'span'
            );

        etiqueta.textContent =
            'Ubicación';


        const nombre =
            document.createElement(
                'strong'
            );

        nombre.textContent =
            sucursal.nombre ||
            'Conception Coffee';


        const mensaje =
            document.createElement(
                'p'
            );

        mensaje.textContent =
            'Mapa próximamente';


        placeholder.append(
            etiqueta,
            nombre,
            mensaje
        );


        mapaCard.appendChild(
            placeholder
        );

    }

  }
}

// Cargar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarSucursalesSlider);