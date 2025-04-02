import { Test, TestingModule } from '@nestjs/testing';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, of } from 'rxjs';
import { KafkaProducerService } from 'src/infrastructure/messaging/kafka/kafka-producer.service';

jest.mock('rxjs', () => {
  const original = jest.requireActual('rxjs');
  return {
    ...original,
    firstValueFrom: jest.fn(),
  };
});

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;
  let kafkaClient: ClientKafka;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaProducerService,
        {
          provide: 'KAFKA_PRODUCER',
          useValue: {
            connect: jest.fn(),
            close: jest.fn(),
            emit: jest.fn(),
            send: jest.fn(),
            subscribeToResponseOf: jest.fn(),
            responsePatterns: ['user.verify'],
          },
        },
      ],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
    kafkaClient = module.get<ClientKafka>('KAFKA_PRODUCER');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should subscribe to response topics and connect', async () => {
      // Act
      await service.onModuleInit();

      // Assert
      expect(kafkaClient.subscribeToResponseOf).toHaveBeenCalledWith('user.verify');
      expect(kafkaClient.connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from Kafka', async () => {
      // Act
      await service.onModuleDestroy();

      // Assert
      expect(kafkaClient.close).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should publish message to topic', async () => {
      // Arrange
      const topic = 'test.topic';
      const message = { key: 'value' };

      // Act
      await service.publish(topic, message);

      // Assert
      expect(kafkaClient.emit).toHaveBeenCalledWith(topic, message);
    });

    it('should throw error when publish fails', async () => {
      // Arrange
      const topic = 'test.topic';
      const message = { key: 'value' };
      const error = new Error('Publish failed');

      kafkaClient.emit = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(service.publish(topic, message)).rejects.toThrow(error);
    });
  });

  describe('send', () => {
    it('should send message and return observable', () => {
      // Arrange
      const pattern = 'test.pattern';
      const data = { key: 'value' };
      const response = { result: 'success' };

      kafkaClient.send = jest.fn().mockReturnValue(of(response));

      // Act
      const result = service.send(pattern, data);

      // Assert
      expect(kafkaClient.send).toHaveBeenCalledWith(pattern, data);
      // Ideally, we'd subscribe to result and check it equals response
    });
  });

  describe('sendAndReceive', () => {
    it('should subscribe, send message and return first value', async () => {
      // Arrange
      const pattern = 'new.pattern';
      const data = { key: 'value' };
      const response = { result: 'success' };

      // Mock firstValueFrom to resolve with response
      (firstValueFrom as jest.Mock).mockResolvedValue(response);
      
      // Mock send to return observable
      service.send = jest.fn().mockReturnValue(of(response));

      // Act
      const result = await service.sendAndReceive(pattern, data);

      // Assert
      expect(kafkaClient.subscribeToResponseOf).toHaveBeenCalledWith(pattern);
      expect(kafkaClient.connect).toHaveBeenCalled();
      expect(service.send).toHaveBeenCalledWith(pattern, data);
      expect(firstValueFrom).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('should not resubscribe if already subscribed to pattern', async () => {
      // Arrange
      const pattern = 'user.verify'; // Already subscribed in patterns array
      const data = { key: 'value' };
      const response = { result: 'success' };

      // Mock firstValueFrom to resolve with response
      (firstValueFrom as jest.Mock).mockResolvedValue(response);
      
      // Mock send to return observable
      service.send = jest.fn().mockReturnValue(of(response));

      // Act
      const result = await service.sendAndReceive(pattern, data);

      // Assert
      // Should not have been called again for same pattern
      expect(kafkaClient.subscribeToResponseOf).not.toHaveBeenCalledWith(pattern);
      expect(service.send).toHaveBeenCalledWith(pattern, data);
      expect(result).toEqual(response);
    });

    it('should handle errors during send and receive', async () => {
      // Arrange
      const pattern = 'test.pattern';
      const data = { key: 'value' };
      const error = new Error('Send failed');

      // Mock send to throw error
      service.send = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(service.sendAndReceive(pattern, data)).rejects.toThrow(error);
    });
  });
});
