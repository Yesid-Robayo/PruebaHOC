import { OrderId } from "./order-id.value-object";

describe("OrderId Value Object", () => {
    it("should create an OrderId with a valid value", () => {
        const validId = "12345";
        const orderId = new OrderId(validId);
        expect(orderId.value).toBe(validId);
    });

    it("should throw an error if the OrderId value is empty", () => {
        expect(() => new OrderId("")).toThrowError("Order ID cannot be empty");
    });

    it("should throw an error if the OrderId value is only whitespace", () => {
        expect(() => new OrderId("   ")).toThrowError("Order ID cannot be empty");
    });

    it("should correctly compare two OrderId instances with the same value", () => {
        const idValue = "12345";
        const orderId1 = new OrderId(idValue);
        const orderId2 = new OrderId(idValue);
        expect(orderId1.equals(orderId2)).toBe(true);
    });

    it("should correctly compare two OrderId instances with different values", () => {
        const orderId1 = new OrderId("12345");
        const orderId2 = new OrderId("67890");
        expect(orderId1.equals(orderId2)).toBe(false);
    });
});