package co.edu.udistrital.cinepacho.repository.local;

import co.edu.udistrital.cinepacho.model.local.salas.Sala;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalasRepository extends MongoRepository<Sala, String> {
    List<Sala> findBySedeId(String sedeId);
    boolean existsBySedeIdAndNombre(String sedeId, String nombre);
}