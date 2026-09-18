package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.local.funciones.Funcion;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FuncionService {
    
    Funcion crearFuncion(Funcion funcion);
    
    Optional<Funcion> obtenerFuncionPorId(String id);
    
    List<Funcion> obtenerTodasLasFunciones();
    
    List<Funcion> obtenerFuncionesPorSala(String salaId);
    
    List<Funcion> obtenerFuncionesPorPelicula(String peliculaId);
    
    List<Funcion> obtenerFuncionesPorSede(String sedeId);
    
    List<Funcion> obtenerFuncionesEntreFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    Funcion actualizarFuncion(String id, Funcion funcion);
    
    void eliminarFuncion(String id);

    void reservarSilla(String funcionId, String sillaId, String compraId);

    void liberarSilla(String funcionId, String sillaId);
}
