package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.exception.CompraNoEncontradaException;
import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import co.edu.udistrital.cinepacho.model.local.compras.ItemCompra;
import co.edu.udistrital.cinepacho.model.local.funciones.Funcion;
import co.edu.udistrital.cinepacho.service.CompraService;
import co.edu.udistrital.cinepacho.service.SedeService;
import com.mongodb.client.MongoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import co.edu.udistrital.cinepacho.repository.local.ComprasRepository;

@Slf4j
@Service
@Transactional
public class CompraServiceImpl implements CompraService {

    private static final int PUNTOS_POR_BOLETA = 10;
    private static final int PUNTOS_POR_SNACK = 5;
    private final ComprasRepository comprasRepository;
    private final MongoClient mongoClient;
    private final SedeService sedeService;

    @Autowired
    private co.edu.udistrital.cinepacho.service.FuncionService funcionService;

    @Autowired
    private co.edu.udistrital.cinepacho.service.InventarioService inventarioService;

    @Autowired
    private co.edu.udistrital.cinepacho.service.UsuariosService usuariosService;

    @Autowired
    private co.edu.udistrital.cinepacho.service.HistorialPuntosService historialPuntosService;

    @Autowired
    public CompraServiceImpl(ComprasRepository comprasRepository, MongoClient mongoClient, SedeService sedeService) {
        this.comprasRepository = comprasRepository;
        this.mongoClient = mongoClient;
        this.sedeService = sedeService;
    }

    @Override
    @Transactional
    public Compra crearCompra(Compra compra) {
        log.info("Creando compra para usuario: {} en sede: {}", compra.getUsuarioId(), compra.getSedeId());
        
        try {
            validarCompraBasica(compra);

            // Obtener la sede para conocer su BD local
            Sede sede = sedeService.obtenerSedePorId(compra.getSedeId())
                .orElseThrow(() -> new IllegalArgumentException("Sede no encontrada: " + compra.getSedeId()));

            List<ItemCompra> itemsValidados = validarYReservarItems(compra);

            if (itemsValidados.isEmpty()) {
                throw new IllegalArgumentException("La compra debe contener al menos un item");
            }

            compra.setFecha(LocalDateTime.now());
            compra.setEstado(Compra.EstadoCompra.RESERVADO);
            compra.setCompra(itemsValidados);

            calcularPuntosCompra(compra);
            calcularTotal(compra);

            // 1. GUARDAR EN BD CENTRAL (usando repository)
            Compra savedCentral = comprasRepository.save(compra);
            log.info("✅ Compra guardada en BD central: {}", savedCentral.getId());

            // 2. GUARDAR EN BD LOCAL DEL MULTIPLEX (usando MongoTemplate dinámico)
            MongoTemplate localTemplate = new MongoTemplate(mongoClient, sede.getBdNombre());
            Compra savedLocal = localTemplate.save(compra, "compras");
            log.info("✅ Compra guardada en BD local ({}): {}", sede.getBdNombre(), savedLocal.getId());

            // Reservar sillas y snacks
            for (ItemCompra item : itemsValidados) {
                if ("boleta".equalsIgnoreCase(item.getTipo())) {
                    funcionService.reservarSilla(item.getReferenciaId(), item.getSillaId(), savedCentral.getId());
                } else if ("snack".equalsIgnoreCase(item.getTipo())) {
                    inventarioService.reservarSnack(item.getReferenciaId(), item.getCantidad(), savedCentral.getId(), compra.getSedeId());
                }
            }
            
            log.info("Compra creada exitosamente: {} con total: ${}", savedCentral.getId(), savedCentral.getTotal());
            return savedCentral;
        } catch (Exception e) {
            log.error("Error al crear compra: {}", e.getMessage(), e);
            throw e;
        }
    }

    // ================== MÉTODOS PRIVADOS ==================
    
    private void validarCompraBasica(Compra compra) {
        if (compra.getSedeId() == null || compra.getSedeId().isEmpty()) {
            throw new IllegalArgumentException("La sede es requerida para crear una compra");
        }
        if (compra.getUsuarioId() == null || compra.getUsuarioId().isEmpty()) {
            throw new IllegalArgumentException("El usuario es requerido para crear una compra");
        }
        if (compra.getCompra() == null || compra.getCompra().isEmpty()) {
            throw new IllegalArgumentException("La compra debe contener al menos un item");
        }
    }

