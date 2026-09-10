const PlannerTemplateModerna = {

    render(contenedor, datos) {

        const branding =
            window.PlannerBranding;

        const config =
            datos.plantilla?.configuracion || {};

        const precio =
            Number(datos.precio || 0)
                .toFixed(2);

        const guarniciones =
            Array.isArray(datos.guarniciones)
                ? datos.guarniciones.join(" · ")
                : "";

        const telefono =
            datos.sucursal.telefono || "";

        const direccion =
            datos.sucursal.direccion || "";


        contenedor.innerHTML = `

            <div
                class="promo-art promo-moderna"
                style="
                    --moderna-primary: ${config.colorPrimario || "#5D2C18"};
                    --moderna-accent: ${config.colorAcento || "#FF6A0A"};
                    --moderna-background: ${config.colorFondo || "#F4EEE8"};
                "
            >

                <!-- ================================= -->
                <!-- CABECERA -->
                <!-- ================================= -->

                <div class="promo-moderna-header">

                    <img
                        src="${branding.isotipo}"
                        alt=""
                        class="promo-moderna-isotipo"
                    >

                    <div class="promo-moderna-header-text">

                        <span>
                            MENÚ
                        </span>

                        <strong>
                            EJECUTIVO
                        </strong>

                    </div>

                    <div class="promo-moderna-hoy">
                        HOY
                    </div>

                </div>


                <!-- ================================= -->
                <!-- FOTO PRINCIPAL -->
                <!-- ================================= -->

                <div class="promo-moderna-visual">

                    ${
                        datos.imagen
                            ? `
                                <img
                                    src="${datos.imagen}"
                                    alt="${datos.plato}"
                                    class="promo-moderna-photo"
                                >
                              `
                            : `
                                <div class="promo-moderna-placeholder">

                                    <div class="promo-moderna-placeholder-icon">
                                        <i class="fas fa-utensils"></i>
                                    </div>

                                    <span>
                                        Imagen próximamente
                                    </span>

                                </div>
                              `
                    }


                    ${
                        config.mostrarPrecio !== false
                            ? `
                                <div class="promo-moderna-price">

                                    <small>
                                        DESDE
                                    </small>

                                    <strong>
                                        Q${precio}
                                    </strong>

                                </div>
                            `
                        : ""
                    }

                </div>


                <!-- ================================= -->
                <!-- INFORMACIÓN DEL PLATO -->
                <!-- ================================= -->

                <div class="promo-moderna-content">

                    <span class="promo-moderna-label">
                        ESPECIAL DEL DÍA
                    </span>

                    <h2>
                        ${datos.plato}
                    </h2>

                    ${
                        config.mostrarGuarniciones !== false &&
                        guarniciones
                            ? `
                                <p>
                                    ${guarniciones}
                                </p>
                            `
                        : ""
                    }

                </div>


                <!-- ================================= -->
                <!-- FOOTER -->
                <!-- ================================= -->

                <div class="promo-moderna-footer">

                    ${
                        config.mostrarLogo !== false
                            ? `
                                <div class="promo-moderna-brand">

                                    <img
                                        src="${branding.isotipo}"
                                        alt="" class="promo-moderna-brand-icon"
                                    >

                                    <div class="promo-moderna-brand-text">

                                        <strong>
                                            CONCEPTION
                                        </strong>

                                        <span>
                                            COFFEE
                                        </span>

                                    </div>

                                </div>
                            `
                        : ""
                    }

                    <div class="promo-moderna-contact">

                        ${
                            config.mostrarTelefono !== false &&
                            telefono
                                ? `
                                    <strong>
                                        <i class="fab fa-whatsapp"></i>
                                        ${telefono}
                                    </strong>
                                `
                            : ""
                        }

                        ${
                            config.mostrarDireccion !== false &&
                            direccion
                                ? `
                                    <small>
                                        ${direccion}
                                    </small>
                                `
                            : ""
                        }

                    </div>

                </div>

            </div>

        `;

    }

};


window.PlannerTemplateModerna =
    PlannerTemplateModerna;