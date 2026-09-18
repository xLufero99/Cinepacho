package co.edu.udistrital.cinepacho.model.central;

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
@Document(collection = "sedes")
public class Sede {

    @Id
    private String id;

    private String nombre;
    private String ciudad;
    private String direccion;
    private String url_imagen;
    private String routerKey;
    private int cantidadSalas;
    
    private String bdNombre;  // ← Campo clave

    @Builder.Default
    private ConfiguracionSillas configuracionSillas = new ConfiguracionSillas();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfiguracionSillas {
        @Builder.Default
        private int sillasGenerales = 40;
        
        @Builder.Default
        private int sillasPreferenciales = 20;
    }
}