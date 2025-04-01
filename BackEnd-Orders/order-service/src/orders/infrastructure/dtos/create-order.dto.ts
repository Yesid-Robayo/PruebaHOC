import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, Min, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class OrderItemInputDto {
  @ApiProperty({ description: "Product ID" })
  @IsString()
  @IsNotEmpty()
  productId: string = "defaultProductId" // Valor predeterminado

  @ApiProperty({ description: "Quantity of the product", minimum: 1 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number = 1 // Valor predeterminado

  @ApiProperty({ description: "Price per unit", minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number = 0 // Valor predeterminado
}

export class CreateOrderDto {
  @ApiProperty({ description: "User ID" })
  @IsString()
  @IsNotEmpty()
  userId: string = "defaultUserId" // Valor predeterminado

  @ApiProperty({ description: "Order items", type: [OrderItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[] = [] // Valor predeterminado para los items
}
