package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.usuarios.BoletaRegalo;
import co.edu.udistrital.cinepacho.model.central.usuarios.Puntos;
import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import co.edu.udistrital.cinepacho.repository.central.UsuariosRepository;
import co.edu.udistrital.cinepacho.service.PuntosService;
import co.edu.udistrital.cinepacho.service.UsuariosService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

import java.util.Optional;

//Flujo: Puntos -> PuntosServiceImpl -> UsuariosService -> UsuariosRepository.
//Uso minimo: sumar, restar y consultar puntos sin duplicacion de logica de negocio.

@Service
public class PuntosServiceImpl implements PuntosService {
    private static final int PUNTOS_REQUERIDOS_CANJE = 100;

    private final UsuariosRepository usuariosRepository;
    private final UsuariosService usuariosService;

    public PuntosServiceImpl(UsuariosRepository usuariosRepository, UsuariosService usuariosService) {
        this.usuariosRepository = usuariosRepository;
        this.usuariosService = usuariosService;
    }

    // Inicializa o reemplaza la bolsa de puntos de un usuario.
    @Override
    public Puntos crearPuntos(String usuarioId, Puntos puntos) {
        Usuarios usuario = obtenerUsuarioRequerido(usuarioId);
        usuario.setPuntos(puntos != null ? puntos : new Puntos());
        Usuarios saved = usuariosRepository.save(usuario);
        return saved.getPuntos();
    }

    // Obtiene los puntos actuales de un usuario.
    @Override
    public Optional<Puntos> obtenerPuntosPorUsuario(String usuarioId) {
        Usuarios usuario = usuariosRepository.findById(usuarioId).orElse(null);
        return usuario != null ? Optional.ofNullable(usuario.getPuntos()) : Optional.empty();
    }

    // Agrega puntos al usuario y delega la suma real a UsuariosService.
    @Override
    public Puntos agregarPuntos(String usuarioId, int cantidad, String concepto) {
        usuariosService.registrarPuntos(usuarioId, cantidad, null);
        return asegurarPuntos(obtenerUsuarioRequerido(usuarioId));
    }

    // Resta puntos usando la misma logica que la suma
    @Override
    public Puntos restarPuntos(String usuarioId, int cantidad, String concepto) {
        usuariosService.registrarPuntos(usuarioId, -Math.abs(cantidad), null);
        return asegurarPuntos(obtenerUsuarioRequerido(usuarioId));
    }

    // Reemplaza el objeto puntos asociado al usuario.
    @Override
    public Puntos actualizarPuntos(String usuarioId, Puntos puntos) {
        Usuarios usuario = obtenerUsuarioRequerido(usuarioId);
        usuario.setPuntos(puntos);
        usuariosRepository.save(usuario);
        return puntos;
    }

    // Reinicia la bolsa de puntos del usuario.
    @Override
    public void eliminarPuntos(String usuarioId) {
        Usuarios usuario = obtenerUsuarioRequerido(usuarioId);
        usuario.setPuntos(new Puntos());
        usuariosRepository.save(usuario);
    }

    // Devuelve el saldo total actual.
    @Override
    public int obtenerSaldoPuntos(String usuarioId) {
        Usuarios usuario = usuariosRepository.findById(usuarioId).orElse(null);
        if (usuario == null || usuario.getPuntos() == null)
            return 0;
        return usuario.getPuntos().getTotal();
    }

    // Verifica si el usuario alcanza el minimo requerido para canjear.
    @Override
    public boolean tienePuntosParaCanjeo(String usuarioId) {
        return obtenerSaldoPuntos(usuarioId) >= PUNTOS_REQUERIDOS_CANJE;
    }

    // Ejecuta el canjeo de puntos descontando el valor requerido.
    @Override
    public Puntos canjearPuntos(String usuarioId) {
        if (!tienePuntosParaCanjeo(usuarioId)) {
            throw new IllegalArgumentException(
                    "El usuario no tiene " + PUNTOS_REQUERIDOS_CANJE + " puntos para canjear");
        }
        usuariosService.registrarPuntos(usuarioId, -PUNTOS_REQUERIDOS_CANJE, null);
        return asegurarPuntos(obtenerUsuarioRequerido(usuarioId));
    }

    @Override
    public List<BoletaRegalo> obtenerBoletasDisponibles(String usuarioId) {
        Usuarios usuario = obtenerUsuarioRequerido(usuarioId);
        if (usuario.getPuntos() == null || usuario.getPuntos().getBoletasRegalo() == null) {
            return new ArrayList<>();
        }

        LocalDateTime ahora = LocalDateTime.now();
        return usuario.getPuntos().getBoletasRegalo().stream()
            .filter(b -> !b.isUsada() && b.getExpira() != null && b.getExpira().isAfter(ahora))
            .toList();
    }

    private Usuarios obtenerUsuarioRequerido(String usuarioId) {
        return usuariosRepository.findById(usuarioId)
            .orElseThrow(() -> new IllegalArgumentException("Usuario con id " + usuarioId + " no encontrado"));
    }

    private Puntos asegurarPuntos(Usuarios usuario) {
        if (usuario.getPuntos() == null) {
            usuario.setPuntos(new Puntos());
        }
        return usuario.getPuntos();
    }
}
