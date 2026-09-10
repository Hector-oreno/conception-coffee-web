// ==========================================================================
// ESTADO DEL MENÚ EJECUTIVO PÚBLICO
// ==========================================================================

const MenuEjecutivoPublico = {

    dias: [],

    indiceActual: 0,

    indiceHoy: -1,

    sucursal: null

};


document.addEventListener("DOMContentLoaded", () => {

    cargarMenuEjecutivo();




});



async function cargarMenuEjecutivo() {

    try {

        const response =
            await fetch("/api/planner/menu-semana");

        const resultado =
            await response.json();

        if (!resultado.success) {

            mostrarEstadoSinMenu();

            return;

        }


        MenuEjecutivoPublico.sucursal =
            resultado.sucursal || null;


        renderContactoSucursal();

        if (resultado.data.length === 0) {

            mostrarEstadoSinMenu();

            return;

        }

        renderMenuEjecutivo(resultado.data);

    } catch (error) {

        console.error(error);

        mostrarEstadoSinMenu();

    }

}


function renderMenuHoy(dia) {

    const menuHoy =
        document.getElementById(
            "menuHoy"
        );

    const ejecutivoFecha =
        document.getElementById(
            "ejecutivoFecha"
        );


    if (!menuHoy || !dia) {
        return;
    }


    // ==========================================
    // FECHA DEL DÍA SELECCIONADO
    // ==========================================

    if (ejecutivoFecha) {

        ejecutivoFecha.innerHTML = `

            <span class="ejecutivo-dia-seleccionado">
                ${dia.dia_semana}
            </span>

            <span class="ejecutivo-fecha-seleccionada">
                ${formatearFechaPremium(
                    dia.fecha_especifica
                )}
            </span>

        `;

    }


    // ==========================================
    // DÍA CERRADO / FERIADO
    // ==========================================

    if (
        dia.estado_dia === "CERRADO" ||
        dia.estado_dia === "FERIADO"
    ) {

        const titulo =
            dia.estado_dia === "FERIADO"
                ? "Día especial"
                : "Hoy descansamos";


        const mensaje =
            dia.texto_alternativo ||
            (
                dia.estado_dia === "FERIADO"
                    ? "Nuestro menú ejecutivo no estará disponible este día."
                    : "Nos encantará recibirte nuevamente en nuestro próximo día de servicio."
            );


        menuHoy.innerHTML = `

            <div class="menu-dia-especial">

                <span class="menu-dia-especial-kicker">
                    Nos vemos pronto
                </span>

                <h3>
                    ${titulo}
                </h3>

                <div class="menu-dia-especial-linea"></div>

                <p>
                    ${mensaje}
                </p>

            </div>

        `;

        return;

    }


    // ==========================================
    // DÍA TODAVÍA SIN PLATO
    // ==========================================

    if (!dia.plato_catalogo_id) {

        menuHoy.innerHTML = `

            <div class="menu-dia-especial">

                <span class="menu-dia-especial-kicker">
                    Nos vemos pronto
                </span>

                <h3>
                    Menú próximamente
                </h3>

                <div class="menu-dia-especial-linea"></div>

                <p>
                    Estamos preparando la propuesta
                    para este día.
                </p>

            </div>

        `;

        return;

    }


    
    renderPlantillaMenu(
        dia
    );

}


function renderContactoSucursal() {

    const contenedor =
        document.getElementById(
            "ejecutivoContacto"
        );


    const sucursal =
        MenuEjecutivoPublico.sucursal;


    if (!contenedor) {
        return;
    }


    if (!sucursal) {

        contenedor.innerHTML = "";

        contenedor.style.display =
            "none";

        return;

    }


    const telefono =
        sucursal.telefono
            ? String(sucursal.telefono)
            : "";


    const telefonoLimpio =
        telefono.replace(
            /[^\d+]/g,
            ""
        );


    contenedor.style.display =
        "flex";


    contenedor.innerHTML = `

        <div class="ejecutivo-contacto-identidad">

            <span class="ejecutivo-contacto-nombre">
                ${sucursal.nombre || ""}
            </span>

            ${
                sucursal.direccion
                    ? `
                        <span class="ejecutivo-contacto-direccion">
                            ${sucursal.direccion}
                        </span>
                    `
                    : ""
            }

        </div>


        <div class="ejecutivo-contacto-acciones">

            ${
                telefono
                    ? `
                        <a
                            href="tel:${telefonoLimpio}"
                            class="ejecutivo-contacto-link"
                        >
                            <i class="fas fa-phone-alt"></i>

                            ${telefono}
                        </a>
                    `
                    : ""
            }


            ${
                sucursal.mapa_url
                    ? `
                        <a
                            href="${sucursal.mapa_url}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="ejecutivo-contacto-link"
                        >
                            Cómo llegar

                            <span aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    `
                    : ""
            }

        </div>

    `;

}


