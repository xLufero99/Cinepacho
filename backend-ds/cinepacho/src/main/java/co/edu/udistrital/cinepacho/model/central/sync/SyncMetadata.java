package co.edu.udistrital.cinepacho.model.central.sync;

import java.time.LocalDateTime;
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
@Document(collection = "sync_metadata")
public class SyncMetadata {
    @Id
    private String id;
    private String sedeId;
    private LocalDateTime lastPushedAt;
}
