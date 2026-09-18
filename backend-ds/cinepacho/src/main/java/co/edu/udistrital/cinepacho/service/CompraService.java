package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import java.util.List;
import java.util.Optional;

public interface CompraService {
    
    Compra crearCompra(Compra compra);
    
    Optional<Compra> obtenerCompraPorId(String id);
    
    List<Compra> obtenerTodasLasCompras();
    
    List<Compra> obtenerComprasPorUsuario(String usuarioId);
    
    List<Compra> obtenerComprasPorSede(String sedeId);
    
    Compra actualizarCompra(String id, Compra compra);
    
    void eliminarCompra(String id);
    
    void procesarPago(String compraId);
    
    double calcularTotal(String compraId);
}
