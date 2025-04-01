import { Body, Controller, Param, Post, Put, Res, UseGuards } from "@nestjs/common"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { CreateOrderCommand } from "../../application/commands/create-order.command"
import { UpdateOrderStatusCommand } from "../../application/commands/update-order-status.command"
import { CancelOrderCommand } from "../../application/commands/cancel-order.command"
import { CreateOrderDto } from "../dtos/create-order.dto"
import { UpdateOrderStatusDto } from "../dtos/update-order-status.dto"
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../../infrastructure/auth/guards/jwt-auth.guard"
import { Response } from "express"
import { GetOrderByIdQuery } from "src/orders/application/queries/get-order-by-id.query"

@ApiTags("orders")
@Controller("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Res() response: Response): Promise<Response> {
    const orderId = await this.commandBus.execute(
      new CreateOrderCommand(
        createOrderDto.userId,
        createOrderDto.items,
      ),
    );
    if (!orderId) {
      return response.status(400).json({ code: 400, message: "Order creation failed" });
    }
    return response.status(201).json({ code: 201, orderId });

  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update order status" })
  @ApiResponse({ status: 200, description: "Order status updated successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })

  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Res() response: Response
  ): Promise<Response> {
    try {
      await this.commandBus.execute(new UpdateOrderStatusCommand(orderId, updateOrderStatusDto.status))
      const order = await this.queryBus.execute(new GetOrderByIdQuery(orderId));
      if (!order) {
        return response.status(404).json({ code: 404, message: "Order not found" });
      }
      return response.json({ code: 200, order });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid status transition")) {
        return response.status(400).json({
          code: 400,
          message: `Invalid status transition: ${error.message}`,
        });
      }
      return response.status(500).json({
        code: 500,
        message: "An unexpected error occurred",
        details: error.message || error.toString(),
      });
    }

  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async cancelOrder(@Param('id') orderId: string, @Res() response: Response): Promise<Response> {
    try {
      // Ejecuta el comando para cancelar la orden
      await this.commandBus.execute(new CancelOrderCommand(orderId));

      // Obtiene la orden actualizada
      const order = await this.queryBus.execute(new GetOrderByIdQuery(orderId));

      // Verifica si la orden existe
      if (!order) {
        return response.status(404).json({ code: 404, message: "Order not found" });
      }

      return response.json({ code: 200, message: "Order cancelled successfully" });
    } catch (error) {
      // Manejo de error específico para transiciones inválidas
      console.error(`Error cancelling order: ${error.message}`);
      if (error.message.includes("Invalid status transition")) {
        return response.status(400).json({ code: 400, message: error.message });
      }

      // Manejo de error genérico
      return response.status(500).json({ code: 500, message: error.message });
    }
  }

}

