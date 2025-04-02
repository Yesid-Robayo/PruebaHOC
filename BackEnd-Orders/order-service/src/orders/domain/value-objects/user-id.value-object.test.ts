import { UserId } from "./user-id.value-object";

describe("UserId Value Object", () => {
    it("should create a valid UserId", () => {
        const userId = new UserId("12345");
        expect(userId).toBeDefined();
        expect(userId.value).toBe("12345");
    });

    it("should throw an error if UserId is empty", () => {
        expect(() => new UserId("")).toThrowError("User ID cannot be empty");
    });

    it("should throw an error if UserId is only whitespace", () => {
        expect(() => new UserId("   ")).toThrowError("User ID cannot be empty");
    });

    it("should correctly compare two UserIds with the same value", () => {
        const userId1 = new UserId("12345");
        const userId2 = new UserId("12345");
        expect(userId1.equals(userId2)).toBe(true);
    });

    it("should correctly compare two UserIds with different values", () => {
        const userId1 = new UserId("12345");
        const userId2 = new UserId("67890");
        expect(userId1.equals(userId2)).toBe(false);
    });
});