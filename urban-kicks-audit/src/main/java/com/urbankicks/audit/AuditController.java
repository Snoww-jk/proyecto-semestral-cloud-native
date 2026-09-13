package com.urbankicks.audit;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AuditEvent add(
            @RequestBody Map<String, Object> body
    ) {
        return auditService.create(body);
    }

    @GetMapping
    public List<AuditEvent> all() {
        return auditService.findAll();
    }
}