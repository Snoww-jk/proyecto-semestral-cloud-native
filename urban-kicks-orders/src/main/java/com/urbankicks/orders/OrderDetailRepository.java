package com.urbankicks.orders;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderDetailRepository
        extends JpaRepository<OrderDetail, Long> {

    List<OrderDetail> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);
}