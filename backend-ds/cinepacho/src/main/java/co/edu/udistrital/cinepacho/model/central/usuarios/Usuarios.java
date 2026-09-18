package co.edu.udistrital.cinepacho.model.central.usuarios;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "usuarios")
public class Usuarios {

    @Id
    private String id;

    @NotBlank(message = "Cedula es requerida")
    @Size(min = 8, max = 20, message = "Cedula debe tener 8-20 caracteres")
    @Indexed(unique = true)
    private String cedula;

    @NotBlank(message = "Nombre es requerido")
    @Size(min = 2, max = 50, message = "Nombre debe tener 2-50 caracteres")
    private String nombre;

    @NotBlank(message = "Apellido es requerido")
    @Size(min = 2, max = 50, message = "Apellido debe tener 2-50 caracteres")
    private String apellido;

    @NotBlank(message = "Email es requerido")
    @Email(message = "Email debe ser valido")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Telefono es requerido")
    @Pattern(regexp = "^[0-9]{10}$", message = "Telefono debe tener 10 digitos")
    private String telefono;

    @NotBlank(message = "Direccion es requerida")
    @Size(min = 10, max = 100, message = "Direccion debe tener 10-100 caracteres")
    private String direccion;

    @NotBlank(message = "Contraseña es requerida")
    @Size(min = 6, message = "Contraseña debe tener minimo 6 caracteres")
    private String contrasena;

    @NotBlank(message = "Rol es requerido")
    private String rol;

    @Builder.Default
    private Puntos puntos = new Puntos();

    @Builder.Default
    private List<Calificacion> calificaciones = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}