// ==========================================================================
// PLANNER API - AUTENTICACIÓN
// ==========================================================================

function obtenerTokenPlanner() {

    return localStorage.getItem(
        'token_conception'
    ) || null;

}


function headersPlanner(
    headersAdicionales = {}
) {

    const token =
        obtenerTokenPlanner();


    return {

        ...headersAdicionales,

        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {})

    };

}

const PlannerAPI = {

    async obtenerMetricas() {

        const response = await fetch(

            `${CONFIG.API_BASE_URL}/planner/metricas`,

            {
                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },

    async obtenerHistorial() {

        const response = await fetch(

            `${CONFIG.API_BASE_URL}/planner/historial`,

            {
                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },

    async obtenerCatalogo() {

        const response = await fetch(

            `${CONFIG.API_BASE_URL}/planner/catalogo`,

            {
                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },

    async obtenerGrilla(
        semanaId,
        sucursalId
    ) {

        const response = await fetch(

            `${CONFIG.API_BASE_URL}/planner/grilla?seccionId=${semanaId}&sucursalId=${sucursalId}`,

            {
                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },


    async crearSemana(fechaInicio) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/crear-semana`,
            {
                method: "POST",

                headers: headersPlanner({
                    "Content-Type":
                        "application/json"
                  }),

                body: JSON.stringify({
                    fecha_inicio: fechaInicio
                })
            }
        );

        return await response.json();

    },


    async guardarPlatillo(formData) {

        try {

            const response = await fetch(

                `${CONFIG.API_BASE_URL}/planner/catalogo`,

                {
                    method: "POST",

                    headers:
                        headersPlanner(),

                    body:
                        formData
                }

            );

            if (!response.ok) {

                throw new Error("Error del servidor");

            }

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                success: false,

                message: error.message

            };

        }

    },

    async actualizarPlatillo(id, formData) {

        try {

            const response = await fetch(

                `${CONFIG.API_BASE_URL}/planner/catalogo/${id}`,

                {
                    method: "PUT",

                    headers:
                        headersPlanner(),

                    body:
                        formData
                }

            );

            if (!response.ok) {

                throw new Error("Error del servidor");

            }

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                success:false,

                message:error.message

            };

        }

    },

    async eliminarPlatillo(id) {

        try {

            const response = await fetch(

                `${CONFIG.API_BASE_URL}/planner/catalogo/${id}`,

                {

                    method: "DELETE",

                    headers:
                        headersPlanner()

                }

            );

            if (!response.ok) {

                throw new Error("Error del servidor");

            }

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                success: false,

                message: error.message

            };

        }

    },


    async eliminarSemana(id) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/semana/${id}`,
            {
                method: "DELETE",

                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },


    async obtenerPlatillosInactivos() {

        try {

            const response = await fetch(

                `${CONFIG.API_BASE_URL}/planner/catalogo/inactivos`,

                {
                    headers:
                        headersPlanner()
                }

            );

            if (!response.ok) {

                throw new Error("Error del servidor");

            }

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                success: false,

                message: error.message

            };

        }

    },



    async reactivarPlatillo(id) {

        try {

            const response = await fetch(

                `${CONFIG.API_BASE_URL}/planner/catalogo/${id}/reactivar`,

                {

                    method: "PATCH",

                    headers:
                        headersPlanner()

                }

            );

            if (!response.ok) {

                throw new Error("Error del servidor");

            }

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                success: false,

                message: error.message

            };

        }

    },


    async obtenerEmojis() {

        try {

            const response = await fetch(

                `${CONFIG.API_BASE_URL}/planner/emojis`,

                {
                    headers:
                        headersPlanner()
                }

            );

            if (!response.ok) {

                throw new Error("Error del servidor");

            }

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                success:false,
                data: [],
                message:error.message

            };

        }

    },


    async buscarEmojiPorPalabra(palabra) {

        try {

            const response = await fetch(

                `${CONFIG.API_BASE_URL}/planner/emojis/buscar/${encodeURIComponent(palabra)}`,

                {
                    headers:
                        headersPlanner()
                }



            );

            if (!response.ok) {

                throw new Error("Error del servidor");

            }

            return await response.json();

        } catch (error) {

            console.error(error);

            return {

                success: false,

                data: null,

                message: error.message

            };

        }

    },


    async crearEmoji(palabra, emoji) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/emojis`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    palabra_clave: palabra,
                    emoji: emoji
                })
            }
        );

        return await response.json();

    },


    async obtenerGuarniciones() {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/guarniciones`,

            {
                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },


    async crearGuarnicion(nombre) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/guarniciones`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nombre
                })
            }
        );

        return await response.json();

    },


    async guardarSemana(payload) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/guardar`,
            {
                method: 'POST',

                headers: headersPlanner({
                    'Content-Type': 'application/json'
                }),

                body: JSON.stringify(payload)
            }
        );


        const resultado =
            await response.json();


        if (!response.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${response.status}`
            );

        }


        return resultado;

    },

    async obtenerSemanasDisponibles(meses = 3) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/semanas-disponibles?meses=${meses}`,


            {
                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },




    async publicarSemana(semanaId) {

        const response = await fetch(

            "/api/planner/publicar",

            {
                method: "POST",

                headers: headersPlanner({
                    "Content-Type": "application/json"
                }),

                body: JSON.stringify({
                    semanaId
                })
            }

        );


        const resultado =
            await response.json();


        if (!response.ok) {

            throw new Error(
                resultado.message ||
                `Error HTTP ${response.status}`
            );

        }


        return resultado;

    },




    async generarWhatsApp(semanaId, sucursalId) {

        const response = await fetch(
          `${CONFIG.API_BASE_URL}/planner/generar-whatsapp?semanaId=${semanaId}&sucursalId=${sucursalId}`,


            {
                headers:
                    headersPlanner()
            }

        );

        return await response.json();

    },



    async obtenerSucursales() {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/sucursales`
        );

        if (!response.ok) {
            throw new Error(
                `Error HTTP al obtener sucursales: ${response.status}`
            );
        }

        return await response.json();
    },



    async obtenerSucursalesPlanificadas(semanaId) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/planner/semana/${semanaId}/sucursales`,


            {
                headers:
                    headersPlanner()
            }


        );

        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }

        return await response.json();

    },


    async obtenerPlantillas() {

        try {

            const response = await fetch(
                `${CONFIG.API_BASE_URL}/planner/plantillas`,

                {
                    headers:
                        headersPlanner()
                }


            );

            if (!response.ok) {

                throw new Error(
                    `Error HTTP: ${response.status}`
                );

            }

            return await response.json();

        } catch (error) {

            console.error(
                "Error obteniendo plantillas:",
                error
            );

            return {
                success: false,
                data: [],
                message: error.message
            };

        }

    },


    async obtenerPlantillasAdmin() {

        try {

            const response =
                await fetch(
                    `${CONFIG.API_BASE_URL}/planner/plantillas/admin`,
                     {
                        headers:
                            headersPlanner()
                    }


                   
                );


            const resultado =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    "Error obteniendo plantillas."
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error obteniendo plantillas del administrador:",
                error
            );


            return {
                success: false,
                data: [],
                message: error.message
            };

        }

    },



    async actualizarConfiguracionPlantilla(
        plantillaId,
        configuracion,
        activa
    ) {

        try {

            const response = await fetch(
                `${CONFIG.API_BASE_URL}/planner/plantillas/${plantillaId}/configuracion`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        configuracion,
                        activa
                    })
                }
            );


            const resultado =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    resultado.message ||
                    "Error actualizando plantilla."
                );

            }


            return resultado;


        } catch (error) {

            console.error(
                "Error actualizando configuración:",
                error
            );

            return {
                success: false,
                message: error.message
            };

        }

    },




};