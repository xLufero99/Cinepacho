package co.edu.udistrital.cinepacho.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ActualizarFuncionDTO {
    @NotBlank private String peliculaId;
    @NotBlank private String sedeId;
    @NotBlank private String salaId;
    @NotNull private LocalDate fecha;
    @NotNull private LocalTime hora;
    private String formato;
    @Positive private double precioGeneral;
    @Positive private double precioPreferencial;
}