package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.central.usuarios.BoletaRegalo;
import co.edu.udistrital.cinepacho.model.central.usuarios.Puntos;
import java.util.List;
import java.util.Optional;

public interface PuntosService {
    
    Puntos crearPuntos(String usuarioId, Puntos puntos);
    
    Optional<Puntos> obtenerPuntosPorUsuario(String usuarioId);
    
    Puntos agregarPuntos(String usuarioId, int cantidad, String concepto);
    
    Puntos restarPuntos(String usuarioId, int cantidad, String concepto);
    
    Puntos actualizarPuntos(String usuarioId, Puntos puntos);
    
    void eliminarPuntos(String usuarioId);
    
    int obtenerSaldoPuntos(String usuarioId);
    
    boolean tienePuntosParaCanjeo(String usuarioId);
    
    Puntos canjearPuntos(String usuarioId);

    List<BoletaRegalo> obtenerBoletasDisponibles(String usuarioId);
}
