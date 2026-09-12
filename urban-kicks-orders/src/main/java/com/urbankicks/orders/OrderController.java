package com.urbankicks.orders;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final AtomicLong ids = new AtomicLong(1000);

    private final List<Map<String, Object>> orders =
            new ArrayList<>();

    @GetMapping
    public List<Map<String, Object>> all() {
        return orders;
    }

    @GetMapping("/{id}")
    public Map<String, Object> findById(
            @PathVariable long id
    ) {
        return orders.stream()
                .filter(order ->
                        Objects.equals(
                                order.get("id"),
                                id
                        )
                )
                .findFirst()
                .orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(
            @RequestBody Map<String, Object> body
    ) {
        Map<String, Object> order =
                new LinkedHashMap<>(body);

        order.put(
                "id",
                ids.incrementAndGet()
        );

        order.putIfAbsent(
                "status",
                "CREATED"
        );

        orders.add(order);

        return order;
    }

    @PatchMapping("/{id}/status")
    public Map<String, Object> updateStatus(
            @PathVariable long id,
            @RequestBody Map<String, String> body
    ) {
        return orders.stream()
                .filter(order ->
                        Objects.equals(
                                order.get("id"),
                                id
                        )
                )
                .findFirst()
                .map(order -> {
                    order.put(
                            "status",
                            body.get("status")
                    );

                    return order;
                })
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable long id
    ) {
        boolean removed =
                orders.removeIf(order ->
                        Objects.equals(
                                order.get("id"),
                                id
                        )
                );

        if (!removed) {
            throw new RuntimeException(
                    "Pedido no encontrado"
            );
        }
    }
}