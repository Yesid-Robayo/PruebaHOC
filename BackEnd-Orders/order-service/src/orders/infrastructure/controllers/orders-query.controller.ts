import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common"
import { QueryBus } from "@nestjs/cqrs"
import { GetOrderByIdQuery } from "../../application/queries/get-order-by-id.query"
import { GetOrdersByUserIdQuery } from "../../application/queries/get-orders-by-user-id.query"
import { OrderDto } from "../../application/dtos/order.dto"
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard"
import { Response, response } from "express"

@ApiTags("orders")
@Controller("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersQueryController {
  constructor(private readonly queryBus: QueryBus) { }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOrderById(@Param('id') orderId: string, @Res() response: Response): Promise<Response> {
    const order = await this.queryBus.execute(new GetOrderByIdQuery(orderId));
    if (!order) {
      return response.status(404).json({ code: 404, message: "Order not found" });
    }
    return response.json({ code: 200, order });
  }

  @Get()
  @ApiOperation({ summary: 'Get orders by user ID' })
  @ApiResponse({ status: 200, description: 'Orders found', type: [OrderDto] })
  @ApiResponse({ status: 404, description: 'Orders not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOrdersByUserId(@Query('userId') userId: string, @Res() response: Response): Promise<Response> {
    const orders = await this.queryBus.execute(new GetOrdersByUserIdQuery(userId));
    if (!orders) {
      return response.status(404).json({ code: 404, message: "Orders not found" });
    }
    return response.json({ code: 200, orders });
  }
}

