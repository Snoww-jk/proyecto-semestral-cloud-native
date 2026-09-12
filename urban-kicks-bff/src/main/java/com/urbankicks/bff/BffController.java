package com.urbankicks.bff;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api")
public class BffController {

    private final RestClient restClient = RestClient.create();

    @Value("${urban-kicks.services.catalog}")
    private String catalogUrl;

    @Value("${urban-kicks.services.orders}")
    private String ordersUrl;

    @Value("${urban-kicks.services.notify}")
    private String notifyUrl;

    @Value("${urban-kicks.services.report}")
    private String reportUrl;

    @Value("${urban-kicks.services.audit}")
    private String auditUrl;

    // PUBLICO
    @GetMapping("/public/hello")
    public String hello() {
        return "Urban-Kicks API";
    }

    // USUARIO AUTENTICADO
    @GetMapping("/private/hello")
    public String privateHello() {
        return "Usuario autenticado";
    }

    // ADMIN
    @GetMapping("/admin/hello")
    public String adminHello() {
        return "Acceso administrador";
    }

    // =========================
    // CATALOGO
    // =========================

    @GetMapping("/catalog/products")
    public String products() {
        return restClient.get()
                .uri(catalogUrl + "/products")
                .retrieve()
                .body(String.class);
    }

    @GetMapping("/catalog/products/{id}")
    public String productById(@PathVariable Long id) {
        return restClient.get()
                .uri(catalogUrl + "/products/" + id)
                .retrieve()
                .body(String.class);
    }

    // =========================
    // PEDIDOS
    // =========================

    @GetMapping("/orders")
    public String getOrders() {
        return restClient.get()
                .uri(ordersUrl + "/orders")
                .retrieve()
                .body(String.class);
    }

    @PostMapping("/orders")
    public String createOrder(@RequestBody String body) {
        return restClient.post()
                .uri(ordersUrl + "/orders")
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    @PatchMapping("/orders/{id}/status")
    public String updateOrderStatus(
            @PathVariable Long id,
            @RequestBody String body
    ) {
        return restClient.patch()
                .uri(ordersUrl + "/orders/" + id + "/status")
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    // =========================
    // NOTIFICACIONES
    // =========================

    @PostMapping("/notifications")
    public String createNotification(@RequestBody String body) {
        return restClient.post()
                .uri(notifyUrl + "/notifications")
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }

    // =========================
    // REPORTES
    // =========================

    @GetMapping("/reports/summary")
    public String getReportSummary() {
        return restClient.get()
                .uri(reportUrl + "/reports/summary")
                .retrieve()
                .body(String.class);
    }

    // =========================
    // AUDITORIA
    // =========================

    @GetMapping("/audit")
    public String getAudit() {
        return restClient.get()
                .uri(auditUrl + "/audit")
                .retrieve()
                .body(String.class);
    }

    @PostMapping("/audit")
    public String createAudit(@RequestBody String body) {
        return restClient.post()
                .uri(auditUrl + "/audit")
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
    }
}