package co.edu.udistrital.cinepacho.repository.local;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import co.edu.udistrital.cinepacho.model.local.funciones.Funcion;

public interface FuncionesRepository extends MongoRepository<Funcion, String> {
	List<Funcion> findBySalaId(String salaId);
	List<Funcion> findByPeliculaId(String peliculaId);
	List<Funcion> findBySedeId(String sedeId);
	List<Funcion> findByFechaBetween(LocalDate start, LocalDate end);
}
