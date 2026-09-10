// public/js/planner/planner-sidebar.js

const PlannerSidebar = {
    // Escucha los clics de los días en la barra lateral
    init(ctx) {
        const dias = document.querySelectorAll(".planner-day-item");
        
        dias.forEach(dia => {
            dia.onclick = () => {
                dias.forEach(d => d.classList.remove("active"));
                dia.classList.add("active");

                // Actualizamos el estado global de la aplicación
                ctx.diaActual = dia.dataset.dia;
                
                // Forzamos el repintado del editor con la data del nuevo día
                ctx.renderEditor();
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
                                ctx.semana[nombreDia].producto
                                    ? "✔ Planificado"
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

            if (dia.producto) {

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



    // Actualiza los pequeños indicadores (badge de estado y nombre del plato) en la barra lateral
    actualizarSidebar(ctx) {
        Object.keys(ctx.semana).forEach(nombreDia => {
            const dia = ctx.semana[nombreDia];
            const elementoProducto = document.getElementById(`plannerProducto${nombreDia}`);
            const elementoEstado = document.getElementById(`plannerEstado${nombreDia}`);

            // 1. Sincronizar nombre del platillo en la lista lateral
            if (elementoProducto) {
                if (dia.producto) {
                    const datosProd = ctx.obtenerProducto(dia.producto);
                    elementoProducto.textContent = datosProd ? datosProd.nombre : "Sin producto";
                } else {
                    elementoProducto.textContent = "Sin producto";
                }
            }

            // 2. Sincronizar emojis e indicadores de estado
            if (elementoEstado) {
                switch (dia.estado) {
                    case "ACTIVO":
                        elementoEstado.textContent = "🟢 Activo";
                        break;
                    case "FERIADO":
                        elementoEstado.textContent = "🟡 Feriado";
                        break;
                    case "CERRADO":
                        elementoEstado.textContent = "⚫ Cerrado";
                        break;
                    default:
                        elementoEstado.textContent = "🟢 Activo";
                }
            }
        });
    }
};