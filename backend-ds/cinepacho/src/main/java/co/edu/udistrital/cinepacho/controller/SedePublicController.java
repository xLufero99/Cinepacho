package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.service.SedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/sedes/publicas")
@RequiredArgsConstructor
public class SedePublicController {

    private final SedeService sedeService;

    @GetMapping
    public ResponseEntity<List<Sede>> listarSedes() {
        return ResponseEntity.ok(sedeService.obtenerTodasLasSedes());
    }
}