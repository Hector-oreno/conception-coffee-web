const PlannerWorkspace = {


    iniciar() {

    },

    

    async editarPlanificacionSemanal(semanaId) {

        
         try {

            // ==========================================
            // ASEGURAR SUCURSAL ACTIVA
            // ==========================================

            if (!Planner.sucursalActualId) {

                await Planner.cargarSucursales();

            }

            if (!Planner.sucursalActualId) {

                alert(
                    "No hay ninguna sucursal activa disponible."
                );

                return;

            }

            // ==========================================
            // OBTENER GRILLA DE LA SUCURSAL
            // ==========================================

            const result =
                await PlannerAPI.obtenerGrilla(
                    semanaId,
                    Planner.sucursalActualId
                );
                
         
                
                if (result.success) {
                
                Planner.abrirPlanner(result.data);

            } else {
                alert('No se pudo cargar la grilla de esta semana.');
            }
            } catch (error) {
            console.error('Error al obtener la grilla operativa:', error);
        }



    }

};

window.PlannerWorkspace = PlannerWorkspace;