function seleccionarDiaMenu(indice) {

    if (
        indice < 0 ||
        indice >= MenuEjecutivoPublico.dias.length
    ) {

        return;

    }


    MenuEjecutivoPublico.indiceActual =
        indice;


    const dia =
        MenuEjecutivoPublico.dias[
            indice
        ];


    // ==========================================
    // RENDER PRINCIPAL
    // ==========================================

    const menuHoy =
        document.getElementById("menuHoy");

    if (menuHoy) {

        menuHoy.classList.add(
            "cambiando-dia"
        );

        setTimeout(() => {

            renderMenuHoy(dia);

            requestAnimationFrame(() => {

                menuHoy.classList.remove(
                    "cambiando-dia"
                );

            });

        }, 180);

    } else {

        renderMenuHoy(dia);

    }


    // ==========================================
    // ACTUALIZAR SELECTOR SEMANAL
    // ==========================================

    document
        .querySelectorAll(
            ".menu-dia-selector"
        )
        .forEach(
            (elemento, posicion) => {

                elemento.classList.toggle(
                    "activo",
                    posicion === indice
                );

            }
        );

        // ==========================================
        // CENTRAR DÍA SELECCIONADO EN MÓVIL
        // ==========================================

        if (
            window.matchMedia(
                "(max-width: 900px)"
            ).matches
        ) {

        const diasGrid =
            document.getElementById(
                "diasGrid"
            );

        const selectorActivo =
            diasGrid?.querySelector(
                ".menu-dia-selector.activo"
            );


        if (
            diasGrid &&
            selectorActivo
        ) {

            const destino =
                selectorActivo.offsetLeft -
                (
                    diasGrid.clientWidth -
                    selectorActivo.offsetWidth
                ) / 2;


            diasGrid.scrollTo({
                left: Math.max(0, destino),
                behavior: "smooth"
            });

        }

    }



        // ==========================================
        // BOTÓN / ENLACE VOLVER A HOY
        // ==========================================

    actualizarVolverAHoy();

}


function renderSelectorSemana() {

    const diasGrid =
        document.getElementById(
            "diasGrid"
        );


    if (!diasGrid) {
        return;
    }


    diasGrid.innerHTML = "";


    MenuEjecutivoPublico.dias.forEach(
        (dia, indice) => {

            const esHoy =
                indice ===
                MenuEjecutivoPublico.indiceHoy;


            const elemento =
                document.createElement(
                    "button"
                );


            elemento.type =
                "button";


            elemento.className =
                "menu-dia-selector";


            if (
                indice ===
                MenuEjecutivoPublico.indiceActual
            ) {

                elemento.classList.add(
                    "activo"
                );

            }


            elemento.innerHTML = `

                <span class="menu-dia-selector-nombre">

                    ${obtenerAbreviaturaDia(
                        dia.dia_semana
                    )}

                </span>


                <span class="menu-dia-selector-numero">

                    ${obtenerNumeroDia(
                        dia.fecha_especifica
                    )}

                </span>


                ${
                    esHoy
                        ? `
                            <span class="menu-dia-selector-hoy">
                                Hoy
                            </span>
                        `
                        : ""
                }

            `;


            elemento.addEventListener(
                "click",
                () => {

                    seleccionarDiaMenu(
                        indice
                    );

                }
            );


            diasGrid.appendChild(
                elemento
            );

        }
    );

}


function obtenerAbreviaturaDia(
    nombreDia
) {

    const abreviaturas = {

        "Lunes": "LUN",
        "Martes": "MAR",
        "Miércoles": "MIÉ",
        "Jueves": "JUE",
        "Viernes": "VIE",
        "Sábado": "SÁB",
        "Domingo": "DOM"

    };


    return abreviaturas[nombreDia] ||
        String(nombreDia || "")
            .substring(0, 3)
            .toUpperCase();

}


function obtenerNumeroDia(
    fechaISO
) {

    if (!fechaISO) {
        return "";
    }


    const fecha =
        new Date(fechaISO);


    return fecha.getUTCDate();

}


