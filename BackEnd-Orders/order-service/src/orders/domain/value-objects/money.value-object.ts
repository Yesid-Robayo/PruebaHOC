import { ValueObject } from "./value-object.base"

export class Money extends ValueObject<number> {
  constructor(amount: number) {
    super(Number(amount.toFixed(2))) // Ensure 2 decimal places
    this.validate()
  }
  get amount(): number {
    return this.value
  }
  private validate(): void {
    if (isNaN(this.value)) {
      throw new Error("Money amount must be a number")
    }

    if (this.value < 0) {
      throw new Error("Money amount cannot be negative")
    }
  }

  add(money: Money): Money {
    return new Money(this.value + money.value)
  }

  subtract(money: Money): Money {
    return new Money(this.value - money.value)
  }

  multiply(factor: number): Money {
    return new Money(this.value * factor)
  }

  equals(other: Money): boolean {
    return this.value === other.value
  }

  greaterThan(other: Money): boolean {
    return this.value > other.value
  }

  lessThan(other: Money): boolean {
    return this.value < other.value
  }
}

