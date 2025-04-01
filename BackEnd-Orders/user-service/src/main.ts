import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function connectToKafka(app: INestApplication, retries = 5, delay = 3000) {
  const logger = new Logger('KafkaConnector');
  const configService = app.get(ConfigService);

  for (let i = 0; i < retries; i++) {
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'user-service',
            brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
          },
          consumer: {
            groupId: 'user-consumer',
            allowAutoTopicCreation: true, // Allow auto creation of topics
          },
          subscribe: {
            fromBeginning: true,
          },
         
        },
      });

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

    // Configuración de Swagger
    const config = new DocumentBuilder()
      .setTitle('User Service API')
      .setDescription('API for managing users in e-commerce system')
      .setVersion('1.0')
      .addTag('users')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = app.get(ConfigService).get<number>('PORT', 3001);
    await app.listen(port);
    logger.log(`User service is running on: ${await app.getUrl()}`);
  } catch (err) {
    logger.error('Failed to start application', err);
    process.exit(1);
  }
}

bootstrap();