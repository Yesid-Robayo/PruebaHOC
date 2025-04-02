import  { ICommand } from "@nestjs/cqrs"

/**
 * Command to cancel an order.
 * 
 * This command is used to initiate the process of canceling an order
 * by providing the unique identifier of the order to be canceled.
 * 
 * @implements ICommand
 * 
 * @param orderId - The unique identifier of the order to be canceled.
 */
export class CancelOrderCommand implements ICommand {
  constructor(public readonly orderId: string) {}
}

