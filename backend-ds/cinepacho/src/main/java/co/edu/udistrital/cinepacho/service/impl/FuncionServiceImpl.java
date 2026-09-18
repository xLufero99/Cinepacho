package co.edu.udistrital.cinepacho.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.model.local.funciones.DetalleSilla;
import co.edu.udistrital.cinepacho.model.local.funciones.Funcion;
import co.edu.udistrital.cinepacho.model.local.funciones.Sillas;
import co.edu.udistrital.cinepacho.model.local.salas.Sala;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import co.edu.udistrital.cinepacho.repository.local.FuncionesRepository;
import co.edu.udistrital.cinepacho.router.SedeMongoRouter;
import co.edu.udistrital.cinepacho.service.FuncionService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
public class FuncionServiceImpl implements FuncionService {

    private final SedesRepository sedesRepository;
    private final SedeMongoRouter sedeMongoRouter;
    private final FuncionesRepository funcionesRepository;

    public FuncionServiceImpl(MongoTemplate mongoTemplate, SedesRepository sedesRepository, SedeMongoRouter sedeMongoRouter, FuncionesRepository funcionesRepository) {
        this.sedesRepository = sedesRepository;
        this.sedeMongoRouter = sedeMongoRouter;
        this.funcionesRepository = funcionesRepository;
    }

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

    private Sillas generarSillasDesdeSala(Sala sala, double precioGeneral, double precioPreferencial) {
        Sillas sillas = new Sillas();
        sillas.setGeneral(new ArrayList<>());
        sillas.setPreferencial(new ArrayList<>());
        
        if (sala.getSillasGeneral() != null) {
            for (DetalleSilla ds : sala.getSillasGeneral()) {
                sillas.getGeneral().add(DetalleSilla.builder()
                        .id(ds.getId())
                        .tipo("general")
                        .precio(precioGeneral)
                        .disponible(true)
                        .compraId(null)
                        .build());
            }
        }
        
        if (sala.getSillasPreferencial() != null) {
            for (DetalleSilla ds : sala.getSillasPreferencial()) {
                sillas.getPreferencial().add(DetalleSilla.builder()
                        .id(ds.getId())
                        .tipo("preferencial")
                        .precio(precioPreferencial)
                        .disponible(true)
                        .compraId(null)
                        .build());
            }
        }
        return sillas;
    }

    private void validarNoExisteFuncionEnMismaSalaYSede(MongoTemplate localTemplate, Funcion funcion) {
        Query query = new Query();
        query.addCriteria(Criteria.where("salaId").is(funcion.getSalaId()));
        query.addCriteria(Criteria.where("fecha").is(funcion.getFecha()));
        query.addCriteria(Criteria.where("hora").is(funcion.getHora()));

        boolean existe = localTemplate.exists(query, Funcion.class, "funciones");
        if (existe) {
            throw new IllegalArgumentException("Ya existe una función en esta sede, sala y hora");
        }
    }


    @Override
    public Funcion crearFuncion(Funcion funcion) {
        log.info("Creando función para película: {} en sede: {}", funcion.getPeliculaId(), funcion.getSedeId());
        
        if (funcion.getFecha() != null && funcion.getFecha().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La función debe ser en el futuro");
        }
        if (funcion.getSedeId() == null || funcion.getSedeId().isBlank()) {
            throw new IllegalArgumentException("La sede es requerida");
        }
        if (funcion.getSalaId() == null || funcion.getSalaId().isBlank()) {
            throw new IllegalArgumentException("La sala es requerida");
        }
        if (funcion.getPeliculaId() == null || funcion.getPeliculaId().isBlank()) {
            throw new IllegalArgumentException("La película es requerida");
        }
        
        // Obtener BD local
        MongoTemplate localTemplate = getLocalTemplateBySedeId(funcion.getSedeId());
        
        // Obtener la sala
        Sala sala = localTemplate.findById(funcion.getSalaId(), Sala.class, "salas");
        if (sala == null) {
            throw new IllegalArgumentException("Sala no encontrada en esta sede");
        }
        
        if (funcion.getPrecioGeneral() <= 0) funcion.setPrecioGeneral(11000.0);
        if (funcion.getPrecioPreferencial() <= 0) funcion.setPrecioPreferencial(15000.0);
        
        String horaActual = funcion.getHora();
        String horaNormalizada = (horaActual != null && horaActual.length() > 5) ? horaActual.substring(0, 5) : horaActual;
        funcion.setHora(horaNormalizada);

        validarNoExisteFuncionEnMismaSalaYSede(localTemplate, funcion);

        Sillas sillasGeneradas = generarSillasDesdeSala(sala, funcion.getPrecioGeneral(), funcion.getPrecioPreferencial());
        funcion.setSillas(sillasGeneradas);
        
        return localTemplate.save(funcion, "funciones");
    }

