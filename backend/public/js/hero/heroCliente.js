// Variables de control global para tu carrusel dinámico
let slideIndex = 0;
let slidesGlobales = [];
let dotsGlobales = [];
let heroTimer = null;
const HERO_DELAY = 5000; // Cambia cada 5 segundos

document.addEventListener('DOMContentLoaded', () => {
    cargarSlidersCliente();
});


async function cargarSlidersCliente() {
    const track = document.getElementById('slider-track-cliente');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (!track) return;

    try {
        const respuesta = await fetch('/api/hero/cliente');
        const resultado = await respuesta.json();

        track.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';

        // 1. RESPALDO LOGO POR DEFECTO
        if (!resultado.success || !resultado.data || resultado.data.length === 0) {
            console.log('No hay sliders activos. Renderizando logo por defecto.');
            const divSlideDefault = document.createElement('div');
            divSlideDefault.className = 'slide active';
            divSlideDefault.style.backgroundImage = "url('/images/logo-hero.png')";
            divSlideDefault.style.backgroundSize = 'contain';
            divSlideDefault.style.backgroundPosition = 'center';
            track.appendChild(divSlideDefault);
            return;
        }

        // 2. INYECCIÓN DINÁMICA DE IMÁGENES DESDE MARIADB
        resultado.data.forEach((slider, index) => {
            const claseActive = index === 0 ? 'active' : '';
            
            const divSlide = document.createElement('div');
            divSlide.className = `slide ${claseActive}`;
            divSlide.style.backgroundImage = `url('${slider.imagen_url}')`;
            divSlide.style.backgroundSize = 'cover';
            divSlide.style.backgroundPosition = 'center';
            track.appendChild(divSlide);

            if (dotsContainer) {
                
                const dot =
                    document.createElement("button");

                dot.type = "button";

                dot.className =
                    `dot ${index === 0 ? "active" : ""}`;

                dot.setAttribute(
                    "aria-label",
                    `Mostrar imagen ${index + 1} del carrusel`  
                );

                dot.addEventListener(
                    "click",
                    () => {
                        window.currentSlide(index);
                    }
                );

                dotsContainer.appendChild(dot);




            }
        });

        // Capturar elementos en el DOM real
        slidesGlobales = track.getElementsByClassName('slide');
        if (dotsContainer) {
            dotsGlobales = dotsContainer.getElementsByClassName('dot');
        }
        slideIndex = 0;

        // INICIAR AUTOMATISMO CONTROLADO
        iniciarTemporizadorHero();

    } catch (error) {
        console.error('Error al cargar la vitrina del hero:', error);
        track.innerHTML = `<div class="slide active" style="background-image: url('/images/logo-hero.png'); background-size: contain; background-position: center;"></div>`;
    }
}

// Función interna para arrancar el auto-play seguro
function iniciarTemporizadorHero() {
    if (heroTimer) clearInterval(heroTimer);
    if (slidesGlobales.length <= 1) return; // Si hay 1 o el logo default, no necesita girar
    
    heroTimer = setInterval(() => {
        window.sliderMove(1);
    }, HERO_DELAY);
}

// Mover con las flechas: sliderMove(1) o sliderMove(-1)
window.sliderMove = function(n) {
    if (slidesGlobales.length <= 1) return;
    
    // Quitar active del slide actual
    slidesGlobales[slideIndex].classList.remove('active');
    if (dotsGlobales.length > 0) dotsGlobales[slideIndex].classList.remove('active');

    // Calcular siguiente índice de forma circular
    slideIndex += n;
    if (slideIndex >= slidesGlobales.length) { slideIndex = 0; }
    if (slideIndex < 0) { slideIndex = slidesGlobales.length - 1; }

    // Activar el nuevo slide
    const nextSlide = slidesGlobales[slideIndex];
    nextSlide.classList.add('active');
    if (dotsGlobales.length > 0) dotsGlobales[slideIndex].classList.add('active');

    // REINICIAR ANIMACIÓN DE ZOOM (Reflow nativo)
    nextSlide.style.animation = 'none';
    nextSlide.offsetHeight; // Forzar reflow en el navegador
    nextSlide.style.animation = '';

    // Si el usuario interactúa, reiniciamos el segundero para que no salte de golpe
    iniciarTemporizadorHero();
};

// Mover directamente haciendo click en un punto (Dot)
window.currentSlide = function(n) {
    if (slidesGlobales.length === 0) return;

    slidesGlobales[slideIndex].classList.remove('active');
    if (dotsGlobales.length > 0) dotsGlobales[slideIndex].classList.remove('active');

    slideIndex = n;

    const nextSlide = slidesGlobales[slideIndex];
    nextSlide.classList.add('active');
    if (dotsGlobales.length > 0) dotsGlobales[slideIndex].classList.add('active');

    nextSlide.style.animation = 'none';
    nextSlide.offsetHeight; 
    nextSlide.style.animation = '';

    iniciarTemporizadorHero();
};