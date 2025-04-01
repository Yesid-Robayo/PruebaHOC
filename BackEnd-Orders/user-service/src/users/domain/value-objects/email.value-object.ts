import { ValueObject } from "./value-object.base"

export class Email extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    this.validate()
  }

  private validate(): void {
    if (!this.value || this.value.trim() === "") {
      throw new Error("Email cannot be empty")
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.value)) {
      throw new Error("Invalid email format")
    }
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}

