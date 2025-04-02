import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrderStatusEnum, UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { CreateOrderCommand } from '../../application/commands/create-order.command';
import { UpdateOrderStatusCommand } from '../../application/commands/update-order-status.command';
import { CancelOrderCommand } from '../../application/commands/cancel-order.command';
import { GetOrderByIdQuery } from '../../application/queries/get-order-by-id.query';
import { Response } from 'express';

describe('OrdersController', () => {
  let controller: OrdersController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  describe('createOrder', () => {
    it('should create a new order and return the order ID', async () => {
      const createOrderDto: CreateOrderDto = { 
        userId: 'user_123', 
        items: [
          { productId: 'item1', quantity: 1, price: 100 }, 
          { productId: 'item2', quantity: 2, price: 200 }
        ] 
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce('order_123');

      await controller.createOrder(createOrderDto, mockResponse);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateOrderCommand(createOrderDto.userId, createOrderDto.items),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 201,
        message: 'Order created successfully',
        data: 'order_123',
        timestamp: expect.any(String),
      });
    });

    it('should return a 400 error if order creation fails', async () => {
      const createOrderDto: CreateOrderDto = { 
        userId: 'user_123', 
        items: [
          { productId: 'item1', quantity: 1, price: 100 }, 
          { productId: 'item2', quantity: 2, price: 200 }
        ] 
      };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(commandBus, 'execute').mockRejectedValueOnce(new Error('Order creation failed'));

      await controller.createOrder(createOrderDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 400,
        message: 'Failed to create order',
        error: 'Order creation failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status and return the updated order', async () => {
      const orderId = 'order_123';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: OrderStatusEnum.SHIPPED };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockOrder = { id: orderId, status: OrderStatusEnum.SHIPPED};
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(undefined);
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockOrder);

      await controller.updateOrderStatus(orderId, updateOrderStatusDto, mockResponse);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateOrderStatusCommand(orderId, updateOrderStatusDto.status),
      );
      expect(queryBus.execute).toHaveBeenCalledWith(new GetOrderByIdQuery(orderId));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Order status updated successfully',
        data: mockOrder,
        timestamp: expect.any(String),
      });
    });

    it('should return a 404 error if the order is not found', async () => {
      const orderId = 'order_123';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status:  OrderStatusEnum.SHIPPED };
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(undefined);
      jest.spyOn(queryBus, 'execute').mockRejectedValueOnce(new Error('Order not found'));

      await controller.updateOrderStatus(orderId, updateOrderStatusDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 404,
        message: 'Order not found',
        timestamp: expect.any(String),
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel the order and return a success message', async () => {
      const orderId = 'order_123';
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(undefined);

      await controller.cancelOrder(orderId, mockResponse);

      expect(commandBus.execute).toHaveBeenCalledWith(new CancelOrderCommand(orderId));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Order cancelled successfully',
        timestamp: expect.any(String),
      });
    });

    it('should return a 404 error if the order is not found', async () => {
      const orderId = 'order_123';
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(commandBus, 'execute').mockRejectedValueOnce(new Error('Order not found'));

      await controller.cancelOrder(orderId, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 404,
        message: 'Order not found',
        timestamp: expect.any(String),
      });
    });
  });
});