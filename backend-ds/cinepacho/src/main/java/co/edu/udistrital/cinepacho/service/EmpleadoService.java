package co.edu.udistrital.cinepacho.service;

import co.edu.udistrital.cinepacho.model.central.empleados.Empleado;
import co.edu.udistrital.cinepacho.model.central.empleados.HistorialSede;
import java.util.List;
import java.util.Optional;

public interface EmpleadoService {
    
    Empleado crearEmpleado(Empleado empleado);
    
    Optional<Empleado> obtenerEmpleadoPorId(String id);

    Optional<Empleado> obtenerEmpleadoPorUsuarioId(String usuarioId);
    
    Optional<Empleado> obtenerEmpleadoPorCodigo(String codigo);
    
    List<Empleado> obtenerTodosLosEmpleados();
    
    List<Empleado> obtenerEmpleadosPorSede(String sedeId);
    
    List<Empleado> obtenerEmpleadosPorRol(String rol);
    
    Empleado actualizarEmpleado(String id, Empleado empleado);
    
    void eliminarEmpleado(String id);
    
    List<HistorialSede> obtenerHistorialEmpleados(String codigoEmpleado);
}
