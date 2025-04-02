import { ValueObject } from './value-object.base';

class TestValueObject extends ValueObject<number> {
    equals(other: ValueObject<number>): boolean {
        return this.value === other.value;
    }
}

describe('ValueObject', () => {
    it('should store the value provided in the constructor', () => {
        const value = 42;
        const valueObject = new TestValueObject(value);

        expect(valueObject.value).toBe(value);
    });

    it('should return true when two value objects have the same value', () => {
        const value1 = new TestValueObject(42);
        const value2 = new TestValueObject(42);

        expect(value1.equals(value2)).toBe(true);
    });

    it('should return false when two value objects have different values', () => {
        const value1 = new TestValueObject(42);
        const value2 = new TestValueObject(43);

        expect(value1.equals(value2)).toBe(false);
    });

    
});