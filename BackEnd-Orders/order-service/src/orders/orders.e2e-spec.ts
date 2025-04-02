import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { v4 as uuidv4 } from 'uuid';
import { ORDER_REPOSITORY, OrderRepository } from 'src/orders/domain/ports/order.repository.port';
import { OrderEventPublisher } from 'src/infrastructure/messaging/kafka/publishers/order-event.publisher';
import { OrdersModule } from 'src/orders/orders.module';
import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { ORDER_EVENT_PUBLISHER } from 'src/orders/domain/ports/order-event.publisher.port';
import { CircuitBreakerService } from 'src/infrastructure/resilience/circuit-breaker/circuit-breaker.service';


// Mock JWT auth guard to always pass
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

// Mock repositories and services
const mockOrderRepository: Partial<OrderRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  delete: jest.fn(),
};

const mockOrderEventPublisher: Partial<OrderEventPublisher> = {
  publishOrderCreated: jest.fn(),
  publishOrderStatusChanged: jest.fn(),
};

const mockKafkaProducerService = {
  publish: jest.fn(),
  sendAndReceive: jest.fn(),
  send: jest.fn(),
};

const mockCircuitBreakerService = {
  execute: jest.fn(),
};

describe('Orders E2E', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, OrdersModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .overrideProvider(ORDER_REPOSITORY)
      .useValue(mockOrderRepository)
      .overrideProvider(ORDER_EVENT_PUBLISHER)
      .useValue(mockOrderEventPublisher)
      .overrideProvider('KAFKA_SERVICE')
      .useValue(mockKafkaProducerService)
      .overrideProvider(CircuitBreakerService)
      .useValue(mockCircuitBreakerService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock JWT token
    jwtToken = 'test-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Reset mock implementations before each test
    jest.clearAllMocks();
  });

  describe('Creating an order', () => {
    it('should create a new order successfully', async () => {
      // Arrange
      const orderId = uuidv4();
      const userId = uuidv4();
      
      // Mock user verification to succeed
      mockCircuitBreakerService.execute.mockResolvedValue(true);
      
      // Mock order save to return an order with the generated ID
      if (!mockOrderRepository.save) {
        throw new Error('mockOrderRepository.save is not defined');
      }
      (mockOrderRepository.save as jest.Mock).mockImplementation((order) => {
        return Promise.resolve({
          ...order,
          id: { value: orderId },
        });
      });
      
      // Prepare the order creation payload
      const createOrderDto = {
        userId: userId,
        items: [
          {
            productId: uuidv4(),
            quantity: 2,
            price: 29.99
          }
        ]
      };
      
      // Act & Assert
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createOrderDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 201);
          expect(res.body).toHaveProperty('orderId');
        });
        
      // Verify that user verification was called
      expect(mockCircuitBreakerService.execute).toHaveBeenCalled();
      
      // Verify that the order was saved
      expect(mockOrderRepository.save).toHaveBeenCalled();
      
      // Verify that order created event was published
      expect(mockOrderEventPublisher.publishOrderCreated).toHaveBeenCalled();
    });
    
    it('should return 400 if user does not exist', async () => {
      // Arrange
      const userId = uuidv4();
      
      // Mock user verification to fail
      mockCircuitBreakerService.execute.mockResolvedValue(false);
      
      // Prepare the order creation payload
      const createOrderDto = {
        userId: userId,
        items: [
          {
            productId: uuidv4(),
            quantity: 1,
            price: 19.99
          }
        ]
      };
      
      // Act & Assert
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createOrderDto)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
        
      // Verify that user verification was called
      expect(mockCircuitBreakerService.execute).toHaveBeenCalled();
      
      // Verify that the order was not saved
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
  });
  
  describe('Getting orders', () => {
    it('should get order by ID', async () => {
      // Arrange
      const orderId = uuidv4();
      const mockOrder = {
        id: { value: orderId },
        userId: { value: uuidv4() },
        status: { value: 'PENDING' },
        items: [],
        totalAmount: { amount: 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock repository response
      if (!mockOrderRepository.findById) {
        throw new Error('mockOrderRepository.findById is not defined');
      }
      (mockOrderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      
      // Act & Assert
      await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('order');
          expect(res.body.order).toHaveProperty('id', orderId);
        });
        
      // Verify that findById was called
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(expect.any(orderId));
    });
    
    it('should get orders by user ID', async () => {
      // Arrange
      const userId = uuidv4();
      const mockOrders = [
        {
          id: { value: uuidv4() },
          userId: { value: userId },
          status: { value: 'PENDING' },
          items: [],
          totalAmount: { amount: 100 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: { value: uuidv4() },
          userId: { value: userId },
          status: { value: 'DELIVERED' },
          items: [],
          totalAmount: { amount: 200 },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      // Mock repository response
      (mockOrderRepository.findByUserId as jest.Mock).mockResolvedValue(mockOrders);
      
      // Act & Assert
      await request(app.getHttpServer())
        .get(`/orders?userId=${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('orders');
          expect(res.body.orders).toBeInstanceOf(Array);
          expect(res.body.orders).toHaveLength(2);
        });
        
      // Verify that findByUserId was called
      expect(mockOrderRepository.findByUserId).toHaveBeenCalled();
    });
  });
  
describe('Updating order status', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const orderId = uuidv4();
      
      // Create a mock order with methods
      const mockOrder = {
        id: { value: orderId },
        userId: { value: uuidv4() },
        status: { value: 'PENDING' },
        items: [],
        totalAmount: { amount: 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
        updateStatus: jest.fn(),
        commit: jest.fn(),
      };
      
      // Mock repository responses
      (mockOrderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      (mockOrderRepository.save as jest.Mock).mockResolvedValue(mockOrder);
      
      // After update, the status will be PROCESSING
      const updatedOrder = {
        ...mockOrder,
        status: { value: 'PROCESSING' },
      };
      
      // For the second findById after update
      (mockOrderRepository.findById as jest.Mock).mockResolvedValueOnce(updatedOrder);
      
      // Act & Assert
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ status: 'PROCESSING' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('order');
          expect(res.body.order).toHaveProperty('status', 'PROCESSING');
        });
        
      // Verify that findById was called to get the order
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      
      // Verify that the order was updated and saved
      expect(mockOrder.updateStatus).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
      
      // Verify that events were committed
      expect(mockOrder.commit).toHaveBeenCalled();
    });
    
    it('should return 404 when updating non-existent order', async () => {
      // Arrange
      const orderId = uuidv4();
      
      // Mock repository to return null (order not found)
      (mockOrderRepository.findById as jest.Mock).mockResolvedValue(null);
      
      // Act & Assert
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ status: 'PROCESSING' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 404);
          expect(res.body.message).toContain('not found');
        });
        
      // Verify that findById was called
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      
      // Verify that save was not called
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
    
    it('should return 400 on invalid status transition', async () => {
      // Arrange
      const orderId = uuidv4();
      
      // Create a mock order that throws an error on invalid transition
      const mockOrder = {
        id: { value: orderId },
        userId: { value: uuidv4() },
        status: { value: 'DELIVERED' },
        items: [],
        totalAmount: { amount: 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
        updateStatus: jest.fn().mockImplementation(() => {
          throw new Error('Invalid status transition from DELIVERED to PROCESSING');
        }),
        commit: jest.fn(),
      };
      
      // Mock repository to return the order
      (mockOrderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      
      // Act & Assert
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ status: 'PROCESSING' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 400);
          expect(res.body.message).toContain('Invalid status transition');
        });
        
      // Verify that findById was called
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      
      // Verify that updateStatus was called and threw error
      expect(mockOrder.updateStatus).toHaveBeenCalled();
      
      // Verify that save was not called
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
  });
  
  describe('Cancelling orders', () => {
    it('should cancel an order successfully', async () => {
      // Arrange
      const orderId = uuidv4();
      
      // Create a mock order with methods
      const mockOrder = {
        id: { value: orderId },
        userId: { value: uuidv4() },
        status: { value: 'PENDING' },
        items: [],
        totalAmount: { amount: 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
        cancel: jest.fn(),
        commit: jest.fn(),
      };
      
      // Mock repository responses
      (mockOrderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      (mockOrderRepository.save as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: { value: 'CANCELLED' },
      });
      
      // Act & Assert
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body.message).toContain('cancelled successfully');
        });
        
      // Verify that findById was called
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      
      // Verify that cancel was called
      expect(mockOrder.cancel).toHaveBeenCalled();
      
      // Verify that the order was saved
      expect(mockOrderRepository.save).toHaveBeenCalled();
      
      // Verify that events were committed
      expect(mockOrder.commit).toHaveBeenCalled();
    });
    
    it('should return 404 when cancelling non-existent order', async () => {
      // Arrange
      const orderId = uuidv4();
      
      // Mock repository to return null (order not found)
      (mockOrderRepository.findById as jest.Mock).mockResolvedValue(null);
      
      // Act & Assert
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 404);
          expect(res.body.message).toContain('not found');
        });
        
      // Verify that findById was called
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      
      // Verify that save was not called
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
    
    it('should return 400 when cancelling an order in non-cancellable state', async () => {
      // Arrange
      const orderId = uuidv4();
      
      // Create a mock order that throws error on cancel
      const mockOrder = {
        id: { value: orderId },
        userId: { value: uuidv4() },
        status: { value: 'DELIVERED' },
        items: [],
        totalAmount: { amount: 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
        cancel: jest.fn().mockImplementation(() => {
          throw new Error('Invalid status transition from DELIVERED to CANCELLED');
        }),
        commit: jest.fn(),
      };
      
      // Mock repository to return the order
      (mockOrderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);
      
      // Act & Assert
      await request(app.getHttpServer())
        .put(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 400);
          expect(res.body.message).toContain('Invalid status transition');
        });
        
      // Verify that findById was called
      expect(mockOrderRepository.findById).toHaveBeenCalled();
      
      // Verify that cancel was called and threw error
      expect(mockOrder.cancel).toHaveBeenCalled();
      
      // Verify that save was not called
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
  });
});