function actualizarVolverAHoy() {

    let volver =
        document.getElementById(
            "menuVolverHoy"
        );


    // Si realmente estamos viendo hoy,
    // no necesitamos mostrar nada.
    if (
        MenuEjecutivoPublico.indiceHoy < 0 ||
        MenuEjecutivoPublico.indiceActual ===
            MenuEjecutivoPublico.indiceHoy
    ) {

        if (volver) {

            volver.remove();

        }

        return;

    }


    if (!volver) {

        volver =
            document.createElement(
                "button"
            );


        volver.type =
            "button";

        volver.id =
            "menuVolverHoy";

        volver.className =
            "menu-volver-hoy";

        volver.innerHTML =
            "← Volver a hoy";


        volver.addEventListener(
            "click",
            () => {

                seleccionarDiaMenu(
                    MenuEjecutivoPublico.indiceHoy
                );

            }
        );


        const diasGrid =
            document.getElementById(
                "diasGrid"
            );


        if (diasGrid) {

            diasGrid.insertAdjacentElement(
                "afterend",
                volver
            );

        }

    }

}


function mostrarEstadoSinMenu() {


    const fecha =
        document.getElementById("ejecutivoFecha");

    if (fecha) {

        fecha.innerHTML =
            "📅 Próxima actualización semanal";

    }

    const incluye =
        document.getElementById("ejecutivoIncludes");

    if (incluye) {

        incluye.style.display = "none";

    }



    const menuHoy =
        document.getElementById("menuHoy");

    const diasGrid =
        document.getElementById("diasGrid");

    

    if (diasGrid) {

        diasGrid.innerHTML = "";

        diasGrid.classList.add("hidden");

    }

    
    if (!menuHoy) return;

    menuHoy.innerHTML = `
        <div class="menu-empty-state">

            <div class="menu-empty-icon">
                🍽️
            </div>

            <h3>
                Menú Ejecutivo
            </h3>

            <p>
                Estamos preparando el menú ejecutivo de esta semana.
            </p>

            <p>
                Nuestro equipo está finalizando los últimos detalles.
            </p>

            <a
                href="menu.html"
                class="btn-ver-carta">

                Explorar Nuestra Carta

            </a>

        </div>
    `;

}

function limpiarTextoPremium(texto) {

    if (!texto) return "";

    return texto
        .replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])/g,
            ""
        )
        .trim();

}


function obtenerConfiguracionPlantilla(dia) {

    if (
        !dia ||
        !dia.plantilla_configuracion
    ) {

        return {};

    }


    // Si por alguna razón el backend
    // ya entrega un objeto, lo usamos.
    if (
        typeof dia.plantilla_configuracion ===
        "object"
    ) {

        return dia.plantilla_configuracion;

    }


    try {

        return JSON.parse(
            dia.plantilla_configuracion
        );

    } catch (error) {

        console.warn(
            "Configuración de plantilla inválida:",
            dia.plantilla_configuracion
        );

        return {};

    }

}

function prepararDatosMenu(dia) {

    const configuracion =
        obtenerConfiguracionPlantilla(dia);


    const acompanamientos =
        dia.acompanamientos
            ? dia.acompanamientos
                .split(",")
                .map(item =>
                    limpiarTextoPremium(item)
                )
                .filter(Boolean)
            : [];


    const precio =
        dia.precio_real !== null &&
        dia.precio_real !== undefined &&
        dia.precio_real !== ""
            ? Number(dia.precio_real).toFixed(2)
            : null;


    const imagen =
        dia.imagen &&
        String(dia.imagen).trim() !== ""
            ? dia.imagen
            : "/images/uploads/Logo_carta.png";


    // Detectar si estamos usando el logo como imagen de respaldo
    const esImagenFallback =
        !dia.imagen ||
        String(dia.imagen)
            .toLowerCase()
            .includes("logo_carta");


    return {

        dia,

        configuracion,

        nombre:
            dia.plato_base_nombre ||
            "Menú Ejecutivo",

        acompanamientos,

        precio,

        imagen,

        esImagenFallback

    };

}


