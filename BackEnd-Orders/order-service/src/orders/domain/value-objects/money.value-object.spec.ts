import { Money } from "./money.value-object";

describe("Money Value Object", () => {
    it("should create a Money instance with valid amount", () => {
        const money = new Money(100.456);
        expect(money.amount).toBe(100.46); // Rounded to 2 decimal places
    });

    it("should throw an error if amount is NaN", () => {
        expect(() => new Money(NaN)).toThrow("Money amount must be a valid number");
    });

    it("should throw an error if amount is negative", () => {
        expect(() => new Money(-10)).toThrow("Money amount cannot be negative");
    });

    it("should add two Money instances correctly", () => {
        const money1 = new Money(50.25);
        const money2 = new Money(25.75);
        const result = money1.add(money2);
        expect(result.amount).toBe(76.00);
    });

    it("should subtract two Money instances correctly", () => {
        const money1 = new Money(100.50);
        const money2 = new Money(50.25);
        const result = money1.subtract(money2);
        expect(result.amount).toBe(50.25);
    });

    it("should throw an error if subtraction results in a negative amount", () => {
        const money1 = new Money(50.25);
        const money2 = new Money(100.50);
        expect(() => money1.subtract(money2)).toThrow("Subtraction would result in negative money amount");
    });

    it("should multiply a Money instance by a positive factor", () => {
        const money = new Money(20.50);
        const result = money.multiply(2);
        expect(result.amount).toBe(41.00);
    });

    it("should throw an error if multiplying by a negative factor", () => {
        const money = new Money(20.50);
        expect(() => money.multiply(-2)).toThrow("Cannot multiply money by negative factor");
    });

    it("should compare equality of two Money instances", () => {
        const money1 = new Money(50.25);
        const money2 = new Money(50.25);
        const money3 = new Money(25.75);
        expect(money1.equals(money2)).toBe(true);
        expect(money1.equals(money3)).toBe(false);
    });

    it("should check if one Money instance is greater than another", () => {
        const money1 = new Money(100.50);
        const money2 = new Money(50.25);
        expect(money1.greaterThan(money2)).toBe(true);
        expect(money2.greaterThan(money1)).toBe(false);
    });

    it("should check if one Money instance is less than another", () => {
        const money1 = new Money(50.25);
        const money2 = new Money(100.50);
        expect(money1.lessThan(money2)).toBe(true);
        expect(money2.lessThan(money1)).toBe(false);
    });

    it("should format the money amount as a currency string", () => {
        const money = new Money(1234.56);
        expect(money.format()).toBe("$1,234.56"); 
        expect(money.format("en-US", "USD")).toBe("$1,234.56");
        expect(money.format("de-DE", "EUR")).toBe("1.234,56 €");
    });
});