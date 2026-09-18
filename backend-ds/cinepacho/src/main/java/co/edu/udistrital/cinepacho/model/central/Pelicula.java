package co.edu.udistrital.cinepacho.model.central;

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
@Document(collection = "peliculas")
public class Pelicula {

    @Id
    private String id;

    private String nombre;
    private String descripcion;
    private String director;
    private int duracionMin;
    private String clasificacion;
    private String urlPoster;
    private boolean estreno;

    @Builder.Default
    private List<String> protagonistas = new ArrayList<>();

    @Builder.Default
    private List<String> generos = new ArrayList<>();

    @Builder.Default
    private Double calificacionPromedio = 0.0;
    
    @Builder.Default
    private Integer totalCalificaciones = 0;
}