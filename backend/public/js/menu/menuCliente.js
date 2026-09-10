document.addEventListener('DOMContentLoaded', async () => {

    const sucursalActiva =
        await inicializarSelector();

    await Promise.all([
        cargarCartaDigital(sucursalActiva),
        cargarEspecialDelDia(sucursalActiva)
    ]);

    inicializarVisorEspecial();

});

const EspecialDelDia = {

    dia: null,

    sucursal: null

};


/**
 * Carga las sucursales desde la API y gestiona la interacción del selector
 */
async function inicializarSelector() {
    const select = document.getElementById('selectSucursal');
    if (!select) return 1;

    try {
        const res = await fetch('/api/sucursales');
        const sucursales = await res.json();

        select.innerHTML = '';

        // Detectar sucursal desde URL (?sucursal=X) o localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let activeId = urlParams.get('sucursal') || localStorage.getItem('sucursal_id');

        sucursales.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.nombre;
            select.appendChild(opt);
        });

        // Si la sucursal guardada no existe en la lista, usar la primera de la BD
        if (!activeId || !sucursales.some(s => s.id == activeId)) {
            activeId = sucursales[0] ? sucursales[0].id : 1;
        }

        select.value = activeId;
        localStorage.setItem('sucursal_id', activeId);

        // Evento al cambiar de sucursal
        select.addEventListener('change', async (e) => {
            const nuevaSucursal = e.target.value;
            localStorage.setItem('sucursal_id', nuevaSucursal);

            // Actualizar la URL de la página dinámicamente sin recargar
            const newUrl = `${window.location.pathname}?sucursal=${nuevaSucursal}${window.location.hash}`;
            window.history.pushState({ path: newUrl }, '', newUrl);

            // Recargar la carta con la nueva sucursal
            await Promise.all([

              cargarCartaDigital(
                nuevaSucursal
              ),

              cargarEspecialDelDia(
                nuevaSucursal
              )

            ]);


        });

        return activeId;
    } catch (err) {
        console.error('Error cargando sucursales:', err);
        return 1;
    }
}

/**
 * Función principal para obtener datos del backend filtrados por sucursal y pintar la carta
 */
