package com.urbankicks.audit;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "eventos_auditoria")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_evento", nullable = false)
    private String eventType;

    @Column(name = "id_usuario", nullable = false)
    private String userId;

    @Column(name = "descripcion", nullable = false)
    private String description;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdAt;

    public AuditEvent() {
    }

    public AuditEvent(
            Long id,
            String eventType,
            String userId,
            String description,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.eventType = eventType;
        this.userId = userId;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}