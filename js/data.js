    /* ── MENÚ EJECUTIVO SEMANAL ────────────────────────────────
       Cambia las fechas y platillos cada semana aquí.
       Para la imagen del platillo puedes poner la ruta o dejarlo vacío.
       Los acompañamientos van en el array "acomp".
       ─────────────────────────────────────────────────────── */
    const MENU_EJECUTIVO = {
      semana: "25 al 30 de mayo, 2026",
      incluye: "refresco natural, tortillas y fruta de temporada",
      dias: [
        {
          dia: "Lunes",
          fecha: "25 mayo",
          plato: "Caldo de Mariscos",
          emojis: "🦐🐟",
          acomp: ["Arroz 🍚", "Aguacate 🥑"]
        },
        {
          dia: "Martes",
          fecha: "26 mayo",
          plato: "Lomito en Salsa de Champiñones",
          emojis: "🥩🍄",
          acomp: ["Arroz 🍚", "Ensalada verde 🥗"]
        },
        {
          dia: "Miércoles",
          fecha: "27 mayo",
          plato: "Pechuga de Pollo Empanizada",
          emojis: "🐓",
          acomp: ["Puré de papa 🥔", "Ensalada de tomate manzano 🍅"]
        },
        {
          dia: "Jueves",
          fecha: "28 mayo",
          plato: "Filete de Pescado a la Plancha",
          emojis: "🐟",
          acomp: ["Arroz horneado 🍚", "Ensalada de pepino 🥒"]
        },
        {
          dia: "Viernes",
          fecha: "29 mayo",
          plato: "Churrasquito",
          emojis: "🥩🌽",
          acomp: ["Elote", "Cebollín", "Frijoles charros 🫘"]
        },
        {
          dia: "Sábado",
          fecha: "30 mayo",
          plato: "Fajitas de Pollo o Lomito",
          emojis: "🍗🥩",
          acomp: ["Guacamole", "Frijoles charros 🫘"]
        }
      ]
    };

    /* ── MENÚ GENERAL ─────────────────────────────────────────
       img: ruta a la imagen dentro de /imagenes/
            ejemplo: "imagenes/cappuccino.jpg"
       Si no tienes imagen aún, déjalo vacío: img: ""
       El emoji se muestra automáticamente si no hay imagen.
       ─────────────────────────────────────────────────────── */
    const MENU_ITEMS = [
      {
        id: 100,

        categoria: "desayuno",

        nombre: "Desayuno Buffet",

        descripcion: "Huevos revueltos o estrellados, frijol, crema, queso, plátanos fritos, chorizo, jamón, panqueques, salchicha, jamón, pan y tortilla.",

        precio: 75,

        imagen: "images/desayuno-buffet.jpg",

        disponible: true,

        destacado: true,

        badge: "Popular"
      },

      {
        id: 101,

        categoria: "desayuno",

        nombre: "Típico",

        descripcion: "Huevos revueltos, frijol, crema, queso, plátanos fritos, chorizo o jamón.",

        precio: 50,

        imagen: "images/huevos-rojos.jpg",

        disponible: true,

        destacado: false,

        badge: ""
      },

      {
        id: 102,

        categoria: "desayuno",

        nombre: "Huevos Rojos",

        descripcion: "Huevos revueltos con tomate y cebolla, frijol, queso, crema y plátanos fritos.",

        precio: 48,

        imagen: "images/huevos-rojos.jpg",

        disponible: true,

        destacado: false,

        badge: ""
      },
      
      {
        id: 200,

        categoria: "especial",

        nombre: "Lomito en Salsa Blanca",

        descripcion: "Lomito bañado en salsa de casa, papa al vapor o pasta y ensalada César.",

        precio: 80,

        imagen: "images/lomito.jpg",

        disponible: true,

        destacado: true,

        badge: "Chef"
      },

      {
        id: 201,

        categoria: "especial",

        nombre: "Churrasquito Típico",

        descripcion: "Churrasquito, elote, frijoles, chirmol y guacamole.",

        precio: 45,

        imagen: "images/churrasquito.jpg",

        disponible: true,

        destacado: true,

        badge: "Popular"
      },

     
      {
        id: 300,

        categoria: "bebida",

        nombre: "Frappé",

        descripcion: "Moka, vainilla, caramelo, chocolate blanco u oreo.",

        precio: 28,

        imagen: "images/frappe.jpg",

        disponible: true,

        destacado: true,

        badge: "Frío"
      },

      {
        id: 301,

        categoria: "bebida",

        nombre: "Iced Coffee",

        descripcion: "Vainilla o caramelo.",

        precio: 25,

        imagen: "",

        disponible: true,

        destacado: false,

        badge: "Frío"
      },

      {
        id: 302,

        categoria: "bebida",

        nombre: "Licuado de Fruta",

        descripcion: "Disponible con agua o leche.",

        precio: 18,

        imagen: "",

        disponible: true,

        destacado: false,

        badge: ""
      },

      {
        id: 303,

        categoria: "bebida",

        nombre: "Smoothie",

        descripcion: "Frutos rojos, fresa banano o piña colada.",

        precio: 30,

        imagen: "",

        disponible: true,

        destacado: false,

        badge: ""
      },

      {
        id: 304,

        categoria: "bebida",

        nombre: "Cremita",

        descripcion: "Bebida fría especial de la casa.",

        precio: 20,

        imagen: "",

        disponible: true,

        destacado: false,

        badge: ""
      },

      {
        id: 305,

        categoria: "bebida",

        nombre: "Milkshake",

        descripcion: "Chocolate, fresa, banano u oreo.",

        precio: 25,

        imagen: "",

        disponible: true,

        destacado: true,

        badge: "Popular"
      },

      {
        id: 306,

        categoria: "bebida",

        nombre: "Limonada / Naranjada",

        descripcion: "Refrescante y natural.",

        precio: 18,

        imagen: "",

        disponible: true,

        destacado: false,

        badge: ""
      },

      {
        id: 307,

        categoria: "bebida",

        nombre: "Jamaica / Tamarindo / Horchata",

        descripcion: "Bebidas naturales tradicionales.",

        precio: 10,

        imagen: "",

        disponible: true,

        destacado: false,

        badge: ""
      },
      {
        id: 4,
        categoria: "snack",
        nombre: "Sandwich Caprese",
        descripcion: "Tomate, mozzarella y albahaca fresca en pan artesanal.",
        precio: 45,
        imagen: "",
        disponible: true,
        destacado: false,
        badge: ""
      },
      {
        id: 5,
        categoria: "combo",
        nombre: "Combo Mañanero",
        descripcion: "Cappuccino + Sandwich + postre del día a precio especial.",
        precio: 75,
        imagen: "",
        disponible: true,
        destacado: false,
        badge: "Ahorro"
      },
      {
        id: 6,
        categoria: "postre",
        nombre: "Cheesecake de Fresa",
        descripcion: "Base de galleta, crema de queso y coulis de fresa fresca.",
        precio: 42,
        imagen: "",
        disponible: true,
        destacado: false,
        badge: ""
      }
    ];

    /* ── SUCURSALES ──────────────────────────────────────────── */
    const SUCURSALES = [
      
    {
      num: "01",

      nombre: "Conception Coffee",

      direccion: "Santa Lucía Cotzumalguapa, Escuintla",

      horario: "Lunes a Domingo · 7:00 AM – 9:00 PM",

      telefono: "5987-8068"
    }

  
     
    ];
    /* ══════════════════════════════════════════════════════════
       LÓGICA DE LA PÁGINA — no necesitas editar nada de aquí
       Esto lee las variables de arriba y construye el HTML
       ══════════════════════════════════════════════════════════ */
