package co.edu.udistrital.cinepacho.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

//Aplica control basico de intentos de autenticacion por ip y usuario, se construye una llave, cuenta intentos en una ventana y bloquea al exceder el limite.
//Flujo: ip + username -> AuthRateLimitService -> bucket en memoria -> decision de permitir o bloquear login.
//Uso minimo: construir llave con buildKey y consumir intentos con tryConsume.
@Service
public class AuthRateLimitService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 10 * 60 * 1000L;
	
    
    private final ConcurrentMap<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    //Construye la llave de limitacion combinando ip y usuario normalizado.
    public String buildKey(HttpServletRequest request, String username) {
        String ip = request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown-ip";
        String normalizedUser = username != null ? username.trim().toLowerCase() : "anonymous";
        return ip + "|" + normalizedUser;
    }

    //Verifica si aun se puede consumir un intento dentro de la ventana actual.
    public boolean tryConsume(String key) {
        RateLimitBucket bucket = buckets.compute(key, (bucketKey, currentBucket) -> {
            long now = Instant.now().toEpochMilli();
            if (currentBucket == null || currentBucket.isWindowExpired(now)) {
                return new RateLimitBucket(now, 0, false);
            }
            return currentBucket;
        });

        return !bucket.isBlocked() && bucket.getAttempts() < MAX_ATTEMPTS;
    }

    //Registra un fallo de autenticacion y bloquea la llave al superar el maximo.
    public void recordFailure(String key) {
        buckets.compute(key, (bucketKey, currentBucket) -> {
            long now = Instant.now().toEpochMilli();
            if (currentBucket == null || currentBucket.isWindowExpired(now)) {
                return new RateLimitBucket(now, 1, false);
            }

            int attempts = currentBucket.getAttempts() + 1;
            boolean blocked = attempts >= MAX_ATTEMPTS;
            return new RateLimitBucket(currentBucket.getWindowStart(), attempts, blocked);
        });
    }

    //Limpia el estado de limitacion para una llave concreta.
    public void reset(String key) {
        buckets.remove(key);
    }

    //Contenedor inmutable con la ventana activa, los intentos acumulados y el estado de bloqueo.
    private static final class RateLimitBucket {
        private final long windowStart;
        private final int attempts;
        private final boolean blocked;

        private RateLimitBucket(long windowStart, int attempts, boolean blocked) {
            this.windowStart = windowStart;
            this.attempts = attempts;
            this.blocked = blocked;
        }

        private boolean isWindowExpired(long now) {
            return now - windowStart > WINDOW_MILLIS;
        }

        private long getWindowStart() {
            return windowStart;
        }

        private int getAttempts() {
            return attempts;
        }

        private boolean isBlocked() {
            return blocked;
        }
    }
}