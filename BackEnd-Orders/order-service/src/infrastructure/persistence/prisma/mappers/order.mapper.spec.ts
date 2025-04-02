import { OrderMapper } from "./order.mapper";
import { Order } from "../../../../orders/domain/entities/order.entity";
import { OrderItem } from "../../../../orders/domain/entities/order-item.entity";
import { OrderId } from "../../../../orders/domain/value-objects/order-id.value-object";
import { UserId } from "../../../../orders/domain/value-objects/user-id.value-object";
import { ProductId } from "../../../../orders/domain/value-objects/product-id.value-object";
import { Money } from "../../../../orders/domain/value-objects/money.value-object";
import { OrderStatus } from "../../../../orders/domain/value-objects/order-status.value-object";

describe("OrderMapper", () => {
  describe("toDomain", () => {
    it("should map a PrismaOrderWithItems to a domain Order entity", () => {
      const prismaOrderWithItems = {
        id: "order-1",
        userId: "usr_abc12345",
        status: "PENDING",
        totalAmount: 1000,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        items: [
          {
            id: "item-1",
            orderId: "order-1",
            productId: "product-1",
            quantity: 2,
            price: 500,
          },
        ],
      };

      const domainOrder = OrderMapper.toDomain(prismaOrderWithItems);

      expect(domainOrder.id.value).toBe(prismaOrderWithItems.id);
      expect(domainOrder.userId.value).toBe(prismaOrderWithItems.userId);
      expect(domainOrder.status.value).toBe(prismaOrderWithItems.status);
      expect(domainOrder.totalAmount.amount).toBe(prismaOrderWithItems.totalAmount);
      expect(domainOrder.createdAt).toEqual(prismaOrderWithItems.createdAt);
      expect(domainOrder.updatedAt).toEqual(prismaOrderWithItems.updatedAt);
      expect(domainOrder.items).toHaveLength(1);
      expect(domainOrder.items[0].id).toBe(prismaOrderWithItems.items[0].id);
      expect(domainOrder.items[0].productId.value).toBe(prismaOrderWithItems.items[0].productId);
      expect(domainOrder.items[0].quantity).toBe(prismaOrderWithItems.items[0].quantity);
      expect(domainOrder.items[0].price.amount).toBe(prismaOrderWithItems.items[0].price);
    });
  });

  describe("toPersistence", () => {
    it("should map a domain Order entity to a PrismaOrderWithItems", () => {
      const domainOrder = new Order({
        id: new OrderId("order-1"),
        userId: new UserId("usr_abc12345"),
        status: OrderStatus.fromString("PENDING"),
        totalAmount: new Money(1000),
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        items: [
          new OrderItem({
            id: "item-1",
            productId: new ProductId("product-1"),
            quantity: 2,
            price: new Money(500),
          }),
        ],
      });

      const prismaOrderWithItems = OrderMapper.toPersistence(domainOrder);

      expect(prismaOrderWithItems.id).toBe(domainOrder.id.value);
      expect(prismaOrderWithItems.userId).toBe(domainOrder.userId.value);
      expect(prismaOrderWithItems.status).toBe(domainOrder.status.value);
      expect(prismaOrderWithItems.totalAmount).toBe(domainOrder.totalAmount.amount);
      expect(prismaOrderWithItems.createdAt).toEqual(domainOrder.createdAt);
      expect(prismaOrderWithItems.updatedAt).toEqual(domainOrder.updatedAt);
      expect(prismaOrderWithItems.items).toHaveLength(1);
      expect(prismaOrderWithItems.items[0].id).toBe(domainOrder.items[0].id);
      expect(prismaOrderWithItems.items[0].productId).toBe(domainOrder.items[0].productId.value);
      expect(prismaOrderWithItems.items[0].quantity).toBe(domainOrder.items[0].quantity);
      expect(prismaOrderWithItems.items[0].price).toBe(domainOrder.items[0].price.amount);
    });
  });
});