async function cargarCartaDigital(sucursalId = 1) {
    const contenedorCatalogos = document.getElementById('contenedor-catalogos');
    const categoriasList = document.getElementById('categorias-list');

    if (!contenedorCatalogos) return;

    try {
        // Hacemos el fetch incluyendo el sucursalId
        const response = await fetch(`/api/productos?sucursal=${sucursalId}&soloDisponibles=true`) 
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        
        // Manejamos si la respuesta viene dentro de data.data o directa
        const productos = Array.isArray(data) ? data : (data.data || []);

        if (productos.length === 0) {
            contenedorCatalogos.innerHTML = `
                <div class="no-products">
                    <p>No hay platillos disponibles para esta sucursal por el momento. Por favor selecciona otra sede.</p>
                </div>`;
            if (categoriasList) categoriasList.innerHTML = '';
            return;
        }

        // 1. Agrupar productos por su categoría usando el slug
        const categoriasMap = agruparPorCategoria(productos);

        // 2. Limpiar contenedores
        contenedorCatalogos.innerHTML = '';
        if (categoriasList) categoriasList.innerHTML = '';

        // 3. Renderizar el Índice Lateral y cada Sección de Productos
        let contadorCategoria = 1;

        Object.keys(categoriasMap).forEach(slug => {
            const grupo = categoriasMap[slug];
            const numFormateado = contadorCategoria < 10 ? `0${contadorCategoria}` : contadorCategoria;

            // Renderizar elemento en la barra lateral (Aside Index)
            if (categoriasList) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#${slug}" class="${contadorCategoria === 1 ? 'active' : ''}">
                        <span class="num">${numFormateado}</span> ${grupo.nombre.toUpperCase()}
                    </a>`;
                categoriasList.appendChild(li);
            }

            // Renderizar la sección completa de la categoría
            const sectionHTML = crearSeccionCategoria(slug, grupo.nombre, grupo.productos);
            contenedorCatalogos.insertAdjacentHTML('beforeend', sectionHTML);

            contadorCategoria++;
        });

        // 4. Activar el observador para resaltar la categoría activa al hacer scroll
        activarScrollSpy();

    } catch (error) {
        console.error('Error al cargar la carta digital:', error);
        contenedorCatalogos.innerHTML = `
            <div class="error-msg">
                <p>Hubo un problema al cargar el menú. Intenta recargar la página.</p>
            </div>`;
    }
}

/**
 * Agrupa el array de productos por el slug de su categoría
 */
function agruparPorCategoria(productos) {
    return productos.reduce((acc, prod) => {
        let slug = prod.categoria_slug;
        
        if (!slug && prod.categoria_nombre) {
            slug = prod.categoria_nombre.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita acentos
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
        }

        slug = slug || 'desayunos';
        const nombreCat = prod.categoria_nombre || 'Desayunos';

        if (!acc[slug]) {
            acc[slug] = {
                nombre: nombreCat,
                productos: []
            };
        }
        acc[slug].productos.push(prod);
        return acc;
    }, {});
}

/**
 * Genera el marcado HTML5 semántico para una sección de categoría
 */
function crearSeccionCategoria(slug, nombreCategoria, listaProductos) {
    const articulosHTML = listaProductos.map(prod => {
        const precioFormateado = parseFloat(prod.precio || 0).toFixed(2);
        
        // Renderizado de Imagen encajonada
        // Reemplaza esta parte dentro de crearSeccionCategoria:

        // Si vas a usar el logo_carta.png:
        const imagen =
          typeof prod.imagen === "string"
            ? prod.imagen.trim()
            : "";


        const esFallback =
          !imagen ||
          imagen.toLowerCase().includes(
            "logo_carta.png"
          );


        const renderVisual =
          !esFallback
            ? `
              <div class="product-icon-box">
                  <img
                    src="${imagen}"
                    alt="${prod.nombre}"
                    class="product-img-thumb"
                    loading="lazy"
                  >
              </div>
            `
          : "";

        const badgeDestacado = prod.destacado ? `<span class="tag">RECOMENDADO</span>` : '';

        return `
            <article
              class="product-item ${esFallback ? "product-without-image" : "product-with-image"}"
              id="producto-${prod.id}"
            >

              ${renderVisual}

              <div class="product-details">

                <div class="product-head">

                  <h3 class="product-title">
                    ${prod.nombre}
                  </h3>

                  <div class="product-price">
                    <span class="currency">Q</span>
                    ${precioFormateado}
                  </div>

              </div>

              ${
                  prod.descripcion
                    ? `
                        <p class="product-description">
                            ${prod.descripcion}
                        </p>
                    `
                    : ""
              }

              ${
                badgeDestacado
                    ? `
                        <div class="product-tags">
                            ${badgeDestacado}
                        </div>
                    `
                    : ""
              }

          </div>

      </article>
    `;
    }).join('');

    return `
        <section id="${slug}" class="category-block">
            <header class="category-header">
                <h2>${nombreCategoria}</h2>
            </header>
            <div class="products-list">
                ${articulosHTML}
            </div>
        </section>
    `;
}

/**
 * Resalta automáticamente en el índice lateral la sección visible al hacer scroll
 */
function activarScrollSpy() {
    const sections = document.querySelectorAll('.category-block');
    const navLinks = document.querySelectorAll('.index-menu a');

    window.addEventListener('scroll', () => {
        let actual = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 150)) {
                actual = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${actual}`) {
                link.classList.add('active');
            }
        });
    });
}


// ==========================================================
// ESPECIAL DEL DÍA
// ==========================================================

