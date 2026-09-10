const PlannerTemplateClasica = {

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
            config.mostrarTelefono !== false &&
            datos.sucursal.telefono
                ? `
                    <div class="promo-clasica-phone">
                        <span class="promo-whatsapp">
                            <i class="fab fa-whatsapp"></i>
                        </span>

                        <strong>
                            ${datos.sucursal.telefono}
                        </strong>
                    </div>
                `
                : "";


        const direccion =
            config.mostrarDireccion !== false &&
            datos.sucursal.direccion
                ? `
                    <div class="promo-clasica-address">
                        ${datos.sucursal.direccion}
                    </div>
                `
                : "";


        contenedor.innerHTML = `

            <div
                class="promo-art promo-clasica"
                style="
                    --clasica-primary: ${config.colorPrimario || "#FF6A0A"};
                    --clasica-secondary: ${config.colorSecundario || "#FFD36D"};
                    --clasica-bottom: ${config.colorFondoInferior || "#FFF8E6"};
                "
            >

                        <!-- ===================================== -->
                        <!-- ZONA SUPERIOR -->
                        <!-- ===================================== -->

                <div class="promo-clasica-top">

                    <div class="promo-clasica-heading">

                        <span class="promo-hoy">
                            HOY
                        </span>

                        <span class="promo-menu-script">
                            ¡Menú ejecutivo!
                        </span>

                    </div>


                    <div class="promo-clasica-dish">

                        <strong>
                            ${datos.plato}
                        </strong>

                        ${
                            config.mostrarGuarniciones !== false &&
                            guarniciones
                                ? `
                                    <span>
                                        ${guarniciones}
                                    </span>
                                `
                            : ""
                        }

                    </div>


                    <!-- Decoración -->

                    <div class="promo-rays">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>


                    <!-- Fotografía -->

                    <div class="promo-clasica-photo">

                        ${
                            datos.imagen
                                ? `
                                    <img
                                        src="${datos.imagen}"
                                        alt="${datos.plato}">
                                `
                                : `
                                    <div class="promo-photo-placeholder">

                                        <div class="promo-placeholder-icon">
                                            <i class="fas fa-utensils"></i>
                                        </div>

                                        <small>
                                            Imagen próximamente
                                        </small>

                                    </div>
                                `
                        }

                    </div>


                    <!-- Precio -->

                    ${
                        config.mostrarPrecio !== false
                            ? `
                                <div class="promo-clasica-price">

                                    <small>
                                        Desde
                                    </small>

                                    <strong>
                                        Q${precio}
                                    </strong>

                                </div>
                            `
                        : ""
                    }

                </div>


                <!-- ===================================== -->
                <!-- CURVA -->
                <!-- ===================================== -->

                <div class="promo-clasica-wave"></div>


                <!-- ===================================== -->
                <!-- ZONA DE MARCA -->
                <!-- ===================================== -->

                <div class="promo-clasica-bottom">

                    ${
                        config.mostrarLogo !== false
                            ? `
                                <img
                                    src="${branding.logoVertical}"
                                    alt="${branding.nombre}"
                                    class="promo-clasica-logo"
                                >
                            `
                        : ""
                    }

                    <div class="promo-clasica-contact-title">
                        ¡CONTÁCTANOS PARA TUS PEDIDOS!
                    </div>


                    ${telefono}

                    ${direccion}

                </div>

            </div>

        `;

    },

};


window.PlannerTemplateClasica =
    PlannerTemplateClasica;