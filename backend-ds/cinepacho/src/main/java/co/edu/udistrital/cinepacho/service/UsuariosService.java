package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import java.util.List;
import java.util.Optional;

public interface UsuariosService {
    
    Usuarios crearUsuario(Usuarios usuario);
    
    Optional<Usuarios> obtenerUsuarioPorId(String id);
    
    List<Usuarios> obtenerTodosLosUsuarios();
    
    Optional<Usuarios> obtenerUsuarioPorEmail(String email);
    
    Usuarios actualizarUsuario(String id, Usuarios usuario);
    
    void eliminarUsuario(String id);
    
    boolean validarEmail(String email);
    
    boolean registrarPuntos(String usuarioId, int puntos, String compraId);
}
