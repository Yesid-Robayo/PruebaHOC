import { ValueObject } from "./value-object.base";

/**
 * ProductId Value Object - Represents a unique identifier for products
 * 
 * @remarks
 * - Enforces valid product ID format and business rules
 * - Immutable by design to ensure consistency
 * - Provides type safety throughout the domain
 */
export class ProductId extends ValueObject<string> {
  /**
   * Creates a new ProductId instance
   * @param value - The product identifier string
   * @throws Error if ID is empty or invalid
   */
  constructor(value: string) {
    super(value.trim());
    this.validate();
  }

  /**
   * Validates the product ID meets business requirements
   * @private
   * @throws Error if validation fails
   */
  private validate(): void {
    if (!this.value) {
      throw new Error("Product ID cannot be empty");
    }

    // Additional validation rules could include:
    // - Minimum/maximum length requirements
    // - Specific prefix pattern (e.g., "prod_")
    // - Character set restrictions (alphanumeric only)
    // - Checksum or format validation
    if (!/^[a-zA-Z0-9_-]+$/.test(this.value)) {
      throw new Error("Product ID contains invalid characters");
    }

    if (this.value.length < 3 || this.value.length > 50) {
      throw new Error("Product ID must be between 3 and 50 characters");
    }
  }

  /**
   * Compares equality with another ProductId
   * @param other - ProductId to compare against
   * @returns True if the underlying values are identical
   */
  equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  /**
   * Generates a new ProductId with a standard prefix
   * @returns New ProductId instance with "prod_" prefix
   */
  public static generate(): ProductId {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    return new ProductId(`prod_${uniqueId}`);
  }

  /**
   * Checks if the ID has a specific prefix
   * @param prefix - The prefix to check for
   * @returns True if the ID starts with the given prefix
   */
  hasPrefix(prefix: string): boolean {
    return this.value.startsWith(prefix);
  }

  /**
   * Returns the string representation of the ID
   * @returns The underlying ID value
   */
  toString(): string {
    return this.value;
  }

  /**
   * Extracts the sequential part of a formatted product ID
   * @returns The numeric portion if ID follows "prefix_number" format
   */
  getSequentialPart(): number | null {
    const match = this.value.match(/\d+$/);
    return match ? parseInt(match[0], 10) : null;
  }
}