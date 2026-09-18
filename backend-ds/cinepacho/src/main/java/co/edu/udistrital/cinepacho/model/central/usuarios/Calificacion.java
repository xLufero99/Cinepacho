package co.edu.udistrital.cinepacho.model.central.usuarios;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "calificaciones")
public class Calificacion {
    @Id
    private String id;
    private String tipo;
    private String referenciaId;
    private int puntuacion; // 1-5
    private String comentario;
    private LocalDateTime fecha;
    private String usuarioId;
}