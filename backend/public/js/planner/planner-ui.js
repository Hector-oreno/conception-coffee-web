const PlannerUI = {

    renderEditor(ctx) {
        const titulo = document.querySelector(".planner-editor-title h2");
        if (titulo) {
            titulo.textContent = ctx.diaActual.charAt(0) + ctx.diaActual.slice(1).toLowerCase();
        }


        const fecha = document.getElementById("plannerDiaFecha");

        const badge = document.getElementById("plannerEstadoChip");

        if (badge) {

            badge.textContent = ctx.estadoSemana || "BORRADOR";

            badge.classList.remove("publicado", "borrador");

            if (ctx.estadoSemana === "PUBLICADO") {

                badge.classList.add("publicado");

            } else {

                badge.classList.add("borrador");

            }

        }



        if (fecha) {

            const datosDia = ctx.obtenerDiaActual();

            if (datosDia.fecha_especifica) {

                const fechaObj = new Date(datosDia.fecha_especifica);

                fecha.textContent =
                    fechaObj.toLocaleDateString(
                        "es-GT",
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            timeZone: "UTC"
                        }   
                    );

            }

        }



        const dia = ctx.obtenerDiaActual();
        
        // Sincronizar selector de producto
        const selectProducto = document.getElementById("planner-product-select");

        
        if (selectProducto) {

            
            selectProducto.value = String(dia.producto);

            
            if (dia.producto) {
                const prodData = ctx.obtenerProducto(dia.producto);
                
                this.actualizarVistaPrevia(ctx, prodData);
            }


            else {

                const pNombre =
                    document.getElementById("plannerPreviewNombre");

                 const pPrecio =
                    document.getElementById("plannerPreviewPrecio");

                const pGuarnic =
                    document.getElementById("plannerPreviewGuarniciones");

                const pImg =
                    document.getElementById("plannerPreviewImage");

                if (pNombre)
                    pNombre.textContent = "Seleccione un platillo";

                if (pPrecio)
                    pPrecio.textContent = "--";

                if (pGuarnic)
                    pGuarnic.textContent = "Sin información";

                if (pImg)

                    
                    pImg.src = "images/uploads/Logo_carta.png";

            }
            
        }

        // Sincronizar tarjetas de estado (Activo, Feriado, Cerrado)
        const tarjetas = document.querySelectorAll(".planner-state-card");
        tarjetas.forEach(card => {
            card.classList.remove("active");
            if (card.dataset.estado === dia.estado) {
                card.classList.add("active");
            }
        });



        // Agregar eventos de clic a las tarjetas
        tarjetas.forEach(card => {

            card.onclick = () => {

                
                const nuevoEstado = card.dataset.estado;

                dia.estado = nuevoEstado;

                
                ctx.cambiosPendientes = true;

                ctx.renderEditor();

                
            };

        });


        const bloquePlatillo = document.getElementById("bloquePlatillo");
        const bloquePreview = document.getElementById("bloquePreview");
        const bloquePersonalizacion = document.getElementById("bloquePersonalizacion");
        const bloqueFeriado = document.getElementById("bloqueFeriado");
        const bloqueCerrado = document.getElementById("bloqueCerrado");

        if (dia.estado === "ACTIVO") {

            bloquePlatillo.classList.remove("planner-hidden");
            bloquePreview.classList.remove("planner-hidden");
            bloquePersonalizacion.classList.remove("planner-hidden");

            bloqueFeriado.classList.add("planner-hidden");
            bloqueCerrado.classList.add("planner-hidden");

        }

        if (dia.estado === "FERIADO") {

            bloquePlatillo.classList.add("planner-hidden");
            bloquePreview.classList.add("planner-hidden");
            bloquePersonalizacion.classList.add("planner-hidden");

            bloqueFeriado.classList.remove("planner-hidden");
            bloqueCerrado.classList.add("planner-hidden");

        }

        if (dia.estado === "CERRADO") {

            bloquePlatillo.classList.add("planner-hidden");
            bloquePreview.classList.add("planner-hidden");
            bloquePersonalizacion.classList.add("planner-hidden");

            bloqueFeriado.classList.add("planner-hidden");
            bloqueCerrado.classList.remove("planner-hidden");

        }


        // Refrescar sub-paneles vinculados
        if (typeof PlannerForm !== 'undefined') PlannerForm.actualizarPanelPersonalizacion(ctx);
        if (typeof PlannerSidebar !== 'undefined') PlannerSidebar.actualizarSidebar(ctx);
        
        this.actualizarProgreso(ctx);
    },

    actualizarVistaPrevia(ctx, producto) {

        

        if (!producto) return;
        const dia = ctx.obtenerDiaActual();

        
        const precio = dia.precioPersonalizado !== null? Number(dia.precioPersonalizado): Number(producto.precio);
        const guarniciones = dia.guarnicionesPersonalizadas.length ? dia.guarnicionesPersonalizadas : producto.guarniciones;

        const pNombre = document.getElementById("plannerPreviewNombre");
        const pPrecio = document.getElementById("plannerPreviewPrecio");
        const pGuarnic = document.getElementById("plannerPreviewGuarniciones");
        const pImg = document.getElementById("plannerPreviewImage");

        
        if (pNombre) pNombre.textContent = producto.nombre;
        if (pPrecio) {

            if (Number.isFinite(precio) && precio > 0) {

                pPrecio.textContent =
                    `Q${precio.toFixed(2)}`;

            } else {

                pPrecio.textContent =
                    "Sin precio";

            }

        }
         
        if (pGuarnic) {

            pGuarnic.textContent = guarniciones
                .map(g => {

                    if (typeof g === "string") {
                        return g;
                    }

                return `${g.emoji} ${g.nombre}`;

            })
            .join("   ");

        }

        if (pImg) {

            pImg.src = producto.imagen;

        }

        },

        actualizarProgreso(ctx) {
            let completos = 0;
            Object.values(ctx.semana).forEach(dia => {
                if (dia.producto && dia.estado) completos++;
            });

        const progreso = document.getElementById("plannerProgresoTexto");
        if (progreso) progreso.textContent = `${completos} de 7 días`;
    },

    actualizarBadge(ctx) {

        const badge = document.getElementById("plannerBadge");

        if (!badge) return;

        const dia = ctx.obtenerDiaActual();

        // Limpiar clases anteriores
        badge.classList.remove(
            "badge-empty",
            "badge-master",
            "badge-custom",
            "badge-published"
        );

        // ==========================================
        // SIN PLANIFICAR
        // ==========================================

        if (!dia.producto) {

            badge.textContent = "⚪ Sin planificar";

            badge.classList.add("badge-empty");

            return;

        }

        // ==========================================
        // PERSONALIZADO
        // ==========================================

        const personalizado =
            dia.personalizado ||
            dia.precioPersonalizado !== null ||
            dia.guarnicionesPersonalizadas.length > 0;

        if (personalizado) {

            badge.textContent = "🟡 Personalizado";

            badge.classList.add("badge-custom");

            return;

        }

        // ==========================================
        // CATÁLOGO
        // ==========================================

        badge.textContent = "🔵 Catálogo Maestro";

        badge.classList.add("badge-master");

    },

    obtenerEmojiGuarnicion(nombre) {
        const diccionario = {
            arroz: "🍚", aguacate: "🥑", ensalada: "🥗", papa: "🥔", papas: "🥔",
            frijoles: "🫘", tortilla: "🫓", pasta: "🍝", verduras: "🥬", elote: "🌽"
        };
        return diccionario[nombre.toLowerCase()] ?? "🍽";
    }
};