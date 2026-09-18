package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import co.edu.udistrital.cinepacho.service.SedeService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

//Flujo: Sede -> SedeServiceImpl -> SedesRepository -> SedeMongoRouter.
//Uso minimo: crearSede, generarRouterKey y validaciones adicionales.

@Service
@RequiredArgsConstructor
public class SedeServiceImpl implements SedeService {

    private final SedesRepository sedesRepository;

    //Crea una sede con validaciones de nombre y routerKey.
    @Override
    @Transactional
    public Sede crearSede(Sede sede) {
        if (sede.getNombre() == null || sede.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la sede es requerido");
        }
        if (sede.getCantidadSalas() < 0) {
    throw new IllegalArgumentException("La cantidad de salas no puede ser negativa");
}
        Optional<Sede> existente = sedesRepository.findAll().stream()
                .filter(s -> s.getNombre().equalsIgnoreCase(sede.getNombre()))
                .findFirst();
        if (existente.isPresent()) {
            throw new IllegalArgumentException("Ya existe una sede con el nombre: " + sede.getNombre());
        }
        if (sede.getRouterKey() == null || sede.getRouterKey().isBlank()) {
            String derived = sede.getNombre().toLowerCase().trim().replaceAll("\\s+","_");
            sede.setRouterKey(derived);
        }
        String rk = sede.getRouterKey();
        boolean rkTaken = sedesRepository.findAll().stream()
                .anyMatch(s -> rk.equalsIgnoreCase(s.getRouterKey()));
        if (rkTaken) {
            throw new IllegalArgumentException("routerKey ya en uso: " + rk);
        }
        return sedesRepository.save(sede);
    }

    //Busca una sede por id.
    @Override
    public Optional<Sede> obtenerSedePorId(String id) {
        return sedesRepository.findById(id);
    }

    //Retorna todas las sedes registradas.
    @Override
    public List<Sede> obtenerTodasLasSedes() {
        return sedesRepository.findAll();
    }

    //Busca una sede por nombre.
    @Override
    public Optional<Sede> obtenerSedePorNombre(String nombre) {
        return sedesRepository.findAll().stream()
                .filter(s -> s.getNombre().equalsIgnoreCase(nombre))
                .findFirst();
    }

    //Actualiza una sede conservando la validacion de routerKey unica.
    @Override
    @Transactional
    public Sede actualizarSede(String id, Sede sede) {
        Sede existente = sedesRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sede con id " + id + " no encontrada"));
        if (sede.getNombre() == null || sede.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre de la sede es requerido");
        }
        existente.setNombre(sede.getNombre());
        existente.setCiudad(sede.getCiudad());
        existente.setDireccion(sede.getDireccion());
        existente.setCantidadSalas(sede.getCantidadSalas());
        existente.setConfiguracionSillas(sede.getConfiguracionSillas());
        // update or set routerKey, validating uniqueness
        if (sede.getRouterKey() != null && !sede.getRouterKey().isBlank()) {
            String rk = sede.getRouterKey();
            boolean usedByOther = sedesRepository.findAll().stream()
                    .anyMatch(s -> !s.getId().equals(id) && rk.equalsIgnoreCase(s.getRouterKey()));
            if (usedByOther) throw new IllegalArgumentException("routerKey ya en uso: " + rk);
            existente.setRouterKey(rk);
        } else if (existente.getRouterKey() == null || existente.getRouterKey().isBlank()) {
            existente.setRouterKey(existente.getNombre().toLowerCase().trim().replaceAll("\\s+","_"));
        }
        return sedesRepository.save(existente);
    }

    //Elimina una sede por id.
    @Override
    @Transactional
    public void eliminarSede(String id) {
        if (!sedesRepository.existsById(id)) {
            throw new IllegalArgumentException("Sede con id " + id + " no encontrada");
        }
        sedesRepository.deleteById(id);
    }

    //Devuelve la cantidad de salas configuradas en la sede.
    @Override
    public int obtenerCantidadSalas(String sedeId) {
        return sedesRepository.findById(sedeId)
                .map(Sede::getCantidadSalas)
                .orElseThrow(() -> new IllegalArgumentException("Sede con id " + sedeId + " no encontrada"));
    }
}
