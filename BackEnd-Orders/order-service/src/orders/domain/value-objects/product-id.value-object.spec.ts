import { ProductId } from "./product-id.value-object";

describe("ProductId Value Object", () => {
    it("should create a valid ProductId", () => {
        const productId = new ProductId("12345");
        expect(productId).toBeDefined();
        expect(productId.value).toBe("12345");
    });

    it("should throw an error if ProductId is empty", () => {
        expect(() => new ProductId("")).toThrowError("Product ID cannot be empty");
    });

    it("should throw an error if ProductId is only whitespace", () => {
        expect(() => new ProductId("   ")).toThrowError("Product ID cannot be empty");
    });

    it("should correctly compare two equal ProductIds", () => {
        const productId1 = new ProductId("12345");
        const productId2 = new ProductId("12345");
        expect(productId1.equals(productId2)).toBe(true);
    });

    it("should correctly compare two different ProductIds", () => {
        const productId1 = new ProductId("12345");
        const productId2 = new ProductId("67890");
        expect(productId1.equals(productId2)).toBe(false);
    });
});