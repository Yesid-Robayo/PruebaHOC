import { ValueObject } from "./value-object.base"

export class UserId extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    this.validate()
  }

  private validate(): void {
    if (!this.value || this.value.trim() === "") {
      throw new Error("User ID cannot be empty")
    }
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }
}

