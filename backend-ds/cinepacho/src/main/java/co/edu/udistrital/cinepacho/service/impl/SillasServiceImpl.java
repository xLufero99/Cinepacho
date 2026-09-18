package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.local.funciones.Sillas;
import co.edu.udistrital.cinepacho.service.SillasService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

//Flujo: Sillas -> SillasServiceImpl -> mapa en memoria -> FuncionServiceImpl/CompraServiceImpl.
//Uso minimo: inicializar, reservar y liberacion de sillas.

@Slf4j
@Service
public class SillasServiceImpl implements SillasService {
    private final Map<String, Sillas> sillas = new HashMap<>();
    private int contadorId = 0;

    //Crea una silla y la guarda en el mapa en memoria.
    @Override
    public Sillas crearSilla(Sillas silla) {
        String id = String.valueOf(++contadorId);
        sillas.put(id, silla);
        return silla;
    }

    //Busca una silla por id.
    @Override
    public Optional<Sillas> obtenerSillaPorId(String id) {
        return Optional.ofNullable(sillas.get(id));
    }

    //Devuelve todas las sillas almacenadas en memoria.
    @Override
    public List<Sillas> obtenerSillasPorFuncion(String funcionId) {
        return new ArrayList<>(sillas.values());
    }

    //Filtrado de sillas que se consideran disponibles en el estado actual.
    @Override
    public List<Sillas> obtenerSillasDisponibles(String funcionId) {
        return sillas.values().stream()
            .filter(s -> s.getGeneral() != null && !s.getGeneral().isEmpty())
            .toList();
    }

    @Override
    //Filtrado de sillas que se consideran ocupadas en el estado actual.
    public List<Sillas> obtenerSillasOcupadas(String funcionId) {
        return sillas.values().stream()
            .filter(s -> s.getPreferencial() != null && !s.getPreferencial().isEmpty())
            .toList();
    }

    //Reemplaza una silla existente en memoria.
    @Override
    public Sillas actualizarSilla(String id, Sillas silla) {
        if (!sillas.containsKey(id)) {
            throw new IllegalArgumentException("Silla con ID " + id + " no encontrada");
        }
        sillas.put(id, silla);
        return silla;
    }

    //Elimina una silla del mapa en memoria.
    @Override
    public void eliminarSilla(String id) {
        if (!sillas.containsKey(id)) {
            throw new IllegalArgumentException("Silla con ID " + id + " no encontrada");
        }
        sillas.remove(id);
    }

    //Marca la silla como reservada en el flujo en memoria.
    @Override
    public void reservarSilla(String sillaId) {
        Sillas silla = sillas.get(sillaId);
        if (silla == null) {
            throw new IllegalArgumentException("Silla con ID " + sillaId + " no encontrada");
        }
        if (silla.getGeneral().isEmpty()) {
            throw new IllegalArgumentException("La silla " + sillaId + " no esta disponible");
        }
    }

    //Libera la silla dentro del flujo en memoria.
    @Override
    public void liberarSilla(String sillaId) {
        Sillas silla = sillas.get(sillaId);
        if (silla == null) {
            throw new IllegalArgumentException("Silla con ID " + sillaId + " no encontrada");
        }
    }
}
