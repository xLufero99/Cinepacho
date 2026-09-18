package co.edu.udistrital.cinepacho.repository.central;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import co.edu.udistrital.cinepacho.model.central.Pelicula;

@EnableMongoRepositories(
    basePackages = "co.edu.udistrital.cinepacho.repository.central",
    mongoTemplateRef = "centralTemplate")
public interface PeliculasRepository extends MongoRepository<Pelicula, String>{
    
}
