package co.edu.udistrital.cinepacho.controller;

import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import co.edu.udistrital.cinepacho.service.impl.CompraServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final CompraServiceImpl compraService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR') or hasRole('EMPLEADO')")
    public ResponseEntity<Compra> createPurchase(@Valid @RequestBody Compra compra) {
        Compra nuevaCompra = compraService.crearCompra(compra);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCompra);
    }
}