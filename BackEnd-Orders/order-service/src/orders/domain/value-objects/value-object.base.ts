/**
 * Abstract base class for value objects
 * Value objects are immutable and are compared by their structural equality
 */
export abstract class ValueObject<T> {
  constructor(protected readonly _value: T) {}

  get value(): T {
    return this._value
  }

  abstract equals(other: ValueObject<T>): boolean
}