async function cargarEspecialDelDia(
    sucursalId
) {

    const contenido =
        document.getElementById(
            "especialDelDiaContenido"
        );

    const fecha =
        document.getElementById(
            "especialDelDiaFecha"
        );

    const estado =
        document.getElementById(
            "especialDelDiaEstado"
        );

    const btnAbrir =
        document.getElementById(
            "abrirEspecialDelDia"
        );


    if (
        !contenido ||
        !fecha ||
        !estado ||
        !btnAbrir
    ) {
        return;
    }


    EspecialDelDia.dia =
        null;

    EspecialDelDia.sucursal =
        null;

    btnAbrir.hidden =
        true;


    try {

        const response =
            await fetch(
                `/api/planner/menu-semana?sucursal=${encodeURIComponent(
                    sucursalId
                )}`
            );


        const resultado =
            await response.json();


        if (
            !response.ok ||
            !resultado.success
        ) {

            throw new Error(
                resultado.message ||
                "No fue posible cargar el menú ejecutivo."
            );

        }


        EspecialDelDia.sucursal =
            resultado.sucursal || null;


        const dias =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        if (dias.length === 0) {

            renderEspecialSinPlanificacion(
                contenido,
                fecha,
                estado
            );

            return;

        }


        const hoy =
          new Date();

        const nombresDias = [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado"
        ];

        const nombreHoy =
          nombresDias[hoy.getDay()];


        const diaHoy =
          dias.find(
            dia =>
              dia.dia_semana === nombreHoy
          );


        if (!diaHoy) {

            renderEspecialSinPlanificacion(
                contenido,
                fecha,
                estado
            );

            return;

        }


        EspecialDelDia.dia =
            diaHoy;


        renderEspecialDelDia(
            diaHoy,
            contenido,
            fecha,
            estado,
            btnAbrir
        );


    } catch (error) {

        console.error(
            "Error cargando Especial del Día:",
            error
        );


        renderEspecialSinPlanificacion(
            contenido,
            fecha,
            estado
        );

    }

}


function obtenerFechaLocalISO() {

    const hoy =
        new Date();


    return (
        hoy.getFullYear() +
        "-" +
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            hoy.getDate()
        ).padStart(2, "0")
    );

}


function obtenerFechaLocalISO() {

    const hoy =
        new Date();


    return (
        hoy.getFullYear() +
        "-" +
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            hoy.getDate()
        ).padStart(2, "0")
    );

}


function renderEspecialDelDia(
    dia,
    contenido,
    fecha,
    estado,
    btnAbrir
) {

    fecha.textContent =
        formatearFechaCarta(
            dia.fecha_especifica,
            dia.dia_semana
        );


    const estadoDia =
        String(
            dia.estado_dia || ""
        ).toUpperCase();


    if (
        estadoDia === "CERRADO" ||
        estadoDia === "FERIADO"
    ) {

        estado.textContent =
            estadoDia === "FERIADO"
                ? "Feriado"
                : "Hoy descansamos";


        contenido.innerHTML = "";


        const titulo =
            document.createElement(
                "h2"
            );


        titulo.className =
            "daily-special-title";


        titulo.textContent =
            dia.texto_alternativo ||
            (
                estadoDia === "FERIADO"
                    ? "Horario especial"
                    : "Nos vemos nuevamente mañana"
            );


        contenido.appendChild(
            titulo
        );


        btnAbrir.hidden =
            true;


        return;

    }


    if (!dia.plato_catalogo_id) {

        renderEspecialSinPlanificacion(
            contenido,
            fecha,
            estado
        );

        return;

    }


    estado.textContent =
        "Especial del día";


    contenido.innerHTML =
        "";


    const principal =
        document.createElement(
            "div"
        );


    principal.className =
        "daily-special-main";


    const texto =
        document.createElement(
            "div"
        );


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.className =
        "daily-special-title";


    titulo.textContent =
        dia.plato_base_nombre ||
        "Menú Ejecutivo";


    texto.appendChild(
        titulo
    );


    if (dia.acompanamientos) {

        const acomp =
            document.createElement(
                "p"
            );


        acomp.className =
            "daily-special-sides";


        acomp.textContent =
            dia.acompanamientos
                .split(",")
                .map(item =>
                    item.trim()
                )
                .filter(Boolean)
                .join(" · ");


        texto.appendChild(
            acomp
        );

    }


    principal.appendChild(
        texto
    );


    if (dia.precio_real) {

        const precio =
            document.createElement(
                "div"
            );


        precio.className =
            "daily-special-price";


        precio.textContent =
            `Q${Number(
                dia.precio_real
            ).toFixed(2)}`;


        principal.appendChild(
            precio
        );

    }


    contenido.appendChild(
        principal
    );


    btnAbrir.hidden =
        false;

}

