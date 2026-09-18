package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.model.central.empleados.Empleado;
import co.edu.udistrital.cinepacho.model.central.empleados.HistorialSede;
import co.edu.udistrital.cinepacho.repository.central.EmpleadosRepository;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import co.edu.udistrital.cinepacho.service.EmpleadoService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

//Flujo: Empleado -> EmpleadoServiceImpl -> EmpleadosRepository -> SedesRepository -> historialSedes.
//Uso minimo: crearEmpleado, actualizarEmpleado y metodos de validacion.

@Service
@Transactional
public class EmpleadoServiceImpl implements EmpleadoService {

    private static final Set<String> ROLES_VALIDOS = new HashSet<>(Arrays.asList(
        "director", "cajero", "despachador_comida", "encargado_sala", "aseador"
    ));

    private static final long MESES_MINIMOS_ENTRE_CAMBIOS = 3;

    private final EmpleadosRepository empleadosRepository;
    private final SedesRepository sedesRepository;

    public EmpleadoServiceImpl(EmpleadosRepository empleadosRepository, SedesRepository sedesRepository) {
        this.empleadosRepository = empleadosRepository;
        this.sedesRepository = sedesRepository;
    }

    //Crea un empleado con sede (validada), cargo, codigo y registro inicial de historial.
    @Override
    public Empleado crearEmpleado(Empleado empleado) {
        if (empleado.getSedeId() == null || !esSedeValida(empleado.getSedeId())) {
            throw new IllegalArgumentException("Sede invalida. Validas: " + obtenerSedesValidas());
        }
        if (empleado.getCargo() == null || !ROLES_VALIDOS.contains(empleado.getCargo())) {
            throw new IllegalArgumentException("Cargo invalido. Validos: " + ROLES_VALIDOS);
        }

        if (empleado.getCodigoEmpleado() == null || empleado.getCodigoEmpleado().isBlank()) {
            empleado.setCodigoEmpleado(generarCodigoEmpleado());
        }
        if (empleado.getSalario() == null) {
            empleado.setSalario(0d);
        }
        empleado.setFechaInicioContrato(LocalDate.now());
        if (empleado.getHistorialSedes() == null) {
            empleado.setHistorialSedes(new ArrayList<>());
        }
        empleado.getHistorialSedes().add(HistorialSede.builder()
            .sedeId(empleado.getSedeId())
            .cargo(empleado.getCargo())
            .fechaInicio(LocalDate.now())
            .fechaFin(null)
            .build());
        empleado.setUltimoCambio(LocalDateTime.now());
        return empleadosRepository.save(empleado);
    }

    //Buscar empleado por id.
    @Override
    
    public Optional<Empleado> obtenerEmpleadoPorId(String id) {
        return empleadosRepository.findById(id);
    }

    @Override
    public Optional<Empleado> obtenerEmpleadoPorUsuarioId(String usuarioId) {
        if (usuarioId == null || usuarioId.isBlank()) {
            return Optional.empty();
        }

        return empleadosRepository.findByUsuarioId(usuarioId);
    }

    //Lista de empleados.
    @Override
    public List<Empleado> obtenerTodosLosEmpleados() {
        return empleadosRepository.findAll();
    }

    //Buscar empleado por codigo.
    @Override
    public Optional<Empleado> obtenerEmpleadoPorCodigo(String codigo) {
        return empleadosRepository.findAll().stream()
            .filter(e -> codigo != null && codigo.equals(e.getCodigoEmpleado()))
            .findFirst();
    }

    //Filtra empleados por sede.
    @Override
    public List<Empleado> obtenerEmpleadosPorSede(String sedeId) {
        return empleadosRepository.findAll().stream()
            .filter(e -> e.getSedeId() != null && e.getSedeId().equals(sedeId))
            .toList();
    }

    //Filtra empleados por rol.
    @Override
    public List<Empleado> obtenerEmpleadosPorRol(String rol) {
        return empleadosRepository.findAll().stream()
            .filter(e -> e.getCargo() != null && e.getCargo().equals(rol))
            .toList();
    }

    //Devuelve el historial de sedes/cargos de un empleado por su codigo.
    @Override
    public List<HistorialSede> obtenerHistorialEmpleados(String codigo) {
        return empleadosRepository.findAll().stream()
            .filter(e -> codigo != null && codigo.equals(e.getCodigoEmpleado()))
            .findFirst()
            .map(Empleado::getHistorialSedes)
            .map(ArrayList::new)
            .orElseGet(ArrayList::new);
    }

