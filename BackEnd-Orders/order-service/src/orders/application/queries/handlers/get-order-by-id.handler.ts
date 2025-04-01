import {  IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { GetOrderByIdQuery } from "../get-order-by-id.query"
import { Inject, NotFoundException } from "@nestjs/common"
import { ORDER_REPOSITORY,  OrderRepository } from "../../../domain/ports/order.repository.port"
import { OrderId } from "../../../domain/value-objects/order-id.value-object"
import  { OrderDto } from "../../dtos/order.dto"
import { OrderMapper } from "../../mappers/order.mapper"

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<OrderDto> {
    const orderId = new OrderId(query.orderId)
    const order = await this.orderRepository.findById(orderId)

    if (!order) {
      throw new NotFoundException(`Order with ID ${query.orderId} not found`)
    }

    return OrderMapper.toDto(order)
  }
}

