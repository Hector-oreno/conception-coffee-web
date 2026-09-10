
// ── Filtro de menú ──
function filterMenu(btn, cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
    });
}

const menuCards = document.querySelectorAll('.menu-explore .menu-card:not(#menuShowAllCard)');
const menuActiveFilter = document.getElementById('menuActiveFilter');
const currentCategory = document.getElementById('currentCategory');
const showAllBtn = document.getElementById('showAllBtn');
const menuExplore = document.getElementById('menuExplore'); 
const menuShowAllCard = document.getElementById('menuShowAllCard');


let activeCategory = null;

if (menuCards.length > 0) {
    menuCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoria = card.dataset.cat;

            if (activeCategory === categoria) {
                activeCategory = null;
                card.classList.remove('active');
                if (menuGrid) menuGrid.classList.remove('active');
                if (menuActiveFilter) menuActiveFilter.classList.remove('active');
                if (menuExplore) menuExplore.classList.remove('hidden');
                return;
            }

            activeCategory = categoria;

            if (menuGrid) menuGrid.classList.add('active');
            if (menuExplore) menuExplore.classList.add('hidden');

            menuCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            if (menuActiveFilter) menuActiveFilter.classList.add('active');

            if (currentCategory) {
                if (categoria === 'desayuno') currentCategory.textContent = 'Desayunos';
                if (categoria === 'especial') currentCategory.textContent = 'Especialidades';
                if (categoria === 'bebidas') currentCategory.textContent = 'Bebidas';
                if (categoria === 'postres') currentCategory.textContent = 'Postres';
            }

            document.querySelectorAll('.menu-item').forEach(item => {
                const cat = item.dataset.cat;
                if (categoria === 'desayuno') {
                    item.style.display = (cat === 'desayuno') ? '' : 'none';
                } else if (categoria === 'especial') {
                    item.style.display = (cat === 'especial' || cat === 'entrada' || cat === 'pasta' || cat === 'sandwich' || cat === 'infantil') ? '' : 'none';
                } else if (categoria === 'bebidas') {
                    item.style.display = (cat === 'bebida_caliente' || cat === 'bebida_fria') ? '' : 'none';
                } else if (categoria === 'postres') {
                    item.style.display = (cat === 'postre') ? '' : 'none';
                }
            });
        });
    });
}

// Validaciones opcionales seguras (evitan Uncaught TypeError)
showAllBtn?.addEventListener('click', () => {
    document.querySelectorAll('.menu-item').forEach(item => item.style.display = '');
    activeCategory = null;
    menuCards.forEach(card => card.classList.remove('active'));
    menuActiveFilter?.classList.remove('active');
    menuExplore?.classList.remove('hidden');
});

currentCategory?.addEventListener('click', () => {
    activeCategory = null;
    document.querySelectorAll('.menu-item').forEach(item => item.style.display = '');
    menuCards.forEach(card => card.classList.remove('active'));
    menuGrid?.classList.remove('active');
    menuActiveFilter?.classList.remove('active');
    menuExplore?.classList.remove('hidden');
});

menuShowAllCard?.addEventListener('click', () => {
    document.querySelectorAll('.menu-item').forEach(item => item.style.display = '');
    menuGrid?.classList.add('active');
    menuExplore?.classList.add('hidden');
    if (currentCategory) currentCategory.textContent = '← Todos';
    menuActiveFilter?.classList.add('active');
});


// ── Nav móvil ──
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navClose = document.getElementById('navClose');
const navOverlay = document.getElementById('navOverlay');

if (navToggle && navLinks && navOverlay) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.add('open');
    navOverlay.classList.add('active');
  });

  if (navClose) {
    navClose.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navOverlay.classList.remove('active');
    });
  }

  // Cerrar menú al seleccionar una opción
  document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        navLinks.classList.remove('open');
        navOverlay.classList.remove('active');
      }, 150);
    });
  });

  // Cerrar al tocar fuera del Drawer
  document.addEventListener('click', (e) => {
    const menuOpen = navLinks.classList.contains('open');
    if (
      menuOpen &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navLinks.classList.remove('open');
      navOverlay.classList.remove('active');
    }
  });
}

// ── Nav sombra al scroll ──
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.boxShadow = window.scrollY > 50 ? '0 4px 30px rgba(0,0,0,0.5)' : 'none';
  }
});


/* ══════════════════════════════════════════════════════════
   SLIDER DEL HERO & REVEAL OBSERVER
   ══════════════════════════════════════════════════════════ */
(function () {
 

  
 
    
  // IntersectionObserver para elementos animables (Reveal)
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.25 }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  }
})();
