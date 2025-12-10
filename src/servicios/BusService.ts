  import { BusRepository } from "../repositorios/BusRepository";
  import { Bus } from "../modulos/Bus.entity";

  export class BusService {

      /**
       * [CRUD - Create] Guarda un bus nuevo.
       */
      static async saveBus(busData: Bus): Promise<Bus> {
          return BusRepository.save(busData);
      }
      
      /**
       * [CRUD - Update] Actualiza un bus por ID.
       */
      static async updateBus(id: number, busData: Bus): Promise<Bus | null> {
          const busToUpdate = await BusRepository.findById(id);
          
          if (!busToUpdate) return null;

          const updatedBus = { ...busToUpdate, ...busData, id }; 

          return BusRepository.save(updatedBus as Bus);
      }

      /**
       * [CRUD - Delete] Elimina un bus.
       */
      static async deleteBus(id: number): Promise<void> {
          await BusRepository.deleteById(id);
      }

      // ===========================================
      // FUNCIONES READ (LECTURA)
      // ===========================================

      /**
       * [READ - Admin] Obtiene TODOS los buses.
       */
      static async findAllBuses(): Promise<Bus[]> {
          return BusRepository.findAll();
      }

      /**
       * [READ - Público] Obtiene solo los buses ACTIVOS.
       */
      static async findActiveTrips(): Promise<Bus[]> {
          return BusRepository.findByEstadoActivoTrue();
      }

      /**
       * [READ - Público] Obtiene un bus por ID con filtro de fecha.
       * MODIFICADO: Acepta 'fechaViaje' para devolver solo los asientos ocupados de ESE día.
       */
      static async findBusById(id: number, fechaViaje?: string): Promise<Bus | null> {
          // 1. Obtenemos el bus completo del repositorio
          const bus = await BusRepository.findById(id);

          // 2. Si nos pasaron una fecha y el bus tiene asientos ocupados, FILTRAMOS.
          // Esto es vital para no mostrar ocupados los asientos de ayer o mañana.
          if (bus && bus.asientosOcupados && fechaViaje) {
              
              bus.asientosOcupados = bus.asientosOcupados.filter(asiento => {
                  // Convertimos la fecha de la BD a string YYYY-MM-DD para comparar
                  // Nota: asiento.fechaViaje suele ser un objeto Date en TypeORM
                  const fechaAsiento = new Date(asiento.fechaViaje);
                  const fechaAsientoStr = fechaAsiento.toISOString().split('T')[0];
                  
                  return fechaAsientoStr === fechaViaje;
              });
          }

          return bus;
      }
  }