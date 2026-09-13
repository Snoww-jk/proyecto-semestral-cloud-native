# Urban Kicks - Cloud Native Architecture

Proyecto semestral desarrollado para la asignatura **Desarrollo Cloud Native I (DSY1107)**.

Urban Kicks implementa una arquitectura distribuida basada en microservicios, con autenticación y autorización mediante **Amazon Cognito**, exposición segura de APIs mediante **AWS API Gateway**, servicios backend desarrollados con **Spring Boot** y desplegados en **Amazon EC2**, y persistencia de datos en **PostgreSQL Neon**.

---

## Arquitectura

```text
┌───────────────────────────┐
│      React + Vite         │
│      TypeScript           │
└─────────────┬─────────────┘
              │
              │ OAuth 2.0 / Authorization Code
              ▼
┌───────────────────────────┐
│      Amazon Cognito       │
│      User Pool            │
└─────────────┬─────────────┘
              │
              │ JWT Access Token
              ▼
┌───────────────────────────┐
│     AWS API Gateway       │
│     JWT Authorizer        │
│     CORS                  │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     BFF Spring Boot       │
│     Spring Security       │
│          :8080            │
└─────────────┬─────────────┘
              │
      ┌───────┼────────┬────────┬────────┐
      │       │        │        │        │
      ▼       ▼        ▼        ▼        ▼
   Orders  Catalog   Notify   Report   Audit
   :8081   :8082     :8083    :8084   :8085
      │       │                            │
      └───────┴─────────────┬──────────────┘
                            ▼
                    PostgreSQL Neon
```

### Flujo principal

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
```

---

## Stack tecnológico

### Frontend

- React
- TypeScript
- Vite
- react-oidc-context
- OAuth 2.0
- Authorization Code Flow
- JWT Bearer Authentication

### Backend

- Java 21
- Spring Boot
- Spring Security
- OAuth2 Resource Server
- Spring Data JPA
- Gradle

### Infraestructura y Cloud

- Amazon Cognito
- AWS API Gateway
- Amazon EC2
- Docker
- Docker Compose
- PostgreSQL Neon
- GitHub

---

## Estructura del proyecto

```text
proyecto-semestral-cloud-native/
│
├── urban-kicks-react/
│   └── Frontend React + TypeScript
│
├── urban-kicks-bff/
│   └── Backend For Frontend y seguridad
│
├── urban-kicks-orders/
│   └── Microservicio de pedidos
│
├── urban-kicks-catalog/
│   └── Microservicio de catálogo
│
├── urban-kicks-notify/
│   └── Microservicio de notificaciones
│
├── urban-kicks-report/
│   └── Microservicio de reportes
│
├── urban-kicks-audit/
│   └── Microservicio de auditoría
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Microservicios

| Servicio | Puerto | Responsabilidad |
|---|---:|---|
| BFF | 8080 | Punto de entrada al backend, seguridad y comunicación con microservicios |
| Orders | 8081 | Gestión y persistencia de pedidos |
| Catalog | 8082 | Gestión de productos, catálogo y stock |
| Notify | 8083 | Servicio de notificaciones |
| Report | 8084 | Generación de reportes utilizando datos reales |
| Audit | 8085 | Registro y persistencia de eventos de auditoría |

---

# Autenticación y autorización

## Amazon Cognito

Amazon Cognito actúa como proveedor de identidad de la aplicación.

El frontend utiliza la librería:

```text
react-oidc-context
```

para implementar el flujo de autenticación OAuth 2.0 mediante **Authorization Code Flow**.

El flujo general es:

```text
Usuario
  ↓
React
  ↓
Amazon Cognito
  ↓
Autenticación
  ↓
JWT Access Token
  ↓
React
```

El frontend utiliza el Access Token para consumir las APIs protegidas.

---

## Roles

La autorización se implementa mediante grupos configurados en Amazon Cognito.

Los grupos utilizados por Urban Kicks son:

```text
admin
cliente
colaborador
```

Los grupos del usuario son obtenidos desde el claim:

```text
cognito:groups
```

El frontend utiliza estos roles para controlar la visualización de funcionalidades mediante `RoleGuard`.

Por ejemplo, las funciones administrativas o de gestión pueden ser visibles únicamente para usuarios autorizados.

La seguridad no depende exclusivamente del frontend: el backend también valida los roles antes de permitir el acceso a endpoints protegidos.

---

## Envío automático del JWT

Las peticiones realizadas desde React utilizan una función centralizada `apiFetch()`.

Esta función adjunta automáticamente el Access Token:

```http
Authorization: Bearer <access_token>
```

De esta manera, los componentes del frontend no necesitan administrar manualmente el JWT en cada petición.

---

# AWS API Gateway

AWS API Gateway funciona como punto de entrada público para las peticiones realizadas desde el frontend.

La arquitectura de comunicación es:

```text
React
  ↓ HTTPS
AWS API Gateway
  ↓
BFF
  ↓
Microservicios
```

API Gateway se encuentra configurado con:

