package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.local.Inventario;
import java.util.List;
import java.util.Optional;

public interface InventarioService {
    Inventario crearInventario(Inventario inventario);
    Optional<Inventario> obtenerInventarioPorId(String id);
    Optional<Inventario> obtenerInventarioPorId(String id, String sedeId);
    List<Inventario> obtenerTodosLosInventarios();
    List<Inventario> obtenerInventariosPorSede(String sedeId);
    Inventario actualizarInventario(String id, Inventario inventario);
    void eliminarInventario(String id);
    void eliminarInventario(String id, String sedeId);
    void actualizarStock(String inventarioId, int cantidad);
    void actualizarStock(String inventarioId, int cantidad, String sedeId);
    boolean verificarDisponibilidad(String inventarioId, int cantidadRequerida);
    boolean verificarDisponibilidad(String inventarioId, int cantidadRequerida, String sedeId);
    boolean reservarSnack(String inventarioId, int cantidad, String compraId);
    boolean reservarSnack(String inventarioId, int cantidad, String compraId, String sedeId);
    void disminuirSnack(String inventarioId, int cantidad, String compraId);
    void disminuirSnack(String inventarioId, int cantidad, String compraId, String sedeId);
    void liberarSnack(String inventarioId, int cantidad, String compraId);
    void liberarSnack(String inventarioId, int cantidad, String compraId, String sedeId);
    int obtenerDisponibleReal(String inventarioId);
    int obtenerDisponibleReal(String inventarioId, String sedeId);
}