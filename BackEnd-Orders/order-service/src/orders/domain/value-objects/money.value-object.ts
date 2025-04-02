import { ValueObject } from "./value-object.base";

/**
 * Money Value Object - Represents monetary values in the domain
 * 
 * @remarks
 * - Ensures proper financial calculations with fixed decimal precision
 * - Immutable by design (all operations return new instances)
 * - Implements common financial operations with validation
 */
export class Money extends ValueObject<number> {
  /**
   * Creates a new Money instance
   * @param amount - Numeric value representing the amount
   * @throws Error if amount is invalid (NaN or negative)
   */
  constructor(amount: number) {
    super(Number(amount.toFixed(2))); // Enforces 2 decimal places
    this.validate();
  }

  /**
   * Accessor for the numeric value
   * @returns The monetary amount with 2 decimal precision
   */
  get amount(): number {
    return this.value;
  }

  /**
   * Validates the money amount
   * @private
   * @throws Error if amount is invalid
   */
  private validate(): void {
    if (isNaN(this.value)) {
      throw new Error("Money amount must be a valid number");
    }

    if (this.value < 0) {
      throw new Error("Money amount cannot be negative");
    }
  }

  /**
   * Adds another monetary amount to this one
   * @param money - Money instance to add
   * @returns New Money instance with sum of amounts
   */
  add(money: Money): Money {
    return new Money(this.value + money.value);
  }

  /**
   * Subtracts another monetary amount from this one
   * @param money - Money instance to subtract
   * @returns New Money instance with difference of amounts
   * @throws Error if result would be negative
   */
  subtract(money: Money): Money {
    const result = this.value - money.value;
    if (result < 0) {
      throw new Error("Subtraction would result in negative money amount");
    }
    return new Money(result);
  }

  /**
   * Multiplies the monetary amount by a factor
   * @param factor - Multiplication factor
   * @returns New Money instance with multiplied amount
   * @throws Error if factor is negative
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error("Cannot multiply money by negative factor");
    }
    return new Money(this.value * factor);
  }

  /**
   * Compares equality with another Money instance
   * @param other - Money instance to compare
   * @returns True if amounts are exactly equal
   */
  equals(other: Money): boolean {
    return this.value === other.value;
  }

  /**
   * Checks if this amount is greater than another
   * @param other - Money instance to compare
   * @returns True if this amount is greater
   */
  greaterThan(other: Money): boolean {
    return this.value > other.value;
  }

  /**
   * Checks if this amount is less than another
   * @param other - Money instance to compare
   * @returns True if this amount is less
   */
  lessThan(other: Money): boolean {
    return this.value < other.value;
  }

  /**
   * Formats the money amount as a currency string
   * @param locale - Locale for formatting (default: 'es-CO')
   * @param currency - Currency code (default: 'USD')
   * @returns Formatted currency string
   * @example
   * new Money(12.5).format() // returns "$12.50"
   */
  format(locale: string = 'es-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.value);
  }
}