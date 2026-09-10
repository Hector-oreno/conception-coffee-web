let expIndex = 0;
let expSlidesGlobales = [];

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarExperienciasCliente();

        const btnPrev =
            document.getElementById(
                "experienciaPrev"
            );

        const btnNext =
            document.getElementById(
                "experienciaNext"
            );

        if (btnPrev) {

            btnPrev.addEventListener(
                "click",
                () => {
                    moverExperiencias(-1);
                }
            );

        }

        if (btnNext) {

            btnNext.addEventListener(
                "click",
                () => {
                    moverExperiencias(1);
                }
            );

        }

    }
);

async function cargarExperienciasCliente() {
    const track = document.getElementById('experiencias-track-cliente');
    if (!track) return;

    try {
        const respuesta = await fetch('/api/experiencias/cliente');
        const resultado = await respuesta.json();

        track.innerHTML = '';

        // Si no hay datos, muestra una imagen corporativa por defecto
        if (!resultado.success || !resultado.data || resultado.data.length === 0) {
             track.innerHTML = `
                <div class="exp-slide active exp-slide-fallback">

                    <img
                        src="/images/logo-hero.png"
                        alt="Conception Coffee"
                    >

                </div>
            `;
            return;
        }

        // Renderizado dinámico respetando tus estilos .exp-slide
        resultado.data.forEach((exp, index) => {
            const divSlide = document.createElement('div');
            // La primera foto debe llevar la clase 'active' para ser visible
            divSlide.className = `exp-slide ${index === 0 ? 'active' : ''}`;
            
            const img = document.createElement('img');
            img.src = exp.imagen_url;
            img.alt =
                exp.titulo
                    ? `${exp.titulo} en Conception Coffee`
                    : 'Experiencia en Conception Coffee';
                        
            divSlide.appendChild(img);
            track.appendChild(divSlide);
        });

        // Capturamos los elementos recién creados en el DOM para las flechas
        expSlidesGlobales = track.getElementsByClassName('exp-slide');
        expIndex = 0;

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                cargarExperienciasCliente();


                const btnPrev =
                    document.getElementById(
                        "experienciaPrev"
                );

                const btnNext =
                    document.getElementById(
                        "experienciaNext"
                );


                btnPrev?.addEventListener(
                    "click",
                    () => {
                        window.moverExperiencias(-1);
                    }
                );


                btnNext?.addEventListener(
                    "click",
                    () => {
                        window.moverExperiencias(1);
                    }
                );

            }
        );




    } catch (error) {
        console.error('Error al cargar carrusel de experiencias en el index:', error);
    }
}

// Lógica de navegación aislada para evitar que mueva el slider de arriba
function moverExperiencias(n) {

    if (
        !expSlidesGlobales ||
        expSlidesGlobales.length <= 1
    ) {
        return;
    }

    expSlidesGlobales[
        expIndex
    ].classList.remove(
        "active"
    );

    expIndex += n;

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

    expSlidesGlobales[
        expIndex
    ].classList.add(
        "active"
    );

}


window.moverExperiencias =
    moverExperiencias;