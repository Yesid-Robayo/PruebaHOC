import { Body, Controller, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateOrderCommand } from "../../application/commands/create-order.command";
import { UpdateOrderStatusCommand } from "../../application/commands/update-order-status.command";
import { CancelOrderCommand } from "../../application/commands/cancel-order.command";
import { CreateOrderDto } from "../dtos/create-order.dto";
import { UpdateOrderStatusDto } from "../dtos/update-order-status.dto";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard";
import { Response } from "express";
import { GetOrderByIdQuery } from "../../application/queries/get-order-by-id.query";
import { ResponseDto } from "../dtos/response.dto";
import { OrderDto } from "src/orders/application/dtos/order.dto";

/**
 * Orders Command Controller - Handles order creation and modification
 * 
 * @remarks
 * This controller provides endpoints for creating and modifying orders.
 * All endpoints require JWT authentication.
 */
@ApiTags("Orders")
@Controller("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Creates a new order
   * @param createOrderDto - Order creation data
   * @param response - Express response object
   * @returns The created order ID or error response
   */
  @Post()
  @ApiOperation({ 
    summary: 'Create a new order', 
    description: 'Creates a new order with the provided items.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
    type: ResponseDto<String>
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid order data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Res() response: Response
  ): Promise<Response> {
    try {
      const orderId = await this.commandBus.execute(
        new CreateOrderCommand(
          createOrderDto.userId,
          createOrderDto.items,
        ),
      );

      return response.status(201).json({
        code: 201,
        message: "Order created successfully",
        data: orderId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return response.status(400).json({
        code: 400,
        message: "Failed to create order",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Updates an order's status
   * @param orderId - ID of the order to update
   * @param updateOrderStatusDto - New status data
   * @param response - Express response object
   * @returns The updated order or error response
   */
  @Put(":id/status")
  @ApiOperation({ 
    summary: "Update order status", 
    description: "Updates the status of an existing order." 
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID to update',
    example: 'ord_123456789',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: "Order status updated successfully",
    type: ResponseDto<OrderDto>
  })
  @ApiResponse({ 
    status: 400, 
    description: "Bad request - Invalid status transition" 
  })
  @ApiResponse({ 
    status: 404, 
    description: "Order not found" 
  })
  @ApiResponse({ 
    status: 500, 
    description: "Internal server error" 
  })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Res() response: Response
  ): Promise<Response> {
    try {
      await this.commandBus.execute(
        new UpdateOrderStatusCommand(orderId, updateOrderStatusDto.status)
      );

      const order = await this.queryBus.execute(new GetOrderByIdQuery(orderId));

      return response.status(200).json({
        code: 200,
        message: "Order status updated successfully",
        data: order,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes("Invalid status transition")) {
        return response.status(400).json({
          code: 400,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes("not found")) {
        return response.status(404).json({
          code: 404,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return response.status(500).json({
        code: 500,
        message: "Failed to update order status",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Cancels an existing order
   * @param orderId - ID of the order to cancel
   * @param response - Express response object
   * @returns Success message or error response
   */
  @Put(':id/cancel')
  @ApiOperation({ 
    summary: 'Cancel an order', 
    description: 'Cancels an existing order if allowed by business rules.' 
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID to cancel',
    example: 'ord_123456789',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order cancelled successfully',
    type: ResponseDto<void>
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid status transition' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async cancelOrder(
    @Param('id') orderId: string,
    @Res() response: Response
  ): Promise<Response> {
    try {
      await this.commandBus.execute(new CancelOrderCommand(orderId));

      return response.status(200).json({
        code: 200,
        message: "Order cancelled successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes("Invalid status transition")) {
        return response.status(400).json({
          code: 400,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes("not found")) {
        return response.status(404).json({
          code: 404,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return response.status(500).json({
        code: 500,
        message: "Failed to cancel order",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}