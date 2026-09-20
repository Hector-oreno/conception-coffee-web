// public/js/planner/planner-sidebar.js

const PlannerSidebar = {
    // Escucha los clics de los días en la barra lateral
    init(ctx) {

        const dias =
            document.querySelectorAll(
                ".planner-day-item"
            );


        dias.forEach(dia => {

            dia.onclick = () => {

                const nuevoDia =
                    dia.dataset.dia;


                if (!nuevoDia) {
                    return;
                }


                // ==========================================
                // ACTUALIZAR ESTADO CENTRAL
                // ==========================================

                ctx.diaActual =
                    nuevoDia;


                // ==========================================
                // RENDERIZAR EDITOR DEL DÍA
                // ==========================================

                if (
                    typeof PlannerUI !== "undefined"
                ) {

                    PlannerUI.renderEditor(
                        ctx
                    );

                }


                // ==========================================
                // RECONSTRUIR SIDEBAR
                // ==========================================

                this.render(
                    ctx
                );

            };

        });

    },


    render(ctx) {

        // ===============================
        // Título de la semana
        // ===============================

        const titulo = document.getElementById("plannerSemanaTitulo");

        if (titulo) {

            titulo.textContent =
                `Semana ${ctx.numeroSemana || "--"}`;

        }

        // ===============================
        // Rango de fechas
        // ===============================

        const rango = document.getElementById("plannerSemanaRango");

        if (rango) {

            if (ctx.fechaInicio && ctx.fechaFin) {

                const inicio = new Date(ctx.fechaInicio);

                const fin = new Date(ctx.fechaFin);

                const formato = fecha =>
                fecha.toLocaleDateString("es-GT", {

                    day: "numeric",

                    month: "short",

                    year: "numeric",

                    timeZone: "UTC"

                });

            rango.textContent =
                `${formato(inicio)} al ${formato(fin)}`;

            } else {

                rango.textContent =
                    "-- de -- al -- de --";

            }

        }

        // ===============================
        // Lista de días
        // ===============================

        const contenedorDias =
            document.getElementById("plannerDiasContainer");

        if (contenedorDias) {

            contenedorDias.innerHTML = "";

            Object.keys(ctx.semana).forEach(nombreDia => {

                const activo =
                    nombreDia === ctx.diaActual
                        ? "active"
                        : "";

                contenedorDias.insertAdjacentHTML(

                    "beforeend",

                    `
                    <div
                        class="planner-day-item ${activo}"
                        data-dia="${nombreDia}">

                        <strong>${nombreDia}</strong>

                        <small>
                            ${
                                ctx.semana[nombreDia].estado === "ACTIVO"
                                    ? (
                                        ctx.semana[nombreDia].producto
                                            ? "✔ Planificado"
                                            : "Pendiente"
                                    )
                                    : ctx.semana[nombreDia].estado === "FERIADO"
                                        ? "✔ Feriado"
                                        : ctx.semana[nombreDia].estado === "CERRADO"
                                            ? "✔ Cerrado"
                                            : "Pendiente"
                            }
                        </small>

                    </div>
                    `

                );

            });

        }

        // ===============================
        // Progreso
        // ===============================

        let completados = 0;

        Object.values(ctx.semana).forEach(dia => {

            const completo =
                dia.estado === "ACTIVO"
                    ? Boolean(dia.producto)
                    : dia.estado === "FERIADO" ||
                    dia.estado === "CERRADO";

            if (completo) {
                completados++;
            }

        });

        const texto = document.getElementById(
            "plannerProgresoTexto"
        );

        if (texto) {

            texto.textContent =
                `${completados} / 7 días`;

        }

        const barra = document.getElementById(
            "plannerProgresoBarra"
        );

        if (barra) {

            barra.style.width =
                `${(completados / 7) * 100}%`;

        }

        this.init(ctx);

    },



};