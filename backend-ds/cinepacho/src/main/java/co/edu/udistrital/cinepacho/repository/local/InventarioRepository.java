package co.edu.udistrital.cinepacho.repository.local;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import co.edu.udistrital.cinepacho.model.local.Inventario;

public interface InventarioRepository extends MongoRepository<Inventario, String> {
	List<Inventario> findBySedeId(String sedeId);
}