function renderEspecialSinPlanificacion(
    contenido,
    fecha,
    estado
) {

    fecha.textContent =
        "Menú Ejecutivo";


    estado.textContent =
        "Próximamente";


    contenido.innerHTML =
        "";


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.className =
        "daily-special-title";


    titulo.textContent =
        "Estamos preparando el próximo especial";


    const texto =
        document.createElement(
            "p"
        );


    texto.className =
        "daily-special-sides";


    texto.textContent =
        "Consulta nuevamente pronto.";


    contenido.append(
        titulo,
        texto
    );

}

function formatearFechaCarta(
    fechaISO,
    diaSemana = ""
) {

    if (!fechaISO) {
        return diaSemana;
    }


    const partes =
        String(fechaISO)
            .substring(0, 10)
            .split("-")
            .map(Number);


    if (partes.length !== 3) {
        return diaSemana;
    }


    const fecha =
        new Date(
            partes[0],
            partes[1] - 1,
            partes[2]
        );


    const fechaTexto =
        fecha.toLocaleDateString(
            "es-GT",
            {
                day: "numeric",
                month: "long"
            }
        );


    return diaSemana
        ? `${diaSemana} · ${fechaTexto}`
        : fechaTexto;

}

// ==========================================================
// VISOR DEL MENÚ EJECUTIVO
// ==========================================================

function inicializarVisorEspecial() {

    const btnAbrir =
        document.getElementById(
            "abrirEspecialDelDia"
        );

    const btnCerrar =
        document.getElementById(
            "cerrarEspecialDelDia"
        );

    const overlay =
        document.getElementById(
            "dailyMenuOverlay"
        );


    if (
        !btnAbrir ||
        !btnCerrar ||
        !overlay
    ) {
        return;
    }


    btnAbrir.addEventListener(
        "click",
        abrirVisorEspecial
    );


    btnCerrar.addEventListener(
        "click",
        cerrarVisorEspecial
    );


    overlay
        .querySelectorAll(
            "[data-close-daily-menu]"
        )
        .forEach(elemento => {

            elemento.addEventListener(
                "click",
                cerrarVisorEspecial
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !overlay.hidden
            ) {

                cerrarVisorEspecial();

            }

        }
    );

}

function abrirVisorEspecial() {

    const overlay =
        document.getElementById(
            "dailyMenuOverlay"
        );

    const contenedor =
        document.getElementById(
            "dailyMenuTemplate"
        );


    if (
        !overlay ||
        !contenedor ||
        !EspecialDelDia.dia
    ) {
        return;
    }


    const datos =
        prepararDatosEspecial(
            EspecialDelDia.dia
        );


    const variante =
        obtenerVariantePlantilla(
            EspecialDelDia.dia
        );


    contenedor.innerHTML =
        construirPlantillaEspecial(
            datos,
            variante
        );


    overlay.hidden =
        false;


    document.body.classList.add(
        "daily-menu-open"
    );


    requestAnimationFrame(
        () => {

            overlay.classList.add(
                "is-open"
            );

        }
    );


    const btnCerrar =
        document.getElementById(
            "cerrarEspecialDelDia"
        );


    if (btnCerrar) {
        btnCerrar.focus();
    }

}

