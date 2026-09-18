package co.edu.udistrital.cinepacho.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.mongodb.client.MongoClients;

@Configuration
@EnableMongoRepositories(
    basePackages = {
        "co.edu.udistrital.cinepacho.repository.central",
        "co.edu.udistrital.cinepacho.repository.local"
    },
    mongoTemplateRef = "centralTemplate"
)
public class CentralMongoConfig {

    @Bean(name = "centralTemplate")
    @Primary
    public MongoTemplate centralTemplate(
            @Value("${mongodb.central.uri}") String uri) {
        return new MongoTemplate(MongoClients.create(uri), "cinepacho");
    }
} 