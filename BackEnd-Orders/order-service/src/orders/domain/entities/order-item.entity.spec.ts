import { Money } from "../value-objects/money.value-object";
import { ProductId } from "../value-objects/product-id.value-object";
import { OrderItem, OrderItemProps } from "./order-item.entity";

describe("OrderItem", () => {
    const mockProductId = new ProductId("product-123");
    const mockMoney = new Money(100.20);


    it("should create an OrderItem instance with valid properties", () => {
        const props: OrderItemProps = {
            id: "order-item-1",
            productId: mockProductId,
            quantity: 2,
            price: new Money(100.20),
        };

        const orderItem = new OrderItem(props);

        expect(orderItem.id).toBe(props.id);
        expect(orderItem.productId).toBe(props.productId);
        expect(orderItem.quantity).toBe(props.quantity);
        expect(orderItem.price).toBe(props.price);
        expect(orderItem.subtotal).toEqual(mockMoney.multiply(props.quantity));
    });

    it("should throw an error if quantity is less than or equal to zero", () => {
        const props: OrderItemProps = {
            id: "order-item-2",
            productId: mockProductId,
            quantity: 0,
            price: mockMoney,
        };

        expect(() => new OrderItem(props)).toThrowError(
            "Order item quantity must be greater than zero"
        );
    });

    it("should calculate the correct subtotal", () => {
        const props: OrderItemProps = {
            id: "order-item-3",
            productId: mockProductId,
            quantity: 3,
            price: mockMoney,
        };

        const orderItem = new OrderItem(props);

        expect(orderItem.subtotal).toEqual(mockMoney.multiply(props.quantity));
    });
});