    @Override
    public Optional<Funcion> obtenerFuncionPorId(String id) {
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            try {
                MongoTemplate localTemplate = getLocalTemplateForSede(sede);
                Funcion f = localTemplate.findById(id, Funcion.class, "funciones");
                if (f != null) return Optional.of(f);
            } catch (Exception e) {
                log.warn("Error al buscar función {} en sede {}: {}", id, sede.getId(), e.getMessage());
            }
        }
        return Optional.empty();
    }

    @Override
    public List<Funcion> obtenerTodasLasFunciones() {
        List<Funcion> todas = new ArrayList<>();
        try {
            todas.addAll(funcionesRepository.findAll());
        } catch (Exception e) {
            log.warn("Error al leer funciones desde el repositorio central: {}", e.getMessage());
        }

        try {
            List<Sede> sedes = sedesRepository.findAll();
            for (Sede sede : sedes) {
                try {
                    MongoTemplate localTemplate = getLocalTemplateForSede(sede);
                    todas.addAll(localTemplate.findAll(Funcion.class, "funciones"));
                } catch (Exception e) {
                    log.warn("Error al listar funciones en sede {}: {}", sede.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error obteniendo sedes para listar funciones: {}", e.getMessage(), e);
        }
        return todas;
    }

    @Override
    public List<Funcion> obtenerFuncionesPorSala(String salaId) {
        throw new UnsupportedOperationException("Use obtenerFuncionesPorSede y filtre por salaId");
    }

    @Override
    public List<Funcion> obtenerFuncionesPorPelicula(String peliculaId) {
        List<Funcion> resultado = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            try {
                MongoTemplate localTemplate = getLocalTemplateForSede(sede);
                Query query = new Query(Criteria.where("peliculaId").is(peliculaId));
                resultado.addAll(localTemplate.find(query, Funcion.class, "funciones"));
            } catch (Exception e) {
                log.warn("Error al buscar funciones de película {} en sede {}: {}", peliculaId, sede.getId(), e.getMessage());
            }
        }
        return resultado;
    }

    @Override
    public List<Funcion> obtenerFuncionesPorSede(String sedeId) {
        MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
        return localTemplate.findAll(Funcion.class, "funciones");
    }

    // Método optimizado para el frontend (con manejo de errores)
    public List<Funcion> obtenerFuncionesPorPeliculaYSede(String peliculaId, String sedeId) {
        try {
            MongoTemplate localTemplate = getLocalTemplateBySedeId(sedeId);
            Query query = new Query(Criteria.where("peliculaId").is(peliculaId));
            List<Funcion> funciones = localTemplate.find(query, Funcion.class, "funciones");
            log.info("Se encontraron {} funciones para película {} en sede {}", funciones.size(), peliculaId, sedeId);
            return funciones;
        } catch (Exception e) {
            log.error("Error en obtenerFuncionesPorPeliculaYSede: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Funcion> obtenerFuncionesEntreFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        LocalDate inicio = fechaInicio.toLocalDate();
        LocalDate fin = fechaFin.toLocalDate();
        List<Funcion> resultado = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            try {
                MongoTemplate localTemplate = getLocalTemplateForSede(sede);
                Query query = new Query(Criteria.where("fecha").gte(inicio).lte(fin));
                resultado.addAll(localTemplate.find(query, Funcion.class, "funciones"));
            } catch (Exception e) {
                log.warn("Error al buscar funciones por fechas en sede {}: {}", sede.getId(), e.getMessage());
            }
        }
        return resultado;
    }

    @Override
    public Funcion actualizarFuncion(String id, Funcion funcion) {
        Optional<Funcion> existente = obtenerFuncionPorId(id);
        if (!existente.isPresent()) {
            throw new IllegalArgumentException("Función no encontrada: " + id);
        }
        Funcion vieja = existente.get();
        MongoTemplate localTemplate = getLocalTemplateBySedeId(vieja.getSedeId());
        funcion.setId(id);
        funcion.setSedeId(vieja.getSedeId());
        return localTemplate.save(funcion, "funciones");
    }

    @Override
    public void eliminarFuncion(String id) {
        Optional<Funcion> existente = obtenerFuncionPorId(id);
        if (!existente.isPresent()) {
            throw new IllegalArgumentException("Función no encontrada: " + id);
        }
        Funcion funcion = existente.get();
        MongoTemplate localTemplate = getLocalTemplateBySedeId(funcion.getSedeId());
        localTemplate.remove(Query.query(Criteria.where("id").is(id)), Funcion.class, "funciones");
    }

    // Métodos auxiliares para sillas (se mantienen igual)
    public boolean validarSillaDisponible(String funcionId, String sillaId) {
        Optional<Funcion> funcionOpt = obtenerFuncionPorId(funcionId);
        if (!funcionOpt.isPresent()) return false;
        Funcion funcion = funcionOpt.get();
        return funcion.getSillas().getGeneral().stream().anyMatch(s -> s.getId().equals(sillaId) && s.isDisponible()) ||
               funcion.getSillas().getPreferencial().stream().anyMatch(s -> s.getId().equals(sillaId) && s.isDisponible());
    }

    public void reservarSilla(String funcionId, String sillaId, String compraId) {
        Optional<Funcion> funcionOpt = obtenerFuncionPorId(funcionId);
        if (!funcionOpt.isPresent()) throw new IllegalArgumentException("Función no encontrada");
        Funcion funcion = funcionOpt.get();
        MongoTemplate localTemplate = getLocalTemplateBySedeId(funcion.getSedeId());
        
        boolean modificado = false;
        for (DetalleSilla s : funcion.getSillas().getGeneral()) {
            if (s.getId().equals(sillaId) && s.isDisponible()) {
                s.setDisponible(false);
                s.setCompraId(compraId);
                modificado = true;
                break;
            }
        }
        if (!modificado) {
            for (DetalleSilla s : funcion.getSillas().getPreferencial()) {
                if (s.getId().equals(sillaId) && s.isDisponible()) {
                    s.setDisponible(false);
                    s.setCompraId(compraId);
                    modificado = true;
                    break;
                }
            }
        }
        if (!modificado) throw new IllegalArgumentException("Silla no disponible o no existe");
        localTemplate.save(funcion, "funciones");
    }

    public void liberarSilla(String funcionId, String sillaId) {
        Optional<Funcion> funcionOpt = obtenerFuncionPorId(funcionId);
        if (!funcionOpt.isPresent()) throw new IllegalArgumentException("Función no encontrada");
        Funcion funcion = funcionOpt.get();
        MongoTemplate localTemplate = getLocalTemplateBySedeId(funcion.getSedeId());
        
        for (DetalleSilla s : funcion.getSillas().getGeneral()) {
            if (s.getId().equals(sillaId)) {
                s.setDisponible(true);
                s.setCompraId(null);
                localTemplate.save(funcion, "funciones");
                return;
            }
        }
        for (DetalleSilla s : funcion.getSillas().getPreferencial()) {
            if (s.getId().equals(sillaId)) {
                s.setDisponible(true);
                s.setCompraId(null);
                localTemplate.save(funcion, "funciones");
                return;
            }
        }
        throw new IllegalArgumentException("Silla no encontrada");
    }

    public int obtenerSillasDisponibles(String funcionId, String tipo) {
        Optional<Funcion> funcionOpt = obtenerFuncionPorId(funcionId);
        if (!funcionOpt.isPresent()) return 0;
        Funcion funcion = funcionOpt.get();
        if ("general".equalsIgnoreCase(tipo)) {
            return (int) funcion.getSillas().getGeneral().stream().filter(DetalleSilla::isDisponible).count();
        } else if ("preferencial".equalsIgnoreCase(tipo)) {
            return (int) funcion.getSillas().getPreferencial().stream().filter(DetalleSilla::isDisponible).count();
        }
        return 0;
    }

    public boolean estaFuncionCompleta(String funcionId) {
        return obtenerSillasDisponibles(funcionId, "general") == 0 && obtenerSillasDisponibles(funcionId, "preferencial") == 0;
    }
}