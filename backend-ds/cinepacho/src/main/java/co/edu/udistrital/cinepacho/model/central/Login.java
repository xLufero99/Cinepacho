package co.edu.udistrital.cinepacho.model.central;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "logins")
public class Login {

    @Id
    private String id;

    private String userId;

    @Indexed(unique = true)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String rol;
}