package co.edu.udistrital.cinepacho.repository.central;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import co.edu.udistrital.cinepacho.model.central.Conexion;

@EnableMongoRepositories(
    basePackages = "co.edu.udistrital.cinepacho.repository.central",
    mongoTemplateRef = "centralTemplate")
public interface ConexionRepository extends MongoRepository<Conexion, String> {
    Optional<Conexion> findBySedeId(String sedeId);

    List<Conexion> findByActivaTrue();
}