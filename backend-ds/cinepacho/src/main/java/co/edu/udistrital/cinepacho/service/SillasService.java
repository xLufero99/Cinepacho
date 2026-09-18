package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.local.funciones.Sillas;
import java.util.List;
import java.util.Optional;

public interface SillasService {
    
    Sillas crearSilla(Sillas silla);
    
    Optional<Sillas> obtenerSillaPorId(String id);
    
    List<Sillas> obtenerSillasPorFuncion(String funcionId);
    
    List<Sillas> obtenerSillasDisponibles(String funcionId);
    
    List<Sillas> obtenerSillasOcupadas(String funcionId);
    
    Sillas actualizarSilla(String id, Sillas silla);
    
    void eliminarSilla(String id);
    
    void reservarSilla(String sillaId);
    
    void liberarSilla(String sillaId);
}
