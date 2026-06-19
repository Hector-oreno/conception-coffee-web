    // ── Detectar día actual (0=Dom,1=Lun…6=Sáb) ──
    const HOY_IDX = new Date().getDay(); // 0=Dom,1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb
    // Nuestros días arrancan Lunes=índice 0 en el array
    const DIA_EN_MENU = HOY_IDX === 0 ? -1 : HOY_IDX - 1; // -1 si es domingo (no hay menú)

    // ── Renderizar menú ejecutivo ──
    document.getElementById('ejecutivoFecha').textContent = '📅 ' + MENU_EJECUTIVO.semana;
    document.getElementById('ejecutivoIncludes').innerHTML =
      '<strong>Todos nuestros platillos incluyen:</strong> ' + MENU_EJECUTIVO.incluye;

    const menuHoy = document.getElementById('menuHoy');

    const toggleSemanaBtn = document.getElementById('toggleSemanaBtn');

    const diasGrid = document.getElementById('diasGrid');
    diasGrid.classList.add('hidden');

    const menuDelDia =
      MENU_EJECUTIVO.dias.find(d => d.esHoy);

    if (menuDelDia) {

      const acompHoy =
        menuDelDia.acomp
          .map(a => `<span>${a}</span>`)
          .join('');

      menuHoy.innerHTML = `
        <div class="menu-hoy-card">

          <div class="menu-hoy-img">
            ${menuDelDia.emojis}
          </div>

          <div class="menu-hoy-body">

            <div class="menu-hoy-badge">
              🔥 MENÚ DE HOY
            </div>

            <h3 class="menu-hoy-title">
              ${menuDelDia.plato}
            </h3>

            <div class="menu-hoy-price">
              Q${menuDelDia.precio}
            </div>

            <div class="menu-hoy-acomp">
              ${acompHoy}
            </div>

          </div>

        </div>
      `;
    }

    MENU_EJECUTIVO.dias.forEach((d, i) => {
      const esHoy = i === DIA_EN_MENU;
      const card = document.createElement('div');
      card.className = 'dia-card' + (esHoy ? ' hoy' : '');

      const acompHTML = d.acomp.map(a =>
        `<span class="dia-acomp-item">${a}</span>`
      ).join('');

      card.innerHTML = `
    <div class="dia-header">
      <span class="dia-nombre">${d.dia}</span>
      <span style="display:flex;align-items:center;gap:6px;">
        ${esHoy ? '<span class="hoy-badge">HOY</span>' : ''}
        <span class="dia-fecha">${d.fecha}</span>
      </span>
    </div>
    <div class="dia-body">
      <div class="dia-plato">
        <span class="ico">${d.emojis}</span>
        <div class="texto"><strong>${d.plato}</strong></div>
      </div>
      <div class="dia-acomp">${acompHTML}</div>
    </div>
  `;
      diasGrid.appendChild(card);
    });

    // ── Renderizar menú general ──
    const menuGrid = document.getElementById('menuGrid');
    MENU_ITEMS.forEach(item => {
      const div = document.createElement('div');
      div.className = 'menu-item';
      div.dataset.cat = item.categoria;

      const badgeHTML = item.badge
        ? `<span class="menu-badge-tag">${item.badge}</span>`
        : '';

      // Si hay imagen, usamos <img>, si no, el emoji como fallback
      const imgHTML = item.imagen
        ? `<img src="${item.imagen}" alt="${item.nombre}" onerror="this.style.display='none'">`
        : '';

      div.innerHTML = `
    <div class="menu-img">
      ${imgHTML}
      <div class="menu-img-fallback">${"☕"}</div>
      ${badgeHTML}
    </div>
    <div class="menu-body">
      <div class="menu-name">${item.nombre}</div>
      <div class="menu-desc">${item.descripcion}</div>
      <div class="menu-footer">
        <span class="menu-price">Q${item.precio}</span>
        <span class="menu-cat-badge">${item.categoria}</span>
      </div>
    </div>
  `;
      menuGrid.appendChild(div);
    });


    toggleSemanaBtn.addEventListener('click', () => {

      diasGrid.classList.toggle('hidden');

      const cards =
        document.querySelectorAll('.dia-card');

      if (
        !diasGrid.classList.contains('hidden')
      ) {

        cards.forEach((card, index) => {

          setTimeout(() => {

            card.classList.add('visible');

          }, index * 100);

        });

      } else {

        cards.forEach(card => {

        card.classList.remove('visible');

        });

      }

      if (
        diasGrid.classList.contains('hidden')
      ) {

        toggleSemanaBtn.textContent =  '▼ Ver menú semanal';

      } else {

        toggleSemanaBtn.textContent = '▲ Ocultar menú semanal';
      }

    });


    // ── Renderizar sucursales ──
    const branchesGrid = document.getElementById('branchesGrid');
    SUCURSALES.forEach(s => {
      const div = document.createElement('div');
      div.className = 'branch-card';
     div.innerHTML = `

      <div class="branch-photo">

        <img
          src="images/local.png"
          alt="Conception Coffee">

      </div>

      <div class="branch-name">
        ${s.nombre}
      </div>

      <div class="branch-info">

        <div class="branch-row">
          <i class="fa-solid fa-location-dot ico"></i>
          <span>${s.direccion}</span>
          
        </div>

        <div class="branch-row">
          <i class="fa-solid fa-clock ico"></i>
          <span>${s.horario}</span>
        </div>

      <div class="branch-row">
        <i class="fa-solid fa-phone ico"></i>
        <span>${s.telefono}</span>
    </div>

    </div>

  

    <a
      href="https://www.google.com/maps/place/TEXACO+%E2%80%A2+Santa+Luc%C3%ADa/@14.334056,-91.008894,17z/data=!4m6!3m5!1s0x8589271db6bce279:0xf52713cc9addfa85!8m2!3d14.334031!4d-91.008881!16s%2Fg%2F11v5ft7n2t"
      target="_blank"
      class="branch-map">

      <i class="fa-solid fa-route"></i>Cómo llegar

    </a>

  `;
      branchesGrid.appendChild(div);
    });


    // ── Filtro de menú ──
    function filterMenu(btn, cat) {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
      });
    }

    const menuCards = document.querySelectorAll('.menu-explore .menu-card');

    const menuActiveFilter =
      document.getElementById('menuActiveFilter');

    const currentCategory =
      document.getElementById('currentCategory');

    const showAllBtn =
      document.getElementById('showAllBtn');

      let activeCategory = null;

    const menuExplore =
      document.getElementById('menuExplore'); 
      
    const menuShowAllCard =
      document.getElementById('menuShowAllCard');

    menuCards.forEach(card => {

      card.addEventListener('click', () => {

        const categoria = card.dataset.cat;

        if (activeCategory === categoria) {
        

        activeCategory = null;

        card.classList.remove('active');

        menuGrid.classList.remove('active');

        menuActiveFilter.classList.remove('active');

        menuExplore.classList.remove('hidden');

        return;
        }

      activeCategory = categoria;
      console.log('ACTIVA:', activeCategory);

      menuGrid.classList.add('active');

      menuExplore.classList.add('hidden');

        menuCards.forEach(c =>
          c.classList.remove('active')
        );

        card.classList.add('active');

        menuActiveFilter.classList.add('active');

        if (categoria === 'desayuno') {

          currentCategory.textContent = 'Desayunos';

          document.querySelectorAll('.menu-item')
            .forEach(item => {

              item.style.display =
                item.dataset.cat === 'desayuno'
                ? ''
                : 'none';
            });
          }

        if (categoria === 'especial') {

          currentCategory.textContent =
            'Especialidades';

          document.querySelectorAll('.menu-item')
            .forEach(item => {

              const cat = item.dataset.cat;

            item.style.display =
              (
                cat === 'especial' ||
                cat === 'entrada' ||
                cat === 'pasta' ||
                cat === 'sandwich' ||
                cat === 'infantil'
              )
              ? ''
              : 'none';
            });
        }

        if (categoria === 'bebidas') {

          currentCategory.textContent =
          'Bebidas';

          document.querySelectorAll('.menu-item')
            .forEach(item => {

              const cat = item.dataset.cat;

              item.style.display =
                (
                  cat === 'bebida_caliente' ||
                  cat === 'bebida_fria'
                )
                ? ''
                : 'none';
            });
        }

        if (categoria === 'postres') {

          currentCategory.textContent =
            'Postres';

          document.querySelectorAll('.menu-item')
            .forEach(item => {

              item.style.display =
                item.dataset.cat === 'postre'
                ? ''
                : 'none';
            });
         }

      });

    });  

    showAllBtn.addEventListener('click', () => {

      

      document.querySelectorAll('.menu-item')
        .forEach(item => {

          item.style.display = '';
        });

    activeCategory = null;
      
      menuCards.forEach(card =>
        card.classList.remove('active')
      );

      menuActiveFilter.classList.remove('active');

      menuExplore.classList.remove('hidden');

    });


    currentCategory.addEventListener('click', () => {

      activeCategory = null;

      document.querySelectorAll('.menu-item')
        .forEach(item => {

        item.style.display = '';
      });

      menuCards.forEach(card =>
        card.classList.remove('active')
      );

    menuGrid.classList.remove('active');

    menuActiveFilter.classList.remove('active');

    menuExplore.classList.remove('hidden');

    });

    menuShowAllCard.addEventListener('click', () => {

      document.querySelectorAll('.menu-item')
        .forEach(item => {

          item.style.display = '';
        });

      menuGrid.classList.add('active');

      menuExplore.classList.add('hidden');

      currentCategory.textContent =
      '← Todos';

      menuActiveFilter.classList.add('active');

    });





    // ── Nav móvil ──

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navClose = document.getElementById('navClose');
    const navOverlay = document.getElementById('navOverlay');

    navToggle.addEventListener('click', () => {

      navLinks.classList.add('open');

      navOverlay.classList.add('active');

    });

    navClose.addEventListener('click', () => {

      navLinks.classList.remove('open');

      navOverlay.classList.remove('active');

    });

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
    )  {

      navLinks.classList.remove('open');
      navOverlay.classList.remove('active');

    }

  });


    // ── Nav sombra al scroll ──
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').style.boxShadow =
        window.scrollY > 50 ? '0 4px 30px rgba(0,0,0,0.5)' : 'none';
    });

    // ── Formulario de contacto (simulado) ──
    function submitForm() {
      const nombre = document.getElementById('nombre').value.trim();
      const correo = document.getElementById('correo').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();
      if (!nombre || !correo || !mensaje) {
        alert('Por favor completa todos los campos requeridos.');
        return;
      }
      document.getElementById('formSuccess').style.display = 'block';
      document.getElementById('nombre').value = '';
      document.getElementById('correo').value = '';
      document.getElementById('mensaje').value = '';
      document.getElementById('sucursal').value = '';
      setTimeout(() => { document.getElementById('formSuccess').style.display = 'none'; }, 4000);
    }

    /* ══════════════════════════════════════════════════════════
       SLIDER DEL HERO
       Cambia automáticamente cada 5 segundos.
       También puedes usar las flechas o los puntos.
       ══════════════════════════════════════════════════════════ */
    (function () {
      const TOTAL = 3;          // número de slides
      const DELAY = 5000;       // milisegundos entre cada cambio
      let current = 0;
      let timer;

      // Crear puntos indicadores
      const dotsEl = document.getElementById('sliderDots');
      for (let i = 0; i < TOTAL; i++) {
        const d = document.createElement('button');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Slide ' + (i + 1));
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
      }

      function goTo(n) {
        // Quitar active del slide actual
        document.getElementById('slide-' + current).classList.remove('active');
        dotsEl.children[current].classList.remove('active');
        // Activar el nuevo
        current = (n + TOTAL) % TOTAL;
        const newSlide = document.getElementById('slide-' + current);
        newSlide.classList.add('active');
        // Reiniciar animación de zoom
        newSlide.style.animation = 'none';
        newSlide.offsetHeight;   // forzar reflow
        newSlide.style.animation = '';
        dotsEl.children[current].classList.add('active');
        // Reiniciar temporizador
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), DELAY);
      }

      const experienciaSlides = document.querySelectorAll('.exp-slide');

      if (experienciaSlides.length > 0) {

          let experienciaActual = 0;

          function cambiarExperiencia() {

            experienciaSlides[experienciaActual]
                .classList.remove('active');

            experienciaActual++;

            if (experienciaActual >= experienciaSlides.length) {
                experienciaActual = 0;
            }

            experienciaSlides[experienciaActual]
                .classList.add('active');
          }

          setInterval(cambiarExperiencia, 4000);
      }

      // Función global para las flechas (onclick en HTML)
      window.sliderMove = function (dir) { goTo(current + dir); };

      // Arrancar auto-play
      timer = setInterval(() => goTo(current + 1), DELAY);

      // Swipe para móviles
      const hero = document.querySelector('.hero');

      let touchStartX = 0;
      let touchEndX = 0;

      hero.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

      hero.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;

      const diff = touchStartX - touchEndX;

      // Umbral mínimo para considerar swipe
      if (Math.abs(diff) > 50) {
       if (diff > 0) {
        goTo(current + 1); // izquierda → siguiente
          } else {
          goTo(current - 1); // derecha → anterior
        }
      }
    });

    
      // Parar al pasar el mouse encima (mejor UX)
      document.querySelector('.hero').addEventListener('mouseenter', () => clearInterval(timer));
      document.querySelector('.hero').addEventListener('mouseleave', () => {
        timer = setInterval(() => goTo(current + 1), DELAY);
      });


      const revealElements =
        document.querySelectorAll('.reveal');

      const revealObserver =
        new IntersectionObserver(

        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add('revealed');

            } else {

              entry.target.classList.remove('revealed');

            }

          });

        },

        {
          threshold: 0.25
        }

      );

      revealElements.forEach(el => {
        revealObserver.observe(el);
      });





    })();
