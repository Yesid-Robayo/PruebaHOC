# Proyecto PruebaHOC

## Descripción
Este proyecto es un sistema basado en microservicios para la gestión de pedidos. Incluye un backend desarrollado con NestJS y un frontend construido en Angular.

## Características
- Arquitectura basada en microservicios
- Backend desarrollado con NestJS
- Arquitectura hexagonal en el backend
- Frontend construido con Angular basado en Atomic Design
- Autenticación de usuarios con JWT
- Envío de correos electrónicos en la creación de pedidos y cambios de estado
- Integración con Docker para despliegue
- Configuración centralizada con Docker Compose
- Pruebas automatizadas con Jest
- Manejo de errores y logs estructurados


## Estructura del Proyecto

```
PruebaHOC-main/
├── BackEnd-Orders-Orders/
│   ├── order-service/  # Servicio de pedidos (Prueba Principal)
│   ├── user-service/ # Servicio de usuarios (Complemento)
├── FrontEnd-TodoList/
│   ├── src/  # Código fuente del frontend
├── docker-compose.yml  # Configuración para ejecutar los servicios con Docker
├── README.md  # Documentación del proyecto
```

## Requisitos Previos
Para ejecutar este proyecto, necesitas tener instalados los siguientes programas:
- Docker y Docker Compose
- Node.js (versión recomendada 18+)
- npm o yarn
- Angular CLI (versión recomendada 15+)

## Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/tu-usuario/PruebaHOC.git
   ```

2. Ingresa al directorio del proyecto:
   ```sh
   cd PruebaHOC-main
   ```

3. Instala las dependencias en cada servicio:
   ```sh
   cd BackEnd-Orders/order-service && npm install
   ```
   (Repite este paso para cada servicio necesario)

4. Instala las dependencias del frontend:
   ```sh
   cd FrontEnd-TodoList && npm install
   ```

## Uso
Para ejecutar los servicios con Docker, usa el siguiente comando en la raiz del proyecto donde se encuentra el archivo docker-compose:
```sh
docker-compose up --build
```

Para ejecutar los servicios manualmente:
```sh
cd BackEnd-Orders/order-service
npm run start:dev
```


## Ejecución de Pruebas
Antes de ejecutar las pruebas, asegúrate de que Docker esté en ejecución con PostgreSQL y Kafka:
```sh
docker-compose up -d user-db order-db kafka
```

Además, actualiza el archivo `.env` para configurar todos los servicios en `localhost`:

- Order-Service
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_db
KAFKA_BROKERS=localhost:29092
```
- User-Service
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/user_db
KAFKA_BROKERS=localhost:29092
```

Para ejecutar las pruebas, usa el siguiente comando dentro de cada servicio:
```sh
npm run test
```

## Autor
Desarrollado por Yesid Robayo.

