package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.model.local.Inventario;
import co.edu.udistrital.cinepacho.router.SedeMongoRouter;
import co.edu.udistrital.cinepacho.service.InventarioService;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class InventarioServiceImpl implements InventarioService {

    private record InventarioUbicacion(String sedeId, Inventario inventario) {
    }

    private final SedesRepository sedesRepository;
    private final SedeMongoRouter sedeMongoRouter;

    public InventarioServiceImpl(SedesRepository sedesRepository, SedeMongoRouter sedeMongoRouter) {
        this.sedesRepository = sedesRepository;
        this.sedeMongoRouter = sedeMongoRouter;
    }

    // ========== Métodos privados auxiliares ==========
    private Sede buscarSedePorId(String sedeId) {
        return sedesRepository.findById(sedeId).orElse(null);
    }

    private MongoTemplate getLocalTemplateForSede(Sede sede) {
        if (sede == null) {
            throw new IllegalArgumentException("Sede no encontrada");
        }
        String routerKey = sede.getRouterKey();
        if (routerKey == null || routerKey.isBlank()) {
            routerKey = sede.getId();
        }
        return sedeMongoRouter.getTemplate(routerKey);
    }

    private MongoTemplate getLocalTemplateBySedeId(String sedeId) {
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null) {
            throw new IllegalArgumentException("Sede no encontrada: " + sedeId);
        }
        return getLocalTemplateForSede(sede);
    }

    private Optional<InventarioUbicacion> buscarInventarioEnTodasLasSedes(String id) {
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            try {
                MongoTemplate localTemplate = getLocalTemplateForSede(sede);
                Inventario inventario = localTemplate.findById(id, Inventario.class, "inventarios");
                if (inventario != null) {
                    return Optional.of(new InventarioUbicacion(sede.getId(), inventario));
                }
            } catch (Exception e) {
                log.warn("Error buscando inventario {} en sede {}: {}", id, sede.getId(), e.getMessage());
            }
        }
        return Optional.empty();
    }

    private Optional<Inventario> buscarInventarioPorIdEnTodasLasSedes(String id) {
        return buscarInventarioEnTodasLasSedes(id).map(InventarioUbicacion::inventario);
    }

    // ========== Implementación de métodos de la interfaz ==========

    @Override
    public Inventario crearInventario(Inventario inventario) {
        log.info("Creando inventario: {} en sede: {}", inventario.getNombre(), inventario.getSedeId());
        if (inventario.getCantidad() < 0) {
            inventario.setCantidad(0);
        }
        MongoTemplate localTemplate = getLocalTemplateBySedeId(inventario.getSedeId());
        log.info("GUARDANDO en BD: {}, colección: inventarios", localTemplate.getDb().getName());
        Inventario saved = localTemplate.save(inventario, "inventarios");
        log.info("GUARDADO completo, id: {}", saved.getId());
        return saved;
    }

    @Override
    public Optional<Inventario> obtenerInventarioPorId(String id) {
        return buscarInventarioPorIdEnTodasLasSedes(id);
    }

    @Override
    public Optional<Inventario> obtenerInventarioPorId(String id, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario inventario = localTemplate.findById(id, Inventario.class, "inventarios");
        return Optional.ofNullable(inventario);
    }

    @Override
    public List<Inventario> obtenerTodosLosInventarios() {
        List<Inventario> inventarios = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            try {
                MongoTemplate localTemplate = getLocalTemplateForSede(sede);
                inventarios.addAll(localTemplate.findAll(Inventario.class, "inventarios"));
            } catch (Exception e) {
                log.warn("Error listando inventarios en sede {}: {}", sede.getId(), e.getMessage());
            }
        }
        return inventarios;
    }

    @Override
    public List<Inventario> obtenerInventariosPorSede(String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        log.info("CONSULTANDO en BD: {}, colección: inventarios", localTemplate.getDb().getName());
        List<Inventario> inventarios = localTemplate.findAll(Inventario.class, "inventarios");
        inventarios.forEach(item -> {
            if (item.getSedeId() == null || item.getSedeId().isBlank()) {
                item.setSedeId(sedeId);
            }
        });
        log.info("RESULTADOS: {} documentos encontrados", inventarios.size());
        for (Inventario inv : inventarios) {
            log.info("  - id: {}, nombre: {}", inv.getId(), inv.getNombre());
        }
        return inventarios;
    }

    @Override
    public Inventario actualizarInventario(String id, Inventario inventario) {
        Optional<InventarioUbicacion> existenteOpt = buscarInventarioEnTodasLasSedes(id);
        if (!existenteOpt.isPresent()) {
            throw new IllegalArgumentException("Inventario con ID " + id + " no encontrado");
        }
        InventarioUbicacion existente = existenteOpt.get();
        String sedeId = existente.sedeId();
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        inventario.setId(id);
        inventario.setSedeId(sedeId);
        return localTemplate.save(inventario, "inventarios");
    }

    @Override
    public void eliminarInventario(String id) {
        Optional<InventarioUbicacion> existenteOpt = buscarInventarioEnTodasLasSedes(id);
        if (!existenteOpt.isPresent()) {
            throw new IllegalArgumentException("Inventario con ID " + id + " no encontrado");
        }
        InventarioUbicacion inventarioUbicacion = existenteOpt.get();
        MongoTemplate localTemplate = getLocalTemplateBySedeId(inventarioUbicacion.sedeId());
        localTemplate.remove(
                Query.query(Criteria.where("id").is(id)),
                Inventario.class,
                "inventarios");
    }

    @Override
    public void eliminarInventario(String id, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario existente = localTemplate.findById(id, Inventario.class, "inventarios");
        if (existente == null) {
            throw new IllegalArgumentException("Inventario con ID " + id + " no encontrado en sede " + sedeId);
        }
        localTemplate.remove(Query.query(Criteria.where("id").is(id)), Inventario.class, "inventarios");
    }

    @Override
    public void actualizarStock(String inventarioId, int cantidad) {
        throw new UnsupportedOperationException("Use actualizarStock(id, cantidad, sedeId) en su lugar");
    }

    @Override
    public void actualizarStock(String inventarioId, int cantidad, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario inventario = localTemplate.findById(inventarioId, Inventario.class, "inventarios");
        if (inventario == null) {
            throw new IllegalArgumentException(
                    "Inventario con id " + inventarioId + " no encontrado en sede " + sedeId);
        }
        inventario.setCantidad(inventario.getCantidad() + cantidad);
        localTemplate.save(inventario, "inventarios");
    }

    @Override
    public boolean verificarDisponibilidad(String inventarioId, int cantidadRequerida) {
        throw new UnsupportedOperationException("Use verificarDisponibilidad(id, cantidad, sedeId) en su lugar");
    }

    @Override
    public boolean verificarDisponibilidad(String inventarioId, int cantidadRequerida, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario inventario = localTemplate.findById(inventarioId, Inventario.class, "inventarios");
        if (inventario == null) {
            throw new IllegalArgumentException("Inventario con id " + inventarioId + " no encontrado");
        }
        return inventario.getDisponible() >= cantidadRequerida;
    }

    @Override
    public boolean reservarSnack(String inventarioId, int cantidad, String compraId) {
        throw new UnsupportedOperationException("Use reservarSnack(id, cantidad, compraId, sedeId) en su lugar");
    }

    @Override
    public boolean reservarSnack(String inventarioId, int cantidad, String compraId, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario inventario = localTemplate.findById(inventarioId, Inventario.class, "inventarios");
        if (inventario == null) {
            throw new IllegalArgumentException("Inventario con id " + inventarioId + " no encontrado");
        }
        int disponible = inventario.getDisponible();
        if (disponible < cantidad) {
            return false;
        }
        inventario.getReservas().add(new Inventario.Reserva(compraId, cantidad, LocalDateTime.now()));
        localTemplate.save(inventario, "inventarios");
        return true;
    }

    @Override
    public void disminuirSnack(String inventarioId, int cantidad, String compraId) {
        throw new UnsupportedOperationException("Use disminuirSnack(id, cantidad, compraId, sedeId) en su lugar");
    }

    @Override
    public void disminuirSnack(String inventarioId, int cantidad, String compraId, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario inventario = localTemplate.findById(inventarioId, Inventario.class, "inventarios");
        if (inventario == null) {
            throw new IllegalArgumentException("Inventario con id " + inventarioId + " no encontrado");
        }
        int remaining = cantidad;
        var reservas = inventario.getReservas();
        for (int i = reservas.size() - 1; i >= 0 && remaining > 0; i--) {
            var r = reservas.get(i);
            if (compraId.equals(r.getCompraId())) {
                int use = Math.min(r.getCantidad(), remaining);
                r.setCantidad(r.getCantidad() - use);
                remaining -= use;
                if (r.getCantidad() == 0) {
                    reservas.remove(i);
                }
            }
        }
        if (remaining > 0) {
            throw new IllegalStateException("No hay suficientes snacks reservados para la compra " + compraId);
        }
        inventario.setCantidad(inventario.getCantidad() - cantidad);
        localTemplate.save(inventario, "inventarios");
    }

    @Override
    public void liberarSnack(String inventarioId, int cantidad, String compraId) {
        throw new UnsupportedOperationException("Use liberarSnack(id, cantidad, compraId, sedeId) en su lugar");
    }

    @Override
    public void liberarSnack(String inventarioId, int cantidad, String compraId, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario inventario = localTemplate.findById(inventarioId, Inventario.class, "inventarios");
        if (inventario == null) {
            throw new IllegalArgumentException("Inventario con id " + inventarioId + " no encontrado");
        }
        int remaining = cantidad;
        var reservas = inventario.getReservas();
        for (int i = reservas.size() - 1; i >= 0 && remaining > 0; i--) {
            var r = reservas.get(i);
            if (compraId.equals(r.getCompraId())) {
                int use = Math.min(r.getCantidad(), remaining);
                r.setCantidad(r.getCantidad() - use);
                remaining -= use;
                if (r.getCantidad() == 0) {
                    reservas.remove(i);
                }
            }
        }
        if (remaining > 0) {
            throw new IllegalStateException("No hay suficientes snacks reservados para liberar");
        }
        localTemplate.save(inventario, "inventarios");
    }

    @Override
    public int obtenerDisponibleReal(String inventarioId) {
        return buscarInventarioEnTodasLasSedes(inventarioId)
            .map(InventarioUbicacion::inventario)
                .map(Inventario::getDisponible)
                .orElseThrow(
                        () -> new IllegalArgumentException("Inventario con id " + inventarioId + " no encontrado"));
    }

    @Override
    public int obtenerDisponibleReal(String inventarioId, String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        Inventario inventario = localTemplate.findById(inventarioId, Inventario.class, "inventarios");
        if (inventario == null) {
            throw new IllegalArgumentException("Inventario con id " + inventarioId + " no encontrado");
        }
        return inventario.getDisponible();
    }
}