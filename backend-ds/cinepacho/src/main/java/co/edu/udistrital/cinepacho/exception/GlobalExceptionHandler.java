package co.edu.udistrital.cinepacho.exception;

import co.edu.udistrital.cinepacho.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            WebRequest request) {

        var errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .message("Errores de validacion")
            .errors(errors)
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(CompraNoEncontradaException.class)
    public ResponseEntity<ErrorResponse> handleCompraNotFound(
            CompraNoEncontradaException ex,
            WebRequest request) {

        log.warn("Compra no encontrada: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            WebRequest request) {

        log.warn("Acceso denegado: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.FORBIDDEN.value())
            .message("Acceso denegado - Permisos insuficientes")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request) {

        log.warn("Argumento invalido: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException ex,
            WebRequest request) {

        log.warn("Estado invalido: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.CONFLICT.value())
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(
            DataAccessException ex,
            WebRequest request) {

        log.error("Error de acceso a datos: ", ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .message(ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            WebRequest request) {

        log.error("Error no manejado: ", ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .message(ex.getMessage() != null ? ex.getMessage() : "Error interno del servidor")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
