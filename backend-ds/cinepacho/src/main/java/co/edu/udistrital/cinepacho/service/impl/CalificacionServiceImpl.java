package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.usuarios.Calificacion;
import co.edu.udistrital.cinepacho.repository.central.CalificacionesRepository;
import co.edu.udistrital.cinepacho.service.CalificacionService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class CalificacionServiceImpl implements CalificacionService {

    private static final int PUNTUACION_MINIMA = 1;
    private static final int PUNTUACION_MAXIMA = 5;

    private final CalificacionesRepository calificacionesRepository;

    public CalificacionServiceImpl(CalificacionesRepository calificacionesRepository) {
        this.calificacionesRepository = calificacionesRepository;
    }

    @Override
    @CacheEvict(value = "calificacionesPromedio", key = "#calificacion.referenciaId", condition = "#calificacion != null && #calificacion.tipo == 'pelicula'")
    public Calificacion crearCalificacion(Calificacion calificacion) {
        validarPuntuacion(calificacion.getPuntuacion());
        
        if (calificacion.getReferenciaId() == null || calificacion.getReferenciaId().isBlank()) {
            throw new IllegalArgumentException("referenciaId es requerido");
        }
        if (calificacion.getTipo() == null || calificacion.getTipo().isBlank()) {
            throw new IllegalArgumentException("tipo es requerido");
        }
        if (calificacion.getUsuarioId() == null || calificacion.getUsuarioId().isBlank()) {
            throw new IllegalArgumentException("usuarioId es requerido");
        }
        
        if (calificacion.getFecha() == null) {
            calificacion.setFecha(LocalDateTime.now());
        }
        
        log.info("Creando calificación para usuario {} - {} (tipo: {}): {}", 
            calificacion.getUsuarioId(), calificacion.getReferenciaId(), 
            calificacion.getTipo(), calificacion.getPuntuacion());
        
        return calificacionesRepository.save(calificacion);
    }

    @Override
    public Optional<Calificacion> obtenerCalificacionPorId(String id) {
        return calificacionesRepository.findById(id);
    }

    @Override
    public List<Calificacion> obtenerTodasLasCalificaciones() {
        return calificacionesRepository.findAll();
    }

    @Override
    public List<Calificacion> obtenerCalificacionesPorUsuario(String usuarioId) {
        if (usuarioId == null || usuarioId.isBlank()) {
            return List.of();
        }
        // ✅ CORREGIDO: usar findByUsuarioId
        return calificacionesRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public List<Calificacion> obtenerCalificacionesPorPelicula(String peliculaId) {
        if (peliculaId == null || peliculaId.isBlank()) {
            return List.of();
        }
        return calificacionesRepository.findByTipoAndReferenciaId("pelicula", peliculaId);
    }

    @Override
    public List<Calificacion> obtenerCalificacionesPorSede(String sedeId) {
        if (sedeId == null || sedeId.isBlank()) {
            return List.of();
        }
        return calificacionesRepository.findByTipoAndReferenciaId("servicio", sedeId);
    }

    @Override
    @CacheEvict(value = "calificacionesPromedio", key = "#calificacion.referenciaId", condition = "#calificacion != null && #calificacion.tipo == 'pelicula'")
    public Calificacion actualizarCalificacion(String id, Calificacion calificacion) {
        if (obtenerCalificacionPorId(id).isEmpty()) {
            throw new IllegalArgumentException("Calificacion con ID " + id + " no encontrada");
        }
        validarPuntuacion(calificacion.getPuntuacion());
        calificacion.setId(id);
        log.info("Actualizando calificación {}: nueva puntuación {}", id, calificacion.getPuntuacion());
        return calificacionesRepository.save(calificacion);
    }

    @Override
    @CacheEvict(value = "calificacionesPromedio", allEntries = true)
    public void eliminarCalificacion(String id) {
        if (obtenerCalificacionPorId(id).isEmpty()) {
            throw new IllegalArgumentException("Calificacion con ID " + id + " no encontrada");
        }
        calificacionesRepository.deleteById(id);
    }

    @Override
    @Cacheable(value = "calificacionesPromedio", key = "#peliculaId", unless = "#result == 0.0")
    public double obtenerPromedioCalificaciones(String peliculaId) {
        List<Calificacion> calificacionesPelicula = obtenerCalificacionesPorPelicula(peliculaId);
        if (calificacionesPelicula.isEmpty()) {
            return 0.0;
        }
        double promedio = calificacionesPelicula.stream()
            .mapToDouble(Calificacion::getPuntuacion)
            .average()
            .orElse(0.0);
        log.debug("Promedio calificaciones para película {}: {} (total: {})", peliculaId, promedio, calificacionesPelicula.size());
        return promedio;
    }

    private void validarPuntuacion(int puntuacion) {
        if (puntuacion < PUNTUACION_MINIMA || puntuacion > PUNTUACION_MAXIMA) {
            throw new IllegalArgumentException(
                String.format("La puntuación debe estar entre %d y %d. Recibido: %d", 
                    PUNTUACION_MINIMA, PUNTUACION_MAXIMA, puntuacion)
            );
        }
    }
}