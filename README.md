# E-Commerce Microservices

This project implements a microservices architecture for an e-commerce system, focusing on Order and User services. The implementation follows Hexagonal Architecture (Ports and Adapters) and Domain-Driven Design principles.

## Architecture Overview

The system consists of two main microservices:

1. **Order Service**: Manages order creation, status updates, and queries
2. **User Service**: Handles user registration, authentication, and notifications

These services communicate through an event-driven architecture using Kafka.

## Key Features

- **Hexagonal Architecture**: Clear separation between domain logic and infrastructure
- **CQRS Pattern**: Separation of command and query responsibilities
- **Event-Driven Architecture**: Services communicate via events through Kafka
- **Saga Pattern**: Manages distributed transactions across services
- **Circuit Breaker**: Handles failures in service communication
- **JWT Authentication**: Secure API access
- **Email Notifications**: Uses Resend for sending emails to users
- **API Documentation**: Swagger documentation for all endpoints
- **Containerization**: Docker setup for easy deployment

## Technologies Used

- **NestJS**: Framework for building scalable Node.js applications
- **Prisma**: ORM for database access
- **Kafka**: Event streaming platform for service communication
- **PostgreSQL**: Relational database for data persistence
- **Resend**: Email delivery service
- **Docker**: Containerization for consistent deployment
- **Swagger**: API documentation

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce-microservices.git
   cd ecommerce-microservices

