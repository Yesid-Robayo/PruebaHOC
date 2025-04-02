import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import  request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from 'src/app.module';
import { ORDER_REPOSITORY } from 'src/orders/domain/ports/order.repository.port';

// This is to control the mock behavior of jwt.verify
jest.mock('jsonwebtoken');

describe('Authentication E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('JWT Authentication', () => {
    it('should return 401 when no token is provided', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/orders')
        .expect(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      // Mock jwt.verify to throw error for invalid token
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Act & Assert
      await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should allow access with valid token', async () => {
      // Mock jwt.verify to return a valid payload
      const mockPayload = { sub: 'user-123', username: 'testuser' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      
      // Mock the OrderRepository to return empty array for this test
      const mockRepository = app.get(ORDER_REPOSITORY);
      mockRepository.findByUserId = jest.fn().mockResolvedValue([]);
      
      // Act & Assert
      await request(app.getHttpServer())
        .get('/orders?userId=user-123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
    });

    it('should allow access with valid token in cookie', async () => {
      // Mock jwt.verify to return a valid payload
      const mockPayload = { sub: 'user-123', username: 'testuser' };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      
      // Mock the OrderRepository to return empty array for this test
      const mockRepository = app.get(ORDER_REPOSITORY);
      mockRepository.findByUserId = jest.fn().mockResolvedValue([]);
      
      // Act & Assert
      await request(app.getHttpServer())
        .get('/orders?userId=user-123')
        .set('Cookie', 'token=valid-cookie-token')
        .expect(200);
    });
  });
});
