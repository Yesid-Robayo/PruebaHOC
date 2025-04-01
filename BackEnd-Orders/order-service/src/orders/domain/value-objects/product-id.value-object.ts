import { ValueObject } from "./value-object.base"

export class ProductId extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    this.validate()
  }

  private validate(): void {
    if (!this.value || this.value.trim() === "") {
      throw new Error("Product ID cannot be empty")
    }
  }

  equals(other: ProductId): boolean {
    return this.value === other.value
  }
}