    private List<ItemCompra> validarYReservarItems(Compra compra) {
        List<ItemCompra> itemsReservados = new ArrayList<>();
        List<String> sillaReservadas = new ArrayList<>();
        
        try {
            for (ItemCompra item : compra.getCompra()) {
                if ("boleta".equalsIgnoreCase(item.getTipo())) {
                    validarYReservarBoleta(item, compra.getSedeId(), sillaReservadas);
                    itemsReservados.add(item);
                } else if ("snack".equalsIgnoreCase(item.getTipo())) {
                    validarYReservarSnack(item, compra.getSedeId());
                    itemsReservados.add(item);
                } else {
                    throw new IllegalArgumentException("Tipo de item invalido: " + item.getTipo());
                }
            }
        } catch (Exception e) {
            log.warn("Error validando items para compra, revalidando tras transaccion: {}", e.getMessage());
            throw e;
        }
        
        return itemsReservados;
    }

    private void validarYReservarBoleta(ItemCompra item, String sedeId, List<String> sillaReservadas) {
        if (item.getReferenciaId() == null || item.getReferenciaId().isBlank()) {
            throw new IllegalArgumentException("Referencia de funcion requerida para boleta");
        }
        if (item.getSillaId() == null || item.getSillaId().isBlank()) {
            throw new IllegalArgumentException("Id de silla requerida para boleta");
        }

        Optional<Funcion> funcionOpt = funcionService.obtenerFuncionPorId(item.getReferenciaId());
        if (!funcionOpt.isPresent()) {
            throw new IllegalArgumentException("Funcion " + item.getReferenciaId() + " no encontrada");
        }

        Funcion funcion = funcionOpt.get();

        boolean sillaDisponible = funcion.getSillas().getGeneral().stream()
            .filter(s -> s.getId().equals(item.getSillaId()) && s.isDisponible())
            .findAny()
            .isPresent();
        
        if (!sillaDisponible) {
            sillaDisponible = funcion.getSillas().getPreferencial().stream()
                .filter(s -> s.getId().equals(item.getSillaId()) && s.isDisponible())
                .findAny()
                .isPresent();
        }
        
        if (!sillaDisponible) {
            throw new IllegalArgumentException("Silla " + item.getSillaId() + " no disponible en funcion " + item.getReferenciaId());
        }

        String tipoSilla = item.getSillaId().substring(0, 1);
        double precioEsperado = "G".equals(tipoSilla) ? funcion.getPrecioGeneral() : funcion.getPrecioPreferencial();
        
        if (item.getPrecioUnitario() <= 0) {
            item.setPrecioUnitario(precioEsperado);
        }
        item.setSubtotal(item.getPrecioUnitario() * item.getCantidad());
        item.setDetalle("Boleta " + tipoSilla + " - Funcion " + item.getReferenciaId());
        
        sillaReservadas.add(item.getSillaId());
    }

    private void validarYReservarSnack(ItemCompra item, String sedeId) {
        if (item.getReferenciaId() == null || item.getReferenciaId().isBlank()) {
            throw new IllegalArgumentException("Referencia de inventario requerida para snack");
        }
        
        if (inventarioService == null) {
            throw new IllegalStateException("InventarioService no disponible");
        }

        // ✅ Verificar disponibilidad con sedeId
        if (!inventarioService.verificarDisponibilidad(item.getReferenciaId(), item.getCantidad(), sedeId)) {
            int disponible = inventarioService.obtenerDisponibleReal(item.getReferenciaId(), sedeId);
            throw new IllegalArgumentException("Stock insuficiente. Disponible: " + disponible);
        }

        // ✅ Obtener inventario con sedeId
        var inventOpt = inventarioService.obtenerInventarioPorId(item.getReferenciaId(), sedeId);
        if (inventOpt.isEmpty()) {
            throw new IllegalArgumentException("Inventario " + item.getReferenciaId() + " no encontrado");
        }

        item.setPrecioUnitario(inventOpt.get().getPrecio());
        item.setSubtotal(item.getPrecioUnitario() * item.getCantidad());
        item.setDetalle(inventOpt.get().getNombre());
    }

