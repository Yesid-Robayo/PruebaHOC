import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { OrderRepository } from "../../../../orders/domain/ports/order.repository.port";
import { Order } from "../../../../orders/domain/entities/order.entity";
import { OrderMapper } from "../mappers/order.mapper";
import { OrderId } from "../../../../orders/domain/value-objects/order-id.value-object";
import { UserId } from "../../../../orders/domain/value-objects/user-id.value-object";

@Injectable()
export class OrderPrismaRepository implements OrderRepository {
  /**
   * Constructs the repository with Prisma service dependency
   * @param prismaService Prisma database service instance
   */
  constructor(private readonly prismaService: PrismaService) { }

  /**
   * Saves an order entity to the database (creates or updates)
   * @param order The domain order entity to save
   * @returns Saved order as domain entity
   */
  async save(order: Order): Promise<Order> {
    // Convert domain entity to persistence format
    const orderData = OrderMapper.toPersistence(order);

    // Upsert operation (create or update)
    const savedOrder = await this.prismaService.order.upsert({
      where: { id: orderData.id },
      update: {
        userId: orderData.userId,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        updatedAt: new Date(), // Always refresh updated timestamp
        items: {
          // First delete all existing items to maintain consistency
          deleteMany: {},
          // Then create new items from current order data
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
          // Create all order items for new orders
          create: orderData.items.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true }, // Always return items with order
    });
    
    // Convert back to domain entity before returning
    return OrderMapper.toDomain(savedOrder);
  }

  /**
   * Finds an order by its ID
   * @param id OrderId value object
   * @returns Order domain entity or null if not found
   */
  async findById(id: OrderId): Promise<Order | null> {
    const order = await this.prismaService.order.findUnique({
      where: { id: id.value },
      include: {
        items: true, // Include related items
      },
    });

    if (!order) return null;

    return OrderMapper.toDomain(order);
  }

  /**
   * Finds all orders for a specific user
   * @param userId UserId value object
   * @returns Array of order domain entities
   */
  async findByUserId(userId: UserId): Promise<Order[]> {
    const orders = await this.prismaService.order.findMany({
      where: { userId: userId.value },
      include: {
        items: true, // Include related items for each order
      },
    });

    // Map all persistence orders to domain entities
    return orders.map(OrderMapper.toDomain);
  }

  /**
   * Deletes an order by its ID
   * @param id OrderId value object
   * @returns Promise that resolves when deletion is complete
   * @note Prisma's cascading deletes will handle related items automatically
   */
  async delete(id: OrderId): Promise<void> {
    await this.prismaService.order.delete({
      where: { id: id.value },
    });
  }
}