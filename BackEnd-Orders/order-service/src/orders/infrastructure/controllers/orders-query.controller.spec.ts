import { Test, TestingModule } from '@nestjs/testing';
import { OrdersQueryController } from './orders-query.controller';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { GetOrderByIdQuery } from '../../application/queries/get-order-by-id.query';
import { GetOrdersByUserIdQuery } from '../../application/queries/get-orders-by-user-id.query';
import { Response } from 'express';

describe('OrdersQueryController', () => {
  let controller: OrdersQueryController;
  let queryBus: QueryBus;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersQueryController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OrdersQueryController>(OrdersQueryController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  describe('getOrderById', () => {
    it('should return 200 and the order if found', async () => {
      const mockOrder = { id: 'ord_123', name: 'Test Order' };
      mockQueryBus.execute.mockResolvedValue(mockOrder);

      const res = mockResponse();
      await controller.getOrderById('ord_123', res);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery('ord_123'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Order retrieved successfully',
        data: mockOrder,
        timestamp: expect.any(String),
      });
    });

    it('should return 404 if the order is not found', async () => {
      mockQueryBus.execute.mockResolvedValue(null);

      const res = mockResponse();
      await controller.getOrderById('ord_123', res);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery('ord_123'));
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        code: 404,
        message: 'Order not found',
        timestamp: expect.any(String),
      });
    });

    it('should return 500 if an error occurs', async () => {
      mockQueryBus.execute.mockRejectedValue(new Error('Internal error'));

      const res = mockResponse();
      await controller.getOrderById('ord_123', res);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery('ord_123'));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: 'Failed to retrieve order',
        error: 'Internal error',
        timestamp: expect.any(String),
      });
    });
  });

  describe('getOrdersByUserId', () => {
    it('should return 200 and the orders if found', async () => {
      const mockOrders = [{ id: 'ord_1' }, { id: 'ord_2' }];
      mockQueryBus.execute.mockResolvedValue(mockOrders);

      const res = mockResponse();
      await controller.getOrdersByUserId('usr_123', res);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetOrdersByUserIdQuery('usr_123'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Orders retrieved successfully',
        data: mockOrders,
        count: mockOrders.length,
        timestamp: expect.any(String),
      });
    });

    it('should return 400 if userId is missing', async () => {
      const res = mockResponse();
      await controller.getOrdersByUserId('', res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        code: 400,
        message: 'userId query parameter is required',
        timestamp: expect.any(String),
      });
    });

    it('should return 404 if no orders are found', async () => {
      mockQueryBus.execute.mockResolvedValue([]);

      const res = mockResponse();
      await controller.getOrdersByUserId('usr_123', res);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetOrdersByUserIdQuery('usr_123'));
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        code: 404,
        message: 'No orders found for this user',
        timestamp: expect.any(String),
      });
    });

    it('should return 500 if an error occurs', async () => {
      mockQueryBus.execute.mockRejectedValue(new Error('Internal error'));

      const res = mockResponse();
      await controller.getOrdersByUserId('usr_123', res);

      expect(queryBus.execute).toHaveBeenCalledWith(new GetOrdersByUserIdQuery('usr_123'));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: 'Failed to retrieve orders',
        error: 'Internal error',
        timestamp: expect.any(String),
      });
    });
  });
});