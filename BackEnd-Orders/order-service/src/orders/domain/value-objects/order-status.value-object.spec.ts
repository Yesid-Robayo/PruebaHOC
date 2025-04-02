import { OrderStatus } from "./order-status.value-object"

describe("OrderStatus Value Object", () => {
    it("should create static instances for all valid statuses", () => {
        expect(OrderStatus.PENDING).toBeInstanceOf(OrderStatus)
        expect(OrderStatus.PROCESSING).toBeInstanceOf(OrderStatus)
        expect(OrderStatus.SHIPPED).toBeInstanceOf(OrderStatus)
        expect(OrderStatus.DELIVERED).toBeInstanceOf(OrderStatus)
        expect(OrderStatus.CANCELLED).toBeInstanceOf(OrderStatus)
        expect(OrderStatus.RETURNED).toBeInstanceOf(OrderStatus)
    })

    it("should return the correct static instance from a valid string", () => {
        expect(OrderStatus.fromString("PENDING")).toBe(OrderStatus.PENDING)
        expect(OrderStatus.fromString("PROCESSING")).toBe(OrderStatus.PROCESSING)
        expect(OrderStatus.fromString("SHIPPED")).toBe(OrderStatus.SHIPPED)
        expect(OrderStatus.fromString("DELIVERED")).toBe(OrderStatus.DELIVERED)
        expect(OrderStatus.fromString("CANCELLED")).toBe(OrderStatus.CANCELLED)
        expect(OrderStatus.fromString("RETURNED")).toBe(OrderStatus.RETURNED)
    })

    it("should throw an error for an invalid status string", () => {
        expect(() => OrderStatus.fromString("INVALID")).toThrowError("Invalid order status: INVALID")
    })

    it("should correctly compare two equal OrderStatus instances", () => {
        const status1 = OrderStatus.PENDING
        const status2 = OrderStatus.fromString("PENDING")
        expect(status1.equals(status2)).toBe(true)
    })

    it("should correctly compare two different OrderStatus instances", () => {
        const status1 = OrderStatus.PENDING
        const status2 = OrderStatus.PROCESSING
        expect(status1.equals(status2)).toBe(false)
    })
})