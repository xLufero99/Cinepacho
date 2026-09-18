package co.edu.udistrital.cinepacho;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CinepachoApplication {

	public static void main(String[] args) {
		SpringApplication.run(CinepachoApplication.class, args);
	}

}
