package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.dto.response.reportes.DashboardIngresosDto;
import co.edu.udistrital.cinepacho.dto.response.reportes.EmpleadoMovilidadDto;
import co.edu.udistrital.cinepacho.dto.response.reportes.ReporteMensualSedeDto;
import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.model.central.empleados.Empleado;
import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import co.edu.udistrital.cinepacho.repository.central.EmpleadosRepository;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import co.edu.udistrital.cinepacho.router.SedeMongoRouter;
import co.edu.udistrital.cinepacho.service.ReporteService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import java.util.Optional;
import co.edu.udistrital.cinepacho.model.local.compras.Compra;


//Flujo: Compra -> ReporteServiceImpl -> SedeMongoRouter -> MongoTemplate local -> SedesRepository/EmpleadosRepository.
//Uso minimo: metodos de consulta de reportes por sede y periodo a partir de las compras locales.
@Slf4j
@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements ReporteService {

    private final SedesRepository sedesRepository;
    private final SedeMongoRouter router;
    private final EmpleadosRepository empleadosRepository;
    
    // Devuelve compras desde la BD local de la sede indicada (multi-tenant)
    public List<Compra> obtenerComprasPorSedeLocal(String sedeId) {
        try {
            Optional<Sede> sedeOpt = sedesRepository.findById(sedeId);
            if (sedeOpt.isPresent()) {
                Sede sede = sedeOpt.get();
                String routerKey = sede.getRouterKey() != null ? sede.getRouterKey() : sede.getId();
                MongoTemplate localTemplate = router.getTemplate(routerKey);
                Query q = new Query(Criteria.where("sedeId").is(sedeId));
                return localTemplate.find(q, Compra.class, "compras");
            }
        } catch (Exception e) {
            log.error("Error consultando compras locales para sede {}: {}", sedeId, e.getMessage(), e);
        }
        return List.of();
    }

    //Suma los ingresos de boletas y snacks para mostrar en el dashboard.
    @Override
    @Cacheable(value = "dashboardIngresos")
    public DashboardIngresosDto obtenerIngresosDashboard() {
        log.info("Calculando ingresos totales para dashboard");

        double ingresosBoletas = 0.0;
        double ingresosSnacks = 0.0;
        int totalCompras = 0;

        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            String routerKey = sede.getRouterKey();
            if (routerKey == null) {
                log.warn("Sede {} sin routerKey configurado", sede.getId());
                continue;
            }

            MongoTemplate localTemplate;
            try {
                localTemplate = router.getTemplate(routerKey);
            } catch (Exception e) {
                log.error("Error conectando a sede {} con router key {}: {}", sede.getId(), routerKey, e.getMessage());
                continue;
            }

            Query query = new Query(Criteria.where("estado").in(Compra.EstadoCompra.PAGADA, Compra.EstadoCompra.COMPLETADA));
            List<Compra> compras = localTemplate.find(query, Compra.class, "compras");
            totalCompras += compras.size();

            for (Compra compra : compras) {
                if (compra.getCompra() == null) {
                    continue;
                }

                for (var item : compra.getCompra()) {
                    if (item == null || item.getTipo() == null) {
                        continue;
                    }

                    if ("boleta".equalsIgnoreCase(item.getTipo())) {
                        ingresosBoletas += item.getSubtotal();
                    } else if ("snack".equalsIgnoreCase(item.getTipo())) {
                        ingresosSnacks += item.getSubtotal();
                    }
                }
            }
        }

        return DashboardIngresosDto.builder()
            .ingresosBoletas(ingresosBoletas)
            .ingresosSnacks(ingresosSnacks)
            .ingresosTotales(ingresosBoletas + ingresosSnacks)
            .totalCompras(totalCompras)
            .build();
    }

    //Calcula operaciones mensuales por sede para un año dado.
    @Override
    public List<ReporteMensualSedeDto> operacionesMensualesPorSede(int year) {
        if (year < 1900 || year > LocalDate.now().getYear() + 1) {
            throw new IllegalArgumentException("Año invalido: " + year);
        }
        log.info("Generando reporte mensual para el año {}", year);
        List<ReporteMensualSedeDto> result = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        
        for (Sede sede : sedes) {
            String routerKey = sede.getRouterKey();
            if (routerKey == null) {
                log.warn("Sede {} sin routerKey configurado", sede.getId());
                continue;
            }
            MongoTemplate localTemplate;
            try {
                localTemplate = router.getTemplate(routerKey);
            } catch (Exception e) {
                log.error("Error conectando a sede {} con router key {}: {}", sede.getId(), routerKey, e.getMessage());
                continue;
            }
            
            for (int mes = 1; mes <= 12; mes++) {
                LocalDateTime start = LocalDateTime.of(LocalDate.of(year, mes, 1), LocalTime.MIN);
                LocalDateTime end = start.plusMonths(1);
                Query q = new Query(Criteria.where("fecha").gte(start).lt(end));
                List<Compra> compras = localTemplate.find(q, Compra.class, "compras");
                double totalVentas = compras.stream().mapToDouble(Compra::getTotal).sum();
                int totalCompras = compras.size();
                ReporteMensualSedeDto dto = ReporteMensualSedeDto.builder()
                    .sedeId(sede.getId())
                    .year(year)
                    .mes(mes)
                    .totalVentas(totalVentas)
                    .totalCompras(totalCompras)
                    .build();
                result.add(dto);
            }
        }
        log.info("Reporte generado: {} registros de {} sedes", result.size(), sedes.size());
        return result;
    }

    //Calcula operaciones para un rango de fechas en todas las sedes.
    public List<ReporteMensualSedeDto> operacionesPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        if (fechaInicio == null || fechaFin == null) {
            throw new IllegalArgumentException("Fechas inicio y fin son requeridas");
        }
        if (fechaInicio.isAfter(fechaFin)) {
            throw new IllegalArgumentException("La fecha inicio no puede ser posterior a la fecha fin");
        }
        if (fechaInicio.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("La fecha inicio no puede ser futura");
        }
        
        log.info("Generando reporte para rango: {} a {}", fechaInicio, fechaFin);
        List<ReporteMensualSedeDto> result = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        
        for (Sede sede : sedes) {
            String routerKey = sede.getRouterKey();
            if (routerKey == null) continue;
            
            MongoTemplate localTemplate;
            try {
                localTemplate = router.getTemplate(routerKey);
            } catch (Exception e) {
                log.error("Error conectando a sede {}: {}", sede.getId(), e.getMessage());
                continue;
            }
            
            Query q = new Query(Criteria.where("fecha").gte(fechaInicio).lt(fechaFin));
            List<Compra> compras = localTemplate.find(q, Compra.class, "compras");
            double totalVentas = compras.stream().mapToDouble(Compra::getTotal).sum();
            int totalCompras = compras.size();
            
            ReporteMensualSedeDto dto = ReporteMensualSedeDto.builder()
                .sedeId(sede.getId())
                .year(fechaInicio.getYear())
                .mes(fechaInicio.getMonthValue())
                .totalVentas(totalVentas)
                .totalCompras(totalCompras)
                .build();
            result.add(dto);
        }
        
        return result;
    }

    //Aplica paginacion al reporte mensual por sede.
    public List<ReporteMensualSedeDto> operacionesMensualesPorSedeConPaginacion(int year, int page, int pageSize) {
        if (page < 0 || pageSize <= 0) {
            throw new IllegalArgumentException("Pagina y tamaño deben ser validos");
        }
        log.info("Generando reporte paginado - año: {}, pagina: {}, tamaño: {}", year, page, pageSize);
        List<ReporteMensualSedeDto> result = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        int skip = page * pageSize;
        int count = 0;

        for (Sede sede : sedes) {
            String routerKey = sede.getRouterKey();
            if (routerKey == null) continue;
            MongoTemplate localTemplate;
            try {
                localTemplate = router.getTemplate(routerKey);
            } catch (Exception e) {
                log.error("Error conectando a sede {} con router key {}: {}", sede.getId(), routerKey, e.getMessage());
                continue;
            }
            for (int mes = 1; mes <= 12; mes++) {
                if (count >= skip && result.size() < pageSize) {
                    LocalDateTime start = LocalDateTime.of(LocalDate.of(year, mes, 1), LocalTime.MIN);
                    LocalDateTime end = start.plusMonths(1);
                    Query q = new Query(Criteria.where("fecha").gte(start).lt(end));
                    List<Compra> compras = localTemplate.find(q, Compra.class, "compras");
                    double totalVentas = compras.stream().mapToDouble(Compra::getTotal).sum();
                    int totalCompras = compras.size();
                    ReporteMensualSedeDto dto = ReporteMensualSedeDto.builder()
                        .sedeId(sede.getId())
                        .year(year)
                        .mes(mes)
                        .totalVentas(totalVentas)
                        .totalCompras(totalCompras)
                        .build();
                    result.add(dto);
                }
                count++;
            }
        }

        log.info("Reporte paginado generado: {} registros", result.size());
        return result;
    }

    //Aplica paginacion al reporte por rango de fechas.
    public List<ReporteMensualSedeDto> operacionesPorRangoFechasConPaginacion(
            LocalDateTime fechaInicio, LocalDateTime fechaFin, int page, int pageSize) {
        if (page < 0 || pageSize <= 0) {
            throw new IllegalArgumentException("Pagina y tamaño deben ser validos");
        }
        if (fechaInicio == null || fechaFin == null) {
            throw new IllegalArgumentException("Fechas inicio y fin son requeridas");
        }
        if (fechaInicio.isAfter(fechaFin)) {
            throw new IllegalArgumentException("La fecha inicio no puede ser posterior a la fecha fin");
        }
        if (fechaInicio.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("La fecha inicio no puede ser futura");
        }
        log.info("Generando reporte paginado por rango: {} a {} (pagina: {}, tamaño: {})", fechaInicio, fechaFin, page, pageSize);
        List<ReporteMensualSedeDto> result = new ArrayList<>();
        List<Sede> sedes = sedesRepository.findAll();
        int skip = page * pageSize;
        int count = 0;

        for (Sede sede : sedes) {
            String routerKey = sede.getRouterKey();
            if (routerKey == null) continue;
            MongoTemplate localTemplate;
            try {
                localTemplate = router.getTemplate(routerKey);
            } catch (Exception e) {
                log.error("Error conectando a sede {}: {}", sede.getId(), e.getMessage());
                continue;
            }

            if (count >= skip && result.size() < pageSize) {
                Query q = new Query(Criteria.where("fecha").gte(fechaInicio).lt(fechaFin));
                List<Compra> compras = localTemplate.find(q, Compra.class, "compras");
                double totalVentas = compras.stream().mapToDouble(Compra::getTotal).sum();
                int totalCompras = compras.size();
                ReporteMensualSedeDto dto = ReporteMensualSedeDto.builder()
                    .sedeId(sede.getId())
                    .year(fechaInicio.getYear())
                    .mes(fechaInicio.getMonthValue())
                    .totalVentas(totalVentas)
                    .totalCompras(totalCompras)
                    .build();
                result.add(dto);
            }
            count++;
        }

        return result;
    }

    //Analiza movimientos de empleado en un periodo dado.
    @Override
    public List<EmpleadoMovilidadDto> analisisMovilidadEmpleados(int meses) {
        if (meses <= 0) {
            throw new IllegalArgumentException("Meses debe ser positivo: " + meses);
        }
        if (meses > 120) {
            throw new IllegalArgumentException("Meses no puede exceder 120 (10 años): " + meses);
        }
        
        log.info("Analizando movilidad de empleados en ultimos {} meses", meses);
        List<EmpleadoMovilidadDto> result = new ArrayList<>();
        LocalDate threshold = LocalDate.now().minusMonths(meses);
        List<Empleado> empleados = empleadosRepository.findAll();
        
        for (Empleado emp : empleados) {
            if (emp.getHistorialSedes() == null) continue;
            
            int movimientos = (int) emp.getHistorialSedes().stream()
                    .filter(h -> h.getFechaInicio() != null && h.getFechaInicio().isAfter(threshold))
                    .count();
            
            EmpleadoMovilidadDto dto = EmpleadoMovilidadDto.builder()
                    .empleadoId(emp.getId())
                    .codigoEmpleado(emp.getCodigoEmpleado())
                    .usuarioId(emp.getUsuarioId())
                    .movimientos(movimientos)
                    .historialSedes(emp.getHistorialSedes())
                    .build();
            result.add(dto);
        }
        
        log.info("Analisis completado: {} empleados analizados", result.size());
        return result;
    }
}