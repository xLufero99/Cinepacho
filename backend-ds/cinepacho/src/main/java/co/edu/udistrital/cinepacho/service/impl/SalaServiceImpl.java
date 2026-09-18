package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.model.local.funciones.DetalleSilla;
import co.edu.udistrital.cinepacho.model.local.salas.Precios;
import co.edu.udistrital.cinepacho.model.local.salas.Sala;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import co.edu.udistrital.cinepacho.service.SalaService;
import com.mongodb.client.MongoClient;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import co.edu.udistrital.cinepacho.router.SedeMongoRouter;

@Service
@RequiredArgsConstructor
public class SalaServiceImpl implements SalaService {

    private final MongoClient mongoClient;
    private final MongoTemplate mongoTemplate;
    private final SedesRepository sedesRepository;
    private final SedeMongoRouter sedeMongoRouter;

    private Sede buscarSedePorId(String sedeId) {
        if (sedeId == null || sedeId.isBlank()) {
            return null;
        }
        return sedesRepository.findById(sedeId).orElse(null);
    }

    private MongoTemplate getLocalTemplateForSede(Sede sede) {
        if (sede == null) {
            throw new IllegalArgumentException("No se encontró la sede");
        }

        String routerKey = sede.getRouterKey();
        if (routerKey != null && !routerKey.isBlank()) {
            try {
                return sedeMongoRouter.getTemplate(routerKey);
            } catch (RuntimeException ignored) {
                // Fallback a bdNombre para mantener compatibilidad con sedes antiguas.
            }
        }

        if (sede.getBdNombre() != null && !sede.getBdNombre().isBlank()) {
            return new MongoTemplate(mongoClient, sede.getBdNombre());
        }

        throw new IllegalArgumentException("La sede '" + sede.getNombre() + "' no tiene conexión configurada");
    }

    @Override
    public Sala crearSala(Sala sala) {
        validarSalaBasica(sala);

        String sedeId = sala.getSedeId();
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null) {
            throw new IllegalArgumentException("No se encontró la sede con ID: " + sedeId);
        }

        MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
        
        // ✅ NUEVO: Generar las sillas si las listas están vacías
        if ((sala.getSillasGeneral() == null || sala.getSillasGeneral().isEmpty()) &&
            (sala.getSillasPreferencial() == null || sala.getSillasPreferencial().isEmpty())) {
            generarSillasParaSala(sala);
        }
        
        // Actualizar capacidades según las sillas generadas
        if (sala.getSillasGeneral() != null) {
            sala.setCapacidadGeneral(sala.getSillasGeneral().size());
        }
        if (sala.getSillasPreferencial() != null) {
            sala.setCapacidadPreferencial(sala.getSillasPreferencial().size());
        }

        Query query = new Query(Criteria.where("sedeId").is(sedeId).and("nombre").is(sala.getNombre()));
        List<Sala> existentes = multiplexTemplate.find(query, Sala.class, "salas");
        if (!existentes.isEmpty()) {
            throw new IllegalArgumentException("Ya existe una sala con el nombre " + sala.getNombre() + " en la sede " + sedeId);
        }

        if (sala.getEstado() == null) {
            sala.setEstado("activa");
        }
        if (sala.getPrecios() == null) {
            sala.setPrecios(new Precios());
        }