    //Actualiza datos de empleado, administra cambios de sede o rol, y registra movimientos en el historial.
    @Override
    public Empleado actualizarEmpleado(String id, Empleado empleadoActualizado) {
        Empleado empleadoActual = empleadosRepository.findById(id).orElse(null);
        if (empleadoActual == null) {
            throw new IllegalArgumentException("Empleado con id " + id + " no encontrado");
        }

        if (empleadoActualizado.getSedeId() != null && !esSedeValida(empleadoActualizado.getSedeId())) {
            throw new IllegalArgumentException("Sede invalida: " + empleadoActualizado.getSedeId());
        }

        if ((empleadoActualizado.getSedeId() != null && 
             !empleadoActualizado.getSedeId().equals(empleadoActual.getSedeId())) ||
            (empleadoActualizado.getCargo() != null && 
             !empleadoActualizado.getCargo().equals(empleadoActual.getCargo()))) {
            
            LocalDateTime lastChange = empleadoActual.getUltimoCambio();
            if (lastChange != null) {
                long mesesTranscurridos = ChronoUnit.MONTHS.between(lastChange, LocalDateTime.now());
                if (mesesTranscurridos < MESES_MINIMOS_ENTRE_CAMBIOS) {
                    throw new IllegalStateException(
                        "No se puede cambiar la asignacion hasta " + MESES_MINIMOS_ENTRE_CAMBIOS + 
                        " meses despues del ultimo cambio. Proximo cambio permitido: " + 
                        lastChange.plusMonths(MESES_MINIMOS_ENTRE_CAMBIOS)
                    );
                }
            }
            
            if (empleadoActual.getHistorialSedes() == null) {
                empleadoActual.setHistorialSedes(new ArrayList<>());
            }
            if (!empleadoActual.getHistorialSedes().isEmpty()) {
                HistorialSede anterior = empleadoActual.getHistorialSedes().get(empleadoActual.getHistorialSedes().size() - 1);
                anterior.setFechaFin(LocalDate.now());
            }
            empleadoActual.getHistorialSedes().add(HistorialSede.builder()
                .sedeId(empleadoActualizado.getSedeId() != null ? empleadoActualizado.getSedeId() : empleadoActual.getSedeId())
                .cargo(empleadoActualizado.getCargo() != null ? empleadoActualizado.getCargo() : empleadoActual.getCargo())
                .fechaInicio(LocalDate.now())
                .fechaFin(null)
                .build());
        }

        if (empleadoActualizado.getSedeId() != null) {
            empleadoActual.setSedeId(empleadoActualizado.getSedeId());
        }
        if (empleadoActualizado.getCargo() != null) {
            empleadoActual.setCargo(empleadoActualizado.getCargo());
        }
        if (empleadoActualizado.getSalario() != null) {
            empleadoActual.setSalario(empleadoActualizado.getSalario());
        }
        empleadoActual.setUltimoCambio(LocalDateTime.now());
        return empleadosRepository.save(empleadoActual);
    }

    //Elimina un empleado por id con validacion.
    @Override
    public void eliminarEmpleado(String id) {
        if (!empleadosRepository.existsById(id)) {
            throw new IllegalArgumentException("Empleado con id " + id + " no encontrado");
        }
        empleadosRepository.deleteById(id);
    }

    //Construye datos reducidos para la obtencion de estadisticas por el id de una sede.
    public List<Map<String, Object>> obtenerDatosEstadistica(String sedeId) {
        List<Map<String, Object>> datos = new ArrayList<>();
        
        empleadosRepository.findAll().stream()
            .filter(e -> sedeId.equals(e.getSedeId()))
            .forEach(e -> {
                Map<String, Object> registro = new HashMap<>();
                registro.put("codigo", e.getCodigoEmpleado());
                registro.put("usuarioId", e.getUsuarioId());
                registro.put("fechaInicioContrato", e.getFechaInicioContrato());
                registro.put("salario", e.getSalario());
                datos.add(registro);
            });
        
        return datos;
    }

    //Verifica que la sede perteneciente al id exista.
    private boolean esSedeValida(String sedeId) {
        return obtenerSedesValidas().contains(sedeId);
    }

    //Obtiene claves de sede consideradas validas para el catalogo central.
    private Set<String> obtenerSedesValidas() {
        return sedesRepository.findAll().stream()
            .map(Sede::getRouterKey)
            .filter(key -> key != null && !key.isBlank())
            .collect(Collectors.toSet());
    }

    //Generacion de codigo unico basico para el empleado.
    private String generarCodigoEmpleado() {
        String base = "EMP-" + System.currentTimeMillis();
        return empleadosRepository.findAll().stream()
            .anyMatch(e -> base.equals(e.getCodigoEmpleado())) ? base + "-1" : base;
    }
}