- HTTP API
- JWT Authorizer
- Amazon Cognito como emisor del JWT
- Ruteo hacia el BFF desplegado en EC2
- Configuración CORS
- Rutas públicas
- Rutas protegidas

---

## JWT Authorizer

Las rutas protegidas utilizan un JWT Authorizer.

Antes de enviar una petición al BFF, API Gateway comprueba la validez del JWT.

El comportamiento esperado es:

| Situación | Respuesta |
|---|---|
| Petición sin JWT a una ruta protegida | 401 Unauthorized |
| JWT inválido o expirado | 401 Unauthorized |
| JWT válido | Petición enviada al BFF |

Esto entrega una primera capa de seguridad antes de que la petición llegue a la instancia EC2.

---

# BFF

El servicio `urban-kicks-bff` funciona como **Backend For Frontend**.

Sus responsabilidades principales son:

- recibir las peticiones provenientes de API Gateway;
- validar nuevamente los JWT;
- aplicar autorización por roles;
- exponer endpoints públicos y protegidos;
- comunicarse con los microservicios internos.

El BFF está desarrollado utilizando:

- Spring Boot
- Spring Security
- OAuth2 Resource Server

---

## Validación JWT en el BFF

El backend realiza validación del token recibido desde Amazon Cognito.

La configuración de seguridad comprueba:

- firma del JWT;
- issuer;
- expiración y vigencia;
- client/audience esperado;
- grupos y roles del usuario.

Esto permite implementar seguridad en profundidad:

```text
JWT
 ↓
API Gateway JWT Authorizer
 ↓
BFF Spring Security
 ↓
Autorización por rol
 ↓
Endpoint
```

Por lo tanto, una petición no depende únicamente de la validación realizada por API Gateway.

---

## Control de acceso por rol

Existen endpoints protegidos según los roles del usuario.

Ejemplo:

```http
GET /api/admin/hello
```

Esta ruta requiere permisos administrativos.

Las pruebas realizadas comprobaron:

| Prueba | Resultado |
|---|---|
| Sin token | HTTP 401 |
| Token inválido o expirado | HTTP 401 |
| Usuario `cliente` accediendo a `/api/admin/hello` | HTTP 403 |
| Usuario `admin` accediendo a `/api/admin/hello` | HTTP 200 |

Respuesta esperada para un administrador:

```text
Acceso administrador
```

Esto demuestra que la autorización se aplica también en el backend y no únicamente mediante la interfaz gráfica.

---

# Frontend React

El frontend principal se encuentra en:

```text
urban-kicks-react/
```

Está desarrollado utilizando React, TypeScript y Vite.

Entre sus responsabilidades se encuentran:

- autenticación mediante Amazon Cognito;
- inicio y cierre de sesión;
- administración de la sesión OIDC;
- lectura de grupos Cognito;
- control visual por roles;
- consumo de API Gateway;
- envío automático del JWT;
- gestión de catálogo;
- gestión de pedidos;
- consumo de servicios backend.

---

## RoleGuard

El frontend implementa un componente `RoleGuard` para restringir visualmente funcionalidades según los grupos del usuario.

Ejemplo conceptual:

```text
admin / colaborador
        ↓
Sección Gestión visible

cliente
        ↓
Sección Gestión oculta
```

`RoleGuard` mejora la experiencia de usuario, mientras que la autorización definitiva se realiza en el backend mediante Spring Security.

---

# Persistencia

Urban Kicks utiliza **PostgreSQL Neon** como base de datos cloud.

Los microservicios que actualmente utilizan persistencia son:

- Catalog
- Orders
- Audit

La persistencia se implementa mediante:

- Spring Data JPA
- entidades JPA
- repositorios
- PostgreSQL

---

## Tablas principales

La base de datos contiene, entre otras, las siguientes tablas:

```text
productos
pedidos
detalles_pedido
eventos_auditoria
```

---

## Persistencia de datos

Se verificó que la información permanece almacenada incluso después de reiniciar los contenedores Docker.

Esto permite separar el ciclo de vida de los microservicios del almacenamiento persistente.

```text
Microservicio
     ↓
Spring Data JPA
     ↓
PostgreSQL Neon
```

---

# Reportes

El microservicio `urban-kicks-report` utiliza información real proveniente de los servicios de pedidos y catálogo.

El endpoint:

```http
GET /reports/summary
```

genera un resumen utilizando información real del sistema.

El reporte incluye:

- cantidad de pedidos;
- total de ventas;
- cantidad de productos con stock bajo.

Esto evita utilizar información simulada para la generación del reporte.

---

# Auditoría

El microservicio `urban-kicks-audit` registra eventos relevantes de la aplicación.

Los eventos son almacenados en PostgreSQL Neon mediante la tabla:

```text
eventos_auditoria
```

Esto permite mantener persistencia de las acciones registradas por el sistema.

---

# Docker

Los servicios backend se ejecutan utilizando Docker y Docker Compose.

## Construir y levantar los servicios

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

