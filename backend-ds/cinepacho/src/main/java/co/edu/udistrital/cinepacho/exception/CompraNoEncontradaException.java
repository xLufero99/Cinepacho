package co.edu.udistrital.cinepacho.exception;

public class CompraNoEncontradaException extends RuntimeException {
    
    public CompraNoEncontradaException(String compraId) {
        super("Compra no encontrada con ID: " + compraId);
    }
    
    public CompraNoEncontradaException(String message, Throwable cause) {
        super(message, cause);
    }
}
