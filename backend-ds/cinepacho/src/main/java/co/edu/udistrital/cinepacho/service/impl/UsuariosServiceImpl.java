package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.usuarios.BoletaRegalo;
import co.edu.udistrital.cinepacho.model.central.usuarios.Puntos;
import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import co.edu.udistrital.cinepacho.repository.central.UsuariosRepository;
import co.edu.udistrital.cinepacho.service.HistorialPuntosService;
import co.edu.udistrital.cinepacho.service.UsuariosService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

//Flujo de uso: Usuarios -> UsuariosServiceImpl -> UsuariosRepository -> HistorialPuntosService -> BoletaRegalo.
//Uso minimo: crear/actualizar usuario, registrarPuntos y consultar saldo o boletas.

@Service
@Transactional
public class UsuariosServiceImpl implements UsuariosService {

    private static final String CORPORATE_EMAIL_DOMAIN = "@cinepacho.com";

    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    private static final int PUNTOS_PARA_BOLETA_GRATIS = 100;
    private static final int MESES_VALIDEZ_BOLETA = 6;

    private final UsuariosRepository usuariosRepository;
    private final HistorialPuntosService historialPuntosService;

    public UsuariosServiceImpl(UsuariosRepository usuariosRepository, HistorialPuntosService historialPuntosService) {
        this.usuariosRepository = usuariosRepository;
        this.historialPuntosService = historialPuntosService;
    }

    //Crea un usuario nuevo validando email, cedula y unicidad de datos base.
    @Override
    public Usuarios crearUsuario(Usuarios usuario) {
        if (!validarEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("Email invalido: " + usuario.getEmail());
        }
        if (!esCorreoCorporativo(usuario.getEmail())) {
            throw new IllegalArgumentException("El correo debe terminar en @cinepacho.com");
        }
        if (usuario.getCedula() == null || usuario.getCedula().isBlank()) {
            throw new IllegalArgumentException("La cedula es requerida");
        }
        if (usuariosRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email ya registrado: " + usuario.getEmail());
        }
        if (usuariosRepository.findByCedula(usuario.getCedula()).isPresent()) {
            throw new IllegalArgumentException("Cedula ya registrada: " + usuario.getCedula());
        }

        inicializarPuntosSiFaltan(usuario);
        return usuariosRepository.save(usuario);
    }

    //Busca un usuario por id.
    @Override
    public Optional<Usuarios> obtenerUsuarioPorId(String id) {
        return usuariosRepository.findById(id);
    }

    //Retorna todos los usuarios registrados.
    @Override
    public List<Usuarios> obtenerTodosLosUsuarios() {
        return usuariosRepository.findAll();
    }

    //Busca un usuario por email.
    @Override
    public Optional<Usuarios> obtenerUsuarioPorEmail(String email) {
        return usuariosRepository.findByEmail(email);
    }

    //Actualiza el usuario existente conservando las validaciones de email y cedula.
    @Override
    public Usuarios actualizarUsuario(String id, Usuarios usuario) {
        Usuarios actual = obtenerUsuarioRequerido(id);
        if (usuario.getEmail() != null && !usuario.getEmail().equals(actual.getEmail())) {
            if (!validarEmail(usuario.getEmail())) {
                throw new IllegalArgumentException("Email invalido: " + usuario.getEmail());
            }
            if (usuariosRepository.findByEmail(usuario.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email ya registrado: " + usuario.getEmail());
            }
        }
        if (usuario.getCedula() != null && !usuario.getCedula().equals(actual.getCedula())) {
            if (usuariosRepository.findByCedula(usuario.getCedula()).isPresent()) {
                throw new IllegalArgumentException("Cedula ya registrada: " + usuario.getCedula());
            }
        }

        if (usuario.getCedula() != null) actual.setCedula(usuario.getCedula());
        if (usuario.getNombre() != null) actual.setNombre(usuario.getNombre());
        if (usuario.getApellido() != null) actual.setApellido(usuario.getApellido());
        if (usuario.getEmail() != null) actual.setEmail(usuario.getEmail());
        if (usuario.getTelefono() != null) actual.setTelefono(usuario.getTelefono());
        if (usuario.getDireccion() != null) actual.setDireccion(usuario.getDireccion());
        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) actual.setContrasena(usuario.getContrasena());
        if (usuario.getRol() != null) actual.setRol(usuario.getRol());
        if (usuario.getPuntos() != null) {
            actual.setPuntos(usuario.getPuntos());
        }
        if (usuario.getCalificaciones() != null) {
            actual.setCalificaciones(usuario.getCalificaciones());
        }
        return usuariosRepository.save(actual);
    }

    //Elimina el usuario si existe.
    @Override
    public void eliminarUsuario(String id) {
        if (!usuariosRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario con id " + id + " no encontrado");
        }
        usuariosRepository.deleteById(id);
    }

    //Valida el formato del correo usando la expresion regular definida.
    @Override
    public boolean validarEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    private boolean esCorreoCorporativo(String email) {
        return email != null && email.trim().toLowerCase().endsWith(CORPORATE_EMAIL_DOMAIN);
    }

    //Suma puntos al usuario y, al alcanzar el umbral, genera una boleta gratis.
    public boolean registrarPuntos(String usuarioId, int puntos, String compraId) {
        Usuarios usuario = obtenerUsuarioRequerido(usuarioId);
        Puntos puntosUsuario = inicializarPuntosSiFaltan(usuario);

        int puntosNuevos = puntosUsuario.getTotal() + puntos;
        puntosUsuario.setTotal(puntosNuevos);

        boolean generoBoleta = false;
        if (puntosUsuario.getTotal() >= PUNTOS_PARA_BOLETA_GRATIS) {
            generarBoletaGratis(usuario);
            puntosUsuario.setTotal(puntosUsuario.getTotal() - PUNTOS_PARA_BOLETA_GRATIS);
            historialPuntosService.registrarCanjeBoletaPoints(
                usuarioId,
                PUNTOS_PARA_BOLETA_GRATIS,
                "Boleta de cine gratis generada automaticamente"
            );
            generoBoleta = true;
        }

        usuariosRepository.save(usuario);
        return generoBoleta;
    }

    //Sobrecarga de conveniencia para registrar puntos sin compra asociada.
    public boolean registrarPuntos(String usuarioId, int puntos) {
        return registrarPuntos(usuarioId, puntos, null);
    }
    //Agrega una boleta regalo nueva al listado del usuario con vencimiento futuro.
    private void generarBoletaGratis(Usuarios usuario) {
        Puntos puntosUsuario = inicializarPuntosSiFaltan(usuario);
        if (puntosUsuario.getBoletasRegalo() == null) {
            puntosUsuario.setBoletasRegalo(new ArrayList<>());
        }

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime expiracion = ahora.plusMonths(MESES_VALIDEZ_BOLETA);

        BoletaRegalo boleta = BoletaRegalo.builder()
            .generada(ahora)
            .expira(expiracion)
            .usada(false)
            .peliculaId(null)
            .build();

        puntosUsuario.getBoletasRegalo().add(boleta);
    }

    private Usuarios obtenerUsuarioRequerido(String id) {
        return usuariosRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuario con ID " + id + " no encontrado"));
    }

    private Puntos inicializarPuntosSiFaltan(Usuarios usuario) {
        if (usuario.getPuntos() == null) {
            usuario.setPuntos(new Puntos());
        }
        return usuario.getPuntos();
    }
}
