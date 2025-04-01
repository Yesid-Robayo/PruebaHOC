import { ValueObject } from "./value-object.base"

export class OrderId extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    this.validate()
  }

  private validate(): void {
    if (!this.value || this.value.trim() === "") {
      throw new Error("Order ID cannot be empty")
    }
  }

  equals(other: OrderId): boolean {
    return this.value === other.value
  }
}

