import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma.service"
import { OrderRepository } from "../../../../orders/domain/ports/order.repository.port"
import { Order } from "../../../../orders/domain/entities/order.entity"
import { OrderMapper } from "../mappers/order.mapper"
import { OrderId } from "../../../../orders/domain/value-objects/order-id.value-object"
import { UserId } from "../../../../orders/domain/value-objects/user-id.value-object"

@Injectable()
export class OrderPrismaRepository implements OrderRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async save(order: Order): Promise<Order> {
    const orderData = OrderMapper.toPersistence(order)

    const savedOrder = await this.prismaService.order.upsert({
      where: { id: orderData.id },
      update: {
        userId: orderData.userId,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        updatedAt: new Date(),
        items: {
          deleteMany: {}, // Elimina los items antiguos
          create: orderData.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      create: {
        id: orderData.id,
        userId: orderData.userId,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: {
          create: orderData.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });
    

    return OrderMapper.toDomain(savedOrder)
  }

  async findById(id: OrderId): Promise<Order | null> {
    const order = await this.prismaService.order.findUnique({
      where: { id: id.value },
      include: {
        items: true,
      },
    })

    if (!order) return null

    return OrderMapper.toDomain(order)
  }

  async findByUserId(userId: UserId): Promise<Order[]> {
    const orders = await this.prismaService.order.findMany({
      where: { userId: userId.value },
      include: {
        items: true,
      },
    })

    return orders.map(OrderMapper.toDomain)
  }

  async delete(id: OrderId): Promise<void> {
    await this.prismaService.order.delete({
      where: { id: id.value },
    })
  }
}

