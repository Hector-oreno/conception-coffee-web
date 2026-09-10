const PlannerArtwork = {

    // ======================================================
    // Obtener todos los datos necesarios para cualquier arte
    // ======================================================

    obtenerDatos(ctx) {

        const dia =
            ctx.obtenerDiaActual();

        if (!dia) return null;


        // ==========================================
        // PRODUCTO
        // ==========================================

        const producto =
            dia.producto
                ? ctx.obtenerProducto(dia.producto)
                : null;


        // ==========================================
        // PRECIO
        // ==========================================

        const precio =
            dia.precioPersonalizado !== null &&
            dia.precioPersonalizado !== ""
                ? Number(dia.precioPersonalizado)
                : Number(producto?.precio || 0);


        // ==========================================
        // GUARNICIONES
        // ==========================================

        let guarniciones = [];

        if (
            Array.isArray(
                dia.guarnicionesPersonalizadas
            ) &&
            dia.guarnicionesPersonalizadas.length > 0
        ) {

            guarniciones =
                dia.guarnicionesPersonalizadas;

        } else if (
            Array.isArray(producto?.guarniciones)
        ) {

            guarniciones =
                producto.guarniciones;

        }


        // ==========================================
        // BUSCAR PLANTILLA
        // Primero activas, después históricas
        // ==========================================

        const plantillaActiva =
            (ctx.plantillas || []).find(
                item =>
                    Number(item.id) ===
                    Number(dia.plantillaId)
            );


        const plantillaHistorica =
            (ctx.plantillasHistoricas || []).find(
                item =>
                    Number(item.id) ===
                    Number(dia.plantillaId)
            );


        const plantilla =
            plantillaActiva ||
            plantillaHistorica ||
            null;

        // ==========================================
        // SUCURSAL QUE ESTAMOS VISUALIZANDO
        // ==========================================

        const sucursal =
            (ctx.sucursales || []).find(
                item =>
                    Number(item.id) ===
                    Number(ctx.sucursalActualId)
            ) || null;


            // ==========================================
            // NORMALIZAR GUARNICIONES
            // ==========================================

            guarniciones =
                (guarniciones || [])
                    .map(guarnicion => {

                        // Ya viene como texto
                        if (typeof guarnicion === "string") {

                            return guarnicion.trim();

                        }


                        // Viene como objeto del catálogo/diccionario
                        if (
                            guarnicion &&
                            typeof guarnicion === "object"
                        ) {

                            return String(
                                guarnicion.nombre ||
                                guarnicion.nombre_guarnicion ||
                                guarnicion.descripcion ||
                                ""
                            ).trim();

                        }


                    return "";

                })
                .filter(Boolean);


        // ==========================================
        // OBJETO ESTÁNDAR PARA TODAS LAS PLANTILLAS
        // ==========================================

        return {

            dia:
                dia.dia_semana || "",

            fecha:
                dia.fecha_especifica || "",

            plato:
                producto?.nombre ||
                "Selecciona un platillo",

            imagen:
                producto?.imagen &&
                !String(producto.imagen).includes("Logo_carta")
                    ? producto.imagen
                    : null,

            precio,

            guarniciones,

            plantilla,

            sucursal: {

                id:
                    sucursal?.id || null,

                nombre:
                    sucursal?.nombre ||
                    "Conception Coffee",

                telefono:
                    sucursal?.telefono || "",

                direccion:
                    sucursal?.direccion || "",

                horario:
                    sucursal?.horario || ""

            }

        };

    },


    // ======================================================
    // Render principal
    // ======================================================

    render(ctx) {

        const contenedor =
            document.getElementById(
                "plannerArtworkPreview"
            );

        if (!contenedor) return;


        const datos =
            this.obtenerDatos(ctx);


        if (
            !datos ||
            !datos.plantilla
        ) {

            contenedor.innerHTML = `

                <div class="planner-artwork-empty">

                    <span>🎨</span>

                    <strong>
                        Selecciona una plantilla
                    </strong>

                    <p>
                        Aquí verás la presentación
                        promocional del platillo.
                    </p>

                </div>
            `;

            return;

        }


        const renderer =
            window.PlannerArtworkTemplates?.[
                datos.plantilla.slug
            ];


        if (
            !renderer ||
            typeof renderer.render !== "function"
        ) {

            contenedor.innerHTML = `

                <div class="planner-artwork-empty">

                    <strong>
                        ${datos.plantilla.nombre}
                    </strong>

                    <p>
                        Esta plantilla todavía
                        no tiene un diseño disponible.
                    </p>

                </div>
            `;

            return;

        }


        renderer.render(
            contenedor,
            datos
        );

    }

};


window.PlannerArtwork =
    PlannerArtwork;