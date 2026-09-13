package com.urbankicks.report;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final String ordersUrl;
    private final String catalogUrl;

    public ReportController(
            @Value("${ORDERS_URL:http://localhost:8081}") String ordersUrl,
            @Value("${CATALOG_URL:http://localhost:8082}") String catalogUrl) {

        this.ordersUrl = ordersUrl;
        this.catalogUrl = catalogUrl;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {

        RestClient restClient = RestClient.create();

        List<Map<String, Object>> orders = restClient
                .get()
                .uri(ordersUrl + "/orders")
                .retrieve()
                .body(List.class);

        List<Map<String, Object>> products = restClient
                .get()
                .uri(catalogUrl + "/products")
                .retrieve()
                .body(List.class);

        int totalOrders = orders == null ? 0 : orders.size();

        BigDecimal totalSales = BigDecimal.ZERO;

        if (orders != null) {
            for (Map<String, Object> order : orders) {

                Object totalValue = order.get("total");

                if (totalValue != null) {
                    totalSales = totalSales.add(
                            new BigDecimal(totalValue.toString())
                    );
                }
            }
        }

        int lowStockProducts = 0;

        if (products != null) {
            for (Map<String, Object> product : products) {

                Object stockValue = product.get("stock");

                if (stockValue != null) {
                    int stock = Integer.parseInt(stockValue.toString());

                    if (stock <= 5) {
                        lowStockProducts++;
                    }
                }
            }
        }

        Map<String, Object> report = new LinkedHashMap<>();

        report.put("orders", totalOrders);
        report.put("sales", totalSales);
        report.put("lowStockProducts", lowStockProducts);

        return report;
    }
}