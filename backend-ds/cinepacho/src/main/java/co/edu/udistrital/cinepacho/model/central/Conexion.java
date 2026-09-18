package co.edu.udistrital.cinepacho.model.central;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "conexiones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conexion {

    @Id
    private String id;
    private String sedeId;   // referencia a Sede
    private String dbUri;
    private String dbName;
    private Boolean activa;
    
}