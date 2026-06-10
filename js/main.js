    // ── Detectar día actual (0=Dom,1=Lun…6=Sáb) ──
    const HOY_IDX = new Date().getDay(); // 0=Dom,1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb
    // Nuestros días arrancan Lunes=índice 0 en el array
    const DIA_EN_MENU = HOY_IDX === 0 ? -1 : HOY_IDX - 1; // -1 si es domingo (no hay menú)

    // ── Renderizar menú ejecutivo ──
    document.getElementById('ejecutivoFecha').textContent = '📅 ' + MENU_EJECUTIVO.semana;
    document.getElementById('ejecutivoIncludes').innerHTML =
      '<strong>Todos nuestros platillos incluyen:</strong> ' + MENU_EJECUTIVO.incluye;

    const diasGrid = document.getElementById('diasGrid');
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
          <span class="ico">📍</span>
          <span>${s.direccion}</span>
        </div>

        <div class="branch-row">
          <span class="ico">🕐</span>
          <span>${s.horario}</span>
        </div>

      <div class="branch-row">
        <span class="ico">📞</span>
        <span>${s.telefono}</span>
    </div>

    </div>

  

    <a
      href="https://maps.google.com"
      target="_blank"
      class="branch-map">

      🗺️ Cómo llegar

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

    // ── Nav móvil ──
    document.getElementById('navToggle').addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
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
    })();
