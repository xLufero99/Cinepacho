package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.central.Sede;
import java.util.List;
import java.util.Optional;

public interface SedeService {
    Sede crearSede(Sede sede);
    Optional<Sede> obtenerSedePorId(String id);
    List<Sede> obtenerTodasLasSedes();
    Optional<Sede> obtenerSedePorNombre(String nombre);
    Sede actualizarSede(String id, Sede sede);
    void eliminarSede(String id);
    int obtenerCantidadSalas(String sedeId);
}