const PlannerTemplatePremium = {

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
                class="promo-art promo-premium"
                style="
                    --premium-primary: ${config.colorPrimario || "#24150F"};
                    --premium-accent: ${config.colorAcento || "#D8B176"};
                    --premium-bottom: ${config.colorFondoInferior || "#F5EEE5"};
                "
            >

                <!-- ================================= -->
                <!-- BRANDING SUPERIOR -->
                <!-- ================================= -->

                <div class="promo-premium-header">

                    <img
                        src="${branding.isotipo}"
                        alt=""
                        class="promo-premium-isotipo"
                    >

                    <div class="promo-premium-brand">

                        <span>
                            CONCEPTION COFFEE
                        </span>

                        <small>
                            MENÚ EJECUTIVO
                        </small>

                    </div>

                    <span class="promo-premium-day">
                        HOY
                    </span>

                </div>


                <!-- ================================= -->
                <!-- TÍTULO -->
                <!-- ================================= -->

                <div class="promo-premium-heading">

                    <span>
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
                <!-- FOTOGRAFÍA -->
                <!-- ================================= -->

                <div class="promo-premium-visual">

                    ${
                        datos.imagen
                            ? `
                                <img
                                    src="${datos.imagen}"
                                    alt="${datos.plato}"
                                    class="promo-premium-photo"
                                >
                              `
                            : `
                                <div class="promo-premium-placeholder">

                                    <div class="promo-premium-placeholder-icon">
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
                                <div class="promo-premium-price">

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
                <!-- DETALLE -->
                <!-- ================================= -->

                <div class="promo-premium-detail">

                    <span></span>

                    <p>
                        Una selección preparada
                        especialmente para hoy.
                    </p>

                    <span></span>

                </div>


                <!-- ================================= -->
                <!-- FOOTER -->
                <!-- ================================= -->

                <div class="promo-premium-footer">

                    ${
                        config.mostrarLogo !== false
                            ?`
                                <img
                                    src="${branding.logoHorizontal}"
                                    alt="${branding.nombre}"
                                    class="promo-premium-logo"
                                >
                            `
                        : ""
                    }

                    <div class="promo-premium-contact">

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


window.PlannerTemplatePremium =
    PlannerTemplatePremium;