function renderPlantillaMenu(dia) {

    const menuHoy =
        document.getElementById(
            "menuHoy"
        );


    if (!menuHoy || !dia) {
        return;
    }


    const datos =
        prepararDatosMenu(
            dia
        );


    // ==========================================
    // PLANTILLA NO DISPONIBLE
    // ==========================================

    if (
        !dia.plantilla_id ||
        Number(dia.plantilla_activa) !== 1
    ) {

        renderMenuFallback(
            menuHoy,
            datos
        );

        return;

    }


    // ==========================================
    // COMPOSICIÓN SEGÚN SLUG
    // ==========================================

    switch (
        String(
            dia.plantilla_slug || ""
        ).toLowerCase()
    ) {

        case "conception-clasica":

            renderMenuClasico(
                menuHoy,
                datos
            );

            break;


        case "conception-moderna":

            renderMenuModerno(
                menuHoy,
                datos
            );

            break;


        case "conception-premium":

            renderMenuPremium(
                menuHoy,
                datos
            );

            break;


        default:

            renderMenuFallback(
                menuHoy,
                datos
            );

    }

}


function renderMenuClasico(
    contenedor,
    datos
) {

    contenedor.innerHTML =
        construirRenderTemporal(
            datos,
            "clasico"
        );

}


function renderMenuModerno(
    contenedor,
    datos
) {

    contenedor.innerHTML =
        construirRenderTemporal(
            datos,
            "moderno"
        );

}


function renderMenuPremium(
    contenedor,
    datos
) {

    contenedor.innerHTML =
        construirRenderTemporal(
            datos,
            "premium"
        );

}


function renderMenuFallback(
    contenedor,
    datos
) {

    contenedor.innerHTML =
        construirRenderTemporal(
            datos,
            "fallback"
        );

}


function construirRenderTemporal(
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

        <div
            class="
                menu-plantilla
                menu-plantilla-${variante}
                ${esImagenFallback ? "menu-sin-foto" : "menu-con-foto"}
            "
            style="
                --menu-primario:
                    ${configuracion.colorPrimario || "#5D2C18"};

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
                        "transparent"
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
                                loading="lazy"
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
                    configuracion.mostrarPrecio !== false &&
                    precio
                        ? `
                            <div class="menu-plantilla-precio">
                                Q${precio}
                            </div>
                        `
                        : ""
                }


                ${
                    configuracion.mostrarGuarniciones !== false &&
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

        </div>

    `;

}

function formatearFechaPremium(fechaISO) {

    if (!fechaISO) return "";

    try {

        const fecha = new Date(fechaISO);

        return fecha.toLocaleDateString(
            "es-GT",
            {
                day: "numeric",
                month: "long"
            }
        );

    } catch {

        return "";

    }

}


// 3. Función para pintar los datos dinámicos en el HTML
/* ══════════════════════════════════════════
   RENDERIZADO DEL MENÚ EJECUTIVO COMPLETO
   ══════════════════════════════════════════ */
function renderMenuEjecutivo(menuData) {

    const incluye =
        document.getElementById(
            "ejecutivoIncludes"
        );

    

    const diasGrid =
        document.getElementById(
            "diasGrid"
        );


    if (
        !Array.isArray(menuData) ||
        menuData.length === 0
    ) {

        mostrarEstadoSinMenu();

        return;

    }


    // ==========================================
    // GUARDAR LOS DÍAS
    // ==========================================

    MenuEjecutivoPublico.dias =
        menuData;


    // ==========================================
    // INFORMACIÓN GENERAL
    // ==========================================

    if (incluye) {

        incluye.style.display =
            "block";

    }


    

    // ==========================================
    // LOCALIZAR HOY
    // ==========================================

    const hoy =
        new Date();


    const fechaHoy =
        hoy.getFullYear() +
        "-" +
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            hoy.getDate()
        ).padStart(2, "0");


    MenuEjecutivoPublico.indiceHoy =
        menuData.findIndex(
            dia =>
                String(
                    dia.fecha_especifica
                ).substring(0, 10) ===
                fechaHoy
        );


    // ==========================================
    // DÍA INICIAL
    // ==========================================

    if (
        MenuEjecutivoPublico.indiceHoy >= 0
    ) {

        MenuEjecutivoPublico.indiceActual =
            MenuEjecutivoPublico.indiceHoy;

    } else {

        // Si hoy no pertenece a la semana,
        // mostramos el primer día disponible.
        MenuEjecutivoPublico.indiceActual =
            0;

    }


    // ==========================================
    // RENDERIZAR SELECTOR
    // ==========================================

    renderSelectorSemana();


    // ==========================================
    // RENDERIZAR DÍA PRINCIPAL
    // ==========================================

    seleccionarDiaMenu(
        MenuEjecutivoPublico.indiceActual
    );



}