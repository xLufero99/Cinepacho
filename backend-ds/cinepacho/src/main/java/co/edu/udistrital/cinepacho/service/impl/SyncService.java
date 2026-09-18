package co.edu.udistrital.cinepacho.service.impl;

import co.edu.udistrital.cinepacho.model.central.Sede;
import co.edu.udistrital.cinepacho.model.central.sync.SyncMetadata;
import co.edu.udistrital.cinepacho.model.local.compras.Compra;
import co.edu.udistrital.cinepacho.model.local.Inventario;
import co.edu.udistrital.cinepacho.repository.central.SedesRepository;
import co.edu.udistrital.cinepacho.router.SedeMongoRouter;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

//Flujo: SedeMongoRouter -> SyncService -> MongoTemplate central/local -> SedesRepository.
//Uso minimo: sincronizar inventario y compras entre central y sedes.
@Service
@RequiredArgsConstructor
public class SyncService {

    private final SedesRepository sedesRepository;
    private final SedeMongoRouter router;
    private final MongoTemplate centralTemplate;

    //Ejecuta ciclo completo de sincronizacion para cada sede configurada.
    // 5 min
    @Scheduled(fixedDelayString = "${sync.interval.ms:300000}")
    public void runSynchronization() {
        // Cada sede usa su routerKey para obtener un MongoTemplate local independiente.
        List<Sede> sedes = sedesRepository.findAll();
        for (Sede sede : sedes) {
            String routerKey = sede.getRouterKey();
            if (routerKey == null) continue;
            try {
                MongoTemplate local = router.getTemplate(routerKey);
                syncInventarioToLocal(local);
                pushComprasToCentral(local, routerKey);
                pushInventarioToCentral(local, routerKey);
            } catch (Exception e) {
                continue;
            }
        }
    }

    //Empuja compras locales nuevas al repositorio central y actualiza metadata de sincronizacion.
    private void pushComprasToCentral(MongoTemplate local, String routerKey) {
        Query metaQ = new Query(Criteria.where("sedeId").is(routerKey));
        SyncMetadata meta = centralTemplate.findOne(metaQ, SyncMetadata.class, "sync_metadata");
        LocalDateTime since = meta != null ? meta.getLastPushedAt() : null;
        Query q = (since == null) ? new Query() : new Query(Criteria.where("fecha").gt(since));
        List<Compra> compras = local.find(q, Compra.class, "compras");
        for (Compra c : compras) {
            centralTemplate.save(c, "compras");
        }
        SyncMetadata newMeta = SyncMetadata.builder().sedeId(routerKey).lastPushedAt(LocalDateTime.now()).build();
        centralTemplate.save(newMeta, "sync_metadata");
    }

    //Replica inventario central hacia la sede local preservando reservas locales.
    private void syncInventarioToLocal(MongoTemplate local) {
        List<Inventario> inventarioCentral = centralTemplate.findAll(Inventario.class, "inventario");
        for (Inventario inv : inventarioCentral) {
            // Guardar o actualizar en local, manteniendo reservas locales intactas
            Query existeQ = new Query(Criteria.where("_id").is(inv.getId()));
            Inventario existente = local.findOne(existeQ, Inventario.class, "inventario");
            if (existente == null) {
                inv.setReservas(new java.util.ArrayList<>());
                local.save(inv, "inventario");
            } else {
                existente.setCantidad(inv.getCantidad());
                existente.setNombre(inv.getNombre());
                local.save(existente, "inventario");
            }
        }
    }

    //Refresca el inventario central con los cambios ya consolidados en la sede local.
    private void pushInventarioToCentral(MongoTemplate local, String routerKey) {
        List<Inventario> inventarioLocal = local.findAll(Inventario.class, "inventario");
        for (Inventario inv : inventarioLocal) {
            Query centralQ = new Query(Criteria.where("_id").is(inv.getId()));
            Inventario invCentral = centralTemplate.findOne(centralQ, Inventario.class, "inventario");
            if (invCentral != null) {
                invCentral.setCantidad(inv.getCantidad());
                invCentral.setNombre(inv.getNombre());
                centralTemplate.save(invCentral, "inventario");
            }
        }
    }
}
