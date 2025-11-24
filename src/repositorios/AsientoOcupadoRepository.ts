package com.adventurebus.repository;

import com.adventurebus.model.AsientoOcupado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AsientoOcupadoRepository extends JpaRepository<AsientoOcupado, Long> {

    /**
     * Elimina el registro de asiento ocupado asociado a una reserva cancelada.
     * Esto libera el asiento.
     */
    void deleteByReservaId(Long reservaId);

    /**
     * Obtiene todos los asientos ocupados para un bus y fecha específicos.
     * @return Lista de AsientoOcupado.
     */
    List<AsientoOcupado> findByBusIdAndFechaViaje(Long busId, LocalDate fechaViaje);
}