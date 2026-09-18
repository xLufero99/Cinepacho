package co.edu.udistrital.cinepacho.model.local.funciones;

import java.time.LocalDate;
import java.time.LocalTime;

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
@Document(collection = "funciones")
public class Funcion {

    @Id
    private String id;

    private String sedeId;
    private String peliculaId;
    private String salaId;
    private LocalDate fecha;
    private String hora;
    private String formato; // "2D" | "3D" | "IMAX"

    private double precioGeneral;      // ← Precio para sillas generales
    private double precioPreferencial; // ← Precio para sillas preferenciales

    @Builder.Default
    private Sillas sillas = new Sillas();
}