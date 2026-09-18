package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.usuarios.HistorialPuntos;
import co.edu.udistrital.cinepacho.model.central.usuarios.Puntos;
import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import co.edu.udistrital.cinepacho.repository.central.UsuariosRepository;
import co.edu.udistrital.cinepacho.service.HistorialPuntosService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.UUID;

//Flujo de uso: HistorialPuntos -> HistorialPuntosServiceImpl -> UsuariosRepository.
//Uso minimo: registrarGananciaBoletaPoints, registrarGananciaSnackPoints y consultas generales.

@Service
public class HistorialPuntosServiceImpl implements HistorialPuntosService {

    private final UsuariosRepository usuariosRepository;

    public HistorialPuntosServiceImpl(UsuariosRepository usuariosRepository) {
        this.usuariosRepository = usuariosRepository;
    }

    //Registro de ganancia de puntos por boletas compradas.
    @Override
    public HistorialPuntos registrarGananciaBoletaPoints(String usuarioId, int puntos, String compraId, String detalleMovieName) {
        return registrarEvento(usuarioId, puntos, "GANADA_BOLETA", 
            "Ganancia por compra de boleta: " + detalleMovieName, compraId);
    }

    //Registro de ganancia de puntos por snacks comprados.
    @Override
    public HistorialPuntos registrarGananciaSnackPoints(String usuarioId, int puntos, String compraId, String detalleProducto) {
        return registrarEvento(usuarioId, puntos, "GANADA_SNACK", 
            "Ganancia por compra de snack: " + detalleProducto, compraId);
    }

    //Registro de canjeo de puntos cuando se tramita una boleta gratis.
    @Override
    public HistorialPuntos registrarCanjeBoletaPoints(String usuarioId, int puntos, String detalleBoletaGratis) {
        return registrarEvento(usuarioId, -puntos, "CANJEADA_BOLETA", 
            "Canjeo de boleta gratis: " + detalleBoletaGratis, null);
    }

    //Registro de reembolso de puntos asociado a una compra.
    @Override
    public HistorialPuntos registrarReembolsoPoints(String usuarioId, int puntos, String compraId) {
        return registrarEvento(usuarioId, puntos, "REEMBOLSO", 
            "Reembolso por cancelacion de compra", compraId);
    }

    //Creacion del evento de historial, lo persiste y lo agrega al usuario.
    private HistorialPuntos registrarEvento(String usuarioId, int puntos, String tipo, String motivo, String compraId) {
        if (usuarioId == null || usuarioId.isBlank()) {
            throw new IllegalArgumentException("Usuario id es requerido");
        }

        Usuarios usuario = usuariosRepository.findById(usuarioId)
            .orElseThrow(() -> new IllegalArgumentException("Usuario con id " + usuarioId + " no encontrado"));

        HistorialPuntos evento = HistorialPuntos.builder()
            .id(UUID.randomUUID().toString())
            .fecha(LocalDateTime.now())
            .puntos(puntos)
            .tipo(tipo)
            .motivo(motivo)
            .compraId(compraId)
            .usuarioId(usuarioId)
            .build();

        if (usuario.getPuntos() == null) {
            usuario.setPuntos(new Puntos());
        }
        if (usuario.getPuntos().getHistorial() == null) {
            usuario.getPuntos().setHistorial(new ArrayList<>());
        }
        usuario.getPuntos().getHistorial().add(evento);
        usuariosRepository.save(usuario);

        return evento;
    }

    //Devuelve el historial de puntos de un usuario ordenado por fecha descendentemente.
    @Override
    public List<HistorialPuntos> obtenerHistorialUsuario(String usuarioId) {
        if (usuarioId == null || usuarioId.isBlank()) {
            throw new IllegalArgumentException("Usuario id es requerido");
        }
        Optional<Usuarios> opt = usuariosRepository.findById(usuarioId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Usuario con id " + usuarioId + " no encontrado");
        }
        Usuarios usuario = opt.get();
        if (usuario.getPuntos() == null || usuario.getPuntos().getHistorial() == null) {
            return new ArrayList<>();
        }
        return usuario.getPuntos().getHistorial().stream()
            .sorted(java.util.Comparator.comparing(HistorialPuntos::getFecha).reversed())
            .collect(java.util.stream.Collectors.toList());
    }

    //Busca un evento de historial por id.
    @Override
    public Optional<HistorialPuntos> obtenerPorId(String id) {
        // Buscar en todos los usuarios es costoso; asumimos que se consulta por usuario normalmente.
        // Aquí hacemos una búsqueda simple revisando todos los usuarios y sus historiales.
        for (Usuarios usuario : usuariosRepository.findAllBy()) {
            if (usuario.getPuntos() == null || usuario.getPuntos().getHistorial() == null) continue;
            for (HistorialPuntos evento : usuario.getPuntos().getHistorial()) {
                if (evento.getId() != null && evento.getId().equals(id)) {
                    return Optional.of(evento);
                }
            }
        }
        return Optional.empty();
    }

    //Filtra el historial por tipo de movimiento.
    @Override
    public List<HistorialPuntos> obtenerHistorialPorTipo(String usuarioId, String tipo) {
        if (usuarioId == null || usuarioId.isBlank()) {
            throw new IllegalArgumentException("Usuario id es requerido");
        }
        if (tipo == null || tipo.isBlank()) {
            throw new IllegalArgumentException("Tipo es requerido");
        }

        Optional<Usuarios> opt = usuariosRepository.findById(usuarioId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Usuario con id " + usuarioId + " no encontrado");
        }
        Usuarios usuario = opt.get();
        if (usuario.getPuntos() == null || usuario.getPuntos().getHistorial() == null) {
            return new ArrayList<>();
        }
        String tipoLower = tipo.toLowerCase();
        return usuario.getPuntos().getHistorial().stream()
            .filter(h -> h.getTipo() != null && h.getTipo().toLowerCase().equals(tipoLower))
            .sorted(java.util.Comparator.comparing(HistorialPuntos::getFecha).reversed())
            .collect(java.util.stream.Collectors.toList());
    }

    
}
