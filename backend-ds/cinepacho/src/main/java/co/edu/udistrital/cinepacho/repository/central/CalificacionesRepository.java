package co.edu.udistrital.cinepacho.repository.central;

import co.edu.udistrital.cinepacho.model.central.usuarios.Calificacion;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@EnableMongoRepositories(
    basePackages = "co.edu.udistrital.cinepacho.repository.central",
    mongoTemplateRef = "centralTemplate")
public interface CalificacionesRepository extends MongoRepository<Calificacion, String> {

    List<Calificacion> findByReferenciaIdAndTipo(String referenciaId, String tipo);

    List<Calificacion> findByTipoAndReferenciaId(String tipo, String referenciaId);
    
    // ✅ NUEVOS MÉTODOS
    List<Calificacion> findByUsuarioId(String usuarioId);
    
    List<Calificacion> findByTipoAndUsuarioId(String tipo, String usuarioId);
}