package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.central.Pelicula;
import java.util.List;
import java.util.Optional;

public interface PeliculaService {
    
    Pelicula crearPelicula(Pelicula pelicula);
    
    Optional<Pelicula> obtenerPeliculaPorId(String id);
    
    List<Pelicula> obtenerTodasLasPeliculas();
    
    Pelicula actualizarPelicula(String id, Pelicula pelicula);
    
    void eliminarPelicula(String id);
    
    List<Pelicula> obtenerPeliculasEnCartelera();
}
