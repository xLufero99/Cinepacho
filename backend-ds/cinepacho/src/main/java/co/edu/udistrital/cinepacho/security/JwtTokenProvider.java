package co.edu.udistrital.cinepacho.security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import co.edu.udistrital.cinepacho.model.central.usuarios.Usuarios;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

//Centraliza la generacion y lectura de tokens JWT, arma el token con claims, luego permite extraer datos y validar firma/expiracion.
//Flujo: Usuarios -> JwtTokenProvider -> token JWT -> JwtFilter/TokenRevocationService.
//Uso minimo: generar access/refresh token y extraer username, rol y expiracion.

@Component
public class JwtTokenProvider {

	@Value("${jwt.secret:CinepachoSecretKeyForJWT2024CinepachoSecretKeyForJWT2024CinepachoSecret}")
	private String jwtSecret;

	@Value("${jwt.expiration:86400000}")
	private long jwtExpirationMs;

	@Value("${jwt.refresh-expiration:604800000}")
	private long refreshTokenExpirationMs;

	//Construye la llave de firma a partir del secreto configurado.
	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}

	//Genera el token de acceso con los datos principales del usuario.
	public String generateAccessToken(Usuarios usuario) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("userId", usuario.getId());
		claims.put("cedula", usuario.getCedula());
		claims.put("rol", usuario.getRol());
		claims.put("tipo", "ACCESS");

		return buildToken(claims, usuario.getEmail(), jwtExpirationMs);
	}

	//Genera un token de refresh asociado al usuario persistido.
	public String generateRefreshToken(Usuarios usuario) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("tipo", "REFRESH");
		claims.put("userId", usuario.getId());

		return buildToken(claims, usuario.getEmail(), refreshTokenExpirationMs);
	}

	//Genera un token de refresh a partir de username y rol cuando no hay entidad completa.
	public String generateRefreshToken(String username, String role) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("tipo", "REFRESH");
		claims.put("role", role);

		return buildToken(claims, username, refreshTokenExpirationMs);
	}

	//Genera un token de acceso simple con username y rol.
	public String generateToken(String username, String role) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("role", role);
		claims.put("tipo", "ACCESS");

		return buildToken(claims, username, jwtExpirationMs);
	}

	//Construye el JWT final con fecha de emision, expiracion y firma.
	private String buildToken(Map<String, Object> claims, String subject, long expirationMs) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
			.setClaims(claims)
			.setSubject(subject)
			.setIssuedAt(now)
			.setExpiration(expiryDate)
			.signWith(getSigningKey(), SignatureAlgorithm.HS512)
			.compact();
	}

	//Extrae el subject usado como username.
	public String getUsernameFromToken(String token) {
		return getAllClaimsFromToken(token).getSubject();
	}

	//Recupera el identificador de usuario almacenado en el token.
	public String getUserIdFromToken(String token) {
		return getAllClaimsFromToken(token).get("userId", String.class);
	}

	//Lee el rol desde cualquiera de las dos claves soportadas por el flujo actual.
	public String getRoleFromToken(String token) {
		Claims claims = getAllClaimsFromToken(token);
		return claims.get("role", String.class) != null ? claims.get("role", String.class) : claims.get("rol", String.class);
	}

	//Indica si el token corresponde a acceso o refresco.
	public String getTokenTypeFromToken(String token) {
		return getAllClaimsFromToken(token).get("tipo", String.class);
	}

	//Devuelve la fecha de expiracion declarada en el JWT.
	public Date getExpirationDateFromToken(String token) {
		return getAllClaimsFromToken(token).getExpiration();
	}

	//Valida firma y estructura del token.
	public boolean validateToken(String token) {
		try {
			Jwts.parserBuilder()
				.setSigningKey(getSigningKey())
				.build()
				.parseClaimsJws(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	//Lee todos los claims del token despues de verificar la firma.
	private Claims getAllClaimsFromToken(String token) {
		return Jwts.parserBuilder()
			.setSigningKey(getSigningKey())
			.build()
			.parseClaimsJws(token)
			.getBody();
	}
}

