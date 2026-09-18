package co.edu.udistrital.cinepacho.model.local.salas;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import co.edu.udistrital.cinepacho.model.local.funciones.DetalleSilla;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "salas")
public class Sala {

    @Id
    private String id;

    @Indexed
    private String sedeId;

    private String nombre;
    private String tipo;                    // "2D", "3D", "IMAX", "MacroXE"
    private String estado;                  // "activa", "mantenimiento", "inactiva"
    private Integer filas;                      // Número de filas
    private Integer columnas;                   // Número de columnas
    private int capacidadGeneral;
    private int capacidadPreferencial;

    @Builder.Default
    private Precios precios = new Precios();

    // ✅ Recibir datos detallados del frontend (objetos)
    @JsonProperty("sillas_general")
    @Builder.Default
    private List<DetalleSilla> sillasGeneral = new ArrayList<>();
    
    @JsonProperty("sillas_preferencial")
    @Builder.Default
    private List<DetalleSilla> sillasPreferencial = new ArrayList<>();
}