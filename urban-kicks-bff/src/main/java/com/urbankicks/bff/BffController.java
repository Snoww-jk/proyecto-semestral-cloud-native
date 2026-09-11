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

    @GetMapping("/public/hello")
    public String hello() {
        return "Urban-Kicks API";
    }

    @GetMapping("/private/hello")
    public String privateHello() {
        return "Usuario autenticado";
    }

    @GetMapping("/admin/hello")
    public String adminHello() {
        return "Acceso administrador";
    }

    @GetMapping("/catalog/products")
    public String products() {
        return restClient.get()
                .uri(catalogUrl + "/products")
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

    @GetMapping("/orders")
    public String getOrders() {
        return restClient.get()
                .uri(ordersUrl + "/orders")
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
}
