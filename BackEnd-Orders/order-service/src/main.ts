import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { INestApplication, ValidationPipe } from "@nestjs/common"
import { type MicroserviceOptions, Transport } from "@nestjs/microservices"
import { Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

async function connectToKafka(app: INestApplication, retries = 5, delay = 3000) {
  const logger = new Logger('KafkaConnector');
  const configService = app.get(ConfigService);

  for (let i = 0; i < retries; i++) {
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "order-service",
            brokers: configService.get<string>("KAFKA_BROKERS", "kafka:29092").split(","),
            retry: {
              initialRetryTime: 300,
              retries: 5,
              factor: 0.2,
              multiplier: 2,
              maxRetryTime: 30000,
            }
          },
          consumer: {
            groupId: "order-consumer",
          },
          subscribe: {
            fromBeginning: true,
          },
        },
      })

      await app.startAllMicroservices();
      logger.log('Successfully connected to Kafka and ready to handle messages');
      return;
    } catch (err) {
      logger.error(`Attempt ${i + 1}/${retries} - Kafka connection failed: ${err.message}`);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  throw new Error(`Could not connect to Kafka after ${retries} attempts`);
}
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  try {
    // Primero intenta conectar a Kafka
    await connectToKafka(app);

    // Resto de tu configuración
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();

    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle("Order Service API")
      .setDescription("API for managing e-commerce orders")
      .setVersion("1.0")
      .addTag("orders")
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api/docs", app, document)

    // Start microservices
    await app.startAllMicroservices()
    logger.log("Kafka microservice is listening")

    // Start HTTP server
    const configService = app.get(ConfigService);
    const port = configService.get<number>("PORT", 3000);
    await app.listen(port)
    logger.log(`Order service is running on: ${await app.getUrl()}`)
  } catch (err) {
    logger.error('Failed to start application', err);
    process.exit(1);
  }
}

bootstrap()