        Sala savedSala = multiplexTemplate.save(sala, "salas");
        return savedSala;
    }

    // ================== MÉTODO PARA GENERAR SILLAS ==================
    private void generarSillasParaSala(Sala sala) {
        int filas = sala.getFilas() != null ? sala.getFilas() : 10;
        int columnas = sala.getColumnas() != null ? sala.getColumnas() : 15;
        
        double precioGeneral = sala.getPrecios() != null ? sala.getPrecios().getGeneral() : 11000;
        double precioPreferencial = sala.getPrecios() != null ? sala.getPrecios().getPreferencial() : 15000;
        
        List<DetalleSilla> generales = new ArrayList<>();
        List<DetalleSilla> preferenciales = new ArrayList<>();
        
        // Generar todas las sillas como generales primero
        for (int f = 0; f < filas; f++) {
            char letra = (char) ('A' + f);
            for (int c = 1; c <= columnas; c++) {
                String id = letra + String.valueOf(c);
                generales.add(DetalleSilla.builder()
                        .id(id)
                        .tipo("general")
                        .precio(precioGeneral)
                        .disponible(true)
                        .compraId(null)
                        .build());
            }
        }
        
        // Mover las últimas 4 filas a preferenciales (ajustable)
        int filasPreferenciales = 4;
        int inicioPref = filas - filasPreferenciales;
        if (inicioPref < 0) inicioPref = 0;
        
        for (int f = inicioPref; f < filas; f++) {
            char letra = (char) ('A' + f);
            for (int c = 1; c <= columnas; c++) {
                String id = letra + String.valueOf(c);
                // Buscar en generales y mover
                for (int i = 0; i < generales.size(); i++) {
                    DetalleSilla s = generales.get(i);
                    if (s.getId().equals(id)) {
                        generales.remove(i);
                        s.setTipo("preferencial");
                        s.setPrecio(precioPreferencial);
                        preferenciales.add(s);
                        break;
                    }
                }
            }
        }
        
        sala.setSillasGeneral(generales);
        sala.setSillasPreferencial(preferenciales);
        
        System.out.println("Sillas generadas - Generales: " + generales.size() + 
                           ", Preferenciales: " + preferenciales.size());
    }

    @Override
    public Optional<Sala> obtenerSalaPorId(String id) {
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            try {
                MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
                Sala sala = multiplexTemplate.findById(id, Sala.class, "salas");
                if (sala != null) {
                    return Optional.of(sala);
                }
            } catch (Exception e) {
                // Se omiten sedes mal configuradas para no romper el listado general.
            }
        }
        return Optional.empty();
    }
    
    public Optional<Sala> obtenerSalaPorIdConSedeId(String id, String sedeId) {
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null || sede.getBdNombre() == null) return Optional.empty();
        
        MongoTemplate multiplexTemplate = new MongoTemplate(mongoClient, sede.getBdNombre());
        Query query = new Query(Criteria.where("_id").is(id));
        Sala sala = multiplexTemplate.findOne(query, Sala.class, "salas");
        return Optional.ofNullable(sala);
    }

    @Override
    public List<Sala> obtenerTodasLasSalas() {
        List<Sala> salas = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            try {
                MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
                salas.addAll(multiplexTemplate.findAll(Sala.class, "salas"));
            } catch (Exception e) {
                // Se omiten sedes mal configuradas para no romper el listado general.
            }
        }
        return salas;
    }

    @Override
    public List<Sala> obtenerSalasPorSede(String sedeId) {
        if (sedeId == null || sedeId.isBlank()) return List.of();
        
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null) return List.of();

        MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
        Query query = new Query(Criteria.where("sedeId").is(sedeId));
        return multiplexTemplate.find(query, Sala.class, "salas");
    }

    @Override
    public Sala actualizarSala(String id, Sala sala) {
        String sedeId = sala.getSedeId();
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null) {
            throw new IllegalArgumentException("No se encontró la BD para la sede: " + sedeId);
        }
        
        MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
        
        Query query = new Query(Criteria.where("_id").is(id));
        Sala existente = multiplexTemplate.findOne(query, Sala.class, "salas");
        if (existente == null) {
            throw new IllegalArgumentException("Sala con ID " + id + " no encontrada");
        }

        validarSalaBasica(sala);

        Query duplicadoQuery = new Query(
            Criteria.where("sedeId").is(sedeId)
                .and("nombre").is(sala.getNombre())
                .and("_id").ne(id)
        );
        List<Sala> duplicados = multiplexTemplate.find(duplicadoQuery, Sala.class, "salas");
        if (!duplicados.isEmpty()) {
            throw new IllegalArgumentException("Ya existe otra sala con el nombre " + sala.getNombre() + " en la sede " + sedeId);
        }

        existente.setSedeId(sala.getSedeId());
        existente.setNombre(sala.getNombre());
        existente.setTipo(sala.getTipo());
        existente.setFilas(sala.getFilas());
        existente.setColumnas(sala.getColumnas());
        existente.setEstado(sala.getEstado());
        existente.setCapacidadGeneral(sala.getCapacidadGeneral());
        existente.setCapacidadPreferencial(sala.getCapacidadPreferencial());
        existente.setPrecios(sala.getPrecios() != null ? sala.getPrecios() : new Precios());
        existente.setSillasGeneral(sala.getSillasGeneral() != null ? sala.getSillasGeneral() : new ArrayList<>());
        existente.setSillasPreferencial(sala.getSillasPreferencial() != null ? sala.getSillasPreferencial() : new ArrayList<>());

        return multiplexTemplate.save(existente, "salas");
    }

    @Override
    public void eliminarSala(String id) {
        throw new IllegalArgumentException("Use eliminarSala(id, sedeId) en su lugar");
    }
    
    public void eliminarSala(String id, String sedeId) {
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null) {
            throw new IllegalArgumentException("No se encontró la BD para la sede: " + sedeId);
        }
        
        MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
        Query query = new Query(Criteria.where("_id").is(id));
        Sala existente = multiplexTemplate.findOne(query, Sala.class, "salas");
        if (existente == null) {
            throw new IllegalArgumentException("Sala con id " + id + " no encontrada");
        }
        multiplexTemplate.remove(query, Sala.class, "salas");
    }

    public boolean validarDisponibilidadSilla(String funcionId, String sillaId) {
        if (sillaId == null || sillaId.isBlank()) {
            throw new IllegalArgumentException("Id de silla es requerido");
        }
        return sillaId.matches("^[GP]\\d+$");
    }

    public int contarSillasDisponibles(String salaId, String tipo) {
        throw new IllegalArgumentException("Use contarSillasDisponibles con sedeId");
    }
    
    public int contarSillasDisponibles(String salaId, String tipo, String sedeId) {
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null) return 0;
        
        MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
        Query query = new Query(Criteria.where("_id").is(salaId));
        Sala sala = multiplexTemplate.findOne(query, Sala.class, "salas");
        if (sala == null) return 0;
        
        if ("general".equalsIgnoreCase(tipo)) return sala.getCapacidadGeneral();
        if ("preferencial".equalsIgnoreCase(tipo)) return sala.getCapacidadPreferencial();
        throw new IllegalArgumentException("Tipo de silla invalido: " + tipo);
    }

    public Precios obtenerPrecios(String salaId) {
        throw new IllegalArgumentException("Use obtenerPrecios con sedeId");
    }
    
    public Precios obtenerPrecios(String salaId, String sedeId) {
        Sede sede = buscarSedePorId(sedeId);
        if (sede == null) {
            throw new IllegalArgumentException("No se encontró la BD");
        }
        
        MongoTemplate multiplexTemplate = getLocalTemplateForSede(sede);
        Query query = new Query(Criteria.where("_id").is(salaId));
        Sala sala = multiplexTemplate.findOne(query, Sala.class, "salas");
        if (sala == null) {
            throw new IllegalArgumentException("Sala con id " + salaId + " no encontrada");
        }
        return sala.getPrecios();
    }

    private void validarSalaBasica(Sala sala) {
        if (sala == null) throw new IllegalArgumentException("La sala es requerida");
        if (sala.getSedeId() == null || sala.getSedeId().isBlank())
            throw new IllegalArgumentException("La sede es requerida para crear una sala");
        if (sala.getNombre() == null || sala.getNombre().isBlank())
            throw new IllegalArgumentException("El nombre de la sala es requerido");
    }

    private void normalizarCapacidades(Sala sala) {
        if (sala.getCapacidadGeneral() <= 0) sala.setCapacidadGeneral(40);
        if (sala.getCapacidadPreferencial() <= 0) sala.setCapacidadPreferencial(20);
        if (sala.getPrecios() == null) sala.setPrecios(new Precios());
        if (sala.getSillasGeneral() == null) sala.setSillasGeneral(new ArrayList<>());
        if (sala.getSillasPreferencial() == null) sala.setSillasPreferencial(new ArrayList<>());
    }
}