## Verificar contenedores

```bash
docker ps
```

## Detener servicios

```bash
docker compose down
```

---

# Ejecución del frontend

Ingresar al directorio:

```bash
cd urban-kicks-react
```

Instalar las dependencias:

```bash
npm install
```

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Por defecto, Vite ejecuta la aplicación localmente en:

```text
http://localhost:5173
```

---

## Build de producción

Para comprobar que el frontend compila correctamente:

```bash
npm run build
```

El resultado de producción es generado en:

```text
dist/
```

---

# Ejecución de microservicios

Los servicios Spring Boot utilizan Gradle.

## Linux

```bash
./gradlew bootRun
```

## Windows

```powershell
gradlew.bat bootRun
```

Cada microservicio debe ejecutarse desde su directorio correspondiente.

---

# Variables de entorno

La configuración sensible del proyecto se administra mediante variables de entorno.

Ejemplos de configuración utilizada:

```text
COGNITO_ISSUER_URI
COGNITO_CLIENT_ID

CATALOG_DB_URL
CATALOG_DB_USER
CATALOG_DB_PASSWORD

ORDERS_DB_URL
ORDERS_DB_USER
ORDERS_DB_PASSWORD

AUDIT_DB_URL
AUDIT_DB_USER
AUDIT_DB_PASSWORD
```

Las credenciales reales no deben almacenarse directamente en el código fuente ni incluirse en GitHub.

---

# Seguridad del repositorio

El archivo `.gitignore` excluye archivos que no deben versionarse.

Entre ellos:

```text
node_modules/
dist/
build/
.gradle/
.env
*.pem
*.key
logs/
```

Esto evita subir:

- dependencias generadas;
- artefactos de compilación;
- archivos temporales;
- variables de entorno;
- certificados;
- claves privadas.

---

# Integración End-to-End

La arquitectura completa verificada es:

```text
┌───────────────────┐
│       React       │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Amazon Cognito    │
│ OAuth 2.0         │
└─────────┬─────────┘
          │ JWT
          ▼
┌───────────────────┐
│ AWS API Gateway   │
│ JWT + CORS        │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Spring Boot BFF   │
│ Spring Security   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Microservicios    │
│ Spring Boot / EC2 │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ PostgreSQL Neon   │
└───────────────────┘
```

---

## Pruebas End-to-End verificadas

Durante el desarrollo se comprobaron las siguientes funcionalidades:

- autenticación mediante Amazon Cognito;
- login OAuth 2.0;
- logout;
- obtención de JWT;
- lectura de grupos Cognito;
- control visual mediante roles;
- envío automático del Access Token;
- comunicación React → API Gateway;
- configuración CORS;
- JWT Authorizer;
- comunicación API Gateway → BFF;
- validación JWT en Spring Security;
- autorización por roles;
- respuesta 401 sin autenticación;
- respuesta 401 con token inválido o expirado;
- respuesta 403 por falta de permisos;
- respuesta 200 para usuario autorizado;
- comunicación BFF → Catalog;
- comunicación BFF → Orders;
- persistencia de productos;
- persistencia de pedidos;
- creación de pedidos;
- actualización de pedidos;
- eliminación de pedidos;
- persistencia después de reiniciar contenedores;
- auditoría persistente;
- servicio de notificaciones;
- reportes generados con información real.

---

# Despliegue

Los microservicios backend se encuentran preparados para ejecutarse en una instancia Amazon EC2 mediante Docker Compose.

El frontend consume el backend a través de AWS API Gateway, evitando acceder directamente a los microservicios desde el navegador.

```text
Frontend
   ↓
API Gateway
   ↓
EC2
   ↓
BFF
   ↓
Microservicios
```

---

# Consideraciones de seguridad

El proyecto utiliza múltiples capas de seguridad:

1. Amazon Cognito autentica al usuario.
2. Cognito genera el JWT.
3. React adjunta el Access Token en las peticiones.
4. API Gateway valida el JWT mediante JWT Authorizer.
5. El BFF vuelve a validar el JWT mediante Spring Security.
6. El BFF aplica autorización según los roles.
7. Los secretos de infraestructura y base de datos se administran fuera del código fuente.

Esta arquitectura evita confiar exclusivamente en controles implementados en el frontend.

---

# Repositorio

Repositorio principal:

https://github.com/Snoww-jk/proyecto-semestral-cloud-native

Rama principal:

```text
main
```

---

# Estado del proyecto

Las principales integraciones Cloud Native se encuentran implementadas y verificadas:

```text
React                 OK
Amazon Cognito        OK
OAuth 2.0             OK
JWT                    OK
Roles Cognito          OK
AWS API Gateway        OK
JWT Authorizer         OK
CORS                   OK
Spring Boot BFF        OK
Spring Security        OK
Microservicios         OK
Docker Compose         OK
Amazon EC2             OK
PostgreSQL Neon        OK
Persistencia           OK
Auditoría              OK
Reportes reales        OK
Integración End-to-End OK
```