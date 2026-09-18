package co.edu.udistrital.cinepacho.repository.local;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import co.edu.udistrital.cinepacho.model.local.compras.Compra.EstadoCompra;

public interface ComprasRepository extends MongoRepository<Compra, String> {
	List<Compra> findByUsuarioId(String usuarioId);
	List<Compra> findBySedeId(String sedeId);
	List<Compra> findByEstadoAndFechaBefore(EstadoCompra estado, LocalDateTime fecha);

	@Query("{ 'sedeId': ?0, 'fecha': { $gte: ?1, $lt: ?2 } }")
	Page<Compra> findBySedeIdAndFechaRange(String sedeId, LocalDateTime inicio, LocalDateTime fin, Pageable pageable);

	Page<Compra> findByEstadoAndFechaBefore(EstadoCompra estado, LocalDateTime fecha, Pageable pageable);
}
