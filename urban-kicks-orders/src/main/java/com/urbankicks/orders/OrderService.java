package com.urbankicks.orders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
    }

    public List<Map<String, Object>> findAll() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Map<String, Object> findById(Long id) {
        Order order = getOrder(id);
        return toResponse(order);
    }

    @Transactional
    public Map<String, Object> create(
            Map<String, Object> body
    ) {
        Long productId = getLong(body, "productId");
        Integer quantity = getInteger(body, "quantity");
        BigDecimal price = getBigDecimal(body, "price");

        String userId = String.valueOf(
                body.getOrDefault(
                        "userId",
                        "usuario-demo"
                )
        );

        BigDecimal total = price.multiply(
                BigDecimal.valueOf(quantity)
        );

        Order order = new Order();

        order.setUserId(userId);
        order.setStatus(
                String.valueOf(
                        body.getOrDefault(
                                "status",
                                "CREATED"
                        )
                )
        );
        order.setTotal(total);
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder =
                orderRepository.save(order);

        OrderDetail detail = new OrderDetail();

        detail.setOrder(savedOrder);
        detail.setProductId(productId);
        detail.setQuantity(quantity);
        detail.setPrice(price);

        orderDetailRepository.save(detail);

        return toResponse(savedOrder);
    }

    @Transactional
    public Map<String, Object> updateStatus(
            Long id,
            Map<String, String> body
    ) {
        Order order = getOrder(id);

        String status = body.get("status");

        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado es obligatorio"
            );
        }

        order.setStatus(status);

        Order savedOrder =
                orderRepository.save(order);

        return toResponse(savedOrder);
    }

    @Transactional
    public void delete(Long id) {
        Order order = getOrder(id);

        orderDetailRepository
                .deleteByOrderId(id);

        orderRepository.delete(order);
    }

    private Order getOrder(Long id) {
        return orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pedido no encontrado"
                        )
                );
    }

    private Map<String, Object> toResponse(
            Order order
    ) {
        List<OrderDetail> details =
                orderDetailRepository
                        .findByOrderId(
                                order.getId()
                        );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", order.getId());
        response.put(
                "userId",
                order.getUserId()
        );
        response.put(
                "status",
                order.getStatus()
        );
        response.put(
                "total",
                order.getTotal()
        );
        response.put(
                "createdAt",
                order.getCreatedAt()
        );

        if (!details.isEmpty()) {
            OrderDetail detail =
                    details.get(0);

            response.put(
                    "productId",
                    detail.getProductId()
            );

            response.put(
                    "quantity",
                    detail.getQuantity()
            );

            response.put(
                    "price",
                    detail.getPrice()
            );
        }

        return response;
    }

    private Long getLong(
            Map<String, Object> body,
            String key
    ) {
        Object value = body.get(key);

        if (value == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    key + " es obligatorio"
            );
        }

        return Long.valueOf(
                value.toString()
        );
    }

    private Integer getInteger(
            Map<String, Object> body,
            String key
    ) {
        Object value = body.get(key);

        if (value == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    key + " es obligatorio"
            );
        }

        return Integer.valueOf(
                value.toString()
        );
    }

    private BigDecimal getBigDecimal(
            Map<String, Object> body,
            String key
    ) {
        Object value = body.get(key);

        if (value == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    key + " es obligatorio"
            );
        }

        return new BigDecimal(
                value.toString()
        );
    }
}