package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.local.salas.Sala;
import java.util.List;
import java.util.Optional;

public interface SalaService {
    
    Sala crearSala(Sala sala);
    
    Optional<Sala> obtenerSalaPorId(String id);
    
    List<Sala> obtenerTodasLasSalas();
    
    List<Sala> obtenerSalasPorSede(String sedeId);
    
    Sala actualizarSala(String id, Sala sala);
    
    void eliminarSala(String id);
}