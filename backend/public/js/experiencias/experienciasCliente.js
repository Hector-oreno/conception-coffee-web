// ==========================================================
// EXPERIENCIAS · SITIO PÚBLICO
// ==========================================================

let expIndex = 0;

let expSlidesGlobales = [];


// ==========================================================
// INICIALIZACIÓN
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarExperienciasCliente();

    }
);


// ==========================================================
// INICIALIZAR MÓDULO
// ==========================================================

async function inicializarExperienciasCliente() {

    const btnPrev =
        document.getElementById(
            "experienciaPrev"
        );

    const btnNext =
        document.getElementById(
            "experienciaNext"
        );


    if (btnPrev) {

        btnPrev.onclick = () => {

            moverExperiencias(-1);

        };

    }


    if (btnNext) {

        btnNext.onclick = () => {

            moverExperiencias(1);

        };

    }


    await cargarExperienciasCliente();

}


// ==========================================================
// CARGAR EXPERIENCIAS PUBLICADAS
// ==========================================================

async function cargarExperienciasCliente() {

    const track =
        document.getElementById(
            "experiencias-track-cliente"
        );

    const contadorActual =
        document.getElementById(
            "experienciaActual"
        );

    const contadorTotal =
        document.getElementById(
            "experienciaTotal"
        );


    if (!track) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                "/api/experiencias/cliente"
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${respuesta.status}`
            );

        }


        const experiencias =
            resultado.success &&
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        track.innerHTML = "";


        // ==================================================
        // SIN EXPERIENCIAS PUBLICADAS
        // ==================================================

        if (experiencias.length === 0) {

            renderExperienciaFallback(
                track
            );


            expSlidesGlobales =
                Array.from(
                    track.querySelectorAll(
                        ".experience-slide"
                    )
                );


            expIndex = 0;


            actualizarContadorExperiencias();


            return;

        }


        // ==================================================
        // RENDER DINÁMICO
        // ==================================================

        experiencias.forEach(
            (experiencia, index) => {

                const slide =
                    crearExperienciaCliente(
                        experiencia,
                        index
                    );


                track.appendChild(
                    slide
                );

            }
        );


        // ==================================================
        // ESTADO DEL CARRUSEL
        // ==================================================

        expSlidesGlobales =
            Array.from(
                track.querySelectorAll(
                    ".experience-slide"
                )
            );


        expIndex = 0;


        actualizarContadorExperiencias();


        // Ocultar navegación si solamente existe una
        actualizarNavegacionExperiencias();


    } catch (error) {

        console.error(
            "Error al cargar experiencias en el index:",
            error
        );


        track.innerHTML = "";


        renderExperienciaFallback(
            track
        );


        expSlidesGlobales =
            Array.from(
                track.querySelectorAll(
                    ".experience-slide"
                )
            );


        expIndex = 0;


        actualizarContadorExperiencias();

        actualizarNavegacionExperiencias();

    }

}


// ==========================================================
// CREAR EXPERIENCIA
// ==========================================================

function crearExperienciaCliente(
    experiencia,
    index
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        `experience-slide ${
            index === 0
                ? "active"
                : ""
        }`;


    const imagen =
        document.createElement(
            "img"
        );


    imagen.src =
        experiencia.imagen_url;


    imagen.alt =
        experiencia.titulo
            ? `${experiencia.titulo} en Conception Coffee`
            : "Experiencia en Conception Coffee";


    imagen.loading =
        index === 0
            ? "eager"
            : "lazy";


    // ======================================================
    // CONTENIDO
    // ======================================================

    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "experience-slide-content";


    const etiqueta =
        document.createElement(
            "span"
        );


    etiqueta.className =
        "experience-slide-eyebrow";


    etiqueta.textContent =
        "Experiencia";


    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        experiencia.titulo ||
        "Conception Coffee";


    contenido.append(
        etiqueta,
        titulo
    );


    article.append(
        imagen,
        contenido
    );


    return article;

}


// ==========================================================
// FALLBACK
// ==========================================================

function renderExperienciaFallback(
    track
) {

    const slide =
        document.createElement(
            "article"
        );


    slide.className =
        "experience-slide experience-slide-fallback active";


    const imagen =
        document.createElement(
            "img"
        );


    imagen.src =
        "/images/logo-hero.png";


    imagen.alt =
        "Conception Coffee";


    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "experience-slide-content";


    contenido.innerHTML = `

        <span class="experience-slide-eyebrow">
            Conception Coffee
        </span>

        <h3>
            Momentos para compartir
        </h3>

    `;


    slide.append(
        imagen,
        contenido
    );


    track.appendChild(
        slide
    );

}


// ==========================================================
// NAVEGACIÓN
// ==========================================================

function moverExperiencias(
    direccion
) {

    if (
        !Array.isArray(
            expSlidesGlobales
        ) ||
        expSlidesGlobales.length <= 1
    ) {

        return;

    }


    const slideActual =
        expSlidesGlobales[
            expIndex
        ];


    slideActual.classList.remove(
        "active"
    );


    expIndex += direccion;


    if (
        expIndex >=
        expSlidesGlobales.length
    ) {

        expIndex = 0;

    }


    if (expIndex < 0) {

        expIndex =
            expSlidesGlobales.length - 1;

    }


    const siguienteSlide =
        expSlidesGlobales[
            expIndex
        ];


    siguienteSlide.classList.add(
        "active"
    );


    actualizarContadorExperiencias();

}


// ==========================================================
// CONTADOR
// ==========================================================

function actualizarContadorExperiencias() {

    const actual =
        document.getElementById(
            "experienciaActual"
        );

    const total =
        document.getElementById(
            "experienciaTotal"
        );


    const cantidad =
        expSlidesGlobales.length;


    if (actual) {

        actual.textContent =
            String(
                cantidad > 0
                    ? expIndex + 1
                    : 0
            ).padStart(
                2,
                "0"
            );

    }


    if (total) {

        total.textContent =
            String(
                cantidad
            ).padStart(
                2,
                "0"
            );

    }

}


// ==========================================================
// MOSTRAR / OCULTAR NAVEGACIÓN
// ==========================================================

function actualizarNavegacionExperiencias() {

    const navegacion =
        document.querySelector(
            ".experiences-navigation"
        );


    if (!navegacion) {
        return;
    }


    navegacion.hidden =
        expSlidesGlobales.length <= 1;

}


// ==========================================================
// COMPATIBILIDAD
// ==========================================================

window.moverExperiencias =
    moverExperiencias;