package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.central.usuarios.Calificacion;
import java.util.List;
import java.util.Optional;

public interface CalificacionService {
    
    Calificacion crearCalificacion(Calificacion calificacion);
    
    Optional<Calificacion> obtenerCalificacionPorId(String id);
    
    List<Calificacion> obtenerTodasLasCalificaciones();
    
    List<Calificacion> obtenerCalificacionesPorUsuario(String usuarioId);
    
    List<Calificacion> obtenerCalificacionesPorPelicula(String peliculaId);
    
    List<Calificacion> obtenerCalificacionesPorSede(String sedeId);
    
    Calificacion actualizarCalificacion(String id, Calificacion calificacion);
    
    void eliminarCalificacion(String id);
    
    double obtenerPromedioCalificaciones(String peliculaId);
}
