package co.edu.udistrital.cinepacho.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co.edu.udistrital.cinepacho.model.local.funciones.Funcion;
import co.edu.udistrital.cinepacho.service.impl.FuncionServiceImpl;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {

    private final FuncionServiceImpl funcionService;

    // Endpoint optimizado: consulta directa en la BD local de la sede
    @GetMapping("/movie/{movieId}/headquarters/{headquarterId}")
    public ResponseEntity<List<Funcion>> getShowtimesByMovieAndHeadquarters(
            @PathVariable String movieId,
            @PathVariable String headquarterId) {
        List<Funcion> funciones = funcionService.obtenerFuncionesPorPeliculaYSede(movieId, headquarterId);
        return ResponseEntity.ok(funciones);
    }

    @GetMapping("/{showtimeId}/seats")
    public ResponseEntity<?> getSeatsByShowtime(@PathVariable String showtimeId) {
        return funcionService.obtenerFuncionPorId(showtimeId)
                .map(funcion -> ResponseEntity.ok(funcion.getSillas()))
                .orElse(ResponseEntity.notFound().build());
    }
}