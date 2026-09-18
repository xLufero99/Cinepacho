package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.dto.response.PuntosConfigResponse;
import co.edu.udistrital.cinepacho.model.local.Inventario;
import co.edu.udistrital.cinepacho.service.impl.InventarioServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente")
@RequiredArgsConstructor
public class ClienteController {

    private final InventarioServiceImpl inventarioService;

    @GetMapping("/confiteria")
    public ResponseEntity<List<Inventario>> getConfiteria() {
        return ResponseEntity.ok(inventarioService.obtenerTodosLosInventarios());
    }

    @GetMapping("/mis-puntos/config")
    public ResponseEntity<PuntosConfigResponse> getPuntosConfig() {
        PuntosConfigResponse config = PuntosConfigResponse.builder()
                .puntosBoletas(10)
                .puntosSnacks(5)
                .puntosRedencion(100)
                .vigenciaBoletaGratisMeses(6)
                .tipoBoletaGratis("general")
                .build();
        
        return ResponseEntity.ok(config);
    }
}