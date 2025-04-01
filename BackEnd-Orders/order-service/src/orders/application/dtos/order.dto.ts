import { ApiProperty } from "@nestjs/swagger"

export class OrderItemDto {
  @ApiProperty({ description: "Order item ID" })
  id: string

  @ApiProperty({ description: "Product ID" })
  productId: string

  @ApiProperty({ description: "Quantity of the product" })
  quantity: number

  @ApiProperty({ description: "Price per unit" })
  price: number

  @ApiProperty({ description: "Subtotal for this item" })
  subtotal: number
}

export class OrderDto {
  @ApiProperty({ description: "Order ID" })
  id: string

  @ApiProperty({ description: "User ID" })
  userId: string

  @ApiProperty({ description: "Order status" })
  status: string

  @ApiProperty({ description: "Order items", type: [OrderItemDto] })
  items: OrderItemDto[]

  @ApiProperty({ description: "Total amount" })
  totalAmount: number

  @ApiProperty({ description: "Order creation date" })
  createdAt: Date

  @ApiProperty({ description: "Order last update date" })
  updatedAt: Date
}

