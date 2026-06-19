    /* ── MENÚ EJECUTIVO SEMANAL ────────────────────────────────
       Cambia las fechas y platillos cada semana aquí.
       Para la imagen del platillo puedes poner la ruta o dejarlo vacío.
       Los acompañamientos van en el array "acomp".
       ─────────────────────────────────────────────────────── */
    const MENU_EJECUTIVO = {
  semana: "25 al 30 de mayo, 2026",

  incluye:
    "Refresco natural, tortillas y fruta de temporada",

  dias: [

    {
      dia: "Lunes",
      fecha: "25 mayo",
      plato: "Caldo de Mariscos",
      precio: 32,
      imagen: "",
      esHoy: false,
      emojis: "🦐🐟",
      acomp: [
        "Arroz 🍚",
        "Aguacate 🥑"
      ]
    },

    {
      dia: "Martes",
      fecha: "26 mayo",
      plato: "Lomito en Salsa de Champiñones",
      precio: 32,
      imagen: "",
      esHoy: true,
      emojis: "🥩🍄",
      acomp: [
        "Arroz 🍚",
        "Ensalada verde 🥗"
      ]
    },

    {
      dia: "Miércoles",
      fecha: "27 mayo",
      plato: "Pechuga de Pollo Empanizada",
      precio: 32,
      imagen: "",
      esHoy: false,
      emojis: "🐓",
      acomp: [
        "Puré de papa 🥔",
        "Ensalada de tomate manzano 🍅"
      ]
    },

    {
      dia: "Jueves",
      fecha: "28 mayo",
      plato: "Filete de Pescado a la Plancha",
      precio: 32,
      imagen: "",
      esHoy: false,
      emojis: "🐟",
      acomp: [
        "Arroz horneado 🍚",
        "Ensalada de pepino 🥒"
      ]
    },

    {
      dia: "Viernes",
      fecha: "29 mayo",
      plato: "Churrasquito",
      precio: 32,
      imagen: "",
      esHoy: false,
      emojis: "🥩🌽",
      acomp: [
        "Elote 🌽",
        "Cebollín",
        "Frijoles charros 🫘"
      ]
    },

    {
      dia: "Sábado",
      fecha: "30 mayo",
      plato: "Fajitas de Pollo o Lomito",
      precio: 32,
      imagen: "",
      esHoy: false,
      emojis: "🍗🥩",
      acomp: [
        "Guacamole 🥑",
        "Frijoles charros 🫘"
      ]
    }

  ]
};
    /* ── MENÚ GENERAL ─────────────────────────────────────────
       img: ruta a la imagen dentro de /imagenes/
            ejemplo: "imagenes/cappuccino.jpg"
       Si no tienes imagen aún, déjalo vacío: img: ""
       El emoji se muestra automáticamente si no hay imagen.
       ─────────────────────────────────────────────────────── */
       /* Categorias*/
       const CATEGORIAS = [
        {
          id: 1,
          slug: "desayuno",
          nombre: "Desayunos",
          orden: 1,
          activa: true
        },
        {
          id: 2,
          slug: "especial",
          nombre: "Especialidades",
          orden: 2,
          activa: true
        },
        {
          id: 3,
          slug: "entrada",
          nombre: "Entradas",
          orden: 3,
          activa: true
        },
        {
          id: 4,
          slug: "pasta",
          nombre: "Pastas",
          orden: 4,
          activa: true
        },
        {
          id: 5,
          slug: "sandwich",
          nombre: "Sandwiches",
          orden: 5,
          activa: true
        },
        {
          id: 6,
          slug: "bebida_caliente",
          nombre: "Bebidas Calientes",
          orden: 6,
          activa: true
        },
        {
          id: 7,
          slug: "bebida_fria",
          nombre: "Bebidas Frías",
          orden: 7,
          activa: true
        },
        {
          id: 8,
          slug: "postre",
          nombre: "Postres",
          orden: 8,
          activa: true
        },
       {
          id: 9,
          slug: "infantil",
          nombre: "Infantil",
          orden: 9,
          activa: true
        }
      ];    
    
    
     
    
  const MENU_ITEMS = [
      {
  id: 100,
  categoria: "desayuno",
  nombre: "Desayuno Buffet",
  descripcion: "Huevos revueltos o estrellados, frijol, crema, queso, plátanos fritos, chorizo, jamón, panqueques, salchicha, pan, tortilla, café o jugo.",
  precio: 75,
  imagen: "images/desayuno-buffet.jpg",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 1,
  activo: true
},

{
  id: 101,
  categoria: "desayuno",
  nombre: "Típico",
  descripcion: "Huevos revueltos, frijol, crema, queso, plátanos fritos y chorizo o jamón.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 2,
  activo: true
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
  badge: "",
  orden: 3,
  activo: true
},

{
  id: 103,
  categoria: "desayuno",
  nombre: "Divorciados",
  descripcion: "Huevos estrellados con salsa roja y verde, frijol, queso, crema y plátanos fritos.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 4,
  activo: true
},

{
  id: 104,
  categoria: "desayuno",
  nombre: "Triple Jamón y Huevo",
  descripcion: "Huevos doblados con jamón en pan tostado con mantequilla, frijoles y nachos.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 5,
  activo: true
},

{
  id: 105,
  categoria: "desayuno",
  nombre: "Huevos con Pupusas",
  descripcion: "Huevos revueltos sobre dos pupusas, frijol, crema, queso y plátanos fritos.",
  precio: 55,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 6,
  activo: true
},

{
  id: 106,
  categoria: "desayuno",
  nombre: "Bowl de Fruta",
  descripcion: "Fruta de temporada con miel. Agrega yogurt y granola.",
  precio: 40,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Saludable",
  orden: 7,
  activo: true
},

{
  id: 107,
  categoria: "desayuno",
  nombre: "Avena",
  descripcion: "Preparada con agua o leche, acompañada de granola y fruta de temporada.",
  precio: 40,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 8,
  activo: true
},

{
  id: 108,
  categoria: "desayuno",
  nombre: "Omelette",
  descripcion: "Jamón y queso o champiñones con mozzarella. Incluye frijol, queso, crema y plátano frito.",
  precio: 55,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Chef",
  orden: 9,
  activo: true
},

{
  id: 109,
  categoria: "desayuno",
  nombre: "Panqueques",
  descripcion: "Tres unidades. Puedes agregar Nutella y banano.",
  precio: 25,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 10,
  activo: true
},

{
  id: 200,
  categoria: "especial",
  nombre: "Lomito en Salsa Blanca",
  descripcion: "Lomito bañado en salsa de la casa, acompañado de papa al vapor o pasta y ensalada César.",
  precio: 80,
  imagen: "images/lomito.jpg",
  disponible: true,
  destacado: true,
  badge: "Chef",
  orden: 1,
  activo: true
},

{
  id: 201,
  categoria: "especial",
  nombre: "Churrasquito Típico",
  descripcion: "Churrasquito acompañado de elote, frijoles, cebollines, chirmol y guacamole.",
  precio: 45,
  imagen: "images/churrasquito.jpg",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 2,
  activo: true
},

{
  id: 202,
  categoria: "especial",
  nombre: "Puyazo Premium",
  descripcion: "Puyazo premium de 8 onzas acompañado de guacamole, frijoles, ensalada de la casa y papa al vapor.",
  precio: 110,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Premium",
  orden: 3,
  activo: true
},

{
  id: 203,
  categoria: "especial",
  nombre: "Lomito Premium",
  descripcion: "Lomito premium de 8 onzas acompañado de guacamole, frijoles, ensalada de la casa y papa al vapor.",
  precio: 110,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Premium",
  orden: 4,
  activo: true
},

{
  id: 204,
  categoria: "especial",
  nombre: "Entraña Premium",
  descripcion: "Entraña premium de 8 onzas acompañada de guacamole, frijoles, ensalada de la casa y papa al vapor.",
  precio: 110,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Premium",
  orden: 5,
  activo: true
},

{
  id: 205,
  categoria: "especial",
  nombre: "Camarones al Gusto",
  descripcion: "Camarones preparados al ajo, empanizados o a la plancha, acompañados de guacamole, chips, ensalada verde y pasta roja o Alfredo.",
  precio: 115,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Premium",
  orden: 6,
  activo: true
},

{
  id: 206,
  categoria: "especial",
  nombre: "Pescado a la Plancha",
  descripcion: "Filete de pescado acompañado de papa al vapor y ensalada verde.",
  precio: 80,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 7,
  activo: true
},

{
  id: 300,
  categoria: "entrada",
  nombre: "Nachos Conception de Lomito",
  descripcion: "Nachos artesanales acompañados de lomito.",
  precio: 80,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Para Compartir",
  orden: 1,
  activo: true
},

{
  id: 301,
  categoria: "entrada",
  nombre: "Nachos Conception de Pollo",
  descripcion: "Nachos artesanales acompañados de pollo.",
  precio: 75,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Para Compartir",
  orden: 2,
  activo: true
},

{
  id: 302,
  categoria: "entrada",
  nombre: "Capaccio de Lomito",
  descripcion: "Finas láminas de lomito preparadas al estilo de la casa.",
  precio: 85,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Chef",
  orden: 3,
  activo: true
},

{
  id: 303,
  categoria: "entrada",
  nombre: "Capaccio de Salmón",
  descripcion: "Finas láminas de salmón preparadas al estilo de la casa.",
  precio: 100,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Premium",
  orden: 4,
  activo: true
},

{
  id: 304,
  categoria: "entrada",
  nombre: "Sopa de Pollo",
  descripcion: "Sopa tradicional de pollo preparada al momento.",
  precio: 40,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 5,
  activo: true
},

{
  id: 305,
  categoria: "entrada",
  nombre: "Sopa de Espárragos",
  descripcion: "Crema de espárragos suave y cremosa.",
  precio: 35,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 6,
  activo: true
},

{
  id: 306,
  categoria: "entrada",
  nombre: "Plato Choricero",
  descripcion: "Chorizo argentino, guacamole, frijoles volteados, nachos y tortillas.",
  precio: 100,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 7,
  activo: true
},

{
  id: 307,
  categoria: "entrada",
  nombre: "Tacos al Pastor",
  descripcion: "Tacos preparados con carne al pastor.",
  precio: 45,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 8,
  activo: true
},

{
  id: 308,
  categoria: "entrada",
  nombre: "Tacos de Asada",
  descripcion: "Tacos preparados con carne asada.",
  precio: 48,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 9,
  activo: true
},

{
  id: 309,
  categoria: "entrada",
  nombre: "Tabla de Quesos y Jamones",
  descripcion: "Selección especial de quesos y jamones para compartir.",
  precio: 100,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Para Compartir",
  orden: 10,
  activo: true
},

{
  id: 310,
  categoria: "entrada",
  nombre: "Costillas a la Barbacoa",
  descripcion: "Costillas bañadas en salsa barbacoa.",
  precio: 70,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 11,
  activo: true
},

{
  id: 311,
  categoria: "entrada",
  nombre: "Ensalada César",
  descripcion: "Lechuga, crutones, queso parmesano y aderezo César.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 12,
  activo: true
},

{
  id: 312,
  categoria: "entrada",
  nombre: "Ensalada de la Casa",
  descripcion: "Lechuga, aguacate, tomate, cebolla, fresa o uva, nueces y aderezo especial.",
  precio: 55,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Saludable",
  orden: 13,
  activo: true
},

{
  id: 400,
  categoria: "pasta",
  nombre: "Lasaña a la Boloñesa",
  descripcion: "Lasaña tradicional preparada con salsa boloñesa.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 1,
  activo: true
},

{
  id: 401,
  categoria: "pasta",
  nombre: "Ravioles Rellenos",
  descripcion: "Ravioles rellenos acompañados de salsa blanca o roja.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 2,
  activo: true
},

{
  id: 402,
  categoria: "pasta",
  nombre: "Espagueti a la Boloñesa",
  descripcion: "Espagueti acompañado de salsa boloñesa.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 3,
  activo: true
},

{
  id: 403,
  categoria: "pasta",
  nombre: "Pasta Alfredo con Camarones",
  descripcion: "Pasta Alfredo cremosa acompañada de camarones.",
  precio: 95,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Chef",
  orden: 4,
  activo: true
},

{
  id: 404,
  categoria: "pasta",
  nombre: "Pasta Alfredo con Lomito",
  descripcion: "Pasta Alfredo cremosa acompañada de lomito.",
  precio: 90,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 5,
  activo: true
},

{
  id: 405,
  categoria: "pasta",
  nombre: "Pasta Alfredo con Pollo",
  descripcion: "Pasta Alfredo cremosa acompañada de pollo.",
  precio: 85,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 6,
  activo: true
},

{
  id: 500,
  categoria: "sandwich",
  nombre: "Conception Burger",
  descripcion: "Lomito a la parrilla, tocino, cebolla caramelizada y salsa especial de la casa.",
  precio: 60,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 1,
  activo: true
},

{
  id: 501,
  categoria: "sandwich",
  nombre: "Grill Steak",
  descripcion: "Lomito a la parrilla con mozzarella y salsa especial de la casa.",
  precio: 60,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Chef",
  orden: 2,
  activo: true
},

{
  id: 502,
  categoria: "sandwich",
  nombre: "Chicken Sandwich",
  descripcion: "Pollo a la parrilla con mozzarella y salsa blanca.",
  precio: 50,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 3,
  activo: true
},

{
  id: 503,
  categoria: "sandwich",
  nombre: "Turkey Jam",
  descripcion: "Jamón de pechuga de pavo, cheddar, mayonesa y mostaza.",
  precio: 55,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 4,
  activo: true
},

{
  id: 504,
  categoria: "sandwich",
  nombre: "Quesoburguesa",
  descripcion: "Hamburguesa con queso. Puede agregarse huevo o tocino.",
  precio: 48,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 5,
  activo: true
},

{
  id: 505,
  categoria: "sandwich",
  nombre: "Chili Dog",
  descripcion: "Hot dog especial estilo chili.",
  precio: 28,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 6,
  activo: true
},

{
  id: 506,
  categoria: "sandwich",
  nombre: "Hot Dog",
  descripcion: "Hot dog clásico.",
  precio: 25,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 7,
  activo: true
},

{
  id: 600,
  categoria: "bebida_caliente",
  nombre: "Café Espresso",
  descripcion: "Shot de espresso preparado al momento.",
  precio: 16,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Caliente",
  orden: 1,
  activo: true
},

{
  id: 601,
  categoria: "bebida_caliente",
  nombre: "Café Americano",
  descripcion: "Café americano tradicional.",
  precio: 20,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 2,
  activo: true
},

{
  id: 602,
  categoria: "bebida_caliente",
  nombre: "Café con Leche",
  descripcion: "Café acompañado de leche caliente.",
  precio: 22,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Caliente",
  orden: 3,
  activo: true
},

{
  id: 603,
  categoria: "bebida_caliente",
  nombre: "Latte",
  descripcion: "Espresso con leche vaporizada y espuma suave.",
  precio: 23,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Barista",
  orden: 4,
  activo: true
},

{
  id: 604,
  categoria: "bebida_caliente",
  nombre: "Capuchino",
  descripcion: "Espresso, leche vaporizada y espuma cremosa.",
  precio: 23,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 5,
  activo: true
},

{
  id: 605,
  categoria: "bebida_caliente",
  nombre: "Té",
  descripcion: "Variedad de té en sobre.",
  precio: 16,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 6,
  activo: true
},

{
  id: 606,
  categoria: "bebida_caliente",
  nombre: "Infusiones",
  descripcion: "Selección de infusiones especiales.",
  precio: 26,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 7,
  activo: true
},

{
  id: 700,
  categoria: "bebida_fria",
  nombre: "Frappé",
  descripcion: "Disponible en moka, vainilla, caramelo, chocolate blanco u oreo.",
  precio: 28,
  imagen: "images/frappe.jpg",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 1,
  activo: true
},

{
  id: 701,
  categoria: "bebida_fria",
  nombre: "Iced Coffee",
  descripcion: "Disponible en vainilla o caramelo.",
  precio: 25,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Frío",
  orden: 2,
  activo: true
},

{
  id: 702,
  categoria: "bebida_fria",
  nombre: "Licuado de Fruta",
  descripcion: "Preparado con agua o leche.",
  precio: 18,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 3,
  activo: true
},

{
  id: 703,
  categoria: "bebida_fria",
  nombre: "Smoothie",
  descripcion: "Frutos rojos, fresa banano o piña colada.",
  precio: 30,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Recomendado",
  orden: 4,
  activo: true
},

{
  id: 704,
  categoria: "bebida_fria",
  nombre: "Cremita",
  descripcion: "Bebida fría especial de la casa.",
  precio: 20,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 5,
  activo: true
},

{
  id: 705,
  categoria: "bebida_fria",
  nombre: "Milkshake",
  descripcion: "Chocolate, fresa, banano u oreo.",
  precio: 25,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 6,
  activo: true
},

{
  id: 706,
  categoria: "bebida_fria",
  nombre: "Limonada",
  descripcion: "Refrescante limonada natural.",
  precio: 18,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Frío",
  orden: 7,
  activo: true
},

{
  id: 707,
  categoria: "bebida_fria",
  nombre: "Naranjada",
  descripcion: "Refrescante naranjada natural.",
  precio: 18,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Frío",
  orden: 8,
  activo: true
},

{
  id: 708,
  categoria: "bebida_fria",
  nombre: "Jamaica",
  descripcion: "Bebida natural tradicional.",
  precio: 10,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 9,
  activo: true
},

{
  id: 709,
  categoria: "bebida_fria",
  nombre: "Tamarindo",
  descripcion: "Bebida natural tradicional.",
  precio: 10,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 10,
  activo: true
},

{
  id: 710,
  categoria: "bebida_fria",
  nombre: "Horchata",
  descripcion: "Bebida natural tradicional.",
  precio: 10,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 11,
  activo: true
},

{
  id: 711,
  categoria: "bebida_fria",
  nombre: "Agua Gaseosa",
  descripcion: "Bebida gaseosa regular o light.",
  precio: 10,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 12,
  activo: true
},

{
  id: 712,
  categoria: "bebida_fria",
  nombre: "Té Lipton",
  descripcion: "Té frío embotellado.",
  precio: 12,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 13,
  activo: true
},

{
  id: 713,
  categoria: "bebida_fria",
  nombre: "Agua Pura",
  descripcion: "Botella de agua pura.",
  precio: 5,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 14,
  activo: true
},

{
  id: 800,
  categoria: "postre",
  nombre: "Pastel de Chocolate",
  descripcion: "Pastel de chocolate preparado en casa.",
  precio: 28,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 1,
  activo: true
},

{
  id: 801,
  categoria: "postre",
  nombre: "Cheesecake de Fresa",
  descripcion: "Cheesecake acompañado de salsa de fresa.",
  precio: 42,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Popular",
  orden: 2,
  activo: true
},

{
  id: 802,
  categoria: "postre",
  nombre: "Pan de Banano",
  descripcion: "Pan de banano artesanal preparado en casa.",
  precio: 18,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 3,
  activo: true
},

{
  id: 803,
  categoria: "postre",
  nombre: "Fresas con Crema",
  descripcion: "Fresas frescas acompañadas de crema dulce.",
  precio: 25,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Recomendado",
  orden: 4,
  activo: true
},

{
  id: 804,
  categoria: "postre",
  nombre: "Empanada de Manjar",
  descripcion: "Empanada dulce rellena de manjar.",
  precio: 15,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 5,
  activo: true
},

{
  id: 805,
  categoria: "postre",
  nombre: "Strudel de Crema",
  descripcion: "Strudel horneado relleno de crema.",
  precio: 22,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 6,
  activo: true
},

{
  id: 806,
  categoria: "postre",
  nombre: "Mole",
  descripcion: "Postre tradicional de la casa.",
  precio: 20,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "",
  orden: 7,
  activo: true
},

{
  id: 807,
  categoria: "postre",
  nombre: "Postre de Temporada",
  descripcion: "Consulta la especialidad disponible de la temporada.",
  precio: 30,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Temporada",
  orden: 8,
  activo: true
},

{
  id: 900,
  categoria: "infantil",
  nombre: "Mac & Cheese",
  descripcion: "Pasta cremosa con queso, ideal para niños.",
  precio: 35,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Kids",
  orden: 1,
  activo: true
},

{
  id: 901,
  categoria: "infantil",
  nombre: "Mozarella Stick",
  descripcion: "Palitos de queso mozzarella empanizados.",
  precio: 35,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Kids",
  orden: 2,
  activo: true
},

{
  id: 902,
  categoria: "infantil",
  nombre: "Derretido",
  descripcion: "Sándwich caliente de queso derretido.",
  precio: 30,
  imagen: "",
  disponible: true,
  destacado: false,
  badge: "Kids",
  orden: 3,
  activo: true
},

{
  id: 903,
  categoria: "infantil",
  nombre: "Pizzita Jamón y Queso",
  descripcion: "Mini pizza de jamón y queso para niños.",
  precio: 40,
  imagen: "",
  disponible: true,
  destacado: true,
  badge: "Kids",
  orden: 4,
  activo: true
}


];
    /* ─ 
    
    ─ SUCURSALES ──────────────────────────────────────────── */
    const SUCURSALES = [
      
    {
      num: "01",

      nombre: "Conception Coffee",

      direccion: "KM 87.5 Carretera al Pacífico, Santa Lucía Cotzumalguapa, interior de Gasolinera Texaco",

      horario: "Lunes a Domingo · 7:00 AM – 9:00 PM",

      telefono: "5987-8068"
    }

  
     
    ];
    /* ══════════════════════════════════════════════════════════
       LÓGICA DE LA PÁGINA — no necesitas editar nada de aquí
       Esto lee las variables de arriba y construye el HTML
       ══════════════════════════════════════════════════════════ */