function cerrarVisorEspecial() {

    const overlay =
        document.getElementById(
            "dailyMenuOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.remove(
        "is-open"
    );


    document.body.classList.remove(
        "daily-menu-open"
    );


    setTimeout(
        () => {

            overlay.hidden =
                true;

        },
        220
    );

}


function prepararDatosEspecial(
    dia
) {

    let configuracion = {};


    try {

        configuracion =
            typeof dia.plantilla_configuracion ===
            "string"
                ? JSON.parse(
                    dia.plantilla_configuracion
                )
                : (
                    dia.plantilla_configuracion ||
                    {}
                );

    } catch (error) {

        console.warn(
            "Configuración de plantilla inválida:",
            error
        );

        configuracion = {};

    }


    const acompanamientos =
        dia.acompanamientos
            ? dia.acompanamientos
                .split(",")
                .map(item =>
                    item.trim()
                )
                .filter(Boolean)
            : [];


    const imagen =
        dia.imagen
            ? String(
                dia.imagen
            ).trim()
            : "";


    const esImagenFallback =
        !imagen ||
        imagen
            .toLowerCase()
            .includes(
                "logo_carta"
            );


    return {

        configuracion,

        nombre:
            dia.plato_base_nombre ||
            "Menú Ejecutivo",

        acompanamientos,

        precio:
            dia.precio_real ||
            null,

        imagen,

        esImagenFallback

    };

}

function obtenerVariantePlantilla(
    dia
) {

    if (
        !dia.plantilla_id ||
        Number(
            dia.plantilla_activa
        ) !== 1
    ) {

        return "fallback";

    }


    switch (
        String(
            dia.plantilla_slug || ""
        ).toLowerCase()
    ) {

        case "conception-clasica":
            return "clasica";


        case "conception-moderna":
            return "moderna";


        case "conception-premium":
            return "premium";


        default:
            return "fallback";

    }

}

function construirPlantillaEspecial(
    datos,
    variante
) {

    const {
        configuracion,
        nombre,
        acompanamientos,
        precio,
        imagen,
        esImagenFallback
    } = datos;


    return `

        <article
            class="
                menu-plantilla
                menu-plantilla-${variante}
                ${
                    esImagenFallback
                        ? "menu-sin-foto"
                        : "menu-con-foto"
                }
            "

            style="
                --menu-primario:
                    ${
                        configuracion.colorPrimario ||
                        "#5D2C18"
                    };

                --menu-acento:
                    ${
                        configuracion.colorAcento ||
                        configuracion.colorSecundario ||
                        "#FF6A0A"
                    };

                --menu-fondo:
                    ${
                        configuracion.colorFondo ||
                        configuracion.colorFondoInferior ||
                        "#FFF8E6"
                    };
            "
        >

            ${
                !esImagenFallback
                    ? `
                        <div class="menu-plantilla-imagen">

                            <img
                                src="${imagen}"
                                alt="${nombre}"
                            >

                        </div>
                    `
                    : ""
            }


            <div class="menu-plantilla-contenido">

                <span class="menu-plantilla-eyebrow">
                    ESPECIAL DEL DÍA
                </span>


                <h3>
                    ${nombre}
                </h3>


                ${
                    configuracion.mostrarPrecio !==
                        false &&
                    precio

                        ? `
                            <div class="menu-plantilla-precio">
                                Q${Number(
                                    precio
                                ).toFixed(2)}
                            </div>
                        `

                        : ""
                }


                ${
                    configuracion
                        .mostrarGuarniciones !==
                        false &&
                    acompanamientos.length > 0

                        ? `
                            <div class="menu-plantilla-acomp">

                                ${acompanamientos
                                    .map(
                                        item =>
                                            `<span>${item}</span>`
                                    )
                                    .join("")}

                            </div>
                        `

                        : ""
                }

            </div>

        </article>

    `;

}