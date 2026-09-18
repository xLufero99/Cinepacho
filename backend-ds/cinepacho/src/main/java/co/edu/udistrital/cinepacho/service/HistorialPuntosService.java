package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.central.usuarios.HistorialPuntos;
import java.util.List;
import java.util.Optional;

public interface HistorialPuntosService {

    HistorialPuntos registrarGananciaBoletaPoints(String usuarioId, int puntos, String compraId, String detalleMovieName);
    
    HistorialPuntos registrarGananciaSnackPoints(String usuarioId, int puntos, String compraId, String detalleProducto);
    
    HistorialPuntos registrarCanjeBoletaPoints(String usuarioId, int puntos, String detalleBoletaGratis);
    
    HistorialPuntos registrarReembolsoPoints(String usuarioId, int puntos, String compraId);
    
    List<HistorialPuntos> obtenerHistorialUsuario(String usuarioId);
    
    Optional<HistorialPuntos> obtenerPorId(String id);
    
    List<HistorialPuntos> obtenerHistorialPorTipo(String usuarioId, String tipo);
}
