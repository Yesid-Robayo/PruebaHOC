import { ValueObject } from "./value-object.base";

/**
 * UserId Value Object - Represents a unique identifier for users
 * 
 * @remarks
 * - Enforces valid user ID format and business rules
 * - Immutable by design to ensure consistency
 * - Provides type safety throughout the domain
 * - Supports common ID formats (UUID, prefixed IDs, etc.)
 */
export class UserId extends ValueObject<string> {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private static readonly PREFIX_REGEX = /^usr_[a-zA-Z0-9]{8,}$/;

  /**
   * Creates a new UserId instance
   * @param value - The user identifier string
   * @throws Error if ID is empty or invalid
   */
  constructor(value: string) {
    super(value.trim());
    this.validate();
  }

  /**
   * Validates the user ID meets business requirements
   * @private
   * @throws Error if validation fails
   */
  private validate(): void {
    if (!this.value) {
      throw new Error("User ID cannot be empty");
    }

    // Validate against supported ID formats
    const isValid = 
      UserId.UUID_REGEX.test(this.value) || 
      UserId.PREFIX_REGEX.test(this.value) ||
      this.isLegacyId(this.value);

    if (!isValid) {
      throw new Error(
        `Invalid User ID format. Must be either:\n` +
        `- UUID (e.g., '123e4567-e89b-12d3-a456-426614174000')\n` +
        `- Prefixed ID (e.g., 'usr_abc12345')\n` +
        `- Legacy numeric ID`
      );
    }
  }

  /**
   * Checks if the ID follows legacy format (numeric only)
   * @param value - The ID to check
   * @private
   */
  private isLegacyId(value: string): boolean {
    return /^\d+$/.test(value);
  }

  /**
   * Compares equality with another UserId
   * @param other - UserId to compare against
   * @returns True if the underlying values are identical
   */
  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  /**
   * Generates a new UserId with UUID format
   * @returns New UserId instance
   */
  public static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  /**
   * Checks if the ID is in UUID format
   * @returns True if the ID is a valid UUID
   */
  isUUID(): boolean {
    return UserId.UUID_REGEX.test(this.value);
  }

  /**
   * Checks if the ID has the standard 'usr_' prefix
   * @returns True if the ID starts with 'usr_'
   */
  hasStandardPrefix(): boolean {
    return this.value.startsWith('usr_');
  }

  /**
   * Returns the string representation of the ID
   * @returns The underlying ID value
   */
  toString(): string {
    return this.value;
  }

  /**
   * Creates a UserId from a numeric legacy ID
   * @param id - Numeric legacy ID
   * @returns New UserId instance
   */
  public static fromLegacyId(id: number): UserId {
    return new UserId(id.toString());
  }
}