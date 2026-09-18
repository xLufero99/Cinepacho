package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.Pelicula;
import co.edu.udistrital.cinepacho.repository.central.PeliculasRepository;
import co.edu.udistrital.cinepacho.service.PeliculaService;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
//Flujo: Pelicula -> PeliculaServiceImpl -> PeliculasRepository -> SyncService. 
//Uso minimo: crear, actualizar, listar y eliminar peliculas para replicarlas a sedes.
public class PeliculaServiceImpl implements PeliculaService {

    private final PeliculasRepository peliculasRepository;

    public PeliculaServiceImpl(PeliculasRepository peliculasRepository) {
        this.peliculasRepository = peliculasRepository;
    }

    //Guarda una pelicula en el catalogo.
    @Override
    public Pelicula crearPelicula(Pelicula pelicula) {
        return peliculasRepository.save(pelicula);
    }

    //Busca una pelicula por id.
    @Override
    public Optional<Pelicula> obtenerPeliculaPorId(String id) {
        return peliculasRepository.findById(id);
    }

    //Lista todas las peliculas en el catalogo.
    @Override
    public List<Pelicula> obtenerTodasLasPeliculas() {
        return peliculasRepository.findAll();
    }

    //Reemplaza la informacion de una pelicula existente.
    @Override
    public Pelicula actualizarPelicula(String id, Pelicula pelicula) {
        if (!peliculasRepository.existsById(id)) {
            throw new IllegalArgumentException("Pelicula con ID " + id + " no encontrada");
        }
        pelicula.setId(id);
        return peliculasRepository.save(pelicula);
    }

    //Elimina una pelicula del catalogo.
    @Override
    public void eliminarPelicula(String id) {
        if (!peliculasRepository.existsById(id)) {
            throw new IllegalArgumentException("Pelicula con ID " + id + " no encontrada");
        }
        peliculasRepository.deleteById(id);
    }

    //Devuelve las peliculas visibles en cartelera.
    @Override
    public List<Pelicula> obtenerPeliculasEnCartelera() {
        return peliculasRepository.findAll();
    }
}
