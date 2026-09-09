package com.urbankicks.bff;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api")
public class BffController {

    private final RestClient restClient = RestClient.create();

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
                .uri("http://localhost:8082/products")
                .retrieve()
                .body(String.class);
    }

    @PostMapping("/orders")
    public String createOrder(@RequestBody String body) {
        return restClient.post()
            .uri("http://localhost:8081/orders")
            .header("Content-Type", "application/json")
            .body(body)
            .retrieve()
            .body(String.class);
    }

    @GetMapping("/orders")
    public String getOrders() {
        return restClient.get()
            .uri("http://localhost:8081/orders")
            .retrieve()
            .body(String.class);
    }
}