    private void calcularPuntosCompra(Compra compra) {
        int puntosBoletasLocal = 0;
        int puntosSnacksLocal = 0;
        
        if (compra.getCompra() != null) {
            for (var item : compra.getCompra()) {
                if ("boleta".equalsIgnoreCase(item.getTipo())) {
                    puntosBoletasLocal += PUNTOS_POR_BOLETA * item.getCantidad();
                } else if ("snack".equalsIgnoreCase(item.getTipo())) {
                    puntosSnacksLocal += PUNTOS_POR_SNACK * item.getCantidad();
                }
            }
        }
        
        compra.setPuntosBoletas(puntosBoletasLocal);
        compra.setPuntosSnacks(puntosSnacksLocal);
        compra.setPuntosTotal(puntosBoletasLocal + puntosSnacksLocal);
    }

    private void calcularTotal(Compra compra) {
        double total = 0;
        if (compra.getCompra() != null) {
            for (var item : compra.getCompra()) {
                total += item.getSubtotal();
            }
        }
        compra.setTotal(total);
    }

    // ================== MÉTODOS PÚBLICOS ==================

    @Override
    @Transactional(readOnly = true)
    public Optional<Compra> obtenerCompraPorId(String id) {
        return comprasRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Compra> obtenerTodasLasCompras() {
        return comprasRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Compra> obtenerComprasPorUsuario(String usuarioId) {
        return comprasRepository.findByUsuarioId(usuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Compra> obtenerComprasPorSede(String sedeId) {
        // Intent: Obtener las compras desde la BD local de la sede (multi-tenant).
        // Primero intentamos resolver la sede para conocer su BD local.
        try {
            Optional<Sede> sedeOpt = sedeService.obtenerSedePorId(sedeId);
            if (sedeOpt.isPresent()) {
                Sede sede = sedeOpt.get();
                String bdNombre = sede.getBdNombre();
                if (bdNombre != null && !bdNombre.isBlank()) {
                    MongoTemplate localTemplate = new MongoTemplate(mongoClient, bdNombre);
                    Query q = new Query(Criteria.where("sedeId").is(sedeId));
                    return localTemplate.find(q, Compra.class, "compras");
                }
            }
        } catch (Exception e) {
            log.error("Error consultando compras en BD local para sede {}: {}", sedeId, e.getMessage(), e);
        }

        // Fallback: si no se pudo acceder a la BD local, usar la tabla central.
        return comprasRepository.findBySedeId(sedeId);
    }

    @Override
    @Transactional
    public Compra actualizarCompra(String id, Compra compra) {
        log.info("Actualizando compra: {}", id);
        
        if (!comprasRepository.existsById(id)) {
            throw new CompraNoEncontradaException(id);
        }
        compra.setId(id);
        calcularPuntosCompra(compra);
        calcularTotal(compra);
        return comprasRepository.save(compra);
    }

    @Override
    @Transactional
    public void eliminarCompra(String id) {
        log.info("Eliminando compra: {}", id);
        
        Compra compra = comprasRepository.findById(id)
            .orElseThrow(() -> new CompraNoEncontradaException(id));

        if (compra.getEstado() == Compra.EstadoCompra.RESERVADO) {
            liberarRecursosCompra(compra);
        }

        comprasRepository.deleteById(id);
    }

    private void liberarRecursosCompra(Compra compra) {
        if (compra.getCompra() != null && inventarioService != null) {
            for (ItemCompra item : compra.getCompra()) {
                if ("snack".equalsIgnoreCase(item.getTipo())) {
                    try {
                        inventarioService.liberarSnack(item.getReferenciaId(), item.getCantidad(), compra.getId(), compra.getSedeId());
                    } catch (Exception e) {
                        log.error("Error liberando snack para compra {}: {}", compra.getId(), e.getMessage(), e);
                    }
                }
            }
        }
        
        if (compra.getCompra() != null) {
            for (ItemCompra item : compra.getCompra()) {
                if ("boleta".equalsIgnoreCase(item.getTipo()) && item.getSillaId() != null) {
                    try {
                        funcionService.liberarSilla(item.getReferenciaId(), item.getSillaId());
                    } catch (Exception e) {
                        log.error("Error liberando silla {} para compra {}: {}", item.getSillaId(), compra.getId(), e.getMessage(), e);
                    }
                }
            }
        }
    }

    @Scheduled(fixedDelayString = "${compra.cleanup.interval:600000}", initialDelayString = "${compra.cleanup.initialDelay:300000}")
    public void limpiarReservasHuerfanas() {
        try {
            long timeoutMinutos = 30;
            LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(timeoutMinutos);
            
            List<Compra> comprasHuerfanas = comprasRepository.findByEstadoAndFechaBefore(
                Compra.EstadoCompra.RESERVADO, 
                cutoffTime
            );
            
            if (!comprasHuerfanas.isEmpty()) {
                log.info("Iniciando cleanup de {} compras huerfanas en estado RESERVADO", comprasHuerfanas.size());
                
                for (Compra compra : comprasHuerfanas) {
                    try {
                        liberarRecursosCompra(compra);
                        compra.setEstado(Compra.EstadoCompra.CANCELADA);
                        comprasRepository.save(compra);
                        log.info("Compra huerfana {} cancelada y recursos liberados", compra.getId());
                    } catch (Exception e) {
                        log.error("Error limpiando compra huerfana {}: {}", compra.getId(), e.getMessage(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error en cleanup de reservas huerfanas: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void procesarPago(String compraId) {
        log.info("Procesando pago para compra: {}", compraId);
        
        try {
            Compra compra = comprasRepository.findById(compraId)
                .orElseThrow(() -> new CompraNoEncontradaException(compraId));
            
            if (compra.getEstado() != Compra.EstadoCompra.RESERVADO) {
                throw new IllegalStateException("Solo se pueden pagar compras en estado RESERVADO. Estado actual: " + compra.getEstado());
            }
            
            if (compra.getCompra() == null || compra.getCompra().isEmpty()) {
                throw new IllegalArgumentException("La compra no contiene items");
            }
            
            try {
                if (inventarioService != null) {
                    for (ItemCompra item : compra.getCompra()) {
                        if ("snack".equalsIgnoreCase(item.getTipo())) {
                            inventarioService.disminuirSnack(item.getReferenciaId(), item.getCantidad(), compraId, compra.getSedeId());
                        }
                    }
                }
                
                compra.setEstado(Compra.EstadoCompra.PAGADA);
                
                if (historialPuntosService != null && usuariosService != null) {
                    List<ItemCompra> boletasItems = compra.getCompra().stream()
                        .filter(i -> "boleta".equalsIgnoreCase(i.getTipo()))
                        .toList();
                    
                    if (!boletasItems.isEmpty()) {
                        String movieDetail = boletasItems.stream()
                            .map(ItemCompra::getDetalle)
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("Compra de boletas");
                        historialPuntosService.registrarGananciaBoletaPoints(
                            compra.getUsuarioId(), 
                            compra.getPuntosBoletas(), 
                            compraId, 
                            movieDetail
                        );
                    }
                    
                    List<ItemCompra> snacksItems = compra.getCompra().stream()
                        .filter(i -> "snack".equalsIgnoreCase(i.getTipo()))
                        .toList();
                    
                    if (!snacksItems.isEmpty()) {
                        String snackDetail = snacksItems.stream()
                            .map(ItemCompra::getDetalle)
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("Compra de snacks");
                        historialPuntosService.registrarGananciaSnackPoints(
                            compra.getUsuarioId(), 
                            compra.getPuntosSnacks(), 
                            compraId, 
                            snackDetail
                        );
                    }
                    
                    usuariosService.registrarPuntos(compra.getUsuarioId(), compra.getPuntosTotal(), compraId);
                }
                
                compra.setEstado(Compra.EstadoCompra.COMPLETADA);
                comprasRepository.save(compra);
                
                // También actualizar en BD local si es necesario
                Sede sede = sedeService.obtenerSedePorId(compra.getSedeId())
                    .orElseThrow(() -> new IllegalArgumentException("Sede no encontrada"));
                MongoTemplate localTemplate = new MongoTemplate(mongoClient, sede.getBdNombre());
                localTemplate.save(compra, "compras");
                
                log.info("Pago procesado exitosamente para compra: {}", compraId);
                
            } catch (Exception e) {
                log.error("Error durante el procesamiento del pago: {}", e.getMessage(), e);
                compra.setEstado(Compra.EstadoCompra.RESERVADO);
                comprasRepository.save(compra);
                throw new RuntimeException("Error procesando pago: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            log.error("Error procesando pago: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public double calcularTotal(String compraId) {
        Compra compra = comprasRepository.findById(compraId).orElse(null);
        if (compra == null) {
            throw new IllegalArgumentException("Compra con id " + compraId + " no encontrada");
        }
        return compra.getTotal();
    }
}