import {  IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { GetOrdersByUserIdQuery } from "../get-orders-by-user-id.query"
import { Inject } from "@nestjs/common"
import { ORDER_REPOSITORY, type OrderRepository } from "../../../domain/ports/order.repository.port"
import { UserId } from "../../../domain/value-objects/user-id.value-object"
import  { OrderDto } from "../../dtos/order.dto"
import { OrderMapper } from "../../mappers/order.mapper"

@QueryHandler(GetOrdersByUserIdQuery)
export class GetOrdersByUserIdHandler implements IQueryHandler<GetOrdersByUserIdQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(query: GetOrdersByUserIdQuery): Promise<OrderDto[]> {
    const userId = new UserId(query.userId)
    const orders = await this.orderRepository.findByUserId(userId)

    return orders.map(OrderMapper.toDto)
  }
}

