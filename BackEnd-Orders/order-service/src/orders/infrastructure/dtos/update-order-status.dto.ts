import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty } from "class-validator"

enum OrderStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: "New order status",
    enum: OrderStatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum = OrderStatusEnum.PENDING 
}
