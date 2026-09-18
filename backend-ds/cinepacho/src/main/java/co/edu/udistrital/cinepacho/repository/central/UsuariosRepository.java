package co.edu.udistrital.cinepacho.repository.central;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;

@EnableMongoRepositories(
    basePackages = "co.edu.udistrital.cinepacho.repository.central",
    mongoTemplateRef = "centralTemplate")
public interface UsuariosRepository extends MongoRepository<Usuarios, String> {

    Optional<Usuarios> findByEmail(String email);

    Optional<Usuarios> findByCedula(String cedula);

    List<Usuarios> findAllBy();
}
