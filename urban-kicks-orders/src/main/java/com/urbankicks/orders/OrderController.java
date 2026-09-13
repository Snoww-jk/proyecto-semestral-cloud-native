package com.urbankicks.orders;

import java.util.List;
import java.util.Map;

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

    private final OrderService orderService;

    public OrderController(
            OrderService orderService
    ) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Map<String, Object>> all() {
        return orderService.findAll();
    }

    @GetMapping("/{id}")
    public Map<String, Object> findById(
            @PathVariable Long id
    ) {
        return orderService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(
            @RequestBody Map<String, Object> body
    ) {
        return orderService.create(body);
    }

    @PatchMapping("/{id}/status")
    public Map<String, Object> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return orderService.updateStatus(
                id,
                body
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id
    ) {
        orderService.delete(id);
    }
}