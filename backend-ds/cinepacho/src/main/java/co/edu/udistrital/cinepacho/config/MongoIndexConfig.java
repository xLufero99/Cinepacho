package co.edu.udistrital.cinepacho.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.mongodb.client.model.Indexes;
import com.mongodb.client.model.IndexOptions;

@Configuration
public class MongoIndexConfig {

    @Bean
    public IndexGenerator indexGenerator(MongoTemplate centralTemplate, MongoTemplate localTemplate) {
        return new IndexGenerator(centralTemplate, localTemplate);
    }

    public static class IndexGenerator {
        private final MongoTemplate centralTemplate;
        private final MongoTemplate localTemplate;

        public IndexGenerator(MongoTemplate centralTemplate, MongoTemplate localTemplate) {
            this.centralTemplate = centralTemplate;
            this.localTemplate = localTemplate;
            createIndexes();
        }

        private void createIndexes() {
            createLocalCompraIndexes();
            createCentralCalificacionIndexes();
        }

        private void createLocalCompraIndexes() {
            try {
                localTemplate.getCollection("compras").createIndex(
                    Indexes.compoundIndex(Indexes.ascending("estado"), Indexes.descending("fecha")),
                    new IndexOptions()
                );

                localTemplate.getCollection("compras").createIndex(
                    Indexes.compoundIndex(Indexes.ascending("sedeId"), Indexes.descending("fecha")),
                    new IndexOptions()
                );

                localTemplate.getCollection("compras").createIndex(
                    Indexes.ascending("usuarioId"),
                    new IndexOptions()
                );
            } catch (Exception e) {
            }
        }

        private void createCentralCalificacionIndexes() {
            try {
                centralTemplate.getCollection("calificaciones").createIndex(
                    Indexes.compoundIndex(Indexes.ascending("tipo"), Indexes.ascending("referenciaId")),
                    new IndexOptions()
                );

                centralTemplate.getCollection("calificaciones").createIndex(
                    Indexes.compoundIndex(Indexes.ascending("referenciaId"), Indexes.ascending("tipo")),
                    new IndexOptions()
                );
            } catch (Exception e) {
            }
        }
    }
}
