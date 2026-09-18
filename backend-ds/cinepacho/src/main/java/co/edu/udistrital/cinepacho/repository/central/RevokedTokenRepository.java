package co.edu.udistrital.cinepacho.repository.central;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import co.edu.udistrital.cinepacho.security.RevokedToken;

@EnableMongoRepositories(
    basePackages = "co.edu.udistrital.cinepacho.repository.central",
    mongoTemplateRef = "centralTemplate")
public interface RevokedTokenRepository extends MongoRepository<RevokedToken, String> {

    Optional<RevokedToken> findByToken(String token);

    boolean existsByToken(String token);
}