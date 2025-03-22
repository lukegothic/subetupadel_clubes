# Documentación Técnica - Aplicación de Gestión de Clubes de Pádel

## Índice
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Modelo de Datos](#modelo-de-datos)
5. [API REST](#api-rest)
6. [Sistema de Matchmaking](#sistema-de-matchmaking)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
8. [Integración con Aplicación Existente](#integración-con-aplicación-existente)
9. [Despliegue](#despliegue)
10. [Mantenimiento](#mantenimiento)

## Arquitectura del Sistema

La aplicación de Gestión de Clubes de Pádel sigue una arquitectura cliente-servidor con separación clara entre frontend y backend:

- **Frontend**: Aplicación SPA (Single Page Application) desarrollada con React.js
- **Backend**: API REST desarrollada con Node.js y Express.js
- **Base de Datos**: PostgreSQL con esquemas separados para entornos de desarrollo, demo y producción
- **Despliegue**: Servidor VPS con Ubuntu Server, Nginx como proxy inverso y PM2 como gestor de procesos

![Diagrama de Arquitectura](./images/architecture.png)

## Tecnologías Utilizadas

### Frontend
- **React.js**: Biblioteca para construir interfaces de usuario
- **Redux**: Gestión del estado de la aplicación
- **Material UI**: Framework de componentes visuales con estilo glassmorphism
- **React Router**: Enrutamiento del lado del cliente
- **Axios**: Cliente HTTP para comunicación con el backend
- **React Beautiful DnD**: Funcionalidad de arrastrar y soltar para el creador de partidos

### Backend
- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor
- **Express.js**: Framework web para Node.js
- **Sequelize**: ORM para interactuar con la base de datos PostgreSQL
- **JWT**: Autenticación basada en tokens
- **ts-trueskill**: Implementación del algoritmo TrueSkill para el matchmaking
- **bcrypt**: Encriptación de contraseñas

### Base de Datos
- **PostgreSQL**: Sistema de gestión de bases de datos relacional
- **UUID**: Identificadores únicos para todas las entidades

### Despliegue
- **Ubuntu Server**: Sistema operativo del servidor
- **Nginx**: Servidor web y proxy inverso
- **PM2**: Gestor de procesos para Node.js
- **Let's Encrypt**: Certificados SSL

## Estructura del Proyecto

```
stp-clubes/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de la aplicación
│   │   ├── controllers/    # Controladores de la API
│   │   ├── middleware/     # Middleware (autenticación, etc.)
│   │   ├── models/         # Modelos de datos (Sequelize)
│   │   ├── routes/         # Rutas de la API
│   │   ├── utils/          # Utilidades y helpers
│   │   └── server.js       # Punto de entrada de la aplicación
│   ├── tests/              # Pruebas unitarias y de integración
│   ├── .env.development    # Variables de entorno para desarrollo
│   ├── .env.demo           # Variables de entorno para demo
│   ├── .env.production     # Variables de entorno para producción
│   ├── ecosystem.config.js # Configuración de PM2
│   └── package.json        # Dependencias del backend
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── store/          # Estado global (Redux)
│   │   ├── services/       # Servicios para comunicación con API
│   │   ├── utils/          # Utilidades y helpers
│   │   ├── styles/         # Estilos CSS
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Punto de entrada
│   ├── tests/              # Pruebas unitarias
│   ├── public/             # Archivos estáticos
│   └── package.json        # Dependencias del frontend
├── database/
│   ├── schema.sql          # Esquema de la base de datos
│   ├── extension_schema.sql # Extensiones del esquema
│   ├── migration.sql       # Script de migración
│   └── sqlalchemy_models_extension.py # Extensiones para SQLAlchemy
├── deployment/
│   ├── nginx.conf          # Configuración de Nginx
│   ├── deploy.sh           # Script de despliegue
│   └── prepare_package.sh  # Script para preparar paquete de despliegue
└── docs/
    ├── manual_usuario.md   # Manual de usuario
    ├── documentacion_tecnica.md # Documentación técnica
    └── guia_instalacion.md # Guía de instalación
```

## Modelo de Datos

La aplicación utiliza una base de datos PostgreSQL con el siguiente modelo de datos:

### Entidades Principales

- **players**: Jugadores registrados en el sistema
- **clubs**: Clubes de pádel
- **matches**: Partidos jugados o programados
- **events**: Eventos y actividades organizadas por los clubes
- **tournaments**: Torneos organizados por los clubes

### Entidades de Relación

- **match_players**: Relación entre partidos y jugadores
- **event_participants**: Participantes en eventos
- **tournament_matches**: Partidos de un torneo

### Entidades Específicas para Matchmaking

- **player_availability**: Disponibilidad de los jugadores
- **match_requests**: Solicitudes de partidos
- **match_request_players**: Jugadores que solicitan partidos
- **matchmaking_suggestions**: Sugerencias generadas por el algoritmo
- **matchmaking_settings**: Configuración del sistema de matchmaking

### Entidades para Administración

- **club_admins**: Administradores de clubes

El modelo completo se puede consultar en los archivos `schema.sql` y `extension_schema.sql`.

## API REST

La API REST del backend sigue una estructura RESTful con los siguientes endpoints principales:

### Autenticación

- `POST /api/auth/login`: Iniciar sesión
- `GET /api/auth/profile`: Obtener perfil del usuario autenticado
- `PUT /api/auth/profile`: Actualizar perfil del usuario

### Jugadores

- `GET /api/players`: Listar jugadores
- `GET /api/players/:id`: Obtener detalles de un jugador
- `GET /api/players/:id/stats`: Obtener estadísticas de un jugador
- `GET /api/players/:id/matches`: Obtener partidos de un jugador

### Partidos

- `GET /api/matches`: Listar partidos
- `GET /api/matches/:id`: Obtener detalles de un partido
- `POST /api/matches`: Crear un nuevo partido
- `PUT /api/matches/:id`: Actualizar un partido
- `DELETE /api/matches/:id`: Eliminar un partido

### Matchmaking

- `POST /api/matches/matchmaking/suggestions`: Generar sugerencias de matchmaking
- `POST /api/matches/matchmaking/suggestions/:id/accept`: Aceptar una sugerencia
- `POST /api/matches/matchmaking/suggestions/:id/reject`: Rechazar una sugerencia
- `GET /api/matches/requests`: Listar solicitudes de partidos
- `POST /api/matches/requests`: Crear una solicitud de partido

### Eventos y Torneos

- `GET /api/events`: Listar eventos
- `GET /api/events/:id`: Obtener detalles de un evento
- `POST /api/events`: Crear un nuevo evento
- `PUT /api/events/:id`: Actualizar un evento
- `DELETE /api/events/:id`: Eliminar un evento
- `GET /api/events/tournaments`: Listar torneos
- `POST /api/events/tournaments`: Crear un nuevo torneo

Todos los endpoints que modifican datos requieren autenticación mediante JWT.

## Sistema de Matchmaking

El sistema de matchmaking es una de las características principales de la aplicación y utiliza el algoritmo TrueSkill para crear partidos equilibrados.

### Algoritmo TrueSkill

TrueSkill es un sistema de clasificación bayesiano desarrollado por Microsoft Research. Cada jugador tiene dos parámetros:

- **μ (mu)**: Representa el nivel medio estimado del jugador
- **σ (sigma)**: Representa la incertidumbre sobre ese nivel

El nivel TrueSkill se calcula como: `TrueSkill = μ - 3σ`

### Proceso de Matchmaking

1. **Recopilación de Datos**: Se obtienen los jugadores disponibles con sus valores de μ y σ
2. **Generación de Combinaciones**: Se generan todas las posibles combinaciones de 4 jugadores
3. **Formación de Equipos**: Para cada combinación, se prueban diferentes formaciones de equipos
4. **Cálculo de Equilibrio**: Se calcula la calidad del partido (probabilidad de empate) para cada formación
5. **Filtrado**: Se aplican filtros adicionales (lado preferido, género, etc.)
6. **Ordenación**: Se ordenan las sugerencias por calidad de partido
7. **Presentación**: Se presentan las mejores sugerencias al usuario

### Implementación

La implementación utiliza la biblioteca `ts-trueskill` para los cálculos del algoritmo TrueSkill:

```javascript
const { TrueSkill, Rating, quality } = require('ts-trueskill');

// Configurar TrueSkill
const trueskill = new TrueSkill();

// Crear ratings para los jugadores
const player1Rating = new Rating(player1.mu, player1.sigma);
const player2Rating = new Rating(player2.mu, player2.sigma);
const player3Rating = new Rating(player3.mu, player3.sigma);
const player4Rating = new Rating(player4.mu, player4.sigma);

// Calcular calidad del partido (probabilidad de empate)
const matchQuality = quality([
  [player1Rating, player2Rating],
  [player3Rating, player4Rating]
]);

// Convertir a porcentaje
const balanceScore = Math.round(matchQuality * 100);
```

## Autenticación y Seguridad

La aplicación utiliza JWT (JSON Web Tokens) para la autenticación de usuarios:

1. **Inicio de Sesión**: El usuario proporciona sus credenciales y recibe un token JWT
2. **Almacenamiento**: El token se almacena en localStorage en el cliente
3. **Autorización**: Cada solicitud a la API incluye el token en el encabezado Authorization
4. **Verificación**: El middleware de autenticación verifica la validez del token
5. **Acceso**: Si el token es válido, se permite el acceso al recurso solicitado

### Seguridad Adicional

- **Contraseñas**: Se almacenan utilizando bcrypt para el hash
- **HTTPS**: Toda la comunicación se realiza a través de HTTPS
- **CORS**: Configuración adecuada para permitir solo orígenes conocidos
- **Validación**: Validación de entrada en todos los endpoints
- **Rate Limiting**: Limitación de tasa para prevenir ataques de fuerza bruta

## Integración con Aplicación Existente

La aplicación de gestión de clubes de pádel se integra con una aplicación existente para jugadores:

1. **Base de Datos Compartida**: Ambas aplicaciones utilizan la misma base de datos PostgreSQL
2. **Esquemas Separados**: Se utilizan esquemas separados (dev, demo, prod) para diferentes entornos
3. **Compatibilidad de Modelos**: Los modelos de datos son compatibles entre ambas aplicaciones
4. **Extensiones**: Se han creado extensiones del modelo SQLAlchemy para la aplicación existente

### Sincronización de Datos

- La aplicación de jugadores actualiza los valores de μ y σ después de cada partido
- La aplicación de clubes lee estos valores para el matchmaking
- Los cambios en la estructura de la base de datos se realizan mediante scripts de migración compatibles

## Despliegue

La aplicación está diseñada para ser desplegada en un servidor VPS con Ubuntu Server 22.04 LTS:

### Requisitos del Servidor

- **CPU**: 2 núcleos o más
- **RAM**: 4GB o más
- **Almacenamiento**: 20GB o más
- **Sistema Operativo**: Ubuntu Server 22.04 LTS
- **Base de Datos**: PostgreSQL 14 o superior

### Proceso de Despliegue

1. **Preparación**: Ejecutar el script `prepare_package.sh` para crear el paquete de despliegue
2. **Transferencia**: Transferir el paquete al servidor VPS
3. **Instalación**: Ejecutar el script `deploy.sh` en el servidor
4. **Configuración**: Configurar las variables de entorno y la base de datos
5. **Certificado SSL**: Configurar Let's Encrypt para HTTPS
6. **Verificación**: Comprobar que la aplicación funciona correctamente

### Monitorización

- **PM2**: Monitorización de procesos Node.js
- **Nginx Logs**: Logs de acceso y errores
- **Application Logs**: Logs específicos de la aplicación

## Mantenimiento

### Actualizaciones

Para actualizar la aplicación:

1. Preparar un nuevo paquete de despliegue
2. Transferirlo al servidor
3. Ejecutar el script de despliegue con la opción de actualización

### Copias de Seguridad

Se recomienda configurar copias de seguridad automáticas:

- **Base de Datos**: Copias de seguridad diarias con `pg_dump`
- **Archivos de Configuración**: Copias de seguridad después de cada cambio
- **Logs**: Rotación de logs para evitar que ocupen demasiado espacio

### Escalabilidad

La aplicación está diseñada para escalar horizontalmente:

- **PM2 Cluster Mode**: Permite ejecutar múltiples instancias del backend
- **Nginx Load Balancing**: Puede configurarse para distribuir la carga entre instancias
- **Base de Datos**: Puede configurarse replicación para mayor rendimiento

---

Esta documentación técnica proporciona una visión general de la arquitectura y funcionamiento de la aplicación. Para más detalles sobre componentes específicos, consulte los comentarios en el código fuente.
