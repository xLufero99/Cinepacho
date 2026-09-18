package co.edu.udistrital.cinepacho.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import co.edu.udistrital.cinepacho.repository.central.RevokedTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

//Intercepta cada request para extraer el JWT, validarlo y poblar el contexto de seguridad.
//Flujo: Authorization header -> JwtFilter -> RevokedTokenRepository -> JwtTokenProvider -> SecurityContextHolder.
//Uso minimo: leer Bearer token, validar revocacion, validar firma y autenticar al usuario.

@Component
public class JwtFilter extends OncePerRequestFilter {

	@Autowired
	private JwtTokenProvider jwtTokenProvider;
	
	@Autowired
	private RevokedTokenRepository revokedTokenRepository;

	//Proceso de autenticacion basado en Bearer Token, si el token es valido y no revocado, se extraen username y rol para llenar el contexto de seguridad.
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String authorizationHeader = request.getHeader("Authorization");

		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			String token = authorizationHeader.substring(7); // Extrae el token sin "Bearer "

			try {
				if (revokedTokenRepository.existsByToken(token)) {
					throw new BadCredentialsException("Token JWT revocado");
				}

				if (jwtTokenProvider.validateToken(token)) {
					String username = jwtTokenProvider.getUsernameFromToken(token);
					String role = jwtTokenProvider.getRoleFromToken(token);
					if (role != null) {
						role = role.replace("ROLE_", "").trim().toUpperCase();
					}

					if (role != null && !role.isEmpty()) {
						Authentication authentication = new UsernamePasswordAuthenticationToken(
							username,
							null,
							AuthorityUtils.createAuthorityList("ROLE_" + role)
						);
						SecurityContextHolder.getContext().setAuthentication(authentication);
					}
				}
			} catch (Exception e) {
				// Si el token es invalido/expirado/revocado, continuamos sin autenticar.
				// Asi, los endpoints publicos no fallan por un token viejo en el cliente.
				SecurityContextHolder.clearContext();
			}
		}

		//Si no hay token utilizable, la peticion continua sin autenticacion.
		filterChain.doFilter(request, response);
	}

}
