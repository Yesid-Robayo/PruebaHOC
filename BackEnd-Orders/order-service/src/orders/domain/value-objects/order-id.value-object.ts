import { ValueObject } from "./value-object.base";

/**
 * OrderId Value Object - Represents a unique identifier for orders
 * 
 * @remarks
 * - Enforces valid order ID format and rules
 * - Immutable by design
 * - Provides type safety for order identifiers
 */
export class OrderId extends ValueObject<string> {
  /**
   * Creates a new OrderId instance
   * @param value - The order identifier string
   * @throws Error if ID is empty or invalid
   */
  constructor(value: string) {
    super(value.trim());
    this.validate();
  }

  /**
   * Validates the order ID meets business requirements
   * @private
   * @throws Error if validation fails
   */
  private validate(): void {
    if (!this.value) {
      throw new Error("Order ID cannot be empty");
    }

    // Additional validation rules could include:
    // - Format requirements (e.g., prefix, length)
    // - Character set restrictions
    // - Checksum validation
  }

  /**
   * Compares equality with another OrderId
   * @param other - OrderId to compare against
   * @returns True if the underlying values are identical
   */
  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  /**
   * Generates a new OrderId with random UUID
   * @returns New OrderId instance
   */
  public static generate(): OrderId {
    return new OrderId(crypto.randomUUID());
  }

  /**
   * Checks if the ID matches a specific format or pattern
   * @param pattern - Regular expression to test against
   * @returns True if the ID matches the pattern
   */
  matchesPattern(pattern: RegExp): boolean {
    return pattern.test(this.value);
  }

  /**
   * Returns the string representation of the ID
   * @returns The underlying ID value
   */
  toString(): string {
    return this.value;
  }
}