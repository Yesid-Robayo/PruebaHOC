import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetOrderByIdQuery } from "../../application/queries/get-order-by-id.query";
import { GetOrdersByUserIdQuery } from "../../application/queries/get-orders-by-user-id.query";
import { OrderDto } from "../../application/dtos/order.dto";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard";
import { Response } from "express";
import { ResponseDto } from "../dtos/response.dto";

/**
 * Orders Query Controller - Handles read operations for orders
 * 
 * @remarks
 * This controller provides endpoints for retrieving order information.
 * All endpoints require JWT authentication.
 */
@ApiTags("Orders")
@Controller("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersQueryController {
  constructor(private readonly queryBus: QueryBus) { }

  /**
   * Retrieves a single order by its ID
   * @param orderId - The ID of the order to retrieve
   * @param response - Express response object
   * @returns Order information or error response
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieves detailed information about a specific order using its unique identifier.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the order',
    example: 'ord_123456789',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: ResponseDto<OrderDto>
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT'
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getOrderById(
    @Param('id') orderId: string,
    @Res() response: Response
  ): Promise<Response> {
    try {
      const order = await this.queryBus.execute(new GetOrderByIdQuery(orderId));

      if (!order) {
        return response.status(404).json({
          code: 404,
          message: "Order not found",
          timestamp: new Date().toISOString()
        });
      }

      return response.status(200).json({
        code: 200,
        message: "Order retrieved successfully",
        data: order,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return response.status(500).json({
        code: 500,
        message: "Failed to retrieve order",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Retrieves all orders for a specific user
   * @param userId - The ID of the user whose orders to retrieve
   * @param response - Express response object
   * @returns List of orders or error response
   */
  @Get()
  @ApiOperation({
    summary: 'Get orders by user ID',
    description: 'Retrieves all orders associated with a specific user.'
  })
  @ApiQuery({
    name: 'userId',
    description: 'Unique identifier of the user',
    example: 'usr_123456789',
    required: true,
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Orders found',
    type: ResponseDto<[OrderDto]>
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing userId parameter'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT'
  })
  @ApiResponse({
    status: 404,
    description: 'No orders found for user'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getOrdersByUserId(
    @Query('userId') userId: string,
    @Res() response: Response
  ): Promise<Response> {
    if (!userId) {
      return response.status(400).json({
        code: 400,
        message: "userId query parameter is required",
        timestamp: new Date().toISOString()
      });
    }

    try {
      const orders = await this.queryBus.execute(new GetOrdersByUserIdQuery(userId));

      if (!orders || orders.length === 0) {
        return response.status(404).json({
          code: 404,
          message: "No orders found for this user",
          timestamp: new Date().toISOString()
        });
      }

      return response.status(200).json({
        code: 200,
        message: "Orders retrieved successfully",
        data: orders,
        count: orders.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return response.status(500).json({
        code: 500,
        message: "Failed to retrieve orders",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}