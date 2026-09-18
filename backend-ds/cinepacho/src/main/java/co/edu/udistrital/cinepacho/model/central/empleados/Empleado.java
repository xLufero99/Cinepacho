package co.edu.udistrital.cinepacho.model.central.empleados;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "empleados")
public class Empleado {

    @Id
    private String id;

    @Indexed(unique = true)
    private String codigoEmpleado;

    private String usuarioId;

    @JsonIgnore
    private LocalDate fechaInicioContrato;

    private Double salario;

    private String sedeId;
    private String cargo;

    @Builder.Default
    private List<HistorialSede> historialSedes = new ArrayList<>();

    private LocalDateTime ultimoCambio;
}