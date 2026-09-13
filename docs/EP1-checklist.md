# Checklist EP1 — Urban Kicks

## Frontend

- [x] Login con Amazon Cognito
- [x] Logout con Amazon Cognito
- [x] OAuth 2.0 Authorization Code Flow
- [x] Integración con `react-oidc-context`
- [x] Lectura de roles desde `cognito:groups`
- [x] `RoleGuard` para control visual por rol
- [x] Envío automático de JWT mediante `apiFetch()`
- [x] Token enviado al BFF a través de API Gateway
- [x] Rol `cliente` verificado
- [x] Rol `admin` verificado
- [x] Rol `colaborador` configurado
- [x] Build de React verificado sin errores

---

## BFF

- [x] Spring Boot
- [x] Spring Security
- [x] OAuth2 Resource Server
- [x] JWT Bearer Authentication
- [x] Validación de issuer
- [x] Validación de firma
- [x] Validación de expiración
- [x] Validación de client/audience
- [x] Autorización por roles
- [x] Rutas públicas
- [x] Rutas protegidas
- [x] Endpoint administrativo `/api/admin/hello`
- [x] Respuesta 401 sin autenticación
- [x] Respuesta 401 con token inválido o expirado
- [x] Respuesta 403 para usuario sin permisos
- [x] Respuesta 200 para usuario autorizado

---

## Roles Cognito

Roles utilizados en el proyecto:

- [x] `admin`
- [x] `cliente`
- [x] `colaborador`

Pruebas verificadas:

- [x] Usuario `cliente` no puede acceder a `/api/admin/hello`
- [x] Usuario `cliente` recibe HTTP 403
- [x] Usuario `admin` puede acceder a `/api/admin/hello`
- [x] Usuario `admin` recibe HTTP 200
- [x] El frontend muestra u oculta funcionalidades según `cognito:groups`

---

## API Gateway

- [x] HTTP API creada
- [x] API desplegada
- [x] Integración con BFF en EC2
- [x] Ruta `ANY /api/{proxy+}`
- [x] Ruta `ANY /api/public/{proxy+}`
- [x] CORS configurado
- [x] JWT Authorizer configurado
- [x] Amazon Cognito configurado como issuer
- [x] Ruta pública probada correctamente
- [x] Ruta protegida probada correctamente
- [x] Comunicación API Gateway → BFF verificada

---

## Microservicios

- [x] BFF
- [x] Orders
- [x] Catalog
- [x] Notify
- [x] Report
- [x] Audit

Puertos:

- [x] BFF `8080`
- [x] Orders `8081`
- [x] Catalog `8082`
- [x] Notify `8083`
- [x] Report `8084`
- [x] Audit `8085`

---

## Persistencia

- [x] PostgreSQL Neon configurado
- [x] Catalog conectado a Neon
- [x] Orders conectado a Neon
- [x] Audit conectado a Neon
- [x] Entidades JPA implementadas
- [x] Repositorios JPA implementados
- [x] Persistencia de productos verificada
- [x] Persistencia de pedidos verificada
- [x] Persistencia de auditoría verificada
- [x] Persistencia después de reiniciar contenedores verificada

Tablas principales:

- [x] `productos`
- [x] `pedidos`
- [x] `detalles_pedido`
- [x] `eventos_auditoria`

---

## Orders

- [x] Consulta de pedidos
- [x] Creación de pedidos
- [x] Actualización de pedidos
- [x] Eliminación de pedidos
- [x] Persistencia en PostgreSQL Neon

---

## Catalog

- [x] Consulta de productos
- [x] Gestión de catálogo
- [x] Gestión de stock
- [x] Persistencia en PostgreSQL Neon

---

## Audit

- [x] Registro de eventos
- [x] Persistencia en PostgreSQL Neon
- [x] Eventos almacenados en `eventos_auditoria`

---

## Report

- [x] Microservicio operativo
- [x] Consumo de datos reales
- [x] Integración con Orders
- [x] Integración con Catalog
- [x] Endpoint `/reports/summary`
- [x] Cantidad de pedidos obtenida desde datos reales
- [x] Total de ventas obtenido desde datos reales
- [x] Productos con stock bajo obtenidos desde datos reales
- [x] Prueba local verificada
- [x] Prueba en EC2 verificada

---

## Notify

- [x] Microservicio operativo
- [x] Integrado en Docker Compose

---

## Docker

- [x] Dockerfiles configurados
- [x] Docker Compose configurado
- [x] Microservicios levantados mediante contenedores
- [x] Comunicación entre servicios verificada
- [x] Reinicio de contenedores probado
- [x] Persistencia externa a los contenedores verificada

---

## EC2

- [x] Instancia EC2 creada
- [x] Docker instalado
- [x] Docker Compose operativo
- [x] Repositorio clonado en EC2
- [x] Microservicios ejecutándose en EC2
- [x] BFF accesible desde API Gateway
- [x] Endpoint público del BFF verificado

---

## Integración End-to-End

- [x] React → Amazon Cognito
- [x] Amazon Cognito → JWT
- [x] React → API Gateway
- [x] API Gateway → BFF
- [x] BFF → Microservicios
- [x] Microservicios → PostgreSQL Neon
- [x] Login funcional
- [x] Logout funcional
- [x] JWT funcional
- [x] Roles funcionales
- [x] CORS funcional
- [x] JWT Authorizer funcional
- [x] Persistencia funcional
- [x] Respuestas 401 verificadas
- [x] Respuesta 403 verificada
- [x] Respuesta 200 verificada

Flujo validado:

```text
React
  ↓
Amazon Cognito
  ↓
AWS API Gateway
  ↓
BFF Spring Boot
  ↓
Microservicios Spring Boot
  ↓
PostgreSQL Neon
