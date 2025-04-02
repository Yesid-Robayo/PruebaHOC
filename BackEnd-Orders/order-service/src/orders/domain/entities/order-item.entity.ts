import type { ProductId } from "../value-objects/product-id.value-object";
import type { Money } from "../value-objects/money.value-object";

/**
 * Interface defining the properties required to create an OrderItem
 * @property {string} id - Unique identifier for the order item
 * @property {ProductId} productId - Value object representing the product ID
 * @property {number} quantity - Number of units ordered (must be positive)
 * @property {Money} price - Price per unit at time of ordering
 */
export interface OrderItemProps {
  id: string;
  productId: ProductId;
  quantity: number;
  price: Money;
}

/**
 * Domain entity representing a single item within an order
 * 
 * @remarks
 * Enforces business rules around order items and provides calculated values.
 * Immutable after creation to maintain consistency.
 */
export class OrderItem {
  private _id: string;
  private _productId: ProductId;
  private _quantity: number;
  private _price: Money;

  /**
   * Creates a new OrderItem
   * @param props - Required properties for the order item
   * @throws Error if validation fails
   */
  constructor(props: OrderItemProps) {
    this._id = props.id;
    this._productId = props.productId;
    this._quantity = props.quantity;
    this._price = props.price;

    this.validate();
  }

  /**
   * Validates the order item meets business requirements
   * @private
   * @throws Error if quantity is invalid
   */
  private validate(): void {
    if (this._quantity <= 0) {
      throw new Error("Order item quantity must be greater than zero");
    }
    // Additional validations could include:
    // - Price must be positive
    // - Product ID must be valid format
  }

  /**
   * Unique identifier for this order item
   */
  get id(): string {
    return this._id;
  }

  /**
   * Product being ordered (value object)
   */
  get productId(): ProductId {
    return this._productId;
  }

  /**
   * Number of units ordered
   */
  get quantity(): number {
    return this._quantity;
  }

  /**
   * Price per unit at time of ordering
   */
  get price(): Money {
    return this._price;
  }

  /**
   * Calculates the total cost for this line item
   * @returns Money value object representing subtotal
   */
  get subtotal(): Money {
    return this._price.multiply(this._quantity);
  }

  /**
   * Example static factory method (optional)
   * @param props - Order item properties
   * @returns New OrderItem instance
   */
  public static create(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }
}