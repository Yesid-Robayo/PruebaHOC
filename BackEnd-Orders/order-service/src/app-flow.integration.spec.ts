import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import  request from 'supertest';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { OrdersModule } from 'src/orders/orders.module';
import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';

describe('Order Service Integration Tests', () => {
  let app: INestApplication;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let jwtToken: string;

  // Mock JWT auth guard to always pass
  class MockJwtAuthGuard {
    canActivate() {
      return true;
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, OrdersModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    commandBus = moduleFixture.get<CommandBus>(CommandBus);
    queryBus = moduleFixture.get<QueryBus>(QueryBus);
    
    // Mock token for authentication
    jwtToken = 'test-jwt-token';

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  }, 10000); 
  
  describe('Order Flow', () => {
    let orderId: string;
    const userId = uuidv4();

    it('should create a new order', async () => {
      // Prepare the create order payload
      const createOrderDto = {
        userId: userId,
        items: [
          {
            productId: uuidv4(),
            quantity: 2,
            price: 10.99
          },
          {
            productId: uuidv4(),
            quantity: 1,
            price: 15.50
          }
        ]
      };

      // We're mocking commandBus to return a generated orderId
      orderId = uuidv4();
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(orderId);

      // Make the request
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createOrderDto)
        .expect(201);

      // Verify response
      expect(response.body).toHaveProperty('code', 201);
      expect(response.body).toHaveProperty('orderId', orderId);
    });

    it('should get order by ID', async () => {
      // Prepare a mock order response
      const mockOrder = {
        id: orderId,
        userId: userId,
        status: 'PENDING',
        items: [
          {
            id: uuidv4(),
            productId: uuidv4(),
            quantity: 2,
            price: 10.99,
            subtotal: 21.98
          }
        ],
        totalAmount: 21.98,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock the query response
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockOrder);

      // Make the request
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Verify response
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id', orderId);
      expect(response.body.order).toHaveProperty('status', 'PENDING');
    });

    it('should update order status', async () => {
      // Prepare update status payload
      const updateStatusDto = {
        status: 'PROCESSING'
      };

      // Mock commands for status update
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(undefined);

      // Mock updated order
      const updatedOrder = {
        id: orderId,
        userId: userId,
        status: 'PROCESSING', // Updated status
        items: [
          {
            id: uuidv4(),
            productId: uuidv4(),
            quantity: 2,
            price: 10.99,
            subtotal: 21.98
          }
        ],
        totalAmount: 21.98,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock the query response for getting updated order
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(updatedOrder);

      // Make the request
      const response = await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateStatusDto)
        .expect(200);

      // Verify response
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('status', 'PROCESSING');
    });

    it('should cancel an order', async () => {
      // Mock commands for cancel
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(undefined);

      // Mock cancelled order
      const cancelledOrder = {
        id: orderId,
        userId: userId,
        status: 'CANCELLED',
        items: [
          {
            id: uuidv4(),
            productId: uuidv4(),
            quantity: 2,
            price: 10.99,
            subtotal: 21.98
          }
        ],
        totalAmount: 21.98,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock the query response for getting cancelled order
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(cancelledOrder);

      // Make the request
      const response = await request(app.getHttpServer())
        .put(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Verify response
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', 'Order cancelled successfully');
    });

    it('should get orders by user ID', async () => {
      // Prepare mock orders for user
      const mockOrders = [
        {
          id: orderId,
          userId: userId,
          status: 'CANCELLED',
          items: [
            {
              id: uuidv4(),
              productId: uuidv4(),
              quantity: 2,
              price: 10.99,
              subtotal: 21.98
            }
          ],
          totalAmount: 21.98,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          userId: userId,
          status: 'DELIVERED',
          items: [
            {
              id: uuidv4(),
              productId: uuidv4(),
              quantity: 1,
              price: 25.99,
              subtotal: 25.99
            }
          ],
          totalAmount: 25.99,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Mock the query response
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockOrders);

      // Make the request
      const response = await request(app.getHttpServer())
        .get(`/orders?userId=${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Verify response
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('orders');
      expect(response.body.orders).toBeInstanceOf(Array);
      expect(response.body.orders).toHaveLength(2);
      expect(response.body.orders[0]).toHaveProperty('userId', userId);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 when getting non-existent order', async () => {
      // Mock queryBus to return null for non-existent order
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(null);

      // Make the request
      const response = await request(app.getHttpServer())
        .get(`/orders/${uuidv4()}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);

      // Verify response
      expect(response.body).toHaveProperty('code', 404);
      expect(response.body).toHaveProperty('message', 'Order not found');
    });

    it('should return 400 when trying invalid status transition', async () => {
      // Prepare update status payload
      const updateStatusDto = {
        status: 'PENDING' // Trying to go back to PENDING from another state
      };

      // Mock commandBus to throw error for invalid transition
      jest.spyOn(commandBus, 'execute').mockRejectedValueOnce(
        new Error('Invalid status transition: from DELIVERED to PENDING')
      );

      // Make the request
      const response = await request(app.getHttpServer())
        .put(`/orders/${uuidv4()}/status`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateStatusDto)
        .expect(400);

      // Verify response
      expect(response.body).toHaveProperty('code', 400);
      expect(response.body.message).toContain('Invalid status transition');
    });
  });
});