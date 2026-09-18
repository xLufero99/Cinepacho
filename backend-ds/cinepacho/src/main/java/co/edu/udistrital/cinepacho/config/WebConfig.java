package co.edu.udistrital.cinepacho.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*")  // ← PERMITE TODO
            .allowedMethods("*")  // ← PERMITE TODOS LOS MÉTODOS
            .allowedHeaders("*"); // ← PERMITE TODOS LOS HEADERS
    }
}