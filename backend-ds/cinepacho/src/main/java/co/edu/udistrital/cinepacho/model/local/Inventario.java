package co.edu.udistrital.cinepacho.model.local;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inventarios")
public class Inventario {

    @Id
    private String id;

    @NotBlank(message = "sedeId es requerido")
    private String sedeId;

    @NotBlank(message = "Nombre es requerido")
    private String nombre;

    private String marca;

    @Min(value = 0, message = "Cantidad no puede ser negativa")
    private int cantidad;

    @Builder.Default
    private List<Reserva> reservas = new ArrayList<>();

    @DecimalMin(value = "0.0", inclusive = false, message = "Precio debe ser mayor a 0")
    @DecimalMax(value = "999999.99", message = "Precio no puede exceder limite")
    private double precio;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    private String imageUrl;

    @Transient
public int getDisponible() {
    if (reservas == null) {
        return cantidad;
    }
    int reservadoSum = reservas.stream().mapToInt(r -> r.cantidad).sum();
    return cantidad - reservadoSum;
}

    public static class Reserva {
        private String compraId;
        private int cantidad;
        private LocalDateTime fecha;

        public Reserva() {}

        public Reserva(String compraId, int cantidad, LocalDateTime fecha) {
            this.compraId = compraId;
            this.cantidad = cantidad;
            this.fecha = fecha;
        }

        public String getCompraId() { return compraId; }
        public void setCompraId(String compraId) { this.compraId = compraId; }
        public int getCantidad() { return cantidad; }
        public void setCantidad(int cantidad) { this.cantidad = cantidad; }
        public LocalDateTime getFecha() { return fecha; }
        public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    }
}