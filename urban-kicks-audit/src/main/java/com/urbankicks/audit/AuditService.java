package com.urbankicks.audit;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuditService {

    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public List<AuditEvent> findAll() {
        return auditRepository.findAll();
    }

    public AuditEvent create(Map<String, Object> body) {
        Object eventTypeValue = body.get("eventType");
        Object userIdValue = body.get("userId");
        Object descriptionValue = body.get("description");

        if (eventTypeValue == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "eventType es obligatorio"
            );
        }

        if (userIdValue == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "userId es obligatorio"
            );
        }

        if (descriptionValue == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "description es obligatorio"
            );
        }

        AuditEvent event = new AuditEvent();

        event.setEventType(
                eventTypeValue.toString()
        );

        event.setUserId(
                userIdValue.toString()
        );

        event.setDescription(
                descriptionValue.toString()
        );

        event.setCreatedAt(
                LocalDateTime.now()
        );

        return auditRepository.save(event);
    }
}