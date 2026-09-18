package co.edu.udistrital.cinepacho.router;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import com.mongodb.client.MongoClients;

import co.edu.udistrital.cinepacho.model.central.Conexion;
import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.repository.central.ConexionRepository;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SedeMongoRouter {

    private final ConexionRepository conexionRepository;
    private final SedesRepository sedesRepository;

    private final Map<String, MongoTemplate> templates = Collections.synchronizedMap(new HashMap<>());

    @PostConstruct
    public void cargarSedes() {
        conexionRepository.findByActivaTrue()
            .forEach(conexion -> registrarConexion(conexion));
    }

    public void registrarConexion(Conexion conexion) {
        MongoTemplate template = new MongoTemplate(
            MongoClients.create(conexion.getDbUri()),
            conexion.getDbName()
        );

        // Compatibilidad: permitir resolver por id de sede y por routerKey.
        templates.put(conexion.getSedeId(), template);

        sedesRepository.findById(conexion.getSedeId())
            .map(Sede::getRouterKey)
            .filter(routerKey -> routerKey != null && !routerKey.isBlank())
            .ifPresent(routerKey -> templates.put(routerKey, template));
    }

    public void eliminarConexion(String sedeId) {
        templates.remove(sedeId);
        sedesRepository.findById(sedeId)
            .map(Sede::getRouterKey)
            .ifPresent(templates::remove);
    }

    public MongoTemplate getTemplate(String sedeId) {
        MongoTemplate template = templates.get(sedeId);
        if (template == null) {
            throw new RuntimeException("Conexión no encontrada para sede: " + sedeId);
        }
        return template;
    }
}