package co.edu.udistrital.cinepacho.repository.central;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import co.edu.udistrital.cinepacho.model.central.Login;
import java.util.Optional;

@EnableMongoRepositories(
    basePackages = "co.edu.udistrital.cinepacho.repository.central",
    mongoTemplateRef = "centralTemplate")
public interface LoginRepository extends MongoRepository<Login, String> {

    Optional<Login> findByUsername(String username);

    boolean existsByUsername(String username);
}

