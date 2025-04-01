import type { ProductId } from "../value-objects/product-id.value-object"
import type { Money } from "../value-objects/money.value-object"

export interface OrderItemProps {
  id: string
  productId: ProductId
  quantity: number
  price: Money
}

export class OrderItem {
  private _id: string
  private _productId: ProductId
  private _quantity: number
  private _price: Money

  constructor(props: OrderItemProps) {
    this._id = props.id
    this._productId = props.productId
    this._quantity = props.quantity
    this._price = props.price

    this.validate()
  }

  private validate(): void {
    if (this._quantity <= 0) {
      throw new Error("Order item quantity must be greater than zero")
    }
  }

  get id(): string {
    return this._id
  }

  get productId(): ProductId {
    return this._productId
  }

  get quantity(): number {
    return this._quantity
  }

  get price(): Money {
    return this._price
  }

  get subtotal(): Money {
    return this._price.multiply(this._quantity)
  }
}

