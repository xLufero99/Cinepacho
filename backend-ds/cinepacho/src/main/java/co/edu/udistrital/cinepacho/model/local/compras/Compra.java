package co.edu.udistrital.cinepacho.model.local.compras;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "compras")
public class Compra {

    @Id
    private String id;

    private String usuarioId;
    private String sedeId;
    private LocalDateTime fecha;
    private Double total;
    private String metodoPago;
    private EstadoCompra estado;

    @Builder.Default
    private Integer puntosBoletas = 0;

    @Builder.Default
    private Integer puntosSnacks = 0;

    @Builder.Default
    private Integer puntosTotal = 0;

    @Builder.Default
    private List<ItemCompra> compra = new ArrayList<>();

    public enum EstadoCompra {
        RESERVADO("Reserva de recursos", 0),
        PAGADA("Pago recibido", 1),
        COMPLETADA("Compra completada", 2),
        CANCELADA("Compra cancelada", 3),
        REEMBOLSADA("Reembolso procesado", 4);

        private final String descripcion;
        private final int codigo;

        EstadoCompra(String descripcion, int codigo) {
            this.descripcion = descripcion;
            this.codigo = codigo;
        }

        public String getDescripcion() { return descripcion; }
        public int getCodigo() { return codigo; }
    }
}